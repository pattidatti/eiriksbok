import React from 'react';
import type { SimulationPlayer } from '../simulationTypes';

import { InventorySlot } from './InventorySlot';

interface InventoryGridProps {
    player: SimulationPlayer;
    onSlotClick: (index: number, content: any) => void;
    onSlotHover: (e: React.MouseEvent, content: any) => void;
    onSlotLeave: () => void;
}


export const InventoryGrid: React.FC<InventoryGridProps> = ({ player, onSlotClick, onSlotHover, onSlotLeave }) => {

    // Create a 5x5 grid (25 slots)
    const totalSlots = 25;

    // Flatten resources into the grid for visualization
    const gridItems = Object.entries(player.resources || {})
        .filter(([_, amount]) => (amount as number) > 0)
        .map(([id, amount]) => ({ type: 'resource', data: { id, amount: amount as number } }));

    // Placeholder for other loose items if they existed beyond equipment
    // For now, we'll just fill the grid with resources and then empty slots

    return (
        <div className="grid grid-cols-5 gap-3 p-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
            {[...Array(totalSlots)].map((_, i) => {
                const item = gridItems[i];
                return (
                    <InventorySlot
                        key={i}
                        resource={item?.type === 'resource' ? item.data : undefined}
                        isEmpty={!item}
                        onClick={() => onSlotClick(i, item)}
                        onMouseEnter={(e) => onSlotHover(e, item)}
                        onMouseLeave={onSlotLeave}
                        onMouseMove={(e) => onSlotHover(e, item)}
                    />

                );
            })}
        </div>
    );
};
