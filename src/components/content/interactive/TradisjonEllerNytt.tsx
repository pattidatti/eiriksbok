import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';

interface Eksempel {
    tekst: string;
    riktig: 'tradisjon' | 'fornyelse' | 'begge';
    forklaring: string;
}

interface TradisjonEllerNyttProps {
    title?: string;
    eksempler?: Eksempel[];
}

const STANDARD_EKSEMPLER: Eksempel[] = [
    {
        tekst: 'Mari Boine synger samisk joik med elektrisk gitar og trommer.',
        riktig: 'begge',
        forklaring:
            'Joik-tradisjonen er kjernen, men instrumentene og produksjonen er moderne. Hun bygger bro mellom gammelt og nytt.',
    },
    {
        tekst: 'Edvard Grieg bruker norske folkemeloider i symfonier for fullt orkester.',
        riktig: 'begge',
        forklaring:
            'Melodiene er tradisjonell folkemusikk, men formen (symfoni) er klassisk europeisk. Grieg vevde det norske inn i noe nytt.',
    },
    {
        tekst: 'En gammel spellemann lærer barnebarnet sitt å spille slåtter på hardingfele, tone for tone.',
        riktig: 'tradisjon',
        forklaring:
            'Ren overlevering fra generasjon til generasjon. Slik har norsk folkemusikk overlevd i hundrevis av år.',
    },
    {
        tekst: 'Wardruna spiller inn musikk med norrøne instrumenter som bukkehorn og langeleik.',
        riktig: 'begge',
        forklaring:
            'Instrumentene er gamle, men komposisjonene er nye. De gjenskaper ikke historisk musikk, de lager noe nytt med gamle verktøy.',
    },
    {
        tekst: 'En DJ sampler en gammel blues-innspilling i en ny hip-hop-låt.',
        riktig: 'begge',
        forklaring:
            'Blues-tradisjonen lever videre gjennom sampling, men konteksten er helt ny. Slik har hip-hop alltid fungert — bygge nytt på gammelt.',
    },
    {
        tekst: 'Kraftwerk lager musikk kun med elektroniske maskiner, uten akustiske instrumenter.',
        riktig: 'fornyelse',
        forklaring:
            'Her er det lite tradisjon å peke på. Kraftwerk skapte en helt ny musikkform som ble grunnlaget for all elektronisk musikk etterpå.',
    },
];

const VALG_FARGER = {
    tradisjon: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', hover: 'hover:bg-amber-50' },
    fornyelse: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', hover: 'hover:bg-indigo-50' },
    begge: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', hover: 'hover:bg-emerald-50' },
};

const VALG_LABEL: Record<string, string> = {
    tradisjon: 'Tradisjon',
    fornyelse: 'Fornyelse',
    begge: 'Begge deler',
};

type Phase = 'active' | 'feedback' | 'complete';

export function TradisjonEllerNytt({
    title = 'Tradisjon eller nytt?',
    eksempler = STANDARD_EKSEMPLER,
}: TradisjonEllerNyttProps) {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('active');
    const [valgt, setValgt] = useState<string | null>(null);
    const [resultater, setResultater] = useState<{ valg: string; riktig: string }[]>([]);

    const current = eksempler[index];

    const stats = useMemo(() => {
        const riktige = resultater.filter((r) => r.valg === r.riktig).length;
        const beggeCount = eksempler.filter((e) => e.riktig === 'begge').length;
        return { riktige, beggeCount, total: eksempler.length };
    }, [resultater, eksempler]);

    const handleValg = (v: string) => {
        setValgt(v);
        setResultater((prev) => [...prev, { valg: v, riktig: current.riktig }]);
        setPhase('feedback');
    };

    const handleNeste = () => {
        if (index + 1 >= eksempler.length) {
            setPhase('complete');
        } else {
            setIndex((i) => i + 1);
            setValgt(null);
            setPhase('active');
        }
    };

    const handleReset = () => {
        setIndex(0);
        setPhase('active');
        setValgt(null);
        setResultater([]);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Er dette tradisjon, fornyelse, eller begge deler?
                    </p>
                </div>
            </div>

            <div className="mx-6 mt-4 mb-2 flex gap-1">
                {eksempler.map((_, i) => {
                    const done = i < index || phase === 'complete';
                    const current = i === index && !done;
                    return (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                done ? 'bg-indigo-500' : current ? 'bg-indigo-300' : 'bg-slate-200'
                            }`}
                        />
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {phase !== 'complete' ? (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                    >
                        <div className="text-xs text-slate-400 font-medium mb-2">
                            {index + 1} av {eksempler.length}
                        </div>
                        <p className="text-slate-800 text-base leading-relaxed mb-5">
                            {current.tekst}
                        </p>

                        {phase === 'active' && (
                            <div className="flex flex-wrap gap-3">
                                {(['tradisjon', 'fornyelse', 'begge'] as const).map((v) => {
                                    const f = VALG_FARGER[v];
                                    return (
                                        <motion.button
                                            key={v}
                                            onClick={() => handleValg(v)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${f.border} ${f.text} ${f.hover} bg-white`}
                                        >
                                            {VALG_LABEL[v]}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {phase === 'feedback' && valgt && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div
                                    className={`rounded-lg border p-4 mb-4 ${
                                        valgt === current.riktig
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-blue-50 border-blue-200'
                                    }`}
                                >
                                    <div className="text-sm font-semibold mb-1">
                                        {valgt === current.riktig ? (
                                            <span className="text-emerald-700">Riktig!</span>
                                        ) : (
                                            <span className="text-blue-700">
                                                Nesten — svaret er «{VALG_LABEL[current.riktig]}»
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700">{current.forklaring}</p>
                                </div>
                                <button
                                    onClick={handleNeste}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                    {index + 1 < eksempler.length ? (
                                        <>
                                            Neste <ChevronRight className="w-4 h-4" />
                                        </>
                                    ) : (
                                        'Se resultat'
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="p-6"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-slate-800">Mønsteret</h4>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-4">
                            Du fikk {stats.riktige} av {stats.total} riktig. Men legg merke
                            til noe viktig: {stats.beggeCount} av {stats.total} eksempler hadde
                            «begge deler» som svar. Musikkens historie viser at tradisjon og
                            fornyelse nesten alltid henger sammen. Det nye vokser ut av det
                            gamle, og det gamle overlever fordi noen gir det nytt liv.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {resultater.map((r, i) => (
                                <div
                                    key={i}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        r.valg === r.riktig
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
