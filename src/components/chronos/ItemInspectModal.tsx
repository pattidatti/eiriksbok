import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Star, X } from 'lucide-react';
import type { ChronosItem } from '../../data/chronos/types';

interface ItemInspectModalProps {
    item: ChronosItem | null;
    onClose: () => void;
}

export const ItemInspectModal: React.FC<ItemInspectModalProps> = ({ item, onClose }) => {
    const isLetter = item?.content?.itemType === 'letter';

    return (
        <AnimatePresence>
            {item && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLetter && item.content?.itemType === 'letter' ? (
                            <>
                                {/* Letter header */}
                                <div className="p-5 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                                            <Scroll size={20} className="text-amber-700" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Les brevet</p>
                                            <h3 className="font-display font-black text-lg text-stone-800 leading-tight">{item.name}</h3>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Letter metadata */}
                                <div
                                    className="px-6 pt-5 pb-2"
                                    style={{ filter: 'sepia(0.25)' }}
                                >
                                    <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">
                                        <div>
                                            <span className="block text-stone-300">Fra</span>
                                            <span className="text-stone-500 normal-case font-semibold tracking-normal">{item.content.from}</span>
                                        </div>
                                        <div>
                                            <span className="block text-stone-300">Til</span>
                                            <span className="text-stone-500 normal-case font-semibold tracking-normal">{item.content.to}</span>
                                        </div>
                                        <div>
                                            <span className="block text-stone-300">Dato</span>
                                            <span className="text-stone-500 normal-case font-semibold tracking-normal">{item.content.date}</span>
                                        </div>
                                    </div>

                                    {/* Letter body */}
                                    <div className="border-l-4 border-amber-200/60 pl-4 space-y-3 max-h-64 overflow-y-auto">
                                        {item.content.body.map((paragraph, i) => (
                                            <p
                                                key={i}
                                                className="font-serif italic text-stone-800 leading-relaxed text-sm"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all text-sm"
                                    >
                                        Lukk brevet
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Object header */}
                                <div className="p-5 bg-stone-50 border-b border-stone-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-stone-100 rounded-xl flex-shrink-0">
                                            <Star size={24} className="text-stone-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Gjenstand</p>
                                            <h3 className="font-display font-black text-lg text-stone-800 leading-tight">{item?.name}</h3>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <p className="text-stone-700 leading-relaxed">{item?.description}</p>
                                </div>

                                <div className="px-6 pb-6">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all text-sm"
                                    >
                                        Lukk
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
