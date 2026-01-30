import React, { useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface FactBoxProps {
    title?: string;
    content?: string;
    items?: (string | { label: string; value: string })[]; // Added support for structured content
    variant?: 'default' | 'grid';
}

export const FactBox: React.FC<FactBoxProps> = ({ title = 'Visste du at?', content, items, variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { entries } = useGlossary();

    // Combine content and items into a unified list
    // Note: If content is provided, it's treated as string items
    const contentLines = content ? content.split('\n') : [];
    const allItems = items ? [...contentLines, ...items] : contentLines;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="my-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-sm transition-colors duration-300"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-5 flex items-center justify-between text-left group bg-indigo-50/30 hover:bg-indigo-50/80 transition-all duration-300 ${isOpen ? 'rounded-t-2xl' : 'rounded-2xl'}`}
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
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                            transitionEnd: { overflow: 'visible' }
                        }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="p-6 pt-2 text-slate-600 text-base leading-relaxed space-y-4 border-t border-indigo-100/50 rounded-b-2xl">
                            {allItems.length > 0 ? (
                                <ul className={`space-y-3 ${variant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
                                    {allItems.map((line, index) => (
                                        <li key={index} className={`flex gap-3 items-start ${variant === 'grid' ? 'bg-white/50 p-3 rounded-lg border border-indigo-50' : ''}`}>
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                            <span>
                                                {typeof line === 'string' ? (
                                                    renderInlineMarkdown(line, entries)
                                                ) : (
                                                    // Structured item rendering
                                                    <>
                                                        <strong className="block text-indigo-700 font-medium mb-1">
                                                            {line.label}
                                                        </strong>
                                                        <span className="text-slate-600">
                                                            {renderInlineMarkdown(line.value, entries)}
                                                        </span>
                                                    </>
                                                )}
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
