# SSP Clinical Tool Hub - Dashboard Compatibility Rules (V3.1.0 SPECIFICATION)

> **AI RULES OF ENGAGEMENT FOR THIS DOCUMENT:**
> 1. Only apply these rules if the user explicitly requests a "Dashboard compatible" app or sub-module.
> 2. If applied, you must strictly follow every architectural, layout, physics, and styling rule listed below to ensure 100% cohesion across the SSP ecosystem. Do not deviate. The browser is a pristine laboratory; treat it as such.

## 1. Architectural Directives
* **The Single-File Artifact:** Output the specific application as a single `index.html` file. Include all HTML, Tailwind classes via CDN, custom CSS, and vanilla JavaScript strictly within this isolated environment. Zero build steps. Zero bloated frameworks.
* **Directory Assumption:** Assume this app lives inside its own kebab-case folder directly off the root directory (e.g., `/ssp-apps/new-tool-name/index.html`).

## 2. Design Language: SSP Cupertino 2050
* **Tailwind Framework:** Use the Tailwind CSS CDN `<script src="https://cdn.tailwindcss.com"></script>`. Configure `darkMode: 'class'` and extend the theme to include `colors: { 'sterling-green': '#16a34a' }`.
* **Corporate Colors:** Hardcode `.sterling-green { color: #16a34a; }` and `.bg-sterling-green { background-color: #16a34a; }` in the custom `<style>` block for enterprise brand enforcement.
* **Input Typography:** Enterprise browsers lock strict number fields. NEVER use `<input type="number">`. ALWAYS use `<input type="text" inputmode="numeric" pattern="[0-9]*">` to ensure unhindered data entry for vital clinical metrics.
* **Deep UI Environment:** The `<body>` background must employ deep gradients and Slate tones. 
  * *Standard:* `class="bg-[#f8fafc] dark:bg-[#030712] dark:bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] dark:from-green-950/20 dark:via-[#030712] dark:to-black min-h-screen flex flex-col text-slate-800 dark:text-slate-300 antialiased selection:bg-sterling-green/30 selection:text-white transition-colors duration-500"`

## 3. Smart Glass Engine & Physics
* **Physics Engine:** Linear transitions are banned. State changes, modals, and hover animations must use custom spring physics: `transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)`.
* **CSS Glass Variables:** The `<style>` block MUST define these precise tolerances for light and dark environments:
  ```css
  :root {
      --glass-bg: rgba(0, 0, 0, 0.02);
      --glass-border: rgba(0, 0, 0, 0.05);
      --glass-shine: rgba(0, 0, 0, 0.03);
      --glass-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  }
  html.dark {
      --glass-bg: rgba(255, 255, 255, 0.015);
      --glass-border: rgba(255, 255, 255, 0.05);
      --glass-shine: rgba(22, 163, 74, 0.12);
      --glass-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.02);
  }
Dynamic Hover Tracking: Interactive cards/tiles must track mouse positioning to cast a localized shine. Add the following CSS pseudoclass to target components:

CSS
.app-tile::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glass-shine), transparent 40%);
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
    z-index: 1;
}
.app-tile:hover::before { opacity: 1; }
4. DOM Structure & Telemetry
Top Navigation: The <nav> or header bar must be a sticky glass pane: class="w-full px-6 py-4 flex justify-between items-center z-50 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 sticky top-0".

Theme Controller: Include the SSP standard dark mode toggle pill in the top right.

Typography: Headers should use light, tracked-out font weights. E.g., text-5xl font-light tracking-tight. Subtitles must use font-mono text-[10px] tracking-[0.3em] uppercase.

5. Strict Execution Protocols (Anti-FOUC & Logic)
Flash Mitigation (DOM Blocking): A <script> MUST be placed directly in the <head> to read localStorage.getItem('ssp-theme') and synchronously inject the dark class before the body parses.

Transition Suppression: The <body> tag must load with the .preload class. This class must disable all CSS transitions:

CSS
.preload * { transition: none !important; }
Engine Ignition: The JavaScript payload at the end of the document MUST include these essential lifecycle hooks:

Remove .preload on window load: window.addEventListener('load', () => document.body.classList.remove('preload'));

Bind the mouse tracking to the Smart Glass components:

JavaScript
document.querySelectorAll('.app-tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
        const rect = tile.getBoundingClientRect();
        tile.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        tile.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
});
Bind the ssp-theme localStorage mutation to the top-bar toggle switch.
