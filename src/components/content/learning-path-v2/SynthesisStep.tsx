import React, { useMemo, useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Sparkles, Save, CheckCircle2, GripVertical, RotateCcw } from 'lucide-react';
import type { StepRendererProps } from './types';
import { useStepSounds } from '../../../hooks/useStepSounds';

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
    correctCount?: number;
}

const TimelineBuilder: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    previousResponse,
    isAlreadyCompleted,
}) => {
    const items = useMemo(() => step.synthesisItems ?? [], [step.synthesisItems]);
    const sounds = useStepSounds();

    const correctOrder = useMemo(
        () =>
            [...items]
                .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
                .map((it) => it.id),
        [items]
    );

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

    const correctCount = order.filter((id, i) => id === correctOrder[i]).length;
    const isCorrect = correctCount === order.length;

    const handleReorder = (next: string[]) => {
        setOrder(next);
        if (checked) setChecked(false);
    };

    const handleCheck = () => {
        setChecked(true);
        sounds.play(isCorrect ? 'correct' : 'incorrect');
    };

    const handleShuffle = () => {
        setOrder([...order].sort(() => Math.random() - 0.5));
        setChecked(false);
    };

    const handleSave = () => {
        setDone(true);
        sounds.play('complete');
        onComplete({
            completed: true,
            score: correctCount / order.length,
            artifact: { order, correct: isCorrect, correctCount },
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
                <p className="text-slate-700 leading-relaxed mb-4">{step.synthesisPrompt}</p>
            )}

            <p className="text-xs text-slate-500 italic mb-4">
                Tips: dra hendelsene opp eller ned ved å holde inne kortet. Eldst skal øverst.
            </p>

            <Reorder.Group
                axis="y"
                values={order}
                onReorder={handleReorder}
                className="space-y-2 mb-5"
            >
                {order.map((id, idx) => {
                    const item = items.find((i) => i.id === id);
                    if (!item) return null;
                    return (
                        <TimelineRow
                            key={id}
                            id={id}
                            label={item.label}
                            year={item.year}
                            index={idx}
                            checked={checked}
                            placedCorrectly={checked && id === correctOrder[idx]}
                            onPick={() => sounds.play('pick')}
                            onDrop={() => sounds.play('drop')}
                        />
                    );
                })}
            </Reorder.Group>

            {checked && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 mb-5 ${
                        isCorrect
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-amber-50 border border-amber-200'
                    }`}
                >
                    <p
                        className={`font-bold text-sm ${
                            isCorrect ? 'text-emerald-900' : 'text-amber-900'
                        }`}
                    >
                        {isCorrect
                            ? 'Perfekt! Alle hendelsene er på riktig plass.'
                            : `Du har ${correctCount} av ${order.length} på riktig plass. Sjekk årstallene under hver rad og dra de røde til rett sted.`}
                    </p>
                </motion.div>
            )}

            <div className="flex flex-wrap gap-3">
                {!done && (
                    <button
                        onClick={handleCheck}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold shadow hover:bg-amber-700 transition"
                    >
                        Sjekk rekkefølgen
                    </button>
                )}
                {checked && !done && (
                    <>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                        >
                            <Save className="w-4 h-4" />
                            Lagre tidslinjen min
                        </button>
                        {!isCorrect && (
                            <button
                                onClick={handleShuffle}
                                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Stokk om
                            </button>
                        )}
                    </>
                )}
                {done && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-900 font-semibold text-sm">
                            Tidslinje lagret som artefakt
                            {!isCorrect && ` (${correctCount}/${order.length} på riktig plass)`}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface TimelineRowProps {
    id: string;
    label: string;
    year?: number;
    index: number;
    checked: boolean;
    placedCorrectly: boolean;
    onPick: () => void;
    onDrop: () => void;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
    id,
    label,
    year,
    index,
    checked,
    placedCorrectly,
    onPick,
    onDrop,
}) => {
    const controls = useDragControls();

    const baseCls =
        'flex items-center gap-3 bg-white rounded-xl p-3 border-2 transition select-none';
    const stateCls = checked
        ? placedCorrectly
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-rose-300 bg-rose-50'
        : 'border-slate-200 hover:border-amber-300';

    return (
        <Reorder.Item
            value={id}
            dragListener={false}
            dragControls={controls}
            onDragStart={onPick}
            onDragEnd={onDrop}
            whileDrag={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}
            animate={
                checked && !placedCorrectly
                    ? { x: [0, -4, 4, -3, 3, 0] }
                    : { x: 0 }
            }
            transition={{ duration: 0.35 }}
            className={`${baseCls} ${stateCls}`}
        >
            <span className="font-mono text-xs text-slate-400 w-6 flex-shrink-0">
                {index + 1}.
            </span>
            <button
                type="button"
                onPointerDown={(e) => controls.start(e)}
                className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 text-slate-300 hover:text-slate-500"
                aria-label="Dra for å flytte"
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <span className="flex-1 text-slate-800 font-medium text-sm md:text-base">{label}</span>
            {checked && year !== undefined && (
                <span
                    className={`text-xs font-mono ${
                        placedCorrectly ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                >
                    {year < 0 ? `${-year} f.Kr` : `${year} e.Kr`}
                </span>
            )}
        </Reorder.Item>
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
    const sounds = useStepSounds();
    const minLength = step.completion.minLength ?? 120;

    const handleSave = () => {
        if (text.trim().length < minLength) return;
        sounds.play('complete');
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
