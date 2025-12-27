import React, { useState } from 'react';
import type { SimulationPlayer, EquipmentSlot as EquipmentSlotType } from '../simulationTypes';
import { InventoryGrid } from './InventoryGrid';
import { InventorySlot } from './InventorySlot';
import { ItemTooltip } from './ItemTooltip';
import { GameCard } from '../ui/GameCard';
import { Shield, Package } from 'lucide-react';

interface SimulationVaultProps {
    player: SimulationPlayer;
    onAction: (action: any) => void;
}

const SLOT_LABELS: Record<EquipmentSlotType, string> = {
    HEAD: 'Hode',
    BODY: 'Kropp',
    FEET: 'Føtter',
    MAIN_HAND: 'Hovedhånd',
    OFF_HAND: 'Sidehånd',
    TRINKET: 'Tilbehør'
};

export const SimulationVault: React.FC<SimulationVaultProps> = ({ player, onAction }) => {
    const [tooltipContent, setTooltipContent] = useState<any>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleSlotClick = (_index: number, content: any) => {
        if (!content) return;

        if (content.type === 'equipment') {
            // Either click in inventory or ragdoll
            if (content.slot) {
                // Clicked an equipped slot
                onAction({ type: 'UNEQUIP_ITEM', slot: content.slot });
            } else {
                // Clicked an item in inventory
                // We need to know which slot it goes to
                const item = content.data as any;
                if (item && item.type) {
                    onAction({ type: 'EQUIP_ITEM', itemId: item.id, slot: item.type });
                }
            }
        }
    };


    const handleSlotHover = (e: React.MouseEvent, content: any) => {
        if (!content) {
            setTooltipContent(null);
            return;
        }
        setTooltipContent(content);
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleSlotLeave = () => {
        setTooltipContent(null);
    };

    const equipmentSlots: EquipmentSlotType[] = ['HEAD', 'BODY', 'FEET', 'MAIN_HAND', 'OFF_HAND', 'TRINKET'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto p-4 relative">
            {/* Floating Tooltip */}
            <ItemTooltip content={tooltipContent} position={mousePos} />

            <header className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-4">
                        <Package className="w-10 h-10 text-indigo-400" />
                        Eiendele
                    </h2>
                    <p className="text-slate-400 mt-1 font-medium italic">Forvalt dine ressurser og utrustning</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Equipment "Ragdoll" */}
                <div className="lg:col-span-4 space-y-6">
                    <GameCard
                        title="Utrustning"
                        action={<Shield className="w-5 h-5 text-indigo-400" />}
                        className="bg-slate-900/40 backdrop-blur-md"
                    >
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {equipmentSlots.map(slot => (
                                <div key={slot} className="space-y-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{SLOT_LABELS[slot]}</span>
                                    <InventorySlot
                                        slotType={slot}
                                        item={player.equipment[slot]}
                                        isEquipped={!!player.equipment[slot]}
                                        onClick={() => handleSlotClick(-1, { type: 'equipment', data: player.equipment[slot], slot })}
                                        onMouseEnter={(e) => handleSlotHover(e, player.equipment[slot] ? { type: 'equipment', data: player.equipment[slot], slot } : null)}
                                        onMouseLeave={handleSlotLeave}
                                        onMouseMove={(e) => handleSlotHover(e, player.equipment[slot] ? { type: 'equipment', data: player.equipment[slot], slot } : null)}
                                    />
                                </div>
                            ))}
                        </div>
                    </GameCard>
                </div>

                {/* Right: Inventory Grid */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            Oppakning <span className="text-slate-500 text-sm font-normal normal-case">(25 plasser)</span>
                        </h3>
                    </div>
                    <InventoryGrid
                        player={player}
                        onSlotClick={handleSlotClick}
                        onSlotHover={handleSlotHover}
                        onSlotLeave={handleSlotLeave}
                    />
                </div>
            </div>
        </div>
    );
};
