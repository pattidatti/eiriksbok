
import React, { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { GlossaryText } from './GlossaryText';
import { motion, AnimatePresence } from 'framer-motion';

interface FactBoxProps {
    title?: string;
    content?: string;
    items?: string[]; // Added support for array content
}

export const FactBox: React.FC<FactBoxProps> = ({ title = 'Visste du at?', content, items }) => {
    const [isOpen, setIsOpen] = useState(true);

    // Combine content and items into a unified list
    const contentLines = content ? content.split('\n') : [];
    const allItems = items ? [...contentLines, ...items] : contentLines;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="my-8 rounded-2xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-sm"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between text-left group bg-indigo-50/30 hover:bg-indigo-50/80 transition-all duration-300"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb size={20} className="fill-current/20" />
                    </div>
                    <span className="text-indigo-900 font-display font-bold text-lg tracking-wide">
                        {title}
                    </span>
                </div>
                <div className={`p-1 rounded-full text-indigo-400 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-indigo-100' : 'group-hover:translate-y-0.5'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-2 text-slate-600 text-base leading-relaxed space-y-4 border-t border-indigo-100/50">
                            {allItems.length > 0 ? (
                                <ul className="space-y-3">
                                    {allItems.map((line, index) => (
                                        <li key={index} className="flex gap-3 items-start">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                            <span>
                                                {line.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g).map((part, i) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={i} className="text-indigo-900 font-semibold"><GlossaryText content={part.slice(2, -2)} /></strong>;
                                                    }
                                                    if (part.startsWith('*') && part.endsWith('*')) {
                                                        return <em key={i} className="text-slate-500"><GlossaryText content={part.slice(1, -1)} /></em>;
                                                    }
                                                    return <GlossaryText key={i} content={part} />;
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-slate-400">Ingen innhold tilgjengelig.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
