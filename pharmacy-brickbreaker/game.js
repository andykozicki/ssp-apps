/**
 * game.js - Pharmacy Breaker v0.3
 * Phase 3: The Engine
 */

// Simple procedural audio context to avoid external dependencies
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol = 0.1) {
    let settings = JSON.parse(localStorage.getItem('pharmacy_settings')) || { mute: false };
    if (settings.mute) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

class MainScene extends Phaser.Scene {
    constructor() { super({ key: 'MainScene' }); }

    preload() {
        this.generateAssets();
    }

    generateAssets() {
        // Tablet (Projectile)
        let g = this.make.graphics({x:0, y:0, add:false});
        g.fillStyle(0xf5f6fa, 1);
        g.fillCircle(8, 8, 8);
        g.lineStyle(2, 0x2d3436, 0.8);
        g.beginPath(); g.moveTo(2, 8); g.lineTo(14, 8); g.strokePath();
        g.generateTexture('tablet_tex', 16, 16);

        // Spatula
        g.clear();
        g.fillStyle(0x8b4513, 1);
        g.fillRoundedRect(0, 50, 16, 40, 8);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRoundedRect(4, 0, 8, 60, 4);
        g.generateTexture('spatula_tex', 16, 90);

        // Dynamic Pill Generator
        const drawPill = (key, colorHex, visualType) => {
            g.clear();
            
            if (visualType === 'rainbow_pill') {
                const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
                for (let i = 0; i < colors.length; i++) {
                    g.fillStyle(colors[i], 1);
                    g.fillRect((50/colors.length) * i, 0, Math.ceil(50/colors.length), 20);
                }
            } else {
                g.fillStyle(colorHex, 1);
                g.fillRoundedRect(0, 0, 50, 20, 10);
            }

            // Shine reflection
            g.fillStyle(0xffffff, 0.3);
            g.fillRoundedRect(4, 2, 42, 5, 2);

            // Stamped Text
            if (visualType && visualType.startsWith('stamped_')) {
                let text = visualType.split('_')[1];
                let tColor = colorHex === COLORS['White'] ? '#333' : '#fff';
                let t = this.make.text({ x: 25, y: 10, text: text, style: { fontSize: '10px', color: tColor, fontFamily: 'monospace', fontStyle: 'bold' }, add: false });
                t.setOrigin(0.5);
                g.fillStyle(0x000000, 0.5);
            }
            
            // Vector Hazard Skull
            if (visualType === 'red_volatile') {
                g.lineStyle(2, 0xffffff, 1);
                g.beginPath(); g.arc(25, 8, 4, 0, Math.PI*2); g.strokePath(); // Skull
                g.beginPath(); g.moveTo(18, 16); g.lineTo(32, 4); g.strokePath(); // Crossbone 1
                g.beginPath(); g.moveTo(18, 4); g.lineTo(32, 16); g.strokePath(); // Crossbone 2
            }
            
            // Vector 1-Up Cross
            if (visualType === 'green_cross') {
                g.fillStyle(0xffffff, 1);
                g.fillRect(22, 4, 6, 12);
                g.fillRect(19, 7, 12, 6);
            }

            g.generateTexture(key, 50, 20);
        };

        // Generate all schemas
        Object.keys(CAPSULE_SCHEMA).forEach(key => {
            let schema = CAPSULE_SCHEMA[key];
            let colorKey = Object.keys(COLORS).find(c => COLORS[c] === schema.color) || 'Blue'; 
            if(key === 'Explosive') drawPill(key, COLORS['Red'], schema.visual);
            else if(key === '1-Up') drawPill(key, COLORS['BrightGreen'], schema.visual);
            else if(key === 'Substitution') drawPill(key, COLORS['Rainbow'], schema.visual);
            else drawPill(key, COLORS['White'], schema.visual); // Placeholder, recolored via tint
        });

        // Generate base colors for standard scripts
        Object.entries(COLORS).forEach(([cName, cHex]) => {
            drawPill(cName, cHex, 'solid_color');
        });
    }

    create() {
        this.physics.world.setBounds(0, 0, 600, 750);
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.capsules = this.physics.add.staticGroup();
        this.tablets = this.physics.add.group();

        this.launcherOrigin = new Phaser.Math.Vector2(300, 690);
        this.spatula = this.add.sprite(this.launcherOrigin.x, this.launcherOrigin.y, 'spatula_tex').setOrigin(0.5, 1);

        this.floor = this.add.zone(300, 760, 600, 20);
        this.physics.add.existing(this.floor, true);

        // Particle systems for juice
        this.safeDust = this.add.particles(0, 0, 'tablet_tex', { speed: { min: 80, max: 200 }, scale: { start: 0.6, end: 0 }, lifespan: 250, emitting: false, tint: 0x00b894 });
        this.dangerDust = this.add.particles(0, 0, 'tablet_tex', { speed: { min: 150, max: 300 }, scale: { start: 0.8, end: 0 }, lifespan: 400, emitting: false, tint: 0xd63031 });

        // Trajectory graphics (Laser Pointer)
        this.trajectoryLine = this.add.graphics();

        this.physics.add.collider(this.tablets, this.capsules, this.onCollisionBounce, this.onCollisionProcess, this);
        this.physics.add.overlap(this.tablets, this.floor, this.onTabletLost, null, this);

        this.input.on('pointermove', this.updateAim, this);
        this.input.on('pointerup', this.fireTablet, this);

        this.hasBouncedThisLevel = false;

        this.handleSerialization();
    }

    handleSerialization() {
        let saved = localStorage.getItem('pharmacy_save');
        if (saved) {
            let data = JSON.parse(saved);
            if (data.inProgress) {
                // Abandonment Penalty
                gameState = data.state;
                gameState.lives--;
                if (gameState.lives <= 0) {
                    this.triggerGameOver();
                    return;
                } else {
                    this.showFloatText(300, 400, "SHIFT ABANDONED\n-1 LIFE", COLORS['Red']);
                    playTone(150, 'sawtooth', 0.5);
                }
            } else {
                gameState = data.state;
            }
        } else {
            resetState();
        }
        
        if(gameState.lives > 0) this.prepareLevelData(gameState.level);
    }

    saveState(inProgressFlag) {
        gameState.inProgress = inProgressFlag;
        localStorage.setItem('pharmacy_save', JSON.stringify({ state: gameState }));
    }

    prepareLevelData(levelNumber) {
        gameState.level = levelNumber;
        
        let baseTol = CONFIG.rules.baseTolerance - ((levelNumber - 1) * CONFIG.rules.toleranceDecayPerLevel);
        gameState.maxTolerance = Math.max(100, baseTol);
        if (gameState.activeRelics.includes("high_tolerance")) gameState.maxTolerance *= 1.25;
        
        gameState.currentTolerance = gameState.maxTolerance;
        
        // Narrative Generation
        let pName = Phaser.Math.RND.pick(LORE_DB.patients);
        let condition = Phaser.Math.RND.pick(LORE_DB.conditions);
        let targetCount = 10 + (levelNumber * 3);
        
        gameState.rxQuota = {};
        let standardColors = ['Blue', 'Green', 'Orange', 'Yellow'];
        let pColor = Phaser.Math.RND.pick(standardColors);
        gameState.rxQuota[pColor] = targetCount;
        
        if (levelNumber >= 3) {
            let sColor = Phaser.Math.RND.pick(standardColors.filter(c => c !== pColor));
            gameState.rxQuota[sColor] = Math.floor(targetCount / 2);
        }

        document.getElementById('rx-patient').innerText = `Pt: ${pName} (${condition})`;
        document.getElementById('briefing-title').innerText = `Take daily for ${condition}.`;
        
        this.saveState(true); // Flag active run
        
        // Break Room Check
        if (levelNumber > 1 && (levelNumber - 1) % 3 === 0 && !gameState.breakRoomShownThisLevel) {
            gameState.breakRoomShownThisLevel = true;
            this.showBreakRoom();
        } else {
            gameState.breakRoomShownThisLevel = false;
            switchOverlay('menu-level-briefing');
        }
    }

    renderLevelBoard() {
        this.capsules.clear(true, true);
        this.tablets.clear(true, true);
        
        gameState.activeTablets = 0;
        gameState.isAiming = true;
        this.hasBouncedThisLevel = false;

        // Relic & Consumable Setup
        if (gameState.activeRelics.includes("prior_auth")) gameState.activeRounds.pierce = 1;
        this.laserPointerActive = gameState.currentConsumable === "laser_pointer";
        this.alchemistActive = gameState.currentConsumable === "alchemists_vial";
        
        // Spawn Logic
        let positions = [];
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 9; c++) positions.push({r, c});
        }
        Phaser.Math.RND.shuffle(positions);

        let placed = {}; Object.keys(gameState.rxQuota).forEach(c => placed[c] = 0);

        positions.forEach(pos => {
            const x = 60 + pos.c * 60 + (pos.r % 2 === 0 ? 0 : 30);
            const y = 60 + pos.r * 30;
            
            let color = 'Blue', tex = 'Blue', typeKey = 'Standard';
            let needed = Object.keys(gameState.rxQuota).find(c => placed[c] < gameState.rxQuota[c]);
            
            if (needed) { color = needed; tex = color; placed[color]++; }
            else {
                let rand = Phaser.Math.RND.frac();
                if (rand < 0.1 && gameState.level >= 2) { typeKey = 'Pierce'; tex = 'Pierce'; color = 'Cyan'; }
                else if (rand < 0.2 && gameState.level >= 3) { typeKey = 'Splitter'; tex = 'Splitter'; color = 'Purple'; }
                else if (rand < 0.25) { typeKey = '1-Up'; tex = '1-Up'; color = 'BrightGreen'; }
                else if (rand < 0.3) { typeKey = 'Substitution'; tex = 'Substitution'; color = 'Rainbow'; }
                else if (rand < 0.4 && gameState.level >= 4) { typeKey = 'Explosive'; tex = 'Explosive'; color = 'Red'; }
                else { typeKey = 'Placebo'; tex = 'Placebo'; color = 'White'; }
            }

            let cap = this.capsules.create(x, y, tex);
            cap.schema = CAPSULE_SCHEMA[typeKey];
            cap.color = color;
            cap.hp = cap.schema.hp;
            cap.body.setSize(50, 20);
            
            if (typeKey === 'Explosive') {
                this.tweens.add({ targets: cap, alpha: 0.6, scaleX: 1.05, scaleY: 1.05, yoyo: true, repeat: -1, duration: 600 });
            }
        });

        this.updateUI();
    }

    updateAim(pointer) {
        if (!gameState.isAiming || gameState.activeTablets >= CONFIG.launcher.maxActiveTablets) {
            this.trajectoryLine.clear(); return;
        }

        let angle = Phaser.Math.Angle.Between(this.launcherOrigin.x, this.launcherOrigin.y, pointer.x, pointer.y);
        let angleDeg = Phaser.Math.RadToDeg(angle);

        const minD = -180 + CONFIG.launcher.minAngleDeg;
        const maxD = -CONFIG.launcher.minAngleDeg;
        
        if (angleDeg > maxD && angleDeg < 0) angleDeg = maxD;
        if (angleDeg < minD || angleDeg >= 0) angleDeg = minD;

        let angleRad = Phaser.Math.DegToRad(angleDeg);
        this.spatula.setRotation(angleRad + Math.PI/2); 

        // Laser Pointer Consumable
        this.trajectoryLine.clear();
        if (this.laserPointerActive) {
            this.trajectoryLine.lineStyle(2, 0xff0000, 0.5);
            this.trajectoryLine.beginPath();
            this.trajectoryLine.moveTo(this.launcherOrigin.x, this.launcherOrigin.y);
            let targetX = this.launcherOrigin.x + Math.cos(angleRad) * 800;
            let targetY = this.launcherOrigin.y + Math.sin(angleRad) * 800;
            this.trajectoryLine.lineTo(targetX, targetY);
            this.trajectoryLine.strokePath();
        }
    }

    fireTablet() {
        if (gameState.activeTablets >= CONFIG.launcher.maxActiveTablets) return;
        
        gameState.isAiming = false;
        this.trajectoryLine.clear();
        
        let angleRad = this.spatula.rotation - Math.PI/2;
        let tipX = this.launcherOrigin.x + Math.cos(angleRad) * 90;
        let tipY = this.launcherOrigin.y + Math.sin(angleRad) * 90;

        if (gameState.activeRounds.split === 0 && gameState.powerupQueue.split > 0) {
            gameState.powerupQueue.split--; gameState.activeRounds.split = 1; 
        }
        if (gameState.activeRounds.pierce === 0 && gameState.powerupQueue.pierce > 0) {
            gameState.powerupQueue.pierce--; gameState.activeRounds.pierce = 3; 
        }

        let isPiercing = gameState.activeRounds.pierce > 0;
        let isSplitting = gameState.activeRounds.split > 0;

        let t1 = this.spawnTablet(tipX, tipY, angleRad);
        gameState.activeTablets++;
        
        if (this.alchemistActive) {
            t1.setData('isSubstitutionBomb', true);
            t1.setTint(0xffa500);
            this.alchemistActive = false; // Single use
            gameState.currentConsumable = null;
        }

        if (isPiercing) { t1.setData('pierceCount', CONFIG.modifiers.strength.pierceLimit); t1.setTint(0x00ffff); }

        if (isSplitting) {
            let t2 = this.spawnTablet(tipX, tipY, angleRad + 0.15);
            let t3 = this.spawnTablet(tipX, tipY, angleRad - 0.15);
            gameState.activeTablets += 2;
            if (isPiercing) {
                t2.setData('pierceCount', CONFIG.modifiers.strength.pierceLimit); t2.setTint(0x00ffff);
                t3.setData('pierceCount', CONFIG.modifiers.strength.pierceLimit); t3.setTint(0x00ffff);
            }
            gameState.activeRounds.split--;
        }

        if (isPiercing) gameState.activeRounds.pierce--;
        this.updateUI();
    }

    spawnTablet(x, y, angleRad) {
        let t = this.tablets.create(x, y, 'tablet_tex');
        t.setCircle(8); t.setBounce(1); t.setFriction(0); t.setCollideWorldBounds(true);
        t.setData('pierceCount', 0); t.setData('combo', 0);
        this.physics.velocityFromRotation(angleRad, CONFIG.physics.baseVelocity, t.body.velocity);
        return t;
    }

    onTabletLost(floor, tablet) {
        // Anti-Fatigue Mats Logic
        if (gameState.activeRelics.includes("anti_fatigue_mats") && !this.hasBouncedThisLevel) {
            tablet.body.velocity.y *= -1.5; 
            this.hasBouncedThisLevel = true;
            this.showFloatText(tablet.x, tablet.y - 20, "MAT BOUNCE", COLORS['Yellow']);
            playTone(400, 'sine', 0.1);
            return;
        }

        tablet.destroy();
        gameState.activeTablets--;
        if (gameState.activeTablets <= 0) {
            gameState.isAiming = true;
            let pointer = this.input.activePointer;
            if (pointer.x > 0 && pointer.y > 0) this.updateAim(pointer);
        }
    }

    onCollisionProcess(tablet, capsule) {
        if (tablet.getData('pierceCount') > 0) {
            tablet.incData('pierceCount', -1);
            if (tablet.getData('pierceCount') <= 0) tablet.clearTint();
            this.damageCapsule(capsule, tablet);
            return false; 
        }
        return true; 
    }

    onCollisionBounce(tablet, capsule) {
        let v = tablet.body.velocity.clone(); 
        if (Math.abs(v.y) < 40) v.y += (v.y >= 0 ? 60 : -60); // Anti-loop
        v.scale(CONFIG.physics.velocityMultiplier);
        if (v.length() > CONFIG.physics.maxVelocity) v.normalize().scale(CONFIG.physics.maxVelocity);
        tablet.setVelocity(v.x, v.y);
        
        this.damageCapsule(capsule, tablet);
    }

    damageCapsule(capsule, tablet) {
        if (!capsule.active || capsule.isDying) return;

        // Generic Substitution Trigger
        if (tablet && tablet.getData('isSubstitutionBomb')) {
            this.triggerSubstitutionBlast(capsule.x, capsule.y, CONFIG.feedback.blastRadiusPx * 1.5);
            tablet.setData('isSubstitutionBomb', false);
            tablet.clearTint();
        }

        capsule.hp--;
        if (capsule.hp > 0) {
            capsule.setTint(0x7f8c8d);
            this.tweens.add({ targets: capsule, scaleX: 1.2, scaleY: 0.8, duration: 40, yoyo: true });
            return;
        }
        
        capsule.isDying = true; capsule.body.enable = false;

        this.tweens.add({ targets: capsule, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 100, onComplete: () => capsule.destroy() });

        const type = capsule.schema.type;
        const color = capsule.color;

        switch(type) {
            case "script":
                if (gameState.rxQuota[color] !== undefined && gameState.rxQuota[color] > 0) {
                    // Valid target hit
                    gameState.rxQuota[color]--;
                    gameState.score += 100;
                    this.safeDust.emitParticleAt(capsule.x, capsule.y, 10);
                    playTone(600, 'sine', 0.1);
                    
                    if (gameState.rxQuota[color] === 0) {
                        // Trigger Over-Dispense State
                        document.getElementById('rx-item-' + color).classList.add('rx-filled');
                        this.capsules.getChildren().forEach(cap => {
                            if (cap.color === color) cap.graceTimestamp = this.time.now + CONFIG.mechanics.gracePeriodMs;
                        });
                    }
                } else if (gameState.rxQuota[color] !== undefined && gameState.rxQuota[color] === 0) {
                    // Over-dispensed check
                    if (capsule.graceTimestamp && this.time.now <= capsule.graceTimestamp) {
                        // Within Grace Period - Safe destroy
                        gameState.score += 10; 
                        this.safeDust.emitParticleAt(capsule.x, capsule.y, 5);
                    } else {
                        // Penalty Trigger
                        this.triggerHazardPenalty(capsule.x, capsule.y, "OVER-DISPENSED");
                    }
                }
                break;
            case "hazard":
                this.triggerHazardPenalty(capsule.x, capsule.y, "HAZARD");
                this.destroyAdjacentCapsules(capsule.x, capsule.y, CONFIG.feedback.blastRadiusPx, tablet);
                break;
            case "powerup":
                if (capsule.schema.buff === 'life') {
                    gameState.lives++;
                    this.showFloatText(capsule.x, capsule.y, "1-UP", COLORS['BrightGreen']);
                    playTone(800, 'square', 0.2);
                } else if (capsule.schema.buff === 'transmute') {
                    this.triggerSubstitutionBlast(capsule.x, capsule.y, CONFIG.feedback.blastRadiusPx);
                } else {
                    gameState.powerupQueue[capsule.schema.buff] += 3;
                    this.showFloatText(capsule.x, capsule.y, "+3 " + capsule.schema.buff.toUpperCase(), COLORS[color]);
                    playTone(500, 'triangle', 0.1);
                }
                break;
        }

        this.updateUI();
        this.checkWinLossState();
    }

    triggerHazardPenalty(x, y, text) {
        gameState.currentTolerance -= (gameState.maxTolerance * CONFIG.hazards.maxToleranceDrainPct);
        this.cameras.main.shake(CONFIG.feedback.shakeDurationMs, CONFIG.feedback.shakeIntensityPx / 1000);
        this.dangerDust.emitParticleAt(x, y, 20);
        this.showFloatText(x, y, text, COLORS['Red']);
        playTone(150, 'sawtooth', 0.3);
    }

    triggerSubstitutionBlast(x, y, radius) {
        // Find most needed color
        let targetColor = null; let maxNeeded = -1;
        for (const [col, count] of Object.entries(gameState.rxQuota)) {
            if (count > maxNeeded) { maxNeeded = count; targetColor = col; }
        }
        if (!targetColor || maxNeeded <= 0) return; // Nothing needed

        let blast = new Phaser.Geom.Circle(x, y, radius);
        this.capsules.getChildren().forEach(cap => {
            if (cap.active && !cap.isDying && Phaser.Geom.Intersects.CircleToRectangle(blast, cap.getBounds())) {
                if (cap.schema.type === 'hazard' || (gameState.rxQuota[cap.color] === 0)) {
                    cap.color = targetColor;
                    cap.schema = CAPSULE_SCHEMA['Standard'];
                    cap.setTexture(targetColor);
                    cap.clearTint();
                    this.showFloatText(cap.x, cap.y, "TRANSMUTED", COLORS['Rainbow']);
                }
            }
        });
        playTone(900, 'sine', 0.4);
    }

    destroyAdjacentCapsules(x, y, radius, tablet) {
        let blast = new Phaser.Geom.Circle(x, y, radius);
        this.capsules.getChildren().forEach(cap => {
            if (cap.active && !cap.isDying && Phaser.Geom.Intersects.CircleToRectangle(blast, cap.getBounds())) {
                this.time.delayedCall(50, () => this.damageCapsule(cap, tablet)); 
            }
        });
    }

    showFloatText(x, y, text, colorHex) {
        let colorStr = '#' + colorHex.toString(16).padStart(6, '0');
        let ft = this.add.text(x, y, text, { fontSize: '18px', fontFamily: 'monospace', fontStyle: 'bold', color: colorStr, stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
        this.tweens.add({ targets: ft, y: y - 40, alpha: 0, duration: 1200, onComplete: () => ft.destroy() });
    }

    updateUI() {
        const rxList = document.getElementById('rx-list');
        rxList.innerHTML = '';
        
        for (const [color, count] of Object.entries(gameState.rxQuota)) {
            let div = document.createElement('div');
            div.className = 'rx-item';
            div.id = 'rx-item-' + color; // ID for targeting .rx-filled
            if (count <= 0) div.classList.add('rx-filled');
            
            let swatch = document.createElement('div');
            swatch.className = 'rx-color-swatch';
            swatch.style.backgroundColor = '#' + COLORS[color].toString(16).padStart(6, '0');
            
            let text = document.createElement('span');
            text.innerText = `${color}: ${Math.max(0, count)}`;
            
            div.appendChild(swatch); div.appendChild(text); rxList.appendChild(div);
        }

        let pct = Math.max(0, (gameState.currentTolerance / gameState.maxTolerance) * 100);
        let tolFill = document.getElementById('tolerance-bar-fill');
        tolFill.style.width = `${pct}%`;
        tolFill.style.background = pct > 50 ? 'var(--safe)' : (pct > 25 ? 'var(--warning)' : 'var(--danger)');

        document.getElementById('tolerance-text').innerText = `${Math.floor(gameState.currentTolerance)} / ${Math.floor(gameState.maxTolerance)}`;
        document.getElementById('active-split').innerText = gameState.powerupQueue.split;
        document.getElementById('active-pierce').innerText = gameState.powerupQueue.pierce;
        
        document.getElementById('hud-lives').innerText = gameState.lives;
        document.getElementById('hud-score').innerText = gameState.score.toString().padStart(5, '0');
    }

    checkWinLossState() {
        if (gameState.currentTolerance <= 0) {
            this.scene.pause();
            gameState.lives--;
            this.saveState(false); // End current run cleanly
            
            if (gameState.lives <= 0) this.triggerGameOver();
            else {
                // Restart level
                this.prepareLevelData(gameState.level);
                document.getElementById('btn-play').click(); 
            }
        } else {
            const remainingRx = Object.values(gameState.rxQuota).reduce((a, b) => a + Math.max(0, b), 0);
            if (remainingRx === 0) {
                this.physics.pause(); gameState.isAiming = false;
                this.saveState(false); // Safely completed
                
                gameState.score += Math.floor(gameState.currentTolerance); // Bonus
                this.updateUI();
                playTone(400, 'sine', 0.2); setTimeout(() => playTone(600, 'sine', 0.4), 200);

                this.time.delayedCall(1000, () => {
                    this.scene.pause();
                    switchOverlay('menu-win');
                });
            }
        }
    }

    triggerGameOver() {
        document.getElementById('stats-score').innerText = gameState.score;
        document.getElementById('stats-filled').innerText = gameState.level - 1;
        switchOverlay('menu-gameover');
    }

    showBreakRoom() {
        const container = document.getElementById('upgrade-cards');
        container.innerHTML = '';
        
        let pool = [...CONFIG.pool.relics, ...CONFIG.pool.consumables];
        Phaser.Math.RND.shuffle(pool);
        let options = pool.slice(0, 3);

        options.forEach(opt => {
            let card = document.createElement('div');
            card.className = 'upgrade-card';
            let isConsumable = CONFIG.pool.consumables.some(c => c.id === opt.id);
            
            card.innerHTML = `
                <div class="card-type ${isConsumable ? 'consumable' : ''}">${isConsumable ? 'Consumable' : 'Relic'}</div>
                <div class="card-title">${opt.name}</div>
                <div class="card-desc">${opt.desc}</div>
            `;
            
            card.onclick = () => {
                if (isConsumable) gameState.currentConsumable = opt.id;
                else gameState.activeRelics.push(opt.id);
                switchOverlay('menu-level-briefing');
            };
            container.appendChild(card);
        });
        
        switchOverlay('menu-breakroom');
    }
}

// Global UI Hookup
const gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 600, height: 750 },
    transparent: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: MainScene
};

const game = new Phaser.Game(gameConfig);

function switchOverlay(id) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    if (id) document.getElementById(id).classList.remove('hidden');
}

// Event Listeners
document.getElementById('btn-play').addEventListener('click', () => { switchOverlay('menu-level-briefing'); });

document.getElementById('btn-start-level').addEventListener('click', () => {
    switchOverlay(null);
    let scene = game.scene.getScene('MainScene');
    scene.physics.resume(); scene.renderLevelBoard();
});

document.getElementById('btn-skip-break').addEventListener('click', () => { switchOverlay('menu-level-briefing'); });

document.getElementById('btn-settings').addEventListener('click', () => switchOverlay('menu-settings'));
document.getElementById('btn-close-settings').addEventListener('click', () => switchOverlay('menu-start'));

document.getElementById('btn-retry').addEventListener('click', () => {
    resetState();
    let scene = game.scene.getScene('MainScene');
    scene.handleSerialization();
    document.getElementById('btn-play').click();
});

document.getElementById('btn-next').addEventListener('click', () => {
    let scene = game.scene.getScene('MainScene');
    scene.scene.resume();
    scene.prepareLevelData(gameState.level + 1);
});

document.getElementById('btn-pause-toggle').addEventListener('click', () => {
    game.scene.pause('MainScene'); switchOverlay('menu-pause');
});

document.getElementById('btn-resume').addEventListener('click', () => {
    switchOverlay(null); game.scene.resume('MainScene');
});

document.getElementById('btn-restart-run').addEventListener('click', () => {
    game.scene.resume('MainScene');
    resetState();
    let scene = game.scene.getScene('MainScene');
    scene.handleSerialization();
    switchOverlay('menu-start');
});
