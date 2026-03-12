import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Heart, Zap, Scroll, Skull, Crown, Star, ArrowRight, Backpack, Lock,
    CloudRain, Moon, BookOpen, X, Map as MapIcon, Users, Hammer, Scale, Activity,
    CloudFog, CloudLightning, Sunrise, Sunset, Brain, Lightbulb, ExternalLink,
    Mail, Feather, PenLine,
} from 'lucide-react';
import type {
    ChronosNode, ChronosChoice, ChronosStat, ChronosConfig, ChronosEnvironment,
    ChronosEntry, ChronosMapPoint, ChronosRecipe, ChronosDiscoveryEvent,
    ChronosEpilogue, ChronosEthicsLens, ChronosItem,
} from '../../data/chronos/types';
import { DiceGame } from './minigames/DiceGame';
import { BattleGame } from './minigames/BattleGame';
import { JusticeGame } from './minigames/JusticeGame';
import { CraftingModal } from './CraftingModal';
import { ChronosMap } from './ChronosMap';
import { ItemInspectModal } from './ItemInspectModal';

interface ChronosUIProps {
    node: ChronosNode;
    stats: ChronosStat[];
    inventory?: string[];
    environment?: Partial<ChronosEnvironment>;
    journal?: ChronosEntry[];
    onAddJournalEntry?: (text: string) => void;
    config: ChronosConfig;
    flags?: string[];
    onChoice: (choice: ChronosChoice) => void;
    onRestart?: () => void;
    onCraft?: (recipe: ChronosRecipe) => void;
}

const IconMap: Record<string, any> = {
    shield: Shield, heart: Heart, zap: Zap, scroll: Scroll, skull: Skull,
    crown: Crown, star: Star, backpack: Backpack, sword: Zap, book: BookOpen,
    map: MapIcon, users: Users, hammer: Hammer, scale: Scale, activity: Activity, eye: Shield,
    mail: Mail, feather: Feather, pen: PenLine,
};

// ── Weather Overlay ──────────────────────────────────────────────────────────

const WeatherOverlay: React.FC<{ environment?: Partial<ChronosEnvironment> }> = ({ environment }) => {
    const isNight = environment?.time === 'night';
    const isDawn = environment?.time === 'dawn';
    const isDusk = environment?.time === 'dusk';
    const isRain = environment?.weather === 'rain';
    const isFog = environment?.weather === 'fog';
    const isStorm = environment?.weather === 'storm';

    return (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <AnimatePresence>
                {isNight && (
                    <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-indigo-950/60 mix-blend-multiply">
                        <div className="absolute top-8 right-8 text-yellow-100/80 animate-pulse"><Moon size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isDawn && (
                    <motion.div key="dawn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-rose-400/20 to-transparent">
                        <div className="absolute bottom-8 right-8 text-amber-300/80"><Sunrise size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isDusk && (
                    <motion.div key="dusk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-purple-800/20 to-transparent">
                        <div className="absolute top-8 right-8 text-purple-300/80"><Sunset size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isRain && (
                    <motion.div key="rain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-800/20 mix-blend-overlay">
                        <div className="absolute top-8 left-8 text-blue-200/60 animate-bounce"><CloudRain size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isFog && (
                    <motion.div key="fog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3 }}
                        className="absolute inset-0 bg-gradient-to-b from-white/40 via-gray-200/30 to-white/50">
                        <div className="absolute top-8 left-8 text-gray-400/60"><CloudFog size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isStorm && (
                    <motion.div key="storm" initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -2, 2, -1, 1, 0] }} exit={{ opacity: 0 }}
                        transition={{ opacity: { duration: 1 }, x: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } }}
                        className="absolute inset-0 bg-slate-900/40 mix-blend-multiply">
                        <div className="absolute top-8 left-8 text-yellow-200/80 animate-pulse"><CloudLightning size={32} /></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Discovery Modal (Prinsipp 3) ─────────────────────────────────────────────

const DiscoveryModal: React.FC<{ event: ChronosDiscoveryEvent; onDismiss: () => void }> = ({ event, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
            <div className="p-5 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                    <Lightbulb size={20} className="text-amber-700" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Historisk oppdagelse</p>
                    <h3 className="font-display font-black text-lg text-stone-800 leading-tight">{event.title}</h3>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <p className="text-stone-700 leading-relaxed">{event.fact}</p>
                {event.reflectionQuestion && (
                    <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Tenk over</p>
                        <p className="text-sm text-stone-600 italic leading-relaxed">{event.reflectionQuestion}</p>
                    </div>
                )}
                {event.articleLink && (
                    <a href={event.articleLink} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        <ExternalLink size={14} />
                        Les mer i boken
                    </a>
                )}
            </div>
            <div className="px-6 pb-6">
                <button onClick={onDismiss}
                    className="w-full py-3 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all text-sm">
                    Forstått — gå videre
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ── Ethics Pause Modal (Prinsipp 6) ──────────────────────────────────────────

const EthicsModal: React.FC<{
    ethicsLens: ChronosEthicsLens;
    choiceText: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ ethicsLens, choiceText, onConfirm, onCancel }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
            <div className="p-5 bg-violet-50 border-b border-violet-100 flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl flex-shrink-0">
                    <Brain size={20} className="text-violet-700" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Etikk-pause</p>
                    <p className="font-medium text-stone-700 text-sm leading-snug">"{choiceText}"</p>
                </div>
            </div>
            <div className="p-5 space-y-3">
                <div className="bg-stone-50 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Pliktetikk (Kant)</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{ethicsLens.deontological}</p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Konsekvensetikk</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{ethicsLens.consequentialist}</p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Dygdsetikk</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{ethicsLens.virtue}</p>
                </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
                <button onClick={onCancel}
                    className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all">
                    Angre
                </button>
                <button onClick={onConfirm}
                    className="flex-1 py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-all">
                    Gå videre
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ── Epilogue Card (Prinsipp 5) ───────────────────────────────────────────────

const EpilogueCard: React.FC<{ epilogue: ChronosEpilogue; flags: string[] }> = ({ epilogue, flags }) => {
    const personalizedEntries = epilogue.entries.filter(entry => {
        if (entry.hasFlag && !flags.includes(entry.hasFlag)) return false;
        if (entry.lacksFlag && flags.includes(entry.lacksFlag)) return false;
        return true;
    });

    return (
        <div className="text-left space-y-4 max-w-lg mx-auto mt-4">
            {personalizedEntries.length > 0 && (
                <div className="space-y-2">
                    {personalizedEntries.map((entry, i) => (
                        <p key={i} className="text-sm text-stone-700 leading-relaxed">{entry.text}</p>
                    ))}
                </div>
            )}
            <div className="border-t border-stone-200/70 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Historisk ekko</p>
                <p className="text-sm text-stone-600 italic leading-relaxed">{epilogue.historicalEcho}</p>
            </div>
            <div className="bg-stone-100/80 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Til refleksjon</p>
                <p className="text-sm text-stone-700 leading-relaxed">{epilogue.reflectionQuestion}</p>
            </div>
        </div>
    );
};

// ── Main ChronosUI ───────────────────────────────────────────────────────────

export const ChronosUI: React.FC<ChronosUIProps> = ({
    node, stats, inventory = [], environment = { time: 'day', weather: 'clear' },
    journal = [], onAddJournalEntry, config, flags = [], onChoice, onRestart, onCraft,
}) => {
    const [journalText, setJournalText] = useState('');
    const [showJournal, setShowJournal] = useState(false);
    const [showCrafting, setShowCrafting] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ChronosItem | null>(null);

    // Prinsipp 3: Discovery events
    const [showDiscovery, setShowDiscovery] = useState(false);
    const seenDiscoveries = useRef<Set<string>>(new Set());

    // Prinsipp 6: Ethics mode
    const [ethicsModeOn, setEthicsModeOn] = useState(false);
    const [pendingChoice, setPendingChoice] = useState<ChronosChoice | null>(null);

    // Auto-show discovery event when entering a new node
    useEffect(() => {
        if (node.discoveryEvent && !seenDiscoveries.current.has(node.id)) {
            seenDiscoveries.current.add(node.id);
            setShowDiscovery(true);
        }
    }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter Stats
    const attributes = stats.filter(s => !s.category || s.category === 'attribute');
    const relations = stats.filter(s => s.category === 'relation');

    const getIcon = (iconName: string) => {
        const Icon = IconMap[iconName] || Star;
        return <Icon size={16} />;
    };

    const getItemDetails = (itemId: string) => config.items?.find(i => i.id === itemId);

    // Prinsipp 1: Condition check with flag support
    const isChoiceLocked = (choice: ChronosChoice): boolean => {
        if (choice.checkInventory?.hasItem && !inventory.includes(choice.checkInventory.hasItem)) return true;
        if (choice.checkInventory?.lacksItem && inventory.includes(choice.checkInventory.lacksItem)) return true;
        if (choice.condition) {
            const cond = choice.condition;
            if (cond.hasFlag && !flags.includes(cond.hasFlag)) return true;
            if (cond.lacksFlag && flags.includes(cond.lacksFlag)) return true;
            if (cond.statId && cond.operator !== undefined && cond.value !== undefined) {
                const stat = stats.find(s => s.id === cond.statId);
                if (stat) {
                    switch (cond.operator) {
                        case '>=': if (!(stat.value >= cond.value)) return true; break;
                        case '>':  if (!(stat.value > cond.value)) return true; break;
                        case '<=': if (!(stat.value <= cond.value)) return true; break;
                        case '<':  if (!(stat.value < cond.value)) return true; break;
                        case '==': if (!(stat.value === cond.value)) return true; break;
                    }
                }
            }
        }
        return false;
    };

    const getLockedReason = (choice: ChronosChoice): string | null => {
        if (choice.checkInventory?.hasItem && !inventory.includes(choice.checkInventory.hasItem)) {
            const item = getItemDetails(choice.checkInventory.hasItem);
            return item?.name ? `Mangler: ${item.name}` : 'Mangler gjenstand';
        }
        if (choice.condition) {
            const cond = choice.condition;
            if (cond.hasFlag) return `Krever hendelse: ${cond.hasFlag}`;
            if (cond.lacksFlag) return `Blokkert av: ${cond.lacksFlag}`;
            if (cond.statId) {
                const stat = stats.find(s => s.id === cond.statId);
                if (stat) return `Krever: ${stat.label} ${cond.operator} ${cond.value}`;
            }
        }
        return null;
    };

    // Prinsipp 2: NPC tone resolver
    const getNPCTone = () => {
        if (!node.npcDialogue) return null;
        const d = node.npcDialogue;
        const stat = stats.find(s => s.id === d.statId);
        if (!stat) return d.neutral;
        const pct = (stat.value / stat.max) * 100;
        const coldBelow = d.thresholds?.coldBelow ?? 33;
        const warmAbove = d.thresholds?.warmAbove ?? 66;
        if (pct < coldBelow) return d.cold;
        if (pct >= warmAbove) return d.warm;
        return d.neutral;
    };

    // Prinsipp 6: Choice click handler with ethics intercept
    const handleChoiceClick = (choice: ChronosChoice) => {
        if (ethicsModeOn && choice.ethicsLens) {
            setPendingChoice(choice);
        } else {
            onChoice(choice);
        }
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

    const handleMapPointClick = (point: ChronosMapPoint) => {
        onChoice({ id: `map_click_${point.id}`, text: point.label, nextNodeId: point.nextNodeId });
    };

    const isEnd = node.isEnd;
    const npcTone = getNPCTone();

    return (
        <div className="relative w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] rounded-[2.5rem] overflow-hidden bg-[#FDFBF7] shadow-2xl border border-stone-200 group ring-1 ring-black/5 flex flex-col justify-between">
            <WeatherOverlay environment={environment} />

            {/* Background Image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={node.backgroundImage || 'default'}
                    initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 z-0"
                >
                    {node.backgroundImage ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent z-10" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/60 via-transparent to-[#FDFBF7] z-10" />
                            <img src={node.backgroundImage} alt="Setting"
                                className="w-full h-full object-cover opacity-90 mix-blend-multiply filter sepia-[.15]" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-[#FDFBF7]" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* HUD Layer */}
            <div className="relative z-20 p-3 sm:p-5 md:p-8 w-full flex justify-between items-start">
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                    {/* Attributes */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 p-2 pl-3 pr-4 sm:p-3 sm:pl-5 sm:pr-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm w-fit">
                        {attributes.map(stat => (
                            <div key={stat.id} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                                    {getIcon(stat.icon)}<span>{stat.label}</span>
                                </div>
                                <div className="w-20 sm:w-28 md:w-32 h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                                    <motion.div className="h-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                                        style={{ backgroundColor: config.theme?.primaryColor || '#6366f1' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Relations */}
                    {relations.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:gap-4 p-2 pl-3 pr-4 sm:p-3 sm:pl-5 sm:pr-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm w-fit">
                            {relations.map(stat => (
                                <div key={stat.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                        {getIcon(stat.icon)}<span>{stat.label}</span>
                                    </div>
                                    <div className="w-16 sm:w-20 md:w-24 h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                                        <motion.div className="h-full bg-indigo-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                            transition={{ type: 'spring', stiffness: 50, damping: 20 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 md:gap-3">
                    {/* Prinsipp 6: Ethics mode toggle */}
                    <button onClick={() => setEthicsModeOn(!ethicsModeOn)} title={ethicsModeOn ? 'Skru av etikk-modus' : 'Slå på etikk-modus'}
                        className={`p-2 sm:p-3 md:p-4 rounded-2xl border transition-colors ${ethicsModeOn ? 'bg-violet-100 text-violet-900 border-violet-200' : 'bg-white/80 backdrop-blur-xl border-stone-200/50 text-stone-600 hover:text-stone-900'}`}>
                        <Brain size={20} />
                    </button>

                    {/* Journal */}
                    <button onClick={() => setShowJournal(true)}
                        className="p-2 sm:p-3 md:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm text-stone-600 hover:text-stone-900 transition-colors">
                        <BookOpen size={20} />
                    </button>

                    {/* Crafting */}
                    {config.recipes && config.recipes.length > 0 && onCraft && (
                        <button onClick={() => setShowCrafting(true)}
                            className="p-2 sm:p-3 md:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-stone-200/50 shadow-sm text-stone-600 hover:text-stone-900 transition-colors">
                            <Hammer size={20} />
                        </button>
                    )}

                    {/* Inventory */}
                    <button onClick={() => setShowInventory(!showInventory)}
                        className={`p-2 sm:p-3 md:p-4 rounded-2xl border transition-colors relative ${showInventory ? 'bg-indigo-100 text-indigo-900 border-indigo-200' : 'bg-white/80 backdrop-blur-xl border-stone-200/50 text-stone-600 hover:text-stone-900'}`}>
                        <Backpack size={20} />
                        {inventory.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-white">
                                {inventory.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Journal Modal */}
            <AnimatePresence>
                {showJournal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-8">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                                <h3 className="font-display font-black text-xl text-stone-800">Dagbok</h3>
                                <button onClick={() => setShowJournal(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
                            </div>
                            <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6 font-serif">
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

            {/* Inventory Side Panel */}
            <AnimatePresence>
                {showInventory && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex justify-end"
                        onClick={() => setShowInventory(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-[#FDFBF7] w-80 h-full shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                                <h3 className="font-display font-black text-xl text-stone-800">Ryggsekk</h3>
                                <button onClick={() => setShowInventory(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
                            </div>
                            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2">
                                {inventory.length === 0
                                    ? <p className="text-sm text-stone-500 italic text-center mt-8">Sekken er tom.</p>
                                    : inventory.map((itemId, idx) => {
                                        const item = getItemDetails(itemId);
                                        return (
                                            <button key={`${itemId}-${idx}`}
                                                onClick={() => { if (item) { setSelectedItem(item); setShowInventory(false); } }}
                                                className="w-full flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-100 shadow-sm text-left hover:border-indigo-200 transition-all"
                                            >
                                                <div className="p-2 bg-stone-50 rounded-lg text-stone-400 flex-shrink-0">
                                                    {item?.icon ? getIcon(item.icon) : <Star size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-stone-800">{item?.name || itemId}</p>
                                                    <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">{item?.description}</p>
                                                    {item?.content && (
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mt-1">
                                                            Trykk for å lese
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                }
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prinsipp 3: Discovery Modal */}
            <AnimatePresence>
                {showDiscovery && node.discoveryEvent && (
                    <DiscoveryModal event={node.discoveryEvent} onDismiss={() => setShowDiscovery(false)} />
                )}
            </AnimatePresence>

            {/* Prinsipp 6: Ethics Pause Modal */}
            <AnimatePresence>
                {pendingChoice && pendingChoice.ethicsLens && (
                    <EthicsModal
                        ethicsLens={pendingChoice.ethicsLens}
                        choiceText={pendingChoice.text}
                        onConfirm={() => { onChoice(pendingChoice); setPendingChoice(null); }}
                        onCancel={() => setPendingChoice(null)}
                    />
                )}
            </AnimatePresence>

            <CraftingModal
                isOpen={showCrafting}
                onClose={() => setShowCrafting(false)}
                recipes={config.recipes || []}
                inventory={inventory}
                items={config.items || []}
                onCraft={(recipe) => { if (onCraft) onCraft(recipe); }}
            />

            <ItemInspectModal item={selectedItem} onClose={() => setSelectedItem(null)} />

            <div className="flex-grow z-10" />

            {/* Dialogue Layer */}
            <div className="relative z-30 p-4 sm:p-6 md:p-8 lg:p-12 w-full bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/95 to-transparent">
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
                            <div className="inline-block px-4 py-1.5 mb-4 rounded-lg bg-stone-100 border border-stone-200 text-[10px] font-black uppercase tracking-[0.2em] text-stone-600 shadow-sm">
                                {node.speaker}
                            </div>
                        )}

                        {/* Prinsipp 2: NPC tone dialogue */}
                        {npcTone && (
                            <div className="mb-4 pl-4 border-l-2 border-stone-300">
                                <p className="text-stone-600 italic font-serif text-base sm:text-lg leading-relaxed">{npcTone}</p>
                            </div>
                        )}

                        {/* Main Text */}
                        <h2
                            className="text-lg sm:text-2xl md:text-4xl font-medium text-stone-900 mb-3 sm:mb-6 md:mb-8 lg:mb-10 leading-[1.35] tracking-tight"
                            style={{ fontFamily: config.theme?.font || 'serif' }}
                        >
                            {node.text}
                        </h2>

                        {/* Content: minigame / map / journal / choices */}
                        {node.minigame ? (
                            node.minigame.type === 'dice' ? (
                                <DiceGame
                                    targetScore={node.minigame.config.targetScore}
                                    wager={node.minigame.config.wager}
                                    onComplete={(success: boolean) => {
                                        if (node.minigame?.type === 'dice') {
                                            onChoice({ id: 'minigame_complete', text: 'Dice Game Complete', nextNodeId: success ? node.minigame.config.winNodeId : node.minigame.config.lossNodeId });
                                        }
                                    }}
                                />
                            ) : node.minigame.type === 'battle' ? (
                                <BattleGame
                                    config={node.minigame.config}
                                    stats={stats}
                                    onComplete={(success: boolean) => {
                                        if (node.minigame?.type === 'battle') {
                                            onChoice({ id: 'battle_complete', text: 'Battle Complete', nextNodeId: success ? node.minigame.config.winNodeId : node.minigame.config.lossNodeId });
                                        }
                                    }}
                                />
                            ) : node.minigame.type === 'justice' ? (
                                <JusticeGame
                                    config={node.minigame.config}
                                    onComplete={() => {
                                        if (node.minigame?.type === 'justice') {
                                            onChoice({ id: 'justice_complete', text: 'Court Adjourned', nextNodeId: node.minigame.config.onComplete.nextNodeId });
                                        }
                                    }}
                                />
                            ) : null
                        ) : node.uiType === 'map' && node.mapConfig ? (
                            <ChronosMap config={node.mapConfig} onPointClick={handleMapPointClick} />
                        ) : node.journalPrompt ? (
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-stone-400">{node.journalPrompt}</p>
                                <textarea
                                    value={journalText}
                                    onChange={(e) => setJournalText(e.target.value)}
                                    className="w-full p-2 sm:p-4 rounded-xl border border-stone-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-serif text-base sm:text-lg bg-white/50 backdrop-blur-sm min-h-[80px] sm:min-h-[120px] md:min-h-[150px]"
                                    placeholder="Skriv dine tanker..."
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={handleJournalSubmit} disabled={!journalText.trim()}
                                        className="px-6 sm:px-8 py-2 sm:py-3 bg-indigo-900 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                        Lagre Dagbok & Sov
                                    </button>
                                    {isEnd && onRestart && (
                                        <button onClick={onRestart}
                                            className="px-6 sm:px-8 py-2 sm:py-3 bg-stone-700 text-white font-bold rounded-xl shadow-lg hover:bg-stone-600 transition-all">
                                            Prøv på nytt
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isEnd && node.choices.map(choice => {
                                    const locked = isChoiceLocked(choice);
                                    const lockedReason = locked ? getLockedReason(choice) : null;
                                    const hasEthics = ethicsModeOn && !!choice.ethicsLens;

                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => !locked && handleChoiceClick(choice)}
                                            disabled={locked}
                                            className={`group relative p-3 sm:p-5 md:p-6 text-left rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${locked
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
                                                    {locked && lockedReason && (
                                                        <span className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1">
                                                            <Lock size={10} /> {lockedReason}
                                                        </span>
                                                    )}
                                                    {/* Prinsipp 6: ethics mode indicator */}
                                                    {hasEthics && (
                                                        <span className="text-[10px] font-bold text-violet-500 mt-1 flex items-center gap-1">
                                                            <Brain size={10} /> Etikk-pause aktivert
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${locked
                                                    ? 'bg-stone-200 text-stone-400'
                                                    : hasEthics
                                                        ? 'bg-violet-100 text-violet-600'
                                                        : 'bg-stone-100 group-hover:bg-indigo-100 text-stone-400 group-hover:text-indigo-600'
                                                    }`}>
                                                    {locked ? <Lock size={14} /> : <ArrowRight size={16} />}
                                                </div>
                                            </div>

                                            {/* Effect preview */}
                                            {!locked && choice.effects && (
                                                <div className="relative z-10 flex flex-wrap gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    {Object.entries(choice.effects)
                                                        .filter(([key]) => stats.some(s => s.id === key))
                                                        .map(([key, val]) => (
                                                            <span key={key} className={`text-[10px] font-black uppercase tracking-wider ${val > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {val > 0 ? '+' : ''}{val} {stats.find(s => s.id === key)?.label}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                                {isEnd && (
                                    <div className="md:col-span-2 space-y-5 md:space-y-8">
                                        <div className={`p-6 sm:p-8 md:p-10 rounded-[2rem] border shadow-lg ${node.endType === 'victory'
                                            ? 'bg-emerald-50/50 border-emerald-100'
                                            : node.endType === 'defeat'
                                                ? 'bg-rose-50/50 border-rose-100'
                                                : 'bg-stone-50/50 border-stone-200'
                                            }`}>
                                            {node.endType === 'victory' && <Crown className="mx-auto mb-4 md:mb-6 text-emerald-600" size={32} />}
                                            {node.endType === 'defeat' && <Skull className="mx-auto mb-4 md:mb-6 text-rose-500" size={32} />}

                                            <h3 className="text-2xl md:text-3xl font-black text-stone-900 mb-2 tracking-tight text-center">
                                                {node.endType === 'victory' ? 'Historisk Seier' : node.endType === 'defeat' ? 'Historien endte her...' : 'Reisen er over'}
                                            </h3>

                                            {/* Prinsipp 5: Personalized epilogue or fallback */}
                                            {node.epilogue ? (
                                                <EpilogueCard epilogue={node.epilogue} flags={flags} />
                                            ) : (
                                                <p className="text-base md:text-lg text-stone-600 font-medium leading-relaxed max-w-lg mx-auto text-center mt-4">
                                                    {node.endType === 'victory'
                                                        ? 'Du navigerte fortidens utfordringer med kløkt og visdom.'
                                                        : 'Du lærte en hard lekse om fortidens brutale virkelighet.'}
                                                </p>
                                            )}
                                        </div>

                                        <button onClick={onRestart}
                                            className="w-full py-3 sm:py-4 md:py-6 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl hover:shadow-2xl shadow-stone-400/20">
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
