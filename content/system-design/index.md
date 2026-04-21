# System Design Wiki

Interview-ready reference. Two entry points: start from a component and build up, or start from an HLD and drill down.

---

## Components

Foundational building blocks. Each page covers mechanics, trade-offs, failure modes, and production patterns.

| Component                                                                      | Description                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [Message Queues](./components/message-queues.md)                               | Async messaging, delivery semantics, backpressure, partitioning  |
| [DNS](./components/dns.md)                                                     | Domain resolution, record types, caching, propagation            |
| [Load Balancer](./components/load-balancer.md)                                 | Traffic distribution, algorithms, health checks, L4 vs L7        |
| [CDN](./components/cdn.md)                                                     | Edge caching, cache invalidation, origin offload                 |
| [Caching](./components/caching.md)                                             | In-memory caching, eviction policies, distributed cache patterns |
| [Databases](./components/databases.md)                                         | SQL vs NoSQL, indexing, replication, consistency models          |
| [API Gateway](./components/api-gateway.md)                                     | Routing, auth, rate limiting, request transformation             |
| [Rate Limiter](./components/rate-limiter.md)                                   | Throttling strategies, distributed rate limiting                 |
| [Proxies](./components/proxies.md)                                             | Forward vs reverse proxy, use cases, TLS termination             |
| [Service Discovery](./components/service-discovery.md)                         | Client-side vs server-side, health registration, DNS-based       |
| [WebSockets / SSE / Long Polling](./components/websockets-sse-long-polling.md) | Real-time communication patterns, trade-offs                     |
| [Blob / Object Storage](./components/blob-object-storage.md)                   | Binary storage, chunking, multipart upload, durability           |
| [Distributed File System](./components/distributed-file-system.md)             | Block storage, metadata management, fault tolerance              |
| [Search](./components/search.md)                                               | Inverted index, relevance ranking, distributed search            |

---

## Algorithms & Concepts

Core algorithms and distributed systems concepts that appear across multiple HLDs.

| Topic                                                                | Description                                                     |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Consistent Hashing](./algorithms/consistent-hashing.md)             | Ring-based key distribution, virtual nodes, rebalancing         |
| [Bloom Filter](./algorithms/bloom-filter.md)                         | Probabilistic set membership, false positives, space trade-offs |
| [CAP Theorem](./algorithms/cap-theorem.md)                           | Consistency, availability, partition tolerance trade-offs       |
| [ACID vs BASE](./algorithms/acid-vs-base.md)                         | Transaction guarantees, eventual consistency                    |
| [Replication Strategies](./algorithms/replication-strategies.md)     | Leader-follower, multi-leader, leaderless                       |
| [Sharding Strategies](./algorithms/sharding-strategies.md)           | Range, hash, directory-based sharding                           |
| [Rate Limiting Algorithms](./algorithms/rate-limiting-algorithms.md) | Token bucket, leaky bucket, sliding window                      |
| [Circuit Breaker](./algorithms/circuit-breaker.md)                   | Failure detection, states, fallback strategies                  |
| [Consensus (Raft / Paxos)](./algorithms/consensus-raft-paxos.md)     | Leader election, log replication, split-brain prevention        |
| [Saga Pattern](./algorithms/saga-pattern.md)                         | Distributed transactions, choreography vs orchestration         |

---

## HLD: Interview Systems

End-to-end system design walkthroughs. Each page includes prerequisites, a TLDR, full architecture, and an interview scenario bank.

| System                                                            | Key Themes                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------- |
| [URL Shortener](./hld/url-shortener.md)                           | Hashing, redirects, analytics, scaling reads               |
| [Twitter / News Feed](./hld/twitter-news-feed.md)                 | Fan-out, timeline generation, celebrity problem            |
| [WhatsApp / Chat System](./hld/whatsapp-chat-system.md)           | WebSockets, message ordering, delivery guarantees          |
| [YouTube / Video Streaming](./hld/youtube-video-streaming.md)     | Chunked upload, transcoding, CDN, adaptive bitrate         |
| [Uber / Ride Sharing](./hld/uber-ride-sharing.md)                 | Geo-indexing, real-time matching, surge pricing            |
| [Google Drive / File Storage](./hld/google-drive-file-storage.md) | Chunking, deduplication, sync conflict resolution          |
| [Web Crawler](./hld/web-crawler.md)                               | BFS/DFS, politeness, deduplication, scheduling             |
| [Search Autocomplete](./hld/search-autocomplete.md)               | Trie, top-k, personalization, latency                      |
| [Notification System](./hld/notification-system.md)               | Push/pull, fan-out, delivery guarantees, retries           |
| [Ticketmaster / Booking](./hld/ticketmaster-booking.md)           | Inventory locking, concurrency, seat reservation           |
| [Distributed Cache](./hld/distributed-cache.md)                   | Consistent hashing, eviction, replication, thundering herd |
| [Payment System](./hld/payment-system.md)                         | Idempotency, exactly-once, ledger design, fraud detection  |
| [Distributed ID Generator](./hld/distributed-id-generator.md)     | Snowflake IDs, clock skew, monotonicity                    |
| [Key-Value Store](./hld/key-value-store.md)                       | LSM tree, compaction, replication, consistency             |

---

## How to Use

**Flow 1 — Build up:** Pick a component → read it end-to-end → follow links to related components → then tackle an HLD.

**Flow 2 — Drill down:** Pick an HLD → read the architecture → click through to any component or algorithm page you need to revisit.

---

## Contributing

- Component pages: follow `./_meta/AI-instructions-components.md`
- HLD pages: follow `./_meta/AI-instructions-hld.md`
