Category & Navigation Taxonomy
You do not need to hardcode categories into the HTML. The sidebar navigation is built dynamically by reading the "category" string in ssp-manifest.json.
If you reuse an existing category name, the tool will be grouped into that existing accordion folder.
If you introduce a new category string, the OS will automatically generate a new accordion folder.
The Top Navigation Arrows (< >) in the header will cycle sequentially through the tools in the exact order they appear in the JSON manifest.

Theme Synchronization
Dark Mode is controlled exclusively by index.html and saved to the browser's localStorage under the key ssp-theme.
When a child app loads in the iframe, its inline <script> reads localStorage and applies the .dark CSS class instantly before the DOM renders (preventing white flashes). Toggling the theme from the dashboard forces a quiet reload of the iframe (appFrame.src = ...) to dynamically re-sync the active tool.

Security & CORS Limits (Historical Context)
Do not attempt to use appFrame.contentDocument or contentWindow to mutate the child IFrames from index.html. Modern browsers enforce strict Cross-Origin Resource Sharing (CORS) policies. Sniffing inside an iframe when hosted on a local file:// protocol or across restricted domains will result in a fatal security block, crashing the dashboard's routing JavaScript (the "Initializing Hub..." freeze). The current architecture respects the iframe boundary and uses parameter/storage-based communication to ensure total stability.
