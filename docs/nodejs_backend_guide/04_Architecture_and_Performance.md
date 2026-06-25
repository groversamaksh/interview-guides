# MongoDB Architecture & Performance

## Indexing

Indexes support the efficient execution of queries. Without indexes, MongoDB must perform a *collection scan* (COLLSCAN), scanning every document in a collection.

### Index Types

**1. Single Field Index**
*   **Syntax:** `db.users.createIndex({ email: 1 })`  (1 = ascending, -1 = descending)
*   **Use Cases:** Queries matching a single specific field.
*   **Pros:** Fast lookups and sorting on that field.
*   **Cons:** Write overhead on updates to that field.

**2. Compound Index**
*   **Syntax:** `db.users.createIndex({ lastName: 1, age: -1 })`
*   **Use Cases:** Queries filtering or sorting on multiple fields.
*   **Pros:** Highly optimized for complex queries; supports *Index Prefixes* (can be used for queries on just `lastName`).
*   **Cons:** Larger index size in memory.

**3. Multikey Index**
*   **Syntax:** Automatically created if indexing an array field: `db.users.createIndex({ tags: 1 })`
*   **Use Cases:** Queries querying array elements.
*   **Pros:** Fast search within arrays.
*   **Cons:** Very large index sizes (one index entry per array element per document).

**4. Text Index**
*   **Syntax:** `db.articles.createIndex({ content: "text", title: "text" })`
*   **Use Cases:** Full-text search using `$text` operator.
*   **Pros:** Supports stemming, stop words, and language-specific rules.
*   **Cons:** Expensive to maintain; only one text index allowed per collection.

**5. TTL Index (Time-To-Live)**
*   **Syntax:** `db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })`
*   **Use Cases:** Auto-deleting old data (sessions, logs, cache).
*   **Pros:** Automates data purging.
*   **Cons:** Requires a date field; deletion runs on a background thread (~60s interval).

**6. Unique Index**
*   **Syntax:** `db.users.createIndex({ username: 1 }, { unique: true })`
*   **Use Cases:** Ensuring no duplicate values exist for a field.
*   **Pros:** Enforces data integrity at the database level.
*   **Cons:** Insert fails if duplicate found.

**7. Sparse Index**
*   **Syntax:** `db.users.createIndex({ optionalEmail: 1 }, { sparse: true })`
*   **Use Cases:** Indexing a field that only exists in a subset of documents.
*   **Pros:** Saves disk/memory space by excluding documents without the field.
*   **Cons:** Queries relying on the index will miss documents where the field doesn't exist.

**8. Partial Index**
*   **Syntax:** `db.restaurants.createIndex({ rating: 1 }, { partialFilterExpression: { rating: { $gt: 4 } } })`
*   **Use Cases:** Indexing only documents that meet specific criteria (e.g., active users).
*   **Pros:** Smaller, highly targeted index. More flexible than Sparse indexes.
*   **Cons:** Must include the filter expression in the query to use the index.

---

## Query Optimization

### Using `.explain()`
The `explain("executionStats")` method shows how MongoDB executed a query.

```javascript
db.users.find({ age: 30 }).explain("executionStats");
```

**Key Metrics to watch:**
*   **COLLSCAN:** Collection Scan. MongoDB had to read every document. **Bad for performance.**
*   **IXSCAN:** Index Scan. MongoDB used an index to find the documents. **Good.**
*   **FETCH:** Document Fetch. MongoDB retrieved the actual document after finding the index entry.
*   **totalDocsExamined vs nReturned:** If you examine 10,000 docs to return 1, your index is inefficient.

### Covered Queries
A query is "covered" if all fields requested in the query and projection are contained *within the index*. 
*   In a covered query, the execution plan shows `IXSCAN` but **0 FETCH**. MongoDB returned the data directly from RAM without touching the disk.

---

## Transactions

Transactions allow multi-document updates across multiple collections/databases atomically (all-or-nothing). *Requires a Replica Set or Sharded Cluster.*

```javascript
// Complete Node.js Native Driver Example
const session = client.startSession();

try {
  session.startTransaction();
  
  // Withdraw from account A
  await db.collection("accounts").updateOne(
    { _id: "A" },
    { $inc: { balance: -100 } },
    { session }
  );

  // Deposit to account B
  await db.collection("accounts").updateOne(
    { _id: "B" },
    { $inc: { balance: 100 } },
    { session }
  );

  await session.commitTransaction();
  console.log("Transaction committed!");
} catch (error) {
  await session.abortTransaction();
  console.error("Transaction aborted:", error);
} finally {
  session.endSession();
}
```

---

## Schema Design Best Practices

*   **Schema Validation:** Enforce structure at the DB level.
    ```javascript
    db.createCollection("users", {
       validator: { $jsonSchema: { bsonType: "object", required: [ "name", "email" ] } }
    })
    ```
*   **Data Modeling:** Model data based on *how it is accessed*, not how it is logically related (unlike SQL).
*   **Denormalize for reads:** Embed data if it is usually queried together (e.g., Post and its Comments).
*   **Normalize for writes:** Reference data if it changes frequently or is shared across many parents.
*   **Polymorphic Pattern:** Store documents of varying shapes in the same collection if they are queried together.
*   **Attribute Pattern:** Move keys into values to avoid hitting index limits.

---

## Replication

Replication ensures high availability and data redundancy by maintaining multiple copies of data.

*   **Replica Set:** A group of `mongod` processes that maintain the same data set.
*   **Primary:** The only node that accepts write operations. Records changes in its `oplog`.
*   **Secondary:** Replicates the `oplog` from the Primary. Can be configured to serve read operations (Read Preference).
*   **Arbiter:** Does not hold data, only votes in elections to break ties.

*Architecture Flow:* Client -> Writes to Primary -> Oplog replicates asynchronously to Secondaries.

---

## Sharding

Sharding is the process of distributing data across multiple machines to support massive datasets and high-throughput operations (Horizontal Scaling).

*   **Shard:** Contains a subset of the sharded data (usually deployed as a Replica Set).
*   **Config Servers:** Store metadata and configuration settings for the cluster.
*   **Query Routers (mongos):** Act as the interface between the application and the sharded cluster. Routes queries to the correct shard.
*   **Shard Key:** A field (or compound fields) used to partition the data. 
    *   *Good Shard Key:* High cardinality, evenly distributed (e.g., hashed `userId`).
    *   *Bad Shard Key:* Monotonically increasing values like timestamps (causes "hot shards").

---

## Security

*   **Authentication:** Verifies identity (SCRAM, x.509, LDAP, Kerberos).
*   **Authorization:** Role-Based Access Control (RBAC). Assign users roles like `readWrite`, `dbAdmin`, `clusterAdmin`.
*   **Encryption at Rest:** Encrypts data files on disk (WiredTiger encryption).
*   **Encryption in Transit:** TLS/SSL for network traffic.
*   **Field Level Encryption (CSFLE):** Client-Side encryption where data is encrypted before it leaves the application.
*   **Backup Strategies:** 
    *   `mongodump` / `mongorestore` (Logical backups).
    *   File system snapshots (Physical backups).
    *   MongoDB Cloud Backup (Continuous).
