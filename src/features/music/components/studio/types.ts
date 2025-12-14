import React from 'react';

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

export const SECTIONS_CONFIG: Record<SectionType, { label: string, color: string, defaultBars: number }> = {
    intro: { label: 'Intro', color: 'bg-emerald-500', defaultBars: 4 },
    verse: { label: 'Vers', color: 'bg-blue-500', defaultBars: 8 },
    chorus: { label: 'Refreng', color: 'bg-rose-500', defaultBars: 8 },
    bridge: { label: 'Bro', color: 'bg-amber-500', defaultBars: 8 },
    outro: { label: 'Outro', color: 'bg-purple-500', defaultBars: 4 },
};
