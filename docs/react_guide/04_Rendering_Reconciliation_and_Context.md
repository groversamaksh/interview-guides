# Rendering, Reconciliation, and Context

## 1. React Rendering Model

Rendering in React is the process of figuring out what the UI should look like.

### Render Phase
- React calls your component functions.
- It calculates the new Virtual DOM tree.
- This phase is **pure** and can be interrupted or discarded by Concurrent React.

### Commit Phase
- React applies the changes calculated in the Render phase to the actual DOM.
- Lifecycle methods and `useEffect`/`useLayoutEffect` hooks run here.
- This phase is **synchronous** and cannot be interrupted.

### Re-rendering and Batching
- A component re-renders when its state, props, or context changes.
- **Batching**: React groups multiple state updates into a single re-render for better performance. In React 18+, all updates are automatically batched, even inside promises or timeouts.

## 2. Reconciliation

Reconciliation is the diffing algorithm React uses to update the DOM efficiently.
1. Elements of different types produce entirely different trees (React tears down the old tree).
2. For elements of the same type, React keeps the DOM node and only updates changed attributes.

### Component Identity & Keys
- Keys help React identify which items in a list have changed, been added, or removed.
- Keys must be stable, predictable, and unique among siblings.

## 3. React Lifecycle Equivalents

| Class Lifecycle | Hook Equivalent |
|-----------------|-----------------|
| `constructor` | Function body before return (or `useMemo`/`useState` init) |
| `componentDidMount` | `useEffect(fn, [])` |
| `componentDidUpdate` | `useEffect(fn, [deps])` |
| `componentWillUnmount`| return function from `useEffect` |
| `getDerivedStateFromProps` | Setting state during render (rarely needed) |
| `componentDidCatch` | Error Boundary (still requires a Class component) |

## 4. Context API
Provides a way to pass data through the component tree without having to pass props down manually at every level.

### Context Creation & Consumption
```jsx
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```

### Performance Considerations
- Any component consuming the context will re-render when the Provider's `value` changes.
- To prevent unnecessary re-renders, split contexts into smaller pieces (e.g., `ThemeStateContext` and `ThemeDispatchContext`) or memoize the provider value object with `useMemo`.
