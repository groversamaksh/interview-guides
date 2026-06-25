# Backend Interview Questions & Coding Challenges

## 75 Backend Interview Questions

### Beginner (1-25)
1. **What is Node.js?** A JavaScript runtime built on Chrome's V8 engine allowing JS execution outside the browser.
2. **What is the Event Loop?** The mechanism that allows Node to perform non-blocking I/O operations by offloading tasks to the OS.
3. **Is Node.js single-threaded?** Yes, JavaScript executes on a single thread, but I/O operations are handled in a multi-threaded C++ thread pool (libuv).
4. **What is REPL?** Read Eval Print Loop. A virtual environment to run JS code in the terminal.
5. **What is npm?** Node Package Manager. Used to install and manage third-party libraries.
6. **What is a callback?** A function passed as an argument to another function, executed when an async operation completes.
7. **What is Callback Hell?** Deeply nested callbacks making code unreadable and hard to debug.
8. **How do Promises solve Callback Hell?** By chaining `.then()` blocks and handling errors centrally via `.catch()`.
9. **What is Express.js?** A minimalist web framework for Node.js routing and middleware.
10. **What is middleware?** Functions that have access to the request, response, and the `next` middleware function in the application's request-response cycle.
11. **What is `package.json`?** A manifest file that holds metadata about the project and its dependencies.
12. **Difference between `dependencies` and `devDependencies`?** `dependencies` are needed in production; `devDependencies` are only for local development/testing.
13. **What is `package-lock.json`?** Locks the exact versions of installed packages and their dependency trees.
14. **What is CORS?** Cross-Origin Resource Sharing. A security feature that restricts web pages from making requests to a different domain.
15. **What is the `fs` module?** The File System module used to read, write, and manipulate files.
16. **What is the difference between `fs.readFile` and `fs.readFileSync`?** The first is asynchronous (non-blocking), the second is synchronous (blocking).
17. **What are streams?** Objects that let you read data from a source or write data to a destination continuously.
18. **What is a Buffer?** A temporary memory spot for a chunk of data being transferred.
19. **What is HTTP?** Hypertext Transfer Protocol. The foundation of data communication on the Web.
20. **What is REST?** Representational State Transfer. An architectural style for designing APIs.
21. **What does status code 200 mean?** OK (Success).
22. **What does status code 404 mean?** Not Found.
23. **What does status code 500 mean?** Internal Server Error.
24. **Difference between PUT and PATCH?** PUT replaces the entire resource; PATCH updates it partially.
25. **What is a URL query string?** Key-value pairs appended to the URL after a `?` (e.g., `?limit=10`).

### Intermediate (26-50)
26. **Explain `process.nextTick()`.** It defers the execution of a function until the current operation completes, *before* the Event Loop continues to the next phase.
27. **Difference between `setImmediate()` and `setTimeout(..., 0)`?** Execution order depends on context. In an I/O cycle, `setImmediate` always executes first.
28. **What is the V8 engine?** Google's open-source C++ engine that compiles JS to machine code.
29. **What is libuv?** A multi-platform C library that provides asynchronous I/O and manages the Node.js thread pool.
30. **Explain `module.exports` vs `exports`.** `exports` is just a reference to `module.exports`. If you assign a new object to `exports`, it breaks the reference.
31. **What is the difference between CommonJS and ES Modules?** CJS uses `require()` (synchronous); ESM uses `import/export` (asynchronous, statically analyzable).
32. **How does error handling work in Express?** Using a 4-argument middleware function: `(err, req, res, next)`.
33. **Why shouldn't you block the Event Loop?** Because Node is single-threaded, blocking it freezes the entire application for all users.
34. **What is a memory leak in Node.js?** When objects are no longer needed but are still referenced by the root, preventing Garbage Collection.
35. **How do you find memory leaks?** Using Heap Snapshots in Chrome DevTools or Node's `--inspect` flag.
36. **What is JWT?** JSON Web Token. A stateless authentication standard.
37. **How does JWT work?** The server signs a payload using a secret. The client stores and sends the token. The server verifies the signature without a DB lookup.
38. **What is OAuth 2.0?** An authorization framework allowing third-party applications to obtain limited access to an HTTP service.
39. **What is SQL Injection?** An attack where malicious SQL statements are inserted into entry fields for execution.
40. **How do you prevent SQL Injection?** Using Parameterized Queries or Prepared Statements.
41. **What is XSS?** Cross-Site Scripting. Injecting malicious scripts into trusted websites.
42. **What is CSRF?** Cross-Site Request Forgery. Tricking a user into executing unwanted actions on a web app where they are authenticated.
43. **What is Rate Limiting?** Restricting the number of requests a user/IP can make in a given timeframe to prevent DoS attacks.
44. **What is Redis?** An in-memory key-value data store used primarily for caching.
45. **What is the Cache Aside pattern?** The application checks the cache first; if miss, it queries the DB and updates the cache.
46. **What is a Message Queue?** A form of asynchronous service-to-service communication used in serverless and microservices architectures.
47. **What is the difference between RabbitMQ and Kafka?** RabbitMQ is a traditional message broker (smart broker, dumb consumers). Kafka is an event streaming platform (dumb broker, smart consumers, replayable events).
48. **What is Cluster mode in Node.js?** Spawning multiple child processes (workers) that share the same server port to utilize multi-core CPUs.
49. **What are Worker Threads?** Threads that execute JS in parallel sharing memory, used for CPU-intensive tasks.
50. **What is a Reverse Proxy?** A server (like Nginx) that sits in front of web servers and forwards client requests to them.

### Advanced (51-75)
51. **Explain the phases of the Node.js Event Loop.** Timers -> Pending Callbacks -> Idle/Prepare -> Poll (I/O) -> Check (`setImmediate`) -> Close Callbacks.
52. **How does Garbage Collection work in V8?** It uses a generational hypothesis (New Space / Old Space) with Scavenger (minor GC) and Mark-Sweep-Compact (major GC) algorithms.
53. **What is the CAP Theorem?** In a distributed system, you can only guarantee two of Consistency, Availability, and Partition Tolerance.
54. **Difference between Microservices and Monolithic architectures?** Monoliths are single deployable units; Microservices are loosely coupled, independently deployable services.
55. **What is an API Gateway?** A single entry point for a microservices architecture handling routing, auth, and rate limiting.
56. **What is Service Discovery?** The process of automatically detecting devices and services on a network (used in microservices to find IP addresses dynamically).
57. **How do you handle distributed transactions?** Using patterns like the Saga Pattern (sequence of local transactions with compensating actions on failure).
58. **What is Idempotency in API design?** Ensuring that making the same request multiple times produces the same result as making it once.
59. **How do you scale WebSockets?** Using a Pub/Sub broker (like Redis) to broadcast messages across multiple WebSocket server instances.
60. **What is the difference between Long Polling, WebSockets, and Server-Sent Events (SSE)?** Long polling holds requests open; WebSockets provide bi-directional persistent connections; SSE is uni-directional (Server to Client).
61. **What is an Inverted Index?** The data structure used by search engines (like Elasticsearch) mapping content to its locations in a database.
62. **Explain Blue-Green Deployment.** Having two identical production environments. Deploy to idle (Green), test, then switch router traffic from Blue to Green.
63. **What is a Canary Release?** Deploying the new version to a small subset of users before rolling out completely.
64. **How do you gracefully shutdown a Node.js server?** Listen for `SIGINT`/`SIGTERM`, stop accepting new connections, wait for active requests to finish, close DB connections, then `process.exit()`.
65. **What is the Strangler Fig pattern?** A strategy for migrating a legacy monolith to microservices by gradually replacing specific functionalities with new services.
66. **What is consistent hashing?** A distributed hashing scheme that minimizes the number of keys remapped when a hash table is resized (crucial for distributed caches).
67. **How do you optimize a slow database query?** Check the execution plan (`EXPLAIN`), add indexes, avoid `SELECT *`, denormalize if read-heavy, or add a caching layer.
68. **What are the tradeoffs of JWTs?** They cannot be easily invalidated/revoked before expiration, and they increase payload size compared to session IDs.
69. **Explain the Event Sourcing pattern.** Storing state as a sequence of events (an append-only log) rather than just the current state.
70. **What is CQRS?** Command Query Responsibility Segregation. Separating read models (Queries) from write models (Commands).
71. **How do you prevent race conditions in Node.js?** While Node is single-threaded, race conditions occur during async DB calls. Prevent them using DB-level locks, transactions, or optimistic concurrency control (versioning).
72. **What is a Bloom Filter?** A probabilistic data structure used to test whether an element is a member of a set (can return false positives, but never false negatives). Very fast.
73. **How does TLS/SSL work?** Asymmetric cryptography (public/private keys) is used for the initial handshake to agree on a shared secret, which is then used for symmetric encryption of the payload.
74. **What is the Thundering Herd problem?** When a cache expires and thousands of requests simultaneously hit the database because the cache is empty. Mitigation: Cache lock/mutex or probabilistic early expiration.
75. **How do you monitor a Node.js application in production?** Using APM tools (Datadog, New Relic), logging (Winston + ELK stack), and metrics (Prometheus + Grafana).

---

## 50 Backend Coding Problems

*(Format: 1. Statement | 2. Solution | 3. Explanation | 4. Time Complexity | 5. Space Complexity)*

### API & Async Problems (1-20)
1. **Promisify setTimeout:** 
   - *Sol:* `const delay = ms => new Promise(res => setTimeout(res, ms));`
   - *Exp:* Wraps setTimeout in a Promise. *TC: O(1)*, *SC: O(1)*.
2. **Execute array of Promises sequentially:**
   - *Sol:* `for (const p of arr) await p();` or use `arr.reduce((p, fn) => p.then(fn), Promise.resolve());`
   - *Exp:* Prevents concurrent execution. *TC: O(N)*, *SC: O(1)*.
3. **Promise.all Implementation:**
   - *Sol:* Iterate array, resolve into new array, maintain a counter. If counter == length, resolve outer promise. Reject on first error.
   - *Exp:* Parallel execution. *TC: O(N)*, *SC: O(N)*.
4. **Retry API Call N times:**
   - *Sol:* `async function retry(fn, n) { for(let i=0; i<n; i++) { try { return await fn(); } catch(e) { if(i===n-1) throw e; } } }`
   - *Exp:* Loop and catch. *TC: O(N)*, *SC: O(1)*.
5. **Basic Express Server:**
   - *Sol:* `const app = express(); app.get('/', (req,res) => res.send('OK')); app.listen(3000);`
   - *Exp:* Hello World server. *TC: O(1)*.
6. **Express Error Handling Middleware:**
   - *Sol:* `app.use((err, req, res, next) => res.status(500).send(err.message));`
   - *Exp:* 4-argument function must be defined last.
7. **Parse Query String to Object:**
   - *Sol:* `Object.fromEntries(new URLSearchParams('?a=1&b=2'))`
   - *Exp:* Native Node/Web API. *TC: O(N)*, *SC: O(N)*.
8. **Rate Limiter (Token Bucket simplified):**
   - *Sol:* Map of IPs to timestamp array. Remove timestamps > 1 min old. If array length < limit, push Date.now() and allow.
   - *Exp:* Limits requests. *TC: O(K)* where K is limit, *SC: O(U*K)* where U is users.
9. **Basic JWT Issuer:**
   - *Sol:* `const token = jwt.sign({ id: 1 }, 'secret', { expiresIn: '1h' });`
   - *Exp:* Creates a token. Requires `jsonwebtoken` pkg.
10. **JWT Verify Middleware:**
    - *Sol:* Extract Bearer token, `jwt.verify(token, 'secret')`, attach decoded payload to `req.user`, call `next()`.
11. **Hash Password:**
    - *Sol:* `const hash = await bcrypt.hash('pass', 10);`
    - *Exp:* 10 is salt rounds. *TC: O(1)*, *SC: O(1)*.
12. **Compare Password:**
    - *Sol:* `const isValid = await bcrypt.compare('pass', hash);`
13. **Cache API response:**
    - *Sol:* Check Redis for `req.url`. If exists, send. If not, execute controller, save result to Redis with EX, then send.
14. **Pagination Logic:**
    - *Sol:* `const offset = (page - 1) * limit; db.query('... LIMIT ? OFFSET ?', [limit, offset]);`
15. **Generate UUID:**
    - *Sol:* `const crypto = require('crypto'); const id = crypto.randomUUID();`
16. **Create a Singleton Database Connection:**
    - *Sol:* Export the connection instance rather than a class, utilizing Node's module caching.
17. **Debounce Function:**
    - *Sol:* `let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }`
18. **Throttle Function:**
    - *Sol:* `let wait = false; return (...args) => { if(!wait) { fn(...args); wait = true; setTimeout(() => wait = false, ms); } }`
19. **Deep Clone JSON:**
    - *Sol:* `JSON.parse(JSON.stringify(obj))` or `structuredClone(obj)`.
20. **Find Duplicate Requests (Idempotency):**
    - *Sol:* Save `Idempotency-Key` header in DB/Redis. Reject if already processed.

### Streams & Files (21-35)
21. **Read large file without crashing:**
    - *Sol:* `fs.createReadStream('file.txt').on('data', chunk => console.log(chunk));`
22. **Pipe read stream to response:**
    - *Sol:* `fs.createReadStream('video.mp4').pipe(res);`
23. **Transform Stream to Uppercase:**
    - *Sol:* Extend `Transform`, override `_transform(chunk, enc, cb) { this.push(chunk.toString().toUpperCase()); cb(); }`.
24. **Write JSON to file:**
    - *Sol:* `await fs.promises.writeFile('data.json', JSON.stringify(data));`
25. **Read directory contents:**
    - *Sol:* `const files = await fs.promises.readdir('./path');`
26. **Check if file exists:**
    - *Sol:* `try { await fs.promises.access('file'); } catch { // doesnt exist }`
27. **Delete file:**
    - *Sol:* `await fs.promises.unlink('file.txt');`
28. **Stream file to AWS S3:**
    - *Sol:* Use `aws-sdk`, pass `fs.createReadStream` as the `Body` parameter in `upload()`.
29. **Handle Multipart Form Data:**
    - *Sol:* `const multer = require('multer'); app.post('/', multer().single('file'), ...)`
30. **Parse CSV file:**
    - *Sol:* Pipe read stream to `csv-parser` package stream.
31. **Download image from URL:**
    - *Sol:* `const res = await fetch(url); res.body.pipe(fs.createWriteStream('img.jpg'));`
32. **Base64 encode a string:**
    - *Sol:* `Buffer.from('hello').toString('base64');`
33. **Calculate File SHA256:**
    - *Sol:* Create read stream, pipe to `crypto.createHash('sha256')`.
34. **Gzip a file:**
    - *Sol:* `readStream.pipe(zlib.createGzip()).pipe(writeStream);`
35. **Unzip a file:**
    - *Sol:* `readStream.pipe(zlib.createGunzip()).pipe(writeStream);`

### Data Processing & Algorithms (36-50)
36. **Flatten Nested Array:**
    - *Sol:* `arr.flat(Infinity)`
37. **Group Array of Objects by Key:**
    - *Sol:* `arr.reduce((acc, obj) => { const k = obj[key]; acc[k] = acc[k] || []; acc[k].push(obj); return acc; }, {})`
    - *TC: O(N)*, *SC: O(N)*.
38. **Remove duplicates from array of objects:**
    - *Sol:* Use a Set to track seen IDs, or `arr.filter((v,i,a) => a.findIndex(t => t.id === v.id) === i)`.
39. **Find common elements in two arrays:**
    - *Sol:* `const set = new Set(arr1); return arr2.filter(x => set.has(x));`
40. **Sort objects by date:**
    - *Sol:* `arr.sort((a,b) => new Date(a.date) - new Date(b.date));`
41. **Implement LRU Cache (Least Recently Used):**
    - *Sol:* Use a `Map` (which maintains insertion order). On get/set, delete key and re-insert to move it to the end. If size > limit, delete `map.keys().next().value`.
    - *TC: O(1)*, *SC: O(K)*.
42. **Detect Cycle in Linked List:**
    - *Sol:* Fast and slow pointers (Floyd's Tortoise and Hare). *TC: O(N)*, *SC: O(1)*.
43. **Reverse Linked List:**
    - *Sol:* Iterate, keeping track of `prev`, `curr`, `next`. *TC: O(N)*, *SC: O(1)*.
44. **Two Sum:**
    - *Sol:* Map numbers to indices. Iterate, check if `target - curr` exists in Map. *TC: O(N)*, *SC: O(N)*.
45. **Valid Parentheses:**
    - *Sol:* Use a Stack. Push opening, pop on closing and check match. *TC: O(N)*, *SC: O(N)*.
46. **Merge Intervals:**
    - *Sol:* Sort by start time. Iterate and merge if current start <= previous end. *TC: O(N log N)*.
47. **Binary Search:**
    - *Sol:* `let l=0, r=arr.length-1; while(l<=r) { let m=Math.floor((l+r)/2); if(arr[m]===t) return m; else if(arr[m]<t) l=m+1; else r=m-1; }`
48. **Top K Frequent Elements:**
    - *Sol:* Frequency map, then sort or use Priority Queue.
49. **Longest Substring Without Repeating Characters:**
    - *Sol:* Sliding window with a Set. Expand window, if duplicate found, shrink from left. *TC: O(N)*.
50. **Implement Custom EventEmitter:**
    - *Sol:* Class with an `events` object mapping event names to arrays of callbacks. `on` pushes to array. `emit` iterates and calls them. *TC: O(N)* per emit.
