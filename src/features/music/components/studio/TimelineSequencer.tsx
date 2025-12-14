import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { type Section, type InstrumentTrack, type TrackBlock, SECTIONS_CONFIG, type NoteLength } from './types';

// Helper component for pattern visualization
const PatternVisualizer: React.FC<{ pattern: NoteLength, color: string }> = ({ pattern, color }) => {
    const getBlocks = () => {
        switch (pattern) {
            case 'whole': return [1];
            case 'half': return [1, 1];
            case 'quarter': return [1, 1, 1, 1];
            case 'eighth': return Array(8).fill(1);
            case 'sixteenth': return Array(16).fill(1);
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

interface TimelineSequencerProps {
    sections: Section[];
    tracks: InstrumentTrack[];
    blocks: Record<string, TrackBlock>;
    onToggleBlock: (sectionId: string, instrumentId: string) => void;
    onChordClick: (sectionId: string, chordIndex: number) => void;
}

export const TimelineSequencer: React.FC<TimelineSequencerProps> = ({
    sections,
    tracks,
    blocks,
    onToggleBlock,
    onChordClick
}) => {
    return (
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
                                        onClick={() => onChordClick(section.id, i)}
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
                                        onClick={() => onToggleBlock(section.id, track.id)}
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

            {/* Playhead (Visual Only) */}
            <div className="absolute top-0 bottom-0 left-[192px] w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.5)] hidden md:block">
                <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 transform rotate-45" />
            </div>
        </div>
    );
};
