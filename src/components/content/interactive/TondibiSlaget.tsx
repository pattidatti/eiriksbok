import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Crosshair, Volume2, Mountain, Sparkles, RotateCcw, Trophy } from 'lucide-react';

interface TondibiSlagetProps {
    title?: string;
}

// Lyspaere: Songhai var Afrikas storste rike og hadde ti ganger sa mange
// soldater som Marokko i slaget ved Tondibi i 1591. Likevel tapte de. Hver
// fordel det store rytteriet hadde, ble gjort verdilos av en eneste ny ting:
// skytevapen. Nar eleven klikker fram de tre grunnene, ser de styrkemaaleren
// vippe fra Songhai til Marokko - tall slo ikke teknologi.

interface Reason {
    id: string;
    label: string;
    Icon: typeof Crosshair;
    headline: string;
    detail: string;
}

const REASONS: Reason[] = [
    {
        id: 'rekkevidde',
        label: 'Rekkevidde',
        Icon: Crosshair,
        headline: 'Gevaer og kanoner traff langt unna',
        detail: 'Songhai-soldatene hadde spyd, sverd og buer. De matte komme helt tett pa for a gjore skade. Marokkanerne skjot dem ned lenge for de rakk fram.',
    },
    {
        id: 'panikk',
        label: 'Lyden og frykten',
        Icon: Volume2,
        headline: 'Smellene skremte hester og kveg',
        detail: 'Songhai drev en flokk kveg foran haeren for a velte fienden. Men braket fra skytevapnene fikk dyrene til a snu og trampe rett inn i Songhais egne rekker.',
    },
    {
        id: 'orkenen',
        label: 'Ferden over Sahara',
        Icon: Mountain,
        headline: 'En liten, men moderne haer krysset orkenen',
        detail: 'Sultanen i Marokko sendte bare rundt 4000 mann tvers over Sahara. De var fa, men hadde musketter og kanoner. Det gjorde dem sterkere enn Songhais titusener.',
    },
];

type ToneState = 'idle' | 'progress' | 'complete';

export function TondibiSlaget({ title = 'Slaget ved Tondibi, 1591' }: TondibiSlagetProps) {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());

    const count = revealed.size;
    const complete = count === REASONS.length;
    const tone: ToneState = complete ? 'complete' : count > 0 ? 'progress' : 'idle';

    // Maaleren: 0 = Songhai dominerer (alle fordeler intakt), 1 = Marokko vinner.
    const marokkoShare = count / REASONS.length; // 0 -> 1

    const reveal = (id: string) => {
        setRevealed((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const handleReset = () => setRevealed(new Set());

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Swords className="w-5 h-5 text-rose-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Songhai hadde ti ganger sa mange soldater. Klikk fram grunnene til at de likevel tapte.
                    </p>
                </div>
            </div>

            {/* Styrkemaaler: vipper fra Songhai til Marokko */}
            <div className="px-6 pt-5">
                <div className="flex items-end justify-between text-sm font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5 text-amber-700">
                        <Users className="w-4 h-4" /> Songhai · 40 000 mann
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700">
                        Marokko · 4000 mann <Crosshair className="w-4 h-4" />
                    </span>
                </div>
                <div className="relative h-9 rounded-full bg-amber-100 overflow-hidden border border-slate-200">
                    {/* Marokkos andel vokser fra hoyre */}
                    <motion.div
                        className="absolute inset-y-0 right-0 bg-emerald-500/80"
                        initial={false}
                        animate={{ width: `${marokkoShare * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                    />
                    {/* Songhais gjenvaerende overtak (amber) ligger til venstre */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                        {complete
                            ? 'Marokko vant slaget'
                            : count === 0
                              ? 'Songhai har det store overtaket'
                              : `Songhai mister overtaket ... (${count}/3)`}
                    </div>
                </div>
            </div>

            {/* Grunn-kort til a klikke fram */}
            <div className="px-6 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {REASONS.map((r) => {
                    const open = revealed.has(r.id);
                    return (
                        <button
                            key={r.id}
                            onClick={() => reveal(r.id)}
                            className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                                open
                                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:shadow-md'
                            }`}
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <r.Icon className={`w-4 h-4 ${open ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {r.label}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">
                                {open ? r.headline : 'Klikk for a se hvorfor'}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Feedback-sone: alltid til stede */}
            <div className="mx-6 mt-4 mb-2 min-h-[68px]">
                <AnimatePresence mode="wait">
                    {tone === 'idle' && (
                        <motion.p
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                        >
                            En enorm haer mot en bitteliten en. Hvordan kunne den lille vinne? Klikk pa et kort.
                        </motion.p>
                    )}
                    {tone === 'progress' && (
                        <motion.div
                            key={`p-${count}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-1"
                        >
                            {REASONS.filter((r) => revealed.has(r.id)).map((r) => (
                                <p key={r.id}>
                                    <span className="font-semibold">{r.headline}:</span> {r.detail}
                                </p>
                            ))}
                        </motion.div>
                    )}
                    {tone === 'complete' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm"
                        >
                            <span className="flex items-center gap-2 font-semibold text-emerald-700 mb-1">
                                <Trophy className="w-4 h-4" /> Tall slo ikke teknologi
                                <motion.span
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                                >
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                </motion.span>
                            </span>
                            Hver fordel Songhai hadde, ble verdilos mot skytevapen. I 1591 falt Afrikas storste rike,
                            og tiden med de mektige vestafrikanske rikene tok slutt.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Grunner avdekket: {count} / {REASONS.length}</span>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
