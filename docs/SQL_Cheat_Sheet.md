# SQL Cheat Sheet & Quick Revision Guide

> **How to use this guide:** Skim the tables for quick recall. Read examples for syntax. Use the query collection at the end for interview practice.

---

## Table of Contents

1. [SQL Fundamentals](#1-sql-fundamentals)
2. [Joins](#2-joins)
3. [Aggregation & Grouping](#3-aggregation--grouping)
4. [Window Functions](#4-window-functions)
5. [Indexing](#5-indexing)
6. [Advanced SQL Features](#6-advanced-sql-features)
7. [Interview Revision Tables](#7-interview-revision-tables)
8. [Example Query Collection](#8-example-query-collection)

---

## 1. SQL Fundamentals

### SELECT

```sql
SELECT column1, column2        -- specific columns
SELECT *                       -- all columns
SELECT column1 AS alias        -- rename output
SELECT DISTINCT column1        -- unique values only
```

```sql
SELECT name, salary * 1.1 AS new_salary
FROM employees;
```

---

### WHERE

```sql
WHERE age > 30
WHERE name = 'Alice'
WHERE salary BETWEEN 30000 AND 60000
WHERE name IN ('Alice', 'Bob')
WHERE name LIKE 'A%'           -- starts with A
WHERE name LIKE '%son'         -- ends with son
WHERE email IS NULL
WHERE email IS NOT NULL
WHERE age > 25 AND dept = 'HR'
WHERE dept = 'HR' OR dept = 'IT'
WHERE NOT dept = 'HR'
```

> **Interview tip:** `LIKE '%A%'` cannot use an index. Prefer prefix matching `LIKE 'A%'` for performance.

---

### ORDER BY

```sql
SELECT name, salary
FROM employees
ORDER BY salary DESC, name ASC;  -- multiple columns, default is ASC
```

---

### DISTINCT

```sql
SELECT DISTINCT department FROM employees;
SELECT DISTINCT city, country FROM customers;  -- distinct combination
```

---

### LIMIT / TOP / FETCH

```sql
-- MySQL / PostgreSQL
SELECT * FROM employees LIMIT 10;
SELECT * FROM employees LIMIT 10 OFFSET 20;   -- skip 20, take 10

-- SQL Server
SELECT TOP 10 * FROM employees;
SELECT TOP 10 PERCENT * FROM employees;

-- ANSI SQL
SELECT * FROM employees
FETCH FIRST 10 ROWS ONLY;
```

---

### INSERT

```sql
-- Single row
INSERT INTO employees (name, dept, salary)
VALUES ('Alice', 'HR', 50000);

-- Multiple rows
INSERT INTO employees (name, dept, salary)
VALUES ('Bob', 'IT', 60000),
       ('Carol', 'Finance', 55000);

-- From another table
INSERT INTO archive_employees
SELECT * FROM employees WHERE status = 'inactive';
```

---

### UPDATE

```sql
UPDATE employees
SET salary = salary * 1.1, updated_at = CURRENT_DATE
WHERE dept = 'IT';
```

> **Warning:** Always use WHERE with UPDATE/DELETE. Without it, every row is modified.

---

### DELETE

```sql
DELETE FROM employees WHERE id = 101;
DELETE FROM employees WHERE dept = 'Temp';
```

---

### CREATE TABLE

```sql
CREATE TABLE employees (
    id          INT             PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    UNIQUE,
    dept_id     INT             REFERENCES departments(id),
    salary      DECIMAL(10, 2)  DEFAULT 30000.00,
    age         INT             CHECK (age >= 18),
    created_at  DATE            DEFAULT CURRENT_DATE
);
```

---

### ALTER TABLE

```sql
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
ALTER TABLE employees DROP COLUMN phone;
ALTER TABLE employees RENAME COLUMN phone TO mobile;
ALTER TABLE employees ALTER COLUMN salary TYPE NUMERIC(12,2);
ALTER TABLE employees ADD CONSTRAINT uq_email UNIQUE (email);
ALTER TABLE employees DROP CONSTRAINT uq_email;
```

---

### DROP / TRUNCATE

```sql
DROP TABLE employees;             -- deletes table + data + structure
TRUNCATE TABLE employees;         -- deletes all rows, keeps structure, faster than DELETE
```

| Command    | Removes Structure | Rollback Possible | Triggers Fire | Speed   |
|------------|-------------------|-------------------|---------------|---------|
| `DROP`     | Yes               | No (DDL)          | No            | Fast    |
| `TRUNCATE` | No                | No (DDL)          | No            | Fast    |
| `DELETE`   | No                | Yes (DML)         | Yes           | Slower  |

---

### Constraints

| Constraint    | Purpose                                      | Example                                 |
|---------------|----------------------------------------------|-----------------------------------------|
| `PRIMARY KEY` | Unique + NOT NULL identifier                 | `id INT PRIMARY KEY`                    |
| `FOREIGN KEY` | Enforces referential integrity               | `REFERENCES departments(id)`            |
| `UNIQUE`      | No duplicate values                          | `email VARCHAR(150) UNIQUE`             |
| `NOT NULL`    | Column must have a value                     | `name VARCHAR(100) NOT NULL`            |
| `CHECK`       | Custom value rule                            | `CHECK (age >= 18)`                     |
| `DEFAULT`     | Value when none is provided                  | `status VARCHAR(10) DEFAULT 'active'`   |

---

## 2. Joins

### Visual Reference

```
INNER JOIN            LEFT JOIN             RIGHT JOIN
  A ∩ B               A + (A ∩ B)           B + (A ∩ B)
 ┌──┬──┐              ┌──┬──┐               ┌──┬──┐
 │  │██│              │██│██│               │  │██│
 └──┴──┘              └──┴──┘               └──┴──┘

FULL OUTER JOIN       CROSS JOIN
 A ∪ B                Every combo of A × B
 ┌──┬──┐
 │██│██│
 └──┴──┘
```

---

### INNER JOIN — only matching rows

```sql
SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;
```

---

### LEFT JOIN — all left rows + matching right rows

```sql
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
-- employees with no dept will still appear, dept_name will be NULL
```

---

### RIGHT JOIN — all right rows + matching left rows

```sql
SELECT e.name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;
-- departments with no employees will appear
```

---

### FULL OUTER JOIN — all rows from both sides

```sql
SELECT e.name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;
```

---

### CROSS JOIN — cartesian product

```sql
SELECT colors.name, sizes.label
FROM colors
CROSS JOIN sizes;
-- 4 colors × 3 sizes = 12 rows
```

---

### SELF JOIN — table joined with itself

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

---

### Join Comparison Table

| Join Type        | Returns                                        | When to Use                                |
|------------------|------------------------------------------------|--------------------------------------------|
| `INNER JOIN`     | Only matching rows from both tables            | You need related data from both sides      |
| `LEFT JOIN`      | All left rows, NULLs for unmatched right       | Find records with or without a match       |
| `RIGHT JOIN`     | All right rows, NULLs for unmatched left       | Same as LEFT, from the other direction     |
| `FULL OUTER JOIN`| All rows from both, NULLs where no match       | Find all records, matched or not           |
| `CROSS JOIN`     | Every combination (A × B rows)                 | Generate combinations, test data           |
| `SELF JOIN`      | Rows joined to other rows in the same table    | Hierarchies, manager-employee, friends     |

> **Interview tip:** "Find employees with no manager" → `LEFT JOIN employees m ON e.manager_id = m.id WHERE m.id IS NULL`

---

## 3. Aggregation & Grouping

### Aggregate Functions

```sql
SELECT
    COUNT(*)          AS total_rows,
    COUNT(salary)     AS non_null_salaries,  -- ignores NULLs
    COUNT(DISTINCT dept) AS unique_depts,
    SUM(salary)       AS total_salary,
    AVG(salary)       AS avg_salary,
    MIN(salary)       AS lowest,
    MAX(salary)       AS highest
FROM employees;
```

> **Interview tip:** `COUNT(*)` counts all rows. `COUNT(column)` ignores NULLs.

---

### GROUP BY

```sql
SELECT dept, COUNT(*) AS headcount, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept;
```

**Rules:**
- Every column in SELECT must either be in GROUP BY or inside an aggregate function.
- `WHERE` filters rows **before** grouping.
- `HAVING` filters groups **after** grouping.

---

### HAVING

```sql
SELECT dept, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept
HAVING AVG(salary) > 50000;   -- filter after grouping
```

| Clause   | Filters   | Used With        |
|----------|-----------|------------------|
| `WHERE`  | Rows      | Before GROUP BY  |
| `HAVING` | Groups    | After GROUP BY   |

---

### Common Patterns

```sql
-- Count per group, filter to groups with more than 5
SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) > 5;

-- Department with highest average salary
SELECT dept FROM employees GROUP BY dept ORDER BY AVG(salary) DESC LIMIT 1;

-- Employees above department average (subquery)
SELECT name FROM employees e
WHERE salary > (SELECT AVG(salary) FROM employees WHERE dept = e.dept);
```

---

## 4. Window Functions

Window functions compute values **across rows related to the current row** without collapsing them into a single group.

```sql
function_name() OVER (
    PARTITION BY column    -- like GROUP BY, but keeps all rows
    ORDER BY column        -- defines order within partition
    ROWS BETWEEN ...       -- optional frame
)
```

---

### ROW_NUMBER / RANK / DENSE_RANK

```sql
SELECT name, dept, salary,
    ROW_NUMBER()  OVER (PARTITION BY dept ORDER BY salary DESC) AS row_num,
    RANK()        OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk,
    DENSE_RANK()  OVER (PARTITION BY dept ORDER BY salary DESC) AS dense_rnk
FROM employees;
```

| salary | ROW_NUMBER | RANK | DENSE_RANK |
|--------|------------|------|------------|
| 90000  | 1          | 1    | 1          |
| 80000  | 2          | 2    | 2          |
| 80000  | 3          | 2    | 2          |
| 70000  | 4          | 4    | 3          |

> **RANK** skips numbers after ties. **DENSE_RANK** does not skip.

---

### NTILE

```sql
-- Split employees into 4 salary quartiles
SELECT name, salary,
    NTILE(4) OVER (ORDER BY salary) AS quartile
FROM employees;
```

---

### LEAD / LAG

```sql
SELECT name, salary,
    LAG(salary, 1)  OVER (ORDER BY hire_date) AS prev_salary,
    LEAD(salary, 1) OVER (ORDER BY hire_date) AS next_salary
FROM employees;
```

`LAG` → previous row. `LEAD` → next row. Both accept an optional offset and default value.

---

### FIRST_VALUE / LAST_VALUE

```sql
SELECT name, dept, salary,
    FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC) AS highest_in_dept,
    LAST_VALUE(salary)  OVER (
        PARTITION BY dept ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_in_dept
FROM employees;
```

> **Warning:** `LAST_VALUE` needs an explicit frame `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` or it only looks up to the current row.

---

### Running Total (SUM as Window)

```sql
SELECT name, salary,
    SUM(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM employees;
```

---

### Window Function Summary

| Function        | Returns                                        |
|-----------------|------------------------------------------------|
| `ROW_NUMBER()`  | Unique sequential number per partition         |
| `RANK()`        | Rank with gaps on ties                         |
| `DENSE_RANK()`  | Rank without gaps on ties                      |
| `NTILE(n)`      | Splits rows into n equal buckets               |
| `LEAD(col, n)`  | Value from n rows ahead                        |
| `LAG(col, n)`   | Value from n rows behind                       |
| `FIRST_VALUE()` | First value in the window frame                |
| `LAST_VALUE()`  | Last value in the window frame                 |
| `SUM() OVER()`  | Running / partitioned total                    |
| `AVG() OVER()`  | Running / partitioned average                  |

---

## 5. Indexing

### What is an Index?

An index is a separate data structure that lets the database find rows faster — like a book's index vs. reading every page.

---

### Clustered vs Non-Clustered

| Type              | Description                                            | Count per Table |
|-------------------|--------------------------------------------------------|-----------------|
| **Clustered**     | Physically sorts table data by index key               | 1 only          |
| **Non-Clustered** | Separate structure with pointers back to the table     | Many allowed    |

```sql
-- Clustered (SQL Server syntax — PRIMARY KEY is usually clustered by default)
CREATE CLUSTERED INDEX idx_emp_id ON employees(id);

-- Non-clustered
CREATE INDEX idx_emp_name ON employees(name);
```

---

### Composite Index

```sql
CREATE INDEX idx_dept_salary ON employees(dept, salary);
-- Good for: WHERE dept = 'HR' AND salary > 50000
-- Good for: WHERE dept = 'HR'
-- NOT useful for: WHERE salary > 50000 (leading column must be present)
```

> **Left-prefix rule:** A composite index on `(A, B, C)` is used for queries filtering on `A`, `A+B`, or `A+B+C` — not `B` or `C` alone.

---

### Unique Index

```sql
CREATE UNIQUE INDEX idx_email ON employees(email);
-- Prevents duplicate emails AND speeds up lookups
```

---

### When Indexes Help vs Hurt

| Indexes Help                              | Indexes Hurt                              |
|-------------------------------------------|-------------------------------------------|
| Columns used in WHERE / JOIN / ORDER BY   | Heavily updated columns (write overhead)  |
| High-cardinality columns (many uniques)   | Small tables (full scan is faster)        |
| Columns used in range queries             | Low-cardinality columns (e.g. boolean)    |
| Foreign key columns                       | Too many indexes on one table             |

---

### Best Practices

- Index foreign keys — queries joining on them are very common.
- Avoid indexing columns that are rarely queried.
- Monitor unused indexes; they slow down INSERTs/UPDATEs.
- Use `EXPLAIN` / `EXPLAIN ANALYZE` to see if indexes are used.
- Partial indexes (PostgreSQL) index only rows matching a condition.

```sql
-- Partial index: only active employees
CREATE INDEX idx_active_emp ON employees(name) WHERE status = 'active';
```

---

## 6. Advanced SQL Features

### Subqueries

```sql
-- In WHERE
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- In FROM (inline view)
SELECT dept, avg_sal
FROM (SELECT dept, AVG(salary) AS avg_sal FROM employees GROUP BY dept) AS dept_avg
WHERE avg_sal > 55000;

-- In SELECT (scalar subquery)
SELECT name, (SELECT department_name FROM departments WHERE id = e.dept_id) AS dept_name
FROM employees e;
```

---

### Correlated Subquery

Runs once **per row** of the outer query — can be slow on large tables.

```sql
-- Employees earning more than their department's average
SELECT name, salary, dept
FROM employees e
WHERE salary > (SELECT AVG(salary) FROM employees WHERE dept = e.dept);
```

---

### CTEs (Common Table Expressions)

```sql
WITH dept_avg AS (
    SELECT dept, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY dept
),
top_depts AS (
    SELECT dept FROM dept_avg WHERE avg_sal > 55000
)
SELECT e.name, e.dept
FROM employees e
JOIN top_depts t ON e.dept = t.dept;
```

> CTEs improve readability. Multiple CTEs can reference earlier ones in the same `WITH`.

---

### Recursive CTEs

```sql
-- Traverse an org hierarchy (manager -> employee chain)
WITH RECURSIVE org_tree AS (
    -- Base case: top-level managers (no manager)
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: employees under each manager
    SELECT e.id, e.name, e.manager_id, ot.level + 1
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, name;
```

---

### Views

```sql
-- Create
CREATE VIEW active_employees AS
SELECT id, name, dept, salary
FROM employees
WHERE status = 'active';

-- Use like a table
SELECT * FROM active_employees WHERE dept = 'HR';

-- Drop
DROP VIEW active_employees;
```

Views don't store data (unless materialized). They store the query definition.

---

### Temporary Tables

```sql
CREATE TEMPORARY TABLE temp_high_earners AS
SELECT * FROM employees WHERE salary > 80000;

SELECT * FROM temp_high_earners;
-- Dropped automatically at end of session
```

---

### Stored Procedures

```sql
CREATE PROCEDURE give_raise(dept_name VARCHAR(50), pct DECIMAL(5,2))
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE employees
    SET salary = salary * (1 + pct / 100)
    WHERE dept = dept_name;
END;
$$;

CALL give_raise('IT', 10.0);
```

---

### Transactions & ACID

```sql
BEGIN;
    UPDATE accounts SET balance = balance - 500 WHERE id = 1;
    UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;

-- If something fails:
ROLLBACK;

-- Savepoint
BEGIN;
    UPDATE ...;
    SAVEPOINT sp1;
    UPDATE ...;       -- if this fails:
    ROLLBACK TO sp1;  -- undo only back to savepoint
COMMIT;
```

| ACID Property  | Meaning                                                        |
|----------------|----------------------------------------------------------------|
| **Atomicity**  | All steps succeed or all roll back — no partial updates        |
| **Consistency**| DB moves from one valid state to another                       |
| **Isolation**  | Concurrent transactions don't interfere                        |
| **Durability** | Committed data survives crashes                                |

---

### CASE Expressions

```sql
SELECT name, salary,
    CASE
        WHEN salary >= 80000 THEN 'Senior'
        WHEN salary >= 50000 THEN 'Mid'
        ELSE 'Junior'
    END AS level
FROM employees;

-- Simple form
SELECT name,
    CASE dept
        WHEN 'HR'      THEN 'People Team'
        WHEN 'IT'      THEN 'Tech Team'
        ELSE 'Other'
    END AS team_name
FROM employees;
```

---

### UNION vs UNION ALL

```sql
SELECT name FROM employees_2023
UNION
SELECT name FROM employees_2024;    -- removes duplicates

SELECT name FROM employees_2023
UNION ALL
SELECT name FROM employees_2024;    -- keeps duplicates, faster
```

| Feature       | UNION           | UNION ALL       |
|---------------|-----------------|-----------------|
| Duplicates    | Removed         | Kept            |
| Performance   | Slower (dedup)  | Faster          |
| Use when      | Need distinct   | Need all rows   |

---

### EXISTS vs IN

```sql
-- IN: compares value against a list
SELECT * FROM employees WHERE dept_id IN (SELECT id FROM departments WHERE location = 'NY');

-- EXISTS: checks if subquery returns any rows
SELECT * FROM employees e
WHERE EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept_id AND d.location = 'NY');
```

> **EXISTS** stops as soon as it finds a match — faster when the subquery returns many rows. **IN** with NULL values can produce unexpected results (`NOT IN` returns nothing if any value is NULL).

---

### COALESCE & NULL Handling

```sql
SELECT COALESCE(phone, mobile, 'No contact') AS contact  -- returns first non-NULL
FROM employees;

SELECT NULLIF(score, 0) FROM results;  -- returns NULL if score = 0 (avoids division by zero)

SELECT name, salary + COALESCE(bonus, 0) AS total_comp
FROM employees;

-- NULL comparison MUST use IS NULL, not = NULL
WHERE phone IS NULL
WHERE phone IS NOT NULL
```

---

## 7. Interview Revision Tables

### SQL Execution Order

| Order | Clause      | What Happens                            |
|-------|-------------|------------------------------------------|
| 1     | `FROM`      | Identify source tables                   |
| 2     | `JOIN`      | Combine tables                           |
| 3     | `WHERE`     | Filter rows                              |
| 4     | `GROUP BY`  | Group filtered rows                      |
| 5     | `HAVING`    | Filter groups                            |
| 6     | `SELECT`    | Select and compute columns               |
| 7     | `DISTINCT`  | Remove duplicates                        |
| 8     | `ORDER BY`  | Sort results                             |
| 9     | `LIMIT`     | Limit output rows                        |

> **Key insight:** `WHERE` runs before `SELECT`, so you can't use a SELECT alias in WHERE. Use it in `ORDER BY` or `HAVING` (some DBs allow it).

---

### Aggregate Functions

| Function          | Ignores NULLs | Notes                        |
|-------------------|---------------|------------------------------|
| `COUNT(*)`        | No            | Counts all rows              |
| `COUNT(col)`      | Yes           | Counts non-NULL values       |
| `COUNT(DISTINCT)` | Yes           | Counts unique non-NULL       |
| `SUM(col)`        | Yes           | Total                        |
| `AVG(col)`        | Yes           | Sum / count (ignores NULLs)  |
| `MIN(col)`        | Yes           | Smallest value               |
| `MAX(col)`        | Yes           | Largest value                |

---

### Common Constraints

| Constraint    | Auto-creates Index | Allows NULLs   |
|---------------|--------------------|----------------|
| `PRIMARY KEY` | Yes (unique)       | No             |
| `UNIQUE`      | Yes (unique)       | Yes (one NULL) |
| `FOREIGN KEY` | Not always         | Yes            |
| `CHECK`       | No                 | Yes            |
| `NOT NULL`    | No                 | No             |

---

### Frequently Used Commands

| Category | Commands                                              |
|----------|-------------------------------------------------------|
| DQL      | `SELECT`                                              |
| DML      | `INSERT`, `UPDATE`, `DELETE`, `MERGE`                 |
| DDL      | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`       |
| DCL      | `GRANT`, `REVOKE`                                     |
| TCL      | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`            |

---

## 8. Example Query Collection

### Schema Used in Examples

```sql
-- employees(id, name, dept, salary, hire_date, manager_id, status)
-- departments(id, dept_name, location)
-- orders(id, customer_id, amount, order_date, status)
-- customers(id, name, city, country)
-- products(id, name, category, price, stock)
-- order_items(order_id, product_id, qty, unit_price)
```

---

## BEGINNER

---

**Q1. List all employees**

```sql
SELECT * FROM employees;
```

---

**Q2. List employee names and their salaries**

```sql
SELECT name, salary FROM employees;
```

---

**Q3. Find all employees in the HR department**

```sql
SELECT name FROM employees
WHERE dept = 'HR';
```

---

**Q4. Find employees earning more than 60,000**

```sql
SELECT name, salary FROM employees
WHERE salary > 60000;
```

---

**Q5. Find employees hired after 2020**

```sql
SELECT name, hire_date FROM employees
WHERE hire_date > '2020-12-31'
ORDER BY hire_date;
```

---

**Q6. List unique departments**

```sql
SELECT DISTINCT dept FROM employees
ORDER BY dept;
```

---

**Q7. Top 5 highest-paid employees**

```sql
SELECT name, salary FROM employees
ORDER BY salary DESC
LIMIT 5;
```

---

**Q8. Count total employees**

```sql
SELECT COUNT(*) AS total_employees FROM employees;
```

---

**Q9. Average salary across all employees**

```sql
SELECT AVG(salary) AS avg_salary FROM employees;
```

---

**Q10. Employees whose names start with 'A'**

```sql
SELECT name FROM employees
WHERE name LIKE 'A%';
```

---

**Q11. Count employees per department**

```sql
SELECT dept, COUNT(*) AS headcount
FROM employees
GROUP BY dept
ORDER BY headcount DESC;
```

---

**Q12. Total salary spend per department**

```sql
SELECT dept, SUM(salary) AS total_salary
FROM employees
GROUP BY dept;
```

---

**Q13. Departments with more than 10 employees**

```sql
SELECT dept, COUNT(*) AS headcount
FROM employees
GROUP BY dept
HAVING COUNT(*) > 10;
```

---

**Q14. Highest and lowest salary in each department**

```sql
SELECT dept, MAX(salary) AS max_sal, MIN(salary) AS min_sal
FROM employees
GROUP BY dept;
```

---

## INTERMEDIATE

---

**Q15. List employees with their department name**

```sql
SELECT e.name, d.dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.id;
```

*INNER JOIN returns only employees who have a matching department.*

---

**Q16. Find employees with no department assigned**

```sql
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;
```

*LEFT JOIN + NULL check reveals unmatched rows.*

---

**Q17. Find departments with no employees**

```sql
SELECT d.dept_name
FROM departments d
LEFT JOIN employees e ON d.id = e.dept_id
WHERE e.id IS NULL;
```

---

**Q18. Total order amount per customer**

```sql
SELECT c.name, SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_spent DESC;
```

---

**Q19. Employees earning above the company average**

```sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;
```

*Subquery computes the average once, then outer query filters.*

---

**Q20. Second highest salary**

```sql
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

---

**Q21. Employees in the same department as 'Alice'**

```sql
SELECT name FROM employees
WHERE dept = (SELECT dept FROM employees WHERE name = 'Alice')
  AND name != 'Alice';
```

---

**Q22. Label employees by salary band using CASE**

```sql
SELECT name, salary,
    CASE
        WHEN salary >= 80000 THEN 'Senior'
        WHEN salary >= 50000 THEN 'Mid-level'
        ELSE 'Junior'
    END AS band
FROM employees;
```

---

**Q23. Customers who have placed at least one order**

```sql
SELECT DISTINCT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

---

**Q24. Products that have never been ordered**

```sql
SELECT p.name
FROM products p
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM order_items);
```

> Caution: `NOT IN` returns no rows if the subquery has any NULLs. Prefer `NOT EXISTS` when NULLs are possible.

---

**Q25. Employee count by department for 'active' employees only**

```sql
SELECT dept, COUNT(*) AS active_count
FROM employees
WHERE status = 'active'
GROUP BY dept
HAVING COUNT(*) >= 5;
```

---

**Q26. List all employees with their manager's name**

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

*Self join — same table joined to itself.*

---

## ADVANCED

---

**Q27. Rank employees by salary within each department**

```sql
SELECT name, dept, salary,
    RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS salary_rank
FROM employees;
```

---

**Q28. Top 3 earners in each department**

```sql
WITH ranked AS (
    SELECT name, dept, salary,
        DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
    FROM employees
)
SELECT name, dept, salary
FROM ranked
WHERE rnk <= 3;
```

*`DENSE_RANK` so ties don't skip a spot. Filter in outer query.*

---

**Q29. Running total of order amounts by date**

```sql
SELECT order_date, amount,
    SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders
ORDER BY order_date;
```

---

**Q30. Month-over-month sales comparison**

```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(amount) AS total
    FROM orders
    GROUP BY 1
)
SELECT month, total,
    LAG(total, 1) OVER (ORDER BY month) AS prev_month,
    total - LAG(total, 1) OVER (ORDER BY month) AS change
FROM monthly;
```

---

**Q31. Find duplicate emails in the customers table**

```sql
SELECT email, COUNT(*) AS cnt
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

---

**Q32. Delete duplicate rows, keep the one with the lowest id**

```sql
DELETE FROM customers
WHERE id NOT IN (
    SELECT MIN(id)
    FROM customers
    GROUP BY email
);
```

---

**Q33. Employees earning more than their department's average**

```sql
WITH dept_avg AS (
    SELECT dept, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY dept
)
SELECT e.name, e.dept, e.salary, da.avg_sal
FROM employees e
JOIN dept_avg da ON e.dept = da.dept
WHERE e.salary > da.avg_sal;
```

---

**Q34. Find gaps in order IDs (gap-and-island)**

```sql
SELECT id + 1 AS gap_start
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM orders WHERE id = o.id + 1
)
  AND id < (SELECT MAX(id) FROM orders);
```

*Finds IDs that exist but whose successor doesn't — indicating a gap.*

---

**Q35. Customers who ordered in every month of 2024**

```sql
SELECT customer_id
FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY customer_id
HAVING COUNT(DISTINCT DATE_TRUNC('month', order_date)) = 12;
```

---

**Q36. Recursive org chart — all reports under a given manager**

```sql
WITH RECURSIVE reports AS (
    SELECT id, name, manager_id, 0 AS depth
    FROM employees
    WHERE name = 'CEO Name'

    UNION ALL

    SELECT e.id, e.name, e.manager_id, r.depth + 1
    FROM employees e
    JOIN reports r ON e.manager_id = r.id
)
SELECT * FROM reports ORDER BY depth, name;
```

---

**Q37. Cumulative percentage of total sales per product**

```sql
SELECT
    p.name,
    SUM(oi.qty * oi.unit_price) AS revenue,
    ROUND(
        100.0 * SUM(oi.qty * oi.unit_price) /
        SUM(SUM(oi.qty * oi.unit_price)) OVER (),
    2) AS pct_of_total
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.name
ORDER BY revenue DESC;
```

---

**Q38. Assign customers to sales rep buckets using NTILE**

```sql
SELECT
    customer_id,
    total_spent,
    NTILE(4) OVER (ORDER BY total_spent DESC) AS quartile
FROM (
    SELECT customer_id, SUM(amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS spend;
```

---

**Q39. First and last order date per customer**

```sql
SELECT
    customer_id,
    MIN(order_date) AS first_order,
    MAX(order_date) AS last_order,
    MAX(order_date) - MIN(order_date) AS customer_lifespan_days
FROM orders
GROUP BY customer_id;
```

---

**Q40. Pivot: monthly revenue as columns (PostgreSQL)**

```sql
SELECT
    product_id,
    SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 1  THEN amount ELSE 0 END) AS jan,
    SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 2  THEN amount ELSE 0 END) AS feb,
    SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 3  THEN amount ELSE 0 END) AS mar
FROM orders
JOIN order_items oi ON orders.id = oi.order_id
WHERE EXTRACT(YEAR FROM order_date) = 2024
GROUP BY product_id;
```

*Manual pivot using CASE. For dynamic pivots, use your DB's PIVOT/crosstab functions.*

---

> **Final interview tips:**
>
> - Always think about NULLs — they propagate in arithmetic and break `NOT IN`.
> - For "top N per group" problems: window function + filter in outer query.
> - `EXISTS` is usually faster than `IN` when the subquery is large.
> - Know the difference between `WHERE` (rows) and `HAVING` (groups).
> - Understand SQL execution order — it explains most confusing behavior.
> - `UNION` deduplicates; `UNION ALL` is faster and doesn't.
> - Window functions don't reduce row count — that's their superpower.
