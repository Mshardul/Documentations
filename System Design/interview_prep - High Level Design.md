- [Design Concepts](#design-concepts)
  - [Scalability](#scalability)
    - [How do you design a system to be horizontally scalable?](#how-do-you-design-a-system-to-be-horizontally-scalable)
    - [What strategies do you use to handle spikes in user traffic while maintaining performance?](#what-strategies-do-you-use-to-handle-spikes-in-user-traffic-while-maintaining-performance)
    - [How would you structure a system to support millions of users?](#how-would-you-structure-a-system-to-support-millions-of-users)
  - [Consistency](#consistency)
    - [How would you handle eventual consistency in a distributed system?](#how-would-you-handle-eventual-consistency-in-a-distributed-system)
  - [Availability](#availability)
    - [How do you ensure high availability in a large-scale system?](#how-do-you-ensure-high-availability-in-a-large-scale-system)
  - [Fault Tolerance](#fault-tolerance)
    - [How would you implement fault tolerance in a distributed system?](#how-would-you-implement-fault-tolerance-in-a-distributed-system)
  - [Observability](#observability)
    - [How do you approach designing for observability (logs, metrics, traces)?](#how-do-you-approach-designing-for-observability-logs-metrics-traces)
  - [Security](#security)
    - [What are the best practices for securing a microservices-based architecture?](#what-are-the-best-practices-for-securing-a-microservices-based-architecture)
- [Architecture Patterns](#architecture-patterns)
  - [Microservice Architecture](#microservice-architecture)
    - [What are the trade-offs between monolithic and microservices architectures?](#what-are-the-trade-offs-between-monolithic-and-microservices-architectures)
    - [What are the pros and cons of synchronous vs asynchronous communication between services?](#what-are-the-pros-and-cons-of-synchronous-vs-asynchronous-communication-between-services)
  - [Multi-Tenant Architecture](#multi-tenant-architecture)
    - [How would you design a multi-tenant system?](#how-would-you-design-a-multi-tenant-system)
  - [Sharding](#sharding)
    - [What is sharding, and when would you use it?](#what-is-sharding-and-when-would-you-use-it)
  - [Real Time System](#real-time-system)
    - [How do you approach designing a real-time system?](#how-do-you-approach-designing-a-real-time-system)
  - [Authentication and Authorization](#authentication-and-authorization)
    - [How would you handle authentication and authorization in a distributed system?](#how-would-you-handle-authentication-and-authorization-in-a-distributed-system)
  - [CQRS](#cqrs)
    - [What is CQRS, and when should it be used?](#what-is-cqrs-and-when-should-it-be-used)
- [Data](#data)
  - [Data Replication](#data-replication)
    - [How would you handle data replication across multiple regions?](#how-would-you-handle-data-replication-across-multiple-regions)
  - [Schema Migration](#schema-migration)
    - [How would you handle schema migrations in a large-scale system?](#how-would-you-handle-schema-migrations-in-a-large-scale-system)
- [Tools](#tools)
  - [Message Queue](#message-queue)
    - [When would you use a message queue in your system?](#when-would-you-use-a-message-queue-in-your-system)
  - [Load Balancer](#load-balancer)
    - [What is the role of a load balancer, and what are its different types?](#what-is-the-role-of-a-load-balancer-and-what-are-its-different-types)
  - [API Gateway](#api-gateway)
    - [What are the considerations for designing an API gateway?](#what-are-the-considerations-for-designing-an-api-gateway)
- [Tradeoffs](#tradeoffs)
  - [CAP Theorem](#cap-theorem)
    - [What is a CAP theorem, and how does it affect system design?](#what-is-a-cap-theorem-and-how-does-it-affect-system-design)
  - [Write-Heavy vs Read-Heavy Systems](#write-heavy-vs-read-heavy-systems)
    - [What are the design considerations for a write-heavy vs read-heavy system?](#what-are-the-design-considerations-for-a-write-heavy-vs-read-heavy-system)
  - [DB: SQL vs NoSQL](#db-sql-vs-nosql)
    - [How would you decide between SQL and NoSQL for your system?](#how-would-you-decide-between-sql-and-nosql-for-your-system)
- [Retry Mechanisms](#retry-mechanisms)
  - [Retries and Backoff Mechanisms](#retries-and-backoff-mechanisms)
    - [What are different strategies to handle retries and backoff mechanisms?](#what-are-different-strategies-to-handle-retries-and-backoff-mechanisms)


# Design Concepts


## Scalability

### What strategies do you use to handle spikes in user traffic while maintaining performance?
`High Traffic` `Performance` `Scalability` `Sudden Spikes`
- **Auto Scaling**
    - Use cloud-native auto-scaling groups based on CPU/memory thresholds or queue depth.
    - Horizontal scaling (add more instances) > vertical (upgrade instance size) for elasticity.
- **Load Balancing**
    - Distribute load using application-layer (L7) or network-layer (L4) load balancers.
    - Use weighted, round-robin, or least-connections strategies.
- **Caching**
    - Cache hot data at multiple layers (CDN, reverse proxy like Varnish, in-memory like Redis).
    - Reduce redundant DB calls and expensive computations.
- **Queue-Based Decoupling**
    - Offload spike loads using async message queues (Kafka, RabbitMQ, SQS).
    - Allows background processing with elastic consumers.
- **Rate Limiting & Throttling**
    - Control abuse or accidental overload with IP/user-based limits.
- **Graceful Degradation**
    - Temporarily disable non-critical features (e.g., recommendations) under load.
- **Warm-Up Instances**
    - Pre-warm instances or lambdas to reduce cold start latency.
- **Quick Tips**
    - CDN at edge, Redis mid-tier, DB as last resort
    - Cache + Queue + AutoScale = Spike Survival Formula
    - Think "Scale Out, Not Up" (horizontal > vertical scaling).

### How would you structure a system to support millions of users?
`High Traffic` `Large-scale System` `Scalability`
- **Service-Oriented Architecture**
    - Break system into independently scalable microservices.
- **Scalable Data Layer**
    - Use sharded, horizontally scalable databases (e.g., Cassandra, DynamoDB).
    - Separate read and write workloads with read replicas.
- **Stateless Services**
    - Ensure app servers are stateless — store sessions in Redis or JWT.
- **Asynchronous Workflows**
    - Use background workers for non-blocking jobs like sending emails or logs.
- **Global Load Balancers + CDN**
    - Route user traffic regionally, cache assets close to users.
- **Data Partitioning + Isolation**
    - Use tenant-level isolation (for B2B), regional databases (for latency), or logical partitions.
- **Monitoring, Circuit Breakers, Throttling**
    - Prevent system collapse under pressure by isolating failing parts.
- **Quick Tips**
    - Think stateless + async + auto-scale.
    - Separate read/write paths, compute/storage, and critical vs non-critical paths.

## Consistency

### How would you handle eventual consistency in a distributed system?
`Consistency` `Distributed System` `Microservice Architecture`
- **Use Eventual Consistency by Design**
    - Accept temporary inconsistencies (e.g., counters, read-after-write) for higher availability.
- **Idempotent Operations**
    - Ensure retries don’t cause duplicates.
- **Retry + Dead Letter Queues**
    - Retry transient failures; move persistent ones to DLQ.
- **Conflict Resolution**
    - Use versioning (timestamps, vector clocks, CRDTs (Conflict-free Replicated Data Types)) to resolve divergent updates.
- **Read Repair + Background Sync**
    - Auto-correct inconsistent replicas asynchronously.
- **Stale Read Tolerance**
    - Display cached/stale data for non-critical reads with freshness indicators.
- **Sagas**
    - Break transactions into compensatable steps.
- **Quick Tips**
    - Prefer eventual consistency for non-critical data like logs, notifications.

## Availability

### How do you ensure high availability in a large-scale system?
`Availability` `Large-scale System`
- **Redundancy**
    - Deploy replicas across zones/regions.
- **Load Balancers**
    - Route traffic to healthy nodes, remove failed ones.
- **Failover Mechanisms**
    - Use DNS-level failover (Route53), standby databases, multi-master replicas.
- **Graceful Degradation**
    - Serve degraded experience instead of total failure.
- **Health Checks & Circuit Breakers**
    - Automatically reroute traffic from failed nodes.
    - Prevent cascading failures (e.g., Hystrix).
- **Infrastructure as Code (IaC)**
    - Enables fast recovery and reproducibility.
- **Quick Tips**
    - Think in terms of **remove single points of failure**.
    - Aim for **N+2 redundancy** (two extra nodes beyond expected load).

## Fault Tolerance
### How would you implement fault tolerance in a distributed system?
`Distributed System` `Fault Tolerance`
- **Retry & Timeout Logic**
    - Retry transient failures with exponential backoff.
- **Idempotency**
    - Ensure operations are repeatable without side effects.
- **Bulkheads**
    - Isolate components so one failure doesn’t bring down others.
- **Circuit Breaker Pattern**
    - Prevent overloading failed services.
- **Redundant Services**
    - Deploy across multiple zones or regions.
- **Graceful Degradation**
    - Drop non-critical services if needed (ads, personalization, etc.).
- **Self-Healing Infrastructure**
    - Auto-restart failed services (K8s probes, ECS health checks).
- **Quick Tips**
    - Think “retry + circuit + fallback + redundancy”.
    - Faults are inevitable — absorb, isolate, and recover.
    - Assume everything fails; design for it.

### Design a fault-tolerant system to survive regional cloud outages.
`Distributed System` `Fault Tolerance`
- **Active-Active or Active-Passive Across Regions**
    - Use global DNS failover and health checks.
- **Data Sync Across Regions**
    - Use cross-region replication (e.g., RDS, S3, DynamoDB Global Tables).
- **Stateless App Layer + Global Load Balancer**
    - App instances in both regions behind Route53/GCLB.
- **Shared Storage Consideration**
    - Avoid tight coupling to single-region storage (S3 with CRR or multi-region buckets).
- **Asynchronous Data Pipelines**
    - Buffer messages (Kafka/MQ) with durability in both regions.
- **Quick Tips**
    - Avoid stateful dependencies tied to a single region.

## Observability
### How do you approach designing for observability (logs, metrics, traces)?
`Observability` `Logging` `Metrics` `Monitoring`
- **Structured Logging**
    - Use Structured JSON logs with correlation IDs.
- **Metrics**
    - Use Prometheus, CloudWatch, or Datadog to track KPIs (latency, throughput, error rate).
- **Distributed Tracing**
    - OpenTelemetry, Jaeger, or Zipkin for tracing inter-service calls.
- **Dashboards + Alerting**
    - Use Grafana for dashboards; define SLO-based alerts.
- **Log Aggregators**
    - Use ELK/EFK stack to centralize logs.
- **Quick Tips**
    - "3 Pillars: Logs, Metrics, Traces".
    - Always pass a trace ID across services.
    - "If you can’t measure it, you can’t improve it".

## Security
### What are the best practices for securing a microservices-based architecture?
`Security` `Microservice Architecture`
- **Zero Trust Principle**
    - Treat every service as untrusted; authenticate each call.
- **API Gateway + Identity Provider**
    - OAuth2/JWT + rate limiting at entry point.
- **Service-to-Service Auth**
    - Use mTLS or service mesh like Istio.
- **Secrets Management**
    - Vault, AWS Secrets Manager – never hardcode secrets.
- **Least Privilege Access**
    - Fine-grained IAM roles for each service.
- **Quick Tips**
    - Never trust internal network implicitly.

### How do you secure APIs against common vulnerabilities (e.g., SQLi, XSS)?
`API` `Microservice Architecture` `Security`
- **Input Validation & Sanitization**
    - Use allow-lists; never trust input from client.
- **Prepared Statements**
    - Prevent SQLi via parameterized queries.
- **Content Security Policy (CSP)**
    - Helps mitigate XSS.
- **Rate Limiting**
    - Throttle suspicious clients.
- **Authentication + Authorization**
    - Use strong identity checks (OAuth2, RBAC/ABAC).

## Caching
### How would you design a caching layer to minimize database load while avoiding stale data?
`Caching` `Database`
- **Layered Caching**
    - CDN (Edge) for static assets.
    - Application Cache (e.g., Redis, Memcached) for frequently queried DB rows or computed results.
- **Cache Invalidation Strategies**
    - Write-through: Update cache and DB synchronously.
    - Write-around: Write directly to DB, cache only on reads.
    - Write-back (write-behind): Update cache first; DB is updated later asynchronously (risky but fast).
- **TTL (Time-to-Live)**
    - Set TTLs based on staleness tolerance. Aggressive TTL for high freshness.
- **Cache Busting**
    - Use versioned cache keys or event-driven invalidation (e.g., on data update, invalidate cache).
- **Read-Through**
    - App fetches from cache, and on miss, from DB → then populates cache.

### What are the trade-offs between write-through and write-around caching?
`Caching` `Write-through Caching` `Write-around Caching`
- **Write-through Caching**
    - Data always in sync (no stale data)
    - Slower writes (cache + DB)
    - Use Case: Reads are very frequent → data must be fresh (e.g., product prices).
- **Write-around Caching**
    - Faster writes (only to DB)
    - Potential for stale or missing cache
    - Use Case: Writes are frequent, but reads are rare (e.g., audit logs).
- Quick Tips
    - For read-heavy workloads → prefer write-through.
    - For write-heavy workloads → prefer write-around.

### How do you ensure data freshness in highly cached systems?
`Caching` `Data Freshness` `Latency` `Staleness`
- **Short TTLs**
    - Use shorter expiry times for frequently changing data.
- **Versioned Keys**
    - Invalidate old cache keys by changing version (e.g., user:v2:123).
- **Event-Based Invalidation**
    - Publish events (via Kafka/SNS) when source-of-truth changes.
- **Stale-While-Revalidate**
    - Serve stale data while updating cache in background.
- **Active Monitoring**
    - Track cache hit/miss ratio and stale data complaints.

## Rate Limiting
### How do you design a rate-limiting system for geographically distributed APIs?
`API` `Distributed System` `Rate Limiting`
- **Token Bucket/Leaky Bucket Algorithms**
    - Control request rate with flexibility (burst handling) or smoothing.
- **Distributed Coordination**
    - Use centralized in-memory store (e.g., Redis Cluster) or edge-local caches + eventual sync.
- **CDN/Edge Rate Limiting**
    - Offload early (e.g., Cloudflare Workers, API Gateway throttles).
- **Per-User/IP/Endpoint Limits**
    - Fine-grained controls (avoid global limits).
- **Real-time Feedback to Clients**
    - HTTP 429 + headers indicating retry time.
- **Regional Load-Shedding**
    - Gracefully shed excess load in hotspots to protect core services.

## Reliability
### What are the best practices to improve system reliability over time?
`Best Practices` `Reliability`
- **Redundancy + Failover**
	- No single points of failure — everything must be redundant.
- **Observability + Alerting**
    - Early detection of issues reduces MTTR.
- **Chaos Engineering**
    - Test failure scenarios (Netflix’s Chaos Monkey model).
- **Blameless Postmortems**
    - Encourage learning from failure, not finger-pointing.
- **SLIs, SLOs, SLAs**
    - Define and track service objectives (e.g., 99.9% availability).
- **Safe Deployments**
    - Use blue-green, canary, and feature flags.

## Service Level Objectives
### How do you define and measure SLAs, SLOs, and SLIs in system design?
`Observability` `Reliability` `SLA` `SLI` `SLO`
- **SLA (Agreement)**
    - External commitment (e.g., 99.9% uptime or refunds triggered).
- **SLO (Objective)**
    - Internal target (e.g., 99.95% availability).
- **SLI (Indicator)**
    - Metric used to measure performance (e.g., request latency, error rate).
- **Examples**
    - SLI: % of successful requests**
    - SLO: 99.95% requests should succeed over 30 days**
    - SLA: 99.9% or client gets credit.
- **Tracking Tools**
    - Prometheus + Grafana for metric collection and alerting.
- **Quick Tips

## Maintainability
### How do you design a system that’s easy to maintain and evolve?
`Maintainability` `Refactoring`
## Configuration Management
### How do you manage configuration across environments (dev/stage/prod)?
`Configuration` `DevOps` `Environment Management`
## Concurrency
### What are strategies for managing millions of concurrent connections?
`Concurrency` `Connection Pooling` `Performance`

# Architecture Patterns
## Microservice Architecture
### What are the trade-offs between monolithic and microservices architectures?
`Distributed System` `Microservice Architecture` `Monolithic Architecture`
### What are the pros and cons of synchronous vs asynchronous communication between services?
`Asynchronous Communication` `Synchronous Communication` `Microservice Architecture`
### How would you handle distributed transactions in a microservices environment?
`Distributed System` `Microservice Architecture` `Transaction`
### Design a service discovery mechanism for a dynamic microservices ecosystem.
`Distributed System` `Microservice Architecture` `Service Discovery`
### When would you combine monolithic and microservices in a hybrid system?
`Hybrid Architecture` `Microservices Architecture` `Monolith Architecture`
## Multi-Tenant Architecture
### How would you design a multi-tenant system?
`Multi-Tenant System`
## Sharding
### What is sharding, and when would you use it?
`Database` `Distributed System` `Sharding`
## Real-time System
### How do you approach designing a real-time system? What are the key challenges, how would you handle those?
`Challenges` `High Throughput` `Latency` `Low Latency` `Real-time System` `Throughput`
### How do you handle backpressure in real-time data pipelines?
`Backpressure` `High Throughput` `Real-time System` `Throughput`
## Authentication and Authorization
### How would you handle authentication and authorization in a distributed system?
`Authentication` `Authorization` `Distributed System`
## CQRS
### What is CQRS, and when should it be used?
`CQRS` `Distributed System`
## Idempotency
### Discuss idempotency in APIs. How would you design an idempotent payment service?
`Idempotency` `API`
## Event-Driven Architecture
### What are the benefits and pitfalls of event-driven architecture?
`Asynchronous Communication` `Event-Driven Architecture` `Loose Coupling`
### How would you design an event-driven system to ensure exactly-once message processing?
`Event-Driven Architecture` `Idempotency` `Message Processing`
## SAGA Pattern
### What is SAGA Pattern and when is it appropriate to use? How do you implement compensating transactions in a saga-based workflow?
`Distributed System` `Saga Pattern` `Transactions` `Rollback`
## Bulkhead Pattern
### What is a Bulkhead Pattern? How would you isolate failures in a microservices architecture using the bulkhead pattern?
`Bulkhead Pattern` `Fault Tolerance` `Microservice Architecture` `Resilience`
## Leader-Follower Pattern
### Compare leaderless replication (Dynamo-style) vs. leader-follower replication (Kafka-style).
`Consistency` `Data Replication`  `Leaderless Replication` `Leader-Follower Replication`
## Backend-for-Frontend (BFF)
### What is the Backend-for-Frontend pattern and why is it useful?
`API Gateway` `Backend-for-Frontend` `BFF` `Backend` `Frontend`


# Data
## Data Replication
### How would you handle data replication across multiple regions?
`Data Replication`
### Discuss strategies for database replication (master-slave vs. multi-master).
`Database` `Distributed System` `Database Replication`
## Schema Migration
### How would you handle schema migrations in a large-scale system?
`Large-scale System` `Schema Migration`
## Data Migration
### How would you handle data migration in a live system with zero downtime?
`Data Migration` `Live System` `Zero Downtime`
## Database Connection Pooling
### How do you manage database connection pooling efficiently under high concurrency?
`Concurrency` `Database` `Database Connection Pooling` `High Concurrency`
## Data Integrity
### How would you design a schema-less database to enforce data integrity?
`Data Integrity` `Database` `Schema-less Database`
## Data Partitioning
### How would you handle data skew in a partitioned database system?
`Data` `Data Skew` `Partitioning` `Sharding`
### How would you implement a distributed lock for coordinating access to shared resources?
`Concurrency` `Database` `Distributed Locking` `Distributed System`
## Data Versioning
### How would you handle schema evolution in a backward-compatible way?
`Backward Compatibility` `Database` `Database Schema` `Database Schema Evolution`
## Write Amplification
### What is write amplification, and how does it affect database design?
`Database Internals` `Storage` `Write Amplification`
## Data Expiry
### How do you handle data expiration and archival in large-scale systems?
`Archival` `Data Expiry` `Data Lifecycle`
## Hot & Cold Data Separation
### How would you design for hot and cold data separation in analytics systems?
 `Analytics` `Cold Data` `Data Partitioning` `Hot Data`


# Tools
## Message Queue
### When would you use a message queue in your system?
`Message Queue`
### When would you choose message queues (e.g., Kafka) over traditional pub-sub systems?
`Message Queue` `Publisher-Subscriber`
## Load Balancer
### What is the role of a load balancer, and what are its different types? Describe algorithms, with their ideal use cases.
`Load Balancer`
## API Gateway
### What are the considerations for designing an API gateway?
`API Gateway`
## REST
### What are RESTful API design best practices?
`API Design` `Best Practices` `REST`
## CDN
### How do CDNs improve latency, and what are their limitations?
`CDN` `Latency` `Low Latency`
## Service Mesh
### What role does a service mesh play in a microservices ecosystem?
`Microservice Architecture` `Observability` `Service Mesh`


# Tradeoffs
## CAP Theorem:
### What is a CAP theorem, and how does it affect system design?
`CAP Theorem` `Consistency` `Availability` `Partition Tolerance`
### How do you choose between consistency and partition tolerance in practice?
`CAP Theorem` `Consistency` `Availability` `Partition Tolerance`
## Write-Heavy vs Read-Heavy Systems
### What are the design considerations for a write-heavy vs read-heavy system?
`Read-Heavy System` `Write-Heavy System`
## DB: SQL vs NoSQL
### How would you decide between SQL and NoSQL for your system?
`Database` `SQL` `NoSQL`
## Distributed System: Data Consistency vs Latency
### How do you ensure data consistency across distributed services without sacrificing latency?
`Data Consistency` `Distributed System` `Latency`
## API Design: REST vs gRPC
### Compare REST and RPC communication styles in distributed systems.
`API Design` `gRPC` `REST`
## Scaling: Horizontal vs Vertical
### Compare horizontal and vertical scaling. When is each approach preferable?
`Horizontal Scaling` `Scaling` `Vertical Scaling`
## Consistency: Eventual vs Strong Consistency
### Compare eventual consistency vs. strong consistency in distributed databases.
`Consistency` `Distributed System` `Eventual Consistency` `Strong Consistency`
## DB: Indexing vs Write Performance
### What are the trade-offs between database indexing and write performance?
`Database` `Indexing` `Write Performance`
## State Architecture: Stateful vs Stateless
### What are the trade-offs between stateless and stateful service architectures?
`Scalability` `Stateful Architecture` `Stateless Architecture`
## Data Transfer Protocols: TCP vs UDP
### What are the trade-offs between TCP and UDP in real-time communication systems?
`Real-time System` `Latency` `TCP` `UDP`
## Consistency: Linearizable vs Sequential
### How does linearizable consistency differ from sequential consistency?
`Consistency` `Consistency Models` `Distributed System` `Linearizable Consistency` `Sequential Consistency`
## Deployment Strategies: Blue-Green vs Canary
### Compare blue-green deployment vs. canary releases for zero-downtime updates.
`Blue-Green Deployment` `Canary Deployment` `Deployment` `Deployment Strategies` `Zero Downtime`


# Failures
## Retries and Backoff Mechanisms
### What are different strategies to handle retries and backoff mechanisms?
`Retries` `Backoff Mechanisms`
## Cascading Failures
### Design a strategy to mitigate cascading failures in a microservices architecture.
`Cascading Failures` `Microservice Architecture`
## Partial Failurs
### How would you handle partial failures in a distributed transaction?
`Distributed System` `Idempotency` `Partial Failures` `Transactions`
## Graceful Degradation
### What is graceful degradation and how do you design for it?
`Graceful Degradation` `Resilience` `User Experience`
