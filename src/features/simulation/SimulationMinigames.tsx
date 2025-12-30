import React, { useMemo } from 'react';
import type { EquipmentItem, ActionType, SkillType } from './simulationTypes';
import { ITEM_TEMPLATES, SEASONS, WEATHER } from './constants';
import { Sparkles, ArrowRight } from 'lucide-react';
import { calculateYield } from './utils/simulationUtils';
import { getActionCostString } from './utils/actionUtils';

// Extracted Minigames
import { PlantingGame } from './minigames/PlantingGame';
import { HarvestingGame } from './minigames/HarvestingGame';
import { CraftingGame } from './minigames/CraftingGame';
import { BakingGame } from './minigames/BakingGame';
import { WoodcuttingGame } from './minigames/WoodcuttingGame';
import { ScytheSweepGame } from './minigames/ScytheSweepGame';
import { TrappingGame } from './minigames/TrappingGame';
import { WeavingGame } from './minigames/WeavingGame';
import { ApothecaryGame } from './minigames/ApothecaryGame';
import { MillingGame, SmeltingGame, SawingGame } from './minigames/SharedPlaceholders';

interface MinigameProps {
    type: ActionType;
    onComplete: (score: number) => void;
    onCancel: () => void;

    // Context
    playerUpgrades?: string[];
    equipment?: EquipmentItem[];
    skills?: any; // Record<SkillType, SkillData>

    // Optional presets
    selectedMethod?: string; // e.g., 'scythe' vs 'sickle'

    // Environmental
    currentSeason?: string;
    currentWeather?: string;
}

export const MINIGAME_VARIANTS: Record<string, { id: string, label: string, icon: string, desc: string }[]> = {
    WORK: [
        { id: 'sickle', label: 'Sigd', icon: '🌾', desc: 'Presisjons-høsting for høy kvalitet.' },
        { id: 'sweep', label: 'Ljå', icon: '🎋', desc: 'Rask innhøsting av store områder.' },
    ],
    CHOP: [
        { id: 'axe', label: 'Øks', icon: '🪓', desc: 'Fell trær med rå makt.' },
        { id: 'saw', label: 'Sag', icon: '🪚', desc: 'Presis kapping for planker.' },
    ],
    FORAGE: [
        { id: 'gather', label: 'Sanking', icon: '🍄', desc: 'Let etter mat og urter i skogen.' },
        { id: 'traps', label: 'Snarefangst', icon: '🕸️', desc: 'Sett feller for småvilt.' },
    ],
    MINE: [
        { id: 'pickaxe', label: 'Hakke', icon: '⛏️', desc: 'Hugg ut malm fra fjellet.' },
    ],
    QUARRY: [
        { id: 'chisel', label: 'Meisel', icon: '🔨', desc: 'Hugg ut steinblokker.' },
    ],
    CRAFT: [
        { id: 'hammer', label: 'Smiing', icon: '⚒️', desc: 'Form metallet på ambolten.' },
    ],
    MILL: [
        { id: 'grind', label: 'Kverning', icon: '⚙️', desc: 'Mal korn til mel.' },
    ],
    BAKE: [
        { id: 'oven', label: 'Steking', icon: '🔥', desc: 'Stek brød i ovnen.' },
    ],
    WEAVE: [
        { id: 'loom', label: 'Veving', icon: '🧶', desc: 'Vev tråd til stoffer.' },
    ],
    MIX: [
        { id: 'brew', label: 'Brygging', icon: '⚗️', desc: 'Bland urter til medisiner.' },
    ],
    SMELT: [
        { id: 'furnace', label: 'Smelting', icon: '🌋', desc: 'Smelt malm til barrer.' },
    ],
    PLANT: [
        { id: 'manual', label: 'Håndsåing', icon: '🌱', desc: 'Så frø for hånd.' },
    ]
};

const MinigameToolBadge: React.FC<{ item: EquipmentItem }> = ({ item }) => {
    const durabilityPct = (item.durability / item.maxDurability) * 100;
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-slate-900/90 border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 backdrop-blur-md shadow-2xl">
                <div className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{item.icon}</div>
                <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <div className={`w-2 h-2 rounded-full ${durabilityPct > 20 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span>Slitasje</span>
                        <span>{Math.round(durabilityPct)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getBestToolForAction = (type: string, equipment: (EquipmentItem | undefined | null)[]) => {
    if (!equipment) return undefined;
    return equipment.find(item => {
        if (!item) return false;
        const tid = Object.keys(ITEM_TEMPLATES).find(k => item.id === k || item.id.startsWith(k + '_'));
        const template = tid ? ITEM_TEMPLATES[tid] : null;
        return (template as any)?.relevantActions?.includes(type);
    });
};

/* --- MAIN OVERLAY COMPONENT --- */
export const MinigameOverlay: React.FC<MinigameProps> = ({ type, onComplete, onCancel, playerUpgrades, equipment, skills, currentSeason = 'Spring', currentWeather = 'Clear', selectedMethod: initialMethod }) => {
    const isRefining = ['MILL', 'SMELT', 'BAKE', 'WEAVE', 'MIX'].includes(type);
    const [selectedMethod, setSelectedMethod] = React.useState<string | null>(initialMethod || null);

    // Auto-select method if only one option exists or if passed as prop
    React.useEffect(() => {
        const variants = MINIGAME_VARIANTS[type];
        if (variants && variants.length === 1 && !selectedMethod) {
            setSelectedMethod(variants[0].id);
        }
    }, [type, selectedMethod]);

    // Determine relevant tool
    const activeTool = React.useMemo(() => {
        return getBestToolForAction(type, equipment || []);
    }, [type, equipment]);

    // Calculate Dynamic Difficulty & Bonuses based on enviroment
    const environmentMods = React.useMemo(() => {
        const seasonData = SEASONS[currentSeason as keyof typeof SEASONS];
        const weatherData = WEATHER[currentWeather as keyof typeof WEATHER];

        return {
            speedMultiplier: (weatherData?.speedMod || 1.0) * (activeTool?.stats?.speedBonus || 1.0),
            staminaCostMod: (seasonData?.staminaMod || 1.0) * (weatherData?.staminaMod || 1.0),
            yieldMod: (activeTool?.stats?.yieldBonus || 0) + ((seasonData as any)?.yieldMod || 1.0)
        };
    }, [currentSeason, currentWeather, activeTool]);

    // Calculate Potential Yield for UI preview
    const predictedYield = React.useMemo(() => {
        const base = isRefining ? 1 : 10;
        const skillType = 'FARMING';
        const seasonData = SEASONS[currentSeason as keyof typeof SEASONS];
        const weatherData = WEATHER[currentWeather as keyof typeof WEATHER];

        // Convert equipment array to record for calculateYield
        const equipmentRecord: Record<string, EquipmentItem> = {};
        equipment?.forEach(item => {
            if (item) equipmentRecord[item.type] = item;
        });

        return calculateYield(
            { skills, equipment: equipmentRecord }, // First arg: actor object
            base,                 // Second arg: base yield
            skillType,            // Third arg: skillType
            {                     // Fourth arg: modifiers
                season: (seasonData as any)?.yieldMod,
                weather: (weatherData as any)?.yieldMod,
                isRefining
            }
        );
    }, [currentSeason, currentWeather, isRefining]);

    const handleMethodSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    // If method not selected, show Selection Screen
    if (!selectedMethod && MINIGAME_VARIANTS[type]) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="max-w-4xl w-full p-8">
                    <h2 className="text-4xl font-black text-white text-center mb-12 uppercase tracking-tighter drop-shadow-lg">Velg Metode</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {MINIGAME_VARIANTS[type].map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => handleMethodSelect(variant.id)}
                                className="group relative bg-slate-900 border-2 border-slate-700 hover:border-indigo-500 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(79,70,229,0.3)] text-left overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{variant.icon}</div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide group-hover:text-indigo-400 transition-colors">{variant.label}</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">{variant.desc}</p>
                                    </div>
                                    {/* Cost/Requirement Preview */}
                                    <div className="mt-4 pt-4 border-t border-white/5 w-full">
                                        {(() => {
                                            const costLabel = getActionCostString(type, currentSeason as any, currentWeather as any);
                                            if (costLabel) {
                                                return (
                                                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                                                        <span>{costLabel}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button onClick={onCancel} className="mt-12 mx-auto block text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-sm">Avbryt</button>
                </div>
            </div>
        );
    }

    // Render Active Minigame
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute top-8 right-8 z-[110]">
                <button
                    onClick={onCancel}
                    className="bg-black/40 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 w-12 h-12 rounded-full flex items-center justify-center transition-all"
                >
                    ✕
                </button>
            </div>

            {/* Environmental HUD */}
            <div className="absolute top-8 left-8 z-[110] flex gap-4">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                    <span className="text-2xl" title={SEASONS[currentSeason as keyof typeof SEASONS]?.label || currentSeason}>
                        {currentSeason === 'Winter' ? '❄️' : currentSeason === 'Summer' ? '☀️' : currentSeason === 'Autumn' ? '🍂' : '🌱'}
                    </span>
                    <span className="text-2xl" title={WEATHER[currentWeather as keyof typeof WEATHER]?.label || currentWeather}>
                        {WEATHER[currentWeather as keyof typeof WEATHER]?.icon}
                    </span>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Forhold</span>
                        <span className={`text-xs font-bold ${environmentMods.speedMultiplier < 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {Math.round(environmentMods.speedMultiplier * 100)}% Hastighet
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
                {/* Minigame Content Switcher */}
                {(() => {
                    switch (type) {
                        case 'PLANT':
                            return <PlantingGame onComplete={onComplete} />;

                        case 'HARVEST': // Generic Harvest (Mining, Chopping etc if grouped) or specific crop harvest
                        case 'WORK': // Farming / Harvesting
                            if (selectedMethod === 'sweep' || selectedMethod === 'scythe') {
                                return <ScytheSweepGame onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} />;
                            }
                            // Default to Harvesting Game (Rhythm)
                            return <HarvestingGame onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'CHOP':
                            if (selectedMethod === 'saw') return <SawingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;
                            return <WoodcuttingGame onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'FORAGE':
                            if (selectedMethod === 'traps') return <TrappingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;
                            return <HarvestingGame isForaging onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} resourceName="Mat/Urter" />;

                        case 'MINE':
                            return <HarvestingGame isMining onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} resourceName="Malm" />;

                        case 'QUARRY':
                            return <HarvestingGame isQuarrying onComplete={onComplete} equipment={equipment} speedMultiplier={environmentMods.speedMultiplier} resourceName="Stein" />;

                        case 'CRAFT':
                        case 'REPAIR': // Repair uses crafting game for now
                            return <CraftingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'MILL':
                            return <MillingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'SMELT':
                            return <SmeltingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'BAKE':
                            return <BakingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'WEAVE':
                            return <WeavingGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        case 'MIX': // Apothecary
                            return <ApothecaryGame onComplete={onComplete} speedMultiplier={environmentMods.speedMultiplier} />;

                        default:
                            return (
                                <div className="p-12 text-center">
                                    <h2 className="text-2xl font-bold text-white mb-4">Ukjent Minispill: {type}</h2>
                                    <button onClick={() => onComplete(0.5)} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold text-white">
                                        Fullfør (Skip)
                                    </button>
                                </div>
                            );
                    }
                })()}

                {/* Show Active Tool Badge */}
                {activeTool && <MinigameToolBadge item={activeTool} />}
            </div>
        </div>
    );
};
