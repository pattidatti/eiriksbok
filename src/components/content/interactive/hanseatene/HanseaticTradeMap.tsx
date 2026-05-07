import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheat, Anchor, MapPin, Navigation } from 'lucide-react';

interface City {
    id: string;
    name: string;
    x: number;
    y: number; // Percentage based on 1024x1024 assumption
    role: string;
    exports: string[];
    imports: string[];
}

const cities: City[] = [
    { id: 'bergen', name: 'Bergen', x: 29, y: 53, role: 'Kontor', exports: ['Tørrfisk', 'Tran'], imports: ['Korn', 'Mel', 'Malt'] },
    { id: 'lubeck', name: 'Lübeck', x: 44, y: 76, role: 'Hovedstad', exports: ['Salt', 'Ledelse'], imports: ['Tørrfisk', 'Pels', 'Honning'] },
    { id: 'london', name: 'London', x: 21, y: 75, role: 'Kontor (Steelyard)', exports: ['Ull', 'Tekstiler'], imports: ['Tømmer', 'Voks'] },
    { id: 'brugge', name: 'Brugge', x: 24, y: 82, role: 'Kontor', exports: ['Klær', 'Finans'], imports: ['Ull', 'Metall'] },
    { id: 'novgorod', name: 'Novgorod', x: 78, y: 52, role: 'Kontor (Petershof)', exports: ['Pels', 'Voks'], imports: ['Sølv', 'Salt', 'Klær'] },
    { id: 'hamburg', name: 'Hamburg', x: 33, y: 80, role: 'Hansaby', exports: ['Øl'], imports: ['Fisk'] },
];

export const HanseaticTradeMap: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // SVG Routes logic could be complex, for now we draw straight lines to Lübeck (the hub)
    // In a real map, these would be proper curved coordinate paths
    const getLines = () => {
        const hub = cities.find(c => c.id === 'lubeck');
        if (!hub) return null;

        return cities.map(city => {
            if (city.id === 'lubeck') return null;

            const isSelected = selectedCity?.id === city.id || selectedCity?.id === 'lubeck';

            return (
                <motion.line
                    key={city.id}
                    x1={`${city.x}%`}
                    y1={`${city.y}%`}
                    x2={`${hub.x}%`}
                    y2={`${hub.y}%`}
                    stroke={isSelected ? "#b71c1c" : "#5d4037"}
                    strokeWidth={isSelected ? "3" : "1"}
                    strokeDasharray={isSelected ? "none" : "5 5"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: isSelected ? 1 : 0.3 }}
                    transition={{ duration: 1.5 }}
                />
            );
        });
    };

    return (
        <div className="my-16 max-w-6xl mx-auto font-serif">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Navigation className="w-6 h-6 text-indigo-700" /> Hansa-nettverket
            </h3>

            <div className="relative h-[600px] md:h-[700px] bg-[#e3ded1] rounded-xl overflow-hidden shadow-2xl border-8 border-[#2d241e]">
                {/* Scaled Wrapper for Zoom */}
                <div className="absolute inset-0 w-full h-full transform scale-150 origin-[50%_75%] transition-transform duration-700">
                    {/* Background Map */}
                    <img
                        src="/images/textures/northern-europe-map-bg.webp"
                        alt="Vintage Map of Northern Europe"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
                    />

                    {/* SVG Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {getLines()}
                    </svg>

                    {/* Cities */}
                    <div className="absolute inset-0">
                        {cities.map(city => (
                            <button
                                key={city.id}
                                onClick={() => setSelectedCity(city)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                            >
                                <div className={`
                                    w-4 h-4 rounded-full border-2 transition-all duration-300 relative z-10
                                    ${selectedCity?.id === city.id ? 'bg-red-600 border-white scale-100 shadow-lg' : 'bg-[#5d4037] border-[#d7ccc8] hover:scale-90'}
                                `}>
                                    {/* Pulse Effect */}
                                    {selectedCity?.id === city.id && (
                                        <span className="absolute -inset-2 rounded-full bg-red-500 opacity-30 animate-ping"></span>
                                    )}
                                </div>
                                <span className={`
                                    absolute mt-2 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap transition-colors scale-75 origin-top
                                    ${selectedCity?.id === city.id ? 'text-red-900' : 'text-[#3e2723]'}
                                `}>
                                    {city.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <AnimatePresence>
                    {selectedCity && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="absolute top-4 right-4 w-64 bg-[#fdfbf7] p-6 rounded shadow-xl border border-[#d7ccc8] z-20"
                        >
                            <button onClick={() => setSelectedCity(null)} className="absolute top-2 right-2 text-[#8d6e63] hover:text-[#3e2723]">×</button>

                            <h4 className="text-xl font-bold text-[#3e2723] mb-1">{selectedCity.name}</h4>
                            <div className="text-xs uppercase font-bold text-[#8d6e63] border-b border-[#d7ccc8] pb-2 mb-4">{selectedCity.role}</div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#5d4037] mb-1">
                                        <Anchor className="w-4 h-4" /> Eksport (Ut)
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedCity.exports.map(item => (
                                            <span key={item} className="text-xs bg-[#efebe9] text-[#5d4037] px-2 py-1 rounded">{item}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#5d4037] mb-1">
                                        <Wheat className="w-4 h-4" /> Import (Inn)
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedCity.imports.map(item => (
                                            <span key={item} className="text-xs bg-[#efebe9] text-[#5d4037] px-2 py-1 rounded">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Default Legend */}
                {!selectedCity && (
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded border border-stone-300 shadow-sm text-xs font-mono text-stone-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-700" /> Velg en by for å se handel
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
