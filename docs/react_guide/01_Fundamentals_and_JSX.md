# React Fundamentals & JSX

## 1. What is React?
React is an open-source JavaScript library developed by Meta for building user interfaces. It focuses on the view layer (the "V" in MVC) and allows developers to build complex UIs from small, isolated pieces of code called "components."

**Why React exists?**
- To solve the problem of managing complex UI states in single-page applications.
- To improve performance by minimizing direct DOM manipulation (which is slow).

## 2. Core Concepts
- **Declarative UI**: You describe *what* the UI should look like for a given state, and React handles *how* to update the DOM to match it.
- **Component-Based Architecture**: UIs are broken down into reusable, self-contained components that manage their own state.
- **Virtual DOM**: A lightweight JavaScript representation of the actual DOM. React updates the Virtual DOM first, calculates the differences, and updates the real DOM efficiently.
- **Reconciliation**: The process of comparing the new Virtual DOM with the previous one (diffing algorithm) and applying only the necessary changes to the real DOM.

## 3. JSX Syntax
JSX is a syntax extension for JavaScript that looks similar to XML/HTML. It gets compiled into `React.createElement()` calls.

### Expressions
You can embed any valid JavaScript expression inside curly braces `{}`.
```jsx
const name = "Alice";
const element = <h1>Hello, {name}!</h1>;
```

### Fragments
Fragments let you group a list of children without adding extra nodes to the DOM.
```jsx
return (
  <>
    <ChildA />
    <ChildB />
  </>
);
```

### Conditional Rendering
```jsx
// Logical AND
{isLoggedIn && <Dashboard />}

// Ternary Operator
{isLoggedIn ? <LogoutButton /> : <LoginButton />}
```

### Lists and Keys
When rendering lists, each item needs a unique `key` prop so React can identify which items have changed, been added, or removed during reconciliation.
```jsx
const items = [{ id: 1, text: 'A' }, { id: 2, text: 'B' }];
return (
  <ul>
    {items.map(item => <li key={item.id}>{item.text}</li>)}
  </ul>
);
```

**Common Mistake**: Using the array index as a key can cause bugs with component state and performance issues if the list order changes. Always use a stable, unique ID.
