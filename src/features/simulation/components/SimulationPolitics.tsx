import React, { useState } from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { handleGlobalBribe, handleShadowPledge, handleAbdicate } from '../globalActions';
import { GameCard } from '../ui/GameCard';
import { GameButton } from '../ui/GameButton';
import { Badge } from '../ui/Badge';
import { User, Gavel, Flag, Crown, LogOut } from 'lucide-react';

interface SimulationPoliticsProps {
    player: SimulationPlayer;
    regions: Record<string, any> | undefined;
    pin: string;
}

export const SimulationPolitics: React.FC<SimulationPoliticsProps> = ({ player, regions, pin }) => {
    const [bribeAmount, setBribeAmount] = useState(100);
    const [pledgeCandidate, setPledgeCandidate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Determine target region (Player's region or if they are King, maybe capital?)
    const targetRegionId = player.regionId === 'capital' ? 'capital' : player.regionId;

    // Defensive coding: If region is missing in data, create a virtual one to avoid UI crash/empty state
    let regionData = regions?.[targetRegionId];

    if (!regionData) {
        if (targetRegionId === 'capital') {
            regionData = {
                id: 'capital',
                name: 'Kongeriket (Hovedstaden)',
                rulerName: player.role === 'KING' ? player.name : 'Kongen',
                coup: { bribeProgress: 0 }
            };
        } else if (targetRegionId === 'region_vest') {
            regionData = {
                id: 'region_vest',
                name: 'Baroniet Vest',
                rulerName: 'Ingen',
                coup: { bribeProgress: 0 }
            };
        } else if (targetRegionId === 'region_ost') {
            regionData = {
                id: 'region_ost',
                name: 'Baroniet Øst',
                rulerName: 'Ingen',
                coup: { bribeProgress: 0 }
            };
        }
    }

    if (!regionData) return <div className="p-4 text-slate-500">Ingen regiondata tilgjengelig for {targetRegionId}.</div>;

    const currentRuler = regionData.rulerName || 'Ingen';
    const isRevolution = (regionData.coup?.bribeProgress || 0) >= 100;
    const election = regionData.activeElection;

    const handleDonate = async () => {
        setIsLoading(true);
        const res = await handleGlobalBribe(pin, player.id, { regionId: targetRegionId, amount: bribeAmount });
        if (res.success) {
            alert(res.message);
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    const handlePledge = async (candidateId: string) => {
        setIsLoading(true);
        const res = await handleShadowPledge(pin, player.id, targetRegionId, candidateId);
        if (res.success) {
            alert(res.message);
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    const onAbdicate = async () => {
        if (window.confirm("ADVARSEL: Er du sikker på at du vil abdisere? Du vil miste din tittel (Konge/Baron) og bli degradert til Bonde. Dette kan ikke angres.")) {
            if (window.confirm("ER DU HELT SIKKER? Handlingen trer i kraft umiddelbart.")) {
                setIsLoading(true);
                await handleAbdicate(pin, player.id);
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* HERADER */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Gavel size={120} />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Flag className="text-rose-500" />
                        Politisk Senter: {regionData.name}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-lg">
                        Her avgjøres regionens skjebne. Støtt opprørere, bestikk folket, eller følg med på valgloftene.
                    </p>
                </div>
            </div>

            {/* STATUS: REVOLUTION OR STABILITY */}
            <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-300 uppercase text-xs tracking-widest">Opprørsstemning</h3>
                    <span className="font-mono font-bold text-rose-400">{(regionData.coup?.bribeProgress || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                    {/* Threshold Marker */}
                    <div className="absolute top-0 bottom-0 left-[100%] w-0.5 bg-white z-10 opacity-50" title="Revolusjon"></div>

                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, regionData.coup?.bribeProgress || 0)}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">
                    Når måleret når 100%, vil folket styrte herskeren og utlyse nyvalg.
                </p>
            </div>

            {/* ELECTION MONITOR */}
            {election ? (
                <GameCard title="Valg Pågår!" className="border-rose-500/30 bg-rose-950/10">
                    <div className="p-4 space-y-4">
                        <p className="text-rose-200">Tronen er ledig! Kandidater kjemper om makten.</p>
                        <div className="space-y-2">
                            {Object.values(election.candidates || {}).map((c: any) => (
                                <div key={c.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="font-bold text-white">{c.name}</span>
                                    <Badge variant="outline">{c.votes} stemmer</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </GameCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FOLKEGAVEN (THE BRIBE) */}
                    <GameCard title="Folkegaven" icon={<User className="text-amber-400" />} className="border-amber-500/20 bg-amber-950/10">
                        <div className="space-y-4">
                            <p className="text-sm text-amber-100/80">
                                Doner gull direkte til bøndene for å så tvil om herskerens evne til å forsørge dem. Dette øker opprørsfaren.
                            </p>

                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                                <input
                                    type="range"
                                    min="10"
                                    max="1000"
                                    step="10"
                                    value={bribeAmount}
                                    onChange={(e) => setBribeAmount(parseInt(e.target.value))}
                                    className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="font-mono text-amber-400 font-bold min-w-[60px] text-right">{bribeAmount}g</div>
                            </div>

                            <GameButton
                                variant="primary"
                                onClick={handleDonate}
                                disabled={isLoading || (player.resources.gold || 0) < bribeAmount}
                                className="w-full bg-amber-600 hover:bg-amber-500 border-amber-400/50"
                            >
                                Gi Folkegave
                            </GameButton>
                        </div>
                    </GameCard>

                    {/* SHADOW PLEDGE */}
                    <GameCard title="Skyggeløftet" icon={<Crown className="text-purple-400" />} className="border-purple-500/20 bg-purple-950/10">
                        <div className="space-y-4">
                            <p className="text-sm text-purple-100/80">
                                Lov din troskap til en kandidat *før* revolusjonen starter. Hvis opprøret lykkes, vil din stemme automatisk telles.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Kandidat-ID (Spiller ID)</label>
                                <input
                                    type="text"
                                    value={pledgeCandidate}
                                    onChange={(e) => setPledgeCandidate(e.target.value)}
                                    placeholder="Lim inn Spiller ID..."
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <GameButton
                                variant="ghost"
                                onClick={() => handlePledge(pledgeCandidate)}
                                disabled={isLoading || !pledgeCandidate}
                                className="w-full hover:bg-purple-900/30 text-purple-200 border-purple-500/30"
                            >
                                Avgi Løfte
                            </GameButton>
                        </div>
                    </GameCard>
                </div>
            )}

            {/* DANGER ZONE: ABDICATION */}
            {['KING', 'BARON'].includes(player.role) && (
                <div className="pt-8 border-t border-white/10 mt-8">
                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-rose-400 font-bold uppercase text-sm">Abdiser fra tronen</h4>
                            <p className="text-rose-300/60 text-xs mt-1">
                                Gi fra deg makten frivillig. Du vil bli degradert til Bonde.
                            </p>
                        </div>
                        <button
                            onClick={onAbdicate}
                            className="px-4 py-2 bg-rose-900/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <LogOut size={14} /> Abdiser
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
