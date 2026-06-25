# HTTP Client & State Management

## 1. HttpClient Setup (Modern)

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor]),
      withFetch() // Uses fetch API instead of XMLHttpRequest
    )
  ]
};
```

> **Interview Note**: `provideHttpClient()` replaces the legacy `HttpClientModule`. The `withFetch()` option uses the modern `fetch` API under the hood instead of `XMLHttpRequest`.

---

## 2. Making HTTP Requests

### Basic CRUD
```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  // GET
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // GET by ID
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // POST
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // PUT
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // PATCH
  patchUser(id: string, changes: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, changes);
  }

  // DELETE
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Request Options
```typescript
// With headers
this.http.get<User[]>(url, {
  headers: new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'X-Custom-Header': 'value'
  })
});

// With query params
this.http.get<User[]>(url, {
  params: new HttpParams()
    .set('page', '1')
    .set('limit', '10')
    .set('sort', 'name')
});

// Observe full response (headers, status, etc.)
this.http.get<User[]>(url, { observe: 'response' }).pipe(
  tap(response => {
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('X-Total-Count'));
    console.log('Body:', response.body);
  })
);

// Get response as text
this.http.get(url, { responseType: 'text' });

// Download file as blob
this.http.get(url, { responseType: 'blob' });

// Track upload progress
this.http.post(url, formData, {
  reportProgress: true,
  observe: 'events'
}).pipe(
  filter(event => event.type === HttpEventType.UploadProgress),
  map(event => Math.round((event.loaded / (event.total ?? 1)) * 100))
);
```

---

## 3. Functional Interceptors (Modern, Angular 15+)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

// Auth Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};

// Logging Interceptor
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(`${req.method} ${req.url} → ${event.status} (${Date.now() - startTime}ms)`);
        }
      },
      error: (err) => {
        console.error(`${req.method} ${req.url} → ERROR`, err);
      }
    })
  );
};

// Retry Interceptor
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        if (error.status === 429 || error.status >= 500) {
          return timer(1000 * retryCount); // Exponential backoff
        }
        throw error; // Don't retry client errors
      }
    })
  );
};

// Error Handling Interceptor
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        inject(Router).navigate(['/login']);
      } else if (error.status === 403) {
        inject(Router).navigate(['/forbidden']);
      }
      return throwError(() => error);
    })
  );
};
```

> **Interview Tip**: Functional interceptors replaced class-based `HttpInterceptor` implementations. They are simpler and composable. Interceptors run in the order they are provided.

---

## 4. Using `resource()` and `rxResource()` (Angular 19+)

### `resource()` — Signal-based Data Fetching
```typescript
import { resource, Signal } from '@angular/core';

@Component({ /* ... */ })
export class UserComponent {
  userId = input.required<string>();

  userResource = resource({
    request: () => ({ id: this.userId() }),  // Reactive request
    loader: async ({ request, abortSignal }) => {
      const response = await fetch(`/api/users/${request.id}`, {
        signal: abortSignal  // Automatic cancellation!
      });
      return response.json() as Promise<User>;
    }
  });

  // Access states
  // this.userResource.value()     → the data (Signal<User | undefined>)
  // this.userResource.status()    → 'idle' | 'loading' | 'resolved' | 'error' | 'reloading'
  // this.userResource.error()     → error if any
  // this.userResource.isLoading() → boolean
}
```

### `rxResource()` — Observable-based Resource
```typescript
import { rxResource } from '@angular/core/rxjs-interop';

userResource = rxResource({
  request: () => ({ id: this.userId() }),
  loader: ({ request }) => {
    return this.http.get<User>(`/api/users/${request.id}`);
  }
});
```

### Using in Templates
```html
@if (userResource.isLoading()) {
  <app-spinner />
} @else if (userResource.error()) {
  <p>Error: {{ userResource.error() }}</p>
} @else {
  <h1>{{ userResource.value()?.name }}</h1>
}
```

> **Interview Note**: `resource()` is Angular's answer to React Query / SWR. It manages loading, error, and data states automatically and cancels previous requests when inputs change.

---

## 5. State Management Patterns

### Signal Store (NgRx SignalStore — Angular 17+)
```typescript
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';

type TodosState = {
  todos: Todo[];
  loading: boolean;
  filter: 'all' | 'active' | 'completed';
};

const initialState: TodosState = {
  todos: [],
  loading: false,
  filter: 'all'
};

export const TodosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredTodos: computed(() => {
      const todos = store.todos();
      const filter = store.filter();
      switch (filter) {
        case 'active': return todos.filter(t => !t.completed);
        case 'completed': return todos.filter(t => t.completed);
        default: return todos;
      }
    }),
    todosCount: computed(() => store.todos().length),
    completedCount: computed(() => store.todos().filter(t => t.completed).length),
  })),
  withMethods((store, todoService = inject(TodoService)) => ({
    async loadTodos() {
      patchState(store, { loading: true });
      const todos = await firstValueFrom(todoService.getAll());
      patchState(store, { todos, loading: false });
    },
    addTodo(title: string) {
      patchState(store, (state) => ({
        todos: [...state.todos, { id: crypto.randomUUID(), title, completed: false }]
      }));
    },
    toggleTodo(id: string) {
      patchState(store, (state) => ({
        todos: state.todos.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      }));
    },
    setFilter(filter: 'all' | 'active' | 'completed') {
      patchState(store, { filter });
    }
  }))
);
```

### Using SignalStore in a Component
```typescript
@Component({
  standalone: true,
  providers: [TodosStore], // Or use providedIn: 'root'
  template: `
    @if (store.loading()) {
      <app-spinner />
    } @else {
      <ul>
        @for (todo of store.filteredTodos(); track todo.id) {
          <li (click)="store.toggleTodo(todo.id)"
              [class.done]="todo.completed">
            {{ todo.title }}
          </li>
        }
      </ul>
      <p>{{ store.completedCount() }} / {{ store.todosCount() }} completed</p>
    }
  `
})
export class TodosComponent implements OnInit {
  store = inject(TodosStore);

  ngOnInit() {
    this.store.loadTodos();
  }
}
```

---

## 6. Classic NgRx (Redux Pattern)

```
User Action → Component dispatches Action → Reducer updates State → Selector emits new State → Component re-renders
```

### Actions
```typescript
import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const TodoActions = createActionGroup({
  source: 'Todos',
  events: {
    'Load Todos': emptyProps(),
    'Load Todos Success': props<{ todos: Todo[] }>(),
    'Load Todos Failure': props<{ error: string }>(),
    'Add Todo': props<{ title: string }>(),
    'Toggle Todo': props<{ id: string }>(),
    'Delete Todo': props<{ id: string }>(),
  }
});
```

### Reducer
```typescript
import { createReducer, on } from '@ngrx/store';

export interface TodosState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = { todos: [], loading: false, error: null };

export const todosReducer = createReducer(
  initialState,
  on(TodoActions.loadTodos, (state) => ({ ...state, loading: true })),
  on(TodoActions.loadTodosSuccess, (state, { todos }) => ({
    ...state, todos, loading: false
  })),
  on(TodoActions.loadTodosFailure, (state, { error }) => ({
    ...state, error, loading: false
  })),
  on(TodoActions.addTodo, (state, { title }) => ({
    ...state,
    todos: [...state.todos, { id: crypto.randomUUID(), title, completed: false }]
  })),
  on(TodoActions.toggleTodo, (state, { id }) => ({
    ...state,
    todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  }))
);
```

### Selectors
```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectTodosState = createFeatureSelector<TodosState>('todos');
export const selectAllTodos = createSelector(selectTodosState, s => s.todos);
export const selectLoading = createSelector(selectTodosState, s => s.loading);
export const selectActiveTodos = createSelector(selectAllTodos, todos =>
  todos.filter(t => !t.completed)
);
```

### Effects
```typescript
import { createEffect, Actions, ofType } from '@ngrx/effects';

export const loadTodos$ = createEffect(
  (actions$ = inject(Actions), todoService = inject(TodoService)) => {
    return actions$.pipe(
      ofType(TodoActions.loadTodos),
      switchMap(() =>
        todoService.getAll().pipe(
          map(todos => TodoActions.loadTodosSuccess({ todos })),
          catchError(error => of(TodoActions.loadTodosFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);
```

### Registration
```typescript
// app.config.ts
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

export const appConfig = {
  providers: [
    provideStore({ todos: todosReducer }),
    provideEffects(loadTodos$),
  ]
};
```

> **Interview Note**: NgRx SignalStore is the modern lightweight alternative. Classic NgRx (Redux-style) is still prevalent in large enterprise apps. Know both.

---

## 7. Simple Signal-Based State (No Library)

```typescript
@Injectable({ providedIn: 'root' })
export class CartStore {
  // Private writable signals
  private _items = signal<CartItem[]>([]);
  private _loading = signal(false);

  // Public read-only signals
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Computed
  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  readonly itemCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  // Methods
  addItem(item: CartItem) {
    this._items.update(items => {
      const existing = items.find(i => i.id === item.id);
      if (existing) {
        return items.map(i => i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...items, { ...item, quantity: 1 }];
    });
  }

  removeItem(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  clearCart() {
    this._items.set([]);
  }
}
```

### Usage in Component
```typescript
@Component({
  template: `
    <span class="badge">{{ cartStore.itemCount() }}</span>
    <p>Total: {{ cartStore.totalPrice() | currency }}</p>
  `
})
export class HeaderComponent {
  cartStore = inject(CartStore);
}
```

> **Interview Tip**: For small-to-medium apps, a signal-based service store is often sufficient and much simpler than NgRx.

---

## 8. State Management Comparison

| Approach | Complexity | Best For | Boilerplate |
|---|---|---|---|
| Signal-based service | Low | Small/medium apps | Minimal |
| NgRx SignalStore | Medium | Medium/large apps | Low |
| NgRx (Redux) | High | Enterprise, complex state | High |
| Simple BehaviorSubject | Low | Legacy, RxJS-heavy apps | Low |

---

## Quick Revision: HTTP & State

| Concept | Modern | Legacy |
|---|---|---|
| HTTP setup | `provideHttpClient()` | `HttpClientModule` |
| Interceptors | Functional `HttpInterceptorFn` | Class-based `HttpInterceptor` |
| Fetch API | `withFetch()` | N/A (XMLHttpRequest) |
| Data fetching | `resource()` / `rxResource()` | Manual service + subscribe |
| State mgmt | SignalStore / Signal services | NgRx Store (Redux) |
