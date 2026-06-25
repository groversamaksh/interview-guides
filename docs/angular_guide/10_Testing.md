# Testing

## 1. Testing Overview

| Type | Tool | Tests What |
|---|---|---|
| **Unit Tests** | Jasmine + Karma / Jest | Individual components, services, pipes |
| **Component Tests** | Angular TestBed | Component + template interaction |
| **Integration Tests** | TestBed + HttpTestingController | Components with services, HTTP |
| **E2E Tests** | Cypress / Playwright | Full application user flows |

> **Interview Note**: Angular CLI generates Karma/Jasmine by default. Many teams switch to Jest for speed. Angular 16+ has experimental Jest support built in.

---

## 2. TestBed

TestBed is Angular's testing utility that creates a testing module for configuring and creating components/services.

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent] // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial count of 0', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.count')?.textContent).toContain('0');
  });

  it('should increment count when button clicked', () => {
    const button = fixture.nativeElement.querySelector('.increment-btn');
    button.click();
    fixture.detectChanges();

    expect(component.count()).toBe(1);
    expect(fixture.nativeElement.querySelector('.count')?.textContent).toContain('1');
  });
});
```

---

## 3. Testing Services

### Simple Service
```typescript
describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorService);
  });

  it('should add two numbers', () => {
    expect(service.add(2, 3)).toBe(5);
  });
});
```

### Service with Dependencies (Mocking)
```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no unmatched requests
  });

  it('should fetch users', () => {
    const mockUsers: User[] = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers); // Provide mock response
  });

  it('should handle error', () => {
    service.getUsers().subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

---

## 4. Testing Components with Inputs/Outputs

### Testing Inputs (Signal-based)
```typescript
describe('UserCardComponent', () => {
  it('should display user name', () => {
    const fixture = TestBed.createComponent(UserCardComponent);

    // Set signal input
    fixture.componentRef.setInput('user', { name: 'Alice', email: 'alice@test.com' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Alice');
  });
});
```

### Testing Outputs
```typescript
describe('SearchComponent', () => {
  it('should emit search term on submit', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    const component = fixture.componentInstance;

    let emittedValue = '';
    component.search.subscribe((value: string) => {
      emittedValue = value;
    });

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(emittedValue).toBe('Angular');
  });
});
```

---

## 5. Testing with Spies and Mocks

### Jasmine Spies
```typescript
describe('DashboardComponent', () => {
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    // Create spy object with specified methods
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);
    spy.getUsers.and.returnValue(of([{ id: '1', name: 'Alice' }]));
    spy.deleteUser.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    });

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load users on init', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(userService.getUsers).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.user-item').length).toBe(1);
  });

  it('should call deleteUser when delete button clicked', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.delete-btn').click();

    expect(userService.deleteUser).toHaveBeenCalledWith('1');
  });
});
```

---

## 6. Testing Pipes

```typescript
describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('should truncate long strings', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(pipe.transform('Hi', 5)).toBe('Hi');
  });

  it('should handle empty strings', () => {
    expect(pipe.transform('', 5)).toBe('');
  });

  it('should use custom trail', () => {
    expect(pipe.transform('Hello World', 5, '…')).toBe('Hello…');
  });
});
```

---

## 7. Testing Directives

```typescript
@Component({
  standalone: true,
  imports: [HighlightDirective],
  template: `<p appHighlight="lightblue">Test</p>`
})
class TestHostComponent {}

describe('HighlightDirective', () => {
  it('should highlight on mouseenter', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const p = fixture.nativeElement.querySelector('p');

    p.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(p.style.backgroundColor).toBe('lightblue');

    p.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(p.style.backgroundColor).toBe('');
  });
});
```

---

## 8. Testing Reactive Forms

```typescript
describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginFormComponent]
    });
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should be valid with proper values', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should show email error when invalid', () => {
    const emailControl = component.loginForm.get('email')!;
    emailControl.setValue('invalid');
    emailControl.markAsTouched();
    fixture.detectChanges();

    expect(emailControl.hasError('email')).toBeTrue();
  });

  it('should disable submit button when invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();

    expect(button.disabled).toBeFalse();
  });
});
```

---

## 9. Testing Router

```typescript
describe('AppComponent routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: HomeComponent },
          { path: 'about', component: AboutComponent }
        ])
      ]
    });
  });

  it('should navigate to about page', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    await router.navigate(['/about']);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('About');
  });
});
```

---

## 10. E2E Testing with Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[formControlName="email"]', 'admin@example.com');
    await page.fill('input[formControlName="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toHaveText('Welcome, Admin');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

---

## 11. Jest Configuration (Angular 16+)

```typescript
// angular.json
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular-devkit/build-angular:jest",
          "options": {
            "tsConfig": "tsconfig.spec.json"
          }
        }
      }
    }
  }
}
```

---

## Quick Revision: Testing

| What to Test | How |
|---|---|
| Service logic | `TestBed.inject(Service)` |
| HTTP calls | `HttpTestingController` |
| Component rendering | `fixture.nativeElement` queries |
| Signal inputs | `fixture.componentRef.setInput()` |
| Outputs | Subscribe to output, trigger action |
| Forms | Set values with `patchValue()`, check validity |
| Routing | `provideRouter()` + `router.navigate()` |
| Directives | Test with a host component |
| Pipes | Instantiate directly, call `transform()` |
| E2E | Playwright / Cypress |
