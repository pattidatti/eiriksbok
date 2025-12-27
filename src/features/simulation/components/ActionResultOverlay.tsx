
import React, { useEffect } from 'react';
import type { ActionResult } from '../simulationTypes';
import { RESOURCE_DETAILS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionResultOverlayProps {
    result: ActionResult | null;
    onClear: () => void;
}

export const ActionResultOverlay: React.FC<ActionResultOverlayProps> = ({ result, onClear }) => {
    // Auto-clear after a few seconds
    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                onClear();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [result, onClear]);

    if (!result) return null;

    return (
        <AnimatePresence>
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900/90 border border-amber-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-none min-w-[300px] text-center z-50"
                >
                    {/* Message Header */}
                    <div className={`font-serif text-lg mb-2 ${result.success ? 'text-amber-100' : 'text-red-400'}`}>
                        {result.message}
                    </div>

                    {/* Resources Yields */}
                    {result.yields && result.yields.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            {result.yields.map((yieldItem, idx) => {
                                const details = RESOURCE_DETAILS[yieldItem.resource] || { label: yieldItem.resource, icon: '📦' };
                                const isPositive = yieldItem.amount >= 0;
                                return (
                                    <motion.div
                                        key={`${yieldItem.resource}-${idx}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold border ${isPositive ? 'bg-green-900/40 border-green-500/50 text-green-200' : 'bg-red-900/40 border-red-500/50 text-red-200'}`}
                                    >
                                        <span>{details.icon}</span>
                                        <span>{isPositive ? '+' : ''}{yieldItem.amount}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* XP Gains */}
                    {result.xp && result.xp.length > 0 && (
                        <div className="flex flex-col gap-1">
                            {result.xp.map((xpItem, idx) => (
                                <motion.div
                                    key={`xp-${idx}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="text-xs text-blue-300 font-mono"
                                >
                                    +{xpItem.amount} XP {xpItem.skill}
                                    {xpItem.levelUp && <span className="ml-2 text-yellow-400 font-bold animate-pulse">NIVÅ OPP!</span>}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Durability Loss */}
                    {result.durability && result.durability.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap justify-center gap-2">
                            {result.durability.map((dura, idx) => (
                                <span key={`dura-${idx}`} className="text-xs text-gray-400">
                                    {dura.item}: {dura.amount > 0 ? '-' : '+'}{Math.abs(dura.amount)}%
                                    {dura.broken && <span className="text-red-500 font-bold ml-1">(ØDELAGT!)</span>}
                                </span>
                            ))}
                        </div>
                    )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};
