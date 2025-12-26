import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Zap, Scroll, Skull, Crown, Star, ArrowRight, Backpack, Lock, CloudRain, Moon, BookOpen, X, Map as MapIcon, Users, Hammer, Scale } from 'lucide-react';
import type { ChronosNode, ChronosChoice, ChronosStat, ChronosConfig, ChronosEnvironment, ChronosEntry, ChronosMapPoint, ChronosRecipe } from '../../data/chronos/types';
import { DiceGame } from './minigames/DiceGame';
import { BattleGame } from './minigames/BattleGame';
import { JusticeGame } from './minigames/JusticeGame';
import { CraftingModal } from './CraftingModal';
import { ChronosMap } from './ChronosMap'; // Import Map Component

interface ChronosUIProps {
    node: ChronosNode;
    stats: ChronosStat[];
    inventory?: string[];
    environment?: Partial<ChronosEnvironment>;
    journal?: ChronosEntry[];
    onAddJournalEntry?: (text: string) => void;
    config: ChronosConfig;
    onChoice: (choice: ChronosChoice) => void;
    onRestart?: () => void;
    onCraft?: (recipe: ChronosRecipe) => void;
}

const IconMap: Record<string, any> = {
    shield: Shield,
    heart: Heart,
    zap: Zap,
    scroll: Scroll,
    skull: Skull,
    crown: Crown,
    star: Star,
    backpack: Backpack,
    sword: Zap,
    book: BookOpen,
    map: MapIcon,
    users: Users,
    hammer: Hammer,
    scale: Scale
};

const WeatherOverlay: React.FC<{ environment?: Partial<ChronosEnvironment> }> = ({ environment }) => {
    const isNight = environment?.time === 'night';
    const isRain = environment?.weather === 'rain';

    return (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
            {/* Night Overlay */}
            <AnimatePresence>
                {isNight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 bg-indigo-950/60 mix-blend-multiply"
                    >
                        <div className="absolute top-8 right-8 text-yellow-100/80 animate-pulse">
                            <Moon size={32} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rain Overlay */}
            <AnimatePresence>
                {isRain && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-800/20 mix-blend-overlay"
                    >
                        <div className="absolute top-8 left-8 text-blue-200/60 animate-bounce">
                            <CloudRain size={32} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ChronosUI: React.FC<ChronosUIProps> = ({ node, stats, inventory = [], environment = { time: 'day', weather: 'clear' }, journal = [], onAddJournalEntry, config, onChoice, onRestart, onCraft }) => {
    const [journalText, setJournalText] = useState('');
    const [showJournal, setShowJournal] = useState(false);
    const [showCrafting, setShowCrafting] = useState(false);
    const [showInventory, setShowInventory] = useState(false);

    // Filter Stats
    const attributes = stats.filter(s => !s.category || s.category === 'attribute');
    const relations = stats.filter(s => s.category === 'relation');

    // Dynamic Icon resolver
    const getIcon = (iconName: string) => {
        const Icon = IconMap[iconName] || Star;
        return <Icon size={16} />;
    };

    // Helper to check if choice is locked
    const isChoiceLocked = (choice: ChronosChoice) => {
        if (choice.checkInventory?.hasItem) {
            return !inventory.includes(choice.checkInventory.hasItem);
        }
        if (choice.checkInventory?.lacksItem) {
            return inventory.includes(choice.checkInventory.lacksItem);
        }
        return false;
    };

    const getItemDetails = (itemId: string) => {
        return config.items?.find(i => i.id === itemId);
    };

    const handleJournalSubmit = () => {
        if (onAddJournalEntry && journalText.trim()) {
            onAddJournalEntry(journalText);
        }
        setJournalText('');
        if (node.choices.length > 0) {
            onChoice(node.choices[0]);
        }
    };

    // Handle Map Point Click
    const handleMapPointClick = (point: ChronosMapPoint) => {
        onChoice({
            id: `map_click_${point.id}`,
            text: point.label,
            nextNodeId: point.nextNodeId
        });
    };

    const isEnd = node.isEnd;

    return (
        <div className="relative w-full min-h-[600px] rounded-[2.5rem] overflow-hidden bg-[#FDFBF7] shadow-2xl border border-stone-200 group ring-1 ring-black/5 flex flex-col justify-between">
            {/* Weather Overlay */}
            <WeatherOverlay environment={environment} />

            {/* Background Image Layer (Absolute) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={node.backgroundImage || 'default'}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 z-0"
                >
                    {node.backgroundImage && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent z-10" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/60 via-transparent to-[#FDFBF7] z-10" />
                            <img
                                src={node.backgroundImage}
                                alt="Setting"
                                className="w-full h-full object-cover opacity-90 mix-blend-multiply filter sepia-[.15]"
                            />
                        </>
                    )}
                    {!node.backgroundImage && (
                        <div className="w-full h-full bg-[#FDFBF7]" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* HUD Layer (Relative, Top) */}
            <div className="relative z-20 p-8 w-full flex justify-between items-start">
                <div className="flex gap-4">
                    {/* Attributes */}
                    <div className="flex flex-wrap gap-4 p-3 pl-5 pr-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm shadow-stone-200/50 w-fit">
                        {attributes.map(stat => (
                            <div key={stat.id} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                                    {getIcon(stat.icon)}
                                    <span>{stat.label}</span>
                                </div>
                                <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                        style={{ backgroundColor: config.theme?.primaryColor || '#6366f1' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Relations - Only show if exist */}
                    {relations.length > 0 && (
                        <div className="flex flex-wrap gap-4 p-3 pl-5 pr-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm shadow-stone-200/50 w-fit">
                            {relations.map(stat => (
                                <div key={stat.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                        {getIcon(stat.icon)}
                                        <span>{stat.label}</span>
                                    </div>
                                    <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            className="h-full bg-indigo-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {/* Journal Toggle */}
                    <button
                        onClick={() => setShowJournal(true)}
                        className="p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm text-stone-600 hover:text-stone-900 transition-colors"
                    >
                        <BookOpen size={20} />
                    </button>

                    {/* Crafting Toggle */}
                    {config.recipes && config.recipes.length > 0 && onCraft && (
                        <button
                            onClick={() => setShowCrafting(true)}
                            className="p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <Hammer size={20} />
                        </button>
                    )}

                    {/* Inventory Bag */}
                    <div className="relative">
                        <button
                            onClick={() => setShowInventory(!showInventory)}
                            className={`p-4 rounded-2xl border transition-colors relative ${showInventory ? 'bg-indigo-100 text-indigo-900 border-indigo-200' : 'bg-white/80 backdrop-blur-xl border-stone-200/50 text-stone-600 hover:text-stone-900'}`}
                        >
                            <Backpack size={20} />
                            {inventory.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-white">
                                    {inventory.length}
                                </span>
                            )}
                        </button>

                        {/* Inventory Popover */}
                        <AnimatePresence>
                            {showInventory && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-4 w-72 p-1 rounded-2xl bg-white shadow-xl border border-stone-100 z-50 overflow-hidden"
                                >
                                    <div className="p-4 bg-stone-50 border-b border-stone-100">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Ryggsekk</h4>
                                    </div>
                                    <div className="p-2 max-h-64 overflow-y-auto">
                                        {inventory.length === 0 ? (
                                            <p className="p-4 text-sm text-stone-500 italic text-center">Sekken er tom.</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {inventory.map((itemId, idx) => {
                                                    const item = getItemDetails(itemId);
                                                    return (
                                                        <div key={`${itemId}-${idx}`} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-100 shadow-sm">
                                                            <div className="p-2 bg-stone-50 rounded-lg text-stone-400">
                                                                {item?.icon ? getIcon(item.icon) : <Star size={14} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-stone-800">{item?.name || itemId}</p>
                                                                <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">{item?.description}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Journal Modal */}
            <AnimatePresence>
                {showJournal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                                <h3 className="font-display font-black text-xl text-stone-800">Dagbok</h3>
                                <button onClick={() => setShowJournal(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6 font-serif">
                                {journal.length === 0 && <p className="text-stone-500 italic text-center">Ingen oppføringer ennå.</p>}
                                {journal.map((entry, i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Dag {entry.day}</div>
                                        <p className="text-stone-700 leading-relaxed italic">"{entry.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CraftingModal
                isOpen={showCrafting}
                onClose={() => setShowCrafting(false)}
                recipes={config.recipes || []}
                inventory={inventory}
                items={config.items || []}
                onCraft={(recipe) => {
                    if (onCraft) {
                        onCraft(recipe);
                        // Optional: close on craft? or keep open. Keeping open is usually better for multi-craft
                    }
                }}
            />

            {/* Spacer to push content down if needed, but flex-col justify-between handles most */}
            <div className="flex-grow z-10" />

            {/* Dialogue Layer (Relative, Bottom) */}
            <div className="relative z-30 p-8 md:p-12 w-full bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/95 to-transparent">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-4xl mx-auto w-full relative z-40"
                    >
                        {/* Speaker Tag */}
                        {node.speaker && (
                            <div className="inline-block px-4 py-1.5 mb-6 rounded-lg bg-stone-100 border border-stone-200 text-[10px] font-black uppercase tracking-[0.2em] text-stone-600 shadow-sm">
                                {node.speaker}
                            </div>
                        )}

                        {/* Main Text & Content */}
                        <h2
                            className="text-2xl md:text-4xl font-medium text-stone-900 mb-8 md:mb-10 leading-[1.35] tracking-tight"
                            style={{ fontFamily: config.theme?.font || 'serif' }}
                        >
                            {node.text}
                        </h2>

                        {node.minigame ? (
                            node.minigame.type === 'dice' ? (
                                <DiceGame
                                    targetScore={node.minigame.config.targetScore}
                                    wager={node.minigame.config.wager}
                                    onComplete={(success: boolean) => {
                                        if (node.minigame?.type === 'dice') {
                                            const nextId = success ? node.minigame.config.winNodeId : node.minigame.config.lossNodeId;
                                            onChoice({
                                                id: 'minigame_complete',
                                                text: 'Dice Game Complete',
                                                nextNodeId: nextId
                                            });
                                        }
                                    }}
                                />
                            ) : node.minigame.type === 'battle' ? (
                                <BattleGame
                                    config={node.minigame.config}
                                    onComplete={(success: boolean) => {
                                        if (node.minigame?.type === 'battle') {
                                            const nextId = success ? node.minigame.config.winNodeId : node.minigame.config.lossNodeId;
                                            onChoice({
                                                id: 'battle_complete',
                                                text: 'Battle Complete',
                                                nextNodeId: nextId
                                            });
                                        }
                                    }}
                                />
                            ) : node.minigame.type === 'justice' ? (
                                <JusticeGame
                                    config={node.minigame.config}
                                    onComplete={() => {
                                        if (node.minigame?.type === 'justice') {
                                            onChoice({
                                                id: 'justice_complete',
                                                text: 'Court Adjourned',
                                                nextNodeId: node.minigame.config.onComplete.nextNodeId
                                            });
                                        }
                                    }}
                                />
                            ) : null
                        ) : node.uiType === 'map' && node.mapConfig ? (
                            <ChronosMap
                                config={node.mapConfig}
                                onPointClick={handleMapPointClick}
                            />
                        ) : node.journalPrompt ? (
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase tracking-widest text-stone-400">{node.journalPrompt}</p>
                                <textarea
                                    value={journalText}
                                    onChange={(e) => setJournalText(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-stone-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-serif text-lg bg-white/50 backdrop-blur-sm min-h-[150px]"
                                    placeholder="Skriv dine tanker..."
                                />
                                <button
                                    onClick={handleJournalSubmit}
                                    disabled={!journalText.trim()}
                                    className="px-8 py-3 bg-indigo-900 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Lagre Dagbok & Sov
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isEnd && node.choices.map(choice => {
                                    const locked = isChoiceLocked(choice);
                                    const reqItemName = choice.checkInventory?.hasItem ? getItemDetails(choice.checkInventory.hasItem)?.name : null;

                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => !locked && onChoice(choice)}
                                            disabled={locked}
                                            className={`group relative p-6 text-left rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${locked
                                                ? 'bg-stone-100 border-stone-200 opacity-70 cursor-not-allowed'
                                                : 'bg-white border-stone-200 hover:border-indigo-200 active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5'
                                                }`}
                                        >
                                            {!locked && <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}

                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className={`font-medium text-lg transition-colors ${locked ? 'text-stone-400' : 'text-stone-700 group-hover:text-indigo-900'}`}>
                                                        {choice.text}
                                                    </span>
                                                    {locked && reqItemName && (
                                                        <span className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1">
                                                            <Lock size={10} /> Mange: {reqItemName}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${locked
                                                    ? 'bg-stone-200 text-stone-400'
                                                    : 'bg-stone-100 group-hover:bg-indigo-100 text-stone-400 group-hover:text-indigo-600'
                                                    }`}>
                                                    {locked ? <Lock size={14} /> : <ArrowRight size={16} />}
                                                </div>
                                            </div>

                                            {/* Effect Preview (Hide if locked?) */}
                                            {!locked && choice.effects && (
                                                <div className="relative z-10 flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    {Object.keys(choice.effects).map(key => (
                                                        <span key={key} className={`text-[10px] font-black uppercase tracking-wider ${choice.effects![key] > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {choice.effects![key] > 0 ? '+' : ''}{choice.effects![key]} {stats.find(s => s.id === key)?.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}

                                {isEnd && (
                                    <div className="md:col-span-2 space-y-8">
                                        <div className={`p-10 rounded-[2rem] border text-center shadow-lg ${node.endType === 'victory'
                                            ? 'bg-emerald-50/50 border-emerald-100'
                                            : node.endType === 'defeat'
                                                ? 'bg-rose-50/50 border-rose-100'
                                                : 'bg-stone-50/50 border-stone-200'
                                            }`}>
                                            {node.endType === 'victory' && <Crown className="mx-auto mb-6 text-emerald-600" size={48} />}
                                            {node.endType === 'defeat' && <Skull className="mx-auto mb-6 text-rose-500" size={48} />}

                                            <h3 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">
                                                {node.endType === 'victory' ? 'Historisk Seier' : node.endType === 'defeat' ? 'Historien endte her...' : 'Reisen er over'}
                                            </h3>
                                            <p className="text-lg text-stone-600 font-medium leading-relaxed max-w-lg mx-auto">
                                                {node.endType === 'victory' ? 'Du navigerte fortidens utfordringer med kløkt og visdom.' : 'Du lærte en hard lekse om fortidens brutale virkelighet.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={onRestart}
                                            className="w-full py-6 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl hover:shadow-2xl shadow-stone-400/20"
                                        >
                                            Prøv på nytt
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
