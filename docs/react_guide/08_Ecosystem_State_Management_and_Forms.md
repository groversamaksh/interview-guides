# Ecosystem, State Management, and Forms

## 1. State Management Comparison

| Library | Core Concept | Pros | Cons | Best For |
| --- | --- | --- | --- | --- |
| Context API | Prop passing | Built-in, zero setup | Causes unnecessary re-renders | Theming, auth state |
| Redux Toolkit | Central store, reducers | Highly scalable, great devtools | Boilerplate, complex | Massive enterprise apps |
| Zustand | Minimalist hooks | Tiny API, no boilerplate | Lacks opinions | Medium-to-large apps |
| Jotai | Atomic state | Fixes context re-renders | Niche ecosystem | High frequency updates |

## 2. Redux Toolkit (RTK)
The modern, official way to write Redux.
- **Store**: The global state container.
- **Slice**: A combination of reducers, actions, and initial state for one specific feature.
- **Async Thunks**: `createAsyncThunk` handles async logic (like API calls) and dispatches lifecycle actions (pending, fulfilled, rejected).

```javascript
const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: state => state + 1
  }
});
```

## 3. TanStack Query (React Query)
The industry standard for managing **Server State**.
- **Queries**: `useQuery` fetches and caches data.
- **Mutations**: `useMutation` creates/updates/deletes data.
- **Invalidation**: `queryClient.invalidateQueries` forces a refetch.
- **Optimistic Updates**: Manually updating the cache before the mutation finishes, rolling back if it fails.

```jsx
const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
});
```

## 4. Forms

### Controlled vs. Uncontrolled Components
- **Controlled**: Form data is handled by React state (`value={state} onChange={setState}`).
- **Uncontrolled**: Form data is handled by the DOM (accessed via `useRef`).

### React Hook Form
The standard for complex forms. It uses uncontrolled inputs internally for massive performance gains but provides controlled-like APIs.
```jsx
const { register, handleSubmit, formState: { errors } } = useForm();
const onSubmit = data => console.log(data);

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register("firstName", { required: true })} />
    {errors.firstName && <span>Required</span>}
  </form>
);
```

## 5. React Router
The standard client-side routing library for React SPAs.
- **Nested Routes**: Rendering child routes inside parent layouts using `<Outlet />`.
- **Loaders**: Functions that fetch data *before* a route renders, eliminating loading spinners.
- **Actions**: Functions that handle data mutations when a form is submitted to a route.
