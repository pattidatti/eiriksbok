import React from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { InventorySlot } from './InventorySlot';
import { motion } from 'framer-motion';

interface InventoryGridProps {
    player: SimulationPlayer;
    onSlotClick: (index: number, content: any) => void;
    onSlotHover: (e: React.MouseEvent, content: any) => void;
    onSlotLeave: () => void;
    onDragStart?: (item: any) => void;
    onDragEnd?: (event: any, item: any) => void;
}


export const InventoryGrid: React.FC<InventoryGridProps> = ({
    player, onSlotClick, onSlotHover, onSlotLeave, onDragStart, onDragEnd
}) => {

    const resources = Object.entries(player.resources || {})
        .filter(([_, amount]) => (amount as number) > 0)
        .map(([id, amount]) => ({ type: 'resource', data: { id, amount: amount as number } }));

    const equipment = (player.inventory || []).map(item => ({ type: 'equipment', data: item }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
            data-inventory-grid="true"
        >
            {/* Resources Section */}
            {resources.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-4">
                        Ressurser
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </h4>
                    <div className="grid grid-cols-5 gap-3">
                        {resources.map((res, i) => (
                            <motion.div key={`res-${res.data.id}`} variants={itemVariants}>
                                <InventorySlot
                                    resource={res.data as any}
                                    onClick={() => onSlotClick(i, res)}
                                    onMouseEnter={(e) => onSlotHover(e, res)}
                                    onMouseLeave={onSlotLeave}
                                    onMouseMove={(e) => onSlotHover(e, res)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Equipment Section */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-4">
                    Gjenstander
                    <div className="h-[1px] flex-1 bg-white/5" />
                </h4>
                <div className="grid grid-cols-5 gap-3">
                    {equipment.map((item, i) => (
                        <motion.div key={`eq-${(item.data as any).id}-${i}`} variants={itemVariants}>
                            <InventorySlot
                                item={item.data as any}
                                isDraggable={true}
                                onDragStart={() => onDragStart?.(item)}
                                onDragEnd={(e) => onDragEnd?.(e, item)}
                                onClick={() => onSlotClick(i, item)}
                                onMouseEnter={(e) => onSlotHover(e, item)}
                                onMouseLeave={onSlotLeave}
                                onMouseMove={(e) => onSlotHover(e, item)}
                                layoutId={`inv-${i}-${(item.data as any).id}`}
                            />
                        </motion.div>
                    ))}

                    {/* Empty Slots to fill at least one row if needed */}
                    {equipment.length < 5 && [...Array(5 - equipment.length)].map((_, i) => (
                        <motion.div key={`empty-${i}`} variants={itemVariants}>
                            <InventorySlot isEmpty />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
