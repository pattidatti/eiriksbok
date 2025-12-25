import { motion } from 'framer-motion';
import {
    Search,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useDetectiveState } from './useDetectiveState';
import { SourceViewer } from './SourceViewer';
import { CaseFile } from './CaseFile';
import { ConclusionScreen } from './ConclusionScreen';
import { BriefingScreen } from './BriefingScreen';
import { MissionGuide } from './MissionGuide';
import type { DetectiveCase } from './types';

interface DetectiveEngineProps {
    data: DetectiveCase;
}

export const DetectiveEngine: React.FC<DetectiveEngineProps> = ({ data }) => {
    const state = useDetectiveState(data);
    const {
        currentStep,
        currentStepIndex,
        totalSteps,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
        isConclusionVisible,
        setIsConclusionVisible,
        isBriefingVisible,
        setIsBriefingVisible
    } = state;

    if (isBriefingVisible && data.briefing) {
        return (
            <BriefingScreen
                briefing={data.briefing}
                onStart={() => setIsBriefingVisible(false)}
            />
        );
    }

    if (isConclusionVisible) {
        return (
            <div className="relative bg-[#0a0c10] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl min-h-[600px] flex overflow-hidden">
                <CaseFile state={state} suspects={data.suspects} />
                <ConclusionScreen
                    conclusionData={data.conclusion_engine}
                    onRestart={() => setIsConclusionVisible(false)}
                    trustScore={state.trustScore}
                    evidenceCount={state.collectedClues.size}
                />
            </div>
        );
    }

    return (
        <div className="relative bg-[#0a0c10] text-slate-200 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar / Case File */}
            <CaseFile state={state} suspects={data.suspects} />

            {/* Main Investigation Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Mission Guide Overlay */}
                {data.briefing && (
                    <MissionGuide
                        mission={data.briefing.mission}
                        totalEvidence={data.status.totalEvidence}
                        collectedEvidence={state.collectedClues.size}
                    />
                )}

                {/* Header */}
                <header className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                                Case Log {currentStepIndex + 1}/{totalSteps}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white font-display">
                            {currentStep.title}
                        </h2>
                    </div>
                </header>

                {/* Content Scroller */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <p className="text-slate-400 text-lg leading-relaxed mb-8 italic border-l-2 border-indigo-500/50 pl-6">
                            "{currentStep.content}"
                        </p>

                        <div className="space-y-12">
                            {currentStep.sources.map(source => (
                                <SourceViewer
                                    key={source.id}
                                    source={source}
                                    onClueFound={state.collectClue}
                                    foundClues={state.collectedClues}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Navigation Footer */}
                <footer className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                    <button
                        onClick={prevStep}
                        disabled={isFirstStep}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isFirstStep ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Forrige spor
                    </button>

                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {isLastStep ? 'Gå til konklusjon' : 'Neste spor'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </footer>
            </main>
        </div>
    );
};
