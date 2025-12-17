import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { VirtualPiano } from './VirtualPiano';
import { FretboardExplorer } from './FretboardExplorer';
import { ChordSelector } from './ChordSelector';
import { SmartChordInput } from './SmartChordInput';
import { IntervalDisplay } from './IntervalDisplay';
import {
    CHORD_QUALITIES,
    getChordNotes,
    getGuitarVoicing,
    getRelatedChords,
    getPianoVoicing
} from '../utils/musicTheory';
import { Guitar, Piano, ArrowRight, Menu } from 'lucide-react';

export const ChordLibrary: React.FC = () => {
    const [instrument, setInstrument] = useState<'piano' | 'guitar'>('piano');
    const [root, setRoot] = useState('C');
    const [quality, setQuality] = useState('Major');
    const [variant, setVariant] = useState(0);

    // Derived state
    const notes = useMemo(() => getChordNotes(root, quality as keyof typeof CHORD_QUALITIES), [root, quality]);

    const pianoNotes = useMemo(() => {
        const voicing = getPianoVoicing(root, quality as keyof typeof CHORD_QUALITIES);
        console.log('[ChordLibrary] pianoNotes:', voicing);
        return voicing;
    }, [root, quality]);

    const guitarVoicing = useMemo(() => {
        if (instrument !== 'guitar') return [];
        const raw = getGuitarVoicing(root, quality, variant);
        // raw is [LowE, A, D, G, B, HighE] (0..5)
        // Fretboard expects [HighE, B, G, D, A, LowE] (0..5)
        // So LowE (logic 0) should be rendered at index 5.
        // HighE (logic 5) should be rendered at index 0.
        // Mapping: visualString = 5 - logicIndex
        return raw.map((fret, i) => ({ string: 5 - i, fret })).filter(p => p.fret !== -1);
    }, [instrument, root, quality, variant]);

    const relatedChords = useMemo(() => getRelatedChords(root, quality), [root, quality]);

    const handleSmartSearch = (r: string, q: string) => {
        if (root !== r || quality !== q) {
            setRoot(r);
            setQuality(q);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50">
            {/* Main Application Container - Constrained Width */}
            <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 h-full">

                {/* Header: Search & Settings */}
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="w-full max-w-2xl relative z-20">
                        {/* Search Bar - Floating & Glassy */}
                        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-slate-200/60 ring-1 ring-slate-100">
                            <SmartChordInput onChordFound={handleSmartSearch} />
                        </div>
                    </div>

                    {/* Instrument Toggles */}
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => setInstrument('piano')}
                            className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${instrument === 'piano'
                                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Piano className="w-5 h-5 mr-3" />
                            Piano
                        </button>
                        <button
                            onClick={() => setInstrument('guitar')}
                            className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${instrument === 'guitar'
                                ? 'bg-amber-600 text-white shadow-md transform scale-105'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Guitar className="w-5 h-5 mr-3" />
                            Gitar
                        </button>
                    </div>
                </div>

                {/* Main Studio Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

                    {/* Left Panel: Control Center */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
                        {/* Chord Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[80px] -mr-6 -mt-6 transition-colors group-hover:bg-indigo-100" />

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valgt Akkord</span>
                                </div>
                                <h2 className="text-5xl font-black text-slate-800 tracking-tighter flex items-baseline flex-wrap gap-x-3">
                                    {root}
                                    <span className="text-3xl font-light text-indigo-500">
                                        {CHORD_QUALITIES[quality as keyof typeof CHORD_QUALITIES]?.label}
                                    </span>
                                </h2>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <IntervalDisplay quality={quality} />
                            </div>
                        </div>

                        {/* Chord Selector Panel */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex-1 flex flex-col gap-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Menu className="w-5 h-5 text-indigo-500" />
                                Utforsk Varianter
                            </h3>
                            <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                <ChordSelector
                                    root={root}
                                    quality={quality}
                                    onRootChange={setRoot}
                                    onQualityChange={setQuality}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Center/Right Stage: Visualization */}
                    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

                        {/* Visualization Card */}
                        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative min-h-[500px] flex flex-col">
                            {/* Ambient Background */}
                            <div className="absolute inset-0 opacity-40 pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-3xl" />
                                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-t from-amber-50 to-transparent rounded-full blur-3xl" />
                            </div>

                            {/* Content Stage */}
                            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 md:p-16 gap-16">

                                {/* Note Badges - Floating */}
                                <div className="flex flex-wrap justify-center gap-4">
                                    {notes.map((note, i) => (
                                        <motion.div
                                            key={`${note}-${i}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                                            className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-indigo-100/50 border border-slate-100 flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-300"
                                        >
                                            <span className="text-xl font-black text-slate-800">{note}</span>
                                            <div className="h-1 w-6 bg-indigo-500 rounded-full mt-1 opacity-20" />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Main Instrument Visualization */}
                                <div className="w-full max-w-5xl transform hover:scale-[1.02] transition-all duration-500">
                                    {instrument === 'piano' ? (
                                        <div className="bg-slate-900/5 p-4 rounded-[2rem] backdrop-blur-sm">
                                            <VirtualPiano highlightKeys={pianoNotes} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-8 w-full">
                                            <div className="w-full bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                                                {guitarVoicing.length > 0 ? (
                                                    <FretboardExplorer
                                                        instrument="guitar"
                                                        highlightPositions={guitarVoicing}
                                                    />
                                                ) : (
                                                    <div className="text-center p-12 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
                                                        <Guitar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                        <p className="font-bold">Ingen standardgrep funnet</p>
                                                        <p className="text-sm opacity-70">Prøv en annen variant eller akkord</p>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setVariant(v => v === 0 ? 1 : 0)}
                                                className="group px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all flex items-center gap-4"
                                            >
                                                <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                    <Guitar className="w-5 h-5" />
                                                </div>
                                                {variant === 0 ? 'Bytt til Barregrep' : 'Bytt til Åpne Grep'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Related Chords Strip */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Relaterte Akkorder (Utforsk videre)</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar mask-gradient-right">
                                {relatedChords.map((rc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSmartSearch(rc.root, rc.quality)}
                                        className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 transition-all group min-w-[160px]"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{rc.label}</span>
                                            <div className="font-bold text-slate-700 text-lg">
                                                {rc.root}
                                                <span className="text-sm font-normal text-slate-500 ml-1">
                                                    {rc.quality === 'Major' ? '' : (rc.quality === 'Minor' ? 'm' : rc.quality)}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
