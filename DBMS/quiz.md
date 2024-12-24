# Question 1
## Tags
#dbms #rdbms #sql #postgresql #foreignkey
## Question
In PostgreSQL, which of the following is true about foreign key constraints?
## Options
- [ ] Deleting a referenced row will always result in an error
- [ ] `ON DELETE CASCADE` deletes referencing rows automatically
- [ ] `ON DELETE SET NULL` sets the referencing column to zero
- [ ] Foreign key constraints can only reference primary keys of other tables
## Answer
2. `ON DELETE CASCADE` deletes referencing rows automatically

# Question 2
## Tags
#dbms #rdbms #sql #postgresql #pattern_matching #like
## Question
Which of the following queries will correctly fetch all users whose email contains ‘gmail.com’ in a PostgreSQL database?
## Options
- [ ] `SELECT * FROM users WHERE email = ‘%gmail.com%’`
- [ ] `SELECT * FROM users WHERE email LIKE ‘%gmail.com%’`
- [ ] `SELECT * FROM users WHERE email IN ‘%gmail.com%’`
- [ ] `SELECT * FROM users WHERE email CONTAINS ‘%gmail.com%’`
## Answer
2. `SELECT * FROM users WHERE email LIKE ‘%gmail.com%’`

# Question 3
## Tags
#dbms #rdbms #sql #mysql #dirty_read
## Question
In MySQL, which isolation level prevents dirty reads but allows non-repeatable reads?
## Options
- [ ] Read Uncommitted
- [ ] Read Committed
- [ ] Repeatable Read
- [ ] Serializable
## Answer
2. Read Committed

# Question 4
## Tags
#dbms #nosql #mongodb #replica_set
## Question
In MongoDB, which of the following methods is used to ensure that write operations to a replica set are acknowledged by the majority of nodes?
## Options
- [ ] `j=true`
- [ ] `fsync=true`
- [ ] `w=1`
- [ ] `w=majority`
## Answer
4. `w=majority`

# Question 5
## Tags
#dbms #rdbms #sql #mysql #max #second_max
## Question
Which SQL query would retrieve the second highest salary from an employees table in MySQL?
## Options
- [ ] `SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)`
- [ ] `SELECT salary FROM employees ORDER BY salary DESC LIMIT 1,1`
- [ ] `SELECT MAX(salary) FROM employees OFFSET 1 LIMIT 1`
- [ ] `SELECT salary FROM employees ORDER BY salary ASC LIMIT 1`
## Answer
1. `SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)`

# Question 6
## Tags
#dbms #nosql #dynamodb #partition_key
## Question
In DynamoDB, which of the following best describes a partition key?
## Options
- [ ] A composite key consisting of a partition key and a sort key
- [ ] A unique identifier used to distribute data across partitions
- [ ] A secondary index used to speed up queries
- [ ] A primary key that can contain multiple attributes
## Answer
2. A unique identifier used to distribute data across partitions.

# Question 7
## Tags
#dbms #nosql #postgresql #gdpr
## Question
Which of the following PostgreSQL features is used to ensure compliance with GDPR’s data retention policies?
## Options
- [ ] Tablespaces
- [ ] Triggers
- [ ] Partitioning
- [ ] Row-Level Security
## Answer
4. Row-Level Security

# Question 8
## Tags
#dbms #rdbms #acid #isolation
## Question
In a relational database, what does the ACID property “Isolation” ensure?
## Options
- [ ] Transactions are executed in isolation, preventing interference from other transactions
- [ ] Data integrity is maintained even during system failures
- [ ] All changes from a transaction are permanently stored
- [ ] The database remains consistent before and after a transaction
## Answer
1. Transactions are executed in isolation, preventing interference from other transactions

# Question 9
## Tags
#dbms #rdbms #sql #mysql #constraint #unique
## Question
In MySQL, which of the following clauses is used to enforce a UNIQUE constraint across multiple columns?
## Options
- [ ] `DISTINCT`
- [ ] `UNIQUE INDEX`
- [ ] `CONSTRAINT KEY`
- [ ] `PRIMARY KEY`
## Answer
2. `UNIQUE INDEX`

# Question 10
## Tags
#dbms #nosql #mongodb #query
## Question
Which MongoDB query will find documents where the age field is greater than 25 and less than 35?
## Options
- [ ] `db.collection.find({ age: { $gt: 25, $lt: 35 } })`
- [ ] `db.collection.find({ age: { $gt: 25 && $lt: 35 } })`
- [ ] `db.collection.find({ age: { $between: [25, 35] } })`
- [ ] `db.collection.find({ $and: [ { age: { $gt: 25 } }, { age: { $lt: 35 } } ] })`
## Answer
1. `db.collection.find({ age: { $gt: 25, $lt: 35 } })`

# Question 11
## Tags
#dbms #rdbms #sql #postgresql #explain
## Question
In PostgreSQL, what does the EXPLAIN command do?
## Options
- [ ] Executes a query and returns its result
- [ ] Analyzes and stores query execution statistics
- [ ] Displays the execution plan of a query without running it
- [ ] Optimizes the query and rewrites it for better performance
## Answer
3. Displays the execution plan of a query without running it

# Question 12
## Tags
#dbms #nosql #dynamodb #index #gsi
## Question
In DynamoDB, which of the following best describes a global secondary index (GSI)?
## Options
- [ ] An index with the same partition key as the base table but a different sort key
- [ ] An index with a different partition key and optional sort key from the base table
- [ ] A secondary index that is created automatically for every table
- [ ] An index used only for local queries within a partition
## Answer
2. An index with a different partition key and optional sort key from the base table

# Question 13
## Tags
#dbms #rdbms #sql #mysql #group_concat
## Question
In MySQL, what is the purpose of the GROUP_CONCAT function?
## Options
- [ ] Calculates the sum of a numeric column grouped by a condition
- [ ] Concatenates strings from a group into a single string
- [ ] Counts the number of rows grouped by a condition
- [ ] Returns the first value in a group
## Answer
2. Concatenates strings from a group into a single string

# Question 14
## Tags
#dbms #rdbms #sql #postgresql #vacuum
## Question
In PostgreSQL, what does the VACUUM command do?
## Options
- [ ] Reclaims storage occupied by dead tuples
- [ ] Analyzes and updates table statistics for the query planner
- [ ] Removes duplicate rows from a table
- [ ] Combines multiple queries into a single execution
## Answer
1. Reclaims storage occupied by dead tuples

# Question 15
## Tags
#dbms #nosql #mongodb #query
## Question
In MongoDB, which of the following operators is used to match documents where a field exists or does not exist?
## Options
- [ ] `$exists`
- [ ] `$in`
- [ ] `$eq`
- [ ] `$size`
## Answer
1. `$exists`

# Question 16
## Tags
#dbms #rdbms #sql #mysql #query
## Question
In SQL, what will the following query return?
```sql
SELECT COUNT(*), COUNT(column_name) FROM my_table;
```
## Options
- [ ] The total number of rows and rows where `column_name` is `NULL`
- [ ] The total number of rows and rows where `column_name` is `NOT NULL`
- [ ] Only rows where `column_name` is `NULL`
- [ ] Only rows where `column_name` is `NOT NULL`
## Answer
2. The total number of rows and rows where `column_name` is `NOT NULL`

# Question 17
## Tags
#dbms #nosql #dynamodb #consistency #eventual_consistency
## Question
In DynamoDB, which of the following is true about eventual consistency?
## Options
- [ ] Provides the strongest consistency guarantee but at the cost of performance
- [ ] Ensures data is always consistent immediately after a write operation
- [ ] Allows faster reads but may return stale data for a short period
- [ ] Only available for global tables, not for local tables
## Answer
3. Allows faster reads but may return stale data for a short period

# Question 18
## Tags
#dbms #rdbms #sql #aggregation #filter
## Question
Which of the following SQL clauses is used to filter groups after aggregation?
## Options
- [ ] `WHERE`
- [ ] `GROUP BY`
- [ ] `HAVING`
- [ ] `ORDER BY`
## Answer
2. `HAVING`

# Question 19
## Tags
#dbms #nosql #mongodb #update
## Question
In MongoDB, which operator is used to update a document by adding a value to an existing array field without creating duplicates?
## Options
- [ ] `$push`
- [ ] `$addToSet`
- [ ] `$set`
- [ ] `$pop`
## Answer
2. `$addToSet`

# Question 20
## Tags
#dbms #rdbms #sql #postgresql #json
## Question
In PostgreSQL, which data type is best suited for storing JSON data?
## Options
- [ ] TEXT
- [ ] BYTEA
- [ ] VARCHAR
- [ ] JSON
## Answer
4. JSON

# Question 21
## Tags
#dbms #rdbms #sql #mysql #coalesce
## Question
In MySQL, what will the following query return?
```sql
SELECT COALESCE(NULL, NULL, 'Hello', NULL, 'World');
```
## Options
- [ ] `‘Hello’`
- [ ] `‘World’`
- [ ] `‘Hello World’`
- [ ] `NULL`
## Answer
1. `‘Hello’`

# Question 22
## Tags
#dbms #nosql #dynamodb #scan
## Question
In DynamoDB, what is the primary use of the `Scan` operation?
## Options
- [ ] Efficiently retrieves data based on the partition key
- [ ] Deletes all items from the table
- [ ] Scans the entire table to retrieve all items or a subset of items
- [ ] Creates a secondary index for querying data
## Answer
3. Scans the entire table to retrieve all items or a subset of items

# Question 23
## Tags
#dbms #rdbms #sql #postgresql #constraint #unique
## Question
In PostgreSQL, which of the following is the correct syntax to create a unique constraint on a column?
## Options
- [ ] `ALTER TABLE table_name ADD CONSTRAINT constraint_name UNIQUE(column_name);`
- [ ] `ALTER TABLE table_name ADD UNIQUE(column_name);`
- [ ] `CREATE UNIQUE INDEX ON table_name(column_name);`
- [ ] `ALTER TABLE table_name MODIFY UNIQUE(column_name);`
## Answer
1. `ALTER TABLE table_name ADD CONSTRAINT constraint_name UNIQUE(column_name);`

# Question 24
## Tags
#dbms #rdbms #sql #mysql #auto_increment
## Question
In MySQL, what is the purpose of the `AUTO_INCREMENT` attribute?
## Options
- [ ] Automatically increments a numeric column by 2 for every insert
- [ ] Ensures that a column contains unique values
- [ ] Automatically generates sequential numbers for a column
- [ ] Automatically updates a column with the current timestamp
## Answer
3. Automatically generates sequential numbers for a column

# Question 25
## Tags
#dbms #rdbms #sql #postgresql #grouping #aggregation
## Question
In MongoDB, which aggregation stage is used to group documents by a specific field and perform operations on grouped data?
## Options
- [ ] `$group`
- [ ] `$match`
- [ ] `$project`
- [ ] `$sort`
## Answer
1. `$group`

# Question 26
## Tags
#dbms #rdbms #sql #postgresql #index
## Question
In PostgreSQL, which of the following commands will create an index on the `email` column of a table named `users`?
## Options
- [ ] `CREATE UNIQUE INDEX ON users(email);`
- [ ] `CREATE INDEX email_index ON users(email);`
- [ ] `ALTER TABLE users ADD INDEX email_index (email);`
- [ ] `CREATE INDEX ON users.email;`
## Answer
2. `CREATE INDEX email_index ON users(email);`

# Question 27
## Tags
## Question
In MySQL, what does the `INFORMATION_SCHEMA` database provide?
## Options
- [ ] A collection of user data from all databases
- [ ] Performance metrics for SQL queries
- [ ] Metadata about database objects such as tables, columns, and indexes
- [ ] A storage engine for transactional operations
## Answer
3. Metadata about database objects such as tables, columns, and indexes

# Question 28
## Tags
#dbms #nosql #dynamodb #cache
## Question
In DynamoDB, which feature is used to store frequently accessed data in-memory for faster reads?
## Options
- [ ] Provisioned Throughput
- [ ] Global Tables
- [ ] DynamoDB Accelerator (DAX)
- [ ] Global Secondary Index
## Answer
3. DynamoDB Accelerator (DAX)

# Question 29
## Tags
#dbms #rdbms #sql #mysql #null
## Question
In SQL, what will the following query return?
```sql
SELECT NULL + 1;
```
## Options
- [ ] `NULL`
- [ ] `1`
- [ ] `0`
- [ ] `Error`
## Answer
1. `NULL`

# Question 30
## Tags
#dbms #rdbms #sql #postgresql #serial
## Question
In PostgreSQL, which of the following is true about the `SERIAL` data type?
## Options
- [ ] Automatically generates unique random values for a column
- [ ] Automatically generates sequential numbers for a column
- [ ] Requires a trigger to function correctly
- [ ] Can store alphanumeric values
## Answer
2. Automatically generates sequential numbers for a column

# Question 31
## Tags
#dbms #nosql #mongodb #capped_collection
## Question
In MongoDB, which of the following best describes a capped collection?
## Options
- [ ] A collection with fixed size and high insertion performance
- [ ] A collection that stores only unique documents
- [ ] A collection optimized for distributed transactions
- [ ] A collection that automatically indexes all fields
## Answer
1. A collection with fixed size and high insertion performance

# Question 32
## Tags
#dbms #rdbms #sql #mysql #join
## Question
In MySQL, what does the `JOIN` clause do?
## Options
- [ ] Combines rows from two or more tables based on a related column
- [ ] Filters rows from a single table based on a condition
- [ ] Creates a new table by combining existing tables
- [ ] Merges duplicate rows within a single table
## Answer
1. Combines rows from two or more tables based on a related column

# Question 33
## Tags
#dbms #nosql #dynamodb #local_secondary_index
## Question
In DynamoDB, which of the following is a valid use case for Local Secondary Index (LSI)?
## Options
- [ ] Enabling queries on non-primary key attributes with a different partition key
- [ ] Sorting query results within the same partition key using a different sort key
- [ ] Storing data in multiple regions for disaster recovery
- [ ] Caching frequently accessed data for faster retrieval
## Answer
2. Sorting query results within the same partition key using a different sort key

# Question 34
## Tags
#dbms #rdbms #sql #postgresql #update
## Question
In PostgreSQL, which of the following is the correct way to update multiple columns in a single query?
## Options
- [ ] `UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition;`
- [ ] `UPDATE table_name SET column1 AND column2 = (value1, value2) WHERE condition;`
- [ ] `UPDATE table_name SET column1 = value1 WITH column2 = value2 WHERE condition;`
- [ ] `UPDATE table_name SET column1 = value1 AND column2 = value2 WHERE condition;`
## Answer
4. `UPDATE table_name SET column1 = value1 AND column2 = value2 WHERE condition;`

# Question 35
## Tags
#dbms #nosql #mongodb #atomic #write
## Question
In MongoDB, which of the following operations is atomic by default?
## Options
- [ ] An update that modifies multiple documents
- [ ] A write operation on a single document
- [ ] A transaction involving multiple collections
- [ ] A delete operation affecting multiple documents
## Answer
2. A write operation on a single document

# Question 36
## Tags
#dbms #rdbms #sql #mysql #concat
## Question
In MySQL, what will the following query return?
```sql
SELECT CONCAT('Hello', NULL, 'World');
```
## Options
- [ ] `NULL`
- [ ] `HelloWorld`
- [ ] `Hello World`
- [ ] `HelloNULLWorld`
## Answer
2. `HelloWorld`

# Question 37
## Tags
#dbms #rdbms #sql #postgresql #unique
## Question
In PostgreSQL, which of the following constraints enforces that values in a column or a group of columns are unique across the table?
## Options
- [ ] `PRIMARY KEY`
- [ ] `FOREIGN KEY`
- [ ] `UNIQUE`
- [ ] `CHECK`
## Answer
3. `UNIQUE`

# Question 38
## Tags
#dbms #nosql #dynamodb #read_capacity_unit
## Question
In DynamoDB, what is the role of the provisioned read capacity unit (RCU)?
## Options
- [ ] Allows writing 1 KB of data per second
- [ ] Allows reading 4 KB of data per second with eventual consistency
- [ ] Allows reading 4 KB of data per second with strong consistency
- [ ] Allows reading 1 KB of data per second regardless of consistency
## Answer
2. Allows reading 4 KB of data per second with eventual consistency

# Question 39
## Tags
#dbms #rdbms #sql #null #select #case 
## Question
In SQL, what will the following query return?
```sql
SELECT CASE WHEN NULL IS NULL THEN 'Yes' ELSE 'No' END;
```
## Options
- [ ] `Yes`
- [ ] `No`
- [ ] `NULL`
- [ ] `Error`
## Answer
1. `Yes`

# Question 40
## Tags
#dbms #mongodb #projection
## Question
In MongoDB, which of the following aggregation stages is used to reshape documents by including or excluding fields?
## Options
- [ ] `$match`
- [ ] `$unwind`
- [ ] `$group`
- [ ] `$project`
## Answer
4. `$project`

# Question 41
## Tags
#dbms #rdbms #sql #postgresql #role
## Question
In PostgreSQL, which command is used to create a new role?
## Options
- [ ] `CREATE USER`
- [ ] `CREATE ROLE`
- [ ] `GRANT ROLE`
- [ ] `ALTER ROLE`
## Answer
2. `CREATE ROLE`

# Question 42
## Tags
#dbms #rdbms #sql #mysql #foreign_key
## Question
In MySQL, what does the `FOREIGN KEY` constraint ensure?
## Options
- [ ] Unique values across all rows in a column
- [ ] The column cannot contain NULL values
- [ ] Referential integrity between two tables
- [ ] Automatic increment of values in a column
## Answer
3. Referential integrity between two tables

# Question 43
## Tags
#dbms #nosql #dynamodb #write_capacity_unit
## Question
In DynamoDB, which of the following operations consumes write capacity units (WCUs)?
## Options
- [ ] `BatchWriteItem`
- [ ] `Scan`
- [ ] `Query`
- [ ] `GetItem`
## Answer
1. `BatchWriteItem`

# Question 44
## Tags
#dbms #rdbms #sql #postgresql #describe
## Question
In PostgreSQL, which command is used to view the structure of a table, including its columns and their data types?
## Options
- [ ] `DESCRIBE table_name;`
- [ ] `EXPLAIN table_name;`
- [ ] `\d table_name`
- [ ] `SHOW COLUMNS FROM table_name;`
## Answer
3. `\d table_name`

# Question 45
## Tags
#dbms #nosql #mongodb #update
## Question
In MongoDB, which of the following operations is used to update multiple documents at once?
## Options
- [ ] `updateOne`
- [ ] `updateMany`
- [ ] `findAndModify`
- [ ] `bulkWrite`
## Answer
2. `updateMany`

# Question 46
## Tags
#dbms #rdbms #sql #postgresql #count #distinct
## Question
In SQL, which function is used to count the distinct values of a column?
## Options
- [ ] `COUNT(*)`
- [ ] `COUNT(column_name)`
- [ ] `DISTINCT COUNT(column_name)`
- [ ] `COUNT(DISTINCT column_name)`
## Answer
4. `COUNT(DISTINCT column_name)`

# Question 47
## Tags
#dbms #rdbms #sql #postgresql #pg_stat_activity
## Question
In PostgreSQL, what does the `pg_stat_activity` system view provide?
## Options
- [ ] Information on table size and disk usage
- [ ] Metrics for index performance
- [ ] Details about currently active queries and sessions
- [ ] Statistics on query execution times
## Answer
3. Details about currently active queries and sessions

# Question 48
## Tags
#dbms #nosql #dynamodb #partition_key
## Question
In DynamoDB, which of the following best describes partition keys?
## Options
- [ ] Used to uniquely identify items and distribute data across partitions
- [ ] Used to determine the sort order of items within a partition
- [ ] Automatically created for each table and cannot be customized
- [ ] Used exclusively for global secondary indexes
## Answer
1. Used to uniquely identify items and distribute data across partitions

# Question 49
## Tags
#dbms #rdbms #sql #mysql #isolation_level #dirty_read #non_repeatable_read #phantom_read
## Question
In MySQL, which of the following isolation levels is the default and prevents dirty reads and non-repeatable reads but allows phantom reads?
## Options
- [ ] Read Uncommitted
- [ ] Read Committed
- [ ] Repeatable Read
- [ ] Serializable
## Answer
3. Repeatable Read

# Question 50
## Tags
#dbms #rdbms #sql #postgresql #toast
## Question
In PostgreSQL, what is the purpose of the `TOAST` mechanism?
## Options
- [ ] Storing and querying JSON data efficiently
- [ ] Compressing and storing large values that exceed a page size
- [ ] Automatically creating indexes for foreign keys
- [ ] Optimizing transaction performance with temporary tables
## Answer
2. Compressing and storing large values that exceed a page size

# Question 51
## Tags
#dbms #nosql #mongodb #capped_collection
## Question
In MongoDB, which of the following commands is used to create a capped collection?
## Options
- [ ] `createCollection`
- [ ] `createCappedCollection`
- [ ] `db.createCapped`
- [ ] `db.createCappedCollection`
## Answer
1. `createCollection`

# Question 52
## Tags
#dbms #rdbms #sql #postgresql #pg_stat_user_tables
## Question
In PostgreSQL, what is the purpose of the `pg_stat_user_tables` view?
## Options
- [ ] To list all the tables owned by a specific user
- [ ] To monitor active sessions accessing user tables
- [ ] To display disk usage for all tables
- [ ] To provide statistics about query performance for user tables
## Answer
4. To provide statistics about query performance for user tables

# Question 53
## Tags
#dbms #nosql #dynamodb #throttling_error
## Question
In DynamoDB, which of the following operations would trigger a throttling error?
## Options
- [ ] A write request within provisioned WCUs
- [ ] A scan request within provisioned RCUs
- [ ] A read request exceeding the provisioned RCUs
- [ ] A query that returns no results
## Answer
3. A read request exceeding the provisioned RCUs

# Question 54
## Tags
#dbms #rdbms #sql #postgresql #inet
## Question
In PostgreSQL, which data type should be used to store IPv4 and IPv6 addresses?
## Options
- [ ] `TEXT`
- [ ] `INET`
- [ ] `VARCHAR`
- [ ] `JSON`
## Answer
2. `INET`

# Question 55
## Tags
#dbms #nosql #mongodb #in
## Question
In MongoDB, which operator is used to retrieve documents where a field value matches any value in an array?
## Options
- [ ] `$in`
- [ ] `$match`
- [ ] `$any`
- [ ] `$arrayMatch`
## Answer
1. `$in`

# Question 56
## Tags
#dbms #rdbms #sql #mysql #datediff
## Question
In MySQL, which function can you use to calculate the difference in days between two dates?
## Options
- [ ] `DATE_ADD`
- [ ] `DATE_SUB`
- [ ] `TIMESTAMPDIFF`
- [ ] `DATEDIFF`
## Answer
4. `DATEDIFF`

# Question 57
## Tags
#dbms #rdbms #sql #postgresql #uuid
## Question
In PostgreSQL, which function is used to generate a universally unique identifier (UUID)?
## Options
- [ ] `generate_id()`
- [ ] `uuid_generate_v4()`
- [ ] `random_uuid()`
- [ ] `gen_random_id()`
## Answer
2. `uuid_generate_v4()`

# Question 58
## Tags
#dbms #nosql #dynamodb #batch
## Question
In DynamoDB, which feature enables querying items across multiple tables or indexes in a single request?
## Options
- [ ] `Scan`
- [ ] `Query`
- [ ] `BatchGetItem`
- [ ] Global Secondary Index
## Answer
3. `BatchGetItem`

# Question 59
## Tags
#dbms #nosql #mongodb #unique
## Question
In MongoDB, which of the following is used to enforce unique constraints on a field?
## Options
- [ ] Sparse Index
- [ ] Compound Index
- [ ] Unique Index
- [ ] TTL Index
## Answer
3. Unique Index

# Question 60
## Tags
#dbms #rdbms #sql #postgresql #alter_table #query
## Question
In PostgreSQL, what does the `ALTER TABLE` command allow you to do?
## Options
- [ ] Rename a column, drop constraints, or add new columns
- [ ] Query data from a table with additional filtering options
- [ ] Automatically optimize a table for faster reads
- [ ] Back up a table to a new file
## Answer
1. Rename a column, drop constraints, or add new columns

# Question 61
## Tags
#dbms #rdbms #sql #mysql #lower
## Question
In MySQL, which function is used to convert a string to lowercase?
## Options
- [ ] `CONVERT_TO_LOWER()`
- [ ] `TO_LOWER()`
- [ ] `LCASE()`
- [ ] `LOWER()`
## Answer
4. `LOWER()`

# Question 62
## Tags
#dbms #nosql #dynamodb #global_secondary_index
## Question
In DynamoDB, which of the following best describes a Global Secondary Index (GSI)?
## Options
- [ ] An index with the same partition key as the base table but a different sort key
- [ ] An index that allows queries based on non-primary key attributes
- [ ] An index used to cache frequently accessed data for faster retrieval
- [ ] An index automatically created when a new table is added
## Answer
2. An index that allows queries based on non-primary key attributes

# Question 63
## Tags
#dbms #rdbms #sql #postgresql #coalesce
## Question
In PostgreSQL, what does the `COALESCE` function do?
## Options
- [ ] Replaces NULL values with a specified default value
- [ ] Returns the sum of all non-NULL values in a column
- [ ] Concatenates multiple strings into one
- [ ] Finds the first non-NULL value in a list of arguments
## Answer
1. Replaces NULL values with a specified default value

# Question 64
## Tags
#dbms #nosql #mongodb #update
## Question
In MongoDB, which operator is used to update a specific field of a document?
## Options
- [ ] `$set`
- [ ] `$push`
- [ ] `$unset`
- [ ] `$update`
## Answer
1. `$set`

# Question 65
## Tags
#dbms #rdbms #sql #mysql #year
## Question
In MySQL, which function is used to extract the year from a date?
## Options
- [ ] `GET_YEAR()`
- [ ] `DATE_YEAR()`
- [ ] `EXTRACT()`
- [ ] `YEAR()`
## Answer
4. `YEAR()`

# Question 66
## Tags
#dbms #rdbms #sql #postgresql #drop
## Question
In PostgreSQL, which command is used to remove a database?
## Options
- [ ] `DELETE DATABASE database_name;`
- [ ] `DROP DATABASE database_name;`
- [ ] `REMOVE DATABASE database_name;`
- [ ] `TRUNCATE DATABASE database_name;`
## Answer
2. `DROP DATABASE database_name;`

# Question 67
## Tags
#dbms #nosql #mongodb #geospatial
## Question
In MongoDB, which index type is best suited for querying geospatial data?
## Options
- [ ] Sparse Index
- [ ] GeoJSON Index
- [ ] 2dsphere Index
- [ ] Text Index
## Answer
3. 2dsphere Index

# Question 68
## Tags
#dbms #rdbms #sql #mysql #char_length
## Question
In MySQL, what is the purpose of the `CHAR_LENGTH` function?
## Options
- [ ] Count the number of characters in a string
- [ ] Count the number of bytes in a string
- [ ] Convert a string to uppercase
- [ ] Return a substring from a string
## Answer
1. Count the number of characters in a string

# Question 69
## Tags
#dbms #rdbms #sql #postgresql #cron
## Question
In PostgreSQL, which of the following is used to schedule periodic jobs?
## Options
- [ ] `pg_jobs`
- [ ] `pg_cron`
- [ ] `pg_tasker`
- [ ] `pg_scheduler`
## Answer
2. `pg_cron`

# Question 70
## Tags
#dbms #nosql #dynamodb #replication
## Question
In DynamoDB, which feature allows automatic replication of tables across multiple regions?
## Options
- [ ] Local Secondary Indexes
- [ ] Global Secondary Indexes
- [ ] DynamoDB Streams
- [ ] Global Tables
## Answer
4. Global Tables

# Question 71
## Tags
#dbms #rdbms #sql #mysql #query #coalesce
## Question
In MySQL, what will the following query return?
```sql
SELECT COALESCE(NULL, NULL, 'Hello', NULL, 'World');
```
## Options
- [ ] `Hello World`
- [ ] `NULL`
- [ ] `Hello`
- [ ] `World`
## Answer
3. `Hello`

# Question 72
## Tags
#dbms #rdbms #sql #postgresql #unlogged
## Question
In PostgreSQL, what does the `UNLOGGED` option do when creating a table?
## Options
- [ ] Creates a table with no constraints
- [ ] Creates a table that skips writing to the WAL (Write-Ahead Log)
- [ ] Creates a table that is automatically dropped after the session ends
- [ ] Creates a table that cannot be indexed
## Answer
2. Creates a table that skips writing to the WAL (Write-Ahead Log)

# Question 73
## Tags
#dbms #nosql #mongodb #aggregation #array
## Question
In MongoDB, which aggregation stage is used to flatten an array field in documents?
## Options
- [ ] `$unwind`
- [ ] `$project`
- [ ] `$group`
- [ ] `$split`
## Answer
1. `$unwind`

# Question 74
## Tags
#dbms #rdbms #sql #postgresql #user
## Question
In PostgreSQL, which of the following functions can be used to get the current database session user?
## Options
- [ ] `USER()`
- [ ] `DATABASE_USER`
- [ ] `CURRENT_USER`
- [ ] `SESSION_USER`
## Answer
3. `CURRENT_USER`

# Question 75
## Tags
#dbms #nosql #mongodb #aggregation #filter
## Question
In MongoDB, which of the following stages is used to filter documents in an aggregation pipeline?
## Options
- [ ] `$project`
- [ ] `$filter`
- [ ] `$where`
- [ ] `$match`
## Answer
4. `$match`

# Question 76
## Tags
#dbms #rdbms #sql #mysql #date_diff
## Question
In MySQL, which of the following functions returns the difference between two dates in months?
## Options
- [ ] `DATEDIFF`
- [ ] `PERIOD_DIFF`
- [ ] `TIMESTAMPDIFF`
- [ ] `MONTH_DIFF`
## Answer
2. `PERIOD_DIFF`












# Question 71
## Tags
## Question
## Options
## Answer