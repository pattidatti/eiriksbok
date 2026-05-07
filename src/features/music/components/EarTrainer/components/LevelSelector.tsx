import React from 'react';

interface Level {
    id: number;
    name: string;
}

interface LevelSelectorProps {
    levels: Level[];
    current: number;
    onChange: (id: number) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ levels, current, onChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {levels.map((lvl) => {
                const active = lvl.id === current;
                return (
                    <button
                        key={lvl.id}
                        type="button"
                        onClick={() => onChange(lvl.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            active
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                    >
                        <span className="font-semibold">Nivå {lvl.id}</span>
                        <span className="ml-2 opacity-75">{lvl.name}</span>
                    </button>
                );
            })}
        </div>
    );
};
