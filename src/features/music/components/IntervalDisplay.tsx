import React from 'react';
import { CHORD_QUALITIES, getIntervalName } from '../utils/musicTheory';

interface IntervalDisplayProps {
    quality: string;
}

export const IntervalDisplay: React.FC<IntervalDisplayProps> = ({ quality }) => {
    const chordInfo = CHORD_QUALITIES[quality as keyof typeof CHORD_QUALITIES];
    if (!chordInfo) return null;

    return (
        <div className="flex gap-2 justify-center mt-4">
            {chordInfo.intervals.map((interval, i) => {
                const name = getIntervalName(interval);
                return (
                    <div key={i} className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {name}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                            {name === 'R' ? 'Grunntone' :
                                name.includes('3') ? 'Terts' :
                                    name.includes('5') ? 'Kvint' :
                                        name.includes('7') ? 'Septim' : 'Intervall'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
