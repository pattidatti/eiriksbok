
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TankInterior: React.FC = () => {
    const [activeSpot, setActiveSpot] = useState<string | null>(null);

    const hotspots = [
        {
            id: 'engine',
            label: 'Motoren',
            x: 50,
            y: 50,
            info: '105 hk Daimler-motor. Den sto midt i rommet uten skjerming. Temperaturen nådde ofte 50°C, og eksoslekkasjer forgiftet mannskapet.',
        },
        {
            id: 'guns',
            label: '6-punds Kanon',
            x: 20,
            y: 45,
            info: 'Plassert i "sponsons" på sidene. Skytterne måtte jobbe i stummende mørke og infernalsk støy. Hylsene brant ofte hendene deres.',
        },
        {
            id: 'steering',
            label: 'Styring',
            x: 80,
            y: 60,
            info: 'Krevde fire mann for å svinge! Kommandøren måtte slå på motorpanseres med en skiftenøkkel for å gi signaler i bråket.',
        },
        {
            id: 'tracks',
            label: 'Beltene',
            x: 50,
            y: 85,
            info: 'Gikk rundt hele skroget. De var primitive og røk ofte. Hvis et belte røk i ingenmannsland, var stridsvognen en enkel skyteskive for artilleri.',
        }
    ];

    return (
        <div className="w-full my-12 font-sans">
            <div className="bg-[#1a1a1a] p-1 rounded-lg shadow-2xl overflow-hidden border border-stone-700 relative">
                {/* Blueprint Grid Overlay */}
                <div style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} className="absolute inset-0 opacity-30 pointer-events-none" />

                {/* Header */}
                <div className="bg-[#222] p-4 flex justify-between items-center border-b border-stone-600 relative z-10">
                    <h3 className="text-stone-300 font-mono tracking-widest text-sm uppercase">Mark I - Technical Schematic</h3>
                    <span className="text-stone-500 text-xs">Fig. 1916-A</span>
                </div>

                {/* Main Viewport */}
                <div className="relative aspect-[16/9] bg-[#111] overflow-hidden">
                    {/* Simple SVG Representation of Mark I Tank (Rhomboid shape) */}
                    <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-lg" style={{ filter: 'sepia(0.2)' }}>
                        {/* Tracks / Hull Outline */}
                        <path
                            d="M10,25 L20,10 L80,10 L95,45 L80,55 L20,55 L10,25 Z"
                            fill="none"
                            stroke="#4a4a4a"
                            strokeWidth="0.5"
                            strokeDasharray="1 1"
                        />
                        <path
                            d="M12,25 L22,12 L78,12 L93,45 L78,53 L22,53 L12,25 Z"
                            fill="#2a2a2a"
                            stroke="#555"
                            strokeWidth="0.8"
                        />

                        {/* Sponson (Gun mount) */}
                        <rect x="18" y="25" width="10" height="15" fill="#333" stroke="#666" strokeWidth="0.5" />
                        <line x1="18" y1="32" x2="10" y2="32" stroke="#444" strokeWidth="2" /> {/* Gun barrel */}

                        {/* Engine Block */}
                        <rect x="45" y="25" width="15" height="15" fill="#3a2e2e" stroke="#522" strokeWidth="0.5" />

                        {/* Rear Steering Tail (historical accuracy detail) */}
                        <path d="M10,40 L5,45 L5,50" stroke="#333" strokeWidth="1" fill="none" opacity="0.5" />

                        {/* Internal mechanical details (cosmetic lines) */}
                        <path d="M45,30 L60,30 M45,35 L60,35" stroke="#4a3e3e" strokeWidth="0.2" />
                    </svg>

                    {/* Hotspots */}
                    {hotspots.map((spot) => (
                        <motion.button
                            key={spot.id}
                            className="absolute w-6 h-6 -ml-3 -mt-3 z-20 flex items-center justify-center focus:outline-none group"
                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                            onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <span className="absolute w-full h-full rounded-full bg-amber-500/30 animate-ping" />
                            <span className="relative w-3 h-3 rounded-full bg-amber-500 border border-amber-200 group-hover:bg-amber-400 transition-colors" />
                        </motion.button>
                    ))}

                    {/* Info Overlay */}
                    <AnimatePresence>
                        {activeSpot && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute top-4 right-4 max-w-xs bg-black/80 backdrop-blur-md border-l-2 border-amber-500 p-4 text-stone-200 z-30 shadow-2xl"
                            >
                                <h4 className="text-amber-500 font-bold uppercase tracking-wider mb-2 text-sm">
                                    {hotspots.find(s => s.id === activeSpot)?.label}
                                </h4>
                                <p className="text-sm leading-relaxed font-mono text-stone-300">
                                    {hotspots.find(s => s.id === activeSpot)?.info}
                                </p>
                                <button
                                    className="absolute top-2 right-2 text-stone-500 hover:text-white"
                                    onClick={() => setActiveSpot(null)}
                                >✕</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Atmos: Heat Haze / Scanlines */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                            backgroundSize: '100% 2px, 3px 100%'
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="bg-[#1a1a1a] p-3 text-center border-t border-stone-800">
                    <p className="text-stone-500 text-xs italic">
                        Mannskapet delte rom med motoren. Larmen var så høy at kommunikasjon var umulig.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TankInterior;
