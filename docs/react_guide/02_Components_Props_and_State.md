# Components, Props, and State

## 1. Components
### Function Components
The modern way to write React components. They are simple JavaScript functions that accept props and return JSX.
```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

### Component Composition
Building complex UIs by combining smaller, simpler components.
```jsx
function App() {
  return (
    <Page>
      <Header />
      <MainContent />
      <Footer />
    </Page>
  );
}
```

### Container vs Presentational Components
*Note: Less strictly enforced with modern Hooks, but still a valid mental model.*
- **Container**: Manages data fetching, state, and business logic.
- **Presentational**: Focuses purely on how things look; receives data via props.

### Advanced Component Patterns
- **Compound Components**: Components that work together and share state implicitly (e.g., `<Select>`, `<Select.Option>`).
- **Render Props**: A technique for sharing code between components using a prop whose value is a function.
- **Higher Order Components (HOCs)**: A function that takes a component and returns a new component (e.g., `withAuth(Profile)`). *Disadvantage: Can lead to "wrapper hell" and prop collisions. Custom hooks are generally preferred now.*

## 2. Props
Props (Properties) are read-only data passed from a parent component to a child component.

### Passing Props and Children
```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Usage
<Card title="Profile">
  <p>User details here.</p>
</Card>
```

### Prop Drilling
The issue of passing props down multiple levels of nested components just to reach a deeply nested child.
*Solution*: Component Composition, Context API, or State Management libraries.

## 3. State Management Fundamentals
State represents the data that changes over time and affects what is rendered.

- **Local State**: State specific to a single component (e.g., an input's value or a toggle). Managed via `useState`.
- **Shared State**: State needed by multiple components. Managed by "lifting state up" to the closest common ancestor.
- **Derived State**: Data that can be computed from existing state or props. *Avoid storing derived state in `useState`; calculate it on the fly during render.*
- **Server State**: Data that originates from an asynchronous API/server. Often managed by tools like React Query or SWR, as it requires caching, invalidation, and loading states.
