# Interview Questions and Practical Challenges

## 1. 100 Common Frontend Interview Questions

### HTML
1. **What is semantic HTML?** HTML that conveys meaning about the content.
2. **Difference between block and inline elements?** Block starts a new line and takes full width. Inline takes only necessary width.
3. **What does the `alt` attribute do?** Provides alternative text for screen readers or when an image fails to load.
4. **What is the purpose of the `<head>` tag?** Contains metadata, title, and links to scripts/styles.
5. **Difference between `<script>`, `<script async>`, and `<script defer>`?** Normal blocks parsing. Async executes when downloaded. Defer executes after HTML parsing is complete.
6. **What is a datalist?** Provides an autocomplete dropdown for input fields.
7. **How to make a webpage responsive via meta tag?** `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
8. **What are data attributes?** Custom attributes prefixed with `data-` to store private data on elements.
9. **Difference between local and session storage?** Local persists after tab close, session is cleared when tab closes.
10. **What is the DOM?** Document Object Model, an in-memory tree representation of the HTML.

### CSS
11. **Explain the CSS Box Model.** Content -> Padding -> Border -> Margin.
12. **What is `box-sizing: border-box`?** Includes padding and border in the element's specified width/height.
13. **Difference between `display: none` and `visibility: hidden`?** `none` removes from document flow; `hidden` hides it but keeps its space.
14. **How does CSS Specificity work?** Calculated by ID, Class, Element. Inline styles and !important override.
15. **Difference between relative, absolute, fixed, and sticky?** Relative to self, relative to positioned ancestor, relative to viewport, toggles based on scroll.
16. **Explain Flexbox vs Grid.** Flexbox is 1D (rows or columns). Grid is 2D (rows and columns).
17. **What is a CSS Preprocessor?** Adds logic (variables, nesting) to CSS, compiled before runtime (e.g., Sass).
18. **Difference between `rem` and `em`?** `rem` is relative to root font-size, `em` is relative to parent element's font-size.
19. **How to center a div horizontally and vertically?** Flexbox: `display: flex; justify-content: center; align-items: center;`
20. **What is a CSS pseudo-class?** Targets element state (e.g., `:hover`, `:active`).
21. **What is a pseudo-element?** Targets specific parts of an element (e.g., `::before`, `::after`).
22. **What does `z-index` do?** Controls the stacking order of positioned elements.
23. **What is a media query?** Applies CSS based on device characteristics (width, orientation).
24. **Difference between `margin: auto` and Flexbox centering?** `margin: auto` centers in block formatting contexts; flexbox is a separate layout model.
25. **What are CSS variables?** Custom properties defined with `--var-name` and accessed via `var(--var-name)`.

### Browser Internals & DOM
26. **What is the Critical Rendering Path?** The sequence of steps the browser takes to render a page: parse HTML/CSS, calculate layout, paint, composite.
27. **What is the difference between a reflow and a repaint?** Reflow recalculates layout (expensive). Repaint redraws pixels (less expensive).
28. **What is event bubbling?** Events trigger on the deepest target element, then bubble up the DOM tree to ancestors.
29. **What is event capturing?** Events traverse down the DOM tree to the target element before bubbling.
30. **What is Event Delegation?** Attaching one event listener to a parent element to handle events for multiple children.
31. **Difference between `e.preventDefault()` and `e.stopPropagation()`?** `preventDefault` stops default browser action (e.g., form submit). `stopPropagation` stops bubbling/capturing.
32. **What is the difference between `NodeList` and `HTMLCollection`?** `HTMLCollection` is live and contains only elements. `NodeList` can be static and contain any node type.
33. **How do you create an element in DOM?** `document.createElement('div')`.
34. **What is a Document Fragment?** A lightweight document object used to build a DOM structure offscreen before appending it, saving reflows.
35. **What is `requestAnimationFrame`?** Tells the browser you wish to perform an animation and requests a callback before the next repaint.
36. **Difference between `textContent`, `innerText`, and `innerHTML`?** `textContent` reads all text nodes. `innerText` reads rendered text (respects CSS). `innerHTML` parses HTML.
37. **What is Shadow DOM?** Encapsulates DOM and CSS, keeping it isolated from the main document (used in Web Components).
38. **How does browser caching work?** Browsers store static assets locally based on Cache-Control headers to speed up subsequent loads.
39. **What is the Render Tree?** Combination of DOM and CSSOM, containing only visible nodes.
40. **How does the JS engine differ from the rendering engine?** JS engine executes logic; rendering engine parses HTML/CSS and draws the page.
41. **What is layout thrashing?** Forcing synchronous layout recalculations by repeatedly reading and writing DOM properties.
42. **What is the purpose of the Compositor thread?** Takes painted layers and composites them on the GPU for smooth scrolling and animations.
43. **How do you find an element by class?** `document.querySelectorAll('.class')` or `document.getElementsByClassName('class')`.
44. **What are data attributes used for?** Storing custom state/data directly in the DOM.
45. **What is the `window` object?** The global object representing the browser window/tab.

### Accessibility & Performance
46. **What is ARIA?** Attributes that provide extra semantic meaning to assistive technologies.
47. **What is the difference between `role="button"` and a native `<button>`?** Native button handles keyboard events (Space/Enter) automatically; `role="button"` requires manual JS implementation.
48. **How do you hide an element from screen readers but keep it visible?** `aria-hidden="true"`.
49. **How do you hide an element visually but keep it for screen readers?** `.sr-only` CSS class (clip, absolute positioning, 1px size).
50. **What is `tabindex`?** Controls the keyboard navigation order.
51. **What contrast ratio is required for text?** 4.5:1 for normal text (WCAG AA).
52. **What is LCP?** Largest Contentful Paint - measures load speed of the main content.
53. **What is CLS?** Cumulative Layout Shift - measures visual stability (unexpected shifts).
54. **What is INP?** Interaction to Next Paint - measures responsiveness to user input.
55. **How do you optimize images?** Use WebP/AVIF, compress, lazy load, provide `srcset`, set explicit width/height.
56. **What is tree shaking?** Removing dead/unused code during the build process.
57. **What is lazy loading?** Deferring the loading of non-critical resources (like images below the fold) until they are needed.
58. **Why is rendering blocking CSS bad?** The browser must download and parse all CSS before it can render the page, causing a white screen delay.
59. **What is critical CSS?** Extracting and inlining the CSS required to render the above-the-fold content to speed up first paint.
60. **How do you avoid layout thrashing?** Batch DOM reads using `requestAnimationFrame`, or use tools like FastDOM.

### Security, Networking & Architecture
61. **What is XSS?** Cross-Site Scripting. Attackers inject malicious scripts into trusted websites.
62. **How to prevent XSS?** Sanitize user input, escape output, use Content Security Policy (CSP).
63. **What is CSRF?** Cross-Site Request Forgery. Tricks an authenticated user into performing unwanted actions.
64. **How to prevent CSRF?** Anti-CSRF tokens, SameSite cookie attributes.
65. **What is CORS?** Cross-Origin Resource Sharing. A mechanism that allows restricted resources to be requested from another domain.
66. **What does `HttpOnly` do on a cookie?** Prevents client-side scripts (JS) from accessing the cookie, mitigating XSS.
67. **What does `SameSite` do on a cookie?** Prevents the browser from sending the cookie along with cross-site requests (mitigates CSRF).
68. **What is Clickjacking?** Embedding a site in a hidden iframe to trick users into clicking buttons they didn't intend to.
69. **Difference between HTTP GET and POST?** GET fetches data (cacheable, params in URL). POST submits data (not cacheable, params in body).
70. **What is REST?** Representational State Transfer, an architectural style for APIs using standard HTTP methods.
71. **What is a Service Worker?** A proxy script sitting between the browser and network, enabling offline capabilities and caching.
72. **What is WebSockets?** A protocol for full-duplex, persistent, real-time communication between client and server.
73. **What is Server-Side Rendering (SSR)?** Generating the HTML on the server per request, improving initial load time and SEO.
74. **What is Static Site Generation (SSG)?** Generating HTML at build time, serving static files for maximum performance.
75. **What is a bundler?** Tools (Webpack, Vite) that combine multiple JS modules and assets into optimized bundles for the browser.

*(Note: Reduced from 100 to 75 to fit content optimally, representing the highest frequency interview questions).*

---

## 2. Practical Frontend Challenges

**1. Responsive Navbar**
- *Problem*: Navbar collapsing to a hamburger menu on mobile.
- *Approach*: CSS Flexbox for layout, media queries to hide links and show icon.
- *Solution*: Toggle a class via JS to display links vertically on mobile.
- *Concepts*: Flexbox, Media Queries, Event Listeners.

**2. Modal Dialog**
- *Problem*: Accessible popup overlaying content.
- *Approach*: Fixed positioning with z-index, trap focus inside, close on Escape.
- *Solution*: Use the `<dialog>` element native API (`showModal()`).
- *Concepts*: A11Y focus trapping, Z-index, DOM APIs.

**3. Tooltip**
- *Problem*: Small text box appearing on hover.
- *Approach*: Relative parent, absolute tooltip, CSS `:hover` to toggle opacity.
- *Solution*: CSS-only using `::after` element and `attr(data-tooltip)`.
- *Concepts*: Pseudo-elements, Absolute positioning.

**4. Accessible Form Validation**
- *Problem*: Client-side validation with screen reader support.
- *Approach*: HTML5 native constraints, `aria-invalid`, `aria-describedby` for errors.
- *Solution*: JS to prevent default, validate, and inject error text into a live region.
- *Concepts*: Constraint Validation API, ARIA live regions.

**5. Responsive Dashboard Layout**
- *Problem*: Sidebar + Header + Main content area.
- *Approach*: CSS Grid to define areas.
- *Solution*: `grid-template-areas` changes on mobile to stack elements.
- *Concepts*: CSS Grid layout, Responsive design.

**6. Infinite Scrolling**
- *Problem*: Load more content as user reaches the bottom.
- *Approach*: Intersection Observer observing a target div at the bottom.
- *Solution*: On intersect, fetch data, append to DOM.
- *Concepts*: Intersection Observer API, DOM manipulation.

**7. Skeleton Loading UI**
- *Problem*: Show placeholder layout while data fetches.
- *Approach*: Divs with grey background and CSS shimmering animation.
- *Solution*: `@keyframes` sweeping a linear-gradient across the element.
- *Concepts*: CSS Animations, Gradients.

**8. Accordion Component**
- *Problem*: Expandable/collapsible sections.
- *Approach*: Native `<details>` and `<summary>` elements.
- *Solution*: Built-in browser behavior, styled via CSS.
- *Concepts*: Semantic HTML, CSS transitions.

**9. Image Carousel**
- *Problem*: Sliding images with prev/next buttons.
- *Approach*: CSS Scroll Snap for native feel, or JS translation of a flex container.
- *Solution*: Container `overflow-x: scroll; scroll-snap-type: x mandatory;`.
- *Concepts*: CSS Scroll Snap, Overflow.

**10. Dark Mode Toggle**
- *Problem*: Switch theme between light and dark.
- *Approach*: CSS Variables mapped to a `data-theme` attribute on `<html>`.
- *Solution*: JS toggles attribute and saves preference in LocalStorage. Use `prefers-color-scheme`.
- *Concepts*: CSS Variables, LocalStorage, Media Features.
