# Forms & Validation

## 1. Forms Overview

Angular provides two approaches to handling forms:

| Feature | Template-Driven | Reactive |
|---|---|---|
| **Setup** | `FormsModule` | `ReactiveFormsModule` |
| **Form Model** | Created by directives in template | Created explicitly in component class |
| **Data Flow** | Two-way binding (`ngModel`) | Observable-based, immutable |
| **Validation** | Template directives | Functions in component |
| **Testing** | Needs DOM, harder to test | Easy to unit test (no DOM needed) |
| **Dynamic Forms** | Difficult | Easy |
| **Best For** | Simple forms | Complex, dynamic forms |

> **Interview Tip**: Reactive Forms are the preferred approach in enterprise Angular. Template-driven forms are suitable for very simple forms. Always default to Reactive Forms in interviews.

---

## 2. Template-Driven Forms

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
      <input name="email" ngModel required email #email="ngModel" />
      @if (email.invalid && email.touched) {
        <span class="error">Valid email required</span>
      }

      <input name="password" ngModel required minlength="8" type="password" />

      <button [disabled]="loginForm.invalid">Login</button>
    </form>

    <p>Form Valid: {{ loginForm.valid }}</p>
    <p>Form Value: {{ loginForm.value | json }}</p>
  `
})
export class LoginComponent {
  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Submitted:', form.value);
    }
  }
}
```

### Key Template-Driven Concepts
- `ngModel` creates a `FormControl` implicitly
- `#ref="ngModel"` gives template reference to the control
- `#formRef="ngForm"` gives reference to the form
- Two-way binding: `[(ngModel)]="property"`
- One-way binding: `[ngModel]="property"` (for read-only display)

---

## 3. Reactive Forms

### FormControl, FormGroup, FormBuilder

```typescript
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
        <span>Email is required</span>
      }
      @if (loginForm.get('email')?.hasError('email')) {
        <span>Invalid email</span>
      }

      <input formControlName="password" type="password" />

      <button [disabled]="loginForm.invalid">Login</button>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      // { email: '...', password: '...' }
    }
  }
}
```

### Typed Forms (Angular 14+)
```typescript
// Strictly typed — loginForm.value.email is string | undefined
loginForm = this.fb.group({
  email: ['', [Validators.required]],         // FormControl<string | null>
  password: ['', [Validators.required]],       // FormControl<string | null>
});

// Non-nullable
loginForm = this.fb.nonNullable.group({
  email: ['', Validators.required],           // FormControl<string>
  password: ['', Validators.required],         // FormControl<string>
});

// getRawValue() always returns ALL values (even disabled controls)
const allValues = this.loginForm.getRawValue();
```

> **Interview Note**: Angular 14 introduced Strictly Typed Forms. Using `fb.nonNullable.group()` ensures controls are non-nullable. This is a common interview topic.

---

## 4. FormArray (Dynamic Fields)

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm">
      <input formControlName="name" />

      <div formArrayName="skills">
        @for (skill of skills.controls; track $index) {
          <div>
            <input [formControlName]="$index" />
            <button (click)="removeSkill($index)">✕</button>
          </div>
        }
      </div>
      <button type="button" (click)="addSkill()">+ Add Skill</button>
    </form>
  `
})
export class ProfileComponent {
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    skills: this.fb.array([
      this.fb.control('Angular'),
      this.fb.control('TypeScript')
    ])
  });

  get skills() {
    return this.profileForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }
}
```

---

## 5. Validation

### Built-in Validators
| Validator | Usage |
|---|---|
| `Validators.required` | Field must have a value |
| `Validators.minLength(n)` | Minimum string length |
| `Validators.maxLength(n)` | Maximum string length |
| `Validators.min(n)` | Minimum numeric value |
| `Validators.max(n)` | Maximum numeric value |
| `Validators.email` | Valid email pattern |
| `Validators.pattern(regex)` | Matches regex pattern |
| `Validators.requiredTrue` | Must be `true` (checkboxes) |

### Custom Validator (Sync)
```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  };
}

// Usage
name: ['', [Validators.required, noWhitespaceValidator()]]
```

### Custom Validator (Async)
```typescript
import { AsyncValidatorFn } from '@angular/forms';

export function uniqueEmailValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return userService.checkEmailExists(control.value).pipe(
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// Usage — async validators go in the THIRD argument
email: ['', [Validators.required, Validators.email], [uniqueEmailValidator(this.userService)]]
```

### Cross-Field Validator (Group-Level)
```typescript
export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}

// Usage — applied to the FormGroup
this.fb.group({
  password: ['', Validators.required],
  confirmPassword: ['', Validators.required]
}, { validators: passwordMatchValidator() });
```

---

## 6. Form Control States

| State | Description |
|---|---|
| `valid` / `invalid` | Whether validation passes |
| `pristine` / `dirty` | Whether the user has changed the value |
| `untouched` / `touched` | Whether the user has focused and blurred the field |
| `pending` | Async validation is running |
| `disabled` / `enabled` | Whether the control is disabled |

### CSS Classes (Automatically Applied)
```css
/* Angular automatically applies these classes */
.ng-valid { }
.ng-invalid { }
.ng-pristine { }
.ng-dirty { }
.ng-untouched { }
.ng-touched { }
.ng-pending { }

/* Common pattern: show errors only when touched */
input.ng-invalid.ng-touched {
  border-color: red;
}
```

---

## 7. Dynamic Form Generation

```typescript
interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  validators?: ValidatorFn[];
  options?: { value: string; label: string }[];
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      @for (field of fields; track field.key) {
        <label>{{ field.label }}</label>
        @switch (field.type) {
          @case ('text') {
            <input type="text" [formControlName]="field.key" />
          }
          @case ('number') {
            <input type="number" [formControlName]="field.key" />
          }
          @case ('select') {
            <select [formControlName]="field.key">
              @for (opt of field.options; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          }
          @case ('checkbox') {
            <input type="checkbox" [formControlName]="field.key" />
          }
        }
      }
      <button type="submit">Submit</button>
    </form>
  `
})
export class DynamicFormComponent {
  fields: FormFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', validators: [Validators.required] },
    { key: 'age', label: 'Age', type: 'number', validators: [Validators.min(18)] },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'dev', label: 'Developer' },
      { value: 'designer', label: 'Designer' }
    ]}
  ];

  form: FormGroup;

  constructor() {
    const group: Record<string, any> = {};
    this.fields.forEach(f => {
      group[f.key] = ['', f.validators || []];
    });
    this.form = inject(FormBuilder).group(group);
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
```

---

## 8. Signals Integration with Forms (Angular 18+)

```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="search" />
      <p>Searching for: {{ searchValue() }}</p>
    </form>
  `
})
export class SearchComponent {
  form = inject(FormBuilder).group({
    search: ['']
  });

  // Bridge reactive forms → signals
  searchValue = toSignal(
    this.form.get('search')!.valueChanges,
    { initialValue: '' }
  );
}
```

> **Interview Tip**: Combining `toSignal()` with `valueChanges` is the modern way to bridge Reactive Forms with Angular's Signal-based reactivity.

---

## Quick Revision: Forms Cheat Sheet

| Task | Code |
|---|---|
| Create form group | `fb.group({ field: ['', Validators.required] })` |
| Create form array | `fb.array([fb.control('val')])` |
| Get control | `form.get('fieldName')` |
| Set value (all) | `form.setValue({ field: 'value' })` |
| Patch value (partial) | `form.patchValue({ field: 'value' })` |
| Reset form | `form.reset()` |
| Disable control | `form.get('field')?.disable()` |
| Mark all touched | `form.markAllAsTouched()` |
| Listen to changes | `form.valueChanges.subscribe(...)` |
| Get raw value | `form.getRawValue()` |
| Add to FormArray | `(form.get('arr') as FormArray).push(fb.control(''))` |
