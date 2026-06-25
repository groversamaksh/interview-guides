# Performance and Concurrent React

## 1. React Performance Optimization

### React.memo
A higher-order component that prevents a component from re-rendering if its props have not changed (shallow comparison).
```jsx
const MemoizedComponent = React.memo(MyComponent);
```

### useMemo and useCallback
See Section 3 for details on memoizing expensive calculations and function definitions.

### Lazy Loading and Code Splitting
Reduces the initial bundle size by loading components only when they are needed.
```jsx
const HeavyChart = React.lazy(() => import('./HeavyChart'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### Virtualization
For rendering massive lists. Instead of rendering 10,000 DOM nodes, libraries like `react-window` only render the 20 nodes currently visible in the viewport.

## 2. Concurrent React

A set of features introduced in React 18 that allows React to interrupt a heavy render to handle a more urgent task (like a user click).

### Transitions
Transitions let you mark a state update as non-urgent. Urgent updates (typing in an input) can interrupt non-urgent updates (rendering a heavy list).

```jsx
const [isPending, startTransition] = useTransition();

function handleChange(e) {
  // Urgent: updates the input box immediately
  setInputValue(e.target.value);
  
  // Non-urgent: can be interrupted
  startTransition(() => {
    setSearchQuery(e.target.value);
  });
}
```

### Suspense
Lets you declarative "wait" for something (code, data) to load before rendering the UI, showing a fallback in the meantime.

```jsx
<Suspense fallback={<h1>Loading profile...</h1>}>
  <ProfileDetails />
  <Suspense fallback={<h1>Loading posts...</h1>}>
    <ProfilePosts />
  </Suspense>
</Suspense>
```

### Error Boundaries
Catch JavaScript errors anywhere in their child component tree, log them, and display a fallback UI instead of crashing the whole app. *Must be implemented as a Class Component.*
```jsx
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}
```
