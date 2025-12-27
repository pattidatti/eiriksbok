import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { RESOURCE_DETAILS, ROLE_TITLES } from '../constants';
import { useSimulation } from '../SimulationContext';
import { GameCard } from '../ui/GameCard';
import { GameButton } from '../ui/GameButton';
import { ResourceIcon } from '../ui/ResourceIcon';
import { Badge } from '../ui/Badge';
import { ArrowLeftRight, ShoppingBag, Ship } from 'lucide-react';

interface SimulationMarketProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    onAction: (action: any) => void;
}

export const SimulationMarket: React.FC<SimulationMarketProps> = ({ player, room, onAction }) => {
    const { actionLoading } = useSimulation();

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-wider uppercase flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-game-gold" />
                        Markedshandel
                    </h2>
                    <p className="text-game-stone_light text-sm mt-1">Kjøp og selg varer i {room.markets?.[player.regionId || 'capital'] ? 'lokalmarkedet' : 'hovedstaden'}.</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-game-gold/30">
                    <span className="text-game-stone_light text-xs font-bold uppercase">Saldo:</span>
                    <ResourceIcon resource="gold" amount={player.resources.gold} size="md" />
                </div>
            </div>

            {/* LOCAL MARKET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries((room.markets?.[player.regionId || 'capital'] || room.market) || {}).map(([resId, item]: [string, any]) => {
                    const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                    const price = item.price || 0;
                    const stock = item.stock || 0;
                    const playerStock = (player.resources as any)[resId] || 0;

                    return (
                        <GameCard key={resId} className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl bg-black/20 p-3 rounded-xl">{details.icon}</div>
                                    <div>
                                        <h3 className="font-display font-bold text-xl text-white capitalize">{details.label}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">Lager: {stock}</Badge>
                                            <Badge variant="default">Eier: {playerStock}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-game-stone_light uppercase font-bold">Pris pr. enhet</div>
                                    <div className="text-2xl font-bold text-game-gold">{price.toFixed(1)}g</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
                                <GameButton
                                    variant="primary" // BUY is usually primary
                                    onClick={() => onAction({ type: 'BUY', resource: resId })}
                                    disabled={(player.resources.gold || 0) < price || stock <= 0 || !!actionLoading}
                                    icon={<ShoppingBag className="w-4 h-4" />}
                                >
                                    KJØP
                                </GameButton>
                                <GameButton
                                    variant="wood" // SELL variant
                                    onClick={() => onAction({ type: 'SELL', resource: resId })}
                                    disabled={playerStock < 1 || !!actionLoading}
                                    icon={<ArrowLeftRight className="w-4 h-4" />}
                                >
                                    SELG
                                </GameButton>
                            </div>
                        </GameCard>
                    );
                })}
            </div>

            {/* MERCHANT: FOREIGN MARKETS */}
            {player.role === 'MERCHANT' && (
                <div className="mt-12 space-y-6 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <Ship className="w-6 h-6 text-blue-400" />
                            Handelsruter
                        </h3>
                        <Badge variant="role">Kun for Kjøpmenn</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.values(room.regions || {})
                            .concat([{ id: 'capital', name: 'Kongeriket (Hovedstaden)' } as any])
                            .filter((r: any) => r.id !== player.regionId && r.id !== undefined)
                            .map((region: any) => {
                                const targetMarket = room.markets?.[region.id];
                                if (!targetMarket) return null;

                                return (
                                    <GameCard key={region.id} title={region.name} className="bg-indigo-950/30 border-indigo-500/20">
                                        <div className="space-y-3">
                                            {['grain', 'wood', 'iron'].map(res => {
                                                const item = (targetMarket as any)[res];
                                                if (!item) return null;
                                                const foreignPrice = item.price;
                                                const details = (RESOURCE_DETAILS as any)[res] || { label: res, icon: '📦' };

                                                return (
                                                    <div key={res} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span>{details.icon}</span>
                                                            <span className="text-sm font-bold text-game-stone_light capitalize">{details.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-game-gold font-bold text-sm">{foreignPrice.toFixed(0)}g</span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => onAction({ type: 'TRADE_ROUTE', targetRegionId: region.id, resource: res, action: 'IMPORT' })}
                                                                    disabled={!!actionLoading}
                                                                    className="px-2 py-1 bg-emerald-900/50 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors"
                                                                    title="Importer (Kjøp herfra)"
                                                                >
                                                                    IMP
                                                                </button>
                                                                <button
                                                                    onClick={() => onAction({ type: 'TRADE_ROUTE', targetRegionId: region.id, resource: res, action: 'EXPORT' })}
                                                                    disabled={!!actionLoading}
                                                                    className="px-2 py-1 bg-red-900/50 text-red-400 text-[10px] font-bold rounded border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors"
                                                                    title="Eksporter (Selg hit)"
                                                                >
                                                                    EXP
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </GameCard>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};
