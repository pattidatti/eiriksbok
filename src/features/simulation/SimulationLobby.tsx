import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { useLayout } from '../../context/LayoutContext';
import { useEffect } from 'react';

import { INITIAL_RESOURCES } from './constants';
import type { SimulationPlayer, Role } from './simulationTypes';

export const SimulationLobby: React.FC = () => {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>('PEASANT');
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();
    const { setFullWidth } = useLayout();

    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    useEffect(() => {
        const savedPin = localStorage.getItem('sim_room_pin');
        const savedName = localStorage.getItem('sim_player_name');
        if (savedPin) setPin(savedPin);
        if (savedName) setName(savedName);
    }, []);

    const isTestRoom = pin.toUpperCase() === 'TEST';

    const joinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setJoining(true);

        const cleanPin = pin.trim().toUpperCase();

        if (!cleanPin || !name) {
            setError('PIN og Navn er påkrevd');
            setJoining(false);
            return;
        }

        try {
            const roomRef = ref(db, `simulation_rooms/${cleanPin}`);
            const snapshot = await get(roomRef);

            // Handle TEST room auto-initialization
            if (cleanPin === 'TEST' && !snapshot.exists()) {
                const initialRoom = {
                    pin: 'TEST',
                    status: 'PLAYING',
                    settings: 'feudal_europe',
                    market: {
                        grain: { price: 10, stock: 100, demand: 1 },
                        wood: { price: 5, stock: 100, demand: 1 },
                        iron: { price: 15, stock: 50, demand: 1 }
                    },
                    world: {
                        year: 1066,
                        season: 'Spring',
                        weather: 'Clear',
                        taxRateDetails: { kingTax: 20 },
                        monumentProgress: 0,
                        activeLaws: []
                    },
                    worldEvents: {},
                    diplomacy: {},
                    messages: []

                };
                await set(roomRef, initialRoom);
            }

            // Fetch snapshot again to be sure (or use initialRoom if we just made it)
            const activeSnapshot = await get(roomRef);
            if (!activeSnapshot.exists()) {
                setError('Rommet finnes ikke');
                setJoining(false);
                return;
            }

            const roomData = activeSnapshot.val();

            // For normal rooms, status must be LOBBY. For TEST room, we allow PLAYING.
            if (cleanPin !== 'TEST' && roomData.status !== 'LOBBY') {
                // Allow re-joining if we can match the player ID
                const savedId = localStorage.getItem('sim_player_id');
                const players = roomData.players || {};
                const playerExists = savedId && players[savedId];

                if (!playerExists) {
                    setError('Spillet har allerede startet eller er ferdig.');
                    setJoining(false);
                    return;
                }
            }

            // Create Player ID (Reuse if exists in local storage and name matches, otherwise create new)
            let playerId = localStorage.getItem('sim_player_id');
            // If the name in box is different from saved name, force new ID? 
            // Better: If we are joining a new room, we might want a new ID.
            // But if we are rejoining the SAME room, keep the ID.

            const savedRoomForId = localStorage.getItem('sim_room_pin');
            if (!playerId || savedRoomForId !== cleanPin) {
                playerId = `${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
            }

            // ALWAYS UPDATE STORAGE
            localStorage.setItem('sim_player_id', playerId);
            localStorage.setItem('sim_room_pin', cleanPin);
            localStorage.setItem('sim_player_name', name);

            // Role assignment (Role selection for TEST, PEASANT for others)
            const role: Role = cleanPin === 'TEST' ? selectedRole : 'PEASANT';

            // Region Assignment
            let regionId = 'unassigned';

            if (role === 'BARON') {
                regionId = `region_${playerId}`;
            } else if (role === 'KING') {
                regionId = 'capital';
            } else if (cleanPin === 'TEST') {
                // In TEST room, try to assign to an existing Baron's region
                const players = roomData.players || {};
                const existingBarons = Object.values(players).filter((p: any) => p.role === 'BARON');

                if (existingBarons.length > 0) {
                    // Distribute roughly evenly or just random
                    const randomBaron = existingBarons[Math.floor(Math.random() * existingBarons.length)] as any;
                    regionId = randomBaron.regionId;
                } else {
                    regionId = 'test_region'; // Fallback if no Barons exist
                }
            }

            // Check if player already exists in room to avoid overwriting state on rejoin
            const playerSnapshot = await get(child(roomRef, `players/${playerId}`));

            if (!playerSnapshot.exists()) {
                const newPlayer: SimulationPlayer = {
                    id: playerId,
                    name: name,
                    role: role,
                    regionId: regionId,
                    resources: INITIAL_RESOURCES[role] || INITIAL_RESOURCES.PEASANT,

                    stats: { xp: 0, level: 1, reputation: 50, contribution: 0 },
                    status: { hp: 100, morale: 100, stamina: 50, legitimacy: 100, authority: 50, loyalty: 100, isJailed: false, isFrozen: false },
                    equipment: {
                        tools: { id: 'tools', durability: 100, maxDurability: 100 },
                        weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                        armor: { id: 'armor', durability: 100, maxDurability: 100 }
                    },


                    upgrades: [],
                    lastActive: Date.now()
                };
                await set(child(roomRef, `players/${playerId}`), newPlayer);
            } else {
                console.log("Rejoining existing player session...");
            }

            navigate(`/sim/play/${cleanPin}`);

        } catch (err) {
            console.error(err);
            setError('Tilkobling feilet');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="fixed inset-0 top-16 bg-slate-900 text-white flex flex-col items-center justify-center p-4 z-20 overflow-y-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-indigo-400 italic">FEUDAL SIM</h1>
            <p className="text-slate-500 mb-8 font-mono text-sm uppercase tracking-widest">v1.0 Strategic Era</p>

            <div className="bg-slate-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md border border-slate-700/50 backdrop-blur-sm">
                <form onSubmit={joinGame} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Room Entry PIN</label>
                        <input
                            type="text"
                            placeholder="TEST"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full bg-slate-900/50 text-center text-4xl font-mono p-5 rounded-2xl border-2 border-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 text-white shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Character Name</label>
                        <input
                            type="text"
                            placeholder="Navn..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 text-center text-xl font-bold p-5 rounded-2xl border-2 border-slate-700 focus:border-indigo-500 outline-none transition-all text-white shadow-inner"
                        />
                    </div>

                    {isTestRoom && (
                        <div className="bg-slate-900/30 p-4 rounded-2xl border border-indigo-500/20">
                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 text-center">Velg Test Rolle</label>
                            <div className="flex gap-2">
                                {(['PEASANT', 'BARON', 'KING'] as Role[]).map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setSelectedRole(r)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${selectedRole === r ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-slate-400'}`}
                                    >
                                        {r === 'KING' ? '👑' : r === 'BARON' ? '🏰' : '🌾'} {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold text-center border border-red-500/20 animate-bounce">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={joining}
                        className="w-full bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98] disabled:opacity-50"
                    >
                        {joining ? 'Connecting...' : 'START SIMULATION ⚔️'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                    <button
                        onClick={() => navigate('/sim/host/setup')}
                        className="text-slate-500 hover:text-indigo-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Host Dashboard (Admin Only)
                    </button>
                </div>
            </div>
        </div>
    );
};
