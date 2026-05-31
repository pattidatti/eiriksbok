import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Clock, RotateCcw, Snowflake, Flower2 } from 'lucide-react';

type Mode = 'sun' | 'clock';

interface ClockVsSunExplorerProps {
    title?: string;
}

// Soltid: dagslyset (og dermed arbeidsdagen) varierer med arstiden.
// season 0 = midtvinter (kort dag), season 100 = midtsommer (lang dag).
function sunDay(season: number) {
    // Daglengde i timer: ca. 6 t om vinteren, ca. 18 t om sommeren.
    const daylight = 6 + (season / 100) * 12;
    const sunrise = 12 - daylight / 2;
    const sunset = 12 + daylight / 2;
    return { start: sunrise, end: sunset, hours: daylight };
}

// Klokketid: fast arbeidsdag uansett arstid (07-15).
const CLOCK_DAY = { start: 7, end: 15, hours: 8 };

function fmt(h: number) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}`;
}

export function ClockVsSunExplorer({ title = 'Soltid eller klokketid?' }: ClockVsSunExplorerProps) {
    const [mode, setMode] = useState<Mode>('sun');
    const [season, setSeason] = useState(50);

    const day = mode === 'sun' ? sunDay(season) : CLOCK_DAY;
    const leftPct = (day.start / 24) * 100;
    const widthPct = ((day.end - day.start) / 24) * 100;

    const handleReset = () => {
        setMode('sun');
        setSeason(50);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Bytt mellom soltid og klokketid, og dra årstids-glidebryteren.
                    </p>
                </div>
            </div>

            {/* Modusvelger */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('sun')}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                            mode === 'sun'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                    >
                        <Sun className="w-3.5 h-3.5" />
                        Soltid
                    </button>
                    <button
                        onClick={() => setMode('clock')}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                            mode === 'clock'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Klokketid
                    </button>
                </div>
            </div>

            {/* Dognbandet: 24 timer der arbeidsdagen lyser opp */}
            <div className="px-6 py-6">
                <div className="relative h-16 rounded-lg bg-slate-800 overflow-hidden">
                    {/* Arbeidsdag-bandet */}
                    <motion.div
                        className={`absolute top-0 bottom-0 ${
                            mode === 'sun' ? 'bg-amber-400/80' : 'bg-indigo-400/80'
                        }`}
                        animate={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    >
                        <div className="flex h-full items-center justify-center">
                            <span className="text-xs font-semibold text-slate-900/80">
                                arbeidsdag
                            </span>
                        </div>
                    </motion.div>

                    {/* Timemarkorer hver 6. time */}
                    {[0, 6, 12, 18, 24].map((h) => (
                        <div
                            key={h}
                            className="absolute top-0 bottom-0 border-l border-white/15"
                            style={{ left: `${(h / 24) * 100}%` }}
                        />
                    ))}
                </div>

                {/* Timeskala */}
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>00</span>
                    <span>06</span>
                    <span>12</span>
                    <span>18</span>
                    <span>24</span>
                </div>

                {/* Arstids-glidebryter */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                            <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                            Vinter
                        </span>
                        <span className="font-medium text-slate-600">Årstid</span>
                        <span className="flex items-center gap-1">
                            Sommer
                            <Flower2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={season}
                        onChange={(e) => setSeason(Number(e.target.value))}
                        disabled={mode === 'clock'}
                        className={`w-full accent-amber-500 ${
                            mode === 'clock' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    />
                    {mode === 'clock' && (
                        <p className="mt-2 text-center text-xs text-slate-400">
                            I klokketid spiller årstiden ingen rolle - dagen er like lang uansett.
                        </p>
                    )}
                </div>
            </div>

            {/* Feedback-sone (alltid til stede) */}
            <div className="mx-6 mb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800">
                                {mode === 'sun' ? 'Soltid' : 'Klokketid'}
                            </span>
                            <span className="text-xs text-slate-400">
                                {fmt(day.start)} - {fmt(day.end)}
                            </span>
                        </div>
                        <p
                            className={`mt-1 text-2xl font-bold ${
                                mode === 'sun' ? 'text-amber-600' : 'text-indigo-600'
                            }`}
                        >
                            {day.hours.toFixed(1).replace('.', ',')} timer{' '}
                            <span className="text-sm font-medium text-slate-500">arbeidsdag</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            {mode === 'sun'
                                ? 'Sola styrer dagen. Arbeidstiden krymper om vinteren og vokser om sommeren, og ingen steder har helt lik tid.'
                                : 'Klokka styrer dagen. Arbeidstiden er den samme hele året, uansett om sola står høyt eller lavt.'}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsiktsbanner i klokketid */}
            <AnimatePresence>
                {mode === 'clock' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Clock className="h-4 w-4 shrink-0" />
                        Klokka gjorde tiden lik for alle, hele året - og det var det fabrikkene
                        trengte.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    {mode === 'sun'
                        ? 'Dra glidebryteren og se arbeidsdagen endre seg'
                        : 'Fast arbeidsdag fra 07.00 til 15.00'}
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
