import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle, TrendingDown } from 'lucide-react';
import { MiniGameHeader } from './MiniGameHeader';

interface DominoAction {
    id: string;
    label: string;
    cost: number;
    successBonus: number;
    backfireChance: number;
    description: string;
}

interface DominoCountry {
    id: string;
    name: string;
    region: string;
    pressureLevel: number; // 1–5: 1 = stabil, 5 = på randen
    tileColor: string;
    actions: DominoAction[];
}

interface DominoGameProps {
    config: {
        winNodeId: string;
        lossNodeId: string;
        budget: number;
        winThreshold: number;
        countries: DominoCountry[];
    };
    onComplete: (success: boolean) => void;
}

function resolveCountry(
    country: DominoCountry,
    action: DominoAction | null,
    cascadeBonus: number
): boolean {
    const effectivePressure = Math.min(5, country.pressureLevel + cascadeBonus);
    // Holdsannsynlighet: press 1 = 85%, press 5 = 25%
    let holdChance = 85 - (effectivePressure - 1) * 15;

    if (action) {
        const backfired = Math.random() * 100 < action.backfireChance;
        holdChance += backfired ? -25 : action.successBonus * 10;
    }

    holdChance = Math.max(5, Math.min(92, holdChance));
    return Math.random() * 100 < holdChance;
}

export const DominoGame: React.FC<DominoGameProps> = ({ config, onComplete }) => {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [allocations, setAllocations] = useState<Record<string, string | null>>(
        Object.fromEntries(config.countries.map((c) => [c.id, null]))
    );
    const [phase, setPhase] = useState<'allocation' | 'resolution' | 'result'>('allocation');
    const [results, setResults] = useState<boolean[]>([]);
    const [revealedUpTo, setRevealedUpTo] = useState(-1);
    const [cascadeBonuses, setCascadeBonuses] = useState<number[]>([]);

    const { countries, budget, winThreshold } = config;

    const totalSpent = Object.entries(allocations).reduce((sum, [cId, aId]) => {
        if (!aId) return sum;
        const c = countries.find((x) => x.id === cId);
        return sum + (c?.actions.find((a) => a.id === aId)?.cost ?? 0);
    }, 0);
    const remaining = budget - totalSpent;

    const selectedCountryData = countries.find((c) => c.id === selectedCountry);

    const handleSelectCountry = (id: string) => {
        if (phase !== 'allocation') return;
        setSelectedCountry((prev) => (prev === id ? null : id));
    };

    const handleSelectAction = (countryId: string, actionId: string | null) => {
        if (phase !== 'allocation') return;
        const c = countries.find((x) => x.id === countryId);
        const currentId = allocations[countryId];
        const currentCost = currentId ? (c?.actions.find((a) => a.id === currentId)?.cost ?? 0) : 0;
        const newCost = actionId ? (c?.actions.find((a) => a.id === actionId)?.cost ?? 0) : 0;
        if (newCost - currentCost > remaining) return;
        setAllocations((prev) => ({ ...prev, [countryId]: actionId }));
    };

    const handleExecute = () => {
        // Pre-compute all outcomes with cascade
        const cascade = new Array(countries.length).fill(0);
        const computedResults: boolean[] = [];

        for (let i = 0; i < countries.length; i++) {
            const country = countries[i];
            const actionId = allocations[country.id];
            const action = country.actions.find((a) => a.id === actionId) ?? null;
            const held = resolveCountry(country, action, cascade[i]);
            computedResults.push(held);
            if (!held && i + 1 < countries.length) {
                cascade[i + 1] = (cascade[i + 1] ?? 0) + 1;
            }
        }

        setResults(computedResults);
        setCascadeBonuses([...cascade]);
        setPhase('resolution');
        setSelectedCountry(null);

        // Reveal one by one
        computedResults.forEach((_, i) => {
            setTimeout(() => {
                setRevealedUpTo(i);
                if (i === computedResults.length - 1) {
                    setTimeout(() => setPhase('result'), 900);
                }
            }, (i + 1) * 1100);
        });
    };

    const heldCount = results.filter(Boolean).length;
    const success = phase === 'result' && heldCount >= winThreshold;

    /* ── Tile component ─────────────────────────────────────────────── */
    const CountryTile = ({
        country,
        index,
    }: {
        country: DominoCountry;
        index: number;
    }) => {
        const actionId = allocations[country.id];
        const action = country.actions.find((a) => a.id === actionId);
        const isSelected = selectedCountry === country.id && phase === 'allocation';
        const isRevealed = revealedUpTo >= index;
        const held = results[index];
        const cascade = cascadeBonuses[index] ?? 0;
        const effectivePressure = Math.min(5, country.pressureLevel + cascade);

        const tileAnimate =
            isRevealed
                ? held
                    ? { scale: [1, 1.06, 1], transition: { duration: 0.5 } }
                    : { rotate: [0, -4, 12, -2, 8, 0], transition: { duration: 0.7 } }
                : {};

        return (
            <motion.button
                animate={tileAnimate}
                onClick={() => handleSelectCountry(country.id)}
                className={`flex-1 rounded-2xl overflow-hidden border-2 transition-all ${
                    phase === 'allocation'
                        ? isSelected
                            ? 'border-blue-400 shadow-md shadow-blue-100'
                            : 'border-stone-200 hover:border-stone-300 active:scale-95'
                        : isRevealed
                          ? held
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-red-400 bg-red-50'
                          : 'border-stone-200'
                }`}
            >
                {/* Color strip */}
                <div className="h-1.5" style={{ backgroundColor: country.tileColor }} />

                <div className="p-2 bg-white flex flex-col items-center gap-1">
                    <p className="text-[10px] font-bold text-stone-700 text-center leading-tight truncate w-full">
                        {country.name}
                    </p>

                    {/* Pressure dots */}
                    <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, j) => (
                            <div
                                key={j}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    j < effectivePressure ? 'bg-red-500' : 'bg-stone-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Cascade warning */}
                    {cascade > 0 && phase !== 'allocation' && (
                        <span className="text-[8px] font-black text-red-500">+{cascade}</span>
                    )}

                    {/* Action or result */}
                    {phase === 'allocation' ? (
                        <p
                            className={`text-[9px] text-center leading-tight font-semibold ${
                                action ? 'text-blue-600' : 'text-stone-400'
                            }`}
                        >
                            {action ? action.label : '—'}
                        </p>
                    ) : isRevealed ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            {held ? (
                                <CheckCircle size={13} className="text-emerald-500" />
                            ) : (
                                <TrendingDown size={13} className="text-red-500" />
                            )}
                        </motion.div>
                    ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
                    )}
                </div>
            </motion.button>
        );
    };

    /* ── Render ─────────────────────────────────────────────────────── */
    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <MiniGameHeader
                icon={Shield}
                title="Innflytelsesstrategi"
                badge={
                    <span className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-mono">Budsjett:</span>
                        <span
                            className={`text-xs font-black font-mono ${
                                remaining === 0 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                        >
                            {remaining}/{budget}
                        </span>
                    </span>
                }
            />

            {/* Domino theory note */}
            {phase === 'allocation' && (
                <p className="text-[10px] text-stone-400 text-center px-4 pt-2 pb-1 italic">
                    Faller ett land til kommunismen, økes presset på nabolandene — dominoeffekten.
                </p>
            )}

            {/* Country tiles */}
            <div className="px-3 pt-2 pb-1">
                <div className="flex items-center gap-1.5">
                    {countries.map((country, i) => (
                        <React.Fragment key={country.id}>
                            <CountryTile country={country} index={i} />
                            {i < countries.length - 1 && (
                                <ChevronRight
                                    size={11}
                                    className={`flex-shrink-0 transition-colors ${
                                        phase !== 'allocation' &&
                                        revealedUpTo >= i &&
                                        !results[i]
                                            ? 'text-red-400'
                                            : 'text-stone-300'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Action panel */}
            <AnimatePresence>
                {phase === 'allocation' && selectedCountryData && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-3 mb-2 rounded-2xl bg-white border border-stone-200 overflow-hidden">
                            <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                                    Tiltak i {selectedCountryData.name}
                                </p>
                            </div>
                            <div className="p-2 space-y-1.5">
                                {/* No action */}
                                <button
                                    onClick={() =>
                                        handleSelectAction(selectedCountryData.id, null)
                                    }
                                    className={`w-full py-2 px-2.5 text-left rounded-xl border-2 transition-all ${
                                        allocations[selectedCountryData.id] === null
                                            ? 'border-stone-400 bg-stone-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                    }`}
                                >
                                    <p className="text-xs font-bold text-stone-600">Ingen tiltak</p>
                                    <p className="text-[10px] text-stone-400">Ingen kostnad</p>
                                </button>

                                {selectedCountryData.actions.map((action) => {
                                    const currentId = allocations[selectedCountryData.id];
                                    const currentCost = currentId
                                        ? (selectedCountryData.actions.find(
                                              (a) => a.id === currentId
                                          )?.cost ?? 0)
                                        : 0;
                                    const canAfford =
                                        action.cost - currentCost <= remaining;
                                    const isChosen =
                                        allocations[selectedCountryData.id] === action.id;

                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() =>
                                                (canAfford || isChosen) &&
                                                handleSelectAction(
                                                    selectedCountryData.id,
                                                    isChosen ? null : action.id
                                                )
                                            }
                                            disabled={!canAfford && !isChosen}
                                            className={`w-full py-2 px-2.5 text-left rounded-xl border-2 transition-all ${
                                                isChosen
                                                    ? 'border-blue-400 bg-blue-50'
                                                    : canAfford
                                                      ? 'border-stone-200 hover:border-stone-300'
                                                      : 'border-stone-100 opacity-40 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-stone-800">
                                                    {action.label}
                                                </p>
                                                <span className="text-[10px] font-black text-stone-500 ml-2 flex-shrink-0">
                                                    {action.cost}p
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                                                {action.description}
                                            </p>
                                            {action.backfireChance > 0 && (
                                                <p className="text-[9px] text-amber-600 mt-0.5 font-semibold">
                                                    {action.backfireChance}% risiko for bakslag
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Execute / status / result */}
            <div className="px-3 pb-3">
                {phase === 'allocation' && (
                    <>
                        <button
                            onClick={handleExecute}
                            className="w-full py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors"
                        >
                            Gjennomfør intervensjon
                        </button>
                        <p className="text-center text-[10px] text-stone-400 mt-1.5">
                            {winThreshold} av {countries.length} land må holde
                        </p>
                    </>
                )}

                {phase === 'resolution' && (
                    <p className="text-center text-xs text-stone-500 py-2 font-medium animate-pulse">
                        Situasjonen utspiller seg...
                    </p>
                )}

                {phase === 'result' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div
                            className={`rounded-2xl p-3 mb-3 text-center border-2 ${
                                success
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-rose-50 border-rose-200'
                            }`}
                        >
                            <p
                                className={`text-base font-black ${
                                    success ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                            >
                                {heldCount} av {countries.length} land holdt
                            </p>
                            <p
                                className={`text-xs mt-1 ${
                                    success ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                            >
                                {success
                                    ? 'Innflytelsesoperasjonen lyktes'
                                    : 'Dominoeffekten inntraff'}
                            </p>
                        </div>
                        <button
                            onClick={() => onComplete(success)}
                            className="w-full py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors"
                        >
                            Se konsekvensene
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

