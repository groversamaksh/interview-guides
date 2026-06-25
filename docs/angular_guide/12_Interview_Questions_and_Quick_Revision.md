# Interview Questions & Quick Revision

## 1. Top 100+ Angular Interview Questions

### Fundamentals (Beginner)
1. **What is Angular?** A TypeScript-based, component-driven web framework maintained by Google.
2. **How does Angular differ from AngularJS?** Complete rewrite. Angular uses TypeScript, components (not controllers), and a modern rendering engine.
3. **What are the building blocks of Angular?** Components, Templates, Directives, Services, DI, Pipes, Routing, Modules (legacy).
4. **What is a Component?** A class with `@Component` decorator that has a template, styles, and logic.
5. **What is a Template?** The HTML view of a component, with Angular syntax for data binding and control flow.
6. **What are Standalone Components?** Components that declare their own dependencies via `imports` array instead of NgModules. Default since Angular 17.
7. **What is Data Binding?** Connecting component data to the template. Types: interpolation `{{ }}`, property `[ ]`, event `( )`, two-way `[( )]`.
8. **What is Interpolation?** Embedding expressions in the template: `{{ expression }}`.
9. **What is the difference between `[property]` and `{{ }}`?** Property binding sets a DOM property; interpolation converts to string.
10. **What is `[(ngModel)]`?** Two-way data binding shorthand (banana-in-a-box syntax). Combines `[ngModel]` and `(ngModelChange)`.

### Core Concepts (Intermediate)
11. **Explain Angular's Dependency Injection system.** A hierarchical injector creates and delivers services. Components/services declare dependencies in constructors or via `inject()`.
12. **What are the DI provider scopes?** `providedIn: 'root'` (singleton), component-level (per-instance), route-level, platform-level.
13. **What is `inject()` function?** Modern way to inject dependencies without constructor parameters. Works in constructors, field initializers, and factory functions.
14. **What is Change Detection?** The process Angular uses to check if component data has changed and update the DOM accordingly.
15. **Explain `OnPush` change detection.** Component is only checked when: inputs change reference, DOM event occurs within, async pipe emits, signal changes, or `markForCheck()` is called.
16. **What are Lifecycle Hooks?** Methods called at specific points: `ngOnInit`, `ngOnChanges`, `ngDoCheck`, `ngAfterViewInit`, `ngAfterContentInit`, `ngOnDestroy`, etc.
17. **What is `ngOnInit` vs constructor?** Constructor is for DI setup. `ngOnInit` runs after inputs are set — use for initialization logic.
18. **What are Directives?** Classes that modify DOM elements. Types: Component (with template), Structural (change DOM layout), Attribute (change behavior/appearance).
19. **Explain the difference between `ngIf` and `@if`.** Both conditionally render. `@if` is the modern built-in control flow (Angular 17+), compiled into the template engine for better performance. No import needed.
20. **What is `trackBy` / `track`?** Identifies items in lists for efficient DOM reuse. `@for (item of items; track item.id)` is required in new control flow.

### Signals & Reactivity
21. **What are Signals?** Reactive primitives that hold values and notify consumers when they change. Core to modern Angular reactivity.
22. **What is `signal()`?** Creates a writable signal: `count = signal(0)`.
23. **What is `computed()`?** Creates a derived signal that auto-updates: `double = computed(() => this.count() * 2)`.
24. **What is `effect()`?** Runs side effects when signals it reads change. Used for logging, localStorage sync, etc.
25. **What is `input()`?** Signal-based input: `name = input<string>()`. Replaces `@Input()`.
26. **What is `output()`?** Creates an output emitter: `clicked = output<void>()`. Replaces `@Output()`.
27. **What is `model()`?** Two-way binding signal input: `value = model<string>()`.
28. **Difference between Signals and Observables?** Signals are synchronous, always have a value, pull-based. Observables are async, push-based, can represent streams over time.
29. **What is `toSignal()`?** Converts an Observable to a Signal.
30. **What is `toObservable()`?** Converts a Signal to an Observable.
31. **What is `linkedSignal()`?** Creates a writable signal that resets when a source signal changes. Angular 19+.

### Routing
32. **How does Angular Router work?** Matches URL to route config, activates component, renders in `<router-outlet>`.
33. **What is lazy loading?** Loading route components/bundles on demand via `loadComponent` / `loadChildren`.
34. **What are Route Guards?** Functions that control route access: `canActivate`, `canDeactivate`, `canMatch`, `resolve`.
35. **What is a Resolver?** Pre-fetches data before route activation.
36. **What is `withComponentInputBinding()`?** Automatically binds route params, query params, and data to component `input()` signals.
37. **What is `@defer`?** Template-level lazy loading. Defers loading of component code until a trigger (viewport, interaction, idle, timer).

### Forms
38. **Template-driven vs Reactive forms?** Template-driven uses directives in HTML. Reactive uses explicit FormGroup/FormControl in TypeScript. Reactive is preferred for complex forms.
39. **What is `FormGroup`?** A group of `FormControl` instances, forming a section of a form.
40. **What is `FormArray`?** A dynamic array of form controls for repeated fields.
41. **What are Typed Forms?** Angular 14+ feature where `FormGroup` and `FormControl` are strictly typed.
42. **How do you create a custom validator?** Return a function `(control: AbstractControl) => ValidationErrors | null`.
43. **What is a cross-field validator?** A validator applied to a `FormGroup` that validates multiple fields together (e.g., password confirmation).
44. **What are async validators?** Validators that return `Observable<ValidationErrors | null>` or `Promise` (e.g., checking if email exists via API).

### HTTP & State
45. **What is `HttpClient`?** Angular's HTTP service for making REST API calls. Returns Observables.
46. **What are Interceptors?** Middleware that intercepts HTTP requests/responses. Used for auth tokens, logging, error handling.
47. **Functional vs Class-based Interceptors?** Functional (`HttpInterceptorFn`) is the modern approach (Angular 15+). Simpler, no class boilerplate.
48. **What is `resource()`?** Signal-based data fetching (Angular 19+). Manages loading/error/data states automatically.
49. **What is NgRx?** State management library following Redux pattern: Actions → Reducers → Store → Selectors.
50. **What is NgRx SignalStore?** Modern lightweight state management using Signals. Simpler than Redux-style NgRx.

### SSR & Performance
51. **What is SSR in Angular?** Server-Side Rendering — the server generates full HTML for faster initial load and SEO.
52. **What is Hydration?** Attaching Angular event listeners to server-rendered HTML without re-rendering the DOM.
53. **What is Incremental Hydration?** Hydrating individual components lazily based on triggers (viewport, interaction).
54. **What is Event Replay?** Capturing user events during hydration and replaying them once Angular is ready.
55. **What is Zoneless Angular?** Running without Zone.js, using Signals exclusively for change detection.
56. **What is `afterNextRender()`?** Runs code once, only in the browser, after the next render. Replaces `ngAfterViewInit` for browser-only code.
57. **What is `NgOptimizedImage`?** A directive for optimized image loading with lazy loading, priority hints, and CDN support.

### Advanced
58. **What are Host Directives?** Composing directive behaviors into components without inheritance. Angular 15+.
59. **What is Content Projection?** Passing content into a component via `<ng-content>`. Supports named slots.
60. **What is `ng-template`?** A template that is not rendered by default. Used with structural directives and `ngTemplateOutlet`.
61. **What is `ng-container`?** A grouping element that doesn't add extra DOM nodes.
62. **What is the `async` pipe?** Subscribes to an Observable/Promise and returns the emitted value. Automatically unsubscribes on destroy.
63. **Pure vs Impure Pipes?** Pure pipes re-evaluate only when input reference changes. Impure pipes re-evaluate every CD cycle.
64. **What is `ViewContainerRef`?** A reference to a container where views can be dynamically created.
65. **What is `TemplateRef`?** A reference to an `ng-template` that can be used to create embedded views.

### Enterprise & Architecture
66. **What is the Smart/Dumb component pattern?** Smart components handle data/logic. Dumb components handle presentation only via inputs/outputs.
67. **What is a Monorepo?** Single repo containing multiple projects. Tools: Nx, Angular CLI workspaces.
68. **What is Module Federation?** Loading remote Angular apps at runtime for micro-frontend architecture.
69. **What is `APP_INITIALIZER`?** Runs initialization logic before the app starts (config loading, auth setup).
70. **What is `ErrorHandler`?** Global error handling service that catches unhandled errors.

---

## 2. Angular Version History (Key Features)

| Version | Year | Key Features |
|---|---|---|
| Angular 14 | 2022 | Typed Forms, Standalone Components (developer preview), `inject()` function |
| Angular 15 | 2022 | Standalone Components stable, Functional Guards/Interceptors, Directive Composition |
| Angular 16 | 2023 | Signals (developer preview), Hydration, `input()` signal, `afterNextRender` |
| Angular 17 | 2023 | New control flow (`@if`, `@for`, `@switch`), `@defer`, `withViewTransitions()`, Signals stable |
| Angular 18 | 2024 | Zoneless (experimental), Material 3, `resource()` preview |
| Angular 19 | 2024 | `resource()` / `rxResource()`, `linkedSignal()`, Incremental Hydration, `input()` defaults |
| Angular 20 | 2025 | Zoneless stable, Signal-based Forms (preview), Standalone-only (no NgModule) |

---

## 3. Angular vs React vs Vue

| Feature | Angular | React | Vue |
|---|---|---|---|
| **Type** | Framework | Library | Framework |
| **Language** | TypeScript (required) | JavaScript/TypeScript | JavaScript/TypeScript |
| **Rendering** | Real DOM + change detection | Virtual DOM + reconciliation | Virtual DOM + reactivity |
| **State** | Signals, Services, NgRx | useState, Context, Redux | Refs, Reactive, Pinia |
| **Routing** | Built-in (`@angular/router`) | External (React Router) | Built-in / Vue Router |
| **Forms** | Built-in (Template & Reactive) | External (Formik, React Hook Form) | v-model |
| **DI** | Built-in (hierarchical) | None (props/context) | Provide/Inject |
| **Learning Curve** | Steep | Moderate | Gentle |
| **Best For** | Enterprise, large teams | Flexible, large ecosystem | Rapid prototyping, medium apps |

---

## 4. Common Anti-Patterns & Mistakes

| Anti-Pattern | Why It's Bad | Fix |
|---|---|---|
| Subscribing without unsubscribing | Memory leaks | Use `async` pipe, `takeUntilDestroyed()`, `DestroyRef` |
| Using `any` everywhere | Loses TypeScript benefits | Define proper interfaces and types |
| Fat components | Hard to test, maintain | Extract to services and child components |
| Direct DOM manipulation | Breaks SSR, bypasses Angular | Use `Renderer2`, directives, or template bindings |
| Putting logic in templates | Hard to debug and test | Move to component methods or computed signals |
| Not using `OnPush` | Poor performance | Use `OnPush` + Signals |
| Using `ngOnChanges` for everything | Complex, error-prone | Use `input()` signals with `effect()` or `computed()` |
| Deeply nested subscriptions | Callback hell | Use RxJS operators (`switchMap`, `concatMap`) |
| Not lazy loading routes | Large initial bundle | Use `loadComponent` / `loadChildren` |
| Circular dependencies | Build errors, runtime bugs | Restructure, use `InjectionToken` |

---

## 5. Quick Revision: Modern Angular Checklist

### ✅ Always Do
- [ ] Use Standalone Components (no NgModules)
- [ ] Use `input()`, `output()`, `model()` signal APIs
- [ ] Use `@if`, `@for`, `@switch` control flow
- [ ] Use `inject()` function instead of constructor injection
- [ ] Use `OnPush` change detection + Signals
- [ ] Use functional guards and interceptors
- [ ] Use `provideRouter()`, `provideHttpClient()`
- [ ] Use `@defer` for lazy-loading non-critical UI
- [ ] Use `trackBy` / `track` in loops
- [ ] Handle unsubscription (`takeUntilDestroyed`, `DestroyRef`, `async` pipe)

### ❌ Avoid
- [ ] NgModules (except for legacy libraries)
- [ ] `@Input()` / `@Output()` decorators (use signal APIs)
- [ ] `*ngIf`, `*ngFor`, `[ngSwitch]` (use built-in control flow)
- [ ] Class-based guards/interceptors/resolvers
- [ ] Constructor injection (use `inject()`)
- [ ] `ngOnChanges` (use `effect()` or `computed()`)
- [ ] `Zone.js` reliance (prepare for zoneless)

---

## 6. Signals Quick Reference

| API | Purpose | Example |
|---|---|---|
| `signal(value)` | Writable signal | `count = signal(0)` |
| `computed(() => ...)` | Derived signal | `double = computed(() => count() * 2)` |
| `effect(() => ...)` | Side effect | `effect(() => console.log(count()))` |
| `input()` | Component input | `name = input<string>()` |
| `input.required()` | Required input | `id = input.required<number>()` |
| `output()` | Component output | `clicked = output<void>()` |
| `model()` | Two-way binding | `value = model('')` |
| `viewChild()` | Template query | `el = viewChild<ElementRef>('ref')` |
| `viewChildren()` | Template query (many) | `items = viewChildren(ItemComponent)` |
| `contentChild()` | Projected content query | `header = contentChild(HeaderDirective)` |
| `contentChildren()` | Projected content query (many) | `tabs = contentChildren(TabComponent)` |
| `toSignal(obs$)` | Observable → Signal | `users = toSignal(users$)` |
| `toObservable(sig)` | Signal → Observable | `count$ = toObservable(count)` |
| `linkedSignal()` | Resettable derived signal | `selected = linkedSignal(() => items()[0])` |
| `resource()` | Async data fetching | `userRes = resource({ loader: ... })` |
| `rxResource()` | RxJS-based resource | `userRes = rxResource({ loader: ... })` |

---

## 7. RxJS Quick Reference

| Operator | Category | Purpose |
|---|---|---|
| `map` | Transformation | Transform emitted values |
| `filter` | Filtering | Emit only values that pass a predicate |
| `switchMap` | Higher-order | Cancel previous, switch to new inner Observable |
| `mergeMap` | Higher-order | Run inner Observables concurrently |
| `concatMap` | Higher-order | Queue inner Observables sequentially |
| `exhaustMap` | Higher-order | Ignore new while current is active |
| `combineLatest` | Combination | Emit latest values from all sources |
| `forkJoin` | Combination | Wait for all to complete, emit last values |
| `debounceTime` | Timing | Wait N ms of silence before emitting |
| `distinctUntilChanged` | Filtering | Skip consecutive duplicates |
| `tap` | Utility | Side effects without transforming |
| `catchError` | Error | Handle errors, return fallback |
| `retry` | Error | Retry on error |
| `takeUntil` | Filtering | Complete when another Observable emits |
| `takeUntilDestroyed` | Angular | Complete when component is destroyed |
| `share` | Multicasting | Share a single subscription among multiple subscribers |
| `shareReplay` | Multicasting | Share + replay last N values to new subscribers |
| `startWith` | Combination | Emit initial value before source |
| `withLatestFrom` | Combination | Combine with latest value from another source |
| `scan` | Transformation | Accumulate values (like reduce) |
| `of` | Creation | Create from values |
| `from` | Creation | Create from Promise/Array/Iterable |
| `interval` | Creation | Emit sequential numbers at interval |
| `Subject` | Multicasting | Both Observable and Observer |
| `BehaviorSubject` | Multicasting | Subject with current value |
| `ReplaySubject` | Multicasting | Subject that replays N values |

---

## 8. CLI Commands Quick Reference

| Command | Purpose |
|---|---|
| `ng new my-app --ssr --style scss` | Create new project with SSR and SCSS |
| `ng generate component my-comp` | Generate component |
| `ng generate service my-service` | Generate service |
| `ng generate guard auth` | Generate guard |
| `ng generate pipe truncate` | Generate pipe |
| `ng generate directive highlight` | Generate directive |
| `ng generate environments` | Generate environment files |
| `ng serve` | Start dev server |
| `ng build` | Production build |
| `ng test` | Run unit tests |
| `ng e2e` | Run E2E tests |
| `ng lint` | Lint the project |
| `ng update` | Update Angular packages |
| `ng add @angular/material` | Add Angular Material |
| `ng add @angular/ssr` | Add SSR to existing project |
