import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Gavel, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface TradeItem {
    id: string;
    name: string;
    marketPrice: number;
    edictPrice: number;
    unit: string;
    outcome: string;
    consequence: 'failure' | 'warning' | 'chaos';
}

const items: TradeItem[] = [
    {
        id: 'hvetemel',
        name: 'Hvetemel',
        marketPrice: 120,
        edictPrice: 40,
        unit: 'modius (ca. 9 liter)',
        outcome: 'Bøndene nekter å selge. Melmangel i byene fører til hungersnød.',
        consequence: 'failure'
    },
    {
        id: 'vin',
        name: 'God vin (Picenum)',
        marketPrice: 90,
        edictPrice: 30,
        unit: 'liter',
        outcome: 'Vinen selges under bordet på svartebørsen til dobbel pris.',
        consequence: 'warning'
    },
    {
        id: 'barberer',
        name: 'Barberer-tjeneste',
        marketPrice: 6,
        edictPrice: 2,
        unit: 'per kunde',
        outcome: 'Barberere slutter å jobbe offentlig. Alle går med skjegg i protest.',
        consequence: 'chaos'
    },
    {
        id: 'silke',
        name: 'Lilla silke',
        marketPrice: 150000,
        edictPrice: 50000,
        unit: 'pund',
        outcome: 'Kjøpmenn gjemmer lagrene sine. Kun keiseren har råd.',
        consequence: 'failure'
    }
];

export const PriceEdictExplorer: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string>(items[0].id);
    const [isEdictEnforced, setIsEdictEnforced] = useState(false);

    const currentItem = items.find(item => item.id === selectedId)!;

    return (
        <div className="my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-2xl">
                            <Gavel className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Prisedikt-simulatoren</h3>
                            <p className="text-slate-500 text-sm">Året er 301. Diokletian har satt dødsstraff for overpris.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Velg en vare / tjeneste</label>
                        <div className="grid grid-cols-2 gap-3">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedId(item.id);
                                        setIsEdictEnforced(false);
                                    }}
                                    className={`p-4 rounded-xl text-left transition-all ${selectedId === item.id
                                        ? 'bg-slate-900 text-white shadow-lg scale-105'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    <div className="font-bold">{item.name}</div>
                                    <div className="text-xs opacity-70">{item.unit}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Markedspris</div>
                                <div className="text-3xl font-bold text-slate-900">{currentItem.marketPrice} <span className="text-sm font-normal">denarer</span></div>
                            </div>
                            <div className="pb-1">
                                <TrendingUp className="w-6 h-6 text-red-500 animate-bounce" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-0.5 flex-1 bg-slate-300"></div>
                            <div className="text-xs font-bold text-slate-400">VS</div>
                            <div className="h-0.5 flex-1 bg-slate-300"></div>
                        </div>

                        <div>
                            <div className="text-xs text-red-500 uppercase font-bold mb-1 italic">Diokletians Maksimalpris</div>
                            <div className="text-3xl font-bold text-red-600">{currentItem.edictPrice} <span className="text-sm font-normal">denarer</span></div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEdictEnforced(true)}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Gavel className="w-5 h-5" />
                        Håndhev ediktet (med dødsstraff!)
                    </button>
                </div>

                <div className="flex-1 relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!isEdictEnforced ? (
                            <motion.div
                                key="before"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300"
                            >
                                <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
                                <h4 className="text-xl font-bold text-slate-400 mb-2">Venter på ordre</h4>
                                <p className="text-slate-500">Velg ut en vare og aktiver ediktet for å se de økonomiske konsekvensene.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="after"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="h-full flex flex-col p-8 rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <XCircle className="w-40 h-40" />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3 text-red-400">
                                        <AlertTriangle className="w-6 h-6" />
                                        <span className="font-bold uppercase tracking-widest text-sm">Økonomisk Rapport</span>
                                    </div>

                                    <h4 className="text-3xl font-bold leading-tight">Resultat av priskontrollen:</h4>

                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                                        <p className="text-xl text-slate-200 italic">"{currentItem.outcome}"</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold italic font-serif">!</div>
                                            <p className="text-sm text-slate-400">
                                                <strong>Konsekvens:</strong> Selv om Diokletian ville hjelpe de fattige med billigere mel, førte tvangstiltaket til at de sulter fordi markedsplassen er tom.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>HISTORISK REALITET</span>
                                    <div className="flex items-center gap-1 text-red-500">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        FIASKO
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
