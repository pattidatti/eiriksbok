import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Zap, RefreshCw, ArrowRightCircle } from 'lucide-react';

interface Part {
    label: string;
    description: string;
}

interface Whole {
    title: string;
    description: string;
}

interface HermeneuticCircleProps {
    parts: Part[];
    whole: Whole;
}

export const HermeneuticCircle: React.FC<HermeneuticCircleProps> = ({ parts, whole }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isWholeActive, setIsWholeActive] = useState(false);

    return (
        <div className="w-full max-w-3xl mx-auto my-8 font-sans px-4">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-800 mb-1">Den Hermeneutiske Sirkel</h3>
                <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Interaktiv tolkningsmodell</p>
            </div>

            <div className="relative h-[320px] md:h-[360px] flex items-center justify-center overflow-visible">
                {/* Visual Circular Flow (Background) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Main Flow Ring */}
                    <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
                        {/* Circular Dash Path */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                            <motion.circle
                                cx="200"
                                cy="200"
                                r="140"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="1.5"
                                strokeDasharray="8,12"
                                strokeOpacity="0.15"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Directional Arrows on the circle */}
                            {[0, 90, 180, 270].map((angle, i) => (
                                <g key={i} transform={`rotate(${angle} 200 200)`}>
                                    <motion.path
                                        d="M 200 60 L 206 68 M 200 60 L 194 68"
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeOpacity="0.3"
                                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.75 }}
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Orbiting Parts */}
                        {parts.map((part, i) => {
                            const angle = (i * (360 / parts.length) - 90) * (Math.PI / 180);
                            const r = 140; // Matched with circle r
                            const x = r * Math.cos(angle);
                            const y = r * Math.sin(angle);
                            const isActive = activeIndex === i;

                            return (
                                <motion.button
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        left: `calc(50% + ${x}px)`,
                                        top: `calc(50% + ${y}px)`
                                    }}
                                    transition={{ type: "spring", damping: 15, stiffness: 100, delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => {
                                        setActiveIndex(isActive ? null : i);
                                        setIsWholeActive(false);
                                    }}
                                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-center p-3 transition-all duration-500 shadow-lg border ${isActive
                                        ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-50'
                                        : 'bg-white border-indigo-50 text-slate-600 hover:border-indigo-200'}`}
                                >
                                    <div className={`mb-0.5 transition-colors ${isActive ? 'text-white' : 'text-indigo-500'}`}>
                                        {i === 0 ? <Search size={16} /> : i === 1 ? <Zap size={16} /> : <RefreshCw size={16} />}
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide leading-tight px-1">
                                        {part.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Central Whole */}
                <motion.button
                    onClick={() => {
                        setIsWholeActive(!isWholeActive);
                        setActiveIndex(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-20 w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-center p-6 transition-all duration-700 shadow-xl overflow-hidden ${isWholeActive
                        ? 'bg-indigo-900 text-white ring-4 md:ring-8 ring-indigo-50'
                        : 'bg-white text-indigo-950 border-2 md:border-4 border-indigo-50 hover:border-indigo-200'}`}
                >
                    {/* Animated background for active state */}
                    <AnimatePresence>
                        {isWholeActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-indigo-600 animate-pulse"
                            />
                        )}
                    </AnimatePresence>

                    <BookOpen size={28} className={`mb-2 transition-transform duration-500 ${isWholeActive ? 'scale-110 text-indigo-200' : 'text-indigo-700'}`} />
                    <span className="font-display font-bold text-sm md:text-base leading-tight tracking-tight uppercase">
                        {whole.title}
                    </span>
                    <span className="text-[8px] font-bold opacity-40 mt-1 uppercase tracking-widest">Klikk her</span>
                </motion.button>
            </div>

            {/* Content Display (Tighter) */}
            <div className="mt-8 min-h-[140px] relative">
                <AnimatePresence mode="wait">
                    {activeIndex !== null && (
                        <motion.div
                            key={`part-${activeIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-3xl p-6 md:p-8 border border-indigo-50 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                            <div className="flex flex-row items-start gap-4 md:gap-6">
                                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                                    {activeIndex === 0 ? <Search size={24} /> : activeIndex === 1 ? <Zap size={24} /> : <RefreshCw size={24} />}
                                </div>
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{parts[activeIndex].label}</h4>
                                        <div className="w-4 h-[1px] bg-indigo-100" />
                                    </div>
                                    <p className="text-lg md:text-xl text-slate-800 leading-snug font-display font-bold">
                                        {parts[activeIndex].description}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium pt-1">
                                        <ArrowRightCircle size={14} className="text-indigo-300" />
                                        <span>Dette hjelper deg å se helheten.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isWholeActive && (
                        <motion.div
                            key="whole-content"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                        >
                            <motion.div
                                className="absolute -top-20 -right-20 p-8 opacity-[0.03]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw size={300} />
                            </motion.div>

                            <div className="flex flex-row items-start gap-4 md:gap-6 relative z-10">
                                <div className="p-4 bg-white/5 rounded-2xl text-indigo-300 ring-1 ring-white/10 shrink-0">
                                    <BookOpen size={24} />
                                </div>
                                <div className="space-y-2 text-left">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{whole.title}</h4>
                                    <p className="text-xl md:text-2xl font-display font-bold leading-tight">
                                        {whole.description}
                                    </p>
                                    <p className="text-indigo-200/50 text-xs md:text-sm leading-relaxed italic pt-1">
                                        "Når vi forstår denne helheten, ser vi på hver enkelt del med nye øyne."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeIndex === null && !isWholeActive && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-slate-100 rounded-3xl bg-slate-50/20"
                        >
                            <div className="relative mb-6">
                                <RefreshCw size={44} className="opacity-10 animate-spin-slow" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Search size={16} className="opacity-20 translate-x-1 translate-y-1" />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-0.5">Klar for å tolke?</p>
                            <p className="text-[11px] font-medium tracking-wide">Trykk på sirklene over for å se sammenhengen.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
