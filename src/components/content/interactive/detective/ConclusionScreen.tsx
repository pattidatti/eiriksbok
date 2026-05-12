import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, ArrowLeft, Lightbulb, Info, CheckCircle2, X, Plus } from 'lucide-react';
import type { ConclusionOption, DetectiveClue, DetectiveConclusion } from './types';

interface ConclusionResult {
    optionId: string;
    isCorrect: boolean;
    evidenceUsed: string[];
    strongEvidenceCount: number;
    weakEvidenceCount: number;
    stars: number;
}

interface ConclusionScreenProps {
    conclusionData: DetectiveConclusion;
    collectedClues: DetectiveClue[];
    onRestart: () => void;
    onSubmit: (result: ConclusionResult) => void;
}

function evaluate(
    option: ConclusionOption,
    selectedEvidenceIds: string[]
): Omit<ConclusionResult, 'optionId'> {
    const supported = new Set(option.supportedBy ?? []);
    let strong = 0;
    let weak = 0;
    for (const id of selectedEvidenceIds) {
        if (supported.has(id)) strong++;
        else weak++;
    }
    const isCorrect = option.correct === true;
    let stars = 1;
    if (isCorrect && strong >= 2) stars = 3;
    else if (isCorrect && strong >= 1) stars = 2;
    else if (!isCorrect && strong >= 1) stars = 1;
    return {
        isCorrect,
        evidenceUsed: selectedEvidenceIds,
        strongEvidenceCount: strong,
        weakEvidenceCount: weak,
        stars,
    };
}

export const ConclusionScreen: React.FC<ConclusionScreenProps> = ({
    conclusionData,
    collectedClues,
    onRestart,
    onSubmit,
}) => {
    const minimum = conclusionData.minimumEvidence ?? 2;
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);

    const selectedOption = useMemo(
        () => conclusionData.options.find((o) => o.id === selectedOptionId) ?? null,
        [conclusionData.options, selectedOptionId]
    );

    const result = useMemo(() => {
        if (!selectedOption) return null;
        return { optionId: selectedOption.id, ...evaluate(selectedOption, selectedEvidence) };
    }, [selectedOption, selectedEvidence]);

    const canSubmit = !!selectedOption && selectedEvidence.length >= minimum;

    const toggleEvidence = (id: string) => {
        if (showResult) return;
        setSelectedEvidence((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const submit = () => {
        if (!result || !canSubmit) return;
        setShowResult(true);
    };

    const confirmAndExit = () => {
        if (!result) return;
        onSubmit(result);
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--det-bg)] text-slate-200 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="flex-1 flex flex-col p-4 md:p-6 max-w-3xl mx-auto w-full overflow-y-auto custom-scrollbar">
                <header className="text-center mb-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border"
                        style={{
                            background: 'color-mix(in srgb, var(--det-accent) 18%, transparent)',
                            color: 'var(--det-accent)',
                            borderColor:
                                'color-mix(in srgb, var(--det-accent) 35%, transparent)',
                        }}
                    >
                        <Flag className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Tid for konklusjon</h2>
                    <p className="text-base text-slate-300">
                        Velg svar og dra inn bevisene som støtter konklusjonen din.
                    </p>
                </header>

                {/* Spørsmål og alternativer */}
                <div className="bg-[var(--det-surface)]/60 rounded-xl border border-white/5 p-4 mb-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 leading-snug">
                        <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        {conclusionData.question}
                    </h3>

                    <div className="space-y-2">
                        {conclusionData.options.map((option) => {
                            const isSelected = selectedOptionId === option.id;
                            const isCorrectReveal =
                                showResult && option.correct === true;
                            const isWrongChoice =
                                showResult && isSelected && option.correct !== true;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() =>
                                        !showResult && setSelectedOptionId(option.id)
                                    }
                                    disabled={showResult}
                                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                                        isSelected
                                            ? 'border-[var(--det-accent)] bg-[var(--det-accent)]/10 text-white shadow-lg'
                                            : 'border-white/10 bg-black/20 text-slate-300 hover:border-white/20'
                                    } ${isCorrectReveal ? 'ring-2 ring-emerald-500/60' : ''} ${
                                        isWrongChoice ? 'ring-2 ring-rose-500/60' : ''
                                    } ${showResult ? 'cursor-default' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                isSelected
                                                    ? 'border-[var(--det-accent)] bg-[var(--det-accent)]/30'
                                                    : 'border-slate-600'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-[var(--det-accent)]" />
                                            )}
                                        </div>
                                        <span className="font-medium flex-1 text-base leading-snug">{option.text}</span>
                                        {isCorrectReveal && (
                                            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                                                Konsensus
                                            </span>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showResult && isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-3 pt-3 border-t border-white/10 text-slate-300 text-base"
                                            >
                                                <div className="flex gap-2">
                                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--det-accent)]" />
                                                    <p className="leading-relaxed">
                                                        {option.feedback}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Argumentboks */}
                <div className="bg-[var(--det-surface)]/60 rounded-xl border border-white/5 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Bevis i argumentet
                        </h3>
                        <span className="text-sm text-slate-400">
                            <span
                                className={
                                    selectedEvidence.length >= minimum
                                        ? 'text-emerald-400 font-bold'
                                        : 'text-slate-300 font-bold'
                                }
                            >
                                {selectedEvidence.length}
                            </span>
                            /{minimum} minimum
                        </span>
                    </div>

                    {selectedEvidence.length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-3 text-center border border-dashed border-white/10 rounded-lg">
                            Klikk på bevis nedenfor for å bygge argumentet ditt.
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {selectedEvidence.map((id) => {
                                const clue = collectedClues.find((c) => c.id === id);
                                if (!clue) return null;
                                const isStrong =
                                    showResult &&
                                    selectedOption?.supportedBy?.includes(id);
                                const isWeak =
                                    showResult &&
                                    !selectedOption?.supportedBy?.includes(id);
                                return (
                                    <motion.div
                                        key={id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-start gap-2 p-2 rounded-lg border ${
                                            isStrong
                                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                                : isWeak
                                                  ? 'border-rose-500/30 bg-rose-500/5'
                                                  : 'border-white/10 bg-black/20'
                                        }`}
                                    >
                                        <CheckCircle2
                                            className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                                                isStrong
                                                    ? 'text-emerald-400'
                                                    : isWeak
                                                      ? 'text-rose-400'
                                                      : 'text-slate-500'
                                            }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-100">
                                                "{clue.text}"
                                            </p>
                                            {showResult && (
                                                <p
                                                    className={`text-xs mt-0.5 ${
                                                        isStrong
                                                            ? 'text-emerald-300'
                                                            : 'text-rose-300/80'
                                                    }`}
                                                >
                                                    {isStrong
                                                        ? 'Styrker dette svaret'
                                                        : 'Svekker eller passer dårlig til dette svaret'}
                                                </p>
                                            )}
                                        </div>
                                        {!showResult && (
                                            <button
                                                onClick={() => toggleEvidence(id)}
                                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                                aria-label="Fjern bevis"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tilgjengelige bevis */}
                {!showResult && (
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Dine innsamlede bevis ({collectedClues.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {collectedClues.map((clue) => {
                                const isSelected = selectedEvidence.includes(clue.id);
                                return (
                                    <button
                                        key={clue.id}
                                        onClick={() => toggleEvidence(clue.id)}
                                        className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all ${
                                            isSelected
                                                ? 'border-[var(--det-accent)] bg-[var(--det-accent)]/10'
                                                : 'border-white/5 bg-black/20 hover:border-white/15'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                isSelected
                                                    ? 'bg-[var(--det-accent)]/30'
                                                    : 'bg-white/5'
                                            }`}
                                        >
                                            {isSelected ? (
                                                <CheckCircle2 className="w-3 h-3 text-[var(--det-accent)]" />
                                            ) : (
                                                <Plus className="w-3 h-3 text-slate-500" />
                                            )}
                                        </div>
                                        <span className="text-sm text-slate-200 line-clamp-2 leading-snug">
                                            "{clue.text}"
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {collectedClues.length === 0 && (
                            <p className="text-sm text-amber-400/90 italic mt-2">
                                Du har ikke samlet noen bevis. Gå tilbake og let i kildene.
                            </p>
                        )}
                    </div>
                )}

                {/* Resultatsammendrag */}
                <AnimatePresence>
                    {showResult && result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-xl bg-black/30 border border-white/10"
                        >
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Vurdering av argumentet
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-bold text-emerald-400">
                                        {result.strongEvidenceCount}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase">
                                        Sterke
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-rose-400">
                                        {result.weakEvidenceCount}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase">
                                        Svake
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className={`text-lg font-bold ${
                                            result.isCorrect
                                                ? 'text-emerald-400'
                                                : 'text-amber-400'
                                        }`}
                                    >
                                        {result.isCorrect ? 'Treffer' : 'Bommer'}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase">
                                        Konsensus
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer-knapper */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <button
                        onClick={onRestart}
                        className="flex items-center gap-1.5 px-3 py-2 text-base text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Se bevisene igjen
                    </button>

                    {!showResult ? (
                        <button
                            disabled={!canSubmit}
                            onClick={submit}
                            className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                                canSubmit
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:scale-105'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Legg fram argumentet
                        </button>
                    ) : (
                        <button
                            onClick={confirmAndExit}
                            className="px-6 py-3 rounded-xl font-bold text-base bg-white text-slate-900 hover:scale-105 transition-all shadow-lg"
                        >
                            Avslutt saken
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export type { ConclusionResult };
