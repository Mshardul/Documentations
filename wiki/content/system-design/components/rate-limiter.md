# Rate Limiter

## Prerequisites

- **[Caching](./caching.md)** [Must read] — Rate limit counters are cached state with TTL; the consistency vs availability trade-off here mirrors every distributed rate limiting decision.
- **[Consistent Hashing](../algorithms/consistent-hashing.md)** [Recommended] — Sharding limit buckets across Redis nodes uses the same ring logic. <!-- link: consistent-hashing.md -->
- **[Load Balancer](./load-balancer.md)** [Recommended] — API gateway placement of rate limiting sits within load balancer infrastructure; L7 context is needed to understand identifier extraction.

## Table of Contents

- [TLDR](#tldr)
- [Core Functions & Protection Goals](#core-functions--protection-goals)
- [Rate Limiting Algorithms](#rate-limiting-algorithms)
- [Placement in the Stack](#placement-in-the-stack)
- [Distributed Rate Limiting](#distributed-rate-limiting)
- [Response Design](#response-design)
- [Production Failure Modes & Gotchas](#production-failure-modes--gotchas)
- [Observability & Debugging](#observability--debugging)
- [Quick Decision Guide](#quick-decision-guide)
- [Appendices](#appendices)

## TLDR

A rate limiter caps request volume per identity (IP, user, API key) within a time window, protecting services from abuse, cost overruns, and cascading failures. The key architectural choice is enforcement placement: API gateway (centralized, default) vs per-service (granular, no cross-service coordination). At scale, shared Redis counters trade perfect accuracy for availability — every multi-node deployment must decide how much counter drift is acceptable.

## Core Functions & Protection Goals

> **Interviewer TL;DR:** Rate limiting hard-rejects requests above a threshold; throttling degrades them (delays, reduced quality). The distinction matters because they require different client-handling strategies and serve different protection goals.

_Mental model: a bouncer counting entries per hour per person — turns away anyone over the limit regardless of how long they've waited._

### Throttling vs Rate Limiting

_These are often conflated in interviews; the difference is the failure mode, not the enforcement mechanism._

**Rate limiting** drops requests that exceed the allowed rate. The client receives an HTTP 429 immediately — no work is done by the server.

**Throttling** intentionally degrades requests rather than dropping them: responses are delayed, result quality is reduced (fewer results, lower resolution), or the request is queued internally and retried. The client still gets a response.

The practical split: rate limiting protects infrastructure from overload and abuse; throttling protects user experience under moderate load.

### Protection Targets

| Target             | What it prevents                                   | Typical identifier |
| ------------------ | -------------------------------------------------- | ------------------ |
| Abuse & DoS        | volumetric attacks, credential stuffing, scraping  | IP, API key        |
| Cost control       | LLM inference, third-party quota overrun           | user ID, API key   |
| Tenant fairness    | one tenant starving others in multi-tenant systems | user ID, org ID    |
| SLA enforcement    | tier-based quota (Free: 100/day, Pro: 10k/day)     | API key            |
| Cascading failures | upstream degradation causing downstream pile-up    | endpoint, global   |

### Identifiers

What gets rate limited is as important as how. Identifier choice determines accuracy, bypass resistance, and memory cost:

- **IP address** — simplest to implement; easily bypassed via proxies. NAT hides hundreds of users behind a single IP — over-blocking risk is high.
- **User ID** — accurate per-user fairness; requires authentication. Best default for authenticated APIs.
- **API key** — standard for B2B APIs; maps to a billing tier. Stripe, GitHub, and most public APIs use this.
- **Endpoint** — different budgets per route (`/search` vs `/checkout`). Layer on top of user or API key limits.
- **Global** — single counter across all traffic to a service. Last resort for volumetric DDoS; coarse-grained.
- **Composite (user ID + endpoint)** — most granular; highest memory cost. Use when a single endpoint is the abuse target.

### Hard vs Soft Limits

**Hard limit:** request rejected outright at threshold. HTTP 429 returned immediately, no server work done.

**Soft limit:** request is allowed but the client is warned via response headers (`X-RateLimit-Remaining: 5`). A grace window before the hard cutoff. Useful for dashboards and read-heavy APIs where abrupt rejection harms UX.

> ⚖️ **Decision Framework**
>
> Use **hard limits** when cost-per-request is high (LLM inference, video transcoding) or enforcement is security-critical (auth endpoints, payment flows).
>
> Use **soft limits** when user experience matters more than strict enforcement and the failure mode is gradual degradation, not abuse.

> 🎯 **Interview Lens** > **Q:** You're designing a public API rate limiter. Where do you start?
> **Ideal answer:** Start with the identifier (user ID for authenticated, IP for anonymous), then placement (API gateway), then algorithm based on burst tolerance (token bucket for most cases). Distributed counting comes last — it's an implementation detail, not an architectural decision.
> **Common trap:** Jumping to algorithm selection before establishing identifier and placement — algorithms are interchangeable; the identifier and placement are architectural.
> **Next question:** How do you handle unauthenticated requests mixed with authenticated ones on the same endpoint?

**Key Takeaway:** Identifier selection determines accuracy and bypass resistance. Get it wrong and the rate limiter is trivially circumvented regardless of how sophisticated the counting algorithm is.

## Rate Limiting Algorithms

> **Interviewer TL;DR:** Five algorithms cover the space; token bucket is the default for most APIs. The choice is determined by three axes: burst tolerance, memory cost, and boundary accuracy.

_Mental model: each algorithm is a different strategy for answering "was this request sent too fast?" — they differ in where they store state and how they define "too fast."_

For full mechanics, complexity analysis, and pseudocode see [Rate Limiting Algorithms](../algorithms/rate-limiting-algorithms.md). <!-- link: rate-limiting-algorithms.md --> What follows is the trade-off summary needed to make the selection decision.

### Token Bucket

Tokens accumulate at a fixed refill rate up to a maximum bucket capacity. Each request consumes one token; requests with no tokens available are rejected. Bursts up to bucket capacity are allowed — the bucket absorbs them. Average rate is enforced over time by the refill rate.

Default for most REST APIs. The burst capacity maps naturally to legitimate user behaviour (a user opening a dashboard loads several requests simultaneously).

### Leaky Bucket

Requests enter a fixed-size queue and drain at a constant output rate regardless of input rate. Excess requests that can't fit the queue are dropped. No bursts possible — output is smooth by design.

Use when downstream smoothness matters more than burst tolerance: payment processing, video streaming pipelines, third-party API proxies with strict upstream rate limits.

### Fixed Window Counter

Divides time into fixed windows (e.g., each 60-second slot). Counts requests per window; rejects when count exceeds the limit. O(1) space per identifier — cheapest algorithm. Suffers from the **boundary spike problem**: a client can send 2× the allowed rate by hammering the boundary between two windows.

### Sliding Window Log

Stores a timestamp for every accepted request. Count = timestamps within the last window from now. Most accurate — no boundary spikes. Memory cost is O(n) per identifier where n = allowed request count per window. Expensive at high throughput.

### Sliding Window Counter

Blends the current and previous fixed windows, weighted by how far into the current window the request arrives. Approximates sliding window accuracy at O(1) space per identifier. The standard production choice when accuracy and memory both matter.

> ⚖️ **Decision Framework**
>
> | Need                                             | Algorithm              |
> | ------------------------------------------------ | ---------------------- |
> | Burst tolerance, most APIs                       | Token Bucket           |
> | Smooth downstream output                         | Leaky Bucket           |
> | Absolute simplicity, low traffic                 | Fixed Window Counter   |
> | Strictest accuracy, memory not a concern         | Sliding Window Log     |
> | Default production — accuracy + memory efficient | Sliding Window Counter |

**Key Takeaway:** Token bucket handles most API use cases. Default to sliding window counter when boundary spikes are unacceptable. Use leaky bucket only when downstream uniformity is a hard requirement — it will frustrate users with bursty-but-legitimate usage patterns.

## Placement in the Stack

> **Interviewer TL;DR:** Enforcement point determines what context is available, who owns the limit, and what fails when the limiter does. API gateway is the default; add per-service limits as a second line of defense for sensitive endpoints.

_Mental model: concentric rings — each layer closer to the origin server has more application context but higher enforcement cost._

```
Request →  [Client]  →  [CDN/Edge]  →  [API Gateway]  →  [App Middleware]  →  [Service Mesh]  →  Origin
               ↑               ↑               ↑                   ↑                  ↑
           unreliable     cheapest        default           full context          east-west
```

### Client-Side

_Only useful when the client is your own code._

SDK self-throttling — the client voluntarily backs off to avoid hitting server limits. AWS SDKs, Stripe client libraries, and similar well-behaved clients do this to smooth request bursts before they reach the wire.

Completely ineffective for abuse prevention: the attacker controls the client and ignores any client-side logic. No server resources are saved if the client-side limit is bypassed.

**Use case:** Your own services calling downstream APIs — self-imposed politeness to avoid triggering their rate limits.

### CDN / Edge

_Cheapest enforcement per request; least app context._

Geography-aware enforcement at edge PoPs (Cloudflare Workers, Fastly, CloudFront Functions). Traffic is dropped before reaching the origin — the cost per rejected request is minimal.

Best for unauthenticated volumetric attacks, bot detection, and DDoS mitigation. No application context available at the edge — cannot check user tier or account state without a round-trip to origin (which defeats the cost advantage).

**Limitation:** Counter propagation across PoPs has latency. At very high frequencies, counters across regions are slightly stale — acceptable for DDoS mitigation, not for strict per-user quota enforcement.

### API Gateway

_Centralized enforcement before any backend code runs — the default production placement._

Extracts identifiers from HTTP headers, JWT claims, or request path without any application code changes. A single policy change propagates to all services behind the gateway. Examples: Kong, AWS API Gateway, Nginx with `lua-resty-limit-rate`, Envoy Global Rate Limit.

**Limitation:** The gateway sees HTTP-layer context only. It cannot access application-level state (user subscription tier, account flags, feature entitlements) without header injection from an upstream auth service. Complex quota logic — "this user has 1000 requests shared across all endpoints" — is awkward to express at this layer.

API gateways are already a single point of failure for routing; rate limiting does not add new operational risk. Standard HA practices (active-active, health checks) apply.

### Application Middleware

_Full application context; coordination is the hard problem._

Rate limiting embedded in service code (Express middleware, Django middleware, ASP.NET filters). Has full access to user tier, account state, feature flags, and any business logic. No HTTP-layer blind spots.

The cost: every service must implement independently. Cross-service quota — "this user has 10,000 requests shared across `/search` and `/export` in two different services" — requires a shared external counter (Redis). Without coordination, each service enforces its own budget and the shared quota leaks.

**Use when:** You need application-level context that the gateway can't see, or when a single sensitive endpoint warrants stricter per-service enforcement as a second line of defense.

### Service Mesh

_Transparent east-west rate limiting — adds operational complexity._

Sidecar proxies (Envoy, Linkerd) enforce limits at the network level between services, invisible to application code. Enables service-to-service (east-west) rate limiting, not just ingress. A central rate limit service (Envoy's gRPC rate limit API) provides global counts.

**Trade-off:** Powerful for platform teams managing many services uniformly; operationally heavy for smaller teams. The central rate limit service becomes a critical dependency — if it goes down, the policy is to fail open (allow) or fail closed (block all), each with different risk profiles.

### Gateway vs Per-Service — Enforcement Boundary

> ⚖️ **Decision Framework**
>
> |                     | API Gateway                         | Per-Service Middleware                |
> | ------------------- | ----------------------------------- | ------------------------------------- |
> | App context         | HTTP headers only (unless enriched) | Full application state                |
> | Coverage            | All services, one policy            | Per-service, must coordinate          |
> | Cross-service quota | Hard without app-layer help         | Requires shared Redis                 |
> | Operational cost    | Low                                 | High (every service)                  |
> | Best for            | Default first line, public APIs     | Sensitive endpoints, tier-aware logic |
>
> **Production default:** API gateway as first line + per-service for auth/payment endpoints. They are complementary, not alternatives.

> 🎯 **Interview Lens** > **Q:** Where would you place rate limiting in a microservices architecture?
> **Ideal answer:** API gateway as the first line for all ingress traffic, per-service middleware for sensitive endpoints (auth, payments) that need application context. Both backed by shared Redis for cross-service quota.
> **Common trap:** Saying "in each service" without addressing cross-service quota coordination — or "at the gateway" without acknowledging the app context limitation.
> **Next question:** What is your fail-open vs fail-closed policy if Redis goes down?

**Key Takeaway:** Placement is an architectural decision, not an implementation detail — it determines what context you have and what fails when the limiter does. Start with the gateway; add per-service limits only where business logic demands it.

## Distributed Rate Limiting

> **Interviewer TL;DR:** In-process counters break the moment you scale horizontally — each instance counts independently, so the effective limit becomes N × configured limit across N instances. Shared Redis counters fix this at the cost of a network hop per request and a new critical dependency.

_Mental model: ten bouncers at ten doors, each counting independently — a client walks through a different door each time and never triggers any single bouncer's limit._

### Single-Node Breakdown

When a service scales to N instances behind a [load balancer](./load-balancer.md), each instance maintains its own in-memory counter. A client sending 100 requests/second distributed round-robin across 10 instances registers as 10 req/s per instance — comfortably under a 50 req/s limit despite sending 2× the intended maximum.

In-process rate limiting is only viable for single-instance deployments or when sticky sessions guarantee all requests from one client route to one instance. Sticky sessions introduce their own failure modes (uneven load, loss of stickiness on deploy) and are generally not worth the trade-off.

### Shared Counter via Redis

The fix: externalize the counter to a shared store. All instances read and write the same counter per identifier per window.

```
Request → Instance A ──┐
Request → Instance B ──┼──► Redis INCR rate:{user}:{window} ──► count > limit? → 429
Request → Instance C ──┘
```

The basic pattern uses Redis `INCR` with a `EXPIRE` on first write. The gap: `INCR` and `EXPIRE` are two separate commands — a race condition between two instances on a fresh key can leave the key without a TTL, making the counter permanent. The fix is a Lua script that makes the entire read-increment-expire sequence atomic:

```lua
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
```

This is the minimum viable distributed rate limiter. For sliding window counter implementation, Redis Cluster sharding, and multi-region patterns see [Distributed Rate Limiting](../distributed-systems/distributed-rate-limiting.md).

### Clock Skew & Redis Cluster Coordination

_In a cluster, the limiter's correctness depends on time agreement and key locality — both are non-obvious failure sources._

**Clock skew** between application instances affects time-based window boundaries. Two instances with clocks drifted by 500ms disagree on which "minute" window a request falls into — producing small over-count or under-count at window boundaries. NTP synchronisation keeps drift under 10ms in practice; sliding window algorithms are less sensitive than fixed window.

**Redis Cluster key routing**: rate limit keys for the same user hash to a specific shard. If that shard becomes slow or partitioned, every request for users hashing to that shard is affected. Hash tags (`{user_id}`) can co-locate related keys on one shard but concentrate load — a hot user saturates a single shard.

### Accuracy vs Availability

The fundamental distributed rate limiting tension: every design is a point on this spectrum.

| Approach                            | Accuracy                 | Latency added      | Failure mode                       |
| ----------------------------------- | ------------------------ | ------------------ | ---------------------------------- |
| Synchronous Redis (blocking)        | High                     | +1–5ms per request | Redis latency = API latency        |
| Async counter sync                  | Medium                   | Minimal            | Can exceed limit until convergence |
| Local-only fallback when Redis down | Low (per-instance limit) | None               | Limit effectively multiplied by N  |

> ⚖️ **Decision Framework**
>
> **Fail closed** (reject all requests when Redis is unavailable): correct for auth endpoints, payment flows, security enforcement. Users see errors, not abuse.
>
> **Fail open** (fall back to local counters when Redis is unavailable): correct for cost-control and fairness limits. Service stays up; limits are temporarily weaker.
>
> The wrong answer is letting this be an implicit default. Decide it explicitly when designing the limiter.

**Key Takeaway:** Horizontal scaling makes in-process counters useless. Redis fixes the counting problem but introduces a critical path dependency — the fail-open vs fail-closed policy when Redis is unavailable is the highest-stakes decision in distributed rate limiting design.

## Response Design

> **Interviewer TL;DR:** A well-designed rate limit response tells the client what happened, when to retry, and how much budget remains. HTTP 429 + Retry-After + X-RateLimit-\* headers are the de facto standard — clients that understand these back off gracefully instead of amplifying load with blind retries.

_Mental model: a parking meter receipt — tells you when you're over, how much time you have left, and exactly when to come back._

### HTTP 429

HTTP 429 Too Many Requests is the correct status for rate limiting. Two common mistakes:

**Using 503 instead of 429** — 503 signals server unavailability (client's fault-free). Monitoring alerts, client retry logic, and SLO dashboards treat 503 as a service failure. Returning 503 for rate limiting poisons all of these.

**Returning no body** — the response body should tell the client why and where to learn more:

```json
{
  "error": "rate_limit_exceeded",
  "message": "API quota exceeded. Retry after 30 seconds.",
  "docs": "https://api.example.com/docs/rate-limits"
}
```

### X-RateLimit-\* Headers

No official RFC — de facto standard across major APIs (GitHub, Stripe, Cloudflare). Send on **every response**, not just 429s. Well-behaved clients use them to throttle proactively before hitting the limit.

| Header                  | Example value | Meaning                                         |
| ----------------------- | ------------- | ----------------------------------------------- |
| `X-RateLimit-Limit`     | `1000`        | Total requests allowed in the window            |
| `X-RateLimit-Remaining` | `0`           | Requests left in the current window             |
| `X-RateLimit-Reset`     | `1716732000`  | Unix timestamp when the window resets           |
| `X-RateLimit-Scope`     | `user`        | What the limit applies to (`user`, `org`, `ip`) |

Sending `X-RateLimit-Remaining` on all responses — not just at the limit — lets clients proactively slow down when approaching their budget. Stripe sends a warning at `X-RateLimit-Remaining: 5` to give clients one last chance to back off.

### Retry-After

RFC 7231 header. Two formats:

- **Delta seconds:** `Retry-After: 30` — retry in 30 seconds from now
- **HTTP date:** `Retry-After: Sun, 25 May 2026 12:00:00 GMT` — retry at this absolute timestamp

Delta seconds is more common. **The thundering herd problem:** all throttled clients receive the same delta and retry simultaneously, reproducing the exact spike that triggered the limit.

Fix: add jitter to the suggested retry value.

```
Retry-After: {base_window_seconds + random(0, base_window_seconds × 0.1)}
```

This spreads retries across a range rather than synchronising them on a single second.

### Quota vs Burst Allowance

Two separate dimensions of the rate limit contract that need separate headers:

- **Quota** — sustained rate over a long window: 1,000 requests/hour
- **Burst** — short-term spike tolerance: 20 requests/second

A user can be within quota but over burst, or over quota but under burst. Both need to be communicated explicitly:

```
X-RateLimit-Limit: 1000         (hourly quota)
X-RateLimit-Burst-Limit: 20     (per-second burst cap)
X-RateLimit-Remaining: 450      (against hourly quota)
X-RateLimit-Burst-Remaining: 0  (burst exhausted — current rejection reason)
```

### Hard Reject vs Soft Throttle Trade-offs

_The choice here is the user experience of the rate limiter._

**Hard reject** — 429 returned immediately. Server does no work for the rejected request. Clean semantics; client must implement retry handling.

**Soft throttle** — request is accepted but artificially delayed, or returns a degraded response (fewer results, lower-resolution output, background-queued processing). Transparent to the client; no retry logic needed. The cost: server still processes the request, so resources are consumed.

**Warn before reject** — send `X-RateLimit-Remaining: N` for the last few requests before cutoff. Clients that read headers can self-throttle. Doesn't help unaware clients or attackers.

> ⚖️ **Decision Framework**
>
> |                       | Hard Reject                   | Soft Throttle                 |
> | --------------------- | ----------------------------- | ----------------------------- |
> | Server resource usage | None — request dropped        | Full cost — request processed |
> | Client code required  | Yes — must handle 429         | No — response is normal       |
> | Security enforcement  | Strong — clear signal         | Weak — request still runs     |
> | Best for              | Cost control, auth, API tiers | UX-sensitive read endpoints   |

> 🎯 **Interview Lens** > **Q:** How do you prevent a thundering herd when rate-limited clients all retry simultaneously?
> **Ideal answer:** Add jitter to the Retry-After value — spread suggested retries across a small window so clients desynchronise. Clients implementing exponential backoff with jitter (AWS SDK, gRPC) amplify this naturally.
> **Common trap:** Returning a fixed Retry-After for all clients — all clients synchronise retries at the same second, reproducing the spike that triggered the limit.
> **Next question:** What happens if clients ignore Retry-After entirely?

**Key Takeaway:** Send rate limit headers on every response — not just 429s — and add jitter to Retry-After. The difference between a rate limiter that causes retry storms and one that doesn't is almost entirely in the response contract.

## Production Failure Modes & Gotchas

> **Interviewer TL;DR:** Most rate limiter failures fall into three buckets: the algorithm is gameable at boundaries, the response contract causes the retry storm it was meant to prevent, or the enforcement point has a gap that bypasses the limiter entirely.

_Mental model: every failure mode here is someone (or something) finding the seam between what the limiter counts and what actually happens._

| Failure mode                     | Root cause                                        | Signal                                                 |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Fixed window boundary spike      | Two consecutive windows = 2× traffic              | Sawtooth traffic graph at window edges                 |
| Thundering herd on retry         | Fixed Retry-After synchronises all clients        | Traffic spike exactly N seconds after rate limit event |
| Redis failover counter loss      | Replica promotion resets all counters             | 429 rate drops to zero after Redis failover            |
| Hot partition — shard saturation | Single identifier hashes to one Redis shard       | CPU/QPS imbalance across Redis Cluster shards          |
| Identifier spoofing              | IP rotation bypasses IP-based limits              | High 429 diversity across IPs, same endpoint pattern   |
| Gateway bypass                   | Service reachable without passing through gateway | Traffic lacking gateway tracing headers                |
| NAT over-blocking                | Many users share one IP (office, carrier NAT)     | Legitimate users reporting 429 from the same IP        |

### Fixed Window Boundary Spike

_The cheapest algorithm has a predictable exploit at every window boundary._

A client sending N requests at the end of window 1 and N at the start of window 2 transmits 2N requests within a short burst — both fully within the per-window limit. The counter resets at the boundary, unaware of what just happened.

**Mitigation:** Sliding window counter eliminates this at comparable memory cost. If fixed window is chosen for simplicity, document the 2× burst as an accepted trade-off — don't silently depend on it being safe.

### Thundering Herd on Retry-After — Jitter Required

_A rate limiter that synchronises client retries makes the next spike worse than the one it just suppressed._

All clients throttled in the same window receive identical `Retry-After` values and retry at the same second. The resulting traffic spike can exceed the original load that triggered the limit.

**Mitigation:** Add randomised jitter to every `Retry-After` response (covered in [Response Design](#response-design)). Monitor for sharp traffic spikes exactly N seconds after rate limit events — the clearest signal this is happening.

### Redis Failover — Counter Loss Window

_A Redis primary failure resets all in-memory counters to zero; clients receive an unintended free quota window._

When the primary fails and a replica is promoted, the new primary starts with counters at zero. Every client effectively gets a fresh window. For a service handling 100k req/s with a 1k req/min limit, this produces a brief but complete enforcement gap.

**Mitigation:** Enable Redis AOF persistence with `appendfsync everysec` to minimise data loss on failover. Accept the remaining window as a known trade-off — the gap is seconds, not minutes. For zero-tolerance enforcement (auth endpoints), fail closed: return 429 for all requests during the Redis unavailability window.

### Hot Partition — Shard Saturation

_In Redis Cluster, a single high-traffic identifier concentrates all counter operations on one shard._

Rate limit keys hash deterministically to Redis shards. A high-volume user or endpoint routes all counter increments to the same shard — saturating its CPU while other shards sit idle.

**Mitigation:** Local pre-check — each application instance maintains an approximate local counter and only consults Redis when the local count approaches the limit. This reduces Redis QPS by 90%+ for well-behaved traffic and concentrates Redis calls at the threshold boundary where they matter.

> ⚠️ **Gotcha:** Hash tags in Redis (`{user_id}`) co-locate related keys on one shard intentionally — useful for Lua transactions, harmful for hot users. Audit your key design before enabling hash tags.

### Identifier Spoofing — IP Rotation Bypass

_IP-based rate limiting assumes one IP = one client. Attackers with residential proxy networks or botnets have thousands of IPs._

An attacker rotating through 10,000 residential IPs sends 1 request per IP per window — every request is under the limit. IP-based limiting provides zero protection against motivated adversaries.

**Mitigation:**

- Require authentication for sensitive endpoints; rate limit by user ID or API key, not IP
- For unauthenticated endpoints: combine IP with TLS fingerprint, HTTP/2 stream patterns, and behavioural signals (request timing, header ordering) — harder to spoof at scale
- CAPTCHA for high-value unauthenticated flows

### Gateway Bypass — Enforcement Gap

_Rate limiting at the API gateway only works if all traffic passes through the gateway._

A misconfigured firewall, an internal Kubernetes `Service` exposed to the wrong network segment, or a legacy endpoint that predates the gateway can all allow requests to reach services without gateway processing. An attacker — or an internal service — that discovers this path bypasses all rate limits silently.

**Detection:** Compare request counts arriving at services vs counts recorded at the gateway. Requests lacking gateway tracing headers (`X-Request-ID`, `X-Forwarded-For`) reached the service directly.

**Mitigation:** Network-level enforcement — services only accept connections from the gateway (security group, network policy). mTLS between gateway and services provides cryptographic proof of origin.

### NAT Over-blocking — Collateral IP Rate Limiting

_Rate limiting by IP punishes a thousand legitimate users for the behaviour of one._

A university campus, corporate office, or mobile carrier NAT can funnel thousands of users through a single IP. One aggressive user exhausts the IP's quota; everyone else on the same NAT sees 429s.

**Mitigation:** For authenticated traffic, always prefer user ID or API key over IP as the primary identifier. Use IP as a secondary signal (composite key or separate IP-level limit set much higher than the per-user limit). Reserve aggressive IP limits for unauthenticated endpoints where user identity is unavailable.

## Observability & Debugging

> **Interviewer TL;DR:** Three signals matter: throttled ratio per identifier (are limits calibrated?), 429 spike patterns (attack or misconfiguration?), and Redis latency (is the limiter becoming the bottleneck itself?).

_Mental model: the rate limiter is a traffic cop — observability tells you whether it's stopping the right cars, stopping too many, or causing a jam of its own._

### Metrics

Instrument at three layers: the limiter decision, the identifier distribution, and the backing store.

**Limiter decisions**

- `rate_limit_requests_total{endpoint, result=[allowed|throttled]}` — total and throttled counts per endpoint
- **Throttled ratio** (`throttled / total`) per endpoint per window — the primary tuning signal
  - Ratio >5% sustained → limits too tight or legitimate traffic spike; investigate before tightening further
  - Ratio = 0 on a critical endpoint for extended periods → limits may be too loose, or an attack vector hasn't been exercised yet

**Identifier distribution**

- Per-identifier throttle counts — which user IDs, API keys, or IPs are hitting limits most frequently
- **Heatmap pattern interpretation:**
  - High 429 concentration on a few identifiers → normal aggressive clients; consider per-client outreach
  - High 429 spread across many diverse IPs with similar request patterns → IP rotation attack; shift to behavioral or fingerprint-based limiting

**Redis health**

- Redis command latency (p50, p99) — a rate limiter adds one Redis round-trip per request; if Redis p99 exceeds 5ms, it becomes visible in API latency
- Redis connection pool utilisation — >80% saturation signals under-provisioning for traffic volume
- Keys with no TTL — monitor via `SCAN` + `TTL` sampling; any rate limit key with `-1` TTL indicates the INCR+EXPIRE race condition in production

### Header-Driven Debugging

The `X-RateLimit-*` headers double as debugging instruments:

| Symptom                                   | Header to check         | What to look for                                                    |
| ----------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| Client still throttled after window reset | `X-RateLimit-Reset`     | Compare to current time; stale reset = counter TTL not propagating  |
| Wrong tier's limit firing                 | `X-RateLimit-Scope`     | Reveals which limit layer triggered (`user`, `org`, `ip`, `global`) |
| `Remaining: 0` on first request           | `X-RateLimit-Remaining` | Counter not expiring; TTL race condition in Redis                   |
| Clients retrying too fast                 | `Retry-After`           | Verify jitter is applied; fixed values synchronise retries          |

When tracing a 429 complaint from a specific client: pull their identifier, query Redis directly (`GET rate_limit:{id}:{window}`), and compare the count against the configured limit. If the count is correct but the client believes they haven't exceeded the limit, the window timestamps are misaligned — usually a clock skew issue between application instances.

### Alerting

| Alert                  | Condition                          | Interpretation                                          |
| ---------------------- | ---------------------------------- | ------------------------------------------------------- |
| Throttle ratio spike   | >5% throttled for >5 min           | Limits miscalibrated or legitimate traffic surge        |
| 429 volume spike       | >10× normal rate in 60s            | Active attack or sudden client misbehaviour             |
| Redis p99 latency      | >5ms                               | Limiter adding measurable API latency; scale Redis      |
| Redis pool saturation  | >80% connections in use            | Connection pool undersized; consider pooler (Twemproxy) |
| TTL-less keys detected | Any rate limit key with no expiry  | INCR+EXPIRE race condition reached production           |
| Throttle ratio = 0     | Sustained on high-traffic endpoint | Limits may be too permissive; verify configuration      |

> ⚠️ **Gotcha:** A sudden drop in 429 rate is not always good news. After a Redis failover, counters reset to zero — throttle ratio drops to zero briefly. Without an alert correlating Redis failover events with 429 rate changes, this looks like traffic normalising when enforcement has actually lapsed.

**Key Takeaway:** Track throttled ratio per identifier, not raw 429 counts. Spikes spread across many diverse IPs signal an attack; spikes concentrated on a few API keys signal a misbehaving client; uniform throttle across all identifiers signals a misconfigured limit or a traffic surge that warrants a limit recalibration.

## Quick Decision Guide

### Which Algorithm?

Full mechanics and complexity comparison in [Rate Limiting Algorithms](../algorithms/rate-limiting-algorithms.md). <!-- link: rate-limiting-algorithms.md -->

| Requirement                                 | Algorithm              |
| ------------------------------------------- | ---------------------- |
| Default REST API — bursts acceptable        | Token Bucket           |
| Smooth, uniform downstream output required  | Leaky Bucket           |
| Simplest possible, low-traffic internal API | Fixed Window Counter   |
| Strictest accuracy, memory not a constraint | Sliding Window Log     |
| Production default — accuracy + O(1) memory | Sliding Window Counter |

### Where to Enforce?

| Scenario                                            | Placement                                      |
| --------------------------------------------------- | ---------------------------------------------- |
| Public API, no app context needed                   | API Gateway                                    |
| Need user tier, account state, or business logic    | Application Middleware                         |
| Volumetric DDoS mitigation, unauthenticated traffic | CDN / Edge                                     |
| East-west (service-to-service) limits               | Service Mesh                                   |
| Security-critical endpoint (auth, payment)          | API Gateway **and** App Middleware             |
| Client SDK calling a downstream API                 | Client-side (politeness only, not enforcement) |

> **Default:** API gateway first. Add per-service middleware only when you need application context or a second enforcement line for sensitive endpoints.

### Which Identifier?

| Traffic type                | Primary identifier             | Caveat                                |
| --------------------------- | ------------------------------ | ------------------------------------- |
| Authenticated REST API      | User ID                        | Requires auth to be resolved upstream |
| B2B API with billing tiers  | API key                        | Maps directly to quota tier           |
| Unauthenticated / anonymous | IP address                     | Bypassable; NAT over-blocking risk    |
| Single sensitive endpoint   | Composite (user ID + endpoint) | Higher memory; use selectively        |
| Global DDoS defence         | Global counter                 | Coarse; last resort                   |

### Hard Reject vs Soft Throttle?

| Scenario                                    | Choice                                   |
| ------------------------------------------- | ---------------------------------------- |
| Auth endpoints, payment flows               | Hard reject — no work done, clear signal |
| Expensive compute (LLM, transcoding)        | Hard reject — resource cost too high     |
| UX-sensitive read APIs (search, dashboards) | Soft throttle — transparent to client    |
| Approaching quota (not yet over)            | Warn via `X-RateLimit-Remaining` headers |
| Unknown risk profile                        | Hard reject — safer default              |

### Fail-Open vs Fail-Closed When Redis Is Down?

| What you're protecting               | Policy                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Security enforcement, auth endpoints | Fail closed — return 429 for all requests                                        |
| Cost control, fairness quotas        | Fail open — fall back to per-instance counters                                   |
| Default if undecided                 | Fail closed — enforcement gap is harder to explain than temporary unavailability |

## Appendices

### Selection Matrix

Full mechanics in [Rate Limiting Algorithms](../algorithms/rate-limiting-algorithms.md). This matrix covers the decision dimensions only.

|                               | Token Bucket         | Leaky Bucket       | Fixed Window                | Sliding Window Log     | Sliding Window Counter |
| ----------------------------- | -------------------- | ------------------ | --------------------------- | ---------------------- | ---------------------- |
| **Allows bursts**             | Yes (up to capacity) | No                 | Limited (boundary only)     | Yes                    | Limited                |
| **Memory per identifier**     | O(1)                 | O(1)               | O(1)                        | O(n) — n = req count   | O(1)                   |
| **Boundary spike risk**       | None                 | None               | High — 2× burst at boundary | None                   | Low                    |
| **Implementation complexity** | Low                  | Low                | Very low                    | Medium                 | Medium                 |
| **Redis-friendly**            | Yes                  | Yes                | Yes                         | Requires sorted set    | Yes                    |
| **Best for**                  | Most REST APIs       | Payment, streaming | Simple internal APIs        | Strict SLA enforcement | Production default     |

### Anti-patterns

- **Rate limiting only by IP address** — trivially bypassed via residential proxies or NAT rotation; over-blocks legitimate users sharing a NAT. Use user ID or API key for authenticated traffic; treat IP as a secondary signal only.

- **In-process counters in a multi-instance deployment** — each instance enforces independently; effective limit becomes N × configured limit. Always use a shared external counter (Redis) when running more than one instance.

- **Returning 503 instead of 429** — 503 signals server failure; monitoring alerts, SLO dashboards, and client retry logic treat it as an outage. 429 is the correct status for quota enforcement.

- **No Retry-After header on 429 responses** — clients fall back to exponential backoff with arbitrary starting intervals; the resulting retry distribution is unpredictable. Always include Retry-After with jitter.

- **Fixed Retry-After value for all clients** — all throttled clients retry simultaneously at the same second, reproducing the spike that triggered the rate limit. Add per-response jitter.

- **Client-side rate limiting as the only enforcement** — attackers control the client and ignore any client-side logic. Client-side throttling is only valid as a politeness mechanism in your own SDKs, never as a security or cost-control boundary.

- **Single enforcement layer with no fallback** — a misconfigured firewall or a legacy endpoint can bypass a gateway-only rate limiter silently. Critical endpoints should have both gateway and per-service enforcement.

- **Setting Redis INCR and EXPIRE as two separate commands** — race condition: two instances on a fresh key can leave the key without a TTL, making the counter permanent. Use a Lua script to make the operation atomic.

### Acronyms & Abbreviations

| Acronym | Full Form                     | One-line meaning                                           |
| ------- | ----------------------------- | ---------------------------------------------------------- |
| DDoS    | Distributed Denial of Service | Coordinated volumetric attack using many sources           |
| TTL     | Time To Live                  | Expiry duration for a cached counter or DNS record         |
| SLA     | Service Level Agreement       | Contractual performance and uptime guarantee               |
| RPS     | Requests Per Second           | Rate metric for incoming traffic volume                    |
| NAT     | Network Address Translation   | Technique that maps many private IPs to one public IP      |
| PoP     | Point of Presence             | Edge CDN node geographically close to end users            |
| AOF     | Append Only File              | Redis persistence mode that logs every write command       |
| NTP     | Network Time Protocol         | Protocol for synchronising clocks across distributed nodes |
