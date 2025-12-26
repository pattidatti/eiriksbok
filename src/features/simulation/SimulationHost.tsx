import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, set, onValue, update, get } from 'firebase/database';
import { INITIAL_MARKET, ROLE_DEFINITIONS } from './constants';
import type { SimulationRoom } from './types';
import { assignRoles } from './gameLogic';

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
                // Sort by newest (though PIN is random, usually we'd want timestamp, let's just reverse)
                setAllRooms(roomList.reverse());
            } else {
                setAllRooms([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Sync specific room data when PIN is set
    useEffect(() => {
        if (!pin) return;

        const roomRef = ref(db, `simulation_rooms/${pin}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRoomData(data);
            }
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
                taxRateDetails: {
                    kingTax: 20
                }
            }
        };

        try {
            await set(ref(db, `simulation_rooms/${newPin}`), initialRoomState);
            setPin(newPin);
            setView('MANAGE');
        } catch (error) {
            console.error("Failed to create room", error);
            alert("Kunne ikke opprette rom. Prøv igjen.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectRoom = (selectedPin: string) => {
        setPin(selectedPin);
        setView('MANAGE');
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
            updates[`simulation_rooms/${pin}/messages`] = [];

            await update(ref(db), updates);

        } catch (e) {
            console.error("Start Game failed", e);
            alert("Klarte ikke starte spillet");
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
                        <button
                            onClick={createRoom}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            {isLoading ? '...' : '+ Nytt Rom'}
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {allRooms.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">Ingen aktive rom funnet.</div>
                        ) : (
                            allRooms.map((room) => (
                                <div key={room.pin} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-2xl font-mono font-black text-slate-800">{room.pin}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${room.status === 'LOBBY' ? 'bg-yellow-100 text-yellow-800' :
                                                    room.status === 'PLAYING' ? 'bg-green-100 text-green-800' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {room.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {room.players ? Object.keys(room.players).length : 0} Spillere
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => selectRoom(room.pin)}
                                        className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg"
                                    >
                                        Administrer &rarr;
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // MANAGE VIEW
    if (!roomData) return <div className="p-8 text-center animate-pulse">Laster romdata...</div>;

    const playerCount = roomData.players ? Object.keys(roomData.players).length : 0;

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-slate-600">
                        &larr; Tilbake
                    </button>
                    <div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Room PIN</div>
                        <div className="text-5xl font-mono font-black text-indigo-600">{pin}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-slate-800">{playerCount} Spillere</div>
                    <div className="text-green-600 font-bold uppercase tracking-wider">{roomData.status}</div>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Player List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-700">Lobby</h2>
                    {playerCount === 0 ? (
                        <div className="text-slate-400 italic text-center py-10">Venter på at bønder skal ankomme...</div>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(roomData.players || {}).map(([id, player]) => (
                                <div key={id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{
                                            player.role === 'KING' ? '👑' :
                                                player.role === 'BARON' ? '🏰' :
                                                    player.role === 'SOLDIER' ? '⚔️' : '🌾'
                                        }</span>
                                        <span className="font-bold text-lg">{player.name}</span>
                                    </div>
                                    <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                        {ROLE_DEFINITIONS[player.role]?.label || player.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings / Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-700">Styring</h2>
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <h3 className="font-bold text-yellow-800 mb-2">Spillinstillinger</h3>
                            <p className="text-sm text-yellow-700">Standard: Føydalsamfunn (1100 e.Kr)</p>
                        </div>

                        <button
                            onClick={startGame}
                            disabled={isLoading || playerCount < 1}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isLoading ? 'Starter...' : 'Start Spillet 🚀'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
