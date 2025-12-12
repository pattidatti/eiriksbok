import React from 'react';

interface ComparisonItem {
    left: string;
    right: string;
}

interface ComparisonProps {
    title?: string;
    leftTitle: string;
    rightTitle: string;
    items: ComparisonItem[];
}

export const Comparison: React.FC<ComparisonProps> = ({ title, leftTitle, rightTitle, items }) => {
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
                {items.map((item, i) => (
                    <React.Fragment key={i}>
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
