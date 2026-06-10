import type { CinematicShot } from '../types';

// SequenceRunner: deklarativ tidslinje for cinematics/monologer/state-endringer.
// Erstatter skjøre, nestede engine.schedule()-kjeder. Kjøres via engine.playSequence(steps).
//
// Tidspunkt per steg: `at` = ms fra sekvensstart (absolutt, må være ikke-synkende),
// `after` = ms etter at FORRIGE steg ble ferdig. Angi maks én av dem; default er
// `after: 0` (rett etter forrige steg).
//
// VIKTIG skip-semantikk: ved handle.skip() droppes alle gjenstående ventetider,
// monologer og cinematics (de er presentasjon) - men gjenstående `do`-steg KJØRES
// fortsatt, i rekkefølge. `do`-steg bærer state (setFlag/setPhase/triggerEnd) og må
// alltid kjøre for at spillet skal ende i konsistent tilstand. Legg derfor visuell
// opprydding (f.eks. fadeFromBlack, flytte ut aktører) i `do`-steg.

export type SequenceStep =
    | { at?: number; after?: number; do: () => void | Promise<void> }
    | { at?: number; after?: number; monolog: string; wait?: boolean }
    | { at?: number; after?: number; cinematic: CinematicShot[]; wait?: boolean }
    | { at?: number; after?: number; waitMs: number }
    | { at?: number; after?: number; waitForMonologEnd: true };

export interface SequenceHandle {
    /** Dropp gjenstående ventetider/presentasjon; kjør gjenstående `do`-steg. */
    skip: () => void;
    /** Stopp alt - gjenstående steg kjøres IKKE. */
    cancel: () => void;
    /** Løses ved fullført, skip ELLER cancel. Rejecter aldri. */
    readonly done: Promise<void>;
}

// Avhengigheter injiseres slik at SequenceRunner ikke importerer GameEngine
// (unngår sirkulær import). GameEngine wirer dette i buildEngineRef().
export interface SequenceEnv {
    /** Som engine.schedule, men returnerer en kanseller-funksjon. */
    schedule: (fn: () => void, ms: number) => () => void;
    playMonolog: (id: string) => void;
    isMonologActive: () => boolean;
    waitForMonologEnd: () => Promise<void>;
    playCinematic: (shots: CinematicShot[]) => Promise<void>;
    isDisposed: () => boolean;
}

function validateSteps(steps: SequenceStep[]): void {
    let lastAt = 0;
    for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s.at !== undefined && s.after !== undefined) {
            throw new Error(`[SequenceRunner] Steg ${i}: angi enten 'at' eller 'after', ikke begge.`);
        }
        if (s.at !== undefined) {
            if (s.at < lastAt) {
                throw new Error(
                    `[SequenceRunner] Steg ${i}: 'at: ${s.at}' er tidligere enn forrige 'at: ${lastAt}'. ` +
                        `Steg med 'at' må være i ikke-synkende rekkefølge.`,
                );
            }
            lastAt = s.at;
        }
    }
}

export function runSequence(env: SequenceEnv, steps: SequenceStep[]): SequenceHandle {
    validateSteps(steps);

    let skipping = false;
    let cancelled = false;
    let releaseDelay: (() => void) | null = null;
    let resolveDone!: () => void;
    const done = new Promise<void>((resolve) => {
        resolveDone = resolve;
    });

    // Kansellerbar ventetid: løses tidlig ved skip/cancel/dispose.
    function delay(ms: number): Promise<void> {
        if (ms <= 0 || skipping || cancelled) return Promise.resolve();
        return new Promise<void>((resolve) => {
            const cancelTimeout = env.schedule(() => {
                releaseDelay = null;
                resolve();
            }, ms);
            releaseDelay = (): void => {
                cancelTimeout();
                releaseDelay = null;
                resolve();
            };
        });
    }

    async function run(): Promise<void> {
        const startTime = performance.now();
        for (const step of steps) {
            if (cancelled || env.isDisposed()) break;

            // Vent til stegets tidspunkt (med mindre vi skipper)
            if (!skipping) {
                const elapsed = performance.now() - startTime;
                const waitTime =
                    step.at !== undefined ? Math.max(0, step.at - elapsed) : (step.after ?? 0);
                await delay(waitTime);
                if (cancelled || env.isDisposed()) break;
            }

            if ('do' in step) {
                // Kjøres ALLTID (også under skip) - bærer state.
                await step.do();
            } else if (skipping) {
                continue; // presentasjonssteg droppes under skip
            } else if ('monolog' in step) {
                env.playMonolog(step.monolog);
                if (step.wait) {
                    // play() kan no-ope (ukjent id / once allerede sett) - da må vi
                    // ikke vente, ellers henger sekvensen på replays.
                    if (env.isMonologActive()) await env.waitForMonologEnd();
                }
            } else if ('cinematic' in step) {
                if (step.wait === false) {
                    void env.playCinematic(step.cinematic);
                } else {
                    await env.playCinematic(step.cinematic);
                }
            } else if ('waitMs' in step) {
                await delay(step.waitMs);
            } else if ('waitForMonologEnd' in step) {
                if (env.isMonologActive()) await env.waitForMonologEnd();
            }
        }
        resolveDone();
    }

    void run();

    return {
        skip: (): void => {
            if (cancelled || skipping) return;
            skipping = true;
            releaseDelay?.();
        },
        cancel: (): void => {
            if (cancelled) return;
            cancelled = true;
            releaseDelay?.();
        },
        done,
    };
}
