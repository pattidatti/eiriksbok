import React from 'react';
import type { RhythmPattern } from '../logic/rhythmPatterns';

interface RhythmNotationProps {
    pattern: RhythmPattern;
}

interface NoteToken {
    type: 'quarter' | 'half' | 'whole' | 'eighth-pair' | 'eighth' | 'dotted-quarter';
    beat: number;
}

function tokenize(pattern: RhythmPattern): NoteToken[] {
    const tokens: NoteToken[] = [];
    const hits = [...pattern.hits];
    let i = 0;
    while (i < hits.length) {
        const h = hits[i];
        const next = hits[i + 1];
        if (h.duration === 0.5 && next && next.duration === 0.5 && Math.abs(next.beat - (h.beat + 0.5)) < 0.01) {
            tokens.push({ type: 'eighth-pair', beat: h.beat });
            i += 2;
        } else if (h.duration === 0.5) {
            tokens.push({ type: 'eighth', beat: h.beat });
            i += 1;
        } else if (h.duration === 0.75) {
            tokens.push({ type: 'dotted-quarter', beat: h.beat });
            i += 1;
        } else if (h.duration === 1) {
            tokens.push({ type: 'quarter', beat: h.beat });
            i += 1;
        } else if (h.duration === 2) {
            tokens.push({ type: 'half', beat: h.beat });
            i += 1;
        } else {
            tokens.push({ type: 'quarter', beat: h.beat });
            i += 1;
        }
    }
    return tokens;
}

export const RhythmNotation: React.FC<RhythmNotationProps> = ({ pattern }) => {
    const [num, den] = pattern.timeSig.split('/').map(Number);
    const beatsPerBar = num;
    const totalBeats = beatsPerBar * pattern.bars;

    const width = 640;
    const height = 120;
    const padding = 30;
    const usableWidth = width - padding * 2;
    const beatX = (beat: number) => padding + (beat / totalBeats) * usableWidth;

    const staffY = 60;
    const lineSpacing = 8;
    const lines = [0, 1, 2, 3, 4].map((i) => staffY - 16 + i * lineSpacing);

    const tokens = tokenize(pattern);

    const barlineBeats: number[] = [];
    for (let b = beatsPerBar; b < totalBeats; b += beatsPerBar) {
        barlineBeats.push(b);
    }

    const noteHeadY = staffY + 4;
    const stemTop = noteHeadY - 28;

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                Rytmen som ble spilt
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-2xl" role="img" aria-label={`Rytme i ${pattern.timeSig}`}>
                {lines.map((y) => (
                    <line key={y} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#475569" strokeWidth="1" />
                ))}
                <line x1={padding} y1={lines[0]} x2={padding} y2={lines[4]} stroke="#475569" strokeWidth="2" />
                <line x1={width - padding} y1={lines[0]} x2={width - padding} y2={lines[4]} stroke="#475569" strokeWidth="2" />
                <text x={padding + 8} y={staffY - 2} fontSize="20" fontWeight="bold" fill="#1e293b">{num}</text>
                <text x={padding + 8} y={staffY + 18} fontSize="20" fontWeight="bold" fill="#1e293b">{den}</text>

                {barlineBeats.map((b) => (
                    <line
                        key={`bar-${b}`}
                        x1={beatX(b)}
                        y1={lines[0]}
                        x2={beatX(b)}
                        y2={lines[4]}
                        stroke="#475569"
                        strokeWidth="1.5"
                    />
                ))}

                {tokens.map((tok, idx) => {
                    const x = beatX(tok.beat);
                    if (tok.type === 'whole') {
                        return (
                            <ellipse key={idx} cx={x} cy={noteHeadY} rx="7" ry="5" fill="white" stroke="#0f172a" strokeWidth="1.5" />
                        );
                    }
                    if (tok.type === 'half') {
                        return (
                            <g key={idx}>
                                <ellipse cx={x} cy={noteHeadY} rx="6" ry="4.5" fill="white" stroke="#0f172a" strokeWidth="1.5" />
                                <line x1={x + 6} y1={noteHeadY} x2={x + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                            </g>
                        );
                    }
                    if (tok.type === 'quarter') {
                        return (
                            <g key={idx}>
                                <ellipse cx={x} cy={noteHeadY} rx="6" ry="4.5" fill="#0f172a" />
                                <line x1={x + 6} y1={noteHeadY} x2={x + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                            </g>
                        );
                    }
                    if (tok.type === 'dotted-quarter') {
                        return (
                            <g key={idx}>
                                <ellipse cx={x} cy={noteHeadY} rx="6" ry="4.5" fill="#0f172a" />
                                <circle cx={x + 12} cy={noteHeadY} r="1.5" fill="#0f172a" />
                                <line x1={x + 6} y1={noteHeadY} x2={x + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                            </g>
                        );
                    }
                    if (tok.type === 'eighth') {
                        return (
                            <g key={idx}>
                                <ellipse cx={x} cy={noteHeadY} rx="6" ry="4.5" fill="#0f172a" />
                                <line x1={x + 6} y1={noteHeadY} x2={x + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                                <path
                                    d={`M ${x + 6} ${stemTop} q 6 4 6 10`}
                                    stroke="#0f172a"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </g>
                        );
                    }
                    if (tok.type === 'eighth-pair') {
                        const x2 = beatX(tok.beat + 0.5);
                        return (
                            <g key={idx}>
                                <ellipse cx={x} cy={noteHeadY} rx="6" ry="4.5" fill="#0f172a" />
                                <line x1={x + 6} y1={noteHeadY} x2={x + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                                <ellipse cx={x2} cy={noteHeadY} rx="6" ry="4.5" fill="#0f172a" />
                                <line x1={x2 + 6} y1={noteHeadY} x2={x2 + 6} y2={stemTop} stroke="#0f172a" strokeWidth="1.5" />
                                <line x1={x + 6} y1={stemTop} x2={x2 + 6} y2={stemTop} stroke="#0f172a" strokeWidth="3" />
                            </g>
                        );
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};
