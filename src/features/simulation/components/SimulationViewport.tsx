import React from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../../lib/firebase';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { ROLE_TITLES, LEVEL_XP } from '../constants';
import { Badge } from '../ui/Badge';


import { useSimulation } from '../SimulationContext';
import { WorldMap } from '../WorldMap';
import { SimulationMarket } from './SimulationMarket';
import { SimulationVault } from './SimulationVault';
import { SimulationSkills } from './SimulationSkills';
import { SimulationProduction } from './SimulationProduction';



const RANK_BENEFITS: Record<string, string[][]> = {
    PEASANT: [
        ['Basis rettigheter som bonde.'],
        ['+10% resurseffektivitet ved innhøsting.'],
        ['Redusert skattetreff (-5%) fra din lensherre.'],
        ['Låser opp bruk av spesialverktøy og ploger.'],
        ['Fullstendig selveie: Maksimal frihet og prestisje.']
    ],
    BARON: [
        ['Rett til å kreve inn skatt i din region.'],
        ['+20% forsvarsstyrke for dine vakter.'],
        ['Låser opp bygging av avanserte steinborger.'],
        ['Høyere status i Tinget: Dine stemmer teller mer.'],
        ['Maksimal autoritet og kontroll over landegrenser.']
    ],
    KING: [
        ['Gunst fra undersåttene og rett til tronen.'],
        ['Nasjonal autoritet: Kan passere lover uten Tinget.'],
        ['Gudegitt makt: Maksimal legitimitet og kontroll.']
    ],
    SOLDIER: [
        ['Grunnleggende kamptrening og utstyr.'],
        ['+15% skade i raids og forsvar.'],
        ['Låser opp bruk av tunge rustninger og hester.'],
        ['Elite-kriger: Fryktet over hele riket.']
    ],
    MERCHANT: [
        ['Rett til å drive handel på markedsplassen.'],
        ['Bedre priser ved kjøp og salg (+10%).'],
        ['Låser opp utlandshandel og karavaner.'],
        ['Finansfyrste: Kontrollerer markedstrender.']
    ]
};

const ACHIEVEMENT_TITLES: Record<string, string> = {
    'Første korn': 'Den Flittige',
    'Mesterbygger': 'Arkitekten',
    'Kriger': 'Den Tapre',
    'Rikmann': 'Den Velstående',
    'Diplomat': 'Budbringeren',
    'Helgen': 'Den Hellige',
    'Storbruker': 'Odalbonden',
    'Smed': 'Hammermesteren'
};




interface SimulationViewportProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    pin?: string;
    onAction: (action: any) => void;
}

export const SimulationViewport: React.FC<SimulationViewportProps> = ({ player, room, pin, onAction }) => {
    const { activeTab, setActiveTab } = useSimulation();

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
            <div className={`flex-1 relative p-8 ${activeTab === 'MAP' || activeTab === 'PRODUCTION' || activeTab === 'MARKET' ? 'overflow-hidden flex items-center justify-center' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
                {/* Always render WorldMap when in MAP, PRODUCTION or MARKET to keep it as background */}
                {(activeTab === 'MAP' || activeTab === 'PRODUCTION' || activeTab === 'MARKET') && (
                    <WorldMap player={player} room={room} onAction={onAction} onOpenMarket={() => setActiveTab('MARKET')} />
                )}

                {/* Overlays */}
                {activeTab === 'PRODUCTION' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-950/60 backdrop-blur-md p-8 animate-in fade-in duration-500 flex items-center justify-center">
                        <SimulationProduction player={player} room={room} onAction={onAction} />
                    </div>
                )}

                {activeTab === 'MARKET' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-950/60 backdrop-blur-md p-8 animate-in fade-in duration-500 flex items-center justify-center">
                        <SimulationMarket player={player} room={room} onAction={onAction} />
                    </div>
                )}

                {/* Other Tabs (Fullscreen/Full Viewport) */}
                {activeTab !== 'MAP' && activeTab !== 'PRODUCTION' && activeTab !== 'MARKET' && (
                    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'INVENTORY' ? (
                            <SimulationVault player={player} onAction={onAction} />
                        ) : activeTab === 'ACTIVITY' ? (
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4 flex items-center gap-4">
                                    <span className="w-10 h-10 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center text-xl">🔔</span>
                                    Live Hendelser
                                </h2>
                                <div className="space-y-4">
                                    {room.messages?.slice().reverse().map((msg: any, idx: number) => (
                                        <div key={idx} className="bg-slate-800/40 border-l-4 border-indigo-500 p-6 rounded-r-3xl animate-in slide-in-from-right-4 duration-500 backdrop-blur-md border border-white/5 shadow-xl">
                                            <p className="text-lg font-medium leading-relaxed text-slate-200 antialiased font-serif italic">"{msg}"</p>
                                        </div>
                                    ))}
                                    {(!room.messages || room.messages.length === 0) && (
                                        <div className="py-20 text-center bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-white/5">
                                            <span className="text-6xl block mb-4 opacity-20">📜</span>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest">Riket er stille... Ingen hendelser arkivert ennå.</p>
                                        </div>
                                    )}
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
                                                        Medlem av {room.regions?.[player.regionId]?.name || 'Kongeriket'}
                                                    </div>
                                                    {player.role !== 'KING' && (
                                                        <>
                                                            {player.regionId && player.regionId !== 'capital' && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                                                                    Styres av: <span className="text-white">
                                                                        {Object.values(room.players || {}).find(p => p.role === 'BARON' && p.regionId === player.regionId)?.name || 'Vakant'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full" />
                                                                Konungr: <span className="text-white">
                                                                    {Object.values(room.players || {}).find(p => p.role === 'KING')?.name || 'Ingen'}
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


