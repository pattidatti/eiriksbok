
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

export const WritingFix: React.FC<WritingFixProps> = ({ title, items }) => {
    const { entries } = useGlossary();

    return (
        <div className="my-10 max-w-2xl mx-auto px-4 md:px-0">
            {title && (
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">
                    {title}
                </h4>
            )}
            <div className="space-y-8">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-6 border-l border-slate-100 group"
                    >
                        {/* Status Indicator Dot */}
                        <div className="absolute left-[-4.5px] top-2 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors duration-500" />

                        {/* Bad version - Ghosted and Struck-through */}
                        <div className="mb-1 text-slate-400/60 line-through decoration-slate-300/40 text-sm font-light italic whitespace-pre-line">
                            {renderInlineMarkdown(item.bad, entries)}
                        </div>

                        {/* Good version - Primary focus */}
                        <div className="text-slate-800 text-base leading-relaxed font-normal whitespace-pre-line">
                            {renderInlineMarkdown(item.good, entries)}
                        </div>

                        {/* Why? - Optional context added for depth */}
                        {item.why && (
                            <div className="mt-2 text-xs text-slate-400 font-normal max-w-prose">
                                {renderInlineMarkdown(item.why, entries)}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
