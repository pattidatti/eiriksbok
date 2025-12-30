import React, { useState } from 'react';
import type { SimulationPlayer, EquipmentSlot as EquipmentSlotType } from '../simulationTypes';
import { InventoryGrid } from './InventoryGrid';
import { InventorySlot } from './InventorySlot';
import { ItemTooltip } from './ItemTooltip';
import { Shield, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
    TRINKET: 'Tilbehør',
    AXE: 'Øks',
    PICKAXE: 'Hakke',
    SCYTHE: 'Ljom / Sigd',
    HAMMER: 'Smedhammer'
};

export const SimulationVault: React.FC<SimulationVaultProps> = React.memo(({ player, onAction }) => {

    const [tooltipContent, setTooltipContent] = useState<any>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [draggedItem, setDraggedItem] = useState<any>(null);

    const handleSlotClick = (_index: number, content: any) => {
        if (!content) return;

        if (content.type === 'equipment') {
            if (content.slot) {
                onAction({ type: 'UNEQUIP_ITEM', slot: content.slot });
            } else {
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

    const handleSlotMove = (e: React.MouseEvent, content: any) => {
        if (content) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleDragStart = (item: any) => {
        setDraggedItem(item);
        setTooltipContent(null); // Hide tooltip while dragging
    };

    const handleDragEnd = (event: any, item: any, info?: any) => {
        // Find coordinates (use info.point for Framer Motion precision)
        const x = info?.point?.x ?? event.clientX;
        const y = info?.point?.y ?? event.clientY;

        // Use elementsFromPoint (plural) to find what's UNDER the dragged item
        const targets = document.elementsFromPoint(x, y);

        // Find the first target that is an equipment slot
        let slotElement: Element | null = null;
        for (const t of targets) {
            const found = t.closest('[data-equipment-slot]');
            if (found) {
                slotElement = found;
                break;
            }
        }

        if (slotElement) {
            const slot = slotElement.getAttribute('data-equipment-slot') as EquipmentSlotType;
            if (slot && item.type === 'equipment') {
                const equipmentItem = item.data;
                const isSpecializedTool = ['AXE', 'PICKAXE', 'SCYTHE', 'HAMMER'].includes(equipmentItem.type);

                if (isSpecializedTool && slot === 'MAIN_HAND') {
                    onAction({ type: 'EQUIP_ITEM', itemId: equipmentItem.id, slot: equipmentItem.type });
                } else if (equipmentItem.type === slot || (slot === 'MAIN_HAND' && equipmentItem.relevantActions)) {
                    onAction({ type: 'EQUIP_ITEM', itemId: equipmentItem.id, slot });
                }
            }
        } else {
            // Check for inventory area (for unequipping)
            const isInventoryArea = targets.some(t => t.closest('[data-inventory-grid]') || t.closest('.inventory-container'));

            if (isInventoryArea && item.type === 'equipment' && item.slot) {
                onAction({ type: 'UNEQUIP_ITEM', slot: item.slot });
            }
        }

        // Reset state AT THE END to avoid flickering during logic
        setDraggedItem(null);
    };

    const invArray = Array.isArray(player.inventory) ? player.inventory : Object.values(player.inventory || {});
    const resourceCount = Object.values(player.resources || {}).filter(amt => (amt as number) > 0).length;
    const inventoryCount = invArray.length + resourceCount;
    const equipment = player.equipment || {};
    const isDraggingFromRagdoll = !!draggedItem?.slot;

    const slotProps = {
        onClick: (content: any) => handleSlotClick(-1, content),
        onMouseEnter: handleSlotHover,
        onMouseLeave: handleSlotLeave,
        onMouseMove: handleSlotMove,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        draggedItem
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto p-4 relative min-h-[800px]">
            <ItemTooltip content={tooltipContent} position={mousePos} />

            <AnimatePresence>
                {draggedItem && (
                    <div className="fixed inset-0 pointer-events-none z-[100] bg-indigo-500/5 animate-pulse" />
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <div>
                    <h2 className="text-5xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-6">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                            <Package className="w-10 h-10 text-indigo-400" />
                        </div>
                        Eiendeler & Utrustning
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium italic text-lg opacity-70">Forvalt dine ressurser og din krigers utrustning</p>
                </div>
            </header>

            <div className={`flex flex-col xl:flex-row gap-8 items-start relative ${draggedItem ? 'z-[100]' : 'z-10'}`}>

                <div className={`flex-1 w-full xl:w-[700px] sticky top-8 transition-all duration-300 ${isDraggingFromRagdoll ? 'z-50 relative' : 'z-10'}`}>
                    <div
                        className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 group/ragdoll h-[750px] flex items-center justify-center p-0 rounded-[3rem] shadow-2xl relative"
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full opacity-50" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_80%)]" />
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center max-w-5xl">

                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                                <g className="opacity-20 stroke-indigo-400/30 fill-none" strokeWidth="1.5" strokeDasharray="4 4">
                                    <path d="M 350,120 Q 350,80 350,45" />
                                    <path d="M 180,300 Q 250,300 300,300" />
                                    <path d="M 520,300 Q 450,300 400,300" />
                                    <path d="M 180,550 Q 250,550 320,500" />
                                    <path d="M 520,550 Q 450,550 380,500" />
                                </g>
                            </svg>

                            <div className="relative z-10 w-[450px] h-[650px] opacity-[0.2] pointer-events-none select-none">
                                <svg viewBox="0 0 200 500" className="w-full h-full text-indigo-300 fill-current filter blur-[1px]">
                                    <path d="M100,15 c20,0,30,12,30,35 s-10,35-30,35 s-30-12-30-35 s10-35,30-35" />
                                    <path d="M85,85 h30 l15,10 c15,10,35,15,45,25 s15,40,15,60 v120 c0,15-10,25-25,25 h-10 v140 c0,20-12,30-30,30 h-5 c-15,0-20-10-20-20 v-150 h-10 v150 c0,10-5,20-20,20 h-5 c-18,0-30-10-30-30 v-140 h-10 c-15,0-25-10-25-25 v-120 c0-20,5-50,15-60 s30-15,45-25 Z" />
                                </svg>
                            </div>

                            <div className="absolute top-10 left-10 z-30 opacity-10 group-hover/ragdoll:opacity-30 transition-all duration-1000">
                                <Shield className="w-24 h-24 text-indigo-400 rotate-[-12deg]" />
                            </div>

                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="relative w-full h-full">
                                    <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-24">
                                        <RagdollSlot slot="HEAD" label={SLOT_LABELS.HEAD} item={equipment.HEAD} {...slotProps} />
                                    </div>

                                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-24">
                                        <RagdollSlot slot="BODY" label={SLOT_LABELS.BODY} item={equipment.BODY} {...slotProps} />
                                    </div>

                                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-24">
                                        <RagdollSlot slot="FEET" label={SLOT_LABELS.FEET} item={equipment.FEET} {...slotProps} />
                                    </div>

                                    <div className="absolute top-[35%] left-[6%] w-24">
                                        <RagdollSlot slot="MAIN_HAND" label={SLOT_LABELS.MAIN_HAND} item={equipment.MAIN_HAND} {...slotProps} />
                                    </div>
                                    <div className="absolute top-[35%] right-[6%] w-24">
                                        <RagdollSlot slot="OFF_HAND" label={SLOT_LABELS.OFF_HAND} item={equipment.OFF_HAND} {...slotProps} />
                                    </div>

                                    <div className="absolute bottom-[15%] left-[10%] flex flex-col gap-10">
                                        <div className="w-20 -rotate-6">
                                            <RagdollSlot slot="AXE" label={SLOT_LABELS.AXE} item={equipment.AXE} compact {...slotProps} />
                                        </div>
                                        <div className="w-20 -rotate-3 ml-6">
                                            <RagdollSlot slot="PICKAXE" label={SLOT_LABELS.PICKAXE} item={equipment.PICKAXE} compact {...slotProps} />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-[15%] right-[10%] flex flex-col gap-10 items-end">
                                        <div className="w-20 rotate-6">
                                            <RagdollSlot slot="SCYTHE" label={SLOT_LABELS.SCYTHE} item={equipment.SCYTHE} compact {...slotProps} />
                                        </div>
                                        <div className="w-20 rotate-3 mr-6">
                                            <RagdollSlot slot="HAMMER" label={SLOT_LABELS.HAMMER} item={equipment.HAMMER} compact {...slotProps} />
                                        </div>
                                    </div>

                                    <div className="absolute top-[12%] right-[16%] w-16">
                                        <RagdollSlot slot="TRINKET" label={SLOT_LABELS.TRINKET} item={equipment.TRINKET} compact {...slotProps} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className={`flex-1 w-full space-y-6 transition-all duration-300 ${draggedItem && !isDraggingFromRagdoll ? 'z-50 relative' : 'z-10'}`}>
                    <div className="flex items-center justify-between px-8 py-6 bg-slate-900/60 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                <Package className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                    Din Oppakning
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">{inventoryCount} / 25 plasser brukt</p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-slate-400 text-sm italic font-medium">Bruk drag & drop</div>
                            <div className="text-slate-600 text-xs uppercase font-bold tracking-tight">Eller klikk for hurtigbruk</div>
                        </div>
                    </div>

                    <div className="bg-slate-950/60 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl min-h-[600px] inventory-container">
                        <InventoryGrid
                            player={player}
                            onSlotClick={handleSlotClick}
                            onSlotHover={handleSlotHover}
                            onSlotLeave={handleSlotLeave}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

interface RagdollSlotProps {
    slot: EquipmentSlotType;
    label: string;
    item: any;
    compact?: boolean;
    draggedItem?: any;
    onClick: (content: any) => void;
    onMouseEnter: (e: React.MouseEvent, content: any) => void;
    onMouseLeave: () => void;
    onMouseMove: (e: React.MouseEvent, content: any) => void;
    onDragStart?: (item: any) => void;
    onDragEnd?: (event: any, item: any, info: any) => void;
}

const RagdollSlot: React.FC<RagdollSlotProps> = ({
    slot, label, item, compact, draggedItem,
    onClick, onMouseEnter, onMouseLeave, onMouseMove,
    onDragStart, onDragEnd
}) => {
    const isSpecializedTool = ['AXE', 'PICKAXE', 'SCYTHE', 'HAMMER'].includes(draggedItem?.data?.type);

    const isCompatible = draggedItem?.type === 'equipment' && (
        draggedItem.data.type === slot ||
        (slot === 'MAIN_HAND' && draggedItem.data.relevantActions && !isSpecializedTool)
    );

    return (
        <motion.div
            className={`flex flex-col items-center gap-1 group/rslot transition-all duration-300 ${compact ? 'scale-90' : ''}`}
            data-equipment-slot={slot}
            animate={{ scale: isCompatible ? 1.15 : 1 }}
        >
            <div className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} relative`}>
                <AnimatePresence>
                    {(isCompatible || !!item) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`absolute -inset-4 rounded-full blur-2xl z-0 transition-colors
                                ${isCompatible ? 'bg-indigo-500/30 animate-pulse' : 'bg-indigo-500/10'}
                            `}
                        />
                    )}
                </AnimatePresence>

                <div className="relative z-10 w-full h-full group-hover/rslot:scale-105 transition-transform duration-300">
                    <InventorySlot
                        slotType={slot}
                        item={item}
                        isEquipped={!!item}
                        onClick={() => onClick({ type: 'equipment', data: item, slot })}
                        onMouseEnter={(e) => onMouseEnter(e, item ? { type: 'equipment', data: item, slot } : null)}
                        onMouseLeave={onMouseLeave}
                        onMouseMove={(e) => onMouseMove(e, item ? { type: 'equipment', data: item, slot } : null)}
                        isDraggable={!!item}
                        onDragStart={() => onDragStart?.({ type: 'equipment', data: item, slot })}
                        onDragEnd={(e, info) => onDragEnd?.(e, { type: 'equipment', data: item, slot }, info)}
                        layoutId={item?.id || `ragdoll-${slot}`}
                    />
                </div>
            </div>

            <div className="min-h-[1.75rem] flex items-center justify-center pointer-events-none z-20">
                <span className={`text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap px-4 py-1.5 rounded-full border transition-all duration-300 shadow-xl backdrop-blur-md
                    ${isCompatible ? 'text-indigo-100 bg-indigo-600 border-indigo-400 scale-110 shadow-indigo-500/50' :
                        !!item ? 'text-slate-200 bg-slate-900/90 border-white/20' :
                            'text-slate-300 bg-black/60 border-white/10'}
                `}>
                    {label}
                </span>
            </div>
        </motion.div>
    );
};

SimulationVault.displayName = 'SimulationVault';
