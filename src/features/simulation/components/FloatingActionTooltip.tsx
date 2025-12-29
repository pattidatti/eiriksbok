import React, { useState, useMemo } from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { VILLAGE_BUILDINGS, CRAFTING_RECIPES } from '../constants';

import { MINIGAME_VARIANTS } from '../SimulationMinigames';
import { checkActionRequirements, getActionCostString, getActionEquipment } from '../utils/actionUtils';
import { UPGRADES_LIST, ITEM_TEMPLATES } from '../constants';
import { TrendingUp, ArrowRight } from 'lucide-react';
import type { EquipmentItem } from '../simulationTypes';

interface FloatingActionTooltipProps {
    poi: any; // Type accurately if possible
    player: SimulationPlayer;
    room: any;
    viewingRegionId: string;
    onAction: (action: any) => void;
    onClose: () => void;
}

export const FloatingActionTooltip: React.FC<FloatingActionTooltipProps> = ({ poi, player, room, viewingRegionId, onAction, onClose }) => {
    const [showDetails, setShowDetails] = useState(false);

    // Calculate position manually or pass styles? 
    // The WorldMap calculates position based on POI coordinates. 
    // Ideally, WorldMap should compute styles and pass them, or we compute here.
    // Let's assume WorldMap passes the style container, and this renders INSIDE it.
    // Actually, WorldMap renders the container `absolute`. This component will be the content `div`.
    // Wait, let's make this component render the WHOLE container for encapsulation.

    // Position Logic
    const top = (viewingRegionId === 'region_ost' && poi.ost ? poi.ost.top : poi.top);
    const left = (viewingRegionId === 'region_ost' && poi.ost ? poi.ost.left : poi.left);
    const xPos = parseFloat(left);
    const yPos = parseFloat(top);

    const transformX = xPos > 80 ? '-95%' : xPos < 20 ? '-5%' : '-50%';
    const transformY = yPos < 25 ? '3rem' : 'calc(-100% - 1rem)';

    // Filter Actions
    const availableActions = useMemo(() => {
        // Find building context
        const buildingId = (poi.id in VILLAGE_BUILDINGS) ? poi.id : poi.parentId;
        const buildingDef = VILLAGE_BUILDINGS[buildingId];
        const settlement = room.world?.settlement || {};
        const buildingLevel = (settlement.buildings?.[buildingId]?.level as number) || 1;

        // Get all unlocked action IDs for current and lower levels
        let unlockedActions: string[] = [];
        if (buildingDef) {
            for (let i = 1; i <= buildingLevel; i++) {
                if (buildingDef.levels[i]) {
                    unlockedActions = [...unlockedActions, ...buildingDef.levels[i].unlocks];
                }
            }
        }

        const availableActionsRaw = poi.actions.filter((a: any) => {
            // General hardcoded filters
            if (a.id === 'TAX_PEASANTS' && player.role !== 'BARON') return false;
            if (a.id === 'TAX_ROYAL' && player.role !== 'KING') return false;
            if (a.id === 'DECREE' && player.role !== 'KING') return false;
            if (a.id === 'RAID' && player.role !== 'BARON') return false;
            if (a.id === 'REST' && poi.id === 'village_square' && (player.role === 'KING' || player.role === 'BARON')) return false;
            if (a.id === 'FEAST' && player.role !== 'KING' && player.role !== 'BARON') return false;

            // Building level filtering
            if (buildingDef && !a.id.startsWith('BUILDING_UPGRADE_') && !unlockedActions.includes(a.id)) return false;

            return true;
        });

        // SPECIAL: For production Primary POIs (like anvil, sawmill blade), 
        // we only want to show the production entry point, not individual recipes.
        const isProductionPOIRoot = [
            'windmill_stones', 'sawmill_blade', 'smeltery_furnace',
            'bakery_oven', 'weavery_loom', 'forge_anvil'
        ].includes(poi.id);

        if (isProductionPOIRoot) {
            // Only keep one action that represents the building's main function
            // This button will trigger the PRODUCTION tab in handlePOIAction
            return availableActionsRaw.filter((a: any) => a.id.startsWith('REFINE_') || a.id.startsWith('CRAFT_') || a.id in CRAFTING_RECIPES).slice(0, 1);
        }

        return availableActionsRaw;
    }, [poi, player.role, room.world?.settlement]);


    // Helper to get detailed bonuses for an action
    const getBonusDetails = (actionId: string) => {
        const details: { source: string, type: 'Fart' | 'Utbytte' | 'Flaks' | 'Utstyr', value: string, icon: string, isBonus: boolean }[] = [];
        const equipment = getActionEquipment(player, actionId);

        // Equipment
        equipment.forEach(item => {
            let hasBonus = false;

            if (item.stats?.speedBonus && item.stats.speedBonus !== 1) {
                details.push({ source: item.name, type: 'Fart', value: `+${Math.round((item.stats.speedBonus - 1) * 100)}%`, icon: item.icon, isBonus: true });
                hasBonus = true;
            }
            if (item.stats?.yieldBonus) {
                details.push({ source: item.name, type: 'Utbytte', value: `+${item.stats.yieldBonus}`, icon: item.icon, isBonus: true });
                hasBonus = true;
            }
            if (item.stats?.luckBonus) {
                details.push({ source: item.name, type: 'Flaks', value: `+${Math.round(item.stats.luckBonus * 100)}%`, icon: item.icon, isBonus: true });
                hasBonus = true;
            }

            // If item is relevant but has no specific stats, list it as gear
            if (!hasBonus) {
                details.push({ source: item.name, type: 'Utstyr', value: 'Ingen bonus', icon: item.icon, isBonus: false });
            }
        });

        // Upgrades (Match specific IDs or patterns)
        if (player.upgrades) {
            const roleUpgrades = (UPGRADES_LIST as any)[player.role] || [];
            player.upgrades.forEach((uId: string) => {
                const upg = roleUpgrades.find((u: any) => u.id === uId);
                if (upg) {
                    if (upg.benefit === 'YIELD_GRAIN' && (actionId === 'WORK' || actionId === 'MILL')) {
                        details.push({ source: upg.name, type: 'Utbytte', value: '+5', icon: '📜', isBonus: true });
                    }
                    if (upg.benefit === 'RAID_SPEED' && actionId === 'RAID') {
                        details.push({ source: upg.name, type: 'Fart', value: 'Raskere', icon: '🐎', isBonus: true });
                    }
                }
            });
        }

        // Building Level Bonuses
        const buildingId = poi.id === 'tavern' || poi.id === 'bakery' || poi.id === 'great_forge' || poi.id === 'weavery' || poi.id === 'sawmill' || poi.id === 'windmill' || poi.id === 'smeltery' ? poi.id : poi.parentId;
        const settlement = room.world?.settlement || {};
        const buildingLevel = (settlement.buildings?.[buildingId]?.level as number) || 1;

        if (buildingLevel >= 2) {
            details.push({ source: 'Bygningsbonus (Lvl 2)', type: 'Utbytte', value: '+10% XP', icon: '🏛️', isBonus: true });
        }
        if (buildingLevel >= 3) {
            details.push({ source: 'Bygningsbonus (Lvl 3)', type: 'Utbytte', value: 'Master Tier', icon: '🏆', isBonus: true });
        }


        return details;
    };

    return (
        <>
            <div className="absolute inset-0 z-[90]" onClick={onClose} />
            <div
                style={{ top, left, transform: `translate(${transformX}, ${transformY})` }}
                className="absolute z-[100] animate-in fade-in zoom-in duration-200 pointer-events-auto"
            >
                <div className="bg-slate-900/98 backdrop-blur-3xl border border-white/20 rounded-[1.8rem] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] min-w-[280px] w-max max-w-[360px] relative transition-all duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-md">{poi.icon}</span>
                            <div className="flex flex-col">
                                <h3 className="font-black text-white text-sm uppercase tracking-[0.15em] leading-tight opacity-90">{poi.label}</h3>
                                {showDetails && <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider animate-pulse">Detaljert Visning</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${showDetails ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                                title="Vis bonuser og detaljer"
                            >
                                📊
                            </button>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                        </div>
                    </div>

                    {/* Actions List */}
                    <div className="space-y-3">
                        {availableActions.map((action: any) => {
                            const bonusDetails = getBonusDetails(action.id);
                            const currentSeason = (room.world?.season || 'Spring') as any;
                            const currentWeather = (room.world?.weather || 'Clear') as any;

                            // Check requirements
                            let canAfford = true;
                            let missingReason = '';
                            if (viewingRegionId !== player.regionId && player.role !== 'KING' && action.id !== 'MARKET_VIEW') {
                                canAfford = false; missingReason = "Ikke ditt baroni";
                            } else {
                                const check = checkActionRequirements(player, action.id, currentSeason, currentWeather);
                                if (!check.success) { canAfford = false; missingReason = check.reason || 'Krav ikke møtt'; }
                            }

                            // Simplified cost display for basic resources/stamina
                            const costLabel = getActionCostString(action.id, currentSeason, currentWeather);
                            const isProduction = action.id.startsWith('REFINE_') || action.id.startsWith('CRAFT_') || action.id in CRAFTING_RECIPES;
                            const variants = MINIGAME_VARIANTS[action.id];

                            return (
                                <div key={action.id} className="w-full">
                                    {/* Action Content */}
                                    <div className={`flex flex-col w-full ${!variants ? 'px-4 py-3 bg-white/5 rounded-xl border border-white/5' : 'p-3 bg-slate-950/50 rounded-xl border border-white/10'}`}>

                                        {/* Action Header / Main Button Area */}
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex flex-col min-w-0 flex-1">
                                                {!variants ? (
                                                    <button
                                                        onClick={() => onAction({ type: action.id })}
                                                        disabled={!canAfford}
                                                        className={`text-left group w-full ${!canAfford && 'cursor-not-allowed opacity-50'}`}
                                                    >
                                                        <div className="flex justify-between items-center gap-3">
                                                            <div className="flex gap-3 items-center min-w-0">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className={`text-base font-black truncate block ${canAfford ? isProduction ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-white group-hover:text-amber-400' : 'text-slate-400'}`}>
                                                                        {action.label} {isProduction ? '🔨' : ''}
                                                                    </span>
                                                                    {!canAfford && <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest leading-tight">{missingReason}</span>}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 shrink-0">
                                                                {/* Compact Tool Indicator */}
                                                                {(() => {
                                                                    const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;
                                                                    const bestTool = equipment.find((item: any) => {
                                                                        const template = ITEM_TEMPLATES[item.id] as any;
                                                                        return template?.relevantActions?.includes(action.id);
                                                                    });
                                                                    if (bestTool) {
                                                                        const durabilityPct = (bestTool.durability / bestTool.maxDurability) * 100;
                                                                        return (
                                                                            <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10" title={`${bestTool.name}: ${Math.round(durabilityPct)}%`}>
                                                                                <span className="text-sm">{bestTool.icon}</span>
                                                                                <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full ${durabilityPct > 50 ? 'bg-emerald-500' : durabilityPct > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                                        style={{ width: `${durabilityPct}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}

                                                                {costLabel && <span className={`text-sm font-black bg-black/40 px-2 py-1 rounded-lg border leading-none ${isProduction ? 'border-indigo-500/30 text-indigo-400' : 'border-white/10 text-slate-300'}`}>{costLabel}</span>}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <div className="flex justify-between items-center w-full border-b border-white/5 pb-2 mb-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold text-white leading-tight">{action.label}</span>
                                                            {!canAfford && <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-0.5">{missingReason}</div>}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {/* Compact Tool Indicator for Variant Header */}
                                                            {(() => {
                                                                const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;
                                                                const bestTool = equipment.find((item: any) => {
                                                                    const template = ITEM_TEMPLATES[item.id] as any;
                                                                    return template?.relevantActions?.includes(action.id);
                                                                });
                                                                if (bestTool) {
                                                                    const durabilityPct = (bestTool.durability / bestTool.maxDurability) * 100;
                                                                    return (
                                                                        <div className="flex items-center gap-1.5 opacity-60">
                                                                            <span className="text-base">{bestTool.icon}</span>
                                                                            <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full ${durabilityPct > 50 ? 'bg-emerald-500' : durabilityPct > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                                    style={{ width: `${durabilityPct}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            {costLabel && <span className="text-[10px] font-black border border-white/10 px-2 py-1 rounded uppercase tracking-widest text-slate-500">{costLabel}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Simplified Bonus Badges instead of large chips */}
                                        {!showDetails && bonusDetails.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {bonusDetails.slice(0, 3).map((d, i) => (
                                                    <div key={i} className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${d.type === 'Fart' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                                        {d.value} {d.type}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variants */}
                                        {variants && variants.length > 0 && (
                                            <div className="grid grid-cols-1 gap-2 mt-2">
                                                {variants.map(variant => (
                                                    <button
                                                        key={variant.id}
                                                        onClick={() => onAction({ type: action.id, method: variant.id })}
                                                        disabled={!canAfford}
                                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left group ${canAfford ? 'bg-white/5 hover:bg-emerald-600/20 border-white/5 hover:border-emerald-500/50 active:scale-[0.98]' : 'bg-transparent border-transparent cursor-not-allowed opacity-50'}`}
                                                    >
                                                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{variant.icon}</span>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-base text-slate-200 group-hover:text-white">{variant.label}</span>
                                                            <span className="text-xs text-slate-500 group-hover:text-emerald-200">{variant.desc}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* CONSOLIDATED PROGRESSION FOOTER */}
                        {(() => {
                            // Find the best next upgrade for the primary tools relevant here
                            const primaryActions = availableActions.map((a: any) => a.id);
                            const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;

                            // Get all next-tier templates for relevant tools
                            const nextUpgrades = equipment
                                .filter((item: any) => {
                                    const template = ITEM_TEMPLATES[item.id] as any;
                                    return template?.relevantActions?.some((ra: string) => primaryActions.includes(ra));
                                })
                                .map((item: any) => {
                                    const nextId = (ITEM_TEMPLATES[item.id] as any)?.nextTierId;
                                    return nextId ? ITEM_TEMPLATES[nextId] : null;
                                })
                                .filter(Boolean);

                            if (nextUpgrades.length > 0) {
                                const upg = nextUpgrades[0];
                                return (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between group cursor-help">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <span className="text-2xl drop-shadow-lg group-hover:scale-110 transition-transform block">{upg.icon}</span>
                                                    <TrendingUp className="absolute -bottom-1 -right-2 w-3 h-3 text-amber-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Anbefalt Oppgradering</span>
                                                    <span className="text-[11px] font-bold text-slate-300">Smid {upg.name} i Smia</span>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        </>
    );
};
