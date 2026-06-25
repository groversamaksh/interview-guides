# Components, Templates, and Control Flow

## 1. Components

### Component Creation
Components are defined using the `@Component` decorator.
```typescript
@Component({
  selector: 'app-hello',
  standalone: true,
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent { }
```

### Component Communication
- **Parent → Child**: `@Input()`
- **Child → Parent**: `@Output()` and `EventEmitter`
- **Sibling**: Shared Services using Dependency Injection (or NgRx/Signals).

```typescript
// CHILD
export class ChildComponent {
  @Input() data: string;
  @Output() dataChanged = new EventEmitter<string>();

  update() {
    this.dataChanged.emit('New Data');
  }
}

// PARENT TEMPLATE
// <app-child [data]="parentData" (dataChanged)="handleUpdate($event)"></app-child>
```
*Note: Angular 17+ introduces Signal-based inputs: `data = input<string>()`.*

## 2. Component Lifecycle Hooks

Interfaces that allow tapping into key moments of a component's lifecycle.

1. **`ngOnChanges`**: When an `@Input` property changes.
2. **`ngOnInit`**: Once, after the first `ngOnChanges`. (Ideal for fetching data).
3. **`ngDoCheck`**: Developer's custom change detection.
4. **`ngAfterContentInit`**: After projected content (`<ng-content>`) is initialized.
5. **`ngAfterContentChecked`**: After projected content is checked.
6. **`ngAfterViewInit`**: After component's views and child views are initialized. (Ideal for DOM manipulation).
7. **`ngAfterViewChecked`**: After views are checked.
8. **`ngOnDestroy`**: Just before the component is destroyed. (Cleanup subscriptions!).

## 3. Templates

### Bindings
- **Interpolation**: `{{ value }}` (One-way, Component to DOM)
- **Property Binding**: `[property]="value"` (One-way, Component to DOM)
- **Event Binding**: `(event)="handler()"` (One-way, DOM to Component)
- **Two-Way Binding**: `[(ngModel)]="value"` (Requires `FormsModule`)

### Template Reference Variables
Used to reference a DOM element or component within a template.
```html
<input #myInput type="text">
<button (click)="log(myInput.value)">Log</button>
```

## 4. Modern Angular Control Flow (Angular 17+)

Angular 17 introduced a built-in control flow syntax, heavily improving performance and developer experience over structural directives (`*ngIf`, `*ngFor`).

### @if and @else
```html
@if (isLoggedIn) {
  <dashboard />
} @else if (isGuest) {
  <guest-view />
} @else {
  <login-form />
}
```

### @for and @empty
`@for` requires a `track` expression (equivalent to `trackBy` in `*ngFor`), significantly improving performance.
```html
@for (user of users; track user.id) {
  <li>{{ user.name }}</li>
} @empty {
  <li>No users found.</li>
}
```

### @switch
```html
@switch (role) {
  @case ('admin') { <admin-panel /> }
  @case ('user') { <user-panel /> }
  @default { <unauthorized /> }
}
```

## 5. Directives

### Built-in Attribute Directives
Modify the appearance or behavior of an element.
- `[ngClass]="{'active': isActive}"`
- `[ngStyle]="{'color': isError ? 'red' : 'black'}"`

### Custom Directives
```typescript
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  constructor(private el: ElementRef) {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```
