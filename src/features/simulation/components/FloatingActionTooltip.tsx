import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
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

    const containerRef = useRef<HTMLDivElement>(null);
    const top = (viewingRegionId === 'region_ost' && poi.ost ? poi.ost.top : poi.top);
    const left = (viewingRegionId === 'region_ost' && poi.ost ? poi.ost.left : poi.left);

    const [adjustedTransform, setAdjustedTransform] = useState({ x: '3rem', y: '-50%' });
    const [isReady, setIsReady] = useState(false);

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

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const parent = containerRef.current.offsetParent;
        if (!parent) {
            setIsReady(true);
            return;
        }
        const parentRect = parent.getBoundingClientRect();

        const xPos = parseFloat(left);
        const yPos = parseFloat(top);

        // 1. Horizontal Logic - Pivot to side with most space
        // Use a 50% threshold to decide side
        const xShift = xPos < 50 ? '3rem' : 'calc(-100% - 3rem)';

        // 2. Vertical Containment - Start centered, then clamp
        // We calculate the theoretical top/bottom based on current top and height
        const theoreticalTop = (yPos / 100) * parentRect.height - (rect.height / 2);
        const theoreticalBottom = theoreticalTop + rect.height;

        let yShift = '-50%';

        // Manual Clamping relative to parent
        if (theoreticalTop < 20) {
            const nudge = 20 - theoreticalTop;
            yShift = `calc(-50% + ${nudge}px)`;
        } else if (theoreticalBottom > parentRect.height - 20) {
            const nudge = theoreticalBottom - (parentRect.height - 20);
            yShift = `calc(-50% - ${nudge}px)`;
        }

        setAdjustedTransform({ x: xShift, y: yShift });
        setIsReady(true);
    }, [top, left, availableActions.length, showDetails]);


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

    // --- Active Process Logic ---
    const activeProcess = useMemo(() => {
        return player.activeProcesses?.find(p => p.locationId === poi.id);
    }, [player.activeProcesses, poi.id]);

    const calculateTimeLeft = () => {
        if (!activeProcess) return 0;
        const now = Date.now();
        return Math.max(0, activeProcess.readyAt - now);
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!activeProcess) return;
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (left <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [activeProcess]);

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    // --- Render ---
    return (
        <>
            <div className="absolute inset-0 z-[90]" onClick={onClose} />
            <div
                ref={containerRef}
                style={{
                    top, left,
                    transform: `translate(${adjustedTransform.x}, ${adjustedTransform.y})`,
                    visibility: isReady ? 'visible' : 'hidden',
                    opacity: isReady ? 1 : 0
                }}
                className={`absolute z-[100] ${isReady ? 'animate-in fade-in zoom-in' : ''} duration-200 pointer-events-auto`}
            >
                <div className="bg-slate-900/98 backdrop-blur-3xl border border-white/20 rounded-[1.8rem] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] min-w-[280px] w-max max-w-[360px] relative transition-all duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl drop-shadow-md">{poi.icon}</span>
                            <div className="flex flex-col">
                                <h3 className="font-black text-white text-sm uppercase tracking-[0.15em] leading-tight opacity-90">{poi.label}</h3>
                                {showDetails && <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider animate-pulse">Detaljert Visning</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!activeProcess && (
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${showDetails ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                                    title="Vis bonuser og detaljer"
                                >
                                    📊
                                </button>
                            )}
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                        </div>
                    </div>

                    {/* Actions List OR Process Status */}
                    <div className="space-y-3">
                        {activeProcess ? (
                            <div className="w-full">
                                {timeLeft <= 0 ? (
                                    <div className="p-1 bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 rounded-xl border border-emerald-500/30 animate-pulse">
                                        <button
                                            onClick={() => onAction({ type: 'HARVEST', locationId: poi.id })}
                                            className="w-full group relative overflow-hidden rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white p-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                                        >
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-2xl font-black uppercase tracking-widest italic drop-shadow-md">Innhøsting</span>
                                                    <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider opacity-90">Klar til å hentes!</span>
                                                </div>
                                                <span className="text-4xl animate-bounce drop-shadow-lg">✨</span>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-950/50 rounded-xl border border-white/10 flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center relative">
                                            <span className="text-3xl animate-pulse">🌱</span>
                                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-emerald-900/30"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    className="text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-linear"
                                                    strokeDasharray={`${(1 - (timeLeft / activeProcess.duration)) * 100}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-lg font-bold text-white tracking-widest uppercase">Tiden går...</span>
                                            <span className="text-sm font-mono text-emerald-400">{formatTime(timeLeft)}</span>
                                        </div>
                                        <div className="w-full bg-emerald-900/30 h-1.5 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                style={{ width: `${(1 - (timeLeft / activeProcess.duration)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            availableActions.map((action: any) => {
                                const bonusDetails = getBonusDetails(action.id);
                                const currentSeason = (room.world?.season || 'Spring') as any;
                                const currentWeather = (room.world?.weather || 'Clear') as any;

                                const isProduction = action.id.startsWith('REFINE_') || action.id.startsWith('CRAFT_') || action.id in CRAFTING_RECIPES;

                                // Check requirements
                                let canAfford = true;
                                let missingReason = '';
                                if (viewingRegionId !== player.regionId && player.role !== 'KING' && action.id !== 'MARKET_VIEW') {
                                    canAfford = false; missingReason = "Ikke ditt baroni";
                                } else {
                                    // If it's a production UI opener, we always allow opening
                                    if (!isProduction) {
                                        const check = checkActionRequirements(player, action.id, currentSeason, currentWeather);
                                        if (!check.success) { canAfford = false; missingReason = check.reason || 'Krav ikke møtt'; }
                                    }
                                }

                                // Simplified cost display for basic resources/stamina
                                const costLabel = getActionCostString(action.id, currentSeason, currentWeather);
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
                                                            onClick={() => onAction({ type: action.id, locationId: poi.id })}
                                                            disabled={!canAfford}
                                                            className={`text-left group w-full ${!canAfford && 'cursor-not-allowed opacity-50'}`}
                                                        >
                                                            <div className="flex justify-between items-center gap-3">
                                                                <div className="flex gap-3 items-center min-w-0">
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className={`text-base font-black truncate block ${canAfford ? isProduction ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-white group-hover:text-amber-400' : 'text-slate-400'}`}>
                                                                            {action.label} {isProduction ? '🔨' : ''}
                                                                        </span>
                                                                        {!canAfford && <span className="text-xs font-black text-rose-500/80 uppercase tracking-widest leading-tight">{missingReason}</span>}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    {/* Compact Tool Indicator */}
                                                                    {(() => {
                                                                        const equipment = getActionEquipment(player, action.id);
                                                                        const bestTool = equipment.find(item => item.maxDurability > 0);
                                                                        if (bestTool) {
                                                                            const durabilityPct = (bestTool.durability / bestTool.maxDurability) * 100;
                                                                            return (
                                                                                <div className="flex flex-col items-end gap-1">
                                                                                    <div className={`flex items-center gap-2 bg-slate-800/80 px-2 py-1.5 rounded-xl border ${durabilityPct < 10 ? 'border-rose-500 animate-pulse' : 'border-white/20'} shadow-lg tool-glow`} title={`${bestTool.name}: ${Math.round(durabilityPct)}%`}>
                                                                                        <span className="text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{bestTool.icon}</span>
                                                                                        <div className="w-10 h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                                                                                            <div
                                                                                                className={`h-full rounded-full transition-all duration-500 ${durabilityPct > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : durabilityPct > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                                                                                                style={{ width: `${durabilityPct}%` }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    {durabilityPct < 10 && (
                                                                                        <span className="text-xs font-black text-rose-500 uppercase tracking-tighter animate-bounce">Lite holdbarhet!</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}

                                                                    {costLabel && !isProduction && <span className={`text-sm font-black bg-black/40 px-2 py-1 rounded-lg border leading-none ${isProduction ? 'border-indigo-500/30 text-indigo-400' : 'border-white/10 text-slate-300'}`}>{costLabel}</span>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <div className="flex justify-between items-center w-full border-b border-white/5 pb-2 mb-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-white leading-tight">{action.label}</span>
                                                                {!canAfford && <div className="text-xs font-black text-rose-500 uppercase tracking-widest mt-0.5">{missingReason}</div>}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {/* Compact Tool Indicator for Variant Header */}
                                                                {(() => {
                                                                    const equipment = getActionEquipment(player, action.id);
                                                                    const bestTool = equipment.find(item => item.maxDurability > 0);
                                                                    if (bestTool) {
                                                                        const durabilityPct = (bestTool.durability / bestTool.maxDurability) * 100;
                                                                        return (
                                                                            <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-white/20 shadow-lg animate-shimmer tool-glow" title={`${bestTool.name}: ${Math.round(durabilityPct)}%`}>
                                                                                <span className="text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{bestTool.icon}</span>
                                                                                <div className="w-10 h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                                                                                    <div
                                                                                        className={`h-full rounded-full transition-all duration-500 ${durabilityPct > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : durabilityPct > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                                                                                        style={{ width: `${durabilityPct}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                                {costLabel && <span className="text-xs font-black border border-white/10 px-2 py-1 rounded uppercase tracking-widest text-slate-500">{costLabel}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Simplified Bonus Badges and Variants */}
                                            {!showDetails && bonusDetails.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {bonusDetails.slice(0, 3).map((d, i) => (
                                                        <div key={i} className={`flex items-center gap-1 text-xs font-black uppercase px-2 py-0.5 rounded-full border ${d.type === 'Fart' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                                            {d.value} {d.type}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {variants && variants.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2 mt-2">
                                                    {variants.map(variant => (
                                                        <button
                                                            key={variant.id}
                                                            onClick={() => onAction({ type: action.id, method: variant.id, locationId: poi.id })}
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
                            })
                        )}

                        {/* CONSOLIDATED PROGRESSION FOOTER */}
                        {(() => {
                            // Find the best next upgrade for the primary tools relevant here
                            const primaryActions = availableActions.map((a: any) => a.id);
                            const equipment = Object.values(player.equipment || {}) as EquipmentItem[] | any;

                            // 1. Identify relevant tools for these actions
                            const relevantTools = Object.values(ITEM_TEMPLATES).filter(t =>
                                t.relevantActions?.some(ra => primaryActions.includes(ra))
                            );

                            // 2. For each tool type, find if player has it OR find the lowest level one
                            const recommendations = relevantTools.map(template => {
                                const playerItem = equipment.find((item: any) => item.id === template.id || item.id.startsWith(template.id + '_'));

                                if (playerItem) {
                                    // Player has it, recommend NEXT tier
                                    const nextId = template.nextTierId;
                                    return nextId ? ITEM_TEMPLATES[nextId] : null;
                                } else {
                                    // Player DOES NOT have it, recommend THIS tier if it's the starter (lvl 1)
                                    // Actually, let's recommend the lowest level version of this tool type
                                    return template.level === 1 ? template : null;
                                }
                            }).filter(Boolean);

                            // 3. Remove duplicates and pick the most relevant one
                            const finalUpgrades = recommendations.filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i);

                            if (finalUpgrades.length > 0) {
                                const upg = finalUpgrades[0];
                                if (!upg) return null;

                                // 4. Check if we meet building requirements for this upgrade
                                const upgRecipe = Object.values(CRAFTING_RECIPES).find((r: any) => r.outputItemId === upg.id);
                                const settlement = room.world?.settlement || { buildings: {} };
                                const buildingId = upgRecipe?.buildingId || 'great_forge';
                                const currentBuildingLevel = (settlement.buildings as any)?.[buildingId]?.level || 1;
                                const requiredLevel = upgRecipe?.level || 1;
                                const isLockedByBuilding = currentBuildingLevel < requiredLevel;
                                const buildingName = (VILLAGE_BUILDINGS as any)[buildingId]?.name || 'Smien';

                                const currentItem = equipment.find((item: any) => {
                                    if (!item) return false;
                                    const tid = Object.keys(ITEM_TEMPLATES).find(k => item.id === k || item.id.startsWith(k + '_'));
                                    const template = tid ? ITEM_TEMPLATES[tid] : null;
                                    return (template as any)?.relevantActions?.some((ra: string) => primaryActions.includes(ra));
                                });

                                return (
                                    <div className="mt-5 pt-5 border-t border-white/10">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isLockedByBuilding ? 'bg-slate-500' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className={`text-xs font-bold uppercase ${isLockedByBuilding ? 'text-slate-500' : 'text-amber-500/80'}`}>
                                                        {isLockedByBuilding ? `Krever ${buildingName} Lvl ${requiredLevel}` : 'Oppgradering Tilgjengelig'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group">
                                                {/* Background Shimmer */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                                {/* Current */}
                                                <div className="flex flex-col items-center gap-1 z-10">
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 opacity-60">
                                                        {currentItem?.icon || '❓'}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Nå</span>
                                                </div>

                                                {/* Progress Arrow */}
                                                <div className="flex flex-col items-center gap-1 flex-1">
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className={`w-1 h-1 rounded-full bg-indigo-500/30 animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                                                        ))}
                                                        <ArrowRight className="w-4 h-4 text-indigo-500/50 mx-2" />
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className={`w-1 h-1 rounded-full bg-indigo-500/30 animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                                                        ))}
                                                    </div>
                                                    {upg.stats?.yieldBonus && (
                                                        <span className="text-xs font-black text-emerald-400">+{upg.stats.yieldBonus} Utbytte</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-center gap-1 z-10 transition-transform group-hover:scale-105 duration-300">
                                                    <div className="relative">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-lg transition-all duration-300 ${isLockedByBuilding ? 'bg-slate-900/50 border-white/5 opacity-40 grayscale' : 'bg-indigo-600/20 border-indigo-500/40 shadow-[0_0_20px_rgba(79,70,229,0.2)] animate-shimmer upgrade-glow'}`}>
                                                            {upg.icon}
                                                        </div>
                                                        {!isLockedByBuilding && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                                                                <TrendingUp className="w-3 h-3 text-slate-900" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs font-black uppercase tracking-tighter ${isLockedByBuilding ? 'text-slate-600' : 'text-amber-500'}`}>{upg.name}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-400 text-center font-medium italic">
                                                {isLockedByBuilding
                                                    ? `Oppgrader ${buildingName} til nivå ${requiredLevel} i landsbyen for å smi denne.`
                                                    : `Besøk ${buildingName} i landsbyen for å smi denne.`}
                                            </p>
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
