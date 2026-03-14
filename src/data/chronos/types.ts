export interface ChronosStat {
    id: string;
    label: string;
    icon: string; // lucide icon name
    value: number;
    max: number;
    category?: 'attribute' | 'relation';
}

export type ChronosItemContent =
    | {
          itemType: 'letter';
          from: string;
          to: string;
          date: string;
          body: string[];
      }
    | {
          itemType: 'object';
      };

export interface ChronosItem {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    content?: ChronosItemContent;
}

export interface ChronosConfig {
    stats: ChronosStat[];
    items?: ChronosItem[]; // Available items definitions
    recipes?: ChronosRecipe[]; // Available recipes
    theme?: {
        primaryColor: string;
        font?: string;
    };
}

export interface ChronosEffect {
    [statId: string]: number; // e.g. "discipline": 10
}

export interface ChronosCondition {
    // Stat-based condition
    statId?: string;
    operator?: '>' | '<' | '>=' | '<=' | '==';
    value?: number;
    // Prinsipp 1: Flag-based condition
    hasFlag?: string;
    lacksFlag?: string;
    // AND-logic: all sub-conditions must be met
    all?: ChronosCondition[];
}

export interface ChronosEnvironment {
    time: 'day' | 'night' | 'dawn' | 'dusk';
    weather: 'clear' | 'rain' | 'fog' | 'storm' | 'snow';
}

// Prinsipp 6: Ethics lens – three philosophical perspectives shown post-choice
export interface ChronosEthicsLens {
    deontological: string;    // Pliktetikk (Kant)
    consequentialist: string; // Konsekvensetikk (Utilitarisme)
    virtue: string;           // Dygdsetikk
}

export interface ChronosChoice {
    id: string;
    text: string;
    nextNodeId: string;
    effects?: ChronosEffect;
    condition?: ChronosCondition;
    // Inventory System
    checkInventory?: {
        hasItem?: string; // Requires this item to show/enable
        lacksItem?: string;
    };
    updateInventory?: {
        add?: string;
        remove?: string;
    };
    // Environment System
    updateEnvironment?: Partial<ChronosEnvironment>;
    // Prinsipp 1: Flag System – narrative memory
    setFlags?: string[];
    clearFlags?: string[];
    // Prinsipp 6: Ethics Lens
    ethicsLens?: ChronosEthicsLens;
    // Historical accuracy – used by EndComparisonScreen
    isHistoricalChoice?: boolean;
    historicalConsequence?: string;
}

export interface ChronosMapPoint {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label: string;
    icon?: string; // Lucide icon name
    nextNodeId: string;
    visitedFlag?: string; // Flag set when this sub-chain is completed
}

// Prinsipp 3: Discovery event – historical anchor shown when entering the node
export interface ChronosDiscoveryEvent {
    title: string;
    fact: string;
    articleLink?: string;
    reflectionQuestion?: string;
}

// Prinsipp 2: NPC tone – stat-driven dialogue variation
export interface ChronosNPCDialogue {
    statId: string;
    cold: string;    // Low relation value
    neutral: string; // Mid relation value
    warm: string;    // High relation value
    thresholds?: {
        coldBelow?: number; // % of max below which tone is cold (default 33)
        warmAbove?: number; // % of max above which tone is warm (default 66)
    };
}

// Prinsipp 5: Personalized epilogue entry, gated by narrative flags
export interface ChronosEpilogueEntry {
    hasFlag?: string;
    lacksFlag?: string;
    text: string;
}

// Prinsipp 5: Full epilogue block for end nodes
export interface ChronosEpilogue {
    entries: ChronosEpilogueEntry[];  // Flag-gated personalized lines
    historicalEcho: string;           // What actually happened historically
    reflectionQuestion: string;       // Open question for the class
}

export interface ChronosNode {
    id: string;
    text: string;
    choices: ChronosChoice[];
    speaker?: string;
    backgroundImage?: string;
    isEnd?: boolean;
    endType?: 'victory' | 'defeat';
    minigame?: ChronosMinigame;
    journalPrompt?: string; // If present, shows text area before choices
    showEndComparison?: boolean; // If true, EndComparisonScreen shown after epilogue

    // Map System
    uiType?: 'default' | 'map';
    mapConfig?: {
        image: string;
        points: ChronosMapPoint[];
    };

    // Prinsipp 3: Discovery Event
    discoveryEvent?: ChronosDiscoveryEvent;

    // Prinsipp 2: NPC Dialogue Tones
    npcDialogue?: ChronosNPCDialogue;

    // Prinsipp 5: Epilogue (for isEnd nodes)
    epilogue?: ChronosEpilogue;
}

export interface ChronosEntry {
    day: number;
    text: string;
    timestamp: number;
}

export interface ChronosGameOverCondition {
    statId: string;
    threshold: number;
    nodeId: string;
}

export interface ChronosPerspective {
    faction: 'sovjet' | 'usa' | 'sivil' | 'forteller';
    flag?: string;     // emoji-flagg, f.eks. "🇷🇺"
    subtitle?: string; // f.eks. "Generalsekretær, Sovjet"
}

export interface ChronosScenario {
    id: string;
    title: string;
    subtitle?: string;
    era: string;
    year: string;
    role: string;
    summary: string;
    heroImage?: string;
    config: ChronosConfig;
    nodes: {
        [nodeId: string]: ChronosNode;
    };
    startingNodeId: string;
    gameOverConditions?: ChronosGameOverCondition[];
    randomEvents?: string[]; // IDs of nodes that can be triggered randomly
    perspectives?: Record<string, ChronosPerspective>;
}

// Choice History – tracked in TimeTravelEngine for DecisionMapModal + EndComparisonScreen
export interface ChoiceHistoryEntry {
    nodeId: string;
    nodeText: string; // truncated for display
    choiceText: string;
    isHistorical: boolean;
    historicalChoiceText?: string; // the choice marked isHistoricalChoice at that node
    historicalConsequence?: string;
}

// Phase 9.1: Persistence Types
export interface ChronosRunLog {
    id: string;
    scenarioId: string;
    date: number;
    result: 'victory' | 'defeat' | 'retired';
    daysSurvived: number;
    score: number;
    endingNodeId: string;
}

export interface ChronosProfile {
    id: string; // "local_user" for now
    name: string;
    created: number;
    unlockedScenarios: string[];
    trophies: string[];
    graveyard: ChronosRunLog[];
    legacyItems: string[];
    totalRuns: number;
    totalWins: number;
}

// Phase 9.3: Advanced Mechanics
export interface ChronosRecipe {
    id: string;
    label: string;
    ingredients: string[]; // ['herb', 'linen']
    result: string; // 'bandage'
}

export interface ChronosBattleConfig {
    enemyName: string;
    enemyHealth: number;
    playerHealth: number;
    winNodeId: string;
    lossNodeId: string;
    moves: Array<{
        id: string;
        label: string;
        type: 'attack' | 'defend' | 'maneuver';
        counters: string[]; // Types this move beats (rock beats scissors)
    }>;
    statBonus?: {
        stat: string;
        threshold: number;
        bonusHP: number;
    };
}

export type ChronosMinigame =
    | {
        type: 'dice';
        config: {
            targetScore: number;
            wager?: number;
            winNodeId: string;
            lossNodeId: string;
        }
    }
    | { type: 'battle'; config: ChronosBattleConfig }
    | {
        type: 'justice';
        config: {
            onComplete: { nextNodeId: string };
            cases: Array<{
                id: string;
                title: string;
                description: string;
                accused: string;
                crime: string;
                options: {
                    mercy: { label: string; feedback: string; effects?: ChronosEffect };
                    harsh: { label: string; feedback: string; effects?: ChronosEffect };
                };
            }>;
        };
    }
    | {
        type: 'telegram';
        config: {
            onComplete: { nextNodeId: string };
            telegrams: Array<{
                id: string;
                from: string;
                preview: string;
                correctBucket: 'urgent' | 'wait';
            }>;
        };
    }
    | {
        type: 'allocation';
        config: {
            onComplete: { nextNodeId: string };
            totalPoints: number;
            categories: Array<{
                id: string;
                label: string;
                description: string;
            }>;
        };
    }
    | {
        type: 'crowd';
        config: {
            winNodeId: string;
            lossNodeId: string;
            timeLimit: number;
            fillRate: number;
            responses: Array<{
                id: string;
                label: string;
                description: string;
                pressureChange: number;
                cooldown?: number;
            }>;
        };
    }
    | {
        type: 'speech';
        config: {
            onComplete: { nextNodeId: string };
            columns: Array<{
                label: string;
                options: Array<{
                    id: string;
                    text: string;
                }>;
            }>;
            outcomes: Array<{
                combo: string;
                feedback: string;
                effects?: ChronosEffect;
                setsFlag?: string;
            }>;
        };
    }
    | {
        type: 'intrigue';
        config: {
            onComplete: { nextNodeId: string };
            tokens: number;
            characters: Array<{
                id: string;
                name: string;
                role: string;
                description: string;
                isTraitor: boolean;
                feedback: string;
            }>;
        };
    }
    | {
        type: 'triage';
        config: {
            onComplete: { nextNodeId: string };
            treatCapacity: number;
            patients: Array<{
                id: string;
                name: string;
                wound: string;
                age?: string;
                correctBucket: 'treat_now' | 'can_wait' | 'expectant';
            }>;
        };
    }
    | {
        type: 'censor';
        config: {
            onComplete: { nextNodeId: string };
            paragraphs: Array<{
                id: string;
                tokens: Array<
                    | { type: 'text'; content: string }
                    | { type: 'phrase'; id: string; text: string; shouldCensor: boolean; reason: string }
                >;
            }>;
        };
    }
    | {
        type: 'gasmask';
        config: {
            situation: string;
            timeLimit: number;
            options: Array<{
                id: string;
                text: string;
                requiresItem?: string;
                nextNodeId: string;
                effects?: ChronosEffect;
            }>;
            noMaskMessage: string;
            noMaskNextNodeId: string;
            noMaskEffects?: ChronosEffect;
            timeoutNextNodeId: string;
            timeoutEffects?: ChronosEffect;
        };
    }
    | {
        type: 'rationing';
        config: {
            onComplete: { nextNodeId: string };
            rations: number;
            soldiers: Array<{
                id: string;
                name: string;
                role: string;
                context: string;
                effects: {
                    ifGiven: ChronosEffect;
                    ifSkipped: ChronosEffect;
                };
            }>;
        };
    }
    | {
        type: 'signal';
        config: {
            winNodeId: string;
            lossNodeId: string;
            situation: string;
            options: Array<{
                id: string;
                label: string;
                isCorrect: boolean;
            }>;
            correctFeedback: string;
            incorrectFeedback: string;
        };
    }
    | {
        type: 'propaganda';
        config: {
            onComplete: { nextNodeId: string };
            outlet: string;
            outletType: 'soviet' | 'western';
            date: string;
            items: Array<{
                id: string;
                headline: string;
                realFacts: string;
                options: Array<{
                    id: string;
                    label: string;
                    description: string;
                    credibilityChange: number;
                    setsFlag?: string;
                    effects?: ChronosEffect;
                }>;
            }>;
        };
    }
    | {
        type: 'domino';
        config: {
            winNodeId: string;
            lossNodeId: string;
            budget: number;
            winThreshold: number;
            countries: Array<{
                id: string;
                name: string;
                region: string;
                pressureLevel: number;
                tileColor: string;
                actions: Array<{
                    id: string;
                    label: string;
                    cost: number;
                    successBonus: number;
                    backfireChance: number;
                    description: string;
                }>;
            }>;
        };
    };
