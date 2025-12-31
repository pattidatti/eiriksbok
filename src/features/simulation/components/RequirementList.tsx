import React from 'react';
import { Package } from 'lucide-react';
import { ResourceIcon } from '../ui/ResourceIcon';
import { RESOURCE_DETAILS } from '../constants';

interface RequirementListProps {
    recipe: any;
    player: any;
}

export const RequirementList: React.FC<RequirementListProps> = ({ recipe, player }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Package className="w-3 h-3" /> Ressurskrav
            </div>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(recipe.input).map(([resId, amt]) => {
                    const playerHas = (player.resources as any)?.[resId] || 0;
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
                    <span className="text-sm font-black text-indigo-400">-{recipe.stamina || 0}</span>
                </div>
            </div>
        </div>
    );
};
