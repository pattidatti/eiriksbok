import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, X, ArrowRight, Check } from 'lucide-react';
import type { ChronosRecipe, ChronosItem } from '../../data/chronos/types';

interface CraftingModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipes: ChronosRecipe[];
    inventory: string[];
    items: ChronosItem[]; // To get names/icons
    onCraft: (recipe: ChronosRecipe) => void;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({ isOpen, onClose, recipes, inventory, items, onCraft }) => {
    const getItemParam = (id: string) => items.find(i => i.id === id);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-8"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                                    <Hammer size={20} />
                                </div>
                                <h3 className="font-display font-black text-xl text-stone-800">Smi & Lage</h3>
                            </div>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            {recipes.length === 0 ? (
                                <p className="text-stone-500 italic text-center py-8">Ingen oppskrifter tilgjengelig.</p>
                            ) : (
                                recipes.map(recipe => {
                                    const canCraft = recipe.ingredients.every(ing => inventory.includes(ing));
                                    const resultItem = getItemParam(recipe.result);

                                    return (
                                        <div key={recipe.id} className={`p-4 rounded-2xl border ${canCraft ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-100 opacity-70'} relative overflow-hidden group`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="font-bold text-stone-800">{recipe.label}</div>
                                                {canCraft && (
                                                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                                        <Check size={12} /> Kan lages
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                                                <div className="flex -space-x-2">
                                                    {recipe.ingredients.map((ing, i) => {
                                                        const item = getItemParam(ing);
                                                        const has = inventory.includes(ing);
                                                        return (
                                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] bg-stone-100 ${has ? 'text-stone-600 font-bold' : 'text-stone-300 opacity-50'}`} title={item?.name || ing}>
                                                                {item?.name?.[0] || '?'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <ArrowRight size={16} className="text-stone-300" />
                                                <div className="font-bold text-stone-800">{resultItem?.name || recipe.result}</div>
                                            </div>

                                            <button
                                                onClick={() => onCraft(recipe)}
                                                disabled={!canCraft}
                                                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors ${canCraft
                                                    ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-200'
                                                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                                            >
                                                {canCraft ? 'Lag Gjenstand' : 'Mangler Materialer'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
