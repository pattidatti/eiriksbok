import React from 'react';
import type { NoteDuration } from './types';
import { Music, Pause } from 'lucide-react';

interface RhythmPaletteProps {
    selectedDuration: NoteDuration;
    isRestMode: boolean;
    onSelectDuration: (d: NoteDuration) => void;
    onToggleRestMode: () => void;
}

export const RhythmPalette: React.FC<RhythmPaletteProps> = ({
    selectedDuration,
    isRestMode,
    onSelectDuration,
    onToggleRestMode
}) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-900/10 rounded-full p-2 flex items-center gap-2 z-50">

            <div className="flex gap-1 bg-slate-100 rounded-full p-1 mr-2">
                <PaletteButton
                    active={!isRestMode}
                    onClick={() => isRestMode && onToggleRestMode()}
                    icon={<Music size={18} />}
                    label="Note"
                />
                <PaletteButton
                    active={isRestMode}
                    onClick={() => onToggleRestMode()}
                    icon={<Pause size={18} />}
                    label="Rest"
                    color="text-rose-500 bg-rose-50 ring-rose-200"
                />
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1" />

            {/* Durations */}
            <DurationButton value="1n" label="1/1" active={selectedDuration === '1n'} onClick={() => onSelectDuration('1n')} />
            <DurationButton value="2n" label="1/2" active={selectedDuration === '2n'} onClick={() => onSelectDuration('2n')} />
            <DurationButton value="4n" label="1/4" active={selectedDuration === '4n'} onClick={() => onSelectDuration('4n')} />
            <DurationButton value="8n" label="1/8" active={selectedDuration === '8n'} onClick={() => onSelectDuration('8n')} />

            <div className="w-px h-8 bg-slate-200 mx-1" />

            <div className="px-3 text-xs text-slate-400 font-serif italic">
                {isRestMode ? 'Sett inn pause' : 'Sett inn note'}
            </div>
        </div>
    );
};

const PaletteButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color?: string }> = ({ active, onClick, icon, label, color }) => (
    <button
        onClick={onClick}
        className={`
            p-3 rounded-full transition-all duration-200 flex items-center justify-center
            ${active
                ? (color ? color : 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100 scale-105')
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}
        `}
        title={label}
    >
        {icon}
    </button>
);

const DurationButton: React.FC<{ value: string, label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-12 h-12 rounded-full font-serif font-bold text-lg transition-all duration-200
            flex items-center justify-center
            ${active
                ? 'bg-slate-900 text-white shadow-lg scale-110 -translate-y-1'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
        `}
    >
        {label}
    </button>
);
