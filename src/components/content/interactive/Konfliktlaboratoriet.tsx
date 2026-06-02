import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Megaphone, Users, ShieldOff, Zap, Lightbulb, RotateCcw } from 'lucide-react';

// Signaturkomponent for "Konflikter - årsaker og konsekvenser".
// Lyspære: en konflikt skapes ikke av gnisten alene. Kruttet (de strukturelle
// spenningene) må ha bygget seg opp først. Gnisten utløser bare. Og forsterkere
// avgjør hvor langt brannen sprer seg. Vil du hindre krig, må du senke kruttet -
// ikke bare unngå gnister.

type Amp = 'allianse' | 'propaganda' | 'inget-organ';

interface AmpDef {
    id: Amp;
    label: string;
    blurb: string;
    Icon: React.ComponentType<{ className?: string }>;
}

const AMPS: AmpDef[] = [
    {
        id: 'allianse',
        label: 'Alliansesystem',
        blurb: 'Land er bundet til å hjelpe hverandre. En lokal krig drar raskt inn flere.',
        Icon: Users,
    },
    {
        id: 'propaganda',
        label: 'Propaganda og fiendebilde',
        blurb: 'Hat mot fienden gjør det mye vanskeligere å stoppe og forhandle fred.',
        Icon: Megaphone,
    },
    {
        id: 'inget-organ',
        label: 'Ingen som megler',
        blurb: 'Uten et organ som FN er det ingen til å roe partene ned.',
        Icon: ShieldOff,
    },
];

type Reach = 'fizzle' | 'lokal' | 'regional' | 'verden';

const REACH_TEXT: Record<Exclude<Reach, 'fizzle'>, { title: string; body: string; color: string }> = {
    lokal: {
        title: 'Lokal konflikt',
        body: 'Gnisten tente, men uten mange forsterkere ble det en avgrenset, lokal strid.',
        color: '#d97706',
    },
    regional: {
        title: 'Regional krig',
        body: 'Spenningene var dype, og forsterkerne dro nabolandene inn. Krigen vokste.',
        color: '#ea580c',
    },
    verden: {
        title: 'Storkrig',
        body: 'Mye krutt og sterke forsterkere: en liten gnist ble til en krig som spredte seg vidt - akkurat som i 1914.',
        color: '#dc2626',
    },
};

export const Konfliktlaboratoriet: React.FC = () => {
    const [krutt, setKrutt] = useState(20);
    const [amps, setAmps] = useState<Set<Amp>>(new Set());
    const [ignited, setIgnited] = useState(false);
    const [boom, setBoom] = useState(0); // teller for å trigge eksplosjonsanimasjon

    const ampCount = amps.size;

    // Konfliktrisiko bygger på kruttet (det viktigste) pluss forsterkerne.
    const risk = Math.min(100, Math.round(krutt * 0.75 + ampCount * 12));

    const reach: Reach = useMemo(() => {
        if (krutt < 35) return 'fizzle';
        if (krutt < 65) return ampCount >= 2 ? 'regional' : 'lokal';
        return ampCount >= 1 ? 'verden' : 'regional';
    }, [krutt, ampCount]);

    const toggleAmp = (id: Amp) => {
        if (ignited) return;
        setAmps((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const ignite = () => {
        setIgnited(true);
        if (reach !== 'fizzle') setBoom((b) => b + 1);
    };

    const reset = () => {
        setIgnited(false);
    };

    const riskColor = risk >= 65 ? '#dc2626' : risk >= 35 ? '#d97706' : '#16a34a';
    const exploded = ignited && reach !== 'fizzle';
    const ringColor = reach !== 'fizzle' ? REACH_TEXT[reach].color : '#d97706';

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <h3 className="font-display font-bold text-lg">Konfliktlaboratoriet</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Bygg opp spenningene, skru på forsterkerne og tenn gnisten. Se selv hva som
                    egentlig avgjør om en gnist dør ut eller blir til storkrig.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                {/* Venstre: scenen med tønna */}
                <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-orange-50/40 p-4 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-end">
                    {/* Eksplosjonsringer */}
                    <AnimatePresence>
                        {exploded && (
                            <div
                                key={boom}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="absolute rounded-full border-4"
                                        style={{ borderColor: ringColor }}
                                        initial={{ width: 40, height: 40, opacity: 0.8 }}
                                        animate={{
                                            width: 120 + i * 90 + ampCount * 40,
                                            height: 120 + i * 90 + ampCount * 40,
                                            opacity: 0,
                                        }}
                                        transition={{ duration: 1.1, delay: i * 0.12, ease: 'easeOut' }}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Tønna med krutt - rister ved eksplosjon */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center"
                        animate={
                            exploded
                                ? { x: [0, -6, 6, -4, 4, 0], y: [0, -3, 2, 0] }
                                : { x: 0, y: 0 }
                        }
                        transition={{ duration: 0.5 }}
                        key={`barrel-${boom}-${ignited}`}
                    >
                        {/* Lunte + gnist */}
                        <div className="relative h-10 w-full flex items-end justify-center mb-1">
                            <div className="h-8 w-1 bg-amber-800 rounded-full origin-bottom -rotate-12" />
                            <AnimatePresence>
                                {ignited && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                                        className="absolute -top-1 left-1/2"
                                    >
                                        <Zap
                                            className="w-6 h-6 -translate-x-1/2"
                                            style={{ color: reach === 'fizzle' ? '#94a3b8' : '#f59e0b' }}
                                            fill={reach === 'fizzle' ? '#cbd5e1' : '#fbbf24'}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Selve tønna */}
                        <div className="relative w-32 h-40 rounded-xl border-2 border-amber-900/70 bg-amber-100 overflow-hidden shadow-inner">
                            {/* krutt-fyll */}
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-800 to-slate-600"
                                initial={false}
                                animate={{ height: `${krutt}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                            >
                                <div
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(circle, #000 1px, transparent 1px)',
                                        backgroundSize: '7px 7px',
                                    }}
                                />
                            </motion.div>
                            {/* tønnebånd */}
                            <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-amber-900/40" />
                            <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-amber-900/40" />
                            <span className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wide text-amber-900/70">
                                Krutt
                            </span>
                        </div>
                        <span className="mt-2 text-xs font-semibold text-slate-500">
                            Strukturelle spenninger
                        </span>
                    </motion.div>

                    {/* Resultattekst nede til venstre */}
                    <div className="absolute top-3 left-3 right-3">
                        <AnimatePresence mode="wait">
                            {ignited ? (
                                <motion.div
                                    key={`res-${reach}`}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-lg bg-white/90 border border-slate-200 px-3 py-2 shadow-sm"
                                >
                                    {reach === 'fizzle' ? (
                                        <p className="text-sm font-bold text-green-700">
                                            Gnisten dør ut
                                        </p>
                                    ) : (
                                        <p
                                            className="text-sm font-extrabold"
                                            style={{ color: REACH_TEXT[reach].color }}
                                        >
                                            {REACH_TEXT[reach].title}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                                        {reach === 'fizzle'
                                            ? 'Uten oppbygde spenninger har gnisten ingenting å tenne på.'
                                            : REACH_TEXT[reach].body}
                                    </p>
                                </motion.div>
                            ) : krutt >= 65 ? (
                                <motion.div
                                    key="tense"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2"
                                >
                                    <p className="text-xs text-rose-800 leading-snug">
                                        Tønna er nesten full av krutt. Nå trengs det bare én gnist -
                                        når som helst.
                                    </p>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Høyre: kontrollene */}
                <div className="flex flex-col gap-3">
                    {/* Krutt-slider */}
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Strukturelle spenninger (kruttet)
                            </span>
                            <span className="text-xs font-bold text-slate-700">{krutt}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={krutt}
                            disabled={ignited}
                            onChange={(e) => setKrutt(Number(e.target.value))}
                            className="w-full mt-1 accent-slate-700 disabled:opacity-50"
                        />
                        <p className="text-[11px] text-slate-500 leading-snug">
                            Dype, langsiktige spenninger: ressurskamp, fattigdom, gamle grenser,
                            nasjonalisme. De bygger seg opp over tid.
                        </p>
                    </div>

                    {/* Forsterkere */}
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Forsterkere
                        </span>
                        <div className="mt-1.5 flex flex-col gap-1.5">
                            {AMPS.map((amp) => {
                                const active = amps.has(amp.id);
                                return (
                                    <button
                                        key={amp.id}
                                        onClick={() => toggleAmp(amp.id)}
                                        disabled={ignited}
                                        className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
                                            active
                                                ? 'border-orange-400 bg-orange-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <amp.Icon
                                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                active ? 'text-orange-600' : 'text-slate-400'
                                            }`}
                                        />
                                        <span>
                                            <span
                                                className={`block text-sm font-semibold ${
                                                    active ? 'text-orange-900' : 'text-slate-700'
                                                }`}
                                            >
                                                {amp.label}
                                            </span>
                                            <span className="block text-[11px] text-slate-500 leading-snug">
                                                {amp.blurb}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Risikomåler */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">Konfliktrisiko</span>
                            <span className="text-xs font-bold" style={{ color: riskColor }}>
                                {risk >= 65 ? 'Svært høy' : risk >= 35 ? 'Økende' : 'Lav'}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: riskColor }}
                                animate={{ width: `${risk}%` }}
                                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                            />
                        </div>
                    </div>

                    {/* Tenn / nullstill */}
                    {!ignited ? (
                        <button
                            onClick={ignite}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition active:scale-95"
                        >
                            <Zap className="w-4 h-4" />
                            Tenn gnisten
                        </button>
                    ) : (
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Still tilbake
                        </button>
                    )}
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-orange-50 border-t border-orange-100 px-5 py-3 text-sm text-orange-900">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
                <p>
                    Gnisten utløser bare. Det er kruttet - de strukturelle spenningene - som er den
                    egentlige årsaken, og forsterkerne avgjør hvor langt brannen sprer seg. Vil du
                    hindre krig, må du senke kruttet, ikke bare passe på at ingen tenner en gnist.
                </p>
            </div>
        </div>
    );
};
