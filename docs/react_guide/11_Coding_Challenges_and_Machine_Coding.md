# React Coding Challenges & Machine Coding

## 1. Quick Coding Challenges

**1. Debounced Search Input**
- *Problem*: Create an input that fetches data but only 500ms after the user stops typing.
- *Solution*: Use `useEffect` with a `setTimeout`.
- *Performance*: Clear the timeout in the `useEffect` cleanup function to prevent memory leaks and unnecessary fetches.

**2. Modal with Focus Trap**
- *Problem*: Accessible modal dialog.
- *Solution*: Render via React Portals to the `document.body`. Use a `useEffect` to listen for the `Escape` key. Use a `useRef` to focus the first input on mount.

**3. Infinite Scroll List**
- *Problem*: Fetch more items when scrolling to the bottom.
- *Solution*: Place an empty `div` at the bottom and observe it using the `IntersectionObserver` API. When it intersects, dispatch a fetch action.

**4. Toast Notification System**
- *Problem*: Show temporary alerts anywhere in the app.
- *Solution*: Use a global Context or Zustand store holding an array of toasts. Render a `ToastContainer` portal mapped over the array. `setTimeout` removes them after 3s.

**5. Custom `useFetch` Hook**
- *Problem*: Create a reusable hook for data fetching.
- *Solution*: Return `{ data, error, loading }`. Handle race conditions using an `AbortController` in the cleanup function.

## 2. Machine Coding Round Problems (Deep Dive)

### Autocomplete / Typeahead
**Architecture**:
- Input component controlled by state.
- `useDebounce` custom hook.
- Absolute positioned list below the input.
- Keyboard navigation (ArrowDown/ArrowUp) via `onKeyDown` tracking an `activeIndex` state.

### Kanban Board (Trello Clone)
**Architecture**:
- Columns and Cards data structure.
- State management via `useReducer` or Zustand.
- HTML5 Drag and Drop API (`onDragStart`, `onDragOver`, `onDrop`).
- Drag-over visual indicators.

### Nested Comments (Reddit style)
**Architecture**:
- Recursive component rendering: `<Comment data={comment} />` which internally renders `{comment.replies.map(reply => <Comment data={reply} />)}`.
- State for expanding/collapsing thread visibility.

### File Explorer
**Architecture**:
- Recursive component similar to nested comments.
- JSON structure representing folders and files.
- State to toggle folder open/close.
- Context API to handle file selection/deletion.

### Carousel / Image Slider
**Architecture**:
- Flex container with hidden overflow.
- State tracks `currentIndex`.
- CSS `transform: translateX(-${currentIndex * 100}%)` for smooth transitions.
- `useEffect` with `setInterval` for auto-play (clearing interval on unmount or hover).

### Datagrid / Table
**Architecture**:
- Sort state `{ column: 'name', direction: 'asc' }`.
- Pagination state (offset, limit).
- Filter input.
- Virtualization (`react-window`) if the data set is massive.

### Form Wizard (Multi-step)
**Architecture**:
- Parent component holds the total form state.
- `step` state determines which child component to render.
- Pass `nextStep`, `prevStep`, and `formData` as props to children.

*(Practice these specific 7 architectures, as they cover 90% of front-end machine coding rounds).*
