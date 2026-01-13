import React from 'react';
import { renderInlineMarkdown } from './markdownUtils';
import { useGlossary } from '../context/GlossaryContext';

interface QuoteBlockProps {
    text: string;
    author?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ text, author }) => {
    const { entries } = useGlossary();

    return (
        <blockquote className="border-l-4 border-indigo-500 pl-6 py-4 my-8 bg-indigo-50/50 rounded-r-lg italic text-xl text-slate-700">
            "{renderInlineMarkdown(text, entries)}"
            {author && <footer className="text-sm font-bold text-slate-500 mt-2 not-italic">— {author}</footer>}
        </blockquote>
    );
};
