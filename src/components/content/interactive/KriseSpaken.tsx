import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingDown, AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react';

interface KriseSpakenProps {
    title?: string;
}

// 0 = full Hayek (la markedet rense seg), 100 = full Keynes (staten griper inn)
type Zone = 'hayek' | 'midt' | 'keynes';

function zoneFor(value: number): Zone {
    if (value <= 38) return 'hayek';
    if (value >= 62) return 'keynes';
    return 'midt';
}

// Lineær interpolasjon mellom ytterpunktene
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function KriseSpaken({ title = 'Krisepulten 1929' }: KriseSpakenProps) {
    const [value, setValue] = useState(50);
    const [seenHayek, setSeenHayek] = useState(false);
    const [seenKeynes, setSeenKeynes] = useState(false);
    const [seenMidt, setSeenMidt] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const zone = zoneFor(value);

    // t = 0 ved Hayek, 1 ved Keynes
    const t = value / 100;
    // Kortsiktig smerte: høy hos Hayek (arbeidsledighet får stå), faller mot Keynes
    const kortsiktig = Math.round(lerp(100, 18, t));
    // Langsiktig risiko: lav hos Hayek (økonomien renses), stiger mot Keynes (gjeld + nye bobler)
    const langsiktig = Math.round(lerp(12, 88, t));

    const handleChange = (v: number) => {
        setValue(v);
        const z = zoneFor(v);
        if (z === 'hayek' && v <= 8) setSeenHayek(true);
        if (z === 'keynes' && v >= 92) setSeenKeynes(true);
        if (z === 'midt' && v >= 45 && v <= 55) setSeenMidt(true);
    };

    const allExplored = seenHayek && seenKeynes && seenMidt;

    const handleReset = () => {
        setValue(50);
        setSeenHayek(false);
        setSeenKeynes(false);
        setSeenMidt(false);
        setRevealed(false);
    };

    const replikk = useMemo(() => {
        if (zone === 'hayek')
            return {
                who: 'Hayek',
                text: 'La de feilslåtte investeringene falle. Markedet må rense seg selv - brutalt på kort sikt, men det bygger en sunn økonomi for fremtiden.',
            };
        if (zone === 'keynes')
            return {
                who: 'Keynes',
                text: 'Staten må fylle tomrommet! Bygg veier, skoler og sykehus nå - selv med underskudd. Folk må i arbeid igjen. Gjelden betaler vi ned når økonomien er frisk.',
            };
        return {
            who: 'Begge',
            text: 'Halvveis? Da er ingen av oss fornøyde. Dette er ikke et kompromiss - det er nøling. Velg en retning!',
        };
    }, [zone]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Året er 1933. Hver fjerde arbeider er ledig. Dra spaken og bestem politikken.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Økonom-paneler */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <EconomistCard
                        name="Hayek"
                        sub="La markedet rense seg"
                        active={zone === 'hayek'}
                        accent="rose"
                    />
                    <EconomistCard
                        name="Keynes"
                        sub="Staten griper inn"
                        active={zone === 'keynes'}
                        accent="indigo"
                    />
                </div>

                {/* Spaken */}
                <div className="px-1">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                        <span>← Ikke gjør noe</span>
                        <span>Maks statlig inngripen →</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => handleChange(Number(e.target.value))}
                        aria-label="Politisk spake fra Hayek til Keynes"
                        className="w-full h-3 appearance-none rounded-full cursor-pointer
                            bg-gradient-to-r from-rose-300 via-slate-200 to-indigo-300
                            accent-slate-700
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400
                            [&::-webkit-slider-thumb]:shadow-md
                            [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7
                            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-400"
                    />
                </div>

                {/* Målere */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <Meter
                        icon={<TrendingDown className="w-4 h-4" />}
                        label="Kortsiktig smerte"
                        sub="Arbeidsledighet, brødkøer"
                        value={kortsiktig}
                        color="rose"
                    />
                    <Meter
                        icon={<AlertTriangle className="w-4 h-4" />}
                        label="Langsiktig risiko"
                        sub="Gjeld og nye bobler"
                        value={langsiktig}
                        color="amber"
                    />
                </div>
            </div>

            {/* Feedback-sone — alltid til stede */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={zone}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={`px-4 py-3 rounded-lg border text-sm ${
                            zone === 'hayek'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : zone === 'keynes'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                    >
                        <span className="font-semibold">{replikk.who}:</span> «{replikk.text}»
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsikt-kort + kontrollrad */}
            <div className="px-6 pb-5">
                <AnimatePresence>
                    {revealed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className="mb-4 px-5 py-4 rounded-xl bg-emerald-50 border border-emerald-200"
                        >
                            <div className="flex items-start gap-3">
                                <motion.div
                                    initial={{ rotate: -20, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                                >
                                    <Lightbulb className="w-6 h-6 text-emerald-600 shrink-0" />
                                </motion.div>
                                <div>
                                    <p className="font-semibold text-emerald-800 mb-1">
                                        Det finnes ikke ett riktig svar
                                    </p>
                                    <p className="text-sm text-emerald-700">
                                        Uansett hvor du setter spaken, stiger én av kostnadene. Velger du
                                        Keynes, demper du smerten nå - men gjelden og risikoen vokser.
                                        Velger du Hayek, holder du risikoen nede - men millioner lider i
                                        mellomtiden. Derfor er debatten mellom Keynes og Hayek fortsatt
                                        ikke avgjort.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-4">
                    {!revealed ? (
                        <button
                            onClick={() => setRevealed(true)}
                            disabled={!allExplored}
                            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                                allExplored
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {allExplored ? 'Hva er konklusjonen?' : 'Prøv begge ytterpunktene og midten'}
                        </button>
                    ) : (
                        <span className="text-sm font-medium text-emerald-700">Ferdig utforsket ✓</span>
                    )}

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Tilbakestill
                    </button>
                </div>

                {/* Utforsknings-spor */}
                {!revealed && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <Track label="Hayek" done={seenHayek} />
                        <Track label="Midten" done={seenMidt} />
                        <Track label="Keynes" done={seenKeynes} />
                    </div>
                )}
            </div>
        </div>
    );
}

function EconomistCard({
    name,
    sub,
    active,
    accent,
}: {
    name: string;
    sub: string;
    active: boolean;
    accent: 'rose' | 'indigo';
}) {
    const ring =
        accent === 'rose'
            ? 'border-rose-300 bg-rose-50'
            : 'border-indigo-300 bg-indigo-50';
    const badge = accent === 'rose' ? 'bg-rose-500' : 'bg-indigo-500';
    return (
        <motion.div
            animate={{ scale: active ? 1.03 : 1, opacity: active ? 1 : 0.55 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
                active ? `${ring} shadow-sm` : 'border-slate-200 bg-white'
            }`}
        >
            <div
                className={`w-10 h-10 rounded-full ${badge} text-white flex items-center justify-center font-bold shrink-0`}
            >
                {name[0]}
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-slate-800 leading-tight">{name}</p>
                <p className="text-xs text-slate-500 leading-tight truncate">{sub}</p>
            </div>
        </motion.div>
    );
}

function Meter({
    icon,
    label,
    sub,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    sub: string;
    value: number;
    color: 'rose' | 'amber';
}) {
    const bar = color === 'rose' ? 'bg-rose-500' : 'bg-amber-500';
    const text = color === 'rose' ? 'text-rose-600' : 'text-amber-600';
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className={`flex items-center gap-1.5 text-sm font-medium ${text}`}>
                    {icon} {label}
                </span>
                <span className="text-sm font-bold text-slate-700">{value}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${bar}`}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                />
            </div>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
    );
}

function Track({ label, done }: { label: string; done: boolean }) {
    return (
        <span className={`flex items-center gap-1 ${done ? 'text-emerald-600 font-medium' : ''}`}>
            <span
                className={`w-2 h-2 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-300'}`}
            />
            {label}
        </span>
    );
}
