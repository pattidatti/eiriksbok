import React, { useState } from 'react';
import { useSimulation } from '../SimulationContext';
import { REFINERY_RECIPES, CRAFTING_RECIPES, RESOURCE_DETAILS, ITEM_TEMPLATES, VILLAGE_BUILDINGS } from '../constants';
import type { SimulationPlayer } from '../simulationTypes';
import { GameButton } from '../ui/GameButton';
import { ResourceIcon } from '../ui/ResourceIcon';
import { ChevronRight, Info, Zap, TrendingUp, Package } from 'lucide-react';
import { checkActionRequirements } from '../utils/actionUtils';

interface SimulationProductionProps {
    player: SimulationPlayer;
    onAction: (action: any) => void;
}

export const SimulationProduction: React.FC<SimulationProductionProps> = ({ player, onAction }) => {
    const { productionContext, setActiveTab, actionLoading } = useSimulation();
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    if (!productionContext) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
                Seksjonen er utilgjengelig. Vennligst velg en produksjonsstasjon på kartet.
                <GameButton variant="ghost" onClick={() => setActiveTab('MAP')} className="mt-4 border border-white/10">Tilbake til Kartet</GameButton>
            </div>
        );
    }

    const { buildingId, type } = productionContext;
    const building = VILLAGE_BUILDINGS[buildingId];

    // Filter recipes
    const recipes = type === 'REFINE'
        ? Object.entries(REFINERY_RECIPES).filter(([_, r]) => r.buildingId === buildingId)
        : Object.entries(CRAFTING_RECIPES).filter(([_, r]) => r.buildingId === buildingId);

    const selectedRecipe = selectedRecipeId
        ? (type === 'REFINE' ? REFINERY_RECIPES[selectedRecipeId] : CRAFTING_RECIPES[selectedRecipeId])
        : null;

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

    const handleProduce = () => {
        if (!selectedRecipeId) return;
        if (type === 'REFINE') {
            onAction({ type: 'REFINE', recipeId: selectedRecipeId });
        } else {
            onAction({ type: 'CRAFT', subType: selectedRecipeId });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto pb-20">

            {/* LEFT: RECIPE LIST */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-indigo-500/30">
                            {building?.icon || '🏢'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{building?.name || 'Produksjon'}</h2>
                            <p className="text-slate-400 text-sm font-medium">{building?.description}</p>
                        </div>
                    </div>
                    <GameButton variant="ghost" size="sm" onClick={() => setActiveTab('MAP')} className="border border-white/10">Tilbake</GameButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recipes.map(([id, r]) => {
                        const info = getOutputInfo(id, r);
                        const isSelected = selectedRecipeId === id;
                        const actionPayload = type === 'REFINE' ? { type: 'REFINE', recipeId: id } : { type: 'CRAFT', subType: id };
                        const check = checkActionRequirements(player, actionPayload);
                        const canAfford = check.success;

                        return (
                            <button
                                key={id}
                                onClick={() => setSelectedRecipeId(id)}
                                className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all group ${isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.2)]'
                                    : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-800/80 shadow-xl'
                                    }`}
                            >
                                <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                    {info.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-lg font-black text-white leading-tight">{info.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${canAfford ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${canAfford ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                            {canAfford ? 'Klar til produksjon' : 'Mangler ressurser'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT: DETAILS PANEL */}
            <div className={`w-full lg:w-[450px] shrink-0 transition-opacity duration-300 ${!selectedRecipe ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                {selectedRecipe ? (
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
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Package className="w-3 h-3" /> Ressurskrav
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(selectedRecipe.input).map(([resId, amt]) => {
                                        const playerHas = (player.resources as any)[resId] || 0;
                                        const targets = amt as number;
                                        const isMet = playerHas >= targets;
                                        return (
                                            <div key={resId} className={`flex items-center justify-between p-3 rounded-2xl border ${isMet ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                <div className="flex items-center gap-3">
                                                    <ResourceIcon resource={resId} size="sm" />
                                                    <span className={`text-sm font-bold ${isMet ? 'text-slate-200' : 'text-slate-400'}`}>{(RESOURCE_DETAILS as any)[resId]?.label || resId}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${isMet ? 'text-emerald-400' : 'text-rose-400'}`}>{playerHas}</span>
                                                    <span className="text-slate-600">/</span>
                                                    <span className="text-sm font-black text-slate-200">{targets}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* Stamina */}
                                    <div className="flex items-center justify-between p-3 rounded-2xl border bg-indigo-500/5 border-indigo-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center text-xl">⚡</div>
                                            <span className="text-sm font-bold text-slate-200">Stamina-kostnad</span>
                                        </div>
                                        <span className="text-sm font-black text-indigo-400">-{selectedRecipe.stamina || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Production Stats / Bonuses */}
                            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <TrendingUp className="w-3 h-3" /> Forventet Utbytte
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Base Yield</div>
                                        <div className="text-xl font-black text-white">+{selectedRecipe.outputAmount || selectedRecipe.output?.amount || 1}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-emerald-500 font-bold uppercase">Skill Bonus</div>
                                        <div className="text-xl font-black text-emerald-400">+{Math.floor((selectedRecipe.outputAmount || 1) * (player.skills?.CRAFTING?.level || 0) * 0.05)}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-bold flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> XP Gevinst:</span>
                                    <span className="text-amber-500 font-black">+{selectedRecipe.xp || 10} Krafting XP</span>
                                </div>
                            </div>

                            <GameButton
                                variant="primary"
                                size="lg"
                                className="h-20 text-xl w-full"
                                onClick={handleProduce}
                                disabled={!!actionLoading || !checkActionRequirements(player, type === 'REFINE' ? { type: 'REFINE', recipeId: selectedRecipeId } : { type: 'CRAFT', subType: selectedRecipeId }).success}
                            >
                                START PRODUKSJON
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
    );
};
