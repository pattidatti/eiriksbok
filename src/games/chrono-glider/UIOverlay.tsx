import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { AudioManager } from './systems/AudioManager';

export function UIOverlay() {
    const store = useGameStore();
    const { score, lives, gameState, currentEventIndex, events, startGame, resetGame, feedbackTrigger } = store;
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', id: number } | null>(null);

    useEffect(() => {
        if (feedbackTrigger) {
            setFeedback({ type: feedbackTrigger.type, id: feedbackTrigger.id });
            const timer = setTimeout(() => {
                setFeedback(null);
            }, 1000); // Show for 1 second
            return () => clearTimeout(timer);
        }
    }, [feedbackTrigger]);

    const currentEvent = events[currentEventIndex];

    if (gameState === 'menu') {
        // ... (existing menu code)
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white z-50">
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-8 drop-shadow-lg">
                    Chrono-Glider
                </h1>
                <p className="mb-8 text-xl text-gray-200 max-w-md text-center">
                    Fly through the correct years to repair the timeline.
                    Watch out for false dates!
                </p>
                <button
                    onClick={startGame}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(8,145,178,0.5)]"
                >
                    START MISSION
                </button>
            </div>
        );
    }

    if (gameState === 'gameover') {
        // ... (existing gameover code)
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md text-white z-50">
                <h1 className="text-6xl font-bold mb-4">MISSION FAILED</h1>
                <p className="text-2xl mb-8">Score: {score}</p>
                <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-white text-red-900 hover:bg-gray-200 rounded-full text-xl font-bold"
                >
                    TRY AGAIN
                </button>
            </div>
        );
    }

    if (gameState === 'won') {
        // "Won" might be legacy if infinite loop, but useful if we ever define an "End".
        // Or if we run out of events completely.
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-md text-white z-50">
                <h1 className="text-6xl font-bold mb-4">TIMELINE RESTORED</h1>
                <p className="text-2xl mb-8">Final Score: {score}</p>
                <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-white text-green-900 hover:bg-gray-200 rounded-full text-xl font-bold"
                >
                    PLAY AGAIN
                </button>
            </div>
        );
    }

    if (gameState === 'level_complete') {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/80 backdrop-blur-md text-white z-50">
                <h1 className="text-6xl font-bold mb-4 text-cyan-400 drop-shadow-lg">LEVEL {store.level} COMPLETE</h1>
                <p className="text-2xl mb-4">Level Score: {score}</p>
                {store.failedEvents.length > 0 ? (
                    <div className="bg-red-900/50 p-4 rounded-lg mb-8 border border-red-500">
                        <p className="text-red-200 font-bold mb-2">⚠ Time Paradoxes Detected: {store.failedEvents.length}</p>
                        <p className="text-sm">These events will re-appear in the next level!</p>
                    </div>
                ) : (
                    <p className="text-green-400 font-bold mb-8">✨ Perfect Synchronization! ✨</p>
                )}

                <button
                    onClick={() => store.startNextLevel()}
                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full text-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse"
                >
                    INITIATE LEVEL {store.level + 1}
                </button>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-40">
            {/* Feedback Overlay - Moved to bottom and smaller */}
            {feedback && (
                <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none z-0 transition-opacity duration-300 ${feedback ? 'opacity-100' : 'opacity-0'}`}>
                    <div className={`text-2xl font-bold px-6 py-2 rounded-full backdrop-blur-md border-2 shadow-lg animate-bounce
                        ${feedback.type === 'correct'
                            ? 'bg-green-500/20 border-green-400 text-green-100 shadow-green-500/50'
                            : 'bg-red-500/20 border-red-400 text-red-100 shadow-red-500/50'
                        }`}
                    >
                        {feedback.type === 'correct' ? 'CORRECT!' : 'WRONG TIME!'}
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Score</span>
                    <span className="text-3xl font-mono text-white font-bold">{score.toString().padStart(6, '0')}</span>
                </div>

                {/* Target Event - Centered */}
                <div className={`flex flex-col items-center transition-all duration-500 transform ${currentEvent ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                    {currentEvent && (
                        <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 text-center max-w-xl">
                            <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-1 block">Target Event</span>
                            <h2 className="text-2xl text-white font-bold mb-1 shadow-black drop-shadow-md">{currentEvent.title}</h2>
                            {/* <p className="text-sm text-gray-300">{currentEvent.description}</p> */}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end">
                    {/* Level Indicator -- New */}
                    <div className="mb-4 text-right">
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs block">Level</span>
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-md">
                            {store.level}
                        </span>
                    </div>

                    {/* Mute Button */}
                    <button
                        onClick={() => AudioManager.getInstance().toggleMute()}
                        className="mb-2 bg-gray-800/50 p-2 rounded hover:bg-gray-700/50 text-white text-xs uppercase font-bold"
                    >
                        Toggle Audio
                    </button>

                    <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Integrity</span>
                    <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-8 h-2 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-red-900/30'}`} />
                        ))}
                    </div>

                    {/* Combo/Streak Display */}
                    {store.streak > 1 && (
                        <div className="mt-4 flex flex-col items-end animate-pulse">
                            <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Streak</span>
                            <span className="text-4xl font-black italic text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                                {store.streak}x
                            </span>
                            {store.multiplier > 1 && (
                                <span className="text-purple-400 font-bold text-sm bg-purple-900/50 px-2 py-1 rounded">
                                    {store.multiplier}x Multiplier!
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Speed Indicator / Progress? maybe overkill */}

            {/* Controls Hint */}
            <div className="absolute left-8 bottom-8 animate-pulse flex gap-4">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-10 h-10 border-2 border-cyan-400 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-xl shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                        W
                    </div>
                    <span className="text-cyan-100 font-medium tracking-wide uppercase text-sm">
                        Hold for Speedboost
                    </span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <div className="w-24 h-10 border-2 border-cyan-400 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-xl shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                        SPACE
                    </div>
                    <span className="text-cyan-100 font-medium tracking-wide uppercase text-sm">
                        Shoot
                    </span>
                </div>
            </div>
        </div>
    );
}
