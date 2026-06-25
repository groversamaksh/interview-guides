# Backend Development with Node.js Cheat Sheet & Interview Revision Guide

## Backend Fundamentals

### What Happens When a Client Sends a Request?

1. **Client Initiates**: Browser sends HTTP request (e.g., `GET /users`) to server.
2. **Server Receives**: Node.js (with Express) parses request headers, method, and body.
3. **Middleware Processing**: Custom middleware (e.g., authentication) runs sequentially.
4. **Route Handling**: Express routes (`/users`) map to controller functions.
5. **Response Generation**: Controller fetches data (e.g., from PostgreSQL), formats response, and sends back HTTP status + body.

### Client-Server Architecture

- **Client**: Generates requests (e.g., browser, mobile app). Stateless (no persistent state).
- **Server**: Processes requests, stores data, and returns responses. Stateful (maintains session data).

### Request/Response Lifecycle

```mermaid
flowchart TD
    A[Client Sends Request] --> B[Server Receives]
    B --> C[Parse Headers/Body]
    C --> D[Middleware Execution]
    D --> E[Route Matching]
    E --> F[Controller Logic (DB Query)]
    F --> G[Response Formatting]
    G --> H[Send Response to Client]
```

### HTTP vs HTTPS

| Feature  | HTTP (Plain)                     | HTTPS (Secure)                          |
| -------- | -------------------------------- | --------------------------------------- |
| Protocol | Unencrypted                      | TLS/SSL encrypted                       |
| Port     | 80                               | 443                                     |
| Use Case | Internal API, non-sensitive data | User authentication, payment processing |

### Stateless vs Stateful Systems

- **Stateless**: Each request contains all context (e.g., JWT in headers). No server-side session data.
- **Stateful**: Server maintains persistent state (e.g., user sessions in Redis). More complex to scale.

### REST Architecture

- **REST (Representational State Transfer)**: A set of architectural principles for designing networked applications. Key constraints:
  - **Uniform Interface**: Simplifies client interactions (standard HTTP methods).
  - **Resource-Based**: Resources are identified by URIs (e.g., `/users/123`).
  - **Stateless**: Each request contains all context.
  - **Cacheable**: Responses can be cached to improve performance.

### API Design Principles

- **Consistency**: Use uniform naming, structure, and behavior across APIs.
- **Clarity & Simplicity**: Keep endpoints intuitive (e.g., `/orders` for order management).
- **Versioning**: Manage API changes through versioning (e.g., `/v1/users` vs. `/users`).
- **Documentation**: Provide clear documentation (e.g., OpenAPI/Swagger) for developers.
- **Security**: Enforce authentication, authorization, and input validation to prevent vulnerabilities.

## HTTP Deep Dive

### HTTP Methods

| Method    | Description                                                  | Example Usage |
| --------- | ------------------------------------------------------------ | ------------- |
| `GET`     | Retrieve a resource (idempotent, safe).                      | `/users/123`  |
| `POST`    | Create a new resource (idempotent, safe).                    | `/users`      |
| `PUT`     | Update an existing resource (idempotent, safe).              | `/users/123`  |
| `PATCH`   | Partially update an existing resource (idempotent, safe).    | `/users/123`  |
| `DELETE`  | Delete a resource (idempotent, safe).                        | `/users/123`  |
| `OPTIONS` | Describe the communication options for the target resource.  | `/users`      |
| `HEAD`    | Retrieve metadata (headers) for a resource without the body. | `/users/123`  |

### Status Codes

| Class | Range   | Description                                                                  |
| ----- | ------- | ---------------------------------------------------------------------------- |
| 1xx   | 100-199 | Informational responses (e.g., 101 - Switching Protocols)                    |
| 2xx   | 200-299 | Successful operations (e.g., 200 - OK, 201 - Created)                        |
| 3xx   | 300-399 | Redirection (e.g., 301 - Moved Permanently, 302 - Found)                     |
| 4xx   | 400-499 | Client errors (e.g., 401 - Unauthorized, 403 - Forbidden, 400 - Bad Request) |
| 5xx   | 500-599 | Server errors (e.g., 500 - Internal Server Error, 503 - Service Unavailable) |

### Headers

| Header          | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `Authorization` | Bearer tokens, API keys for authentication.                           |
| `Content-Type`  | Specifies media type (e.g., `application/json`).                      |
| `Accept`        | Client’s acceptable response formats (e.g., `text/html`).             |
| `Cache-Control` | Directives for caching behavior (e.g., `no-cache`).                   |
| `Cookies`       | HTTP cookies sent by the client (e.g., session tokens).               |
| CORS Headers    | Origin, Access-Control-Allow-Methods, etc. for cross-origin requests. |

## Node.js Fundamentals

### Runtime

- **V8 Engine**: Google’s open-source JavaScript engine (part of Chrome) that compiles JavaScript to machine code for fast execution.
- **Node.js Architecture**:
  - **Event Loop**: A single-threaded event loop that handles asynchronous I/O operations (e.g., network requests, file system access).
  - **Single-threaded Model**: Node.js runs in a single thread (via the event loop), making it lightweight and efficient for I/O-bound tasks.
  - **Non-blocking I/O**: Node.js uses non-blocking I/O operations (e.g., `fs.readFile`, `http.request`) to avoid blocking the main thread. This enables high concurrency and performance.

### Core Modules

- **fs (File System)**: Provides an API for interacting with the file system in a non-blocking manner. Key functions include `fs.readFile`, `fs.writeFile`, and directory operations (`fs.readdir`).
- **path (Path)**: Helps work with file system paths in a cross-platform way. Key functions include `path.join`, `path.basename`, and path normalization.
- **os (Operating System)**: Provides information about the underlying operating system. Key functions include `os.platform`, `os.cpus` (for CPU information), and `os.freemem` (for memory usage).
- **crypto (Cryptography)**: Provides a set of cryptographic algorithms for generating hashes, encrypting/decrypting data, and verifying signatures. Key functions include `crypto.createHash`, `crypto.scrypt`, and `crypto.sign`.
- **events (Event System)**: Provides a simple event-driven programming model. Key functions include `EventEmitter` class (for emitting and listening to events), and event registration/destruction methods.
- **stream (Streams)**: Provides a set of classes for working with streams in Node.js. Key classes include `Readable` (for reading data from a source), `Writable` (for writing data to a destination), and `Duplex`/`Transform` streams for bidirectional or transformed data flow.
- **buffer (Buffers)**: Provides a way to work with binary data in Node.js. Buffers are used for operations that require raw bytes (e.g., file I/O, network communication). Key functions include `Buffer.from`, `Buffer.concat`, and buffer manipulation methods (e.g., `buffer.write`).

## Event Loop Deep Dive

### Core Concepts

- **Call Stack**: A stack data structure that stores function calls in the order they are executed. The call stack follows the Last-In-First-Out (LIFO) principle.
  - Example: When `functionA()` calls `functionB()`, `functionB` is pushed onto the call stack, and when `functionB` completes, it’s popped from the stack.
- **Event Loop**: A mechanism in Node.js (and other event-driven environments) that manages asynchronous operations. The event loop continuously checks for pending tasks in the following queues:
  - **Timers Queue**: Contains timers (e.g., `setTimeout`, `setInterval`) that are scheduled to execute at a later time.
  - **I/O Queue**: Contains I/O operations (e.g., network requests, file system access) that are pending and waiting to be processed.
  - **Microtask Queue**: Contains microtasks (e.g., `Promise.then`, `process.nextTick`) that have higher priority than tasks in the main event loop.
- **Timers Queue**: As mentioned, it contains timers (e.g., `setTimeout`, `setInterval`) that are scheduled to execute at a later time. The event loop checks this queue first, but timers may be skipped if the previous phase (e.g., I/O) takes longer than the timer delay.
- **I/O Queue**: This queue holds pending I/O operations (e.g., network requests, file system reads/writes) that are waiting to be processed. The event loop processes these operations in a non-blocking manner, allowing other tasks (e.g., timers, microtasks) to be executed concurrently.
- **Microtask Queue**: This queue contains microtasks (e.g., `Promise.then`, `process.nextTick`) that have higher priority than tasks in the main event loop. The event loop processes microtasks immediately after completing a phase (e.g., I/O), ensuring that they are executed before any new tasks are added to the event loop.
- **process.nextTick()**: A function in Node.js that schedules a callback to be executed **immediately after the current event loop phase**. `process.nextTick` is useful for deferring tasks that need to be executed before the next event loop iteration (e.g., cleanup operations, error handling).
- **setTimeout()**: A function in Node.js that schedules a callback to be executed after a specified delay (in milliseconds). The syntax is `setTimeout(callback, delay)`, where `callback` is the function to execute after the delay, and `delay` is the time in milliseconds.
  - Example:
    ```javascript
    setTimeout(() => {
      console.log("This will run after 2 seconds");
    }, 2000); // Executes after 2 seconds
    ```
- **setImmediate()**: A function in Node.js that schedules a callback to be executed **after the current event loop phase but before any new timers are scheduled**. The syntax is `setImmediate(callback)`, where `callback` is the function to execute.
  - Example:
    ```javascript
    setImmediate(() => {
      console.log("This will run after the current event loop phase");
    });
    ```
- **Execution Order Examples**
  - When a `setTimeout` is called, it schedules the callback to be executed after the specified delay. However, if there are other tasks in the event loop (e.g., I/O operations), the `setTimeout` callback may be executed after those tasks are completed.
  - Example:

    ```javascript
    console.log("Start");

    setTimeout(() => {
      console.log("Timeout (2 seconds later)");
    }, 2000);

    setImmediate(() => {
      console.log("SetImmediate");
    });

    // Simulate some work
    for (let i = 0; i < 5e8; i++) {} // This takes a long time

    console.log("End");
    ```

  - Expected Output:
    ```
    Start
    End
    SetImmediate
    Timeout (2 seconds later)
    ```
  - Explanation:
    - The `console.log('Start')` and subsequent lines are executed first.
    - Then, the loop `for (let i = 0; i < 5e8; i++) {}` takes a long time (simulating heavy work), and during this time, the event loop processes other tasks.
    - After the long loop finishes, `console.log('End')` is executed.
    - Then, `setImmediate()` is called, and its callback (`console.log('SetImmediate')`) is executed.
    - Finally, the `setTimeout` callback (`console.log('Timeout (2 seconds later)')`) is executed after 2 seconds.
    - Note: In Node.js, `setTimeout` and other timers are scheduled to execute after the specified delay. However, if there are other tasks in the event loop (e.g., I/O operations), the `setTimeout` callback may be executed after those tasks are completed. In this example, since we simulated heavy work with the loop, the `setTimeout` callback was executed after the long loop finished and before the event loop processed other tasks (like `setImmediate`). However, in Node.js, `setTimeout` and other timers are scheduled to execute after the specified delay. The event loop processes tasks in a specific order:

1. Execute any pending `process.nextTick` callbacks (if any).
2. Execute the next set of timers in the `Timers Queue`.
3. Execute any pending I/O operations (e.g., network requests, file system reads/writes) in the `I/O Queue`.
4. Execute any pending microtasks (e.g., `Promise.then`, `process.nextTick`) in the `Microtask Queue`.
5. Repeat steps 2-4 until all timers, I/O operations, and microtasks are completed.
6. If there are no more tasks to process (e.g., all timers, I/O operations, and microtasks have been completed), the event loop will exit (unless there are still timers scheduled to execute in the future).

- In summary, Node.js’s event loop processes tasks in a specific order (timers → I/O → microtasks), and the `setTimeout` function schedules callbacks to be executed after a specified delay. However, in Node.js, timers are scheduled to execute after the specified delay, and the event loop processes tasks in a specific order (timers → I/O → microtasks). Therefore, the `setTimeout` callback may be executed after other tasks (e.g., I/O operations) are completed, depending on the event loop’s processing order.
  <|begin_of_box|># Backend Development with Node.js Cheat Sheet & Interview Revision Guide

## Backend Fundamentals

### What Happens When a Client Sends a Request?

1. **Client Initiates**: Browser sends HTTP request (e.g., `GET /users`) to server.
2. **Server Receives**: Node.js (with Express) parses request headers, method, and body.
3. **Middleware Processing**: Custom middleware (e.g., authentication) runs sequentially.
4. **Route Handling**: Express routes (`/users`) map to controller functions.
5. **Response Generation**: Controller fetches data (e.g., from PostgreSQL), formats response, and sends back HTTP status + body.

### Client-Server Architecture

- **Client**: Generates requests (e.g., browser, mobile app). Stateless (no persistent state).
- **Server**: Processes requests, stores data, and returns responses. Stateful (maintains session data).

### Request/Response Lifecycle

```mermaid
flowchart TD
    A[Client Sends Request] --> B[Server Receives]
    B --> C[Parse Headers/Body]
    C --> D[Middleware Execution]
    D --> E[Route Matching]
    E --> F[Controller Logic (DB Query)]
    F --> G[Response Formatting]
    G --> H[Send Response to Client]
```

### HTTP vs HTTPS

| Feature  | HTTP (Plain)                     | HTTPS (Secure)                          |
| -------- | -------------------------------- | --------------------------------------- |
| Protocol | Unencrypted                      | TLS/SSL encrypted                       |
| Port     | 80                               | 443                                     |
| Use Case | Internal API, non-sensitive data | User authentication, payment processing |

### Stateless vs Stateful Systems

- **Stateless**: Each request contains all context (e.g., JWT in headers). No server-side session data.
- **Stateful**: Server maintains persistent state (e.g., user sessions in Redis). More complex to scale.

### REST Architecture

- **REST (Representational State Transfer)**: A set of architectural principles for designing networked applications. Key constraints:
  - **Uniform Interface**: Simplifies client interactions (standard HTTP methods).
  - **Resource-Based**: Resources are identified by URIs (e.g., `/users/123`).
  - **Stateless**: Each request contains all context.
  - **Cacheable**: Responses can be cached to improve performance.

### API Design Principles

- **Consistency**: Use uniform naming, structure, and behavior across APIs.
- **Clarity & Simplicity**: Keep endpoints intuitive (e.g., `/orders` for order management).
- **Versioning**: Manage API changes through versioning (e.g., `/v1/users` vs. `/users`).
- **Documentation**: Provide clear documentation (e.g., OpenAPI/Swagger) for developers.
- **Security**: Enforce authentication, authorization, and input validation to prevent vulnerabilities.

## HTTP Deep Dive

### HTTP Methods

| Method    | Description                                                  | Example Usage |
| --------- | ------------------------------------------------------------ | ------------- |
| `GET`     | Retrieve a resource (idempotent, safe).                      | `/users/123`  |
| `POST`    | Create a new resource (idempotent, safe).                    | `/users`      |
| `PUT`     | Update an existing resource (idempotent, safe).              | `/users/123`  |
| `PATCH`   | Partially update an existing resource (idempotent, safe).    | `/users/123`  |
| `DELETE`  | Delete a resource (idempotent, safe).                        | `/users/123`  |
| `OPTIONS` | Describe the communication options for the target resource.  | `/users`      |
| `HEAD`    | Retrieve metadata (headers) for a resource without the body. | `/users/123`  |

### Status Codes

| Class | Range   | Description                                                                  |
| ----- | ------- | ---------------------------------------------------------------------------- |
| 1xx   | 100-199 | Informational responses (e.g., 101 - Switching Protocols)                    |
| 2xx   | 200-299 | Successful operations (e.g., 200 - OK, 201 - Created)                        |
| 3xx   | 300-399 | Redirection (e.g., 301 - Moved Permanently, 302 - Found)                     |
| 4xx   | 400-499 | Client errors (e.g., 401 - Unauthorized, 403 - Forbidden, 400 - Bad Request) |
| 5xx   | 500-599 | Server errors (e.g., 500 - Internal Server Error, 503 - Service Unavailable) |

### Headers

| Header          | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `Authorization` | Bearer tokens, API keys for authentication.                           |
| `Content-Type`  | Specifies media type (e.g., `application/json`).                      |
| `Accept`        | Client’s acceptable response formats (e.g., `text/html`).             |
| `Cache-Control` | Directives for caching behavior (e.g., `no-cache`).                   |
| `Cookies`       | HTTP cookies sent by the client (e.g., session tokens).               |
| CORS Headers    | Origin, Access-Control-Allow-Methods, etc. for cross-origin requests. |

## Node.js Fundamentals

### Runtime

- **V8 Engine**: Google’s open-source JavaScript engine (part of Chrome) that compiles JavaScript to machine code for fast execution.
- **Node.js Architecture**:
  - **Event Loop**: A single-threaded event loop that handles asynchronous I/O operations (e.g., network requests, file system access).
  - **Single-threaded Model**: Node.js runs in a single thread (via the event loop), making it lightweight and efficient for I/O-bound tasks.
  - **Non-blocking I/O**: Node.js uses non-blocking I/O operations (e.g., `fs.readFile`, `http.request`) to avoid blocking the main thread. This enables high concurrency and performance.

### Core Modules

- **fs (File System)**: Provides an API for interacting with the file system in a non-blocking manner. Key functions include `fs.readFile`, `fs.writeFile`, and directory operations (`fs.readdir`).
- **path (Path)**: Helps work with file system paths in a cross-platform way. Key functions include `path.join`, `path.basename`, and path normalization.
- **os (Operating System)**: Provides information about the underlying operating system. Key functions include `os.platform`, `os.cpus` (for CPU information), and `os.freemem` (for memory usage).
- **crypto (Cryptography)**: Provides a set of cryptographic algorithms for generating hashes, encrypting/decrypting data, and verifying signatures. Key functions include `crypto.createHash`, `crypto.scrypt`, and `crypto.sign`.
- **events (Event System)**: Provides a simple event-driven programming model. Key functions include `EventEmitter` class (for emitting and listening to events), and event registration/destruction methods.
- **stream (Streams)**: Provides a set of classes for working with streams in Node.js. Key classes include `Readable` (for reading data from a source), `Writable` (for writing data to a destination), and `Duplex`/`Transform` streams for bidirectional or transformed data flow.
- **buffer (Buffers)**: Provides a way to work with binary data in Node.js. Buffers are used for operations that require raw bytes (e.g., file I/O, network communication). Key functions include `Buffer.from`, `Buffer.concat`, and buffer manipulation methods (e.g., `buffer.write`).

## Event Loop Deep Dive

### Core Concepts

- **Call Stack**: A stack data structure that stores function calls in the order they are executed. The call stack follows the Last-In-First-Out (LIFO) principle.
  - Example: When `functionA()` calls `functionB()`, `functionB` is pushed onto the call stack, and when `functionB` completes, it’s popped from the stack.
- **Event Loop**: A mechanism in Node.js (and other event-driven environments) that manages asynchronous operations. The event loop continuously checks for pending tasks in the following queues:
  - **Timers Queue**: Contains timers (e.g., `setTimeout`, `setInterval`) that are scheduled to execute at a later time.
  - **I/O Queue**: Contains I/O operations (e.g., network requests, file system access) that are pending and waiting to be processed.
  - **Microtask Queue**: Contains microtasks (e.g., `Promise.then`, `process.nextTick`) that have higher priority than tasks in the main event loop.
- **Timers Queue**: As mentioned, it contains timers (e.g., `setTimeout`, `setInterval`) that are scheduled to execute at a later time. The event loop checks this queue first, but timers may be skipped if the previous phase (e.g., I/O) takes longer than the timer delay.
- **I/O Queue**: This queue holds pending I/O operations (e.g., network requests, file system reads/writes) that are waiting to be processed. The event loop processes these operations in a non-blocking manner, allowing other tasks (e.g., timers, microtasks) to be executed concurrently.
- **Microtask Queue**: This queue contains microtasks (e.g., `Promise.then`, `process.nextTick`) that have higher priority than tasks in the main event loop. The event loop processes microtasks immediately after completing a phase (e.g., I/O), ensuring that they are executed before any new tasks are added to the event loop.
- **process.nextTick()**: A function in Node.js that schedules a callback to be executed **immediately after the current event loop phase**. `process.nextTick` is useful for deferring tasks that need to be executed before the next event loop iteration (e.g., cleanup operations, error handling).
- **setTimeout()**: A function in Node.js that schedules a callback to be executed after a specified delay (in milliseconds). The syntax is `setTimeout(callback, delay)`, where `callback` is the function to execute after the delay, and `delay` is the time in milliseconds.
  - Example:
    ```javascript
    setTimeout(() => {
      console.log("This will run after 2 seconds");
    }, 2000); // Executes after 2 seconds
    ```
- **setImmediate()**: A function in Node.js that schedules a callback to be executed **after the current event loop phase but before any new timers are scheduled**. The syntax is `setImmediate(callback)`, where `callback` is the function to execute.
  - Example:
    ```javascript
    setImmediate(() => {
      console.log("This will run after the current event loop phase");
    });
    ```
- **Execution Order Examples**
  - When a `setTimeout` is called, it schedules the callback to be executed after the specified delay. However, if there are other tasks in the event loop (e.g., I/O operations), the `setTimeout` callback may be executed after those tasks are completed.
  - Example:

    ```javascript
    console.log("Start");

    setTimeout(() => {
      console.log("Timeout (2 seconds later)");
    }, 2000);

    setImmediate(() => {
      console.log("SetImmediate");
    });

    // Simulate some work
    for (let i = 0; i < 5e8; i++) {} // This takes a long time

    console.log("End");
    ```

  - Expected Output:
    ```
    Start
    End
    SetImmediate
    Timeout (2 seconds later)
    ```
  - Explanation:
    - The `console.log('Start')` and subsequent lines are executed first.
    - Then, the loop `for (let i = 0; i < 5e8; i++) {}` takes a long time (simulating heavy work), and during this time, the event loop processes other tasks.
    - After the long loop finishes, `console.log('End')` is executed.
    - Then, `setImmediate()` is called, and its callback (`console.log('SetImmediate')`) is executed.
    - Finally, the `setTimeout` callback (`console.log('Timeout (2 seconds later)')`) is executed after 2 seconds.
    - Note: In Node.js, `setTimeout` and other timers are scheduled to execute after the specified delay. However, if there are other tasks in the event loop (e.g., I/O operations), the `setTimeout` callback may be executed after those tasks are completed. In this example, since we simulated heavy work with the loop, the `setTimeout` callback was executed after the long loop finished and before the event loop processed other tasks (like `setImmediate`). However, in Node.js, `setTimeout` and other timers are scheduled to execute after the specified delay. The event loop processes tasks in a specific order:

1. Execute any pending `process.nextTick` callbacks (if any).
2. Execute the next set of timers in the `Timers Queue`.
3. Execute any pending I/O operations (e.g., network requests, file system reads/writes) in the `I/O Queue`.
4. Execute any pending microtasks (e.g., `Promise.then`, `process.nextTick`) in the `Microtask Queue`.
5. Repeat steps 2-4 until all timers, I/O operations, and microtasks are completed.
6. If there are no more tasks to process (e.g., all timers, I/O operations, and microtasks have been completed), the event loop will exit (unless there are still timers scheduled to execute in the future).

- In summary, Node.js’s event loop processes tasks in a specific order (timers → I/O → microtasks), and the `setTimeout` function schedules callbacks to be executed after a specified delay. However, in Node.js, timers are scheduled to execute after the specified delay, and the event loop processes tasks in a specific order (timers → I/O → microtasks). Therefore, the `setTimeout` callback may be executed after other tasks (e.g., I/O operations) are completed, depending on the event loop’s processing order.<|end_of_box|>
