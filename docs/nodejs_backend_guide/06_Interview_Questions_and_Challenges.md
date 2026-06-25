# MongoDB Interview Questions & Challenges

## 75 MongoDB Interview Questions

### Beginner (1-25)
1. **What is MongoDB?** A NoSQL, document-oriented database that stores data in JSON-like BSON format.
2. **What is a Document?** The basic unit of data in MongoDB, consisting of key-value pairs.
3. **What is a Collection?** A grouping of MongoDB documents, equivalent to an RDBMS table.
4. **What is BSON?** Binary JSON. It extends JSON with additional data types like Date and ObjectId.
5. **Does MongoDB support SQL?** No, it uses the MongoDB Query Language (MQL).
6. **What is an ObjectId?** A 12-byte unique identifier generated automatically for the `_id` field.
7. **How do you insert a document?** Using `db.collection.insertOne()` or `insertMany()`.
8. **How do you query all documents?** Using `db.collection.find()`.
9. **How do you filter documents?** By passing a query document, e.g., `find({ age: 25 })`.
10. **What is projection?** Selecting only specific fields to return in a query.
11. **How do you update a document?** Using `updateOne()` with operators like `$set`.
12. **How do you delete a document?** Using `deleteOne()` or `deleteMany()`.
13. **What is the `_id` field?** The primary key of a document, always required and unique.
14. **Can you enforce a schema in MongoDB?** Yes, using Schema Validation.
15. **What is embedding?** Storing related data within a single document.
16. **What is referencing?** Storing relationships using ObjectIds to link separate documents.
17. **What is the maximum document size?** 16 MB.
18. **How do you drop a collection?** `db.collection.drop()`.
19. **How do you drop a database?** `db.dropDatabase()`.
20. **What does `$gt` mean?** Greater than.
21. **What does `$in` mean?** Matches any value in a specified array.
22. **How do you limit results?** Using `.limit(n)`.
23. **How do you skip results?** Using `.skip(n)`.
24. **How do you sort results?** Using `.sort({ field: 1 })` for ascending.
25. **What is mongosh?** The MongoDB Shell used for interacting with the database.

### Intermediate (26-50)
26. **What is the Aggregation Framework?** A pipeline-based data processing tool for complex queries, grouping, and transformations.
27. **What does `$match` do?** Filters documents in an aggregation pipeline.
28. **What does `$group` do?** Groups documents by a specified key and applies accumulators.
29. **What does `$project` do in aggregation?** Reshapes documents (adds, removes, or renames fields).
30. **What does `$unwind` do?** Deconstructs an array field into multiple documents.
31. **What is an Index?** A special data structure that improves the speed of read operations.
32. **What is a Compound Index?** An index on multiple fields.
33. **What is a Multikey Index?** An index on an array field.
34. **What is a TTL Index?** Time-To-Live index, automatically deletes documents after a certain time.
35. **What is a Unique Index?** Ensures no duplicate values exist for the indexed field.
36. **What is a Sparse Index?** Only indexes documents that contain the specified field.
37. **What is a Partial Index?** Indexes only documents matching a specific filter expression.
38. **How do you see query performance?** Using `.explain("executionStats")`.
39. **What is a Covered Query?** A query where all requested fields are in the index itself (no document fetch needed).
40. **What is `COLLSCAN`?** Collection Scan, meaning the DB had to read every document (usually bad).
41. **What is `IXSCAN`?** Index Scan, meaning the DB efficiently used an index.
42. **What is a Replica Set?** A group of MongoDB servers that maintain the same data set for high availability.
43. **What is the Primary node?** The node that receives all write operations in a replica set.
44. **What is a Secondary node?** A node that replicates the Primary's oplog and provides read availability.
45. **What is the oplog?** A capped collection that keeps a rolling record of all operations that modify the data.
46. **What happens if the Primary fails?** The replica set holds an election to choose a new Primary.
47. **What is `$lookup`?** The aggregation stage used to perform left outer joins.
48. **How does `$addToSet` differ from `$push`?** `$addToSet` only adds unique values; `$push` allows duplicates.
49. **What is a capped collection?** A fixed-size collection that automatically overwrites its oldest entries when full.
50. **How do you back up MongoDB?** Using `mongodump` or Atlas cloud backups.

### Advanced (51-75)
51. **What is Sharding?** Distributing data across multiple machines to support horizontal scaling.
52. **What is a Shard Key?** The field used to distribute documents across shards.
53. **What makes a good Shard Key?** High cardinality, even distribution, and low frequency of monotonic increments.
54. **What is a Config Server?** Stores the metadata and routing information for a sharded cluster.
55. **What is `mongos`?** The query router that directs client requests to the appropriate shard.
56. **Does MongoDB support ACID transactions?** Yes, multi-document ACID transactions are supported (v4.0+).
57. **How do you start a transaction?** `session.startTransaction()`.
58. **What is the two-phase commit?** The internal protocol used by MongoDB to ensure distributed transactions are atomic.
59. **What is `$facet`?** An aggregation stage that allows multiple parallel pipelines within a single stage.
60. **What are Window Functions?** Aggregations over a sliding window of documents (e.g., running totals) using `$setWindowFields`.
61. **How do you optimize a slow `$lookup`?** Ensure the `foreignField` is indexed.
62. **What is the Attribute Pattern?** Moving dynamic keys into an array of key-value objects to allow indexing.
63. **What is the Bucket Pattern?** Grouping time-series or IoT data into "buckets" (documents) per hour/day to reduce document count.
64. **What is the Outlier Pattern?** Handling documents that exceed the 16MB limit by moving the overflow into a separate collection.
65. **What is Read Preference?** Specifies where a client should route read operations (e.g., `primary`, `secondaryPreferred`).
66. **What is Write Concern?** The level of acknowledgment requested from MongoDB for write operations (e.g., `w: "majority"`).
67. **What is Read Concern?** Controls the consistency and isolation properties of the data read (e.g., `local`, `majority`).
68. **How does MongoDB handle concurrency?** Using WiredTiger's document-level locking.
69. **What is GridFS?** A specification for storing and retrieving files that exceed the 16MB BSON limit.
70. **What is `$graphLookup`?** Performs a recursive search on a collection (e.g., for tree/graph structures).
71. **How do you handle schema migrations?** Using scripts (or tools like `migrate-mongo`) to update documents, or handling it dynamically in the application code.
72. **What is CSFLE?** Client-Side Field Level Encryption. Data is encrypted by the driver before sending it to the database.
73. **How does WiredTiger manage memory?** It uses an internal cache (default 50% of RAM - 1GB) and filesystem cache.
74. **What is a "Jumbo Chunk"?** A chunk in a sharded cluster that grows beyond the configured maximum size and cannot be split (usually due to a poor shard key).
75. **How do you resolve a "hot shard"?** By choosing a hashed shard key or a compound shard key to distribute writes evenly.

---

## 50 Practical MongoDB Coding Challenges

### CRUD Challenges (1-10)
1. **Find active users:** `db.users.find({ status: "active" })`
2. **Find users aged 20-30:** `db.users.find({ age: { $gte: 20, $lte: 30 } })`
3. **Update user email:** `db.users.updateOne({ _id: 1 }, { $set: { email: "new@x.com" } })`
4. **Increment score by 5:** `db.players.updateOne({ name: "Bob" }, { $inc: { score: 5 } })`
5. **Delete inactive users:** `db.users.deleteMany({ status: "inactive" })`
6. **Find missing fields:** `db.users.find({ phone: { $exists: false } })`
7. **Find by array item:** `db.posts.find({ tags: "mongodb" })`
8. **Rename field:** `db.users.updateMany({}, { $rename: { "first_name": "firstName" } })`
9. **Push to array:** `db.users.updateOne({ _id: 1 }, { $push: { hobbies: "reading" } })`
10. **Pop from array (last):** `db.users.updateOne({ _id: 1 }, { $pop: { hobbies: 1 } })`

### Aggregation Challenges (11-30)
11. **Count documents:** `db.sales.aggregate([{ $count: "total" }])`
12. **Sum total sales:** `db.sales.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])`
13. **Average rating per product:** `db.reviews.aggregate([{ $group: { _id: "$productId", avg: { $avg: "$rating" } } }])`
14. **Find max price:** `db.products.aggregate([{ $group: { _id: null, max: { $max: "$price" } } }])`
15. **Group by city:** `db.users.aggregate([{ $group: { _id: "$address.city", count: { $sum: 1 } } }])`
16. **Sort by total descending:** `db.sales.aggregate([{ $group: { _id: "$user", total: {$sum: "$amount"} } }, { $sort: { total: -1 } }])`
17. **Top 3 earners:** `db.employees.aggregate([{ $sort: { salary: -1 } }, { $limit: 3 }])`
18. **Unwind tags:** `db.articles.aggregate([{ $unwind: "$tags" }])`
19. **Count tags:** `db.articles.aggregate([{ $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }])`
20. **Add new field:** `db.users.aggregate([{ $addFields: { isAdult: { $gte: ["$age", 18] } } }])`
21. **Concat name:** `db.users.aggregate([{ $project: { name: { $concat: ["$first", " ", "$last"] } } }])`
22. **Extract month:** `db.sales.aggregate([{ $project: { month: { $month: "$date" } } }])`
23. **Conditional logic:** `db.users.aggregate([{ $project: { status: { $cond: [{ $gte: ["$age", 18] }, "Adult", "Minor"] } } }])`
24. **Filter array:** `db.users.aggregate([{ $project: { highScores: { $filter: { input: "$scores", as: "s", cond: { $gt: ["$$s", 90] } } } } }])`
25. **Calculate array size:** `db.users.aggregate([{ $project: { numFriends: { $size: "$friends" } } }])`
26. **First doc per group:** `db.orders.aggregate([{ $sort: { date: -1 } }, { $group: { _id: "$userId", latest: { $first: "$$ROOT" } } }])`
27. **Unique emails:** `db.users.aggregate([{ $group: { _id: null, emails: { $addToSet: "$email" } } }])`
28. **Replace root:** `db.users.aggregate([{ $replaceRoot: { newRoot: "$address" } }])`
29. **Remove field:** `db.users.aggregate([{ $unset: "password" }])`
30. **Bucket by age:** `db.users.aggregate([{ $bucket: { groupBy: "$age", boundaries: [0, 20, 40, 60], default: "60+" } }])`

### Lookup & Relationship Challenges (31-40)
31. **Basic Lookup:** Join Users and Profiles. `db.users.aggregate([{ $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "profile" } }])`
32. **Lookup + Unwind:** Flatten the joined profile. `... { $unwind: "$profile" }`
33. **Find users without profiles:** `db.users.aggregate([{ $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "p" } }, { $match: { p: { $size: 0 } } }])`
34. **Lookup orders > $100:** `... { $match: { "orders.total": { $gt: 100 } } }`
35. **Graph lookup (Managers):** `db.employees.aggregate([{ $graphLookup: { from: "employees", startWith: "$_id", connectFromField: "_id", connectToField: "managerId", as: "reports" } }])`
36. **Lookup with pipeline (Latest order):** `db.users.aggregate([{ $lookup: { from: "orders", let: { u: "$_id" }, pipeline: [ { $match: { $expr: { $eq: ["$userId", "$$u"] } } }, { $sort: { date: -1 } }, { $limit: 1 } ], as: "latestOrder" } }])`
37. **Lookup to Array (Many to Many):** Join students to courses array. `db.students.aggregate([{ $lookup: { from: "courses", localField: "courseIds", foreignField: "_id", as: "courses" } }])`
38. **Count joined items:** Get user with order count. `... { $addFields: { orderCount: { $size: "$orders" } } }`
39. **Double Lookup:** Order -> User -> Profile.
40. **Facet Search:** Get counts by category AND price buckets in one query using `$facet`.

### Indexing & Performance Challenges (41-50)
41. **Create single index:** `db.users.createIndex({ email: 1 })`
42. **Create compound index:** `db.users.createIndex({ status: 1, age: -1 })`
43. **Create TTL index (expire in 1h):** `db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })`
44. **Create unique index:** `db.users.createIndex({ username: 1 }, { unique: true })`
45. **Create text index:** `db.articles.createIndex({ title: "text", body: "text" })`
46. **Search text index:** `db.articles.find({ $text: { $search: "mongodb" } })`
47. **Check query plan:** `db.users.find({ age: 30 }).explain("executionStats")`
48. **Force an index:** `db.users.find({ age: 30 }).hint({ age: 1 })`
49. **Create sparse index:** `db.users.createIndex({ nickname: 1 }, { sparse: true })`
50. **Create partial index:** `db.users.createIndex({ age: 1 }, { partialFilterExpression: { status: "active" } })`
