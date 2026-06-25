# Node.js Core & Asynchronous Programming

## Node.js Fundamentals

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It is designed to build scalable network applications.

### Architecture
*   **V8 Engine:** Google's open-source high-performance JavaScript and WebAssembly engine, written in C++. It compiles JS directly to native machine code.
*   **libuv:** A multi-platform C library that provides support for asynchronous I/O based on event loops. It manages the thread pool (default 4 threads) used for heavy tasks (file system, crypto, DNS lookups).
*   **Single-threaded:** Node.js runs JavaScript on a single thread. It does not spawn a new thread for every request (unlike Apache or Spring Boot).
*   **Non-blocking I/O:** When a request involves an I/O operation (reading a database, network call), the main thread delegates it to libuv and continues executing other JS code. When the I/O finishes, a callback is pushed to the Event Loop.

### Core Modules
*   `fs` (File System): Used to read/write files (provides both synchronous and asynchronous methods).
*   `path`: Utilities for working with file and directory paths safely across OS types.
*   `os`: Provides operating system-related utility methods and properties.
*   `crypto`: Provides cryptographic functionality (hashes, HMAC, ciphers).
*   `events`: The core `EventEmitter` class. Much of Node's core API is built around an idiomatic asynchronous event-driven architecture.
*   `stream`: An abstract interface for working with streaming data.
*   `buffer`: Used to handle binary data (chunks of memory) directly.

---

## Event Loop Deep Dive

The Event Loop is what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.

### How it works:
1.  **Call Stack:** Executes synchronous JavaScript code. If an async task is encountered, it's handed off to the C++ APIs (libuv).
2.  **Event Loop:** Continuously checks if the Call Stack is empty. If it is, it looks at the queues and pushes callbacks onto the Call Stack.

### The Queues (in order of priority):
1.  **Microtask Queue:**
    *   `process.nextTick()` queue (Highest priority).
    *   Promise queue (`.then()`, `.catch()`).
2.  **Timers Queue:** Callbacks from `setTimeout()` and `setInterval()`.
3.  **I/O Queue:** Callbacks from mostly all I/O operations (network, file system).
4.  **Check Queue:** Callbacks from `setImmediate()`.
5.  **Close Queue:** Callbacks from closed connections (e.g., `socket.on('close')`).

### Execution Order Example:
```javascript
console.log('1. Sync code');

setTimeout(() => console.log('5. setTimeout'), 0);
setImmediate(() => console.log('6. setImmediate'));

Promise.resolve().then(() => console.log('4. Promise'));

process.nextTick(() => console.log('3. process.nextTick'));

console.log('2. Sync code');

// Output:
// 1. Sync code
// 2. Sync code
// 3. process.nextTick
// 4. Promise
// 5. setTimeout  (Note: depending on system timing, 5 and 6 can sometimes swap)
// 6. setImmediate 
```

> **Interview Tip:** `process.nextTick()` always runs before Promises. Timers run before `setImmediate()` *unless* they are called within an I/O cycle (like reading a file), in which case `setImmediate()` always runs first.

---

## Modules

### CommonJS (CJS)
*   The original module system for Node.js.
*   Uses `require()` and `module.exports`.
*   **Synchronous loading:** Files are loaded and executed synchronously.
```javascript
// math.js
module.exports.add = (a, b) => a + b;

// app.js
const { add } = require('./math');
```

### ES Modules (ESM)
*   The official ECMAScript standard for modules.
*   Uses `import` and `export`.
*   **Asynchronous loading:** Can be statically analyzed, allowing for tree-shaking.
*   Enabled in Node by setting `"type": "module"` in `package.json` or using `.mjs` extensions.
```javascript
// math.js
export const add = (a, b) => a + b;

// app.js
import { add } from './math.js';
```

### Dynamic Imports
Allows loading modules asynchronously on demand. Works in both CJS and ESM.
```javascript
async function loadMath() {
  const { add } = await import('./math.js');
  console.log(add(1, 2));
}
```

---

## Asynchronous Programming

### 1. Callbacks
Functions passed as arguments to be executed later.
*   **Pitfall:** "Callback Hell" (Pyramid of Doom) - deeply nested callbacks that are hard to read and maintain.

### 2. Promises
An object representing the eventual completion (or failure) of an asynchronous operation. States: Pending, Fulfilled, Rejected.
```javascript
fs.promises.readFile('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### 3. async/await
Syntactic sugar on top of Promises, making async code look synchronous.
```javascript
async function readMyFile() {
  try {
    const data = await fs.promises.readFile('file.txt');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

### Promise Concurrency APIs

| API | Behavior | Use Case |
| :--- | :--- | :--- |
| `Promise.all([p1, p2])` | Fails fast. Resolves when all resolve. Rejects if *any* reject. | Fetching multiple dependent resources. |
| `Promise.allSettled([p1, p2])` | Never fails fast. Resolves when all are settled (resolved or rejected). Returns array of status/value objects. | Executing independent tasks where failure of one shouldn't block others. |
| `Promise.race([p1, p2])` | Resolves or rejects as soon as the *first* promise settles. | Timeout patterns (race a fetch against a timeout promise). |
| `Promise.any([p1, p2])` | Resolves as soon as the *first* promise resolves. Rejects only if *all* reject. | Hitting multiple redundant APIs and taking the fastest successful response. |
