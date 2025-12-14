import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtualPiano } from './VirtualPiano';
import { FretboardExplorer } from './FretboardExplorer';
import { ChordSelector } from './ChordSelector';
import { ChordCollection } from './ChordCollection';
import { SmartChordInput } from './SmartChordInput';
import {
    CHORD_QUALITIES,
    getChordNotes,
    getGuitarVoicing,
    getDiatonicChords
} from '../utils/musicTheory';
import { Guitar, Piano } from 'lucide-react';

export const ChordLibrary: React.FC = () => {
    const [instrument, setInstrument] = useState<'piano' | 'guitar'>('piano');
    const [root, setRoot] = useState('C');
    const [quality, setQuality] = useState('Major');
    const [variant, setVariant] = useState(0);

    // Derived state
    const notes = useMemo(() => getChordNotes(root, quality as keyof typeof CHORD_QUALITIES), [root, quality]);

    const guitarVoicing = useMemo(() => {
        if (instrument !== 'guitar') return [];
        const raw = getGuitarVoicing(root, quality, variant);
        return raw.map((fret, i) => ({ string: i, fret })).filter(p => p.fret !== -1);
    }, [instrument, root, quality, variant]);

    const handleSmartSearch = (r: string, q: string) => {
        if (root !== r || quality !== q) {
            setRoot(r);
            setQuality(q);
        }
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto space-y-8 py-8 px-6">

            {/* Header Area: Search & Instrument Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-20">
                <div className="w-full md:w-1/3">
                    <SmartChordInput onChordFound={handleSmartSearch} />
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
                    <button
                        onClick={() => setInstrument('piano')}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${instrument === 'piano'
                            ? 'bg-white text-indigo-600 shadow-md scale-100 ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <Piano className="w-5 h-5 mr-2" />
                        Piano
                    </button>
                    <button
                        onClick={() => setInstrument('guitar')}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${instrument === 'guitar'
                            ? 'bg-white text-amber-600 shadow-md scale-100 ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <Guitar className="w-5 h-5 mr-2" />
                        Gitar
                    </button>
                </div>
            </div>

            {/* Main Studio Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

                {/* Left Panel: Controls */}
                <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 shadow-xl shadow-indigo-100/50 flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 space-y-8">
                        <ChordSelector
                            root={root}
                            quality={quality}
                            onRootChange={setRoot}
                            onQualityChange={setQuality}
                        />

                        {/* Scale Context */}
                        <div className="pt-6 border-t border-indigo-100/50">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    I skalaen ({root}-Dur)
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {getDiatonicChords(root, 'Major').map((chord, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSmartSearch(chord.root, chord.quality)}
                                        className={`
                                            p-3 rounded-xl text-sm font-medium transition-all text-left border flex flex-col justify-center
                                            ${root === chord.root && quality === chord.quality
                                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-[1.02]'
                                                : 'bg-indigo-50/50 border-indigo-100/50 text-indigo-900 hover:bg-white hover:border-indigo-200 hover:shadow-sm'}
                                        `}
                                    >
                                        <span className="font-bold text-base leading-none">{chord.root}</span>
                                        <span className="text-[10px] uppercase opacity-60 font-bold tracking-wider">{chord.quality === 'Major' ? 'Maj' : chord.quality}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Visualization Stage */}
                <div className="lg:col-span-9 bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] p-10 border border-white/50 shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Ambient Background Lights */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${root}-${quality}`}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative z-10 w-full text-center"
                        >
                            {/* Chord Title */}
                            <div className="mb-12">
                                <h2 className="text-7xl lg:text-8xl font-display font-black text-slate-800 tracking-tighter flex items-baseline justify-center gap-4 drop-shadow-sm">
                                    {root}
                                    <span className="text-4xl lg:text-5xl font-light text-indigo-500 tracking-widest uppercase opacity-90">
                                        {CHORD_QUALITIES[quality as keyof typeof CHORD_QUALITIES]?.label}
                                    </span>
                                </h2>

                                {/* Note Badge List */}
                                <div className="flex justify-center gap-3 mt-6">
                                    {notes.map((note, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="inline-flex w-12 h-12 items-center justify-center bg-white border border-slate-200 shadow-sm rounded-full text-lg font-mono font-bold text-slate-700 ring-2 ring-transparent hover:ring-indigo-100 transition-all cursor-default"
                                        >
                                            {note}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>

                            {/* The Instrument */}
                            <div className="flex justify-center w-full">
                                {instrument === 'piano' ? (
                                    <div className="transform transition-transform duration-500 hover:scale-[1.02]">
                                        <VirtualPiano highlightKeys={notes} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <div className="w-full max-w-3xl transform transition-transform duration-500 hover:scale-[1.02]">
                                            {guitarVoicing.length > 0 ? (
                                                <FretboardExplorer
                                                    instrument="guitar"
                                                    highlightPositions={guitarVoicing}
                                                />
                                            ) : (
                                                <div className="inline-block px-8 py-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 font-medium">
                                                    Ingen standardgrep funnet
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setVariant(v => v === 0 ? 1 : 0)}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                                        >
                                            <Guitar className="w-4 h-4" />
                                            {variant === 0 ? 'Vis Barregrep / Variant' : 'Vis Standard / Åpne Grep'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Dock: Collections */}
            <div className="relative transform transition-all duration-500">
                <ChordCollection
                    currentRoot={root}
                    currentQuality={quality}
                    onLoadChord={(r, q) => {
                        setRoot(r);
                        setQuality(q);
                    }}
                />
            </div>
        </div>
    );
};
