# Caching

## Prerequisites

- **TCP/IP & Networking Fundamentals** — understand how data moves between processes; remote cache access adds a network round-trip on every miss.
- **[Consistent Hashing](../algorithms/consistent-hashing.md)** — distributed caches use consistent hashing for key-to-node routing; understanding virtual nodes and rebalancing impact is required before tackling distributed cache architecture.
- **[CAP Theorem](../algorithms/cap-theorem.md)** — cache consistency guarantees map directly to CAP trade-offs; distributed caches are typically AP systems with bounded staleness.
- **[Replication Strategies](../algorithms/replication-strategies.md)** — cache replication (read replicas, active-active) shares the same trade-offs as database replication; stale read windows and write conflict surfaces depend on the replication model chosen.

---

## Table of Contents

- [Quick Decision Guide](#quick-decision-guide)
- [Core Write & Read Strategies](#core-write--read-strategies)
- [Eviction & Expiry](#eviction--expiry)
- [Cache Invalidation](#cache-invalidation)
- [Distributed Cache Architecture](#distributed-cache-architecture)
- [Cache Failure Modes](#cache-failure-modes)
- [Consistency Guarantees](#consistency-guarantees)
- [Cache Hierarchy & Layering](#cache-hierarchy--layering)
- [Performance & Capacity Planning](#performance--capacity-planning)
- [Security & Hardening](#security--hardening)
- [Observability](#observability)
- [Production Issues & Debugging](#production-issues--debugging)
- [Common Interview Gotchas](#common-interview-gotchas)
- [Appendices](#appendices)

---

## TLDR

A cache is a faster, smaller storage layer that sits between a client and a slower authoritative data store — its purpose is to absorb repeated reads at a fraction of the latency and cost of hitting the origin. The fundamental design choice is not "should we cache?" but "where, what, and for how long" — and crucially, how staleness is bounded when the underlying data changes. Write strategy (cache-aside, write-through, write-behind) determines how cache and DB stay in sync; eviction policy (LRU, LFU, ARC) determines what survives memory pressure; and invalidation strategy determines how quickly stale data is expelled. At scale, the hard problems are not hit rate optimization but the failure modes that emerge under load: cache stampedes that hammer the origin on coordinated misses, avalanches when large TTL cohorts expire simultaneously, and penetration where non-existent keys bypass the cache entirely. Most production caches accept AP semantics — eventual consistency with bounded staleness — and design consumers to tolerate stale reads rather than pay the coordination cost of strong consistency.

---

## Quick Decision Guide

**Interviewer TL;DR:** Before choosing any cache design, answer four questions in order: should you cache at all, which layer, what write strategy, and what eviction policy. Skipping question one is the most common mistake.

**Mental model:** Caching is a bet — you trade memory and consistency complexity for latency and throughput. The bet only pays off if the data is read more than it changes and if the access pattern has enough locality for the cache to stay warm.

### When to Cache

- Read:write ratio is high (>10:1 is a common threshold, but the right number depends on origin cost)
- Origin read latency is significant — DB query, external API call, or expensive computation
- The same data is requested repeatedly by many clients (high temporal or frequency locality)
- The data can tolerate some staleness — bounded by your SLO, not just technical preference
- Traffic spikes need to be absorbed without scaling the origin proportionally

### When NOT to Cache

- Data changes on every write and freshness is a hard correctness requirement (financial ledger, inventory count with strict accuracy) — the invalidation overhead will exceed the read benefit
- Data is unique per request (highly personalized, real-time computed) — miss rate approaches 100% and the cache just adds latency on every call
- The origin is already fast and co-located — an in-memory DB or a co-located service adds ~0.3ms per cache hit with no meaningful saving on miss
- Write throughput dominates — cache invalidation fan-out and consistency overhead consumes more than the read savings
- Data volume is too large relative to cache capacity — thrashing (continuous eviction of data that is immediately needed again) destroys hit rate and adds overhead

> ⚖️ **Decision Framework**
> The quick test: "If I remove the cache, does anything break or just get slower?" If slower — quantify how much slower, and whether users or downstream systems care. Cache only when the latency saving justifies the consistency and operational complexity it introduces.

### Which Layer to Cache At

| Layer              | What Lives Here                                         | Access Latency | Consistency Risk                            |
| ------------------ | ------------------------------------------------------- | -------------- | ------------------------------------------- |
| Client / browser   | Static assets, user preferences                         | 0ms (local)    | Staleness until TTL or bust                 |
| CDN edge           | Publicly cacheable HTTP responses                       | 1–10ms         | TTL-controlled; purge for fast invalidation |
| In-process (L1)    | Hot config, reference data, per-request memoization     | <1µs           | Each process has its own copy               |
| Shared remote (L2) | Session state, computed aggregates, rate-limit counters | 0.2–1ms        | Shared source of truth across instances     |
| DB query cache     | Stable, expensive query results                         | Varies         | Invalidated on any relevant table write     |

### Which Write Strategy Fits the Workload

```
Is the application responsible for managing cache population?
  ├─ YES ──▶ Cache-Aside (default for most read-heavy workloads)
  │
  └─ NO (cache library handles population)
       └──▶ Read-Through

On write, must cache and DB stay in sync immediately?
  ├─ YES ──▶ Write-Through (consistent; write latency doubles)
  │
  └─ NO
       │
       ▼
     Can you tolerate data loss if the cache node fails before flushing?
       ├─ YES ──▶ Write-Behind (lower write latency; durability risk)
       └─ NO  ──▶ Write-Through or Cache-Aside with invalidation

Are access patterns predictable and hot keys known in advance?
  └─ YES ──▶ Consider Refresh-Ahead to avoid miss-on-expiry for those keys
```

**Key Takeaway:** Cache only when read:write ratio and access locality justify the consistency complexity. The layer and write strategy follow from access pattern and freshness requirements — not from what other teams are using.

---

## Core Write & Read Strategies

**Interviewer TL;DR:** Cache-aside is the default for most systems. Write-through and write-behind are optimizations for specific consistency or write-latency requirements. Know the race condition in cache-aside — it comes up in every caching interview.

**Mental model:** The write strategy defines the contract between the application, the cache, and the DB — specifically, who is responsible for keeping them in sync and what happens when they diverge.

### Cache-Aside (Lazy Population)

The application is the cache manager. On read: check cache → on hit, return; on miss, read from DB, populate cache, return. On write: write to DB, then invalidate (or update) the cache key.

```python
def get_user(user_id):
    cached = cache.get(f"user:{user_id}")
    if cached:
        return cached
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    cache.set(f"user:{user_id}", user, ttl=300)
    return user

def update_user(user_id, data):
    db.update("UPDATE users SET ... WHERE id = %s", user_id, data)
    cache.delete(f"user:{user_id}")  # invalidate, not update
```

**Advantages:** Simple; cache only holds data that was actually requested; DB is always the source of truth; cache failures degrade gracefully (miss → DB read).

**Disadvantages:** First request for any key always hits the DB (cold miss); the application must implement and maintain the caching logic.

#### Race Condition on Cold Miss + Concurrent Writers

Two concurrent requests both miss the cache for the same key. Both query the DB. Request A gets value V1 and is about to write it to cache. Meanwhile, a write updates the DB to V2 and invalidates the cache. Request A now writes V1 to the cache — stale data survives until next TTL expiry or explicit invalidation.

**Mitigation:** Use compare-and-swap (CAS) on the cache write — only write if the key is still absent. Or accept last-write-wins with a short TTL as the correction window (most production systems choose the latter).

### Read-Through

The cache library handles DB population on miss. The application only calls `cache.get(key)` — the cache fetches from DB if the key is absent. Simplifies application code but requires a cache library that supports pluggable loaders. Caffeine (Java) and some Redis client wrappers support this pattern.

### Write-Through

Every write goes to the cache and DB synchronously. The cache is always consistent with the DB (within the transaction boundary).

**Trade-off:** Write latency approximately doubles (cache write + DB write in sequence or parallel). Acceptable for read-heavy workloads where data freshness on read is more important than write throughput.

#### Latency Cost vs Consistency Benefit

If writes are rare and reads are frequent, write-through's latency cost is amortized across many cache hits. If writes are frequent (order creation, inventory updates), the doubled write latency accumulates and write-through becomes a bottleneck. Profile the write:read ratio before choosing write-through.

### Write-Behind (Write-Back)

Writes land in the cache immediately and are returned as successful. The DB write is queued and executed asynchronously. Write latency from the client's perspective is the cache write only (~0.3ms).

#### Durability Risk & Flush-on-Eviction Contract

If the cache node fails before the async DB flush, the write is permanently lost. Write-behind requires a durable, replicated flush queue (Kafka, Redis Streams with replication) — not just an in-memory buffer. Additionally, if a key is evicted from the cache before being flushed, the eviction must trigger an immediate synchronous DB write (flush-on-eviction). Without this, eviction silently discards writes.

### Refresh-Ahead

The cache proactively refreshes a key before its TTL expires, based on access frequency prediction. A background thread monitors access rates; when a hot key's TTL falls below a threshold, it schedules a preemptive DB read and cache update. The client never sees a miss for that key.

**Risk:** Background refresh generates DB load even for keys that won't be accessed again. Calibrate the refresh threshold to only activate for keys with access frequency above a minimum rate.

### Strategy Selection Matrix

| Strategy      | Cache Population      | Write Path        | Consistency            | Durability            | Best For                       |
| ------------- | --------------------- | ----------------- | ---------------------- | --------------------- | ------------------------------ |
| Cache-Aside   | Application on miss   | DB only           | Eventual (miss window) | Full (DB is truth)    | Default; read-heavy            |
| Read-Through  | Cache library on miss | DB only           | Eventual               | Full                  | Simpler app code               |
| Write-Through | On every write        | Cache + DB (sync) | Strong                 | Full                  | Fresh reads required           |
| Write-Behind  | On every write        | Cache (async DB)  | Eventual               | Risk (pre-flush loss) | Write-heavy, latency-sensitive |
| Refresh-Ahead | Background refresh    | DB only           | Near-fresh             | Full                  | Predictable hot keys           |

> 🎯 **Interview Lens** > **Q:** Walk me through the cache-aside pattern and what can go wrong.
> **Ideal answer:** Read: check cache → miss → DB read → cache populate → return. Write: DB write → cache invalidate. The race condition: concurrent misses both query DB; a write + invalidation interleaves; the slower reader overwrites cache with stale data. Mitigated with CAS or short TTL as correction window.
> **Common trap:** "Just update the cache on write instead of invalidating." This is write-through, not cache-aside, and requires both writes to succeed atomically — which isn't guaranteed without a transaction spanning both the DB and cache.
> **Next question:** "Why invalidate instead of update on write?" → Invalidation is safer: a failed cache update still leaves DB as source of truth. A stale cache update with a failed DB write creates a divergence that TTL must correct. Invalidation fails safe; update fails dangerous.

**Key Takeaway:** Cache-aside is the right default — it fails gracefully and keeps the DB authoritative. Write-through and write-behind are performance trade-offs with real consistency and durability costs; choose them only when profiling justifies it.

---

## Eviction & Expiry

**Interviewer TL;DR:** LRU is the default but fails on scan workloads. LFU is better for stable hot-key workloads but has new-entry starvation. Know ARC as the self-tuning answer and know when TTL alone is insufficient.

**Mental model:** When cache memory fills, the eviction policy decides which key to remove. The wrong policy evicts hot data while retaining cold data — destroying hit rate without reducing memory pressure.

### TTL vs Explicit Invalidation

TTL sets an upper bound on staleness: no matter what happens, the cached value expires after N seconds. Explicit invalidation responds to data changes immediately but requires the writer to enumerate all cache keys affected by the change.

In practice these are complementary, not alternatives: TTL is the safety net that prevents stale data from living forever if an invalidation is missed. Explicit invalidation is the fast path that keeps the cache fresh without waiting for TTL expiry. Use both: short TTL as the fallback, invalidation as the primary freshness mechanism.

### LRU (Least Recently Used)

#### Mechanics

Maintains a doubly-linked list of keys ordered by recency of access, backed by a hash map for O(1) lookup. On access, the key is promoted to the head of the list. On eviction, the tail (least recently accessed) is removed. Total: O(1) get, O(1) set, O(1) eviction.

#### Scan Resistance Problem

A sequential scan (full table read, a one-time bulk export, a cache warming job) accesses keys in order, promoting each to the LRU head and demoting all hot keys toward the tail. After the scan, all previously hot keys are eligible for eviction — the entire working set is destroyed by a single cold access pattern.

**Mitigation:** Segmented LRU (used by Redis) splits keys into a probationary segment and a protected segment. A key must be accessed multiple times to graduate from probationary to protected. Scan keys cycle through probationary and are evicted before they can displace protected (genuinely hot) keys.

### LFU (Least Frequently Used)

#### Frequency Decay

Tracks access count per key. Evicts the key with the lowest access frequency. Better than LRU for workloads where the same keys are hot regardless of recency. Without decay, a key that was hot six months ago but is now cold retains a high frequency count and resists eviction indefinitely. Redis's LFU implementation uses a Morris counter (logarithmic approximation of true frequency) with a configurable decay factor — frequency counts halve every N minutes of inactivity.

#### New-Entry Starvation

A brand-new key starts with frequency = 1 (minimum). Under LFU, it is immediately eligible for eviction — the most likely candidate for removal even if it will be accessed frequently in the next second. Redis mitigates this by initializing new keys with a frequency slightly above the minimum observed in the current key space. Still imperfect: a genuine one-time key and a soon-to-be-hot key look identical at insertion.

### ARC (Adaptive Replacement Cache)

#### Adaptive Recency + Frequency

Maintains four lists: T1 (recently seen once), T2 (recently seen more than once), B1 (ghost entries evicted from T1), B2 (ghost entries evicted from T2). Ghost entries store only the key, not the value — they act as memory of recently evicted items. When a cache miss hits a ghost entry, ARC adjusts its internal balance parameter `p` to favor recency (T1) or frequency (T2) based on which type of eviction is causing more misses. Self-tuning: no manual parameter required.

**Production use:** ZFS page cache, IBM Almaden research origin. Caffeine (Java) implements a variant (W-TinyLFU). Not available in Redis natively — if you need ARC semantics in Redis, Caffeine as an in-process L1 cache is the common approach.

### FIFO & Segmented Variants

Simple FIFO evicts keys in insertion order regardless of access frequency or recency. Predictable behavior; trivially simple to implement. Appropriate only for workloads where access order approximates insertion order (e.g., time-series data with sequential scan pattern).

S3-FIFO (2023): Three-queue variant — a small queue (S), a main queue (M), and a ghost queue (G). New entries enter S; on second access they graduate to M; evictions from S go to G. Objects in M are kept longer; one-time-access keys cycle through S quickly. Recent benchmarks on production web cache traces show S3-FIFO outperforming LRU with lower implementation complexity.

### Lazy vs Active Expiry Trade-offs

**Lazy expiry (Redis default):** An expired key is not removed proactively — it is deleted on access or during periodic background sampling. Memory overhead: expired keys occupy memory until accessed or sampled. Advantage: no background CPU cost for expiry scanning.

**Active expiry:** A background thread periodically scans for expired keys and removes them. Redis runs an active expiry cycle 10 times per second, sampling 20 random keys from the set of keys with TTLs and removing expired ones. If more than 25% of sampled keys are expired, the cycle repeats immediately (adaptive frequency). Tunable aggressiveness via `hz` config (10–500 cycles/sec).

**Implication:** In Redis, a sudden bulk TTL expiry (e.g., 1M keys all expiring at once) will not be cleaned up instantly — it will take multiple active expiry cycles. Memory will spike transiently. Plan TTL distributions to avoid synchronized expiry.

### Eviction Rate as a Capacity Signal

An eviction rate of 0 with high memory utilization means the working set fits in cache — memory may be over-provisioned. A sustained eviction rate above ~1% of total operations means the working set exceeds capacity. Before adding cache capacity, check the eviction pattern: if a handful of large objects are causing many small object evictions, the problem is object size distribution, not total capacity.

> 🎯 **Interview Lens** > **Q:** Why would you choose LFU over LRU for a product catalog cache?
> **Ideal answer:** Product catalogs have a stable hot set — top 1000 products account for 80% of views regardless of recency. LRU would demote a hot product if it wasn't accessed in the last N minutes (e.g., overnight). LFU retains it based on long-term access frequency. The risk is new product starvation — a newly launched product starts at frequency=1 and is immediately evictable, even during a launch spike. Mitigate with a minimum TTL before any new key becomes eviction-eligible.
> **Common trap:** "Always use LRU because it's simpler." LRU is a good default but the wrong choice for frequency-dominated workloads.
> **Next question:** "What about ARC?" → ARC adapts between recency and frequency automatically. The downside is implementation complexity — it's not available in Redis natively. For a product catalog, LFU with decay is usually sufficient and simpler to operate.

**Key Takeaway:** LRU is the right default for temporal locality workloads. LFU outperforms it for stable hot-key workloads but requires decay to handle cold key buildup. ARC self-tunes but adds implementation complexity. Eviction rate is the metric that tells you when the policy choice matters less than the capacity.

---

## Cache Invalidation

**Interviewer TL;DR:** Cache invalidation is hard because it's a distributed consistency problem — the writer must know all cache keys that depend on the changed data, and the invalidation message must arrive before the next read. TTL is the safety net, not the solution.

**Mental model:** Every cached value is a snapshot of data at a point in time. Invalidation is the mechanism that turns a stale snapshot into a signal to re-fetch. The gap between "DB updated" and "cache invalidated" is the staleness window — the goal is to minimize it for data where staleness has consequences.

### Why Cache Invalidation Is Hard

_The core tension: the writer knows what data changed, but not which cache keys represent that data._

A `users` table row update is straightforward — invalidate `user:{id}`. But what about a leaderboard cached as `leaderboard:top100`? That key depends on every user's score. A score update must know to invalidate the leaderboard key — but the leaderboard service and the user service are often separate teams and deployments.

Compounding problems: invalidation messages can be lost (network failure), reordered (cache populated after invalidation arrives due to clock skew), or duplicated (idempotent deletes are safe; idempotent updates are not). A missed invalidation silently serves stale data until TTL expiry.

### Key-Based Invalidation

`cache.delete(key)` or `cache.set(key, new_value, ttl)`. Precise, simple, low overhead. Requires the writer to know the exact cache key. Works when the key is deterministic and the writer controls the key structure (e.g., `user:{id}`, `product:{sku}`). Breaks when the cache key depends on query parameters the writer cannot enumerate (e.g., search results, faceted filters, aggregations over ranges).

### Tag / Surrogate Key Invalidation

Each cache entry is tagged with one or more logical labels. `cache.set("leaderboard:top100", data, tags=["user:scores", "region:us"])`. On data change, invalidate all entries bearing the relevant tag: `cache.invalidate_tag("user:scores")`.

**Mechanics:** Requires a tag → key mapping (a set of cache keys per tag) stored in the cache itself. Tag-based invalidation iterates the set and deletes each key. O(n) cost per tag invalidation where n = number of keys bearing that tag.

Varnish CDN supports surrogate keys natively. Redis can simulate with sets (store keys per tag; iterate to invalidate) but is not atomic — a race exists between populating the tag set and invalidating it. Acceptable for most use cases; not safe for financial correctness without additional locking.

### Event-Driven Invalidation via CDC or Message Queue

A change data capture (CDC) tool (Debezium, Maxwell) subscribes to the DB's write-ahead log and emits an event for every row mutation. A cache invalidation consumer subscribes to these events, computes the affected cache keys, and deletes them.

**Advantages:** Fully decoupled — the application writer does not need to know cache key structure. Every DB write triggers an invalidation automatically. Retroactively adding a new cache key pattern doesn't require changing the write path.

**Disadvantages:** Eventual consistency — there is a window between DB write and cache invalidation arrival (typically 10-100ms for in-region CDC). The CDC pipeline is a new operational dependency that must be monitored. Key computation logic lives in the consumer, not the application — a separate place where the mapping of DB row to cache key must be maintained.

### Stale-While-Revalidate Pattern

Serve the stale cached value immediately. Trigger a background refresh asynchronously. The next request (or a subsequent one) gets the fresh value.

```
Client request → cache hit (stale, within grace window)
                      ├─ Return stale value immediately (zero added latency)
                      └─ Trigger background DB fetch → update cache
```

Controlled via HTTP header `Cache-Control: stale-while-revalidate=60` (for CDN/browser caches) or implemented in application code. Acceptable for content where freshness is preferred but not required: product descriptions, recommendation lists, social feeds. Not acceptable for inventory counts, pricing, auth state, or any data with correctness SLAs.

### Versioned Keys (Cache Busting)

Embed a version or content hash in the cache key: `user:123:v7`, `static:main.js:sha256abc`. On data change, increment the version — the old key is orphaned (never requested again, evicted by TTL). No explicit delete needed.

**Advantage:** No invalidation race condition — the old key is never overwritten, just abandoned. Safe for immutable-by-version data (deployment artifacts, content-addressed assets).

**Disadvantage:** Orphaned keys accumulate memory until TTL expiry. The version must be propagated to all consumers — the URL, the API response, or a shared version registry. Not practical for keys where the version is unknown to the consumer at request time.

### Distributed Invalidation Fan-Out Cost

In a multi-node cache cluster, invalidating one logical key requires sending the delete to every node that may hold a replica of that key. At 100 cache nodes with full replication, one logical invalidation becomes 100 network messages. At high write rates, invalidation fan-out can saturate the network.

**Mitigation:** For high-write keys, accept TTL-based eventual consistency instead of synchronous invalidation — the invalidation cost exceeds the staleness cost. For low-write keys with freshness requirements, explicit invalidation is acceptable. Shard keys such that a given key lives on a small, known subset of nodes.

> 🎯 **Interview Lens** > **Q:** How would you handle cache invalidation for a search results page that aggregates data from three tables?
> **Ideal answer:** Exact-key invalidation doesn't scale — the search result key depends on the query parameters and aggregation across three tables. Two options: (1) short TTL (30-60s) as the primary freshness mechanism — acceptable staleness for search; (2) event-driven invalidation via CDC — any mutation on the three tables emits an event; the consumer invalidates all search cache keys tagged with the affected entity. Tag-based invalidation is the right structure here. The tag `product:category:electronics` invalidates all search pages for that category on any product update.
> **Common trap:** "Invalidate the cache on every write to the DB." This works for simple key:value caches but not for aggregated or query-result caches where the key is computed from input parameters.
> **Next question:** "What if the CDC pipeline falls behind by 5 minutes?" → The cache serves stale search results for 5 minutes. Acceptable for search; unacceptable for pricing. The TTL becomes the fallback safety net — set it to a staleness window you're willing to tolerate if CDC lags.

**Key Takeaway:** TTL is the safety net; explicit invalidation or CDC is the fast path. The choice of invalidation strategy depends on whether the writer can enumerate affected cache keys — if not, CDC fan-out or tag-based invalidation is the right architecture.

---

## Distributed Cache Architecture

**Interviewer TL;DR:** Sharding strategy is the most consequential architectural decision — modulo hashing is fatal on resharding, consistent hashing is the production default. Hot keys are the hardest operational problem and require a different mitigation than adding nodes.

**Mental model:** A single cache node has a throughput ceiling and a memory limit. Distributing a cache means deciding how to route each key to a node, how to keep replicas in sync, and what happens when a node fails or the cluster grows.

### Client-Side vs Proxy-Side Routing

**Client-side routing:** The application client (using a consistent-hashing library) computes which node owns a key and connects directly. No extra network hop. The client must handle node failure detection and resharding logic. Used by: Redis Cluster (cluster-aware clients), Memcached with consistent-hashing clients (e.g., `pylibmc`, `spymemcached`).

**Proxy-side routing:** A proxy layer (Twemproxy, Envoy + Redis filter, Redis Cluster proxy) receives all requests from the application and routes to the correct backend node. The application connects to a single endpoint. The proxy adds ~0.1–0.3ms latency but centralizes resharding, failover, and connection multiplexing. Preferable when the application cannot use a cluster-aware client library (e.g., language without a maintained Redis Cluster client).

### Sharding Strategies

#### Modulo Hashing — Resharding Cost

`node = hash(key) % num_nodes`. Simple; zero configuration. Fatal on topology change: adding or removing one node remaps `(N-1)/N` of all keys — nearly every key points to a new node. The result is a near-total cache miss storm immediately after the resharding event. Appropriate only for fixed-size clusters that will never change node count in production.

#### Consistent Hashing — Virtual Nodes, Rebalancing Impact

Keys and nodes are placed on a hash ring (mod 2^32). A key maps to the nearest node clockwise. Adding a node only remaps the keys between the new node and its predecessor — approximately `1/N` of total keys. Removing a node remaps only that node's keys to its successor.

Virtual nodes (vnodes): Each physical node is represented by K positions on the ring (K = 100–300 is typical). Without vnodes, non-uniform physical node placement causes load imbalance. Vnodes smooth the distribution. (→ [Consistent Hashing](../algorithms/consistent-hashing.md))

### Replication

#### Read Replicas — Stale Read Window

One primary accepts writes; N replicas serve reads. Replication is asynchronous — replicas apply writes after a lag. Within a datacenter: typically <1ms. Cross-datacenter: 5–100ms. The stale read window equals the replication lag. Acceptable for most read workloads; not for read-your-writes consistency (see [Consistency Guarantees](#consistency-guarantees)).

Read replicas increase read throughput linearly with replica count. They do not improve write throughput — all writes still go to the primary.

#### Active-Active — Write Conflict Surface

Multiple nodes accept writes for the same key space. Bidirectional replication. Required for geo-distributed deployments where write latency to a remote primary is unacceptable.

Write conflict: two clients write to the same key on different nodes within the replication lag window. Both writes are valid from the writer's perspective; the final value depends on conflict resolution strategy. Last-write-wins (LWW) by wall clock is unreliable under clock skew (NTP drift of 10–100ms can reorder writes). Vector clocks or CRDTs are correct but add implementation complexity. In practice, most active-active caches accept LWW with NTP clocks and treat rare conflicts as acceptable staleness — verify this is acceptable for your data model before choosing active-active.

### Hot Key Problem

One key (or a small key set) receives a disproportionate fraction of all requests. The node owning that key becomes the bottleneck regardless of cluster size — adding nodes does not help because the hot key hashes to a single node.

#### Local Replica / In-Process L1 Shadow

Cache the hot key locally in each application instance's heap (using an in-process cache like Caffeine or a simple thread-safe map with TTL). Reads are served from local memory — no network hop, no remote cache node pressure.

**Consistency implication:** Each application instance has its own copy. Invalidation must reach every instance (via pub/sub, a short L1 TTL, or a broadcast mechanism). Accept that the L1 TTL creates a staleness window of up to `L1_TTL` seconds. Set L1 TTL to the maximum staleness you can tolerate for that key (often 1–5 seconds for hot config or reference data).

#### Key Splitting with Random Suffix

Distribute one logical hot key across N physical keys: `hot_key:0` through `hot_key:N-1`. Writes update all N copies. Reads pick a random suffix.

```python
def get_hot(key, n=10):
    shard = random.randint(0, n-1)
    return cache.get(f"{key}:{shard}")

def set_hot(key, value, n=10):
    for i in range(n):
        cache.set(f"{key}:{i}", value, ttl=60)
```

Distributes load across N nodes. Partially breaks per-key ordering (reads may get any of N copies, which may be at slightly different versions). N is typically 10–50. On write, updating all N copies synchronously doubles write latency; updating asynchronously introduces a window where some shards are stale.

### Connection Pooling & Pipelining

**Connection pooling:** Each cache request without a pool creates a new TCP connection (~1ms overhead on top of the ~0.3ms cache operation). A pool keeps connections open and reuses them. Pool size formula: `pool_size = ceil(rps × avg_latency_sec / instances)`. A service handling 10k rps per instance with 1ms average cache latency needs a pool of at least 10 connections per instance.

**Pipelining:** Batches multiple Redis commands into a single TCP round-trip. Instead of 10 GET commands × 0.3ms = 3ms, pipelining sends all 10 in one round-trip for ~0.3ms total. Effective for bulk reads or multi-key operations. Not applicable when the result of one command determines the next (sequential dependency).

> 🎯 **Interview Lens** > **Q:** A single Redis node in your cluster is consistently at 100% CPU while others are idle. What do you do?
> **Ideal answer:** Classic hot key problem. First, identify the key(s) causing it — use Redis's `MONITOR` (sparingly) or `OBJECT FREQ` in LFU mode, or a Count-Min Sketch at the application layer. Then choose a mitigation based on access pattern: if read-heavy, add an in-process L1 shadow with a short TTL; if the key is large and frequently updated, consider key splitting with random suffix. Adding nodes doesn't help because consistent hashing routes the hot key to the same node.
> **Common trap:** "Add more Redis nodes." Adding nodes reshards the cluster but the hot key still hashes to one node — the new nodes sit idle.
> **Next question:** "The hot key is a global rate-limit counter that receives 50k writes/sec. Key splitting won't work because you need an accurate total. What now?" → Redis cluster can't give you atomic global aggregation at 50k writes/sec from one node. Options: approximate counting with lossy aggregation across shards; use a purpose-built rate limiter (Envoy rate limit service, Redis Cell module); or accept a short time window of overcounting by summing shards and accepting the error margin.

**Key Takeaway:** Consistent hashing is the production default for sharding — modulo hashing is a resharding disaster. Hot keys require a different solution than adding nodes: in-process L1 shadow for read-heavy keys, key splitting for write-distributed keys.

---

## Cache Failure Modes

**Interviewer TL;DR:** Four distinct failure modes — stampede, avalanche, penetration, breakdown — are frequently conflated in interviews. Each has a different cause, a different detection signal, and a different mitigation. Know all four.

**Mental model:** Each failure mode is a scenario where normal caching behavior breaks down under a specific access or failure pattern, causing a disproportionate load on the origin or the cache itself.

### Cache Stampede / Thundering Herd

A hot key expires. Simultaneously, many concurrent requests miss the cache and all query the DB directly. The origin receives a spike of N concurrent requests for the same data — where N is the number of concurrent callers at the moment of expiry. This can saturate the DB for a resource that would otherwise handle 1 request per TTL period.

#### Mutex / Single-Flight Coalescing

Only one goroutine/thread is allowed to fetch from DB for a given key. All others wait (or return stale) until the fetch completes and the cache is repopulated.

```python
import threading

locks = {}
lock_meta = threading.Lock()

def get_with_lock(cache, db, key):
    value = cache.get(key)
    if value:
        return value

    with lock_meta:
        if key not in locks:
            locks[key] = threading.Lock()
        key_lock = locks[key]

    with key_lock:
        # double-check after acquiring lock
        value = cache.get(key)
        if value:
            return value
        value = db.fetch(key)
        cache.set(key, value, ttl=300)
        return value
```

In Go, `singleflight.Group` provides this pattern with zero boilerplate. In distributed systems, use a Redis-based distributed lock with a short expiry (`SET lock:{key} 1 NX EX 5`).

#### Probabilistic Early Recomputation (PER)

Instead of waiting for TTL expiry, each request computes a probability of early refresh based on time remaining. The first request that "wins" the probability check triggers a background refresh — staggering expiry naturally without coordination.

```python
import math, random, time

def get_with_per(cache, db, key, beta=1):
    entry = cache.get_with_ttl(key)  # returns (value, ttl_remaining, recompute_time)
    if entry is None:
        value = db.fetch(key)
        cache.set(key, value, ttl=300)
        return value

    value, ttl_remaining, recompute_time = entry
    # Refresh early if this probabilistic check fires
    if -recompute_time * beta * math.log(random.random()) >= ttl_remaining:
        value = db.fetch(key)
        cache.set(key, value, ttl=300)

    return value
```

No distributed lock needed. No coordinated wait. The early refresh probability increases as TTL approaches zero, so most refreshes happen just before expiry — distributed across callers.

### Cache Avalanche — Staggered TTL, Circuit Breaker on Origin

A large number of keys expire simultaneously — typically because they were all populated at startup with the same TTL, or after a cache restart. The origin receives a flood of requests across many keys simultaneously, not just one.

**Mitigation 1 — TTL jitter:** Add random offset to every TTL: `actual_ttl = base_ttl + random.randint(0, base_ttl // 10)`. Spreads expiry across a window rather than a single moment.

**Mitigation 2 — Circuit breaker on origin:** If the cache miss rate exceeds a threshold (e.g., >50% of requests are misses for more than 10 seconds), open a circuit breaker that returns stale values or default responses rather than forwarding all misses to the origin. Prevents the avalanche from cascading into a full origin outage.

### Cache Penetration — Null Caching, Bloom Filter Guard

Requests for keys that do not exist in the DB (malicious enumeration, buggy client, or natural sparse data). Every request misses the cache (nothing to populate) and hits the DB. Unlike a stampede (many concurrent requests for one valid key), penetration is a sustained stream of requests for invalid keys.

**Mitigation 1 — Null caching:** Cache the "not found" result with a short TTL: `cache.set(key, NULL_SENTINEL, ttl=60)`. Subsequent requests for the same non-existent key hit the cache and return immediately. Risk: an attacker enumerating a large key space fills the cache with null sentinels, evicting valid data. Limit with a maximum TTL for null entries and rate limiting on cache population.

**Mitigation 2 — Bloom filter guard:** Pre-populate a Bloom filter with all valid keys. Before touching the cache or DB, check the filter. Requests for keys not in the filter are rejected immediately. False positive rate of a Bloom filter means some invalid keys pass through — acceptable. False negative rate is zero — no valid key is ever rejected.

```python
bloom = BloomFilter(capacity=10_000_000, error_rate=0.01)
for key in db.all_keys():
    bloom.add(key)

def get(key):
    if key not in bloom:  # definitive: this key does not exist
        return None
    return cache.get(key) or db.fetch(key)
```

### Cache Breakdown — Hot Key Expiry Under High Concurrency

A single hot key expires while under sustained high concurrent load. The difference from stampede: breakdown is specific to one known-hot key under continuous pressure, not a coordinated simultaneous expiry event. All concurrent requests race to the DB at the moment of expiry.

**Distinction from stampede:** Stampede = many keys expire → many DB queries. Breakdown = one key expires → one DB query context, but hundreds of concurrent threads racing for it.

**Mitigation:** Mutex on the specific key (same as single-flight above). Or: use a background refresh thread that proactively renews the key before expiry, eliminating the expiry event entirely for continuously hot keys.

### Cold-Start Problem & Cache Warming Strategies

After a cache restart, full deployment, or scaling event that adds nodes, the cache is empty. All traffic hits the origin until the cache warms up organically.

**Eager pre-population:** Before routing production traffic to the new cache node, replay recent DB reads or access logs to pre-populate the hot key set. Tools: read the last 24 hours of access logs, extract the top N keys by frequency, bulk-fetch and populate. Reduces cold-start duration from minutes to seconds.

**Shadow traffic warming:** Route a copy of production read traffic to the new cache node (without serving responses from it) before cutover. The node warms from live traffic without affecting users.

**Lazy warming + origin protection:** Accept the cold-start period; protect the origin with rate limiting or a circuit breaker that caps the miss-to-DB rate. Gradual traffic shift (10% → 25% → 50% → 100%) gives the cache time to warm before full load is applied.

> 🎯 **Interview Lens** > **Q:** Explain the difference between cache stampede, cache avalanche, and cache penetration.
> **Ideal answer:** Stampede: one popular key expires, many concurrent requests simultaneously miss and flood the origin for that one key. Avalanche: many keys expire at the same time (uniform TTL), flooding the origin across many keys simultaneously. Penetration: requests for keys that don't exist in the DB, bypassing the cache entirely and hitting the origin on every request. Different causes, different mitigations: stampede → single-flight mutex or PER; avalanche → TTL jitter and circuit breaker; penetration → null caching or Bloom filter guard.
> **Common trap:** Treating all three as the same "cache miss" problem with the same solution. They have different root causes and different fixes.
> **Next question:** "Your Bloom filter says a key exists, but the DB returns empty. What happened?" → The key was deleted from the DB after the Bloom filter was built. Bloom filters do not support deletion (standard variants). The stale positive in the filter causes a DB lookup that returns empty — this is acceptable behavior (one extra DB query). If key deletions are frequent, use a Counting Bloom filter (supports deletions) or rebuild the filter periodically.

**Key Takeaway:** Stampede is about concurrency on a single key; avalanche is about coordinated expiry across many keys; penetration is about non-existent keys. Single-flight coalescing or PER handles stampede and breakdown; TTL jitter and circuit breakers handle avalanche; null caching or Bloom filter handles penetration.

---

## Consistency Guarantees

**Interviewer TL;DR:** Most cache deployments accept AP semantics — bounded staleness with no cross-replica ordering guarantee. The three common guarantees worth implementing are read-your-writes, monotonic reads, and bounded staleness in multi-region setups.

**Mental model:** A cache is a replica of DB state with a staleness budget. Consistency guarantees define what a client can expect when reading from a cache that may be behind the DB.

### Read-Your-Writes — Session Affinity vs Token-Based

After a user writes data, their next read must see the updated value. In cache-aside, a write invalidates the cache key. If the invalidation is delayed or the read goes to a replica that hasn't received the invalidation yet, the user sees their own stale data — a confusing UX failure.

**Session affinity:** Route all reads for a user session to the same cache node (or always read from the primary after a write). Simple but reduces cache distribution benefits.

**Token-based:** On write, issue a version token to the client. On subsequent reads, the client presents the token. The cache (or application) checks whether the cached value's version is >= the token; if not, it falls through to the DB. Stateless; works across any cache node.

### Monotonic Reads

A user should never see an older version of data after seeing a newer version. In a replicated cache, if request 1 is routed to replica A (low lag) and request 2 is routed to replica B (high lag), the user sees data go "backward."

**Mitigation:** Route all reads for a session to the same replica (session pinning). Or: include a version in the cached value; if the version decreases between reads, fall through to the primary.

### Write Ordering in Active-Active Setups

If two clients write to the same key on different active-active nodes within the replication lag window, which write wins? LWW by wall clock is unreliable: NTP clock skew of 10–100ms can make an older write appear newer. Hybrid logical clocks (HLC) or vector clocks are correct but complex. In practice: accept LWW with well-synchronized clocks, monitor for anomalies, and design data models to avoid concurrent writes to the same key where correctness is required.

### Cache Coherence vs DB as Source of Truth

The DB is always the source of truth. A cache hit is "probably correct." A cache miss is "definitely go to DB." Any read that requires correctness for financial, inventory, or audit purposes must have a DB fallback or an explicit freshness verification step — not just a TTL assumption. The phrase "the cache says X" is never sufficient justification in a correctness-sensitive context.

### Multi-Region / Geo-Distributed Cache Coherence

Cross-region replication lag is measured in tens to hundreds of milliseconds (RTT between us-east-1 and eu-west-1 is ~80ms; replication lag typically exceeds the RTT). A write in us-east may not be visible in eu-west for 100ms+.

**Home-region routing:** Each key has a canonical region. Cross-region reads for freshness-sensitive data are proxied to the home region. Reads that can tolerate regional staleness are served locally. Increases cross-region read latency; reduces staleness.

**TTL floor:** Do not cache cross-region reads with TTL shorter than the expected replication lag. A TTL of 10ms on a key with 80ms replication lag means the cache expires before the replication even completes — every request will miss and be forwarded cross-region.

**Design for regional staleness:** For most data (product catalogs, user preferences, content), regional staleness of 100–500ms is acceptable. Design the application to tolerate it rather than trying to eliminate it through synchronous cross-region consistency — which would require cross-region coordination on every write and is prohibitively expensive.

> 🎯 **Interview Lens** > **Q:** A user updates their profile and immediately reloads the page — they see the old data. What's happening and how do you fix it?
> **Ideal answer:** Read-your-writes violation. The write invalidated the cache, but the subsequent read was served by a replica that hadn't received the invalidation yet (replication lag). Fix: (1) after a write, route the user's next read to the primary for a short window; (2) use a version token — the write returns version=7, the subsequent read checks if the cache version is >=7, otherwise falls through to the primary; (3) short TTL on user profile cache (1–5s) as a fallback safety net.
> **Common trap:** "Just always read from the primary." This eliminates replication benefits and defeats the purpose of having replicas.
> **Next question:** "How does your token approach work if the user has multiple browser tabs open?" → Each tab's read carries the token from that tab's last write. Tab B (which didn't write) carries an old token and may still see stale data from its replica — which is acceptable. Only the writing session requires read-your-writes consistency.

**Key Takeaway:** Most cache deployments accept eventual consistency. Read-your-writes and monotonic reads are the two guarantees worth implementing for user-facing data. Multi-region caches should be designed around regional staleness acceptance, not cross-region synchronous consistency.

---

## Cache Hierarchy & Layering

**Interviewer TL;DR:** Most production systems use two cache layers: an in-process L1 for the hottest keys and a shared remote L2 for the shared working set. CDN is the L3 for publicly cacheable HTTP responses. Each layer has a different latency profile and a different consistency model.

**Mental model:** Cache layers are concentric rings around the DB. Each ring is faster but smaller and less consistent than the ring inside it. The application reads outward until it hits a cached value, then populates inward on return.

### In-Process (L1) — Heap vs Off-Heap

Lives inside the application process memory. Access is sub-microsecond (no network, no syscall).

**Heap-based (Caffeine, Guava Cache, Python `functools.lru_cache`):** Managed by the language runtime GC. GC pressure increases with cache size — large heap caches cause long GC pauses in Java. Suitable for small caches (< 500MB).

**Off-heap (direct ByteBuffer, memory-mapped files, Chronicle Map):** Bypasses GC entirely. Data is stored in native memory outside the JVM heap. No GC pauses; requires manual memory management and explicit serialization/deserialization. Suitable for large L1 caches (> 1GB) in latency-sensitive Java services.

**Consistency implication:** Each application instance has its own L1 copy. Invalidation must reach every instance. Options: subscribe to a Redis pub/sub invalidation channel; use a short L1 TTL (1–10 seconds) as the correction window; accept that L1 is a best-effort optimization and L2 is the authoritative cached state.

### Shared Remote Cache (L2) — Network Round-Trip Cost

Redis or Memcached. Shared across all application instances — a single source of truth for cached data. A cache hit returns in 0.2–1ms (network + processing). Supports TTL, eviction policies, pub/sub for invalidation, and data structures (sorted sets, hashes, streams) beyond simple key-value.

The network round-trip is the unavoidable latency floor. For requests where even 0.5ms matters, L2 is too slow — use L1 shadow. For the vast majority of web service latency budgets (P99 target of 50–100ms), 0.5ms is negligible.

### CDN as Edge Cache (L3) — HTTP Cache Semantics, Cache-Control Directives, ETag, Vary, Stale-While-Revalidate

HTTP caching is governed by response headers. The CDN acts as an L3 cache for publicly cacheable HTTP responses.

Key directives:

| Header                                     | Effect                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `Cache-Control: max-age=3600`              | Cache for 3600 seconds (browser and CDN)                                                |
| `Cache-Control: s-maxage=3600`             | CDN-specific TTL; overrides `max-age` for shared caches                                 |
| `Cache-Control: no-store`                  | Never cache this response                                                               |
| `Cache-Control: no-cache`                  | Cache but revalidate with origin before serving                                         |
| `Cache-Control: stale-while-revalidate=60` | Serve stale for up to 60s while revalidating in background                              |
| `ETag: "abc123"`                           | Version token; client sends `If-None-Match: "abc123"` on revalidation; 304 if unchanged |
| `Vary: Accept-Encoding`                    | Cache separate copies per value of this request header                                  |

**`Vary` footgun:** `Vary: User-Agent` creates a separate cache entry per browser version — potentially thousands of entries for one URL, destroying cache efficiency. Only vary on headers that meaningfully differentiate the response (e.g., `Accept-Encoding`, `Accept-Language`).

CDN-specific topology (PoP selection, origin shield, purge APIs) → [CDN](../components/cdn.md) <!-- link: cdn.md -->

### DB Query Cache — When to Disable It

MySQL's query cache (removed in 8.0) and similar DB-level query result caches invalidate on any write to any table referenced in the query. In a write-heavy system, the invalidation overhead (acquiring a global mutex, iterating cached query results to find matching entries) consumes more resources than the cache saves. The cache becomes a global lock contention point.

**Rule:** Disable DB query cache in write-heavy or mixed workloads. Use application-level caching with precise invalidation. Keep DB query cache only for read-only reporting replicas where write-invalidation is rare.

### Multi-Tier Cache Write Coordination

When writing through an L1 + L2 cache hierarchy, the invalidation order matters.

**Correct order:** Invalidate L2 first, then L1.

**Why:** If L1 is invalidated first, a concurrent read between the two invalidations misses L1 and reads from L2 — which is still stale. It then re-populates L1 with stale data from L2. Then L2 is invalidated, but L1 now holds stale data with whatever TTL was set.

Invalidating L2 first means any miss during the window reads from DB (authoritative) and populates both layers correctly.

> 🎯 **Interview Lens** > **Q:** When would you add an in-process cache on top of Redis?
> **Ideal answer:** When even 0.5ms Redis latency is too high — typically for extremely hot reference data (feature flags, rate limit configs, active A/B experiment configs) accessed on every request. L1 reduces per-request cache cost from ~0.5ms to ~1µs. The trade-off: each instance has its own copy; invalidation must reach all instances via Redis pub/sub or a short L1 TTL. If the data changes rarely and eventual consistency within a few seconds is acceptable, L1 is the right optimization.
> **Common trap:** Adding L1 for all cached data — this multiplies memory usage across every application instance and makes invalidation a distributed fan-out problem.
> **Next question:** "Your service has 200 instances each with a 500MB L1 cache. A config change needs to propagate to all instances within 1 second. How?" → Redis pub/sub broadcast: the config writer publishes to a channel, all 200 instances subscribe and invalidate on receive. Delivery is best-effort (no persistence); a restarting instance will miss the invalidation message. Mitigate with a short L1 TTL (5–10s) as a fallback.

**Key Takeaway:** L1 (in-process) for sub-millisecond access to the hottest few keys; L2 (Redis) as the shared authoritative cache; CDN (L3) for HTTP response caching. Invalidate outer layers before inner layers on write.

---

## Performance & Capacity Planning

**Interviewer TL;DR:** Hit rate has diminishing returns — going from 95% to 99% may require 4x more memory. Size the cache for the working set that achieves an acceptable origin load, not the maximum achievable hit rate.

**Mental model:** Cache capacity planning is an economic optimization — memory is the cost, reduced origin load is the benefit. The marginal benefit of additional memory decreases as hit rate approaches 100%.

### Hit Rate Target — Diminishing Returns Curve

If the origin can handle 10k rps and total traffic is 100k rps, minimum acceptable hit rate is 90%. Going from 90% to 95% hit rate halves origin load (10k → 5k rps). Going from 95% to 99% reduces origin load by another 80% (5k → 1k rps) but may require significantly more cache memory. The curve is not linear.

Target the hit rate that keeps origin load within its capacity headroom, not the highest achievable. A 95% hit rate with a well-sized cache is almost always more cost-effective than 99% with an oversized cache.

### Working Set Estimation

The working set is the subset of data accessed within a time window T. Typical access distributions follow a power law (Zipfian): the top 10% of keys account for ~90% of reads.

```
Estimation approach:
1. Sample access logs over 24 hours
2. Build a frequency histogram of key access counts
3. Sort keys by frequency (descending)
4. Find N = the number of keys that account for your target hit rate
5. Cache size = Σ(size_of_key_i) for i in 1..N
```

This gives the minimum cache size to achieve the target hit rate. Add 20–30% headroom for growth and metadata overhead.

### Object Size Distribution & Memory Fragmentation

A cache with average object size 10KB but P99 object size 1MB will have eviction behavior dominated by the large objects. One 1MB object evicts 100 10KB objects — a single large object causes disproportionate churn.

**Mitigation:** Monitor `used_memory / number_of_keys` to detect size distribution changes. If P99 object size is >10x the median, consider routing large objects to a separate cache instance (or not caching them at all — store references, fetch the large object from blob storage). Redis's `DEBUG OBJECT key` and `MEMORY USAGE key` commands expose per-key memory consumption.

Jemalloc (Redis's default allocator) uses size classes, which introduces memory fragmentation overhead of 5–30% above the raw data size. Account for this in capacity planning: provision `data_size × 1.25` to cover allocator overhead.

### Serialization Overhead — Format Selection

A cache hit's total latency = network round-trip + deserialization time. High deserialization CPU cost can negate the latency benefit of a cache hit.

| Format      | Size (relative) | Deserialization Speed      | Notes                                            |
| ----------- | --------------- | -------------------------- | ------------------------------------------------ |
| JSON        | 1x (baseline)   | Slow (string parsing)      | Human-readable; schema-free                      |
| MessagePack | ~0.5x           | Fast (binary)              | Drop-in JSON alternative; no schema              |
| Protobuf    | ~0.3x           | Very fast (code-generated) | Requires schema; best for high-frequency paths   |
| Avro        | ~0.35x          | Fast                       | Schema registry required; good for CDC pipelines |

Benchmark end-to-end latency (network + deserialization) at your target object size before choosing a format. JSON is acceptable for objects < 1KB at low hit rates; Protobuf pays off at objects > 10KB or hit rates > 100k ops/sec.

### Throughput Ceiling Per Node

A single Redis node handles ~100k–500k operations/sec depending on command type and value size.

| Command                          | ~Throughput   |
| -------------------------------- | ------------- |
| GET/SET (small value, <1KB)      | ~500k ops/sec |
| GET/SET (large value, 10KB)      | ~100k ops/sec |
| ZADD / ZRANGE (large sorted set) | ~50k ops/sec  |
| HGETALL (large hash)             | ~100k ops/sec |

Redis command execution is single-threaded (I/O threads were added in Redis 6 but command processing remains serial). Shard before hitting the ceiling — adding a second node doubles throughput. Pipelining and Lua scripts (which run atomically in the command thread) are the levers for maximizing single-node throughput.

> 🎯 **Interview Lens** > **Q:** How would you size a Redis cache for a user profile service with 50M users, 500k rps, and a 95% hit rate target?
> **Ideal answer:** (1) Working set: access follows power law — estimate top 5M users (10%) account for 90% of reads; at 1KB average profile size, that's ~5GB of data. Add 25% for fragmentation = ~6.25GB. (2) Hit rate check: 95% hit rate = 475k rps served by cache, 25k rps to DB. Verify DB can handle 25k rps. (3) Throughput: 500k rps on a single Redis node is at the ceiling for small objects — plan for 2 shards with consistent hashing. (4) Replication: add one read replica per shard for availability. Total: 4 Redis nodes (2 primary, 2 replica), ~8GB memory per primary.
> **Common trap:** Sizing for 100% of 50M users × 1KB = 50GB. The working set is far smaller — most users are inactive. Size for the working set, not the total data set.
> **Next question:** "Hit rate drops to 80% on Monday mornings. Why?" → Weekly traffic spike — users who weren't active over the weekend return, accessing profiles that were evicted from the cache. The working set expands on Monday morning. Either pre-warm on Sunday night or increase cache size to hold the Monday working set year-round.

**Key Takeaway:** Size for the working set, not the full dataset. The diminishing returns curve means going from 95% to 99% hit rate rarely justifies the cost. Model throughput ceilings per node and shard before hitting them.

---

## Security & Hardening

**Interviewer TL;DR:** The three pillars are: namespace isolation (prevent key collisions between tenants), short TTLs for sensitive data (limit the blast radius of a stale credential), and TLS for in-transit encryption. Cache poisoning and side-channel timing attacks are the less obvious threats worth knowing for senior interviews.

**Mental model:** A shared cache is a shared data store. Every security principle that applies to a database — least privilege, encryption, isolation — applies to a cache, often with weaker tooling and more casual operational discipline.

### Cache Poisoning — Key Namespacing, Input Sanitization

An attacker causes a malicious value to be stored in the cache and served to other users. Two vectors:

**Application-level poisoning:** An attacker controls input that becomes part of a cache key or value. Without sanitization, they can inject a key that collides with a legitimate key (e.g., `user:123` where `123` is crafted to match another user's ID). Mitigation: validate and sanitize all inputs before constructing cache keys; use opaque internal identifiers, not user-controlled strings, as key components.

**HTTP cache poisoning:** By manipulating unkeyed request headers (headers the CDN doesn't include in its cache key), an attacker causes the CDN to cache a response that contains injected content. Example: the CDN caches on URL only; the attacker sends a request with `X-Forwarded-Host: evil.com`; the origin reflects this header in the response; the CDN caches the reflected response and serves it to all users. Mitigation: normalize and validate all headers reflected in responses; include security-relevant headers in the CDN cache key.

### Tenant Isolation in Shared Caches

In a multi-tenant SaaS, tenant A's data must not be readable by tenant B. Mitigation: namespace all keys with the tenant ID — `{tenant_id}:{resource_type}:{resource_id}`. Enforce this at the data access layer, not just by convention.

Never use `KEYS *` in production Redis — it is O(N) across all keys, blocks the single-threaded command loop, and exposes all key names across all tenants to the caller. Use `SCAN` with a pattern for iteration; it is O(1) per call (cursor-based, non-blocking). For strict isolation, use separate Redis databases (`SELECT n`) or separate Redis instances per tenant.

### Sensitive Data TTL Policy

Cached PII, session tokens, and auth credentials must have short TTLs aligned with security policy — not optimized purely for cache efficiency. A revoked auth token cached with TTL=3600 remains usable for up to an hour. A revoked session that the DB has invalidated is still valid from the cache's perspective until expiry.

Policy: cache only non-sensitive derived data where possible. For auth tokens and sessions, use explicit invalidation on revoke (write to a deny-list in the cache, checked on every auth decision) with a short TTL as the fallback. Never cache credentials with TTL > the credential's maximum validity window.

### Encryption at Rest & in Transit

**In transit:** Enable TLS between the application and cache nodes. Redis supports TLS natively (Redis 6+). Memcached requires a TLS-terminating sidecar (stunnel, Envoy). Without TLS, all cached data (including session tokens, PII, application secrets) is visible to anyone on the network path.

**At rest:** In-memory caches (Redis without persistence) have no at-rest concern — data only lives in RAM and is not written to disk. Redis with AOF or RDB persistence writes cache data to disk; encrypt the volume at the OS level. Managed services (ElastiCache, Redis Cloud, Upstash) provide volume encryption by default. Self-hosted deployments require explicit volume encryption configuration.

### Side-Channel Leakage via Timing Attacks on Cache Hits

Cache hit latency (~0.3ms) is measurably different from miss latency (~5ms + DB query time). An attacker who can observe or infer response time can determine whether a specific key is cached — leaking information about other users' recent activity.

Example: an attacker queries `GET /profile/{user_id}` for a large number of user IDs. Response times of ~1ms indicate a cache hit (the user was recently active); ~100ms indicates a miss (the user has not been active recently). This leaks user activity patterns without accessing any private data directly.

Practical mitigation is difficult — adding artificial response time noise is operationally impractical. Prefer architectural mitigation: avoid caching data whose mere existence (not just its value) is sensitive. Don't cache "is user X online" in a way that leaks presence to unauthenticated callers.

> 🎯 **Interview Lens** > **Q:** You're building a multi-tenant SaaS on a shared Redis cluster. What security controls do you implement?
> **Ideal answer:** (1) Key namespacing: all keys prefixed with `{tenant_id}:` enforced at the data layer. (2) No wildcard key operations — use SCAN with tenant prefix pattern only. (3) Short TTL for any PII or session data; explicit invalidation on logout/revoke. (4) TLS in transit. (5) If strict isolation is required, separate Redis instances per tenant tier (dedicated instances for enterprise tenants, shared for free tier). (6) Audit key access patterns — monitor for cross-tenant key access anomalies.
> **Common trap:** "We use separate key prefixes so tenants can't see each other's data." A Redis ACL misconfiguration or application bug can bypass prefix conventions. Enforce at the data layer with ACL rules, not just naming conventions.
> **Next question:** "A tenant's cache entry contains a Protobuf-encoded object. Another tenant's key accidentally gets the same hash value after a refactor. How does your system handle it?" → Namespace prefix collision only occurs if two tenants happen to have the same resource ID under the same namespace — which is prevented by the `{tenant_id}:` prefix, not by hash. If the prefix is missing due to a code bug, the collision is a data leak. This is why enforcement at the data access layer (not by convention) is critical.

**Key Takeaway:** Namespace keys by tenant, use short TTLs for sensitive data, enforce TLS in transit, and encrypt at rest if persistence is enabled. Cache poisoning and side-channel timing are the less obvious but interview-worthy threat vectors.

---

## Observability

**Interviewer TL;DR:** Hit rate is the primary SLO metric — set a target based on origin capacity headroom and alert on sustained deviation. Eviction rate and key distribution are the two leading indicators that something is about to go wrong.

**Mental model:** Three visibility layers: per-request tracing (why did this request miss?), per-consumer-group lag (is the cache keeping up?), and per-node health (is the infrastructure healthy?).

### Hit Rate as Primary SLO Signal

Hit rate = `cache_hits / (cache_hits + cache_misses)`. The target is derived from origin capacity: `min_hit_rate = 1 - (origin_max_rps / total_rps)`. Alert when hit rate drops below the target for more than 60 seconds — a sustained drop means either the working set grew beyond cache capacity, a deploy changed key structure (all old keys now miss), or a cache node failure.

Distinguish between cold misses (key never in cache — expected after deploy or cache restart) and warm misses (key was in cache but evicted — indicates memory pressure). Track both separately.

### Miss Latency vs Hit Latency Delta

The value delivered by the cache is `(miss_latency - hit_latency) × hit_rate`. If a DB optimization reduces miss latency from 50ms to 5ms, the cache saves much less per miss — the hit rate target should be revisited. Conversely, if miss latency spikes (DB under load), the cache becomes more valuable and hit rate target should increase.

Monitor the P99 hit latency and P99 miss latency separately. Alert when the delta shrinks (cache is delivering less value) or when hit latency itself climbs (cache node is under pressure).

### Eviction Rate — Sizing Alarm Threshold

Eviction rate = number of keys evicted per second due to memory pressure (not TTL expiry). Zero eviction at high memory utilization = working set fits; memory may be over-provisioned. Alert when eviction rate exceeds 1% of total operations/sec — this means the working set has grown beyond cache capacity and hot data is being evicted.

Before adding capacity, inspect which keys are being evicted: `redis-cli --hotkeys` (LFU mode) or `OBJECT FREQ key`. Large objects evicting many small objects indicate a sizing policy problem, not a capacity problem.

### Key Distribution — Hot Key Detection

Track per-key access frequency to detect hot keys before they become bottlenecks. Redis's `OBJECT FREQ key` command (LFU mode) returns the approximate access frequency of a key. At the application layer, a Count-Min Sketch provides memory-efficient frequency estimation across all keys.

Alert when any single key accounts for >1% of total cache operations — this is the threshold at which it becomes a potential bottleneck on its owning node. Investigate whether L1 shadow or key splitting is appropriate.

### Trace Context Through Cache Misses

A cache miss that triggers a slow DB query appears in monitoring as a DB latency spike with no visible upstream cause — the trace is broken at the cache boundary. Inject the originating request's trace ID into all cache-miss DB queries via a request-scoped context.

The complete trace should span: `HTTP request → cache key lookup → cache miss → DB query (with trace_id) → cache populate → HTTP response`. Without this, you cannot correlate a DB slow query with the upstream feature or user action that caused it.

> 🎯 **Interview Lens** > **Q:** Your cache hit rate dropped from 95% to 70% overnight. Walk me through your investigation.
> **Ideal answer:** (1) Was there a deploy? New code may use different cache key format — all old keys now miss; new keys haven't warmed yet. (2) Did eviction rate spike? If yes, working set grew beyond capacity — check for new data volume or larger object sizes. (3) Did traffic pattern change? New user segment or new feature accessing uncached data. (4) Did a cache node fail? Check cluster health — a failed node in a consistent-hashing cluster routes its keys to the next node; those keys are cold. (5) Check TTL distribution — did a mass expiry event coincide with the drop?
> **Common trap:** Going straight to "add more cache memory." The root cause could be a code change that invalidates all existing keys, which adding memory won't fix.
> **Next question:** "Hit rate is fine but P99 latency on cache hits increased from 0.5ms to 5ms. What's happening?" → The cache node is under load — CPU saturation (too many large commands, Lua scripts, or KEYS scans blocking the command thread), memory pressure causing frequent allocations, or network saturation. Check `redis-cli INFO` for `used_cpu_sys`, `mem_fragmentation_ratio`, `instantaneous_ops_per_sec`, and `connected_clients`.

**Key Takeaway:** Hit rate is the SLO; eviction rate and key distribution are the leading indicators. Trace context through cache misses is non-negotiable for debugging — without it, a cache miss and its downstream DB impact are invisible in your traces.

---

## Production Issues & Debugging

**Interviewer TL;DR:** Most cache incidents fall into four categories: sudden hit rate drop (key structure change or mass expiry), memory cascade (eviction → miss storm → re-population → more eviction), replication lag causing stale reads, and connection pool exhaustion masking as cache unavailability.

**Mental model:** Each failure mode has a specific detection signal and a recovery procedure. "Cache is slow" is not a diagnosis — name the failure mode, its cause, and its fix.

### Sudden Hit Rate Drop — Diagnosis Tree

```
Hit rate dropped suddenly?
  ├─ Recent deploy?
  │    └─ Check: did cache key format change? Old keys now miss entirely.
  │       Fix: warm new keys before cutover; use versioned key rollout.
  │
  ├─ Eviction rate spiked simultaneously?
  │    └─ Working set grew beyond capacity. Check: new feature, larger objects, more users.
  │       Fix: increase memory or reduce TTL on large/cold objects.
  │
  ├─ Cache node failure?
  │    └─ Consistent hashing: that node's keys are cold on the successor.
  │       Fix: pre-warm on node recovery; alert on node health before hit rate drops.
  │
  └─ Mass TTL expiry?
       └─ Uniform TTL set at startup or after last cache restart.
          Fix: TTL jitter; stagger cache population.
```

### Memory Pressure & OOM Eviction Cascade

When Redis approaches `maxmemory`, it evicts aggressively under the configured policy. Evictions increase miss rate → more DB queries → query results re-populated in cache → more memory consumed → more evictions. The cycle is self-reinforcing and can escalate quickly.

**Detection:** `redis-cli INFO stats | grep evicted_keys` rising rapidly. `used_memory` near `maxmemory`. Hit rate declining while eviction rate climbs.

**Break the cycle:**

1. Identify the largest keys: `redis-cli --bigkeys`
2. Reduce TTL on large or rarely-accessed keys to free memory faster
3. Switch eviction policy to `allkeys-lru` if not already — evicts any key based on recency, not just expired keys
4. Add memory capacity (scale up the Redis node or add a shard) as a medium-term fix

### Replication Lag Causing Stale Reads

**Symptom:** Users report seeing data they just updated revert to old values. Or: monitoring shows cache hits returning values that were invalidated minutes ago.

**Diagnosis:** `redis-cli INFO replication` on the replica — check `master_last_io_seconds_ago` and `master_repl_offset` vs `slave_repl_offset`. If the gap exceeds the TTL of affected keys, the replica is serving pre-invalidation data as though it were fresh.

**Fix:** Route write-sensitive reads to the primary for a configurable window after a write. Use Redis `WAIT numreplicas timeout` after critical writes to block until replication confirms — synchronous replication for the specific operations where freshness is required.

### Connection Pool Exhaustion Under Spike

**Symptom:** Cache timeout errors under load despite the cache node being healthy (low CPU, low latency). Error messages: "connection pool exhausted", "timed out waiting for connection."

**Diagnosis:** Compare `connected_clients` on the Redis node to `pool_size × num_application_instances`. If `connected_clients` is near or above `pool_size × instances`, the pool is saturated.

**Root causes:**

- Pool size too small for the traffic load
- Connection leak — application code acquires connections and fails to return them on exception paths
- Slow commands holding connections longer than expected (large LRANGE, HGETALL on large hashes, blocking commands)

**Fix:** Increase pool size: `pool_size = ceil(rps_per_instance × avg_latency_sec)`. Audit exception handling paths for connection release. Add pool exhaustion as an alert metric — before it causes user-visible errors.

> 🎯 **Interview Lens** > **Q:** Your service is throwing Redis timeout errors under load, but Redis CPU and memory look fine. What do you investigate?
> **Ideal answer:** Connection pool exhaustion. The cache is healthy but the application can't get a connection from the pool fast enough. Check: pool size configuration vs current rps and latency; `connected_clients` on Redis vs expected pool capacity; slow command log (`SLOWLOG GET`) for commands holding connections longer than expected. Fix: tune pool size, fix connection leaks, break up slow commands.
> **Common trap:** "Redis is fine, must be a network issue." Redis metrics (CPU, memory, ops/sec) can look healthy while the application is queueing for pool connections — these are application-side metrics, not Redis-side metrics.
> **Next question:** "After fixing the pool size, timeouts stop but P99 latency increases. Why?" → Larger pool means more concurrent commands — Redis's single command thread now processes more commands per second, increasing queue depth. Check `redis-cli INFO stats instantaneous_ops_per_sec` — if near the node's throughput ceiling, add a shard.

**Key Takeaway:** The four production failure modes — hit rate drop, eviction cascade, replication lag, pool exhaustion — each have a specific detection signal and a specific fix. Diagnosing by signal rather than symptom is the senior engineer response.

---

## Common Interview Gotchas

**"A short TTL solves cache consistency"**
TTL bounds staleness but does not guarantee correctness. A 1-second TTL on a payment status field can still return "pending" for up to 1 second after it transitions to "failed" — long enough to allow a race condition in a payment flow. For correctness-critical data, explicit invalidation or a DB fallback is required. TTL is the safety net, not the mechanism.

**"Cache-aside is safe under concurrent writes"**
Cache-aside has a race condition: two concurrent writers both update the DB, then both write to the cache. The second cache write may carry an older DB value than the first if the DB reads were interleaved. This produces a stale cache entry that survives until the next TTL expiry. Mitigate with CAS, or accept last-write-wins with a short TTL as the correction window — but name this explicitly in the design.

**"More cache nodes solves any throughput problem"**
Adding nodes helps when the bottleneck is distributed across keys. A hot key bottlenecked on a single node gets no benefit from adding nodes — consistent hashing routes it to the same node regardless of cluster size. Hot key mitigation (L1 shadow, key splitting) is a different solution entirely.

**"LRU is always the right eviction policy"**
LRU works well for temporal locality. For stable hot-key workloads (top products, top users), LFU outperforms LRU significantly — LRU may evict a product that wasn't accessed in the last hour even though it is accessed 1000 times per day. Worse, LRU is vulnerable to scan eviction: a full-table read evicts all hot keys from the LRU head.

**"Cache stampede only happens at high traffic"**
Stampedes happen whenever multiple concurrent requests hit a cold key simultaneously. At low traffic, fewer requests race; at high traffic, hundreds race. The fix (single-flight coalescing or PER) should be in place before traffic grows, not added reactively after an incident.

**"Redis exactly-once writes solve cache consistency"**
Redis `SET` is atomic, but cache-aside (read-DB → write-cache) is not. Between the DB read and cache write, another process may write a newer value to the DB. The first process overwrites the cache with a stale value. Redis atomicity guarantees the SET itself; it does not make the read-modify-write cycle atomic. Use `SET NX` (set if not exists) to prevent overwriting a value that was set by a concurrent process.

**"Invalidating the cache on write is always better than TTL"**
Invalidation requires the writer to know all cache keys affected by the change. For simple key-value relationships this is trivial. For aggregated data (leaderboards, search results, counts), the writer cannot enumerate all dependent keys without coupling to the cache key structure of every downstream service. TTL-based eventual consistency is often the correct architectural choice for aggregated data.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Expansion                                        |
| ------- | ------------------------------------------------ |
| TTL     | Time To Live                                     |
| LRU     | Least Recently Used                              |
| LFU     | Least Frequently Used                            |
| ARC     | Adaptive Replacement Cache                       |
| CAS     | Compare-And-Swap                                 |
| CDC     | Change Data Capture                              |
| PER     | Probabilistic Early Recomputation                |
| CDN     | Content Delivery Network                         |
| OOM     | Out of Memory                                    |
| PII     | Personally Identifiable Information              |
| HLC     | Hybrid Logical Clock                             |
| CRDT    | Conflict-free Replicated Data Type               |
| LWW     | Last Write Wins                                  |
| AOF     | Append-Only File (Redis persistence mode)        |
| RDB     | Redis Database (Redis snapshot persistence mode) |
| NTP     | Network Time Protocol                            |

### Write Strategy Selection Matrix

| Strategy      | Read Latency        | Write Latency     | Consistency | Durability Risk  | Best For                       |
| ------------- | ------------------- | ----------------- | ----------- | ---------------- | ------------------------------ |
| Cache-Aside   | Miss: DB + write    | DB only           | Eventual    | None             | Default; read-heavy            |
| Read-Through  | Same as cache-aside | DB only           | Eventual    | None             | Simpler app code               |
| Write-Through | Hit: cache only     | DB + cache (sync) | Strong      | None             | Fresh reads required           |
| Write-Behind  | Hit: cache only     | Cache (async DB)  | Eventual    | High (pre-flush) | Write-heavy, latency-sensitive |
| Refresh-Ahead | Always cache        | DB (background)   | Near-fresh  | None             | Predictable hot keys           |

### Eviction Policy Selection Matrix

| Policy  | Best For                                 | Key Weakness                                     |
| ------- | ---------------------------------------- | ------------------------------------------------ |
| LRU     | Temporal locality workloads              | Scan eviction; not frequency-aware               |
| LFU     | Stable hot-key workloads                 | New-entry starvation; frequency decay complexity |
| ARC     | Mixed recency + frequency                | Not in Redis natively; implementation complexity |
| FIFO    | Simple, predictable sequential workloads | No access-pattern awareness                      |
| S3-FIFO | Web cache traces, mixed workloads        | Newer; less battle-tested in production          |

### Anti-Patterns

- **Caching mutable financial or inventory data without explicit invalidation** — TTL alone is insufficient for correctness in any domain where stale data causes incorrect state transitions.
- **Using cache as primary storage** — the cache is a replica, not a source of truth. Any data that exists only in the cache and not in a durable store will be permanently lost on cache restart.
- **Uniform TTL at startup** — all keys expire simultaneously at T+TTL, causing a coordinated cache avalanche. Always add TTL jitter.
- **Cache-aside without handling the write race condition** — concurrent misses followed by interleaved DB reads can populate the cache with stale data. Use CAS or accept last-write-wins with a short TTL.
- **Wildcard key scanning in production Redis (`KEYS *`)** — O(N) operation that blocks the single-threaded command loop for the duration of the scan. Use `SCAN` with a cursor and pattern instead.
- **Single large cache for all data** — mixing hot/cold objects and large/small objects in one cache degrades eviction efficiency. Segment by access pattern and object size; use separate cache instances for data with different eviction policy requirements.
- **Ignoring eviction rate** — a non-zero sustained eviction rate is a silent signal that capacity planning is wrong. It will eventually cause hit rate degradation; address it before it does.
- **Caching without trace context propagation** — cache misses and their downstream DB queries become invisible in distributed traces. Always propagate trace IDs through cache-miss DB calls.

---

Linked Deep-Dive Files:

- caching-interview-scenarios.md
