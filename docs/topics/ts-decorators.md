```ts
// ==========================================
// 1. CLASS DECORATOR
// ==========================================

// Custom Class Decorator: Automatically freezes the class constructor and its prototype
function FreezeClass<T extends abstract new (...args: any[]) => any>(
  value: T,
  context: ClassDecoratorContext,
) {
  context.addInitializer(() => {
    console.log(`❄️ Freezing class: ${String(context.name)}`);
    Object.freeze(value);
    Object.freeze(value.prototype);
  });
}

// Usage
@FreezeClass
class UserService {
  constructor(public role: string) {}
}

// ==========================================
// 2. METHOD DECORATOR
// ==========================================

// Custom Method Decorator: Logs execution time and method name
function MeasureTime<T, A extends any[], R>(
  originalMethod: (...args: A) => R,
  context: ClassMethodDecoratorContext<T, (...args: A) => R>,
) {
  return function (this: T, ...args: A): R {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(
      `⏱️ [${String(context.name)}] Execution time: ${(end - start).toFixed(4)}ms`,
    );
    return result;
  };
}

// Usage
class DataProcessor {
  @MeasureTime
  computeHeavyTask() {
    let count = 0;
    for (let i = 0; i < 1_000_000; i++) {
      count += i;
    }
    return count;
  }
}

// ==========================================
// 3. GETTER DECORATOR
// ==========================================

// Custom Getter Decorator: Caches the return value of a getter after the first evaluation
function MemoizeGetter<T, R>(
  originalGetter: (this: T) => R,
  context: ClassGetterDecoratorContext<T, R>,
) {
  const cacheKey = Symbol(`cache_${String(context.name)}`);

  return function (this: any): R {
    if (cacheKey in this) {
      return this[cacheKey];
    }
    const result = originalGetter.call(this);
    this[cacheKey] = result;
    return result;
  };
}

// Usage
class ExpenseReport {
  constructor(private expenses: number[]) {}

  @MemoizeGetter
  get total() {
    console.log("🧮 Calculating total expense..."); // Only logs once
    return this.expenses.reduce((a, b) => a + b, 0);
  }
}

// ==========================================
// 4. SETTER DECORATOR
// ==========================================

// Custom Setter Decorator: Validates incoming values before updating the field
function UpperCaseSetter<T>(
  originalSetter: (this: T, value: string) => void,
  context: ClassSetterDecoratorContext<T, string>,
) {
  return function (this: T, value: string) {
    const upperCased = value.toUpperCase();
    originalSetter.call(this, upperCased);
  };
}

// Usage
class Account {
  private _username: string = "";

  @UpperCaseSetter
  set username(value: string) {
    this._username = value;
  }

  get username() {
    return this._username;
  }
}

// ==========================================
// 5. FIELD (PROPERTY) DECORATOR
// ==========================================

// Custom Field Decorator: Fallback default value if field initializes to undefined or null
function Fallback(defaultValue: string) {
  return function <T>(
    value: undefined,
    context: ClassFieldDecoratorContext<T, string>,
  ) {
    return function (initialValue: string | undefined) {
      return initialValue ?? defaultValue;
    };
  };
}

// Usage
class Configuration {
  @Fallback("https://api.production.com")
  apiUrl: string | undefined;

  @Fallback("dark")
  theme: string = "light"; // Keeps 'light' as it is explicitly provided
}

// ==========================================
// EXECUTION & VERIFICATION
// ==========================================

console.log("--- 1. Class ---");
const user = new UserService("admin");
// Object.isFrozen(UserService) -> true

console.log("\n--- 2. Method ---");
const processor = new DataProcessor();
processor.computeHeavyTask();

console.log("\n--- 3. Getter ---");
const report = new ExpenseReport([10, 20, 30]);
console.log(report.total);
console.log(report.total); // Cached, doesn't log "Calculating..."

console.log("\n--- 4. Setter ---");
const acc = new Account();
acc.username = "john_doe";
console.log(acc.username); // "JOHN_DOE"

console.log("\n--- 5. Field ---");
const config = new Configuration();
console.log(config.apiUrl); // "https://api.production.com"
console.log(config.theme); // "light"
```
