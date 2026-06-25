# React Server Components (RSC) and Next.js Ecosystem

## 1. React Server Components (RSC) Deep Dive

**What they are**: Components that render exclusively on the server. Their code is never sent to the client.
**Why they exist**: To reduce the JavaScript bundle size sent to the browser and allow components direct, fast access to backend resources (databases, file systems).

### Server vs. Client Components

| Feature | Server Components | Client Components (`"use client"`) |
| --- | --- | --- |
| Execution | Server only | Server (SSR) and Client |
| State/Lifecycle | No (`useState`, `useEffect` throw) | Yes |
| Browser APIs | No | Yes |
| Access DB/Files | Yes | No (requires an API) |
| Bundle Impact | Zero | Adds to bundle |

**Shared Components**: Components that can run on both server and client depending on who imports them.

### RSC Architecture & Streaming
1. The server renders the RSC tree into a special binary format (RSC Payload).
2. The payload is streamed to the client.
3. The client reconstructs the tree, slotting in Client Components (which are hydrated with JS).
4. **Streaming**: Allows sending chunks of UI as they become ready, heavily integrated with Suspense.

## 2. Next.js Ecosystem & App Router

Next.js is a framework built on top of React that implements RSCs by default.

### App Router Concepts
- **File-based Routing**: Folders define the route paths. Files inside (e.g., `page.js`, `layout.js`) define the UI.
- **Layouts**: UI that is shared across multiple pages (e.g., Navbars). Layouts preserve state and don't re-render on navigation.
- **Loading UI**: `loading.js` automatically wraps the route segment in a Suspense boundary.
- **Error UI**: `error.js` automatically wraps the segment in an Error Boundary.
- **Route Handlers**: `route.js` creates a traditional API endpoint.

### Rendering Strategies
| Strategy | Acronym | When it Renders | Use Case |
| --- | --- | --- | --- |
| Server-Side Rendering | SSR | On every request | Dynamic dashboards |
| Static Site Generation | SSG | At build time | Blogs, docs |
| Incremental Static Regeneration | ISR | Background validation | Large e-commerce sites |
| Client-Side Rendering | CSR | In the browser | Highly interactive widgets |
| Partial Prerendering | PPR | Hybrid (Static shell, dynamic holes) | Modern personalized sites |

## 3. Server Actions
Functions that run on the server but can be called directly from Client Components (e.g., for form submissions).
- **Benefits**: No need to manually write API routes. Works even before JS hydrates.
- **Use Cases**: Database mutations, form handling, cookies.
- **Limitations**: Must be async. Data passed must be serializable.
