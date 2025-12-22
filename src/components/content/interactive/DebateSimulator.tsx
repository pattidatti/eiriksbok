import React, { useState } from 'react';
import { Gavel, MessageSquare, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Argument {
    id: string;
    text: string;
    strength: number; // Hidden score
    type: 'laws' | 'honor' | 'mercy'; // Argument strategy
    response: string; // What the opponent says back
}

interface DebateSimulatorProps {
    topic: string;
    opponentName: string;
    opponentAvatar?: string;
    context: string;
    arguments: Argument[];
    winningScore: number;
}

export const DebateSimulator: React.FC<DebateSimulatorProps> = ({
    topic,
    opponentName,
    context,
    arguments: scenarioArgs,
    winningScore
}) => {
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [log, setLog] = useState<{ speaker: string, text: string, type?: string }[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'active' | 'finished'>('intro');

    // Shuffle 3 arguments per round to choose from
    const currentOptions = scenarioArgs.slice(round * 3, (round * 3) + 3);

    const handleArgSelect = (arg: Argument) => {
        setScore(curr => curr + arg.strength);

        const newLog = [
            ...log,
            { speaker: 'Deg', text: arg.text, type: 'player' },
            { speaker: opponentName, text: arg.response, type: 'opponent' }
        ];

        setLog(newLog);

        if (round >= 2) { // 3 round game
            setGameState('finished');
        } else {
            setRound(r => r + 1);
        }
    };

    const reset = () => {
        setScore(0);
        setRound(0);
        setLog([]);
        setGameState('intro');
    };

    const hasWon = score >= winningScore;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto font-sans">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                    <Gavel className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Tinget: {topic}</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">RettssakSimulator</p>
                </div>
            </div>

            <div className="p-6">
                {gameState === 'intro' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-400" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Motstander: {opponentName}</h4>
                        <p className="text-slate-600 mb-6 max-w-sm mx-auto">{context}</p>
                        <button
                            onClick={() => setGameState('active')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Start Saken
                        </button>
                    </div>
                )}

                {gameState === 'active' && (
                    <div className="space-y-6">
                        {/* Conversation Log */}
                        <div className="bg-white border border-slate-100 rounded-lg p-4 h-64 overflow-y-auto space-y-4 shadow-inner">
                            {log.length === 0 && <p className="text-center text-slate-400 italic mt-20">Saken begynner...</p>}
                            <AnimatePresence>
                                {log.map((entry, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${entry.type === 'player' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="text-xs text-slate-400 mb-1 font-bold">{entry.speaker}</div>
                                        <div className={`
                                            p-3 rounded-2xl max-w-[80%] text-sm
                                            ${entry.type === 'player'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-slate-100 text-slate-800 rounded-tl-none'}
                                        `}>
                                            {entry.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Arguments */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Velg ditt argument</h5>
                            <div className="space-y-2">
                                {currentOptions.map(arg => (
                                    <button
                                        key={arg.id}
                                        onClick={() => handleArgSelect(arg)}
                                        className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3 group"
                                    >
                                        <MessageSquare className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                        <span className="text-sm font-medium text-slate-700">{arg.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-slate-50">
                            {hasWon ? (
                                <Shield className="w-10 h-10 text-emerald-500" />
                            ) : (
                                <Gavel className="w-10 h-10 text-rose-500" />
                            )}
                        </div>
                        <h4 className="text-2xl font-bold mb-2">{hasWon ? 'Du vant saken!' : 'Du tapte saken'}</h4>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            {hasWon
                                ? 'Tinget dømte i din favør. Du brukte lov og ære klokt.'
                                : 'Dine argumenter var ikke sterke nok mot motstanderens list.'}
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={reset}
                                className="px-6 py-2 border border-slate-200 rounded-full font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Prøv en gang til
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
