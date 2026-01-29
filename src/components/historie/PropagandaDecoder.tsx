import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Eye, Info } from 'lucide-react';

const HOTSPOTS = [
    {
        id: 'father',
        x: 65, // Percentage from left
        y: 25, // Percentage from top
        title: "Faren (The Father)",
        description: "Legg merke til det tomme, skamfulle blikket. Han ser ikke på datteren, men stirrer 'ut i fremtiden' med uro. Plakaten antyder at han vet han sviktet sin plikt ved ikke å verve seg."
    },
    {
        id: 'daughter',
        x: 48,
        y: 35,
        title: "Datteren (The Daughter)",
        description: "Barnets uskyldige spørsmål er et kalkulert angrep. Det bruker 'emosjonell utpressing' for å få menn til å verve seg av frykt for at barna skal skamme seg over dem i fremtiden."
    },
    {
        id: 'son',
        x: 30,
        y: 75,
        title: "Sønnen (The Son)",
        description: "Sønnen leker krig på gulvet med tinnsoldater. Budskapet er at kamp er en naturlig, maskulin arv. Hvis faren ikke kjemper nå, svikter han sitt forbildeansvar."
    },
    {
        id: 'comfort',
        x: 80,
        y: 50,
        title: "Lenestolen (Komfort)",
        description: "Den varme, trygge stuen settes i sterk kontrast til skyttergravenes gjørme og kulde. Budskapet er anklagende: 'Har du rett til å sitte her og ha det godt mens andre dør for deg?'"
    }
];

export const PropagandaDecoder: React.FC = () => {
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    return (
        <div className="my-12 max-w-4xl mx-auto font-sans">
            <div className="bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-700">

                {/* Header */}
                <div className="bg-stone-800 p-4 border-b border-stone-700 flex justify-between items-center">
                    <h3 className="text-stone-100 font-bold flex items-center gap-2">
                        <Scan className="text-cyan-400" size={20} />
                        Propaganda-dekoder: "Daddy, what did YOU do...?"
                    </h3>
                    <span className="text-xs uppercase tracking-widest text-cyan-400/80 animate-pulse border border-cyan-400/30 px-2 py-1 rounded">
                        Analysemodus aktiv
                    </span>
                </div>

                <div className="grid md:grid-cols-2">

                    {/* Image Area */}
                    <div className="relative group bg-black overflow-hidden aspect-[2/3] md:aspect-auto">
                        <img
                            src="/images/historie/forste-verdenskrig/propaganda_daddy_web.jpg"
                            alt="Propaganda poster"
                            className="w-full h-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-40"
                        />

                        {/* Scan Line Animation (Idle) */}
                        {!activeHotspot && (
                            <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        )}

                        {/* Hotspots */}
                        {HOTSPOTS.map((hotspot) => (
                            <motion.button
                                key={hotspot.id}
                                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center z-20 backdrop-blur-sm transition-all duration-300
                   ${activeHotspot === hotspot.id ? 'bg-cyan-500/20 border-cyan-400 scale-125' : 'bg-white/10 border-white/40 hover:bg-cyan-400/20 hover:border-cyan-400'}
                 `}
                                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                                whileHover={{ scale: 1.2 }}
                            >
                                {activeHotspot === hotspot.id ? (
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />
                                ) : (
                                    <Eye size={20} className="text-white drop-shadow-md" />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Analysis Panel */}
                    <div className="p-6 md:p-8 bg-stone-900 flex flex-col justify-center relative">
                        <AnimatePresence mode="wait">
                            {activeHotspot ? (
                                <motion.div
                                    key={activeHotspot}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h4 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-3">
                                        <Info size={24} />
                                        {HOTSPOTS.find(h => h.id === activeHotspot)?.title}
                                    </h4>
                                    <p className="text-stone-300 text-lg leading-relaxed border-l-4 border-stone-700 pl-4 py-2">
                                        {HOTSPOTS.find(h => h.id === activeHotspot)?.description}
                                    </p>
                                    <div className="mt-8 text-stone-500 text-sm italic">
                                        Psykologisk virkemiddel:
                                        <span className="text-stone-400 not-italic ml-2 font-semibold">
                                            {activeHotspot === 'daughter' ? 'Emosjonell utpressing' :
                                                activeHotspot === 'father' ? 'Skam og sosialt press' :
                                                    activeHotspot === 'son' ? 'Maskulin plikt' : 'Klasse/Kontrast'}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center text-stone-500"
                                >
                                    <Scan size={64} className="mx-auto mb-6 opacity-20" />
                                    <h4 className="text-xl font-medium text-stone-400 mb-2">Start analysen</h4>
                                    <p className="max-w-xs mx-auto">
                                        Hold musen over eller klikk på de markerte punktene i bildet for å avsløre propagandateknikkene.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};
