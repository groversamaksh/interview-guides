# Architecture, Testing, and Patterns

## 1. Frontend Architecture

### Scalable Folder Structures
A feature-based architecture (Screaming Architecture) is heavily preferred for large React codebases.
```text
src/
  components/    # Shared UI (buttons, inputs)
  features/      # Domain specific modules
    auth/
      components/
      hooks/
      api/
    dashboard/
  lib/           # Third-party integrations (axios setup)
  hooks/         # Shared custom hooks
  utils/         # Helper functions
```

## 2. React Design Patterns

### Compound Components
Implicitly sharing state between tightly coupled components.
```jsx
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Home</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel index={0}>Content</Tabs.Panel>
</Tabs>
```

### Custom Hooks Pattern
Extracting business logic out of components to keep them purely presentational.

### Render Props
Passing a function that returns a React element as a prop. (Mostly replaced by custom hooks, but still used in some libraries).
```jsx
<MouseTracker render={mousePos => <div>{mousePos.x}</div>} />
```

## 3. Testing React Applications

### Testing Pyramid
- **Unit Testing**: Testing pure functions and custom hooks (Jest, Vitest).
- **Component Testing**: Rendering components in a JSDOM environment and asserting behavior (React Testing Library).
- **E2E Testing**: Running a real browser to test user flows (Playwright, Cypress).

### React Testing Library
Encourages testing the application exactly as a user interacts with it (e.g., finding elements by their accessibility role or text, not by class names).
```jsx
test('shows error on invalid submission', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/username is required/i)).toBeInTheDocument();
});
```

## 4. Accessibility in React

- **Forms**: Always link `<label htmlFor="id">` to `<input id="id">`.
- **Focus Management**: When a modal opens, use a `useRef` to shift focus to the modal. Trap focus inside it. When closed, return focus to the button that opened it.
- **Keyboard Navigation**: Ensure custom components (`div`s acting as buttons) have `tabindex="0"` and listen for `Enter`/`Space` keydown events.

## 5. Optimization Checklist
- Avoid anonymous functions in props passed to memoized children.
- Use `useTransition` to keep the UI responsive during heavy state updates.
- Extract complex derived state outside of the component or memoize it.
- Ensure the bundle is tree-shaken and split via React.lazy or Next.js dynamic imports.
