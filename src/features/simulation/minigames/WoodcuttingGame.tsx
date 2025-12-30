import React, { useState } from 'react';
import type { EquipmentItem } from '../simulationTypes';
import { ITEM_TEMPLATES } from '../constants';

const animationManager = {
    spawnParticles: (x: number, y: number, color: string) => console.log('Particles @', x, y, color),
    spawnFloatingText: (text: string, x: number, y: number, color: string) => console.log('FloatingText:', text, x, y, color)
};

const getBestToolForAction = (type: string, equipment: (EquipmentItem | undefined | null)[]) => {
    if (!equipment) return undefined;
    return equipment.find(item => {
        if (!item) return false;
        const tid = Object.keys(ITEM_TEMPLATES).find(k => item.id === k || item.id.startsWith(k + '_'));
        const template = tid ? ITEM_TEMPLATES[tid] : null;
        return (template as any)?.relevantActions?.includes(type);
    });
};

export const WoodcuttingGame: React.FC<{
    onComplete: (score: number) => void,
    equipment?: EquipmentItem[],
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, equipment = [], speedMultiplier: _speedMultiplier = 1.0, possibleYield = 5, resourceName = 'Ved' }) => {
    const [target, setTarget] = useState({ x: 50, y: 50 });
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const spawn = () => setTarget({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });

    const handleHit = () => {
        const bestTool = getBestToolForAction('CHOP', equipment);
        const toolYieldBonus = bestTool?.stats?.yieldBonus || 0;

        const baseHitYield = Math.ceil((possibleYield / 10) * 1.5);
        const toolHitBonus = Math.ceil((toolYieldBonus / 10) * 1.5);

        animationManager.spawnFloatingText(`+ ${baseHitYield} ${resourceName} ${toolHitBonus > 0 ? `(+${toolHitBonus})` : ''} `, 50, 40, 'text-amber-400');
        animationManager.spawnParticles(50, 40, 'bg-amber-400');

        setHits(h => {
            if (h + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
            return h + 1;
        });
        spawn();
    };

    return (
        <div className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />

            <div className="relative z-10 w-full mb-8">
                <h2 className="text-4xl font-black text-white drop-shadow-lg tracking-tighter uppercase">Tømmerhogging</h2>
                <div className="text-amber-400 font-bold uppercase tracking-widest text-xs mt-2 px-4 py-1 bg-black/40 rounded-full inline-block">Hugg på merkene! ({hits}/10)</div>
            </div>

            <div className="relative z-10 w-full h-96 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner overflow-hidden">
                {!isFinished ? (
                    <button
                        onClick={handleHit}
                        className="absolute w-20 h-20 bg-rose-500 rounded-full border-4 border-white shadow-[0_0_30px_rose] animate-pulse transition-all active:scale-90"
                        style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        🪓
                    </button>
                ) : (
                    <div className="flex items-center justify-center h-full animate-bounce text-5xl font-black text-amber-500 uppercase tracking-tighter">VEDHOGST FERDIG! 🪵</div>
                )}
            </div>
        </div>
    );
};
