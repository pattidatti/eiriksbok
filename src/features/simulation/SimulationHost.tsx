import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, set, onValue, update, get } from 'firebase/database';

import { INITIAL_MARKET, ROLE_DEFINITIONS, INITIAL_RESOURCES } from './constants';
import type { SimulationRoom } from './types';
import { assignRoles, collectTaxes } from './gameLogic';

export const SimulationHost: React.FC = () => {
    const [pin, setPin] = useState<string>('');
    const [roomData, setRoomData] = useState<SimulationRoom | null>(null);
    const [allRooms, setAllRooms] = useState<SimulationRoom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'LIST' | 'MANAGE'>('LIST');

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
                taxRateDetails: { kingTax: 20 }
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
                        name: `Barony of ${p.name}`,
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
            const msg = `[${timestamp}] 🌍 Årstiden har skiftet til ${nextSeasonVal}!`;
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
            const msg = `[${timestamp}] ☁️ Været har skiftet til ${nextWeather}!`;
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

            // Remove law after 10 minutes
            if (yesVotes > noVotes) {
                setTimeout(async () => {
                    const currentSnap = await get(ref(db, `simulation_rooms/${pin}/world/activeLaws`));
                    const currentLaws = currentSnap.val() || [];
                    const filtered = currentLaws.filter((id: string) => id !== lawId);
                    await update(ref(db, `simulation_rooms/${pin}/world`), { activeLaws: filtered });
                    const expireMsg = `[${timestamp}] ⚖️ Loven "${voteData.title}" har utløpt.`;
                    await update(ref(db, `simulation_rooms/${pin}`), {
                        messages: [...(roomData?.messages || []), expireMsg].slice(-30)
                    });
                }, 10 * 60 * 1000);
            }
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

            // Reset players
            Object.keys(roomData?.players || {}).forEach(id => {
                updates[`simulation_rooms/${pin}/players/${id}/resources`] = INITIAL_RESOURCES.PEASANT; // Reset to base
                updates[`simulation_rooms/${pin}/players/${id}/status`] = { stamina: 100, legitimacy: 100, authority: 50 };
                updates[`simulation_rooms/${pin}/players/${id}/equipment`] = {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'swords', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                };
            });

            await update(ref(db), updates);
            alert("Spillet er nullstilt!");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };


    if (view === 'LIST') {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-black text-indigo-900">Mine Spill (Admin)</h1>
                        <button onClick={createRoom} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                            + Nytt Rom
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {allRooms.map(r => (
                            <div key={r.pin} className="bg-white p-6 rounded-xl border flex justify-between items-center">
                                <div>
                                    <span className="text-2xl font-mono font-black">{r.pin}</span>
                                    <div className="text-sm text-slate-500">{Object.keys(r.players || {}).length} Spillere</div>
                                </div>
                                <button onClick={() => { setPin(r.pin); setView('MANAGE'); }} className="text-indigo-600 font-bold">
                                    Administrer &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!roomData) return <div className="p-8 text-center">Laster...</div>;

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex justify-between items-center">
                <button onClick={() => setView('LIST')} className="text-slate-400">&larr; Tilbake</button>
                <div className="text-center">
                    <div className="text-5xl font-mono font-black text-indigo-600">{pin}</div>
                    <div className="text-green-600 font-bold uppercase">{roomData.status}</div>
                </div>
                <div className="text-3xl font-bold">{Object.keys(roomData.players || {}).length} Spillere</div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Lobby / Spillere</h2>
                    <div className="space-y-3">
                        {Object.values(roomData.players || {}).map(p => (
                            <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold">{p.name}</span>
                                    <span className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                        {ROLE_DEFINITIONS[p.role]?.label || p.role}
                                    </span>
                                </div>

                                {/* Mini Stamina Bar */}
                                <div className="w-full h-1 bg-slate-200 rounded-full mb-2 overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${p.status.stamina || 0}%` }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {p.upgrades?.map((upgId: string) => (
                                        <span key={upgId} className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                            {upgId}
                                        </span>
                                    ))}
                                    {(!p.upgrades || p.upgrades.length === 0) && <span className="text-[9px] text-slate-400">Ingen oppgraderinger</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Ledertavle (Gull)</h2>
                        {Object.values(roomData.players || {})
                            .sort((a, b) => b.resources.gold - a.resources.gold)
                            .map((p, i) => (
                                <div key={p.id} className="flex justify-between text-sm py-1 border-b">
                                    <span>#{i + 1} {p.name}</span>
                                    <span className="font-bold text-yellow-600">{p.resources.gold}💰</span>
                                </div>
                            ))
                        }
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Markedets Lagerbeholdning</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(roomData.market || {}).map(([res, data]: [string, any]) => (
                                <div key={res} className="p-2 bg-slate-50 rounded-lg border">
                                    <div className="text-[10px] font-black uppercase text-slate-400">{res}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">{data.stock}</span>
                                        <span className="text-indigo-600 text-xs">{data.price.toFixed(1)}💰</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Kontrollpanel</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={startGame} disabled={roomData.status === 'PLAYING'} className="bg-green-600 text-white py-4 rounded-xl font-bold">
                                {roomData.status === 'PLAYING' ? 'Spill i gang' : 'Start Spill 🚀'}
                            </button>
                            <button onClick={handleTaxation} disabled={roomData.status !== 'PLAYING'} className="bg-indigo-600 text-white py-4 rounded-xl font-bold">
                                Skattlegg Alle 💰
                            </button>
                            <button onClick={regenAllStamina} disabled={roomData.status !== 'PLAYING'} className="bg-amber-500 text-white py-4 rounded-xl font-bold">
                                Gjenopprett All Energi ⚡
                            </button>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-indigo-900">Årstid: {roomData.world.season}</span>
                                    </div>
                                    <button onClick={nextSeason} className="w-full bg-white text-indigo-700 py-3 rounded-lg font-black uppercase tracking-widest text-xs border border-indigo-200">
                                        Neste Årstid ⏳
                                    </button>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-blue-900">Vær: {roomData.world.weather || 'Clear'}</span>
                                    </div>
                                    <button onClick={changeWeather} className="w-full bg-white text-blue-700 py-3 rounded-lg font-black uppercase tracking-widest text-xs border border-blue-200">
                                        Skift Vær ☁️
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button onClick={spawnRandomEvent} disabled={roomData.status !== 'PLAYING'} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.05em] text-xs shadow-lg hover:bg-red-700 transition-all">
                                    🎲 Hendelse
                                </button>
                                <button onClick={startTing} disabled={roomData.status !== 'PLAYING' || !!roomData.activeVote} className="flex-1 bg-amber-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.05em] text-xs shadow-lg hover:bg-amber-700 transition-all disabled:opacity-50">
                                    ⚖️ Start Tinget
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-2 text-center">
                                <button onClick={resetGame} className="text-rose-600 font-bold text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                    ⚠ Nullstill Hele Spillet
                                </button>
                            </div>
                        </div>
                    </div>




                </div>
            </main>
        </div>
    );
};
