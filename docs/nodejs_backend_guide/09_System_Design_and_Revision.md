# System Design & Final Revision

## 20 System Design Interview Questions

*Note: In System Design interviews, clarify requirements, estimate capacity, design the high-level architecture, define APIs, design the DB schema, and then discuss bottlenecks and scaling.*

1. **Design a URL Shortener (TinyURL):** Use a base62 encoding of an auto-incrementing ID or hash. Use a relational DB for links. Add a Redis caching layer for read-heavy operations.
2. **Design a Notification System:** Use a Pub/Sub queue (Kafka/RabbitMQ) to decouple trigger events from senders (Push, SMS, Email workers). Store user preferences in DB.
3. **Design a Chat Application (WhatsApp):** Use WebSockets for real-time bi-directional messaging. Store message metadata in SQL, but chat history in Cassandra/NoSQL. Use an in-memory store (Redis) for online presence.
4. **Design a Payment Gateway (Stripe):** High consistency required (ACID DB). Idempotency keys are mandatory to prevent double charging. Use asynchronous message queues for webhooks.
5. **Design a File Storage Service (Google Drive):** Store metadata (folder structures, permissions) in a SQL database. Store actual files in block storage (AWS S3). Break large files into chunks for upload.
6. **Design a Rate Limiter:** Use Redis with a Token Bucket or Sliding Window Log algorithm to track IPs/User IDs to enforce limits.
7. **Design a Ticket Booking System (Ticketmaster):** Highly concurrent. Use DB transactions with `SELECT ... FOR UPDATE` (Pessimistic locking) or optimistic locking to prevent double booking.
8. **Design a Ride-Hailing App (Uber):** QuadTrees or Geohash for fast spatial lookups to find nearby drivers. Separate services for matching, routing, and billing.
9. **Design an E-commerce Store (Amazon):** Microservices architecture. Cart service (Redis), Product Catalog (Elasticsearch/NoSQL), Order/Payment (SQL).
10. **Design a Social Media Feed (Twitter):** Read-heavy. Fan-out on write (push new tweets to followers' timelines in Redis) for active users. Pull model for celebrities with millions of followers.
11. **Design a Video Streaming Platform (Netflix):** Use CDNs (Content Delivery Networks) heavily to store video chunks close to users. Transcode video into multiple bitrates asynchronously.
12. **Design a Web Crawler:** Seed URLs placed in a queue. Workers fetch, parse HTML, extract URLs, check a Bloom Filter to ensure the URL hasn't been crawled, and push new URLs back to the queue.
13. **Design an API Gateway:** Handle authentication, rate limiting, routing, and response transformation. Must be highly available and low latency.
14. **Design a Leaderboard System (Gaming):** Use Redis Sorted Sets (`ZADD`, `ZREVRANGE`) to maintain a constantly updating, lightning-fast leaderboard.
15. **Design a Distributed Cache:** Use Consistent Hashing to map keys to cache nodes, minimizing cache misses when nodes are added or removed.
16. **Design a Metrics Monitoring System (Datadog):** Write-heavy. Use a Time-Series Database (TSDB like InfluxDB or Prometheus) to store metric data points efficiently.
17. **Design a Search Engine:** Crawl web, parse documents, create an Inverted Index, rank results using algorithms like PageRank.
18. **Design a Typeahead Suggestion System:** Use a Trie data structure stored in memory to quickly find words matching a prefix.
19. **Design a Job Scheduler:** Master-worker architecture. Use a queue (like BullMQ/Redis) with delayed job capabilities.
20. **Design a Pastebin:** Write-heavy and read-heavy. Generate a unique hash for the URL. Store text in S3 (if large) or DB. Add an expiration cleanup job.

---

## Quick Revision Tables

### Auth Methods
| Method | Stateful/Stateless | Where to Store | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **Sessions** | Stateful | HttpOnly Cookie | Easy to revoke | Hard to scale across servers |
| **JWT** | Stateless | HttpOnly Cookie / Memory | Highly scalable | Hard to revoke, size |
| **OAuth2** | Stateless | Delegated | Secure 3rd party access | Complex to implement |

### Common Redis Commands
| Command | Action |
| :--- | :--- |
| `SET key value EX 60` | Set a string with 60s expiration |
| `GET key` | Retrieve a string |
| `INCR key` | Increment a number |
| `HSET hash key val` | Set a field in a hash |
| `LPUSH list val` | Push to left of a list |

### SQL Joins
| Join Type | Description |
| :--- | :--- |
| **INNER JOIN** | Returns records with matching values in both tables |
| **LEFT JOIN** | Returns all records from left table, and matched from right |
| **RIGHT JOIN** | Returns all records from right table, and matched from left |
| **FULL OUTER JOIN** | Returns all records when there is a match in either |

### Security Vulnerabilities
| Acronym | Name | Defense |
| :--- | :--- | :--- |
| **SQLi** | SQL Injection | Prepared Statements / ORM |
| **XSS** | Cross-Site Scripting | Output Encoding, Sanitize HTML, CSP |
| **CSRF** | Cross-Site Request Forgery | Anti-CSRF Tokens, SameSite Cookies |
| **SSRF** | Server-Side Request Forgery | Whitelist URLs, Validate input |
| **DoS** | Denial of Service | Rate Limiting, WAF, Captcha |

---

## Senior Backend Developer Notes

### Production Best Practices
*   **Always Use Environment Variables:** Never hardcode secrets. Use `.env` locally and secret managers (AWS Secrets Manager) in production.
*   **Use a Process Manager:** PM2 or Docker. Never run `node app.js` directly in production; it will stay down if it crashes.
*   **Health Checks:** Implement a `/health` endpoint for load balancers and Kubernetes to verify the service is running.
*   **Graceful Shutdown:** Handle `SIGTERM`. Stop accepting connections, finish current requests, close DB, then exit.

### Scalability Tips
*   Stateless architectures scale horizontally infinitely. Move all state (sessions, cache) to external datastores like Redis.
*   Offload CPU-intensive tasks (image processing, PDF generation) to background worker queues. Keep the main Express thread solely for handling HTTP.
*   Read replicas for databases. Most web apps are read-heavy (90/10 split). Route read queries to replicas.

### Architecture Decision Guidelines
*   Start with a **Modular Monolith**. Do not start with microservices unless you already have massive traffic and multiple independent engineering teams.
*   Use PostgreSQL by default. It's robust, supports JSON, and handles relational integrity perfectly. Only switch to NoSQL (MongoDB) if your data schema is highly polymorphic or you have insane write throughput requirements.

### Common Interview Traps
*   **"Node is multi-threaded because of libuv."** False. The JavaScript execution environment is strictly single-threaded. *I/O operations* are delegated to the multi-threaded libuv.
*   **"Microservices are always better."** False. They introduce network latency, debugging nightmares, and data consistency issues. They solve *organizational* scaling, not just technical scaling.
*   **Over-engineering:** When asked to design a basic API, don't immediately suggest Kafka, Kubernetes, and Cassandra. Keep it simple (Express + Postgres) unless constraints demand otherwise.
