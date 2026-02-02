import { Lightbulb, Check, X } from 'lucide-react';

import { renderInlineMarkdown } from '../../markdownUtils';

interface Example {
    text?: string;
    isCorrect?: boolean;
    // New rich structure support
    correct?: string;
    incorrect?: string;
    explanation?: string;
}

interface GrammarRuleCardProps {
    title: string;
    rule: string;
    examples: (string | Example)[];
}

export const GrammarRuleCard: React.FC<GrammarRuleCardProps> = ({ title, rule, examples }) => {
    return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 my-8 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-full shrink-0">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">{title}</h3>
                    <div className="text-amber-800 mb-4 font-medium whitespace-pre-wrap">{renderInlineMarkdown(rule)}</div>
                    <div className="bg-white/60 p-4 rounded-md">
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-4">Eksempler</p>
                        <ul className="space-y-6">
                            {examples.map((ex, i) => {
                                if (typeof ex === 'string') {
                                    return (
                                        <li key={i} className="flex items-start gap-2 text-slate-700 font-mono text-sm whitespace-pre-wrap">
                                            {renderInlineMarkdown(ex)}
                                        </li>
                                    );
                                }

                                const hasRichStructure = ex.correct || ex.incorrect;

                                if (hasRichStructure) {
                                    return (
                                        <li key={i} className="space-y-3 pb-4 border-b border-amber-100 last:border-0 last:pb-0">
                                            {ex.incorrect && (
                                                <div className="flex items-start gap-2 text-slate-500 font-mono text-sm">
                                                    <X className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                                                    <div className="opacity-75 decoration-rose-300 line-through whitespace-pre-wrap">
                                                        {renderInlineMarkdown(ex.incorrect)}
                                                    </div>
                                                </div>
                                            )}
                                            {ex.correct && (
                                                <div className="flex items-start gap-2 text-slate-800 font-mono text-sm font-bold">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div className="whitespace-pre-wrap">
                                                        {renderInlineMarkdown(ex.correct)}
                                                    </div>
                                                </div>
                                            )}
                                            {ex.explanation && (
                                                <div className="text-xs text-amber-700/80 italic pl-6">
                                                    {renderInlineMarkdown(ex.explanation)}
                                                </div>
                                            )}
                                        </li>
                                    );
                                }

                                const text = ex.text || '';
                                const isCorrect = ex.isCorrect;

                                return (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 font-mono text-sm whitespace-pre-wrap">
                                        {isCorrect === true && <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />}
                                        {isCorrect === false && <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                                        <span className={isCorrect === false ? "opacity-75 decoration-red-400" : ""}>
                                            {renderInlineMarkdown(text)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
