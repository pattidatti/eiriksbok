import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EthicalDilemma, Verdict } from '../../../../data/ethics/types';
import { ethicalSystems } from '../../../../data/ethics/ethicalSystems';
import { ExternalLink, Info, CheckCircle2, XCircle, HelpCircle, Sparkles, ArrowRight, ChevronRight, ChevronDown, Brain } from 'lucide-react';

interface DilemmaEngineProps {
    dilemma: EthicalDilemma;
    onChoice: (dilemmaId: string, choiceId: string) => void;
    onNext: () => void;
    selectedChoiceId?: string;
    mode: 'explorer' | 'mastery';
    targetSystemId: string | null;
}

export const DilemmaEngine: React.FC<DilemmaEngineProps> = ({
    dilemma,
    onChoice,
    onNext,
    selectedChoiceId,
    mode,
    targetSystemId
}) => {
    const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
    const targetSystem = ethicalSystems.find(s => s.id === targetSystemId);

    // Auto-expand target system in mastery mode when a choice is made
    useEffect(() => {
        if (mode === 'mastery' && targetSystemId && selectedChoiceId) {
            setExpandedSystem(targetSystemId);
        }
    }, [selectedChoiceId, mode, targetSystemId]);

    const getVerdictIcon = (verdict: Verdict) => {
        switch (verdict) {
            case 'accept': return <CheckCircle2 className="text-emerald-400" size={18} />;
            case 'reject': return <XCircle className="text-rose-400" size={18} />;
            case 'complex': return <HelpCircle className="text-amber-400" size={18} />;
            case 'nuanced': return <Info className="text-blue-400" size={18} />;
            default: return null;
        }
    };

    const getVerdictLabel = (verdict: string) => {
        switch (verdict) {
            case 'accept': return 'Akseptabelt';
            case 'reject': return 'Uakseptabelt';
            case 'complex': return 'Komplekst';
            case 'nuanced': return 'Nyansert';
            default: return verdict;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Dilemma Presentation */}
            <div className="lg:col-span-7 space-y-8">
                <motion.div
                    key={dilemma.id + "-image"}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                >
                    <img
                        src={dilemma.image}
                        alt={dilemma.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <h1 className="text-3xl font-display font-black text-white drop-shadow-lg">
                            {dilemma.title}
                        </h1>
                    </div>
                </motion.div>

                <motion.div
                    key={dilemma.id + "-scenario"}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                >
                    <p className="text-xl text-slate-300 leading-relaxed font-medium italic">
                        "{dilemma.scenario}"
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dilemma.choices.map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => onChoice(dilemma.id, choice.id)}
                            className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden ${selectedChoiceId === choice.id
                                ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                                }`}
                            disabled={!!selectedChoiceId}
                        >
                            {selectedChoiceId === choice.id && mode === 'mastery' && targetSystemId && (
                                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                                    {choice.responses.find(r => r.systemId === targetSystemId)?.verdict === 'accept' ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                                            <Sparkles size={12} />
                                            <span>Korrekt valg</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-tighter">
                                            <span>Feil for teorien</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {selectedChoiceId === choice.id && (
                                <motion.div
                                    layoutId="activeChoice"
                                    className="absolute inset-0 bg-indigo-500/10 pointer-events-none"
                                />
                            )}
                            <h3 className={`text-xl font-black mb-2 transition-colors ${selectedChoiceId === choice.id ? 'text-indigo-400' : 'text-white'}`}>
                                {choice.label}
                            </h3>
                            {choice.description && (
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                    {choice.description}
                                </p>
                            )}
                        </button>
                    ))}
                </div>

                {/* Theory Reference Anchor (Gult felt) */}
                {mode === 'mastery' && targetSystem && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <Brain size={16} />
                            </div>
                            <h5 className="font-bold text-xs uppercase tracking-widest text-indigo-300">
                                Minneregler for {targetSystem.name}
                            </h5>
                        </div>
                        <div className="space-y-4">
                            {targetSystem.keyPrinciples.map((principle, idx) => (
                                <div key={idx} className="flex gap-5 items-start bg-white/[0.03] p-5 rounded-2xl border border-white/5 transition-hover duration-300 hover:bg-white/[0.05]">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0 shadow-indigo-500/10 shadow-inner">
                                        {idx + 1}
                                    </div>
                                    <p className="text-base text-slate-200 leading-relaxed font-medium">
                                        {principle}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Perspectives Panel */}
            <div className="lg:col-span-5">
                <AnimatePresence mode="wait">
                    {selectedChoiceId ? (
                        <motion.div
                            key="responses"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 h-full min-h-[600px]"
                        >
                            {mode === 'mastery' && targetSystemId && (
                                <div className={`p-6 rounded-3xl border mb-6 mt-2 transition-all duration-500 overflow-hidden relative ${selectedChoiceId
                                    ? (dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === targetSystemId)?.verdict === 'accept'
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-rose-500/10 border-rose-500/30')
                                    : 'bg-indigo-600/10 border-indigo-500/20'
                                    }`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Brain size={64} className={selectedChoiceId ? 'text-white' : 'text-indigo-400'} />
                                    </div>
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${selectedChoiceId
                                        ? (dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === targetSystemId)?.verdict === 'accept'
                                            ? 'text-emerald-400'
                                            : 'text-rose-400')
                                        : 'text-indigo-400'
                                        }`}>
                                        {selectedChoiceId ? 'Læringspoeng' : 'Ditt Moralske Kompass'}
                                    </h4>
                                    {selectedChoiceId && targetSystem ? (
                                        <div className="flex-1">
                                            <p className="text-white text-lg font-bold leading-tight mb-2">
                                                {dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === targetSystemId)?.verdict === 'accept'
                                                    ? 'Godt jobbet!'
                                                    : 'Ikke helt.'} Dette valget {dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === targetSystemId)?.verdict === 'accept' ? 'stemmer overens med' : 'bryter med'} {targetSystem?.name}s prinsipper.
                                            </p>
                                            <p className="text-slate-200 text-lg leading-relaxed italic font-medium">
                                                {dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === targetSystemId)?.explanation}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-base text-slate-200 font-medium mb-3 relative z-10 leading-relaxed">
                                            Du spiller nå som en {targetSystem?.name}.
                                        </p>
                                    )}

                                    {!selectedChoiceId && (
                                        <div className="pt-3 border-t border-indigo-500/10">
                                            <span className="text-[9px] font-black uppercase text-indigo-400/60 block mb-2">Husk dine prinsipper:</span>
                                            <ul className="space-y-1.5">
                                                {ethicalSystems.find(s => s.id === targetSystemId)?.keyPrinciples.slice(0, 2).map((p, i) => (
                                                    <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-indigo-500/40 mt-1.5" />
                                                        <span>{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Sort ethical systems to put target system first in mastery mode */}
                                {[...ethicalSystems]
                                    .sort((a, b) => {
                                        if (mode === 'mastery' && targetSystemId) {
                                            if (a.id === targetSystemId) return -1;
                                            if (b.id === targetSystemId) return 1;
                                        }
                                        return 0;
                                    })
                                    .map(system => {
                                        const response = dilemma.choices.find(c => c.id === selectedChoiceId)?.responses.find(r => r.systemId === system.id);
                                        if (!response) return null;

                                        const isExpanded = expandedSystem === system.id;
                                        const isTarget = mode === 'mastery' && system.id === targetSystemId;

                                        return (
                                            <div
                                                key={system.id}
                                                className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${isExpanded
                                                    ? (system.category === 'religious' ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10')
                                                    : (isTarget ? 'bg-white/[0.04] border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10')
                                                    }`}
                                                onClick={() => setExpandedSystem(isExpanded ? null : system.id)}
                                            >
                                                <div className="p-4 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg transition-colors ${isExpanded
                                                            ? (system.category === 'religious' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white')
                                                            : (isTarget ? 'bg-indigo-500 text-white animate-pulse' : (system.category === 'religious' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'))
                                                            }`}>
                                                            {system.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-sm tracking-tight">{system.name}</h4>
                                                                {isTarget && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black uppercase text-white">Mål</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                                                                {system.category === 'religious' ? 'Religiøst' : 'Sekulært'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-white/5">
                                                            {getVerdictIcon(response.verdict)}
                                                            <span className="text-[9px] font-black uppercase text-slate-300">
                                                                {getVerdictLabel(response.verdict)}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}>
                                                            {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div className="px-5 pb-5 pt-2 border-t border-white/5">
                                                                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                                                    {response.explanation}
                                                                </p>
                                                                <div className="mt-4 flex items-center justify-between">
                                                                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Kilde: {system.origin}</span>
                                                                    <a
                                                                        href={system.articleLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                                                                    >
                                                                        Lær mer <ExternalLink size={10} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="mt-8 space-y-4">
                                <p className="text-sm text-indigo-300 italic text-center">
                                    "Trykk på boksene ovenfor for å se dypere analyser."
                                </p>

                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={onNext}
                                    className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                                >
                                    <span>Neste dilemma</span>
                                    <ArrowRight size={16} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 border-dashed rounded-[2.5rem] p-12 h-full flex flex-col items-center justify-center text-center opacity-40">
                            <Info size={48} className="text-slate-500 mb-6" />
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Venter på ditt valg</h3>
                            <p className="text-sm text-slate-600">Gjør et valg for å se hvordan ulike etiske systemer vurderer situasjonen.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
