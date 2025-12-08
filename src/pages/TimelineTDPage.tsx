import React, { useState } from 'react';
import { GameCanvas } from '../features/timeline-td/components/GameCanvas';
import { useGameStore } from '../features/timeline-td/store/gameStore';
import type { TowerType } from '../features/timeline-td/store/gameStore';
import { useGameEngine } from '../features/timeline-td/hooks/useGameEngine';
import { TOWER_TYPES, TowerSelector } from '../features/timeline-td/components/TowerSelector';
import { ArrowLeft, Pause, Play, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimelineTDPage: React.FC = () => {
    const {
        money,
        lives,
        wave,
        status,
        setStatus,
        resetGame,
        spawnEnemy,
        addTower,
        updateMoney
    } = useGameStore();

    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);

    useGameEngine(); // Start the engine

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
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/oving" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-slate-900">
                            Tidslinje Forsvar
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 font-bold text-slate-700">
                            Liv: {lives}
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 font-bold text-slate-700">
                            Penger: {money}
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 font-bold text-slate-700">
                            Bølge: {wave}
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">

                    {/* Main Canvas */}
                    <div className="lg:col-span-3 h-full relative">
                        <GameCanvas
                            onPlaceTower={selectedTower ? (x, y) => {
                                const towerDef = TOWER_TYPES.find(t => t.type === selectedTower);
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

                        {/* Overlay Controls (Start/Pause) */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={handleStartStart}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
                            >
                                {status === 'PLAYING' ? <Pause className="w-6 h-6 text-indigo-600" /> : <Play className="w-6 h-6 text-indigo-600" />}
                            </button>
                            <button
                                onClick={resetGame}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-pink-50 transition-colors"
                            >
                                <RefreshCw className="w-6 h-6 text-pink-600" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar / Tower Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
                        <h2 className="font-display font-bold text-lg mb-4 text-slate-800">Tårn</h2>

                        <TowerSelector
                            selectedType={selectedTower}
                            onSelect={(tower) => setSelectedTower(tower.type)}
                        />

                        <hr className="my-6" />

                        <div className="space-y-2">
                            <button onClick={handleSpawnDebug} className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                                Debug: Spawn Enemy
                            </button>
                            <p className="text-xs text-slate-500 text-center">
                                Klikk på kartet for å plassere valgt tårn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineTDPage;
