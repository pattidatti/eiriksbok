import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Printer, X, Calendar, Sparkles, Quote, MapPin } from 'lucide-react';
import type { LearningPathV2Data } from '../../../types';
import type { PathProgress } from '../../../stores/useLearningPathProfile';

interface LearningPathPassProps {
    data: LearningPathV2Data;
    pathState: PathProgress;
    masteryScore: number;
    onClose: () => void;
}

// Romerriket-passet — et utskriftsvennlig "diploma" som samler alt elev
// har produsert: refleksjoner, tidslinje, begreper, mestringspoeng.
// Print CSS skjuler alt utenom #pass-document ved utskrift.
export const LearningPathPass: React.FC<LearningPathPassProps> = ({
    data,
    pathState,
    masteryScore,
    onClose,
}) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const finishedAt = pathState.finishedAt
        ? new Date(pathState.finishedAt).toLocaleDateString('nb-NO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : new Date().toLocaleDateString('nb-NO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          });

    const reflections = Object.entries(pathState.responses)
        .filter(([, r]) => r.text)
        .map(([stepId, r]) => ({
            stepId,
            title: data.steps.find((s) => s.id === stepId)?.title ?? stepId,
            text: r.text!,
        }));

    // Hent tidslinje-artefakt hvis det finnes
    const timelineStep = data.steps.find(
        (s) => s.kind === 'synthesis' && s.synthesisType === 'timeline-builder'
    );
    const timelineArtifact = timelineStep
        ? (pathState.responses[timelineStep.id]?.artifact as
              | { order?: string[]; correct?: boolean }
              | undefined)
        : undefined;

    const orderedTimelineItems =
        timelineStep && timelineArtifact?.order
            ? timelineArtifact.order
                  .map((id) => timelineStep.synthesisItems?.find((i) => i.id === id))
                  .filter(Boolean)
            : [];

    const handlePrint = () => {
        window.print();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-stretch justify-center overflow-y-auto pass-overlay"
        >
            {/* Top toolbar (skjules ved print) */}
            <div className="pass-toolbar fixed top-0 left-0 right-0 z-10 bg-slate-900/95 text-white flex items-center justify-between gap-3 px-5 py-3 print:hidden">
                <span className="text-sm font-bold">Ditt pass — {data.title}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
                    >
                        <Printer className="w-4 h-4" />
                        Skriv ut
                    </button>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/20 transition"
                    >
                        <X className="w-4 h-4" />
                        Lukk
                    </button>
                </div>
            </div>

            {/* Selve passet */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                id="pass-document"
                className="bg-[#f6efe2] my-20 mx-3 md:mx-auto max-w-3xl w-full shadow-2xl print:shadow-none print:my-0 print:mx-0 print:max-w-none print:w-full"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(123, 45, 58, 0.03) 0px, rgba(123, 45, 58, 0.03) 1px, transparent 1px, transparent 36px)",
                }}
            >
                {/* Border ornament */}
                <div className="p-8 md:p-12 border-[3px] border-double m-3 md:m-4" style={{ borderColor: '#7b2d3a' }}>
                    <header className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#7b2d3a' }}>
                        <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#7b2d3a' }}>
                            SPQR · Vitnesbyrd om gjennomført studie
                        </p>
                        <Trophy
                            className="w-12 h-12 mx-auto mt-4 mb-3"
                            style={{ color: '#c9882e' }}
                        />
                        <h1
                            className="font-display text-3xl md:text-4xl font-bold leading-tight"
                            style={{ color: '#1f1a17' }}
                        >
                            {data.title}
                        </h1>
                        <p className="text-sm text-slate-700 mt-2 italic">
                            {data.synthesis?.intro ?? data.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Fullført {finishedAt}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Mestringspoeng: {Math.round(masteryScore * 100)}%
                            </span>
                            <span>
                                {pathState.completedStepIds.length} av {data.steps.length} steg
                            </span>
                        </div>
                    </header>

                    {/* Begreper du behersker */}
                    {pathState.conceptsEncountered.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#7b2d3a' }}>
                                Begreper du nå behersker
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {pathState.conceptsEncountered.map((c) => (
                                    <span
                                        key={c}
                                        className="px-3 py-1 rounded-full text-sm font-semibold border"
                                        style={{
                                            backgroundColor: 'rgba(201, 136, 46, 0.12)',
                                            borderColor: '#c9882e',
                                            color: '#7b2d3a',
                                        }}
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Din tidslinje */}
                    {orderedTimelineItems.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#7b2d3a' }}>
                                <MapPin className="w-4 h-4" />
                                Tidslinjen du bygget
                                {timelineArtifact?.correct === false && (
                                    <span className="text-[10px] font-normal text-slate-500 italic ml-1">
                                        (din rekkefølge — ikke nødvendigvis kronologisk)
                                    </span>
                                )}
                            </h2>
                            <ol className="space-y-2">
                                {orderedTimelineItems.map((item, i) => (
                                    <li key={item!.id} className="flex gap-3 text-sm text-slate-800">
                                        <span
                                            className="font-mono font-bold w-6 flex-shrink-0"
                                            style={{ color: '#c9882e' }}
                                        >
                                            {i + 1}.
                                        </span>
                                        <span className="leading-relaxed">{item!.label}</span>
                                        {item!.year !== undefined && (
                                            <span className="ml-auto text-xs font-mono text-slate-500 flex-shrink-0">
                                                {item!.year < 0
                                                    ? `${-item!.year} f.Kr`
                                                    : `${item!.year} e.Kr`}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Refleksjoner */}
                    {reflections.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#7b2d3a' }}>
                                <Quote className="w-4 h-4" />
                                Dine refleksjoner
                            </h2>
                            <div className="space-y-4">
                                {reflections.map((r) => (
                                    <div
                                        key={r.stepId}
                                        className="pl-4 border-l-2"
                                        style={{ borderColor: '#c9882e' }}
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#7b2d3a' }}>
                                            {r.title}
                                        </p>
                                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                            {r.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Footer signatur */}
                    <footer className="mt-10 pt-6 border-t-2 text-center" style={{ borderColor: '#7b2d3a' }}>
                        <p
                            className="font-display text-lg italic"
                            style={{ color: '#7b2d3a' }}
                        >
                            "Du har levd Romerrikets historie."
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.3em] mt-3 text-slate-500">
                            Eiriksbok · digital lærebok
                        </p>
                    </footer>
                </div>
            </motion.div>

            {/* Print-CSS — skjul alt utenom passet, fjern bakgrunnsfarge */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #pass-document, #pass-document * { visibility: visible; }
                    #pass-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .pass-overlay {
                        background: white !important;
                        backdrop-filter: none !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};
