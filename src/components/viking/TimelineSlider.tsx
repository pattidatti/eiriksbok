import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const eras = [
    {
        year: 935,
        king: 'Håkon den Gode',
        title: 'Den forsiktige starten',
        desc: 'Håkon var fostret opp i England og var kristen. Han prøvde å innføre kristendom forsiktig, men bøndene nektet. Han måtte delta på hedenske blot for å beholde makten.',
        icon: '⚔️'
    },
    {
        year: 995,
        king: 'Olav Tryggvason',
        title: 'Sverdets misjon',
        desc: 'Olav gikk hardt frem. Han ødela gudehov og tvang folk til å la seg døpe. "Dåp eller død" var ofte valget. Han grunnla Nidaros.',
        icon: '🔥'
    },
    {
        year: 1030,
        king: 'Olav Haraldsson',
        title: 'Lov og Helgen',
        desc: 'Olav innførte kristenretten som lov på Mostertinget (1024). Han falt på Stiklestad, men ble etter sin død kåret til helgen. Da var kampen vunnet.',
        icon: '✝️'
    }
];

export const TimelineSlider: React.FC = () => {
    const [index, setIndex] = useState(0);
    const era = eras[index];

    return (
        <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <h3 className="text-2xl font-bold text-center mb-8">Kristningen av Norge</h3>

            {/* Slider / Steps */}
            <div className="relative flex justify-between mb-12 px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />

                {eras.map((e, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${i === index ? 'bg-blue-600 text-white scale-125 border-4 border-white shadow-lg' :
                                i < index ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-400'
                            }`}
                    >
                        <span className="text-xs font-bold">{e.year}</span>
                    </button>
                ))}
            </div>

            {/* Content Card */}
            <div className="relative h-64">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full flex flex-col items-center text-center"
                    >
                        <div className="text-4xl mb-4">{era.icon}</div>
                        <h2 className="text-xl font-bold text-blue-900 mb-1">{era.king}</h2>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{era.title}</h4>
                        <p className="text-slate-700 leading-relaxed">
                            {era.desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="text-center mt-6 text-xs text-slate-400">
                Bruk knappene over for å reise i tid
            </div>
        </div>
    );
};
