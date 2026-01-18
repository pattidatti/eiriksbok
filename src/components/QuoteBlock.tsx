import React from 'react';
import { Quote } from 'lucide-react';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface QuoteBlockProps {
    text: string;
    author?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ text, author }) => {
    const { entries } = useGlossary();

    return (
        <div className="my-8 relative group max-w-3xl mx-auto">
            <div className="relative z-10 p-6 bg-slate-50/50 border-l-4 border-indigo-400 rounded-r-xl transition-all duration-300">
                <Quote size={24} className="text-indigo-300 mb-2 fill-current opacity-50" />
                <p className="font-serif text-lg md:text-xl leading-relaxed text-slate-700 italic">
                    {renderInlineMarkdown(text, entries)}
                </p>

                {author && (
                    <footer className="mt-4 flex items-center gap-2">
                        <div className="h-px w-8 bg-indigo-200"></div>
                        <cite className="not-italic text-xs font-bold tracking-wider text-indigo-800 uppercase">
                            {author}
                        </cite>
                    </footer>
                )}
            </div>
        </div>
    );
};
