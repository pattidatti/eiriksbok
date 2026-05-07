import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../logic/questionGenerator';
import { PianoDisplay } from './PianoDisplay';
import { RhythmNotation } from './RhythmNotation';

interface FeedbackOverlayProps {
    question: Question;
    selected: string;
    isCorrect: boolean;
    onReplay: () => void;
    onNext: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
    question,
    selected,
    isCorrect,
    onReplay,
    onNext,
}) => {
    const headerCls = isCorrect
        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
        : 'bg-rose-100 text-rose-900 border-rose-300';

    return (
        <div className="mt-6 w-full space-y-4">
            <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${headerCls}`}>
                {isCorrect ? (
                    <CheckCircle2 className="h-7 w-7 flex-shrink-0" />
                ) : (
                    <XCircle className="h-7 w-7 flex-shrink-0" />
                )}
                <div className="flex-1">
                    <div className="text-lg font-bold">{isCorrect ? 'Riktig!' : 'Ikke helt.'}</div>
                    <div className="text-sm">
                        {isCorrect ? (
                            <>Det var <span className="font-semibold">{question.correctLabel}</span>.</>
                        ) : (
                            <>
                                Du svarte <span className="font-semibold">{selected}</span>. Riktig svar var{' '}
                                <span className="font-semibold">{question.correctLabel}</span>.
                            </>
                        )}
                    </div>
                </div>
            </div>

            {!isCorrect && (
                <>
                    {question.type === 'interval' && (
                        <PianoDisplay
                            highlightMidi={[question.rootMidi, question.rootMidi + question.semitones]}
                            rootMidi={question.rootMidi}
                        />
                    )}
                    {question.type === 'chord' && (
                        <PianoDisplay
                            highlightMidi={question.intervals.map((iv) => question.rootMidi + iv)}
                            rootMidi={question.rootMidi}
                        />
                    )}
                    {question.type === 'rhythm' && <RhythmNotation pattern={question.pattern} />}
                </>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!isCorrect && (
                    <button
                        type="button"
                        onClick={onReplay}
                        className="rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                    >
                        Spill begge igjen
                    </button>
                )}
                <button
                    type="button"
                    onClick={onNext}
                    autoFocus
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
                >
                    Neste →
                </button>
            </div>
        </div>
    );
};
