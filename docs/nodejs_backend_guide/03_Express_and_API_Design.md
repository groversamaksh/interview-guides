# Express.js & API Design

## Express.js Fundamentals

Express is a fast, unopinionated, minimalist web framework for Node.js. It provides a robust set of features for web and mobile applications, primarily centered around **routing** and **middleware**.

### Architecture
Express applications are essentially a series of middleware function calls.
A request enters the app, passes through a pipeline of middleware functions (which can modify the request/response objects or end the cycle), and eventually hits a route handler.

### Middleware
Middleware functions have access to the `req` (request), `res` (response), and the `next` function.
*   **Application-level:** `app.use(logger)`
*   **Router-level:** `router.use(authMiddleware)`
*   **Error-handling:** Defined with 4 arguments `(err, req, res, next)`.
*   **Built-in:** `express.json()`, `express.static()`
*   **Third-party:** `cors()`, `helmet()`, `morgan()`

### The Request Lifecycle
1.  Client makes an HTTP request.
2.  Node.js HTTP server creates `req` and `res` objects.
3.  Express parses the request (e.g., `express.json()` parses body).
4.  Custom middleware runs (e.g., Auth checks).
5.  Router matches the HTTP method and path.
6.  Controller handles business logic.
7.  Response is sent (`res.json()`, `res.send()`).
8.  Connection concludes.

---

## Complete API Example

A production-grade Express setup including validation, async error handling, and routing.

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// 1. Built-in & 3rd Party Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// 2. Custom Middleware (e.g., Request Logger)
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // MUST call next() to pass control
};
app.use(requestLogger);

// 3. Validation Middleware (Manual Example)
const validateUser = (req, res, next) => {
  const { username, email } = req.body;
  if (!username || !email) {
    // End the request cycle here if invalid
    return res.status(400).json({ error: 'Username and email are required' });
  }
  next();
};

// 4. Async Wrapper to catch unhandled promise rejections
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 5. Routes
app.get('/api/users', asyncHandler(async (req, res) => {
  // Simulate DB call
  const users = [{ id: 1, name: 'Alice' }];
  res.status(200).json({ success: true, data: users });
}));

app.post('/api/users', validateUser, asyncHandler(async (req, res) => {
  // If we reach here, validation passed
  const newUser = req.body;
  res.status(201).json({ success: true, data: newUser });
}));

// 6. 404 Handler (Catch-all for unmatched routes)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## API Design Best Practices

Designing a good RESTful API makes it predictable, intuitive, and scalable.

### 1. Naming Conventions
*   **Use Nouns, Not Verbs:** `GET /users` (Good), `GET /getAllUsers` (Bad).
*   **Pluralize Resources:** `GET /users`, `GET /users/123`.
*   **Kebab-case for URLs:** `GET /user-profiles` (Not `/userProfiles`).
*   **Hierarchy:** `GET /users/123/orders` (Orders belonging to User 123).

### 2. Versioning
Always version APIs to prevent breaking changes for existing clients.
*   **URI Versioning (Standard):** `GET /api/v1/users`
*   **Header Versioning:** `Accept: application/vnd.company.v1+json`

### 3. Pagination, Filtering, Sorting, and Search

**Pagination:** Never return entire collections.
*   *Offset/Limit:* `GET /users?limit=20&offset=40` (Easy, but slow on large datasets).
*   *Cursor-based:* `GET /users?cursor=xyz123&limit=20` (Faster, highly recommended for massive tables).

**Filtering:** Pass fields as query parameters.
*   `GET /users?role=admin&status=active`

**Sorting:** Specify fields and direction.
*   `GET /users?sort=-createdAt` (Negative sign denotes descending).

**Search:** Provide a dedicated query parameter for full-text search.
*   `GET /users?q=john`

> **Interview Tip:** When building an API, always return standard structural envelopes. E.g., `{ "status": "success", "data": {...}, "meta": { "pagination": ... } }`. This makes frontend consumption much easier.
