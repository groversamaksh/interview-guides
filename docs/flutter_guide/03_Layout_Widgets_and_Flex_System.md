# Layout Widgets & Flex System

## 1. Flutter's Constraint System

Flutter's layout uses a **constraint-based** system:

```
Parent passes CONSTRAINTS down → Child chooses SIZE → Parent positions child

Constraints: "You must be between 100-300px wide and 200-400px tall"
Child:       "OK, I'll be 200px wide and 300px tall"
Parent:      "Great, I'll position you at offset (50, 100)"
```

### BoxConstraints
```dart
const BoxConstraints(
  minWidth: 0,
  maxWidth: double.infinity,   // "As wide as you want"
  minHeight: 0,
  maxHeight: double.infinity,  // "As tall as you want"
);

// Tight constraints — exact size required
BoxConstraints.tight(const Size(200, 100)); // Must be exactly 200x100

// Loose constraints — max only
BoxConstraints.loose(const Size(200, 100)); // Up to 200x100
```

### Key Rule: Constraints Go Down, Sizes Go Up
```
MaterialApp
  └── Scaffold (fills screen → tight constraints)
        └── Center (passes loose constraints to child)
              └── Container(width: 200) (chooses 200px)
```

> **Interview Tip**: "Constraints go down, sizes go up, parent sets position" is the fundamental layout rule. Most layout bugs come from misunderstanding constraints.

---

## 2. Container

The most versatile single-child layout widget. Combines padding, margin, decoration, sizing, and alignment.

```dart
Container(
  width: 200,
  height: 100,
  margin: const EdgeInsets.all(16),
  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.2),
        blurRadius: 10,
        offset: const Offset(0, 4),
      ),
    ],
    gradient: const LinearGradient(
      colors: [Colors.blue, Colors.purple],
    ),
    border: Border.all(color: Colors.white, width: 2),
  ),
  child: const Text('Hello'),
)
```

### Container Under the Hood
```
Container is actually a combination of:
  Padding → Align → DecoratedBox → ConstrainedBox → child

// Prefer specific widgets for clarity:
Padding(padding: ..., child: ...)     // Instead of Container(padding: ...)
SizedBox(width: 100, height: 50)      // Instead of Container(width: 100, height: 50)
DecoratedBox(decoration: ...)          // Instead of Container(decoration: ...)
```

> **Interview Note**: Container is convenient but deceptive. In production, prefer specific widgets (`SizedBox`, `Padding`, `DecoratedBox`) for clarity and minor performance gains.

---

## 3. SizedBox

Forces a specific size on its child.

```dart
// Fixed size
const SizedBox(width: 200, height: 100, child: Text('Fixed'))

// As spacer (no child)
const SizedBox(height: 16) // Vertical gap
const SizedBox(width: 8)   // Horizontal gap

// Expand to fill available space
const SizedBox.expand(child: Text('Fills parent'))

// Shrink to child's size
const SizedBox.shrink(child: Text('Minimal'))

// From specific size
SizedBox.fromSize(size: const Size(100, 50))
```

---

## 4. Padding & Margin

```dart
// Padding — space INSIDE
Padding(
  padding: const EdgeInsets.all(16),
  child: Text('Padded'),
)

// EdgeInsets variants
EdgeInsets.all(16)                              // All sides
EdgeInsets.symmetric(horizontal: 16, vertical: 8) // H & V
EdgeInsets.only(left: 8, top: 16)               // Specific sides
EdgeInsets.fromLTRB(8, 16, 8, 0)                // Left, Top, Right, Bottom

// Directional (for RTL support)
const EdgeInsetsDirectional.only(start: 16, end: 8)
```

> **Interview Tip**: There is no "Margin" widget. Use `Container(margin: ...)` or wrap with `Padding` on the parent side. `Padding` adds space inside, margin adds space outside.

---

## 5. Align & Center

```dart
// Align — positions child within available space
Align(
  alignment: Alignment.topRight,
  child: Text('Top Right'),
)

// Center — shorthand for Align(alignment: Alignment.center)
Center(child: Text('Centered'))

// FractionalOffset — 0.0 to 1.0 based positioning
Align(
  alignment: const FractionalOffset(0.5, 0.5), // Center
  child: Text('Center'),
)

// Custom alignment (-1 to 1 range)
Align(
  alignment: const Alignment(-0.5, 0.8), // Slightly left, near bottom
  child: Text('Custom'),
)
```

### Alignment Reference
```
(-1, -1)    (0, -1)    (1, -1)
topLeft    topCenter   topRight

(-1, 0)     (0, 0)     (1, 0)
centerLeft  center     centerRight

(-1, 1)     (0, 1)     (1, 1)
bottomLeft bottomCenter bottomRight
```

---

## 6. ConstrainedBox, UnconstrainedBox, FittedBox

```dart
// ConstrainedBox — adds constraints
ConstrainedBox(
  constraints: const BoxConstraints(
    minWidth: 100,
    maxWidth: 300,
    minHeight: 50,
    maxHeight: 200,
  ),
  child: const Text('Constrained'),
)

// UnconstrainedBox — removes parent constraints (can overflow!)
UnconstrainedBox(
  child: Container(width: 500, height: 500, color: Colors.red),
  // Will overflow if parent is smaller than 500x500
)

// FittedBox — scales child to fit within constraints
FittedBox(
  fit: BoxFit.contain,
  child: Text('Scales to fit'),
)

// AspectRatio — forces width:height ratio
AspectRatio(
  aspectRatio: 16 / 9,
  child: Container(color: Colors.blue),
)
```

### BoxFit Values
| Value | Behavior |
|---|---|
| `BoxFit.fill` | Stretch to fill (distorts) |
| `BoxFit.contain` | Scale to fit, maintain ratio (may have gaps) |
| `BoxFit.cover` | Scale to fill, maintain ratio (may crop) |
| `BoxFit.fitWidth` | Match width, maintain ratio |
| `BoxFit.fitHeight` | Match height, maintain ratio |
| `BoxFit.none` | No scaling |
| `BoxFit.scaleDown` | Like contain but only scales down |

---

## 7. Row & Column (Flex Widgets)

```dart
// Row — horizontal layout
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    const Icon(Icons.star),
    const Text('Rating'),
    const Text('4.5'),
  ],
)

// Column — vertical layout
Column(
  mainAxisAlignment: MainAxisAlignment.start,
  crossAxisAlignment: CrossAxisAlignment.stretch,
  mainAxisSize: MainAxisSize.min, // Shrink to fit children
  children: [
    const Text('Title'),
    const SizedBox(height: 8),
    const Text('Subtitle'),
  ],
)
```

### Axis Alignment
```
Row (horizontal):
  mainAxisAlignment  → Horizontal distribution
  crossAxisAlignment → Vertical alignment

Column (vertical):
  mainAxisAlignment  → Vertical distribution
  crossAxisAlignment → Horizontal alignment
```

### MainAxisAlignment Values
```
start:        |■ ■ ■          |
end:          |          ■ ■ ■|
center:       |    ■ ■ ■      |
spaceBetween: |■     ■      ■|
spaceAround:  |  ■    ■    ■  |
spaceEvenly:  |   ■   ■   ■   |
```

### CrossAxisAlignment Values
| Value | Behavior |
|---|---|
| `start` | Align to start (top for Row, left for Column) |
| `end` | Align to end |
| `center` | Center on cross axis |
| `stretch` | Stretch to fill cross axis |
| `baseline` | Align by text baseline |

---

## 8. Expanded, Flexible & Spacer

```dart
// Expanded — takes all remaining space
Row(
  children: [
    Container(width: 50, color: Colors.red),     // Fixed 50px
    Expanded(child: Container(color: Colors.blue)), // Takes remaining space
    Container(width: 50, color: Colors.green),    // Fixed 50px
  ],
)

// Flex factor — proportional distribution
Row(
  children: [
    Expanded(flex: 2, child: Container(color: Colors.red)),   // 2/3 of space
    Expanded(flex: 1, child: Container(color: Colors.blue)),  // 1/3 of space
  ],
)

// Flexible — can take up to remaining space but doesn't HAVE to
Row(
  children: [
    Flexible(
      fit: FlexFit.loose, // Child can be smaller than allocated space
      child: Text('Short text'),
    ),
    Text('Fixed'),
  ],
)

// Spacer — Expanded(child: SizedBox.shrink())
Row(
  children: [
    Text('Left'),
    const Spacer(),     // Pushes items apart
    Text('Right'),
  ],
)
```

### Expanded vs Flexible
| Feature | Expanded | Flexible |
|---|---|---|
| `FlexFit` | `tight` (must fill space) | `loose` (can be smaller) |
| Behavior | Forces child to fill | Allows child to shrink |
| Use Case | Fill remaining space | "Up to" remaining space |

---

## 9. Wrap & Flow

```dart
// Wrap — like Row/Column but wraps to next line
Wrap(
  spacing: 8,            // Horizontal gap between children
  runSpacing: 8,          // Vertical gap between lines
  alignment: WrapAlignment.start,
  children: tags.map((tag) => Chip(label: Text(tag))).toList(),
)

// Example: Tag chips
Wrap(
  spacing: 8,
  runSpacing: 4,
  children: [
    Chip(label: Text('Flutter')),
    Chip(label: Text('Dart')),
    Chip(label: Text('Mobile')),
    Chip(label: Text('Cross-Platform')),
    Chip(label: Text('Google')),
    // Automatically wraps to next line when row is full
  ],
)
```

---

## 10. Stack & Positioned

```dart
// Stack — overlay widgets on top of each other
Stack(
  clipBehavior: Clip.none, // Allow overflow
  children: [
    // Bottom layer (background)
    Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    // Positioned child
    Positioned(
      top: -10,
      right: -10,
      child: CircleAvatar(
        radius: 15,
        backgroundColor: Colors.red,
        child: Text('3', style: TextStyle(color: Colors.white, fontSize: 12)),
      ),
    ),
    // Centered text
    const Positioned.fill(
      child: Center(child: Text('Card', style: TextStyle(color: Colors.white))),
    ),
  ],
)
```

### Positioned Properties
```dart
Positioned(
  top: 10,     // Distance from top
  left: 10,    // Distance from left
  right: 10,   // Distance from right
  bottom: 10,  // Distance from bottom
  width: 100,  // Explicit width
  height: 50,  // Explicit height
  child: ...,
)

Positioned.fill(child: ...)        // Fill entire Stack
Positioned.directional(start: 10)  // RTL-aware
```

---

## 11. Common Layout Patterns

### Card Layout
```dart
Card(
  elevation: 4,
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  child: Padding(
    padding: const EdgeInsets.all(16),
    child: Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(imageUrl, width: 60, height: 60, fit: BoxFit.cover),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Title', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 4),
              Text('Subtitle', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        const Icon(Icons.chevron_right),
      ],
    ),
  ),
)
```

### Responsive Layout
```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 900) {
      return _buildDesktopLayout();
    } else if (constraints.maxWidth > 600) {
      return _buildTabletLayout();
    } else {
      return _buildMobileLayout();
    }
  },
)
```

---

## 12. Intrinsic Widgets

```dart
// IntrinsicHeight — makes children the same height
IntrinsicHeight(
  child: Row(
    children: [
      Container(color: Colors.red, width: 50),         // Matches tallest child
      Container(color: Colors.blue, width: 50, height: 100), // Tallest
      Container(color: Colors.green, width: 50),       // Matches tallest child
    ],
  ),
)

// IntrinsicWidth — makes children the same width
IntrinsicWidth(
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      ElevatedButton(onPressed: () {}, child: Text('Short')),
      ElevatedButton(onPressed: () {}, child: Text('Medium Length')),
      ElevatedButton(onPressed: () {}, child: Text('Very Long Button Label')),
      // All buttons stretch to match widest
    ],
  ),
)
```

> **Interview Note**: `IntrinsicHeight/Width` do an extra layout pass and are relatively expensive. Avoid in performance-critical areas.

---

## Quick Revision: Layout

| Widget | Purpose |
|---|---|
| `Container` | Multi-purpose (padding, margin, decoration, size) |
| `SizedBox` | Fixed size or spacing |
| `Padding` | Add internal spacing |
| `Center` | Center child in available space |
| `Align` | Position child with alignment |
| `Row` | Horizontal layout |
| `Column` | Vertical layout |
| `Expanded` | Fill remaining flex space (tight) |
| `Flexible` | Up to remaining flex space (loose) |
| `Spacer` | Empty expanded space |
| `Wrap` | Row/Column that wraps to next line |
| `Stack` | Overlay children |
| `Positioned` | Position child within Stack |
| `ConstrainedBox` | Add min/max constraints |
| `AspectRatio` | Force width:height ratio |
| `FittedBox` | Scale child to fit |
| `LayoutBuilder` | Build based on parent constraints |
