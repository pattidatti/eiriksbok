import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { MessageCircle, ArrowRight, CheckCircle2, Sparkles, PenLine } from 'lucide-react';

interface DialogDissectorProps {
    title?: string;
    subtextDialogue: {
        lines: {
            speaker: string;
            text: string;
            subtext: string;
            options: string[];
            correctIndex: number;
        }[];
    };
    actionBeats: {
        lines: {
            original: string;
            improved: string;
            speaker: string;
        }[];
    };
}

type Phase = 'subtext' | 'action';
const spring = { type: 'spring' as const, stiffness: 200, damping: 20 };

export const DialogDissector = ({
    title = 'Dialogdisseksjon',
    subtextDialogue,
    actionBeats,
}: DialogDissectorProps) => {
    const [phase, setPhase] = useState<Phase>('subtext');
    const [revealedSubtext, setRevealedSubtext] = useState<Set<number>>(new Set());
    const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
    const [shakeIdx, setShakeIdx] = useState<number | null>(null);
    const [transformedBeats, setTransformedBeats] = useState<Set<number>>(new Set());

    const allSubtextRevealed = revealedSubtext.size === subtextDialogue.lines.length;
    const allBeatsTransformed = transformedBeats.size === actionBeats.lines.length;

    const handleSubtextGuess = useCallback(
        (lineIdx: number, optionIdx: number) => {
            if (optionIdx === subtextDialogue.lines[lineIdx].correctIndex) {
                setRevealedSubtext((prev) => new Set(prev).add(lineIdx));
                setActiveLineIdx(null);
            } else {
                setShakeIdx(lineIdx);
                setTimeout(() => setShakeIdx(null), 600);
            }
        },
        [subtextDialogue.lines]
    );

    const handleTransformBeat = useCallback(
        (idx: number) => {
            if (transformedBeats.has(idx)) return;
            const next = new Set(transformedBeats);
            next.add(idx);
            setTransformedBeats(next);
            if (next.size === actionBeats.lines.length) {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] });
            }
        },
        [transformedBeats, actionBeats.lines.length]
    );

    const speakers = [...new Set(subtextDialogue.lines.map((l) => l.speaker))];
    const isRight = (speaker: string) => speakers.indexOf(speaker) % 2 === 1;

    return (
        <div className="w-full max-w-2xl mx-auto my-8 font-sans px-4">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-2">
                    <MessageCircle size={20} className="text-violet-600" />
                    <h3 className="text-xl font-display font-bold text-slate-800">{title}</h3>
                </div>
                <p className="text-xs text-slate-400">
                    {phase === 'subtext'
                        ? 'Klikk p\u00e5 en replikk for \u00e5 avsl\u00f8re hva som egentlig menes'
                        : 'Klikk p\u00e5 svake talebeskrivelser for \u00e5 forvandle dem'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${phase === 'subtext' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'}`}>
                        1. Subtekst
                    </span>
                    <ArrowRight size={14} className="text-slate-300" />
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${phase === 'action' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-400'}`}>
                        2. Handlingsmerker
                    </span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Phase 1: Subtekst */}
                {phase === 'subtext' && (
                    <motion.div key="subtext" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3">
                        {subtextDialogue.lines.map((line, i) => {
                            const right = isRight(line.speaker);
                            const revealed = revealedSubtext.has(i);
                            const isActive = activeLineIdx === i;
                            return (
                                <motion.div
                                    key={i}
                                    className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}
                                    animate={shakeIdx === i ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                >
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                                        {line.speaker}
                                    </span>
                                    <motion.button
                                        onClick={() => !revealed && setActiveLineIdx(isActive ? null : i)}
                                        disabled={revealed}
                                        whileHover={!revealed ? { scale: 1.02 } : {}}
                                        whileTap={!revealed ? { scale: 0.98 } : {}}
                                        className={`relative max-w-[85%] px-4 py-2.5 rounded-2xl text-sm text-left transition-all ${right ? 'rounded-br-sm' : 'rounded-bl-sm'} ${
                                            revealed
                                                ? 'bg-green-50 border border-green-200 text-slate-700'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300 hover:shadow-md cursor-pointer'
                                        }`}
                                    >
                                        «{line.text}»
                                        {revealed && <CheckCircle2 size={14} className="inline ml-2 text-green-500" />}
                                    </motion.button>
                                    {/* Subtext drawer */}
                                    <AnimatePresence>
                                        {revealed && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className={`max-w-[85%] overflow-hidden ${right ? 'self-end' : 'self-start'}`}>
                                                <div className="mt-1 px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700 italic">
                                                    Egentlig mening: {line.subtext}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {/* Multiple choice options */}
                                    <AnimatePresence>
                                        {isActive && !revealed && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className={`max-w-[85%] overflow-hidden mt-1 ${right ? 'self-end' : 'self-start'}`}>
                                                <p className="text-xs text-slate-500 font-medium mb-1.5 px-1">
                                                    Hva mener {line.speaker} egentlig?
                                                </p>
                                                <div className="space-y-1.5">
                                                    {line.options.map((opt, oi) => (
                                                        <motion.button
                                                            key={oi}
                                                            onClick={() => handleSubtextGuess(i, oi)}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className="block w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:border-violet-300 hover:bg-violet-50 cursor-pointer transition-colors"
                                                        >
                                                            {opt}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                        {/* Next phase button */}
                        <AnimatePresence>
                            {allSubtextRevealed && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
                                    <motion.button
                                        onClick={() => setPhase('action')}
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="px-6 py-2.5 bg-pink-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-pink-700 cursor-pointer inline-flex items-center gap-2 transition-colors"
                                    >
                                        Neste: Handlingsmerker <ArrowRight size={16} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Phase 2: Handlingsmerker */}
                {phase === 'action' && (
                    <motion.div key="action" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3">
                        {actionBeats.lines.map((line, i) => {
                            const done = transformedBeats.has(i);
                            return (
                                <motion.button
                                    key={i}
                                    onClick={() => handleTransformBeat(i)}
                                    disabled={done}
                                    whileHover={!done ? { scale: 1.01 } : {}}
                                    whileTap={!done ? { scale: 0.99 } : {}}
                                    layout
                                    className={`w-full text-left p-4 rounded-xl border text-sm leading-relaxed transition-all ${
                                        done ? 'bg-emerald-50 border-emerald-200 text-slate-700' : 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-md cursor-pointer'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{line.speaker}</span>
                                    <AnimatePresence mode="wait">
                                        {done ? (
                                            <motion.span key="improved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="block">
                                                <PenLine size={12} className="inline mr-1.5 text-emerald-500" />
                                                {line.improved}
                                            </motion.span>
                                        ) : (
                                            <motion.span key="original" exit={{ opacity: 0, y: -6 }} className="block text-slate-500">
                                                {line.original}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                        {/* Completion summary */}
                        <AnimatePresence>
                            {allBeatsTransformed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...spring, delay: 0.3 }}
                                    className="mt-6 rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-200 p-5 text-center shadow-lg"
                                >
                                    <Sparkles size={28} className="mx-auto text-violet-500 mb-2" />
                                    <h4 className="font-display font-bold text-lg text-slate-800 mb-1">Stemmene lever!</h4>
                                    <p className="text-sm text-slate-500">
                                        Du har avslørt subtekst og erstattet svake talebeskrivelser med handlingsmerker.
                                        Dialogen føles ekte når leseren kan <em>se</em> hva karakterene gjør.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
