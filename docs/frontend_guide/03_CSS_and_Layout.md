# CSS and Layout

## 1. CSS Fundamentals

### Selectors & Specificity
Calculated as a 3-column value: (ID, Class/Pseudo-class/Attribute, Element/Pseudo-element)
- `div` -> (0, 0, 1)
- `.class` -> (0, 1, 0)
- `#id` -> (1, 0, 0)
- Inline styles override all (except `!important`).
- `!important` breaks the cascade. Use sparingly.

### Cascade & Inheritance
- **Cascade order**: User Agent -> User Declarations -> Author Declarations -> Author !important -> User !important.
- **Inheritance**: Some properties (like `color`, `font-family`) inherit down the DOM tree. Others (like `margin`, `padding`) do not.

## 2. CSS Layout & Box Model
- `content`: The actual content area.
- `padding`: Transparent space around content.
- `border`: Line surrounding padding.
- `margin`: Transparent space outside the border.
*Tip: Always use `box-sizing: border-box;` to include padding and border in the element's total width and height.*

### Positioning
- `static`: Default document flow.
- `relative`: Positioned relative to its normal position.
- `absolute`: Positioned relative to the nearest positioned ancestor.
- `fixed`: Positioned relative to the viewport.
- `sticky`: Toggles between relative and fixed depending on scroll position.

### Display Types
- `block`: Takes up full width, starts on a new line.
- `inline`: Takes up only necessary width, does not force a new line. Cannot set width/height.
- `inline-block`: Inline flow, but respects width/height.
- `flex`: Flexbox container.
- `grid`: Grid container.

## 3. Flexbox
1-dimensional layout model (rows OR columns).

### Container Properties
- `display: flex;`
- `flex-direction`: `row` (default), `column`, `row-reverse`, `column-reverse`.
- `justify-content`: Main-axis alignment (`flex-start`, `center`, `space-between`, `space-around`).
- `align-items`: Cross-axis alignment (`stretch`, `center`, `flex-start`).
- `flex-wrap`: `nowrap` (default), `wrap`.
- `gap`: Spacing between items.

### Item Properties
- `flex-grow`: Proportionally take up available space.
- `flex-shrink`: Proportionally shrink when space is constrained.
- `flex-basis`: Initial main-axis size before grow/shrink.
- `align-self`: Overrides `align-items` for a specific item.

## 4. CSS Grid
2-dimensional layout model (rows AND columns).
```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 16px;
}
.header { grid-area: header; }
```

## 5. Responsive & Modern CSS
- **Media Queries**: `@media (min-width: 768px) { ... }`
- **Fluid Layouts**: Use percentages, `vw`, `vh`, `rem`, `em`.
- **Container Queries**: `@container (min-width: 400px) { ... }` (Styles based on container size, not viewport size).

### Modern Functions & Features
- `calc(100% - 20px)`: Mathematical expressions.
- `clamp(1rem, 2.5vw, 2rem)`: Binds a value between an upper and lower bound.
- **Variables**: `--primary-color: blue; color: var(--primary-color);`
- **Nesting**: Standardized CSS nesting allows `&` to reference parent selectors.
- **Layers**: `@layer reset, base, theme;` for explicit specificity control.

## 6. Animations
### Transitions
```css
.btn {
  transition: background-color 0.3s ease-in-out, transform 0.2s linear;
}
```

### Transform
- `translate(x, y)`: Move element.
- `scale(x, y)`: Resize element.
- `rotate(deg)`: Rotate element.
- *Performance note*: Transforms and opacity are GPU accelerated. Avoid animating layout properties.

### Keyframes
```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.element { animation: slideIn 0.5s forwards; }
```
