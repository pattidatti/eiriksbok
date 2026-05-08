import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, BookOpen, Eye, EyeOff } from 'lucide-react';

interface MythPair {
    id: string;
    myth: string;
    evidence: string;
    source?: string;
    sourceUrl?: string;
}

interface MythVsEvidenceProps {
    title?: string;
    intro?: string;
    pairs: MythPair[];
}

export const MythVsEvidence: React.FC<MythVsEvidenceProps> = ({
    title = 'Myte mot kildebevis',
    intro = 'En populær historisk påstand på venstre side. Klikk for å avsløre hva kildene faktisk viser.',
    pairs,
}) => {
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});

    const toggle = (id: string) =>
        setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm overflow-hidden"
        >
            <div className="p-6 border-b border-slate-200 bg-slate-50/80">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-200/70 text-slate-700">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900">{title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{intro}</p>
            </div>

            <div className="p-6 space-y-4">
                {pairs.map((pair) => {
                    const isOpen = !!revealed[pair.id];
                    return (
                        <div
                            key={pair.id}
                            className="grid md:grid-cols-2 gap-3 rounded-xl border border-slate-200 overflow-hidden"
                        >
                            {/* Myth side */}
                            <div className="p-5 bg-rose-50/60 border-r border-slate-200">
                                <div className="flex items-center gap-2 mb-2 text-rose-700">
                                    <AlertTriangle size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Den populære myten
                                    </span>
                                </div>
                                <p className="text-slate-800 text-sm leading-relaxed">{pair.myth}</p>
                            </div>

                            {/* Evidence side */}
                            <div className="p-5 bg-emerald-50/40 relative">
                                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                    <BookOpen size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Hva kildene viser
                                    </span>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isOpen ? (
                                        <motion.div
                                            key="revealed"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <p className="text-slate-800 text-sm leading-relaxed">
                                                {pair.evidence}
                                            </p>
                                            {pair.source && (
                                                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-xs text-emerald-800/80 italic">
                                                    Kilde:{' '}
                                                    {pair.sourceUrl ? (
                                                        <a
                                                            href={pair.sourceUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="underline hover:text-emerald-900"
                                                        >
                                                            {pair.source}
                                                        </a>
                                                    ) : (
                                                        pair.source
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => toggle(pair.id)}
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                                            >
                                                <EyeOff size={12} /> Skjul beviset
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="hidden"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => toggle(pair.id)}
                                            className="w-full py-4 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-100/40 hover:border-emerald-400 transition flex items-center justify-center gap-2 font-semibold text-sm"
                                        >
                                            <Eye size={16} /> Avslør beviset
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};
