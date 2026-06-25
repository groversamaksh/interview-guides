# Quick Revision Tables & Senior Developer Notes

## 1. Quick Revision Tables

### Hook Cheat Sheet
| Hook | Purpose | Common Mistake |
| --- | --- | --- |
| `useState` | Local component state | Mutating state directly instead of using setter |
| `useEffect` | Side effects | Missing dependencies causing stale closures |
| `useRef` | Mutable value without re-render | Using it for derived state |
| `useMemo` | Cache a calculation | Overusing it for cheap operations |
| `useCallback` | Cache a function | Forgetting it only helps if passed to a memoized child |

### React Router API
| API | Purpose |
| --- | --- |
| `<Outlet />` | Renders child routes inside a parent layout |
| `useNavigate` | Programmatic navigation |
| `useParams` | Access dynamic URL segments (e.g., `:id`) |
| `Loader` | Fetch data before a route renders |

### React Query API
| API | Purpose |
| --- | --- |
| `useQuery` | Fetch and cache GET requests |
| `useMutation`| Perform POST/PUT/DELETE |
| `invalidateQueries` | Clear cache and trigger refetch |

## 2. Senior Developer Notes & Checklists

### Production Best Practices
- **Never mutate state directly**: Always return new objects/arrays.
- **Stable References**: Extract objects, arrays, and functions outside the component if they don't depend on component scope to prevent unnecessary re-renders.
- **Component Size**: If a component exceeds 150-200 lines, it likely violates the Single Responsibility Principle. Extract smaller components or custom hooks.

### Performance Optimization Checklist
- [ ] No `useEffect` used for derived state.
- [ ] Large lists are virtualized (`react-window`).
- [ ] Expensive child components are wrapped in `React.memo` (with `useCallback` for their prop functions).
- [ ] Routes are lazy-loaded via `React.lazy` and `Suspense`.
- [ ] Third-party libraries are audited for bundle size impact.

### Common Interview Traps
1. **The `useEffect` infinite loop**: State is updated inside an effect, and that state is in the dependency array.
2. **Stale Closures**: A `setTimeout` or event listener inside a `useEffect` captures old state because the dependency array was empty.
3. **Over-engineering**: Reaching for Redux Toolkit for a simple app when Context + `useState` would suffice.
4. **Ignoring accessibility**: Creating a custom dropdown but forgetting keyboard navigation (`tabindex`, `onKeyDown`) and ARIA roles.

### Real-world Engineering Lessons
- **React is just a library**: Focus heavily on mastering JavaScript fundamentals (Closures, Promises, Event Loop, `this`). A good JS developer learns React quickly; a developer who only knows React struggles deeply.
- **State locality matters**: The most common cause of bad React performance is putting all state globally. Keep state as close to where it is used as possible.
