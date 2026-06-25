# JavaScript & TypeScript — Cheat Sheet + Interview Revision Guide

> **Audience**: Frontend & Full-Stack Developers  
> **Purpose**: Interview preparation, quick revision, production reference  
> **Levels**: Beginner → Intermediate → Advanced

---

## Table of Contents

1. [JavaScript Fundamentals](#javascript-fundamentals)
2. [Functions](#functions)
3. [Objects & Arrays](#objects--arrays)
4. [Execution Context & Memory](#execution-context--memory)
5. [Closures](#closures)
6. [The `this` Keyword](#the-this-keyword)
7. [Prototypes & Inheritance](#prototypes--inheritance)
8. [Asynchronous JavaScript](#asynchronous-javascript)
9. [Browser APIs](#browser-apis)
10. [Modern JavaScript (ES6+)](#modern-javascript-es6)
11. [TypeScript Fundamentals](#typescript-fundamentals)
12. [TypeScript Objects & Functions](#typescript-objects--functions)
13. [Generics](#generics)
14. [Advanced TypeScript](#advanced-typescript)
15. [Utility Types](#utility-types)
16. [Classes](#classes)
17. [Modules](#modules)
18. [Error Handling](#error-handling)
19. [Performance & Optimization](#performance--optimization)
20. [Common Interview Topics](#common-interview-topics)
21. [Frequently Asked Interview Questions](#frequently-asked-interview-questions)
22. [Coding Problems](#coding-problems)
23. [Polyfill Implementations](#polyfill-implementations)
24. [Quick Revision Tables](#quick-revision-tables)
25. [Senior Developer Notes](#senior-developer-notes)

---

# 1. JavaScript Fundamentals

## Variables

### `var`, `let`, `const`

```js
var x = 1;    // function-scoped, hoisted (undefined), re-declarable
let y = 2;    // block-scoped, hoisted (TDZ), not re-declarable
const z = 3;  // block-scoped, hoisted (TDZ), not re-assignable
```

| Feature         | `var`           | `let`           | `const`         |
|-----------------|-----------------|-----------------|-----------------|
| Scope           | Function        | Block           | Block           |
| Hoisting        | `undefined`     | TDZ             | TDZ             |
| Re-declare      | ✅              | ❌              | ❌              |
| Re-assign       | ✅              | ✅              | ❌              |
| Mutable binding | ✅              | ✅              | ❌ (value mutable if object/array) |

### Scope

```js
function scopeDemo() {
  if (true) {
    var a = 1;   // leaks to function scope
    let b = 2;   // block-scoped
    const c = 3; // block-scoped
  }
  console.log(a); // 1
  // console.log(b); // ReferenceError
  // console.log(c); // ReferenceError
}
```

### Hoisting

```js
console.log(x); // undefined (var hoisted)
var x = 5;

console.log(y); // ReferenceError (TDZ)
let y = 5;
```

### Temporal Dead Zone (TDZ)

The period between entering a scope and the variable's declaration being evaluated. Accessing a `let`/`const` variable in this zone throws `ReferenceError`.

```js
// TDZ starts at block entry
{
  // console.log(x); // TDZ — ReferenceError
  let x = 10;       // TDZ ends here
  console.log(x);   // 10
}
```

> **Interview tip**: `var` is hoisted and initialized to `undefined`. `let`/`const` are hoisted but NOT initialized — that gap is the TDZ.

---

## Data Types

### Primitive Types (immutable, stored by value)

| Type      | Example                    | `typeof`    |
|-----------|----------------------------|-------------|
| `string`  | `"hello"`                  | `"string"`  |
| `number`  | `42`, `3.14`, `NaN`, `Infinity` | `"number"` |
| `boolean` | `true`, `false`            | `"boolean"` |
| `bigint`  | `9007199254740993n`        | `"bigint"`  |
| `symbol`  | `Symbol("id")`             | `"symbol"`  |
| `undefined` | `let x;`                 | `"undefined"` |
| `null`    | `null`                     | `"object"` ⚠️ |

### Reference Types (mutable, stored by reference)

```js
// Object, Array, Function, Date, RegExp, Map, Set, WeakMap, WeakSet
const obj = { a: 1 };
const arr = [1, 2, 3];
const fn = () => {};
```

### `typeof` Operator

```js
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object"  ← historical bug
typeof Symbol()   // "symbol"
typeof 10n        // "bigint"
typeof {}         // "object"
typeof []         // "object"
typeof (() => {}) // "function"
```

### `instanceof`

```js
[] instanceof Array;       // true
new Date() instanceof Date; // true
function Foo() {}
new Foo() instanceof Foo;  // true
```

> **Interview tip**: `typeof null === "object"` is a known bug from JS's first implementation. Use `Array.isArray()` for arrays.

---

## Operators

### Equality

```js
0 == false       // true  (loose — type coercion)
0 === false      // false (strict — no coercion)
null == undefined // true
null === undefined // false
NaN === NaN       // false ← use Number.isNaN()
```

### Logical Operators

```js
true && false    // false
true || false    // true
!true            // false

// Short-circuit evaluation
const name = user && user.name;       // if user is falsy, returns user
const name = user?.name;              // optional chaining (preferred)
const fallback = value || "default";  // returns "default" if value is falsy
```

### Nullish Coalescing (`??`)

```js
null ?? "default"      // "default"
undefined ?? "default" // "default"
0 ?? "default"         // 0       ← || would return "default"
"" ?? "default"        // ""      ← || would return "default"
false ?? "default"     // false   ← || would return "default"
```

### Optional Chaining (`?.`)

```js
const user = { address: { city: "NYC" } };
user.address?.city;        // "NYC"
user.contact?.phone;       // undefined (no error)
user.friends?.[0];         // undefined
user.greet?.();             // undefined
```

### Spread (`...`)

```js
// Arrays
const a = [1, 2];
const b = [...a, 3, 4]; // [1, 2, 3, 4]

// Objects (shallow clone + merge)
const obj1 = { x: 1 };
const obj2 = { ...obj1, y: 2 }; // { x: 1, y: 2 }

// Function arguments
Math.max(...[1, 2, 3]); // 3
```

### Rest (`...`)

```js
// Function parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// Destructuring
const [first, ...rest] = [1, 2, 3, 4]; // first=1, rest=[2,3,4]
const { name, ...others } = { name: "A", age: 1, role: "dev" };
```

---

## Control Flow

### `if / else if / else`

```js
if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else {
  grade = "F";
}
```

### `switch`

```js
switch (action) {
  case "start":
    start();
    break;
  case "stop":
    stop();
    break;
  default:
    idle();
}
```

> **Interview tip**: `switch` uses `===` comparison. Don't forget `break` — fall-through is a common bug.

### Loops

```js
// for
for (let i = 0; i < 5; i++) { /* ... */ }

// while
while (condition) { /* ... */ }

// do...while
do { /* ... */ } while (condition);

// for...of (iterables: arrays, strings, maps, sets)
for (const val of [10, 20, 30]) { console.log(val); }

// for...in (object keys — avoid for arrays)
for (const key in { a: 1, b: 2 }) { console.log(key); }
```

### `break` & `continue`

```js
for (let i = 0; i < 10; i++) {
  if (i === 3) continue; // skip 3
  if (i === 7) break;    // stop at 7
  console.log(i);        // 0,1,2,4,5,6
}
```

---

# 2. Functions

## Function Declarations vs Expressions vs Arrow Functions

```js
// Declaration — hoisted, can be called before definition
function add(a, b) { return a + b; }

// Expression — NOT hoisted
const add = function(a, b) { return a + b; };

// Arrow — concise, no own `this`, `arguments`, or `super`
const add = (a, b) => a + b;
```

| Feature            | Declaration | Expression | Arrow        |
|--------------------|-------------|------------|--------------|
| Hoisted            | ✅          | ❌         | ❌           |
| Own `this`         | ✅          | ✅         | ❌ (lexical) |
| `arguments` object | ✅          | ✅         | ❌           |
| `new.target`       | ✅          | ✅         | ❌           |
| Can be constructor | ✅          | ✅         | ❌           |

## Default Parameters

```js
function greet(name = "Guest", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
greet();            // "Hello, Guest!"
greet("Alice");     // "Hello, Alice!"
greet("Bob", "Hi"); // "Hi, Bob!"
```

## Rest Parameters

```js
function log(...args) {
  args.forEach(a => console.log(a));
}
log(1, 2, 3); // 1, 2, 3
```

## Higher-Order Functions

Functions that take functions as arguments or return functions.

```js
// Takes a function
[1, 2, 3].map(x => x * 2); // [2, 4, 6]

// Returns a function
function multiplier(factor) {
  return (num) => num * factor;
}
const double = multiplier(2);
double(5); // 10
```

## Pure Functions

```js
// Pure: same input → same output, no side effects
function add(a, b) { return a + b; }

// Impure: depends on external state
let total = 0;
function addToTotal(n) { total += n; return total; }
```

> **Interview tip**: Pure functions are predictable, testable, and essential for React/Redux. Impure functions cause bugs that are hard to trace.

---

# 3. Objects & Arrays

## Objects

### Creation

```js
const obj = { name: "Alice", age: 30 };
const obj2 = new Object({ name: "Bob" });
const obj3 = Object.create(null); // no prototype
```

### Destructuring

```js
const { name, age, role = "user" } = user;
const { name: userName } = user; // rename

// Nested
const { address: { city } } = user;

// In function params
function display({ name, age }) {
  console.log(name, age);
}
```

### Object Methods

```js
const obj = { a: 1, b: 2, c: 3 };

Object.keys(obj);    // ["a", "b", "c"]
Object.values(obj);  // [1, 2, 3]
Object.entries(obj); // [["a",1], ["b",2], ["c",3]]

Object.fromEntries([["a", 1], ["b", 2]]); // { a: 1, b: 2 }
```

### `Object.freeze` vs `Object.seal`

```js
const frozen = Object.freeze({ a: 1 });
frozen.a = 2;       // silently fails (strict: TypeError)
frozen.b = 2;       // fails
delete frozen.a;    // fails

const sealed = Object.seal({ a: 1 });
sealed.a = 2;       // ✅ allowed (modify existing)
sealed.b = 2;       // ❌ fails (no new props)
delete sealed.a;    // ❌ fails
```

### `Object.assign`

```js
const target = { a: 1 };
const source = { b: 2, c: 3 };
const merged = Object.assign(target, source); // { a: 1, b: 2, c: 3 }
// target is mutated! Use {} as first arg for non-mutating:
const merged2 = Object.assign({}, target, source);
// Or use spread:
const merged3 = { ...target, ...source };
```

> **Interview tip**: `Object.freeze` is shallow — nested objects are NOT frozen.

---

## Arrays

### `map` — transform each element

```js
[1, 2, 3].map(x => x * 2); // [2, 4, 6]
```

### `filter` — keep elements matching condition

```js
[1, 2, 3, 4].filter(x => x % 2 === 0); // [2, 4]
```

### `reduce` — accumulate to single value

```js
[1, 2, 3].reduce((sum, x) => sum + x, 0); // 6

// Group by
const people = [
  { name: "A", dept: "eng" },
  { name: "B", dept: "eng" },
  { name: "C", dept: "hr" },
];
const grouped = people.reduce((acc, p) => {
  (acc[p.dept] ??= []).push(p);
  return acc;
}, {});
// { eng: [{...}, {...}], hr: [{...}] }
```

### `find` / `findIndex`

```js
[1, 2, 3].find(x => x > 1);       // 2
[1, 2, 3].findIndex(x => x > 1);  // 1
```

### `some` / `every`

```js
[1, 2, 3].some(x => x > 2);  // true  (at least one)
[1, 2, 3].every(x => x > 0); // true  (all match)
```

### `flat` / `flatMap`

```js
[1, [2, [3]]].flat(Infinity); // [1, 2, 3]
[1, 2, 3].flatMap(x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]
```

### `sort`

```js
[3, 1, 2].sort();                    // [1, 2, 3] (converts to string!)
[10, 9, 8].sort((a, b) => a - b);   // [8, 9, 10] (numeric)
[10, 9, 8].sort((a, b) => b - a);   // [10, 9, 8] (descending)

// ⚠️ sort mutates the array!
const sorted = [...arr].sort((a, b) => a - b); // non-mutating
```

> **Interview tip**: `[10, 2, 1].sort()` → `[1, 10, 2]` because it sorts by UTF-16 code units. Always pass a comparator for numbers.

---

# 4. Execution Context & Memory

## Execution Context

Every time code runs, it executes inside an **Execution Context** (EC). Each EC has:

1. **Creation Phase** — memory allocated, variables/functions hoisted
2. **Execution Phase** — code runs, values assigned

```
┌──────────────────────────────────────┐
│         Global Execution Context      │
│  ┌────────────────────────────────┐  │
│  │  Function EC (e.g., foo())     │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  Function EC (bar())     │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Call Stack

LIFO structure tracking which function is currently executing.

```js
function c() { console.log("c"); }
function b() { c(); }
function a() { b(); }
a();
```

```
Call Stack:
│ a()  │  →  │ b()  │  →  │ c()  │  →  (empty)
│      │     │ a()  │     │ b()  │
│      │     │      │     │ a()  │
```

## Memory Heap

Where objects, arrays, and functions are stored. The call stack holds references (pointers) to heap memory.

```js
const a = { x: 1 }; // stack: a → pointer → heap: { x: 1 }
const b = a;         // b points to same heap object
b.x = 2;             // a.x is also 2!
```

## Scope Chain & Lexical Environment

```js
const globalVar = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";
    console.log(innerVar);  // ✅ own scope
    console.log(outerVar);  // ✅ parent scope (scope chain)
    console.log(globalVar); // ✅ global scope
  }
  inner();
}
```

```
Lexical Environment Chain:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ inner()     │───▶│ outer()     │───▶│ Global      │
│ innerVar    │    │ outerVar    │    │ globalVar   │
└─────────────┘    └─────────────┘    └─────────────┘
```

Each function remembers the scope it was **created** in (lexical), not where it's **called** from.

---

# 5. Closures

A **closure** is a function that retains access to its lexical scope even when executed outside that scope.

```js
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
```

## How Closures Work

```
createCounter() called
┌──────────────────────────────┐
│ Lexical Environment:         │
│   count = 0                  │
│   ┌────────────────────────┐ │
│   │ increment: () => ...   │ │ ← closure over count
│   │ getCount: () => ...    │ │ ← closure over count
│   └────────────────────────┘ │
└──────────────────────────────┘
```

## Practical Use Cases

```js
// 1. Data privacy / encapsulation
function createWallet(initial) {
  let balance = initial;
  return {
    deposit(amount) { balance += amount; },
    getBalance() { return balance; },
  };
}

// 2. Function factories
function multiplier(factor) {
  return (n) => n * factor;
}
const triple = multiplier(3);
triple(5); // 15

// 3. Memoization
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 4. Event handlers with state
function setupButton(buttonId) {
  let clicks = 0;
  document.getElementById(buttonId).addEventListener("click", () => {
    clicks++;
    console.log(`Clicked ${clicks} times`);
  });
}
```

## Common Interview Question — Loop with `var`

```js
// Bug: all callbacks log 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// Fix 1: Use let (block scope)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}

// Fix 2: IIFE with var
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i); // 0, 1, 2
}
```

> **Interview tip**: Closures are the #1 JS interview topic. Know the loop+var trap cold.

---

# 6. The `this` Keyword

`this` is determined by **how a function is called**, not where it's defined.

### Global Context

```js
console.log(this); // window (browser) / global (Node)
```

### Object Method

```js
const obj = {
  name: "Alice",
  greet() { console.log(this.name); },
};
obj.greet(); // "Alice" — this = obj
```

### Constructor / Class

```js
function Person(name) {
  this.name = name;
}
const p = new Person("Bob"); // this = new instance

class Animal {
  constructor(name) { this.name = name; }
}
```

### Arrow Functions (lexical `this`)

```js
const obj = {
  name: "Alice",
  greet: () => console.log(this.name), // this = global/window!
  greetProper() {
    const inner = () => console.log(this.name); // this = obj ✅
    inner();
  },
};
```

### `call`, `apply`, `bind`

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Alice" };

greet.call(person, "Hi", "!");     // "Hi, I'm Alice!"
greet.apply(person, ["Hi", "!"]);   // "Hi, I'm Alice!"

const bound = greet.bind(person);
bound("Hello", "."); // "Hello, I'm Alice."
```

| Method  | Invocation                   | Args           |
|---------|------------------------------|----------------|
| `call`  | Calls immediately            | Comma-separated |
| `apply` | Calls immediately            | Array           |
| `bind`  | Returns new function         | Comma-separated |

### Common Pitfall — Losing `this`

```js
const btn = document.querySelector("button");
const obj = {
  name: "Alice",
  handleClick() { console.log(this.name); },
};

// ❌ this = button element, not obj
btn.addEventListener("click", obj.handleClick);

// ✅ Fix with bind
btn.addEventListener("click", obj.handleClick.bind(obj));

// ✅ Fix with arrow
btn.addEventListener("click", () => obj.handleClick());
```

> **Interview tip**: Arrow functions don't have their own `this`. They inherit from the enclosing lexical scope. This is both a feature and a trap.

---

# 7. Prototypes & Inheritance

### Prototype Chain

Every object has an internal `[[Prototype]]` (accessible via `__proto__` or `Object.getPrototypeOf()`). Property lookup walks up the chain.

```
{ a: 1 }  →  Object.prototype  →  null
```

### Constructor Functions (Pre-ES6)

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

const dog = new Animal("Rex");
dog.speak(); // "Rex makes a sound"
```

### `Object.create`

```js
const animalProto = {
  speak() { return `${this.name} makes a sound`; },
};
const dog = Object.create(animalProto);
dog.name = "Rex";
dog.speak(); // "Rex makes a sound"
```

### Classical Inheritance

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return `${this.name} speaks`; };

function Dog(name, breed) {
  Animal.call(this, name); // inherit instance props
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function () { return "Woof!"; };
```

### Modern Inheritance (ES6 Classes)

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} speaks`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // must call before using `this`
    this.breed = breed;
  }
  bark() { return "Woof!"; }
}

const d = new Dog("Rex", "Lab");
d.speak(); // "Rex speaks"
d.bark();  // "Woof!"
```

> **Interview tip**: Classes are syntactic sugar over prototype-based inheritance. Under the hood, it's still prototypes.

---

# 8. Asynchronous JavaScript

## Event Loop

```
┌─────────────────────────────────────────────────────┐
│                    Event Loop                        │
│                                                      │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │Call Stack│   │Microtask Queue│   │Macrotask    │ │
│  │          │   │(Promises,    │   │Queue        │ │
│  │          │   │ queueMicro-  │   │(setTimeout, │ │
│  │          │   │ task,        │   │ setInterval,│ │
│  │          │   │ MutationObs) │   │ I/O, UI)    │ │
│  └──────────┘   └──────────────┘   └─────────────┘ │
│       ▲               │                   │         │
│       │    drain ALL  │    drain ONE      │         │
│       └───────────────┘    then re-check  └─────────│
└─────────────────────────────────────────────────────┘
```

**Execution order**:
1. Run synchronous code (call stack)
2. Drain **all** microtasks (Promise callbacks, `queueMicrotask`)
3. Run **one** macrotask (setTimeout, setInterval)
4. Repeat from step 2

### Execution Order Example

```js
console.log("1: sync");

setTimeout(() => console.log("2: macrotask"), 0);

Promise.resolve().then(() => console.log("3: microtask"));

console.log("4: sync");

// Output: 1: sync → 4: sync → 3: microtask → 2: macrotask
```

## Callbacks

```js
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: "Alice" });
  }, 1000);
}

fetchData((err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

**Problem**: Callback hell — deeply nested, hard to read and maintain.

## Promises

```js
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) resolve("Data loaded");
  else reject("Error occurred");
});

promise
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log("Done"));
```

### Promise States

```
         resolve()
Pending ──────────▶ Fulfilled
  │
  │ reject()
  ▼
Rejected
```

## `async / await`

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const user = await res.json();
    return user;
  } catch (err) {
    console.error("Failed:", err);
    throw err;
  }
}

// Sequential (slow)
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);

// Parallel (fast)
const [user, posts] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
]);
```

> **Interview tip**: `await` pauses the async function, not the whole program. Other code continues running.

## Promise APIs

```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.reject("fail");

// Promise.all — all must resolve
Promise.all([p1, p2])       // [1, 2]
Promise.all([p1, p3])       // rejects with "fail"

// Promise.allSettled — wait for all, regardless of outcome
Promise.allSettled([p1, p3])
// [{ status: "fulfilled", value: 1 }, { status: "rejected", reason: "fail" }]

// Promise.race — first to settle (resolve or reject)
Promise.race([p1, p3])      // 1 (p1 resolves first)

// Promise.any — first to resolve (ignores rejections)
Promise.any([p3, p1])       // 1
Promise.any([p3])           // AggregateError
```

| API               | Resolves When          | Rejects When                  |
|-------------------|------------------------|-------------------------------|
| `Promise.all`     | All fulfill            | Any rejects                   |
| `Promise.allSettled` | Always (all settled) | Never                         |
| `Promise.race`    | First settles (any)    | First settles (any)           |
| `Promise.any`     | First fulfills         | All reject (AggregateError)   |

---

# 9. Browser APIs

## DOM Manipulation

```js
// Selecting
document.getElementById("app");
document.querySelector(".container > h1");
document.querySelectorAll("li.active");

// Creating & inserting
const div = document.createElement("div");
div.textContent = "Hello";
div.classList.add("card");
document.body.appendChild(div);

// Modifying
el.innerHTML = "<b>Bold</b>";       // ⚠️ XSS risk
el.textContent = "Safe text";        // ✅ safe
el.setAttribute("data-id", "42");
el.style.color = "red";
```

## Event Handling

```js
const btn = document.querySelector("#myBtn");

btn.addEventListener("click", (e) => {
  console.log("Clicked!", e.target);
});

// Remove listener
const handler = () => console.log("hi");
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler);
```

## Event Bubbling & Capturing

```
           ┌──────────┐
           │  <html>   │  ← Capturing phase (top-down)
           │  ┌──────┐ │
           │  │<body>│ │
           │  │┌────┐│ │
           │  ││<div>││ │  ← Target
           │  │└────┘│ │
           │  └──────┘ │
           └──────────┘
           Bubbling phase (bottom-up)
```

```js
// Bubbling (default)
parent.addEventListener("click", () => console.log("parent"));
child.addEventListener("click", () => console.log("child"));
// Click child → "child" → "parent"

// Capturing
parent.addEventListener("click", handler, true); // or { capture: true }
// Click child → "parent" (capture) → "child" (bubble)
```

## Event Delegation

```js
// Instead of adding listeners to each <li>:
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.textContent);
  }
});
```

> **Interview tip**: Event delegation uses bubbling + `e.target` to handle events on many children with a single listener. Great for dynamic lists.

## Storage

| Feature           | `localStorage`         | `sessionStorage`       | Cookies                |
|-------------------|------------------------|------------------------|------------------------|
| Capacity          | ~5-10 MB               | ~5 MB                  | ~4 KB                  |
| Persists          | Until cleared          | Until tab closes       | Until expiry           |
| Sent to server    | No                     | No                     | Yes (with every request)|
| API               | `setItem/getItem/removeItem/clear` | Same      | `document.cookie`      |

```js
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme"); // "dark"
localStorage.removeItem("theme");
```

## Fetch API

```js
// GET
const res = await fetch("/api/users");
const data = await res.json();

// POST
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice" }),
});

// Error handling — fetch doesn't reject on 4xx/5xx!
if (!res.ok) throw new Error(`HTTP ${res.status}`);
```

## AbortController

```js
const controller = new AbortController();

// Timeout after 5s
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch("/api/data", {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const data = await res.json();
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Request cancelled");
  }
}

// Manual cancel
controller.abort();
```

---

# 10. Modern JavaScript (ES6+)

## Modules

```js
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { PI, add } from "./math.js";
import * as math from "./math.js"; // namespace import
```

## Template Literals

```js
const name = "Alice";
const greeting = `Hello, ${name}!`;

// Multi-line
const html = `
  <div>
    <h1>${name}</h1>
  </div>
`;

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    `${result}${str}<mark>${values[i] || ""}</mark>`, "");
}
highlight`Hello ${name}, you are ${30} years old`;
```

## Destructuring

```js
// Arrays
const [a, b, ...rest] = [1, 2, 3, 4, 5];

// Objects
const { name, age, address: { city } = {} } = user;

// Swap variables
[a, b] = [b, a];

// Function params
function render({ title, body = "" }) { /* ... */ }
```

## Dynamic Imports

```js
// Lazy-load modules on demand
const module = await import("./heavy-module.js");

// Conditional loading
if (needsChart) {
  const { renderChart } = await import("./chart.js");
  renderChart(data);
}
```

---

# 11. TypeScript Fundamentals

## Basic Types

```ts
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let big: bigint = 100n;
let sym: symbol = Symbol("id");
let undef: undefined = undefined;
let nul: null = null;

// Special types
let anything: any = "anything";     // opt out of type checking
let unknownVal: unknown = "safe";   // type-safe any
let nothing: void = undefined;      // no return value
let impossible: never = (() => { throw new Error(); })(); // never returns
```

| Type      | Use Case                                     |
|-----------|----------------------------------------------|
| `any`     | Escape hatch — avoid when possible           |
| `unknown` | Safe alternative to `any` — must narrow first|
| `void`    | Function returns nothing                     |
| `never`   | Function never returns (throws/infinite loop)|
| `null`    | Explicit absence of value                    |
| `undefined` | Not yet assigned                           |

## Type Inference

```ts
let x = 42;          // inferred as number
const y = "hello";   // inferred as "hello" (literal type for const)
const arr = [1, 2];  // number[]

function add(a: number, b: number) {
  return a + b;       // return type inferred as number
}
```

## Type Assertions

```ts
const input = document.getElementById("myInput") as HTMLInputElement;
const value = (<HTMLInputElement>input).value; // alternate syntax

// Non-null assertion
const el = document.querySelector("#app")!; // tells TS it's not null
```

## Literal Types

```ts
let direction: "up" | "down" | "left" | "right";
direction = "up"; // ✅
// direction = "diagonal"; // ❌

const status: "active" | "inactive" | "pending" = "active";
```

## Union Types

```ts
let id: string | number;
id = "abc";  // ✅
id = 123;    // ✅
// id = true; // ❌

function formatId(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase(); // narrowed to string
  }
  return id.toFixed(2);     // narrowed to number
}
```

## Intersection Types

```ts
type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge; // { name: string; age: number }

const p: Person = { name: "Alice", age: 30 };
```

---

# 12. TypeScript Objects & Functions

## Interfaces

```ts
interface User {
  id: number;
  name: string;
  email?: string;           // optional
  readonly createdAt: Date; // readonly
}

// Extending
interface Admin extends User {
  permissions: string[];
}
```

## Type Aliases

```ts
type Point = {
  x: number;
  y: number;
};

type ID = string | number;

type Callback = (data: string) => void;
```

## Interface vs Type

| Feature              | `interface`          | `type`               |
|----------------------|----------------------|----------------------|
| Extension            | `extends`            | `&` (intersection)   |
| Declaration merging  | ✅ (auto-merge)      | ❌                   |
| Computed properties  | ❌                   | ✅                   |
| Union types          | ❌                   | ✅                   |
| Tuples               | ❌                   | ✅                   |
| Primitives           | ❌                   | ✅                   |

> **Rule of thumb**: Use `interface` for object shapes (especially public APIs). Use `type` for unions, intersections, and complex types.

## Function Types

```ts
// Inline
let greet: (name: string) => string;
greet = (name) => `Hello, ${name}`;

// Type alias
type MathOp = (a: number, b: number) => number;
const add: MathOp = (a, b) => a + b;

// Overloads
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number) {
  return typeof input === "string" ? parseFloat(input) : String(input);
}
```

---

# 13. Generics

## Generic Functions

```ts
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello"); // explicit
identity(42);              // inferred as number
```

## Generic Interfaces

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User[]>;
```

## Generic Constraints

```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");  // ✅
getLength([1, 2]);   // ✅
// getLength(42);    // ❌ number has no .length

// keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name"); // ✅
// getProperty(user, "email"); // ❌
```

## Real-World Generic Examples

```ts
// Generic hook (React)
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Generic fetch wrapper
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const users = await fetchJSON<User[]>("/api/users");
```

---

# 14. Advanced TypeScript

## `keyof`

```ts
type Person = { name: string; age: number };
type PersonKeys = keyof Person; // "name" | "age"
```

## `typeof` (Type-Level)

```ts
const config = { port: 3000, host: "localhost" };
type Config = typeof config; // { port: number; host: string }
```

## Indexed Access Types

```ts
type Person = { name: string; age: number; address: { city: string } };
type Name = Person["name"];           // string
type City = Person["address"]["city"]; // string
type NameOrAge = Person["name" | "age"]; // string | number
```

## Mapped Types

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
// Getters<{ name: string }> → { getName: () => string }
```

## Conditional Types

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// Extract promise value type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>;          // number
```

## `infer`

```ts
// Extract return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract array element type
type ElementType<T> = T extends (infer E)[] ? E : never;
type A = ElementType<string[]>; // string

// Extract resolved type from Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
```

## Template Literal Types

```ts
type EventName = `on${Capitalize<string>}`;
// "onA" | "onB" | ... | "onClick" | "onFocus" | ...

type CSSProperty = `${"margin" | "padding"}-${"top" | "right" | "bottom" | "left"}`;
// "margin-top" | "margin-right" | ... | "padding-left"

// Parse route params
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
```

---

# 15. Utility Types

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user";
}

// Partial — all properties optional
type UpdateUser = Partial<User>;
// { id?: number; name?: string; ... }

// Required — all properties required
type StrictUser = Required<Partial<User>>;

// Readonly — all properties readonly
type FrozenUser = Readonly<User>;

// Pick — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit — exclude specific properties
type UserWithoutEmail = Omit<User, "email">;
// { id: number; name: string; age: number; role: "admin" | "user" }

// Record — object with specific key/value types
type UserMap = Record<string, User>;
type RolePermissions = Record<User["role"], string[]>;

// Exclude / Extract
type AllRoles = "admin" | "user" | "guest";
type NonGuest = Exclude<AllRoles, "guest">;    // "admin" | "user"
type OnlyAdmin = Extract<AllRoles, "admin">;   // "admin"

// ReturnType
function createUser() { return { id: 1, name: "A" }; }
type CreateUserReturn = ReturnType<typeof createUser>;
// { id: number; name: string }

// Parameters
function greet(name: string, age: number) {}
type GreetParams = Parameters<typeof greet>;
// [name: string, age: number]

// Awaited — unwrap Promise
type Unwrapped = Awaited<Promise<Promise<string>>>; // string
```

### Practical Examples

```ts
// Form state with Partial
type FormState<T> = {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
};

// API response wrapper
type ApiResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Type-safe event emitter
type EventMap = {
  login: { userId: string };
  logout: undefined;
  error: { message: string; code: number };
};

class TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {}
  emit<K extends keyof T>(event: K, data: T[K]) {}
}
```

---

# 16. Classes

```ts
class Animal {
  // Access modifiers
  public name: string;
  protected sound: string;
  private _age: number;
  readonly species: string;

  // Static members
  static count = 0;
  static getCount() { return Animal.count; }

  constructor(name: string, sound: string, age: number) {
    this.name = name;
    this.sound = sound;
    this._age = age;
    this.species = "animal";
    Animal.count++;
  }

  // Parameter properties (shorthand)
  // constructor(public name: string, protected sound: string, private _age: number) {}

  speak(): string {
    return `${this.name} says ${this.sound}`;
  }

  // Getters / Setters
  get age() { return this._age; }
  set age(value: number) {
    if (value < 0) throw new Error("Age can't be negative");
    this._age = value;
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name, "Woof", 0);
  }

  override speak(): string {
    return `${super.speak()} (breed: ${this.breed})`;
  }
}
```

## Abstract Classes

```ts
abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area() { return Math.PI * this.radius ** 2; }
}
```

> **Interview tip**: Abstract classes can have implementation. Interfaces cannot. Use abstract classes when you want shared logic + enforced contract.

---

# 17. Modules

```ts
// Named exports
export const API_URL = "/api";
export function fetchData() { /* ... */ }
export class UserService { /* ... */ }

// Default export (one per file)
export default class Logger { /* ... */ }

// Re-export
export { UserService } from "./services/user";
export * from "./types";

// Imports
import Logger, { API_URL, fetchData } from "./api";
import * as Api from "./api";

// Dynamic imports (code splitting)
const module = await import("./heavy-module");
```

---

# 18. Error Handling

```ts
// try / catch / finally
try {
  const data = JSON.parse(input);
  processData(data);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error("Invalid JSON");
  } else if (error instanceof TypeError) {
    console.error("Type error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
} finally {
  cleanup();
}

// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

// Usage
try {
  const user = await findUser(id);
  if (!user) throw new NotFoundError("User");
} catch (err) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
}
```

> **Best practices**: Always throw `Error` objects (not strings). Use custom error classes for domain-specific errors. Always handle errors in async code.

---

# 19. Performance & Optimization

## Debounce

Delays execution until after a pause in calls.

```js
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: search input
const search = debounce((query) => {
  fetchResults(query);
}, 500);

input.addEventListener("input", (e) => search(e.target.value));
```

## Throttle

Ensures execution at most once per interval.

```js
function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Usage: scroll handler
window.addEventListener("scroll", throttle(() => {
  updateScrollPosition();
}, 100));
```

## Memoization

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = memoize((n) => {
  if (n <= 1) return n;
  return expensiveCalc(n - 1) + expensiveCalc(n - 2);
});
```

## Lazy Loading

```js
// Dynamic imports for code splitting
button.addEventListener("click", async () => {
  const { renderChart } = await import("./chart.js");
  renderChart(data);
});

// React.lazy
const HeavyComponent = React.lazy(() => import("./HeavyComponent"));
```

## Key Performance Patterns

| Pattern              | When to Use                       |
|----------------------|-----------------------------------|
| Debounce             | Search input, resize, form validation |
| Throttle             | Scroll, mousemove, rate-limited API calls |
| Memoization          | Expensive pure computations       |
| Lazy loading         | Heavy components, routes, images  |
| Virtual scrolling    | Large lists (1000+ items)         |
| Web Workers          | CPU-intensive tasks               |
| Request batching     | Multiple API calls                |

---

# 20. Common Interview Topics

## Hoisting

```js
// Variables
console.log(a); // undefined (var hoisted)
var a = 1;

console.log(b); // ReferenceError (let TDZ)
let b = 2;

// Functions
foo(); // ✅ "hello" (function declaration hoisted)
function foo() { console.log("hello"); }

bar(); // ❌ TypeError (function expression — bar is undefined)
var bar = function () { console.log("hello"); };
```

## Deep Clone vs Shallow Clone

```js
const original = { a: 1, b: { c: 2 } };

// Shallow clone
const shallow = { ...original };
shallow.b.c = 99; // original.b.c is also 99!

// Deep clone
const deep = structuredClone(original);
deep.b.c = 99; // original.b.c is still 2

// Manual deep clone (JSON method — loses functions, undefined, Date, etc.)
const jsonClone = JSON.parse(JSON.stringify(original));
```

## Map vs Object

| Feature         | `Map`                  | `Object`              |
|-----------------|------------------------|-----------------------|
| Key types       | Any                    | String/Symbol only    |
| Size            | `.size` property       | `Object.keys().length`|
| Iteration       | Insertion order        | Insertion order (ES6+)|
| Performance     | Better for frequent additions/deletions | Optimized for typical use |
| JSON support    | ❌                     | ✅                    |
| Prototype       | No prototype pollution | Has prototype chain   |

## Set vs Array

| Feature         | `Set`                  | `Array`               |
|-----------------|------------------------|-----------------------|
| Uniqueness      | ✅ Automatic           | ❌ Manual             |
| Lookup (`has`)  | O(1)                   | O(n)                  |
| Ordered         | ✅ Insertion order     | ✅                    |
| Index access    | ❌                     | ✅ `arr[i]`           |
| Methods         | `add/delete/has/clear` | Rich API (map, filter, etc.) |

## WeakMap vs Map / WeakSet vs Set

| Feature          | `Map`       | `WeakMap`         | `Set`       | `WeakSet`       |
|------------------|-------------|--------------------|-------------|-----------------|
| Key type         | Any         | Object only        | Any         | Object only     |
| Iterable         | ✅          | ❌                 | ✅          | ❌              |
| `.size`          | ✅          | ❌                 | ✅          | ❌              |
| GC               | Keys prevent GC | Keys don't prevent GC | Values prevent GC | Values don't prevent GC |
| Use case         | General     | Private data, metadata | Unique collections | Tagging objects |

---

# 21. Frequently Asked Interview Questions

## Beginner (1–20)

**Q1: What is the difference between `==` and `===`?**  
`==` does type coercion before comparison (`"1" == 1` → `true`). `===` checks both value and type (`"1" === 1` → `false`). Always prefer `===`.

**Q2: What is `NaN`? How do you check for it?**  
`NaN` ("Not a Number") results from invalid math operations (`0/0`, `parseInt("abc")`). `NaN === NaN` is `false`. Use `Number.isNaN(value)`.

**Q3: What is the difference between `null` and `undefined`?**  
`undefined` = variable declared but not assigned. `null` = intentional absence of value. `typeof undefined === "undefined"`, `typeof null === "object"` (historical bug).

**Q4: What is hoisting?**  
JavaScript moves `var` declarations and function declarations to the top of their scope during compilation. `let`/`const` are hoisted but stay in TDZ.

**Q5: What is a closure?**  
A function that retains access to its lexical scope. Example: a counter function that remembers its count variable.

**Q6: What is the event loop?**  
The mechanism that handles async operations: executes synchronous code, drains microtasks (Promises), then runs one macrotask (setTimeout), repeating.

**Q7: What is the difference between `let`, `const`, and `var`?**  
`var` is function-scoped and hoisted. `let`/`const` are block-scoped with TDZ. `const` can't be reassigned (but objects/arrays are still mutable).

**Q8: What is `typeof`?**  
An operator that returns the type of a value as a string. Gotcha: `typeof null === "object"`.

**Q9: What are template literals?**  
String literals using backticks with embedded expressions (`${expr}`), multi-line support, and tagged template capabilities.

**Q10: What is destructuring?**  
Syntax to extract values from arrays/objects into variables: `const { a, b } = obj;` or `const [x, y] = arr;`.

**Q11: What is the spread operator?**  
`...` expands iterables. `[...arr]` clones an array. `{...obj}` clones an object. `fn(...args)` spreads arguments.

**Q12: What is the rest operator?**  
`...` collects remaining elements. `function(...args) {}` gathers arguments. `const [first, ...rest] = arr;` collects the rest.

**Q13: What is `this` in JavaScript?**  
`this` refers to the execution context, determined by how a function is called: global, object method, constructor, or explicit binding.

**Q14: What is the difference between `map` and `forEach`?**  
`map` returns a new array with transformed values. `forEach` returns `undefined` and is used for side effects.

**Q15: What is a Promise?**  
An object representing the eventual completion/failure of an async operation. States: pending, fulfilled, rejected.

**Q16: What is `async/await`?**  
Syntactic sugar over Promises. `async` marks a function as returning a Promise. `await` pauses execution until the Promise resolves.

**Q17: What is optional chaining?**  
`?.` safely accesses nested properties without throwing on `null`/`undefined`: `user?.address?.city`.

**Q18: What is nullish coalescing?**  
`??` returns the right side only when the left is `null` or `undefined` (not falsy). `0 ?? "default"` → `0`.

**Q19: What is event bubbling?**  
Events propagate from the target element up through ancestors: child → parent → ... → document.

**Q20: What is event delegation?**  
Attaching a single event listener to a parent to handle events on its children, leveraging bubbling and `e.target`.

---

## Intermediate (21–40)

**Q21: Explain the prototype chain.**  
Every object has a `[[Prototype]]` link. Property lookup walks up the chain until found or `null` is reached. `Object.getPrototypeOf()` accesses it.

**Q22: What's the difference between `call`, `apply`, and `bind`?**  
`call` invokes with `this` and comma-separated args. `apply` invokes with `this` and an array of args. `bind` returns a new function with bound `this`.

**Q23: What is a higher-order function?**  
A function that takes a function as argument or returns a function. Examples: `map`, `filter`, `reduce`, decorators, middleware.

**Q24: What is the difference between `Promise.all` and `Promise.allSettled`?**  
`Promise.all` rejects if any promise rejects. `Promise.allSettled` always resolves with the status of every promise.

**Q25: What is a pure function?**  
A function with no side effects and deterministic output: same input always gives same output. Essential for React/Redux.

**Q26: What is `Object.freeze` vs `Object.seal`?**  
`freeze`: no add, delete, or modify. `seal`: no add or delete, but existing properties can be modified. Both are shallow.

**Q27: Explain debounce vs throttle.**  
Debounce: waits until calls stop, then executes once. Throttle: executes at most once per time interval. Debounce for search, throttle for scroll.

**Q28: What is the difference between shallow and deep clone?**  
Shallow: copies top-level properties; nested objects share references (`{...obj}`). Deep: recursively copies everything (`structuredClone(obj)`).

**Q29: What is a generator function?**  
A function (`function*`) that can pause and resume using `yield`. Returns an iterator. Useful for lazy sequences and async control flow.

**Q30: What is a WeakMap and when would you use it?**  
A Map where keys are weakly referenced (don't prevent GC). Keys must be objects. Use for private data, caching, or metadata attached to objects.

**Q31: What is the difference between `for...of` and `for...in`?**  
`for...of` iterates values of iterables (arrays, strings, maps). `for...in` iterates enumerable property keys of objects (including inherited).

**Q32: What are microtasks vs macrotasks?**  
Microtasks: Promise callbacks, `queueMicrotask`, MutationObserver. Macrotasks: setTimeout, setInterval, I/O. Microtasks run to completion before any macrotask.

**Q33: What is `structuredClone`?**  
Built-in deep clone that handles Date, RegExp, Map, Set, ArrayBuffer, and circular references. Doesn't clone functions or DOM nodes.

**Q34: What is the difference between `Map` and a plain object?**  
Map allows any key type, has `.size`, maintains insertion order, and is directly iterable. Objects have string/symbol keys and prototype chain.

**Q35: What is currying?**  
Transforming `f(a, b, c)` into `f(a)(b)(c)`. Each call takes one argument and returns a new function.

```js
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};
```

**Q36: What is memoization?**  
Caching function results based on arguments. Avoids re-computation for the same inputs. See implementation in Performance section.

**Q37: What is the difference between `Set` and `Array`?**  
Set enforces uniqueness and has O(1) `has()`. Array allows duplicates and has O(n) `includes()`. Use Set for uniqueness checks.

**Q38: What is the Temporal Dead Zone?**  
The period between entering a scope and a `let`/`const` variable's initialization. Accessing the variable in this zone throws `ReferenceError`.

**Q39: What is `Symbol` and what is it used for?**  
A unique, immutable primitive. Used for unique property keys, well-known symbols (`Symbol.iterator`), and avoiding name collisions.

**Q40: What is `AbortController`?**  
An API to cancel async operations (fetch, streams). Create a controller, pass `signal` to fetch, call `abort()` to cancel.

---

## Advanced (41–55)

**Q41: Explain the execution context and call stack.**  
Each function call creates an execution context (variable environment, scope chain, `this`). Contexts are pushed onto the call stack (LIFO) and popped when the function returns.

**Q42: How does `this` work in arrow functions?**  
Arrow functions don't have their own `this`. They capture `this` from the enclosing lexical scope at definition time. Cannot be changed with `call`/`apply`/`bind`.

**Q43: What is a proxy and what are its use cases?**  
`new Proxy(target, handler)` intercepts operations on an object (get, set, has, delete, etc.). Use cases: validation, reactive data, virtual properties, logging.

```js
const handler = {
  get(target, prop) { return prop in target ? target[prop] : `No ${prop}`; },
  set(target, prop, value) {
    if (prop === "age" && value < 0) throw new Error("Invalid age");
    target[prop] = value;
    return true;
  },
};
```

**Q44: What are generators and `yield`?**  
`function*` creates a generator that returns an iterator. `yield` pauses execution and returns a value. `.next()` resumes. Used for lazy evaluation and async patterns.

**Q45: Explain `Promise.race` vs `Promise.any`.**  
`Promise.race` settles with the first promise (resolve or reject). `Promise.any` resolves with the first fulfilled promise; rejects with `AggregateError` only if all reject.

**Q46: What is the difference between `type` and `interface` in TypeScript?**  
`interface` supports declaration merging and is better for object shapes. `type` supports unions, intersections, mapped types, and conditional types. Use `interface` for APIs, `type` for complex types.

**Q47: What are conditional types in TypeScript?**  
Types that depend on other types: `T extends U ? X : Y`. Used with `infer` to extract types. Foundation of utility types like `ReturnType`, `Extract`.

**Q48: What is `infer` in TypeScript?**  
Used in conditional types to extract/infer a type from within another type. Example: `T extends Promise<infer U> ? U : T` extracts the resolved type.

**Q49: What is the difference between `unknown` and `any`?**  
`any` disables type checking entirely. `unknown` is type-safe: you must narrow the type (via type guard or assertion) before using it.

**Q50: Explain mapped types.**  
Types that transform properties of another type: `{ [K in keyof T]: NewType }`. Used to build utility types like `Partial`, `Readonly`, `Pick`.

**Q51: What is declaration merging in TypeScript?**  
Interfaces with the same name automatically merge their members. This doesn't work with type aliases. Useful for extending third-party types.

**Q52: How does garbage collection work in JavaScript?**  
Uses mark-and-sweep. Objects reachable from roots (global, call stack) are kept. Unreachable objects are collected. Closures keep referenced variables alive.

**Q53: What is the difference between `__proto__` and `prototype`?**  
`prototype` is a property on constructor functions (used to add methods for instances). `__proto__` (or `Object.getPrototypeOf()`) is the internal link on instances pointing to their constructor's prototype.

**Q54: What are tagged templates?**  
Functions that process template literals: `` tag`Hello ${name}` ``. The function receives the string parts and interpolated values separately. Used in i18n, CSS-in-JS, SQL builders.

**Q55: What is structural typing in TypeScript?**  
TypeScript compares types by their structure (shape), not by name. If two types have compatible shapes, they're considered the same type (duck typing at the type level).

---

# 22. Coding Problems

## Arrays

### 1. Two Sum (Easy)

**Problem**: Given an array and a target, return indices of two numbers that add up to the target.

```js
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}
// twoSum([2, 7, 11, 15], 9) → [0, 1]
```
**Time**: O(n) | **Space**: O(n)

---

### 2. Flatten Nested Array (Easy)

```js
function flatten(arr) {
  return arr.reduce((flat, item) =>
    flat.concat(Array.isArray(item) ? flatten(item) : item), []);
}
// flatten([1, [2, [3, [4]]]]) → [1, 2, 3, 4]
```
**Time**: O(n) | **Space**: O(n)

---

### 3. Remove Duplicates (Easy)

```js
function removeDuplicates(arr) {
  return [...new Set(arr)];
}
// removeDuplicates([1, 2, 2, 3, 3]) → [1, 2, 3]
```
**Time**: O(n) | **Space**: O(n)

---

### 4. Move Zeros to End (Easy)

```js
function moveZeros(arr) {
  let insertPos = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      [arr[insertPos], arr[i]] = [arr[i], arr[insertPos]];
      insertPos++;
    }
  }
  return arr;
}
// moveZeros([0, 1, 0, 3, 12]) → [1, 3, 12, 0, 0]
```
**Time**: O(n) | **Space**: O(1)

---

### 5. Maximum Subarray Sum — Kadane's Algorithm (Medium)

```js
function maxSubarraySum(arr) {
  let maxSum = -Infinity, currentSum = 0;
  for (const num of arr) {
    currentSum = Math.max(num, currentSum + num);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}
// maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) → 6 ([4,-1,2,1])
```
**Time**: O(n) | **Space**: O(1)

---

### 6. Group Anagrams (Medium)

```js
function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const key = str.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }
  return [...map.values()];
}
// groupAnagrams(["eat","tea","tan","ate","nat","bat"])
// → [["eat","tea","ate"],["tan","nat"],["bat"]]
```
**Time**: O(n × k log k) | **Space**: O(n × k)

---

### 7. Product of Array Except Self (Medium)

```js
function productExceptSelf(nums) {
  const result = new Array(nums.length).fill(1);
  let prefix = 1;
  for (let i = 0; i < nums.length; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}
// productExceptSelf([1,2,3,4]) → [24,12,8,6]
```
**Time**: O(n) | **Space**: O(1) (output array excluded)

---

### 8. Merge Sorted Arrays (Easy)

```js
function mergeSorted(a, b) {
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    result.push(a[i] < b[j] ? a[i++] : b[j++]);
  }
  return [...result, ...a.slice(i), ...b.slice(j)];
}
// mergeSorted([1,3,5], [2,4,6]) → [1,2,3,4,5,6]
```
**Time**: O(n + m) | **Space**: O(n + m)

---

### 9. Find Missing Number (Easy)

```js
function findMissing(nums) {
  const n = nums.length;
  const expected = (n * (n + 1)) / 2;
  return expected - nums.reduce((a, b) => a + b, 0);
}
// findMissing([3,0,1]) → 2
```
**Time**: O(n) | **Space**: O(1)

---

### 10. Rotate Array (Medium)

```js
function rotate(arr, k) {
  k = k % arr.length;
  arr.reverse();
  reverse(arr, 0, k - 1);
  reverse(arr, k, arr.length - 1);
  return arr;
}
function reverse(arr, start, end) {
  while (start < end) [arr[start++], arr[end--]] = [arr[end], arr[start]];
}
// rotate([1,2,3,4,5,6,7], 3) → [5,6,7,1,2,3,4]
```
**Time**: O(n) | **Space**: O(1)

---

## Strings

### 11. Reverse a String (Easy)

```js
function reverse(str) {
  return str.split("").reverse().join("");
}
// reverse("hello") → "olleh"
```
**Time**: O(n) | **Space**: O(n)

---

### 12. Palindrome Check (Easy)

```js
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
// isPalindrome("A man, a plan, a canal: Panama") → true
```
**Time**: O(n) | **Space**: O(n)

---

### 13. Count Vowels (Easy)

```js
function countVowels(str) {
  return (str.match(/[aeiou]/gi) || []).length;
}
// countVowels("hello world") → 3
```
**Time**: O(n) | **Space**: O(1)

---

### 14. Longest Substring Without Repeating Characters (Medium)

```js
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (map.has(s[i]) && map.get(s[i]) >= start) {
      start = map.get(s[i]) + 1;
    }
    map.set(s[i], i);
    max = Math.max(max, i - start + 1);
  }
  return max;
}
// lengthOfLongestSubstring("abcabcbb") → 3 ("abc")
```
**Time**: O(n) | **Space**: O(min(n, m)) where m = charset size

---

### 15. Valid Anagram (Easy)

```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const freq = new Map();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  for (const c of t) {
    if (!freq.has(c) || freq.get(c) === 0) return false;
    freq.set(c, freq.get(c) - 1);
  }
  return true;
}
// isAnagram("anagram", "nagaram") → true
```
**Time**: O(n) | **Space**: O(1) (fixed charset)

---

### 16. String Compression (Easy)

```js
function compress(str) {
  let result = "";
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      result += str[i] + count;
      count = 1;
    }
  }
  return result.length < str.length ? result : str;
}
// compress("aabcccccaaa") → "a2b1c5a3"
```
**Time**: O(n) | **Space**: O(n)

---

### 17. First Unique Character (Easy)

```js
function firstUniqChar(s) {
  const freq = new Map();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) return i;
  }
  return -1;
}
// firstUniqChar("leetcode") → 0
```
**Time**: O(n) | **Space**: O(1)

---

## Objects

### 18. Deep Clone (Medium)

```js
function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) return seen.get(obj); // circular ref

  const clone = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key], seen);
  }
  return clone;
}
```
**Time**: O(n) | **Space**: O(n)

---

### 19. Deep Equal (Medium)

```js
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => deepEqual(a[key], b[key]));
}
```
**Time**: O(n) | **Space**: O(d) where d = depth

---

### 20. Object Diff (Medium)

```js
function diff(obj1, obj2) {
  const result = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    if (!(key in obj1)) {
      result[key] = { added: obj2[key] };
    } else if (!(key in obj2)) {
      result[key] = { removed: obj1[key] };
    } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      result[key] = { changed: { from: obj1[key], to: obj2[key] } };
    }
  }
  return result;
}
```

---

### 21. Deep Merge (Medium)

```js
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
```

---

### 22. Convert Array to Object (Easy)

```js
function arrayToObject(arr, key) {
  return arr.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {});
}
// arrayToObject([{id:1,name:"A"},{id:2,name:"B"}], "id")
// → { "1": {id:1,name:"A"}, "2": {id:2,name:"B"} }
```

---

### 23. Pick Properties (Easy)

```js
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key];
    return result;
  }, {});
}
// pick({ a: 1, b: 2, c: 3 }, ["a", "c"]) → { a: 1, c: 3 }
```

---

## Closures

### 24. Once Function (Easy)

```js
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
```

---

### 25. Counter with Reset (Easy)

```js
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => { count = initial; return count; },
  };
}
```

---

### 26. Memoize with TTL (Medium)

```js
function memoizeWithTTL(fn, ttl = 1000) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < ttl) {
      return cached.value;
    }
    const result = fn.apply(this, args);
    cache.set(key, { value: result, time: Date.now() });
    return result;
  };
}
```

---

### 27. Retry Function (Medium)

```js
function retry(fn, retries = 3, delay = 1000) {
  return async function (...args) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn.apply(this, args);
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
  };
}
```

---

### 28. Pipe / Compose (Medium)

```js
// Pipe: left to right
function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

// Compose: right to left
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

const transform = pipe(
  (x) => x * 2,
  (x) => x + 1,
  (x) => `Result: ${x}`,
);
transform(5); // "Result: 11"
```

---

## Async JavaScript

### 29. Promise.all Polyfill (Medium)

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    if (promises.length === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          if (++completed === promises.length) resolve(results);
        },
        reject,
      );
    });
  });
}
```

---

### 30. Sequential Promise Execution (Medium)

```js
async function runSequential(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

// Usage
const results = await runSequential([
  () => fetch("/api/1"),
  () => fetch("/api/2"),
  () => fetch("/api/3"),
]);
```

---

### 31. Promise with Timeout (Medium)

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}
```

---

### 32. Async Queue with Concurrency (Hard)

```js
class AsyncQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  process() {
    while (this.running < this.concurrency && this.queue.length) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.process();
        });
    }
  }
}
```

---

## Polyfills

### 33. `Array.prototype.map` Polyfill

```js
Array.prototype.myMap = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};
```

### 34. `Array.prototype.filter` Polyfill

```js
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

### 35. `Array.prototype.reduce` Polyfill

```js
Array.prototype.myReduce = function (callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  if (initialValue === undefined) {
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};
```

### 36. `Function.prototype.bind` Polyfill

```js
Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  return function (...moreArgs) {
    return fn.apply(context, [...args, ...moreArgs]);
  };
};
```

### 37. `Promise.all` Polyfill

```js
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    if (promises.length === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          if (++completed === promises.length) resolve(results);
        },
        reject,
      );
    });
  });
};
```

### 38. `Promise.race` Polyfill

```js
Promise.myRace = function (promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
};
```

---

## Data Transformations

### 39. Group By

```js
function groupBy(arr, keyFn) {
  return arr.reduce((groups, item) => {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
}
// groupBy([6.1, 4.2, 6.3], Math.floor)
// → { 4: [4.2], 6: [6.1, 6.3] }
```

### 40. Flatten Object

```js
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], fullKey));
    } else {
      acc[fullKey] = obj[key];
    }
    return acc;
  }, {});
}
// flattenObject({ a: { b: { c: 1 }, d: 2 } })
// → { "a.b.c": 1, "a.d": 2 }
```

### 41. Unflatten Object

```js
function unflattenObject(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const keys = key.split(".");
    keys.reduce((nested, k, i) => {
      if (i === keys.length - 1) nested[k] = obj[key];
      else nested[k] = nested[k] || {};
      return nested[k];
    }, acc);
    return acc;
  }, {});
}
// unflattenObject({ "a.b.c": 1, "a.d": 2 })
// → { a: { b: { c: 1 }, d: 2 } }
```

### 42. Chunk Array

```js
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
// chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
```

### 43. Unique By Key

```js
function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter(item => {
    const k = typeof key === "function" ? key(item) : item[key];
    return seen.has(k) ? false : seen.add(k);
  });
}
```

### 44. Sort By Multiple Keys

```js
function sortBy(arr, ...keys) {
  return [...arr].sort((a, b) => {
    for (const { key, order = "asc" } of keys) {
      const valA = a[key], valB = b[key];
      if (valA !== valB) {
        const cmp = valA < valB ? -1 : 1;
        return order === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
}
```

---

## Utility Functions

### 45. Debounce (with leading/trailing option)

```js
function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer;
  let lastArgs;
  return function (...args) {
    lastArgs = args;
    const callNow = leading && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing) fn.apply(this, lastArgs);
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}
```

### 46. Throttle (with trailing call)

```js
function throttle(fn, interval) {
  let timer = null;
  let lastArgs = null;
  return function (...args) {
    if (!timer) {
      fn.apply(this, args);
      timer = setTimeout(() => {
        timer = null;
        if (lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, interval);
    } else {
      lastArgs = args;
    }
  };
}
```

### 47. Deep Get (lodash-style)

```js
function deepGet(obj, path, defaultValue = undefined) {
  const result = path.split(".").reduce((acc, key) => acc?.[key], obj);
  return result === undefined ? defaultValue : result;
}
// deepGet({ a: { b: { c: 42 } } }, "a.b.c") → 42
// deepGet({ a: { b: 1 } }, "a.x.y", "default") → "default"
```

### 48. Deep Set

```js
function deepSet(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!(key in acc)) acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
  return obj;
}
```

### 49. Event Emitter

```js
class EventEmitter {
  constructor() { this.events = new Map(); }

  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    const listeners = this.events.get(event);
    if (listeners) {
      this.events.set(event, listeners.filter(l => l !== listener));
    }
  }

  emit(event, ...args) {
    const listeners = this.events.get(event) || [];
    listeners.forEach(l => l(...args));
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}
```

### 50. LRU Cache

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // move to end (most recent)
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      // Delete oldest (first inserted)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
```
**Time**: O(1) for get/put | **Space**: O(capacity)

---

# 23. Polyfill Implementations

### `Array.prototype.map`

```js
if (!Array.prototype.myMap) {
  Array.prototype.myMap = function (callback, thisArg) {
    if (this == null) throw new TypeError("Cannot read property of null");
    if (typeof callback !== "function") throw new TypeError(`${callback} is not a function`);

    const arr = Object(this);
    const len = arr.length >>> 0;
    const result = new Array(len);

    for (let i = 0; i < len; i++) {
      if (i in arr) {
        result[i] = callback.call(thisArg, arr[i], i, arr);
      }
    }
    return result;
  };
}
```

### `Array.prototype.filter`

```js
Array.prototype.myFilter = function (callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError();
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

### `Array.prototype.reduce`

```js
Array.prototype.myReduce = function (callback, initialValue) {
  if (typeof callback !== "function") throw new TypeError();
  let acc = initialValue;
  let start = 0;

  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError("Reduce of empty array");
    acc = this[0];
    start = 1;
  }

  for (let i = start; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
};
```

### `Function.prototype.bind`

```js
Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  const bound = function (...args) {
    return fn.apply(
      this instanceof bound ? this : context,
      [...boundArgs, ...args],
    );
  };
  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

### `Function.prototype.call`

```js
Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis;
  const sym = Symbol();
  context[sym] = this;
  const result = context[sym](...args);
  delete context[sym];
  return result;
};
```

### `Function.prototype.apply`

```js
Function.prototype.myApply = function (context, args = []) {
  context = context ?? globalThis;
  const sym = Symbol();
  context[sym] = this;
  const result = context[sym](...args);
  delete context[sym];
  return result;
};
```

### `Promise.all`

```js
Promise.myAll = function (iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    const results = new Array(promises.length);
    let remaining = promises.length;

    if (remaining === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          if (--remaining === 0) resolve(results);
        },
        reject,
      );
    });
  });
};
```

### `Promise.race`

```js
Promise.myRace = function (iterable) {
  return new Promise((resolve, reject) => {
    for (const p of iterable) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
};
```

### `Promise.allSettled`

```js
Promise.myAllSettled = function (iterable) {
  const promises = Array.from(iterable);
  return Promise.myAll(
    promises.map(p =>
      Promise.resolve(p).then(
        value => ({ status: "fulfilled", value }),
        reason => ({ status: "rejected", reason }),
      )
    )
  );
};
```

### `Promise.any`

```js
Promise.myAny = function (iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    const errors = [];
    let rejected = 0;

    if (promises.length === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        resolve,
        (error) => {
          errors[i] = error;
          if (++rejected === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        },
      );
    });
  });
};
```

### `debounce`

```js
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### `throttle`

```js
function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

---

# 24. Quick Revision Tables

## JavaScript Data Types

| Type        | `typeof`     | Mutable | Example                  |
|-------------|-------------|---------|--------------------------|
| string      | `"string"`  | No      | `"hello"`                |
| number      | `"number"`  | No      | `42`, `NaN`, `Infinity`  |
| boolean     | `"boolean"` | No      | `true`, `false`          |
| bigint      | `"bigint"`  | No      | `100n`                   |
| symbol      | `"symbol"`  | No      | `Symbol("id")`           |
| undefined   | `"undefined"`| No     | `undefined`              |
| null        | `"object"` ⚠️| No     | `null`                   |
| object      | `"object"`  | Yes     | `{}`, `[]`, `Date`       |
| function    | `"function"`| Yes     | `() => {}`               |

## Array Methods

| Method      | Returns       | Mutates | Purpose                          |
|-------------|--------------|---------|----------------------------------|
| `map`       | New array    | No      | Transform each element           |
| `filter`    | New array    | No      | Keep matching elements           |
| `reduce`    | Single value | No      | Accumulate to one value          |
| `find`      | Element/undef| No      | First matching element           |
| `findIndex` | Index/-1     | No      | Index of first match             |
| `some`      | Boolean      | No      | At least one matches             |
| `every`     | Boolean      | No      | All match                        |
| `forEach`   | `undefined`  | No      | Side effect for each element     |
| `flat`      | New array    | No      | Flatten nested arrays            |
| `flatMap`   | New array    | No      | Map + flatten(1)                 |
| `sort`      | Same array   | **Yes** | Sort in place                    |
| `reverse`   | Same array   | **Yes** | Reverse in place                 |
| `splice`    | Removed items| **Yes** | Add/remove elements              |
| `slice`     | New array    | No      | Extract portion                  |
| `concat`    | New array    | No      | Merge arrays                     |
| `includes`  | Boolean      | No      | Contains value                   |
| `indexOf`   | Index/-1     | No      | First index of value             |
| `join`      | String       | No      | Array to string                  |
| `push`      | New length   | **Yes** | Add to end                       |
| `pop`       | Removed item | **Yes** | Remove from end                  |
| `shift`     | Removed item | **Yes** | Remove from start                |
| `unshift`   | New length   | **Yes** | Add to start                     |

## Object Methods

| Method              | Purpose                                  |
|---------------------|------------------------------------------|
| `Object.keys()`     | Array of own enumerable keys             |
| `Object.values()`   | Array of own enumerable values           |
| `Object.entries()`  | Array of [key, value] pairs              |
| `Object.assign()`   | Shallow merge into target                |
| `Object.freeze()`   | Prevent all modifications (shallow)      |
| `Object.seal()`     | Prevent add/delete, allow modify (shallow)|
| `Object.create()`   | Create object with given prototype       |
| `Object.hasOwn()`   | Check own property (replaces hasOwnProperty)|
| `Object.fromEntries()`| Create object from [key,value] pairs   |

## Promise APIs

| API                | Resolves When         | Rejects When              |
|--------------------|-----------------------|---------------------------|
| `Promise.all`      | All fulfill           | Any rejects               |
| `Promise.allSettled`| Always               | Never                     |
| `Promise.race`     | First settles (any)   | First settles (any)       |
| `Promise.any`      | First fulfills        | All reject (AggregateError)|

## TypeScript Utility Types

| Utility Type    | Effect                                    |
|-----------------|-------------------------------------------|
| `Partial<T>`    | All properties optional                   |
| `Required<T>`   | All properties required                   |
| `Readonly<T>`   | All properties readonly                   |
| `Pick<T, K>`    | Select specific properties                |
| `Omit<T, K>`    | Exclude specific properties               |
| `Record<K, V>`  | Object type with key type K and value V   |
| `Exclude<T, U>` | Remove types from union                   |
| `Extract<T, U>` | Keep only matching types in union         |
| `ReturnType<T>` | Extract function return type              |
| `Parameters<T>` | Extract function parameter types as tuple |
| `Awaited<T>`    | Unwrap Promise type                       |
| `NonNullable<T>`| Remove null and undefined from type       |
| `InstanceType<T>`| Get instance type of constructor         |

## TypeScript Keywords

| Keyword     | Purpose                                      |
|-------------|----------------------------------------------|
| `type`      | Define a type alias                          |
| `interface` | Define an object shape (mergeable)           |
| `extends`   | Inherit/extend types                         |
| `implements`| Class implements interface                   |
| `keyof`     | Get union of object keys                     |
| `typeof`    | Get type of a value (type-level)             |
| `infer`     | Extract type within conditional types        |
| `as`        | Type assertion                               |
| `is`        | Type predicate (type guard)                  |
| `satisfies` | Validate type without changing it (TS 4.9+)  |
| `declare`   | Ambient declaration (no runtime output)      |
| `namespace` | Group related types (legacy)                 |
| `enum`      | Named constants                              |
| `abstract`  | Abstract class/method                        |
| `readonly`  | Immutable property                           |
| `override`  | Explicitly override parent method            |

## Time Complexity Cheat Sheet

| Operation          | Array  | Object | Map/Set |
|--------------------|--------|--------|---------|
| Access             | O(1)   | O(1)   | O(1)    |
| Search             | O(n)   | O(1)   | O(1)    |
| Insert             | O(n)*  | O(1)   | O(1)    |
| Delete             | O(n)*  | O(1)   | O(1)    |
| `includes`/`has`   | O(n)   | O(1)   | O(1)    |

*\* O(1) at end for push/pop, O(n) for unshift/shift/splice*

---

# 25. Senior Developer Notes

## Common Mistakes

```js
// ❌ Mutating state directly (React)
state.count++;

// ✅ Immutable update
setState(prev => ({ ...prev, count: prev.count + 1 }));

// ❌ Using index as key in dynamic lists
items.map((item, i) => <li key={i}>{item.name}</li>);

// ✅ Use stable unique IDs
items.map(item => <li key={item.id}>{item.name}</li>);

// ❌ Comparing objects by reference
if (user === { name: "Alice" }) // always false

// ❌ Floating point math
0.1 + 0.2 === 0.3 // false! (0.30000000000000004)

// ❌ for...in on arrays (includes prototype properties)
for (const key in [1, 2, 3]) // "0", "1", "2" + inherited

// ✅ for...of for arrays
for (const val of [1, 2, 3]) // 1, 2, 3
```

## Best Practices

```js
// 1. Prefer const, then let, avoid var
// 2. Use === over ==
// 3. Use optional chaining and nullish coalescing
const city = user?.address?.city ?? "Unknown";

// 4. Use structuredClone for deep copies
const copy = structuredClone(original);

// 5. Use AbortController for cancellable fetches
// 6. Use Promise.allSettled when you need all results
// 7. Prefer Map/Set over Object/Array for lookups
// 8. Use Array.isArray() instead of instanceof Array
// 9. Use Number.isNaN() instead of isNaN()
// 10. Use event delegation for dynamic lists
```

## Performance Tips

```js
// 1. Debounce expensive operations (search, resize)
// 2. Throttle scroll/mousemove handlers
// 3. Use document fragments for batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const li = document.createElement("li");
  li.textContent = item;
  fragment.appendChild(li);
});
list.appendChild(fragment); // single reflow

// 4. Use requestAnimationFrame for visual updates
// 5. Lazy load heavy components and routes
// 6. Use Web Workers for CPU-intensive tasks
// 7. Avoid unnecessary re-renders (React.memo, useMemo, useCallback)
// 8. Use virtual scrolling for large lists
// 9. Minimize layout thrashing (batch reads, then writes)
// 10. Use passive event listeners for scroll/touch
el.addEventListener("scroll", handler, { passive: true });
```

## Clean Code Recommendations

```js
// 1. Meaningful names
// ❌ const d = elapsed time in ms
// ✅ const elapsedTimeMs = Date.now() - startTime;

// 2. Single responsibility functions
// 3. Early returns to reduce nesting
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  // ... main logic
}

// 4. Avoid magic numbers
// ❌ if (status === 3)
// ✅ const STATUS_COMPLETED = 3;
//    if (status === STATUS_COMPLETED)

// 5. Use descriptive error messages
throw new Error(`User ${userId} not found in database`);

// 6. Keep functions small (< 20 lines ideally)
// 7. Avoid side effects in getters
// 8. Use pure functions where possible
```

## Production-Grade Patterns

```js
// 1. Error boundary pattern
class ErrorBoundary {
  async execute(fn) {
    try {
      return { data: await fn(), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// 2. Retry with exponential backoff
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
}

// 3. Request deduplication
const pendingRequests = new Map();
function dedupedFetch(url, options) {
  if (pendingRequests.has(url)) return pendingRequests.get(url);
  const promise = fetch(url, options).finally(() =>
    pendingRequests.delete(url)
  );
  pendingRequests.set(url, promise);
  return promise;
}

// 4. Rate limiter
function createRateLimiter(maxCalls, windowMs) {
  const calls = [];
  return function (fn) {
    const now = Date.now();
    while (calls.length && calls[0] <= now - windowMs) calls.shift();
    if (calls.length >= maxCalls) {
      throw new Error("Rate limit exceeded");
    }
    calls.push(now);
    return fn();
  };
}
```

## Interview Traps & Edge Cases

```js
// Trap 1: typeof null
typeof null === "object" // true — historical bug

// Trap 2: NaN
NaN === NaN    // false
Number.isNaN(NaN) // true
isNaN("hello")   // true (coerces to NaN first)
Number.isNaN("hello") // false (no coercion)

// Trap 3: Array sort
[10, 2, 1].sort() // [1, 10, 2] — string comparison!

// Trap 4: Array from length
new Array(3)      // [empty × 3] — sparse array
Array.from({ length: 3 }, (_, i) => i) // [0, 1, 2]

// Trap 5: Object.keys on array
Object.keys(["a", "b"]) // ["0", "1"] — strings!

// Trap 6: 0.1 + 0.2
0.1 + 0.2 === 0.3 // false!

// Trap 7: delete
const arr = [1, 2, 3];
delete arr[1];
arr.length // 3 (not 2!) — creates a hole

// Trap 8: async/await in loops
// ❌ Sequential (slow)
for (const url of urls) {
  const data = await fetch(url); // waits for each
}
// ✅ Parallel (fast)
const results = await Promise.all(urls.map(url => fetch(url)));

// Trap 9: this in callbacks
class Component {
  constructor() { this.state = { count: 0 }; }
  handleClick() {
    // ❌ this is undefined (strict mode) or window
    setTimeout(function () { this.state.count++; }, 0);
    // ✅ Arrow function preserves this
    setTimeout(() => { this.state.count++; }, 0);
  }
}

// Trap 10: Closures in loops
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}
// Fix: use let, or IIFE, or bind

// Trap 11: fetch doesn't reject on HTTP errors
const res = await fetch("/api/404");
res.ok; // false — but no error thrown!

// Trap 12: Spread doesn't deep clone
const obj = { a: { b: 1 } };
const copy = { ...obj };
copy.a.b = 2; // obj.a.b is also 2!
```

---

> **Final tip**: The best way to prepare for interviews is to **write code daily**. Read this guide, then solve problems on LeetCode, build projects, and review these concepts weekly. Understanding *why* beats memorizing *what*.

---

*Last updated: 2026 | Covers ES2024+ and TypeScript 5.x*
