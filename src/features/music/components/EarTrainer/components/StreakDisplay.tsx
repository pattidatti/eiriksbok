import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
    streak: number;
    best: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, best }) => {
    return (
        <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
                <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
                <span className={`font-semibold ${streak > 0 ? 'text-slate-800' : 'text-slate-500'}`}>
                    {streak} på rad
                </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Beste: {best}</span>
            </div>
        </div>
    );
};
