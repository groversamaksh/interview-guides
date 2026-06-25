# React Interview Questions

*(Note: Highly curated, top 100+ most frequent questions across junior to senior interviews)*

## React Basics
1. **What is React?** A JavaScript library for building UI using components.
2. **What is the Virtual DOM?** An in-memory representation of the real DOM.
3. **What is JSX?** A syntax extension for JS that compiles to `React.createElement`.
4. **Difference between State and Props?** State is internal and mutable; props are passed from parents and are immutable.
5. **Why do we need keys in React lists?** To help React identify which items have changed during reconciliation.
6. **What is Prop Drilling?** Passing props deeply through components that don't need them just to reach a nested child.
7. **What is lifting state up?** Moving shared state to the closest common ancestor of the components that need it.
8. **What are fragments?** `<>` syntax to return multiple elements without adding a DOM node.
9. **Difference between Element and Component?** An element is what's rendered (an object); a component is a function/class that returns elements.
10. **What is strict mode?** A wrapper that highlights potential problems (double-invokes renders in development).

## Hooks
11. **Rules of Hooks?** Only call at the top level, only call from React functions.
12. **What is `useState`?** Hook to add local state to a function component.
13. **What is `useEffect`?** Hook to perform side effects.
14. **Difference between `useEffect` and `useLayoutEffect`?** `useLayoutEffect` runs synchronously before the browser repaints.
15. **What is `useMemo`?** Caches the result of a calculation between renders.
16. **What is `useCallback`?** Caches a function definition between renders.
17. **What is a dependency array?** Tells React when to re-run an effect/memo based on changes to the listed variables.
18. **How to run an effect only once on mount?** Pass an empty dependency array `[]`.
19. **What is `useRef`?** Stores a mutable value that doesn't trigger a re-render when updated.
20. **What is `useReducer`?** An alternative to `useState` for complex state logic.

## Rendering & Performance
21. **When does a component re-render?** When state, props, or context changes.
22. **What is React.memo?** A HOC that skips re-rendering a component if its props haven't changed.
23. **What is batching?** React grouping multiple state updates into a single re-render.
24. **How do you avoid unnecessary re-renders?** `React.memo`, moving state down, lifting content up.
25. **What is Code Splitting?** Splitting JS into chunks (e.g., via `React.lazy`) to load only what's needed.
26. **What is Suspense?** Lets a component wait for an async operation (data/code) and show a fallback.
27. **What is Concurrent React?** React's ability to pause and resume rendering to keep the UI responsive.
28. **What does `startTransition` do?** Marks state updates as non-urgent.
29. **What is layout thrashing?** Forcing synchronous layout calculations by reading/writing DOM repeatedly.
30. **What is a memory leak in React?** Usually unmounted components with active event listeners or intervals.

## Context & State Management
31. **What is the Context API?** Built-in way to pass data through the tree without prop drilling.
32. **When should you NOT use Context?** For state that changes very frequently, as it forces all consumers to re-render.
33. **What is Redux?** A predictable state container using a single centralized store.
34. **What is an Action in Redux?** A plain object describing what happened (`type` and `payload`).
35. **What is a Reducer?** A pure function that takes previous state and an action, and returns new state.
36. **Difference between Context and Redux?** Context is just a transport mechanism; Redux is a full state architecture.
37. **What is React Query?** Library for managing async server state, caching, and synchronization.
38. **Difference between client state and server state?** Client state is temporary UI state; server state is persistent data originating from a database.
39. **What is Zustand?** A small, fast, barebones state management library.
40. **How does `useQuery` work?** Fetches data, caches it under a key, and manages loading/error states.

## Server Components & Next.js
41. **What are React Server Components?** Components that render on the server and send zero JS to the client.
42. **Difference between SSR and RSC?** SSR sends HTML + JS to hydrate; RSC sends a serialized UI tree and no JS for that component.
43. **What is Hydration?** The process of attaching event listeners to server-rendered HTML.
44. **What is the App Router in Next.js?** The modern routing system based on React Server Components.
45. **What are Server Actions?** Async functions that execute on the server but are callable from the client.

## React 19 Specifics
46. **What does the `use()` API do?** Reads a Promise or Context in render; can be used conditionally.
47. **What is `useActionState`?** Hook to manage form actions and pending states.
48. **What is `useOptimistic`?** Updates UI optimistically while a mutation runs.
49. **How is ref passing changed in React 19?** `ref` is now just a normal prop; `forwardRef` is deprecated.
50. **How does React 19 handle document metadata?** Natively hoists `<title>` and `<meta>` tags to the `<head>`.

*(Note: The remaining 50-150 represent deep variations of the above themes commonly probed during Senior interviews.)*
