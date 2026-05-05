# Observability

## Prerequisites

- **[Caching](./caching.md)** [Recommended] — cache hit rate and eviction rate are canonical metric examples used throughout this page.
- **[Message Queues](./message-queues.md)** [Recommended] — async, decoupled systems are where distributed tracing earns its value; understanding the topology helps frame why trace propagation is hard.
- **[Service Discovery](./service-discovery.md)** [Recommended] — observability tooling needs to discover and scrape services dynamically; the same registry patterns apply.

## Table of Contents

- [Observability vs Monitoring](#observability-vs-monitoring)
- [The Three Pillars](#the-three-pillars)
- [Connecting the Pillars](#connecting-the-pillars)
- [Instrumentation Strategy](#instrumentation-strategy)
- [Sampling & Cost Trade-offs](#sampling--cost-trade-offs)
- [Alerting Philosophy](#alerting-philosophy)
- [Production Failure Modes & Gotchas](#production-failure-modes--gotchas)
- [Appendices](#appendices)

## TLDR

Observability is the ability to understand a system's internal state from its external outputs alone. Unlike monitoring — which tells you _something is wrong_ — observability tells you _why_, even for failure modes you've never seen before. It rests on three complementary pillars: logs (discrete events), metrics (aggregated time-series), and traces (request causality across service boundaries). The goal is not more data, but the right data to answer questions you haven't thought to ask yet.

---

## Observability vs Monitoring

> **Interviewer TL;DR:** Monitoring asks "is the system healthy?" against a known checklist. Observability asks "can I understand _any_ failure, including ones I've never seen?" — it's a property of the system, not a set of dashboards.

**Mental model:** Monitoring is a checklist; observability is a debugging capability.

Traditional monitoring works by enumerating known failure modes — CPU above 90%, error rate above 1%, DB response time above 500ms — and alerting when thresholds are crossed. This is effective when failures are predictable and the system is small enough that the failure space is enumerable.

Distributed systems break this assumption. At scale, failures emerge from interactions between components — a slow downstream dependency causes connection pool exhaustion upstream, which causes request queuing, which causes a cascade. No single metric captures this; no threshold was ever configured for it.

### Known Unknowns vs Unknown Unknowns

Monitoring covers **known unknowns**: failure modes you've seen before and instrumented for. Observability handles **unknown unknowns**: novel failure modes you cannot anticipate. The distinction matters because distributed systems — with their combinatorial explosion of service interactions, partial failures, and load shapes — produce failure modes that are genuinely surprising.

An observable system is instrumented such that you can reconstruct _what happened_ from telemetry alone, without needing to SSH into machines, add new probes, or reproduce the issue.

### Debuggability as a Design Goal

Debuggability is a first-class design property, not an afterthought. It means:

- Logs carry enough context to reconstruct an event without querying three other systems
- Metrics have enough cardinality to isolate _which_ instance, endpoint, or customer was affected
- Traces link a user request end-to-end across every service it touched

> ⚖️ **Decision Framework**
>
> | Signal             | Monitoring sufficient      | Observability required            |
> | ------------------ | -------------------------- | --------------------------------- |
> | Architecture       | Monolith or ≤3 services    | Microservices, multi-team         |
> | Failure modes      | Well-understood, recurring | Novel, emergent, cross-service    |
> | Debugging workflow | Dashboards + alerts        | "I don't know what's wrong yet"   |
> | Team size          | Small, shared context      | Multiple teams, service ownership |

> **Key Takeaway:** Monitoring detects known failures faster. Observability enables debugging unknown failures at all. For any system with independent service teams or unpredictable failure patterns, observability is not a nice-to-have.

---

## The Three Pillars

> **Interviewer TL;DR:** Logs answer _what happened_, metrics answer _how much / how often_, traces answer _why it was slow or broken across services_. They are complementary — each covers blind spots the other two have.

**Mental model:** Logs are a journal, metrics are a scoreboard, traces are a call graph.

No single pillar is sufficient on its own. A spike in error rate (metric) tells you something is wrong; the stack trace (log) tells you what; the trace tells you which upstream service triggered it and how long each hop took. The three pillars are most powerful when they are linked — see [Connecting the Pillars](#connecting-the-pillars).

### Logs

> _Discrete, structured records of events — the highest-resolution signal and the most expensive to store._

A log entry captures a single event at a point in time: a request received, an exception thrown, a payment processed. Logs are the natural first instrument engineers reach for — they require no schema upfront and can carry arbitrary context.

**Where logs shine:** debugging specific incidents, capturing business events, audit trails, understanding _what_ happened to a single request.

**Limitations:** unstructured logs are nearly unsearchable at scale. High-throughput services can produce gigabytes per minute. Aggregating logs across 50 service instances to reconstruct a single user's journey is slow without a correlation ID and a log aggregation pipeline.

Deep dive: **[Logging](./logging.md)**

### Metrics

> _Numeric measurements aggregated over time — cheap to store, fast to query, blind to individual events._

A metric is a named, time-stamped numeric value — `http_requests_total`, `cache_hit_rate`, `db_query_duration_p99`. Metrics collapse many events into a single number (count, sum, histogram bucket), which makes them orders of magnitude cheaper to store than logs and milliseconds to query.

**Where metrics shine:** detecting anomalies, alerting, capacity planning, SLO tracking.

**Limitations:** metrics lose the per-request context that makes debugging possible. Knowing `error_rate = 2%` doesn't tell you which users, which endpoints, or which upstream call failed. This is the cardinality wall — adding high-cardinality labels (e.g., `user_id`) to metrics explodes storage cost.

Deep dive: **[Metrics](./metrics.md)**

### Distributed Tracing

> _A causal record of a request's journey across service boundaries — the only pillar that captures latency attribution in a microservices system._

A trace represents a single end-to-end request, composed of **spans** — one per service or operation the request touched. Each span records: service name, operation, start time, duration, status, and parent span ID. Stitched together, spans form a tree that shows exactly where time was spent and where errors originated.

**Where tracing shines:** diagnosing latency in multi-service call chains, identifying which service in a fan-out is the bottleneck, understanding async flows across queues.

**Limitations:** traces require every service in the call chain to propagate trace context headers. A single uninstrumented service breaks the chain. Storing 100% of traces is prohibitively expensive — sampling is required, which means some failures go unrecorded.

Deep dive: **[Distributed Tracing](./tracing.md)**

### Pillar Trade-offs

| Dimension         | Logs                     | Metrics                  | Traces                    |
| ----------------- | ------------------------ | ------------------------ | ------------------------- |
| Question answered | What happened?           | How much / how often?    | Why was it slow / broken? |
| Granularity       | Per-event                | Aggregated               | Per-request               |
| Storage cost      | High                     | Low                      | Medium–High               |
| Query speed       | Slow (full-text scan)    | Fast (time-series)       | Medium                    |
| Cardinality limit | None (free-form)         | Strict (label explosion) | Moderate (trace IDs)      |
| Cross-service     | Only with correlation ID | No                       | Native                    |

> ⚠️ **Gotcha:** Teams often over-invest in logs and under-invest in tracing. Logs feel familiar — but in a microservices system, a log entry from service A with no trace ID is nearly useless for diagnosing a latency spike that originated in service D.

> **Key Takeaway:** Start with metrics (cheapest, fastest to alert on), add structured logging with correlation IDs, then add tracing once you have more than 3–4 services in a call chain. Doing all three from day one in a monolith is over-engineering.

---

## Connecting the Pillars

> **Interviewer TL;DR:** The three pillars are only as useful as the thread linking them. A correlation ID in every log entry and a trace ID in every metric exemplar means you can jump from "p99 spiked" → "here's the slow trace" → "here's every log line from that request" in under a minute.

**Mental model:** Pillars are siloed by default — correlation IDs and trace context are the glue that makes them a system.

Without explicit linking, debugging requires manually correlating timestamps across three different UIs. With it, the workflow becomes: alert fires on metric → jump to exemplar trace → filter logs by trace ID → root cause found.

### Correlation IDs

A correlation ID (also called a request ID or trace ID) is a unique identifier attached to a request at the system's entry point — typically the API gateway or load balancer — and propagated through every downstream service call.

**How it works:**

1. Entry point generates a UUID if none is present in the incoming request
2. Every outbound call (HTTP, gRPC, queue message) carries the ID in a header (`X-Correlation-ID`, `X-Request-ID`)
3. Every log entry written by every service includes the ID as a structured field
4. Log aggregation systems (Loki, Elasticsearch) can then filter all log lines across all services for a single request

Without correlation IDs, reconstructing a single user's request journey across 10 services requires timestamp-range guessing — unreliable and slow.

> ⚠️ **Gotcha:** Correlation IDs only work if _every_ service propagates them. A single service that drops the header silently breaks the chain for all downstream services. Enforce propagation at the framework/middleware level, not per-handler.

### Trace Context Propagation — W3C TraceContext

> _The trace ID is a correlation ID with structure — vendor-neutral, interoperable, and carries sampling state._

The **W3C TraceContext** standard defines a common HTTP header format so that different tracing libraries (Jaeger, Zipkin, OpenTelemetry) can interoperate without vendor lock-in:

```
traceparent: 00-{trace-id}-{parent-span-id}-{flags}
```

- `trace-id` — 16-byte hex, unique per end-to-end request (this is your correlation ID)
- `parent-span-id` — 8-byte hex, the span that made this call
- `flags` — 1 byte, currently used to signal sampling decision (`01` = sampled, `00` = not sampled)

If you adopt distributed tracing, the `trace-id` replaces ad-hoc correlation IDs — use it as the log field too. One ID, three pillars.

### Exemplars

> _A pointer from a metric aggregation to the specific trace that contributed to it — the bridge between "something spiked" and "here's why."_

An exemplar is a sample trace ID embedded in a metric data point. When a histogram bucket records a high-latency observation, it can attach the trace ID of that specific request. In a metrics UI (Grafana), clicking an exemplar on a p99 spike jumps directly to the trace — no manual log searching required.

```
# Prometheus exemplar format
http_request_duration_seconds_bucket{le="1.0"} 1234 # {trace_id="abc123"} 0.85
```

Exemplars are supported in the OpenMetrics format and Prometheus ≥ 2.26. They require the tracing and metrics pipelines to share the same trace ID — another reason to standardise on W3C TraceContext.

> 🎯 **Interview Lens** > **Q:** How would you debug a p99 latency spike that only affects 0.1% of requests?
> **Ideal answer:** Alert fires on the metric. Use an exemplar on the histogram bucket to jump to a sampled trace. Follow the trace to the slow span. Filter logs by that trace ID to get the full event context. Root cause without reproducing the issue.
> **Common trap:** "I'd add more logging" — misses that the issue is already sampled in the trace; the bottleneck is linking pillars, not adding more data.
> **Next question:** What if the slow requests aren't being sampled by your tracer?

> **Key Takeaway:** Correlation IDs cost almost nothing to implement and unlock cross-service log correlation. Exemplars extend this to metrics. Standardise on W3C TraceContext from the start — retrofitting ID propagation across a mature microservices system is painful.

---

## Instrumentation Strategy

> **Interviewer TL;DR:** Instrument at I/O boundaries using RED for services and USE for infrastructure. These two frameworks cover 90% of what you need to detect and diagnose production issues without drowning in noise.

**Mental model:** Instrument the edges, not the internals — I/O boundaries are where latency accumulates and errors surface.

### RED Method

> _The right metrics for any request-driven service: three numbers that capture whether your service is healthy from a user's perspective._

Proposed by Tom Wilkie (Grafana), RED applies per-service and per-endpoint:

| Signal       | What it measures             | Example metric                                |
| ------------ | ---------------------------- | --------------------------------------------- |
| **Rate**     | Requests per second          | `http_requests_total` (as rate)               |
| **Errors**   | Requests failing             | `http_errors_total` / `http_requests_total`   |
| **Duration** | Request latency distribution | `http_request_duration_seconds` (p50/p95/p99) |

RED is intentionally user-facing — it measures _what the caller experiences_, not what the service thinks it's doing. A service can be consuming 5% CPU and still have a 50% error rate; RED catches the latter, CPU monitoring does not.

> 🧠 **Thought Process:** When asked "how would you instrument a new microservice?", default to RED first. Three metrics, two alert rules (error rate and p99), one dashboard. You have meaningful coverage in under an hour.

### USE Method

> _The right signals for any infrastructure resource: three numbers that distinguish "busy but fine" from "saturated and degrading."_

Proposed by Brendan Gregg, USE applies to every resource a service depends on — CPU, memory, disk, network, thread pools, connection pools:

| Signal          | What it measures                    | Example                          |
| --------------- | ----------------------------------- | -------------------------------- |
| **Utilisation** | % of time resource is busy          | CPU at 80%                       |
| **Saturation**  | Work queued/waiting beyond capacity | CPU run queue depth > 1 per core |
| **Errors**      | Resource-level error events         | Disk I/O errors, TCP retransmits |

The key distinction: high _utilisation_ is normal. High _saturation_ is the warning sign — it means requests are waiting. A thread pool at 90% utilisation is fine; a thread pool with a queue depth of 500 is not.

### Instrumentation Boundaries

Not everything should be instrumented — over-instrumentation creates noise, cost, and maintenance burden. The principle: **instrument at I/O boundaries**.

**Always instrument:**

- Inbound requests (entry handlers, API endpoints)
- Outbound calls (HTTP clients, DB queries, cache lookups, queue produce/consume)
- Background job execution (start, duration, success/failure)
- Critical business events (payment processed, order created, user registered)

**Do not instrument:**

- Internal pure-function calls (no I/O, no external state)
- Per-iteration loop bodies in hot paths
- Utility helpers with no side effects

> ⚠️ **Gotcha:** Instrumenting too granularly inside hot loops is a common early mistake. A counter increment inside a loop processing 100k items/sec becomes a bottleneck itself. Profile before instrumenting deep internals.

### Push vs Pull Collection

Two models for getting telemetry from services into a backend:

|                  | Pull (scrape)                                                        | Push                            |
| ---------------- | -------------------------------------------------------------------- | ------------------------------- |
| How              | Collector polls `/metrics` endpoint                                  | Service sends to collector      |
| Model            | Prometheus                                                           | StatsD, OpenTelemetry push      |
| Discovery        | Via service registry (→ [Service Discovery](./service-discovery.md)) | Service knows collector address |
| Short-lived jobs | Poor fit — job may die before scrape                                 | Natural fit                     |
| Firewall / NAT   | Collector needs network access to service                            | Service initiates outbound only |

Deep dive on both models: **[Metrics](./metrics.md)**

> **Key Takeaway:** Apply RED to every service endpoint and USE to every resource your service depends on. Instrument I/O boundaries only — internal function instrumentation adds cost and noise without improving debuggability.

---

## Sampling & Cost Trade-offs

> **Interviewer TL;DR:** You cannot store 100% of traces or DEBUG logs in production at scale — sampling and log level discipline are how you control cost without going blind. The risk is that the thing you didn't sample is exactly what failed.

**Mental model:** Observability data is a lossy compression of reality — the question is which data you can afford to lose.

### Head-Based vs Tail-Based Sampling

Sampling is the decision to record a trace (or not). The decision point determines what you can and cannot keep.

**Head-based sampling** — decision made at the start of the request, before any spans are created:

- Simple and cheap: a random `n%` of requests are sampled
- The sampling flag travels in the `traceparent` header, so all services agree on whether to record
- Blind to outcome — a 1% error request has the same chance of being sampled as a healthy one
- At low error rates (0.1%), most sampled traces are healthy — the failures may not be captured

**Tail-based sampling** — decision made _after_ the trace completes, based on its outcome:

- Can guarantee 100% capture of errors, slow traces, or specific endpoints
- Requires a collector that buffers spans in memory until the trace is complete, then decides
- Memory-intensive and operationally complex — the collector becomes a stateful bottleneck
- The right choice when error rate is low enough that head sampling misses most failures

> ⚖️ **Decision Framework**
>
> |                            | Head-based                   | Tail-based                               |
> | -------------------------- | ---------------------------- | ---------------------------------------- |
> | Complexity                 | Low                          | High                                     |
> | Guarantees errors captured | No                           | Yes                                      |
> | Memory cost at collector   | Low                          | High                                     |
> | Use when                   | Error rate > 1%, high volume | Error rate < 0.5%, errors are the signal |

Deep dive on sampling strategies: **[Distributed Tracing](./tracing.md)**

### Cardinality Cost

Metrics are cheap per data point — but cost scales with the number of unique label combinations (cardinality). Adding a `user_id` label to a metric with 10 million users creates 10 million time series, each requiring storage and memory in the metrics backend.

The cardinality wall is the most common reason metrics backends become expensive or degrade. The rule: labels should have bounded, low-cardinality values — status codes, service names, endpoints, regions. Never user IDs, request IDs, or session tokens.

Deep dive: **[Metrics](./metrics.md)**

### Log Verbosity in Production

Log levels exist to control signal-to-noise ratio and storage cost:

| Level   | When emitted                              | Production default                 |
| ------- | ----------------------------------------- | ---------------------------------- |
| `ERROR` | Unhandled failures, requires action       | Always on                          |
| `WARN`  | Degraded but recoverable state            | Always on                          |
| `INFO`  | Normal business events, request summaries | Always on                          |
| `DEBUG` | Internal state, variable values           | Off — enable per-service on demand |
| `TRACE` | Loop iterations, fine-grained flow        | Never in production                |

> 🧠 **Thought Process:** The most underused pattern is **dynamic log level adjustment** — change a service's log level at runtime via a config flag or API endpoint, without restart. This lets you turn on DEBUG for 60 seconds to capture a reproducing issue, then turn it off. Without this, engineers are tempted to leave DEBUG on permanently, which explodes log volume.

> **Key Takeaway:** Use head-based sampling with a high enough rate (5–10%) for normal traffic, and tail-based sampling or a dedicated error-capture path to guarantee 100% of errors are recorded. Never use user IDs as metric labels. Keep production log level at INFO and build a runtime toggle for DEBUG.

---

## Alerting Philosophy

> **Interviewer TL;DR:** Alert on symptoms (user-visible impact), not causes (CPU high, disk 80%). Cause-based alerts fire constantly on non-issues; symptom-based alerts fire only when users are affected. SLOs anchor alerts to contractual commitments rather than arbitrary thresholds.

**Mental model:** An alert should answer "is a user experiencing a problem right now?" — not "is a resource behaving unexpectedly?"

### Symptom-Based vs Cause-Based Alerts

**Cause-based alerts** fire on internal resource signals: CPU > 90%, memory > 85%, disk > 80%. These are tempting because they feel proactive — catch the problem before users notice. In practice they create noise: CPU spikes constantly during normal batch jobs, disk fills and empties on predictable schedules. On-call engineers learn to ignore them.

**Symptom-based alerts** fire on user-visible signals: error rate above SLO threshold, p99 latency above SLO threshold, availability below target. These fire only when something a user would notice is happening. Every page is actionable.

|                     | Cause-based                          | Symptom-based                       |
| ------------------- | ------------------------------------ | ----------------------------------- |
| Signal              | CPU, memory, disk                    | Error rate, latency, availability   |
| False positive rate | High                                 | Low                                 |
| Actionability       | "Something might be wrong"           | "Users are affected now"            |
| Misses              | Slow leaks that don't hit thresholds | Root cause (requires investigation) |

The tradeoff: symptom-based alerts don't tell you _why_. That's intentional — diagnosis is the job of observability tooling (traces, logs), not the alert itself.

### Alert Fatigue — Signal vs Noise

Alert fatigue is the state where on-call engineers stop treating pages as urgent because too many are false alarms. It is one of the most operationally dangerous failure modes — the real incident gets lost in noise.

Causes: too many alerts, thresholds set too low, alerting on metrics that fluctuate normally, no alert ownership or review process.

Rule of thumb: if an alert fires and the on-call engineer's first response is "oh, that one again" — the alert should either be deleted, have its threshold raised, or be converted to a dashboard item (not a page).

### SLOs as Alert Anchors

> _SLOs replace arbitrary thresholds with contractually meaningful ones — an alert fires only when you're burning through your error budget._

A **Service Level Objective (SLO)** is a target for a user-facing reliability signal: "99.9% of requests succeed", "p99 latency < 300ms over a 30-day window". An **error budget** is the allowed headroom before the SLO is breached — 0.1% of requests can fail.

SLO-based alerting fires when the **burn rate** is high enough to exhaust the error budget before the window ends. This naturally produces two alert tiers:

- **Fast burn alert** (page): error rate is so high the budget will be exhausted in ~1 hour — wake someone up
- **Slow burn alert** (ticket): error rate is elevated but budget will last ~3 days — fix it in business hours

> 🎯 **Interview Lens** > **Q:** Your on-call engineer says they're getting paged 15 times a day and ignoring most of them. How do you fix it?
> **Ideal answer:** Audit all alerts — delete anything without a runbook, convert non-actionable metrics to dashboards, switch from cause-based to symptom-based alerting, implement SLO-based burn rate alerts to replace arbitrary thresholds.
> **Common trap:** "Lower the thresholds" or "add more alerts for better coverage" — both make the problem worse.
> **Next question:** How would you measure whether your alerting quality improved after the change?

> **Key Takeaway:** Alert on error rate and latency SLO burn, not on CPU and disk. Every alert should have a runbook and a clear action. If an alert is routinely acknowledged without action, delete it — silence is more dangerous than absence.

---

## Production Failure Modes & Gotchas

### Observability Pipeline as a Single Point of Failure

The observability pipeline — log forwarders, metric scrapers, trace collectors — is infrastructure that must stay up during incidents. It is most needed precisely when the system is under stress, which is also when it is most likely to be overloaded.

**Mitigation:** Size the pipeline for peak load plus headroom. Use local buffering on agents (Fluent Bit, OTel Collector) so telemetry survives a backend outage. Never route critical alerts through the same pipeline that might be degraded.

### Correlation ID Propagation Gaps

A single service that does not forward the `X-Correlation-ID` or `traceparent` header silently breaks the chain for all downstream services. The symptom: traces that stop mid-call, log searches that return only partial results.

**Mitigation:** Enforce propagation at the HTTP client / framework middleware layer, not per-handler. Validate in CI with a contract test that headers survive a round-trip.

### Tail-Based Sampler Buffer Overflow

Tail-based sampling requires buffering spans in memory until a trace completes. During an incident — when trace volume spikes and many traces are slow or erroring — the buffer fills and the collector drops traces using LRU eviction. This means you lose the most traces exactly when you most need them.

**Mitigation:** Size the buffer for spike traffic. Combine tail-based sampling with a dedicated error-capture path that bypasses the buffer (always record traces with `error=true`).

### Cardinality Explosion

Adding a high-cardinality label (`user_id`, `request_id`) to a metric creates a time series per unique value. At 10M users, a single mislabelled metric can OOM a Prometheus instance within hours.

**Mitigation:** Label review in code review. Cardinality limits enforced at the metrics backend. Alert on time series count growth rate before it becomes an outage.

### Clock Skew in Distributed Traces

Trace span timestamps come from each service's local clock. If clocks drift, span timelines reconstruct incorrectly — a child span appears to start before its parent, or total trace duration is negative. This makes traces misleading rather than useful.

**Mitigation:** NTP/PTP synchronisation across all nodes. Tracing libraries that use monotonic clocks for duration (immune to wall-clock adjustments) and only use wall time for the root span start.

### Async Path Instrumentation Gaps

Queue consumers and async workers are the most commonly under-instrumented code paths. A message enters a queue with a trace context in its metadata — if the consumer does not extract and continue that context, the trace is severed. The producer looks fine; the consumer has no parent trace.

**Mitigation:** Use a messaging instrumentation wrapper that automatically extracts `traceparent` from message metadata and starts a child span. Most OpenTelemetry SDK messaging integrations do this — use them.

### Observability Cost Surprise

Teams enabling full 100% trace sampling or DEBUG logging in production without cost modelling routinely see 5–10× storage bill increases. Observability tooling vendors (Datadog, Honeycomb, New Relic) charge per ingested volume — a misconfig can generate a large unexpected bill within 24 hours.

**Mitigation:** Set ingestion budgets and volume alerts before enabling new telemetry in production. Use sampling aggressively. Review cost per service in weekly ops reviews.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Full Form                       | One-line meaning                                        |
| ------- | ------------------------------- | ------------------------------------------------------- |
| SLO     | Service Level Objective         | Target reliability threshold (e.g., 99.9% success rate) |
| SLI     | Service Level Indicator         | The metric used to measure against an SLO               |
| SLA     | Service Level Agreement         | Contractual SLO with penalties for breach               |
| RED     | Rate, Errors, Duration          | Three-signal framework for request-driven services      |
| USE     | Utilisation, Saturation, Errors | Three-signal framework for infrastructure resources     |
| NTP     | Network Time Protocol           | Protocol for synchronising clocks across machines       |
| PTP     | Precision Time Protocol         | Sub-microsecond clock sync; stricter than NTP           |
| OTel    | OpenTelemetry                   | Vendor-neutral instrumentation SDK and protocol         |
| MTTD    | Mean Time To Detect             | Average time from incident start to alert firing        |
| MTTR    | Mean Time To Recover            | Average time from alert to incident resolved            |
| LRU     | Least Recently Used             | Eviction policy used by tail-based sampling buffers     |

### Anti-patterns

- **Alerting on causes, not symptoms** — CPU/disk alerts fire constantly on non-issues; switch to error rate and latency SLO burn.
- **High-cardinality metric labels** — adding `user_id` or `request_id` as metric labels creates millions of time series and OOMs the metrics backend.
- **Skipping correlation IDs in async paths** — queue consumers that don't extract trace context produce orphaned traces and unsearchable logs.
- **Logs as the only observability signal** — no metrics means no alerting; no traces means no cross-service latency attribution. Logs alone cannot carry an on-call rotation.
- **100% trace sampling in production** — blindly enabling full sampling on a high-throughput service generates a storage bill before anyone notices.
- **Permanent DEBUG logging in production** — a single service left at DEBUG level can flood the log pipeline and degrade log search for every other service.
- **Observability without runbooks** — an alert that fires with no runbook trains engineers to ignore it. Every alert must have a documented response action.
