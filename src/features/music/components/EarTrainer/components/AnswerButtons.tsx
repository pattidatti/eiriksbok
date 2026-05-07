import React from 'react';

interface AnswerButtonsProps {
    options: string[];
    correctLabel: string;
    selected: string | null;
    disabled: boolean;
    onSelect: (label: string) => void;
}

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({
    options,
    correctLabel,
    selected,
    disabled,
    onSelect,
}) => {
    const showResult = selected !== null;
    return (
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((label) => {
                let cls =
                    'rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-base font-medium text-slate-800 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-50';
                if (showResult) {
                    if (label === correctLabel) {
                        cls =
                            'rounded-xl border-2 border-emerald-500 bg-emerald-100 px-4 py-4 text-base font-semibold text-emerald-900 shadow-sm';
                    } else if (label === selected) {
                        cls =
                            'rounded-xl border-2 border-rose-500 bg-rose-100 px-4 py-4 text-base font-semibold text-rose-900 shadow-sm animate-shake';
                    } else {
                        cls =
                            'rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-medium text-slate-400 shadow-sm';
                    }
                }
                return (
                    <button
                        key={label}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(label)}
                        className={`${cls} disabled:cursor-not-allowed`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};
