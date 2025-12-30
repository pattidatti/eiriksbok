import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';

interface RecipeCardProps {
    id: string;
    isSelected: boolean;
    isLocked: boolean;
    canAfford: boolean;
    info: {
        name: string;
        icon: string;
    };
    onSelect: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    id,
    isSelected,
    isLocked,
    canAfford,
    info,
    onSelect
}) => {
    return (
        <button
            onClick={() => !isLocked && onSelect(id)}
            className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${isLocked
                ? 'grayscale opacity-60 cursor-not-allowed bg-black/20 border-white/5'
                : isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.2)]'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-800/80 shadow-xl'
                }`}
        >
            {isLocked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                    <Settings className="w-6 h-6 text-slate-600 animate-spin-slow" />
                </div>
            )}
            <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                {info.icon}
            </div>
            <div className="flex-1 text-left">
                <div className="text-lg font-black text-white leading-tight">{info.name}</div>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-slate-700' : canAfford ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isLocked ? 'text-slate-600' : canAfford ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                        {isLocked ? 'Låst' : canAfford ? 'Klar til produksjon' : 'Mangler ressurser'}
                    </span>
                </div>
            </div>
            {!isLocked && (
                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
            )}
        </button>
    );
};
