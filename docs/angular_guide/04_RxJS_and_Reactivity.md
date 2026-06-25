# RxJS and Reactivity

## 1. RxJS Deep Dive

RxJS (Reactive Extensions for JavaScript) is a library for reactive programming using Observables.

### Observables vs Promises
- **Promise**: Single value, eager execution, not cancellable.
- **Observable**: Stream of multiple values over time, lazy execution (doesn't run until `subscribe()` is called), cancellable.

### Subjects
A Subject is a special type of Observable that acts as both a subscriber and an observable (multicasting).
- **Subject**: Emits values only *after* subscription. No initial value.
- **BehaviorSubject**: Requires an initial value. Emits the current/latest value to new subscribers. *Extremely common for state.*
- **ReplaySubject**: Replays a specified number of previous emissions to new subscribers.
- **AsyncSubject**: Emits only the final value, and only when the subject completes.

## 2. Essential Operators

Operators allow you to transform, filter, and combine streams before subscribing.

### Transformation
- `map`: Transforms the data payload.
- **Flattening Operators (Handling inner Observables)**:
  - `switchMap`: Cancels the previous inner observable if a new one arrives. *Perfect for HTTP searches.*
  - `mergeMap`: Runs all inner observables concurrently.
  - `concatMap`: Runs inner observables sequentially.
  - `exhaustMap`: Ignores new outer emissions while the inner observable is running. *Perfect for login buttons.*

### Filtering
- `filter`: Only allows values passing a condition.
- `take(n)`: Emits `n` values then completes.
- `debounceTime(ms)`: Waits `ms` of silence before emitting. *Used for search inputs.*
- `distinctUntilChanged`: Drops values if they are the same as the previous one.

### Combination
- `combineLatest`: Combines multiple observables, emitting an array of their latest values whenever *any* of them changes.
- `forkJoin`: Waits for all observables to *complete*, then emits their final values. *Used for parallel HTTP calls.*

### Utility
- `tap`: Used for side effects (e.g., logging) without altering the stream.
- `catchError`: Intercepts errors.
- `finalize`: Runs when the observable completes or errors.

## 3. Angular Reactivity: Signals vs RxJS

| Feature | Signals | RxJS |
| --- | --- | --- |
| Nature | Synchronous, Pull-based | Asynchronous, Push-based |
| Best For | Synchronous UI State | Events, HTTP, Async streams |
| Mental Model | Variables that update | Streams of events over time |
| Glitches | Glitch-free automatically | Can have glitches (diamond problem) |

### When to use which?
- Use **Signals** for Component State (e.g., counters, active tab, UI toggles).
- Use **RxJS** for Async Operations (e.g., HTTP requests, WebSockets, debouncing user input).
- *Interop*: Angular provides `toSignal` (RxJS -> Signal) and `toObservable` (Signal -> RxJS) to bridge the two.

### Interview Scenario
*Interviewer: "How do you handle a search input that queries an API?"*
**Answer**: "I would bind the input to a `FormControl`, listen to its `valueChanges` Observable, apply `debounceTime(300)` and `distinctUntilChanged()`, then use `switchMap()` to call the HTTP service. `switchMap` ensures that if the user types quickly, previous pending API requests are cancelled, preventing race conditions."
