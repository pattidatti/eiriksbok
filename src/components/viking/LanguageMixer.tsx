import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

const words = [
    { eng: 'Window', nor: 'Vindauge', meaning: 'Vind-øye (hullet røyken gikk ut av)' },
    { eng: 'Egg', nor: 'Egg', meaning: 'De lånte både ordet og tingen!' },
    { eng: 'Husband', nor: 'Husbondi', meaning: 'Herre av huset' },
    { eng: 'Knife', nor: 'Knivr', meaning: 'Kniv' },
    { eng: 'Steak', nor: 'Steik', meaning: 'Kjøttstykke stekt på spyd' },
    { eng: 'Thursday', nor: 'Torsdag', meaning: 'Tors dag' },
    { eng: 'Berserk', nor: 'Berserkr', meaning: 'Bjørne-serk (skjorte av bjørneskinn)' }
];

export const LanguageMixer: React.FC = () => {
    const [revealed, setRevealed] = useState<number[]>([]);

    const toggleReveal = (index: number) => {
        if (revealed.includes(index)) {
            setRevealed(revealed.filter(i => i !== index));
        } else {
            setRevealed([...revealed, index]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-8">
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="text-xl font-bold text-center text-amber-900 mb-2">Er engelsk egentlig norsk?</h3>
                <p className="text-center text-amber-800 mb-6 text-sm">
                    Vikingene hersket i England i 200 år. Klikk på de engelske ordene for å se hvor de kommer fra.
                </p>

                <div className="space-y-3">
                    {words.map((word, index) => {
                        const isRevealed = revealed.includes(index);
                        return (
                            <motion.button
                                key={index}
                                onClick={() => toggleReveal(index)}
                                className="w-full bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-center justify-between group hover:border-amber-300 transition-colors"
                            >
                                <div className="font-bold text-lg w-1/3 text-left pl-4 text-slate-700">
                                    {word.eng}
                                </div>

                                <div className="text-amber-400">
                                    <ArrowLeftRight className={`transition-transform duration-500 ${isRevealed ? 'rotate-180 text-green-500' : ''}`} />
                                </div>

                                <div className="w-1/3 text-right pr-4">
                                    {isRevealed ? (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="font-bold text-lg text-green-700"
                                        >
                                            {word.nor}
                                        </motion.div>
                                    ) : (
                                        <div className="w-20 h-4 bg-slate-100 rounded ml-auto" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {revealed.length > 0 && (
                    <div className="mt-4 p-4 bg-white/50 rounded text-center text-sm font-medium text-amber-900">
                        {words[revealed[revealed.length - 1]].meaning}
                    </div>
                )}
            </div>
        </div>
    );
};
