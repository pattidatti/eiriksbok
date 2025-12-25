import React from 'react';

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
    leftContent?: string;
    rightContent?: string;
}

export const Comparison: React.FC<ComparisonProps> = ({
    title,
    leftTitle,
    rightTitle,
    items = [],
    leftContent,
    rightContent
}) => {
    // Combine items from props and direct content if present
    const allItems = [...items];
    if (leftContent && rightContent) {
        allItems.push({ left: leftContent, right: rightContent });
    }

    return (
        <div className="my-10">
            {title && <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{title}</h3>}
            <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="text-center">
                    <h4 className="font-bold text-slate-600 border-b-2 border-red-200 pb-2 mb-4">{leftTitle}</h4>
                </div>
                <div className="text-center">
                    <h4 className="font-bold text-slate-600 border-b-2 border-green-200 pb-2 mb-4">{rightTitle}</h4>
                </div>
                {allItems.map((item, i) => (
                    <React.Fragment key={i}>
                        {item.label && (
                            <div className="col-span-2 text-center mt-4 -mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-black/5">
                                    {item.label}
                                </span>
                            </div>
                        )}
                        <div className="bg-red-50 p-4 rounded-lg text-sm md:text-base text-slate-700 shadow-sm flex items-center justify-center text-center">
                            {item.left}
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-sm md:text-base text-slate-700 shadow-sm flex items-center justify-center text-center">
                            {item.right}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
