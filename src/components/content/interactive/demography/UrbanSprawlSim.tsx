import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Factory, Trees, Building2, Tent, RefreshCw, BarChart3 } from 'lucide-react';


// Types
type ZoneType = 'empty' | 'residential' | 'industrial' | 'park';
type BuildingLevel = 1 | 2 | 3; // 1: Slum/Basic, 2: Standard, 3: Luxury/High-tech

interface CellData {
    id: number;
    type: ZoneType;
    level: BuildingLevel;
    pollution: number;
    value: number;
}

// Configuration
const GRID_SIZE = 6;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

export const UrbanSprawlSim: React.FC = () => {
    const [grid, setGrid] = useState<CellData[]>(Array.from({ length: TOTAL_CELLS }, (_, i) => ({
        id: i,
        type: 'empty',
        level: 1,
        pollution: 0,
        value: 0
    })));

    const [selectedTool, setSelectedTool] = useState<ZoneType>('residential');
    // const [stats, setStats] = useState({ population: 0, pollution: 0, happiness: 50 }); // Unused state, derived in render




    const runSimulation = (currentGrid: CellData[]) => {
        return currentGrid.map(cell => {
            if (cell.type === 'empty') return { ...cell, level: 1 as BuildingLevel, pollution: 0, value: 0 };

            const neighbors = getNeighbors(cell.id);
            let localPollution = 0;
            let localValue = 0;
            let adjacentParks = 0;
            let adjacentIndustry = 0;

            neighbors.forEach(nId => {
                const neighbor = currentGrid[nId];
                if (neighbor.type === 'industrial') {
                    localPollution += 25;
                    adjacentIndustry++;
                }
                if (neighbor.type === 'park') {
                    localValue += 2;
                    localPollution -= 10;
                    adjacentParks++;
                }
                if (neighbor.type === 'residential' && neighbor.level === 3) localValue += 1;
            });

            if (cell.type === 'industrial') localPollution += 10;

            // Normalize
            localPollution = Math.max(0, localPollution);

            let newLevel: BuildingLevel = 1;

            if (cell.type === 'residential') {
                // If pollution is high, force Slum
                if (localPollution >= 20) newLevel = 1;
                // If Value is high (Parks) and Clean, enable Skyscraper
                else if (localValue >= 2 && localPollution < 20) newLevel = 3;
                else newLevel = 2; // Suburb
            } else if (cell.type === 'industrial') {
                newLevel = adjacentIndustry >= 2 ? 3 : 2; // 3 = High Tech, 2 = Factory
            } else if (cell.type === 'park') {
                newLevel = adjacentParks >= 1 ? 3 : 2; // 3 = Dense Forest, 2 = Park
            }

            return {
                ...cell,
                pollution: localPollution,
                value: localValue,
                level: newLevel
            };
        });
    };

    const handleCellClick = (id: number) => {
        const newGrid = [...grid];
        // Toggle: If clicking same type, remove it. Else set type.
        if (newGrid[id].type === selectedTool) {
            newGrid[id] = { ...newGrid[id], type: 'empty', level: 1, pollution: 0, value: 0 };
        } else {
            newGrid[id] = { ...newGrid[id], type: selectedTool, level: 1 };
        }

        // Run automata (maybe 2 passes to propagate effects?)
        const simulatedGrid = runSimulation(newGrid);
        setGrid(simulatedGrid);
    };

    const getNeighbors = (index: number) => {
        const neighbors = [];
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // NESW

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                neighbors.push(ny * GRID_SIZE + nx);
            }
        }
        return neighbors;
    };

    // Calculate stats purely for render (since we updated grid)
    const currentStats = (() => {
        const totalPop = grid.reduce((acc, cell) => {
            if (cell.type !== 'residential') return acc;
            return acc + (cell.level === 3 ? 1000 : cell.level === 2 ? 100 : 20); // Skyscraper holds way more
        }, 0);

        const totalPollution = grid.reduce((acc, cell) => acc + cell.pollution, 0);
        const pollutionPenalty = totalPollution * 0.2;
        const parkBonus = grid.filter(c => c.type === 'park').length * 2;
        const happy = Math.max(0, Math.min(100, 50 - pollutionPenalty + parkBonus));
        return { totalPop, totalPollution, happy };
    })();

    return (
        <div className="my-8 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm overflow-hidden font-sans">
            {/* Header */}
            <div className="p-6 border-b border-stone-200 bg-white flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        By-Simulatoren
                    </h3>
                    <p className="text-sm text-slate-500">Sonér land og se byen utvikle seg organisk.</p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Befolkning</span>
                        <span className="font-mono text-indigo-600 font-bold">{currentStats.totalPop}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Trivsel</span>
                        <span className={`font-mono font-bold ${currentStats.happy > 60 ? 'text-emerald-500' : currentStats.happy < 30 ? 'text-red-500' : 'text-yellow-600'}`}>
                            {Math.round(currentStats.happy)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Grid */}
                <div className="flex justify-center items-center bg-stone-100 rounded-xl p-4 shadow-inner border border-stone-200/50 relative">
                    {/* Pollution Mist Overlay */}
                    {currentStats.totalPollution > 50 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: Math.min(0.3, currentStats.totalPollution / 500) }}
                            className="absolute inset-0 bg-slate-900 pointer-events-none mix-blend-multiply z-10"
                        />
                    )}

                    <div
                        className="grid gap-1.5 w-full max-w-sm"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
                    >
                        {grid.map((cell) => (
                            <motion.button
                                key={cell.id}
                                onClick={() => handleCellClick(cell.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    w-full aspect-square rounded-lg shadow-sm border flex items-center justify-center relative transition-all duration-300
                                    ${cell.type === 'empty' ? 'bg-white border-stone-100 hover:border-indigo-200' : ''}
                                    ${cell.type === 'residential' && cell.level === 1 ? 'bg-amber-100 border-amber-200' : ''}
                                    ${cell.type === 'residential' && cell.level === 2 ? 'bg-indigo-100 border-indigo-200' : ''}
                                    ${cell.type === 'residential' && cell.level === 3 ? 'bg-indigo-600 border-indigo-700 shadow-indigo-200 shadow-lg z-10' : ''}
                                    ${cell.type === 'industrial' ? 'bg-slate-200 border-slate-300' : ''}
                                    ${cell.type === 'park' ? 'bg-emerald-100 border-emerald-200' : ''}
                                `}
                            >
                                <AnimatePresence mode='wait'>
                                    {cell.type === 'residential' && cell.level === 1 && <Tent className="w-5 h-5 text-amber-700 opacity-70" />}
                                    {cell.type === 'residential' && cell.level === 2 && <Home className="w-6 h-6 text-indigo-500" />}
                                    {cell.type === 'residential' && cell.level === 3 && <Building2 className="w-7 h-7 text-white" />}

                                    {cell.type === 'industrial' && (
                                        <div className="relative">
                                            <Factory className={`w-6 h-6 ${cell.level === 3 ? 'text-slate-800' : 'text-slate-500'}`} />
                                            {/* Smoke particle */}
                                            <motion.div
                                                animate={{ y: -10, opacity: 0, x: 5 }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="absolute -top-1 right-0 w-2 h-2 bg-slate-400 rounded-full opacity-50"
                                            />
                                        </div>
                                    )}

                                    {cell.type === 'park' && <Trees className={`w-6 h-6 ${cell.level === 3 ? 'text-emerald-700' : 'text-emerald-500'}`} />}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Controls & Legend */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-stone-100">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">Velg Soneverktøy</label>
                        <div className="flex gap-2">
                            <ToolButton
                                type="residential"
                                label="Bolig"
                                icon={<Home className="w-4 h-4" />}
                                selected={selectedTool === 'residential'}
                                onClick={() => setSelectedTool('residential')}
                                color="indigo"
                            />
                            <ToolButton
                                type="industrial"
                                label="Industri"
                                icon={<Factory className="w-4 h-4" />}
                                selected={selectedTool === 'industrial'}
                                onClick={() => setSelectedTool('industrial')}
                                color="slate"
                            />
                            <ToolButton
                                type="park"
                                label="Park"
                                icon={<Trees className="w-4 h-4" />}
                                selected={selectedTool === 'park'}
                                onClick={() => setSelectedTool('park')}
                                color="emerald"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-100">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            Slik fungerer det
                        </label>
                        <ul className="space-y-3 text-sm text-stone-600">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <span><strong>Slum (Telt):</strong> Oppstår når boliger ligger for nær forurensende industri.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong>Forstad (Hus):</strong> Standard boligområde med grei avstand til jobb.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-900 mt-1.5 shrink-0" />
                                <span><strong>Skyskraper:</strong> Oppstår i rene områder nær parker. Høy verdi!</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                                <span><strong>Industri:</strong> Gir ingen befolkning, men senker verdien på nabolaget.</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setGrid(Array.from({ length: TOTAL_CELLS }, (_, i) => ({ id: i, type: 'empty', level: 1, pollution: 0, value: 0 })))}
                        className="w-full py-2 flex items-center justify-center gap-2 text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Nullstill Byen
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToolButton: React.FC<{ type: string, label: string, icon: React.ReactNode, selected: boolean, onClick: () => void, color: string }> = ({ label, icon, selected, onClick, color }) => {
    // Dynamic Tailwind classes are tricky, but limited set is fine
    const activeClass = {
        indigo: 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2',
        slate: 'bg-slate-100 text-slate-700 ring-2 ring-slate-500 ring-offset-2',
        emerald: 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2',
    }[color];

    return (
        <button
            onClick={onClick}
            className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all
                ${selected ? activeClass : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}
            `}
        >
            {icon}
            {label}
        </button>
    );
}
