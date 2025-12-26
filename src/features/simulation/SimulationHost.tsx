import React, { useState, useEffect } from 'react';
import { ref, set, onValue, update, get } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useLayout } from '../../context/LayoutContext';

import { INITIAL_MARKET, ROLE_DEFINITIONS, INITIAL_RESOURCES, VILLAGE_BUILDINGS, SEASONS, RESOURCE_DETAILS } from './constants';
import type { SimulationRoom } from './types';
import { assignRoles, collectTaxes } from './gameLogic';

export const SimulationHost: React.FC = () => {
    const [pin, setPin] = useState<string>('');
    const [roomData, setRoomData] = useState<SimulationRoom | null>(null);
    const [allRooms, setAllRooms] = useState<SimulationRoom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'LIST' | 'MANAGE'>('LIST');
    const { setFullWidth } = useLayout();

    // Handle Layout
    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    // Fetch all rooms on mount
    useEffect(() => {
        const roomsRef = ref(db, 'simulation_rooms');
        const unsubscribe = onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const roomList = Object.values(data) as SimulationRoom[];
                setAllRooms(roomList.reverse());
            } else {
                setAllRooms([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Sync specific room data
    useEffect(() => {
        if (!pin) return;
        const roomRef = ref(db, `simulation_rooms/${pin}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setRoomData(data);
        });
        return () => unsubscribe();
    }, [pin]);

    const createRoom = async () => {
        setIsLoading(true);
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        const initialRoomState: SimulationRoom = {
            pin: newPin,
            status: 'LOBBY',
            settings: 'feudal_europe',
            market: INITIAL_MARKET,
            regions: {},
            players: {},
            world: {
                year: 1100,
                season: 'Spring',
                weather: 'Clear',
                taxRateDetails: { kingTax: 20 },
                settlement: {
                    buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                        ...acc,
                        [id]: { id, level: 0, progress: 0, target: 200 }
                    }), {}),
                    activeProjectId: 'sawmill'
                }
            },
            worldEvents: {},
            diplomacy: {},
            messages: []

        };
        try {
            await set(ref(db, `simulation_rooms/${newPin}`), initialRoomState);
            setPin(newPin);
            setView('MANAGE');
        } catch (error) {
            console.error(error);
            alert("Kunne ikke opprette rom.");
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const updatedPlayers = assignRoles(roomData.players);
            const newRegions: any = {};
            Object.values(updatedPlayers).forEach(p => {
                if (p.role === 'BARON') {
                    newRegions[p.regionId] = {
                        id: p.id,
                        name: `Baroniet ${p.name}`,
                        taxRate: 10,
                        defenseLevel: 50,
                        rulerName: p.name
                    };
                }
            });

            const updates: any = {};
            updates[`simulation_rooms/${pin}/players`] = updatedPlayers;
            updates[`simulation_rooms/${pin}/regions`] = newRegions;
            updates[`simulation_rooms/${pin}/status`] = 'PLAYING';
            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
            alert("Klarte ikke starte.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaxation = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const kingTax = roomData.world.taxRateDetails.kingTax || 20;
            const { updatedPlayers, results } = collectTaxes(roomData.players, kingTax);

            await update(ref(db, `simulation_rooms/${pin}/players`), updatedPlayers);
            alert(`Suksess! ${results.length} bønder og baroner ble skattlagt.`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const regenAllStamina = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const updates: any = {};
            Object.keys(roomData.players).forEach(id => {
                updates[`simulation_rooms/${pin}/players/${id}/status/stamina`] = 100;
            });
            await update(ref(db), updates);
            alert("All energi er gjenopprettet!");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const nextSeason = async () => {
        if (!roomData) return;
        const seasonsList: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
        const currentIdx = seasonsList.indexOf(roomData.world.season);
        const nextIdx = (currentIdx + 1) % seasonsList.length;
        const nextSeasonVal = seasonsList[nextIdx];

        setIsLoading(true);
        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), { season: nextSeasonVal });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sLabel = (SEASONS as any)[nextSeasonVal]?.label || nextSeasonVal;
            const msg = `[${timestamp}] 🌍 Årstiden har skiftet til ${sLabel}!`;
            const updatedMessages = roomData.messages ? [...roomData.messages, msg] : [msg];
            if (updatedMessages.length > 30) updatedMessages.shift();
            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const changeWeather = async () => {
        if (!roomData) return;
        const weatherList: ('Clear' | 'Rain' | 'Storm' | 'Fog')[] = ['Clear', 'Rain', 'Storm', 'Fog'];
        const currentIdx = weatherList.indexOf(roomData.world.weather || 'Clear');
        const nextIdx = (currentIdx + 1) % weatherList.length;
        const nextWeather = weatherList[nextIdx];

        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), { weather: nextWeather });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const weatherMap: any = { Clear: 'Klart', Rain: 'Regn', Storm: 'Storm', Fog: 'Tåke' };
            const wLabel = weatherMap[nextWeather] || nextWeather;
            const msg = `[${timestamp}] ☁️ Været har skiftet til ${wLabel}!`;
            const updatedMessages = roomData.messages ? [...roomData.messages, msg] : [msg];
            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });
        } catch (e) {
            console.error(e);
        }
    };

    const startTing = async () => {
        if (!roomData) return;
        const { LAW_TEMPLATES } = await import('./constants');
        const law = LAW_TEMPLATES[Math.floor(Math.random() * LAW_TEMPLATES.length)];

        const activeVote = {
            lawId: law.id,
            title: law.label,
            votes: {},
            expiresAt: Date.now() + (60 * 1000) // 1 minute to vote
        };

        try {
            await update(ref(db, `simulation_rooms/${pin}`), { activeVote });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msg = `[${timestamp}] ⚖️ TINGET ER SATT! Det skal stemmes over loven: "${law.label}"!`;
            const updatedMessages = roomData.messages ? [...roomData.messages, msg] : [msg];
            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });

            // Auto resolve after 1 minute
            setTimeout(() => resolveVote(law.id), 60000);
        } catch (e) {
            console.error(e);
        }
    };

    const resolveVote = async (lawId: string) => {
        const snapshot = await get(ref(db, `simulation_rooms/${pin}/activeVote`));
        if (!snapshot.exists()) return;
        const voteData = snapshot.val();

        const votes = Object.values(voteData.votes || {}) as ('YES' | 'NO' | 'ABSTAIN')[];
        const yesVotes = votes.filter(v => v === 'YES').length;
        const noVotes = votes.filter(v => v === 'NO').length;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let msg = '';
        let activeLaws = roomData?.world.activeLaws || [];

        if (yesVotes > noVotes) {
            msg = `[${timestamp}] ✅ LOVEN ER VEDTATT! "${voteData.title}" er nå gjeldende.`;
            activeLaws = [...activeLaws, lawId];
        } else {
            msg = `[${timestamp}] ❌ LOVEN BLE FORKASTET. "${voteData.title}" ble nedstemt.`;
        }

        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), { activeLaws });
            await update(ref(db, `simulation_rooms/${pin}`), {
                activeVote: null,
                messages: [...(roomData?.messages || []), msg].slice(-30)
            });
        } catch (e) {
            console.error(e);
        }
    };

    const spawnRandomEvent = async () => {

        if (!roomData) return;
        const { WORLD_EVENT_TEMPLATES } = await import('./constants');
        const template = WORLD_EVENT_TEMPLATES[Math.floor(Math.random() * WORLD_EVENT_TEMPLATES.length)];
        const eventId = `event_${Date.now()}`;
        const newEvent = {
            ...template,
            id: eventId,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
        };

        try {
            await update(ref(db, `simulation_rooms/${pin}/worldEvents`), { [eventId]: newEvent });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msg = `[${timestamp}] 🔔 HENDELSE: ${template.title}! Sjekk kartet!`;
            const updatedMessages = roomData.messages ? [...roomData.messages, msg] : [msg];
            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });
        } catch (e) {
            console.error(e);
        }
    };

    const initializeSettlement = async () => {
        if (!roomData) return;
        setIsLoading(true);
        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), {
                settlement: {
                    buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                        ...acc,
                        [id]: { id, level: 0, progress: 0, target: 200 }
                    }), {}),
                    activeProjectId: 'sawmill'
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const resetGame = async () => {
        if (!window.confirm("Er du sikker på at du vil starte spillet på nytt? Alle fremdrift slettes.")) return;
        setIsLoading(true);
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/status`] = 'LOBBY';
            updates[`simulation_rooms/${pin}/worldEvents`] = {};
            updates[`simulation_rooms/${pin}/messages`] = [];
            updates[`simulation_rooms/${pin}/market`] = INITIAL_MARKET;
            updates[`simulation_rooms/${pin}/world/monumentProgress`] = 0;
            updates[`simulation_rooms/${pin}/world/activeLaws`] = [];
            updates[`simulation_rooms/${pin}/world/settlement`] = {
                buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                    ...acc,
                    [id]: { id, level: 0, progress: 0, target: 200 }
                }), {}),
                activeProjectId: 'sawmill'
            };

            // Reset players
            Object.keys(roomData?.players || {}).forEach(id => {
                updates[`simulation_rooms/${pin}/players/${id}/resources`] = INITIAL_RESOURCES.PEASANT;
                updates[`simulation_rooms/${pin}/players/${id}/status`] = { stamina: 100, legitimacy: 100, authority: 50 };
                updates[`simulation_rooms/${pin}/players/${id}/equipment`] = {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'swords', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                };
            });

            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };


    if (view === 'LIST') {
        return (
            <div className="fixed inset-0 top-16 bg-slate-950 text-slate-200 p-12 overflow-y-auto custom-scrollbar font-sans z-20">
                <div className="fixed inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-5xl font-black text-white px-2 tracking-tighter">Simuleringshallen</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 px-2">Sentralt kontrollpanel for administratoren</p>
                        </div>
                        <button
                            onClick={createRoom}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                            + Opprett Nytt Rike
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allRooms.map(r => (
                            <div key={r.pin} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] group hover:border-indigo-500/50 transition-all shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-5xl font-mono font-black text-white group-hover:text-indigo-400 transition-colors">{r.pin}</div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === 'PLAYING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {r.status}
                                    </span>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                                        <span>Innbyggere:</span>
                                        <span className="text-white">{Object.keys(r.players || {}).length} sjeler</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                                        <span>Årstid:</span>
                                        <span className="text-indigo-300">{(INITIAL_MARKET as any)[r.world?.season] || r.world?.season}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setPin(r.pin); setView('MANAGE'); }}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                                >
                                    Administrer &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (!roomData) return null;

    return (
        <div className="fixed inset-0 top-16 bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30 z-20">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
            </div>

            {/* LEFT PANEL: ADMIN COMMAND CENTER */}
            <aside className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl overflow-y-auto no-scrollbar">
                <div className="p-8 border-b border-white/5 bg-black/20">
                    <button onClick={() => setView('LIST')} className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4 hover:text-white transition-colors flex items-center gap-2">
                        &larr; Tilbake til oversikt
                    </button>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-4xl font-mono font-black text-white">{pin}</h1>
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Admin</span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{roomData.status} MODUS</p>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={startGame}
                            disabled={roomData.status === 'PLAYING' || isLoading}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${roomData.status === 'PLAYING' ? 'bg-emerald-600/20 text-emerald-500 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'}`}
                        >
                            {roomData.status === 'PLAYING' ? '✅ SPILL AKTIVT' : '🚀 START SPILL'}
                        </button>
                        <button
                            onClick={resetGame}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                        >
                            ⚠ NULLSTILL ALT
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* World Controls */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Verdensstyring</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 italic">Årstid: {(SEASONS as any)[roomData.world.season]?.label}</span>
                                    <span className="text-2xl group-hover:rotate-12 transition-transform">{{ Spring: '🌱', Summer: '☀️', Autumn: '🍂', Winter: '❄️' }[roomData.world.season]}</span>
                                </div>
                                <button onClick={nextSeason} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-all">Neste Årstid</button>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 italic">Vær: {roomData.world.weather || 'Klart'}</span>
                                    <span className="text-2xl group-hover:scale-110 transition-transform">☁️</span>
                                </div>
                                <button onClick={changeWeather} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-all">Endre Vær</button>
                            </div>
                        </div>
                    </section>

                    {/* Mass Actions */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Massehandlinger</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleTaxation} className="w-full bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/20 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2">
                                💰 Skattlegg Riket
                            </button>
                            <button onClick={regenAllStamina} className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 text-center">
                                ⚡ Gjenopprett Stamina
                            </button>
                        </div>
                    </section>

                    {/* Special Events */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Intervensjoner</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={spawnRandomEvent} className="bg-rose-600/80 hover:bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-rose-600/20">🎲 Event</button>
                            <button onClick={startTing} disabled={!!roomData.activeVote} className="bg-amber-600/80 hover:bg-amber-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-amber-600/20 disabled:opacity-20 text-center">⚖️ Tinget</button>
                        </div>
                    </section>

                    {/* Settlement Management */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Landsby-fokus</h3>
                        {!roomData.world.settlement ? (
                            <button onClick={initializeSettlement} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] animate-pulse">Initialiser Landsby</button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(VILLAGE_BUILDINGS).map(([id, b]: [string, any]) => (
                                    <button
                                        key={id}
                                        onClick={() => update(ref(db, `simulation_rooms/${pin}/world/settlement`), { activeProjectId: id })}
                                        className={`p-2 rounded-lg text-[8px] font-black uppercase border-2 transition-all ${roomData.world.settlement?.activeProjectId === id
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-indigo-500/50'}`}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </aside>

            {/* CENTER PANEL: THE REALM OBSERVER */}
            <main className="flex-1 relative flex flex-col bg-slate-900/10 overflow-hidden no-scrollbar">
                <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Innbyggere:</span>
                            <span className="text-sm font-bold text-white">{Object.keys(roomData.players || {}).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">År i Riket:</span>
                            <span className="text-sm font-bold text-white">{roomData.world.year || 1100}</span>
                        </div>
                    </div>
                    {isLoading && <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">Prosesserer Endringer...</div>}
                </header>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-12">
                    {/* Player Grid */}
                    <section>
                        <h2 className="text-3xl font-black text-white px-2 mb-8 tracking-tighter">Innbyggere i Riket</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(roomData.players || {}).map(p => (
                                <div key={p.id} className="bg-slate-900/80 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                            {p.avatar ? <img src={p.avatar} alt={p.role} className="w-full h-full object-cover" /> : ({
                                                KING: '👑',
                                                BARON: '🏰',
                                                PEASANT: '🌾',
                                                SOLDIER: '⚔️',
                                                MERCHANT: '💰'
                                            } as any)[p.role] || '👤'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-black text-white truncate">{p.name}</h3>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">{ROLE_DEFINITIONS[p.role]?.label || p.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div>
                                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-1">
                                                <span>Stamina</span>
                                                <span className="text-white">{p.status.stamina}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${p.status.stamina}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-500">Gull:</span>
                                            <span className="text-amber-500 font-black">{p.resources.gold}💰</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {p.upgrades?.map((upg: string) => (
                                            <span key={upg} className="text-[7px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">{upg}</span>
                                        ))}
                                        {(!p.upgrades || p.upgrades.length === 0) && <span className="text-[7px] font-bold text-slate-700 uppercase italic">Ingen oppgraderinger</span>}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(roomData.players || {}).length === 0 && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <span className="text-6xl block mb-4 opacity-20">🏰</span>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Venter på at undersåtter skal ankomme...</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Settlement Progress */}
                    {roomData.world.settlement && (
                        <section className="bg-indigo-900/10 border border-indigo-500/10 p-10 rounded-[3rem] relative overflow-hidden group">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white mb-8 tracking-tighter flex items-center justify-between">
                                    Landsbyutvikling
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full">Status Rapport</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.values(roomData.world.settlement.buildings).map((building: any) => {
                                        const meta = (VILLAGE_BUILDINGS as any)[building.id];
                                        const progress = (building.progress / (building.target || 200)) * 100;
                                        return (
                                            <div key={building.id} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase">{meta?.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">Nivå {building.level}</p>
                                                    </div>
                                                    <span className="text-xs font-mono text-indigo-500">{building.progress} / {building.target || 200}</span>
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <div className={`h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="absolute top-[-20%] right-[-10%] text-[15rem] text-indigo-500 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform duration-[3000ms]">🏠</div>
                        </section>
                    )}
                </div>
            </main>

            {/* RIGHT PANEL: INTELLIGENCE & FEED */}
            <aside className="w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl overflow-hidden">
                {/* Leaderboard */}
                <div className="p-8 border-b border-white/5 bg-black/20 shrink-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-6 flex items-center justify-between">
                        Rikets Formue
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    </h3>
                    <div className="space-y-4">
                        {Object.values(roomData.players || {})
                            .sort((a, b) => (b.resources.gold || 0) - (a.resources.gold || 0))
                            .slice(0, 5)
                            .map((p, i) => (
                                <div key={p.id} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-600 font-mono">#{i + 1}</span>
                                        <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{p.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-amber-400">{p.resources.gold}💰</span>
                                </div>
                            ))
                        }
                        {Object.keys(roomData.players || {}).length === 0 && <p className="text-[10px] text-slate-600 font-bold italic text-center py-4">Ingen data tilgjengelig...</p>}
                    </div>
                </div>

                {/* Market Intelligence */}
                <div className="p-8 border-b border-white/5 shrink-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Markedsanalyse</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(roomData.market || {}).slice(0, 4).map(([res, data]: [string, any]) => {
                            const details = (RESOURCE_DETAILS as any)[res] || { label: res };
                            return (
                                <div key={res} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-black uppercase text-slate-500 mb-1">{details.label}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white">{data.stock}</span>
                                        <span className="text-[10px] font-mono text-emerald-400">{data.price.toFixed(1)}g</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-8 pb-4 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                            Global Logg
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8 custom-scrollbar">
                        {roomData.messages?.slice().reverse().map((msg: any, idx: number) => (
                            <div key={idx} className="bg-indigo-950/20 border-l-2 border-indigo-500/50 p-4 rounded-r-2xl animate-in slide-in-from-right-4 duration-300">
                                <p className="text-[10px] font-medium leading-relaxed text-slate-400 antialiased italic font-serif opacity-80">{msg}</p>
                            </div>
                        ))}
                        {(!roomData.messages || roomData.messages.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                <span className="text-4xl mb-4">📜</span>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Arkivet er tomt</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Global Styles for custom scrollbar */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
};
