import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Wave {
    id: string;
    year: string;
    title: string;
    description: string;
    color: string;
    regions: string[]; // List of region names or codes to highlight
}

const WAVES: Wave[] = [
    {
        id: 'wave1',
        year: '1776 - 1830',
        title: 'Bølge 1: Den Atlantiske Revolusjon',
        description: 'Inspirert av opplysningstiden løsriver Amerikaene seg. Først USA, deretter Haiti og Latin-Amerika. Det gamle kolonisystemet i vest kollapser.',
        color: '#ef4444', // Red-500
        regions: ['North America', 'South America']
    },
    {
        id: 'wave2',
        year: '1918 - 1955',
        title: 'Bølge 2: Asia Våkner',
        description: 'Etter to verdenskriger og Japans fremmarsj, krever Asia sin frihet. India, Midtøsten og Sørøst-Asia kaster europeerne på dør.',
        color: '#f59e0b', // Amber-500
        regions: ['Middle East', 'South Asia', 'Southeast Asia']
    },
    {
        id: 'wave3',
        year: '1957 - 1994',
        title: 'Bølge 3: Afrikas Frihet',
        description: 'Vindens forandring blåser over Afrika. Fra Ghanas fredelige uavhengighet til blodige kriger i Algerie og Angola. Til slutt faller Apartheid.',
        color: '#10b981', // Emerald-500
        regions: ['Africa']
    }
];

export const WaveMap: React.FC = () => {
    const [activeWaveId, setActiveWaveId] = useState<string | null>(null);

    const activeWave = WAVES.find(w => w.id === activeWaveId);

    return (
        <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-xl shadow-lg border-2 border-stone-200 overflow-hidden my-8">
            <div className="p-6 border-b border-stone-200 bg-stone-100 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-stone-800">Dekoloniseringens Tre Bølger</h2>
                <div className="text-sm text-stone-500 italic">Utforsk kartet</div>
            </div>

            <div className="relative aspect-video w-full bg-[#e6ddd0] p-4 group perspective-1000">
                {/* Abstract Map Background */}
                <svg className="w-full h-full opacity-30" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M150,120 Q120,100 100,150 T50,200 T150,350 T250,250 T200,150" fill="#d6c7b0" stroke="none" /> {/* Americas */}
                    <path d="M450,100 Q400,150 420,250 T500,350 T600,250 T550,150 T500,100" fill="#d6c7b0" stroke="none" /> {/* Africa */}
                    <path d="M550,80 Q600,50 700,100 T850,200 T800,300 T700,250 T600,150" fill="#d6c7b0" stroke="none" /> {/* Asia */}
                    <path d="M800,350 Q850,350 900,400 T850,450 T750,400" fill="#d6c7b0" stroke="none" /> {/* Oceania */}
                    <path d="M400,50 Q450,20 500,50 T480,100 T420,80" fill="#d6c7b0" stroke="none" /> {/* Europe */}
                </svg>

                {/* Interactive Highlight Zones (Simplified Geometric overlays) */}
                <AnimatePresence>
                    {activeWaveId === 'wave1' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-[20%] left-[10%] w-[20%] h-[50%] bg-red-600/30 blur-xl rounded-full mix-blend-multiply"
                        />
                    )}
                    {activeWaveId === 'wave2' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-[15%] left-[55%] w-[30%] h-[40%] bg-amber-600/30 blur-xl rounded-full mix-blend-multiply"
                        />
                    )}
                    {activeWaveId === 'wave3' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-[35%] left-[40%] w-[20%] h-[45%] bg-emerald-600/30 blur-xl rounded-full mix-blend-multiply"
                        />
                    )}
                </AnimatePresence>

                {/* Wave Markers / Info Panel */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row gap-4 justify-center items-end">
                    {WAVES.map((wave) => (
                        <motion.button
                            key={wave.id}
                            onClick={() => setActiveWaveId(activeWaveId === wave.id ? null : wave.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                flex-1 p-4 rounded-lg border-2 transition-all duration-300 text-left shadow-md
                                ${activeWaveId === wave.id
                                    ? 'bg-white border-current translate-y-[-10px]'
                                    : 'bg-white/80 border-transparent hover:bg-white'}
                            `}
                            style={{ borderColor: activeWaveId === wave.id ? wave.color : 'transparent' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wave.color }} />
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{wave.year}</span>
                            </div>
                            <div className="font-serif font-bold text-lg text-stone-800 leading-tight">{wave.title}</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence mode='wait'>
                {activeWave && (
                    <motion.div
                        key={activeWave.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-stone-800 text-stone-100 overflow-hidden"
                    >
                        <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-serif font-bold" style={{ color: activeWave.color }}>{activeWave.title}</h3>
                                <p className="text-lg text-stone-300 leading-relaxed">{activeWave.description}</p>
                            </div>
                            <div className="flex-1/3">
                                <motion.div
                                    className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl"
                                    style={{ borderColor: activeWave.color, color: activeWave.color }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    🌊
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
