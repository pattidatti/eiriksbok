import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, CheckCircle2, GripVertical } from 'lucide-react';
import type { StepRendererProps } from './types';

// To synthesis-typer:
// - 'timeline-builder': eleven drar hendelser i kronologisk rekkefølge.
// - 'free-text': fritekst som artefakt (samme oppførsel som reflection,
//   men med rikere ramme).
export const SynthesisStep: React.FC<StepRendererProps> = (props) => {
    const synthesisType = props.step.synthesisType ?? 'free-text';

    if (synthesisType === 'timeline-builder') {
        return <TimelineBuilder {...props} />;
    }

    return <FreeTextSynthesis {...props} />;
};

// --- Timeline Builder ---

interface TimelineArtifact {
    order: string[];
    correct: boolean;
}

const TimelineBuilder: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    previousResponse,
    isAlreadyCompleted,
}) => {
    const items = useMemo(() => step.synthesisItems ?? [], [step.synthesisItems]);

    // Riktig rekkefølge basert på year ascending. Hvis ingen year, beholder original.
    const correctOrder = useMemo(
        () =>
            [...items]
                .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
                .map((it) => it.id),
        [items]
    );

    // Stokk om rekkefølgen ved oppstart (deterministisk reversering for stabilitet).
    const initialOrder = useMemo(() => {
        const stored = previousResponse?.artifact as TimelineArtifact | undefined;
        if (stored && Array.isArray(stored.order)) {
            return stored.order;
        }
        return [...items].map((it) => it.id).reverse();
    }, [items, previousResponse]);

    const [order, setOrder] = useState<string[]>(initialOrder);
    const [checked, setChecked] = useState(false);
    const [done, setDone] = useState(isAlreadyCompleted);

    const move = (idx: number, dir: -1 | 1) => {
        const next = idx + dir;
        if (next < 0 || next >= order.length) return;
        const copy = [...order];
        [copy[idx], copy[next]] = [copy[next], copy[idx]];
        setOrder(copy);
        if (checked) setChecked(false);
    };

    const isCorrect = order.every((id, i) => id === correctOrder[i]);

    const handleCheck = () => {
        setChecked(true);
    };

    const handleSave = () => {
        setDone(true);
        onComplete({
            completed: true,
            score: isCorrect ? 1 : 0.5,
            artifact: { order, correct: isCorrect },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-4 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                    <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Syntese: bygg tidslinjen
                </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>

            {step.synthesisPrompt && (
                <p className="text-slate-700 leading-relaxed mb-6">{step.synthesisPrompt}</p>
            )}

            <div className="space-y-2 mb-5">
                {order.map((id, idx) => {
                    const item = items.find((i) => i.id === id);
                    if (!item) return null;
                    const placedCorrectly = checked && id === correctOrder[idx];
                    const placedWrong = checked && id !== correctOrder[idx];
                    return (
                        <div
                            key={id}
                            className={`flex items-center gap-3 bg-white rounded-xl p-3 border-2 transition ${
                                placedCorrectly
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : placedWrong
                                      ? 'border-rose-300 bg-rose-50'
                                      : 'border-slate-200'
                            }`}
                        >
                            <span className="font-mono text-xs text-slate-400 w-6">
                                {idx + 1}.
                            </span>
                            <GripVertical className="w-4 h-4 text-slate-300" />
                            <span className="flex-1 text-slate-800 font-medium">{item.label}</span>
                            {checked && item.year !== undefined && (
                                <span className="text-xs font-mono text-slate-500">
                                    {item.year < 0 ? `${-item.year} f.Kr` : `${item.year} e.Kr`}
                                </span>
                            )}
                            <div className="flex flex-col">
                                <button
                                    onClick={() => move(idx, -1)}
                                    disabled={idx === 0}
                                    className="text-xs px-2 py-0.5 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                    aria-label="Flytt opp"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => move(idx, 1)}
                                    disabled={idx === order.length - 1}
                                    className="text-xs px-2 py-0.5 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                    aria-label="Flytt ned"
                                >
                                    ▼
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {checked && (
                <div
                    className={`rounded-xl p-4 mb-5 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}
                >
                    <p
                        className={`font-bold text-sm ${isCorrect ? 'text-emerald-900' : 'text-amber-900'}`}
                    >
                        {isCorrect
                            ? 'Perfekt! Du har lagt hendelsene i riktig rekkefølge.'
                            : 'Noen hendelser er på feil plass. Se på årstallene og flytt dem til de stemmer.'}
                    </p>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {!checked && (
                    <button
                        onClick={handleCheck}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold shadow hover:bg-amber-700 transition"
                    >
                        Sjekk rekkefølgen
                    </button>
                )}
                {checked && !done && (
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                    >
                        <Save className="w-4 h-4" />
                        Lagre tidslinjen min
                    </button>
                )}
                {done && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-900 font-semibold text-sm">
                            Tidslinje lagret som artefakt
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- Free-text synthesis ---

interface FreeTextArtifact {
    text: string;
}

const FreeTextSynthesis: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    previousResponse,
    isAlreadyCompleted,
}) => {
    const stored = previousResponse?.artifact as FreeTextArtifact | undefined;
    const [text, setText] = useState(stored?.text ?? previousResponse?.text ?? '');
    const [saved, setSaved] = useState(isAlreadyCompleted);
    const minLength = step.completion.minLength ?? 120;

    const handleSave = () => {
        if (text.trim().length < minLength) return;
        onComplete({ artifact: { text: text.trim() }, text: text.trim(), completed: true });
        setSaved(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-4 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                    <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Syntese
                </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>

            {step.synthesisPrompt && (
                <p className="text-slate-700 leading-relaxed mb-5 text-lg">
                    {step.synthesisPrompt}
                </p>
            )}

            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    if (saved) setSaved(false);
                }}
                placeholder="Skriv din syntese her..."
                rows={10}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-base text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none transition resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500 font-mono">
                    {text.trim().length}/{minLength} tegn
                </span>

                <button
                    onClick={handleSave}
                    disabled={text.trim().length < minLength}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-amber-700 transition"
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Artefakt lagret
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Lagre artefakten min
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};
