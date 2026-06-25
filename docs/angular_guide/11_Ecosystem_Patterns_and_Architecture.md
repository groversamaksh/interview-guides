# Angular Ecosystem, Patterns & Architecture

## 1. Angular Material & CDK

### Angular Material
Angular Material is the official UI component library implementing Google's Material Design.

```bash
ng add @angular/material
```

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatInputModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>User Profile</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="name" />
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="save()">Save</button>
        <button mat-button (click)="openDialog()">Details</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class ProfileComponent {
  private dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(DetailsDialogComponent, {
      width: '500px',
      data: { name: this.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
    });
  }
}
```

### Angular CDK (Component Dev Kit)

The CDK provides behavior primitives for building custom UI components without Material Design styling.

| CDK Module | Purpose |
|---|---|
| `DragDropModule` | Drag and drop |
| `ScrollingModule` | Virtual scrolling |
| `OverlayModule` | Floating panels, popups |
| `A11yModule` | Accessibility (focus trap, live announcer) |
| `PortalModule` | Dynamic content projection |
| `ClipboardModule` | Copy to clipboard |
| `LayoutModule` | Responsive breakpoints |

```typescript
// Drag & Drop Example
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [DragDropModule],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (item of items; track item) {
        <div cdkDrag class="drag-item">{{ item }}</div>
      }
    </div>
  `
})
export class SortableListComponent {
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
```

---

## 2. Angular Architecture Patterns

### Feature-Based Structure (Recommended)
```
src/app/
├── core/                      # Singleton services, guards, interceptors
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   └── auth.interceptor.ts
│   ├── http/
│   │   └── error.interceptor.ts
│   └── layout/
│       ├── header.component.ts
│       └── footer.component.ts
├── shared/                    # Reusable components, directives, pipes
│   ├── components/
│   │   ├── button/
│   │   ├── modal/
│   │   └── data-table/
│   ├── directives/
│   │   └── highlight.directive.ts
│   └── pipes/
│       └── truncate.pipe.ts
├── features/                  # Feature modules
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   ├── dashboard.routes.ts
│   │   ├── dashboard.store.ts
│   │   └── components/
│   │       ├── stats-card/
│   │       └── chart-widget/
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.store.ts
│   │   ├── user-list/
│   │   ├── user-detail/
│   │   └── models/
│   │       └── user.model.ts
│   └── settings/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

### Smart (Container) vs Dumb (Presentational) Components

```typescript
// SMART Component — handles data and logic
@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [UserListComponent],
  template: `
    @if (usersResource.isLoading()) {
      <app-spinner />
    } @else {
      <app-user-list
        [users]="usersResource.value() ?? []"
        (userSelected)="onUserSelected($event)"
        (userDeleted)="onUserDeleted($event)"
      />
    }
  `
})
export class UserListPageComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  usersResource = rxResource({
    loader: () => this.userService.getUsers()
  });

  onUserSelected(user: User) {
    this.router.navigate(['/users', user.id]);
  }

  onUserDeleted(user: User) {
    this.userService.deleteUser(user.id).subscribe(() => {
      this.usersResource.reload();
    });
  }
}

// DUMB Component — pure presentation, no services
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <ul>
      @for (user of users(); track user.id) {
        <li (click)="userSelected.emit(user)">
          {{ user.name }}
          <button (click)="userDeleted.emit(user); $event.stopPropagation()">Delete</button>
        </li>
      }
    </ul>
  `
})
export class UserListComponent {
  users = input.required<User[]>();
  userSelected = output<User>();
  userDeleted = output<User>();
}
```

> **Interview Tip**: Smart/Dumb (Container/Presentational) separation is a widely used pattern. Dumb components are easily testable, reusable, and have no side effects.

---

## 3. Micro-Frontend Architecture

### Module Federation (Webpack)
```typescript
// Remote App (exposed)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Dashboard': './src/app/dashboard/dashboard.component.ts'
      },
      shared: ['@angular/core', '@angular/common', '@angular/router']
    })
  ]
};

// Host App (consumes)
// In routes:
{
  path: 'dashboard',
  loadComponent: () => loadRemoteModule({
    type: 'module',
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    exposedModule: './Dashboard'
  }).then(m => m.DashboardComponent)
}
```

### Native Federation (Angular 17+)
```bash
npm i @angular-architects/native-federation
```
Uses browser-native ES module imports instead of Webpack Module Federation.

---

## 4. Internationalization (i18n)

### Built-in i18n
```html
<!-- Mark text for translation -->
<h1 i18n="@@welcomeTitle">Welcome to our app!</h1>
<p i18n="user greeting|A greeting for logged in users@@userGreeting">
  Hello, {{ username }}!
</p>
```

```bash
# Extract translation messages
ng extract-i18n --output-path src/locale

# Build for specific locale
ng build --localize
```

### Runtime i18n with `@ngx-translate`
```typescript
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [TranslateModule],
  template: `
    <h1>{{ 'HELLO' | translate: { name: 'Angular' } }}</h1>
    <button (click)="switchLanguage('fr')">French</button>
  `
})
export class AppComponent {
  translate = inject(TranslateService);

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
```

> **Interview Note**: Built-in i18n produces separate builds per locale (better performance). `@ngx-translate` switches at runtime (more flexible).

---

## 5. Animations

```typescript
import { trigger, state, style, animate, transition } from '@angular/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// In app.config.ts
providers: [provideAnimationsAsync()]

@Component({
  standalone: true,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ],
  template: `
    @if (showPanel) {
      <div @fadeInOut>Animated panel</div>
    }

    <div [@expandCollapse]="isExpanded ? 'expanded' : 'collapsed'">
      Expandable content
    </div>
  `
})
export class AnimatedComponent { }
```

### Stagger Animation (Lists)
```typescript
trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-50px)' }),
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ], { optional: true })
  ])
])
```

---

## 6. Security

### XSS Prevention
```typescript
// Angular sanitizes all bound values by default
template: `<div [innerHTML]="userContent"></div>`
// Angular automatically sanitizes dangerous tags/attributes

// To bypass (ONLY for trusted content)
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({ /* ... */ })
export class TrustedContentComponent {
  private sanitizer = inject(DomSanitizer);

  trustedHtml: SafeHtml;

  constructor() {
    // Only use for content YOU control
    this.trustedHtml = this.sanitizer.bypassSecurityTrustHtml(
      '<iframe src="https://trusted-embed.com"></iframe>'
    );
  }
}
```

### Security Best Practices
| Practice | Description |
|---|---|
| Never use `bypassSecurityTrust*` with user input | Can lead to XSS |
| Use `HttpClient` (not manual fetch) | Handles XSRF token automatically |
| Enable CSP headers | Content-Security-Policy on server |
| Use `HttpOnly` cookies for tokens | Prevents JS access |
| Validate on server | Never trust client-side validation alone |
| Use `provideHttpClient(withXsrfConfiguration())` | CSRF protection |

---

## 7. Error Handling

### Global Error Handler
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: any): void {
    const router = this.injector.get(Router);
    const logger = this.injector.get(LoggingService);

    // Log the error
    logger.logError(error);

    // Navigate to error page
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        router.navigate(['/not-found']);
      } else {
        router.navigate(['/error']);
      }
    }

    console.error('Global Error:', error);
  }
}

// Register in app.config.ts
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler }
]
```

---

## 8. Environment Configuration

### `environment.ts` (Angular 15+)
```bash
ng generate environments
```

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  features: {
    enableChat: true,
    enableAnalytics: false
  }
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.myapp.com',
  features: {
    enableChat: true,
    enableAnalytics: true
  }
};
```

### File Replacements in `angular.json`
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [{
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }]
    }
  }
}
```

### APP_INITIALIZER Pattern
```typescript
export function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

// app.config.ts
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [ConfigService],
    multi: true
  }
]
```

> **Interview Tip**: `APP_INITIALIZER` blocks app startup until the returned Promise/Observable resolves. Use it for loading config, auth tokens, etc. before the app renders.

---

## Quick Revision: Ecosystem

| Tool / Pattern | Purpose |
|---|---|
| Angular Material | Official Material Design UI components |
| Angular CDK | Behavior primitives (drag-drop, virtual scroll, overlay) |
| Feature-based structure | Organize by feature, not by type |
| Smart/Dumb components | Separate logic from presentation |
| `@ngx-translate` | Runtime i18n |
| `APP_INITIALIZER` | Run setup code before app starts |
| `ErrorHandler` | Global error handling |
| Module Federation | Micro-frontend architecture |
