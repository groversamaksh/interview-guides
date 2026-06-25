# Angular Fundamentals & Architecture

## 1. What is Angular?
Angular is a TypeScript-based, open-source web application framework led by the Angular Team at Google. It is a comprehensive framework (unlike React or Vue, which are often considered libraries) that provides built-in solutions for routing, state management, forms, and client-server communication.

### Why Angular exists?
- To provide a highly opinionated, structured, and scalable way to build massive enterprise Single Page Applications (SPAs).
- To offer out-of-the-box tooling (CLI, Testing, Routing, HTTP) so teams don't have to assemble their own tech stacks.

### SPA Architecture
In a Single Page Application, the browser loads a single HTML document (usually `index.html`). Subsequent interactions use JavaScript to dynamically update the DOM and fetch data via APIs, rather than reloading the entire page.

## 2. Angular Application Architecture

An Angular app is built from the following core primitives:
- **Components**: The building blocks of the UI. A class combined with an HTML template.
- **Templates**: HTML enriched with Angular syntax (bindings, directives, control flow).
- **Directives**: Classes that add additional behavior to elements in your Angular applications.
- **Services**: Broad category encompassing any value, function, or feature that your application needs (business logic, data fetching).
- **Dependency Injection (DI)**: A design pattern and mechanism for providing services to components.
- **Routing**: Mechanism to navigate between different states/views.
- **Modules (NgModules)**: *Historical context*. Previously, every component had to belong to a module. Modern Angular (14+) focuses on Standalone components, making NgModules mostly obsolete.

## 3. Angular CLI

The Command Line Interface is essential for Angular development.

```bash
# Create a new workspace/app
ng new my-app --standalone

# Generate code (Component, Service, Directive)
ng generate component user-profile  # or ng g c user-profile
ng g service auth

# Serve locally
ng serve --open # Opens in default browser

# Build for production
ng build --configuration production

# Run unit tests (Karma/Jasmine or Jest)
ng test

# Run linter
ng lint
```

## 4. Standalone Components (Deep Dive)

### What and Why?
Introduced in Angular 14 and made the default in Angular 17. A Standalone Component is a component that does not need to be declared in an `NgModule`. It directly specifies its own dependencies via the `imports` array.

**Benefits over NgModules**:
- Reduces boilerplate significantly.
- Easier to learn (flatter learning curve).
- Better tree-shaking and lazy-loading granularity.
- Mental model is closer to standard web components.

### Example
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Optional, built-in features
import { UserCardComponent } from './user-card.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, UserCardComponent], // Dependencies imported directly!
  template: `
    <h1>Profile</h1>
    <app-user-card [user]="userData" />
  `
})
export class UserProfileComponent {
  userData = { name: 'Alice' };
}
```

### Migration Strategies
Angular provides an automatic schematic to migrate from NgModules to Standalone:
`ng generate @angular/core:standalone`
