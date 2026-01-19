
import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface WritingFixItem {
    bad: string;
    good: string;
}

interface WritingFixProps {
    title?: string;
    items: WritingFixItem[];
}

export const WritingFix: React.FC<WritingFixProps> = ({ title, items }) => {
    const { entries } = useGlossary();

    return (
        <div className="my-8 max-w-2xl mx-auto">
            {title && (
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
                    {title}
                </h4>
            )}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 ${index !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                        {/* Bad version */}
                        <div className="flex items-start gap-3 mb-2 opacity-60">
                            <div className="mt-1 p-0.5 bg-red-50 text-red-500 rounded-full flex-shrink-0">
                                <X size={12} strokeWidth={3} />
                            </div>
                            <div className="text-slate-600 italic line-through decoration-red-200/50">
                                {renderInlineMarkdown(item.bad, entries)}
                            </div>
                        </div>

                        {/* Good version */}
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-0.5 bg-emerald-50 text-emerald-600 rounded-full flex-shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <div className="text-slate-800 font-medium">
                                {renderInlineMarkdown(item.good, entries)}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
