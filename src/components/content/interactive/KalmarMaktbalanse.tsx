import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Crown, RotateCcw, Sparkles } from 'lucide-react';

// Signaturkomponent for Kalmarunionen.
// Lyspære: På papiret var Kalmarunionen tre likeverdige riker - men i praksis lå
// nesten all makt i Danmark. Eleven gjetter hvor mye av makten Danmark hadde,
// og avsløringen viser ubalansen som til slutt sprengte unionen.

interface KalmarMaktbalanseProps {
    title?: string;
}

type Phase = 'guess' | 'revealed';

// Illustrasjon av hvor det reelle makttyngdepunktet lå (ikke nøyaktig statistikk).
const PRACTICE = { dk: 70, no: 11, se: 19 };

const KINGDOMS = [
    { id: 'dk' as const, name: 'Danmark', color: '#d24b54', note: 'Kongen styrte herfra' },
    { id: 'no' as const, name: 'Norge', color: '#5688c7', note: 'Svekket etter svartedauden' },
    { id: 'se' as const, name: 'Sverige', color: '#e0ad14', note: 'Gjorde stadig opprør' },
];

export function KalmarMaktbalanse({ title = 'Hvem hadde makten i unionen?' }: KalmarMaktbalanseProps) {
    const [phase, setPhase] = useState<Phase>('guess');
    const [guess, setGuess] = useState(33); // Danmarks andel av makten, i prosent

    // Andelene som vises i søylene.
    const shares =
        phase === 'revealed'
            ? PRACTICE
            : { dk: guess, no: (100 - guess) / 2, se: (100 - guess) / 2 };

    const handleReset = () => {
        setPhase('guess');
        setGuess(33);
    };

    const feedback =
        guess >= 60
            ? 'Godt sett! Du gjettet at Danmark satt med mesteparten av makten - og det stemmer.'
            : guess >= 40
              ? 'På rett spor, men Danmark hadde enda mer makt enn du gjettet.'
              : 'Tenk igjen: unionskongen bodde og styrte i Danmark, så makten lå tungt der.';

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <Scale className="h-5 w-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra glidebryteren: hvor mye av makten tror du lå i Danmark?
                    </p>
                </div>
            </div>

            {/* Interaksjonsflate */}
            <div className="px-6 py-5">
                {/* Søyler for de tre rikene */}
                <div className="space-y-3">
                    {KINGDOMS.map((k) => {
                        const pct = Math.round(shares[k.id]);
                        return (
                            <div key={k.id}>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                        <Crown className="h-3.5 w-3.5" style={{ color: k.color }} />
                                        {k.name}
                                    </span>
                                    <span className="tabular-nums font-bold text-slate-800">
                                        {pct}%
                                    </span>
                                </div>
                                <div className="relative h-6 overflow-hidden rounded-full bg-slate-100">
                                    {/* Referanselinje for "likeverdig" (33%) */}
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-slate-300"
                                        style={{ left: '33.33%' }}
                                    />
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: k.color }}
                                        animate={{ width: `${shares[k.id]}%` }}
                                        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Glidebryter (kun i gjette-fasen) */}
                {phase === 'guess' && (
                    <div className="mt-5">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={guess}
                            onChange={(e) => setGuess(Number(e.target.value))}
                            aria-label="Danmarks andel av makten"
                            className="w-full accent-rose-600"
                        />
                        <p className="mt-1 text-center text-xs text-slate-400">
                            Den tynne streken viser hvor søylen ville stått hvis alle tre rikene var
                            helt likeverdige.
                        </p>
                    </div>
                )}
            </div>

            {/* Feedback-sone - alltid i DOM-et */}
            <div className="px-6">
                <AnimatePresence mode="wait">
                    {phase === 'revealed' ? (
                        <motion.div
                            key="revealed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                            <p className="font-semibold">På papiret likeverdig - i praksis dansk.</p>
                            <p className="mt-1 leading-relaxed">
                                {feedback} Unionen skulle være tre likeverdige riker, men kongen og
                                hoffet satt i Danmark. Denne skjevheten skapte misnøye, og i 1523 rev
                                Sverige seg løs. Norge ble igjen som den svake parten under Danmark.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="guess"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
                        >
                            Sett glidebryteren der du tror Danmarks makt lå, og trykk «Avslør».
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="flex items-center justify-between px-6 pb-5 pt-4">
                {phase === 'guess' ? (
                    <button
                        onClick={() => setPhase('revealed')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                        <Sparkles className="h-4 w-4" />
                        Avslør hvordan det egentlig var
                    </button>
                ) : (
                    <span className="text-sm font-medium text-emerald-700">Makten lå i Danmark.</span>
                )}
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
