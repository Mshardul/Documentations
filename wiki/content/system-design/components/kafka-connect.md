# Kafka Connect

## Prerequisites

- **[Kafka](./kafka.md)** [Must read] - Connect workers produce to and consume from Kafka topics; the partition and offset model applies directly.

---

## Table of Contents

<!-- Stub — sections to be completed. -->

---

## TLDR

Kafka Connect is a framework for streaming data between Kafka and external systems (databases, object stores, search engines) without writing custom producer/consumer code. Source connectors pull data in; sink connectors push data out. Debezium is the dominant source connector for CDC (Change Data Capture) from relational databases, turning the database write-ahead log into a Kafka topic stream.

---

🔗 Back to: [Kafka](./kafka.md)
