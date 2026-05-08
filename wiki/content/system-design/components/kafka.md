# Kafka

## Prerequisites

- **[Message Queues](./message-queues.md)** [Must read] - Kafka is a distributed log; delivery semantics, partitioning, consumer groups, and ISR are covered there and not repeated here. Return to specific sections via the links throughout this page.
- **[Consensus (Raft / Paxos)](../algorithms/consensus-raft-paxos.md)** [Recommended] - KRaft uses Raft for cluster metadata consensus; foundational for reasoning about broker leader election and failover.
- **[Replication Strategies](../algorithms/replication-strategies.md)** [Recommended] - ISR and leader-follower replication are the durability backbone; required for understanding `acks=all` and unclean leader election.

---

## Table of Contents

- [Quick Decision Guide](#quick-decision-guide)
- [Architecture](#architecture)
- [KRaft: Raft-Based Metadata](#kraft-raft-based-metadata)
- [Storage Internals](#storage-internals)
- [Producer Internals & Configuration](#producer-internals--configuration)
- [Consumer Internals & Configuration](#consumer-internals--configuration)
- [Topic & Broker Configuration](#topic--broker-configuration)
- [Cluster Operations](#cluster-operations)
- [Security & Multi-Tenancy](#security--multi-tenancy)
- [Observability & Monitoring](#observability--monitoring)
- [Managed Offerings](#managed-offerings)
- [Kafka Ecosystem](#kafka-ecosystem)
- [Production Failure Modes & Recovery](#production-failure-modes--recovery)
- [Common Interview Gotchas](#common-interview-gotchas)
- [Appendices](#appendices)

---

## TLDR

Kafka is a distributed append-only log built for high-throughput, fault-tolerant event streaming. Unlike a work queue, messages are retained after consumption — independent consumer groups read the same topic at their own pace and can replay from any offset. The central operational trade-off is partition count: more partitions unlock more parallelism but cannot be reduced without recreating the topic. KRaft (Kafka Raft Metadata) eliminated the ZooKeeper dependency in Kafka 3.x, co-locating metadata consensus with the broker layer.

---

---

## Quick Decision Guide

**Interviewer TL;DR:** Kafka wins when multiple independent consumers need to read the same event stream, replay from any offset, or sustain millions of messages per second. If neither replay nor fan-out is required, SQS or RabbitMQ offer the same async decoupling with far lower operational cost.

**Mental model:** Kafka is a filing cabinet, not a post box — messages stay after delivery, any reader opens any drawer independently, and nothing disappears until the retention window expires.

### Kafka vs Alternatives

```
Need replay or independent consumer groups reading the same events?
  ├─ YES ──▶ High throughput (>100k msgs/sec) or need Connect / Streams ecosystem?
  │            ├─ YES ──▶ Kafka
  │            └─ NO  ──▶ Kinesis (managed, lower ops, AWS-native)
  │                        or Google Pub/Sub (fully managed, no partition planning)
  │
  └─ NO (each message processed by exactly one consumer — work queue pattern)
       ├─ Need flexible routing (exchange types, wildcard topics, header matching)?
       │    └─ YES ──▶ RabbitMQ
       │
       └─ Simple task offload, cloud-native, zero ops?
            └──▶ SQS Standard (at-least-once) or SQS FIFO (per-group ordering)
```

**Kafka vs Kinesis** — the closest comparison, since both are log-based:

| Dimension        | Kafka                                           | Kinesis                                  |
| ---------------- | ----------------------------------------------- | ---------------------------------------- |
| Partition model  | Partitions (user-defined, cannot shrink)        | Shards (split/merge ops available)       |
| Retention        | Configurable — days to infinite                 | 1–365 days                               |
| Write throughput | ~10–50 MB/s per partition                       | 1 MB/s write per shard                   |
| Ops burden       | High — cluster sizing, KRaft, partition ops     | Low — fully managed                      |
| Ecosystem        | Kafka Streams, Connect, ksqlDB, Schema Registry | Kinesis Data Analytics (Flink managed)   |
| Best for         | Self-managed, high throughput, rich ecosystem   | AWS-native, moderate throughput, low ops |

### When Not to Use Kafka

The [message-queues.md](./message-queues.md#when-not-to-use-a-message-queue) covers the general case — these are scenarios where async messaging is right but Kafka specifically is the wrong choice:

- **Work queue pattern** — if each message is processed by exactly one consumer, Kafka's log model adds complexity with no benefit. Use SQS or RabbitMQ.
- **Low volume (<~1k msgs/min)** — a production Kafka cluster (minimum 3 brokers) carries real operational weight for low throughput. A DB-backed queue (`SKIP LOCKED`) or Redis list is simpler.
- **Team has no Kafka expertise** — partition planning, consumer group tuning, KRaft operations, and monitoring are non-trivial. Kinesis or Pub/Sub are managed alternatives.
- **Serverless / event-driven on cloud** — SQS + Lambda is zero-ops; Kafka requires always-on brokers.
- **Complex message routing** — RabbitMQ's exchange model (topic wildcards, header routing, fanout) is richer than Kafka's topic + partition key.
- **Short-lived messages (seconds to minutes)** — SQS visibility timeout fits; Kafka's retention model is operationally awkward for ephemeral tasks.

> ⚖️ **Decision Framework**
> Three questions: (1) Do multiple independent consumers need the same events? (2) Is replay required? (3) Is throughput >100k msgs/sec or is the Kafka ecosystem (Streams, Connect) needed? Three "no"s → SQS or RabbitMQ. Any "yes" → Kafka or Kinesis. Then: managed > control? → Kinesis. Need full ecosystem or self-managed control? → Kafka.

> 🎯 **Interview Lens** > **Q:** When would you choose Kinesis over Kafka?
> **Ideal answer:** Both are log-based, but Kinesis is fully managed — no broker sizing, no partition reassignment tooling, no KRaft operations. The throughput ceiling is lower per shard (1 MB/s write vs ~10–50 MB/s per Kafka partition), and the ecosystem is thinner. Choose Kinesis when you're AWS-native, throughput is moderate, and ops burden is the primary constraint. Choose Kafka when you need the ecosystem, exceed Kinesis shard throughput, or require self-managed control.
> **Common trap:** "Kafka scales better." Kinesis scales too — via shard splits. The real distinction is ops burden and ecosystem depth, not raw scalability.
> **Next question:** "You're hitting the Kinesis shard throughput ceiling. What do you do?" → Split shards (built-in operation). If requirements have grown beyond Kinesis economics at scale, migrate to Kafka — but plan for a non-trivial migration.

**Key Takeaway:** Kafka's log model is the right choice when multiple independent consumers need the same event stream or replay capability. For task queues, SQS or RabbitMQ. For managed log streaming on AWS, Kinesis. Never choose Kafka for the sake of familiarity — its operational weight is real.

---

## Architecture

**Mental model:** Kafka is a filing cabinet, not a mailbox. A letter dropped in a mailbox is gone once picked up. A letter filed in a cabinet stays — any reader can open any drawer independently, re-read from any point, and reading never removes anything.

### Core Primitives

Every Kafka concept builds on these six terms. Read them once before going further.

| Term                  | One-line definition                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Event / Record**    | A single message: a key, a value, a timestamp, and optional headers. The atomic unit.                                                                                                                            |
| **Topic**             | A named logical stream. Producers write to a topic; consumers read from a topic. Think table name, not queue.                                                                                                    |
| **Partition**         | The physical storage unit of a topic — an ordered, append-only log on disk. A topic with N partitions supports up to N parallel consumers.                                                                       |
| **Broker**            | A server (JVM process) in the Kafka cluster. Stores partitions, serves reads and writes from producers and consumers.                                                                                            |
| **Replica**           | A copy of a partition stored on a different broker. `replication.factor=3` → 3 copies across 3 brokers. Losing one broker doesn't lose data.                                                                     |
| **Leader / Follower** | One replica per partition is the **leader** — it handles all reads and writes. The others are **followers** — they silently copy from the leader. If the leader's broker dies, a follower is promoted to leader. |

Everything else — ISR, High Watermark, consumer groups, offsets — builds on these six.

**Interviewer TL;DR:** A topic is split into partitions (parallelism unit); each partition is replicated across brokers (durability unit). Only data acknowledged by all in-sync replicas is visible to consumers — that visibility safety line is the High Watermark.

### Topic, Partition, Replica

```
Topic: orders  (3 partitions, replication factor 3)

Broker 1             Broker 2             Broker 3
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ P0 [Leader] │      │ P0 [Follow] │      │ P0 [Follow] │
│ P1 [Follow] │      │ P1 [Leader] │      │ P1 [Follow] │
│ P2 [Follow] │      │ P2 [Follow] │      │ P2 [Leader] │
└─────────────┘      └─────────────┘      └─────────────┘
```

Each broker holds one replica of each partition — never two replicas of the same partition on the same broker. For `orders` above: P0's leader is on Broker 1, P1's on Broker 2, P2's on Broker 3. Spread is intentional — any single broker failure takes down only followers for the surviving leaders.

- **Partition count** — fixed at topic creation. Cannot be reduced. Determines max parallelism: one active consumer per partition per consumer group.
- **`replication.factor`** — number of copies. Losing up to `replication.factor − 1` brokers does not lose data.
- **Follower reads** — disabled by default; the leader handles all reads and writes. Kafka 2.4+ added optional follower fetching for cross-AZ latency reduction, but the leader still arbitrates all writes.

### Broker

A broker is a JVM process that stores partition replicas and serves producer/consumer requests.

- Each partition-replica lives on exactly one broker.
- A broker typically holds replicas for many different topics and partitions — it is not dedicated to one topic.
- In KRaft mode, a subset of brokers also act as **controllers** (they run the metadata quorum). In ZooKeeper mode, a single elected broker held controller duties. More in [KRaft: Raft-Based Metadata](#kraft-raft-based-metadata).

### Segment Files

Each partition maps to a directory on the broker's disk containing a sequence of segment files:

```
/kafka-logs/orders-0/                    ← partition 0 of topic "orders"
  00000000000000000000.log               ← segment: binary message data
  00000000000000000000.index             ← sparse offset → byte-position index
  00000000000000000000.timeindex         ← sparse timestamp → offset index
  00000000000000084423.log              ← newer segment, starts at offset 84423
  00000000000000084423.index
  00000000000000084423.timeindex
```

- **Active segment** — the last segment, still being appended to. All others are sealed and immutable.
- **`.index` file** — sparse offset-to-byte-position map. Kafka binary-searches this to seek to a specific offset without scanning the full log. Sparse means not every offset is indexed — Kafka interpolates and scans forward from the nearest entry.
- **`.timeindex` file** — sparse timestamp-to-offset map. Used for `--reset-offsets --to-datetime` operations.
- **Segment filename** — the base offset of that segment (the first message offset it contains). Kafka binary-searches filenames to locate the right segment for a given offset — O(log n) segment discovery.

### In-Sync Replicas (ISR)

The ISR is the set of replicas considered fully caught up with the leader. A follower is removed from ISR when it falls more than `replica.lag.time.max.ms` (default: 30 s) behind the leader's log end offset.

The ISR is the durability contract surface. See [Reliability & Delivery Semantics](./message-queues.md#reliability--delivery-semantics) in message-queues.md for the full `acks=all` / `min.insync.replicas` / exactly-once treatment. The Kafka-specific consequence: **a partition is writable only when ISR size ≥ `min.insync.replicas`**. If enough replicas fall behind and ISR shrinks below this floor, the partition rejects producer writes with `NotEnoughReplicasException` — a deliberate availability trade for durability.

### High Watermark vs Log End Offset

> _The most important invisible boundary in Kafka: consumers can only see what every ISR member has acknowledged._

Two offsets govern visibility per partition:

| Offset                   | Definition                                              | Advances when                   |
| ------------------------ | ------------------------------------------------------- | ------------------------------- |
| **Log End Offset (LEO)** | Next offset to be written; the leader's latest position | Every append                    |
| **High Watermark (HW)**  | Highest offset replicated to all current ISR members    | All ISR members report LEO ≥ HW |

Consumers read only up to the HW. Messages between HW and LEO are written but **uncommitted** — not yet visible.

```
Leader log:    [0][1][2][3][4][5]   ← LEO = 6
                          ↑
                         HW = 4    ← consumers see offsets 0–3 only
                                      offsets 4–5 on leader but not all ISR
```

**Why it matters:** if the leader fails at LEO=6 with HW=4, the elected follower truncates back to HW=4 (offsets 4–5 are lost). Consumers who never saw 4–5 are unaffected — consistency preserved. If consumers could read past HW and the leader then failed, they would hold data the new leader does not — an unrecoverable divergence.

> 🎯 **Interview Lens** > **Q:** A producer sends a message with `acks=all`. What has to happen before it gets an ACK?
> **Ideal answer:** The leader appends to its log, then waits for all current ISR members to fetch that message and advance their LEO to at least that offset. Once all ISR members acknowledge, the leader advances the HW and sends the ACK. Only then is the message visible to consumers.
> **Common trap:** "`acks=all` means all replicas." No — it means all _in-sync_ replicas. A replica fallen out of ISR is not waited on. The ISR is the durability contract, not the full replica set.
> **Next question:** "What happens if the leader fails immediately after sending the producer ACK?" → A new leader is elected from ISR. Because all ISR members acknowledged the message before the ACK was sent, the message is guaranteed present on the new leader. No data loss; consumer reads continue from HW.

**Key Takeaway:** Partitions are the parallelism unit; replicas are the durability unit; the HW is the consumer-visibility safety line. The HW invariant is what makes `acks=all` meaningful — a producer ACK guarantees the message survives any single-broker failure.

---

## KRaft: Raft-Based Metadata

**Interviewer TL;DR:** KRaft replaced ZooKeeper by storing cluster metadata in a Raft-replicated internal Kafka topic, eliminating the split control/data plane. The result is faster controller failover, a higher partition ceiling, and a single system to operate.

**Mental model:** Old Kafka was a city with two governments — ZooKeeper ran city hall (metadata), Kafka ran the economy (data). KRaft merged them: one government, one log, one system to keep alive.

### ZooKeeper Limitations

ZooKeeper served as Kafka's coordination layer: controller election, broker registration, topic configuration, partition states, ACLs, and quotas. This created several structural problems:

- **Dual operational burden** — two separate systems to deploy, monitor, upgrade, and maintain quorum for. ZooKeeper's failure modes (GC pauses, network partitions, session expiry) were a distinct class of incidents from Kafka's own.
- **Controller metadata bottleneck** — all cluster state changes flowed through a single elected controller, which wrote to ZooKeeper and then notified every broker individually via RPC. In large clusters, a controller failover required re-reading all state from ZooKeeper and pushing it to every broker — a process that could take minutes.
- **Partition count ceiling** — ZooKeeper's in-memory model and the controller's per-broker notification loop imposed a practical limit of ~200k partitions per cluster before metadata propagation became unacceptably slow.
- **Slow broker restart** — on a new controller election, the incoming controller had to reload all partition leadership and ISR state from ZooKeeper before serving any requests.

### KRaft Architecture

KRaft (from KIP-500) eliminates ZooKeeper by moving cluster metadata into a special internal Kafka topic: `__cluster_metadata`. This topic is Raft-replicated among a set of **controller nodes** forming the metadata quorum.

```
ZooKeeper Mode (pre-KRaft)               KRaft Mode

ZooKeeper Quorum                         Controller Quorum (Raft)
  [ZK1] [ZK2] [ZK3]                        [C1] [C2] [C3]
       ↕ (metadata)                              ↕ (__cluster_metadata log)
Kafka Controller (single broker)         Kafka Brokers
       ↕ (push state to each broker)       [B1] [B2] [B3]
  [B1] [B2] [B3]                           subscribe to metadata log,
                                           maintain local snapshot
```

- **Metadata as a log** — all cluster state changes (topic creation, partition reassignment, ISR updates, ACL changes) are appended as records to `__cluster_metadata` and committed via Raft before taking effect. The log is the single source of truth; brokers are consumers of it.
- **Brokers subscribe, not notified** — brokers fetch the metadata log tail continuously and apply changes locally. No more controller pushing state to each broker via individual RPCs. A broker that restarts loads its last local snapshot and catches up from the log tail — fast regardless of cluster size.
- **Two deployment modes:**

| Mode         | Description                                       | When to use                                                       |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| **Combined** | Each node runs broker + controller roles          | Smaller clusters, simpler ops                                     |
| **Isolated** | Dedicated controller nodes, separate broker nodes | Large production; isolates metadata quorum load from data serving |

Controller quorum size is typically 3 or 5. Follows Raft majority rules: 3-node quorum tolerates 1 failure; 5-node tolerates 2. See [Consensus (Raft / Paxos)](../algorithms/consensus-raft-paxos.md) for the full treatment.

### Metadata Quorum

The active controller leader handles all metadata writes. Followers replicate via Raft. No operation that modifies cluster state (create topic, reassign partitions, update ACL) proceeds until the metadata record is committed to a quorum majority.

**Epoch fencing** — every controller leader election increments a controller epoch. Brokers and stale leaders reject requests carrying an old epoch, preventing split-brain where two nodes both believe they are the active controller.

**Broker registration** — on startup, a broker registers with the active controller by appending a `BrokerRegistrationRecord` to the metadata log. Brokers that stop heartbeating are deregistered via a `BrokerRegistrationChangeRecord`. All state transitions are in the log — observable and replayable.

### ZooKeeper → KRaft Migration

| Kafka Version | KRaft Status                                                     |
| ------------- | ---------------------------------------------------------------- |
| 3.0           | Available, not production-ready                                  |
| 3.3           | Production-ready for new clusters                                |
| 3.5+          | In-place migration tooling (ZooKeeper → KRaft without data loss) |
| 4.0           | ZooKeeper mode removed entirely                                  |

Migration approach (Kafka 3.5+): deploy KRaft controller nodes alongside the existing ZooKeeper-based cluster, snapshot existing ZooKeeper metadata into the KRaft log, then switch brokers to KRaft mode in a rolling restart. No downtime required for the data plane; a brief metadata-write pause occurs during cutover.

> ⚠️ **Kafka 4.0 hard cutoff:** clusters on ZooKeeper mode cannot upgrade directly to Kafka 4.0. Migration to KRaft is a prerequisite. Plan the migration before any 4.0 upgrade path.

### Recovery Speed

| Scenario                | ZooKeeper Mode                                                                         | KRaft Mode                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Controller failover     | Reads all state from ZooKeeper, pushes to all brokers — **tens of seconds to minutes** | Replays Raft log from last snapshot — **seconds**                     |
| Broker restart          | Waits for controller to push full partition state                                      | Loads local snapshot, fetches log tail — **fast at any cluster size** |
| Partition count ceiling | ~200k practical (ZooKeeper + per-broker push)                                          | Millions (log subscription, no per-broker RPC)                        |

> 🎯 **Interview Lens** > **Q:** Why did Kafka replace ZooKeeper with KRaft?
> **Ideal answer:** Three problems: (1) dual operational burden — two quorum systems with independent failure modes; (2) controller scalability — per-broker RPC notification capped practical partition counts at ~200k and made failover slow; (3) ZooKeeper's in-memory model couldn't scale to modern partition counts. KRaft solves all three: metadata becomes a Raft-replicated Kafka log, brokers subscribe to it instead of being pushed state, and a single system replaces two.
> **Common trap:** "KRaft just removes a dependency." It's a deeper architectural shift — from a push model (controller notifies brokers) to a pull model (brokers subscribe to the metadata log). That pull model is what enables the scaling improvement, not merely the absence of ZooKeeper.
> **Next question:** "What happens if the KRaft controller quorum loses majority?" → Metadata writes halt — topic creation, reassignment, ACL changes all fail. Existing brokers continue serving reads and writes for partitions with healthy ISRs; the data plane is unaffected until quorum is restored.

**Key Takeaway:** KRaft replaces a push-based metadata notification model with a pull-based log subscription model. This removes the practical partition ceiling, cuts controller failover from minutes to seconds, and collapses two operational systems into one.

---

## Storage Internals

**Interviewer TL;DR:** Kafka's write throughput comes from sequential I/O and the OS page cache; its seek performance comes from a sparse offset index plus binary search. Log compaction is a distinct retention mode — it guarantees the latest value per key, not full history — with null-value tombstones as the deletion signal.

**Mental model:** Each partition is a segmented append-only file. Writes always go to the tail (sequential, fast). Reads seek using a sparse index then scan forward. Old segments are either deleted (time/size retention) or key-deduplicated (compaction).

### Message Batch Format

Kafka stores messages in **batches** (RecordBatch), not individually. Compression, producer metadata, and sequence numbers are applied at the batch level:

```
RecordBatch
  ├── base offset            ← offset of first record in batch
  ├── compression codec      ← NONE / SNAPPY / LZ4 / ZSTD
  ├── producer ID + epoch    ← idempotent / transactional producer identity
  ├── first sequence number  ← broker-side duplicate detection
  └── records[]
        ├── offset delta     ← relative to base offset (saves bytes)
        ├── timestamp delta  ← relative to batch timestamp
        ├── key (bytes)
        ├── value (bytes)
        └── headers[]        ← user-defined key-value pairs (trace context, schema ID)
```

Compression applies to the entire batch payload, not per record. Consequences:

- To read a single record inside a compressed batch, the whole batch must be decompressed — read amplification when seeking mid-batch.
- Larger batches produce better compression ratios (more redundancy across records) — higher throughput, marginally higher latency.
- `linger.ms` and `batch.size` control batch size; covered in [Producer Internals & Configuration](#producer-internals--configuration).

### Offset Index Mechanics

Each `.index` file is a sparse array of `(relative_offset, byte_position)` pairs. One entry is written per roughly every `index.interval.bytes` (default: 4096 bytes) of log data written.

```
.index entries (sparse):
  offset  0  → byte position 0
  offset  9  → byte position 1024
  offset 18  → byte position 2048

Seek to offset 14:
  1. Binary-search .index → largest entry ≤ 14 → (offset 9, byte 1024)
  2. Seek .log to byte 1024
  3. Scan forward: offsets 9, 10, 11, 12, 13, 14 → found
```

The `.index` file is memory-mapped (`mmap`) — binary search runs entirely in virtual memory with no syscall overhead. Maximum entries per segment ≈ `segment.bytes / index.interval.bytes`.

The `.timeindex` file works identically but maps `(timestamp, offset)` — used for `--reset-offsets --to-datetime` operations.

### Page Cache

Kafka deliberately avoids JVM heap buffering. All I/O routes through the OS page cache:

- **Writes** land in page cache first (memory-speed), flushed to disk asynchronously. Producer throughput is not disk-bound during bursts.
- **Reads** hit page cache when data is recent (tail consumers). Cold reads — consumers far behind, or after a broker restart — miss cache and hit disk, significantly slower.

See [Write Path Mechanics](./message-queues.md#write-path-mechanics) and [Read Path Mechanics](./message-queues.md#read-path-mechanics) in message-queues.md for the fsync trade-off and zero-copy `sendfile()` treatment.

**Practical implication:** a consumer group reading far-behind data can saturate broker disk I/O and evict warm pages needed by tail consumers. Isolate catch-up consumers to off-peak windows or to dedicated brokers for high-priority topics.

### Log Compaction

> _Compaction is key-deduplication, not archival. It guarantees the latest value per key survives; it makes no guarantee about history._

#### How Compaction Works

The log cleaner runs a background thread that periodically rewrites partition segments:

```
Before compaction:
  [k1:v1] [k2:v2] [k1:v3] [k3:v4] [k2:v5] [k1:v6]
   offset0  offset1  offset2  offset3  offset4  offset5

After compaction:
  [k3:v4] [k2:v5] [k1:v6]
  (earlier values for k1 and k2 removed; only latest per key retained)
```

1. Cleaner scans the **dirty** portion (segments not yet compacted) and builds an in-memory `key → latest offset` map.
2. Reads the **clean** (already-compacted) portion and copies forward only records whose offset matches the latest in the map. Earlier versions are dropped.
3. Writes output to new segment files, replacing old dirty segments atomically.

#### Compaction Trigger

Compaction fires when the dirty ratio exceeds `min.cleanable.dirty.ratio` (default: 0.5):

```
dirty ratio = dirty bytes / total partition bytes
```

Lower ratio → more frequent compaction → more I/O, leaner log. Higher ratio → less I/O, more stale versions accumulate in dirty segments.

#### Tombstone Lifecycle

Deleting a key requires a record with that key and a **null value** — a tombstone:

```
Producer: key="user-123", value=null   ← tombstone
```

Tombstones are retained for at least `delete.retention.ms` (default: 24 h) so downstream consumers can observe the deletion. After this window, tombstones are dropped in the next compaction pass. Without tombstones, deleted keys persist indefinitely.

> ⚠️ **Tombstone timing trap:** a consumer offline longer than `delete.retention.ms` will never observe tombstones for keys deleted during its absence. Kafka Streams state stores and CDC targets must handle this: either ensure consumers stay within the retention window, or implement full-snapshot reconciliation on restart.

#### Compaction vs Retention Policy

| `cleanup.policy` | Behaviour                                                                               | Best for                                                           |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `delete`         | Segments deleted when older than `retention.ms` or total size exceeds `retention.bytes` | Event streams — history matters, bounded storage                   |
| `compact`        | Latest value per key retained indefinitely; tombstones delete keys                      | CDC changelogs, config topics, materialised state                  |
| `delete,compact` | Compaction + max-age enforcement on compacted segments                                  | High-churn compacted topics where unbounded growth is unacceptable |

> ⚖️ **Decision Framework**
> Use `compact` when consumers need to replay full current state of a key space (Kafka Streams state store rebuild, CDC target initialisation). Use `delete` when consumers only care about recent events and full history is too costly. Use `delete,compact` when you need compacted semantics but also need a storage cap — common for CDC topics on high-churn tables.

### Tiered Storage (Kafka 3.6+)

Tiered storage splits partition data across two tiers:

```
Local broker disk (hot)        Object storage — S3 / GCS / Azure Blob (cold)
┌──────────────────┐           ┌─────────────────────────────────────────┐
│ Recent segments  │ ────────▶ │ Older segments (offloaded automatically) │
│                  │           │ threshold: local.retention.ms/bytes      │
└──────────────────┘           └─────────────────────────────────────────┘
        ↑                                       ↑
  tail consumers                         catch-up consumers
  (low latency)                   (higher latency, object-store API cost)
```

Brokers offload sealed segments once they exceed `local.retention.ms` or `local.retention.bytes`. Consumers read from whichever tier holds the requested offset, transparently. Broker disk requirements drop dramatically for high-retention topics.

| Dimension          | Local disk                | Object store tier            |
| ------------------ | ------------------------- | ---------------------------- |
| Read latency       | Low (ms)                  | Higher (tens–hundreds of ms) |
| Storage cost       | High (SSD/HDD per broker) | Low (object-store pricing)   |
| Replay of old data | Fast                      | Slower; per-request API cost |

> ⚠️ **Not for latency-sensitive replay:** if consumers regularly replay weeks of history for real-time processing (Kafka Streams state store rebuilds, backfill pipelines), object-store read latency will degrade performance meaningfully. Keep those topics on local-only retention.

**Key Takeaway:** Kafka's throughput comes from sequential I/O and the OS page cache — anything that converts sequential reads to random I/O (mid-batch seeks on compressed topics, cold-cache reads) pays a steep penalty. Log compaction and time/size retention are complementary policies, not alternatives. Tiered storage reduces broker disk costs on high-retention topics; it is not a default setting.

---

## Producer Internals & Configuration

**Interviewer TL;DR:** The produce pipeline is a batching system — `linger.ms` and `batch.size` trade latency for throughput; `acks` trades durability for speed; `max.in.flight` balances ordering against parallelism. Idempotence handles broker-side duplicates from retries; transactions extend that to atomic multi-topic writes.

**Mental model:** The producer is a post-office clerk with a tray (accumulator). New letters drop in; when the tray is full or the timer rings, the clerk dispatches the whole batch. The broker stamps each letter and sends back a receipt.

### Produce Pipeline

```
producer.send(record)
       ↓
RecordAccumulator        ← per-partition deque of ProducerBatch objects
(batch.size full OR      ← whichever fires first triggers dispatch
 linger.ms elapsed)
       ↓
  Sender Thread          ← background I/O thread; handles retries internally
       ↓
  NetworkClient ──────────────────────────────────────▶ Broker Leader
                                                              ↓
                                                     replicate to ISR (acks=all)
                                                              ↓
                         ◀───────────────────────────── ACK / Error
       ↓
  Callback / Future.get()
```

Retries happen inside the Sender thread — the user-facing `send()` call is non-blocking. `future.get()` blocks until ACK or max retries exhausted.

### Key Producer Configs

| Config                                  | Default            | Controls                                                            |
| --------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `acks`                                  | `1`                | How many ISR members must ACK before producer receives confirmation |
| `linger.ms`                             | `0`                | Max wait to fill a batch before sending                             |
| `batch.size`                            | `16384` (16 KB)    | Max batch bytes; sends immediately when reached                     |
| `compression.type`                      | `none`             | Codec applied to the full batch payload                             |
| `max.in.flight.requests.per.connection` | `5`                | Unacknowledged in-flight requests per broker connection             |
| `buffer.memory`                         | `33554432` (32 MB) | Total accumulator memory across all partitions                      |
| `max.block.ms`                          | `60000` (60 s)     | Max time `send()` blocks when accumulator is full                   |

#### `acks`

- `0` — fire and forget. No ACK, no retries. Maximum throughput, zero durability. Use for metrics or non-critical logs where loss is acceptable.
- `1` — leader ACK only. Leader writes to its log and responds without waiting for ISR replication. If the leader fails before followers catch up, the message is lost.
- `all` (or `-1`) — all current ISR members must acknowledge. The strong durability guarantee. See [Reliability & Delivery Semantics](./message-queues.md#reliability--delivery-semantics).

#### `max.in.flight.requests.per.connection`

**The ordering problem:** with retries enabled and `max.in.flight > 1`, batch 2 can succeed while batch 1 is retrying — batch 1 lands after batch 2 on the broker, reordering messages for that partition.

**The fix:** `enable.idempotence=true`. The broker assigns sequence numbers per `(PID, partition)` and rejects out-of-order sequences — the producer must resend the missing batch before the later one is accepted, preserving order without dropping `max.in.flight` to 1.

Setting `max.in.flight=1` without idempotence also guarantees ordering but serialises all requests to a broker — rarely necessary and a significant throughput ceiling.

#### `linger.ms` + `batch.size`

These form the throughput-latency dial:

```
linger.ms=0 (default):   send as soon as a record arrives
                          → many small batches, low latency, poor throughput

linger.ms=5–20 ms:        wait up to N ms for more records to accumulate
                          → larger batches, better compression, higher throughput
                          → latency increase bounded by linger.ms

batch.size fires independently: if the batch fills before linger.ms, it sends immediately.
```

For analytics / high-throughput ingestion: `linger.ms=10–100`, `batch.size=65536` (64 KB) or higher. For low-latency confirmation paths (payment, booking): keep `linger.ms=0`.

#### `buffer.memory` + `max.block.ms`

`buffer.memory` is the total heap for the RecordAccumulator. When all in-flight batches fill this pool (fast producer, slow broker), `producer.send()` blocks for up to `max.block.ms`, then throws `BufferExhaustedException`.

This is Kafka's producer-side backpressure mechanism — a blocked `send()` propagates upstream and naturally slows producers outpacing the broker. Set `max.block.ms` to a value that fits your upstream SLA, not to 0 (immediate throw) unless you have explicit overflow handling.

### Idempotent Producer

`enable.idempotence=true` eliminates duplicates caused by producer retries at the broker layer. When enabled, Kafka automatically enforces: `acks=all`, `retries=MAX_INT`, `max.in.flight ≤ 5`.

The broker assigns each producer session a **Producer ID (PID)** and tracks the last acknowledged sequence number per `(PID, partition)`. Duplicate sequence → silently dropped. Sequence gap → rejected, producer must resend in order.

See [Producer Idempotency & Duplicate Detection](./message-queues.md#producer-idempotency--duplicate-detection) for the full PID/epoch treatment.

> ⚠️ **Scope boundary:** idempotence eliminates broker-level duplicates from retries. Calling `producer.send()` twice with the same payload produces two distinct messages — the broker has no way to detect application-level re-sends. Idempotence is not application-level deduplication.

### Transactional Producer

Transactions extend idempotence to **atomic writes across multiple partitions and topics**, including atomic consumer offset commits.

```python
producer = KafkaProducer(transactional_id="pipeline-prod-1")
producer.init_transactions()

producer.begin_transaction()
producer.send("output-a", key=k, value=result_a)
producer.send("output-b", key=k, value=result_b)
producer.send_offsets_to_transaction(offsets, consumer_group_id)
producer.commit_transaction()    # all writes become visible atomically
# On failure:
producer.abort_transaction()     # all writes invisible to read_committed consumers
```

- `transactional.id` must be stable across producer restarts — it allows the broker's transaction coordinator to fence zombie producers (old instances that outlive a restart by incrementing their epoch).
- Consumers must use `isolation.level=read_committed` to exclude messages from open or aborted transactions.
- Overhead: ~10–20% throughput reduction vs non-transactional produce, due to the two-phase commit with the transaction coordinator.

Use transactions for Kafka Streams exactly-once mode (`processing.guarantee=exactly_once_v2`) or consume-transform-produce pipelines where input offset commit and output produce must be atomic. Not needed for produce-only workloads.

### Sticky Partitioning

Before Kafka 2.4, keyless records were distributed round-robin per record — each record went to a different partition, producing many one-record batches even with `linger.ms > 0`.

Sticky partitioning (default from Kafka 2.4+): keyless records accumulate in the same partition's batch until `batch.size` is hit or `linger.ms` fires, then the producer switches to the next partition. Full batches form naturally, compression improves, and throughput increases — at no cost to latency guarantees.

> 🎯 **Interview Lens** > **Q:** You're seeing out-of-order message delivery on a Kafka partition with retries enabled. What's the cause and how do you fix it?
> **Ideal answer:** With `max.in.flight > 1` and retries enabled, a failed batch can be retried and land after a later batch that succeeded — reordering within the partition. Fix: enable `enable.idempotence=true`. The broker enforces sequence ordering per PID; out-of-order delivery becomes impossible without dropping throughput to `max.in.flight=1`.
> **Common trap:** Setting `max.in.flight=1`. That works but serialises all requests to the broker — a significant throughput hit that idempotence avoids.
> **Next question:** "You enable idempotence but still see duplicates downstream in your Postgres sink. Why?" → Idempotence covers broker-level duplicates from producer retries only. If the consumer crashes after processing but before committing its offset, the message is redelivered. The Postgres sink must implement idempotent writes (upsert with dedup key) — see [message-queues.md](./message-queues.md#consumer-offset-management).

**Key Takeaway:** Tune `linger.ms` and `batch.size` first — they have the largest throughput impact. Always enable idempotence for any producer with retries. Use transactions only when atomic multi-topic writes are a hard correctness requirement; the ~10–20% throughput cost is real.

---

## Consumer Internals & Configuration

**Interviewer TL;DR:** The Kafka consumer is pull-based — it fetches on its own schedule, giving it natural backpressure. The two most common production incidents are consumer ejection from slow processing (`max.poll.interval.ms` exceeded) and rebalance-induced lag spikes; both are addressed by reducing batch size or enabling cooperative rebalancing with static group membership.

**Mental model:** The consumer is a reader with a bookmark (committed offset). It picks up where the bookmark says, reads a batch, processes it, then moves the bookmark. A crash without moving the bookmark means re-reading from the last bookmarked position.

### Fetch Protocol

Consumers send `FetchRequest` messages to the leader broker for each assigned partition, specifying the fetch offset and max bytes. The pull model gives consumers natural backpressure — a slow consumer polls less frequently without the broker needing to react.

```
Consumer                                  Broker (partition leader)
   │                                               │
   │── FetchRequest(offset=142, max=1MB) ─────────▶│
   │                                               │ wait if bytes < fetch.min.bytes
   │                                               │ (up to fetch.max.wait.ms)
   │◀── FetchResponse(records 142–287) ────────────│
   │                                               │
   │  [process records 142–287]                    │
   │                                               │
   │── FetchRequest(offset=288, max=1MB) ─────────▶│
```

If the broker has fewer bytes available than `fetch.min.bytes`, it holds the request open until either the threshold is met or `fetch.max.wait.ms` elapses — avoiding a tight polling loop.

### Key Consumer Configs

| Config                 | Default            | Controls                                                  |
| ---------------------- | ------------------ | --------------------------------------------------------- |
| `fetch.min.bytes`      | `1`                | Min bytes broker waits to accumulate before responding    |
| `fetch.max.wait.ms`    | `500`              | Max broker wait when `fetch.min.bytes` not yet available  |
| `max.poll.records`     | `500`              | Max records returned per `poll()` call                    |
| `max.poll.interval.ms` | `300000` (5 min)   | Max time between polls before consumer is ejected         |
| `session.timeout.ms`   | `45000` (45 s)     | Max time without heartbeat before consumer declared dead  |
| `auto.offset.reset`    | `latest`           | Start position when no committed offset exists            |
| `isolation.level`      | `read_uncommitted` | Whether to filter messages from open/aborted transactions |

#### `fetch.min.bytes` + `fetch.max.wait.ms`

- `fetch.min.bytes=1` (default): broker responds immediately with whatever is available — lowest latency, most fetch requests, highest broker CPU.
- `fetch.min.bytes=65536` (64 KB): broker waits until 64 KB is ready — fewer requests, better throughput, up to `fetch.max.wait.ms` added latency.

For tail consumers on high-throughput topics, raising `fetch.min.bytes` meaningfully reduces broker CPU from constant small fetches.

#### `max.poll.records` + `max.poll.interval.ms`

`max.poll.records` caps records per `poll()`. The consumer must call `poll()` again within `max.poll.interval.ms` — if processing the returned batch takes longer, the consumer is ejected and a rebalance fires, even if the heartbeat thread is healthy.

```
max.poll.records=500, max.poll.interval.ms=300s

Processing 500 records takes 6 minutes
  → ejection at 5 min → rebalance → records 0–500 reprocessed from committed offset
Fix: reduce max.poll.records OR increase max.poll.interval.ms OR parallelise processing
```

#### `session.timeout.ms`

`session.timeout.ms` and `max.poll.interval.ms` detect different failure modes:

| Timeout                | Triggered by                                  | Detected via                                    |
| ---------------------- | --------------------------------------------- | ----------------------------------------------- |
| `session.timeout.ms`   | Consumer JVM crash, network failure           | Missing heartbeats (background HeartbeatThread) |
| `max.poll.interval.ms` | Main thread stuck — slow processing, deadlock | No `poll()` call within the interval            |

A consumer can be alive with heartbeats flowing and still be ejected if its main thread exceeds `max.poll.interval.ms`. Checking "the process is running" and concluding the ejection is spurious is the most common debugging dead end.

#### `auto.offset.reset`

Determines start position when a consumer group has no committed offset for a partition (new group, deleted offsets). See [Consumer Offset Management](./message-queues.md#consumer-offset-management).

> ⚠️ **Never use `auto.offset.reset=earliest` in production.** A new group name, accidental rename, or deleted offset store triggers full backlog replay — potentially millions of messages. Use `none`: it throws `NoOffsetForPartitionException` on missing offset, forcing explicit handling before consumption begins.

#### `isolation.level`

- `read_uncommitted` (default): reads all messages including those from open or aborted transactions. Consumers may process messages the producer later aborts.
- `read_committed`: reads only committed transaction messages; open-transaction messages are withheld until committed; aborted messages are skipped permanently. Required when consuming from transactional producers.

### Group Coordinator

One broker per consumer group serves as the **Group Coordinator** — determined by `hash(group.id) % __consumer_offsets.partitions`, then the leader of that partition. It manages group membership, heartbeat tracking, offset commits, and rebalance orchestration.

Rebalance protocol:

```
1. All consumers send JoinGroupRequest to coordinator
2. Coordinator elects a group leader (first to join)
3. Coordinator sends JoinGroupResponse to all — includes full member list
4. Group leader (client-side) computes assignment using configured assignor
5. Group leader sends SyncGroupRequest with full assignment map
6. Coordinator distributes assignments via SyncGroupResponse
7. Members begin consuming assigned partitions
```

The assignment logic runs on the client (group leader), not the broker. Custom partition assignors can be implemented without any broker changes.

### Cooperative Rebalancing

See [Consumer Group Rebalancing](./message-queues.md#consumer-group-rebalancing) for the stop-the-world vs cooperative distinction. Kafka-specific: enabled via `partition.assignment.strategy=CooperativeStickyAssignor` (Kafka 2.4+).

Two-phase approach:

1. **Revocation phase:** only partitions that must move are revoked. Consumers losing those partitions stop consuming them and rejoin.
2. **Assignment phase:** revoked partitions are assigned to new owners.

Consumers keeping their partitions never stop consuming — the pause affects only the partitions in motion, not the whole group.

### Static Group Membership

`group.instance.id` gives a consumer instance a stable identity. Without it, any disconnect immediately triggers a full rebalance.

With static membership: a disconnected consumer is not ejected until `session.timeout.ms` expires. If it reconnects within that window, it reclaims its exact partitions with no rebalance.

For Kubernetes rolling deploys: old pod leaves, new pod with the same `group.instance.id` reconnects — no rebalance, no lag spike. Set `session.timeout.ms` slightly above the expected pod restart time (e.g., 120–180 s for slow image pulls).

### Committed Offset vs Current Position

| Offset               | Meaning                            | Advances when                                            |
| -------------------- | ---------------------------------- | -------------------------------------------------------- |
| **Current position** | Next offset `poll()` will return   | Each `poll()` call                                       |
| **Committed offset** | Last explicitly committed position | `commitSync()` / `commitAsync()` or auto-commit interval |

On restart or rebalance, the consumer resumes from the **committed offset**, not the current position. A large gap between them is a large reprocessing window on failure.

```
Committed offset: 142    Current position: 287

Consumer crashes:
  → resumes from 142 on restart
  → records 143–287 reprocessed (at-least-once)
```

Auto-commit fires on a timer — it commits the current position whether or not processing is complete. A crash after auto-commit but before processing completes silently drops those records (at-most-once window). Always use manual commit after successful processing for true at-least-once guarantees.

> 🎯 **Interview Lens** > **Q:** Your Kafka consumer keeps being ejected from the group mid-processing. What do you investigate?
> **Ideal answer:** Two distinct causes: (1) `max.poll.interval.ms` exceeded — main thread stuck processing a batch too long. Reduce `max.poll.records`, increase `max.poll.interval.ms` with buffer, or parallelise processing. (2) `session.timeout.ms` exceeded — heartbeat thread failure from a JVM pause or network drop. Distinguish them: if the process is alive but ejected, it is `max.poll.interval.ms`. If the process is dead, it is `session.timeout.ms`.
> **Common trap:** "Increase `session.timeout.ms`." Only helps if heartbeat loss is the cause. For slow processing, it delays the ejection without fixing it.
> **Next question:** "You enable static group membership but still see rebalances on pod restarts. Why?" → If the new pod starts before the old pod's `session.timeout.ms` expires, two instances share the same `group.instance.id` — a protocol violation. The coordinator fences the old one and rebalances. Fix: ensure the old pod's session expires before the new pod with the same ID connects, or stagger the restart.

**Key Takeaway:** `max.poll.interval.ms` and `session.timeout.ms` are distinct levers for distinct failure modes — diagnose which one is breached before tuning either. Static group membership combined with cooperative rebalancing eliminates the most common sources of rebalance-induced lag in production.

---

## Topic & Broker Configuration

**Interviewer TL;DR:** Most Kafka production incidents trace back to three misconfigurations: `min.insync.replicas=1` (false durability), `auto.create.topics.enable=true` (silent topic creation from typos), and `unclean.leader.election.enable=true` on durability-critical topics (silent data loss on leader failure).

**Mental model:** Topic configs set per-topic policy; broker configs set cluster-wide defaults and ceilings. Topic configs generally win, but broker configs impose hard upper bounds that topic-level settings cannot exceed.

### Topic Configs

| Config                | Default               | Controls                                                       |
| --------------------- | --------------------- | -------------------------------------------------------------- |
| `cleanup.policy`      | `delete`              | Retention mode: time/size deletion, key compaction, or both    |
| `retention.ms`        | `604800000` (7 days)  | Age after which segments are eligible for deletion             |
| `retention.bytes`     | `-1` (unlimited)      | Max partition size before oldest segments are deleted          |
| `min.insync.replicas` | `1`                   | Minimum ISR size for the partition to accept `acks=all` writes |
| `replication.factor`  | `1` (cluster default) | Number of partition copies across brokers                      |
| `segment.ms`          | `604800000` (7 days)  | Max age of the active segment before it is sealed              |
| `segment.bytes`       | `1073741824` (1 GB)   | Max size of a segment file before it is sealed                 |
| `max.message.bytes`   | `1048588` (~1 MB)     | Max batch size the broker will accept for this topic           |

#### `cleanup.policy`

Covered in [Log Compaction](#log-compaction). Short reference:

- `delete` — time/size-based retention; segments dropped when older than `retention.ms` or total partition size exceeds `retention.bytes`.
- `compact` — latest value per key retained indefinitely; tombstones (null values) delete keys.
- `delete,compact` — both: compact the log AND enforce a max-age ceiling on compacted segments.

#### `retention.ms` + `retention.bytes`

Both apply **per partition**, not per topic. Total topic storage ≈ `retention.bytes × partition_count`.

Setting `retention.bytes=10737418240` (10 GB) on a topic with 12 partitions means up to 120 GB total, not 10 GB. Size this accordingly.

`retention.bytes=-1` disables size-based retention — only time applies. Safe for low-throughput topics; dangerous for high-throughput topics with unbounded write rates and no size cap.

#### `min.insync.replicas`

The most consequential topic config for durability.

```
acks=all + min.insync.replicas=1:
  → leader ACKs after only itself — identical to acks=1
  → default config provides false durability; one broker loss = data loss

acks=all + min.insync.replicas=2 + replication.factor=3:
  → at least 2 replicas must acknowledge → survives 1 broker loss without data loss
  → if 2 brokers go down, ISR < 2 → NotEnoughReplicasException → partition unwritable
  → correct production baseline
```

> ⚠️ **Never set `min.insync.replicas = replication.factor`.** If any single broker is unavailable, ISR drops below the minimum and the partition becomes permanently unwritable until the broker recovers. The correct ceiling is `replication.factor − 1`.

#### `replication.factor`

Cannot be changed after topic creation without using partition reassignment tooling (`kafka-reassign-partitions.sh`). Set it correctly at creation.

Production baseline: `replication.factor=3`. This allows `min.insync.replicas=2` and survives one broker failure without affecting availability or durability. `replication.factor` must be ≤ the number of brokers in the cluster.

#### `segment.ms` + `segment.bytes`

Segments must be **sealed** before they can be compacted or deleted. The active segment is never touched by the cleaner or retention policy.

- If `segment.ms` is too large relative to `retention.ms`, recently produced messages may sit in the active segment past their retention age — they are not deleted until the segment seals.
- For compacted topics: smaller segments mean more compaction opportunities, reducing dirty ratio faster. For delete-policy topics: smaller segments improve time-based retention accuracy.

Common pattern for high-throughput topics: `segment.bytes=268435456` (256 MB), `segment.ms=3600000` (1 h) — frequent sealing, accurate retention, manageable file count.

#### `max.message.bytes`

Caps the batch size the broker accepts for this topic.

> ⚠️ **Tri-config trap:** increasing `max.message.bytes` at the topic level is not enough. Three configs must align:
>
> - `max.message.bytes` (topic) — broker accepts up to this batch size
> - `message.max.bytes` (broker) — hard ceiling; topic setting cannot exceed this
> - `max.partition.fetch.bytes` (consumer) — max bytes per partition per fetch; must be ≥ `max.message.bytes` or the consumer silently fails to read the message

### Broker Configs

| Config                           | Default        | Controls                                                                          |
| -------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `replica.lag.time.max.ms`        | `30000` (30 s) | How long a follower can fall behind before ISR removal                            |
| `unclean.leader.election.enable` | `false`        | Whether a non-ISR replica can be elected leader when all ISR replicas are offline |
| `auto.create.topics.enable`      | `true`         | Whether topics are implicitly created on first produce/consume                    |

#### `replica.lag.time.max.ms`

A follower that doesn't fetch from the leader within this window is removed from ISR, triggering a URP (Under-Replicated Partition) alert and reducing the durability guarantee.

- Too low (e.g., 5 s): routine GC pauses or brief network blips cause ISR shrinks and false URP alerts; `acks=all` producers see intermittent errors.
- Too high (e.g., 120 s): a genuinely failing follower stays in ISR; `acks=all` producers wait until `request.timeout.ms` for an ACK that never arrives.

Typical production range: 15–30 s. Tune up if JVM GC pauses routinely exceed the default.

#### `unclean.leader.election.enable`

When all ISR members for a partition go offline simultaneously:

| Setting           | Behaviour                                            | Trade-off                                                                                      |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `false` (default) | Partition stays offline until an ISR member recovers | No data loss; availability reduced                                                             |
| `true`            | Elect a non-ISR (out-of-date) replica immediately    | Partition available; acknowledged messages not on the out-of-date replica are permanently lost |

> ⚠️ **Never enable for financial, audit, compliance, or any topic where data loss is unacceptable.** Enabling `true` at the broker level applies to all topics — prefer topic-level override only for specific topics (e.g., real-time metrics, dashboards) where availability genuinely outweighs durability.

#### `auto.create.topics.enable`

- `true` (default): any producer or consumer referencing a non-existent topic name silently creates it with the broker's default configs.
- **Always set `false` in production.** A topic name typo creates a new empty topic with `replication.factor=1`, `retention.ms=7d`, no ACL, no monitoring. The misconfigured topic accumulates data silently; the intended topic receives nothing; the incident takes hours to diagnose.

> ⚖️ **Decision Framework**
> Minimum production topic config for a durable event stream:
>
> ```
> replication.factor=3
> min.insync.replicas=2
> cleanup.policy=delete
> retention.ms=<business SLA>
> retention.bytes=<capacity budget per partition>
> ```
>
> Add `cleanup.policy=compact` (or `delete,compact`) only for CDC changelogs or materialised state topics. Set `max.message.bytes` only if you have documented large-payload requirements — and update `max.partition.fetch.bytes` on consumers at the same time.

**Key Takeaway:** `min.insync.replicas=2` with `replication.factor=3` and `acks=all` is the production durability baseline. `auto.create.topics.enable=false` and `unclean.leader.election.enable=false` are the two broker settings that prevent the most common silent failure modes.

---

## Cluster Operations

**Interviewer TL;DR:** Partition count is a one-way door — plan at creation. Every other operation (reassignment, decommission, rolling restart) has a safe sequence that avoids producer errors and data loss; skipping steps is how incidents happen.

**Mental model:** A Kafka cluster is a set of partition replicas distributed across brokers. Operations are safe when they preserve ISR size ≥ `min.insync.replicas` throughout — the moment that invariant is violated, producers with `acks=all` start failing.

### Partition Count Expansion

Partition count can be increased but **never decreased**.

Why no decrease: existing messages are distributed across current partitions by offset. Merging partitions would require rewriting the log — Kafka does not support this. Treat partition count as permanent at creation.

**What happens on increase:** new partitions start empty and receive future messages. Key-based routing changes because `hash(key) % new_partition_count` remaps keys across partitions — per-key ordering guarantees break for any key that moves to a different partition.

Safe expansion:

```bash
# Verify consumers are fully caught up (lag = 0) before expanding
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --describe --group my-group

# Expand partition count
kafka-topics.sh --bootstrap-server broker:9092 \
  --alter --topic orders --partitions 24
```

If the topic uses key-based partitioning for ordering guarantees: drain all in-flight messages first, then expand, then restart producers and consumers together. There is no graceful migration for in-flight keyed messages across a partition count change.

### Partition Reassignment

Moves partition replicas between brokers — for load balancing after adding brokers, before decommissioning a broker, or recovering from uneven distribution.

```bash
# 1. Generate a reassignment plan
kafka-reassign-partitions.sh --bootstrap-server broker:9092 \
  --broker-list "1,2,3,4" \
  --topics-to-move-json-file topics.json \
  --generate > reassignment-plan.json

# 2. Execute with throttle to limit inter-broker replication bandwidth
kafka-reassign-partitions.sh --bootstrap-server broker:9092 \
  --reassignment-json-file reassignment-plan.json \
  --throttle 50000000 \    # 50 MB/s; tune to available headroom
  --execute

# 3. Monitor progress
kafka-reassign-partitions.sh --bootstrap-server broker:9092 \
  --reassignment-json-file reassignment-plan.json \
  --verify
```

**Always throttle.** An unthrottled reassignment of large partitions saturates inter-broker network, elevating producer latency and triggering ISR shrinks. Remove the throttle after reassignment completes:

```bash
kafka-configs.sh --bootstrap-server broker:9092 \
  --entity-type brokers --entity-default \
  --alter --delete-config leader.replication.throttled.rate,follower.replication.throttled.rate
```

### Preferred Replica Election

Over time, broker failures and reassignments leave non-preferred replicas as partition leaders, creating uneven broker load. The preferred replica is the first entry in each partition's replica list — typically spread evenly across brokers at topic creation.

```bash
# Trigger preferred replica election across the cluster
kafka-leader-election.sh --bootstrap-server broker:9092 \
  --election-type PREFERRED \
  --all-topic-partitions
```

Enable automatic rebalancing to reduce manual intervention:

```
# broker config
auto.leader.rebalance.enable=true
leader.imbalance.check.interval.seconds=300
leader.imbalance.per.broker.percentage=10
```

Run preferred replica election after any rolling restart or reassignment that leaves leadership distribution skewed.

### Rolling Broker Restart

Safe sequence for each broker:

```
For each broker (one at a time):

1. Verify URP = 0 before starting:
   kafka-topics.sh --bootstrap-server broker:9092 \
     --describe --under-replicated-partitions
   (must be empty)

2. Initiate controlled shutdown:
   kafka-server-stop.sh
   (broker transfers partition leadership to followers before stopping)

3. Apply changes (config update, JVM upgrade, OS patch)

4. Start the broker

5. Wait for ISR recovery — URP returns to 0:
   watch -n 5 "kafka-topics.sh --bootstrap-server broker:9092 \
     --describe --under-replicated-partitions"

6. Run preferred replica election if needed, then proceed to next broker
```

> ⚠️ **Never restart two brokers simultaneously with `replication.factor=3` and `min.insync.replicas=2`.** Two brokers down = ISR may drop to 1 for some partitions = `NotEnoughReplicasException` for `acks=all` producers. Always wait for full ISR recovery between broker restarts.

### Broker Decommission

Safe sequence to permanently remove a broker:

```
1. Reassign all partition replicas off the broker:
   Generate a plan that excludes the target broker from all replica lists.
   Execute with --throttle.

2. Verify no partitions remain on the broker:
   kafka-topics.sh --bootstrap-server broker:9092 \
     --describe | grep "broker_id=<target>"
   (must return nothing)

3. Verify URP = 0 (all reassigned partitions fully replicated on new brokers)

4. Shut down the broker process

5. In KRaft mode: broker deregisters automatically on clean shutdown.
   In ZooKeeper mode: remove the broker's ZooKeeper znode if needed.
```

> ⚠️ **Never shut down the broker first and reassign after.** During the window between shutdown and reassignment completion, some partitions have fewer replicas than `replication.factor` — a second unexpected broker failure during this window risks data loss.

### Consumer Group Management

```bash
# Inspect group lag per partition
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --describe --group my-group

# Reset offsets (consumers must be stopped first)
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --group my-group --topic orders \
  --reset-offsets --to-earliest --dry-run    # verify first

kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --group my-group --topic orders \
  --reset-offsets --to-earliest --execute    # apply

# Skip a specific offset (poison message bypass)
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --group my-group --topic orders --partition 3 \
  --reset-offsets --to-offset 8421 --execute

# Delete an inactive group
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --delete --group my-group
```

| `--reset-offsets` option | Effect                                            |
| ------------------------ | ------------------------------------------------- |
| `--to-earliest`          | Replay full topic from the beginning              |
| `--to-latest`            | Skip all pending messages; start from now         |
| `--to-offset <N>`        | Jump to a specific offset on a specific partition |
| `--to-datetime <ISO>`    | Seek to the first offset after a timestamp        |

Always use `--dry-run` before `--execute` for offset resets. Require dual-approval in production — an incorrect reset replaying millions of messages is a data incident.

> 🎯 **Interview Lens** > **Q:** You need to add 6 new brokers to your Kafka cluster and rebalance partitions across all 10 brokers. What is the safe sequence?
> **Ideal answer:** (1) Start the new brokers and verify they join the cluster. (2) Generate a reassignment plan distributing replicas evenly across all 10 brokers. (3) Execute with a conservative throttle — enough headroom to not impact producer/consumer latency. (4) Monitor with `--verify` until all reassignments complete. (5) Run preferred replica election to rebalance leadership. (6) Remove the throttle configs. Never reassign and run an unrelated rolling restart simultaneously — two concurrent operations both touching ISR is a recipe for `NotEnoughReplicasException`.
> **Common trap:** "Just add brokers — Kafka auto-rebalances." Kafka does not automatically move existing partitions to new brokers. New topics will use them, but existing partitions stay where they are until explicitly reassigned.
> **Next question:** "How do you estimate the safe throttle for a reassignment?" → Target 20–30% of available inter-broker bandwidth. Measure current replication traffic with `BytesOutPerSec` JMX metric on follower brokers; set the throttle to leave the rest free for normal replication and consumer traffic.

**Key Takeaway:** Every Kafka operation has a safe sequence built around one invariant: ISR size must stay ≥ `min.insync.replicas` throughout. Verify URP=0 before and after each step. Throttle all reassignments. Never perform two ISR-touching operations concurrently.

---

## Security & Multi-Tenancy

**Interviewer TL;DR:** Kafka security has three independent layers — authentication (who are you), authorization (what can you do), and encryption (can anyone read the wire). All three must be configured; any one missing leaves a gap. In multi-tenant clusters, prefixed ACLs plus per-client quotas are the isolation primitives.

**Mental model:** Think of Kafka as a building: TLS locks the doors (encryption), SASL/mTLS checks ID at the door (authentication), ACLs control which floors and rooms each person can enter (authorization), and quotas limit how much bandwidth each tenant consumes in the elevator.

### Authentication

See [Authentication & Credential Rotation](./message-queues.md#authnz--credential-rotation) for the full SASL mechanism comparison (PLAIN, SCRAM-SHA-256, OAUTHBEARER, mTLS).

Kafka-specific: each listener can have its own authentication mechanism. A common production pattern separates internal broker-to-broker traffic from external client traffic:

```properties
# server.properties
listeners=INTERNAL://0.0.0.0:9093,EXTERNAL://0.0.0.0:9092
listener.security.protocol.map=INTERNAL:SSL,EXTERNAL:SASL_SSL
inter.broker.listener.name=INTERNAL

# Internal: mTLS (broker certs authenticate each other)
ssl.keystore.location=/etc/kafka/certs/broker.keystore.jks
ssl.truststore.location=/etc/kafka/certs/broker.truststore.jks

# External: SASL_SSL with SCRAM-SHA-256
sasl.enabled.mechanisms=SCRAM-SHA-256
sasl.mechanism.inter.broker.protocol=SSL
```

Never expose a `PLAINTEXT://` listener outside the local network — credentials and message content are fully unencrypted.

### Authorization — ACLs

Kafka ACLs bind a **principal** (authenticated identity) to an **operation** on a **resource**. ACL principal format: `User:alice` for SASL; `User:CN=alice,OU=eng` for mTLS.

**Resource types and their operations:**

| Resource        | Key operations                                             |
| --------------- | ---------------------------------------------------------- |
| Topic           | Read, Write, Create, Delete, Describe, Alter               |
| ConsumerGroup   | Read, Describe, Delete                                     |
| Cluster         | Create (topic auto-create), IdempotentWrite, ClusterAction |
| TransactionalId | Write, Describe                                            |

**Minimum ACLs for a producer:**

```bash
kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:producer-svc \
  --operation Write --operation Describe \
  --topic orders

# If using idempotent/transactional producer:
kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:producer-svc \
  --operation IdempotentWrite --cluster
```

**Minimum ACLs for a consumer:**

```bash
kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:consumer-svc \
  --operation Read --operation Describe \
  --topic orders

kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:consumer-svc \
  --operation Read \
  --group analytics-group
```

**Prefixed ACLs** — cover all topics under a prefix with one rule:

```bash
kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:team-payments \
  --operation Write --operation Describe \
  --topic payments. \
  --resource-pattern-type prefixed
# Covers: payments.orders, payments.refunds, payments.fraud, ...
```

Prefer prefixed ACLs in multi-tenant clusters — one ACL per team covers their entire namespace. Literal ACLs require a new entry per topic and become unmanageable at scale.

> ⚠️ **ACL anti-pattern: wildcard allow.** `ALLOW ALL ON ALL` for convenience means one compromised service credential can read every message on every topic. Grant minimum scope: Write for producers, Read for consumers, scoped to their topic prefix and consumer group prefix.

### Client Quotas

Quotas prevent one tenant from consuming the entire broker bandwidth. The broker enforces them by adding a `throttle_time_ms` delay to responses — the client backs off proportionally without being disconnected.

```bash
# Set producer quota for a user (50 MB/s)
kafka-configs.sh --bootstrap-server broker:9092 \
  --entity-type users --entity-name team-payments \
  --alter --add-config producer_byte_rate=52428800

# Set consumer quota (100 MB/s)
kafka-configs.sh --bootstrap-server broker:9092 \
  --entity-type users --entity-name team-payments \
  --alter --add-config consumer_byte_rate=104857600

# Set request CPU quota (30% of broker thread capacity)
kafka-configs.sh --bootstrap-server broker:9092 \
  --entity-type users --entity-name team-payments \
  --alter --add-config request_percentage=30
```

Quota scoping hierarchy (most specific wins): `(user, client-id)` → `user` → `client-id` → cluster default. Use user-level quotas for team isolation; client-id quotas for per-application granularity within a team.

### Payload vs Transport Encryption

See [Payload vs Transport Encryption](./message-queues.md#payload-encryption-vs-transport-encryption). TLS (`SASL_SSL` or `SSL` listeners) is always the baseline — it encrypts data in transit and prevents the broker from being wiretapped.

Payload encryption (producer encrypts before sending, consumer decrypts after receiving) prevents even the broker from reading message content. The trade-off: broker-side features that inspect message content — log compaction (key matching), schema validation, content-based routing — break when the payload is opaque ciphertext.

Use payload encryption only under explicit compliance requirements (data residency, zero-trust broker) or when using a shared managed Kafka service where the broker infrastructure is outside your trust boundary.

### Multi-Tenant Patterns

**Topic naming convention:**

```
<team>.<domain>.<event>
payments.orders.created
payments.refunds.initiated
analytics.clickstream.raw
```

A consistent convention lets prefixed ACLs map directly to ownership without per-topic grants. It also makes `auto.create.topics.enable=false` enforceable: topic creation requires an explicit ACL for `Create` on the Cluster resource, scoped to the team's prefix.

**Consumer group namespacing:**

```
<team>.<service>.<purpose>
payments.order-processor.main
analytics.dashboard.realtime
```

Pair with a `Read` ACL scoped to the team's group prefix:

```bash
kafka-acls.sh --bootstrap-server broker:9092 \
  --add --allow-principal User:team-payments \
  --operation Read \
  --group payments. \
  --resource-pattern-type prefixed
```

**Cross-team consumption:** grant explicit `Read` on specific topics only — never on the consuming team's own topic prefix. Cross-team reads should be auditable and intentional.

**Isolation summary:**

| Layer  | Mechanism                 | Prevents                    |
| ------ | ------------------------- | --------------------------- |
| Auth   | SASL / mTLS per listener  | Unauthenticated access      |
| Authz  | Prefixed ACLs per team    | Cross-team reads/writes     |
| Quotas | Per-user byte rate limits | One team starving others    |
| Naming | `<team>.<domain>.<event>` | Accidental topic collisions |

**Key Takeaway:** Prefixed ACLs and per-user quotas are the two primitives that make a shared Kafka cluster genuinely multi-tenant. Without quotas, a single team's traffic burst degrades the whole cluster. Without prefixed ACLs, access control becomes a per-topic spreadsheet that nobody maintains.

---

## Observability & Monitoring

**Interviewer TL;DR:** Under-replicated partitions and time-based consumer lag are the two most actionable production signals — URP means the durability guarantee is degraded right now; time-based lag means an SLO is being breached. JMX surfaces both; the tooling just makes them easier to visualise and alert on.

**Mental model:** A healthy Kafka cluster has three green lights: URP=0 (all replicas in sync), consumer lag stable or decreasing (consumers keeping up), and broker thread idle percent > 20% (headroom for traffic spikes). Any one going red is an incident in progress or imminent.

### Consumer Lag

See [Key Metrics & SLO Definitions](./message-queues.md#key-metrics--slo-definitions) for the full treatment — offset-based lag vs time-based lag, and why time-based lag is the correct SLO metric.

Kafka-specific: consumer lag is exposed per partition via JMX on the consumer client:

| JMX metric                                | What it measures                                                 |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `records-lag` (per partition)             | Current offset delta for that partition                          |
| `records-lag-max`                         | Max lag across all partitions assigned to this consumer instance |
| `records-consumed-rate`                   | Consumption throughput                                           |
| `fetch-latency-avg` / `fetch-latency-max` | Time from FetchRequest sent to response received                 |

`records-lag-max` is the primary per-consumer SLO metric. Alert on sustained growth, not transient spikes during normal traffic bursts.

### JMX Metrics

Kafka exposes metrics via JMX. Key metrics to monitor by category:

**Broker — cluster health:**

| Metric (MBean path abbreviated)            | Alert threshold              |
| ------------------------------------------ | ---------------------------- |
| `ReplicaManager.UnderReplicatedPartitions` | Any value > 0                |
| `ReplicaManager.IsrShrinksPerSec`          | Any sustained > 0            |
| `KafkaController.ActiveControllerCount`    | Not exactly 1 across cluster |
| `ReplicaFetcherManager.MaxLag`             | Trending upward              |

**Broker — resource saturation:**

| Metric                                                 | Alert threshold                    |
| ------------------------------------------------------ | ---------------------------------- |
| `KafkaRequestHandlerPool.RequestHandlerAvgIdlePercent` | < 20% (handler threads saturated)  |
| `SocketServer.NetworkProcessorAvgIdlePercent`          | < 20% (network threads saturated)  |
| `BrokerTopicMetrics.BytesInPerSec`                     | Near disk write throughput ceiling |
| Disk utilisation (OS-level)                            | > 70% → act before 85%             |

**Producer client:**

| Metric                                        | Use                                    |
| --------------------------------------------- | -------------------------------------- |
| `record-error-rate`                           | Retriable vs non-retriable errors      |
| `request-latency-avg` / `request-latency-max` | Broker response time                   |
| `batch-size-avg`                              | Validate linger.ms / batch.size tuning |
| `compression-rate-avg`                        | Verify compression is effective        |

**Consumer client:**

| Metric                    | Use                                  |
| ------------------------- | ------------------------------------ |
| `records-lag-max`         | Primary lag SLO metric               |
| `commit-latency-avg`      | Offset commit performance            |
| `fetch-throttle-time-avg` | Broker-side quota enforcement firing |

### Lag Tooling

**Built-in CLI:**

```bash
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --describe --group my-group

# Output: TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG  CONSUMER-ID
# Lag = LOG-END-OFFSET - CURRENT-OFFSET per partition
```

Useful for spot checks; not suitable for continuous monitoring or alerting.

**Burrow (LinkedIn, open-source):**

Evaluates consumer group health using a sliding window over committed offsets. Classifies each group into a state:

| State   | Meaning                                                                   |
| ------- | ------------------------------------------------------------------------- |
| OK      | Consuming, lag stable or decreasing                                       |
| WARNING | Lag growing slowly — watch                                                |
| ERROR   | Lag growing consistently — active problem                                 |
| STALLED | Consumer committing offsets but lag not decreasing — maxed out throughput |
| STOPPED | No offset commits — consumer has stopped entirely                         |

STALLED and STOPPED require different responses: STALLED = scale consumers or reduce processing time; STOPPED = consumer process down or crashed.

**Kafka UI / AKHQ (open-source web UI):**

Visual per-topic, per-partition, per-consumer-group lag dashboard. Also provides: topic browsing, consumer group offset reset UI, Schema Registry integration.

**Cruise Control (LinkedIn, open-source):**

Automated broker load rebalancing based on CPU, disk, network, and partition count metrics. Generates partition reassignment plans targeting balanced broker utilisation. Also detects anomalies (URP spikes, broker goal violations) and can self-heal within configured constraints.

### Under-Replicated Partitions

A URP means at least one partition has fewer in-sync replicas than its `replication.factor`. With `min.insync.replicas=2`, a single URP means one more broker failure away from that partition becoming unwritable.

**Alert:** `UnderReplicatedPartitions > 0` — any duration. Do not suppress.

**Investigating URPs:**

```bash
# Which partitions are under-replicated and which replicas are out of sync?
kafka-topics.sh --bootstrap-server broker:9092 \
  --describe --under-replicated-partitions

# Pattern: if the same broker ID appears repeatedly as out-of-sync → broker-level issue
# Pattern: scattered across many brokers → network or cluster-wide issue
```

**Common causes and signals:**

| Cause                                | Signal                                            | Action                                                      |
| ------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| Broker failure                       | Broker missing from ISR across all its partitions | Replace or recover broker                                   |
| GC pause > `replica.lag.time.max.ms` | `IsrShrinksPerSec` spike; broker JVM GC logs      | Tune GC; tune `replica.lag.time.max.ms` up                  |
| Disk I/O saturation                  | High disk await time on follower                  | Reduce topic write rate or add capacity                     |
| Network congestion                   | Replication lag metric climbing on follower       | Check inter-broker bandwidth; throttle cross-AZ replication |

URPs are always a pre-failure signal — by the time a partition becomes unwritable, you've already lost your buffer. Treat URP=1 with the same urgency as a partial outage.

### Trace Context Propagation

See [Trace Context Propagation](./message-queues.md#trace-context-propagation) for the concept and why queue dwell time matters for end-to-end traces.

Kafka-specific: trace context is carried in `ProducerRecord` and `ConsumerRecord` headers. Use the W3C `traceparent` header:

```python
# Producer: inject current span into headers
producer.send(ProducerRecord(
    topic="orders",
    key=order_id,
    value=payload,
    headers=[Header("traceparent", current_span.traceparent.encode())]
))

# Consumer: extract and create child span
traceparent = next(
    (h.value for h in record.headers if h.key == "traceparent"), None
)
with tracer.start_span("kafka.consume", child_of=traceparent):
    process(record)
```

This produces a trace spanning: HTTP request → producer `send()` → broker dwell → consumer `poll()` → downstream DB write — the broker dwell time is visible as a span gap, which is what makes queue dwell time SLOs observable.

> 🎯 **Interview Lens** > **Q:** Your on-call dashboard shows consumer lag growing on a high-priority topic. Walk through your diagnosis.
> **Ideal answer:** (1) Is lag growing linearly or exponentially? Linear = steady rate mismatch; exponential = cascading problem. (2) Check consumer host metrics — CPU, memory, GC pauses. Is processing the bottleneck? (3) Check downstream dependency latency — DB, external API — is the consumer blocked on writes? (4) Check partition count vs consumer count — if equal, cannot add parallelism without repartitioning. (5) Check `max.poll.records` — reducing it cuts per-poll processing time. (6) Check for skewed partitions — is one partition holding all the lag while others are fine?
> **Common trap:** Immediately scaling consumers. If partition count = consumer count, adding more consumers creates idle instances with no impact on lag.
> **Next question:** "Lag is near zero all day but spikes to 10 minutes every day at 9 AM. What do you look for?" → Diurnal traffic spike. Producer throughput climbs at 9 AM faster than consumer throughput can absorb. Either pre-scale consumers on a schedule, or configure autoscaling on time-based lag metrics before the SLO is breached.

**Key Takeaway:** URP=0 and stable time-based consumer lag are the two production health invariants. JMX exposes them directly; Burrow adds state classification for alerting. Trace context in message headers is what connects producer latency, broker dwell, and consumer processing into a single observable trace.

---

## Managed Offerings

**Interviewer TL;DR:** MSK runs real Kafka with AWS-native auth but limited operational control. Confluent Cloud includes the full ecosystem (Schema Registry, ksqlDB, Connect) at a premium. Azure Event Hubs exposes a Kafka-compatible API surface but is not Kafka internally — feature gaps exist. All managed options trade control for reduced ops burden.

**Mental model:** Managed Kafka is a spectrum from "we run Kafka for you" (MSK, Confluent) to "we speak Kafka's language but aren't Kafka" (Event Hubs). The distinction matters when you hit an edge case the managed service doesn't support.

### Amazon MSK

Runs genuine Apache Kafka on AWS. You choose broker instance types, storage, and AZ placement; AWS handles ZooKeeper/KRaft, broker recovery, and OS patching.

- **Auth:** IAM authentication (AWS-native, no credential rotation), SASL/SCRAM, mTLS. IAM auth is the simplest for AWS-native services but adds ~1–2 ms latency per request due to token validation.
- **Ecosystem:** MSK Connect (managed Kafka Connect workers). No built-in Schema Registry — use AWS Glue Schema Registry or self-host.
- **Serverless variant:** MSK Serverless auto-scales throughput units; no broker sizing required. Trade-off: higher per-unit cost, higher tail latency, fewer tunable configs.
- **Limitations:** no broker SSH access, some topic configs cannot change post-creation, no Kafka Streams managed service.
- **Tiered storage:** supported (Kafka 3.6+ on MSK).
- **Best for:** AWS-native architectures, teams wanting real Kafka with minimal ops, existing AWS IAM infrastructure.

### Confluent Cloud

Managed Kafka by Confluent (founded by Kafka's original authors). Offers the most complete managed ecosystem.

- **Cluster types:** Basic, Standard, Dedicated (single-tenant), and Freight (high-throughput optimised).
- **Ecosystem:** Schema Registry, ksqlDB, managed Kafka Connect, managed Apache Flink — all integrated and fully managed. This is the primary differentiator from MSK.
- **Auth:** API keys, SASL/PLAIN over TLS, OAuth 2.0, mTLS. RBAC (Role-Based Access Control) replaces raw Kafka ACLs with a more manageable permission model.
- **Multi-cloud:** AWS, GCP, Azure — cross-cloud clusters via Confluent's private networking.
- **Cost:** meaningfully higher than MSK for equivalent throughput. The premium pays for the ecosystem and RBAC.
- **Best for:** teams that need Schema Registry + ksqlDB + Connect managed together, multi-cloud event streaming, or organisations prioritising ecosystem depth over cost.

### Azure Event Hubs

> ⚠️ **Event Hubs is not Apache Kafka.** It is Microsoft's proprietary event streaming service with a Kafka-protocol-compatible API surface. Most producer/consumer code works without changes — but the internal architecture, tooling, and feature set differ.

- **What works:** standard Kafka producers/consumers, consumer groups, offset management via Kafka protocol.
- **What doesn't:** log compaction (not supported on Basic/Standard tiers), Kafka transactions (not supported on Basic tier), `kafka-consumer-groups.sh` and `kafka-topics.sh` CLI tools (Event Hubs exposes its own management APIs), custom topic configs (`retention.ms` configured via Event Hub namespace settings, not Kafka topic configs).
- **Schema Registry:** Azure Schema Registry (Avro, JSON Schema, Protobuf).
- **Pricing:** throughput units (TUs) or processing units (PUs) on Premium tier.
- **Best for:** Azure-native architectures where the team already operates within the Azure ecosystem and Kafka-protocol compatibility is sufficient. Evaluate feature gaps carefully before committing.

### Aiven for Kafka

Runs genuine Apache Kafka on any major cloud (AWS, GCP, Azure, DigitalOcean, others). Open-source stack with no proprietary lock-in.

- Includes: managed Kafka Connect, MirrorMaker 2, Schema Registry (Karapace — open-source Confluent Schema Registry alternative).
- Strong multi-cloud story without Confluent's pricing model.
- Less ecosystem depth than Confluent (no managed ksqlDB, no managed Flink).
- **Best for:** teams wanting managed real Kafka across multiple clouds without vendor lock-in or Confluent's cost structure.

### Trade-off Matrix

| Dimension        | MSK                | Confluent Cloud         | Azure Event Hubs      |
| ---------------- | ------------------ | ----------------------- | --------------------- |
| Kafka-native     | Yes (Apache Kafka) | Yes (Apache Kafka)      | No (compatible API)   |
| Schema Registry  | External (Glue)    | Included                | Azure Schema Registry |
| Kafka Connect    | MSK Connect        | Included (managed)      | Via custom deployment |
| ksqlDB / Flink   | Not included       | Included (managed)      | Not included          |
| Auth model       | IAM / SASL / mTLS  | API keys / RBAC / OAuth | Azure AD / SAS        |
| Multi-cloud      | AWS only           | AWS + GCP + Azure       | Azure only            |
| Ops burden       | Low                | Very low                | Very low              |
| Feature fidelity | Full               | Full                    | Partial               |
| Relative cost    | Moderate           | High                    | Moderate              |

**Self-managed Kafka** (on EC2, GKE, bare metal): maximum control, maximum ops burden. The right choice when you need configs or features no managed service exposes, have a large enough team to operate it, or have cost constraints that make managed pricing prohibitive at scale (>500 MB/s sustained throughput).

> ⚖️ **Decision Framework**
> Start with three questions: (1) Are you AWS/Azure/GCP-native? → MSK / Event Hubs / Confluent align with each. (2) Do you need Schema Registry + ksqlDB + Connect managed together? → Confluent Cloud. (3) Is the Kafka-compatible API enough, or do you need full Kafka semantics (compaction, transactions, full topic config control)? → Event Hubs if the former; MSK/Confluent/Aiven if the latter. Self-managed only when the above don't fit your cost or control requirements.

**Key Takeaway:** MSK and Confluent run real Kafka; Event Hubs runs a Kafka-compatible service — test your specific feature requirements before committing to Event Hubs. Confluent's premium buys the integrated ecosystem; MSK's value is AWS-native simplicity. Aiven fills the multi-cloud real-Kafka gap without vendor lock-in.

---

## Kafka Ecosystem

**Interviewer TL;DR:** Kafka the broker is the log; Kafka Streams and ksqlDB are the compute layer over that log; Kafka Connect is the integration layer in/out of the log; Schema Registry is the contract layer governing what goes into the log. Each is independently deployable and useful.

**Mental model:** Kafka is a highway. Streams/ksqlDB are vehicles driving on it, processing cargo in motion. Connect is the on/off ramp moving cargo between the highway and warehouses (databases, S3, search engines). Schema Registry is the shipping manifest — enforcing that cargo is correctly labelled before it gets on the road.

### Kafka Streams

> _See [Kafka Streams](./kafka-streams.md) for full coverage._

Kafka Streams is a Java client library for stateful, fault-tolerant stream processing over Kafka topics. It runs inside your application JVM — no separate processing cluster.

Core concepts:

- **KStream** — an unbounded stream of records; each record is an independent event.
- **KTable** — a changelog stream interpreted as a materialised table; each record is an upsert keyed by the record's key. Backed by a compacted Kafka topic.
- **State stores** — local RocksDB (persistent) or in-memory stores for aggregations, joins, and windowed operations. Automatically backed to a compacted changelog topic; recovered from that topic on restart.
- **Exactly-once processing** — via `processing.guarantee=exactly_once_v2`; uses transactional producer under the hood.
- **Windowing** — tumbling (non-overlapping fixed intervals), hopping (overlapping fixed intervals), sliding (event-time proximity), session (activity-gap based).

### Kafka Connect

> _See [Kafka Connect](./kafka-connect.md) for full coverage._

Kafka Connect is a framework for streaming data between Kafka and external systems without writing custom producer/consumer code.

- **Source connectors** — pull data from external systems into Kafka topics (databases, S3, REST APIs).
- **Sink connectors** — push data from Kafka topics into external systems (S3, Elasticsearch, Snowflake, JDBC targets).
- **Distributed mode** — Connect workers form a cluster; tasks are distributed and fault-tolerant. Worker failure causes task redistribution to remaining workers.
- **Debezium** — the dominant CDC source connector. Reads the database WAL (PostgreSQL) or binlog (MySQL) and streams row-level changes as Kafka events. Each table maps to a topic; each row change is a message. Enables real-time data synchronisation without polling.

### ksqlDB

> _See [Kafka Streams](./kafka-streams.md) for full coverage._

ksqlDB exposes Kafka Streams capabilities via a SQL-like streaming query interface:

```sql
-- Persistent query: runs continuously, materialises into output topic
CREATE STREAM high_value_orders AS
  SELECT order_id, customer_id, amount
  FROM orders_stream
  WHERE amount > 10000;

-- Pull query: point-in-time lookup against materialised state
SELECT * FROM order_counts WHERE order_id = 'ORD-12345';
```

Persistent queries run indefinitely until explicitly terminated. Pull queries are answered from the local state store — low latency, but require the serving node to hold the relevant partition. ksqlDB is operationally simpler than Kafka Streams for teams that prefer SQL over Java DSL; it has less flexibility for complex topologies.

### Schema Registry

Schema Registry stores and enforces message schemas for Kafka topics — preventing consumers from breaking when producers change their payload structure.

**How it works:**

```
Producer                   Schema Registry              Broker
   │                              │                        │
   │── register/lookup schema ───▶│                        │
   │◀── schema ID (int32) ────────│                        │
   │                              │                        │
   │── serialize payload:         │                        │
   │   [magic byte=0x00]          │                        │
   │   [schema ID: 4 bytes]       │                        │
   │   [Avro/Protobuf payload]    │                        │
   │────────────────────────── produce ───────────────────▶│
```

```
Consumer                   Schema Registry              Broker
   │◀─────────────────────── fetch record ────────────────│
   │── read schema ID from bytes 1–4                       │
   │── fetch schema by ID ────────────────────────────────▶│
   │◀── schema definition ────────────────────────────────│
   │── deserialize payload                                  │
```

The schema ID in every message payload means consumers always know which schema version to use, even when schema has evolved.

**Compatibility modes** govern what schema changes are allowed:

| Mode       | Allows                             | Prevents                                |
| ---------- | ---------------------------------- | --------------------------------------- |
| `BACKWARD` | Add optional fields, remove fields | Adding required fields, changing types  |
| `FORWARD`  | Remove optional fields, add fields | Removing required fields                |
| `FULL`     | Add/remove optional fields only    | Any breaking change in either direction |
| `NONE`     | Any change                         | Nothing — no validation                 |

`BACKWARD` is the most common production choice: new consumer code can read messages produced by old producer code. A consumer is upgraded first (reads old schema fine), then the producer is upgraded (writes new schema which old consumer would reject — but old consumer is already replaced). This is the rolling upgrade pattern.

**Supported formats:** Avro (most common; compact binary, native schema evolution), Protobuf (language-neutral, Google-native), JSON Schema (human-readable, higher overhead).

**Implementations:**

- Confluent Schema Registry (open-source; the reference implementation; also managed in Confluent Cloud)
- Karapace (open-source, API-compatible, used by Aiven)
- AWS Glue Schema Registry (AWS-native; works with MSK)

> ⚠️ **Without Schema Registry, schema changes are a coordination problem.** Producers and consumers must deploy simultaneously — or one side breaks the other. At scale with multiple producer and consumer teams, this becomes a release coordination nightmare. Schema Registry makes schema evolution async: teams deploy independently, compatibility mode enforces the contract.

> ⚖️ **Decision Framework**
> | Component | Use when |
> | --------- | -------- |
> | Kafka Streams | Stream processing in Java/Kotlin; stateful aggregations, joins, windowing; need exactly-once |
> | ksqlDB | SQL-native stream processing; simpler topologies; team prefers SQL over Java DSL |
> | Kafka Connect | Moving data in/out of Kafka without custom code; CDC from databases; loading into data warehouse |
> | Schema Registry | Multiple teams producing/consuming the same topics; need schema evolution without coordination |

**Key Takeaway:** Schema Registry is the least optional of the four — operating Kafka at scale without it forces simultaneous producer/consumer deployments for any schema change. The others are additive based on use case. Kafka Streams for compute over the log; Connect for integration; ksqlDB when SQL is preferable to Java.

---

## Production Failure Modes & Recovery

**Interviewer TL;DR:** Most Kafka incidents fall into five categories: durability failures (unclean election, disk full), availability failures (GC-induced ISR shrink), consumer correctness failures (offset reset), and throughput failures (partition hotspot, rebalance storm). Each has a specific detection signal and a specific recovery action — "it's slow" is not a diagnosis.

### Unclean Leader Election — Data Loss

> _Full treatment: [Unclean Leader Election](./message-queues.md#unclean-leader-election--data-loss)_

Kafka-specific prevention: `unclean.leader.election.enable=false` at broker and/or topic level (covered in [Topic & Broker Configuration](#topic--broker-configuration)).

**Recovery after an unclean election:**

1. Identify the loss window: compare the old leader's last known HW (from pre-failure monitoring) with the new leader's log start offset. The gap is the lost message range.
2. Replay from upstream source of truth (the database that drove the events, an upstream API log, or a MirrorMaker replica in another DC).
3. Audit consuming systems: any consumer that processed a message in the loss window may hold state based on data that no longer exists on the broker.

### Thundering Herd on Broker Restart

> _Full treatment: [Thundering Herd on Broker Restart](./message-queues.md#thundering-herd-on-broker-restart--cache-warmup)_

After a broker restarts, all consumers reading from its partitions hit cold disk instead of warm page cache — throughput drops sharply until the cache warms.

**Mitigation:** warm the page cache before re-admitting leadership:

```bash
# Pre-warm page cache by sequentially reading recent log segments
find /kafka/logs -name "*.log" -newer /tmp/last-restart-marker \
  -exec dd if={} of=/dev/null bs=1M 2>/dev/null \;

# Then trigger preferred replica election to hand leadership back gradually
kafka-leader-election.sh --bootstrap-server broker:9092 \
  --election-type PREFERRED --all-topic-partitions
```

### Disk Full — Read-Only Partitions

> _Full treatment: [Disk Full & Read-Only Partitions](./message-queues.md#disk-full--read-only-partitions)_

**Immediate remediation:**

```bash
# Reduce retention on the largest topics dynamically (no restart needed)
kafka-configs.sh --bootstrap-server broker:9092 \
  --entity-type topics --entity-name high-volume-topic \
  --alter --add-config retention.ms=3600000   # drop to 1 hour temporarily

# Check which topics are consuming the most disk
kafka-log-dirs.sh --bootstrap-server broker:9092 \
  --topic-list topic1,topic2 --describe | sort -k3 -rn | head -20
```

Alert at 70% disk utilisation; act at 85%. Never let it reach 100% — Kafka does not gracefully handle full disks, and recovery from a broker that OOM-killed due to disk pressure is slower than proactive action.

### GC Pauses + ISR Shrink

> _Full treatment: [GC Pauses & ISR Shrink](./message-queues.md#gc-pauses--isr-shrink)_

Kafka-specific: if GC pauses routinely exceed `replica.lag.time.max.ms`, ISR shrinks on every GC cycle, generating constant URP alerts and `NotEnoughReplicasException` errors for producers.

Two-pronged fix:

1. **Tune GC:** G1GC with `-XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35`. For pauses that G1 cannot tame, switch to ZGC (`-XX:+UseZGC`) for sub-millisecond GC pauses at the cost of higher CPU.
2. **Tune the lag threshold:** if pauses are infrequent and bounded (e.g., <5 s), raise `replica.lag.time.max.ms` to 45–60 s to stop ISR churn without fixing the root cause. This is a short-term measure — fix the GC root cause.

### Consumer Offset Reset — Mass Reprocessing

> _Full treatment: [Consumer Offset Metadata Corruption](./message-queues.md#consumer-offset-metadata-corruption)_

**Prevention:** `auto.offset.reset=none` in production — throws `NoOffsetForPartitionException` instead of silently resetting. Makes any missing offset an explicit error requiring human action rather than a silent backlog replay.

**When a reset happens:** stop consumers immediately before the reprocessing cascades to downstream systems. See [Consumer Group Management](#consumer-group-management) for the reset-offsets CLI sequence.

### Partition Hotspot

> _Not in message-queues.md — Kafka-specific._

**Cause:** all or most messages route to a single partition because keys have low cardinality or one key dominates traffic (a viral user ID, a shared tenant key, or a producer misconfigured to always use the same key).

**Symptoms:** one partition's lag grows while siblings are idle; broker hosting that partition leader shows high `BytesInPerSec` while others are underloaded; consumer assigned to the hot partition cannot keep up regardless of instance size.

**Detection:**

```bash
# Per-partition lag: identify the outlier partition
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --describe --group my-group | sort -k5 -rn | head -10

# Per-partition bytes-in (JMX): kafka.server:type=BrokerTopicMetrics,
# name=BytesInPerSec,topic=<name>,partition=<N>
```

**Remediation options (choose based on ordering requirements):**

| Option                                                            | Effect on ordering         | When to use                                |
| ----------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| Higher-cardinality keys (e.g., `userId+eventType`)                | Per-key ordering preserved | Key schema redesign is feasible            |
| Append random suffix to hot keys (e.g., `userId-0` to `userId-7`) | Per-key ordering broken    | Ordering not required; throughput critical |
| Custom partitioner routing hot keys across partitions             | Configurable               | Need partial ordering preservation         |
| Increase consumer concurrency within the partition                | No change to distribution  | Short-term relief; doesn't fix root cause  |

The only permanent fix is redesigning the key schema to use higher-cardinality keys. Suffix-based spreading is a valid mitigation when per-key ordering is not a requirement.

### Rebalance Storm

> _Not in message-queues.md — Kafka-specific._

**Cause:** cascading consumer group rebalances — one rebalance triggers another before the first completes. A rebalance stops consumption on affected partitions; downstream lag builds; pressure causes more consumers to breach `max.poll.interval.ms`; they are ejected; more rebalances fire.

**Triggers:**

- Rolling deploy without static group membership: each pod restart = one rebalance
- Slow processing causing `max.poll.interval.ms` breaches: ejected consumers rejoin → rebalance loops
- Large consumer group with eager rebalancing: stop-the-world pause generates a lag spike large enough to exceed downstream SLOs and trigger alerts that cause manual intervention, making it worse

**Detection:** repeated `REBALANCE_IN_PROGRESS` errors in consumer logs, lag growing despite consumers running, consumer group status cycling rapidly in Burrow or Kafka UI.

**Recovery and prevention:**

```
1. Enable cooperative rebalancing:
   partition.assignment.strategy=CooperativeStickyAssignor
   → only moved partitions stop; others continue consuming

2. Enable static group membership:
   group.instance.id=<stable-pod-identifier>
   session.timeout.ms=120000  (longer than pod restart time)
   → no rebalance on pod restarts within session window

3. Reduce max.poll.records to prevent max.poll.interval.ms breaches:
   max.poll.records=100  (tune down until processing fits within interval)

4. Investigate the root processing slowdown:
   → downstream DB slow? → add connection pool, read replica
   → CPU-bound processing? → parallelise within consumer, add partitions
```

Cooperative rebalancing + static group membership together eliminate the vast majority of rebalance storms. Without them, a rebalance storm in a large consumer group during a peak traffic period is one of the most disruptive Kafka incidents to recover from.

> 🎯 **Interview Lens** > **Q:** Your monitoring shows a Kafka consumer group in constant rebalancing. Lag is growing despite consumers appearing healthy. Walk through diagnosis and fix.
> **Ideal answer:** Constant rebalancing with growing lag is a rebalance storm. Diagnosis: (1) Check consumer logs for `REBALANCE_IN_PROGRESS` and `max.poll.interval.ms` exceeded errors — confirms the trigger. (2) Check processing time per batch — if it exceeds `max.poll.interval.ms`, that's the root cause. (3) Check if this started with a deploy — if so, missing static group membership is the trigger. Fix sequence: reduce `max.poll.records` immediately to stop the ejection loop, then enable `CooperativeStickyAssignor` and `group.instance.id` to prevent recurrence. Then fix the root processing bottleneck.
> **Common trap:** "Add more consumers." If the group is in a rebalance loop, adding consumers triggers more rebalances. Stabilise first, scale after.

**Key Takeaway:** Partition hotspot and rebalance storm are the two Kafka-specific failure modes without direct parallels in generic message queue systems. Hotspot requires key schema changes; rebalance storm requires cooperative rebalancing and static group membership. Both are preventable with upfront design; both are painful to recover from under load.

---

## Common Interview Gotchas

**"Kafka is a message queue"**
Kafka is a distributed append-only log. Messages are retained after consumption; any number of independent consumer groups read the full stream at their own pace and can replay from any offset. A message queue deletes messages on ACK. Treating Kafka as a queue (one consumer group, no replay, message deleted after processing) misses its core value and adds operational weight for no benefit — use SQS or RabbitMQ if that's the actual pattern.

**"Exactly-once means no duplicates end-to-end"**
Kafka's exactly-once guarantee (`enable.idempotence=true` + transactional API) covers Kafka-to-Kafka flows only. It prevents broker-level duplicates from producer retries and enables atomic multi-topic writes. It does nothing for side effects on external systems — if your consumer writes to Postgres or calls an HTTP API, you need application-level idempotency at that boundary regardless of transactional producer config. See [message-queues.md](./message-queues.md#reliability--delivery-semantics).

**"Partition count is a one-way door — but I can always add more later"**
You can increase partition count, but it has consequences: key-based routing changes because `hash(key) % new_partition_count` remaps keys across partitions, breaking per-key ordering for all keys that move. This is not a safe background operation. It requires draining in-flight messages and coordinated producer/consumer restarts if ordering guarantees exist. Plan partition count at topic creation based on max expected throughput and consumer parallelism. The correct question is not "how many do I need now?" but "how many will I need at peak?"

**"More partitions = more throughput"**
Only if the bottleneck is partition-level parallelism. If the bottleneck is consumer processing time, downstream DB write latency, broker disk I/O, or inter-broker network bandwidth, adding partitions does nothing. Diagnose the bottleneck first: per-partition lag metrics, consumer CPU/IO, downstream latency. More partitions also means longer rebalances, more open file handles, and higher replication overhead — there is a cost.

**"`auto.offset.reset=earliest` is a safe default"**
It is the correct default for development. In production it is a data incident waiting to happen: any new consumer group name, accidental group rename, or deletion of the `__consumer_offsets` topic partition causes the consumer to silently begin replaying the entire topic backlog — potentially millions of messages. Use `auto.offset.reset=none` in production; it throws `NoOffsetForPartitionException` on missing offset, forcing explicit handling before consumption starts.

**"Adding more consumers increases throughput"**
Only up to the partition count. Kafka assigns at most one consumer per partition per group. If your topic has 12 partitions and you deploy 20 consumers in the same group, 8 of them sit idle and receive no messages. To increase parallelism beyond partition count, you must increase partition count — and accept the key remapping consequences.

**"Log compaction keeps all values"**
Log compaction keeps only the **latest value per key** at the time of compaction. Earlier values are permanently deleted. Additionally: tombstones (null-value records used to delete a key) are retained only for `delete.retention.ms` (default 24 h) before being dropped. A consumer offline longer than this window will never see the deletion — its local view of the key space will be stale. CDC targets and Kafka Streams state stores must account for this.

**"`acks=all` makes my data durable"**
Only in combination with `min.insync.replicas ≥ 2`. With the default `min.insync.replicas=1`, `acks=all` waits for exactly one replica (the leader) to acknowledge — functionally identical to `acks=1`. The common false comfort: "we have replication factor 3 and acks=all, we're safe." Check `min.insync.replicas`. If it is 1, you have false durability.

**"Increasing `segment.ms` speeds up compaction"**
The opposite. Log compaction can only run on sealed segments. A large `segment.ms` means the active segment stays open longer — more dirty data accumulates in the active segment before it can be compacted. Smaller `segment.ms` means segments seal more frequently, giving the cleaner more opportunities to run and keeping the dirty ratio lower.

**"KRaft is just removing ZooKeeper"**
KRaft changes the metadata propagation model from push (controller notifies each broker individually via RPC) to pull (brokers subscribe to the `__cluster_metadata` log). This shift removes the practical partition ceiling (~200k with ZooKeeper), cuts controller failover from minutes to seconds, and simplifies operations — but it requires understanding a new mental model. "Removing ZooKeeper" undersells what changed and leads to underestimating migration planning effort, especially for Kafka 4.0 where ZooKeeper mode is gone entirely.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Full Form                                | Meaning                                                                                    |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| ISR     | In-Sync Replica                          | Set of replicas fully caught up with the partition leader; the durability contract surface |
| LEO     | Log End Offset                           | Next offset to be written on a partition; the leader's latest position                     |
| HW      | High Watermark                           | Highest offset replicated to all ISR members; the consumer visibility boundary             |
| URP     | Under-Replicated Partition               | Partition with fewer in-sync replicas than its replication factor                          |
| KRaft   | Kafka Raft Metadata                      | ZooKeeper-free cluster metadata consensus via Raft (KIP-500; default in Kafka 3.3+)        |
| PID     | Producer ID                              | Assigned per producer session by the broker for idempotent duplicate detection             |
| CDC     | Change Data Capture                      | Streaming database row changes (WAL/binlog) as Kafka events                                |
| WAL     | Write-Ahead Log                          | Database durability log; primary CDC source (PostgreSQL WAL, MySQL binlog)                 |
| JMX     | Java Management Extensions               | Kafka's metrics exposure protocol; primary observability interface                         |
| ALSO    | Last Stable Offset                       | Highest offset of committed transactions; `read_committed` consumers read only up to ALSO  |
| RPO     | Recovery Point Objective                 | Maximum acceptable data loss window                                                        |
| TO      | Recovery Time Objective                  | Maximum acceptable time to recover from a failure                                          |
| CQRS    | Command Query Responsibility Segregation | Pattern separating write and read models; commonly implemented with Kafka as the event log |

---

### Anti-patterns

- **Using Kafka for task distribution** — each message processed by one consumer, no replay needed. Kafka adds partition planning, consumer group ops, and offset management for no benefit. Use SQS or RabbitMQ.

- **`acks=all` with `min.insync.replicas=1`** — false durability. With ISR=1, `acks=all` waits for only the leader — identical to `acks=1`. Set `min.insync.replicas=2` for real durability.

- **`auto.create.topics.enable=true` in production** — topic name typos silently create misconfigured topics with default settings, no ACLs, and no monitoring. Set to `false`; require explicit topic creation with reviewed configs.

- **`auto.offset.reset=earliest` in production** — any new group name or deleted offset store triggers full backlog replay. Use `none`; let missing offsets surface as explicit exceptions.

- **Low-cardinality key schema** — routing by `user_type` (3 values) creates 3 hot partitions regardless of total partition count. Use high-cardinality keys (`user_id`, `order_id`) to distribute load.

- **Unthrottled partition reassignment** — saturates inter-broker network, elevates producer latency, triggers ISR shrinks. Always `--throttle`; remove the throttle config after completion.

- **Restarting multiple brokers simultaneously** — with `replication.factor=3` and `min.insync.replicas=2`, two brokers down drops ISR below the floor; `acks=all` producers fail. Restart one at a time; wait for URP=0 between restarts.

- **Compacted topic without tombstones for deletion** — deleted keys persist forever in the compacted log. Publish a null-value record for each key to delete; the cleaner drops it after `delete.retention.ms`.

- **Enabling transactional producer without `isolation.level=read_committed` on consumers** — consumers with `read_uncommitted` read messages from open and aborted transactions. Pair every transactional producer with `read_committed` consumers.

- **Consumers > partitions without adding partitions** — excess consumers sit idle. Adding consumers beyond partition count does not increase throughput; increase partition count first (and accept the key remapping consequence).

- **Treating tiered storage as zero-latency** — object-store reads add tens to hundreds of milliseconds of latency. Do not enable tiered storage on topics where consumers regularly replay historical data for real-time processing.

---

### Configuration Reference Matrix

#### Producer

| Config                                  | Default                         | Production guidance                                                 |
| --------------------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `acks`                                  | `1`                             | `all` for durability; `0` only for non-critical metrics             |
| `enable.idempotence`                    | `false`                         | `true` always when retries enabled                                  |
| `retries`                               | `2147483647` (with idempotence) | Leave at default with idempotence; explicit value otherwise         |
| `max.in.flight.requests.per.connection` | `5`                             | `≤5` with idempotence; `1` without idempotence if ordering required |
| `linger.ms`                             | `0`                             | `5–20` for throughput; `0` for low-latency paths                    |
| `batch.size`                            | `16384` (16 KB)                 | `65536–262144` for high-throughput topics                           |
| `compression.type`                      | `none`                          | `lz4` (best throughput/CPU); `zstd` (best ratio, more CPU)          |
| `buffer.memory`                         | `33554432` (32 MB)              | Increase if producers block frequently under burst                  |
| `max.block.ms`                          | `60000`                         | Tune to upstream SLA; never `0` without overflow handling           |

#### Consumer

| Config                          | Default            | Production guidance                                          |
| ------------------------------- | ------------------ | ------------------------------------------------------------ |
| `auto.offset.reset`             | `latest`           | `none` in production; `earliest` in dev only                 |
| `enable.auto.commit`            | `true`             | `false`; use manual commit after processing                  |
| `max.poll.records`              | `500`              | Reduce until processing fits within `max.poll.interval.ms`   |
| `max.poll.interval.ms`          | `300000` (5 min)   | Set to worst-case batch processing time + 20% buffer         |
| `session.timeout.ms`            | `45000`            | Tune above expected GC/restart pause duration                |
| `fetch.min.bytes`               | `1`                | `16384–65536` for high-throughput tail consumers             |
| `isolation.level`               | `read_uncommitted` | `read_committed` when consuming from transactional producers |
| `partition.assignment.strategy` | `RangeAssignor`    | `CooperativeStickyAssignor` in all production groups         |
| `group.instance.id`             | (unset)            | Set to stable pod identifier to enable static membership     |

#### Topic

| Config                           | Default              | Production guidance                                                      |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `replication.factor`             | `1`                  | `3` in production                                                        |
| `min.insync.replicas`            | `1`                  | `2` (replication.factor − 1)                                             |
| `cleanup.policy`                 | `delete`             | `compact` for CDC/state; `delete,compact` for capped compacted topics    |
| `retention.ms`                   | `604800000` (7 days) | Set to business SLA; size accordingly                                    |
| `retention.bytes`                | `-1`                 | Set for high-throughput topics to cap per-partition storage              |
| `segment.ms`                     | `604800000` (7 days) | `3600000` (1 h) for frequently compacted topics                          |
| `max.message.bytes`              | `1048588`            | Increase only if needed; update consumer `max.partition.fetch.bytes` too |
| `unclean.leader.election.enable` | `false`              | Keep `false` for all durability-critical topics                          |

#### Broker

| Config                           | Default        | Production guidance                                                 |
| -------------------------------- | -------------- | ------------------------------------------------------------------- |
| `auto.create.topics.enable`      | `true`         | `false` in production                                               |
| `replica.lag.time.max.ms`        | `30000` (30 s) | Tune above P99 GC pause duration; typically 30–60 s                 |
| `unclean.leader.election.enable` | `false`        | Keep `false`; override at topic level if needed                     |
| `num.partitions`                 | `1`            | Set default partition count for auto-created topics if enabled      |
| `auto.leader.rebalance.enable`   | `true`         | Keep `true`; schedule `leader.imbalance.check.interval.seconds=300` |

---

### Broker Comparison Matrix

**Log-based systems (Kafka family):**

| Dimension                      | Kafka                                         | Kinesis                                  |
| ------------------------------ | --------------------------------------------- | ---------------------------------------- |
| Abstraction                    | Distributed log, self-managed                 | Managed log, serverless-compatible       |
| Replay                         | Yes — any offset, indefinite retention        | Yes — up to 365 days                     |
| Throughput per shard/partition | ~10–50 MB/s                                   | 1 MB/s write / 2 MB/s read               |
| Ecosystem                      | Streams, Connect, ksqlDB, Schema Registry     | Kinesis Data Analytics (Flink)           |
| Ops burden                     | High — cluster sizing, KRaft, partition ops   | Low — fully managed                      |
| Best for                       | Self-managed, high throughput, rich ecosystem | AWS-native, moderate throughput, low ops |

**Queue-based systems (for context):**

| Dimension                      | Kafka                             | SQS                                  | RabbitMQ                                       |
| ------------------------------ | --------------------------------- | ------------------------------------ | ---------------------------------------------- |
| Abstraction                    | Log — retained after consumption  | Work queue — deleted on ACK          | Work queue + flexible routing                  |
| Replay                         | Yes                               | No                                   | No                                             |
| Multiple independent consumers | Yes — independent consumer groups | No — competing consumers share queue | No — competing consumers                       |
| Routing flexibility            | Topic + partition key             | None natively                        | Exchange types: direct, topic, fanout, headers |
| Ops burden                     | High                              | None (managed)                       | Medium                                         |
| Best for                       | Fan-out, replay, event streaming  | Simple task offload, AWS-native      | Complex routing, polyglot clients              |
