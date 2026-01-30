import React from 'react';
import { User, Shield, GraduationCap } from 'lucide-react';

interface HierarchyItem {
    title: string;
    description: string;
    icon?: 'user' | 'shield' | 'school';
}

interface HierarchyProps {
    title?: string;
    items: HierarchyItem[];
}

export const Hierarchy: React.FC<HierarchyProps> = ({ title, items }) => {
    const getIcon = (type?: string) => {
        switch (type) {
            case 'user': return <User className="w-6 h-6" />;
            case 'shield': return <Shield className="w-6 h-6" />;
            case 'school': return <GraduationCap className="w-6 h-6" />;
            default: return <User className="w-6 h-6" />;
        }
    };

    return (
        <div className="my-12 max-w-2xl mx-auto">
            {title && (
                <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">{title}</h3>
            )}
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-8 top-8 bottom-8 w-1 bg-indigo-100 rounded-full md:left-1/2 md:-ml-0.5" />

                <div className="space-y-8">
                    {items.map((item, index) => (
                        <div key={index} className="relative flex items-center gap-6 md:gap-10">
                            {/* Number/Icon Bubble */}
                            <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shadow-sm text-indigo-600 md:w-20 md:h-20 md mx-auto">
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900 shadow-sm border border-white">
                                    {index + 1}
                                </span>
                                {getIcon(item.icon)}
                            </div>

                            {/* Card content */}
                            <div className="flex-grow bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
                                {/* Triangle pointer */}
                                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-white border-l border-b border-slate-100 transform rotate-45 z-0" />

                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
