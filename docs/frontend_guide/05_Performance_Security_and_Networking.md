# Performance, Security, and Networking

## 1. Networking Fundamentals

### HTTP Basics
- **Methods**: GET (fetch), POST (create), PUT/PATCH (update), DELETE (remove).
- **Status Codes**: 2xx (Success), 3xx (Redirect), 4xx (Client Error), 5xx (Server Error).

### Caching
- `Cache-Control: max-age=3600` (Cache for 1 hour).
- `ETag`: Hash representing file contents to validate cache.
- `Last-Modified`: Date the file was last modified.

### CORS (Cross-Origin Resource Sharing)
Security feature preventing an origin from accessing resources on a different origin.
- **Same Origin Policy**: Restricts how a document or script loaded from one origin can interact with a resource from another origin.
- **Preflight (OPTIONS)**: Browser asks server if the actual request is safe to send.

## 2. Web Security

- **XSS (Cross-Site Scripting)**: Attacker injects malicious scripts. *Prevention*: Sanitize inputs, escape HTML outputs.
- **CSRF (Cross-Site Request Forgery)**: Attacker tricks user into executing unwanted actions on an authenticated site. *Prevention*: Anti-CSRF tokens, SameSite cookies.
- **Clickjacking**: Tricking users into clicking something different from what they perceive. *Prevention*: `X-Frame-Options: DENY`.
- **CSP (Content Security Policy)**: Header restricting where resources can be loaded from.
- **Secure Cookies**: Use `HttpOnly` and `Secure` attributes.

## 3. SEO Fundamentals

- Use Semantic HTML (`<article>`, `<nav>`, `<h1>`-`<h6>` hierarchy).
- `robots.txt` dictates what crawlers can index.
- `sitemap.xml` provides a map of all pages.
- Add `<meta>` tags for descriptions, Structured Data, and Open Graph for social sharing.

## 4. Web Performance

### Core Web Vitals
1. **LCP (Largest Contentful Paint)**: Loading performance. Good < 2.5s.
2. **INP (Interaction to Next Paint)**: Interactivity. Good < 200ms.
3. **CLS (Cumulative Layout Shift)**: Visual stability. Good < 0.1.

### Rendering Optimization
- **Reflow (Layout)**: Triggered by dimension changes. Expensive.
- **Repaint**: Triggered by color/visibility changes.
- **Layout Thrashing**: Reading and writing DOM properties sequentially, forcing synchronous synchronous reflows. Batch DOM reads, then DOM writes.

### Assets Optimization
- Serve modern image formats (WebP, AVIF).
- Lazy load images and components below the fold.
- Minify and compress (Gzip/Brotli) CSS and JS.
- Preload critical fonts.
- **Code Splitting**: Break JS into chunks.
