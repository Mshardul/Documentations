# DBMS Core
## What is the difference between a database and a DBMS?
`DataBase` `DBMS` `DBMS Core`
- A **Database** is a structured collection of data. A **DBMS (Database Management System)** is the software that interacts with the database. It helps in creating, managing, manipulating, and securing the data within the database.
## What are the types of DBMS?
`DBMS` `DBMS Core`

# ACID Properties
## Explain the ACID properties in the context of transaction management.
`DataBase Concept` `ACID Properties` `Atomicity` `Consistency` `Durability` `Isolation`
- **ACID** stands for **Atomicity**, **Consistency**, **Isolation**, and **Durability** - the four key properties that guarantee **reliable** and **safe** transactions in a database system.
- **Atomicity**: Ensures that all parts of a transaction succeed or none do.
- **Consistency**: Ensures that a transaction leaves the DB in a valid state, preserving all constraints and rules.
- **Isolation**: Ensures that a transaction does not affect other transactions.
- **Durability**: Ensures that a transaction is stored permanently in the DB, even if the system crashes.

## How does a DBMS ensure isolation between concurrent transactions?
`DataBase Concept` `Isolation`
## What mechanisms are used to ensure durability in databases?
`DataBase Concept` `Durability`
## What happens if a system crash occurs in the middle of a transaction?
`DataBase Concept` `Atomicity`

# Normalization
## What is normalization? Describe up to 3NF with examples.
`DataBase Concept` `Normalization`
## How does normalization improve database design? Explain with examples.
`DataBase Concept` `DataBase Design` `Normalization`
## What are the different normal forms? When should denormalization be preferred?
`DataBase Design` `Denormalization` `Normalization` 

# Database Indexing
## Explain the concept of indexing. How does it improve query performance?
`DataBase Concept` `Indexing`
## What are clustered vs. non-clustered indexes?
`DataBase Concept` `Clustered Index` `Indexing` `Non-Clustered Index`
## What is a composite index, and when is it useful?
`DataBase Concept` `Composite Index`
## What are secondary indexes in NoSQL and when do they become performance bottlenecks?
`DataBase Concept` `NoSQL` `Secondary Index`
## What are TTL indexes in NoSQL, and how are they used?
`DataBase Concept` `NoSQL` `TTL Index`
## What is a covering index? How does it improve query performance?
`DataBase Concept` `Covering Index`

# DataBase Keys
## How do foreign keys ensure referential integrity?
`DataBase Concept` `Foreign Key` `Referential Integrity`
## What are surrogate keys vs. natural keys?
`DataBase Concept` `Natural Key` `Surrogate Key`

# DataBase Sharding and Partitioning
## Explain database sharding. What are its trade-offs?
`DataBase Concept` `Sharding`
## Explain sharding and partitioning in NoSQL systems.
`DataBase Concept` `NoSQL` `Sharding` `Partitioning`

# DataBase Views
## What is a view? How is it different from a materialized view?
`DataBase Concept` `Materialized View` `View`

# Stored Procedures
## What are stored procedures? What are their advantages and drawbacks? when would you use them over plain SQL?
`DataBase Concept` `SQL` `Stored Procedure`

# DataBase Triggers
## How do triggers work, and what are some common use cases?
`DataBase Concept` `Trigger`
## Describe scenarios for using triggers. What risks do they pose?
`DataBase Concept` `Trigger`

# SQL Query Optimization
## How would you debug and optimize a slow SQL query?
`DataBase Query Optimization` `SQL`

# SQL Query
## Explain the difference between WHERE and HAVING clauses.
`HAVING Clause` `SQL` `WHERE Clause`
## What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?
`FULL OUTER JOIN` `INNER JOIN` `LEFT JOIN` `RIGHT JOIN` `SQL Query`
## How does the EXISTS clause differ from IN, and when should one be used over the other?
`EXISTS Clause` `IN Clause` `SQL Query`
## When would you use a UNION vs. a JOIN?
`JOIN` `SQL Query` `UNION`
## What is the difference between UNION and UNION ALL?
`SQL Query` `UNION` `UNION ALL`
## How do GROUP BY and PARTITION BY differ?
`GROUP BY` `PARTITION BY`
## How do you paginate large result sets efficiently in SQL?
`SQL Query` `Pagination`
## How do you handle NULL values in SQL queries?
`SQL Query` `NULL Value`
## What is the difference between CHAR and VARCHAR data types?
`CHAR` `SQL` `VARCHAR`

# SQL
## What are subqueries, and how do correlated subqueries differ?
`Correlated Subquery` `SQL` `Subquery`
## What is the execution plan of a query? How can it help in optimization?
`Execution Plan` `SQL`
## What is a CTE (Common Table Expression)? How does it help in query structuring? When would you use it over a subquery?
`Common Table Expression (CTE)` `SQL` `SQL Query Structuring`
## Explain window functions and provide use cases for RANK(), ROW_NUMBER(), and DENSE_RANK().
`DENSE_RANK` `RANK` `ROW_NUMBER` `SQL` `Window Function`
## Explain row-level security in PostgreSQL or SQL Server.
`PostgreSQL` `Row-Level Security` `SQL Server`

# Transaction and Concurrency
## How do transactions work? Explain COMMIT, ROLLBACK, and SAVEPOINT.
`Commit` `Rollback` `Savepoint`
## What are isolation levels in SQL, and how do they impact concurrency?
`Concurrency` `Isolation Level` `SQL`
## How does optimistic locking differ from pessimistic locking?
`Optimistic Locking` `Pessimistic Locking`
## What is a deadlock? How can you detect and resolve it?
`Deadlock`
## Explain the concept of a two-phase commit.
`Two-Phase Commit`
## What are phantom reads, dirty reads, and non-repeatable reads?
`Dirty Read` `Non-Repeatable Read` `Phantom Read`

# Database Modeling
## How do you model many-to-many relationships in relational databases?
`Many-to-Many Relationship`
## How do you manage schema evolution over time in production systems?
`Database Schema Evolution`

# Database Design
## What are the key considerations while designing a multi-tenant database?
`Multi-Tenant Database`

# Database Migration
## How would you migrate a relational database to a NoSQL store?
`Relational Database` `NoSQL`

# SQL vs NoSQL
## What are the key differences between SQL and NoSQL databases?
`SQL` `NoSQL`
## Explain the CAP theorem. How do NoSQL databases prioritize its components?
`CAP Theorem` `NoSQL`
## When would you recommend a document store like MongoDB over a relational database?
`Document Store` `MongoDB`
## How do you implement full-text search in SQL vs NoSQL?
`Full-Text Search` `SQL` `NoSQL`
## How does Redis differ from traditional relational databases?
`Redis` `Relational Database`
## How do you handle schema changes in a NoSQL database with zero downtime?
`NoSQL` `Zero Downtime`

# NoSQL
## What is eventual consistency in NoSQL systems?
`Eventual Consistency` `NoSQL`
## What are the four main types of NoSQL databases? Provide examples for each.
`NoSQL`
## What is denormalization, and why is it common in NoSQL design?
`Denormalization` `NoSQL`
## How does MongoDB handle relationships (e.g., embedding vs. referencing)?
`MongoDB` `Relationship` `NoSQL` `Reference`
## Describe Cassandra’s architecture. How does it achieve high availability?
`Cassandra` `High Availability`
## What is a partition key in NoSQL databases like DynamoDB or Cassandra?
`Partition Key` `NoSQL` `DynamoDB` `Cassandra`
## How are transactions handled in NoSQL databases like MongoDB or Cassandra?
`MongoDB` `Cassandra` `NoSQL` `Transaction`
## What is MapReduce? How is it used in NoSQL systems like MongoDB?
`MapReduce` `MongoDB`

# Other Data Types
## Compare OLAP vs. OLTP systems. Provide use cases for each.
`OLAP` `OLTP`

# Backup, Recovery & Availability
## What are common backup strategies for relational databases?
`Backup Strategy` `Relational Database`
## How do you implement high availability in a SQL-based system?
`High Availability` `SQL`
## What is point-in-time recovery, and how is it achieved?
`Point-in-Time Recovery`
## How do you handle failover and replication in production databases?
`Failover` `Replication`
## What is WAL (Write-Ahead Logging), and how does it work?
`WAL (Write-Ahead Logging)`

# Scalability & Performance
## How do you scale relational databases horizontally?
`Relational Database` `Scalability`
## What is a connection pool and how does it improve DB performance?
`Connection Pool` `DB Performance`
## How does a read-replica work, and when would you use one?
`Read Replica` `Scalability`
## What performance counters or metrics do you monitor in production DBs?
`Performance Counters` `DB Performance`
## How would you handle a sudden spike in database traffic?
`Database Traffic` `Scalability`

# N+1 Query Problem
## What is the N+1 query problem, and how do you mitigate it?
`N+1 Query Problem`