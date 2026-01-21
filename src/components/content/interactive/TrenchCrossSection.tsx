
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrenchCrossSection: React.FC = () => {
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    const hotspots = [
        {
            id: 'firestep',
            label: 'Ildtrinnet',
            x: 35,
            y: 45,
            description: 'En forhøyning der soldatene sto for å skyte over parapeten. Resten av tiden oppholdt de seg lavere for å unngå snikskyttere.',
        },
        {
            id: 'dugout',
            label: 'Dekningsrom',
            x: 60,
            y: 70,
            description: 'Huler gravd dypt inn i jorden for å gi beskyttelse mot artilleri. Her hvilte soldatene, ofte sammen med rotter og luseplager.',
        },
        {
            id: 'nomanland',
            label: 'Ingenmannsland',
            x: 10,
            y: 30,
            description: 'Området mellom frontlinjene. Dekket av piggtråd, kratere og udetonerte granater. Å krysse her var ofte en dødsdom.',
        },
        {
            id: 'duckboards',
            label: 'Lemmer',
            x: 40,
            y: 85,
            description: 'Treplanker lagt i bunnen av skyttergraven for å holde soldatene tørre. Gjørmen var likevel en konstant fiende som ga "skyttergravsfot".',
        },
    ];

    return (
        <div className="w-full my-12 font-sans">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 font-serif">
                Tverrsnitt av en Skyttergrav
            </h3>
            <div className="relative w-full aspect-[16/9] bg-[#fdfbf7] dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-inner border border-stone-300 dark:border-stone-700">
                {/* Sky / Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-300 to-stone-400 dark:from-slate-800 dark:to-stone-800 opacity-50" />

                {/* SVG Drawing */}
                <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ filter: 'contrast(1.1) sepia(0.2)' }}
                >
                    {/* Ground Surface */}
                    <path
                        d="M0,35 Q20,34 30,30 L32,30 L32,50 L45,50 L45,90 L65,90 L65,60 L90,60 L100,55 L100,100 L0,100 Z"
                        fill="#5d5045"
                        stroke="#3e342e"
                        strokeWidth="0.5"
                        className="text-stone-700 dark:text-stone-800 fill-current"
                    />

                    {/* Parapet (Sandbags) */}
                    <rect x="28" y="25" width="5" height="5" rx="1" fill="#d1c4b7" stroke="#8b7e74" strokeWidth="0.2" />
                    <rect x="26" y="28" width="5" height="5" rx="1" fill="#c7baa8" stroke="#8b7e74" strokeWidth="0.2" />

                    {/* Barbed Wire (Abstract) */}
                    <path d="M5,30 L15,32 M8,28 L12,34 M2,31 L6,31" stroke="#222" strokeWidth="0.3" fill="none" />

                    {/* Fire Step */}
                    <rect x="32" y="50" width="13" height="40" fill="#6b5b4e" className="opacity-50" />

                    {/* Duckboards */}
                    <path d="M35,90 L60,90" stroke="#5c4d42" strokeWidth="2" strokeDasharray="2 1" />

                    {/* Dugout Entry */}
                    <rect x="65" y="60" width="25" height="30" fill="#2a231e" />
                    <text x="70" y="75" fontSize="3" fill="#665" fontFamily="monospace">BUNKER</text>
                </svg>

                {/* Hotspots Layer */}
                {hotspots.map((spot) => (
                    <motion.button
                        key={spot.id}
                        className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20 
              ${activeHotspot === spot.id ? 'bg-amber-500 scale-110' : 'bg-stone-600 hover:bg-amber-400'}
              transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400`}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                        whileHover={{ scale: 1.2 }}
                        aria-label={`Les mer om ${spot.label}`}
                    >
                        <span className="text-white text-xs font-bold font-serif">i</span>
                    </motion.button>
                ))}

                {/* Tooltip Overlay */}
                <AnimatePresence>
                    {activeHotspot && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-30 max-w-xs p-4 rounded-xl backdrop-blur-md bg-white/90 dark:bg-black/90 shadow-2xl border border-amber-200/50 dark:border-amber-900/50 text-left"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)', // Centered for simplicity, could be dynamic
                                marginLeft: '-10rem', // approximate centering fix with framer transform overlap
                                marginTop: '-4rem'
                            }}
                        >
                            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-2 font-serif">
                                {hotspots.find((h) => h.id === activeHotspot)?.label}
                            </h4>
                            <p className="text-sm text-stone-800 dark:text-stone-300 leading-relaxed font-sans">
                                {hotspots.find((h) => h.id === activeHotspot)?.description}
                            </p>
                            <button
                                onClick={() => setActiveHotspot(null)}
                                className="absolute top-2 right-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-lg" />
            </div>
            <p className="text-center text-xs text-stone-500 mt-2 italic">
                Klikk på punktene for å utforske skyttergravens anatomi.
            </p>
        </div>
    );
};

export default TrenchCrossSection;
