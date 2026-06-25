# Backend & HTTP Fundamentals

## Backend Fundamentals

The backend (server-side) refers to the hidden workings of a web application. It handles business logic, database interactions, user authentication, and serving data to the frontend (client-side).

### Client-Server Architecture
*   **Client:** The entity (browser, mobile app, IoT device) making a request.
*   **Server:** The centralized computer providing resources, data, or services.
*   **Request/Response Lifecycle:**
    1. Client resolves the domain to an IP address via DNS.
    2. Client establishes a TCP/IP connection (and TLS handshake for HTTPS).
    3. Client sends an HTTP Request.
    4. Server processes the request (routing, middleware, database query).
    5. Server sends back an HTTP Response.
    6. Connection is closed or kept alive.

### HTTP vs HTTPS
*   **HTTP (Hypertext Transfer Protocol):** Data is transmitted in plaintext. Vulnerable to Man-in-the-Middle (MITM) attacks. Port 80.
*   **HTTPS (HTTP Secure):** Data is encrypted using TLS (Transport Layer Security). Ensures confidentiality, integrity, and authentication. Port 443.

### Stateless vs Stateful Systems
*   **Stateless:** Every request from the client must contain all the information necessary to understand the request. The server does not store client context between requests (e.g., REST, JWT authentication). Excellent for scalability.
*   **Stateful:** The server stores information about the client's session (e.g., in-memory sessions). Requires sticky sessions or a centralized cache (like Redis) to scale horizontally.

### REST Architecture & API Design Principles
REST (Representational State Transfer) is an architectural style for designing networked applications.
1.  **Client-Server:** Decoupling of user interface and data storage.
2.  **Stateless:** No client context stored on the server between requests.
3.  **Cacheable:** Responses must implicitly or explicitly define themselves as cacheable or not.
4.  **Uniform Interface:** Resources are identified via URIs. Manipulation occurs through representations (JSON/XML).
5.  **Layered System:** The client cannot usually tell whether it is connected directly to the end server or an intermediary.

---

## HTTP Deep Dive

### HTTP Methods

*   `GET`: Retrieve a resource. (Safe, Idempotent)
*   `POST`: Create a new resource. (Not safe, Not idempotent)
*   `PUT`: Replace an existing resource entirely. (Not safe, Idempotent)
*   `PATCH`: Partially modify an existing resource. (Not safe, Not strictly idempotent)
*   `DELETE`: Delete a resource. (Not safe, Idempotent)
*   `OPTIONS`: Describe communication options for the target resource (used heavily in CORS preflight requests).
*   `HEAD`: Identical to GET, but without the response body (useful for checking headers/content-length).

> **Interview Tip:** "Idempotent" means that making multiple identical requests has the same effect on the server state as making a single request.

### Status Codes Quick Revision

| Range | Category | Common Codes |
| :--- | :--- | :--- |
| **1xx** | Informational | `100 Continue`, `101 Switching Protocols` |
| **2xx** | Success | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | Redirection | `301 Moved Permanently`, `302 Found`, `304 Not Modified` |
| **4xx** | Client Error | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests` |
| **5xx** | Server Error | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout` |

### Critical HTTP Headers

*   **Authorization:** Contains credentials to authenticate a user (e.g., `Bearer <token>`).
*   **Content-Type:** Indicates the media type of the resource being sent (e.g., `application/json`, `multipart/form-data`).
*   **Accept:** Tells the server what media types the client can understand.
*   **Cache-Control:** Directives for caching mechanisms in both requests and responses (e.g., `no-cache`, `max-age=3600`).
*   **Cookie:** Contains stored HTTP cookies previously sent by the server with the `Set-Cookie` header.
*   **CORS Headers:**
    *   `Access-Control-Allow-Origin`: Indicates whether the response can be shared.
    *   `Access-Control-Allow-Methods`: Specifies the method or methods allowed.
    *   `Access-Control-Allow-Headers`: Used in response to a preflight request to indicate which HTTP headers can be used.
