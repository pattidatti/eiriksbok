import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PresentationData } from '../../types';
import { usePresentationSync } from '../../hooks/usePresentationSync';
import { getComponent } from '../ComponentRegistry';
import { SlideEraTimeline } from './SlideEraTimeline';

interface ProjectorViewProps {
    data: PresentationData;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ data }) => {
    const { state } = usePresentationSync(data.id, 'projector');

    const currentSlide = data.slides[state.currentSlideIndex] || data.slides[0];

    if (state.isBlackout) {
        return <div className="fixed inset-0 bg-black z-[9999]" />;
    }

    return (
        <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden">
            {/* Background Image / Blur Layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.image || 'default'}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    {currentSlide.image && (
                        <img
                            src={currentSlide.image}
                            alt=""
                            className="w-full h-full object-cover filter blur-sm scale-110"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Era timeline header (skipped on title/task-pause for cleaner look) */}
            {currentSlide.layout !== 'title' && currentSlide.layout !== 'task-pause' && (currentSlide.year !== undefined || currentSlide.yearRange) && (
                <div className="absolute top-0 left-0 right-0 z-20 pt-6">
                    <SlideEraTimeline
                        year={currentSlide.year}
                        yearRange={currentSlide.yearRange}
                        variant="projector"
                    />
                </div>
            )}

            <div className={`relative z-10 h-full flex flex-col ${
                currentSlide.layout === 'interactive'
                    ? 'px-6 md:px-10 pt-16 md:pt-20 pb-10'
                    : 'p-10 md:p-16'
            }`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.currentSlideIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        {/* Layout: TITLE */}
                        {currentSlide.layout === 'title' && (
                            <div className="flex-1 flex flex-col justify-center items-center text-center">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-indigo-400 font-bold uppercase tracking-[0.4em] mb-6 text-2xl"
                                >
                                    {currentSlide.summary}
                                </motion.span>
                                <h1 className="text-7xl md:text-9xl font-black leading-tight max-w-6xl">
                                    {currentSlide.title}
                                </h1>
                            </div>
                        )}

                        {/* Layout: CONTENT & DISCUSSION */}
                        {(currentSlide.layout === 'content' || currentSlide.layout === 'discussion' || currentSlide.layout === 'summary') && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4 tracking-tight">
                                    {currentSlide.title}
                                </h2>

                                <div className="space-y-8 mt-8">
                                    {currentSlide.points?.map((point, idx) => (
                                        <motion.div
                                            key={point.id}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{
                                                opacity: idx <= state.currentRevealIndex ? 1 : 0,
                                                x: idx <= state.currentRevealIndex ? 0 : -30,
                                                scale: idx === state.currentRevealIndex ? 1.05 : 1,
                                            }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className={`flex items-start gap-8 ${idx < state.currentRevealIndex ? 'text-white/40' : 'text-white'}`}
                                        >
                                            <span className="mt-4 w-4 h-4 rounded-full bg-indigo-500 shrink-0 shadow-lg shadow-indigo-500/50" />
                                            <p className="text-4xl md:text-6xl font-bold leading-tight">
                                                {point.text}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Layout: INTERACTIVE */}
                        {currentSlide.layout === 'interactive' && currentSlide.component && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <h2 className="text-lg md:text-xl font-bold text-indigo-300 mb-3 uppercase tracking-widest shrink-0">
                                    {currentSlide.title}
                                </h2>
                                <div className="flex-1 min-h-0 bg-white/5 rounded-2xl border border-white/10 shadow-2xl relative">
                                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
                                        {(() => {
                                            const Component = getComponent(currentSlide.component.name);
                                            if (!Component) return <div className="p-8">Component {currentSlide.component.name} not found.</div>;
                                            return <Component {...currentSlide.component.props} />;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Layout: TASK-PAUSE */}
                        {currentSlide.layout === 'task-pause' && (
                            <div className="flex-1 flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-amber-300 font-bold uppercase tracking-[0.4em] mb-8 text-xl"
                                >
                                    Nå jobber dere{currentSlide.suggestedMinutes ? ` · ~${currentSlide.suggestedMinutes} min` : ''}
                                </motion.span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white/80 mb-10 tracking-tight">
                                    {currentSlide.title}
                                </h2>
                                {currentSlide.taskPrompt && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        className="text-5xl md:text-6xl font-bold leading-tight text-amber-100"
                                    >
                                        {currentSlide.taskPrompt}
                                    </motion.p>
                                )}
                                {currentSlide.points && currentSlide.points.length > 0 && (
                                    <ul className="mt-12 space-y-4 text-2xl md:text-3xl text-amber-100/90">
                                        {currentSlide.points.map((p) => (
                                            <li key={p.id} className="flex items-start gap-4">
                                                <span className="mt-3 w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                                                <span>{p.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Layout: QUOTE */}
                        {currentSlide.layout === 'quote' && (
                            <div className="flex-1 flex flex-col justify-center items-center text-center max-w-5xl mx-auto">
                                <span className="text-indigo-300 text-9xl font-serif leading-none mb-4">"</span>
                                <p className="text-4xl md:text-6xl font-bold leading-snug italic">
                                    {currentSlide.title}
                                </p>
                                {currentSlide.summary && (
                                    <span className="mt-8 text-xl text-indigo-300 uppercase tracking-widest">
                                        — {currentSlide.summary}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Layout: COMPARISON */}
                        {currentSlide.layout === 'comparison' && (
                            <div className="flex-1 flex flex-col">
                                <h2 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-8 tracking-tight">
                                    {currentSlide.title}
                                </h2>
                                <div className="flex-1 grid grid-cols-2 gap-8">
                                    {currentSlide.points?.slice(0, 2).map((p, idx) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: idx <= state.currentRevealIndex ? 1 : 0.2, y: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="bg-white/5 rounded-3xl p-10 border border-white/10 flex flex-col justify-center"
                                        >
                                            <p className="text-3xl md:text-4xl font-bold leading-tight">{p.text}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Subtle Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-600/30 w-full z-20">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((state.currentSlideIndex + 1) / data.slides.length) * 100}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
            </div>
        </div>
    );
};
