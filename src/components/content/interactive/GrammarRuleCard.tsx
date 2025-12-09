import { Lightbulb, Check, X } from 'lucide-react';

import { renderInlineMarkdown } from '../../markdownUtils';

interface Example {
    text: string;
    isCorrect?: boolean;
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
                    <p className="text-amber-800 mb-4 font-medium">{renderInlineMarkdown(rule)}</p>
                    <div className="bg-white/60 p-4 rounded-md">
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">Eksempler</p>
                        <ul className="space-y-2">
                            {examples.map((ex, i) => {
                                const isObject = typeof ex === 'object' && ex !== null;
                                const text = isObject ? (ex as Example).text : (ex as string);
                                const isCorrect = isObject ? (ex as Example).isCorrect : undefined;

                                return (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 font-mono text-sm">
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
