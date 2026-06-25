# Auth, Security, & Databases

## Authentication & Authorization

*   **Authentication (AuthN):** Verifying *who* a user is (e.g., login).
*   **Authorization (AuthZ):** Verifying *what* a user is allowed to do (e.g., RBAC).

### Session-based Authentication (Stateful)
1.  Client logs in with credentials.
2.  Server verifies, creates a session in DB/Redis, and generates a Session ID.
3.  Server sends Session ID back in a `Set-Cookie` header.
4.  Client sends the cookie on subsequent requests. Server looks up the Session ID.
*   **Pros:** Easy to revoke access (just delete the session from DB).
*   **Cons:** Harder to scale horizontally (requires central session store like Redis).

### Token-based Authentication (Stateless - JWT)
JSON Web Tokens (JWT) consist of three parts: `Header.Payload.Signature`.
1.  Client logs in.
2.  Server verifies, creates a JWT (signing it with a secret key), and returns it.
3.  Client stores it (ideally in an HttpOnly cookie or Memory) and sends it in the `Authorization: Bearer <token>` header.
4.  Server verifies the signature (no DB lookup needed).
*   **Pros:** Stateless, highly scalable, good for microservices.
*   **Cons:** Hard to revoke immediately (requires token blacklists or short lifespans).

**Refresh Token Flow:**
Because JWTs cannot easily be revoked, they should have a short lifespan (e.g., 15 mins). A long-lived *Refresh Token* is also issued. When the short-lived JWT expires, the client uses the Refresh Token to securely get a new JWT from an `/auth/refresh` endpoint.

### Authorization Systems
*   **RBAC (Role-Based Access Control):** Users are assigned roles (Admin, Editor). Roles are assigned permissions. (e.g., `if (user.role === 'Admin') allow()`).
*   **ABAC (Attribute-Based Access Control):** Finer-grained. Access is based on attributes (e.g., User can edit a post *only if* `post.authorId === user.id`).

---

## Security

Securing Node.js applications requires defense-in-depth across the entire stack.

### Common Vulnerabilities & Mitigations

1.  **Injection (SQL / NoSQL Injection):**
    *   *Flaw:* Untrusted user input is concatenated directly into database queries.
    *   *Mitigation:* Use Parameterized Queries (Prepared Statements) in SQL, or ODMs/ORMs (like Prisma/Mongoose) which escape inputs automatically. Avoid `$where` in MongoDB.
2.  **XSS (Cross-Site Scripting):**
    *   *Flaw:* Attacker injects malicious JavaScript into the app, which executes in other users' browsers.
    *   *Mitigation:* Sanitize inputs. Use modern frontend frameworks (React/Vue) which auto-escape. Set `Content-Security-Policy` (CSP) headers using `helmet`.
3.  **CSRF (Cross-Site Request Forgery):**
    *   *Flaw:* Attacker tricks an authenticated user into executing unwanted actions (e.g., bank transfer via an image tag on a malicious site).
    *   *Mitigation:* Use Anti-CSRF tokens. Alternatively, use `SameSite: Strict` or `Lax` flags on your cookies.
4.  **SSRF (Server-Side Request Forgery):**
    *   *Flaw:* Attacker forces the server to make requests to internal/external systems on their behalf (e.g., querying AWS metadata endpoint).
    *   *Mitigation:* Strictly validate and sanitize URLs. Use an allowlist. Disable following redirects if possible.
5.  **Clickjacking:**
    *   *Flaw:* Attacker loads your site in a transparent `<iframe>` to trick users into clicking buttons.
    *   *Mitigation:* Set `X-Frame-Options: DENY` header (handled via `helmet`).
6.  **Brute Force & DoS:**
    *   *Flaw:* Attacker floods endpoints (like `/login`) with requests to guess passwords or crash the server.
    *   *Mitigation:* Rate Limiting (using `express-rate-limit` + Redis). IP blacklisting.

> **Interview Tip:** Always mention **Helmet.js** when discussing Express security. It's a middleware that automatically sets 15+ secure HTTP headers.

---

## Database Fundamentals

### ACID Properties (Relational Databases)
Relational databases (SQL) guarantee data integrity through ACID:
*   **Atomicity:** All-or-nothing. A transaction either fully completes or fully rolls back.
*   **Consistency:** Data must meet all validation rules/constraints before and after a transaction.
*   **Isolation:** Concurrent transactions execute as if they were running sequentially.
*   **Durability:** Once committed, data remains saved even in the event of a system crash.

### Transactions
A unit of work performed against a database. Used when multiple operations must succeed together (e.g., transferring money: deduct from A, add to B).
```javascript
// Example logic
try {
  await db.query('BEGIN');
  await db.query('UPDATE accounts SET bal = bal - 100 WHERE id = 1');
  await db.query('UPDATE accounts SET bal = bal + 100 WHERE id = 2');
  await db.query('COMMIT');
} catch (e) {
  await db.query('ROLLBACK');
}
```

### Normalization vs Denormalization

**Normalization (SQL):** Organizing data to reduce redundancy and improve data integrity.
*   *Pros:* No data duplication, smaller storage size.
*   *Cons:* Requires complex, slow `JOIN` operations to reconstruct data.
*   *Use case:* Heavy write systems, financial systems.

**Denormalization (NoSQL):** Storing redundant data (embedding) to improve read performance.
*   *Pros:* Extremely fast reads (no joins).
*   *Cons:* Updating data is harder (must update in multiple places), larger storage size.
*   *Use case:* Heavy read systems, content management.
