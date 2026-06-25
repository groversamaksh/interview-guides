# React Hooks

Hooks allow function components to "hook into" React state and lifecycle features.

## 1. Core Hooks

### useState
Manages local state.
```jsx
const [count, setCount] = useState(0);
// Use functional updater if new state depends on old state
setCount(prev => prev + 1);
```

### useEffect
Performs side effects (data fetching, subscriptions, DOM manipulation).
```jsx
useEffect(() => {
  const sub = subscribe();
  // Cleanup function runs before the next effect or on unmount
  return () => sub.unsubscribe();
}, [dependency]); // Empty array = run once on mount
```

### useContext
Consumes a context value without a Provider wrapper.
```jsx
const theme = useContext(ThemeContext);
```

### useReducer
Alternative to `useState` for complex state logic involving multiple sub-values.
```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### useRef
Holds a mutable value that does *not* cause a re-render when updated. Also used to access DOM elements.
```jsx
const inputRef = useRef(null);
inputRef.current.focus();
```

## 2. Performance Hooks

### useMemo
Memoizes the *result* of a calculation between renders.
- **When to use**: Expensive calculations, or maintaining referential equality of objects passed to memoized children.
- **When NOT to use**: Cheap calculations. The overhead of memoization can cost more than the recalculation itself.
```jsx
const expensiveResult = useMemo(() => computeMath(a, b), [a, b]);
```

### useCallback
Memoizes a *function definition* between renders.
- **When to use**: When passing callbacks to optimized child components (using `React.memo`) to prevent unnecessary re-renders.
```jsx
const handleClick = useCallback(() => doSomething(id), [id]);
```

## 3. Layout Hooks

### useLayoutEffect
Fires synchronously *after* all DOM mutations but *before* the browser paints. Used to measure DOM nodes and trigger synchronous re-renders to avoid visual flickering.

### useInsertionEffect
Specifically for CSS-in-JS libraries to inject styles before any layout effects read layout.

## 4. React 19 Hooks & Features

### use()
Reads the value of a Promise or Context directly within render. Integrates deeply with Suspense.
```jsx
// Can be called conditionally (unlike standard hooks)!
const data = use(fetchPromise);
```

### useActionState()
Manages the state of asynchronous actions, particularly for forms.
```jsx
const [state, action, isPending] = useActionState(submitForm, null);
```

### useFormStatus()
Provides status information about the parent `<form>` without prop drilling.
```jsx
const { pending } = useFormStatus();
```

### useOptimistic()
Optimistically updates UI while a background mutation is running.
```jsx
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

## 5. Custom Hooks
Extracting logic into reusable functions prefixed with `use`. They compose existing hooks.
```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}
```
