import React from 'react';
import type { EquipmentItem } from '../simulationTypes';
import { ResourceIcon } from '../ui/ResourceIcon';


interface InventorySlotProps {
    item?: EquipmentItem;
    resource?: { id: string, amount: number };
    isEmpty?: boolean;
    isEquipped?: boolean;
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    slotType?: string; // e.g. 'MAIN_HAND', 'HEAD' for equipment placeholders
}



export const InventorySlot: React.FC<InventorySlotProps> = ({
    item,
    resource,
    isEmpty,
    isEquipped,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    slotType
}) => {

    const getContent = () => {
        if (item) {
            return (
                <div className="relative w-full h-full flex items-center justify-center group/item">
                    <span className="text-7xl filter drop-shadow-md group-hover/item:scale-110 transition-transform">
                        {item.icon}
                    </span>
                    {item.durability < item.maxDurability && (
                        <div className="absolute bottom-1 left-1 right-1 h-1 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${(item.durability / item.maxDurability) < 0.2 ? 'bg-red-500' :
                                    (item.durability / item.maxDurability) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                            />
                        </div>
                    )}
                </div>
            );
        }
        if (resource) {
            return (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-1 group/res">
                    <div className="group-hover/res:scale-110 transition-transform">
                        <ResourceIcon resource={resource.id} size="lg" />
                    </div>
                    <span className="absolute bottom-1 right-2 text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        {resource.amount}
                    </span>
                </div>



            );
        }

        if (slotType) {
            return (
                <div className="opacity-20 flex flex-col items-center justify-center grayscale">
                    <span className="text-sm font-bold uppercase tracking-tighter text-white/40">{slotType.replace('_', ' ')}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            className={`
                relative aspect-square w-full rounded-xl border-2 transition-all duration-200
                ${isEmpty || !getContent() ? 'bg-white/5 border-white/5 border-dashed' : 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/30'}
                ${isEquipped ? 'ring-2 ring-indigo-500 border-indigo-500/50 bg-indigo-500/10' : ''}
                group overflow-hidden
            `}
        >
            {getContent()}

            {/* Tooltip Peek (handled by parent or flyout) */}
            {(item || resource) && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </button>
    );
};
