
import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, Shield, ArrowRightLeft } from 'lucide-react';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface ComparisonItem {
    label?: string;
    left: string;
    right: string;
}

interface ComparisonProps {
    title?: string;
    leftTitle: string;
    rightTitle: string;
    items?: ComparisonItem[];
    // Support for list-based props from JSON
    leftItems?: string[];
    rightItems?: string[];
    // Support for legacy single-content props
    leftContent?: string;
    rightContent?: string;
}

export const Comparison: React.FC<ComparisonProps> = ({
    title,
    leftTitle,
    rightTitle,
    items,
    leftItems,
    rightItems,
    leftContent,
    rightContent
}) => {
    const { entries } = useGlossary();

    // Normalizing data
    let displayItems: ComparisonItem[] = items || [];

    // Fallback: Legacy list structure
    if (displayItems.length === 0 && leftItems && rightItems) {
        displayItems = leftItems.map((left, i) => ({
            left,
            right: rightItems[i] || ''
        }));
    }

    // Fallback: Legacy single-content structure
    if (displayItems.length === 0 && (leftContent || rightContent)) {
        displayItems = [{
            left: leftContent || '',
            right: rightContent || ''
        }];
    }

    return (
        <div className="my-16 relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white rounded-3xl -z-10 backdrop-blur-sm" />

            {title && (
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-4 shadow-sm">
                        <Scale size={24} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-800">{title}</h3>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 relative rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
                {/* Desktop Divider Icon */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-slate-100 text-slate-400">
                    <ArrowRightLeft size={20} />
                </div>

                {/* Left Side (Technology/Structure) - Indigo Theme */}
                <div className="flex flex-col h-full bg-indigo-50/30 backdrop-blur-sm md:border-r border-indigo-100">
                    <div className="p-6 text-center border-b border-indigo-100">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-100/50 text-indigo-700 font-bold uppercase tracking-wider text-xs rounded-full">
                            <Users size={14} />
                            {leftTitle}
                        </div>
                    </div>

                    <div className="flex-grow p-8 flex flex-col gap-6">
                        {displayItems.map((item, i) => (
                            <motion.div
                                key={`left-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, ease: "easeOut" }}
                                className="p-6 bg-white/80 rounded-2xl shadow-sm border border-indigo-100/50 text-indigo-900 leading-relaxed text-center break-words hyphens-auto"
                            >
                                {renderInlineMarkdown(item.left, entries)}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side (Humanity/Reflection) - Amber Theme */}
                <div className="flex flex-col h-full bg-amber-50/30 backdrop-blur-sm">
                    <div className="p-6 text-center border-b border-amber-100">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-100/50 text-amber-700 font-bold uppercase tracking-wider text-xs rounded-full">
                            <Shield size={14} />
                            {rightTitle}
                        </div>
                    </div>

                    <div className="flex-grow p-8 flex flex-col gap-6">
                        {displayItems.map((item, i) => (
                            <motion.div
                                key={`right-${i}`}
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, ease: "easeOut" }}
                                className="p-6 bg-white/80 rounded-2xl shadow-sm border border-amber-100/50 text-amber-900 leading-relaxed text-center break-words hyphens-auto"
                            >
                                {renderInlineMarkdown(item.right, entries)}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
