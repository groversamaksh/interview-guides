# Routing & Navigation

## 1. Angular Router Overview

The Angular Router enables navigation between views (components) based on URL patterns. It is a separate package: `@angular/router`.

### Core Concepts
```
URL Change → Router matches Route Config → Activates Component → Renders in <router-outlet>
```

### Setting Up Routes (Standalone, Modern)
```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotFoundComponent } // Wildcard
];

// app.config.ts
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig = {
  providers: [provideRouter(routes)]
};
```

> **Interview Note**: In modern Angular (17+), `provideRouter()` replaces the old `RouterModule.forRoot()`.

### Router Outlet
```html
<!-- app.component.html -->
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
  <a routerLink="/about" routerLinkActive="active">About</a>
</nav>
<router-outlet />
```

---

## 2. Route Parameters

### Path Parameters
```typescript
// Route config
{ path: 'user/:id', component: UserComponent }

// Component
import { ActivatedRoute } from '@angular/router';
import { input } from '@angular/core'; // Angular 16+

// Modern: Component Input Binding (Angular 16+)
@Component({ /* ... */ })
export class UserComponent {
  id = input<string>(); // Automatically bound from route param!
}

// Enable in config:
provideRouter(routes, withComponentInputBinding());

// Classic approach
export class UserComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Snapshot (one-time read)
    const id = this.route.snapshot.paramMap.get('id');

    // Observable (reacts to param changes)
    this.route.paramMap.subscribe(params => {
      console.log(params.get('id'));
    });
  }
}
```

### Query Parameters
```typescript
// Navigate with query params
this.router.navigate(['/search'], {
  queryParams: { q: 'angular', page: 1 }
});

// Read query params
this.route.queryParamMap.subscribe(params => {
  const query = params.get('q');
});
```

> **Interview Tip**: Prefer `paramMap` over `params` — `paramMap` is a `Map<string, string>` and has `.get()`, `.has()`, `.getAll()`.

---

## 3. Lazy Loading

### Route-Level Lazy Loading
```typescript
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component')
      .then(m => m.AdminComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES)
  }
];
```

### `@defer` Block (Angular 17+ Template-Level)
```html
@defer (on viewport) {
  <app-heavy-chart />
} @placeholder {
  <div class="skeleton-loader"></div>
} @loading (minimum 500ms) {
  <app-spinner />
} @error {
  <p>Failed to load chart.</p>
}
```

#### `@defer` Triggers
| Trigger | Description |
|---|---|
| `on idle` | When browser is idle (default) |
| `on viewport` | When placeholder enters viewport |
| `on interaction` | On user click/keydown on placeholder |
| `on hover` | On mouseenter/focusin |
| `on immediate` | As soon as possible (no idle wait) |
| `on timer(5s)` | After a specified delay |
| `when condition` | When a boolean expression becomes true |

> **Interview Note**: `@defer` replaces most use cases for `loadComponent` within templates. It is a game-changer for performance optimization.

---

## 4. Route Guards

Guards control whether a route can be activated, deactivated, or loaded.

### Functional Guards (Modern, Angular 14.2+)
```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Usage in routes
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  canActivate: [authGuard]
}
```

### Guard Types
| Guard | Purpose |
|---|---|
| `canActivate` | Controls if a route can be activated |
| `canActivateChild` | Controls child route activation |
| `canDeactivate` | Controls leaving a route (unsaved changes?) |
| `canMatch` | Controls if the route can even be matched |
| `resolve` | Pre-fetches data before route activation |

### Resolver Example
```typescript
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  return userService.getUser(route.paramMap.get('id')!);
};

// Route
{ path: 'user/:id', component: UserComponent, resolve: { user: userResolver } }

// Component
export class UserComponent {
  user = input<User>(); // With withComponentInputBinding()
}
```

> **Interview Tip**: Class-based guards (`CanActivate` interface) are deprecated in favor of functional guards. Always use the functional pattern.

---

## 5. Nested & Named Routes

### Child Routes
```typescript
{
  path: 'settings',
  component: SettingsLayoutComponent,
  children: [
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'profile', component: ProfileSettingsComponent },
    { path: 'security', component: SecuritySettingsComponent },
    { path: 'notifications', component: NotificationSettingsComponent }
  ]
}
```

### Named Outlets (Auxiliary Routes)
```html
<router-outlet />
<router-outlet name="sidebar" />
```
```typescript
{ path: 'help', component: HelpPanelComponent, outlet: 'sidebar' }
```
```html
<a [routerLink]="[{ outlets: { sidebar: ['help'] } }]">Open Help</a>
```

---

## 6. Navigation & Router Events

### Programmatic Navigation
```typescript
import { Router } from '@angular/router';

export class SomeComponent {
  private router = inject(Router);

  goToUser(id: string) {
    this.router.navigate(['/user', id]);
  }

  goWithExtras() {
    this.router.navigate(['/dashboard'], {
      queryParams: { tab: 'analytics' },
      fragment: 'chart',
      state: { fromPage: 'home' } // NavigationExtras
    });
  }
}
```

### Router Events (for analytics, loading indicators)
```typescript
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

export class AppComponent {
  isLoading = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (event instanceof NavigationEnd || event instanceof NavigationError) {
        this.isLoading = false;
      }
    });
  }
}
```

### Key Router Events
| Event | Fires When |
|---|---|
| `NavigationStart` | Navigation begins |
| `RoutesRecognized` | Router has parsed the URL and matched routes |
| `GuardsCheckStart/End` | Guards start/finish running |
| `ResolveStart/End` | Resolvers start/finish |
| `NavigationEnd` | Navigation completes successfully |
| `NavigationCancel` | Navigation is cancelled (guard returned false) |
| `NavigationError` | Navigation fails |

---

## 7. Advanced Router Features

### `withViewTransitions()` (Angular 17+)
```typescript
// app.config.ts
provideRouter(routes, withViewTransitions())
```
Enables the browser's View Transitions API for smooth page transitions during route changes.

### Route Reuse Strategy
```typescript
// Custom strategy to control component reuse
export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean { return false; }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {}
  shouldAttach(route: ActivatedRouteSnapshot): boolean { return false; }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null { return null; }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
```

### `withHashLocation()` — Hash-based URLs
```typescript
provideRouter(routes, withHashLocation())
// URLs become: /#/about instead of /about
```

### `provideRouter` Feature Functions
| Function | Purpose |
|---|---|
| `withComponentInputBinding()` | Binds route params/query params/data to component inputs |
| `withViewTransitions()` | Enables View Transitions API |
| `withHashLocation()` | Uses hash-based URLs |
| `withPreloading(strategy)` | Configures route preloading |
| `withDebugTracing()` | Logs all router events to console |
| `withRouterConfig(options)` | Sets paramsInheritanceStrategy, urlUpdateStrategy, etc. |

---

## 8. Preloading Strategies

```typescript
import { PreloadAllModules } from '@angular/router';

provideRouter(routes, withPreloading(PreloadAllModules))
```

### Built-in Strategies
| Strategy | Behavior |
|---|---|
| `NoPreloading` | Default. Load only when navigated to. |
| `PreloadAllModules` | Preload all lazy routes after initial load. |

### Custom Preloading Strategy
```typescript
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data?.['preload'] ? load() : of(null);
  }
}

// Mark routes to preload
{ path: 'dashboard', loadChildren: () => ..., data: { preload: true } }
```

> **Interview Tip**: A custom preloading strategy that preloads based on route data is a very common interview question.

---

## Quick Revision: Routing Checklist

| Concept | Modern Way | Legacy Way |
|---|---|---|
| Route setup | `provideRouter(routes)` | `RouterModule.forRoot(routes)` |
| Lazy loading | `loadComponent` / `loadChildren` with `import()` | `loadChildren: 'path#Module'` |
| Guards | Functional guards with `inject()` | Class-based with `CanActivate` interface |
| Reading params | Component input binding / `input()` | `ActivatedRoute` snapshot/observable |
| Transitions | `withViewTransitions()` | Manual animation |
| Resolvers | Functional `ResolveFn` | Class-based `Resolve<T>` |
