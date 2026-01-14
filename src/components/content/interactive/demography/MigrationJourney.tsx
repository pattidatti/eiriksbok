import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, LogOut, LogIn, CheckCircle2 } from 'lucide-react';

const scenarios = [
    { id: 'wars', text: 'Borgerkrig i hjemlandet', type: 'push' },
    { id: 'jobs', text: 'Høyere lønn og flere jobber', type: 'pull' },
    { id: 'famine', text: 'Tørke som ødelegger avlinger', type: 'push' },
    { id: 'education', text: 'Bedre universiteter', type: 'pull' },
    { id: 'family', text: 'Gjenforening med familie', type: 'pull' },
    { id: 'rights', text: 'Ingen ytringsfrihet', type: 'push' }
] as const;

export const MigrationJourney = () => {
    const [items, setItems] = useState<typeof scenarios[number][]>([]);
    const [pool, setPool] = useState([...scenarios]);

    const handleMove = (item: typeof scenarios[number], direction: 'push' | 'pull') => {
        // In this simple version, we just classify them correctly? 
        // Or do we let the user sort them? 
        // Let's let the user sort, then validate.

        // Actually, let's just show the concept. Push goes Left (Leaving), Pull goes Right (Arriving).
        // User clicks the arrow to move.

        // Check correctness for feedback
        const isCorrect = item.type === direction;

        // Just move it for now, show validation later or immediately?
        // Immediate feedback is better for learning.

        if (isCorrect) {
            setItems(prev => [...prev, item]);
            setPool(prev => prev.filter(i => i.id !== item.id));
        } else {
            // Shake or error effect could go here
            alert("Tenk deg om: Er dette en grunn til å DRA (Push) eller en grunn til å KOMME (Pull)?");
        }
    };

    const pushFactors = items.filter(i => i.type === 'push');
    const pullFactors = items.filter(i => i.type === 'pull');
    const isComplete = pool.length === 0;

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm font-sans overflow-hidden">
            <div className="bg-indigo-900 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ArrowRight className="w-6 h-6 text-indigo-400" />
                    Migrasjon: Push eller Pull?
                </h3>
                <p className="text-indigo-200 text-sm mt-1">Sorter faktorene: Hva dytter folk ut, og hva drar dem inn?</p>
            </div>

            <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 h-96">
                    {/* Push Zone */}
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-400" />
                        <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
                            <LogOut className="w-5 h-5" />
                            PUSH (Dra fra)
                        </h4>
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            <AnimatePresence>
                                {pushFactors.map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white p-3 rounded-lg shadow-sm border border-rose-100 text-sm text-slate-700 font-medium"
                                    >
                                        {item.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Voting/Pool Zone */}
                    <div className="flex flex-col items-center justify-center gap-4 relative">
                        {isComplete ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center p-6 bg-emerald-50 rounded-full w-48 h-48 flex flex-col items-center justify-center border-4 border-emerald-100"
                            >
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                                <h3 className="font-bold text-emerald-800 text-lg">Godt jobbet!</h3>
                                <p className="text-emerald-600 text-xs">Du har identifisert alle faktorene.</p>
                            </motion.div>
                        ) : (
                            <div className="w-full max-w-sm space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {pool.slice(0, 1).map(item => (
                                        <motion.div
                                            key={item.id}
                                            layoutId={item.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 text-center relative z-10"
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            onDragEnd={(_, { offset }) => {
                                                if (offset.x < -100) handleMove(item, 'push');
                                                if (offset.x > 100) handleMove(item, 'pull');
                                            }}
                                        >
                                            <p className="font-bold text-lg text-slate-800 mb-6">{item.text}</p>

                                            <div className="flex justify-between gap-4">
                                                <button
                                                    onClick={() => handleMove(item, 'push')}
                                                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors flex items-center gap-2"
                                                >
                                                    <LogOut className="w-4 h-4" /> Push
                                                </button>
                                                <button
                                                    onClick={() => handleMove(item, 'pull')}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
                                                >
                                                    Pull <LogIn className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mt-4 text-xs text-slate-400">
                                                Dra kortet eller bruk knappene
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {pool.length > 1 && (
                                    <div className="absolute top-2 left-2 right-2 bottom-[-10px] bg-white rounded-xl border border-slate-200 -z-10 scale-95 opacity-50" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pull Zone */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400" />
                        <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                            <LogIn className="w-5 h-5" />
                            PULL (Dra til)
                        </h4>
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            <AnimatePresence>
                                {pullFactors.map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 text-sm text-slate-700 font-medium"
                                    >
                                        {item.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
