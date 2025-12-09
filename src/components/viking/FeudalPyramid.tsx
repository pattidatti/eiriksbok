import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const FeudalPyramid: React.FC = () => {
    const [mode, setMode] = useState<'feudal' | 'ting'>('feudal');

    return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-gray-50 rounded-xl shadow-md border-2 border-slate-200">
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setMode('feudal')}
                    className={`px-4 py-2 rounded-full font-bold transition-colors ${mode === 'feudal' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    Føydalismen (Europa)
                </button>
                <button
                    onClick={() => setMode('ting')}
                    className={`px-4 py-2 rounded-full font-bold transition-colors ${mode === 'ting' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    Tinget (Norden)
                </button>
            </div>

            <div className="aspect-square max-h-[400px] mx-auto relative flex items-center justify-center">
                {mode === 'feudal' ? (
                    <div className="w-full h-full flex flex-col justify-end items-center relative gap-1">
                        {/* King */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-purple-800 text-white w-1/4 py-2 text-center rounded-t-lg shadow-lg z-30"
                        >
                            <span className="font-bold">Konge</span>
                            <div className="text-xs opacity-75">All makt fra Gud</div>
                        </motion.div>
                        {/* Nobles */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-purple-600 text-white w-2/4 py-4 text-center shadow-lg z-20"
                        >
                            <span className="font-bold">Adel / Kirke</span>
                            <div className="text-xs opacity-75">Får land, gir lojalitet</div>
                        </motion.div>
                        {/* Knights */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-purple-500 text-white w-3/4 py-6 text-center shadow-lg z-10"
                        >
                            <span className="font-bold">Riddere</span>
                            <div className="text-xs opacity-75">Kriger for adelen</div>
                        </motion.div>
                        {/* Peasants */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-purple-400 text-white w-full py-8 text-center rounded-b-lg shadow-lg z-0"
                        >
                            <span className="font-bold">Bønder (Livegne)</span>
                            <div className="text-xs opacity-75">Eier ingenting, jobber for alle</div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="w-full h-full relative flex items-center justify-center">
                        <motion.div
                            className="absolute bg-orange-100 rounded-full w-[300px] h-[300px] flex items-center justify-center border-4 border-orange-300"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                        >
                            <div className="text-center p-8">
                                <h3 className="font-bold text-2xl text-orange-800 mb-2">TINGET</h3>
                                <p className="text-sm text-orange-900">
                                    Alle frie menn møtes for å dømme og lage lover. Kongen er mektig, men må følge loven han også.
                                </p>
                            </div>
                            {/* People dots around */}
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-sm"
                                    style={{
                                        top: `${50 + 45 * Math.sin(i * Math.PI / 4)}%`,
                                        left: `${50 + 45 * Math.cos(i * Math.PI / 4)}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
                {mode === 'feudal'
                    ? "Føydalismen var et strengt hierarki. Du ble født inn i din rolle."
                    : "I Norden var bøndene frie menn som eide sin egen jord og bar våpen."}
            </p>
        </div>
    );
};
