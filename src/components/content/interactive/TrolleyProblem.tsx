import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, User, Users } from 'lucide-react';

export const TrolleyProblem: React.FC = () => {
    const [action, setAction] = useState<'track-a' | 'track-b' | null>(null);

    const handleAction = (choice: 'track-a' | 'track-b') => {
        setAction(choice);
    };

    const reset = () => {
        setAction(null);
    };

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Sporvognsproblemet: Hva gjør du?</h3>
            <p className="text-slate-600 mb-6">
                Et løpsk tog kommer mot fem arbeidere. Du kan dra i spaken for å lede toget inn på et sidespor,
                men der står det én person.
            </p>

            <div className="relative h-64 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 mb-6">
                {/* Tracks */}
                <div className="absolute top-1/2 left-0 w-full h-4 bg-slate-400 -translate-y-1/2"></div>

                {/* Track Split */}
                <svg className="absolute top-1/2 left-1/4 w-full h-32 -translate-y-2" style={{ overflow: 'visible' }}>
                    <path d="M0,0 C50,0 100,-80 200,-80 L400,-80" fill="none" stroke="#94a3b8" strokeWidth="16" />
                    <path d="M0,0 C50,0 100,80 200,80 L400,80" fill="none" stroke="#94a3b8" strokeWidth="16" />
                </svg>

                {/* Victims Track A (Top - The 1 person) */}
                <div className="absolute top-[20%] right-[10%] flex flex-col items-center">
                    <User className="w-8 h-8 text-red-500" />
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 rounded-full mt-1">1 Person</span>
                </div>

                {/* Victims Track B (Bottom - The 5 people) */}
                <div className="absolute bottom-[20%] right-[10%] flex flex-col items-center">
                    <div className="flex -space-x-2">
                        <Users className="w-8 h-8 text-red-500" />
                        <Users className="w-8 h-8 text-red-500" />
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 rounded-full mt-1">5 Personer</span>
                </div>

                {/* The Trolley */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-10 bg-blue-600 rounded shadow-lg flex items-center justify-center text-white text-xs font-bold z-10"
                    initial={{ x: 0, y: '-50%' }}
                    animate={
                        action === 'track-a' ? { x: 300, y: -100, rotate: -15 } :
                            action === 'track-b' ? { x: 300, y: 60, rotate: 15 } :
                                { x: 20 }
                    }
                    transition={{ duration: 1 }}
                >
                    TOG
                </motion.div>

                {/* The Lever */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
                    <button
                        onClick={() => handleAction('track-a')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors ${action === 'track-a' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}
                        disabled={!!action}
                    >
                        Trekk i spaken (Drep 1)
                    </button>
                    <button
                        onClick={() => handleAction('track-b')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors ${action === 'track-b' ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                        disabled={!!action}
                    >
                        Gjør ingenting (Drep 5)
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {action && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                    >
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Konsekvens:
                        </h4>
                        <p className="text-slate-600 mt-2">
                            {action === 'track-a'
                                ? "Du valgte handling. Du ofret 1 person for å redde 5. Dette er det utilitaristiske valget (størst nytte)."
                                : "Du valgte å ikke handle. 5 personer døde, men du drepte ingen direkte. Dette kan forsvares med pliktetikk (du har ingen rett til å velge hvem som skal dø)."
                            }
                        </p>
                        <button onClick={reset} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
                            Prøv igjen
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
