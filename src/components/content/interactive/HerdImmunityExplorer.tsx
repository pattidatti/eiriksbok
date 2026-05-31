import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Syringe, Play, RotateCcw, Activity } from 'lucide-react';

interface HerdImmunityExplorerProps {
    title?: string;
    gridSize?: number; // antall rader/kolonner (kvadratisk rutenett)
    stepMs?: number; // tid mellom hvert smittesteg
}

type Status = 'vaccinated' | 'healthy' | 'infected';

// Deterministisk "tilfeldig" rekkefølge basert på indeks (ingen Math.random).
// Sprer vaksinene jevnt utover rutenettet i stedet for i klumper.
function vaccinationOrder(total: number): number[] {
    const order: number[] = [];
    // Bruk et fast, irregulært steg (relativt primtall til total) for spredt mønster.
    const step = 23;
    let i = 0;
    const seen = new Set<number>();
    while (order.length < total) {
        const idx = (i * step) % total;
        if (!seen.has(idx)) {
            seen.add(idx);
            order.push(idx);
        }
        i++;
        // Sikkerhetsnett mot uendelig løkke
        if (i > total * step) break;
    }
    // Fyll inn eventuelt manglende indekser
    for (let k = 0; k < total; k++) {
        if (!seen.has(k)) order.push(k);
    }
    return order;
}

export function HerdImmunityExplorer({
    title = 'Test flokkimmunitet selv',
    gridSize = 8,
    stepMs = 280,
}: HerdImmunityExplorerProps) {
    const total = gridSize * gridSize;
    const [percent, setPercent] = useState(40);
    const [statuses, setStatuses] = useState<Status[]>(() => Array(total).fill('healthy'));
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Hvilke prikker er vaksinert ved gjeldende prosent (deterministisk).
    const order = useMemo(() => vaccinationOrder(total), [total]);
    const vaccinatedSet = useMemo(() => {
        const count = Math.round((percent / 100) * total);
        return new Set(order.slice(0, count));
    }, [order, percent, total]);

    // Naboindekser (opp/ned/venstre/høyre) i rutenettet.
    const neighbors = useCallback(
        (idx: number): number[] => {
            const row = Math.floor(idx / gridSize);
            const col = idx % gridSize;
            const out: number[] = [];
            if (row > 0) out.push(idx - gridSize);
            if (row < gridSize - 1) out.push(idx + gridSize);
            if (col > 0) out.push(idx - 1);
            if (col < gridSize - 1) out.push(idx + 1);
            return out;
        },
        [gridSize]
    );

    const stopTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => stopTimer, []);

    const reset = useCallback(() => {
        stopTimer();
        setRunning(false);
        setFinished(false);
        setStatuses(Array(total).fill('healthy'));
    }, [total]);

    // Tilbakestill smitten automatisk når brukeren endrer vaksinasjonsgraden.
    const handleSlider = (v: number) => {
        setPercent(v);
        if (running || finished) reset();
    };

    const startInfection = useCallback(() => {
        stopTimer();
        setFinished(false);
        // Startoppsett: alle vaksinerte er immune, resten friske.
        // Velg en fast, deterministisk startsmittet blant de uvaksinerte (midten av rutenettet).
        const base: Status[] = Array.from({ length: total }, (_, i) =>
            vaccinatedSet.has(i) ? 'vaccinated' : 'healthy'
        );
        const center = Math.floor(gridSize / 2) * gridSize + Math.floor(gridSize / 2);
        let patientZero = center;
        // Hvis senterprikken er vaksinert, finn nærmeste uvaksinerte i fast rekkefølge.
        if (base[patientZero] === 'vaccinated') {
            patientZero = order.find((i) => !vaccinatedSet.has(i)) ?? -1;
        }
        if (patientZero === -1) {
            // Alle er vaksinert: ingen kan bli syk.
            setStatuses(base);
            setRunning(false);
            setFinished(true);
            return;
        }
        base[patientZero] = 'infected';
        setStatuses(base);
        setRunning(true);

        const tick = () => {
            setStatuses((prev) => {
                const next = [...prev];
                let changed = false;
                prev.forEach((s, i) => {
                    if (s === 'infected') {
                        neighbors(i).forEach((n) => {
                            if (next[n] === 'healthy') {
                                next[n] = 'infected';
                                changed = true;
                            }
                        });
                    }
                });
                if (!changed) {
                    stopTimer();
                    setRunning(false);
                    setFinished(true);
                    return prev;
                }
                timerRef.current = setTimeout(tick, stepMs);
                return next;
            });
        };
        timerRef.current = setTimeout(tick, stepMs);
    }, [gridSize, neighbors, order, stepMs, total, vaccinatedSet]);

    const infectedCount = statuses.filter((s) => s === 'infected').length;
    const vaccinatedCount = vaccinatedSet.size;
    const healthyUnvaccinated = total - vaccinatedCount - infectedCount;
    // Hvor stor andel av de uvaksinerte ble skånet?
    const unvaccinatedTotal = total - vaccinatedCount;
    const protectedShare =
        unvaccinatedTotal > 0 ? Math.round((healthyUnvaccinated / unvaccinatedTotal) * 100) : 100;
    const herdReached = finished && percent >= 75 && protectedShare >= 60;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Syringe className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg hvor mange som er vaksinert, og start smitten. Ser du når flokken
                        beskytter seg selv?
                    </p>
                </div>
            </div>

            {/* Slider */}
            <div className="px-6 pt-5">
                <div className="flex items-center justify-between text-sm">
                    <label htmlFor="vax-slider" className="font-medium text-slate-700">
                        Andel vaksinert
                    </label>
                    <span className="text-xl font-bold text-indigo-600">{percent}%</span>
                </div>
                <input
                    id="vax-slider"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={percent}
                    onChange={(e) => handleSlider(Number(e.target.value))}
                    disabled={running}
                    className="mt-2 w-full accent-indigo-600 disabled:opacity-50"
                />
            </div>

            {/* Rutenett av personer */}
            <div className="px-6 py-6">
                <div
                    className="mx-auto grid w-fit gap-1.5 sm:gap-2"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                    {statuses.map((s, i) => {
                        const color =
                            s === 'vaccinated'
                                ? '#a7f3d0' // emerald-200
                                : s === 'infected'
                                  ? '#fca5a5' // red-300
                                  : '#e2e8f0'; // slate-200
                        return (
                            <motion.div
                                key={i}
                                className="h-6 w-6 rounded-full sm:h-7 sm:w-7"
                                animate={{
                                    backgroundColor: color,
                                    scale: s === 'infected' ? [1.25, 1] : 1,
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                            />
                        );
                    })}
                </div>

                {/* Forklaring av fargene */}
                <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-200" />
                        Vaksinert
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full bg-slate-200" />
                        Frisk og uvaksinert
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full bg-red-300" />
                        Smittet
                    </span>
                </div>
            </div>

            {/* Teller */}
            <div className="mx-6 mb-2 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <div className="text-lg font-bold text-emerald-600">{vaccinatedCount}</div>
                    <div className="text-xs text-slate-500">vaksinert</div>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <div className="text-lg font-bold text-red-500">{infectedCount}</div>
                    <div className="text-xs text-slate-500">smittet</div>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <div className="text-lg font-bold text-slate-700">{healthyUnvaccinated}</div>
                    <div className="text-xs text-slate-500">friske uten vaksine</div>
                </div>
            </div>

            {/* Innsiktsbanner */}
            <AnimatePresence mode="wait">
                {finished && (
                    <motion.div
                        key={herdReached ? 'herd' : 'spread'}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`mx-6 mb-3 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                            herdReached
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                    >
                        {herdReached ? (
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                            <Activity className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        {herdReached ? (
                            <span>
                                Når nok er vaksinert, stopper smitten - selv de uvaksinerte
                                beskyttes. Det kalles flokkimmunitet.
                            </span>
                        ) : (
                            <span>
                                Med lav vaksinasjon finner smitten alltid en ny kropp og sprer seg
                                videre. Skru opp andelen vaksinert og prøv igjen.
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between gap-3">
                <button
                    onClick={startInfection}
                    disabled={running}
                    className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Play className="h-4 w-4" />
                    {running ? 'Smitten sprer seg...' : 'Start smitte'}
                </button>
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
