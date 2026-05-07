import React from 'react';

interface PianoDisplayProps {
    highlightMidi: number[];
    rootMidi?: number;
    startOctave?: number;
    octaves?: number;
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const HAS_BLACK_AFTER = [true, true, false, true, true, true, false];

export const PianoDisplay: React.FC<PianoDisplayProps> = ({
    highlightMidi,
    rootMidi,
    startOctave = 3,
    octaves = 2,
}) => {
    const highlightSet = new Set(highlightMidi);
    const whiteKeys: { midi: number; label: string }[] = [];
    const blackKeys: { midi: number; whiteIndex: number }[] = [];

    for (let oct = 0; oct < octaves; oct++) {
        const octaveBase = (startOctave + oct + 1) * 12;
        WHITE_NOTES.forEach((noteName, idx) => {
            const semis = idx === 0 ? 0 : idx === 1 ? 2 : idx === 2 ? 4 : idx === 3 ? 5 : idx === 4 ? 7 : idx === 5 ? 9 : 11;
            const midi = octaveBase + semis;
            const whiteIndex = oct * 7 + idx;
            whiteKeys.push({
                midi,
                label: idx === 0 ? `${noteName}${startOctave + oct}` : noteName,
            });
            if (HAS_BLACK_AFTER[idx]) {
                blackKeys.push({ midi: midi + 1, whiteIndex });
            }
        });
    }
    whiteKeys.push({
        midi: (startOctave + octaves + 1) * 12,
        label: `C${startOctave + octaves}`,
    });

    const totalWhite = whiteKeys.length;
    const whiteWidth = 100 / totalWhite;

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="relative mx-auto w-full max-w-3xl" style={{ aspectRatio: `${totalWhite} / 4` }}>
                <div className="absolute inset-0 flex">
                    {whiteKeys.map((k) => {
                        const isHighlighted = highlightSet.has(k.midi);
                        const isRoot = rootMidi === k.midi;
                        const bg = isRoot
                            ? 'bg-indigo-300'
                            : isHighlighted
                                ? 'bg-emerald-300'
                                : 'bg-white';
                        const text = isRoot ? 'text-indigo-900' : isHighlighted ? 'text-emerald-900' : 'text-slate-400';
                        return (
                            <div
                                key={k.midi}
                                className={`flex flex-col justify-end items-center pb-1 border border-slate-300 rounded-b-md ${bg} transition-colors`}
                                style={{ width: `${whiteWidth}%`, height: '100%' }}
                            >
                                {(isHighlighted || isRoot || k.label.length > 1) && (
                                    <span className={`text-[10px] sm:text-xs font-bold ${text}`}>{k.label}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="pointer-events-none absolute inset-0">
                    {blackKeys.map((b) => {
                        const isHighlighted = highlightSet.has(b.midi);
                        const isRoot = rootMidi === b.midi;
                        const left = (b.whiteIndex + 1) * whiteWidth;
                        const bg = isRoot ? 'bg-indigo-600' : isHighlighted ? 'bg-emerald-500' : 'bg-slate-800';
                        return (
                            <div
                                key={b.midi}
                                className={`absolute top-0 ${bg} rounded-b-md border border-slate-900 transition-colors`}
                                style={{
                                    left: `${left}%`,
                                    width: `${whiteWidth * 0.6}%`,
                                    height: '60%',
                                    transform: 'translateX(-50%)',
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
