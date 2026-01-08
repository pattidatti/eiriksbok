import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Monitor,
    Clock,
    Eye,
    EyeOff,
    MessageSquare,
    Library
} from 'lucide-react';
import type { PresentationData } from '../../types';
import { usePresentationSync } from '../../hooks/usePresentationSync';

interface PresentationControllerProps {
    data: PresentationData;
    onClose: () => void;
}

export const PresentationController: React.FC<PresentationControllerProps> = ({ data, onClose }) => {
    const { state, updateState } = usePresentationSync(data.id, 'controller');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const currentSlide = data.slides[state.currentSlideIndex] || data.slides[0];

    // Timer logic
    useEffect(() => {
        const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const next = () => {
        // If there are more reveals in current slide, do those first
        if (currentSlide.points && state.currentRevealIndex < currentSlide.points.length - 1) {
            updateState({ currentRevealIndex: state.currentRevealIndex + 1 });
        } else if (state.currentSlideIndex < data.slides.length - 1) {
            updateState({
                currentSlideIndex: state.currentSlideIndex + 1,
                currentRevealIndex: -1
            });
        }
    };

    const prev = () => {
        if (state.currentRevealIndex >= 0) {
            updateState({ currentRevealIndex: state.currentRevealIndex - 1 });
        } else if (state.currentSlideIndex > 0) {
            const previousSlide = data.slides[state.currentSlideIndex - 1];
            updateState({
                currentSlideIndex: state.currentSlideIndex - 1,
                currentRevealIndex: (previousSlide.points?.length || 0) - 1
            });
        }
    };

    const toggleBlackout = () => updateState({ isBlackout: !state.isBlackout });

    const openProjectorWindow = () => {
        window.open(
            `${window.location.href}/projector`,
            'projector',
            'width=1280,height=720'
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900 text-white flex flex-col font-sans select-none overflow-hidden">
            {/* Header / Stats */}
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <Library className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold truncate max-w-md">{data.title}</h2>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-indigo-300 font-mono text-xl">
                        <Clock className="w-5 h-5" />
                        {formatTime(elapsedSeconds)}
                    </div>
                    <div className="text-slate-400 font-mono">
                        Slide {state.currentSlideIndex + 1} / {data.slides.length}
                    </div>
                    <button
                        onClick={openProjectorWindow}
                        className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors"
                    >
                        <Monitor className="w-4 h-4" />
                        Åpne Prosjektør
                    </button>
                </div>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Slide Preview & Local Navigation */}
                <div className="w-2/3 flex flex-col p-6">
                    <div className="flex-1 bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col p-12">
                        <span className="text-indigo-500 font-bold uppercase tracking-widest text-sm mb-4">
                            Prosjektør-preview
                        </span>
                        <h1 className="text-5xl font-bold mb-8">{currentSlide.title}</h1>
                        <div className="space-y-6">
                            {currentSlide.points?.map((p, idx) => (
                                <div
                                    key={p.id}
                                    className={`text-2xl transition-opacity duration-300 ${idx <= state.currentRevealIndex ? 'opacity-100' : 'opacity-20 text-slate-500'}`}
                                >
                                    • {p.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="mt-6 flex justify-between items-center bg-slate-800 p-4 rounded-2xl">
                        <div className="flex gap-4">
                            <button onClick={toggleBlackout} className={`p-4 rounded-xl transition-colors ${state.isBlackout ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>
                                {state.isBlackout ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <div className="flex items-center gap-6">
                            <button onClick={prev} className="p-6 bg-slate-700 hover:bg-slate-600 rounded-2xl">
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button onClick={next} className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-2xl shadow-lg shadow-indigo-900/50">
                                NESTE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Auto-Notes Engine */}
                <div className="w-1/3 border-l border-white/10 bg-slate-800/50 p-6 flex flex-col gap-6 overflow-y-auto">
                    <section>
                        <h3 className="flex items-center gap-2 text-indigo-400 font-bold mb-4 uppercase tracking-wider text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Lærernotater (Dybde)
                        </h3>
                        <div className="bg-slate-900 rounded-xl p-6 border border-white/5 leading-relaxed text-xl text-slate-200">
                            {currentSlide.teacherNotes ? (
                                currentSlide.teacherNotes.split('\n\n').map((p, i) => (
                                    <p key={i} className="mb-4">{p}</p>
                                ))
                            ) : (
                                <span className="text-slate-500 italic">Ingen spesifikke notater for denne sliden.</span>
                            )}
                        </div>
                    </section>

                    {currentSlide.talkingPoints && currentSlide.talkingPoints.length > 0 && (
                        <section>
                            <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm">
                                <Library className="w-4 h-4" />
                                Diskusjonspunkter
                            </h3>
                            <ul className="space-y-4">
                                {currentSlide.talkingPoints.map((tp, i) => (
                                    <li key={i} className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 text-emerald-100">
                                        {tp}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
