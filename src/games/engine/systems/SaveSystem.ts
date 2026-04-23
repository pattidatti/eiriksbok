import type { InventorySlot } from './InventorySystem';
import type { QuestState } from './QuestSystem';
import type { WeatherState } from '../types';

// Fase 5.2: save/load for mini-spill. Lagrer motorens tilstand i localStorage
// per `gameId`. Versjonert — framtidige schema-endringer returnerer null fra
// load() slik at spilleren starter friskt i stedet for å krasje.

export const SAVE_VERSION = 1;
const KEY_PREFIX = 'gravity-engine-save:';

export interface SerializedQuest {
    id: string;
    status: QuestState['status'];
    completedObjectives: string[];
}

export interface SerializedRoute {
    characterId: string;
    waypointIndex: number;
    direction: 1 | -1;
    pauseRemaining: number;
    completed: boolean;
}

export interface SerializedNpcPos {
    id: string;
    pos: [number, number, number];
    rotY: number;
}

export interface SaveData {
    version: number;
    gameId: string;
    savedAt: number;
    phase: string;
    flags: Record<string, unknown>;
    inventory: InventorySlot[];
    quests: SerializedQuest[];
    npcTalkedTo: string[];
    routes: SerializedRoute[];
    npcs: SerializedNpcPos[];
    player: { pos: [number, number, number]; yaw: number };
    timeOfDay: number;
    weather: WeatherState;
}

// Hooks som SaveSystem trenger for å samle/gjenopprette state uten å importere
// hele GameEngine (unngår sirkulær avhengighet og gjør enhetstesting enklere).
export interface SaveHooks {
    getPhase: () => string;
    setPhase: (p: string) => void;
    getFlags: () => Map<string, unknown>;
    setFlagsBulk: (entries: Record<string, unknown>) => void;
    serializeInventory: () => InventorySlot[];
    restoreInventory: (slots: InventorySlot[]) => void;
    serializeQuests: () => { quests: SerializedQuest[]; npcTalkedTo: string[] };
    restoreQuests: (data: { quests: SerializedQuest[]; npcTalkedTo: string[] }) => void;
    serializeRoutes: () => SerializedRoute[];
    restoreRoutes: (routes: SerializedRoute[]) => void;
    serializeNpcs: () => SerializedNpcPos[];
    restoreNpcs: (npcs: SerializedNpcPos[]) => void;
    getPlayerPose: () => { pos: [number, number, number]; yaw: number };
    setPlayerPose: (pos: [number, number, number], yaw: number) => void;
    getTimeOfDay: () => number;
    setTimeOfDay: (t: number) => void;
    getWeather: () => WeatherState;
    setWeather: (w: WeatherState) => void;
}

export class SaveSystem {
    private key: string;
    private hooks: SaveHooks;
    private gameId: string;
    // Koordinerer auto-save — interval-ID returneres til GameEngine som registrerer
    // den i scheduledIntervals så den ryddes ved dispose.
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private debouncedTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(gameId: string, hooks: SaveHooks) {
        this.gameId = gameId;
        this.key = KEY_PREFIX + gameId;
        this.hooks = hooks;
    }

    save(): boolean {
        try {
            const data = this.collect();
            localStorage.setItem(this.key, JSON.stringify(data));
            return true;
        } catch (err) {
            console.warn('[SaveSystem] kunne ikke lagre:', err);
            return false;
        }
    }

    load(): SaveData | null {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as SaveData;
            if (parsed.version !== SAVE_VERSION || parsed.gameId !== this.gameId) {
                console.info('[SaveSystem] ignorerer save med annen versjon/id:', parsed.version);
                return null;
            }
            return parsed;
        } catch (err) {
            console.warn('[SaveSystem] kunne ikke lese save:', err);
            return null;
        }
    }

    restore(): boolean {
        const data = this.load();
        if (!data) return false;
        this.hooks.setPhase(data.phase);
        this.hooks.setFlagsBulk(data.flags);
        this.hooks.restoreInventory(data.inventory);
        this.hooks.restoreQuests({ quests: data.quests, npcTalkedTo: data.npcTalkedTo });
        this.hooks.restoreRoutes(data.routes);
        this.hooks.restoreNpcs(data.npcs);
        this.hooks.setPlayerPose(data.player.pos, data.player.yaw);
        this.hooks.setTimeOfDay(data.timeOfDay);
        this.hooks.setWeather(data.weather);
        return true;
    }

    clear(): void {
        try {
            localStorage.removeItem(this.key);
        } catch {
            // ignore — privacy-mode eller manglende localStorage
        }
    }

    hasSave(): boolean {
        try {
            return localStorage.getItem(this.key) !== null;
        } catch {
            return false;
        }
    }

    getMeta(): { savedAt: number; phase: string } | null {
        const data = this.load();
        if (!data) return null;
        return { savedAt: data.savedAt, phase: data.phase };
    }

    /** Kalles fra setFlag/setPhase. Debouncer for å unngå skrive-storm. */
    requestSave(debounceMs = 2000): void {
        if (this.debouncedTimeout) clearTimeout(this.debouncedTimeout);
        this.debouncedTimeout = setTimeout(() => {
            this.debouncedTimeout = null;
            this.save();
        }, debounceMs);
    }

    /** Start auto-save og returner interval-ID så GameEngine kan rydde den ved dispose. */
    startAutoSave(intervalMs: number): ReturnType<typeof setInterval> {
        this.intervalId = setInterval(() => this.save(), intervalMs);
        return this.intervalId;
    }

    dispose(): void {
        if (this.debouncedTimeout) {
            clearTimeout(this.debouncedTimeout);
            this.debouncedTimeout = null;
        }
        // intervalId ryddes av GameEngine via scheduledIntervals.
        this.intervalId = null;
    }

    private collect(): SaveData {
        const quest = this.hooks.serializeQuests();
        return {
            version: SAVE_VERSION,
            gameId: this.gameId,
            savedAt: Date.now(),
            phase: this.hooks.getPhase(),
            flags: Object.fromEntries(this.hooks.getFlags()),
            inventory: this.hooks.serializeInventory(),
            quests: quest.quests,
            npcTalkedTo: quest.npcTalkedTo,
            routes: this.hooks.serializeRoutes(),
            npcs: this.hooks.serializeNpcs(),
            player: this.hooks.getPlayerPose(),
            timeOfDay: this.hooks.getTimeOfDay(),
            weather: this.hooks.getWeather(),
        };
    }
}
