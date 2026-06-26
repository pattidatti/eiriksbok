import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Scale, Lock, Check, Sparkles } from 'lucide-react';

interface Power {
    id: string;
    free: string;
    bound: string;
}

interface KongensMaktBindingProps {
    title?: string;
    powers?: Power[];
}

const DEFAULT_POWERS: Power[] = [
    {
        id: 'skatt',
        free: 'Kreve skatt fra folket når han selv vil',
        bound: 'Ingen ny skatt uten at rådet sier ja',
    },
    {
        id: 'fengsel',
        free: 'Fengsle hvem han vil, uten grunn',
        bound: 'Ingen fri mann fengsles uten lov og dom',
    },
    {
        id: 'domstol',
        free: 'Overstyre dommerne og bestemme straffen selv',
        bound: 'Alle frie menn har rett til en rettferdig rettssak',
    },
    {
        id: 'kirke',
        free: 'Ta kirkens gods og styre den som han vil',
        bound: 'Kirken skal være fri og styre seg selv',
    },
];

export function KongensMaktBinding({
    title = 'Bind kongens makt',
    powers = DEFAULT_POWERS,
}: KongensMaktBindingProps) {
    const [bound, setBound] = useState<Set<string>>(new Set());

    const total = powers.length;
    const count = bound.size;
    const complete = count === total;
    // Hvor mye makt kongen fortsatt har OVER loven, i prosent.
    const maktOverLoven = Math.round(((total - count) / total) * 100);

    const bind = (id: string) => {
        if (bound.has(id)) return;
        setBound((prev) => new Set(prev).add(id));
    };

    const handleReset = () => setBound(new Set());

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Crown className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hver av kongens frie makter for å binde den til loven.
                    </p>
                </div>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-[1fr_220px]">
                {/* Kort med kongens makter */}
                <div className="grid gap-3">
                    {powers.map((p) => {
                        const isBound = bound.has(p.id);
                        return (
                            <motion.button
                                key={p.id}
                                onClick={() => bind(p.id)}
                                disabled={isBound}
                                layout
                                whileHover={isBound ? undefined : { scale: 1.01 }}
                                whileTap={isBound ? undefined : { scale: 0.98 }}
                                className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                                    isBound
                                        ? 'bg-emerald-50 border-emerald-200 cursor-default'
                                        : 'bg-rose-50 border-rose-200 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {isBound ? (
                                        <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-medium ${
                                            isBound ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                    >
                                        {isBound ? p.bound : p.free}
                                    </span>
                                </div>
                                <AnimatePresence>
                                    {isBound && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center gap-1 mt-1 text-xs text-emerald-600"
                                        >
                                            <Check className="w-3 h-3" />
                                            Bundet av Magna Carta
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Visuell: kongen over eller under loven */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col">
                    <div className="text-xs font-medium text-slate-500 text-center mb-1">
                        Kongens makt over loven
                    </div>
                    <div className="text-center text-2xl font-bold text-slate-800 tabular-nums mb-3">
                        {maktOverLoven}%
                    </div>
                    <div className="relative flex-1 min-h-[120px]">
                        {/* Kronen som synker fra over til under loven */}
                        <motion.div
                            className="absolute left-1/2 -translate-x-1/2"
                            initial={false}
                            animate={{ top: `${10 + (count / total) * 60}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                        >
                            <Crown
                                className={`w-9 h-9 ${
                                    complete ? 'text-emerald-500' : 'text-amber-500'
                                }`}
                            />
                        </motion.div>
                        {/* Lov-linjen */}
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-indigo-400" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0 text-[10px] font-bold text-indigo-500 bg-slate-50 px-1">
                            LOVEN
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback-sone */}
            <AnimatePresence mode="wait">
                {complete ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Kongen står nå under loven. For første gang måtte selv kongen
                        følge reglene.
                    </motion.div>
                ) : (
                    <motion.div
                        key="progress"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                    >
                        {count} av {total} makter er bundet til loven. Klikk de røde
                        kortene som er igjen.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
