
import React, { useEffect } from 'react';
import type { ActionResult } from '../simulationTypes';
import { RESOURCE_DETAILS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { animationManager } from '../logic/AnimationManager';
import { X } from 'lucide-react';

interface ActionResultOverlayProps {
    result: ActionResult | null;
    onClear: () => void;
}

export const ActionResultOverlay: React.FC<ActionResultOverlayProps> = ({ result, onClear }) => {
    // Auto-clear after a few seconds
    useEffect(() => {
        if (result) {
            // Trigger flying resources if any
            if (result.success && result.yields && result.yields.length > 0) {
                result.yields.forEach((y, idx) => {
                    if (y.amount > 0) {
                        setTimeout(() => {
                            // Target left sidebar (Inventory)
                            animationManager.spawnFlyingResource(
                                y.resource,
                                window.innerWidth / 2,
                                window.innerHeight / 2, // Start from center
                                80, // Target Left Sidebar X (approx)
                                200 // Target Top-ish Y (approx, where inventory might be)
                            );
                        }, idx * 200);
                    }
                });
            }

            const timer = setTimeout(() => {
                onClear();
            }, 6000); // Increased to 6s because user says it "remains on screen" but now they have a close button
            return () => clearTimeout(timer);
        }
    }, [result, onClear]);

    return (
        <AnimatePresence>
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-[15%] left-1/2 transform -translate-x-1/2 bg-slate-900/95 border-2 border-amber-500/30 p-5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md min-w-[300px] text-center z-50 overflow-hidden"
                >
                    {/* Progress Bar Background */}
                    <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full overflow-hidden">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="h-full bg-amber-500"
                        />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Message Header */}
                        <div className={`text-lg font-black mb-3 tracking-tight ${result.success ? 'text-white' : 'text-rose-400'}`}>
                            {result.message}
                        </div>

                        {/* Resources Yields */}
                        {result.yields && result.yields.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-3">
                                {result.yields.map((yieldItem, idx) => {
                                    const details = RESOURCE_DETAILS[yieldItem.resource] || { label: yieldItem.resource, icon: '📦' };
                                    const isPositive = yieldItem.amount >= 0;
                                    return (
                                        <motion.div
                                            key={`${yieldItem.resource}-${idx}`}
                                            initial={{ scale: 0, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            transition={{ delay: 0.2 + (idx * 0.1), type: "spring" }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border shadow-lg ${isPositive
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                                }`}
                                        >
                                            <span className="text-lg">{details.icon}</span>
                                            <span>{isPositive ? '+' : ''}{yieldItem.amount}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* XP Gains */}
                        {result.xp && result.xp.length > 0 && (
                            <div className="flex flex-col gap-2 mb-2">
                                {result.xp.map((xpItem, idx) => (
                                    <motion.div
                                        key={`xp-${idx}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (idx * 0.1) }}
                                        className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 py-1 rounded-lg"
                                    >
                                        +{xpItem.amount} XP {xpItem.skill}
                                        {xpItem.levelUp && (
                                            <span className="ml-2 inline-block bg-amber-500 text-black px-2 py-0.5 rounded text-[8px] animate-bounce">
                                                NIVÅ OPP!
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Durability Loss */}
                        {result.durability && result.durability.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-3">
                                {result.durability.map((dura, idx) => (
                                    <span key={`dura-${idx}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        🛡️ {dura.item}: <span className={dura.amount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                                            {dura.amount > 0 ? '-' : '+'}{Math.abs(dura.amount)}%
                                        </span>
                                        {dura.broken && <span className="text-rose-500 font-black ml-1 animate-pulse">(ØDELAGT!)</span>}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

