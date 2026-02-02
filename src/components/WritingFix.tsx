
import React from 'react';
import { motion } from 'framer-motion';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface WritingFixItem {
    bad: string;
    good: string;
    why?: string;
}

interface WritingFixProps {
    title?: string;
    items: WritingFixItem[];
}

export const WritingFix: React.FC<WritingFixProps> = ({ title, items = [] }) => {
    const { entries } = useGlossary();

    return (
        <div className="my-16 max-w-2xl mx-auto px-4 md:px-0">
            {title && (
                <h4 className="text-xl font-bold text-slate-900 mb-8">
                    {title}
                </h4>
            )}
            <div className="space-y-16">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        {/* Container for the comparison */}
                        <div className="grid gap-6 md:gap-8">

                            {/* BAD EXAMPLE */}
                            <div>
                                <h5 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                    Unngå dette
                                </h5>
                                <div className="text-slate-500 font-serif italic text-lg leading-relaxed whitespace-pre-wrap">
                                    {renderInlineMarkdown(item.bad, entries)}
                                </div>
                            </div>

                            {/* GOOD EXAMPLE */}
                            <div>
                                <h5 className="text-lg font-bold text-emerald-500 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Prøv heller
                                </h5>
                                <div className="text-slate-900 text-lg leading-relaxed font-normal whitespace-pre-wrap transition-all duration-300">
                                    {renderInlineMarkdown(item.good, entries)}
                                </div>
                            </div>

                            {/* EXPLANATION */}
                            {item.why && (
                                <div className="mt-2 pt-4 border-t border-slate-50">
                                    <h5 className="text-lg font-bold text-slate-900 mb-1">
                                        Hvorfor?
                                    </h5>
                                    <div className="text-lg text-slate-600 leading-relaxed max-w-prose">
                                        {renderInlineMarkdown(item.why, entries)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
