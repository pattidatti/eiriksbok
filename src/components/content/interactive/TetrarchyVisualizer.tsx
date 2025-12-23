import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Map as MapIcon, Info } from 'lucide-react';

interface Tetrarch {
    id: string;
    name: string;
    title: 'Augustus' | 'Caesar';
    region: string;
    capital: string;
    color: string;
    description: string;
    image: string;
}

const tetrarchs: Tetrarch[] = [
    {
        id: 'diocletian',
        name: 'Diokletian',
        title: 'Augustus',
        region: 'Øst (Lilleasia, Egypt, Levanten)',
        capital: 'Nikomedia',
        color: 'bg-purple-600',
        description: 'Senior-Augustus og hjernen bak systemet. Han beholdt kontrollen over de rikeste provinsene i øst.',
        image: '👑'
    },
    {
        id: 'maximian',
        name: 'Maximian',
        title: 'Augustus',
        region: 'Vest (Italia, Afrika, Nord-Balkan)',
        capital: 'Mediolanum (Milano)',
        color: 'bg-red-600',
        description: 'Diokletians lojale våpenbror. Styrte den vestlige delen med jernhånd fra Milano.',
        image: '⚔️'
    },
    {
        id: 'galerius',
        name: 'Galerius',
        title: 'Caesar',
        region: 'Balkan og Donau-grensen',
        capital: 'Sirmium',
        color: 'bg-blue-600',
        description: 'Diokletians junior-keiser. Ansvarlig for forsvaret mot goterne ved Donau.',
        image: '🛡️'
    },
    {
        id: 'constantius',
        name: 'Constantius Chlorus',
        title: 'Caesar',
        region: 'Gallia, Britannia, Hispania',
        capital: 'Augusta Treverorum (Trier)',
        color: 'bg-green-600',
        description: 'Maximians junior-keiser. Far til den fremtidige Konstantin den store.',
        image: '🏹'
    }
];

export const TetrarchyVisualizer: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedTetrarch = tetrarchs.find(t => t.id === selectedId);

    return (
        <div className="my-12 p-6 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" />
                        Tetrarkiet i praksis
                    </h3>
                    <p className="text-slate-400 mb-6 text-sm">
                        Klikk på keiserne for å se hvem som styrte hvilke deler av det enorme Romerriket.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {tetrarchs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                                className={`p-4 rounded-2xl transition-all duration-300 text-left border-2 ${selectedId === t.id
                                        ? `${t.color} border-white scale-105 shadow-xl`
                                        : 'bg-slate-800 border-transparent hover:bg-slate-700'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{t.image}</div>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${selectedId === t.id ? 'text-white/80' : 'text-slate-500'}`}>
                                    {t.title}
                                </div>
                                <div className="text-white font-bold leading-tight">{t.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative min-h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {selectedId ? (
                            <motion.div
                                key={selectedId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white ${selectedTetrarch?.color}`}>
                                    {selectedTetrarch?.title}
                                </div>
                                <h4 className="text-3xl font-bold text-white">{selectedTetrarch?.name}</h4>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapIcon className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold">Region</div>
                                            <div className="text-slate-200">{selectedTetrarch?.region}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold">Hovedstad</div>
                                            <div className="text-slate-200">{selectedTetrarch?.capital}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                        <p className="text-slate-300 text-sm italic leading-relaxed">
                                            {selectedTetrarch?.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-600">
                                    <Users className="w-10 h-10 text-slate-500" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-400 italic">Velg en keiser for detaljer</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                    Oppdag hvordan Diokletians geni reorganiserte rikets ledelse for første gang på 300 år.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
