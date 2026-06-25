# MongoDB Aggregation Framework

## Aggregation Overview

The Aggregation Framework is a data processing pipeline in MongoDB used to perform complex operations on multiple documents and return computed results.

**Why it exists:** While `find()` is great for simple queries, it cannot transform data, compute sums, group data by fields, or perform relational joins natively. Aggregation solves this by acting like an advanced, multi-stage SQL `GROUP BY` and `JOIN` engine.

**Pipeline Architecture:**
Data flows through a sequence of stages. Each stage transforms the documents as they pass through.
`[Collection] -> Stage 1 ($match) -> Stage 2 ($group) -> Stage 3 ($sort) -> [Result]`

---

## Aggregation Stages

### 1. `$match`
**Explanation:** Filters documents (like `WHERE` in SQL). Always place early to reduce documents passed to the next stage.
**Syntax:** `{ $match: { <query> } }`
**Example:** `{ $match: { status: "A" } }`

### 2. `$project`
**Explanation:** Reshapes documents by adding, removing, or renaming fields.
**Syntax:** `{ $project: { <field1>: <1 or 0>, <newField>: <expression> } }`
**Example:** `{ $project: { title: 1, author: 1, _id: 0 } }`

### 3. `$group`
**Explanation:** Groups input documents by a specified `_id` expression and applies accumulator expressions.
**Syntax:** `{ $group: { _id: <expression>, <field>: { <accumulator>: <expression> } } }`
**Example:** `{ $group: { _id: "$department", total: { $sum: 1 } } }`

### 4. `$sort`
**Explanation:** Sorts all input documents and returns them to the pipeline in sorted order.
**Syntax:** `{ $sort: { <field>: 1 | -1 } }`
**Example:** `{ $sort: { age: -1 } }`

### 5. `$limit`
**Explanation:** Limits the number of documents passed to the next stage.
**Syntax:** `{ $limit: <positive integer> }`
**Example:** `{ $limit: 10 }`

### 6. `$skip`
**Explanation:** Skips over a specified number of documents.
**Syntax:** `{ $skip: <positive integer> }`
**Example:** `{ $skip: 5 }`

### 7. `$count`
**Explanation:** Returns the count of documents that enter this stage.
**Syntax:** `{ $count: <string> }`
**Example:** `{ $count: "totalDocuments" }`

### 8. `$unwind`
**Explanation:** Deconstructs an array field from the input documents to output a document for each element.
**Syntax:** `{ $unwind: <field path> }`
**Example:** `{ $unwind: "$tags" }`

### 9. `$lookup`
**Explanation:** Performs a left outer join to an unsharded collection in the same database.
**Syntax:** `{ $lookup: { from: <col>, localField: <f>, foreignField: <f>, as: <array> } }`
**Example:** `{ $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "userOrders" } }`

### 10. `$facet`
**Explanation:** Processes multiple aggregation pipelines within a single stage on the same set of input documents.
**Syntax:** `{ $facet: { <outputField1>: [ <pipeline1> ], ... } }`
**Example:** `{ $facet: { byAge: [{$group: {_id: "$age"}}], byStatus: [{$group: {_id: "$status"}}] } }`

### 11. `$bucket`
**Explanation:** Categorizes incoming documents into groups, called buckets, based on a specified expression.
**Syntax:** `{ $bucket: { groupBy: <expr>, boundaries: [ <val1>, <val2>, ... ], default: <val> } }`
**Example:** `{ $bucket: { groupBy: "$age", boundaries: [ 0, 18, 30, 50 ], default: "Other" } }`

### 12. `$bucketAuto`
**Explanation:** Automatically categorizes documents into a specific number of buckets.
**Syntax:** `{ $bucketAuto: { groupBy: <expr>, buckets: <number> } }`
**Example:** `{ $bucketAuto: { groupBy: "$price", buckets: 4 } }`

### 13. `$replaceRoot`
**Explanation:** Replaces the input document with the specified document.
**Syntax:** `{ $replaceRoot: { newRoot: <replacementDocument> } }`
**Example:** `{ $replaceRoot: { newRoot: "$address" } }`

### 14. `$addFields` (or `$set`)
**Explanation:** Adds new fields to documents.
**Syntax:** `{ $addFields: { <newField>: <expression> } }`
**Example:** `{ $addFields: { totalCost: { $sum: ["$price", "$tax"] } } }`

### 15. `$unset`
**Explanation:** Removes fields from documents.
**Syntax:** `{ $unset: <field> | [ <field1>, ... ] }`
**Example:** `{ $unset: "password" }`

---

## Aggregation Operators

### Accumulators
*   `$sum`: Calculates and returns the sum of numeric values.
*   `$avg`: Calculates and returns the average of numeric values.
*   `$max`: Returns the highest value.
*   `$min`: Returns the lowest value.
*   `$push`: Returns an array of all values.
*   `$addToSet`: Returns an array of unique values.
*   `$first`: Returns the first value in a group.
*   `$last`: Returns the last value in a group.
*   `$count`: Returns the number of documents in a group.

### Expressions
*   `$cond`: Evaluates a boolean expression to return one of two specified return expressions.
*   `$switch`: Evaluates a series of case expressions.
*   `$ifNull`: Evaluates an expression and returns a default if it's null or missing.
*   `$concat`: Concatenates strings.
*   `$dateToString`: Converts a date object to a formatted string.

```javascript
// Expression Example
{ $project: { 
  discount: { $cond: { if: { $gte: ["$qty", 100] }, then: 20, else: 5 } },
  fullName: { $concat: ["$firstName", " ", "$lastName"] },
  formattedDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
} }
```

---

## 50 Aggregation Pipeline Examples

### Beginner (1-15)

**1. Count all active users**
*   **Statement:** Get total number of users with active status.
*   **Pipeline:** `db.users.aggregate([ { $match: { status: "active" } }, { $count: "total" } ])`
*   **Explanation:** Filters for "active" status, then counts the resulting documents.

**2. Group users by status**
*   **Statement:** Find how many users exist per status.
*   **Pipeline:** `db.users.aggregate([ { $group: { _id: "$status", count: { $sum: 1 } } } ])`
*   **Explanation:** Groups by the `status` field and increments the count by 1 for each document.

**3. Average product price**
*   **Statement:** Calculate the overall average price of all products.
*   **Pipeline:** `db.products.aggregate([ { $group: { _id: null, avgPrice: { $avg: "$price" } } } ])`
*   **Explanation:** `_id: null` groups everything into one single bucket to get a grand average.

**4. Highest salary**
*   **Statement:** Find the maximum salary among employees.
*   **Pipeline:** `db.employees.aggregate([ { $group: { _id: null, maxSalary: { $max: "$salary" } } } ])`
*   **Explanation:** Groups all documents and extracts the highest `$salary`.

**5. Total revenue**
*   **Statement:** Sum all order amounts.
*   **Pipeline:** `db.orders.aggregate([ { $group: { _id: null, totalRevenue: { $sum: "$amount" } } } ])`
*   **Explanation:** Uses `$sum` across all documents.

**6. Distinct tags**
*   **Statement:** Get a list of all unique tags used across articles.
*   **Pipeline:** `db.articles.aggregate([ { $unwind: "$tags" }, { $group: { _id: "$tags" } } ])`
*   **Explanation:** Deconstructs the tags array, then groups by tag name to remove duplicates.

**7. Filter and Sort**
*   **Statement:** Find products under $50 and sort by name.
*   **Pipeline:** `db.products.aggregate([ { $match: { price: { $lt: 50 } } }, { $sort: { name: 1 } } ])`
*   **Explanation:** Uses `$match` to filter, then `$sort` for ascending name.

**8. Top 3 most expensive products**
*   **Statement:** Find the 3 highest priced items.
*   **Pipeline:** `db.products.aggregate([ { $sort: { price: -1 } }, { $limit: 3 } ])`
*   **Explanation:** Sorts descending by price and limits output to 3.

**9. Rename field**
*   **Statement:** Output users with `id` instead of `_id`.
*   **Pipeline:** `db.users.aggregate([ { $project: { id: "$_id", _id: 0, name: 1 } } ])`
*   **Explanation:** Projects a new `id` field mapped to `_id` and excludes the original `_id`.

**10. Calculate order total**
*   **Statement:** Multiply price by quantity for an order item.
*   **Pipeline:** `db.orderItems.aggregate([ { $project: { total: { $multiply: ["$price", "$qty"] } } } ])`
*   **Explanation:** Uses `$multiply` arithmetic expression within `$project`.

**11. Find youngest user**
*   **Statement:** Find the minimum age.
*   **Pipeline:** `db.users.aggregate([ { $group: { _id: null, minAge: { $min: "$age" } } } ])`
*   **Explanation:** Groups all users to find the lowest age.

**12. Add arbitrary field**
*   **Statement:** Add a field `company` with value "Acme".
*   **Pipeline:** `db.users.aggregate([ { $addFields: { company: "Acme" } } ])`
*   **Explanation:** Appends a hardcoded string to all documents.

**13. Skip first 5 records**
*   **Statement:** Retrieve records 6-10 (Pagination).
*   **Pipeline:** `db.users.aggregate([ { $skip: 5 }, { $limit: 5 } ])`
*   **Explanation:** Skips 5, takes 5.

**14. Exclude sensitive data**
*   **Statement:** Hide passwords in results.
*   **Pipeline:** `db.users.aggregate([ { $unset: "password" } ])`
*   **Explanation:** Removes the password field from the pipeline output.

**15. Count by department**
*   **Statement:** How many employees per department?
*   **Pipeline:** `db.employees.aggregate([ { $group: { _id: "$department", headCount: { $sum: 1 } } } ])`
*   **Explanation:** Groups by department name and counts.

### Intermediate (16-35)

**16. Group by month**
*   **Statement:** Find total sales per month.
*   **Pipeline:** `db.sales.aggregate([ { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } } ])`
*   **Explanation:** Uses the `$month` expression to extract the month from a date field for grouping.

**17. Group by Year and Month**
*   **Statement:** Find total sales grouped by Year and Month.
*   **Pipeline:** `db.sales.aggregate([ { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } } ])`
*   **Explanation:** Uses a composite `_id` to group by two time dimensions simultaneously.

**18. Most sold products**
*   **Statement:** Find the top 5 most frequently purchased product IDs.
*   **Pipeline:** `db.orders.aggregate([ { $unwind: "$items" }, { $group: { _id: "$items.productId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 } ])`
*   **Explanation:** Unwinds order items, groups by product ID, counts them, sorts descending, and limits to 5.

**19. Top customers by spend**
*   **Statement:** Find the users who spent the most money.
*   **Pipeline:** `db.orders.aggregate([ { $group: { _id: "$userId", spent: { $sum: "$amount" } } }, { $sort: { spent: -1 } } ])`
*   **Explanation:** Groups by user, sums amount, sorts highest to lowest.

**20. Nested arrays extraction**
*   **Statement:** Find average score across all subjects for all students.
*   **Pipeline:** `db.students.aggregate([ { $unwind: "$scores" }, { $group: { _id: null, avgScore: { $avg: "$scores.score" } } } ])`
*   **Explanation:** Flattens the scores array and averages the `score` sub-field globally.

**21. Array to Set (Unique values per user)**
*   **Statement:** Collect a unique list of IP addresses a user logged in from.
*   **Pipeline:** `db.logins.aggregate([ { $group: { _id: "$userId", ips: { $addToSet: "$ip" } } } ])`
*   **Explanation:** Groups by user and adds IPs using `$addToSet` (prevents duplicates).

**22. Array of all values (Non-unique)**
*   **Statement:** Collect all login dates for a user.
*   **Pipeline:** `db.logins.aggregate([ { $group: { _id: "$userId", dates: { $push: "$date" } } } ])`
*   **Explanation:** Similar to `$addToSet`, but `$push` allows duplicate values.

**23. Find duplicates**
*   **Statement:** Find emails that are shared by more than one user.
*   **Pipeline:** `db.users.aggregate([ { $group: { _id: "$email", count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } } ])`
*   **Explanation:** Groups by email, counts occurrences, then filters for counts > 1.

**24. First document per group**
*   **Statement:** Find the most recent order for each user.
*   **Pipeline:** `db.orders.aggregate([ { $sort: { date: -1 } }, { $group: { _id: "$userId", lastOrder: { $first: "$$ROOT" } } } ])`
*   **Explanation:** Sorts newest first, then groups by user, taking the `$first` document (the newest one). `$$ROOT` references the whole document.

**25. String concatenation**
*   **Statement:** Combine first and last name into full name.
*   **Pipeline:** `db.users.aggregate([ { $project: { fullName: { $concat: ["$firstName", " ", "$lastName"] } } } ])`
*   **Explanation:** Uses `$concat` string operator inside `$project`.

**26. Default values for nulls**
*   **Statement:** If `bio` is missing, display "No bio provided".
*   **Pipeline:** `db.users.aggregate([ { $project: { bio: { $ifNull: ["$bio", "No bio provided"] } } } ])`
*   **Explanation:** Replaces null/missing fields with a fallback value.

**27. Conditional logic (If/Else)**
*   **Statement:** Label users as 'Adult' or 'Minor'.
*   **Pipeline:** `db.users.aggregate([ { $project: { type: { $cond: { if: { $gte: ["$age", 18] }, then: "Adult", else: "Minor" } } } } ])`
*   **Explanation:** Uses `$cond` to assign a string based on the `age` field.

**28. Date Formatting**
*   **Statement:** Format `createdAt` to YYYY-MM-DD.
*   **Pipeline:** `db.users.aggregate([ { $project: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } } ])`
*   **Explanation:** Converts a Date object to a readable string.

**29. Calculate Array Size**
*   **Statement:** Count how many friends each user has.
*   **Pipeline:** `db.users.aggregate([ { $project: { friendCount: { $size: "$friends" } } } ])`
*   **Explanation:** Uses `$size` on an array field.

**30. Filter Array Elements**
*   **Statement:** Keep only scores > 80 in a student's scores array.
*   **Pipeline:** `db.students.aggregate([ { $project: { highScores: { $filter: { input: "$scores", as: "s", cond: { $gt: ["$$s", 80] } } } } } ])`
*   **Explanation:** `$filter` processes an array and returns only elements matching the condition.

**31. Basic Lookup**
*   **Statement:** Join users with their orders.
*   **Pipeline:** `db.users.aggregate([ { $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "myOrders" } } ])`
*   **Explanation:** Attaches an array `myOrders` containing matching documents from the `orders` collection.

**32. Group and Average Array**
*   **Statement:** Average product rating.
*   **Pipeline:** `db.products.aggregate([ { $unwind: "$reviews" }, { $group: { _id: "$_id", avgRating: { $avg: "$reviews.rating" } } } ])`
*   **Explanation:** Unwinds the reviews array to compute the average rating per product.

**33. Substring extraction**
*   **Statement:** Get first 3 letters of a username.
*   **Pipeline:** `db.users.aggregate([ { $project: { prefix: { $substr: ["$username", 0, 3] } } } ])`
*   **Explanation:** Slices the string field starting at index 0 for 3 characters.

**34. Rounding Numbers**
*   **Statement:** Round prices to the nearest integer.
*   **Pipeline:** `db.products.aggregate([ { $project: { roundedPrice: { $round: ["$price", 0] } } } ])`
*   **Explanation:** Rounds the number field to 0 decimal places.

**35. Bucket Categorization**
*   **Statement:** Group users into age brackets.
*   **Pipeline:** `db.users.aggregate([ { $bucket: { groupBy: "$age", boundaries: [0, 18, 30, 50, 100], default: "Other", output: { count: { $sum: 1 } } } } ])`
*   **Explanation:** Puts documents into predefined numerical ranges and counts them.

### Advanced (36-50)

**36. Multi-stage Pipeline: Revenue Dashboard**
*   **Statement:** Calculate total revenue for active products, grouped by category, sorted by highest revenue.
*   **Pipeline:** 
    ```javascript
    db.orders.aggregate([
      { $match: { status: "completed" } },
      { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $match: { "product.isActive": true } },
      { $group: { _id: "$product.category", revenue: { $sum: "$amount" } } },
      { $sort: { revenue: -1 } }
    ])
    ```
*   **Explanation:** Filters orders, joins products, unwinds the join array, filters active products, groups by category, and sorts.

**37. Cohort Analysis (Retention)**
*   **Statement:** Group users by their signup month, then see how many logged in during a specific month.
*   **Pipeline:**
    ```javascript
    db.users.aggregate([
      { $project: { signupMonth: { $month: "$createdAt" }, lastLoginMonth: { $month: "$lastLogin" } } },
      { $group: { _id: { signup: "$signupMonth", login: "$lastLoginMonth" }, count: { $sum: 1 } } }
    ])
    ```
*   **Explanation:** Extracts months for two different date fields, then groups by the combination to build a retention matrix.

**38. Faceted Search (Multiple aggregations at once)**
*   **Statement:** Get product count by category AND product count by price range in a single query (e.g., for e-commerce sidebars).
*   **Pipeline:**
    ```javascript
    db.products.aggregate([
      { $facet: {
        byCategory: [ { $group: { _id: "$category", count: { $sum: 1 } } } ],
        byPrice: [ { $bucketAuto: { groupBy: "$price", buckets: 4 } } ]
      }}
    ])
    ```
*   **Explanation:** `$facet` runs parallel sub-pipelines and outputs a single document containing both arrays.

**39. Replace Root (Flattening documents)**
*   **Statement:** Extract a nested `address` object and make it the top-level document.
*   **Pipeline:** `db.users.aggregate([ { $match: { address: { $exists: true } } }, { $replaceRoot: { newRoot: "$address" } } ])`
*   **Explanation:** Replaces the root `user` document with its `address` sub-document.

**40. Map over Array**
*   **Statement:** Multiply every score in an array by 10.
*   **Pipeline:**
    ```javascript
    db.students.aggregate([
      { $project: { scaledScores: { $map: { input: "$scores", as: "score", in: { $multiply: ["$$score", 10] } } } } }
    ])
    ```
*   **Explanation:** Iterates over the `scores` array, applying an expression to each element to generate a new array.

**41. Reduce Array**
*   **Statement:** Sum all numbers inside a flat array field manually.
*   **Pipeline:**
    ```javascript
    db.stats.aggregate([
      { $project: { total: { $reduce: { input: "$numbers", initialValue: 0, in: { $add: ["$$value", "$$this"] } } } } }
    ])
    ```
*   **Explanation:** Acts like JavaScript's `Array.reduce()`, aggregating array elements into a single value.

**42. Self Lookup (Hierarchical Data)**
*   **Statement:** Find a manager and all their direct reports.
*   **Pipeline:** `db.employees.aggregate([ { $lookup: { from: "employees", localField: "_id", foreignField: "managerId", as: "reports" } } ])`
*   **Explanation:** Joins a collection to itself to resolve parent-child relationships.

**43. Correlated Subqueries (Lookup with pipeline)**
*   **Statement:** Join users with ONLY their 5 most recent orders.
*   **Pipeline:**
    ```javascript
    db.users.aggregate([
      { $lookup: {
        from: "orders",
        let: { uId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uId"] } } },
          { $sort: { date: -1 } },
          { $limit: 5 }
        ],
        as: "recentOrders"
      }}
    ])
    ```
*   **Explanation:** Instead of simple field matching, uses a custom aggregation pipeline *inside* the lookup.

**44. Set Union**
*   **Statement:** Combine two arrays, removing duplicates.
*   **Pipeline:** `db.users.aggregate([ { $project: { allTags: { $setUnion: ["$workTags", "$personalTags"] } } } ])`
*   **Explanation:** Merges arrays using set mathematics.

**45. Window Functions (Moving Average)**
*   **Statement:** Calculate a running total of sales.
*   **Pipeline:**
    ```javascript
    db.sales.aggregate([
      { $setWindowFields: {
          sortBy: { date: 1 },
          output: { runningTotal: { $sum: "$amount", window: { documents: ["unbounded", "current"] } } }
      }}
    ])
    ```
*   **Explanation:** Operates on a "window" of documents (supported in MongoDB 5.0+) to calculate cumulative sums.

**46. Dense Rank**
*   **Statement:** Rank users by score.
*   **Pipeline:** `db.players.aggregate([ { $setWindowFields: { sortBy: { score: -1 }, output: { rank: { $denseRank: {} } } } } ])`
*   **Explanation:** Assigns a rank to each document based on the sort order.

**47. Graph Lookup (Recursive search)**
*   **Statement:** Find ALL descendants in an org chart (not just direct reports).
*   **Pipeline:**
    ```javascript
    db.employees.aggregate([
      { $match: { name: "CEO" } },
      { $graphLookup: { from: "employees", startWith: "$_id", connectFromField: "_id", connectToField: "managerId", as: "allSubordinates" } }
    ])
    ```
*   **Explanation:** Recursively searches hierarchical data until the tree is exhausted.

**48. Merge into another collection**
*   **Statement:** Materialized View - Calculate daily stats and save permanently.
*   **Pipeline:** `db.sales.aggregate([ { $group: { _id: "$date", total: {$sum: "$amount"} } }, { $merge: { into: "dailyStats", whenMatched: "replace" } } ])`
*   **Explanation:** Writes the result of the aggregation pipeline directly into another collection.

**49. Funnel Reports**
*   **Statement:** See drop-off rates through a user journey (Signup -> Onboarding -> Purchase).
*   **Pipeline:**
    ```javascript
    db.events.aggregate([
      { $group: {
          _id: "$userId",
          signedUp: { $max: { $cond: [{ $eq: ["$action", "signup"] }, 1, 0] } },
          onboarded: { $max: { $cond: [{ $eq: ["$action", "onboard"] }, 1, 0] } },
          purchased: { $max: { $cond: [{ $eq: ["$action", "purchase"] }, 1, 0] } }
      }},
      { $group: {
          _id: null,
          totalSignedUp: { $sum: "$signedUp" },
          totalOnboarded: { $sum: "$onboarded" },
          totalPurchased: { $sum: "$purchased" }
      }}
    ])
    ```
*   **Explanation:** First determines if a user hit each step using conditional max, then totals them up globally.

**50. Outlier Detection**
*   **Statement:** Find orders that are > 2x the average order value.
*   **Pipeline:**
    ```javascript
    db.orders.aggregate([
      { $group: { _id: null, avgValue: { $avg: "$amount" }, docs: { $push: "$$ROOT" } } },
      { $unwind: "$docs" },
      { $match: { $expr: { $gt: ["$docs.amount", { $multiply: ["$avgValue", 2] }] } } },
      { $replaceRoot: { newRoot: "$docs" } }
    ])
    ```
*   **Explanation:** Calculates average, pushes all docs into an array, unwinds them, matches against the computed average, and restores the document structure.
