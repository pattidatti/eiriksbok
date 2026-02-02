
import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, Shield } from 'lucide-react';
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

    // Support for "before/after" legacy structure (normalized to left/right)
    before?: LegacyComparisonSide;
    after?: LegacyComparisonSide;
}

interface LegacyComparisonSide {
    label: string;
    content: string;
}

export const Comparison: React.FC<ComparisonProps> = ({
    title,
    leftTitle,
    rightTitle,
    items,
    leftItems,
    rightItems,
    leftContent,
    rightContent,
    before,
    after
}) => {
    const { entries } = useGlossary();

    // Normalizing data
    let displayItems: ComparisonItem[] = items || [];

    // Protocol: "Avant-Garde" override for legacy "before/after" structure
    if (displayItems.length === 0 && before && after) {
        displayItems = [{
            left: before.content,
            right: after.content
        }];
        // If titles are missing, use the labels from the payload
        // Note: We use the incoming prop if it exists, otherwise fallback to the before/after label
        if (!leftTitle) leftTitle = before.label || 'Før';
        if (!rightTitle) rightTitle = after.label || 'Etter';
    }

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

    // Filter out completely empty rows to prevent ghost rows
    displayItems = displayItems.filter(item =>
        (item.label && item.label.trim().length > 0) ||
        (item.left && item.left.trim().length > 0) ||
        (item.right && item.right.trim().length > 0)
    );

    // Check if any items have labels
    const hasLabels = displayItems.some(item => item.label && item.label.trim().length > 0);

    // Dynamic grid layout: 3 columns if labels exist, 2 columns (50/50) if not
    const gridClass = hasLabels
        ? "grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr]"
        : "grid grid-cols-1 md:grid-cols-2";

    return (
        <div className="my-10 relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white rounded-3xl -z-10 backdrop-blur-sm" />

            {title && (
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-600 rounded-full mb-3 shadow-sm">
                        <Scale size={20} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-800">{title}</h3>
                </div>
            )}

            <div className="relative rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm bg-white">
                {/* Header Row */}
                <div className={`${gridClass} border-b border-slate-100`}>
                    {hasLabels && (
                        <div className="hidden md:block p-4 bg-slate-50/50 md:border-r border-slate-100">
                            {/* Empty spacer for Label column in header */}
                        </div>
                    )}
                    <div className="p-3 md:p-4 text-center bg-indigo-50/30 backdrop-blur-sm md:border-r border-indigo-100">
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-indigo-100/50 text-indigo-700 font-bold uppercase tracking-wider text-[10px] rounded-full">
                            <Users size={12} />
                            {leftTitle}
                        </div>
                    </div>
                    <div className="p-3 md:p-4 text-center bg-amber-50/30 backdrop-blur-sm">
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-amber-100/50 text-amber-700 font-bold uppercase tracking-wider text-[10px] rounded-full">
                            <Shield size={12} />
                            {rightTitle}
                        </div>
                    </div>
                </div>

                {/* Items Rows */}
                <div className="flex flex-col">
                    {displayItems.map((item, i) => {
                        const hasLeft = item.left && item.left.trim().length > 0;
                        const hasRight = item.right && item.right.trim().length > 0;

                        return (
                            <div key={i} className={`${gridClass} ${i !== displayItems.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                {/* Label Column (Centralized) */}
                                {hasLabels && (
                                    <div className="p-3 md:p-4 bg-slate-50/30 md:border-r border-slate-100 flex items-center justify-center">
                                        {item.label && (
                                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] text-center">
                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Left Side Item */}
                                <div className={`${hasLeft ? 'p-2 md:p-2.5' : 'p-0'} bg-indigo-50/5 md:border-r border-indigo-50 transition-all duration-200`}>
                                    {hasLeft && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, ease: "easeOut" }}
                                            className="h-full p-2.5 md:p-3.5 bg-white shadow-sm border border-indigo-100/40 text-indigo-900 text-sm md:text-base leading-relaxed text-center break-words hyphens-auto whitespace-pre-wrap flex items-center justify-center font-medium rounded-lg"
                                        >
                                            {renderInlineMarkdown(item.left, entries)}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Right Side Item */}
                                <div className={`${hasRight ? 'p-2 md:p-2.5' : 'p-0'} bg-amber-50/5 transition-all duration-200`}>
                                    {hasRight && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, ease: "easeOut" }}
                                            className="h-full p-2.5 md:p-3.5 bg-white shadow-sm border border-amber-100/40 text-amber-900 text-sm md:text-base leading-relaxed text-center break-words hyphens-auto whitespace-pre-wrap flex items-center justify-center rounded-lg"
                                        >
                                            {renderInlineMarkdown(item.right, entries)}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
