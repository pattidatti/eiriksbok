import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import type { DetectiveBriefing } from './types';

interface BriefingScreenProps {
    briefing: DetectiveBriefing;
    onStart: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({ briefing, onStart }) => {
    return (
        <div className="relative flex-1 flex items-center justify-center p-4 md:p-6 bg-[var(--det-bg)] overflow-hidden">
            {/* Stor backdrop med hero-bilde */}
            {briefing.image && (
                <div className="absolute inset-0 pointer-events-none">
                    <img
                        src={briefing.image}
                        alt=""
                        className="w-full h-full object-cover opacity-30"
                        style={{ filter: 'blur(2px) saturate(0.7)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--det-bg)]/70 via-[var(--det-bg)]/40 to-[var(--det-bg)]" />
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-3xl w-full bg-[var(--det-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Visuell side */}
                <div
                    className="md:w-1/3 relative flex flex-col items-center justify-center text-white text-center py-8 md:py-0 overflow-hidden min-h-[140px] md:min-h-0"
                    style={{
                        background:
                            'linear-gradient(135deg, color-mix(in srgb, var(--det-accent) 50%, transparent), color-mix(in srgb, var(--det-accent) 15%, transparent))',
                    }}
                >
                    {briefing.image ? (
                        <>
                            <img
                                src={briefing.image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-70"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'linear-gradient(to top, color-mix(in srgb, var(--det-bg) 80%, transparent), transparent 70%)',
                                }}
                            />
                        </>
                    ) : null}

                    <div className="relative z-10 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                        <Search className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Innholdsside */}
                <div className="md:w-2/3 p-6 md:p-8 space-y-5">
                    <div>
                        <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: 'var(--det-accent)' }}
                        >
                            Nytt oppdrag
                        </span>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
                            {briefing.title}
                        </h1>
                    </div>

                    <div className="space-y-3 text-base leading-relaxed">
                        <p className="text-slate-200">{briefing.context}</p>
                        <p
                            className="font-medium"
                            style={{
                                color: 'color-mix(in srgb, var(--det-warning) 75%, white)',
                            }}
                        >
                            {briefing.mystery}
                        </p>
                        <p
                            className="font-semibold"
                            style={{
                                color: 'color-mix(in srgb, var(--det-evidence) 75%, white)',
                            }}
                        >
                            {briefing.mission}
                        </p>
                        {briefing.stakes && (
                            <p className="text-slate-400 text-sm italic">{briefing.stakes}</p>
                        )}
                    </div>

                    <button
                        onClick={onStart}
                        className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                    >
                        Start etterforskningen
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
