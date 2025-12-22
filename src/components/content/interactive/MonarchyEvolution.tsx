import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Landmark, ScrollText, ChevronRight, ChevronLeft } from 'lucide-react';

interface Era {
    id: 'absolute' | 'enlightened' | 'constitutional';
    title: string;
    year: string;
    quote: string;
    author: string;
    kingPower: number;
    peoplePower: number;
    description: string;
    role: string;
}

const eras: Era[] = [
    {
        id: 'absolute',
        title: "Det Absolutte Enevelde",
        year: "1600-tallet",
        quote: "L'État, c'est moi (Staten, det er meg).",
        author: "Ludvig 14. av Frankrike",
        kingPower: 100,
        peoplePower: 5,
        description: "Kongen er utpekt av Gud og står over loven. All makt er samlet i én person. Adelen er temmet, og folket er undersåtter uten politiske rettigheter.",
        role: "Guddommelig Hersker"
    },
    {
        id: 'enlightened',
        title: "Det Opplyste Enevelde",
        year: "1700-tallet",
        quote: "Kongen er statens fremste tjener.",
        author: "Fredrik 2. av Preussen",
        kingPower: 85,
        peoplePower: 25,
        description: "Kongen har fortsatt all makt, men bruker den til folkets beste. Han innfører reformer, skolegang og toleranse, men nekter å dele makten.",
        role: "Filosofkongen"
    },
    {
        id: 'constitutional',
        title: "Det Konstitusjonelle Monarki",
        year: "1800-tallet - i dag",
        quote: "Kongen regjerer, men styrer ikke.",
        author: "Konstitusjonelt prinsipp",
        kingPower: 15,
        peoplePower: 95,
        description: "Kongens makt er begrenset av en grunnlov. Makten ligger hos et folkevalgt parlament. Kongen blir et nasjonalt symbol uten politisk makt.",
        role: "Symbolsk Samlingspunkt"
    }
];

export const MonarchyEvolution: React.FC = () => {
    const [index, setIndex] = useState(0);
    const currentEra = eras[index];

    const nextEra = () => setIndex(prev => Math.min(eras.length - 1, prev + 1));
    const prevEra = () => setIndex(prev => Math.max(0, prev - 1));

    return (
        <div className="bg-slate-50 text-slate-800 p-8 md:p-12 rounded-3xl border border-slate-200 my-10 shadow-2xl relative overflow-hidden font-serif">
            {/* Royal Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
            />

            <div className="relative z-10">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Monarkiets Utvikling</h3>
                    <div className="flex justify-center items-center gap-4 text-slate-500 font-sans font-bold text-sm uppercase tracking-widest">
                        <button onClick={prevEra} disabled={index === 0} className="p-2 hover:text-slate-900 disabled:opacity-20 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <span>{currentEra.year}</span>
                        <button onClick={nextEra} disabled={index === eras.length - 1} className="p-2 hover:text-slate-900 disabled:opacity-20 transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                    {/* Visual Balance */}
                    <div className="relative h-64 flex justify-center items-center gap-4">
                        {/* King */}
                        <motion.div
                            animate={{ scale: 0.5 + (currentEra.kingPower / 100), opacity: 0.3 + (currentEra.kingPower / 140) }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className="bg-amber-100 p-8 rounded-full border-4 border-amber-400 text-amber-600 z-10 relative"
                        >
                            <Crown size={80} strokeWidth={1.5} />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-bold text-sm uppercase tracking-widest whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm border border-amber-100">
                                Kongen
                            </div>
                        </motion.div>

                        {/* Parliament / People */}
                        <motion.div
                            animate={{ scale: 0.5 + (currentEra.peoplePower / 100), opacity: 0.3 + (currentEra.peoplePower / 140) }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className="bg-blue-100 p-8 rounded-full border-4 border-blue-400 text-blue-600 relative"
                        >
                            <Landmark size={80} strokeWidth={1.5} />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-bold text-sm uppercase tracking-widest whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm border border-blue-100">
                                Folket
                            </div>
                        </motion.div>
                    </div>

                    {/* Text Content */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentEra.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-2 block">{currentEra.role}</span>
                                    <h4 className="text-3xl font-bold text-slate-800 leading-tight">{currentEra.title}</h4>
                                </div>

                                <blockquote className="border-l-4 border-amber-400 pl-4 py-1 italic text-slate-600 text-lg">
                                    "{currentEra.quote}"
                                    <footer className="text-xs font-bold text-slate-400 not-italic mt-2 uppercase tracking-wide">– {currentEra.author}</footer>
                                </blockquote>

                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm font-sans">
                                    <div className="flex items-start gap-3">
                                        <ScrollText className="shrink-0 text-slate-400 mt-1" />
                                        <p className="text-slate-600 leading-relaxed">
                                            {currentEra.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Power Meters */}
                                <div className="space-y-3 font-sans">
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-amber-700">
                                        <span className="w-20 text-right">Makt</span>
                                        <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden flex">
                                            <motion.div
                                                animate={{ width: `${currentEra.kingPower}%` }}
                                                className="bg-amber-500 h-full"
                                            />
                                            <motion.div
                                                animate={{ width: `${currentEra.peoplePower}%` }}
                                                className="bg-blue-500 h-full"
                                            />
                                        </div>
                                        <span className="w-20 text-blue-700 text-left">Frihet</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 px-24">
                                        <span className="text-right w-full pr-2">Kongens Makt</span>
                                        <span className="text-left w-full pl-2">Folkets Makt</span>
                                    </div>
                                </div>

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
