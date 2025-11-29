import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)} // Mobile support
        >
            <span className="cursor-help border-b-2 border-dotted border-indigo-400 hover:bg-indigo-50 transition-colors rounded px-0.5">
                {children}
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-sm text-white text-sm p-3 rounded-xl shadow-xl border border-white/10 relative">
                            {text}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
