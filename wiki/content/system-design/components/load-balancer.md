# Load Balancer

## Prerequisites

- **TCP/IP & OSI Model** - understand the difference between L4 (transport: TCP/UDP) and L7 (application: HTTP). Load balancers operate at one of these layers, and the choice determines what they can inspect and act on.
- **HTTP/1.1 vs HTTP/2** - connection semantics differ: HTTP/1.1 uses one request per connection (or pipelined), HTTP/2 multiplexes multiple streams over one TCP connection. This affects how LBs manage keep-alive and backend connections.
- **[DNS](./dns.md)** - DNS-based load balancing is a distinct pattern; understanding TTL is critical to grasping why DNS LB has slow failover.
- **Server Concurrency Models** - thread-per-request vs async I/O models affect how backends handle connection load, which impacts LB algorithm selection.

---

## Table of Contents

- [Quick Decision Guide](#quick-decision-guide)
- [Conceptual Foundations & Mental Models](#conceptual-foundations--mental-models)
- [Classification & Variants](#classification--variants)
- [Traffic Distribution Algorithms](#traffic-distribution-algorithms)
- [Health Checks & Backend Management](#health-checks--backend-management)
- [Session Persistence](#session-persistence)
- [SSL/TLS Handling](#ssltls-handling)
- [High Availability & Resilience](#high-availability--resilience)
- [Performance & Optimization](#performance--optimization)
- [Advanced Patterns](#advanced-patterns)
- [Observability & Debugging](#observability--debugging)
- [Production Failure Modes](#production-failure-modes)
- [Common Interview Gotchas](#common-interview-gotchas)
- [Post-mortem Reading List](#post-mortem-reading-list)
- [Interview Scenario & Debugging Bank](#interview-scenario--debugging-bank)
- [Appendices](#appendices)

---

## TLDR

A load balancer sits between clients and a pool of servers, distributing incoming requests to prevent any single server from becoming a bottleneck. At L4, it routes based on IP and TCP/UDP headers without inspecting application data; at L7, it can make routing decisions based on HTTP headers, URLs, and cookies. The core trade-off is between simplicity and control: L4 is faster with lower overhead, L7 is more powerful but adds latency and complexity. In production, load balancers are almost always deployed in HA pairs with floating IPs to eliminate themselves as a single point of failure.

---

## Quick Decision Guide

### Which LB Type?

```
Need HTTP-aware routing (URL, headers, cookies, gRPC)?
  ├─ YES ──▶ Use L7 LB (nginx, AWS ALB, Envoy)
  │            │
  │            ▼
  │          SSL strategy?
  │            ├─ Compliance requires E2E encryption ──▶ Re-encryption mode (6.3)
  │            ├─ Standard web traffic ──▶ Terminate at LB (6.1)
  │            └─ Cannot decrypt (mTLS passthrough) ──▶ SSL Passthrough (6.2)
  │
  └─ NO ──▶ Use L4 LB (AWS NLB, HAProxy TCP mode)
               │
               ▼
             Is the protocol gRPC or HTTP/2?
               └─ YES ──▶ ⚠ Switch to L7 - L4 cannot balance individual streams
```

### Which Algorithm?

```
Are request costs uniform AND backends homogeneous?
  ├─ YES ──▶ Round Robin (add weights if capacity differs)
  │
  └─ NO (variable cost or heterogeneous backends)
               │
               ▼
             Need backend affinity (warm cache, local state)?
               ├─ NO ──▶ Least Connections (or Least Response Time)
               │
               └─ YES
                    │
                    ▼
                  Clients behind NAT or frequently changing IPs?
                    ├─ YES ──▶ Cookie-based stickiness (5.1)
                    │
                    └─ NO
                         │
                         ▼
                       Backend pool stable (rare adds/removes)?
                         ├─ YES ──▶ Consistent Hashing (3.5)
                         └─ NO  ──▶ Cookie-based stickiness (5.1)
```

### HA Strategy?

```
Traffic criticality?
  ├─ High (any downtime is unacceptable)
  │    └──▶ Active-Active pair + Anycast or DNS LB (9.1)
  │
  └─ Moderate (seconds of failover acceptable)
       └──▶ Active-Passive pair + VRRP Floating VIP (7.2)
                │
                ▼
              Need in-flight connections to survive failover?
                ├─ YES ──▶ Add conntrack state sync (conntrackd)
                └─ NO  ──▶ Stateless failover is sufficient; ensure clients retry
```

---

## Conceptual Foundations & Mental Models

**Interviewer TL;DR:** The L4 vs L7 decision is the first thing to establish - everything else (routing, SSL, stickiness) follows from it.

**Mental model:** A load balancer is a traffic cop standing between the internet and your servers - it sees every incoming request and decides which server handles it, invisibly to the client.

### Core Problem: Single Server as Bottleneck

Any single server has hard limits: CPU cores, memory, open file descriptors, and network bandwidth. Beyond those limits, requests queue up, latency spikes, and eventually the server crashes. A load balancer solves this by spreading requests across many servers, making the system appear as one endpoint to clients while horizontally scaling behind the scenes.

The problem isn't just capacity - it's also availability. If your single server crashes, everything goes down. A load balancer with multiple backends means one server failure doesn't equal an outage.

### Abstraction: Transparent Traffic Distributor

From a client's perspective, they connect to one IP and get a response. They have no visibility into which backend served them. The load balancer handles:

1. Accepting the client connection
2. Selecting a backend
3. Forwarding the request (and response)
4. Managing the lifecycle of both connections

This transparency is what makes horizontal scaling seamless - you can add or remove backends without clients noticing.

### L4 vs L7 - Where in the Stack Interception Happens

This is the most important classification decision.

**L4 (Transport Layer):** The LB sees TCP/UDP packets. It knows source IP, destination IP, and ports - nothing more. It cannot inspect HTTP headers, cookies, or URLs. Critically, it does **not** terminate the TCP connection - it forwards packets directly, so the client and backend share one end-to-end TCP connection. Routing is fast because no application-layer parsing is needed.

**L7 (Application Layer):** The LB **terminates** the client's TCP connection entirely. It then parses the HTTP request, makes a routing decision based on headers/URL/cookies, and opens a brand-new TCP connection to the chosen backend. Two separate TCP connections exist: client → LB, and LB → backend. The client never communicates directly with the backend. This adds latency (two TCP handshakes) but enables powerful routing: send `/api/*` to one pool, `/static/*` to another, route based on `User-Agent`, implement sticky sessions via cookies, etc.

```
L4 Flow:  Client ──TCP──▶ LB ──TCP──▶ Backend  (packet forwarding, no parsing)
L7 Flow:  Client ──TCP──▶ LB (parses HTTP) ──TCP──▶ Backend  (two connections)
```

> 🧠 **Thought Process**
> When an interviewer asks "how would you design a load balancer for this system?", the first question to ask yourself: _do I need to make routing decisions based on request content?_ If yes → L7. If you just need to distribute TCP connections cheaply → L4. Most modern web systems need L7 for SSL termination and URL-based routing alone.

> 🎯 **Interview Lens** > **Q:** When would you choose L4 over L7?
> **Ideal answer:** L4 when you need raw throughput and low latency (gaming servers, financial tick data, large file transfers), when you cannot or don't need to inspect application payload, or when you want to avoid the overhead of terminating SSL at the LB. L7 for any HTTP-based routing, SSL offload, or content-based decisions.
> **Common trap:** Candidates say "L7 is always better because it's smarter." The right answer acknowledges the latency and complexity cost of two TCP handshakes per request.
> **Follow-up pivot:** "What if the traffic is gRPC?" → gRPC runs over HTTP/2, so you need an L7 LB that understands HTTP/2 framing to properly load balance individual RPC calls, not just TCP connections.
> **Next question:** "Your system has both gRPC microservices and HTTP/1.1 REST APIs - one LB or two?" → One L7 LB that routes by protocol/path: gRPC traffic (Content-Type: application/grpc) goes to one backend pool, REST to another. Avoids operational complexity of two separate LBs.

**Key Takeaway:** The L4 vs L7 decision is the foundation - it determines what the LB can route on, whether it can terminate SSL, and whether sticky sessions are possible. Everything else follows from it.

---

## Classification & Variants

**Interviewer TL;DR:** Default to cloud-native; use software LBs when you need control; hardware only for legacy or extreme throughput requirements.

**Mental model:** Load balancers come in different shapes depending on _where_ they live in the network and _what_ they run on. Knowing the taxonomy prevents you from proposing a software LB for a job that needs hardware-level throughput, or a cloud-native LB for a use case requiring custom protocol support.

### Layer 4 vs Layer 7 Load Balancers

Covered in depth in [L4 vs L7](#l4-vs-l7--where-in-the-stack-interception-happens). Key production implications:

| Dimension           | L4                             | L7                          |
| ------------------- | ------------------------------ | --------------------------- |
| Throughput          | Very high (line-rate possible) | Lower (parsing overhead)    |
| Routing granularity | IP + Port only                 | URL, headers, cookies, body |
| SSL handling        | Passthrough only               | Termination + re-encryption |
| Observability       | Connection-level metrics       | Request-level metrics       |
| Examples            | AWS NLB, HAProxy TCP mode      | AWS ALB, nginx, Envoy       |

### Hardware vs Software vs Cloud-native

**Hardware LBs** (F5, Citrix ADC): Purpose-built ASICs for line-rate throughput. Used in enterprises for legacy systems. Expensive, inflexible, hard to automate. Largely being replaced by software alternatives.

**Software LBs** (HAProxy, nginx, Envoy): Run on commodity hardware or VMs. Highly configurable, scriptable, and cloud-friendly. HAProxy is the production benchmark for raw performance among software LBs.

**Cloud-native** (AWS ALB/NLB, GCP Cloud Load Balancing): Fully managed, auto-scaling, integrated with cloud IAM and monitoring. No infrastructure to manage, but limited configuration flexibility and potential vendor lock-in.

> ⚖️ **Decision Framework**
>
> - **Hardware:** Only if you have legacy regulatory requirements or need wire-speed L4 forwarding at 100Gbps+.
> - **Software:** When you need full control, custom protocols, or on-prem deployment.
> - **Cloud-native:** Default for any cloud-hosted workload. Operational savings almost always outweigh flexibility loss.
> - **When NOT to use cloud-native:** Cross-cloud or hybrid routing requirements, or when pricing becomes prohibitive at extreme scale.

### Edge/Internet-facing vs Internal/Private Load Balancers

**Internet-facing:** Exposed to the public internet. Handles DDoS mitigation, SSL termination, and rate limiting as first-line concerns. Has a public IP and is the entry point to your system.

**Internal/Private:** Routes traffic between microservices inside a VPC or data center. Handles service mesh traffic, gRPC, or internal API routing. Not externally exposed - different security profile (though zero-trust architectures challenge the "trust inside the network" assumption).

In a mature architecture, both exist in layers:

```
Internet → [Edge LB / CDN] → [Internet-facing L7 LB] → [Internal L4/L7 LBs] → Services
```

### Reverse Proxy vs Dedicated LB

A reverse proxy (nginx, Envoy) sits in front of backends and forwards requests - functionally identical to an L7 LB. The distinction is conceptual: a reverse proxy is often also responsible for caching, compression, and serving static content, while a "load balancer" implies traffic distribution as its primary role.

In practice, the line is blurred. nginx is both a reverse proxy and an LB. Envoy is a proxy that does LB. AWS ALB is a managed LB that also performs proxy functions. Don't get hung up on the label.

**Key Takeaway:** Default to cloud-native for managed simplicity; use software LBs when you need configuration control; hardware only for legacy constraints or extreme throughput. The reverse proxy vs LB distinction is mostly semantic - in practice they're the same component.

---

## Traffic Distribution Algorithms

**Interviewer TL;DR:** Round Robin for uniform workloads; Least Connections for variable ones; Consistent Hashing when backend affinity and pool stability both matter.

**Mental model:** The algorithm answers one question: _given N healthy backends, which one gets this request?_ The right answer depends on whether your requests are uniform (same cost) or variable (some are cheap, some are expensive).

### Round Robin & Weighted Round Robin

**Round Robin:** Requests are distributed sequentially across backends. Backend 1 gets request 1, Backend 2 gets request 2, cycling back to Backend 1.

```python
backends = ["server1", "server2", "server3"]
current = 0

def get_backend():
    global current
    backend = backends[current % len(backends)]
    current += 1
    return backend
```

**Weighted Round Robin:** Backends receive proportional traffic. A backend with weight 3 gets 3x more requests than one with weight 1. Used when backends have different capacities.

**Trade-offs:** Works well when requests are uniform in cost and backends are homogeneous. Breaks down when some requests are expensive (long-running queries) and others are cheap - a busy backend receives new requests at the same rate as an idle one.

### Least Connections & Weighted Least Connections

Routes each new request to the backend with the fewest active connections at that moment.

**Why it's better for variable workloads:** If one backend is processing 10 slow requests and another is idle, round robin sends the next request to the busy backend by rotation. Least connections sends it to the idle one.

**Weighted Least Connections:** Normalizes by backend capacity: `score = active_connections / weight`. Prevents a weaker backend from being treated as equivalent to a stronger one.

> 🎯 **Interview Lens** > **Q:** When does least connections outperform round robin?
> **Ideal answer:** When request processing time varies significantly (e.g., some DB queries take 1ms, others take 500ms). Round robin ignores in-flight load; least connections is load-aware.
> **Follow-up:** "What's the overhead of least connections?" → The LB must track active connection counts per backend using atomic counters, adding a small coordination cost at high RPS.
> **Next question:** "What if a backend has only 1 active connection but that connection is a slow 30-second query - least connections would still route new requests to it?" → Correct. Least connections counts connections, not actual load. The fix is least response time, which factors in observed latency per backend and would penalize the slow backend appropriately.

### Deterministic IP Hashing

Routes requests from the same client IP to the same backend every time using a hash of the source IP.

```python
import hashlib

def get_backend(client_ip, backends):
    hash_val = int(hashlib.md5(client_ip.encode()).hexdigest(), 16)
    return backends[hash_val % len(backends)]
```

**Use case:** When backend affinity matters for performance (warm caches) but you don't want the overhead of explicit session tracking.

**Critical limitation:** Adding or removing a backend reshuffles all assignments because `% len(backends)` changes. Use consistent hashing to avoid this. (→ [Consistent Hashing](../algorithms/consistent-hashing.md))

> ⚖️ **Decision Framework**
> Use IP hashing only when: (1) you need backend affinity, (2) your backend pool is stable, and (3) client IP diversity is high. If clients come from behind a NAT (thousands of users sharing one public IP), IP hashing creates severe hot spots. Prefer cookie-based stickiness in that case ([Cookie-Based Persistence](#cookie-based-persistence)).

### Least Response Time

Routes to the backend with the lowest combination of active connections and response latency. More sophisticated than least connections because it accounts for actual backend speed, not just queue depth.

Requires the LB to measure and track response times per backend. Used in HAProxy's `leastconn` + response time mode and Envoy's `LEAST_REQUEST` policy.

**Herding risk:** If one backend is momentarily faster (e.g., a cache warm-up completes), all new requests pile onto it - making it suddenly the slowest. The algorithm then shifts all traffic to the next fastest backend, which also gets overwhelmed. This oscillation ("herding") can cause worse load distribution than round robin under bursty traffic. Mitigation: add a small amount of randomness or jitter to the selection (Envoy's power-of-two-choices: sample 2 backends randomly, pick the faster one - reduces herding while retaining load-awareness).

### Consistent Hashing

**The problem it solves:** Simple modulo hashing (`hash(key) % N`) breaks every time N changes. Add one backend to a pool of 10 and ~90% of all key-to-backend mappings change - invalidating affinity for nearly every client at once.

**The mechanism:** Place both backends and keys on a virtual ring of hash values (0 to 2³²). Each key is assigned to the first backend clockwise from it on the ring. When a backend is added or removed, only the keys between it and its nearest neighbour on the ring are remapped - roughly `1/N` of all keys, versus `(N-1)/N` for modulo hashing.

```
Ring (simplified):

    0
    │
  [B1] ← keys in this arc go to B1
    │
  [B2] ← keys in this arc go to B2
    │
  [B3] ← keys in this arc go to B3
    │
   2³²
```

**Virtual nodes:** A single backend placed once on the ring creates uneven arc sizes - one backend may own 40% of the ring, another 10%. Virtual nodes fix this: each physical backend is hashed to many positions on the ring (e.g., 150 virtual nodes per backend). The arcs average out to roughly equal distribution.

**In load balancing context:** The key is typically a session ID, user ID, or request attribute - not the source IP (which collapses behind NAT). Consistent hashing is the right choice when you need backend affinity _and_ your pool changes frequently (autoscaling, rolling deploys).

🔗 Deep-Dive: [load-balancer-consistent-hashing.md](./load-balancer-consistent-hashing.md) - Ring math, virtual node tuning, rebalancing impact, and bounded load extensions. (→ [Consistent Hashing](../algorithms/consistent-hashing.md))

### Resource-Based / Adaptive Routing

The LB queries each backend for current resource utilization (CPU, memory, queue depth) and routes to the least loaded. Requires backends to expose a metrics endpoint.

Used in sophisticated service meshes and internal LBs where backends have heterogeneous workloads. Adds periodic polling overhead and operational complexity. Rarely seen at the internet edge.

### Algorithm Cheat Sheet

| Algorithm                  | Core Mechanism                                   | Best For                               | Key Weakness                                                                                     | LB State Required            |
| -------------------------- | ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| Round Robin                | Sequential cycling across backends               | Uniform requests, homogeneous backends | Ignores in-flight load - busy and idle backends get equal traffic                                | None                         |
| Weighted Round Robin       | Sequential cycling with proportional weights     | Mixed-capacity backends                | Still ignores in-flight load                                                                     | Weight config only           |
| Least Connections          | Route to backend with fewest open connections    | Variable request cost                  | 1 slow connection = 1 fast connection - doesn't reflect actual load                              | Per-backend counter          |
| Weighted Least Connections | Least connections normalized by backend capacity | Mixed capacity + variable cost         | Same blind spot as least connections                                                             | Counter + weights            |
| Deterministic IP Hash      | `hash(source IP) % N` to pick backend            | Backend affinity, stable pools         | NAT collapses many users to one IP → hot spots; pool resize reshuffles all assignments           | None                         |
| Consistent Hashing         | Key mapped to virtual ring; nearest node wins    | Affinity + dynamic pool (adds/removes) | Requires a good key (avoid IP for NAT clients); virtual node tuning needed for even distribution | Ring state                   |
| Least Response Time        | Fewest connections + lowest observed latency     | Heterogeneous backend speed            | Measurement overhead; can overreact to transient latency spikes                                  | Per-backend latency tracking |
| Resource-Based / Adaptive  | Route based on backend-reported CPU/memory/queue | Heterogeneous internal workloads       | Requires backends to expose metrics; polling adds lag; rarely worth complexity at the edge       | External metrics poll        |

**Key Takeaway:** Round Robin for uniform workloads; Least Connections when request cost varies; Consistent Hashing when you need affinity and the pool changes. IP Hash is a trap behind NAT - cookie-based stickiness is almost always safer.

---

## Health Checks & Backend Management

**Interviewer TL;DR:** Active checks detect failures fast; always pair them with connection drain and slow-start to prevent cascading failures during backend changes.

**Mental model:** The LB needs to know which backends are alive _and capable of handling traffic_. Health checks are the mechanism - the difference between "the server is up" and "the server is up and can serve requests."

### Active vs Passive Health Checks

**Active (proactive):** The LB periodically sends synthetic requests to each backend (TCP ping, HTTP GET to `/health`) and marks it healthy or unhealthy based on the response.

```
LB → GET /health HTTP/1.1 → Backend
     ← 200 OK             (healthy)
     ← 503 / timeout      (unhealthy → remove from pool)
```

**Passive (reactive):** The LB observes real traffic responses. If a backend returns 5xx errors or times out above a threshold, it's marked unhealthy. No synthetic traffic, but slower detection - a backend must fail real requests before removal.

Most production setups use both: active checks for fast detection, passive checks as a secondary signal.

### Check Interval, Failure Threshold & Timeout Tuning

Key parameters:

- **Interval:** How often to probe (e.g., every 5s). Shorter = faster detection, higher overhead.
- **Failure threshold:** Consecutive failures before marking unhealthy (e.g., 3). Prevents flapping on transient errors.
- **Success threshold:** Consecutive successes before marking healthy again (e.g., 2). Prevents premature return.
- **Timeout:** How long to wait for a response. Must be shorter than the interval.

```
# HAProxy health check config
option httpchk GET /health
timeout check 2s
default-server inter 5s fall 3 rise 2
```

> 🎯 **Interview Lens** > **Q:** How do you prevent a thundering herd when a backend recovers after failure?
> **Ideal answer:** Use [slow-start](#slow-start--warmup-after-backend-recovery). When a backend is marked healthy, ramp its traffic weight gradually rather than immediately sending full load. This lets the backend warm caches and stabilize before receiving production traffic.
> **Next question:** "Your health check returns 200 but the service is still slow for the first 10 seconds - how do you handle that?" → This is the liveness vs readiness distinction. Liveness = the process is running. Readiness = the process is ready to serve traffic. Your `/health` endpoint should fail until the service is fully initialized (connection pool warmed, caches loaded). Kubernetes formalizes this with separate liveness and readiness probes.

### Graceful Connection Drain vs Abrupt Removal

When a backend needs to be removed (deploy, scale-down), abruptly cutting connections breaks in-flight requests. Graceful drain:

1. LB stops sending _new_ requests to the backend.
2. Existing connections are allowed to complete (up to a drain timeout, e.g., 30s).
3. After timeout, remaining connections are forcibly closed.

Critical for long-lived connections (WebSockets, gRPC streams, file uploads) - [Long-Lived Connection Drain Timeouts](#long-lived-connection-drain-timeouts-websockets-sse) covers the failure mode when drain timeouts are misconfigured.

### Slow-Start / Warmup After Backend Recovery

After a backend returns to the healthy pool, send it a fraction of its normal traffic weight, ramping up over a configured period (e.g., 60 seconds to full weight).

Prevents cold-start JVM GC pauses, unwarmed caches, and connection pool initialization from causing a backend to fall behind immediately after recovery and trigger another removal cycle.

### Health Check Depth: Shallow vs Deep

Not all health checks are equal. The depth of what a check verifies has a direct trade-off between accuracy and safety.

**Shallow check:** The endpoint returns 200 immediately, confirming the process is alive and the port is open. Fast, zero risk of false positives, but blind to dependency failures (DB is down, cache is unreachable).

```
GET /health → 200 OK   (process is alive, nothing else verified)
```

**Deep check:** The endpoint queries downstream dependencies - DB connection pool, cache, external services - before returning healthy. Catches real dependency failures but introduces a dangerous failure mode.

**The cascading failure trap with deep checks:** If your DB goes slow (not down), every backend's deep health check times out simultaneously. The LB removes all backends from the pool at once. Now you have a healthy application, a slow-but-functional DB, and a completely dead fleet - caused entirely by the health check. This is worse than serving degraded traffic.

**The right model:**

- **Liveness** (`/healthz`): Is the process running? Shallow. Used to decide if the process should be restarted.
- **Readiness** (`/readyz`): Is the process ready to serve traffic? Checks local state (connection pools initialized, caches warmed). Does **not** query external dependencies.
- **Dependency health**: Monitor separately via metrics/alerting - do not couple it to the LB health check.

> 🎯 **Interview Lens** > **Q:** Your health check queries the database. The DB becomes slow but doesn't fail. What happens?
> **Ideal answer:** All backends fail their health checks simultaneously and get removed from the pool - a complete outage caused by the health check, not the actual failure. Fix: decouple dependency health from the LB health check. Use readiness (local state only) for LB decisions; monitor DB health separately.
> **Next question:** "Then how does the LB know if a backend can't reach the DB?" → It doesn't need to know directly. Passive health checks (observing real traffic 5xx responses) catch this organically. If the backend is returning errors due to DB issues, the LB will detect the error rate spike and pull it without a deep check being needed.

**Key Takeaway:** Active probes + readiness semantics + graceful drain + slow-start - omit any one and you will cause cascading failures or thundering herds on every deploy. Deep health checks that query dependencies are more dangerous than shallow ones.

---

## Session Persistence

**Interviewer TL;DR:** Sticky sessions are a crutch - they mask a stateful backend problem; the real fix is externalizing session state so any backend can serve any client.

**Mental model:** Sometimes the same client _must_ go to the same backend - because session state lives there or the cache is warm there. Session persistence ("sticky sessions") is the mechanism, but it comes with real costs that often point to an underlying architectural problem.

**Why this exists:** HTTP is stateless by design - each request is independent, and the server has no built-in memory of who you are between requests. Traditional web applications work around this by storing session data locally on the server: when you log in, a session object is created in backend-2's memory (or on its disk). Your session token (a cookie) maps to that object. This works fine with one server. With a load balancer distributing requests across many servers, your next request might land on backend-3, which has no record of your session - you get a 401 or an empty cart.

Sticky sessions are the LB-level band-aid: "always send this client back to the same backend." This works until that backend is redeployed, crashes, or gets overloaded. The underlying problem - session state coupled to a single server - remains.

**The interview-critical distinction:** "Sticky" is a routing property (enforced by the LB). "Stateful" is an application property (data lives on one server). Interviewers probe whether you understand that the right fix is making backends stateless by externalizing session state to a shared store (Redis, Memcached), not making routing stickier.

**The exception - protocol-level stickiness:** WebSocket and SSE connections are inherently stateful at the _protocol_ level - the connection itself is the session. Stickiness here is not a crutch; it is architecturally required. You cannot serve a WebSocket frame on backend-2 when the connection was opened on backend-1. This is fundamentally different from HTTP session stickiness: the problem isn't where state is stored, it's that the connection itself must persist to one backend. See section 11.3 for the drain implications.

### Cookie-Based Persistence

The LB inserts a cookie (e.g., `SERVERID=backend-2`) in the first response. On subsequent requests, the LB reads this cookie and routes to the same backend.

**Advantage:** Works correctly even when clients change IPs (mobile networks, NATs). More reliable than IP-based stickiness.

**Disadvantage:** Requires L7 (the LB must inspect HTTP headers). The LB must manage cookie state or embed the backend ID directly in the cookie value.

### IP-Hash-Based Persistence

Covered in [Deterministic IP Hashing](#deterministic-ip-hashing). Routes based on source IP hash. Simpler but breaks behind NATs and when clients change IPs.

### Risks: Uneven Load Distribution & Failure Stickiness

**Uneven distribution:** If one backend is assigned 30% of clients but those clients happen to be high-traffic users, that backend gets disproportionate load.

**Failure stickiness:** When the sticky backend fails, those clients' sessions break. If session state was stored locally on the failed backend, it's lost. This is why sticky sessions are a **crutch** - they paper over a stateless architecture problem. The real fix is externalizing session state to Redis or Memcached so any backend can serve any client.

> ⚖️ **Decision Framework**
> Use sticky sessions only as a short-term migration aid or for specific workloads (WebSocket connections, stateful gaming sessions). For REST APIs and stateless services, sticky sessions add complexity with no benefit. If you find yourself needing them for web sessions, the right fix is externalizing session state to a shared store.

### Client IP Preservation (X-Forwarded-For, Proxy Protocol)

When the LB terminates the client connection and opens a new one to the backend, the backend sees the LB's IP as the source - not the client's. This breaks IP-based rate limiting, geo-routing, audit logging, and security rules.

**X-Forwarded-For (XFF):** The LB adds `X-Forwarded-For: <client-ip>` to the HTTP request. Each hop appends to the list: `X-Forwarded-For: <client-ip>, <proxy-1-ip>, <proxy-2-ip>`. The trust model is precise: if you have **N trusted proxy hops** between the internet and your application, the real client IP is the **Nth value from the right**. Values to the left of that position are client-supplied and must never be trusted. At your outermost LB, strip any incoming XFF header entirely before appending the real client IP - this prevents clients from pre-injecting fake IPs into the chain.

**Proxy Protocol (v1/v2):** A lightweight header prepended to the TCP stream before any application data. Works for any TCP-based protocol, not just HTTP. Harder to spoof, better for L4 use cases. Backend must explicitly support it.

```
# Proxy Protocol v1 header (text, prepended to TCP stream)
PROXY TCP4 192.168.1.1 10.0.0.1 56324 443\r\n
```

> 🎯 **Interview Lens** > **Q:** How do you rate-limit by client IP when all traffic comes through a load balancer?
> **Ideal answer:** Use X-Forwarded-For or Proxy Protocol to pass the original client IP to the backend or rate-limiter. Trust only the _last_ XFF value added by your own LB - earlier values can be spoofed. Alternatively, implement rate limiting at the LB itself before the IP is obscured.
> **Follow-up:** "What if the LB is behind another LB?" → Chain of XFF headers. You need to know how many trusted hops exist and read the correct position in the chain.
> **Next question:** "How do you prevent a malicious client from injecting a fake IP into X-Forwarded-For to bypass your rate limiter?" → Strip all incoming XFF headers at your outermost LB and let only your own infrastructure append to it. Never trust client-supplied XFF values. Proxy Protocol is harder to spoof since it operates at the TCP layer before any application data.

**Key Takeaway:** Sticky sessions are a band-aid for stateful backends - the correct fix is externalizing session state. The exception is WebSocket and SSE, where stickiness is a protocol requirement, not an architectural choice.

---

## SSL/TLS Handling

**Interviewer TL;DR:** Terminate at the LB for simplicity; re-encrypt if compliance demands E2E encryption - but you're paying two TLS handshakes per request.

**Mental model:** TLS is computationally expensive. The question is _where_ you pay that cost - at the LB, at the backend, or both.

**Why this exists:** TLS (Transport Layer Security) encrypts traffic between two parties and verifies identity via certificates. Before any data flows, the client and server perform a **handshake**: they exchange cryptographic keys, the server presents its certificate, and they agree on a cipher. This handshake takes 1–2 network round trips and is CPU-intensive - especially the asymmetric key exchange (RSA or ECDHE).

The LB sits in the middle of every connection. This creates a fundamental question: does the LB decrypt the traffic, or does it pass the encrypted stream through untouched? The answer determines what the LB can and can't do:

| Mode                | Who decrypts         | LB can do L7 routing? | Backend needs TLS config? | E2E encrypted?             |
| ------------------- | -------------------- | --------------------- | ------------------------- | -------------------------- |
| **Terminate at LB** | LB                   | Yes                   | No                        | No (LB → backend is plain) |
| **Passthrough**     | Backend              | No (L4 only)          | Yes                       | Yes                        |
| **Re-encrypt**      | LB, then re-encrypts | Yes                   | Yes                       | Yes                        |

The right choice depends on your security posture and routing needs. Most systems use termination at LB - it's simpler and fast. Regulated environments (PCI-DSS, HIPAA) often require re-encryption.

### Termination at LB (Offload)

The LB handles the TLS handshake with the client. Traffic between the LB and backend is unencrypted (or travels over a trusted internal network).

**Advantages:** Backends are simpler - no TLS config needed. LB can inspect HTTP content (required for L7 routing, sticky sessions). TLS termination is hardware-accelerated on dedicated LBs.

**Disadvantages:** LB → backend traffic is unencrypted. Acceptable in a trusted VPC; unacceptable in zero-trust or regulated environments.

### SSL Passthrough

The LB forwards the encrypted TCP stream directly to the backend without decrypting it. The backend handles TLS.

**Advantages:** End-to-end encryption. LB doesn't need access to certificates.

**Disadvantages:** LB operates at L4 only - cannot inspect HTTP content, implement cookie-based stickiness, or route based on URL or headers.

### Re-encryption (LB to Backend TLS)

The LB terminates TLS from the client (to inspect and route), then opens a _new_ TLS connection to the backend.

**Advantages:** Full L7 inspection capability + end-to-end encryption.

**Disadvantages:** Two TLS handshakes per request. Certificate management at both LB and backend. Performance cost.

**Use case:** PCI-DSS, HIPAA, or other regulated environments where data must be encrypted in transit even on internal networks.

### Certificate Management & Rotation at Scale

At scale, certificates must be rotated without downtime:

- Use ACME protocol (Let's Encrypt) for automated renewal.
- Store certificates in a secrets manager (Vault, AWS Secrets Manager).
- LBs must support hot certificate reload without dropping connections.
- SNI (Server Name Indication) enables one LB to serve multiple domains with separate certificates on a single IP.

### Mutual TLS (mTLS)

In standard TLS, only the server presents a certificate - the client is anonymous. In mTLS, **both** parties present certificates. The LB validates the client's certificate before forwarding the request, and the client validates the LB's. Identity is proven at the network layer, not the application layer.

**Why it matters at the LB:** In a zero-trust architecture, the LB enforces mTLS for all inter-service communication. A service without a valid certificate cannot connect - regardless of whether it's inside the VPC. This replaces perimeter security ("trusted because it's internal") with identity-based security ("trusted because it proved who it is").

**Common deployments:**

- **Service mesh (Istio, Linkerd):** mTLS is automatic between all sidecars. The LB (ingress gateway) terminates external TLS, then initiates mTLS to backends using SPIFFE-issued short-lived certificates.
- **B2B API gateway:** validates partner client certificates before routing their requests.
- **Zero-trust internal networks:** replaces VPN-based access with per-connection identity verification.

**Certificate management burden:** Every client needs a cert, and rotation must be coordinated across all services. Service meshes solve this with automatically-rotated short-lived certificates (typically 24-hour TTL), so a compromised cert is self-healing.

> 🎯 **Interview Lens** > **Q:** How do you secure service-to-service communication in a microservices architecture?
> **Ideal answer:** mTLS at the service mesh layer. Each service has a short-lived SPIFFE identity. The sidecar proxy enforces that the caller is authenticated before forwarding. This is identity-based trust at every hop, not perimeter-based trust.
> **Common trap:** "Use a private network / VPC." This is perimeter security - once inside, any service can call any other. mTLS prevents lateral movement even from a compromised internal service.
> **Next question:** "mTLS adds certificate management overhead - is it worth it for all services?" → Not always. Low-risk internal read-only services (metrics, config) may not justify the overhead. Apply mTLS proportionally: enforce it on data-plane services, auth services, and anything handling PII. Use a service mesh to automate the cert lifecycle so the overhead is minimal.

**Key Takeaway:** Terminate at LB for simplicity; re-encrypt when compliance demands E2E; passthrough loses all L7 capability. mTLS shifts trust from network perimeter to per-connection identity - essential in zero-trust architectures, where VPC membership proves nothing.

---

## High Availability & Resilience

**Interviewer TL;DR:** An LB without HA is itself a SPOF - always deploy in an HA pair with a floating VIP; active-active is preferred but requires stateless LBs.

**Mental model:** The load balancer eliminates the backend as a SPOF, but the LB itself is a SPOF unless made HA. Every LB deployment needs an HA strategy.

### Active-Active vs Active-Passive LB Pairs

**Active-Passive:** One LB handles all traffic (primary), the other is on standby. Failover is triggered when the primary fails. Simple but wastes capacity and has a failover window during which new connections fail.

**Active-Active:** Both LBs handle traffic simultaneously, typically via DNS round robin or Anycast. Better utilization. One LB going down reduces capacity rather than causing a full outage.

**Trade-off:** Active-active requires stateless LBs (or synchronized state), which complicates sticky sessions and connection tracking.

> 🎯 **Interview Lens** > **Q:** How do you make a load balancer itself highly available?
> **Ideal answer:** Deploy two LBs sharing a floating VIP. Use Active-Passive for simplicity (VRRP on-prem, Elastic IP reassignment on AWS) or Active-Active for better utilization. DNS points to the VIP - clients are unaware of the failover.
> **Common trap:** Candidates design HA for backends but leave a single LB in front. Always ask: "what fails if this component goes down?"
> **Next question:** "In active-active, both LBs are handling traffic - how do you ensure a client with sticky sessions always hits the same LB?" → You either synchronize session state between LBs (complex), or use a consistent hashing strategy at the DNS/Anycast layer so the same client always routes to the same LB. Alternatively, move to stateless backends and eliminate sticky sessions entirely.

### Floating IPs & VRRP

A **floating IP** (Virtual IP / VIP) is an IP address that can be reassigned between nodes. In Active-Passive HA:

1. Both LBs share a VIP. DNS points to the VIP.
2. Primary "owns" the VIP (responds to ARP for that IP).
3. On primary failure, secondary claims the VIP using VRRP (Virtual Router Redundancy Protocol - a standard that lets two nodes share a virtual IP, with the standby taking ownership automatically when the primary stops responding).

VRRP broadcasts heartbeats. If the primary misses N consecutive heartbeats, the secondary takes over. Failover is typically sub-second once detection completes.

**Cloud-native equivalent:** VRRP is an on-prem/bare-metal pattern - cloud providers don't expose L2 networking needed for gratuitous ARP. In AWS, HA is achieved by remapping an Elastic IP to the standby instance via API call on failure detection. In GCP, regional forwarding rules are reassigned. The mechanism differs but the concept is identical: one VIP, two nodes, automatic ownership transfer. Managed LBs (AWS ALB, GCP LB) handle HA internally - you never configure VRRP for them.

### Split-Brain Prevention

**Split-brain:** Both LBs simultaneously believe they are the primary and both claim the VIP. Causes duplicate responses, routing inconsistencies, and state corruption.

Prevention strategies:

- VRRP priority + preemption settings (only one node has higher priority)
- External quorum (a 3rd node breaks ties)
- Network fencing (STONITH - Shoot The Other Node In The Head): the losing node forcibly powers itself off, guaranteeing only one node can own the VIP at a time

### Cascading Failure Under Backend Loss

When multiple backends fail simultaneously, remaining backends absorb all traffic. If they're near capacity, they too start failing - a cascade.

Mitigations:

- Circuit breaker at LB: stop sending traffic to backends returning 5xx above a threshold
- Load shedding: return 503 to some clients rather than overloading backends
- Capacity planning: maintain N+2 backend capacity (tolerate losing 2 nodes without cascade)

**Key Takeaway:** The LB eliminates backends as a SPOF but becomes one itself - always deploy HA pairs with a floating VIP. Prefer active-active but only if the LB can be stateless; split-brain is worse than a brief failover gap.

---

## Performance & Optimization

**Interviewer TL;DR:** Connection pooling and request buffering are table stakes; SNAT port exhaustion is the non-obvious production gotcha that trips up most candidates.

**Mental model:** At high scale, the LB itself becomes a bottleneck. These are the knobs that matter.

### Connection Pooling & Keep-Alive Management

**Problem:** Opening a new TCP connection to a backend for every request is expensive - the 3-way handshake plus TLS handshake adds multiple round trips of latency.

**Solution:** The LB maintains a pool of persistent connections to each backend. Incoming requests are multiplexed over these pooled connections. The number of backend connections becomes far smaller than the number of client requests.

Tuning: pool size per backend, idle timeout, max connection age.

### Request Buffering & Slow Client Protection

**Slow client problem:** A client uploading a large file at 1KB/s ties up a backend connection for the entire upload duration.

**Solution:** The LB buffers the full request body before forwarding to the backend. The backend connection is held only for the fast LB → backend transfer, not the slow client → LB transfer.

**Trade-off:** Increases LB memory usage. Must set max buffer size to prevent memory exhaustion from clients sending large payloads slowly - a potential DoS vector.

### Protocol Negotiation & Multiplexing (HTTP/2, gRPC)

An L7 LB negotiates HTTP/2 with clients via ALPN (Application-Layer Protocol Negotiation - a TLS extension that lets client and server agree on the application protocol, e.g., HTTP/2 vs HTTP/1.1, during the handshake itself) in the TLS handshake, while maintaining independent HTTP/1.1 or HTTP/2 connections to backends.

**gRPC specifically:** Each gRPC call is a separate HTTP/2 stream on a multiplexed connection. An L4 LB sees one long-lived TCP connection and routes it entirely to one backend - load balancing is effectively broken for gRPC. You need an L7 LB that understands HTTP/2 stream-level routing.

```
# Wrong: L4 LB with gRPC
Client ──TCP──▶ L4 LB ──TCP (one connection)──▶ Backend-1 (all calls land here)

# Right: L7 LB with gRPC
Client ──HTTP/2──▶ L7 LB ──per-stream routing──▶ Backend-1, Backend-2, Backend-3
```

### Bandwidth & Connection Limits Per Backend

Set per-backend limits to prevent one backend from being overwhelmed:

- Max concurrent connections
- Max request rate
- Max bandwidth

When a backend hits its limit, the LB queues or rejects new requests to that backend and routes elsewhere.

### SNAT Port Exhaustion & Connection Tracking Limits

**SNAT (Source NAT):** When an L4 LB forwards a packet to a backend, it rewrites the source IP to its own IP so the backend returns traffic through the LB. The LB uses a unique source port per connection to track which return packets belong to which client.

**Port exhaustion:** A single IP has 65,535 ports. With thousands of connections per second to a single backend, the LB can exhaust available source ports, causing new connections to fail silently.

**Connection tracking (conntrack):** The Linux kernel maintains a conntrack table - a record of every active network connection passing through the system - to enable stateful packet forwarding. This table has a max size. Hitting it causes packet drops - symptoms look like the LB and backends are healthy but new connections randomly fail.

**Retry storm amplification:** When new connections fail due to port exhaustion, clients retry - generating more connection attempts, exhausting ports faster, causing more failures, causing more retries. This positive feedback loop can accelerate a partial outage into a complete one within seconds. Clients with aggressive retry logic (no backoff, no jitter) are the biggest amplifiers. Ensure client retry policies use exponential backoff with jitter, and implement connection-level rate limiting at the LB to shed load before exhaustion is reached.

**Fixes:**

- DSR (Direct Server Return): backends respond directly to clients, bypassing the LB on the return path - eliminates SNAT entirely
- Multiple LB IPs (each has its own 65K port range)
- Tune `net.ipv4.ip_local_port_range` and `nf_conntrack_max`

### Backpressure & Load Shedding

**The problem:** All backends are at capacity simultaneously - connection pools full, CPU pegged. The LB has nowhere to route new requests. Without a deliberate strategy, it either queues indefinitely (memory exhaustion) or drops connections silently (worse than an explicit error).

**Backpressure:** Signal upstream that the system is at capacity, so the caller can slow down. At the LB level this means: stop accepting new connections from clients, or return explicit 503s, rather than queuing indefinitely.

**Load shedding:** Actively discard a portion of incoming traffic to protect the system from total collapse. The key insight: serving 70% of requests correctly is better than serving 100% of requests slowly and failing.

**Strategies at the LB layer:**

- **Queue with depth limit:** Accept requests into a queue up to a maximum depth. When the queue is full, return 503 immediately. Protects memory; gives clients a fast, actionable error.
- **Timeout-based shedding:** If a request has been queued longer than X ms without being dispatched, drop it. A client that has already timed out doesn't benefit from a late response.
- **Priority shedding:** Under load, drop lower-priority traffic first (e.g., health check polling, batch jobs) while preserving capacity for user-facing requests.

> ⚖️ **Decision Framework**
> The order of preference under overload: (1) reject early with 503 - fast, cheap, client can retry. (2) Queue briefly - only if the overload is transient (spike, not sustained). (3) Never queue indefinitely - this converts a traffic spike into a memory exhaustion crash.

> 🧠 **Thought Process**
> When an interviewer asks "what happens when your system gets 10x the expected traffic?", the answer they want is: the LB detects backend saturation, sheds excess load gracefully with 503s, and the system degrades proportionally rather than collapsing entirely. Cascading failure is what you're designing against.

### Rate Limiting at the LB Layer

The LB sits at the entry point of your system - making it the ideal enforcement point for rate limiting _before_ requests consume backend resources.

**What the LB can rate limit:**

- Per source IP: limits requests from a single client
- Per user/API key: requires L7 inspection of auth headers
- Per endpoint: `/search` gets stricter limits than `/profile`
- Global: total RPS cap across all clients combined

**Its role in the overall flow:**

```
Client → [LB: rate check] → Backend
              ↓
         429 Too Many Requests (rejected at edge, backend never touched)
```

Rate limiting at the LB is a first line of defence - it stops abuse and traffic spikes before they consume backend CPU, DB connections, or application memory.

**What it doesn't replace:** Fine-grained per-user business logic rate limiting (e.g., "10 API calls per user per minute with token bucket") is better handled in a dedicated rate limiter service or API gateway, which can share state across LB instances. The LB's rate limiting is coarse-grained and stateless-friendly.

🔗 Deep-Dive: [Rate Limiter](../components/rate-limiter.md) - Token bucket, leaky bucket, sliding window algorithms, distributed rate limiting, and Redis-based shared state.

> 🎯 **Interview Lens** > **Q:** Where in your architecture would you implement rate limiting?
> **Ideal answer:** Two layers - coarse-grained at the LB (per-IP connection limits, global RPS cap) as a fast cheap filter; fine-grained in a dedicated rate limiter service (per-user token bucket with shared Redis state) for business-logic limits. The LB layer stops obvious abuse; the dedicated layer handles nuanced per-user policies.
> **Next question:** "Your rate limiter is a single Redis instance - what happens if it goes down?" → Rate limiting fails open (allow all traffic) rather than fail closed (block all traffic). Availability of the application is more important than perfect rate limiting. Alert on Redis unavailability and restore quickly.

> 🎯 **Interview Lens** > **Q:** Why might a load balancer fail to forward connections even with healthy backends?
> **Ideal answer:** SNAT port exhaustion or conntrack table overflow. Symptoms: LB and backends report healthy, but new connections fail. Debug with `ss -s` for TIME_WAIT counts and `nf_conntrack_count` vs `nf_conntrack_max`.
> **Follow-up:** "How would you fix it in production right now?" → Short-term: tune port range and conntrack max. Long-term: DSR mode or spread connections across multiple LB IPs.
> **Next question:** "If you use DSR, the backend responds directly to the client - but the backend's source IP is its own, not the VIP. Won't the client reject the response?" → Good catch. In DSR, the backend must have the VIP configured as a loopback alias (e.g., `lo:0`) so it accepts packets addressed to the VIP, but it responds using its own IP as source - which the client accepts because it tracks the TCP connection by port tuple, not source IP.

**Key Takeaway:** SNAT port exhaustion and conntrack limits are the non-obvious production gotchas - backends and LB both appear healthy but new connections silently fail. Connection pooling and backpressure are table stakes; never queue indefinitely under overload.

---

## Advanced Patterns

**Interviewer TL;DR:** GSLB/Anycast solve multi-region routing; canary routing and traffic mirroring are how you deploy safely at scale without downtime.

**Mental model:** Beyond basic distribution, load balancers can be the control plane for sophisticated traffic management - gradual rollouts, observability injection, and multi-region routing.

### Global Server Load Balancing (GSLB) & Anycast

**GSLB:** Routes clients to the nearest or healthiest datacenter. Operates at the DNS level - responds with different IPs based on client geography and datacenter health. Failover is TTL-bound - but the reality is worse than the TTL suggests. OS resolvers, JVM's `InetAddress` (caches indefinitely by default unless `-Dnetworkaddress.cache.ttl` is set), browsers, and intermediate resolvers all cache DNS independently and may ignore your TTL entirely. In practice, after a GSLB failover, expect a long tail of clients (10–20 minutes or more) still hitting the old IP despite a 30-second TTL.

**Anycast:** Multiple datacenters advertise the same IP prefix via BGP (Border Gateway Protocol - the protocol internet routers use to exchange routing information and decide the best path to any destination IP). The routing infrastructure automatically directs clients to the "closest" datacenter by BGP path cost. Used by CDNs and DNS providers (Cloudflare, AWS Route 53) for global distribution. Failover is faster than DNS (BGP re-convergence, seconds) but requires BGP infrastructure.

> ⚖️ **Decision Framework**
> GSLB via DNS: simpler, works with any LB, but slow failover bounded by TTL. Anycast: fast failover, globally consistent, but requires BGP peering and more operational complexity. For most applications, DNS-based GSLB with low TTLs is sufficient.

### Canary Routing & Traffic Splitting

Route a percentage of traffic to a new version of a service while the rest goes to the stable version:

```
Stage 1:  100% → v1
Stage 2:    5% → v2,  95% → v1   (canary validation)
Stage 3:   50% → v2,  50% → v1   (progressive rollout)
Stage 4:  100% → v2              (complete cutover)
```

Implemented via weighted backend pools. The LB shifts weights based on operator input or automated signals (error rate below threshold → increase v2 weight automatically).

> 🎯 **Interview Lens** > **Q:** How would you roll out a risky backend change to production safely?
> **Ideal answer:** Canary deploy - route 1-5% of traffic to the new version, monitor error rate and latency, and automate the ramp-up if metrics stay within SLO. The LB is the control plane; the metrics pipeline is the safety gate.
> **Common trap:** Candidates say "deploy to staging and test." Staging traffic is synthetic - it doesn't catch issues that only appear under real user behaviour (specific query patterns, edge case data, geographic latency).
> **Next question:** "How do you ensure the canary gets a representative sample of traffic, not just a random 5%?" → Use consistent hashing on user ID to route the same users consistently to v2. This prevents a user from seeing different behaviour on each request and makes the canary results more representative.

### Traffic Mirroring (Shadow Mode)

The LB duplicates live production traffic and sends a copy to a shadow backend. The shadow backend's responses are discarded - no client impact. Used to:

- Test a new backend version with real traffic without serving those responses
- Benchmark new infrastructure under real load
- Validate correctness of a rewritten service before cutover

### Service Mesh Integration (Sidecar Proxy vs Centralized LB)

**Service mesh (Istio, Linkerd):** Each service gets a sidecar proxy (Envoy) injected. All inter-service traffic flows through sidecar → sidecar. Load balancing, retries, circuit breaking, and mTLS happen at the sidecar level - no centralized LB needed for east-west traffic.

**Trade-off:**

- Sidecar mesh: more resilient (no central bottleneck), more complex to operate, higher per-pod resource overhead
- Centralized LB: simpler, single point of control, single point of failure (mitigated by HA)

For north-south traffic (internet → cluster), a centralized LB is still required. The mesh handles east-west.

### Blue-Green Deployment

Blue-green is architecturally distinct from canary. Where canary is a gradual ramp, blue-green is an **atomic, all-or-nothing cutover**.

**Mechanism:**

- Two identical production environments exist simultaneously: Blue (current live) and Green (new version).
- Green is deployed and fully tested in isolation while Blue serves 100% of production traffic.
- Cutover: the LB flips all traffic from Blue to Green in a single weight change (`Blue: 0%, Green: 100%`).
- If Green fails, rollback is instant - flip the weights back.

```
Before cutover:   100% → Blue (v1),   0% → Green (v2)
After cutover:      0% → Blue (v1), 100% → Green (v2)
Rollback:         100% → Blue (v1),   0% → Green (v2)  ← instant
```

**Vs Canary:**
| | Canary | Blue-Green |
|---|---|---|
| Rollout | Gradual (1% → 5% → 50% → 100%) | Atomic (0% → 100%) |
| Risk exposure | Partial - only canary users affected | All users at cutover moment |
| Rollback speed | Slow (ramp weights back down) | Instant (flip weights) |
| Infrastructure cost | Low (shared pool) | High (2x full environments) |
| Best for | Risky changes, need validation | DB schema migrations, config changes that can't be partial |

**When to prefer blue-green:** When the change cannot be partially deployed - for example, a database schema migration where v1 code and v2 code cannot coexist against the same schema.

**Key Takeaway:** Canary for gradual validation, blue-green for atomic cutover when partial deployment is unsafe. DNS-based GSLB is simpler than Anycast but DNS caching means failover is always slower than your TTL suggests.

---

## Observability & Debugging

**Interviewer TL;DR:** Track request counts per backend, not just connections - and treat LB access logs as the ground truth when routing behavior looks wrong.

**Mental model:** You can't debug what you can't measure. These are the signals that tell you your LB is healthy, stressed, or misconfigured.

### Key Metrics

| Metric                              | What It Tells You               | Alert Signal                                     |
| ----------------------------------- | ------------------------------- | ------------------------------------------------ |
| Active connections                  | Current load on LB and backends | Sudden spike → traffic surge or drain stuck      |
| Requests per second                 | Throughput                      | Deviation from baseline → upstream anomaly       |
| Error rate (4xx/5xx)                | Backend health                  | >1% 5xx → backend degradation                    |
| P95/P99 latency                     | Tail latency                    | >2x baseline → backend overload or queue buildup |
| Backend connection pool utilization | Pool exhaustion risk            | >80% → increase pool size                        |
| Health check failure rate           | Backend stability               | Any failures → investigate backend               |

### Backend Weight & Connection Distribution Imbalance

Symptom: one backend has 3x the connections of others despite equal weight.

Causes:

- Sticky sessions routing too many clients to one backend
- Least-connections algorithm working correctly (that backend handles fast requests, cycling connections quickly)
- Health check flapping causing others to briefly leave the pool
- Long-lived connections (WebSockets) skewing connection counts without proportional request load

Debugging: compare _request counts_ across backends, not just connection counts. A backend with many connections but low RPS is holding long-lived connections - not necessarily overloaded.

### Connection Drain Monitoring

During deploys, watch for:

- In-flight requests completing before drain timeout (healthy)
- Requests being dropped (drain timeout too short)
- Deploys stalling indefinitely (drain timeout too long, long-lived connections not closing)

Instrument: track "connections remaining after drain initiated" over time per backend.

### Trace Context Propagation

The LB sits at the boundary between the outside world and your services - making it the ideal place to inject or forward distributed trace context.

- **Inject if absent:** If an incoming request has no trace header, the LB should generate and attach one (e.g., `X-Request-ID`, W3C `traceparent`). This ensures every request has a correlation ID from the moment it enters the system.
- **Forward if present:** If the client already sends a `traceparent` header (from a browser SDK or upstream service), the LB must forward it unchanged - not overwrite it.
- **Standard formats:** Prefer W3C Trace Context (`traceparent: 00-<trace-id>-<span-id>-<flags>`) for interoperability. Avoid inventing custom header names that won't be understood by tracing backends (Jaeger, Zipkin, Datadog).
- **Why this matters for debugging:** Without trace context at the LB layer, you lose the ability to correlate an LB access log entry with a backend trace span - the two become unlinked islands of observability.

### Access Log Patterns for Debugging

LB access logs are the ground truth. Key fields:

- `upstream_response_time` vs `request_time` - large gap means slow client (upload) or queued connection
- `upstream_addr` - which backend served each request (detect routing skew)
- `upstream_status` - backend-side errors vs client-side 4xx
- `traceparent` / `x-request-id` - correlation ID to join LB logs with backend traces

**Key Takeaway:** Track request counts per backend, not just connections; inject trace context at the LB boundary so access logs and backend traces can be correlated; treat access logs as ground truth when routing behavior looks wrong.

---

## Production Failure Modes

**Interviewer TL;DR:** Five failure modes that cause real outages - thundering herd, hot spots from bad hash keys, drain timeouts on long-lived connections, SSL CPU saturation, and VIP handoff gaps.

**Mental model:** These are the scenarios that cause real outages. Know the cause, detection signal, and fix for each.

### Thundering Herd on Backend Restart

**Scenario:** All backends restart simultaneously (bad deploy). When they come back, the LB immediately sends full traffic. Backends are cold (empty caches, unwarmed JVM) and immediately get overwhelmed, causing health check failures, removal from pool, and another restart cycle.

**Detection:** Saw-tooth error rate and latency pattern correlated with deploy events.

**Fix:** [Slow-start](#44-slow-start--warmup-after-backend-recovery). Rolling deploys (restart one backend at a time). Deployment health gates (don't proceed to next instance until current one passes health checks).

> **⚠️ Common Traps & How to Recover**
>
> - **Trap:** Setting `rise 1` (one success before marking healthy) - backend gets full traffic before caches are warm. **Recovery:** Use `rise 2` or higher; add slow-start ramp.
> - **Trap:** Deploying all backends simultaneously because "it's faster." **Recovery:** Always enforce rolling deploys via deploy tooling, not discipline.
> - **Trap:** Health check passes (process is up) but service is still initializing. **Recovery:** Health endpoint must validate readiness (DB connection pool initialized, caches loaded), not just liveness.

### Hot Spots from Poor Hash Key Selection

**Scenario:** IP hashing with clients behind corporate NAT. Thousands of users share one public IP → all routed to one backend → that backend is overwhelmed while others are idle.

**Detection:** Severe backend connection imbalance. One backend at 100% CPU, others near-idle.

**Fix:** Switch to cookie-based stickiness or consistent hashing with a better key (session ID, user ID instead of IP).

> **⚠️ Common Traps & How to Recover**
>
> - **Trap:** Only monitoring connection counts per backend - one backend looks "normal" in connections but is CPU-maxed. **Recovery:** Add per-backend RPS and CPU metrics to your dashboard.
> - **Trap:** Assuming IP diversity is high because your users are geographically spread. **Recovery:** Check actual unique source IPs in LB access logs - corporate NAT collapses thousands of users to one IP.
> - **Trap:** Switching hash keys mid-traffic without a migration plan. **Recovery:** Gradually shift to cookie-based stickiness first; remap sessions during low-traffic window.

### Long-Lived Connection Drain Timeouts (WebSockets, SSE)

**Scenario:** Deploy triggers connection drain. WebSocket connections don't close voluntarily. Drain timeout (30s) expires and the LB forcibly closes them. Clients receive unexpected disconnects mid-session.

**Detection:** Client-side WebSocket disconnect errors correlated with deploy timestamps.

**Fix:** Implement application-level graceful shutdown - send WebSocket close frames to clients before forcible drain. Increase drain timeout to accommodate typical session length. Use a reconnection protocol with session resumption on the client side.

> **⚠️ Common Traps & How to Recover**
>
> - **Trap:** Setting drain timeout to 30s for a system with WebSocket sessions that last 10+ minutes. **Recovery:** Measure actual P99 session duration; set drain timeout accordingly, or implement app-level close signals.
> - **Trap:** Treating all connection types the same in drain logic - HTTP and WebSocket need different handling. **Recovery:** Use protocol-aware drain: HTTP waits for in-flight request, WebSocket needs an explicit close frame.
> - **Trap:** Clients not implementing reconnection logic, assuming the connection is always stable. **Recovery:** Client-side exponential backoff + reconnect is non-negotiable for any long-lived connection system.

### SSL Handshake CPU Saturation at Scale

**Scenario:** Traffic spike causes a surge in new TLS connections. TLS handshakes are CPU-intensive (RSA key exchange especially). LB CPU saturates → handshakes queue → connection timeouts → clients retry → more handshakes → death spiral.

**Detection:** LB CPU at 100% correlating with new connection rate spike. TLS handshake latency P99 climbing.

**Fix:** TLS session resumption (clients reuse session tickets → no full handshake). ECDHE cipher suites (faster than RSA). Prefer TLS 1.3 (fewer round trips). Hardware TLS acceleration. Scale out LB instances horizontally.

**TLS 1.3 0-RTT (Early Data):** TLS 1.3 introduces 0-RTT resumption - a returning client can send application data in the very first packet, with zero additional round trips. This is the maximum CPU saving on resumption. However, 0-RTT data is **replayable** - an attacker who captures the first packet can replay it to trigger the same server action again. This makes 0-RTT unsafe for any non-idempotent request (POST, payment submissions, state-changing API calls). Only enable 0-RTT for genuinely idempotent, replay-safe endpoints (e.g., GET requests for public content). Most LBs allow 0-RTT to be configured per-route.

> **⚠️ Common Traps & How to Recover**
>
> - **Trap:** Scaling out backend servers when LB CPU is the bottleneck - adds capacity where it isn't needed. **Recovery:** Check LB CPU first; scale LB instances before touching backends.
> - **Trap:** Not enabling TLS session resumption - leaving the biggest CPU win on the table. **Recovery:** Enable session tickets in LB config; verify with `openssl s_client -reconnect` that resumption is working.
> - **Trap:** Using RSA 4096 for "extra security" - 4x the CPU cost of RSA 2048 with negligible security gain. **Recovery:** Switch to ECDHE (P-256) which is faster and more secure than RSA 2048.

### HA Failover Timing Gaps & VIP Handoff Delays

**Scenario:** Primary LB fails. VRRP detects failure and secondary claims the VIP. During the detection + handoff window (typically 1-3 seconds), all new connections fail.

**Contributing factors:**

- VRRP heartbeat interval (default 1s) × failure threshold (default 3 missed = 3s detection time)
- ARP cache on upstream router takes time to update after VIP moves to secondary
- Conntrack state not synchronized between primary and secondary → in-flight connections drop at failover

**Fixes:**

- Tune VRRP to sub-second heartbeats (at the cost of more false positives on transient network blips)
- Send gratuitous ARP (an unsolicited broadcast that tells all network devices "this MAC address now owns this IP" - forces immediate ARP cache refresh across the network) immediately on VIP takeover
- Use conntrackd (a daemon that synchronizes the conntrack table between two nodes in real time) for state sync between LB nodes to preserve in-flight connections
- Design clients to retry on connection failure (most HTTP clients do this automatically)

> **⚠️ Common Traps & How to Recover**
>
> - **Trap:** Assuming "sub-second VRRP" means zero downtime - forgetting that the upstream router's ARP cache still points to the old LB MAC. **Recovery:** Always send a gratuitous ARP on VIP takeover; verify with `arping` from the router.
> - **Trap:** Only testing failover in staging - ARP cache TTLs and network topology differ from production. **Recovery:** Run regular failover drills in production during low-traffic windows.
> - **Trap:** Not synchronizing conntrack state - in-flight TCP connections drop on failover even though the VIP moves cleanly. **Recovery:** Deploy conntrackd for state sync, or design clients to retry on RST (most do).

**Key Takeaway:** Each failure mode has a distinct detection signal - thundering herd (saw-tooth errors at deploy), hot spots (severe backend imbalance), drain gaps (WebSocket disconnects at deploy), SSL CPU saturation (handshake latency spike), VIP handoff (connection failures at failover). Knowing the signal is half the fix.

---

## Common Interview Gotchas

Statements that sound reasonable but are wrong - or right in one context and dangerously wrong in another.

**"Sticky sessions are always an anti-pattern"**
Wrong. For HTTP sessions backed by local server state, yes - externalize the state. But for WebSocket and SSE connections, stickiness is _architecturally required_ - the connection itself is the session, and no amount of externalizing state fixes a broken TCP connection. Saying "sticky sessions are always wrong" in an interview fails the WebSocket case.

**"L7 is always better than L4"**
Wrong. L7 adds two TCP handshakes, TLS parsing overhead, and application-layer processing per request. For raw TCP workloads (financial market data, game servers, database proxies), L4 is faster and correct. L7 is better only when you need what it provides: content-based routing, SSL offload, sticky sessions.

**"Low DNS TTL means fast failover"**
Wrong. Clients - browsers, JVMs (`InetAddress` caches indefinitely by default), OS resolvers, intermediate DNS caches - ignore TTL independently. After a DNS-based GSLB failover, expect a long tail of clients hitting the old IP for 10–20 minutes regardless of a 30-second TTL.

**"Health check passes = backend is healthy"**
Wrong. A 200 from `/health` only means the process is alive. If the health check is shallow (liveness only), the backend may be unable to reach its DB or cache and returning errors on every real request. A deep health check that queries dependencies introduces a worse failure mode: a slow DB causes all backends to fail health checks simultaneously, taking down the whole fleet.

**"Adding more backends will fix the performance problem"**
Not if the LB is the bottleneck. At high scale, the LB itself saturates - SNAT port exhaustion, conntrack table limits, SSL handshake CPU, connection pool exhaustion. Adding backends doesn't help if traffic can't reach them. Profile the LB before scaling backends.

**"Active-Active HA means zero downtime"**
Not quite. Even in active-active, individual connection state (conntrack entries, in-flight requests) is not automatically synchronized between LB nodes. When one node goes down, in-flight connections to that node drop. Clients must retry. Zero-downtime requires conntrack sync (conntrackd) or stateless protocol design with client-side retry.

**"mTLS is only for external traffic"**
Wrong. The whole point of mTLS in a zero-trust architecture is east-west (service-to-service) traffic. Attackers who breach the perimeter and gain internal network access are stopped by mTLS because they can't forge a valid service certificate. Using mTLS only on external traffic leaves internal lateral movement unrestricted.

---

## Post-mortem Reading List

Real outages that map directly to the failure modes above. Read these to understand how they manifest in production at scale - and how teams recovered.

- Facebook 2015: Thundering Herd & Page Cache - Cold-cache cascades after fleet restarts overwhelm backends recovering from a simultaneous restart.
- Discord 2020: Cascading Failures in Distributed Systems - A hot shard from a bad partition key overwhelmed one node while others sat idle, triggering a cascade.
- GitHub 2018: [October 21 Post-Incident Analysis](https://github.blog/2018-10-30-oct21-post-incident-analysis/) - A 43-second network partition triggered failover; drain timeouts for long-lived connections extended the outage to 24 hours.
- Cloudflare 2019: [Details of the July 2 Outage](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/) - A misconfigured WAF rule saturated CPU on every HTTP-handling core globally, causing a full traffic drop.
- GitHub 2012: MySQL Split-Brain - Network partition caused dual-primary state; VIP handoff gaps let writes land on both nodes simultaneously.

**General postmortem repositories:**

- [danluu/post-mortems](https://github.com/danluu/post-mortems) - Curated public postmortems across major companies, organized by failure type.
- [Google SRE Book - Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) - Google SRE chapter on postmortem structure and blameless analysis.

---

## Interview Scenario & Debugging Bank

🔗 Deep-Dive: [load-balancer-interview-scenarios.md](./load-balancer-interview-scenarios.md) - Full scenario bank: whiteboard walkthroughs, debugging exercises, scaling curveballs, and follow-up question trees.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Expansion                              |
| ------- | -------------------------------------- |
| GSLB    | Global Server Load Balancing           |
| VRRP    | Virtual Router Redundancy Protocol     |
| VIP     | Virtual IP                             |
| DSR     | Direct Server Return                   |
| SNI     | Server Name Indication                 |
| SNAT    | Source Network Address Translation     |
| ALPN    | Application-Layer Protocol Negotiation |
| ECMP    | Equal-Cost Multi-Path Routing          |
| STONITH | Shoot The Other Node In The Head       |

### Algorithm Selection Decision Matrix

| Condition                                    | Recommended Algorithm                              |
| -------------------------------------------- | -------------------------------------------------- |
| Homogeneous backends, uniform request cost   | Round Robin                                        |
| Variable request processing time             | Least Connections                                  |
| Backend affinity needed, stable pool         | Consistent Hashing                                 |
| Backend affinity needed, clients behind NAT  | Cookie-based stickiness                            |
| Heterogeneous backend capacity               | Weighted Round Robin or Weighted Least Connections |
| Need real-time backend performance awareness | Least Response Time or Resource-Based              |

### Anti-Patterns

- **Sticky sessions as a crutch:** Masking stateful backends instead of externalizing session state. Creates uneven load and fragile failover.
- **L7 for raw TCP:** Using an HTTP-parsing LB for non-HTTP TCP traffic (databases, game servers). Adds unnecessary overhead and breaks the protocol.
- **Ignoring connection drain:** Deploying without drain configuration causes in-flight request failures on every deploy.
- **Single LB without HA:** The LB itself becomes the SPOF it was meant to eliminate.
- **Health check endpoint doing too much:** A `/health` endpoint that queries the database causes health check failures to cascade into backend removal storms under DB load.

---

Linked Deep-Dive Files:

- load-balancer-consistent-hashing.md
- load-balancer-interview-scenarios.md
