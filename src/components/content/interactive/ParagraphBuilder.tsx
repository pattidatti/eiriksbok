import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Layers,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    RotateCcw,
    Sparkles,
    GripVertical,
} from 'lucide-react';

interface Slot {
    id: string;
    label: string;
    description: string;
    color: string;
}

interface Fragment {
    id: string;
    text: string;
    correctSlot: string;
    isDistractor: boolean;
    feedback: string;
}

interface ParagraphBuilderProps {
    title?: string;
    context: string;
    slots: Slot[];
    fragments: Fragment[];
    modelParagraph: string;
}

const SLOT_COLORS: Record<
    string,
    { bg: string; border: string; text: string; badge: string; light: string; ring: string }
> = {
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        light: 'bg-blue-50/50',
        ring: 'ring-blue-300',
    },
    yellow: {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        light: 'bg-amber-50/50',
        ring: 'ring-amber-300',
    },
    green: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        light: 'bg-emerald-50/50',
        ring: 'ring-emerald-300',
    },
    purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        light: 'bg-purple-50/50',
        ring: 'ring-purple-300',
    },
};

export const ParagraphBuilder: React.FC<ParagraphBuilderProps> = ({
    title = 'Analysebyggeren',
    context,
    slots,
    fragments: initialFragments,
    modelParagraph,
}) => {
    const [placements, setPlacements] = useState<Record<string, string>>({});
    const [selectedFragment, setSelectedFragment] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{
        message: string;
        type: 'success' | 'error';
        fragmentId?: string;
    } | null>(null);
    const [showModel, setShowModel] = useState(false);
    const [complete, setComplete] = useState(false);
    const [rejected, setRejected] = useState<Set<string>>(new Set());

    const correctFragments = useMemo(
        () => initialFragments.filter((f) => !f.isDistractor),
        [initialFragments]
    );

    const poolFragments = useMemo(
        () =>
            initialFragments.filter(
                (f) => !placements[f.id] && !rejected.has(f.id)
            ),
        [initialFragments, placements, rejected]
    );

    const strength = useMemo(() => {
        const placed = Object.keys(placements).length;
        return correctFragments.length > 0 ? placed / correctFragments.length : 0;
    }, [placements, correctFragments]);

    const strengthLabel = useMemo(() => {
        if (strength === 0) return 'Tomt';
        if (strength < 0.33) return 'Svakt';
        if (strength < 0.66) return 'Tar form';
        if (strength < 1) return 'Nesten!';
        return 'Komplett!';
    }, [strength]);

    const strengthColor = useMemo(() => {
        if (strength < 0.33) return 'from-red-400 to-orange-400';
        if (strength < 0.66) return 'from-orange-400 to-amber-400';
        if (strength < 1) return 'from-amber-400 to-emerald-400';
        return 'from-emerald-400 to-emerald-500';
    }, [strength]);

    const handleFragmentClick = useCallback(
        (fragmentId: string) => {
            if (complete) return;
            setFeedback(null);
            setSelectedFragment(selectedFragment === fragmentId ? null : fragmentId);
        },
        [selectedFragment, complete]
    );

    const handleSlotClick = useCallback(
        (slotId: string) => {
            if (!selectedFragment || complete) return;

            const fragment = initialFragments.find((f) => f.id === selectedFragment);
            if (!fragment) return;

            if (fragment.isDistractor) {
                setFeedback({
                    message: fragment.feedback || 'Dette fragmentet hører ikke hjemme i avsnittet.',
                    type: 'error',
                    fragmentId: fragment.id,
                });
                setRejected((prev) => new Set(prev).add(fragment.id));
                setSelectedFragment(null);
                return;
            }

            if (fragment.correctSlot === slotId) {
                setPlacements((prev) => {
                    const next = { ...prev, [fragment.id]: slotId };

                    const newPlacedCount = Object.keys(next).length;
                    if (newPlacedCount === correctFragments.length) {
                        setTimeout(() => {
                            setComplete(true);
                            confetti({
                                particleCount: 120,
                                spread: 80,
                                origin: { y: 0.6 },
                                colors: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
                            });
                        }, 300);
                    }
                    return next;
                });
                setFeedback({
                    message: fragment.feedback || 'Riktig plassert!',
                    type: 'success',
                    fragmentId: fragment.id,
                });
            } else {
                setFeedback({
                    message:
                        fragment.feedback ||
                        `Ikke helt — dette fragmentet passer bedre et annet sted.`,
                    type: 'error',
                    fragmentId: fragment.id,
                });
            }
            setSelectedFragment(null);
        },
        [selectedFragment, initialFragments, correctFragments, complete]
    );

    const reset = useCallback(() => {
        setPlacements({});
        setSelectedFragment(null);
        setFeedback(null);
        setShowModel(false);
        setComplete(false);
        setRejected(new Set());
    }, []);

    const getSlotFragments = useCallback(
        (slotId: string) =>
            initialFragments.filter((f) => placements[f.id] === slotId),
        [initialFragments, placements]
    );

    const assembledParagraph = useMemo(() => {
        if (!complete) return '';
        return slots
            .map((slot) => {
                const frags = getSlotFragments(slot.id);
                return frags.map((f) => f.text).join(' ');
            })
            .filter(Boolean)
            .join(' ');
    }, [complete, slots, getSlotFragments]);

    return (
        <div className="my-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <Layers size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{context}</p>
                </div>
            </div>

            {/* Strength meter */}
            <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Avsnittsstyrke: {strengthLabel}</span>
                    <span>{Math.round(strength * 100)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${strengthColor}`}
                        animate={{ width: `${strength * 100}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                </div>
            </div>

            {/* Slots */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {slots.map((slot) => {
                    const colors = SLOT_COLORS[slot.color] || SLOT_COLORS.blue;
                    const slotFrags = getSlotFragments(slot.id);
                    const hasContent = slotFrags.length > 0;
                    const isTarget = selectedFragment !== null;

                    return (
                        <motion.div
                            key={slot.id}
                            onClick={() => handleSlotClick(slot.id)}
                            whileHover={isTarget ? { scale: 1.02 } : {}}
                            whileTap={isTarget ? { scale: 0.98 } : {}}
                            className={`min-h-[100px] rounded-xl border-2 p-3 transition-all ${
                                isTarget
                                    ? `${colors.border} ${colors.bg} cursor-pointer ring-2 ${colors.ring} ring-offset-1`
                                    : hasContent
                                      ? `${colors.border} ${colors.light}`
                                      : 'border-dashed border-slate-300 bg-white'
                            }`}
                        >
                            <div
                                className={`mb-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${colors.badge}`}
                            >
                                {slot.label}
                            </div>
                            <p className="mb-2 text-xs text-slate-400">{slot.description}</p>
                            <AnimatePresence>
                                {slotFrags.map((f) => (
                                    <motion.div
                                        key={f.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`mt-1 rounded-lg ${colors.bg} px-2 py-1.5 text-sm ${colors.text}`}
                                    >
                                        {f.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {!hasContent && !isTarget && (
                                <p className="mt-2 text-center text-xs text-slate-300 italic">
                                    Plasser fragment her
                                </p>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Fragment pool */}
            {!complete && (
                <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-slate-600">
                        Fragmenter — klikk for å velge, deretter klikk en boks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {poolFragments.map((f) => (
                            <motion.button
                                key={f.id}
                                onClick={() => handleFragmentClick(f.id)}
                                layout
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                                    selectedFragment === f.id
                                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md ring-2 ring-indigo-200'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                <GripVertical
                                    size={12}
                                    className="shrink-0 text-slate-300"
                                />
                                {f.text}
                            </motion.button>
                        ))}
                        {poolFragments.length === 0 && !complete && (
                            <p className="text-sm text-slate-400 italic">
                                Alle fragmenter er plassert.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                            feedback.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {feedback.type === 'success' ? (
                            <CheckCircle2 size={16} />
                        ) : (
                            <XCircle size={16} />
                        )}
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assembled paragraph */}
            <AnimatePresence>
                {complete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-5"
                    >
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <Sparkles size={16} />
                            Ditt avsnitt:
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">
                            {assembledParagraph}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Model paragraph toggle */}
            <div className="flex items-center justify-between">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                >
                    <RotateCcw size={14} />
                    Start på nytt
                </button>

                <button
                    onClick={() => setShowModel(!showModel)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                >
                    {showModel ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showModel ? 'Skjul mønster' : 'Sammenlign med mønster'}
                </button>
            </div>

            <AnimatePresence>
                {showModel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4"
                    >
                        <p className="mb-1 text-xs font-medium text-purple-600">
                            Mønsteravsnitt:
                        </p>
                        <p className="text-sm leading-relaxed text-purple-800 italic">
                            {modelParagraph}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion */}
            <AnimatePresence>
                {complete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 p-6 text-center"
                    >
                        <Sparkles className="mx-auto mb-2 text-emerald-500" size={28} />
                        <p className="text-lg font-semibold text-slate-800">Avsnittet er komplett!</p>
                        <p className="mt-1 text-sm text-slate-600">
                            Du har bygget et strukturert analyseavsnitt med påstand, sitat, tolkning
                            og drøfting.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ParagraphBuilder;
