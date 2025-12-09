import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ConflictMap: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-blue-50 rounded-xl shadow-md border-2 border-slate-200">
            <h3 className="text-xl font-bold text-center mb-4 text-slate-800">Krigen om Norden (ca. 800 e.Kr.)</h3>
            <div className="relative aspect-[4/3] bg-blue-100 rounded-lg overflow-hidden border border-blue-200">
                {/* Sea Background */}
                <div className="absolute inset-0 bg-blue-100 opacity-50"></div>

                {/* Frankish Empire (South) */}
                <motion.div
                    className="absolute bottom-0 w-full h-1/2 bg-red-800 text-white flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRegion('frankere')}
                >
                    <div className="text-center">
                        <h4 className="font-serif font-bold text-lg">FRANKERRIKET</h4>
                        <p className="text-xs opacity-75">Karl den Store</p>
                    </div>
                </motion.div>

                {/* Viking Lands (North) */}
                <motion.div
                    className="absolute top-0 w-full h-1/3 bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRegion('vikinger')}
                >
                    <div className="text-center">
                        <h4 className="font-serif font-bold text-lg">NORDEN</h4>
                        <p className="text-xs opacity-75">Kong Godfred</p>
                    </div>
                </motion.div>

                {/* The Buffer Zone / Danevirke */}
                <div className="absolute top-1/3 w-full h-1/6 flex items-center justify-center">
                    <motion.div
                        className="w-3/4 h-2 bg-yellow-600 rounded-full shadow-lg cursor-pointer"
                        whileHover={{ scaleY: 2, backgroundColor: '#b45309' }}
                        onClick={() => setSelectedRegion('danevirke')}
                    >
                        <div className="text-center -mt-6 text-xs font-bold text-yellow-900">DANEVIRKE (Muren)</div>
                    </motion.div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 min-h-[100px] p-4 bg-white rounded-lg shadow-inner">
                {selectedRegion === 'frankere' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4 className="font-bold text-red-800">Frankerriket</h4>
                        <p className="text-sm text-slate-600">
                            En supermakt som ville kristne verden med sverd. Karl den Stores massakre av saksere skapte skrekk i nord.
                        </p>
                    </motion.div>
                )}
                {selectedRegion === 'vikinger' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4 className="font-bold text-slate-800">Norden</h4>
                        <p className="text-sm text-slate-600">
                            Et løst samfunn av høvdinger og småkonger som følte seg truet. Angrep var det beste forsvaret.
                        </p>
                    </motion.div>
                )}
                {selectedRegion === 'danevirke' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4 className="font-bold text-yellow-800">Danevirke</h4>
                        <p className="text-sm text-slate-600">
                            En enorm forsvarsvoll tvers over Jylland. Nordens "Kinamyren" bygget for å holde frankerne (og senere tyskere) ute.
                        </p>
                    </motion.div>
                )}
                {!selectedRegion && (
                    <p className="text-center text-slate-400 italic">Trykk på kartet for å lære mer.</p>
                )}
            </div>
        </div>
    );
};
