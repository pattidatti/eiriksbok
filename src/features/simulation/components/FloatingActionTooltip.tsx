import React, { useState, useMemo } from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { VILLAGE_BUILDINGS } from '../constants';

import { MINIGAME_VARIANTS } from '../SimulationMinigames';
import { checkActionRequirements, getActionCostString, getActionEquipment } from '../utils/actionUtils';
import { UPGRADES_LIST } from '../constants';

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

        return poi.actions.filter((a: any) => {
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

                            const costLabel = getActionCostString(action.id, currentSeason, currentWeather) || action.cost;
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
                                                                <span className={`text-lg font-bold truncate block ${canAfford ? 'text-white group-hover:text-amber-400 transition-colors' : 'text-slate-400'}`}>{action.label}</span>
                                                                {!canAfford && <span className="text-xs font-black text-rose-400 uppercase tracking-widest mt-0.5">{missingReason}</span>}
                                                            </div>
                                                            {costLabel && <span className="text-lg font-black bg-black/30 px-2 py-1 rounded-lg border border-white/5">{costLabel}</span>}
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

                                        {/* EXPANDED DETAILS PANEL */}
                                        {showDetails && (
                                            <div className="mt-3 bg-black/40 rounded-lg p-3 border border-white/5 animate-in slide-in-from-top-2 duration-200">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Aktive Bonuser</div>

                                                {bonusDetails.length > 0 ? (
                                                    <>
                                                        <div className="space-y-1.5 lead-none">
                                                            {bonusDetails.map((d, i) => (
                                                                <div key={i} className="flex items-center justify-between text-xs">
                                                                    <div className="flex items-center gap-1.5 text-slate-300">
                                                                        <span>{d.icon}</span>
                                                                        <span>{d.source}</span>
                                                                    </div>
                                                                    <div className={`font-bold ${d.type === 'Fart' ? 'text-blue-400' : d.type === 'Utbytte' ? 'text-emerald-400' : d.type === 'Flaks' ? 'text-purple-400' : 'text-slate-500'}`}>
                                                                        {d.value} {d.type !== 'Utstyr' && d.type}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Summary Line */}
                                                        <div className="mt-2 pt-2 border-t border-white/5 flex justify-end gap-3 text-[10px]">
                                                            {bonusDetails.some(d => d.type === 'Fart') && (
                                                                <span className="text-blue-400 font-bold">Total Fart: +{bonusDetails.filter(d => d.type === 'Fart').reduce((acc, curr) => acc + parseInt(curr.value.replace(/\D/g, '')), 0)}%</span>
                                                            )}
                                                            {bonusDetails.some(d => d.type === 'Utbytte') && (
                                                                <span className="text-emerald-400 font-bold">Total Utbytte: +{bonusDetails.filter(d => d.type === 'Utbytte').reduce((acc, curr) => acc + parseInt(curr.value.replace('+', '')), 0)}</span>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-slate-500 italic py-1">
                                                        Ingen utstyr eller bonuser aktiv for denne handlingen.
                                                    </div>
                                                )}
                                            </div>
                                        )}

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

                        {availableActions.length === 0 && (
                            <div className="text-center py-6 text-slate-500 italic text-xs">Ingen handlinger tilgjengelig</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
