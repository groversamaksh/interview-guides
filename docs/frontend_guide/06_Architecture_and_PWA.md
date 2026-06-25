# Architecture, Tools, and PWA

## 1. Frontend Architecture

- **Component-based architecture**: Building UIs out of independent, reusable pieces.
- **Design Systems**: Centralized tokens (colors, spacing, typography) and reusable components.
- **CSS Architecture**: 
  - *BEM* (Block Element Modifier)
  - *SMACSS* (Scalable and Modular Architecture for CSS)
  - *ITCSS* (Inverted Triangle CSS)

## 2. Frontend Build Tools

- **Bundlers**: (Webpack, Vite, Rollup) Combine multiple files into optimized bundles for the browser.
- **Transpilers**: (Babel, SWC) Convert modern syntax (ES6+, TS) to older browser compatible syntax.
- **Minification**: Stripping spaces, comments, and renaming variables to reduce file size.
- **Tree Shaking**: Removing dead/unused code during the build process to minimize payload.

## 3. PWA Fundamentals (Progressive Web Apps)

- **Service Workers**: Scripts running in the background acting as network proxies. Used for offline support, background sync, and push notifications.
- **Web Manifest**: JSON file providing app metadata (icons, name, display mode) for installation on a device's home screen.
- **Caching Strategies**:
  - *Cache First*: Look in cache, if not found fetch from network.
  - *Network First*: Fetch from network, fallback to cache.
  - *Stale-While-Revalidate*: Return cached response immediately, update cache in background.

## 4. Frontend Testing Concepts

- **Unit Testing**: Testing individual functions or components in isolation (e.g., Jest, Vitest).
- **Integration Testing**: Testing how multiple components interact with each other.
- **E2E (End-to-End)**: Automating a real browser to test complete user flows (e.g., Cypress, Playwright).
- **Accessibility testing**: Automated tools (e.g., axe) to check WCAG compliance.
- **Visual Regression Testing**: Comparing screenshots over time to detect UI breaks.
