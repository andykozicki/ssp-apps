# SSP Clinical Tool Hub - Dashboard Compatibility Rules

> **AI RULES OF ENGAGEMENT FOR THIS DOCUMENT:**
> 1. Only apply these rules if the user explicitly requests a "Dashboard compatible" app.
> 2. If applied, you must strictly follow every architectural, layout, and styling rule listed below to ensure 100% cohesion across the SSP ecosystem. Do not deviate.

## Architectural Rules
* **The Single-File Approach:** Output the specific application as a single `index.html` file. Include all HTML, Tailwind classes, custom CSS, and vanilla JavaScript in this one file.
* **Directory Assumption:** Assume this app lives inside its own kebab-case folder directly off the root directory (e.g., `/new-tool-name/index.html`).

## UI & Styling Rules
* **Tailwind Framework:** Use the Tailwind CSS CDN `<script src="https://cdn.tailwindcss.com"></script>`.
* **Corporate Colors:** Define `.sterling-green { color: #16a34a; }` and `.bg-sterling-green { background-color: #16a34a; }` in the custom `<style>` block. Use these for primary buttons, active states, and highlighted text.
* **Input Typography:** Enterprise browsers lock strict number fields. Never use `<input type="number">`. Always use `<input type="text" inputmode="numeric" pattern="[0-9]*">` to ensure free typing for numeric data.
* **Standard Headers:** The app must feature a centered `<header>` containing an `<h1>` with the tool's name and a `<p>` reading "Sterling Specialty Pharmacy Internal Tool".
* **Dynamic Footer:** Include a `<footer class="mt-12 text-gray-400 text-xs text-center">` at the bottom of the page containing a copyright notice with a JavaScript-driven auto-updating year tied to Sterling Specialty Pharmacy.

## Dark Mode Standardization Guidelines
*All Dashboard compatible apps must adhere to this precise dark mode architecture:*

* **Configuration:** Enable class-based dark mode in the Tailwind CDN script block: `<script>tailwind.config = { darkMode: 'class' }</script>`
* **FOUC Prevention & Memory:** You MUST include the following script block in the `<head>` after the Tailwind config to prevent a Flash of Unstyled Content and check local storage:
  `<script>if (localStorage.getItem('ssp-theme') === 'dark') { document.documentElement.classList.add('dark'); }</script>`
* **The Universal Top Bar (The Escape Hatch & Toggle):** The very first element inside the `<body>` must be a full-width container (`w-full p-4 flex justify-between items-center`) that spans the entire top of the screen.
    * **Left Side:** Place a "Back to Dashboard" link. Strictly use `href="../index.html"`, a left-facing SVG arrow, and plain gray Tailwind text. *(Exception: Do not include this link if you are building the main root Dashboard itself).*
    * **Right Side:** The Light/Dark toggle switch (a standard HTML checkbox hidden behind a styled Tailwind CSS toggle pill).
* **Toggle JavaScript Logic:** In the main script block, the theme toggle must check the HTML class on load to ensure the checkbox matches the loaded `ssp-theme` state. When toggled, it must set `'ssp-theme'` to `'dark'` or `'light'` in `localStorage`.
* **Base Body Layout:** The `<body>` must be full height and handle the background color transition: `class="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300"`
* **Main App Centering:** Wrap the actual app header and card in a centering `<div>` beneath the top bar: `class="flex-1 flex flex-col items-center px-4"`
* **Card Containers:** App interfaces inside the `<main>` tag must use: `class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow max-w-md w-full"`
* **Dynamic JavaScript Rendering:** Any HTML elements generated via JavaScript (tables, calendar grids) must include the `dark:` prefix classes in their template literals.