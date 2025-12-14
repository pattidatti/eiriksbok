import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChordEditorOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectChord: (chord: string) => void;
}

export const ChordEditorOverlay: React.FC<ChordEditorOverlayProps> = ({ isOpen, onClose, onSelectChord }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-white">Velg Akkord</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(root => (
                                <React.Fragment key={root}>
                                    <button onClick={() => onSelectChord(root)} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors text-white">{root}</button>
                                    <button onClick={() => onSelectChord(root + 'm')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors text-white">{root}m</button>
                                    <button onClick={() => onSelectChord(root + '7')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors text-white">{root}7</button>
                                    <button onClick={() => onSelectChord(root + 'maj7')} className="p-2 bg-slate-700 hover:bg-indigo-600 rounded font-bold transition-colors text-xs text-white">{root}maj7</button>
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
