import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, MapPin, Sparkles, RotateCcw } from 'lucide-react';

interface GullSaltVektenProps {
    title?: string;
}

// Lyspaere: salt og gull er de samme varene, men verdien snur helt om
// avhengig av HVOR du staar. Ved Middelhavet er salt billig og gull dyrt.
// Nede ved gullfeltene i soer er det motsatt: salt er saa sjeldent at det
// byttes mot nesten like mye gull. Derfor baerte handelsmenn salt soervover
// og gull nordover, og Mali laa midt paa veien og ble rikt paa aa styre den.

type PlaceId = 'nord' | 'sor';

interface Place {
    id: PlaceId;
    label: string;
    sub: string;
    // Hvor mange sekker salt du faar for EN klump gull her.
    saltPerGold: number;
    insight: string;
}

const PLACES: Record<PlaceId, Place> = {
    nord: {
        id: 'nord',
        label: 'Ved Middelhavet',
        sub: 'Nord-Afrika',
        saltPerGold: 8,
        insight: 'Her finnes det salt overalt fra havet. Salt er billig, og gull er sjeldent og dyrt. For én klump gull får du en hel haug med salt.',
    },
    sor: {
        id: 'sor',
        label: 'Ved gullfeltene',
        sub: 'Sør for Sahara',
        saltPerGold: 1,
        insight: 'Her er det gull i elvene, men nesten ingen salt. Folk svetter i heten og må ha salt for å leve. Salt blir like verdifullt som gull, vekt mot vekt.',
    },
};

export function GullSaltVekten({ title = 'Gull eller salt – hva er verdt mest?' }: GullSaltVektenProps) {
    const [place, setPlace] = useState<PlaceId>('nord');
    const [seen, setSeen] = useState<Set<PlaceId>>(new Set(['nord']));
    const [wobble, setWobble] = useState(0);

    const current = PLACES[place];
    const complete = seen.size === 2;

    const choose = (id: PlaceId) => {
        if (id === place) return;
        setPlace(id);
        setSeen((prev) => new Set(prev).add(id));
        setWobble((w) => w + 1);
    };

    const handleReset = () => {
        setPlace('nord');
        setSeen(new Set(['nord']));
        setWobble(0);
    };

    const saltBags = Array.from({ length: current.saltPerGold });

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-amber-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg et sted og se hvor mye salt du får for én klump gull.
                    </p>
                </div>
            </div>

            {/* Stedsvelger */}
            <div className="px-6 pt-5 flex gap-3">
                {(Object.values(PLACES) as Place[]).map((p) => {
                    const active = p.id === place;
                    return (
                        <button
                            key={p.id}
                            onClick={() => choose(p.id)}
                            className={`flex-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                                active
                                    ? 'bg-amber-50 border-amber-300 shadow-md'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm'
                            }`}
                        >
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                <MapPin className={`w-4 h-4 ${active ? 'text-amber-500' : 'text-slate-400'}`} />
                                {p.label}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">{p.sub}</span>
                        </button>
                    );
                })}
            </div>

            {/* Vekten */}
            <div className="px-6 py-6">
                <div className="relative bg-gradient-to-b from-amber-50 to-slate-50 rounded-xl border border-slate-100 p-5">
                    {/* Bjelken som vipper litt ved bytte og legger seg i balanse */}
                    <motion.div
                        key={wobble}
                        initial={{ rotate: place === 'sor' ? 3 : -3 }}
                        animate={{ rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 8 }}
                        className="relative mx-auto"
                        style={{ width: '100%', maxWidth: 460 }}
                    >
                        {/* Selve bjelken */}
                        <div className="h-2 bg-slate-400 rounded-full mx-6" />

                        <div className="flex justify-between items-start mt-1 px-2">
                            {/* Venstre skål: salt */}
                            <div className="flex flex-col items-center w-1/2">
                                <div className="w-px h-5 bg-slate-300" />
                                <div className="min-h-[72px] w-full flex flex-wrap justify-center items-end gap-1 rounded-lg bg-white/70 border border-slate-200 px-2 py-2">
                                    <AnimatePresence mode="popLayout">
                                        {saltBags.map((_, i) => (
                                            <motion.div
                                                key={`${place}-salt-${i}`}
                                                initial={{ scale: 0, y: -10, opacity: 0 }}
                                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 18 }}
                                                className="w-5 h-5 rounded-sm bg-white border-2 border-slate-300 shadow-sm"
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <span className="text-xs font-medium text-slate-600 mt-1.5">
                                    {current.saltPerGold} {current.saltPerGold === 1 ? 'sekk salt' : 'sekker salt'}
                                </span>
                            </div>

                            {/* Høyre skål: gull */}
                            <div className="flex flex-col items-center w-1/2">
                                <div className="w-px h-5 bg-slate-300" />
                                <div className="min-h-[72px] w-full flex justify-center items-end rounded-lg bg-white/70 border border-slate-200 px-2 py-2">
                                    <motion.div
                                        key={`${place}-gold`}
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                                        className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 shadow-md"
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-600 mt-1.5">1 klump gull</span>
                            </div>
                        </div>

                        {/* Fot */}
                        <div className="w-3 h-3 bg-slate-400 rounded-full mx-auto -mt-1" />
                        <div className="w-24 h-1.5 bg-slate-400 rounded-full mx-auto" />
                    </motion.div>
                </div>
            </div>

            {/* Feedback-sone (alltid synlig) */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={place}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm leading-snug"
                    >
                        <span className="font-semibold">{current.label}:</span> {current.insight}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Suksess naar begge steder er sett */}
            <AnimatePresence>
                {complete && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                    >
                        <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                            Nå ser du det: samme to varer, motsatt verdi. Salt er billig der det finnes,
                            men verdt sin vekt i gull der det mangler. Derfor bar handelsmenn salt sørover
                            og gull nordover – og Mali lå midt på veien og ble styrtrikt på å styre handelen.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    {complete ? 'Du har sett begge stedene.' : 'Sjekk det andre stedet også.'}
                </span>
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
