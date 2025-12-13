import React, { useState, useMemo } from 'react';
import { Play, Pause, FastForward, Rewind, Save, Settings, Plus, Music, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
export type InstrumentType = 'drums' | 'bass' | 'piano' | 'guitar' | 'synth' | 'strings' | 'vocals';
export type NoteLength = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'custom';

export interface Section {
    id: string;
    type: SectionType;
    name: string;
    bars: number;
    chords: string[]; // One chord per bar for simplicity initially
}

export interface TrackBlock {
    id: string;
    sectionId: string;
    instrumentId: string;
    isActive: boolean;
    pattern: NoteLength; // Simplified rhythm pattern
    intensity: number; // 0-1
}

export interface InstrumentTrack {
    id: string;
    type: InstrumentType;
    name: string;
    color: string;
    icon: React.ReactNode;
}

// --- Constants ---
const SECTIONS_CONFIG: Record<SectionType, { label: string, color: string, defaultBars: number }> = {
    intro: { label: 'Intro', color: 'bg-emerald-500', defaultBars: 4 },
    verse: { label: 'Vers', color: 'bg-blue-500', defaultBars: 8 },
    chorus: { label: 'Refreng', color: 'bg-rose-500', defaultBars: 8 },
    bridge: { label: 'Bro', color: 'bg-amber-500', defaultBars: 8 },
    outro: { label: 'Outro', color: 'bg-purple-500', defaultBars: 4 },
};

const INSTRUMENTS_CONFIG: InstrumentTrack[] = [
    { id: 'vocals', type: 'vocals', name: 'Vokal', color: 'text-pink-400', icon: <Music size={16} /> },
    { id: 'piano', type: 'piano', name: 'Piano', color: 'text-indigo-400', icon: <Layers size={16} /> },
    { id: 'guitar', type: 'guitar', name: 'Gitar', color: 'text-orange-400', icon: <Zap size={16} /> },
    { id: 'synth', type: 'synth', name: 'Synth', color: 'text-cyan-400', icon: <Activity size={16} /> },
    { id: 'bass', type: 'bass', name: 'Bass', color: 'text-yellow-400', icon: <Activity size={16} /> },
    { id: 'drums', type: 'drums', name: 'Trommer', color: 'text-emerald-400', icon: <Activity size={16} /> },
];

import { Activity } from 'lucide-react';

// --- Sub-components (will be extracted later if needed) ---
const PatternVisualizer: React.FC<{ pattern: NoteLength, color: string }> = ({ pattern, color }) => {
    // Visual representation of the rhythm
    const getBlocks = () => {
        switch (pattern) {
            case 'whole': return [1];
            case 'half': return [1, 1];
            case 'quarter': return [1, 1, 1, 1];
            case 'eighth': return Array(8).fill(1);
            default: return [1, 1, 1, 1];
        }
    };

    return (
        <div className="flex gap-0.5 h-full w-full items-center px-1">
            {getBlocks().map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full opacity-60 ${color.replace('text-', 'bg-')}`} />
            ))}
        </div>
    );
};

// --- Orchestra Visualizer ---
const OrchestraVisualizer: React.FC<{ tracks: InstrumentTrack[], activeTracks: string[], intensity: number }> = ({ tracks, activeTracks, intensity }) => {
    return (
        <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 border-b border-slate-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">

            {/* Stage Floor */}
            <div className="absolute bottom-0 w-full h-full bg-[linear-gradient(to_top,rgba(0,0,0,0.5),transparent)] pointer-events-none" />

            {/* Instruments Layout */}
            <div className="relative grid grid-cols-3 gap-12 w-full max-w-2xl px-12 perspective-1000">
                {tracks.map((track, i) => {
                    const isActive = activeTracks.includes(track.id);
                    const isBackRow = i < 3;

                    return (
                        <div key={track.id} className={`flex flex-col items-center justify-center transition-all duration-300 ${isBackRow ? 'scale-75 opacity-80' : 'scale-100'}`}>
                            <motion.div
                                animate={isActive ? {
                                    scale: [1, 1.1 + (intensity * 0.1), 1],
                                    boxShadow: `0 0 ${20 + (intensity * 30)}px ${track.color.replace('text-', '')}`
                                } : { scale: 1, boxShadow: '0 0 0px transparent' }}
                                transition={{ duration: 0.2 }}
                                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 
                                    ${isActive
                                        ? `${track.color.replace('text-', 'bg-')} border-white text-white z-10`
                                        : 'bg-slate-800/50 border-slate-700 text-slate-500 blur-[1px]'
                                    }
                                    transition-colors duration-200
                                `}
                            >
                                {React.cloneElement(track.icon as React.ReactElement, { size: 32 })}
                            </motion.div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white text-shadow-lg' : 'text-slate-600'}`}>
                                {track.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Ambient Particles */}
            {activeTracks.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-3xl animate-pulse" />
                </div>
            )}
        </div>
    );
};

export const SongwriterStudio: React.FC = () => {
    // --- State ---
    const [sections, setSections] = useState<Section[]>([
        { id: '1', type: 'intro', name: 'Intro', bars: 4, chords: ['C', 'G', 'Am', 'F'] },
        { id: '2', type: 'verse', name: 'Vers A', bars: 8, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'] },
        { id: '3', type: 'chorus', name: 'Refreng', bars: 8, chords: ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'] },
    ]);

    const [tracks] = useState<InstrumentTrack[]>(INSTRUMENTS_CONFIG);

    // Store blocks in a flat list or map. map key: `${sectionId}-${instrumentId}`
    const [blocks, setBlocks] = useState<Record<string, TrackBlock>>({
        '1-piano': { id: 'b1', sectionId: '1', instrumentId: 'piano', isActive: true, pattern: 'whole', intensity: 0.5 },
        '2-drums': { id: 'b2', sectionId: '2', instrumentId: 'drums', isActive: true, pattern: 'quarter', intensity: 0.8 },
        '2-bass': { id: 'b3', sectionId: '2', instrumentId: 'bass', isActive: true, pattern: 'eighth', intensity: 0.7 },
        '3-vocals': { id: 'b4', sectionId: '3', instrumentId: 'vocals', isActive: true, pattern: 'quarter', intensity: 1.0 },
        '3-drums': { id: 'b5', sectionId: '3', instrumentId: 'drums', isActive: true, pattern: 'eighth', intensity: 0.9 },
        '3-guitar': { id: 'b6', sectionId: '3', instrumentId: 'guitar', isActive: true, pattern: 'sixteenth', intensity: 0.8 },
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBars, setCurrentBars] = useState(0); // Total bars elapsed
    const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per bar (fast for visualization)

    // Chord Editor State
    const [editingChord, setEditingChord] = useState<{ sectionId: string, chordIndex: number } | null>(null);

    // Derived State for Visualizer
    const currentSectionIndex = sections.findIndex((s, i) => {
        const barsBefore = sections.slice(0, i).reduce((acc, sec) => acc + sec.bars, 0);
        return currentBars >= barsBefore && currentBars < barsBefore + s.bars;
    });

    const currentSection = sections[currentSectionIndex];

    const activeInstruments = useMemo(() => {
        if (!currentSection) return [];
        return tracks.filter(t => {
            const block = blocks[`${currentSection.id}-${t.id}`];
            return block && block.isActive;
        }).map(t => t.id);
    }, [currentSection, blocks, tracks]);

    // Playback Logic
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentBars(prev => {
                    const totalBars = sections.reduce((acc, s) => acc + s.bars, 0);
                    if (prev >= totalBars - 1) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 1;
                });
            }, playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, sections, playbackSpeed]);


    // --- Actions ---
    const updateChord = (sectionId: string, chordIndex: number, newChord: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                const newChords = [...s.chords];
                newChords[chordIndex] = newChord;
                return { ...s, chords: newChords };
            }
            return s;
        }));
        setEditingChord(null);
    };

    const toggleBlock = (sectionId: string, instrumentId: string) => {
        const key = `${sectionId}-${instrumentId}`;
        setBlocks(prev => {
            const exists = prev[key];
            if (exists) {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            } else {
                return {
                    ...prev,
                    [key]: {
                        id: Math.random().toString(),
                        sectionId,
                        instrumentId,
                        isActive: true,
                        pattern: 'quarter',
                        intensity: 0.5
                    }
                };
            }
        });
    };

    const addSection = (type: SectionType) => {
        const newSection: Section = {
            id: Math.random().toString(),
            type,
            name: SECTIONS_CONFIG[type].label,
            bars: SECTIONS_CONFIG[type].defaultBars,
            chords: Array(SECTIONS_CONFIG[type].defaultBars).fill('C'),
        };
        setSections([...sections, newSection]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-900 rounded-3xl overflow-hidden text-slate-100 shadow-2xl border border-slate-700 relative">
            {/* Chord Picker Overlay */}
            <AnimatePresence>
                {editingChord && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setEditingChord(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 text-white">Velg Akkord</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(root => (
                                    <React.Fragment key={root}>
                                        <button onClick={() => updateChord(editingChord.sectionId, editingChord.chordIndex, root)} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors">{root}</button>
                                        <button onClick={() => updateChord(editingChord.sectionId, editingChord.chordIndex, root + 'm')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors">{root}m</button>
                                        <button onClick={() => updateChord(editingChord.sectionId, editingChord.chordIndex, root + '7')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors">{root}7</button>
                                        <button onClick={() => updateChord(editingChord.sectionId, editingChord.chordIndex, root + 'maj7')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors text-xs">{root}maj7</button>
                                    </React.Fragment>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visualizer Stage */}
            <OrchestraVisualizer tracks={tracks} activeTracks={activeInstruments} intensity={0.8} />

            {/* Toolbar */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors" onClick={() => setCurrentBars(0)}><Rewind size={20} /></button>
                        <button
                            className={`p-3 rounded-md transition-all mx-1 ${isPlaying ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>
                        <button className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"><FastForward size={20} /></button>
                    </div>
                    <div className="h-8 w-px bg-slate-700 mx-2" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posisjon</span>
                        <span className="text-sm font-bold text-white font-mono">{currentBars + 1} / {sections.reduce((acc, s) => acc + s.bars, 0)}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Section Add Buttons */}
                    {(Object.keys(SECTIONS_CONFIG) as SectionType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => addSection(type)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-transform active:scale-95 border border-transparent hover:border-white/10 ${SECTIONS_CONFIG[type].color.replace('bg-', 'bg-opacity-20 text-')}`}
                        >
                            + {SECTIONS_CONFIG[type].label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"><Settings size={20} /></button>
                    <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-blue-400"><Save size={20} /></button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden flex flex-col relative">

                {/* Timeline Header (Chords & Rulers) */}
                <div className="flex bg-slate-800/50 border-b border-slate-700 h-16 shrink-0 relative">
                    <div className="w-48 shrink-0 bg-slate-800 border-r border-slate-700 flex items-center px-4 font-bold text-slate-400 text-xs uppercase tracking-widest z-10 shadow-lg">
                        Spor
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden flex scrollbar-hide">
                        {sections.map(section => (
                            <div
                                key={section.id}
                                className="shrink-0 flex flex-col border-r border-slate-700/50 relative group"
                                style={{ width: `${section.bars * 40}px` }}
                            >
                                {/* Section Label */}
                                <div className={`h-6 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white ${SECTIONS_CONFIG[section.type].color}`}>
                                    {section.name}
                                </div>
                                {/* Chords Strip */}
                                <div className="flex-1 flex items-center bg-slate-800/30">
                                    {section.chords.map((chord, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setEditingChord({ sectionId: section.id, chordIndex: i })}
                                            className="flex-1 h-full border-r border-slate-700/30 flex items-center justify-center text-xs font-mono text-indigo-300 hover:bg-indigo-500/20 hover:text-white cursor-pointer transition-colors"
                                        >
                                            {chord}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tracks Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-slate-900 relative">
                    {tracks.map(track => (
                        <div key={track.id} className="flex h-16 border-b border-slate-800 hover:bg-slate-800/30 transition-colors group">
                            {/* Track Header */}
                            <div className="w-48 shrink-0 bg-slate-800/80 border-r border-slate-700 flex items-center px-4 gap-3 z-10">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 ${track.color}`}>
                                    {track.icon}
                                </div>
                                <span className="font-bold text-sm text-slate-200">{track.name}</span>
                            </div>

                            {/* Track Timeline */}
                            <div className="flex-1 overflow-x-auto flex scrollbar-hide">
                                {sections.map(section => {
                                    const blockKey = `${section.id}-${track.id}`;
                                    const block = blocks[blockKey];

                                    return (
                                        <div
                                            key={section.id}
                                            className={`shrink-0 border-r border-slate-800/50 p-1 relative transition-colors ${block ? 'bg-slate-800/20' : ''}`}
                                            style={{ width: `${section.bars * 40}px` }}
                                            onClick={() => toggleBlock(section.id, track.id)}
                                        >
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 flex pointer-events-none opacity-10">
                                                {Array.from({ length: section.bars }).map((_, i) => (
                                                    <div key={i} className="flex-1 border-r border-slate-500" />
                                                ))}
                                            </div>

                                            {/* Interaction Area / Block */}
                                            {block && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={`h-full rounded-md relative group/block cursor-pointer overflow-hidden
                                                        bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500/30
                                                        hover:border-${track.color.split('-')[1]}-400 hover:shadow-lg
                                                    `}
                                                >
                                                    {/* Pattern Visual */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                                        <PatternVisualizer pattern={block.pattern} color={track.color} />
                                                    </div>

                                                    {/* Hover Controls */}
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                                                        <Settings size={12} className="text-white" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Playhead (Visual Only for now) */}
                <div className="absolute top-0 bottom-0 left-[192px] w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.5)] hidden md:block">
                    <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 transform rotate-45" />
                </div>
            </div>
        </div>
    );
};
