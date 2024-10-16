# Database Design and Normalization
### What are the different levels of normalization, and how do they improve database design?
### What are the trade-offs between normalization and denormalization?
### How would you design a database schema for a social media platform?
### What is the difference between primary keys, surrogate keys, and natural keys?
### Explain the purpose of foreign keys. How would you design cascading updates and deletes?
### What is a composite key? When would you use one?
### Explain normalization to the 5th normal form (5NF) and its significance.
### How would you design a schema to store hierarchical data (e.g., company organizational structure)?
### How do you ensure referential integrity in a relational database design?
### What considerations would you take when designing a database for high availability?

# Indexes and Query Optimization
### What are the differences between clustered and non-clustered indexes?
### How does a B-tree index work, and why is it commonly used?
### Explain the difference between a hash index and a B-tree index. When would you use one over the other?
### How does indexing affect query performance, and when could it degrade performance?
### How would you optimize a slow SQL query involving multiple joins?
### What is a covering index, and when would you use one?
### What is a bitmap index, and how does it differ from a B-tree index?
### How would you analyze and optimize query execution plans in an RDBMS like MySQL or PostgreSQL?
### What are composite indexes, and when should they be used?
### How would you monitor and manage index fragmentation?

# Transactions and Concurrency Control
### Explain ACID properties in the context of a database.
### What is a deadlock, and how can you prevent it in a database system?
### What are the different isolation levels in a database, and how do they affect concurrency?
### How do databases ensure atomicity of transactions in the case of a system crash?
### What is two-phase locking (2PL), and how does it help manage concurrency?
### How do optimistic and pessimistic concurrency controls differ?
### What is a transaction log, and how does it ensure data durability?
### What is a phantom read, and how can it be avoided?
### How does a database system handle rollback and recovery in a distributed transaction?
### Explain the difference between two-phase commit and three-phase commit protocols.

# Distributed Databases and Sharding
### What are the CAP theorem and its implications for distributed databases?
### How would you implement sharding in a distributed database? What are the challenges?
### Explain the difference between horizontal and vertical scaling.
### What is eventual consistency, and when would you prioritize it over strong consistency?
### How do replication and partitioning work in a distributed system?
### What is a quorum in distributed databases, and how is it used to ensure consistency?
### What are the advantages and disadvantages of leader-follower replication models?
### Explain the concept of read replicas. When would you use them?
### How do distributed databases handle fault tolerance and failover?
### How would you design a globally distributed database system with minimal latency?

# Data Modeling and ER Diagrams
### What is an Entity-Relationship (ER) diagram, and how do you use it for database design?
### How would you model a many-to-many relationship in an ER diagram?
### How do you convert an ER diagram into a relational database schema?
### Explain the significance of weak entities in ER diagrams.
### How do you represent inheritance in an ER diagram, and how would you implement it in a relational database?
### What are aggregation and generalization in the context of ER diagrams?
### How do you model recursive relationships in ER diagrams?
### What are the key challenges in converting an ER model into a physical database design?
### How would you design an ER model for an e-commerce platform?
### What is a ternary relationship, and how do you represent it in an ER diagram?

# NoSQL Databases and Data Stores
### What are the key differences between SQL and NoSQL databases?
### Explain the four types of NoSQL databases and provide use cases for each.
### What is eventual consistency, and how is it implemented in NoSQL databases?
### How does sharding work in NoSQL databases like MongoDB?
### How would you model a schema-less database like MongoDB for a blogging platform?
### What are the trade-offs of using NoSQL over relational databases?
### How does CAP theorem influence the design of NoSQL databases?
### What is a document-based NoSQL database, and when would you choose it?
### Explain the advantages of column-family stores like Cassandra over key-value stores.
### What is the role of consistency models in NoSQL databases?

# Replication and High Availability
### What is replication, and why is it important for databases?
### How does master-slave replication differ from multi-master replication?
### What are the pros and cons of synchronous vs asynchronous replication?
### How would you design a high-availability database system for a financial application?
### What is a replication lag, and how can you minimize it?
### How do you handle read-write splitting in a replicated database environment?
### How does data consistency work in replicated databases across different geographical regions?
### What is failover, and how does it work in a replicated database system?
### What are conflict resolution strategies in multi-master replication?
### Explain how you can achieve zero-downtime during database failover.

# Security and Access Control
### How would you design a role-based access control system in a database?
### Explain SQL injection and how to prevent it in a web application.
### What is data encryption at rest vs in transit, and how would you implement it in a database?
### What are the principles of least privilege, and how do they apply to database security?
### How would you audit database access and detect malicious activity?
### What is database hardening, and what steps would you take to secure a production database?
### How would you handle password management in a database?
### How do you protect sensitive data in a database using encryption techniques like AES?
### What are stored procedures, and how can they improve database security?
### How would you secure backups and restore procedures in a database system?

# Backup, Recovery, and Disaster Recovery
### What are the different types of database backups, and when should each be used?
### How would you design a backup and recovery plan for a mission-critical application?
### What is the difference between incremental and differential backups?
### How would you test the reliability of your database backups?
### How do point-in-time recovery (PITR) techniques work in databases?
### What are the best practices for handling database corruption?
### How would you implement automated backups in a cloud-based database system?
### Explain the importance of database snapshots in backup and recovery.
### What is a database disaster recovery plan, and what should it include?
### How do replication and backup strategies interact in the context of disaster recovery?

# SQL Queries and Advanced SQL
### What is the difference between a correlated subquery and a regular subquery?
### How does a recursive common table expression (CTE) work?
### Explain window functions in SQL and provide examples of use cases.
### What are the differences between UNION and UNION ALL?
### How would you write a query to find the second-highest salary in a company?
### What is a pivot table in SQL, and how do you implement one?
### How would you write a SQL query to group records by month from a timestamp field?
### What is the difference between a CROSS JOIN and an INNER JOIN?
### How does a FULL OUTER JOIN work? Provide a use case for when you'd use it.
### How would you write a SQL query to find duplicate rows in a table?

# Tricky Questions
### Explain the differences between OLTP and OLAP systems. How do their design principles vary?
| Properties                     | OLTP                                                         | OLAP                                                                                         |
|--------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| designed for                   | managing real-time transactional data                        | analysis and reporting on large volumes of historical data                                   |
| typically used                 | day-to-day operations                                        | read-heavy queries(data aggregation, summarization, and multi-dimensional analysis)          |
| use cases                      | bank transactions, retail sales                              | data warehousing, business intelligence, performance monitoring, financial reporting         | 
| data normalization             | highly normalized (typically upto 3NF)                       | usually normalized for efficient querying (typically using star or snowflake schema designs) |
| data nature                    | Real-time, up-to-date, volatile (frequently changes)         | Historical, large-scale, often aggregated, non-volatile (rarely changes).                    |                                                                           |
| data storage                   | numerous tables with small amounts of data                   | large amounts of historical data                                                             |
| workload type                  | Short, atomic transactions like CRUD                         | Complex, analytical queries involving aggregations, joins, and grouping.                     |
| schema objective               | Reduce redundancy and optimize data integrity                | Optimize query performance for analytical reporting                                          |
| performance optimization       | Low-latency, fast writes, high concurrency                   | Efficient data retrieval, fast aggregation, and summarization                                |
| performance techniques         | Indexing, query optimization, partitioning, locking          | Pre-aggregation, materialized views, indexing, partitioning by dimensions eg time/region     |
| data storage and size          | Typically smaller, generally only current transactional data | Much larger, as it stores historical data                                                    |
| concurrency and locking        | High concurrency, low latency, fine-grained locking          | Lower concurrency, read-heavy operations, fewer locks required                               |
| ETL (Extract, Transform, Load) | Minimal to none, as transactions are real-time               | Crucial for transforming and loading data from OLTP to OLAP                                  |
|--------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------|       

### Difference between clustered index and non-clustered index?
| Key Features        | Clustered Index                                                        | Non-Clustered Index                                             |
|---------------------|------------------------------------------------------------------------|-----------------------------------------------------------------|
| **What it is?**         | defines the physical order in which data is stored in a table          | is an entirely separate data structure altogether               |
| how many allowed?   | 1 at max (can be composite)                                            | 0 or more                                                       |
| what does it store? | leaf nodes store the actual row of the table                           | stores the key-value and pointer to the row in the table        |
| use case            | Primary key, columns frequently used in range queries (e.g., ORDER BY) | Columns frequently used in WHERE, JOIN, or filtering conditions |
|---------------------|------------------------------------------------------------------------|-----------------------------------------------------------------|

- What happens if no Clustered index is provided?
  - some databases make primary key as clustered index (if provided). A DB without a clustered index is called a Heap Table. They are stored as heap
- Does Clustered Index have to be on the Primary Key?
  - Not necessarily, but it is recommended.

### Explain how ACID properties work in distributed systems
- **Atomicity in Distributed Systems**
  - **What it is?**
    - ensures that a transaction is treated as a single “all-or-nothing” unit of work.
    - challenging because multiple nodes must coordinate to ensure that the entire transaction is applied consistently across all nodes.
  - **How It Works?**
    - **Two-Phase Commit (2PC):** One common protocol to achieve atomicity in distributed systems is the two-phase commit protocol.
      - Phase 1 (Prepare): The coordinator node asks all participating nodes whether they can commit the transaction.
      - Phase 2 (Commit/Rollback): If all nodes agree, the coordinator tells them to commit; if any node fails, it tells them to roll back.
- **Consistency in Distributed Systems**
  - **What it is?**
    - guarantees that a transaction takes the system from one valid state to another, adhering to the defined integrity constraints (such as unique keys or foreign key constraints).
    - challenging because each node could have its own copy of the data, and they need to agree on the final state after a transaction.
  - **How It Works?**
    - **Strong Consistency:** ensure that after a transaction is committed, all nodes reflect the same data, either by synchronously replicating the changes or by using consensus algorithms.
      - Example: In strongly consistent systems (like traditional relational databases with distributed transactions), all nodes must agree on the transaction result before any node commits the changes.
    - **Eventual Consistency:** the system allows temporary inconsistencies between nodes but guarantees that they will converge to the same state eventually.
      - Example: In a system like Amazon DynamoDB or Cassandra, writes might be committed locally on one node, and the updates will propagate to other nodes asynchronously. 
  - **Challenges**
    - CAP Theorem: states that, in distributed systems, it’s impossible to achieve Consistency, Availability, and Partition Tolerance all at the same time.
- **Isolation in Distributed Systems**
  - **What it is?**
    - ensures that concurrent transactions do not interfere with each other, preventing phenomena like dirty reads, non-repeatable reads, and phantom reads.
    - tricky because each node might be processing transactions in parallel, and communication delays can cause inconsistencies.
  - **How It Works?**
    - **Distributed Locking**, using systems like Zookeeper or Redis, to prevent concurrent transactions from affecting the same piece of data simultaneously.
    - **Snapshot Isolation**, each transaction works on a consistent snapshot of the data.
      - implemented to prevent transactions from seeing uncommitted changes made by other transactions.
  - **Challenges**
    - **Global Concurrency Control** can slow down performance because of the need for synchronization across different nodes.
    - need for coordination across nodes, might lead to **slower transaction processing** compared to single-node systems.
- **Durability in Distributed Systems**
  - **What it is?**
    - guarantees that once a transaction has been committed, the changes are permanent, even in the case of a system crash or power failure.
  - **How It Works?**
    - **Data Replication:** A write is only considered durable once it has been successfully replicated to enough nodes.
      - Distributed databases like Cassandra or MongoDB replicate data across nodes. Once the replication factor (e.g., 3 copies of the data) is satisfied, the transaction is considered durable.
    - **Write-Ahead Logging (WAL):** to ensure that all changes are first written to a durable log before the transaction is applied. This log is replicated to other nodes to ensure that even if the leader node crashes, other nodes can replay the log and ensure data persistence.
- **Examples of Distributed Databases and ACID Properties**
  - **Google Spanner:** is a globally distributed database that supports ACID transactions. It uses techniques like TrueTime (to ensure strong consistency) and Paxos for consensus to implement global transactions that maintain ACID properties.
  - **Cassandra:**  distributed NoSQL database that favors eventual consistency over strong consistency and supports tunable consistency levels. It provides weaker forms of ACID properties, which are more relaxed in favor of higher availability and partition tolerance.
  - **CockroachDB:** distributed SQL database that guarantees serializable isolation (the strictest form of isolation) and supports distributed ACID transactions. It uses a combination of Raft consensus for durability and multi-version concurrency control (MVCC) for isolation.

### What is CAP theorem?
### What are isolation levels in databases? How do they prevent various concurrency issues like dirty reads and phantom reads?
### How would you handle database partitioning for a large-scale distributed system? What are the types of partitioning?
### Explain the concept of eventual consistency in NoSQL databases. When would you choose eventual consistency over strong consistency?
### What are materialized views? How are they different from regular views? How would you maintain them in real-time?
### Describe how indexing impacts query performance. When would an index slow down performance?
### What is a deadlock? How can it be detected and resolved in relational databases?
### Explain normalization up to the 5th normal form (5NF). What are the advantages and trade-offs of each normal form?
### What is sharding? How would you shard a large database, and what challenges could arise from it?
### How does a B-Tree index work? Why is it commonly used for database indexing?
### What is the difference between a LEFT JOIN, RIGHT JOIN, INNER JOIN, and FULL OUTER JOIN?
### How would you optimize a slow SQL query involving multiple joins and subqueries?
### Explain write-ahead logging (WAL). Why is it important in ensuring database durability?
### How does database replication work? What are the different types, and when would you use each type?
### What is the difference between vertical and horizontal scaling in databases? Provide examples of scenarios for each.
### How would you implement multi-tenancy in a database system? What challenges could arise, and how would you solve them?
### What are foreign key constraints? How do cascading actions like DELETE and UPDATE work with foreign keys?
### Explain how indexing works in NoSQL databases like MongoDB. How does it differ from traditional relational databases?
### How would you design a fault-tolerant database system? Discuss failover strategies.
### What is a CTE (Common Table Expression) in SQL? When should you use it, and how does it impact query performance?
### Explain how transactions are managed in distributed systems. What are two-phase and three-phase commits?
### What is a bitmap index? When is it preferred over a B-Tree index?
### How would you implement full-text search in a relational database? What are the challenges and optimizations?
### What is the difference between a surrogate key and a natural key? When would you choose one over the other?
### How does a database handle concurrency in a multi-user environment? What are locking mechanisms and their types?
### Explain the difference between an in-memory database and a traditional disk-based database. What are the advantages and challenges of each?
### How would you design a schema to store hierarchical data in an SQL database? Discuss approaches like adjacency list, nested sets, and materialized paths.