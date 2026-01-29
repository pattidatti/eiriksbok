import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Data ---

type ToneTags = {
    formality: number; // 0 (Slang) to 1 (Academic)
    warmth: number;    // 0 (Cold) to 1 (Intimate)
    power: number;     // 0 (Passive) to 1 (Active)
};

type ToneVariation = {
    id: string;
    text: string;
    tags: ToneTags;
};

// Scenario Data: "The Breakup"
const SCENARIO_DATA: ToneVariation[] = [
    // Low Formality (Slang/Casual)
    { id: 'l_l_l', text: "Det er over. Orker ikke mer.", tags: { formality: 0, warmth: 0, power: 0 } },
    { id: 'l_l_h', text: "Jeg dumper deg. Nå.", tags: { formality: 0, warmth: 0, power: 1 } },
    { id: 'l_h_l', text: "Pus, vi funker ikke lenger...", tags: { formality: 0, warmth: 1, power: 0 } },
    { id: 'l_h_h', text: "Vi må snakke. Dette går ikke.", tags: { formality: 0, warmth: 1, power: 1 } },

    // Medium Formality
    { id: 'm_l_l', text: "Forholdet vårt har nådd slutten.", tags: { formality: 0.5, warmth: 0.2, power: 0.5 } },
    { id: 'm_h_h', text: "Jeg tror det er best for oss begge om vi går videre.", tags: { formality: 0.5, warmth: 0.8, power: 0.8 } },

    // High Formality (Academic/Bureaucratic)
    { id: 'h_l_l', text: "Det meddeles herved at relasjonen opphører.", tags: { formality: 1, warmth: 0, power: 0.2 } },
    { id: 'h_l_h', text: "Jeg avslutter herved vår overenskomst med umiddelbar virkning.", tags: { formality: 1, warmth: 0, power: 1 } },
    { id: 'h_h_l', text: "Med tungt hjerte må jeg konkludere med at våre veier bør skilles.", tags: { formality: 1, warmth: 0.8, power: 0.4 } },
    { id: 'h_h_h', text: "Jeg tar ansvar for min egen lykke og velger å avslutte dette forholdet.", tags: { formality: 1, warmth: 0.8, power: 1 } },
];

// --- Components ---

const RetroSlider = ({
    label,
    value,
    onChange,
    color
}: {
    label: string,
    value: number,
    onChange: (v: number) => void,
    color: string
}) => {
    return (
        <div className="flex flex-col gap-1 w-full relative group">
            <div className="flex justify-between text-xs font-mono uppercase text-stone-500 tracking-widest mb-1">
                <span>-</span>
                <span className={`transition-colors ${value > 0.5 ? color : 'text-stone-500'}`}>{label}</span>
                <span>+</span>
            </div>
            <div className="relative h-6 w-full flex items-center cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onChange(v);
            }}>
                {/* Track */}
                <div className="absolute inset-x-0 h-1 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                    <motion.div
                        className={`h-full opacity-50 ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${value * 100}%` }}
                    />
                </div>
                {/* Thumb */}
                <motion.div
                    className={`absolute w-3 h-5 bg-stone-300 border border-stone-100 shadow-md rounded-sm z-10 ${color.replace('text-', 'shadow-')}/50`}
                    style={{ left: `${value * 100}%`, x: '-50%' }}
                    whileHover={{ scale: 1.2, backgroundColor: '#fff' }}
                    whileTap={{ scale: 0.9 }}
                />
            </div>
        </div>
    );
};

export const ToneTypewriter: React.FC = () => {
    const [sliders, setSliders] = useState<ToneTags>({
        formality: 0.5,
        warmth: 0.5,
        power: 0.5,
    });



    // Algorithm: Find closest text vector
    const activeVariation = useMemo(() => {
        let bestMatch = SCENARIO_DATA[0];
        let minDistance = Infinity;

        SCENARIO_DATA.forEach(variation => {
            const dist = Math.sqrt(
                Math.pow(variation.tags.formality - sliders.formality, 2) +
                Math.pow(variation.tags.warmth - sliders.warmth, 2) +
                Math.pow(variation.tags.power - sliders.power, 2)
            );
            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = variation;
            }
        });

        return bestMatch;
    }, [sliders]);

    // Typewriter effect trigger


    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 relative font-mono">

            {/* Holographic Controls Container */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/90 backdrop-blur-md border border-stone-700/50 p-6 rounded-xl shadow-2xl mb-8 border-t-4 border-t-cyan-500/50 relative overflow-hidden"
            >
                {/* Hologram Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-full w-full pointer-events-none animate-scan" style={{ backgroundSize: '100% 4px' }} />

                <div className="grid grid-cols-3 gap-8 relative z-10">
                    <RetroSlider
                        label="FORMALITET"
                        value={sliders.formality}
                        onChange={(v) => setSliders(p => ({ ...p, formality: v }))}
                        color="text-cyan-400"
                    />
                    <RetroSlider
                        label="VARME"
                        value={sliders.warmth}
                        onChange={(v) => setSliders(p => ({ ...p, warmth: v }))}
                        color="text-amber-400"
                    />
                    <RetroSlider
                        label="STYRKE"
                        value={sliders.power}
                        onChange={(v) => setSliders(p => ({ ...p, power: v }))}
                        color="text-red-400"
                    />
                </div>
            </motion.div>

            {/* The Typewriter Paper Area */}
            <div className="relative bg-[#fdfbf7] p-8 md:p-16 min-h-[400px] shadow-2xl rounded-sm border border-stone-200 mx-auto max-w-[95%]">
                {/* Watermark/Texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-noise" />

                <h3 className="text-stone-400 text-xs font-bold tracking-widest uppercase mb-8 border-b border-stone-200 pb-2">
                    UTKAST: BRUDDET
                </h3>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeVariation.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }} // Fast transition for responsiveness
                        className="font-serif text-3xl md:text-4xl text-stone-800 leading-snug"
                    >
                        "{activeVariation.text}"
                    </motion.div>
                </AnimatePresence>

                {/* Tags visualization */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded">
                        F: {activeVariation.tags.formality}
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded">
                        W: {activeVariation.tags.warmth}
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded">
                        P: {activeVariation.tags.power}
                    </span>
                </div>
            </div>

            {/* Decorative Typewriter Keys (Bottom) */}
            <div className="mt-8 flex justify-center gap-1 opacity-50 pointer-events-none">
                {[...'QWERTYUIOP'].map((char, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-stone-600 bg-stone-800 flex items-center justify-center text-stone-400 text-xs shadow-md">
                        {char}
                    </div>
                ))}
            </div>

        </div>
    );
};
