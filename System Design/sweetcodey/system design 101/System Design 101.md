# The Ultimate System Design Template

## Client & Server
## Database
## Vertical & Horizontal Scaling
- Facebook has over 30,000 servers to handle user load.
## Load Balancer
## Database Sharding
## Database Replication
## Cache
## CDN
## Monolithic vs Microservices
## Message Queue
## API Gateway


# Buzzwords - Design Goals
## Scalability
## Availability
## Consistency 
### Strong Consistency
### Eventual Consistency
## Fault Tolerance & Single Point of Failure

# Buzzwords - Database & Storage
## Relational (SQL) Database
## Non-Relational (NoSQL) Database
- Key-Value Stores
- Document Databases
- Graph Databases
- Wide-Column Databases
- Time-Series Databases
## SQL vs NoSQL
- fast data access -> NoSQL
- scale is too large -> NoSQL
- data follows fixed structure -> SQL
- complex queries to execute on data -> SQL
- if data changes frequently or will evolve over time -> NoSQL
## Object Storage
## Database Sharding & Replication
## Cache
## CDN

# Buzzwords - Networking
## IP Address
## DNS - Domain Name Server
## Client & Server
## Protocols - TCP, UDP, HTTP, Websocket
## Forward Proxy and Reverse Proxy

# Buzzwords - Communication
## API
### REST
- GET / POST / PATCH / PUT etc
### GraphQL
### gRPC
## Message Queue

# Buzzwords - Extras
## Cloud Computing
## Logging & Monitoring
## Caching Strategies
- Cache Aside Strategy: When data is requested, we first look in the cache. If it's not there, we get it from the database and save it in the cache for next time.
- Read Through Strategy: When the data is requested, we first look in the cache. If it’s not there, the cache itself gets the data from the database and saves in itself for next time.
## Hashing & Consistent Hashing
## CAP Theorem
- Example: Consider there is a social media company ‘SweetBook’. They have servers all around the world. At 3pm, an accident happens and the connection between their New York and San Francisco servers is lost. They have a partition now. At 3:30pm, your friend in New York posts something on social media. Now there could be two scenarios:
  - If SweetBook prioritizes availability, the site remains accessible, but you won't see the new post from your friend in New York—only posts from local San Francisco users.
  - If SweetBook prioritizes consistency, you might see a message like "Website not available" when you try to access it from San Francisco.
- You cannot have both at the same time.