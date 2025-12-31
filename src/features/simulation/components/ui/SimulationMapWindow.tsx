import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SimulationMapWindowProps {
    title: string;
    icon?: React.ReactNode;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
    onClose: () => void;
    className?: string; // Content wrapper overrides
}

export const SimulationMapWindow: React.FC<SimulationMapWindowProps> = ({ title, icon, headerRight, children, onClose, className }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-8">
            {/* Scrim / Backdrop - slightly darkens map but keeps it visible */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] cursor-pointer"
            />

            {/* Window Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-5xl max-h-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
                {/* Header */}
                <div className="flex-none flex justify-between items-center px-6 py-3.5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-display font-bold text-white tracking-wider uppercase flex items-center gap-3">
                            {icon && <span className="text-indigo-400">{icon}</span>}
                            {title}
                        </h2>
                        {headerRight}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition-all group"
                        title="Lukk vindu"
                    >
                        <span className="text-lg group-hover:rotate-90 transition-transform">✕</span>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${className || ''}`}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
