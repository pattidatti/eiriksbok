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
                                                {/* If no variants, this part is clickable? No, we wrap structure. */}
                                                {!variants ? (
                                                    <button
                                                        onClick={() => onAction({ type: action.id })}
                                                        disabled={!canAfford}
                                                        className={`text-left group w-full ${!canAfford && 'cursor-not-allowed opacity-50'}`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className={`text-lg font-bold truncate block ${canAfford ? isProduction ? 'text-indigo-400 group-hover:text-indigo-300 transition-colors' : 'text-white group-hover:text-amber-400 transition-colors' : 'text-slate-400'}`}>
                                                                    {action.label} {isProduction ? '🔨' : ''}
                                                                </span>
                                                                {isProduction && canAfford && <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Åpne Verksted</span>}
                                                                {!canAfford && <span className="text-xs font-black text-rose-400 uppercase tracking-widest mt-0.5">{missingReason}</span>}
                                                            </div>
                                                            {costLabel && <span className={`text-lg font-black bg-black/30 px-2 py-1 rounded-lg border ${isProduction ? 'border-indigo-500/30 text-indigo-400' : 'border-white/5'}`}>{costLabel}</span>}
                                                        </div>
                                                    </button>
                                                ) : (
                                                    // Header for variants
                                                    <div className="flex justify-between items-center w-full border-b border-white/5 pb-2 mb-2">
                                                        <div>
                                                            <span className="text-lg font-bold text-white">{action.label}</span>
                                                            {!canAfford && <div className="text-xs font-black text-rose-400 uppercase tracking-widest">{missingReason}</div>}
                                                        </div>
                                                        {costLabel && <span className="text-sm font-black text-slate-400">{costLabel}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* PROGRESSION CARROT / TOOL INFO */}
                                        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-white/5 pt-4">
                                            {/* Current Tool */}
                                            {(() => {
                                                const actionType = action.id;
                                                const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;
                                                const bestTool = equipment.find((item: any) => {
                                                    const template = ITEM_TEMPLATES[item.id] as any;
                                                    return template?.relevantActions?.includes(actionType);
                                                });

                                                if (bestTool) {
                                                    return (
                                                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 backdrop-blur-md flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{bestTool.icon}</span>
                                                                <div>
                                                                    <div className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">{bestTool.name}</div>
                                                                    <div className="text-[9px] font-bold text-slate-400">
                                                                        {(bestTool.stats?.yieldBonus || 0) > 0 && <span className="text-emerald-400">+{bestTool.stats?.yieldBonus} Utbytte </span>}
                                                                        {(bestTool.stats?.speedBonus || 1) > 1 && <span className="text-blue-400">+{Math.round(((bestTool.stats?.speedBonus || 1) - 1) * 100)}% Fart</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Next Upgrade */}
                                            {(() => {
                                                const actionType = action.id;
                                                const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;
                                                const bestTool = equipment.find((item: any) => {
                                                    const template = ITEM_TEMPLATES[item.id] as any;
                                                    return template?.relevantActions?.includes(actionType);
                                                });

                                                const currentId = bestTool?.id || (actionType === 'CHOP' ? 'rusty_axe' : actionType === 'MINE' ? 'stone_pickaxe' : null);
                                                const nextId = (ITEM_TEMPLATES[currentId as any] as any)?.nextTierId;
                                                const nextTemplate = nextId ? ITEM_TEMPLATES[nextId] : null;

                                                if (nextTemplate) {
                                                    return (
                                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 backdrop-blur-md flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl opacity-40 grayscale group-hover:grayscale-0 transition-all">{nextTemplate.icon}</span>
                                                                <div>
                                                                    <div className="text-[10px] font-black text-amber-500/80 uppercase leading-none mb-1 flex items-center gap-1.5">
                                                                        <TrendingUp className="w-2.5 h-2.5" /> Neste Nivå?
                                                                    </div>
                                                                    <div className="text-[9px] font-bold text-slate-500">
                                                                        Smid {nextTemplate.name} i Smia
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="w-5 h-5 bg-amber-500/10 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                                                                <ArrowRight className="w-3 h-3 text-amber-500" />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        {/* Legacy equipment chips (Hide if expanded? Keep for quick view?) -> Hide if expanded to avoid clutter */}
                                        {!showDetails && bonusDetails.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
                                                {bonusDetails.map((d, i) => (
                                                    <div key={i} className="flex items-center gap-1 text-[10px] bg-black/20 px-1.5 py-0.5 rounded border border-white/5 opacity-70">
                                                        <span>{d.icon}</span>
                                                        <span className={d.type === 'Fart' ? 'text-blue-300' : 'text-emerald-300'}>{d.value}</span>
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

                        {(() => {
                            const bId = (poi.id in VILLAGE_BUILDINGS) ? poi.id : (poi.parentId in VILLAGE_BUILDINGS ? poi.parentId : null);
                            if (!bId) {
                                if (availableActions.length === 0) {
                                    return <div className="text-center py-6 text-slate-500 italic text-xs">Ingen handlinger tilgjengelig</div>;
                                }
                                return null;
                            }

                            const buildingDef = VILLAGE_BUILDINGS[bId];
                            const isPrivate = bId === 'farm_house';

                            const buildingState = isPrivate
                                ? (player.buildings?.[bId] || { level: 1, progress: {} })
                                : (room.world?.settlement?.buildings?.[bId] || { level: 1, progress: {}, contributions: {} });

                            const nextLevel = buildingState.level + 1;
                            const nextLevelDef = buildingDef.levels[nextLevel];

                            if (!nextLevelDef) {
                                if (availableActions.length === 0) {
                                    return <div className="text-center py-6 text-slate-500 italic text-xs">Maksimalt nivå nådd</div>;
                                }
                                return null;
                            }

                            return (
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Oppgradering til Nivå {nextLevel}</h4>
                                        {nextLevelDef.bonus && <span className="text-[10px] text-slate-500 italic">"{nextLevelDef.bonus}"</span>}
                                    </div>

                                    <div className="space-y-3">
                                        {Object.entries(nextLevelDef.requirements).map(([res, targetAmt]: [any, any]) => {
                                            const currentAmt = (buildingState.progress as any)[res] || 0;
                                            const progress = Math.min(100, (currentAmt / targetAmt) * 100);
                                            const playerHas = (player.resources as any)[res] || 0;
                                            const canGive = playerHas > 0 && currentAmt < targetAmt;

                                            return (
                                                <div key={res} className="space-y-1.5">
                                                    <div className="flex justify-between items-end text-[10px]">
                                                        <span className="font-bold uppercase tracking-widest text-slate-300">{res} ({currentAmt}/{targetAmt})</span>
                                                        <span className="text-slate-500">{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        {canGive && (
                                                            <button
                                                                onClick={() => onAction({ type: 'CONTRIBUTE_TO_UPGRADE', buildingId: bId, resource: res, amount: Math.min(playerHas, targetAmt - currentAmt) })}
                                                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black rounded-lg transition-colors active:scale-95"
                                                            >
                                                                BIDRA
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Contributors List for Global Buildings */}
                                    {!isPrivate && (buildingState as any).contributions && Object.keys((buildingState as any).contributions).length > 0 && (
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Siste Bidrag</div>
                                            <div className="space-y-1">
                                                {Object.entries((buildingState as any).contributions).slice(0, 3).map(([pId, data]: [string, any]) => (
                                                    <div key={pId} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-slate-300 font-bold">{data.name}</span>
                                                        <div className="flex gap-2">
                                                            {Object.entries(data.resources).map(([r, a]: [any, any]) => (
                                                                <span key={r} className="text-indigo-400">+{a} {r}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </>
    );
};
