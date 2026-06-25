# SSR, Hydration & Performance

## 1. Server-Side Rendering (SSR) Overview

Angular SSR renders the application on the server, sending fully-formed HTML to the browser for faster initial load and better SEO.

```
Traditional SPA:
Browser → Request → Empty HTML → Download JS → Execute → Render UI

SSR:
Browser → Request → Full HTML (instantly visible) → Download JS → Hydrate → Interactive
```

### Setting Up SSR (Angular 17+)
```bash
# New project with SSR
ng new my-app --ssr

# Add SSR to existing project
ng add @angular/ssr
```

This adds:
- `server.ts` — Express server entry point
- `src/app/app.config.server.ts` — Server-specific providers
- `src/main.server.ts` — Server bootstrap

### Server Config
```typescript
// app.config.server.ts
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### Server Route Config (Angular 19+)
```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },              // SSG — Static at build time
  { path: 'dashboard', renderMode: RenderMode.Server },        // SSR — Rendered per request
  { path: 'admin/**', renderMode: RenderMode.Client },         // CSR — Client only
  { path: 'blog/:slug', renderMode: RenderMode.Prerender,      // SSG with dynamic params
    async getPrerenderParams() {
      const posts = await fetchPosts();
      return posts.map(p => ({ slug: p.slug }));
    }
  }
];
```

| Render Mode | When Rendered | Use Case |
|---|---|---|
| `RenderMode.Prerender` (SSG) | Build time | Marketing pages, blog posts |
| `RenderMode.Server` (SSR) | Each request | Dynamic content, authenticated pages |
| `RenderMode.Client` (CSR) | Browser only | Admin panels, internal tools |

---

## 2. Hydration

Hydration is the process where Angular attaches event listeners and interactivity to the server-rendered HTML, without destroying and re-rendering the DOM.

### Full Hydration (Angular 16+)
```typescript
// app.config.ts
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideClientHydration()
  ]
};
```

### Incremental Hydration (Angular 19+)
Hydrate components only when needed — not all at once.

```html
<!-- Hydrate when visible in viewport -->
@defer (on viewport; hydrate on viewport) {
  <app-comments />
}

<!-- Hydrate on user interaction -->
@defer (hydrate on interaction) {
  <app-video-player />
}

<!-- Hydrate when idle -->
@defer (hydrate on idle) {
  <app-recommendations />
}

<!-- Never hydrate (static content) -->
@defer (hydrate never) {
  <app-footer />
}
```

### Hydration Triggers
| Trigger | Hydrates When |
|---|---|
| `hydrate on idle` | Browser is idle |
| `hydrate on viewport` | Element enters viewport |
| `hydrate on interaction` | User clicks/interacts |
| `hydrate on hover` | User hovers |
| `hydrate on immediate` | Immediately after load |
| `hydrate on timer(ms)` | After specified delay |
| `hydrate when condition` | Boolean condition is true |
| `hydrate never` | Never hydrated (stays static HTML) |

> **Interview Note**: Incremental hydration is a game-changer for performance. It allows the app to be interactive faster by deferring hydration of non-critical parts.

### Event Replay
```typescript
provideClientHydration(
  withEventReplay() // Captures user events during hydration, replays after
)
```
If a user clicks a button before hydration completes, the event is captured and replayed once Angular takes over.

---

## 3. SSR Pitfalls

### Avoiding Browser APIs on Server
```typescript
import { PLATFORM_ID, isPlatformBrowser } from '@angular/common';

@Component({ /* ... */ })
export class ChartComponent {
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Safe to use window, document, localStorage
      this.initChart();
    }
  }
}

// Alternative: afterNextRender (Angular 16+) — Preferred
@Component({ /* ... */ })
export class ChartComponent {
  constructor() {
    afterNextRender(() => {
      // This ONLY runs in the browser, after the first render
      this.initChart();
    });
  }
}
```

### `afterRender` and `afterNextRender`
| API | When It Runs | Use Case |
|---|---|---|
| `afterNextRender(() => {})` | Once, after the next render cycle | DOM measurement, third-party lib init |
| `afterRender(() => {})` | After every render cycle | Syncing DOM state continuously |

> **Interview Tip**: `afterNextRender` replaces most uses of `ngAfterViewInit` for DOM operations that need to be browser-only. It's the recommended approach in SSR-compatible apps.

---

## 4. Performance Optimization

### Change Detection Strategies
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ListComponent {
  // OnPush: Only checks this component when:
  // 1. An @Input() reference changes
  // 2. An event originates from this component or its children
  // 3. An Observable bound with async pipe emits
  // 4. Signal value changes
  // 5. markForCheck() is called manually
}
```

### Signals Eliminate Manual Change Detection
```typescript
// With Signals — Angular knows exactly what changed
@Component({
  template: `<p>{{ count() }}</p>`
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
    // No need for markForCheck(), detectChanges(), etc.
  }
}
```

### OnPush + Signals = Maximum Performance
```
Default CD:  Checks EVERY component in the tree on EVERY event
OnPush CD:   Checks only when inputs change or events occur
Signals:     Updates only the specific DOM binding that changed (zoneless future)
```

---

## 5. Zoneless Angular (Angular 18+ Experimental → Stable Angular 20+)

```typescript
// app.config.ts
export const appConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection() // Angular 18-19
    // provideZonelessChangeDetection()           // Angular 20+
  ]
};
```

### How Zones Work (Traditional)
```
User clicks button → Zone.js intercepts → Triggers CD on entire tree → Updates DOM
```

### How Zoneless Works
```
User clicks button → Signal changes → Angular updates only affected bindings
```

### Benefits of Zoneless
- Smaller bundle (no Zone.js polyfill, ~15KB savings)
- Faster change detection (no tree walking)
- Better debugging (no Zone.js stack traces)
- Simpler mental model

> **Interview Note**: Zoneless Angular requires using Signals for reactivity. It's the future direction of Angular.

---

## 6. Lazy Loading & Code Splitting

### Route-Level
```typescript
{ path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) }
```

### Template-Level with `@defer`
```html
@defer (on viewport) {
  <app-heavy-widget />
} @placeholder {
  <div class="skeleton"></div>
}
```

### Image Optimization (`NgOptimizedImage`)
```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image — priority loading -->
    <img ngSrc="hero.jpg" width="1200" height="600" priority />

    <!-- Regular image — lazy loaded automatically -->
    <img ngSrc="thumbnail.jpg" width="300" height="200" />

    <!-- Responsive image -->
    <img ngSrc="photo.jpg" width="800" height="600"
         sizes="(max-width: 768px) 100vw, 50vw" />
  `
})
```

### Image Loader (CDN)
```typescript
// app.config.ts
import { provideCloudinaryLoader } from '@angular/common';

providers: [
  provideCloudinaryLoader('https://res.cloudinary.com/my-account')
]
```

---

## 7. Performance Checklist

| Optimization | Implementation |
|---|---|
| **OnPush Change Detection** | `changeDetection: ChangeDetectionStrategy.OnPush` |
| **Track in @for** | `@for (item of items; track item.id)` — always use a unique key |
| **Lazy loading routes** | `loadComponent` / `loadChildren` |
| **Defer non-critical UI** | `@defer (on viewport)` |
| **Image optimization** | `NgOptimizedImage` with `priority` for LCP |
| **Preload strategies** | `withPreloading(PreloadAllModules)` |
| **Bundle analysis** | `ng build --stats-json && npx webpack-bundle-analyzer` |
| **Virtual scrolling** | `@angular/cdk/scrolling` → `<cdk-virtual-scroll-viewport>` |
| **Avoid expensive pipes** | Use pure pipes, memoize, or move to computed signals |
| **SSR + Incremental Hydration** | `provideClientHydration()` + `hydrate on viewport` |

---

## 8. Virtual Scrolling (Angular CDK)

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="48" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport { height: 400px; }
    .item { height: 48px; }
  `]
})
export class VirtualListComponent {
  items = Array.from({ length: 10000 }, (_, i) => ({ name: `Item ${i}` }));
}
```

> **Interview Tip**: Virtual scrolling renders only the visible items in the DOM. For a list of 10,000 items, only ~20 DOM elements exist at a time.

---

## Quick Revision: SSR & Performance

| Concept | Description |
|---|---|
| SSR | Server renders full HTML → faster FCP, better SEO |
| SSG (Prerender) | Rendered at build time, served as static files |
| Hydration | Browser attaches interactivity to server HTML |
| Incremental Hydration | Hydrate individual components lazily (on viewport, interaction, etc.) |
| Event Replay | Captures user events before hydration, replays after |
| `afterNextRender` | Runs code only in browser, after first render |
| Zoneless | No Zone.js; Signals drive change detection |
| OnPush | Only check component when inputs/signals/events change |
