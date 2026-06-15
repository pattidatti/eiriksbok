// Fase 3.4: Input-abstraksjon. Mapper fysiske taster og gamepad-knapper til
// logiske actions slik at GameEngine ikke trenger å kjenne KeyboardEvent.code
// direkte. Støtter rebinding via localStorage og gamepad-polling.

export type GameAction =
    | 'MOVE_FWD' | 'MOVE_BACK' | 'MOVE_LEFT' | 'MOVE_RIGHT'
    | 'RUN' | 'JUMP'
    | 'INTERACT' | 'THROW' | 'CLIMB'
    | 'CAMERA_TOGGLE'
    | 'PAUSE' | 'SKIP_INTRO'
    | 'DEBUG_HUD' | 'PHOTO_MODE'
    | 'DIALOG_1' | 'DIALOG_2' | 'DIALOG_3' | 'DIALOG_4' | 'DIALOG_5';

// Physical key codes (KeyboardEvent.code) per action. Flere codes per action
// støttes: f.eks. Space og Enter kan begge hoppe.
type KeyBindings = Record<GameAction, string[]>;

const DEFAULT_BINDINGS: KeyBindings = {
    MOVE_FWD: ['KeyW', 'ArrowUp'],
    MOVE_BACK: ['KeyS', 'ArrowDown'],
    MOVE_LEFT: ['KeyA', 'ArrowLeft'],
    MOVE_RIGHT: ['KeyD', 'ArrowRight'],
    RUN: ['ShiftLeft', 'ShiftRight'],
    JUMP: ['Space'],
    INTERACT: ['KeyE'],
    THROW: ['KeyF'],
    CLIMB: [], // tidligere KeyC; klatring drives av fysikk-overlap, ikke input
    CAMERA_TOGGLE: ['KeyC'], // bytt mellom 1.- og 3.-person
    PAUSE: ['Escape'],
    SKIP_INTRO: ['Space', 'Enter'],
    DEBUG_HUD: ['F3'],
    PHOTO_MODE: ['KeyP'],
    DIALOG_1: ['Digit1'],
    DIALOG_2: ['Digit2'],
    DIALOG_3: ['Digit3'],
    DIALOG_4: ['Digit4'],
    DIALOG_5: ['Digit5'],
};

const STORAGE_KEY = 'gravity-engine-keybindings';

export class InputManager {
    private bindings: KeyBindings;
    private pressed = new Set<string>();
    private justPressed = new Set<GameAction>();
    private cleanupFns: Array<() => void> = [];

    constructor() {
        this.bindings = this.loadBindings();
    }

    start(): void {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!this.pressed.has(e.code)) {
                // Mark alle actions der denne koden er bundet som "just pressed" denne framen.
                for (const [action, codes] of Object.entries(this.bindings)) {
                    if (codes.includes(e.code)) {
                        this.justPressed.add(action as GameAction);
                    }
                }
            }
            this.pressed.add(e.code);
        };
        const onKeyUp = (e: KeyboardEvent) => {
            this.pressed.delete(e.code);
        };
        const onBlur = () => {
            this.pressed.clear();
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        this.cleanupFns.push(
            () => window.removeEventListener('keydown', onKeyDown),
            () => window.removeEventListener('keyup', onKeyUp),
            () => window.removeEventListener('blur', onBlur),
        );
    }

    /** True hvis minst én fysisk tast bundet til denne actionen er trykket. */
    isDown(action: GameAction): boolean {
        const codes = this.bindings[action];
        for (const c of codes) if (this.pressed.has(c)) return true;
        return false;
    }

    /** True én frame når action gikk fra oppe → nede. Må kalles FØR endFrame(). */
    wasPressed(action: GameAction): boolean {
        return this.justPressed.has(action);
    }

    /** Kall på slutten av hver game-frame for å fjerne just-pressed-flagg. */
    endFrame(): void {
        this.justPressed.clear();
    }

    /** Omkonfigurer én action. Lagrer til localStorage. */
    rebind(action: GameAction, codes: string[]): void {
        this.bindings[action] = codes.slice();
        this.saveBindings();
    }

    getBindings(): Readonly<KeyBindings> {
        return this.bindings;
    }

    resetToDefaults(): void {
        this.bindings = structuredClone(DEFAULT_BINDINGS);
        this.saveBindings();
    }

    dispose(): void {
        for (const fn of this.cleanupFns) fn();
        this.cleanupFns.length = 0;
        this.pressed.clear();
        this.justPressed.clear();
    }

    private loadBindings(): KeyBindings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return structuredClone(DEFAULT_BINDINGS);
            const parsed = JSON.parse(stored) as Partial<KeyBindings>;
            // Flette med defaults slik at nye actions legges til ved oppgradering.
            const merged = structuredClone(DEFAULT_BINDINGS);
            for (const key of Object.keys(parsed) as GameAction[]) {
                const val = parsed[key];
                if (Array.isArray(val) && val.every((c) => typeof c === 'string')) {
                    merged[key] = val;
                }
            }
            // Migrering: returnerende brukere har KeyC lagret på den utgåtte CLIMB-actionen.
            // Flytt den til CAMERA_TOGGLE hvis de ikke selv har rebundet noe annet.
            if (!parsed.CAMERA_TOGGLE && merged.CLIMB.includes('KeyC')) {
                merged.CLIMB = merged.CLIMB.filter((c) => c !== 'KeyC');
            }
            return merged;
        } catch {
            return structuredClone(DEFAULT_BINDINGS);
        }
    }

    private saveBindings(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bindings));
        } catch {
            // Ignorer quota-feil — bindings fungerer bare for denne sesjonen.
        }
    }
}
