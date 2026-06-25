# Quick Revision Tables and Checklists

## 1. Quick Revision Tables

### HTML Important Elements
| Element | Purpose |
| --- | --- |
| `<main>` | Core content of document. Only one per page. |
| `<article>` | Standalone content piece. |
| `<figure>` | Self-contained content like images with `<figcaption>`. |
| `<dialog>` | Native modal/popup implementation. |

### ARIA Roles & Attributes
| Attribute | Use |
| --- | --- |
| `role="alert"` | Important time-sensitive info. |
| `aria-expanded` | State of a collapsible element (true/false). |
| `aria-label` | Overrides visual text for screen readers. |
| `aria-describedby`| Links to an element providing detailed description. |

### Flexbox Quick Reference
| Property | Axis | Values |
| --- | --- | --- |
| `justify-content` | Main | `start`, `center`, `end`, `space-between` |
| `align-items` | Cross | `stretch`, `center`, `start`, `end` |
| `flex-wrap` | Main | `nowrap`, `wrap`, `wrap-reverse` |

### Grid Quick Reference
| Property | Purpose |
| --- | --- |
| `grid-template-columns` | Defines column tracks (e.g., `1fr 2fr 1fr`). |
| `gap` | Spacing between rows and columns. |
| `grid-area` | Assigns an item to a named area. |

### HTTP Status Codes
| Code | Meaning | Example |
| --- | --- | --- |
| 200 | OK | Successful GET. |
| 201 | Created | Successful POST creation. |
| 301 | Moved Permanently | Resource moved to new URL. |
| 400 | Bad Request | Client sent invalid data. |
| 401 | Unauthorized | Missing/invalid authentication. |
| 404 | Not Found | URL does not exist. |
| 500 | Internal Server Error| Server crashed or failed. |

### Core Web Vitals targets
| Metric | Good | Needs Improvement | Poor |
| --- | --- | --- | --- |
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| INP | < 200ms | 200ms - 500ms | > 500ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

---

## 2. Senior Frontend Developer Checklists

### Real-world Engineering Lessons
- **Accessibility is a requirement, not a feature.** Bake it into components from day one. Retrofitting A11Y is notoriously difficult.
- **Performance degrades over time.** Set up performance budgets in CI/CD pipelines to prevent asset bloat.
- **Do not invent custom UI when native elements exist.** Use `<dialog>`, `<details>`, and `<input type="date">` instead of complex, brittle custom implementations unless heavily justified by design.
- **State management should be as local as possible.** Don't put everything in global state; it causes unnecessary re-renders and complexity.
- **Understand the cascade.** Avoid `!important` and excessively deep nesting. Embrace modern CSS features like CSS variables and Layers to manage specificity cleanly.

### Checklists for Production
**Security Checklist:**
- [ ] No inline scripts.
- [ ] CSP headers configured.
- [ ] Cookies set to HttpOnly, Secure, SameSite.
- [ ] User input sanitized before rendering.

**Performance Checklist:**
- [ ] Images compressed and using modern formats (WebP).
- [ ] Images/iframes lazy-loaded.
- [ ] Critical CSS inlined, non-critical deferred.
- [ ] JS bundles split and tree-shaken.

**SEO Checklist:**
- [ ] Unique, descriptive `<title>` and `<meta description>` per page.
- [ ] Proper `<h1>` through `<h6>` hierarchy.
- [ ] Canonical URLs defined to prevent duplicate content penalties.
- [ ] robots.txt and sitemap.xml present.

### Common Interview Traps
- *Over-complicating layouts*: Reach for Flexbox/Grid before attempting complex absolute positioning hacks.
- *Ignoring edge cases*: "What if the API fails?", "What if the user has a slow connection?", "What if the text is 5x longer?"
- *Forgetting accessibility*: Always mention keyboard navigation and ARIA roles when designing a custom component on the whiteboard.
- *Blindly using JavaScript*: Interviewers often want to see if you can solve problems with CSS alone (e.g., using `:target`, `:checked`, or `scroll-snap`) before resorting to heavy JS.
