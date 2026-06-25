# MongoDB Relationships & Lookups

## MongoDB Relationships

Data in MongoDB can be modeled using two main strategies: Embedding and Referencing.

### 1. Embedding (Denormalization)
Data is stored together within a single document.
**Pros:** 
- Retrieves related data in a single read operation (fast).
- Atomic updates within a single document.
**Cons:**
- Document size can grow beyond the 16MB BSON limit.
- Data duplication (anomalies on update).
**Use Cases:** One-to-Few relationships, data that is queried together, data that doesn't change frequently.

```javascript
// Embedded Relationship
{
  "_id": ObjectId("5f1b..."),
  "name": "John Doe",
  "contact": {
    "phone": "123-456-7890",
    "email": "john@example.com"
  },
  "addresses": [
    { "street": "123 Main St", "city": "NYC" },
    { "street": "456 Market St", "city": "SF" }
  ]
}
```

### 2. Referencing (Normalization)
Data is stored in separate collections, and documents are linked using ObjectIds (like Foreign Keys in SQL).
**Pros:**
- Avoids data duplication.
- Keeps document size small.
- Better for complex hierarchies and many-to-many relationships.
**Cons:**
- Requires multiple queries or `$lookup` aggregations to fetch related data.
**Use Cases:** One-to-Many, Many-to-Many relationships, when related data changes frequently, or when the array of embedded documents would grow infinitely.

```javascript
// Referenced Relationship
// User Collection
{
  "_id": ObjectId("user1"),
  "name": "John Doe"
}

// Order Collection
{
  "_id": ObjectId("order1"),
  "userId": ObjectId("user1"), // Reference to the User
  "total": 150
}
```

---

## Lookup (MongoDB Joins)

The `$lookup` aggregation stage performs a left outer join to a collection in the same database.

### Core Syntax
```javascript
{
   $lookup:
     {
       from: <collection to join>,
       localField: <field from the input documents>,
       foreignField: <field from the documents of the "from" collection>,
       as: <output array field>
     }
}
```

---

## 15 Lookup Examples

**1. Basic One-to-One / Left Join**
*   **Use case:** Join a user with their profile.
*   ```javascript
    db.users.aggregate([
      { $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "profile" } }
    ])
    ```

**2. One-to-Many Join**
*   **Use case:** Join a user with all their orders.
*   ```javascript
    db.users.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "orders" } }
    ])
    ```

**3. Many-to-Many Join**
*   **Use case:** Students and Courses (where a student document has an array of `courseIds`).
*   ```javascript
    db.students.aggregate([
      { $lookup: { from: "courses", localField: "courseIds", foreignField: "_id", as: "enrolledCourses" } }
    ])
    ```

**4. Lookup with Unwind**
*   **Use case:** Flatten the array returned by `$lookup` when you know it's a 1-to-1 relationship.
*   ```javascript
    db.users.aggregate([
      { $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "profile" } },
      { $unwind: "$profile" } // Converts the single-element array into an object
    ])
    ```

**5. Lookup and Filter (Match after Join)**
*   **Use case:** Find users who have placed orders worth more than $100.
*   ```javascript
    db.users.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "orders" } },
      { $match: { "orders.total": { $gt: 100 } } }
    ])
    ```

**6. Lookup with Subquery (Correlated Pipeline)**
*   **Use case:** Join users with only their "completed" orders (filters the joined collection).
*   ```javascript
    db.users.aggregate([
      { $lookup: {
          from: "orders",
          let: { user_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [
                { $eq: ["$userId", "$$user_id"] },
                { $eq: ["$status", "completed"] }
            ]}}}
          ],
          as: "completedOrders"
      }}
    ])
    ```

**7. Lookup with Projection in Subquery**
*   **Use case:** Join users with orders, but only return the order `total` and `date`.
*   ```javascript
    db.users.aggregate([
      { $lookup: {
          from: "orders",
          let: { uId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$uId"] } } },
            { $project: { total: 1, date: 1, _id: 0 } }
          ],
          as: "orders"
      }}
    ])
    ```

**8. Lookup with Sort and Limit (Top N per Group)**
*   **Use case:** Get users and their 3 most recent orders.
*   ```javascript
    db.users.aggregate([
      { $lookup: {
          from: "orders",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$id"] } } },
            { $sort: { date: -1 } },
            { $limit: 3 }
          ],
          as: "recentOrders"
      }}
    ])
    ```

**9. Multi-Level Join (Double Lookup)**
*   **Use case:** Get Order -> Join User -> Join User's Profile.
*   ```javascript
    db.orders.aggregate([
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $lookup: { from: "profiles", localField: "user._id", foreignField: "userId", as: "user.profile" } }
    ])
    ```

**10. Lookup on Arrays (Foreign field is an array)**
*   **Use case:** Find products that belong to categories listed in the product's `categoryIds` array.
*   ```javascript
    db.categories.aggregate([
      { $lookup: { from: "products", localField: "_id", foreignField: "categoryIds", as: "productsInCat" } }
    ])
    ```

**11. Lookup with Multiple Join Conditions**
*   **Use case:** Join where both `companyId` AND `departmentId` must match.
*   ```javascript
    db.employees.aggregate([
      { $lookup: {
          from: "departments",
          let: { emp_comp: "$companyId", emp_dept: "$departmentId" },
          pipeline: [
            { $match: { $expr: { $and: [
                { $eq: ["$_id", "$$emp_dept"] },
                { $eq: ["$companyId", "$$emp_comp"] }
            ]}}}
          ],
          as: "dept_info"
      }}
    ])
    ```

**12. Graph Lookup (Hierarchical Join)**
*   **Use case:** Org Chart - find all reporting employees (recursive).
*   ```javascript
    db.employees.aggregate([
      { $match: { name: "Alice (CEO)" } },
      { $graphLookup: {
          from: "employees",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "managerId",
          as: "allSubordinates"
      }}
    ])
    ```

**13. Graph Lookup with Depth Limit**
*   **Use case:** Find only direct reports and their direct reports (max depth 1).
*   ```javascript
    db.employees.aggregate([
      { $graphLookup: {
          from: "employees",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "managerId",
          maxDepth: 1,
          as: "subordinates"
      }}
    ])
    ```

**14. Lookup with Count**
*   **Use case:** Join and immediately count the number of orders per user without storing the full array.
*   ```javascript
    db.users.aggregate([
      { $lookup: {
          from: "orders",
          let: { uId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$uId"] } } },
            { $count: "orderCount" }
          ],
          as: "stats"
      }},
      { $project: { orderCount: { $arrayElemAt: ["$stats.orderCount", 0] } } }
    ])
    ```

**15. Lookup with Update (Aggregation Pipeline in Update)**
*   **Use case:** Update a user's document with the count of their orders (MongoDB 4.2+).
*   ```javascript
    db.users.updateMany({}, [
      { $set: {
          totalOrders: {
            $size: {
              $filter: { /* Custom logic or require a $lookup in an aggregation to merge later */ }
            }
          }
      }}
    ])
    // Note: To truly join during update, use an aggregation with $merge.
    db.users.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "orders" } },
      { $set: { orderCount: { $size: "$orders" } } },
      { $unset: "orders" },
      { $merge: { into: "users", on: "_id", whenMatched: "replace" } }
    ])
    ```
