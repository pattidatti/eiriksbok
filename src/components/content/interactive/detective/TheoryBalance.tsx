import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import type { DetectiveClue, DetectiveSuspect } from './types';

interface TheoryBalanceProps {
    suspects: DetectiveSuspect[];
    collectedClues: DetectiveClue[];
}

interface TheoryScore {
    suspect: DetectiveSuspect;
    score: number;
}

function calculateScores(
    suspects: DetectiveSuspect[],
    clues: DetectiveClue[]
): { scores: TheoryScore[]; max: number } {
    const scoreMap = new Map<string, number>();
    suspects.forEach((s) => scoreMap.set(s.id, 0));

    for (const clue of clues) {
        const weight = clue.weight ?? 1;
        for (const id of clue.supports ?? []) {
            scoreMap.set(id, (scoreMap.get(id) ?? 0) + weight);
        }
    }

    const scores: TheoryScore[] = suspects.map((s) => ({
        suspect: s,
        score: scoreMap.get(s.id) ?? 0,
    }));
    const max = Math.max(1, ...scores.map((s) => s.score));
    return { scores, max };
}

export const TheoryBalance: React.FC<TheoryBalanceProps> = ({ suspects, collectedClues }) => {
    const { scores, max } = useMemo(
        () => calculateScores(suspects, collectedClues),
        [suspects, collectedClues]
    );

    if (suspects.length === 0) return null;

    return (
        <div className="flex-shrink-0 px-4 py-3 bg-[var(--det-surface)]/70 border-b border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
                <Scale className="w-3.5 h-3.5 text-[var(--det-accent)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Teorienes vektskål
                </span>
                <span className="text-xs text-slate-500 ml-auto hidden md:block">
                    Bevisene styrker teoriene du har funnet støtte for
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {scores.map(({ suspect, score }) => {
                    const fillPct = max > 0 ? (score / max) * 100 : 0;
                    const color = suspect.color ?? 'var(--det-accent)';
                    return (
                        <div
                            key={suspect.id}
                            className="rounded-lg border border-white/5 bg-black/20 p-2 flex flex-col gap-1"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-lg leading-none flex-shrink-0">
                                    {suspect.icon}
                                </span>
                                <span className="text-sm font-bold text-slate-100 truncate">
                                    {suspect.name}
                                </span>
                                <motion.span
                                    key={score}
                                    initial={{ scale: 1.4 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                    className="ml-auto text-base font-bold tabular-nums"
                                    style={{ color }}
                                >
                                    {score}
                                </motion.span>
                            </div>

                            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${fillPct}%` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                    className="absolute inset-y-0 left-0 rounded-full"
                                    style={{ background: color, opacity: score === 0 ? 0.2 : 0.9 }}
                                />
                            </div>

                            <p className="text-xs text-slate-400 leading-tight line-clamp-2">
                                {suspect.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
