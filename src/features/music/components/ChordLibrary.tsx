import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtualPiano } from './VirtualPiano';
import { FretboardExplorer } from './FretboardExplorer';
import { ChordSelector } from './ChordSelector';
import { ChordCollection } from './ChordCollection';
import { SmartChordInput } from './SmartChordInput';
import { IntervalDisplay } from './IntervalDisplay';
import {
    CHORD_QUALITIES,
    getChordNotes,
    getGuitarVoicing,
    getRelatedChords
} from '../utils/musicTheory';
import { Guitar, Piano, ArrowRight, Menu } from 'lucide-react';

export const ChordLibrary: React.FC = () => {
    const [instrument, setInstrument] = useState<'piano' | 'guitar'>('piano');
    const [root, setRoot] = useState('C');
    const [quality, setQuality] = useState('Major');
    const [variant, setVariant] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);

    // Derived state
    const notes = useMemo(() => getChordNotes(root, quality as keyof typeof CHORD_QUALITIES), [root, quality]);

    const guitarVoicing = useMemo(() => {
        if (instrument !== 'guitar') return [];
        const raw = getGuitarVoicing(root, quality, variant);
        return raw.map((fret, i) => ({ string: i, fret })).filter(p => p.fret !== -1);
    }, [instrument, root, quality, variant]);

    const relatedChords = useMemo(() => getRelatedChords(root, quality), [root, quality]);

    const handleSmartSearch = (r: string, q: string) => {
        if (root !== r || quality !== q) {
            setRoot(r);
            setQuality(q);
        }
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto min-h-[800px] flex flex-col md:flex-row gap-6 p-4 md:p-6">

            {/* Sidebar Toggle (Mobile) */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden flex items-center gap-2 p-2 text-slate-600 font-bold mb-4"
            >
                <Menu className="w-5 h-5" />
                {showSidebar ? 'Skjul Samling' : 'Vis Samling'}
            </button>

            {/* Sidebar Collection */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: -20, width: 0 }}
                        className="w-full md:w-80 flex-shrink-0 h-full"
                    >
                        <ChordCollection
                            currentRoot={root}
                            currentQuality={quality}
                            onLoadChord={(r, q) => {
                                setRoot(r);
                                setQuality(q);
                            }}
                            variant="sidebar"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Top Controls: Search & Instrument */}
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-full max-w-xl">
                        <SmartChordInput onChordFound={handleSmartSearch} />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setInstrument('piano')}
                            className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'piano'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Piano className="w-4 h-4 mr-2" />
                            Piano
                        </button>
                        <button
                            onClick={() => setInstrument('guitar')}
                            className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'guitar'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Guitar className="w-4 h-4 mr-2" />
                            Gitar
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col xl:flex-row">

                    {/* Left Panel: Selector & Info */}
                    <div className="w-full xl:w-1/3 bg-slate-50/50 p-8 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col gap-8">
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-baseline gap-3">
                                {root}
                                <span className="text-2xl font-light text-indigo-500 uppercase tracking-widest opacity-80">
                                    {CHORD_QUALITIES[quality as keyof typeof CHORD_QUALITIES]?.label}
                                </span>
                            </h2>
                            <div className="mt-4">
                                <IntervalDisplay quality={quality} />
                            </div>
                        </div>

                        <ChordSelector
                            root={root}
                            quality={quality}
                            onRootChange={setRoot}
                            onQualityChange={setQuality}
                        />

                        {/* Related Chords Navigation */}
                        <div className="mt-auto pt-8 border-t border-slate-200 border-dashed">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Relaterte Akkorder</h4>
                            <div className="space-y-2">
                                {relatedChords.map((rc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSmartSearch(rc.root, rc.quality)}
                                        className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group text-left"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400">{rc.label}</span>
                                            <div className="font-bold text-slate-700">
                                                {rc.root} <span className="font-normal text-slate-500">{rc.quality === 'Major' ? '' : rc.quality}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Visualization */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-50/30 relative overflow-hidden">
                        {/* Background blobs */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-200 rounded-full blur-3xl mix-blend-multiply filter" />
                            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-200 rounded-full blur-3xl mix-blend-multiply filter" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center gap-12">
                            {/* Note Badges */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {notes.map((note, i) => (
                                    <motion.div
                                        key={`${note}-${i}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col items-center justify-center"
                                    >
                                        <span className="text-lg font-bold text-slate-800">{note}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Instrument */}
                            <div className="w-full max-w-4xl">
                                {instrument === 'piano' ? (
                                    <div className="transform hover:scale-[1.01] transition-transform duration-500">
                                        <VirtualPiano highlightKeys={notes} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-full">
                                            {guitarVoicing.length > 0 ? (
                                                <FretboardExplorer
                                                    instrument="guitar"
                                                    highlightPositions={guitarVoicing}
                                                />
                                            ) : (
                                                <div className="text-center p-8 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
                                                    Ingen standardgrep funnet for denne varianten
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setVariant(v => v === 0 ? 1 : 0)}
                                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-3"
                                        >
                                            <Guitar className="w-5 h-5" />
                                            {variant === 0 ? 'Bytt til Barregrep' : 'Bytt til Åpne Grep'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
