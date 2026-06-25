# Frontend Fundamentals & Browser Internals

## 1. What happens when a user enters a URL
1. **DNS Resolution**: The browser checks its cache, OS cache, router cache, and ISP cache. If not found, it queries the DNS server to translate the domain name into an IP address.
2. **TCP Connection**: The browser initiates a TCP connection with the server (TCP 3-way handshake: SYN, SYN-ACK, ACK).
3. **TLS Negotiation**: If HTTPS, a TLS handshake occurs to establish a secure connection.
4. **HTTP Request**: The browser sends an HTTP GET request to the server.
5. **HTTP Response**: The server responds with an HTTP status code and the requested resource (usually HTML).
6. **Rendering**: The browser parses the HTML, fetches additional resources, and renders the page.

## 2. Browser Architecture
- **User Interface**: Address bar, back/forward buttons, bookmarks.
- **Browser Engine**: Marshals actions between UI and rendering engine.
- **Rendering Engine**: Displays the requested content (e.g., parsing HTML/CSS).
- **Networking**: For network calls like HTTP requests.
- **UI Backend**: Draws basic widgets like combo boxes and windows.
- **JavaScript Engine**: Parses and executes JS code (e.g., V8).
- **Data Storage**: Persistence layer (Cookies, LocalStorage, IndexedDB).

## 3. Critical Rendering Path
The sequence of steps the browser goes through to convert HTML, CSS, and JS into pixels on the screen.
1. **HTML Parsing -> DOM Tree**
2. **CSS Parsing -> CSSOM Tree**
3. **DOM + CSSOM -> Render Tree**
4. **Layout**: Computes exact positions and sizes of nodes.
5. **Paint**: Draws pixels for each node.
6. **Composite**: Draws layers in the correct order.

## 4. Browser Components
- **Rendering Engine**: WebKit (Safari), Blink (Chrome/Edge), Gecko (Firefox).
- **JavaScript Engine**: V8 (Chrome/Edge), SpiderMonkey (Firefox), JavaScriptCore (Safari).
- **Networking Layer**: Handles protocol implementations and connection pooling.
- **Browser Storage**: Quota management and storage APIs.
- **Compositor**: Takes painted layers and composites them together, often on the GPU for performance.

## 5. Rendering Process Detail
1. **HTML Parsing**: Tokenization and tree construction.
2. **DOM Construction**: Document Object Model creation.
3. **CSS Parsing**: Resolving styles and cascade.
4. **CSSOM Construction**: CSS Object Model.
5. **Render Tree**: Combines DOM and CSSOM, excluding non-visual elements (e.g., `display: none`, `<head>`).
6. **Layout**: "Reflow". Calculates geometry.
7. **Paint**: "Rasterization". Converts layout into pixels.
8. **Composite**: Sends layers to the GPU to be drawn on screen.
