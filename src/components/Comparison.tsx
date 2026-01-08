
import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, Shield } from 'lucide-react';

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
}

export const Comparison: React.FC<ComparisonProps> = ({
    title,
    leftTitle,
    rightTitle,
    items,
    leftItems,
    rightItems
}) => {
    // Normalizing data
    let displayItems: ComparisonItem[] = items || [];

    if (displayItems.length === 0 && leftItems && rightItems) {
        displayItems = leftItems.map((left, i) => ({
            left,
            right: rightItems[i] || ''
        }));
    }

    return (
        <div className="my-16 relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white rounded-3xl -z-10" />

            {title && (
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                        <Scale size={24} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-800">{title}</h3>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 relative rounded-3xl overflow-hidden border border-slate-200">
                {/* Desktop Divider */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 transform -translate-x-1/2 z-10" />

                {/* Left Side - Header */}
                <div className="bg-red-50/50 p-6 text-center border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-red-800 font-bold uppercase tracking-wider text-sm mb-2">
                        <Users size={16} />
                        {leftTitle}
                    </div>
                </div>

                {/* Right Side - Header */}
                <div className="bg-emerald-50/50 p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-sm mb-2">
                        <Shield size={16} />
                        {rightTitle}
                    </div>
                </div>

                {/* Items */}
                {displayItems.map((item, i) => (
                    <React.Fragment key={i}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 bg-white flex items-center justify-center text-center text-slate-700 leading-relaxed border-b border-slate-100 ${i === displayItems.length - 1 ? 'md:border-b-0' : ''}`}
                        >
                            {item.left}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 bg-white flex items-center justify-center text-center text-slate-700 leading-relaxed border-b border-slate-100 md:border-l md:border-slate-100 ${i === displayItems.length - 1 ? 'md:border-b-0' : ''}`}
                        >
                            {item.right}
                        </motion.div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
