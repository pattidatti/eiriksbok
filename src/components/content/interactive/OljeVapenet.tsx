import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, RefreshCw } from 'lucide-react';

interface OljeVapenetProps {
    title?: string;
}

const OPEN_CONSEQUENCES = [
    { label: 'Oljepris', value: '12 dollar per fat', color: 'text-emerald-600' },
    { label: 'Bensinstasjoner', value: 'Fulle pumper, ingen kø', color: 'text-emerald-600' },
    { label: 'Fabrikker', value: 'Full produksjon', color: 'text-emerald-600' },
    { label: 'Vestlig politikk', value: 'Støtter Israel apent', color: 'text-slate-600' },
];

const CLOSED_CONSEQUENCES = [
    { label: 'Oljepris', value: '48 dollar per fat (+300%)', color: 'text-rose-700' },
    { label: 'Bensinstasjoner', value: 'Tomme pumper, timeslange køer', color: 'text-rose-700' },
    { label: 'Fabrikker', value: 'Stopper produksjon', color: 'text-rose-700' },
    { label: 'Vestlig politikk', value: 'Presser Israel til fredsforhandlinger', color: 'text-amber-700' },
];

export function OljeVapenet({ title = 'Oljeventilen som stoppet verden' }: OljeVapenetProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [hasToggled, setHasToggled] = useState(false);

    const toggle = () => {
        setIsOpen((v) => !v);
        setHasToggled(true);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Gauge className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Oktober 1973: Trykk pa ventilen og se hva som skjer</p>
                </div>
            </div>

            <div className="p-5">
                {/* Context */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 mb-4 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Oktober 1973.</span>{' '}
                    Egypt og Syria angriper Israel. USA støtter Israel med vapen og penger. OPEC-landene samles. Beslutningen: steng oljeventilen mot alle land som støtter Israel.
                </div>

                {/* Valve control */}
                <div className="flex flex-col items-center mb-4">
                    {/* Visual valve indicator */}
                    <div className="relative mb-3">
                        <motion.div
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${
                                isOpen
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : 'border-rose-400 bg-rose-50'
                            }`}
                            animate={{ scale: isOpen ? 1 : [1, 1.05, 1] }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Pipe symbol */}
                            <div className={`text-3xl transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-90'}`}>
                                {isOpen ? '🛢️' : '🚫'}
                            </div>
                        </motion.div>
                        <motion.div
                            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOpen
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                            }`}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            {isOpen ? 'APEN' : 'STENGT'}
                        </motion.div>
                    </div>

                    <motion.button
                        onClick={toggle}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className={`mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors ${
                            isOpen
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {isOpen ? 'STENG OLJEVENTILEN' : 'APNE OLJEVENTILEN'}
                    </motion.button>
                </div>

                {/* Consequences */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'open' : 'closed'}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-1.5"
                    >
                        {(isOpen ? OPEN_CONSEQUENCES : CLOSED_CONSEQUENCES).map((c, i) => (
                            <motion.div
                                key={c.label}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                            >
                                <span className="text-xs text-slate-500">{c.label}</span>
                                <span className={`text-xs font-medium ${c.color}`}>{c.value}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Insight */}
                <AnimatePresence>
                    {hasToggled && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
                        >
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Det tok tre maneder. Ikke en eneste bombe. Ingen soldater. Bare en stengt ventil - og Vestens økonomi knakk. Det er det vi mener nar vi sier olje er et politisk vapen.
                            </p>
                        </motion.div>
                    )}
                    {hasToggled && isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                        >
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                Embargoen varte fra oktober 1973 til mars 1974. Den endte etter at USA presset Israel til forhandlingsbordet. Olje hadde endret politikk - og verden lærte at energiavhengighet er en sårbarhet.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex justify-end">
                <button
                    onClick={() => { setIsOpen(true); setHasToggled(false); }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
