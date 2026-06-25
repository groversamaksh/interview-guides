# HTML and Accessibility (A11Y)

## 1. HTML Document Structure
```html
<!DOCTYPE html> <!-- Declares HTML5 -->
<html lang="en"> <!-- Root element, language for A11Y -->
<head>
  <meta charset="UTF-8">
  <title>Document Title</title>
</head>
<body>
  <!-- Visible content -->
</body>
</html>
```

## 2. Semantic HTML
Improves accessibility and SEO by describing the meaning of the content.
- `<header>`: Introductory content or navigational links.
- `<nav>`: Primary navigation blocks.
- `<main>`: The dominant content of the `<body>`.
- `<section>`: Thematic grouping of content, typically with a heading.
- `<article>`: Self-contained composition (e.g., a blog post).
- `<aside>`: Content tangentially related to the surrounding content (sidebar).
- `<footer>`: Footer for its nearest sectioning content.

## 3. Forms
```html
<form action="/submit" method="POST">
  <fieldset>
    <legend>User Info</legend>
    <label for="username">Name:</label>
    <input type="text" id="username" name="username" required minlength="3">
    
    <label for="color">Favorite Color:</label>
    <select id="color" name="color">
      <option value="red">Red</option>
      <option value="blue">Blue</option>
    </select>

    <label for="browser">Browser:</label>
    <input list="browsers" name="browser" id="browser">
    <datalist id="browsers">
      <option value="Chrome">
      <option value="Firefox">
    </datalist>
    
    <button type="submit">Submit</button>
  </fieldset>
</form>
```

## 4. Media Elements
```html
<!-- Responsive Images -->
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Description for A11Y" loading="lazy">
</picture>

<!-- Audio & Video -->
<video controls width="500" poster="thumbnail.jpg">
  <source src="video.mp4" type="video/mp4">
  <track src="subtitles_en.vtt" kind="subtitles" srclang="en" label="English">
  Your browser does not support the video tag.
</video>
```

## 5. Accessibility (A11Y)

**Why it matters**: Ensures web access for people with disabilities.
**WCAG Principles (POUR)**: Perceivable, Operable, Understandable, Robust.

### ARIA (Accessible Rich Internet Applications)
- `aria-label`: String that labels the current element.
- `aria-hidden="true"`: Removes element from the accessibility tree.
- `aria-expanded`: Indicates whether a collapsible element is open or closed.
- `aria-live`: Indicates that an element will be updated (`polite` or `assertive`).

### Focus Management
- Keyboard navigation relies on the `Tab` key.
- Elements like links, buttons, and inputs are focusable by default.
- Use `tabindex="0"` to make non-interactive elements focusable in document order.
- Use `tabindex="-1"` to make elements focusable programmatically but not via keyboard.
