# Directives, Pipes & Content Projection

## 1. Directives Overview

Directives are classes that add behavior to elements in Angular templates.

| Type | Purpose | Example |
|---|---|---|
| **Component** | Directive with a template | `@Component` |
| **Structural** | Change DOM layout (add/remove elements) | `*ngIf`, `*ngFor`, `@if`, `@for` |
| **Attribute** | Change appearance or behavior of an element | `ngClass`, `ngStyle`, custom |

---

## 2. Built-in Structural Directives vs New Control Flow

### Legacy `*ngIf` vs Modern `@if`
```html
<!-- Legacy -->
<div *ngIf="user; else loading">
  <h1>{{ user.name }}</h1>
</div>
<ng-template #loading>
  <app-spinner />
</ng-template>

<!-- Modern (Angular 17+) — Preferred -->
@if (user; as u) {
  <h1>{{ u.name }}</h1>
} @else {
  <app-spinner />
}
```

### Legacy `*ngFor` vs Modern `@for`
```html
<!-- Legacy -->
<li *ngFor="let item of items; let i = index; trackBy: trackById">
  {{ i }}. {{ item.name }}
</li>

<!-- Modern (Angular 17+) — Preferred -->
@for (item of items; track item.id; let i = $index) {
  <li>{{ i }}. {{ item.name }}</li>
} @empty {
  <li>No items found.</li>
}
```

### `@for` Implicit Variables
| Variable | Description |
|---|---|
| `$index` | Zero-based index |
| `$first` | `true` if first item |
| `$last` | `true` if last item |
| `$even` | `true` if even index |
| `$odd` | `true` if odd index |
| `$count` | Total number of items |

### `@switch`
```html
@switch (status) {
  @case ('active') { <span class="badge-green">Active</span> }
  @case ('inactive') { <span class="badge-red">Inactive</span> }
  @case ('pending') { <span class="badge-yellow">Pending</span> }
  @default { <span class="badge-gray">Unknown</span> }
}
```

> **Interview Note**: New control flow blocks (`@if`, `@for`, `@switch`) are built into the template compiler — no imports needed. They are more performant and type-safe than the `*ngIf`/`*ngFor` directives.

---

## 3. Built-in Attribute Directives

### `ngClass`
```html
<!-- String -->
<div [ngClass]="'active highlight'">...</div>

<!-- Array -->
<div [ngClass]="['active', isHighlighted ? 'highlight' : '']">...</div>

<!-- Object (most common) -->
<div [ngClass]="{ 'active': isActive, 'disabled': isDisabled, 'highlight': score > 90 }">...</div>

<!-- Modern alternative: class binding -->
<div [class.active]="isActive" [class.disabled]="isDisabled">...</div>
```

### `ngStyle`
```html
<div [ngStyle]="{
  'color': textColor,
  'font-size.px': fontSize,
  'background-color': isActive ? 'green' : 'gray'
}">...</div>

<!-- Modern alternative: style binding -->
<div [style.color]="textColor" [style.font-size.px]="fontSize">...</div>
```

---

## 4. Custom Attribute Directive

```typescript
import { Directive, ElementRef, HostListener, input, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  appHighlight = input('yellow'); // Input with same name as selector
  private el = inject(ElementRef);

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}

// Usage
// <p appHighlight="lightblue">Hover me!</p>
// <p appHighlight>Uses default yellow</p>
```

### Custom Structural Directive
```typescript
@Directive({
  selector: '[appRepeat]',
  standalone: true
})
export class RepeatDirective {
  private vcr = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<any>);

  appRepeat = input.required<number>();

  constructor() {
    effect(() => {
      this.vcr.clear();
      for (let i = 0; i < this.appRepeat(); i++) {
        this.vcr.createEmbeddedView(this.templateRef, { $implicit: i, index: i });
      }
    });
  }
}

// Usage: <div *appRepeat="5; let i">Item {{ i }}</div>
```

---

## 5. Host Directives (Angular 15+)

Compose directives by applying them to a host component.

```typescript
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  text = input.required<string>({ alias: 'appTooltip' });
  // ... tooltip logic
}

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  clickOutside = output<void>();
  // ... click outside logic
}

// Compose them into a component
@Component({
  selector: 'app-dropdown',
  standalone: true,
  hostDirectives: [
    {
      directive: TooltipDirective,
      inputs: ['appTooltip: tooltip'],      // Remap input name
    },
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside: closed'],    // Remap output name
    }
  ],
  template: `<ng-content />`
})
export class DropdownComponent { }

// Usage: <app-dropdown tooltip="Select option" (closed)="onClose()">
```

> **Interview Tip**: Host directives enable composition over inheritance — a key Angular design pattern.

---

## 6. Pipes

### Built-in Pipes
| Pipe | Example | Output |
|---|---|---|
| `date` | `{{ today \| date:'medium' }}` | `Jun 25, 2026, 10:30:15 PM` |
| `currency` | `{{ 42.5 \| currency:'USD' }}` | `$42.50` |
| `percent` | `{{ 0.85 \| percent }}` | `85%` |
| `uppercase` | `{{ 'hello' \| uppercase }}` | `HELLO` |
| `lowercase` | `{{ 'HELLO' \| lowercase }}` | `hello` |
| `titlecase` | `{{ 'hello world' \| titlecase }}` | `Hello World` |
| `json` | `{{ obj \| json }}` | JSON string |
| `slice` | `{{ [1,2,3,4] \| slice:1:3 }}` | `[2, 3]` |
| `number` | `{{ 3.14159 \| number:'1.2-2' }}` | `3.14` |
| `async` | `{{ obs$ \| async }}` | Unwraps Observable/Promise |
| `keyvalue` | `{{ map \| keyvalue }}` | Array of {key, value} |

### Custom Pipe
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50, trail = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}

// Usage: {{ longText | truncate:100:'…' }}
```

### Pure vs Impure Pipes
```typescript
// Pure pipe (default) — only re-evaluated when input reference changes
@Pipe({ name: 'filter', pure: true })

// Impure pipe — re-evaluated on every change detection cycle
@Pipe({ name: 'filter', pure: false })
```

| | Pure Pipe | Impure Pipe |
|---|---|---|
| **Re-evaluation** | Only when input reference changes | Every change detection cycle |
| **Performance** | Excellent | Can be expensive |
| **Use case** | Formatting, transformations | Filtering arrays that mutate in place |

> **Interview Tip**: The `async` pipe is an impure pipe. Pure pipes don't re-run when array contents change (only when the array reference changes). This is a very common interview question.

---

## 7. Content Projection

### Single-Slot Projection
```typescript
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <ng-content />
    </div>
  `
})
export class CardComponent { }

// Usage
// <app-card>
//   <h2>Card Title</h2>
//   <p>Card content goes here</p>
// </app-card>
```

### Multi-Slot Projection
```typescript
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[card-header]" />
      </div>
      <div class="card-body">
        <ng-content />  <!-- Default slot (unmatched content) -->
      </div>
      <div class="card-footer">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `
})
export class CardComponent { }

// Usage
// <app-card>
//   <h2 card-header>Title</h2>
//   <p>Body content (goes to default slot)</p>
//   <button card-footer>Submit</button>
// </app-card>
```

### Conditional Content Projection with `ng-template`
```typescript
@Component({
  selector: 'app-if-loaded',
  standalone: true,
  template: `
    @if (loaded) {
      <ng-container [ngTemplateOutlet]="contentTemplate" />
    } @else {
      <app-spinner />
    }
  `,
  imports: [NgTemplateOutlet]
})
export class IfLoadedComponent {
  loaded = input(false);
  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;
}

// Usage
// <app-if-loaded [loaded]="dataLoaded">
//   <ng-template>
//     <p>This is only instantiated when loaded is true</p>
//   </ng-template>
// </app-if-loaded>
```

> **Interview Note**: With `ng-content`, projected content is always instantiated even if hidden. Use `ng-template` + `ngTemplateOutlet` for conditional instantiation.

---

## 8. View Queries

### `viewChild` / `viewChildren` (Signal-based, Angular 17.3+)
```typescript
@Component({
  template: `
    <input #nameInput />
    <app-chart #chart />
  `
})
export class FormComponent {
  // Signal-based queries (modern)
  nameInput = viewChild<ElementRef>('nameInput');
  chart = viewChild(ChartComponent);

  // Required variant
  requiredInput = viewChild.required<ElementRef>('nameInput');

  focusInput() {
    this.nameInput()?.nativeElement.focus();
  }
}
```

### `contentChild` / `contentChildren` (Signal-based)
```typescript
@Component({
  selector: 'app-tabs',
  template: `
    @for (tab of tabs(); track tab.label) {
      <button (click)="selectTab(tab)">{{ tab.label() }}</button>
    }
    <ng-content />
  `
})
export class TabsComponent {
  tabs = contentChildren(TabComponent);

  selectTab(tab: TabComponent) { /* ... */ }
}
```

### Query Reference
| Query | Searches In | Signal API | Decorator API |
|---|---|---|---|
| `viewChild` | Component's own template | `viewChild()` | `@ViewChild()` |
| `viewChildren` | Component's own template | `viewChildren()` | `@ViewChildren()` |
| `contentChild` | Projected content | `contentChild()` | `@ContentChild()` |
| `contentChildren` | Projected content | `contentChildren()` | `@ContentChildren()` |

> **Interview Tip**: Signal-based queries (`viewChild()`, `contentChildren()`) are the modern API. They return signals and are available immediately (no need for `AfterViewInit`).

---

## Quick Revision: Directives & Pipes

| Concept | Modern | Legacy |
|---|---|---|
| Conditional | `@if` / `@else` | `*ngIf` / `else` |
| Loop | `@for (track required)` | `*ngFor` / `trackBy` |
| Switch | `@switch` / `@case` / `@default` | `[ngSwitch]` / `*ngSwitchCase` |
| Empty state | `@empty` (inside `@for`) | Manual `*ngIf` check |
| View queries | `viewChild()` signal | `@ViewChild()` decorator |
| Content queries | `contentChildren()` signal | `@ContentChildren()` decorator |
