import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, set, onValue, update } from 'firebase/database';
import { INITIAL_MARKET, ROLE_DEFINITIONS } from './constants';
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
                taxRateDetails: { kingTax: 20 }
            }
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
            const { updatedPlayers, results } = collectTaxes(roomData.players, kingTax, 15);
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
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
