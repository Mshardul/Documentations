# Message Queues

## Table of Content

1 PREREQUISITES
1.1 IPC Fundamentals (Shared Memory vs Socket I/O)
1.2 Network Reliability Fallacies (Latency, Partition, Congestion)
1.3 Concurrency Models (Thread-per-Core, Async I/O, Event Loop)
1.4 Data Serialization Trade-offs (Schema Evolution, Zero-Copy)
1.5 Distributed Metadata Coordination (Raft/Paxos Role in Cluster State)
1.6 Time & Clock Semantics (NTP Drift, Logical Clocks, Causality)

2 Core Architectural Paradigm
2.1 Decoupling Patterns (Temporal, Spatial, Load-Leveling)
2.2 Queue vs Log vs Pub/Sub Abstractions
2.3 Broker Topologies
2.3.1 Centralized Broker (Hub-and-Spoke)
2.3.2 Federated / Interconnected Clusters
2.3.3 Metadata-Controller vs Data-Plane Separation
2.4 Push vs Pull Consumer Models
2.4.1 Flow Control & Prefetch Windows
2.4.2 Credit-Based Backpressure
2.5 Brokerless / Direct Message Passing (ZeroMQ, Nanomsg) [LINKED DEEP-DIVE]
2.6 Message Routing Patterns (Content-Based, Header-Based, Topic Wildcards)

3 Message Lifecycle & State Management
3.1 Lifecycle Stages (Produced → Stored → Dispatched → Acknowledged → Compressed/Deleted)
3.2 Write Path Mechanics
3.2.1 OS Page Cache Utilization
3.2.2 Sequential I/O vs Random I/O Commit
3.2.3 Sync vs Async Flush (fsync FSYNC Trade-offs)
3.2.4 Write Barriers & Journal Commit Boundaries
3.3 Read Path Mechanics
3.3.1 Zero-Copy Transfer (sendfile / splice)
3.3.2 Read Amplification in Compressed Topics
3.4 Storage Backend Selection
3.4.1 Write-Ahead Log (WAL) & Segment Rotation
3.4.2 Index Structures (B-Tree vs LSM vs Time-Index)
3.4.3 Retention Policies & Tiered/Remote Storage Offload
3.5 Tombstones & Compaction Strategies
3.6 Index Corruption, WAL Replay & Crash Recovery Mechanics
3.7 Message Size Limits & Fragmentation Strategies

4 Reliability & Delivery Semantics
4.1 Guarantee Spectrum
4.1.1 At-Most-Once (Fire and Forget)
4.1.2 At-Least-Once (Acknowledgment Windows)
4.1.3 Exactly-Once (Idempotent Producer + Transactional Consume-Process-Produce)
4.2 Producer Idempotency & Duplicate Detection
4.2.1 PID/Epoch Fencing
4.2.2 Sequence Number Gaps
4.3 Consumer Offset Management
4.3.1 Automatic vs Manual Commit Trade-offs
4.3.2 Offset Reset Policies (Earliest, Latest, None)
4.3.3 Rebalancing-Induced Offset Storms
4.4 Transactions & Atomic Multi-Partition Writes
4.5 Durability & fsync Configuration (Unflushed Data Loss Windows)
4.6 Transaction Coordinator Failure & Timeout Rollback Mechanics
4.7 Consumer Acknowledgment Timeout & Redelivery Race Conditions

5 Concurrency, Ordering & Partitioning
5.1 Partitioning Logic
5.1.1 Round-Robin vs Sticky Partitioning
5.1.2 Semantic Partitioning (Key Hashing) & Hotspot Risks
5.1.3 Custom Partitioner Edge Cases
5.2 Ordering Guarantees
5.2.1 Global Ordering (Single Partition Bottleneck)
5.2.2 Per-Key Ordering with Parallel Consumers
5.2.3 Out-of-Order Detection & Handling
5.3 Consumer Group Rebalancing
5.3.1 Cooperative (Incremental) vs Eager (Stop-the-World)
5.3.2 Static Group Membership
5.3.3 Rebalance Timeout Tuning & Partition Ownership Transfer
5.4 Partition Leadership Transfer & Write Routing During Rebalance
5.5 Straggler Consumers & Lag-Induced Backpressure Cascades
5.6 Partition Reassignment & Data Migration Strategies

6 Backpressure, Flow Control & Load Shedding
6.1 Producer Side Flow Control
6.1.1 Blocking on Full Buffer vs Exception Propagation
6.1.2 Batching Strategies (Size, Time, Compression)
6.1.3 Client Quotas & Request Throttling (Per-User/Per-Topic)
6.2 Broker Side Protection
6.2.1 Memory Pool Exhaustion (OOM Killer Avoidance)
6.2.2 Throttling via TCP Window / Receive Buffer
6.3 Consumer Side Lag Mitigation
6.3.1 Pause / Resume Semantics
6.3.2 Circuit Breaker on Processing Backend
6.4 Dead Letter Queue (DLQ) Strategy
6.4.1 Poison Message Handling (Max Retries Exceeded)
6.4.2 Infinite Loop Prevention
6.5 Retry Queues vs DLQ (Exponential Backoff, Jitter, TTL)
6.6 Priority Inversion & Head-of-Line Blocking in Multi-Tenant Queues

7 Wire Protocol & Framing Patterns (Vendor-Adaptive)
7.1 AMQP 0-9-1 Model (Exchanges, Bindings, Routing Keys)
7.2 AMQP 1.0 Link-Based Credit Model [LINKED DEEP-DIVE]
7.3 STOMP / MQTT 5 (Session State, Will Messages)
7.4 Custom Binary Protocols (Length-Prefixed Framing, CRC Validation)
7.5 HTTP/2 & gRPC / Long-Polling Integration (Web/Edge Client Support)
7.6 Protocol Version Negotiation & Backward Compatibility

8 Security & Hardening
8.1 AuthN/Z & Credential Rotation (SASL, mTLS, OAuth2)
8.2 Multi-Tenant Isolation & ACL Granularity
8.3 Network Policies, Egress Filtering & TLS Cipher Enforcement
8.4 Payload Encryption vs Transport Encryption Trade-offs
8.5 Audit Logging & Compliance Trails (GDPR, PCI-DSS)

9 Observability & Operational Debugging
9.1 Critical Metrics & SLO Definitions
9.1.1 End-to-End Latency (P95, P99, P999)
9.1.2 Consumer Lag (Offset Delta & Time Lag)
9.1.3 Replica Sync Thresholds & Under-Replicated Partition Alerts
9.2 Tracing Propagation
9.2.1 Injecting Correlation IDs / Trace Context Headers
9.2.2 Measuring Queue Dwell Time
9.3 Audit & Logging
9.3.1 Retention of Unacknowledged State Dumps
9.3.2 Protocol Errors & Authentication Failures
9.4 Broker Internal Health (IOPS Saturation, Page Cache Hit Ratio, SafePoint/GC Pauses)
9.5 Synthetic Probes & Canary Consumers for End-to-End Health

10 Production Failure Modes & Recovery
10.1 Split-Brain & Fencing Tokens
10.2 Unclean Leader Election & Data Loss Scenarios
10.3 Thundering Herd on Broker Restart / Cache Warmup
10.4 Disk Full & Read-Only Partitions
10.5 Garbage Collection Pauses in Broker JVM (SafePoint Effects)
10.6 Network Partitions in Clustered Deployments (CAP Trade-offs)
10.7 Metadata Service / Controller Outage & Read-Only Fallback
10.8 Consumer Offset Metadata Corruption & Manual Reset Workflows
10.9 Clock Skew-Induced Ordering Violations in Multi-Region Setups

11 Performance Tuning & Capacity Planning
11.1 Batching & Compression Algorithm Selection (Zstd, LZ4, Snappy)
11.2 Socket Buffer Tuning (SO_RCVBUF, SO_SNDBUF, TCP_NODELAY)
11.3 Page Cache Dirty Ratio Tuning for Writes
11.4 Partition Count Scaling Limits (File Handle Exhaustion)
11.5 I/O Scheduler & Modern Storage Stacks (io_uring, Direct I/O, NVMe Queueing)
11.6 Topic/Partition Density Limits & Metadata Overhead Scaling
11.7 CPU Pinning & NUMA-Aware Broker Deployment

12 Advanced Architectural Patterns
12.1 Request-Reply Over Queues (Dynamic Reply-To Queues)
12.2 Competing Consumers vs Partitioned Work Queues
12.3 Priority Queues via Multi-Queue Head-of-Line Blocking
12.4 Delayed / Scheduled Message Delivery (Time-Wheel Data Structure)
12.5 Choreography vs Orchestration (Saga Pattern Integration)
12.6 Multi-Datacenter Replication (Active-Active vs Active-Passive, Conflict Resolution, RPO/RTO)
12.7 Stream-Table Duality & Stateful Processing Integration
12.8 Event Sourcing & CQRS Integration Patterns

13 Testing, Validation & Interview Scenario Bank
13.1 Chaos Engineering Scenarios (Network Latency Injection, Kafka Trogdor)
13.2 Load Testing Pitfalls (Producer Sync Bottlenecks, Coordinated Omission)
13.3 Configuration Linting & Static Analysis (Idempotent Producer Check)
13.4 Diagnostic CLI Commands & Output Interpretation
13.4.1 Consumer Group Describe (State: Stable, CompletingRebalance, Empty)
13.4.2 Topic Metadata (Leader Distribution, Under-Replicated Partitions)
13.5 Scenario: High-Throughput Financial Ledger (Ordering, Idempotency, Audit Trail, DLQ)
13.6 Scenario: Multi-Region Disaster Recovery Drill (Failover, Data Reconciliation, TO Validation)

14 Appendices
14.1 Acronyms & Abbreviations
14.1.1 ISR (In-Sync Replica)
14.1.2 DLQ (Dead Letter Queue)
14.1.3 WAL (Write-Ahead Log)
14.1.4 ALSO (Last Stable Offset)
14.1.5 HW (High Watermark)
14.1.6 LEO (Log End Offset)
14.2 Anti-Patterns Reference
14.2.1 Infinite Retry Loop without Backoff
14.2.2 Using Queue as Database of Record
14.2.3 Oversharding (Thousands of Partitions on Few Brokers)
14.3 Mental Model for Choosing Semantics (Decision Tree)
14.4 Decision Matrix: Queue vs Log vs Stream vs Event Bus (Latency, Retention, Consumer Model, Use Cases)
14.5 Anti-Pattern: Coupling via Payload Schema / Using MQ as Synchronous RPC
14.6 Quick Reference: Common CLI Commands by Vendor (Kafka, RabbitMQ, Pulsar)
