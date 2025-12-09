import React, { useState, useEffect } from 'react';
import { GameCanvas } from '../features/timeline-td/components/GameCanvas';
import { useGameStore } from '../features/timeline-td/store/gameStore';
import type { TowerType } from '../features/timeline-td/store/gameStore';
import { useGameEngine } from '../features/timeline-td/hooks/useGameEngine';
import { TOWER_TYPES, TowerSelector } from '../features/timeline-td/components/TowerSelector';
import { TOWER_STATS } from '../features/timeline-td/data/gameData';
import { ArrowLeft, Pause, Play, RefreshCw, Coins, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimelineTDPage: React.FC = () => {
    const {
        money,
        lives,
        wave,
        status,
        waveInProgress,
        enemies,
        setStatus,
        resetGame,
        spawnEnemy,
        addTower,
        updateMoney,
        startNextWave
    } = useGameStore();

    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);

    useGameEngine(); // Start the engine

    // Reset game state on unmount
    useEffect(() => {
        return () => useGameStore.getState().resetGame();
    }, []);

    const handleStartStart = () => {
        if (status === 'IDLE' || status === 'PAUSED') {
            setStatus('PLAYING');
        } else {
            setStatus('PAUSED');
        }
    };

    // Debug button to test spawn
    const handleSpawnDebug = () => {
        spawnEnemy({
            id: Math.random().toString(),
            type: 'IGNORANCE',
            position: { x: 0, y: 300 }, // Start of path
            health: 100,
            maxHealth: 100,
            speed: 2,
            pathIndex: 0,
            isFrozen: false
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* HUD */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 w-full">
                <div className="flex items-center gap-8">
                    <Link to="/oving" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Heart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Liv</p>
                            <p className="text-2xl font-bold text-slate-900">{lives}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <Coins className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Penger</p>
                            <p className="text-2xl font-bold text-slate-900">{money}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bølge</p>
                            <p className="text-2xl font-bold text-slate-900">{wave}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Wave Control */}
                    {!waveInProgress && (
                        <button
                            onClick={() => startNextWave()}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 animate-pulse"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Bølge {wave}
                        </button>
                    )}
                    {waveInProgress && (
                        <div className="text-slate-500 font-medium animate-pulse">
                            Bølge pågår... ({enemies.length} fiender igjen)
                        </div>
                    )}

                    <div className="h-8 w-px bg-slate-300 mx-2"></div>

                    <button
                        onClick={handleStartStart}
                        className="p-3 bg-white rounded-full shadow-md hover:bg-indigo-50 transition-colors border border-slate-200"
                    >
                        {status === 'PLAYING' ? <Pause className="w-5 h-5 text-indigo-600" /> : <Play className="w-5 h-5 text-indigo-600" />}
                    </button>
                    <button
                        onClick={resetGame}
                        className="p-3 bg-white rounded-full shadow-md hover:bg-pink-50 transition-colors border border-slate-200"
                    >
                        <RefreshCw className="w-5 h-5 text-pink-600" />
                    </button>
                </div>
            </header>

            {/* Game Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-hidden">

                {/* Main Canvas */}
                <div className="lg:col-span-3 h-full relative bg-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                    <GameCanvas
                        onPlaceTower={selectedTower ? (x, y) => {
                            const towerDef = TOWER_STATS[selectedTower]; // Changed to lookup from updated gameData map if TOWER_TYPES doesn't have all data or logic differs
                            // Actually TOWER_TYPES might be simplified list, but TOWER_STATS has the logic data.
                            // Let's rely on TOWER_STATS.

                            if (!towerDef) return;
                            if (money < towerDef.cost) {
                                // Could show a toast/alert here
                                return;
                            }

                            addTower({
                                id: Math.random().toString(),
                                type: selectedTower,
                                position: { x, y },
                                range: towerDef.range,
                                damage: towerDef.damage,
                                cooldown: towerDef.cooldown,
                                lastFired: 0,
                                level: 1
                            });
                            updateMoney(-towerDef.cost);
                            setSelectedTower(null);
                        } : undefined}
                    />
                </div>

                {/* Sidebar / Tower Selection */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 overflow-y-auto h-full">
                    <h2 className="font-display font-bold text-xl mb-4 text-slate-800">Velg Tårn</h2>

                    <TowerSelector
                        selectedType={selectedTower}
                        onSelect={(tower) => setSelectedTower(tower.type)}
                    />

                    {selectedTower && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-sm font-bold text-indigo-900 line-clamp-1">{TOWER_STATS[selectedTower].name}</p>
                            <p className="text-xs text-indigo-700 mt-1">{TOWER_STATS[selectedTower].description}</p>
                            <div className="mt-2 text-xs font-mono text-indigo-800">
                                Skade: {TOWER_STATS[selectedTower].damage} | Rekkevidde: {TOWER_STATS[selectedTower].range}
                            </div>
                        </div>
                    )}

                    <hr className="my-6 border-slate-100" />

                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 text-center italic">
                            "Mørketiden er over oss. Bruk kunnskap som våpen."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineTDPage;
