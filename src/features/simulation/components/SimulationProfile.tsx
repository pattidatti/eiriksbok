import React from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { ROLE_TITLES, LEVEL_XP, RANK_BENEFITS, ACHIEVEMENT_TITLES } from '../constants';
import { Badge } from '../ui/Badge';

interface SimulationProfileProps {
    player: SimulationPlayer;
    regions: Record<string, any>;
    allPlayers: Record<string, SimulationPlayer>;
}

export const SimulationProfile: React.FC<SimulationProfileProps> = React.memo(({ player, regions, allPlayers }) => {
    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {/* PROFILE HEADER */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative z-10">
                    <div className="w-40 h-40 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-7xl border-4 border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden group">
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <span className="group-hover:scale-110 transition-transform duration-500">
                                {player.role === 'KING' ? '👑' : player.role === 'BARON' ? '🏰' : player.role === 'SOLDIER' ? '⚔️' : player.role === 'MERCHANT' ? '💰' : '🌾'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex flex-col">
                                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase drop-shadow-lg flex items-center gap-4">
                                        {player.name}
                                        {player.achievements && player.achievements.length > 0 && (
                                            <span className="text-2xl font-black text-indigo-400 italic lowercase tracking-tight opacity-80 ring-1 ring-white/10 px-3 py-1 rounded-xl bg-black/40">
                                                "{ACHIEVEMENT_TITLES[player.achievements[player.achievements.length - 1].name] || player.achievements[player.achievements.length - 1].name}"
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                <Badge variant="role" className="scale-125 origin-left px-6 py-2">
                                    {(ROLE_TITLES as any)[player.role][Math.min(player.stats.level, (ROLE_TITLES as any)[player.role].length) - 1]}
                                </Badge>
                            </div>

                            {/* HIERARCHY INFO */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 opacity-60">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                                    Medlem av {regions?.[player.regionId]?.name || 'Kongeriket'}
                                </div>
                                {player.role !== 'KING' && (
                                    <>
                                        {player.regionId && player.regionId !== 'capital' && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                                                Styres av: <span className="text-white">
                                                    {Object.values(allPlayers || {}).find(p => p.role === 'BARON' && p.regionId === player.regionId)?.name || 'Vakant'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full" />
                                            Konungr: <span className="text-white">
                                                {Object.values(allPlayers || {}).find(p => p.role === 'KING')?.name || 'Ingen'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>


                        {/* XP PROGRESSION (RAW NUMBERS) */}
                        <div className="space-y-4 max-w-xl">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Rang-erfaring</span>
                                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                                        <span>{player.stats.xp}</span>
                                        <span className="text-slate-600 text-lg">/ {LEVEL_XP[player.stats.level] || 'MAX'} XP</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nivå</span>
                                    <div className="text-3xl font-black text-white italic">Lvl {player.stats.level}</div>
                                </div>
                            </div>
                            <div className="h-4 bg-black/60 rounded-full p-1 border border-white/10 shadow-inner group">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-white rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.6)] relative overflow-hidden"
                                    style={{ width: `${Math.min(100, (player.stats.xp / (LEVEL_XP[player.stats.level] || player.stats.xp)) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* RANK MILESTONES & BENEFITS */}
                <div className="lg:col-span-12 xl:col-span-8 bg-slate-900/60 p-8 rounded-[3rem] border border-white/10">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                            <span className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">📈</span>
                            Din Reise & Rang
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {(ROLE_TITLES as any)[player.role].map((title: string, index: number) => {
                            const lvlReq = index + 1;
                            const isUnlocked = player.stats.level >= lvlReq;
                            const isCurrent = player.stats.level === lvlReq;
                            const roleBenefits = RANK_BENEFITS[player.role] || [];
                            const currentBenefits = roleBenefits[index] || ['Låser opp unike fordeler for din rolle.'];


                            return (
                                <div
                                    key={title}
                                    className={`
                                        relative p-6 rounded-2xl border transition-all duration-300 flex items-center gap-6
                                        ${isCurrent ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.2)]' :
                                            isUnlocked ? 'bg-white/5 border-white/10 opacity-70' :
                                                'bg-black/20 border-white/5 opacity-30 grayscale'}
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-inner
                                        ${isUnlocked ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}
                                    `}>
                                        {lvlReq}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-3">
                                            <h4 className={`text-xl font-black uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                {title}
                                            </h4>
                                            {isCurrent && <span className="bg-white text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Aktiv</span>}
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            {currentBenefits.map((b: string, i: number) => (
                                                <p key={i} className="text-xs font-medium text-slate-400 flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                                                    {b}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    {!isUnlocked && (
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mål</span>
                                            <span className="text-sm font-black text-white">{LEVEL_XP[lvlReq - 1]} XP</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* STATUS BARS & ACHIEVEMENTS */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                    {/* Status Vitals */}
                    <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/10 space-y-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <span className="text-xl">⚖️</span> Status
                        </h3>

                        <div className="space-y-4">
                            {/* Loyalty / Legitimacy */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black tracking-[0.2em] mb-2 uppercase">
                                    <span className="text-slate-400">{player.role === 'PEASANT' || player.role === 'SOLDIER' ? 'Lojalitet' : 'Legitimitet'}</span>
                                    <span className="text-white">{(player.status as any).loyalty || (player.status as any).legitimacy || 100}%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700"
                                        style={{ width: `${(player.status as any).loyalty || (player.status as any).legitimacy || 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Contribution */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black tracking-[0.2em] mb-2 uppercase">
                                    <span className="text-slate-400">Bidrag til Riket</span>
                                    <span className="text-white">{player.stats.contribution || 0}%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-700"
                                        style={{ width: `${player.stats.contribution || 10}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACHIEVEMENTS / PRESENTASJONER */}
                    <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/10 flex flex-col min-h-[400px]">
                        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-4">
                            <span className="text-xl">🏆</span> Presentasjoner
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            {/* Unlocked */}
                            {(player.achievements || []).map(ach => (
                                <div key={ach.id} className="group/ach relative aspect-square bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-all cursor-help overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/ach:opacity-100 transition-opacity" />
                                    <div className="text-4xl mb-1 drop-shadow-md">{ach.icon}</div>
                                    <div className="text-[8px] font-black text-indigo-300 uppercase tracking-tighter text-center px-1">
                                        {ACHIEVEMENT_TITLES[ach.name] || ach.name}
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover/ach:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                                        <div className="text-[10px] font-black text-white uppercase">{ach.name}</div>
                                        <div className="text-[8px] text-indigo-400 font-bold mt-1 tracking-widest uppercase">Tittel låst opp</div>
                                    </div>
                                </div>
                            ))}


                            {/* Placeholders / Locked */}
                            {[...Array(Math.max(0, 9 - (player.achievements?.length || 0)))].map((_, i) => (
                                <div key={i} className="aspect-square bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center text-2xl opacity-10 grayscale">
                                    🎖️
                                </div>
                            ))}
                        </div>

                        {(player.achievements?.length || 0) === 0 && (
                            <div className="mt-8 text-center px-4">
                                <p className="text-xs font-bold text-slate-500 italic">Du har ikke samlet noen utmerkelser ennå. Fortsett å spille for å fylle galleriet!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

SimulationProfile.displayName = 'SimulationProfile';
