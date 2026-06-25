# Dependency Injection, Signals, and Change Detection

## 1. Dependency Injection (DI) Deep Dive

DI is how Angular wires applications together. Instead of instantiating dependencies (e.g., `new AuthService()`), you ask Angular's Injector to provide them.

### Providers and Tree-Shakable Services
Modern Angular uses `providedIn: 'root'`. This registers the service with the root injector, making it a singleton across the app and inherently tree-shakable (if it's not injected anywhere, it's removed from the final bundle).
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService { }
```

### Injector Hierarchy
- **EnvironmentInjector**: Configured at application bootstrap (providers in `bootstrapApplication`).
- **ElementInjector**: Created implicitly at each DOM element. If a component specifies `providers: [MyService]`, it gets its own instance, shadowing the root instance.

### InjectionTokens
Used for providing primitive values or interfaces (which don't have a runtime representation).
```typescript
export const API_URL = new InjectionToken<string>('API_URL');
// Provide it: { provide: API_URL, useValue: 'https://api.example.com' }
```

## 2. Angular Signals Deep Dive (Angular 16+)

Signals represent the future of Angular reactivity. A Signal is a wrapper around a value that can notify interested consumers when that value changes.

### Core Signal APIs
1. **`signal()`**: A writable signal.
```typescript
const count = signal(0);
count.set(1);
count.update(c => c + 1);
console.log(count()); // read value
```

2. **`computed()`**: A read-only, declarative signal that derives its value from other signals. It is memoized and lazy.
```typescript
const doubleCount = computed(() => count() * 2);
```

3. **`effect()`**: Used for side effects. Runs whenever signals it reads change. (Don't use effects to set other signals; use `computed` instead).
```typescript
effect(() => {
  console.log(`The count is now: ${count()}`);
});
```

4. **`linkedSignal()` / `resource()`** (Angular 19+): Advanced APIs for deriving state that can be reset, and managing async data streams natively without RxJS.

### Why Signals?
- Predictable, fine-grained reactivity.
- **Zoneless Angular**: Signals allow Angular to know *exactly* what changed, paving the way to completely remove `Zone.js` (which currently monkeys-patches the browser to trigger change detection globally).

## 3. Change Detection

Change Detection (CD) is the mechanism Angular uses to sync the component state with the DOM.

### Default Strategy (`ChangeDetectionStrategy.Default`)
Angular checks the *entire* component tree every time an event occurs (click, timer, HTTP response), relying on `Zone.js`. This is safe but inefficient for large apps.

### OnPush Strategy (`ChangeDetectionStrategy.OnPush`)
Angular only checks a component if:
1. One of its `@Input()` references changes.
2. An event originates from the component itself.
3. An `async` pipe or a Signal updates.
4. `ChangeDetectorRef.markForCheck()` is called manually.

*Best Practice: Use `OnPush` on almost all components in an enterprise app.*

### Zoneless Angular (Experimental)
By removing `Zone.js` and relying entirely on Signals, Angular can perform localized, targeted DOM updates without checking the rest of the application tree.
