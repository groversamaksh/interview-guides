# DOM, Events, and Browser APIs

## 1. DOM & Manipulation
The Document Object Model is a tree representation of the HTML document. Nodes include Elements, Text, and Comments.

### Manipulation APIs
- **Select**: `document.querySelector('.class')`, `document.getElementById('id')`
- **Create**: `document.createElement('div')`
- **Modify**: `element.textContent = 'text'`, `element.setAttribute('aria-hidden', 'true')`
- **Insert**: `parent.appendChild(node)`, `element.append(node1, node2)`
- **Remove**: `element.remove()`

## 2. Events

### Propagation
1. **Capturing Phase**: Travels from Window down to the target element.
2. **Target Phase**: Reaches the target.
3. **Bubbling Phase**: Bubbles up from target to Window.

### Delegation
Attaching a single event listener to a parent element to manage events for multiple children (useful for dynamic content).
```javascript
document.querySelector('#list').addEventListener('click', (e) => {
  if (e.target.matches('li')) {
    console.log('List item clicked!');
  }
});
```

### Custom Events
```javascript
const event = new CustomEvent('myEvent', { detail: { id: 1 } });
document.dispatchEvent(event);
```

## 3. Browser APIs

- **Storage**: `localStorage.setItem('key', 'val')`
- **URL**: `new URLSearchParams(window.location.search)`
- **History**: `history.pushState(state, title, url)`
- **Clipboard**: `navigator.clipboard.writeText('text')`
- **Intersection Observer**: Detects when elements enter/leave the viewport (lazy loading).
- **Resize Observer**: Detects when an element's dimensions change.
- **Mutation Observer**: Detects changes to the DOM tree.
- **Geolocation**: `navigator.geolocation.getCurrentPosition(cb)`
- **Drag and Drop**: Native HTML5 Drag and Drop API events (`dragstart`, `dragover`, `drop`).

## 4. Browser Storage Comparison

| Technology | Size | Persistence | Use Cases |
| ---------- | ---- | ----------- | --------- |
| Cookies | 4KB | Set by expiration | Auth tokens, server state |
| Local Storage | 5-10MB | Explicit clear | User preferences, theme |
| Session Storage| 5-10MB | Tab closes | Form drafts, tab-specific state|
| IndexedDB | >50MB | Explicit/Quota | Large data, offline PWA storage|
