import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Globe, RotateCcw, CheckCircle2 } from 'lucide-react';

interface Nation {
    id: string;
    name: string;
    today: string;
    language: string;
    significance: string;
}

interface PinseNasjonerProps {
    title?: string;
}

const NATIONS: Nation[] = [
    {
        id: 'partia',
        name: 'Partia',
        today: 'Nordost-Iran og Turkmenistan',
        language: 'Partisk',
        significance:
            'Det mektige Partiske riket, Romerrikets store rival i ost. Kristendommen nådde hit allerede i det forste århundret.',
    },
    {
        id: 'mesopotamia',
        name: 'Mesopotamia',
        today: 'Irak',
        language: 'Arameisk',
        significance:
            'Landet mellom Eufrat og Tigris - der sivilisasjonen ble til. Hjemsted for noen av de eldste kristne menighetene i verden.',
    },
    {
        id: 'egypt',
        name: 'Egypt',
        today: 'Egypt',
        language: 'Koptisk',
        significance:
            'Ifølge tradisjonen grunnla evangelisten Markus den koptiske kirken i Alexandria rundt år 42 e.Kr. Koptisk kristendom eksisterer fortsatt i dag.',
    },
    {
        id: 'kappadokia',
        name: 'Kappadokia',
        today: 'Sentral-Tyrkia',
        language: 'Gresk og arameisk',
        significance:
            'Kjent for de dramatiske klippeformasjonene og underjordiske byene. Ble et av de sterkeste kristne sentrene i antikken.',
    },
    {
        id: 'roma',
        name: 'Roma',
        today: 'Italia',
        language: 'Latin',
        significance:
            'Verdens mektigste by. Kristne nådde Roma tidlig, og menigheten der ble til slutt sentrum for den vestlige kristenheten.',
    },
    {
        id: 'arabia',
        name: 'Arabia',
        today: 'Saudi-Arabia og Jemen',
        language: 'Arabisk',
        significance:
            'Handelsfolk fra den arabiske halvoya. Kristendommen spredte seg til Arabia og Etiopia allerede i det forste århundret.',
    },
    {
        id: 'media',
        name: 'Media',
        today: 'Nordvest-Iran',
        language: 'Medisk/persisk',
        significance:
            'Et gammelt rike. Store jodiske samfunn hadde levd her i hundrevis av år etter det babylonske eksil - de var kjent med de hebraiske skriftene.',
    },
    {
        id: 'kreta',
        name: 'Kreta',
        today: 'Kreta, Hellas',
        language: 'Gresk',
        significance:
            'Den storste greske oya. Paulus sendte sin medarbeider Titus hit for å organisere de kristne menighetene.',
    },
];

export function PinseNasjoner({ title = 'Nasjonene på pinsedagen' }: PinseNasjonerProps) {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [selected, setSelected] = useState<string | null>(null);

    const handleClick = (id: string) => {
        setRevealed((prev) => new Set([...prev, id]));
        setSelected((prev) => (prev === id ? null : id));
    };

    const handleReset = () => {
        setRevealed(new Set());
        setSelected(null);
    };

    const isComplete = revealed.size >= NATIONS.length;
    const selectedNation = NATIONS.find((n) => n.id === selected);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-amber-50">
                <Flame className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Klikk på hvert folk for å se hvem de var</p>
                </div>
                <span className="text-sm text-slate-400 flex-shrink-0">
                    {revealed.size}/{NATIONS.length} oppdaget
                </span>
            </div>

            {/* Sitat */}
            <div className="px-6 pt-4 pb-2">
                <p className="text-sm text-slate-600 italic border-l-2 border-amber-300 pl-3">
                    "Da hørte de dem tale hvert på sitt eget morsmål." — Apostlenes gjerninger 2:6
                </p>
            </div>

            {/* Nasjonskort */}
            <div className="p-6 pt-3 grid grid-cols-4 gap-2">
                {NATIONS.map((nation) => {
                    const isRevealed = revealed.has(nation.id);
                    const isSelected = selected === nation.id;
                    return (
                        <motion.button
                            key={nation.id}
                            onClick={() => handleClick(nation.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`p-3 rounded-lg text-left border transition-colors ${
                                isSelected
                                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                                    : isRevealed
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <Globe
                                className={`w-4 h-4 mb-1 ${isSelected ? 'text-amber-500' : isRevealed ? 'text-emerald-500' : 'text-slate-400'}`}
                            />
                            <span className="text-sm font-medium">{nation.name}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Detaljpanel */}
            <AnimatePresence mode="wait">
                {selectedNation && (
                    <motion.div
                        key={selectedNation.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mb-3"
                    >
                        <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="flex items-start gap-3">
                                <Flame className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-900 text-sm">
                                        {selectedNation.name}
                                    </p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        I dag: {selectedNation.today} &mdash; Språk:{' '}
                                        {selectedNation.language}
                                    </p>
                                    <p className="text-sm text-slate-700 mt-2">
                                        {selectedNation.significance}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullfort */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm text-emerald-700">
                            <span className="font-semibold">Du har oppdaget alle folkene!</span>{' '}
                            Fra vest-Europa til Persia og Arabia - en universell religion ble til på
                            en eneste dag.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bunrad */}
            <div className="px-6 pb-5 flex justify-end">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
