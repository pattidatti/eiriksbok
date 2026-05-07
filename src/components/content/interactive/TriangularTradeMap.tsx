import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Users, Package, ArrowRight, Info } from 'lucide-react';

export const TriangularTradeMap: React.FC = () => {
    const [activeLeg, setActiveLeg] = useState<number | null>(null);

    const legs = [
        {
            id: 0,
            from: "Europa",
            to: "Afrika",
            goods: "Våpen, Tekstiler, Brennevin",
            icon: <Anchor className="w-5 h-5 text-indigo-700" />,
            path: "M 700 200 Q 600 350 650 600",
            color: "#b91c1c", // Red-700
            description: "Skipene forlater europeiske havner lastet med ferdigvarer."
        },
        {
            id: 1,
            from: "Afrika",
            to: "Amerika",
            goods: "Enslaved Mennesker",
            icon: <Users className="w-5 h-5 text-indigo-700" />,
            path: "M 650 600 Q 450 700 250 500", // West Africa -> Brazil/Caribbean
            color: "#b91c1c",
            description: "Midtpassasjen: Den brutale overfarten."
        },
        {
            id: 2,
            from: "Amerika",
            to: "Europa",
            goods: "Sukker, Bomull, Tobakk",
            icon: <Package className="w-5 h-5 text-indigo-700" />,
            path: "M 250 500 Q 400 300 700 200", // Americas -> Europe
            color: "#b91c1c",
            description: "Råvarer fraktes tilbake for å foredle industrien."
        }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto my-12 font-serif">
            <div className="relative bg-[#f5f5f0] rounded-lg overflow-hidden shadow-xl border-4 border-double border-stone-300 aspect-[4/3] group">
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/images/textures/vintage-paper.webp')]"></div>

                {/* Vintage Vignette */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(139,69,19,0.15)]"></div>

                {/* High Fidelity Map Background */}
                <img
                    src="/images/textures/atlantic-map-bg.webp"
                    alt="Vintage Map of the Atlantic"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply pointer-events-none"
                />

                {/* Map Title - Old Style */}
                <div className="absolute top-6 left-6 z-20 bg-[#f5f5f0]/90 backdrop-blur-sm p-4 border border-stone-300 shadow-sm max-w-xs">
                    <h3 className="text-2xl font-bold text-stone-800 tracking-tight font-serif uppercase border-b-2 border-stone-800 pb-2 mb-2">
                        Trekant-Handelen
                    </h3>
                    <p className="text-stone-600 text-sm italic">
                        Et system av profitt og lidelse (ca. 1600-1800)
                    </p>
                </div>

                {/* Interactive Routes Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-auto" viewBox="0 0 1024 1024" preserveAspectRatio="none">
                    {/* 
                        Coordinate System Estimate for 1024x1024 Map:
                        Europe (UK/France/Spain): ~650, 150
                        West Africa (Gold Coast): ~650, 500
                        Caribbean/Americas: ~250, 450
                        North America (Colonies): ~250, 250
                     */}
                    {legs.map((leg, index) => {
                        const isActive = activeLeg === index;
                        const isHovered = activeLeg !== null;

                        return (
                            <g key={leg.id}
                                onMouseEnter={() => setActiveLeg(index)}
                                onMouseLeave={() => setActiveLeg(null)}
                                className="cursor-pointer transition-opacity duration-300"
                                style={{ opacity: isHovered && !isActive ? 0.3 : 1 }}
                            >
                                {/* Glow effect for active route */}
                                {isActive && (
                                    <motion.path
                                        d={leg.path}
                                        fill="none"
                                        stroke={leg.color}
                                        strokeWidth="8"
                                        strokeOpacity="0.2"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />
                                )}

                                {/* Main Path */}
                                <motion.path
                                    d={leg.path}
                                    fill="none"
                                    stroke={isActive ? leg.color : "#78350f"} // Red active, Dark Wood/Ink inactive
                                    strokeWidth={isActive ? "3" : "2"}
                                    strokeDasharray={isActive ? "none" : "8 4"}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />

                                {/* Moving Ship/Marker */}
                                <circle r="5" fill={isActive ? leg.color : "#78350f"}>
                                    <animateMotion dur="6s" repeatCount="indefinite" path={leg.path}>
                                        <mpath href={`#path-${index}`} />
                                    </animateMotion>
                                </circle>

                                {/* Click Area (Wide transparent stroke) */}
                                <path
                                    d={leg.path}
                                    stroke="rgba(255,0,0,0.0)" // Invisible but clickable
                                    strokeWidth="60" // Very wide hit area
                                    fill="none"
                                    className="pointer-events-auto cursor-pointer"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Info Overlay / Tooltip */}
                <AnimatePresence>
                    {activeLeg !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 right-6 z-30 w-80"
                        >
                            <div className="bg-white/95 backdrop-blur-md border border-stone-200 p-5 rounded-sm shadow-xl">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-100">
                                    <div className="p-2 bg-stone-100 rounded-full">
                                        {legs[activeLeg].icon}
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-stone-400 font-bold">Rute {activeLeg + 1}</div>
                                        <div className="font-bold text-stone-800 flex items-center gap-2">
                                            {legs[activeLeg].from} <ArrowRight className="w-4 h-4" /> {legs[activeLeg].to}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-stone-500 font-semibold uppercase">Last:</span>
                                        <p className="text-red-800 font-medium font-serif italic text-lg">{legs[activeLeg].goods}</p>
                                    </div>
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                        {legs[activeLeg].description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend/Helper */}
                {activeLeg === null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-6 right-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-stone-200 text-xs text-stone-500 flex items-center gap-2 shadow-sm"
                    >
                        <Info className="w-4 h-4" />
                        Hold over rutene for detaljer
                    </motion.div>
                )}
            </div>
        </div>
    );
};
