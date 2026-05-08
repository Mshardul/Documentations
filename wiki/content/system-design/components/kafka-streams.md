# Kafka Streams

## Prerequisites

- **[Kafka](./kafka.md)** [Must read] - Kafka Streams is a client library over Kafka topics; partitions, consumer groups, offsets, and the log model are assumed.

---

## Table of Contents

<!-- Stub — sections to be completed. -->

---

## TLDR

Kafka Streams is a Java client library for stateful, fault-tolerant stream processing directly over Kafka topics — no separate processing cluster required. State is stored locally in RocksDB and backed to a compacted changelog Kafka topic, enabling transparent recovery after failure. ksqlDB exposes the same capabilities via a SQL-like streaming query interface.

---

🔗 Back to: [Kafka](./kafka.md)
