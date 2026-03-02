import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { Definition } from '../../data/governmentData';

interface ExplorerResultProps {
    result: Definition | null;
}

export const ExplorerResult: React.FC<ExplorerResultProps> = ({ result }) => {
    return (
        <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="sticky top-8">
                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center flex flex-col items-center shadow-2xl relative overflow-hidden group min-h-[500px]"
                        >
                            {/* Bakgrunns-effekt */}
                            <div className={`absolute inset-0 opacity-10 blur-3xl bg-gradient-to-t from-transparent via-${result.color.replace('text-', '')} to-transparent`} />
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <result.icon className={`h-64 w-64 ${result.color} opacity-10 rotate-12`} />
                            </div>

                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className={`p-6 rounded-full bg-slate-50 border border-slate-100 mb-8`}
                                >
                                    <result.icon className={`h-24 w-24 ${result.color}`} />
                                </motion.div>

                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">{result.category}</span>
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                                    {result.title}
                                </h2>

                                <div className="max-w-xl space-y-6">
                                    <p className="text-slate-600 text-xl md:text-2xl leading-relaxed font-light">
                                        {result.description}
                                    </p>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-left">
                                        <h4 className="text-slate-500 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                                            <InformationCircleIcon className="h-4 w-4" />
                                            Visste du at?
                                        </h4>
                                        <p className="text-slate-600 italic">
                                            {result.details}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full min-h-[500px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <SparklesIcon className="h-20 w-20 text-slate-300 mb-6 animate-pulse" />
                            <h3 className="text-2xl font-bold text-slate-400 mb-2">Din stat venter...</h3>
                            <p className="text-slate-500 max-w-sm">
                                Bruk kontrollpanelet til venstre for å bygge samfunnet. Resultatet vil dukke opp her.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
