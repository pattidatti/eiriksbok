import React, { useState, useEffect, useRef } from 'react';

const animationManager = {
    spawnParticles: (x: number, y: number, color: string) => console.log('Particles @', x, y, color),
    spawnFloatingText: (text: string, x: number, y: number, color: string) => console.log('FloatingText:', text, x, y, color)
};

export const CraftingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [targetPos, setTargetPos] = useState(50);
    const [cursorPos, setCursorPos] = useState(50);
    const [_hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const targetDir = useRef(1);

    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setTargetPos(p => {
                let next = p + (0.8 * targetDir.current * speedMultiplier);
                if (next > 90) { targetDir.current = -1; return 90; }
                if (next < 10) { targetDir.current = 1; return 10; }
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [isFinished, speedMultiplier]);

    const handleHit = () => {
        const dist = Math.abs(cursorPos - targetPos);
        if (dist < 15) {
            setHits(h => {
                if (h + 1 >= 5) { setIsFinished(true); setTimeout(() => onComplete(1.0), 1500); }
                return h + 1;
            });
            animationManager.spawnParticles(50, 50, 'bg-amber-400');
            animationManager.spawnFloatingText("KLANG!", 50, 40, 'text-amber-500');
        }
    };

    return (
        <div onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCursorPos(((e.clientX - rect.left) / rect.width) * 100);
        }} onClick={handleHit} className="p-12 min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden cursor-pointer" style={{ backgroundImage: 'url("/images/minigames/smithing_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8">SMIMESTER</h2>

            {!isFinished ? (
                <div className="relative z-10 w-full max-w-lg h-16 bg-white/10 rounded-full border-2 border-white/20 overflow-hidden">
                    <div className="absolute inset-y-0 w-20 bg-amber-500/50 blur-md transition-all duration-75" style={{ left: `${targetPos}%`, transform: 'translateX(-50%)' }} />
                    <div className="absolute inset-y-0 w-2 bg-white" style={{ left: `${cursorPos}%` }} />
                </div>
            ) : (
                <div className="text-5xl font-black text-amber-500 animate-bounce relative z-10">FERDIG! ⚔️</div>
            )}
        </div>
    );
};
