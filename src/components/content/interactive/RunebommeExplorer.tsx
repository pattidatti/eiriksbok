import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drum, Sparkles, RotateCcw } from 'lucide-react';

interface Symbol {
    id: string;
    name: string;
    world: 'upper' | 'middle' | 'lower';
    glyph: string;
    meaning: string;
    x: number;
    y: number;
}

interface RunebommeExplorerProps {
    title?: string;
    instruction?: string;
}

const SYMBOLS: Symbol[] = [
    {
        id: 'beaivi',
        name: 'Beaivi (sola)',
        world: 'upper',
        glyph: '☀',
        meaning: 'Sola sto i sentrum av runebommen. Beaivi ga liv, varme og gode lavbeiter til reinen — uten henne ingen mat, ingen flokk, ingen folk.',
        x: 50,
        y: 18,
    },
    {
        id: 'horagalles',
        name: 'Horagalles (tordenguden)',
        world: 'upper',
        glyph: '⚡',
        meaning: 'Tordenguden holdt to hammere. Han slo lyn mot vetter som ville skade mennesker, og folk hilste på torden som et tegn på at han var i nærheten.',
        x: 78,
        y: 30,
    },
    {
        id: 'reinen',
        name: 'Reinen',
        world: 'middle',
        glyph: '🦌',
        meaning: 'Reinen var mat, klær, transport og rikdom på samme tid. På trommen sto den for alt liv i denne verden — det noaiden måtte beskytte.',
        x: 22,
        y: 52,
    },
    {
        id: 'lavvu',
        name: 'Lavvu og menneskene',
        world: 'middle',
        glyph: '⛺',
        meaning: 'Hjemmet og fellesskapet. Mange runebommer hadde tegninger av lavvuer og mennesker som sto rundt — for å vise hvem noaiden skulle hjelpe.',
        x: 78,
        y: 55,
    },
    {
        id: 'noaide',
        name: 'Noaiden',
        world: 'middle',
        glyph: '✦',
        meaning: 'Brua mellom verdenene. Når noaiden slo på trommen, "reiste" hen i ånd til de andre verdenene for å spørre om råd, finne syke sjeler eller forhandle med åndene.',
        x: 50,
        y: 50,
    },
    {
        id: 'jabmiidaibmu',
        name: 'Jábmiidáibmu (de dødes rike)',
        world: 'lower',
        glyph: '⌬',
        meaning: 'Underverdenen der forfedrene bodde. Den var ikke "helvete" — bare et annet sted der slekta levde videre, og noen ganger ga råd til de levende.',
        x: 50,
        y: 85,
    },
];

const WORLD_STYLES: Record<
    Symbol['world'],
    {
        label: string;
        active: string;
        ring: string;
        discovered: string;
        ringPulse: string;
    }
> = {
    upper: {
        label: 'Øvre verden',
        active: 'bg-amber-500 text-white ring-4 ring-amber-200',
        ring: 'ring-amber-200',
        discovered: 'bg-amber-100 text-amber-800 border border-amber-300',
        ringPulse: 'border-amber-400',
    },
    middle: {
        label: 'Denne verden',
        active: 'bg-emerald-500 text-white ring-4 ring-emerald-200',
        ring: 'ring-emerald-200',
        discovered: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        ringPulse: 'border-emerald-400',
    },
    lower: {
        label: 'Underverden',
        active: 'bg-indigo-500 text-white ring-4 ring-indigo-200',
        ring: 'ring-indigo-200',
        discovered: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
        ringPulse: 'border-indigo-400',
    },
};

export function RunebommeExplorer({
    title = 'Runebommen: et kart over verden',
    instruction = 'Klikk på symbolene for å oppdage hva noaiden så på trommen.',
}: RunebommeExplorerProps) {
    const [discovered, setDiscovered] = useState<Set<string>>(new Set());
    const [active, setActive] = useState<Symbol | null>(null);

    const handleClick = (sym: Symbol) => {
        setActive(sym);
        setDiscovered((prev) => new Set(prev).add(sym.id));
    };

    const handleReset = () => {
        setDiscovered(new Set());
        setActive(null);
    };

    const allFound = discovered.size === SYMBOLS.length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Drum className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{instruction}</p>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                    {discovered.size} / {SYMBOLS.length}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-amber-50 via-white to-indigo-50">
                {/* Drum surface */}
                <div className="relative aspect-square max-w-[360px] mx-auto w-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-100 via-amber-50 to-indigo-50 border-4 border-amber-800/30 shadow-inner" />

                    {/* World bands */}
                    <div className="absolute inset-x-4 top-[10%] h-[26%] rounded-t-full border-b border-dashed border-amber-700/40 flex items-start justify-center pt-1 pointer-events-none">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/70">
                            Øvre verden
                        </span>
                    </div>
                    <div className="absolute inset-x-4 top-[38%] h-[34%] border-b border-dashed border-emerald-700/40 flex items-start justify-center pt-1 pointer-events-none">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">
                            Denne verden
                        </span>
                    </div>
                    <div className="absolute inset-x-4 top-[72%] h-[24%] rounded-b-full flex items-start justify-center pt-1 pointer-events-none">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700/70">
                            Underverden
                        </span>
                    </div>

                    {/* Symbols */}
                    {SYMBOLS.map((sym) => {
                        const isDiscovered = discovered.has(sym.id);
                        const isActive = active?.id === sym.id;
                        const style = WORLD_STYLES[sym.world];
                        const buttonClass = isActive
                            ? style.active
                            : isDiscovered
                              ? style.discovered
                              : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400';
                        return (
                            <motion.button
                                key={sym.id}
                                onClick={() => handleClick(sym)}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-sm transition-colors ${buttonClass}`}
                                style={{ left: `${sym.x}%`, top: `${sym.y}%` }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={sym.name}
                            >
                                <span>{sym.glyph}</span>
                                {isActive && (
                                    <motion.span
                                        className={`absolute inset-0 rounded-full border-2 ${style.ringPulse}`}
                                        initial={{ scale: 1, opacity: 0.8 }}
                                        animate={{ scale: 1.8, opacity: 0 }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Detail panel */}
                <div className="flex flex-col">
                    <AnimatePresence mode="wait">
                        {active ? (
                            <motion.div
                                key={active.id}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1"
                            >
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    <span className="text-lg">{active.glyph}</span>
                                    <span>{WORLD_STYLES[active.world].label}</span>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                                    {active.name}
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {active.meaning}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 flex-1 flex flex-col items-center justify-center text-center"
                            >
                                <Sparkles className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">
                                    Velg et symbol på trommen.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Hver figur er en port mellom verdenene.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Insight zone */}
            <AnimatePresence>
                {allFound && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-5 py-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"
                    >
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Du har lest hele trommen.</p>
                                <p className="text-sm mt-1">
                                    Runebommen var ikke pynt. Den var et kart over hele
                                    virkeligheten: sola og tordenguden over deg, reinen og
                                    fellesskapet rundt deg, og slekta som hadde gått foran. Noaiden
                                    sto i midten og var brua mellom alt sammen.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control row */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
