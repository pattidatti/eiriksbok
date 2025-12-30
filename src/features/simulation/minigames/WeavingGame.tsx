import React, { useState, useEffect } from 'react';

export const WeavingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [lastSide, setLastSide] = useState<'left' | 'right'>('right');
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleKey = (side: 'left' | 'right') => {
        if (isFinished) return;
        if (side !== lastSide) {
            setLastSide(side);
            setProgress(p => {
                const next = p + (5 * speedMultiplier);
                if (next >= 100) {
                    setIsFinished(true);
                    setTimeout(() => onComplete(1.0), 1000);
                    return 100;
                }
                return next;
            });
            setFeedback(side === 'left' ? '⬅️' : '➡️');
            setTimeout(() => setFeedback(null), 200);
        }
    };

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleKey('left');
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleKey('right');
        };
        window.addEventListener('keydown', handleDown);
        return () => window.removeEventListener('keydown', handleDown);
    }, [lastSide, isFinished]);

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundImage: 'url("/images/minigames/weavery_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Veveri: Vevstol 🧶</h2>

            <div className="relative z-10 w-full max-w-lg aspect-video bg-slate-900/50 border-4 border-white/10 rounded-3xl p-8 mb-12 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative h-32">
                    <div className={`text-6xl transition-all duration-300 ${lastSide === 'left' ? 'translate-x-0' : 'translate-x-64 opacity-20'} `}>🧵</div>
                    <div className="absolute inset-x-0 h-1 bg-white/20 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className={`text-6xl transition-all duration-300 ${lastSide === 'right' ? 'translate-x-0' : '-translate-x-64 opacity-20'} `}>🧵</div>
                </div>

                <div className="text-sm font-black text-indigo-300 uppercase tracking-[0.3em] h-8">
                    {feedback || 'Veksle mellom Venstre / Høyre'}
                </div>
            </div>

            <div className="relative z-10 flex gap-4 mb-8">
                <button onClick={() => handleKey('left')} className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-4 transition-all ${lastSide === 'right' ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'} `}>
                    ⬅️
                </button>
                <button onClick={() => handleKey('right')} className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-4 transition-all ${lastSide === 'left' ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'} `}>
                    ➡️
                </button>
            </div>

            <div className="relative z-10 w-full max-w-sm h-4 bg-white/10 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}% ` }} />
            </div>
        </div>
    );
};
