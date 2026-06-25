# Testing, Performance, & Patterns

## Testing

Testing ensures code reliability and prevents regressions.
*   **Unit Testing:** Tests an isolated piece of code (a function or class) mocking all external dependencies. Fast.
*   **Integration Testing:** Tests how multiple units work together (e.g., testing a database query with a real test DB).
*   **E2E (End-to-End) Testing:** Tests the entire application flow from the user's perspective. Slowest.

### API Testing with Jest & Supertest
`Supertest` provides a high-level abstraction for testing HTTP in Node.js.

```javascript
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('POST /api/users', () => {
  it('should create a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'testuser', email: 'test@test.com' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.username).toBe('testuser');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'testuser' });
    
    expect(res.statusCode).toEqual(400);
  });
});
```

---

## Performance Optimization

Node.js is fast, but bad code can block the Event Loop, freezing the entire application.

### Event Loop Blocking
*   *Cause:* Running synchronous, CPU-intensive code (e.g., heavy regex, massive `JSON.parse()`, synchronous cryptography `crypto.pbkdf2Sync()`).
*   *Fix:* Use async equivalents (`crypto.pbkdf2()`), offload to Worker Threads, or break the task up using `setImmediate()`.

### Memory Leaks
*   *Cause:* Global variables, forgotten closures, event listeners not removed, keeping large arrays in memory indefinitely.
*   *Fix:* Use Heap Snapshots (Chrome DevTools connected to Node via `node --inspect`) to compare memory trees and find the retaining paths.

### Database Optimization & Connection Pooling
*   Opening a database connection is expensive (TCP handshake, authentication).
*   **Connection Pooling:** Maintain a pool of active connections. When a request needs the DB, it borrows a connection from the pool and returns it when done. (Supported natively by `pg`, `mongoose`, etc.).
*   Always index your database queries!

### Profiling
*   Use `node --prof app.js` to generate a tick file, then `node --prof-process isolate-0x...` to view a breakdown of where CPU time is spent (C++ vs JS code).
*   Use `clinic.js` (Clinic Doctor) for advanced visual profiling of Node.js performance issues.

---

## Design Patterns in Node.js

### 1. Singleton
Ensures a class has only one instance and provides a global point of access.
*   *Node specific:* Node's module caching essentially creates singletons. If you `require('db')` in multiple files, it returns the same instance.
```javascript
class Database {
  constructor() {
    if (!Database.instance) {
      this.connection = this.createConnection();
      Database.instance = this;
    }
    return Database.instance;
  }
}
```

### 2. Factory Pattern
Creates objects without specifying the exact class to create. Useful for dynamic object creation.
```javascript
class UserFactory {
  static createUser(type) {
    if (type === 'admin') return new AdminUser();
    if (type === 'guest') return new GuestUser();
    throw new Error('Unknown user type');
  }
}
```

### 3. Observer Pattern
An object (Subject) maintains a list of dependents (Observers) and notifies them of state changes.
*   *Node specific:* Node's built-in `EventEmitter` is an implementation of the Observer pattern.
```javascript
const EventEmitter = require('events');
const orderEvents = new EventEmitter();

// Observer 1
orderEvents.on('orderPlaced', (order) => sendEmail(order.user));
// Observer 2
orderEvents.on('orderPlaced', (order) => updateInventory(order.items));

// Subject
orderEvents.emit('orderPlaced', { user: 'Alice', items: [] });
```

### 4. Dependency Injection (DI)
Instead of a class instantiating its dependencies, they are passed in (injected), making the class easier to test.
```javascript
// BAD (Hard to mock db)
class UserService {
  constructor() {
    this.db = require('./db');
  }
}

// GOOD (Easy to inject a mock DB during testing)
class UserService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }
}
```

### 5. Strategy Pattern
Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.
```javascript
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }
  pay(amount) {
    return this.strategy.process(amount);
  }
}

const stripe = { process: (a) => `Paid ${a} via Stripe` };
const paypal = { process: (a) => `Paid ${a} via PayPal` };

const processor = new PaymentProcessor(stripe);
processor.pay(100);
```
