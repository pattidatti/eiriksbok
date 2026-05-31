import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Scissors } from 'lucide-react';

interface MapRedrawnProps {
    title?: string;
}

interface Piece {
    name: string;
    tag: string;
    color: string;
}

const PIECES: Piece[] = [
    { name: 'Tyrkia', tag: 'Ny republikk (Atatürk)', color: '#b45309' },
    { name: 'Syria og Libanon', tag: 'Fransk mandat', color: '#1d4ed8' },
    { name: 'Irak', tag: 'Britisk mandat', color: '#15803d' },
    { name: 'Palestina og Jordan', tag: 'Britisk mandat', color: '#be185d' },
    { name: 'Den arabiske halvøy', tag: 'Nye kongedømmer', color: '#7c3aed' },
];

export function MapRedrawn({
    title = 'Kartet vi fortsatt krangler om',
}: MapRedrawnProps) {
    const [after, setAfter] = useState(false);

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <Map className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">
                Før krigen var hele Midtøsten én del av det osmanske riket. Etter krigen tegnet
                seierherrene nye grenser - mange med rette linjer på et kart. Vipp bryteren.
            </p>

            {/* Bryter */}
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                    onClick={() => setAfter(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                        !after ? 'bg-white text-slate-900 shadow' : 'text-slate-500'
                    }`}
                >
                    Før 1914
                </button>
                <button
                    onClick={() => setAfter(true)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                        after ? 'bg-white text-slate-900 shadow' : 'text-slate-500'
                    }`}
                >
                    Etter 1918-1923
                </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4" style={{ minHeight: 200 }}>
                <AnimatePresence mode="wait">
                    {!after ? (
                        <motion.div
                            key="before"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                            className="flex h-44 flex-col items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-100 text-center"
                        >
                            <span className="text-lg font-bold text-amber-800">Det osmanske riket</span>
                            <span className="mt-1 text-sm text-amber-700">
                                Ett rike fra Istanbul til Bagdad og Mekka
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="after"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                        >
                            {PIECES.map((p, i) => (
                                <motion.div
                                    key={p.name}
                                    initial={{ opacity: 0, scale: 0.6, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 200, damping: 16 }}
                                    className="rounded-xl p-3 text-white"
                                    style={{ backgroundColor: p.color }}
                                >
                                    <p className="text-sm font-bold leading-tight">{p.name}</p>
                                    <p className="mt-1 text-xs opacity-90">{p.tag}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {after && (
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex items-center gap-2 rounded-lg border-l-4 border-slate-900 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                    >
                        <Scissors className="h-4 w-4 shrink-0" />
                        Mange av grensene ble tegnet av britiske og franske diplomater i Sykes-Picot-avtalen
                        - ikke av folkene som bodde der. Derfor preger de konflikter den dag i dag.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
