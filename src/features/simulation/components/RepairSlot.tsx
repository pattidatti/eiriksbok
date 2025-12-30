import React from 'react';
import { Wrench } from 'lucide-react';
import { GameButton } from '../ui/GameButton';

interface RepairSlotProps {
    slot: string;
    item: any;
    canAfford: boolean;
    actionLoading: boolean;
    onAction: (action: any) => void;
    buildingId: string;
}

export const RepairSlot: React.FC<RepairSlotProps> = ({
    slot,
    item,
    canAfford,
    actionLoading,
    onAction,
    buildingId
}) => {
    const isDamaged = item.durability < item.maxDurability;

    return (
        <div
            className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all group bg-slate-900/50 ${isDamaged ? 'border-amber-500/20 shadow-lg' : 'border-white/5 opacity-60'}`}
        >
            <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                {item.icon}
            </div>
            <div className="flex-1 text-left">
                <div className="text-lg font-black text-white leading-tight">{item.name}</div>
                <div className="flex flex-col mt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Holdbarhet</span>
                        <span className={isDamaged ? 'text-amber-500' : 'text-emerald-500'}>
                            {item.durability}/{item.maxDurability}
                        </span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full mt-1 overflow-hidden">
                        <div
                            className={`h-full transition-all ${isDamaged ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {isDamaged && (
                <GameButton
                    variant="primary"
                    size="sm"
                    disabled={actionLoading || !canAfford}
                    onClick={() => onAction({ type: 'REPAIR', targetSlot: slot, buildingId })}
                    className="bg-amber-600 hover:bg-amber-500 border-amber-400/50"
                >
                    <Wrench className="w-4 h-4" />
                </GameButton>
            )}
        </div>
    );
};
