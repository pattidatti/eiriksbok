import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { INITIAL_RESOURCES } from './constants';
import type { SimulationPlayer } from './types';

export const SimulationLobby: React.FC = () => {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();

    const joinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setJoining(true);

        if (!pin || !name) {
            setError('PIN and Name are required');
            setJoining(false);
            return;
        }

        try {
            const roomRef = ref(db, `simulation_rooms/${pin}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const roomData = snapshot.val();
                if (roomData.status !== 'LOBBY') {
                    setError('Game has already started or finished.');
                    setJoining(false);
                    return;
                }

                // Create Player ID
                const playerId = `${name.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

                // Store local session
                sessionStorage.setItem('sim_player_id', playerId);
                sessionStorage.setItem('sim_room_pin', pin);

                // Initial Player State
                const newPlayer: SimulationPlayer = {
                    id: playerId,
                    name: name,
                    role: 'PEASANT', // Default role until assigned
                    regionId: 'unassigned',
                    resources: INITIAL_RESOURCES.PEASANT,
                    stats: { xp: 0, reputation: 50, contribution: 0 },
                    status: { hp: 100, morale: 100, isJailed: false, isFrozen: false },
                    lastActive: Date.now()
                };

                // Save to Firebase
                await set(child(roomRef, `players/${playerId}`), newPlayer);

                // Redirect
                navigate(`/sim/play/${pin}`);
            } else {
                setError('Room not found');
            }
        } catch (err) {
            console.error(err);
            setError('Connection failed');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-indigo-400">FEUDAL SIM</h1>
            <p className="text-slate-500 mb-8 font-mono">v0.1.0 Alpha</p>

            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={joinGame} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Room PIN</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full bg-slate-900 text-center text-4xl font-mono p-4 rounded-xl border-2 border-slate-700 focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-700 text-white"
                            maxLength={4}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                        <input
                            type="text"
                            placeholder="Sir Lancelot..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 text-center text-xl font-bold p-4 rounded-xl border-2 border-slate-700 focus:border-indigo-500 outline-none transition-colors text-white"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/50 text-red-200 p-3 rounded-lg text-sm text-center border border-red-800">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={joining}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-900/20"
                    >
                        {joining ? 'Joining...' : 'Enter Kingdom ⚔️'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                    <button
                        onClick={() => navigate('/sim/host/setup')}
                        className="text-slate-500 hover:text-white text-sm transition-colors hover:underline"
                    >
                        Host Game (Teacher)
                    </button>
                </div>
            </div>
        </div>
    );
};
