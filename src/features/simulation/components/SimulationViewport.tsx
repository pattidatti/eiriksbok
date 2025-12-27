import React from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../../lib/firebase';
import type { SimulationPlayer, SimulationRoom, EquipmentItem } from '../simulationTypes';
import { RESOURCE_DETAILS, UPGRADES_LIST } from '../constants';

import { useSimulation } from '../SimulationContext';
import { WorldMap } from '../WorldMap';
import { SimulationMarket } from './SimulationMarket';
import { SimulationVault } from './SimulationVault';
import { SimulationSkills } from './SimulationSkills';


interface SimulationViewportProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    pin?: string;
    onAction: (action: any) => void;
}

export const SimulationViewport: React.FC<SimulationViewportProps> = ({ player, room, pin, onAction }) => {
    const { activeTab, setActiveTab, actionLoading } = useSimulation();

    // Helper to get friendly region name
    const getRegionName = (rId: string) => {
        if (!rId || rId === 'unassigned') return 'Ingen Region';
        if (rId === 'capital') return 'Kongeriket (Hovedstaden)';
        if (rId === 'test_region') return 'Test Baroniet';

        if (room?.players && rId.startsWith('region_')) {
            const baronOwner = Object.values(room.players).find(p => p.role === 'BARON' && p.regionId === rId);
            if (baronOwner) return `${baronOwner.name}s Baroni`;

            const baronId = rId.replace('region_', '');
            const baronById = room.players[baronId];
            if (baronById) return `${baronById.name}s Baroni`;
        }
        return rId;
    };


    // Main Content Switcher
    return (
        <main className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden">
            <div className={`flex-1 relative p-8 ${activeTab === 'MAP' ? 'overflow-hidden flex items-center justify-center' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
                {activeTab === 'MAP' ? (
                    <WorldMap player={player} room={room} onAction={onAction} onOpenMarket={() => setActiveTab('MARKET')} />
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'MARKET' ? (
                            <SimulationMarket player={player} room={room} onAction={onAction} />
                        ) : activeTab === 'INVENTORY' ? (
                            <SimulationVault player={player} />
                        ) : activeTab === 'VILLAGE' ? (

                            <div className="w-full h-full min-h-[500px] flex flex-col gap-6">
                                <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-[2rem] border border-white/10">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">🏗️ Byggeprosjekter</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Landsbyens ekspansjon & vedlikehold</p>
                                    </div>
                                </div>
                                <div className="flex-1 relative rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl">
                                    <WorldMap
                                        player={player}
                                        room={room}
                                        onAction={onAction}
                                        onOpenMarket={() => setActiveTab('MARKET')}
                                        initialViewMode="village_construction"
                                    />
                                </div>
                            </div>
                        ) : activeTab === 'UPGRADES' ? (
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Oppgraderinger</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(UPGRADES_LIST as any)[player.role]?.map((upg: any) => {
                                        const isOwned = player.upgrades?.includes(upg.id);
                                        let canAfford = true;
                                        Object.entries(upg.cost || {}).forEach(([res, amt]) => {
                                            if (((player.resources as any)[res] || 0) < (amt as number)) canAfford = false;
                                        });
                                        return (
                                            <div key={upg.id} className={`p-6 rounded-3xl border-2 transition-all ${isOwned ? 'bg-indigo-900/20 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/40 border-white/5'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-2xl font-black text-white">{upg.name}</h3>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {Object.entries(upg.cost || {}).map(([res, amt]) => {
                                                            const det = (RESOURCE_DETAILS as any)[res] || { label: res };
                                                            return (
                                                                <span key={res} className="text-xs font-black px-3 py-1 bg-black/40 rounded-full text-indigo-400 font-mono uppercase tracking-widest border border-indigo-500/20">{amt} {det.label}</span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-300 mb-8 leading-relaxed italic opacity-90">{upg.description}</p>
                                                <button
                                                    onClick={() => onAction({ type: 'UPGRADE', upgradeId: upg.id })}
                                                    disabled={isOwned || !canAfford || !!actionLoading}
                                                    className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isOwned ? 'bg-emerald-600/10 text-emerald-500 cursor-default' : canAfford ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500' : 'bg-slate-700 text-slate-500 opacity-50'}`}
                                                >
                                                    {isOwned ? '✅ AKTIV' : canAfford ? 'KJØP OPPGRADERING' : 'MANGLER RESSURSER'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : activeTab === 'SKILLS' ? (
                            <SimulationSkills player={player} />
                        ) : activeTab === 'DIPLOMACY' ? (

                            <div className="space-y-6 h-full flex flex-col">
                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4 flex items-center justify-between">
                                    Diplomati
                                    <span className="text-xs font-black uppercase text-indigo-500 tracking-widest bg-indigo-500/10 px-4 py-1 rounded-full">Kryptert Kanal</span>
                                </h2>

                                <div className="flex-1 min-h-[400px] flex flex-col gap-4 p-6 bg-black/20 rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar">
                                    {room.diplomacy ? Object.values(room.diplomacy)
                                        .filter((m: any) => m.receiverId === 'ALL_RULERS' || m.receiverId === player.id || m.senderId === player.id)
                                        .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
                                        .map((m: any) => (
                                            <div key={m.id} className={`p-4 rounded-2xl max-w-[80%] ${m.senderId === player.id ? 'bg-indigo-600 text-white self-end rounded-br-none shadow-lg shadow-indigo-600/20' : 'bg-slate-800/80 text-slate-200 self-start rounded-bl-none border border-white/5'}`}>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-black uppercase opacity-60 italic">{m.senderName}</span>
                                                    <span className="text-[8px] opacity-40">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm font-medium">{m.content}</p>
                                            </div>
                                        )) : <div className="m-auto text-slate-500 text-sm font-black italic">Ingen meldinger...</div>
                                    }
                                </div>

                                <div className="flex gap-3 bg-slate-800/50 p-2 rounded-2xl border border-white/5 shrink-0">
                                    <input
                                        type="text"
                                        id="diplomacyInputWidescreen"
                                        placeholder="Send beskjed til riket..."
                                        className="flex-1 bg-transparent px-4 py-3 outline-none text-white font-bold"
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                                const content = (e.target as HTMLInputElement).value;
                                                (e.target as HTMLInputElement).value = '';
                                                const msgId = `msg_${Date.now()}`;
                                                await update(ref(db, `simulation_rooms/${pin}/diplomacy/${msgId}`), {
                                                    id: msgId,
                                                    senderId: player.id,
                                                    senderName: player.name,
                                                    receiverId: 'ALL_RULERS',
                                                    content,
                                                    timestamp: Date.now()
                                                });
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={async () => {
                                            const input = document.getElementById('diplomacyInputWidescreen') as HTMLInputElement;
                                            if (input && input.value) {
                                                const content = input.value;
                                                input.value = '';
                                                const msgId = `msg_${Date.now()}`;
                                                await update(ref(db, `simulation_rooms/${pin}/diplomacy/${msgId}`), {
                                                    id: msgId,
                                                    senderId: player.id,
                                                    senderName: player.name,
                                                    receiverId: 'ALL_RULERS',
                                                    content,
                                                    timestamp: Date.now()
                                                });
                                            }
                                        }}
                                        className="bg-indigo-600 text-white px-8 rounded-xl font-black text-sm hover:bg-indigo-500 transition-all active:scale-95"
                                    >
                                        SEND
                                    </button>
                                </div>
                            </div>
                        ) : activeTab === 'HIERARCHY' ? (
                            <div className="space-y-12 pb-20">
                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Samfunnsstruktur</h2>

                                {/* 1. THE KING */}
                                <div className="flex justify-end px-8">
                                    {player.role !== 'PEASANT' && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Er du sikker? Du vil miste din rang og bli en simpel bonde.')) {
                                                    onAction({ type: 'RETIRE' });
                                                }
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors border border-slate-700 hover:border-rose-500 px-4 py-2 rounded-lg"
                                        >
                                            Frasi Tittel (Bli Bonde)
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-center">
                                    {Object.values(room.players || {}).filter(p => p.role === 'KING').map(king => (
                                        <div key={king.id} className="relative group">
                                            <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-1 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                                                <div className="bg-slate-900/90 p-8 rounded-[1.3rem] flex flex-col items-center min-w-[300px] border border-white/10">
                                                    <div className="text-6xl mb-4 drop-shadow-xl">👑</div>
                                                    <h3 className="text-2xl font-black text-white mb-1">{king.name}</h3>
                                                    <div className="text-xs font-black uppercase text-amber-500 tracking-widest mb-4">Hans Majestet Kongen</div>
                                                    <div className="w-full flex justify-between items-center text-xs font-bold text-slate-400 bg-black/20 px-4 py-2 rounded-xl">
                                                        <span>Legitimitet</span>
                                                        <span className="text-white">{king.status.legitimacy}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-1 bg-gradient-to-b from-amber-600 to-slate-700 opacity-50"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* 2. THE NOBILITY & SUBJECTS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pt-8">
                                    <div className="absolute top-0 left-10 right-10 h-1 bg-slate-700 opacity-30 rounded-full"></div>
                                    {Object.values(room.players || {}).filter(p => p.role === 'BARON').map(baron => (
                                        <div key={baron.id} className="flex flex-col gap-4 relative">
                                            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                                            <div className="bg-slate-800/80 p-6 rounded-3xl border border-white/5 shadow-xl relative z-10">
                                                <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                                                    <div className="text-4xl">🏰</div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white">{baron.name}</h4>
                                                        <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{getRegionName(baron.regionId)}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Underståtte</div>
                                                    {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).map(subject => (
                                                        <div key={subject.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-lg shadow-inner">
                                                                {subject.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-slate-200">{subject.name}</div>
                                                                <div className="text-[10px] uppercase text-slate-500 font-bold">{subject.role === 'SOLDIER' ? 'Soldat' : 'Bonde'}</div>
                                                            </div>
                                                            <div className={`w-2 h-2 rounded-full ${subject.lastActive > Date.now() - 60000 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
                                                        </div>
                                                    ))}
                                                    {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).length === 0 && (
                                                        <div className="text-xs text-slate-600 italic text-center py-4">Ingen undersåtter ennå...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-4 relative">
                                        <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                                        <div className="bg-slate-800/40 p-6 rounded-3xl border-2 border-dashed border-white/5 relative z-10">
                                            <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4 opacity-70">
                                                <div className="text-4xl">⚖️</div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white">Frie Menn</h4>
                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Markedet & Byen</div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {Object.values(room.players || {}).filter(p => !['KING', 'BARON'].includes(p.role) && !p.regionId.startsWith('region_')).map(free => (
                                                    <div key={free.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 opacity-80">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-lg">
                                                            {free.role === 'MERCHANT' ? '💰' : '👤'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-slate-300">{free.name}</div>
                                                            <div className="text-[10px] uppercase text-slate-500 font-bold">{free.role}</div>
                                                        </div>
                                                        <div className={`w-2 h-2 rounded-full ${free.lastActive > Date.now() - 60000 ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'PROFILE' ? (
                            <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* PROFILE HEADER */}
                                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-8 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                        <div className="w-32 h-32 bg-slate-800 rounded-3xl flex items-center justify-center text-6xl border-4 border-amber-500/30 shadow-2xl">
                                            {player.role === 'KING' ? '👑' : player.role === 'BARON' ? '🏰' : player.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{player.name}</h2>
                                                <span className="bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{player.role}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-sm">
                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">Nivå {player.stats.level}</span>
                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">{player.stats.xp} Totalt XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            <span>Neste Rang</span>
                                            <span>{Math.floor((player.stats.xp % 100))}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${(player.stats.xp % 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* EQUIPMENT PAPER DOLL */}
                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10">
                                        <h3 className="text-xl font-black text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                                            <span className="text-2xl">🛡️</span> Utstyr
                                        </h3>

                                        <div className="relative aspect-square max-w-sm mx-auto bg-black/20 rounded-full border-4 border-white/5 p-8 flex items-center justify-center">
                                            {/* Human Outline Placeholder */}
                                            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                                                <div className="w-32 h-64 bg-slate-500/50 rounded-full blur-xl"></div>
                                            </div>

                                            {/* Slots Positioning Grid */}
                                            <div className="w-full h-full relative">
                                                {/* HEAD */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                                    <EquipmentSlotItem slot="HEAD" item={player.equipment?.HEAD} />
                                                </div>

                                                {/* BODY */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <EquipmentSlotItem slot="BODY" item={player.equipment?.BODY} />
                                                </div>

                                                {/* MAIN HAND */}
                                                <div className="absolute top-1/2 left-4 -translate-y-1/2">
                                                    <EquipmentSlotItem slot="MAIN_HAND" item={player.equipment?.MAIN_HAND} />
                                                </div>

                                                {/* OFF HAND */}
                                                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                                                    <EquipmentSlotItem slot="OFF_HAND" item={player.equipment?.OFF_HAND} />
                                                </div>

                                                {/* FEET */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                                    <EquipmentSlotItem slot="FEET" item={player.equipment?.FEET} />
                                                </div>

                                                {/* TRINKET */}
                                                <div className="absolute top-8 right-8">
                                                    <EquipmentSlotItem slot="TRINKET" item={player.equipment?.TRINKET} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACHIEVEMENTS / RECENT HISTORY */}
                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10 flex flex-col">
                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                                            <span className="text-2xl">🏆</span> Prestasjoner
                                        </h3>
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center py-12">
                                            <div className="text-5xl mb-4">🎖️</div>
                                            <p className="text-sm font-medium italic">Ingen prestasjoner låst opp ennå...</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Ting Voting Overlay */}
            {room.activeVote && !room.activeVote.votes?.[player.id] && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="max-w-xl w-full bg-slate-900 rounded-[3rem] border-2 border-indigo-500/30 p-12 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                        <div className="mb-10 text-center">
                            <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Tinget er satt</div>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{room.activeVote.title}</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">{room.activeVote.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'YES' })}
                                className="bg-emerald-600 text-white h-24 rounded-2xl font-black text-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95 outline-none ring-offset-2 ring-offset-slate-900 focus:ring-2 ring-emerald-400"
                            >
                                ✅ VEDTA
                            </button>
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'NO' })}
                                className="bg-rose-600 text-white h-24 rounded-2xl font-black text-xl hover:bg-rose-500 transition-all shadow-lg active:scale-95 outline-none ring-offset-2 ring-offset-slate-900 focus:ring-2 ring-rose-400"
                            >
                                ❌ AVSLÅ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

const EquipmentSlotItem: React.FC<{ slot: string, item?: EquipmentItem }> = ({ slot, item }) => {
    if (!item) {
        return (
            <div className="w-20 h-20 rounded-2xl bg-black/40 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-1 group overflow-hidden relative">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-2xl opacity-20 grayscale">
                    {slot === 'HEAD' ? '👑' : slot === 'BODY' ? '👕' : slot === 'MAIN_HAND' ? '⚔️' : slot === 'OFF_HAND' ? '🛡️' : slot === 'FEET' ? '👢' : '💍'}
                </span>
                <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{slot.replace('_', ' ')}</span>
            </div>
        );
    }

    const durabilityPct = (item.durability / item.maxDurability) * 100;

    return (
        <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-indigo-500/30 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg hover:scale-110 transition-transform z-10 cursor-help">
            <div className="absolute top-0 right-0 p-1">
                <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-bl-lg">{item.level || 1}</span>
            </div>
            <span className="text-3xl drop-shadow-md mb-1">{item.icon}</span>
            <span className="text-[7px] font-bold text-slate-300 w-full text-center truncate px-1 leading-tight">{item.name}</span>

            {/* Durability Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50">
                <div
                    className={`h-full ${durabilityPct > 50 ? 'bg-emerald-500' : durabilityPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${durabilityPct}%` }}
                />
            </div>

            {/* Tooltip on Hover (Simple CSS based) */}
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center pointer-events-none backdrop-blur-sm border border-white/10 z-20">
                <div className="text-[8px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Stats</div>
                {Object.entries(item.stats || {}).map(([key, val]) => (
                    <div key={key} className="text-[9px] font-black text-emerald-400 uppercase tracking-wide">{key}: +{val as any}</div>
                ))}
                <div className="mt-1 text-[8px] text-slate-500">{item.durability}/{item.maxDurability}</div>
            </div>
        </div>
    );
};
