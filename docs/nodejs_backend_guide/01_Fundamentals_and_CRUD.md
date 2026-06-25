# MongoDB Fundamentals & CRUD Guide

## MongoDB Fundamentals

MongoDB is a NoSQL, document-oriented database designed for high availability, scalability, and flexibility. Instead of storing data in tables and rows like traditional relational databases, MongoDB stores data in BSON (Binary JSON) format.

### Key Concepts

*   **Database:** A physical container for collections. A single MongoDB server typically has multiple databases.
*   **Collection:** A grouping of MongoDB documents (equivalent to an RDBMS table). A collection exists within a single database. Collections do not enforce a schema.
*   **Document:** A set of key-value pairs (equivalent to an RDBMS row). Documents have dynamic schema.
*   **BSON:** The binary encoding of JSON-like documents that MongoDB uses to store data. It extends the JSON model to provide additional data types, strict encoding, and efficient parsing.

### Data Modeling: Embedded vs. Referenced

**Embedded Data (Denormalized):** Stores related data in a single document.
*   *Pros:* Fast read performance (single query).
*   *Cons:* Can lead to large documents (16MB limit) and data duplication.
*   *Use Case:* One-to-Few relationships.
```json
{
  "_id": "user1",
  "name": "Alice",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}
```

**Referenced Data (Normalized):** Stores relationships between data by including links or references (ObjectIds) from one document to another.
*   *Pros:* Avoids data duplication, useful for complex many-to-many relationships or large hierarchical data.
*   *Cons:* Requires multiple queries or `$lookup` (joins) to retrieve related data.
*   *Use Case:* One-to-Many, Many-to-Many relationships.
```json
// User Document
{ "_id": "user1", "name": "Alice" }
// Order Document
{ "_id": "order1", "userId": "user1", "amount": 100 }
```

---

## MongoDB Shell Basics

Connect to a MongoDB instance using `mongosh` (the modern shell).

```javascript
// Display all databases
show dbs

// Switch to a specific database (creates it lazily if it doesn't exist)
use mydb

// Display all collections in the current database
show collections

// Drop the current database
db.dropDatabase()

// Drop a specific collection
db.users.drop()
```

---

## CRUD Operations

### 1. Create (Insert)

*   `insertOne()`: Inserts a single document.
*   `insertMany()`: Inserts multiple documents.

```javascript
// Insert a single user
db.users.insertOne({
  name: "John Doe",
  age: 30,
  email: "john@example.com"
});

// Insert multiple users
db.users.insertMany([
  { name: "Jane Smith", age: 25 },
  { name: "Bob Johnson", age: 40 }
]);
```

### 2. Read (Find)

*   `find()`: Returns a cursor to the matching documents.
*   `findOne()`: Returns the first matching document.

```javascript
// Find all users
db.users.find();

// Exact Match: Find user with exact name
db.users.find({ name: "Jane Smith" });

// Multiple Conditions (implicit AND)
db.users.find({ name: "Jane Smith", age: 25 });

// Nested Fields (Use dot notation in quotes)
db.users.find({ "address.city": "New York" });

// Arrays: Find documents where tags array contains "developer"
db.users.find({ tags: "developer" });

// Projection: Include name and email, exclude _id
db.users.find({ age: { $gt: 20 } }, { name: 1, email: 1, _id: 0 });
```

### 3. Update

*   `updateOne()`: Updates the first matching document.
*   `updateMany()`: Updates all matching documents.
*   `replaceOne()`: Replaces the entire document except the `_id`.
*   `findOneAndUpdate()`: Updates and returns the document.

**Update Operators:**
*   `$set`: Sets the value of a field.
*   `$unset`: Removes a field.
*   `$inc`: Increments the value of a field.
*   `$mul`: Multiplies the value of a field.
*   `$rename`: Renames a field.
*   `$currentDate`: Sets field to current date/time.
*   `$min` / `$max`: Updates field only if specified value is less/greater than the current value.

```javascript
// $set: Update a specific field
db.users.updateOne({ name: "John Doe" }, { $set: { status: "active" } });

// $inc: Increment age by 1
db.users.updateMany({ status: "active" }, { $inc: { age: 1 } });

// $unset: Remove the email field
db.users.updateOne({ name: "Bob Johnson" }, { $unset: { email: "" } });

// $rename: Rename field 'status' to 'accountStatus'
db.users.updateMany({}, { $rename: { status: "accountStatus" } });

// $currentDate: Set lastModified to now
db.users.updateOne({ _id: 1 }, { $currentDate: { lastModified: true } });
```

### 4. Delete

*   `deleteOne()`: Deletes the first matching document.
*   `deleteMany()`: Deletes all matching documents.
*   `findOneAndDelete()`: Deletes and returns the document.

```javascript
// Delete a specific user
db.users.deleteOne({ name: "John Doe" });

// Delete all inactive users
db.users.deleteMany({ status: "inactive" });
```

---

## Query Operators

### Comparison Operators

*   `$eq`: Matches values that are equal to a specified value.
*   `$ne`: Matches all values that are not equal to a specified value.
*   `$gt`: Matches values that are greater than a specified value.
*   `$gte`: Matches values that are greater than or equal to a specified value.
*   `$lt`: Matches values that are less than a specified value.
*   `$lte`: Matches values that are less than or equal to a specified value.
*   `$in`: Matches any of the values specified in an array.
*   `$nin`: Matches none of the values specified in an array.

```javascript
// Find users older than 25
db.users.find({ age: { $gt: 25 } });

// Find users in specific departments
db.users.find({ department: { $in: ["Sales", "Engineering"] } });

// Find users not in specific departments
db.users.find({ department: { $nin: ["HR"] } });
```

### Logical Operators

*   `$and`: Joins query clauses with a logical AND.
*   `$or`: Joins query clauses with a logical OR.
*   `$nor`: Joins query clauses with a logical NOR.
*   `$not`: Inverts the effect of a query expression.

```javascript
// Find users who are either in Sales or older than 30
db.users.find({ $or: [{ department: "Sales" }, { age: { $gt: 30 } }] });

// Find users matching both conditions (explicit $and, though implicit is preferred)
db.users.find({ $and: [{ status: "active" }, { age: { $lt: 40 } }] });
```

### Element Operators

*   `$exists`: Matches documents that have the specified field.
*   `$type`: Selects documents if a field is of the specified type.

```javascript
// Find users who have an email address field
db.users.find({ email: { $exists: true } });

// Find users where age is a string
db.users.find({ age: { $type: "string" } });
```

### Evaluation Operators

*   `$regex`: Selects documents where values match a specified regular expression.
*   `$text`: Performs text search (requires a text index).
*   `$expr`: Allows use of aggregation expressions within the query language.

```javascript
// Case-insensitive regex search for name starting with "jo"
db.users.find({ name: { $regex: /^jo/i } });

// Compare two fields in the same document
db.users.find({ $expr: { $gt: [ "$spent", "$budget" ] } });
```

### Array Operators

*   `$all`: Matches arrays that contain all elements specified in the query.
*   `$size`: Selects documents if the array field is a specified size.
*   `$elemMatch`: Selects documents if an element in the array field matches all the specified `$elemMatch` conditions.

```javascript
// Find documents where tags array contains BOTH "red" and "blank"
db.users.find({ tags: { $all: ["red", "blank"] } });

// Find documents with exactly 3 tags
db.users.find({ tags: { $size: 3 } });

// Find users who have at least one score >= 80 in math
db.students.find({ 
  scores: { $elemMatch: { subject: "math", score: { $gte: 80 } } } 
});
```

---

## Projection

Projection specifies which fields to return in the documents. 
*   `1`: Include field.
*   `0`: Exclude field.

```javascript
// Include only name and email, exclude _id
db.users.find({}, { name: 1, email: 1, _id: 0 });

// Exclude sensitive data
db.users.find({}, { password: 0, ssn: 0 });

// Include specific nested fields
db.users.find({}, { "address.city": 1 });
```

---

## Sorting, Pagination & Limiting

*   `sort()`: Orders the result set (1 for ascending, -1 for descending).
*   `limit()`: Limits the number of documents passed to the next stage.
*   `skip()`: Skips a specified number of documents.

```javascript
// Sort by age descending, then by name ascending
db.users.find().sort({ age: -1, name: 1 });

// Production-grade Pagination (Skip/Limit approach)
// Note: This approach becomes slow on large collections. Use range-based pagination (cursor-based) for scale.
const pageNumber = 2;
const pageSize = 10;
db.users.find()
  .skip((pageNumber - 1) * pageSize)
  .limit(pageSize);

// Better Cursor-based Pagination (Fast for large datasets)
db.users.find({ _id: { $gt: lastSeenId } }).limit(pageSize);
```
