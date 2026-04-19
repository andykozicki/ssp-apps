Pharmacy Breaker: v0.2 Architecture Blueprint

1. Architecture: The Holy Trinity

Monolithic files are a liability. We split the architecture into three discrete domains.

index.html: The skeleton. Holds the DOM, CSS, UI overlays, and external library imports (Phaser, lil-gui).

config.js: The brain. Holds the CONFIG object, LORE_DB (which will contain arrays of fake patient names and fictitious ailments for random generation), and FREQUENCY_MAP. This isolates balance tweaking and narrative writing from the execution loop.

game.js: The engine. Contains the Phaser scene (MainScene), state management, physics collisions, and rendering logic.

2. Narrative Prescriptions

Consolidated quotas destroy the theme. We split multi-color objectives into distinct patient profiles.

Patient: John Doe

Rx 1: Blue Capsules. Take 1 daily for 10 days.

Rx 2: Green Capsules. Take 1 twice daily for 5 days.

This anchors the abstract color mechanics in practical pharmacy logic.

3. Kill the Combo Heal

The "hit 3 to heal" mechanic is dead. It turns a precision puzzle into a spam-fest. The Mis-dispense bar is now a strictly finite resource. Every launch has consequences.

4. New Mechanics: Lives & Alchemy

Failure states require clear delineation.

Mis-dispense Bar (Tolerance): Drains strictly on bad collisions (wrong colors, red hazards, over-dispensing).

Lives: You start with 3. If tolerance hits zero, you lose a life and the level resets. Zero lives equals run over.

1-Up Capsule: A rare, pulsing green cross. Hitting it restores a life.

Generic Substitution (Powerup): A rare, glowing rainbow pill. Impact triggers a radial shockwave. Any off-label or hazard pills caught in the blast instantly transmute into required quota colors.

5. The Over-Dispense Penalty

A brutal but necessary mechanical twist. Once a specific color's quota hits zero, it is no longer a target. It becomes a hazard.

Further hits on that color subtract from the Mis-dispense bar. Board clearing late in the level requires surgical aim.

6. "FILLED" UI Stamp

Synergizes with the over-dispense penalty. When a color's quota hits zero, a heavy green "FILLED" stamp slams down over that script item in the header. It explicitly telegraphs the state change to the player.

7. Explicit Impact Feedback

Juice the collisions. The player should feel the game state without reading the UI.

Correct Hit: Chime audio, green particle puff, upward floating score text.

Wrong/Overfilled Hit: Harsh buzz, aggressive red particle burst, explicit screen shake, red flash on the UI bar.

8. Roguelike Elements (The "Shift" Run)

Linear levels become a continuous "Shift." Every 3 to 5 levels, the player enters the "Break Room" to draft one of three random upgrades.

Run-Long Relics (Passive Modifiers):

Prior Authorization: Start every level with 1 Pierce round active.

High Tolerance: Increases maximum Mis-dispense bar capacity by 25%.

Anti-Fatigue Mats: The floor gains elasticity. The first tablet to hit the floor each level bounces back into play instead of dying.

Over-the-Counter: Start every level with 1 Split round active.

Child-Proof Caps: Explosive red capsules require two hits to detonate instead of one.

Placebo Effect: Hitting white (neutral) capsules restores a small amount of tolerance.

Magnetized Mortar: Tablets passing within 10 pixels of a required quota color bend their trajectory slightly toward it.

Collateral Waiver: Explosions from red hazard pills destroy adjacent targets without triggering the over-dispense penalty.

Grace Period: The first wrong/red-color collision in every level drains zero tolerance.

Level-Long Consumables (Single-Use Buffs):

Laser Pointer: The dashed trajectory aiming line returns for this level only.

Alchemist's Vial: The first tablet fired this level acts as a Generic Substitution bomb on its first impact.

Safety Goggles: Red hazard explosions deal exactly half their normal tolerance damage.

Pill Crusher: Reduces the HP of all XR (2-hit) capsules to a standard 1-hit for the current board.

Vendor Rep: Generates three extra powerup capsules (Split/Pierce) spawn in the current board generation.

Flintstones Chewable: The first tablet fired immediately fragments into three standard tablets upon its first collision.

Copay Waiver: The over-dispense penalty is completely disabled for the current level.

9. Hazard Telegraphing

Red pills must look lethal.

Replace the center text with a vector skull-and-crossbones icon.

Apply a continuous, subtle pulsing red glow via a Phaser yoyo tween so they breathe on the board.

10. External Asset Referencing

Purge massive Base64 SVG strings from the engine code.

Move the spatula graphic to the root directory as spatula.svg.

Update the preloader: this.load.svg('spatula_tex', 'spatula.svg', { width: 40, height: 140 });.

11. Scoring System

Score evaluates efficiency and precision.

Increases Score: Filling a script (base points), consecutive correct hits (multiplier), unused tolerance at shift end, unused active powerups.

Decreases Score: Wasted shots (missing all targets), hitting a filled quota color (over-dispense penalty).

12. Red Hazard Rebalancing

Hazards are no longer run-ending. Red capsules remove exactly 25% of maximum tolerance on impact.

Iron Stomach (Relic): Reduces red capsule penalty to 10%.

Hazard Pay (Relic): Red pills grant a massive +500 score on hit, but still drain tolerance. Risk versus reward.

Controlled Demolition (Consumable): For one level, hitting a red pill destroys the entire row it sits on without draining tolerance.

13. Curriculum Pacing

Stagger the learning curve. Do not front-load the UI mechanics.

Level 1: Aiming basics. Single script objective. Standard colors only.

Level 2: Powerups, lives explained.

Level 3: Multi-color quotas introduced. The Over-dispense rule is explained.

Level 4: Red hazards introduced.

Level 5: The Break Room and "Pharmacy Powers" are introduced.

16. State Serialization (Save-Scum Prevention)

Save the random generation seed and run state in localStorage at the start of each level. If the player refreshes the browser to avoid losing a life, they load back into the exact same punishing board.

17. Tooltip Architecture

Players forget mechanics. Hovering over queued buffs or relics in the header UI displays a brief, plain-text reminder of their function.

18. Audio Control

Constant audio feedback gets grating. Add a global mute button to the header UI. Persist the toggle state in localStorage to respect the player's preference across shifts.

19. Axe the Recall Button

The manual recall button is a crutch for bad physics. We will remove the button from the UI entirely. Players must commit to their shots. Stalls will be handled implicitly by anti-loop logic in the physics engine.
