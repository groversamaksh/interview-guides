# MongoDB with Node.js & SQL Comparisons

## MongoDB with Node.js

### 1. Native Driver (`mongodb`)

The official driver offers fine-grained control and high performance without the overhead of an ODM.

```javascript
const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('myDatabase');
    const users = db.collection('users');

    // CRUD Operations
    await users.insertOne({ name: "Alice", age: 25 });
    
    const user = await users.findOne({ _id: new ObjectId("60a2b...") });
    
    await users.updateOne({ name: "Alice" }, { $set: { active: true } });
    
    await users.deleteOne({ name: "Alice" });

  } finally {
    await client.close();
  }
}
run();
```

### 2. Mongoose (ODM)

Mongoose provides a straight-forward, schema-based solution to model application data.

**Key Concepts:**
*   **Schema:** Defines the structure, types, and validation of documents.
*   **Model:** A compiled Schema that provides an interface to query the database.
*   **Validation:** Built-in and custom validators applied before saving.
*   **Middleware (Hooks):** Functions that execute before or after operations (e.g., hash password before `save`).
*   **Virtuals:** Document properties that are computed but not stored in MongoDB.
*   **Population:** Mongoose's way of executing `$lookup` under the hood.

```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myDatabase');

// 1. Schema Definition & Validation
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  age: { type: Number, min: 18, max: 100 }
});

// 2. Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 3. Middleware (Pre-save Hook)
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 4. Model Creation
const User = mongoose.model('User', userSchema);

// 5. Population Example (Assuming a Post model exists)
const Post = mongoose.model('Post', new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}));

// Create and Query
async function demo() {
  const user = await User.create({ firstName: "John", lastName: "Doe", email: "j@j.com", age: 30 });
  console.log(user.fullName); // "John Doe"

  const post = await Post.create({ title: "My Post", author: user._id });
  
  // Populate
  const populatedPost = await Post.findOne({ title: "My Post" }).populate('author');
  console.log(populatedPost.author.firstName); // "John"
}
```

---

## MongoDB Atlas

MongoDB Atlas is the fully-managed cloud database service by MongoDB.

*   **Clusters:** Deploy scalable Replica Sets or Sharded Clusters across AWS, GCP, or Azure.
*   **Monitoring:** Real-time metrics (CPU, RAM, Connections, Opcounters, Query Targeting).
*   **Backups:** Automated snapshots and continuous point-in-time recovery.
*   **Security:** Built-in VPC peering, IP allowlisting, database auditing, and TLS.
*   **Atlas Search:** Full-text search engine built on Apache Lucene, integrated directly into the DB.
*   **Data Lake:** Query S3 buckets directly using MQL (MongoDB Query Language).

---

## SQL vs MongoDB Comparisons

### Terminology Comparison
| SQL (RDBMS) | MongoDB |
| :--- | :--- |
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Index | Index |
| Table Joins | `$lookup` / Embedded Documents |
| Primary Key | `_id` Field |
| View | View (Read-only collection) |

### Query Equivalents
| SQL Query | MongoDB Equivalent |
| :--- | :--- |
| `SELECT * FROM users` | `db.users.find()` |
| `SELECT id, name FROM users` | `db.users.find({}, { name: 1 })` |
| `SELECT * FROM users WHERE age = 25` | `db.users.find({ age: 25 })` |
| `SELECT * FROM users WHERE age > 25` | `db.users.find({ age: { $gt: 25 } })` |
| `SELECT * FROM users WHERE age = 25 AND status = 'A'` | `db.users.find({ age: 25, status: 'A' })` |
| `SELECT * FROM users WHERE age = 25 OR status = 'A'` | `db.users.find({ $or: [{age: 25}, {status: 'A'}] })` |
| `SELECT * FROM users ORDER BY age DESC` | `db.users.find().sort({ age: -1 })` |
| `SELECT COUNT(*) FROM users` | `db.users.countDocuments()` |
| `INSERT INTO users (name) VALUES ('Bob')` | `db.users.insertOne({ name: 'Bob' })` |
| `UPDATE users SET age = 26 WHERE name = 'Bob'` | `db.users.updateOne({ name: 'Bob' }, { $set: { age: 26 } })` |
| `DELETE FROM users WHERE name = 'Bob'` | `db.users.deleteOne({ name: 'Bob' })` |

### Architecture Features
| Feature | SQL | MongoDB |
| :--- | :--- | :--- |
| **Schema** | Rigid / Enforced | Dynamic / Flexible |
| **Scaling** | Primarily Vertical | Native Horizontal (Sharding) |
| **Relationships** | Joins (Normalized) | Embedded (Denormalized) or `$lookup` |
| **Transactions** | Default (ACID) | Supported (ACID multi-document since v4.0) |

---

## MongoDB Quick Reference Tables

### CRUD Commands
| Command | Purpose |
| :--- | :--- |
| `insertOne(doc)` | Insert one document |
| `insertMany([docs])` | Insert array of documents |
| `find(query, proj)` | Find documents |
| `findOne(query)` | Find one document |
| `updateOne(filter, update)` | Update first matched document |
| `updateMany(filter, update)` | Update all matched documents |
| `replaceOne(filter, doc)` | Replace entire document |
| `deleteOne(filter)` | Delete first matched document |
| `deleteMany(filter)` | Delete all matched documents |

### Key Query Operators
| Operator | Description |
| :--- | :--- |
| `$eq` / `$ne` | Equal / Not Equal |
| `$gt` / `$gte` | Greater Than / Greater Than or Equal |
| `$lt` / `$lte` | Less Than / Less Than or Equal |
| `$in` / `$nin` | In Array / Not In Array |
| `$exists` | Field exists (boolean) |
| `$type` | Field is of BSON type |

### Key Update Operators
| Operator | Description |
| :--- | :--- |
| `$set` | Set field value |
| `$unset` | Remove field |
| `$inc` | Increment numeric field |
| `$push` | Append to array |
| `$pull` | Remove from array |
| `$addToSet` | Append unique to array |
