import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    type?: 'concept' | 'person';
    link?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, type = 'concept', link }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const Icon = type === 'person' ? User : Book;
    const accentColor = type === 'person' ? 'border-orange-400' : 'border-indigo-400';
    const bgColor = type === 'person' ? 'hover:bg-orange-50' : 'hover:bg-indigo-50';

    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)} // Mobile support
        >
            <span className={`cursor-help border-b-2 border-dotted ${accentColor} ${bgColor} transition-colors rounded px-0.5 font-medium text-slate-800`}>
                {children}
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 z-50 pointer-events-none sm:pointer-events-auto"
                    >
                        <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden">
                            {/* Decorative gradient top bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${type === 'person' ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`} />

                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-1.5 rounded-lg ${type === 'person' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <Icon size={16} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm leading-relaxed font-medium text-slate-700">
                                        {text}
                                    </p>

                                    {link && (
                                        <Link
                                            to={link}
                                            className={`inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider ${type === 'person' ? 'text-orange-600' : 'text-indigo-600'} hover:underline pointer-events-auto`}
                                        >
                                            Les mer <ArrowRight size={12} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
