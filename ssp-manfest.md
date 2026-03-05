# SSP Clinical Tool Hub - Ecosystem Manifest

> **AI RULES OF ENGAGEMENT FOR THIS DOCUMENT:**
> 1. This is a passive reference for the Sterling Specialty Pharmacy ecosystem.
> 2. **DO NOT** suggest changes to, or pull logic from, any app in this directory unless I explicitly command you to interact with that specific app.
> 3. When building a *new* tool, use this directory solely to ensure you do not duplicate an existing folder path or app name. Keep the new tool isolated.

## 1. Main Dashboard
* **Path:** `/index.html` (Root)
* **Status:** Deployed
* **Dashboard Compatible:** N/A (Root host)
* **Purpose:** The central launchpad for all SSP internal tools. Contains links to all nested app directories.

## 2. Afrezza Calculator
* **Path:** `/afrezza-calc/index.html`
* **Status:** Deployed
* **Dashboard Compatible:** Yes
* **Dependencies:** Standard vanilla JS / Tailwind
* **Purpose:** Clinical calculator specific to Afrezza dosing requirements.

## 3. RTS Calculator (Return To Stock)
* **Path:** `/rts-calc/index.html`
* **Status:** Deployed
* **Dashboard Compatible:** Yes
* **Dependencies:** Standard vanilla JS / Tailwind
* **Purpose:** Calculates return-to-stock windows and metrics for pharmacy inventory.

## 4. Zen Snake
* **Path:** `/zen-snake/index.html`
* **Status:** Deployed
* **Dashboard Compatible:** Yes (UI container)
* **Dependencies:** Standard vanilla JS Canvas
* **Purpose:** A lightweight browser game, likely functioning as an Easter egg or break tool.

## 5. Morts Snack Catch Game
* **Path:** `/morts-snack-catch/index.html`
* **Status:** In Development
* **Dashboard Compatible:** No (Experimental)
* **Dependencies:** Phaser.js
* **Purpose:** Experimental tutorial project for learning the Phaser game engine. Not a clinical productivity tool.