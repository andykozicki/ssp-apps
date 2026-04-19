/**
 * config.js - Pharmacy Breaker v0.3
 * Phase 1: The Brain
 */

const CONFIG = {
    physics: {
        baseVelocity: 550,
        maxVelocity: 950,
        velocityMultiplier: 1.03,
        hitboxRadius: 8
    },
    launcher: {
        minAngleDeg: 15,
        maxActiveTablets: 1
    },
    rules: {
        baseTolerance: 500,
        toleranceDecayPerLevel: 50,
        wrongColorPenalty: 35
    },
    modifiers: {
        strength: {
            splitCount: 3,
            pierceLimit: 2
        }
    },
    hazards: {
        maxToleranceDrainPct: 0.25 
    },
    mechanics: {
        gracePeriodMs: 1000 
    },
    feedback: {
        shakeIntensityPx: 5,
        shakeDurationMs: 100,
        blastRadiusPx: 120
    },
    pool: {
        relics: [
            { id: "prior_auth", name: "Prior Authorization", desc: "Start every level with 1 Pierce round active." },
            { id: "high_tolerance", name: "High Tolerance", desc: "Increases maximum Mis-dispense bar capacity by 25%." },
            { id: "anti_fatigue_mats", name: "Anti-Fatigue Mats", desc: "The first tablet to hit the floor each level bounces back into play." }
        ],
        consumables: [
            { id: "laser_pointer", name: "Laser Pointer", desc: "The dashed trajectory aiming line returns for this level only." },
            { id: "alchemists_vial", name: "Alchemist's Vial", desc: "The first tablet fired this level acts as a Generic Substitution bomb." }
        ]
    }
};

const LORE_DB = {
    patients: [
        "John Doe", 
        "Jane Smith", 
        "Alan Turing", 
        "Ada Lovelace", 
        "Grace Hopper",
        "Richard Roe"
    ],
    conditions: [
        "Acute Pixelitis", 
        "Restless Cursor Syndrome", 
        "Carpal Tunnel Variance",
        "Chronic Refresh Fatigue",
        "Elevated Ping Rate",
        "Tab Hoarding Disorder"
    ],
    tutorials: {
        1: "Drag to aim. Fill the script. Avoid off-label colors.",
        2: "Cyan capsules grant Pierce. Tablets punch through targets.",
        3: "Purple capsules grant Split. Three for the price of one.",
        5: "Red means volatile. Keep your distance."
    }
};

const FREQUENCY_MAP = {
    1: "once",
    2: "twice",
    3: "three times",
    4: "four times"
};

const COLORS = {
    'Blue': 0x0984e3, 
    'Green': 0x00b894, 
    'Orange': 0xe17055, 
    'Yellow': 0xfdcb6e,
    'Pink': 0xfd79a8, 
    'Red': 0xd63031, 
    'White': 0xffffff,
    'Purple': 0xa29bfe, 
    'Cyan': 0x00cec9,
    'Rainbow': 0xffa500, 
    'BrightGreen': 0x00ff00 
};

const CAPSULE_SCHEMA = {
    "Standard":     { hp: 1, type: "script", visual: "solid_color" },
    "XR":           { hp: 2, type: "script", visual: "stamped_XR" },
    "Explosive":    { hp: 1, type: "hazard", visual: "red_volatile" },
    "Placebo":      { hp: 1, type: "neutral", visual: "stamped_PLACEBO" },
    "Splitter":     { hp: 1, type: "powerup", buff: "split", visual: "stamped_SPLIT" },
    "Pierce":       { hp: 1, type: "powerup", buff: "pierce", visual: "stamped_PIERCE" },
    "1-Up":         { hp: 1, type: "powerup", buff: "life", visual: "green_cross" },
    "Substitution": { hp: 1, type: "powerup", buff: "transmute", visual: "rainbow_pill" } 
};

let gameState = {};

function resetState() {
    gameState = {
        level: 1,
        currentTolerance: 0,
        maxTolerance: 0,
        rxQuota: {},
        isAiming: true,
        activeTablets: 0,
        powerupQueue: { split: 0, pierce: 0 },
        activeRounds: { split: 0, pierce: 0 },
        lives: 3, 
        score: 0, 
        activeRelics: [], 
        currentConsumable: null, 
        inProgress: false 
    };
}

resetState();
