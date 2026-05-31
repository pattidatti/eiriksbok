import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Lightbulb, Building2, RotateCcw, Trophy } from 'lucide-react';

interface StromkrigenDuelProps {
    title?: string;
}

// Hvor mye av lyset kommer fram ved en gitt avstand (km) fra kraftverket.
// Likestrom (DC) taper kraft raskt og var ubrukelig etter et par kilometer.
// Vekselstrom (AC) kan loftes opp med transformator og naar nesten like sterkt fram.
function dcBrightness(km: number): number {
    return Math.max(0, 1 - km / 2.4);
}

function acBrightness(km: number): number {
    return Math.max(0.82, 1 - km / 320);
}

function Bulb({ brightness, glow }: { brightness: number; glow: string }) {
    const dim = brightness < 0.12;
    return (
        <div className="relative flex h-28 items-center justify-center">
            <motion.div
                className="absolute rounded-full"
                style={{ background: glow, filter: 'blur(28px)' }}
                animate={{
                    width: `${40 + brightness * 150}px`,
                    height: `${40 + brightness * 150}px`,
                    opacity: 0.25 + brightness * 0.75,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
            <Lightbulb
                className={`relative z-10 h-10 w-10 drop-shadow ${dim ? 'text-slate-600' : 'text-amber-200'}`}
            />
        </div>
    );
}

export function StromkrigenDuel({ title = 'Strømkrigen: hvem når lengst?' }: StromkrigenDuelProps) {
    const [km, setKm] = useState(1);

    const dc = dcBrightness(km);
    const ac = acBrightness(km);
    const dcPct = Math.round(dc * 100);
    const acPct = Math.round(ac * 100);

    const reset = () => setKm(1);

    let verdict: string;
    if (km <= 1) {
        verdict = 'Helt nær kraftverket lyser begge fint. Slik så det ut i Edisons første nabolag i New York.';
    } else if (dc > 0.05) {
        verdict = 'Likestrømmen begynner å svekkes. Edison måtte bygge et nytt kraftverk for hver lille avstand.';
    } else {
        verdict = 'Likestrømmen når ikke fram i det hele tatt. Vekselstrømmen lyser fortsatt sterkt - derfor vant den.';
    }

    return (
        <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <Zap className="h-5 w-5 shrink-0 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra byen lenger og lenger unna kraftverket, og se hvilket system som klarer å sende lyset fram.
                    </p>
                </div>
            </div>

            {/* Avstandsvelger */}
            <div className="px-6 pt-5">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <Building2 className="h-4 w-4" /> Avstand til byen
                    </span>
                    <span className="font-bold text-indigo-600">{km} km</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={km}
                    onChange={(e) => setKm(Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-600"
                    aria-label="Avstand til byen i kilometer"
                />
            </div>

            {/* De to systemene side om side */}
            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
                {/* Likestrom */}
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-200">Likestrøm</span>
                        <span className="text-xs text-slate-400">Edison</span>
                    </div>
                    <Bulb brightness={dc} glow="rgba(251, 191, 36, 0.7)" />
                    <p className="text-center text-2xl font-bold text-amber-300">{dcPct}%</p>
                    <p className="text-center text-xs text-slate-400">av lyset kommer fram</p>
                </div>

                {/* Vekselstrom */}
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-200">Vekselstrøm</span>
                        <span className="text-xs text-slate-400">Tesla og Westinghouse</span>
                    </div>
                    <Bulb brightness={ac} glow="rgba(254, 240, 138, 0.95)" />
                    <p className="text-center text-2xl font-bold text-amber-300">{acPct}%</p>
                    <p className="text-center text-xs text-slate-400">av lyset kommer fram</p>
                </div>
            </div>

            {/* Dom */}
            <div className="mx-6 mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">{verdict}</p>
            </div>

            {/* Vinner-banner */}
            {km >= 6 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    <Trophy className="h-4 w-4 shrink-0" />
                    Vekselstrømmen kan løftes opp med en transformator og sendes mil etter mil. Derfor er det den
                    som kommer ut av stikkontakten i veggen din i dag.
                </motion.div>
            )}

            {/* Kontroll */}
            <div className="flex items-center justify-end px-6 pb-5">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
