import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ITEM_TEMPLATES } from '../constants';

interface StatsComparisonProps {
    recipe: any;
    player: any;
    type: 'REFINE' | 'CRAFT';
}

export const StatsComparison: React.FC<StatsComparisonProps> = ({ recipe, player, type }) => {
    if (type !== 'CRAFT') return null;

    const nextItem = ITEM_TEMPLATES[recipe.outputItemId];
    if (!nextItem) return null;

    const currentItem = Object.values(player.equipment || {}).find((e: any) => e && e.type === nextItem.type);

    return (
        <div className="space-y-4 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Sammenlignet med ditt utstyr:</span>
                {currentItem ? (
                    <span className="text-white font-black flex items-center gap-1">{(currentItem as any).icon} {(currentItem as any).name}</span>
                ) : (
                    <span className="text-slate-600 italic">Ingenting utstyrt</span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2">
                {/* Utbytte-bonus comparison */}
                {((nextItem.stats?.yieldBonus || 0) > 0 || ((currentItem as any)?.stats?.yieldBonus || 0) > 0) && (
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400">Utbytte-bonus</span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">{(currentItem as any)?.stats?.yieldBonus || 0}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <span className="text-emerald-400 font-black">+{nextItem.stats?.yieldBonus || 0}</span>
                        </div>
                    </div>
                )}
                {/* Speed Bonus comparison */}
                {((nextItem.stats?.speedBonus || 1) > 1 || ((currentItem as any)?.stats?.speedBonus || 1) > 1) && (
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400">Arbeidshastighet</span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">{Math.round((((currentItem as any)?.stats?.speedBonus || 1) - 1) * 100)}%</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <span className="text-blue-400 font-black">+{Math.round(((nextItem.stats?.speedBonus || 1) - 1) * 100)}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
