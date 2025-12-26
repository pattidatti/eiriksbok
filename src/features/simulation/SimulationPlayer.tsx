import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../lib/firebase';
import type { SimulationPlayer } from './types';
import { ROLE_DEFINITIONS } from './constants';
import { performAction } from './actions';

export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [player, setPlayer] = useState<SimulationPlayer | null>(null);
    const [roomStatus, setRoomStatus] = useState<string>('LOBBY');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const playerId = sessionStorage.getItem('sim_player_id');
        if (!playerId || !pin) return;

        // Listen to MY player data
        const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
        const statusRef = ref(db, `simulation_rooms/${pin}/status`);

        const unsubPlayer = onValue(playerRef, (snap) => {
            const data = snap.val();
            if (data) setPlayer(data);
        });

        const unsubStatus = onValue(statusRef, (snap) => {
            const status = snap.val();
            if (status) setRoomStatus(status);
        });

        return () => {
            unsubPlayer();
            unsubStatus();
        };
    }, [pin]);

    const handleAction = async (action: 'WORK' | 'CHOP') => {
        if (!pin || !player || actionLoading) return;

        setActionLoading(action);
        // Artificial delay for "gamification" feel
        setTimeout(async () => {
            await performAction(pin, player.id, action);
            setActionLoading(null);
        }, 1000);
    };

    if (!player) return <div className="p-8 text-center text-white">Loading player data...</div>;

    if (roomStatus === 'LOBBY') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8" >
                <div className="animate-pulse text-6xl mb-8">⏳</div>
                <h1 className="text-3xl font-bold mb-4">Venter på Kongen...</h1>
                <p className="text-slate-400">Du er registrert som <strong className="text-white">{player.name}</strong></p>
            </div >
        );
    }

    const RoleIcon = {
        KING: '👑',
        BARON: '🏰',
        PEASANT: '🌾',
        SOLDIER: '⚔️',
        MERCHANT: '💰'
    }[player.role] || '❓';

    return (
        <div className="min-h-screen bg-slate-100 pb-20">
            {/* Header */}
            <div className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{RoleIcon}</div>
                        <div>
                            <div className="font-bold text-lg leading-none">{player.name}</div>
                            <div className="text-indigo-300 text-xs font-mono uppercase">{ROLE_DEFINITIONS[player.role]?.label}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-xl font-bold text-yellow-400">{player.resources.gold} 💰</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4">
                {/* Resources */}
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(player.resources).map(([res, amount]) => {
                        if (res === 'gold') return null; // Shown in header
                        return (
                            <div key={res} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-center">
                                <div className="text-xs uppercase text-slate-400 font-bold mb-1">{res}</div>
                                <div className="font-bold text-xl text-slate-800">{amount}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Role Specific View */}
                <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-indigo-500">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {ROLE_DEFINITIONS[player.role]?.label}
                    </h2>
                    <p className="text-slate-600 mb-6">
                        {ROLE_DEFINITIONS[player.role]?.description}
                    </p>

                    {player.role === 'PEASANT' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => handleAction('WORK')}
                                disabled={!!actionLoading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl font-bold text-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {actionLoading === 'WORK' ? <span className="animate-spin">⏳</span> : '🌾'}
                                {actionLoading === 'WORK' ? 'Harvesting...' : 'Work in Fields'}
                            </button>
                            <button
                                onClick={() => handleAction('CHOP')}
                                disabled={!!actionLoading}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {actionLoading === 'CHOP' ? <span className="animate-spin">⏳</span> : '🪓'}
                                {actionLoading === 'CHOP' ? 'Chopping...' : 'Chop Wood'}
                            </button>
                        </div>
                    )}
                    {player.role === 'KING' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-bold text-center">
                                You are the King! Wait for taxes.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
