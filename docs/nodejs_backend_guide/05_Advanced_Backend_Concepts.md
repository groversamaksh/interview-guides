# Advanced Backend Concepts

## Caching & Redis

Caching stores copies of frequently accessed data in fast, temporary storage (RAM) to reduce database load and improve response times.

### Redis Basics
Redis is an in-memory, key-value data store. It is single-threaded but incredibly fast.
*   **Data Structures:** Strings, Hashes, Lists, Sets, Sorted Sets.
*   **Expiration (TTL):** Keys can be set to automatically expire (`EXPIRE key 3600`).
*   **Cache Invalidation:** The hardest problem in caching. Methods include TTL (Time to live), Event-based (delete cache when DB updates), and Versioning.

### Caching Strategies
1.  **Cache Aside (Lazy Loading):**
    *   App queries cache. If miss, app queries DB, writes to cache, returns to client.
    *   *Pros:* Cache only contains what is needed.
    *   *Cons:* Cache misses cause 3 network hops.
2.  **Write Through:**
    *   App writes to cache and DB simultaneously.
    *   *Pros:* Cache is always up-to-date. Read operations never miss.
    *   *Cons:* Write operations are slightly slower. Cache fills with unused data.
3.  **Write Back (Write Behind):**
    *   App writes only to cache. Cache asynchronously writes to DB later.
    *   *Pros:* Extremely fast writes.
    *   *Cons:* Risk of data loss if the cache crashes before syncing.

---

## Message Queues

Message queues enable asynchronous communication between microservices. They decouple the producer of a message from the consumer.

### Why use Queues?
*   **Decoupling:** Services don't need to know about each other.
*   **Scaling:** Handle traffic spikes without crashing (queues act as a buffer).
*   **Background Jobs:** Offloading heavy tasks (sending emails, video processing) from the main API thread.

### Event-Driven Architecture (Pub/Sub)
*   **Producer:** Sends an event to a topic/exchange.
*   **Consumer:** Subscribes to the topic and acts when an event arrives. Multiple consumers can react to the same event.

### Technologies
*   **RabbitMQ:** Traditional Message Broker. Smart broker, dumb consumers. Uses exchanges and routing keys. Good for complex routing logic.
*   **Apache Kafka:** Distributed Event Streaming Platform. Dumb broker (just an append-only log), smart consumers. Built for massive scale and event replayability.
*   **BullMQ:** Redis-based queue specifically for Node.js. Perfect for handling background jobs and delayed tasks within a Node ecosystem.

---

## Streams

Streams are Node's way of handling reading/writing data piece by piece (chunks) instead of loading a massive file into memory all at once.

### Types of Streams
1.  **Readable:** Abstraction for a source from which data is consumed (e.g., `fs.createReadStream()`, `req`).
2.  **Writable:** Abstraction for a destination to which data is written (e.g., `fs.createWriteStream()`, `res`).
3.  **Duplex:** Streams that are both Readable and Writable (e.g., TCP sockets).
4.  **Transform:** Duplex streams where the output is computed from the input (e.g., `zlib.createGzip()`).

### File Processing Example (Piping)
Using `pipeline` is safer than `.pipe()` because it automatically handles memory leaks if an error occurs.
```javascript
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

async function compressFile() {
  await pipeline(
    fs.createReadStream('large-file.csv'),
    zlib.createGzip(),
    fs.createWriteStream('large-file.csv.gz')
  );
  console.log('Compression complete');
}
```

---

## File Uploads

File uploads in Express require handling `multipart/form-data`.
*   **Multer:** The standard middleware for handling multipart data.
*   **Streaming Uploads:** For large files, do not buffer them into memory. Use Multer's memory storage cautiously, or pipe directly to cloud storage (e.g., AWS S3) using `multer-s3` or raw streams to avoid crashing the Node server.

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/profile', upload.single('avatar'), (req, res) => {
  // req.file contains file info. req.body contains text fields.
  res.send('Upload success');
});
```

---

## Logging & Monitoring

### Structured Logging
Do not use `console.log()` in production. It is synchronous under certain conditions and outputs unformatted text.
Instead, use a structured JSON logger. JSON logs are easily ingested and searchable by tools like Datadog, ELK, or CloudWatch.
*   **Tools:** `Pino` (extremely fast), `Winston` (feature-rich).
*   **Log Levels:** `fatal`, `error`, `warn`, `info`, `debug`, `trace`.

### Correlation IDs
When tracing a request through multiple microservices, generate a unique `x-correlation-id` at the API Gateway and pass it in the headers to every downstream service. Log this ID with every message so you can trace the exact flow of a single user's request.

### Monitoring Concepts
*   **Metrics:** Numerical data measured over time (CPU, Memory, Request Rate, Error Rate).
*   **Tracing:** Tracking a single request as it hops through distributed systems (e.g., Jaeger, OpenTelemetry).
*   **Alerting:** Automated notifications when metrics cross thresholds (e.g., 500 error rate > 5%).
