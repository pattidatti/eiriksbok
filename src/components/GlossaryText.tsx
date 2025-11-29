import React from 'react';
import { glossary } from '../data/glossary';
import { Tooltip } from './Tooltip';

interface GlossaryTextProps {
    content: string;
}

export const GlossaryText: React.FC<GlossaryTextProps> = ({ content }) => {
    // 1. Identify all terms present in the content
    const terms = Object.keys(glossary).filter(term =>
        content.toLowerCase().includes(term.toLowerCase())
    );

    if (terms.length === 0) {
        return <>{content}</>;
    }

    // 2. Create a regex pattern to match all terms (case-insensitive)
    // We sort by length (descending) to match longer phrases first (e.g. "Dronning Elizabeth I" before "Dronning")
    const sortedTerms = terms.sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

    // 3. Split content and replace matches
    const parts = content.split(pattern);

    return (
        <>
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                if (glossary[lowerPart]) {
                    return (
                        <Tooltip key={index} text={glossary[lowerPart]}>
                            {part}
                        </Tooltip>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};
