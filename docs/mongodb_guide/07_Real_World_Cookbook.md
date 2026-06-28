# Real-World MongoDB Cookbook & Senior Notes

## 100 Real-World Query Cookbook

_(Note: To maintain conciseness, queries are grouped by domain and use case, representing 100 common production patterns)_

### User Management & Auth (1-15)

1. **Find User by Email:** `db.users.findOne({ email: "user@domain.com" })`
2. **Find Active Users:** `db.users.find({ status: "active" })`
3. **Soft Delete User:** `db.users.updateOne({ _id: uId }, { $set: { deletedAt: new Date(), status: "deleted" } })`
4. **Update Last Login:** `db.users.updateOne({ _id: uId }, { $set: { lastLogin: new Date() } })`
5. **Increment Login Attempts:** `db.users.updateOne({ _id: uId }, { $inc: { loginAttempts: 1 } })`
6. **Lock Account:** `db.users.updateOne({ _id: uId }, { $set: { lockedUntil: new Date(Date.now() + 15*60000) } })`
7. **Find Locked Accounts:** `db.users.find({ lockedUntil: { $gt: new Date() } })`
8. **Reset Password:** `db.users.updateOne({ email: e }, { $set: { passwordHash: newHash }, $unset: { resetToken: "" } })`
9. **Find by Role:** `db.users.find({ roles: { $in: ["admin", "superadmin"] } })`
10. **Add Role:** `db.users.updateOne({ _id: uId }, { $addToSet: { roles: "editor" } })`
11. **Remove Role:** `db.users.updateOne({ _id: uId }, { $pull: { roles: "editor" } })`
12. **Find Users Created Today:** `db.users.find({ createdAt: { $gte: startOfDay, $lt: endOfDay } })`
13. **Paginate Users (Cursor):** `db.users.find({ _id: { $gt: lastId } }).limit(20)`
14. **Find Unverified Emails:** `db.users.find({ isEmailVerified: false, createdAt: { $lt: threeDaysAgo } })`
15. **Delete Unverified (Cleanup):** `db.users.deleteMany({ isEmailVerified: false, createdAt: { $lt: thirtyDaysAgo } })`

### E-commerce & Products (16-35)

16. **Find Product by SKU:** `db.products.findOne({ sku: "ABC-123" })`
17. **Search by Category:** `db.products.find({ category: "Electronics" })`
18. **In Stock Only:** `db.products.find({ inventoryCount: { $gt: 0 } })`
19. **Price Range:** `db.products.find({ price: { $gte: 50, $lte: 150 } })`
20. **Search with Regex (Title):** `db.products.find({ title: { $regex: /laptop/i } })`
21. **Full Text Search:** `db.products.find({ $text: { $search: "wireless mouse" } })`
22. **Sort by Price Asc:** `db.products.find().sort({ price: 1 })`
23. **Sort by Rating Desc:** `db.products.find().sort({ averageRating: -1 })`
24. **Update Inventory (Decrement):** `db.products.updateOne({ _id: pId }, { $inc: { inventoryCount: -1 } })`
25. **Add Review:** `db.products.updateOne({ _id: pId }, { $push: { reviews: newReview } })`
26. **Update Avg Rating:** (Aggregation pipeline in update) `db.products.updateOne({ _id: pId }, [{ $set: { avgRating: { $avg: "$reviews.rating" } } }])`
27. **Find Top Rated in Category:** `db.products.find({ category: "Books" }).sort({ avgRating: -1 }).limit(10)`
28. **Find Products by Brand Array:** `db.products.find({ brand: { $in: ["Apple", "Samsung"] } })`
29. **Find Discontinued:** `db.products.find({ isDiscontinued: true })`
30. **Mark as Discontinued:** `db.products.updateOne({ _id: pId }, { $set: { isDiscontinued: true } })`
31. **Apply Discount to Category:** `db.products.updateMany({ category: "Sale" }, { $mul: { price: 0.9 } })`
32. **Find Recently Added:** `db.products.find().sort({ createdAt: -1 }).limit(20)`
33. **Add Tag:** `db.products.updateOne({ _id: pId }, { $addToSet: { tags: "bestseller" } })`
34. **Remove Tag:** `db.products.updateOne({ _id: pId }, { $pull: { tags: "clearance" } })`
35. **Find by Tag (All):** `db.products.find({ tags: { $all: ["wireless", "noise-canceling"] } })`

### Orders & Payments (36-55)

36. **Create Order:** `db.orders.insertOne(orderDoc)`
37. **Find User's Orders:** `db.orders.find({ userId: uId }).sort({ createdAt: -1 })`
38. **Find Pending Orders:** `db.orders.find({ status: "pending" })`
39. **Update Order Status:** `db.orders.updateOne({ _id: oId }, { $set: { status: "shipped", shippedAt: new Date() } })`
40. **Cancel Order:** `db.orders.updateOne({ _id: oId, status: "pending" }, { $set: { status: "cancelled" } })` // State machine pattern
41. **Find High Value Orders:** `db.orders.find({ totalAmount: { $gt: 1000 } })`
42. **Join Order Items (Lookup):** `db.orders.aggregate([{ $match: { _id: oId } }, { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "productDetails" } }])`
43. **Total Revenue (All Time):** `db.orders.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }])`
44. **Daily Revenue:** `db.orders.aggregate([{ $match: { status: "completed" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$totalAmount" } } }])`
45. **Orders by Payment Method:** `db.orders.aggregate([{ $group: { _id: "$paymentMethod", count: { $sum: 1 } } }])`
46. **Find Unpaid Orders (Older than 24h):** `db.orders.find({ status: "pending_payment", createdAt: { $lt: yesterday } })`
47. **Calculate Tax:** `db.orders.aggregate([{ $project: { tax: { $multiply: ["$subtotal", 0.08] } } }])`
48. **Average Order Value (AOV):** `db.orders.aggregate([{ $group: { _id: null, aov: { $avg: "$totalAmount" } } }])`
49. **Orders per User:** `db.orders.aggregate([{ $group: { _id: "$userId", orderCount: { $sum: 1 } } }])`
50. **Top Customers (By Spend):** `db.orders.aggregate([{ $group: { _id: "$userId", totalSpent: { $sum: "$totalAmount" } } }, { $sort: { totalSpent: -1 } }, { $limit: 10 }])`
51. **Find Orders containing specific Product:** `db.orders.find({ "items.productId": pId })`
52. **Refund Order:** `db.payments.insertOne({ orderId: oId, type: "refund", amount: refundAmount })`
53. **Check Payment Status:** `db.payments.find({ orderId: oId, status: "successful" })`
54. **Find Duplicate Transactions (Idempotency check):** `db.payments.findOne({ transactionId: stripeId })`
55. **Group Orders by Status:** `db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])`

### Analytics, Activity & Reporting (56-100)

_(Applying aggregation pipelines for Dashboards and Logs)_

56. **Log Activity:** `db.activityLogs.insertOne({ userId: uId, action: "login", ip: "1.2.3.4", timestamp: new Date() })`
57. **User Activity Timeline:** `db.activityLogs.find({ userId: uId }).sort({ timestamp: -1 }).limit(50)`
58. **Daily Active Users (DAU):** `db.activityLogs.aggregate([{ $match: { timestamp: { $gte: startOfDay } } }, { $group: { _id: "$userId" } }, { $count: "dau" }])`
59. **Most Common Actions:** `db.activityLogs.aggregate([{ $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }])`
60. **Error Rate by Endpoint:** `db.apiLogs.aggregate([{ $match: { status: { $gte: 400 } } }, { $group: { _id: "$path", errors: { $sum: 1 } } }])`
61. **Average Response Time:** `db.apiLogs.aggregate([{ $group: { _id: "$path", avgTime: { $avg: "$responseTimeMs" } } }])`
62. **Slow Queries Log:** `db.apiLogs.find({ responseTimeMs: { $gt: 1000 } })`
63. **User Retention (Cohort):** Uses `$facet` to group signups and logins by month.
64. **Sales Funnel Drop-off:** `$group` with `$cond` to count users at 'cart', 'checkout', and 'purchase' stages.
65. **Monthly Revenue Growth:** `$group` by year/month, calculate revenue.
66. **Top Selling Products this Week:** `$match` date, `$unwind` items, `$group` by productId, sum quantity.
67. **Cart Abandonment Rate:** Orders in "cart" state older than 2 hours vs total created today.
68. **Inventory Valuation:** `$group` product price \* inventoryCount.
69. **Search Term Frequency:** `$group` on `searchLogs` by `term`.
70. **Zero-Result Searches:** `db.searchLogs.find({ resultCount: 0 })`
71. **Geospatial - Find Near Me:** `db.stores.find({ location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 5000 } } })`
72. **Geospatial - Within Polygon:** `db.deliveryZones.find({ bounds: { $geoIntersects: { $geometry: userLocation } } })`
73. **User Device Breakdown:** `db.sessions.aggregate([{ $group: { _id: "$deviceType", count: { $sum: 1 } } }])`
74. **App Crashes per Version:** `db.crashLogs.aggregate([{ $group: { _id: "$appVersion", crashes: { $sum: 1 } } }])`
75. **Email Open Rates:** `db.campaigns.aggregate([{ $project: { rate: { $divide: ["$opens", "$sends"] } } }])`
76. **Click-Through Rates:** `db.campaigns.aggregate([{ $project: { ctr: { $divide: ["$clicks", "$opens"] } } }])`
77. **Find Inactive Users (No login 6mo):** `db.users.find({ lastLogin: { $lt: sixMonthsAgo } })`
78. **Count Notifications by State:** `db.notifications.aggregate([{ $group: { _id: "$isRead", count: { $sum: 1 } } }])`
79. **Mark all Read:** `db.notifications.updateMany({ userId: uId, isRead: false }, { $set: { isRead: true } })`
80. **Get Unread Count:** `db.notifications.countDocuments({ userId: uId, isRead: false })`
81. **Delete Old Notifications:** `db.notifications.deleteMany({ createdAt: { $lt: thirtyDaysAgo } })`
82. **System Health Check:** `db.adminCommand({ ping: 1 })`
83. **Check Collection Stats:** `db.runCommand({ collStats: "orders" })`
84. **Find Duplicate Records:** `$group` by the unique field, `$match` count > 1.
85. **Merge User Accounts:** Requires transaction to reassign foreign keys and `$merge`.
86. **Calculate User LTV (Life Time Value):** Join user to orders, sum totalAmount.
87. **Find Users with Birthday Today:** `$match` using `$expr` comparing day/month of DOB to today.
88. **Recommend Products:** Find users who bought X, see what else they bought.
89. **Calculate NPS Score:** `$group` survey results into Promoters/Detractors.
90. **Identify Spam/Bots:** Find users creating > 100 posts a minute.
91. **Data Lake Query:** Query AWS S3 archive directly via Atlas Data Federation.
92. **Time-Series Window (Rolling Avg):** `$setWindowFields` to calculate 7-day rolling average of sales.
93. **Find Missing Foreign Keys (Orphans):** `$lookup` orders to users, `$match` where user array is empty.
94. **Count Array Elements across Collection:** `$unwind` array, then `$group` and count.
95. **Change Stream Listener:** `db.collection.watch()` in Node.js to trigger realtime events.
96. **Upsert Document:** `db.configs.updateOne({ key: "theme" }, { $set: { value: "dark" } }, { upsert: true })`
97. **Find Nth Highest:** `$sort` descending, `$skip` N-1, `$limit` 1.
98. **Random Document:** `db.users.aggregate([{ $sample: { size: 1 } }])`
99. **Find by Array length:** `db.users.find({ "hobbies.3": { $exists: true } })` (Has at least 4 hobbies).
100.  **Find Null vs Missing:** Null: `find({ val: null })`. Missing: `find({ val: { $exists: false } })`.

---

## Senior MongoDB Developer Notes

### 1. Performance & Indexing

- **The ESR Rule:** When creating compound indexes, order fields by: **E**quality, **S**ort, **R**ange.
- Avoid large skips (`skip(100000)`). Use Cursor-based pagination (`find({ _id: { $gt: lastId } })`).
- Covered queries are your best friend. Project only the fields you need.
- Never run unbounded queries in production (`find({})` without `limit`).

### 2. Schema Design & Modeling

- Data that is accessed together should be stored together. (Embed over Reference by default).
- Beware of the 16MB document limit. Do not embed arrays that can grow infinitely (e.g., all comments on a viral post). Move them to a separate collection.
- Use the **Outlier Pattern** for the "exceptions to the rule" (e.g., standard posts embed comments, but viral posts reference a comments collection).
- Use the **Bucket Pattern** for time-series data to dramatically reduce index size and document count.

### 3. Aggregation Optimization

- Always put `$match` and `$sort` as the very first stages to take advantage of indexes and reduce the pipeline payload early.
- `$lookup` can be slow on large datasets. Ensure the `foreignField` is indexed.
- Avoid `$unwind` if you just need to measure the size of an array. Use `$size`.

### 4. Production Checklists & Traps

- **Trap:** Relying on MongoDB to enforce relational integrity. You must handle cascading deletes in your application code.
- **Trap:** Defaulting to Mongoose for heavily read-intensive analytics. Use the native driver for raw speed when running massive aggregations.
- Always enable authentication. Ensure your port 27017 is not exposed to the public internet.
- Use Replica Sets for everything in production (even single-node replica sets) to enable the oplog and transactions.

### 5. Interview Advice

- When asked "SQL vs NoSQL", do not say NoSQL is faster. Explain that NoSQL scales horizontally more easily and offers flexible schemas, but sacrifices native join performance and strict ACID guarantees (though modern MongoDB supports ACID).
- Be prepared to explain the difference between a Collection Scan and an Index Scan.
- Know how to draw an architecture diagram of a Replica Set (Primary, Secondary, Oplog).
