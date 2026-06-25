# React 19 Features & Suspense Deep Dive

## 1. React 19 Features

React 19 formalizes features initially designed for Server Components and frameworks, bringing them to the core library.

### Actions
Async transitions are now formally called "Actions". They handle pending states, errors, forms, and optimistic updates automatically.

### useActionState
Designed specifically for handling the lifecycle of Actions.
```jsx
import { useActionState } from 'react';

async function increment(previousState, formData) {
  return previousState + 1;
}

function StatefulForm() {
  const [state, formAction, isPending] = useActionState(increment, 0);
  return (
    <form action={formAction}>
      {state}
      <button disabled={isPending}>Increment</button>
    </form>
  );
}
```

### Form Actions
You can pass a function directly to the `<form action={fn}>` prop. React automatically manages the submission and transition state.

### useOptimistic
Updates the UI optimistically while a background mutation is occurring.
```jsx
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (state, newMessage) => [...state, { text: newMessage, sending: true }]
);
```

### use()
The `use()` API allows reading the value of Promises and Contexts during render. It suspends the component until the Promise resolves. Unlike other hooks, it can be called conditionally.

### Metadata APIs
Native support for rendering `<title>`, `<meta>`, and `<link>` tags directly from components anywhere in the tree. React hoists them to the `<head>` automatically.

## 2. Suspense Deep Dive

Suspense handles asynchronous dependencies (code or data) elegantly.

- **Data Fetching**: When using `use(promise)`, React throws the unresolved promise up the tree. The nearest `<Suspense>` boundary catches it and renders the fallback. Once the promise resolves, React retries rendering the component.
- **Nested Boundaries**: Suspense boundaries can be nested. React prioritizes rendering the outer boundary first, progressively revealing the inner boundaries as their data resolves.
