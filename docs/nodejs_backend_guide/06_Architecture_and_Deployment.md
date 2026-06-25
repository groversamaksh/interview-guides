# Architecture & Deployment

## Scaling Node.js Applications

Because Node.js is single-threaded, a standard Node app running on a multi-core CPU will only utilize one core. To handle production traffic, we must scale horizontally.

### 1. Cluster Mode
The built-in `cluster` module allows creating child processes (workers) that run simultaneously and share the same server port.
*   The Master process listens on the port and distributes incoming connections to the Workers using a Round-Robin approach.
*   Best for scaling web servers across multiple CPU cores on a *single* machine.
*   *Note:* Today, process managers like PM2 (`pm2 start app.js -i max`) or Docker/Kubernetes handle clustering better than manual cluster code.

### 2. Worker Threads
Introduced to allow Node to execute JavaScript in parallel.
*   Unlike Clusters, Worker Threads share memory.
*   Best for offloading heavy CPU-intensive tasks (e.g., image resizing, complex math) so they don't block the main Event Loop.

### 3. Horizontal Scaling & Load Balancing
Scaling across *multiple machines*.
*   Requires a Load Balancer (e.g., Nginx, HAProxy, AWS ALB) placed in front of your Node servers.
*   The LB intercepts client requests and forwards them to a pool of backend servers.
*   Algorithms: Round Robin, Least Connections, IP Hash.

---

## System Design Basics

### CAP Theorem
In a distributed data store, you can only guarantee two out of the following three:
1.  **Consistency (C):** Every read receives the most recent write or an error.
2.  **Availability (A):** Every request receives a non-error response (but without guarantee it contains the most recent write).
3.  **Partition Tolerance (P):** The system continues to operate despite an arbitrary number of messages being dropped by the network.
*Networks always fail, so you must choose between CP or AP.*

### Scalability vs Availability vs Reliability
*   **Scalability:** The ability of a system to handle increased load by adding resources (Scale Up/Vertical or Scale Out/Horizontal).
*   **Availability:** Uptime. The percentage of time a system remains operational (e.g., 99.99% "Four Nines").
*   **Reliability:** The probability a system will produce correct outputs up to a given time. (A system can be available but unreliable if it returns errors).
*   **Fault Tolerance:** The ability of a system to remain operational despite the failure of some of its components.

---

## Distributed Systems Fundamentals

*   **Reverse Proxy:** Sits in front of web servers and forwards client requests to them (e.g., Nginx). Provides load balancing, caching, SSL termination, and security.
*   **API Gateway:** A specialized reverse proxy that acts as the single entry point for a microservices architecture. Handles routing, rate limiting, auth, and protocol translation.
*   **Service Discovery:** A registry where microservices log their network locations so other services can find them dynamically (e.g., Consul, Eureka).

---

## Microservices Architecture

An architectural style that structures an application as a collection of loosely coupled, independently deployable services.

### Monolith vs Modular Monolith vs Microservices
*   **Monolith:** All code (UI, business logic, data access) in one single codebase and deployed as a single unit. Easy to start, hard to scale teams.
*   **Modular Monolith:** Single deployment unit, but internally organized into strict modules with clear boundaries. Best of both worlds for mid-sized teams.
*   **Microservices:** Services communicate over network boundaries (HTTP/gRPC or Message Queues).
    *   *Benefits:* Independent deployment, polyglot programming (use best language for the job), isolated failures.
    *   *Drawbacks:* Extremely complex deployment, difficult debugging, network latency, distributed transactions are hard (Saga pattern required).

---

## Docker

Docker packages an application and its dependencies into a standardized unit called a container.

*   **Image:** A read-only template with instructions for creating a container (built from a Dockerfile).
*   **Container:** A runnable instance of an image. Isolated from the host system.
*   **Docker Compose:** A tool for defining and running multi-container Docker applications (e.g., spinning up Node, Redis, and Postgres together).

### Node.js Dockerfile Example
```dockerfile
# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies (caching layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Command to run
CMD ["node", "server.js"]
```

---

## CI/CD (Continuous Integration / Continuous Deployment)

*   **CI:** Automating the integration of code changes. Includes linting, building, and running automated tests on every push.
*   **CD:** Automating the release of validated code to a repository (Delivery) or straight to production (Deployment).

### Deployment Strategies
1.  **Rolling Deployment:** Replaces instances of the previous version with the new version one by one. Zero downtime, but old and new code run concurrently.
2.  **Blue-Green Deployment:** Two identical environments (Blue and Green). Traffic routes to Blue. Green gets the new deployment. Once verified, the load balancer switches traffic to Green. Instant rollback.
3.  **Canary Deployment:** Route a small percentage of traffic (e.g., 5%) to the new version. Monitor for errors. Gradually increase traffic to 100%. Great for risk mitigation.
