import React, { useState, useMemo } from 'react';
import { useSimulation } from '../SimulationContext';
import { REFINERY_RECIPES, CRAFTING_RECIPES, RESOURCE_DETAILS, ITEM_TEMPLATES, VILLAGE_BUILDINGS, REPAIR_CONFIG } from '../constants';
import type { SimulationPlayer, SimulationRoom, EquipmentSlot } from '../simulationTypes';
import { GameButton } from '../ui/GameButton';
import { Info, Zap, TrendingUp, Package } from 'lucide-react';
import { checkActionRequirements } from '../utils/actionUtils';

import { ResourceIcon } from '../ui/ResourceIcon';

// Sub-components
import { ProductionHeader } from './ProductionHeader';
import { RecipeCard } from './RecipeCard';
import { RequirementList } from './RequirementList';
import { StatsComparison } from './StatsComparison';
import { RepairSlot } from './RepairSlot';

interface SimulationProductionProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    onAction: (action: any) => void;
}

export const SimulationProduction: React.FC<SimulationProductionProps> = React.memo(({ player, room, onAction }) => {

    const { productionContext, setActiveTab, actionLoading } = useSimulation();
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'PRODUCE' | 'REPAIR'>('PRODUCE');

    if (!productionContext) {
        return (
            <div className="bg-slate-900/90 border border-white/10 rounded-[3rem] p-12 shadow-2xl relative w-full max-w-lg animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl">⚠️</div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Utilgjengelig</h3>
                        <p className="text-slate-500 italic max-w-xs">Vennligst velg en produksjonsstasjon på kartet for å starte.</p>
                    </div>
                    <GameButton variant="ghost" onClick={() => setActiveTab('MAP')} className="border border-white/10">Tilbake til Kartet</GameButton>
                </div>
            </div>
        );
    }

    const { buildingId, type } = productionContext;
    const building = VILLAGE_BUILDINGS[buildingId];
    const isStationWithRepair = useMemo(() => !!REPAIR_CONFIG[buildingId], [buildingId]);

    // Filter recipes
    const recipes = useMemo(() => {
        return type === 'REFINE'
            ? Object.entries(REFINERY_RECIPES).filter(([_, r]) => r.buildingId === buildingId)
            : Object.entries(CRAFTING_RECIPES).filter(([_, r]) => r.buildingId === buildingId);
    }, [buildingId, type]);

    // Group recipes by level
    const recipesByLevel = useMemo(() => {
        const groups: Record<number, [string, any][]> = {};
        recipes.forEach(([id, r]) => {
            const lvl = r.level || 1;
            if (!groups[lvl]) groups[lvl] = [];
            groups[lvl].push([id, r]);
        });
        return Object.entries(groups).sort(([a], [b]) => parseInt(a) - parseInt(b));
    }, [recipes]);

    const selectedRecipe = useMemo(() => {
        if (!selectedRecipeId) return null;
        return type === 'REFINE' ? REFINERY_RECIPES[selectedRecipeId] : CRAFTING_RECIPES[selectedRecipeId];
    }, [selectedRecipeId, type]);

    // Derived info for selected recipe
    const getOutputInfo = (_id: string, r: any) => {
        if (type === 'REFINE') {
            return {
                id: r.outputResource,
                name: (RESOURCE_DETAILS as any)[r.outputResource]?.label || r.outputResource,
                icon: (RESOURCE_DETAILS as any)[r.outputResource]?.icon || '📦',
                description: `Produserer ${r.outputAmount || r.output?.amount || 1} enheter med ${r.outputResource}.`
            };
        } else {
            const template = ITEM_TEMPLATES[r.outputItemId];
            return {
                id: r.outputItemId,
                name: template?.name || r.outputItemId,
                icon: template?.icon || '⚔️',
                description: template?.description || 'Et solid håndverk.'
            };
        }
    };

    const settlement = (room?.world?.settlement || {}) as any;
    const currentBuildingLevel = (settlement.buildings?.[buildingId]?.level as number) || 1;

    const handleProduce = () => {
        if (!selectedRecipeId) return;
        const recipe = type === 'REFINE' ? REFINERY_RECIPES[selectedRecipeId] : CRAFTING_RECIPES[selectedRecipeId];
        if (!recipe) return;

        // Locking check
        if ((recipe.level || 1) > currentBuildingLevel) return;

        if (type === 'REFINE') {
            onAction({ type: 'REFINE', recipeId: selectedRecipeId });
        } else {
            onAction({ type: 'CRAFT', subType: selectedRecipeId });
        }
    };

    return (
        <div className="bg-slate-900/90 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative w-full max-w-7xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300">
            {/* Close Button Trigger */}
            <button
                onClick={() => setActiveTab('MAP')}
                className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition-all z-10 group"
                title="Lukk"
            >
                <span className="text-2xl group-hover:rotate-90 transition-transform">✕</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* LEFT: CONTENT AREA */}
                <div className="flex-1 space-y-8">
                    <ProductionHeader
                        building={building}
                        currentBuildingLevel={currentBuildingLevel}
                        isStationWithRepair={isStationWithRepair}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />

                    {viewMode === 'PRODUCE' ? (
                        <div className="space-y-10">
                            {recipesByLevel.map(([levelStr, levelRecipes]) => {
                                const levelNum = parseInt(levelStr);
                                const isLocked = levelNum > currentBuildingLevel;

                                return (
                                    <div key={levelStr} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${isLocked ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                                                Tier {levelStr}
                                            </div>
                                            <div className="flex-1 h-px bg-white/5"></div>
                                            {isLocked && (
                                                <span className="text-[10px] font-bold text-slate-600 italic flex items-center gap-1">
                                                    <Package className="w-3 h-3" /> Oppgrader {building?.name} til Nivå {levelStr}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {levelRecipes.map(([id, r]: [string, any]) => {
                                                const actionPayload = type === 'REFINE' ? { type: 'REFINE', recipeId: id } : { type: 'CRAFT', subType: id };
                                                const check = checkActionRequirements(player, actionPayload);

                                                return (
                                                    <RecipeCard
                                                        key={id}
                                                        id={id}
                                                        isSelected={selectedRecipeId === id}
                                                        isLocked={isLocked}
                                                        canAfford={check.success}
                                                        info={getOutputInfo(id, r)}
                                                        onSelect={setSelectedRecipeId}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* REPAIR VIEW */
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {REPAIR_CONFIG[buildingId]?.slots.map((slot) => {
                                    const item = player.equipment[slot as EquipmentSlot];
                                    if (!item) return null;

                                    const config = REPAIR_CONFIG[buildingId];
                                    const canAfford = (player.resources.gold || 0) >= config.goldCost &&
                                        ((player.resources as any)[config.material] || 0) >= 1;

                                    return (
                                        <RepairSlot
                                            key={slot}
                                            slot={slot}
                                            item={item}
                                            canAfford={canAfford}
                                            actionLoading={!!actionLoading}
                                            onAction={onAction}
                                            buildingId={buildingId}
                                        />
                                    );
                                })}

                                {REPAIR_CONFIG[buildingId]?.slots.every(slot => !player.equipment[slot as EquipmentSlot]) && (
                                    <div className="col-span-full py-12 text-center bg-black/20 rounded-[2rem] border border-dashed border-white/5">
                                        <p className="text-slate-500 italic">Ingen relevante gjenstander utstyrt for reparasjon her.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: DETAILS PANEL */}
                <div className={`w-full lg:w-[450px] shrink-0 transition-all duration-500 ${viewMode === 'REPAIR' ? 'scale-95 opacity-80' : selectedRecipe ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                    {viewMode === 'REPAIR' ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-amber-500/20 rounded-[3rem] p-8 shadow-2xl sticky top-8">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] flex items-center justify-center text-6xl mx-auto shadow-2xl border-4 border-white/10 mb-6">
                                    ⚒️
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Vedlikehold</h3>
                                <p className="text-slate-400 text-sm font-medium px-4">Hold utstyret ditt i topp stand for maksimal effektivitet.</p>
                            </div>

                            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reparasjonskostnad</div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ResourceIcon resource="gold" size="sm" />
                                            <span className="text-sm font-bold text-slate-300">Gull</span>
                                        </div>
                                        <span className="text-amber-400 font-black">-{REPAIR_CONFIG[buildingId]?.goldCost || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ResourceIcon resource={REPAIR_CONFIG[buildingId]?.material || 'iron_ingot'} size="sm" />
                                            <span className="text-sm font-bold text-slate-300">{(RESOURCE_DETAILS as any)[REPAIR_CONFIG[buildingId]?.material || 'iron_ingot']?.label || 'Materiale'}</span>
                                        </div>
                                        <span className="text-amber-400 font-black">-1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                                <p className="text-xs text-indigo-300/70 italic text-center leading-relaxed">
                                    Hver reparasjon gjenoppretter 30 holdbarhetspoeng på den valgte gjenstanden.
                                </p>
                            </div>
                        </div>
                    ) : selectedRecipe ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 shadow-2xl sticky top-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-6xl mx-auto shadow-2xl border-4 border-white/10 mb-6 group-hover:rotate-6 transition-transform">
                                    {getOutputInfo(selectedRecipeId!, selectedRecipe).icon}
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{getOutputInfo(selectedRecipeId!, selectedRecipe).name}</h3>
                                <p className="text-slate-400 text-sm font-medium px-4">{getOutputInfo(selectedRecipeId!, selectedRecipe).description}</p>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-6">
                                <RequirementList recipe={selectedRecipe} player={player} />

                                {/* Production Stats / Bonuses */}
                                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <TrendingUp className="w-3 h-3" /> Utbytte & Sammenligning
                                    </div>

                                    <StatsComparison recipe={selectedRecipe} player={player} type={type} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">Base Utbytte</div>
                                            <div className="text-xl font-black text-white">+{selectedRecipe.outputAmount || selectedRecipe.output?.amount || 1}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-emerald-500 font-bold uppercase">Utbytte-bonus (Evne)</div>
                                            <div className="text-xl font-black text-emerald-400">+{Math.floor((selectedRecipe.outputAmount || 1) * (player.skills?.CRAFTING?.level || 0) * 0.05)}</div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-bold flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> XP Gevinst:</span>
                                        <span className="text-amber-500 font-black">+{selectedRecipe.xp || 10} Produksjon XP</span>
                                    </div>
                                </div>

                                <GameButton
                                    variant="primary"
                                    size="lg"
                                    className="h-20 text-xl w-full"
                                    onClick={handleProduce}
                                    disabled={!!actionLoading || (selectedRecipe.level || 1) > currentBuildingLevel || !checkActionRequirements(player, type === 'REFINE' ? { type: 'REFINE', recipeId: selectedRecipeId } : { type: 'CRAFT', subType: selectedRecipeId }).success}
                                >
                                    {(selectedRecipe.level || 1) > currentBuildingLevel ? 'KREVER OPPGRADERING' : 'START PRODUKSJON'}
                                </GameButton>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border-2 border-dashed border-white/10 rounded-[3rem]">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Info className="w-10 h-10 text-slate-600" />
                            </div>
                            <h4 className="text-xl font-black text-slate-400 mb-2">Ingen oppskrift valgt</h4>
                            <p className="text-sm text-slate-500 font-medium">Velg en gjenstand fra listen til venstre for å se detaljer og starte produksjon.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

SimulationProduction.displayName = 'SimulationProduction';
