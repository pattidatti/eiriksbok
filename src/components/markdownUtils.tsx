import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from './Tooltip';
import type { Concept } from '../types';
import type { GlossaryEntry } from '../context/GlossaryContext';

export const renderInlineMarkdown = (text: string, concepts?: (Concept | GlossaryEntry)[]) => {
    if (!text) return null;

    let elements: React.ReactNode[] = [text];

    // 1. Bold
    elements = elements.flatMap((el): React.ReactNode[] => {
        if (typeof el !== 'string') return [el];
        return el.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={`b-${i}-${part.substring(0, 10)}`}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    });

    // 2. Links
    elements = elements.flatMap((el): React.ReactNode[] => {
        if (typeof el !== 'string') return [el];
        return el.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
            const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
                const [_, linkText, linkUrl] = linkMatch;
                const isExternal = linkUrl.startsWith('http');
                if (isExternal) {
                    return (
                        <a
                            key={`l-${i}-${linkUrl.substring(0, 10)}`}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {linkText}
                        </a>
                    );
                }
                return (
                    <Link
                        key={`l-${i}-${linkUrl.substring(0, 10)}`}
                        to={linkUrl}
                        className="text-blue-600 hover:underline"
                    >
                        {renderInlineMarkdown(linkText, concepts)} {/* Recursive helper? No, keep simple */}
                    </Link>
                );
            }
            return part;
        });
    });

    // 3. Italics
    elements = elements.flatMap((el): React.ReactNode[] => {
        if (typeof el !== 'string') return [el];
        return el.split(/(\*.*?\*)/g).map((part, i) => {
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return <em key={`i-${i}-${part.substring(0, 10)}`}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    });

    // 4. Concepts/Glossary (Tooltips)
    if (concepts && concepts.length > 0) {
        // concepts can be either Concept[] or GlossaryEntry[]
        const sortedConcepts = [...concepts].sort((a, b) => {
            // Safe access for title/term
            const termA = (a.term || ('title' in a ? (a as Concept).title : '') || '');
            const termB = (b.term || ('title' in b ? (b as Concept).title : '') || '');
            return termB.length - termA.length;
        });

        const pattern = new RegExp(`\\b(${sortedConcepts.map(c => ((c.term || ('title' in c ? (c as Concept).title : '') || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('|')})\\b`, 'gi');

        elements = elements.flatMap((el): React.ReactNode[] => {
            if (typeof el !== 'string') return [el];

            // Use split with capturing group to keep delimiters (the concepts)
            return el.split(pattern).map((part, i) => {
                const concept: any = sortedConcepts.find(c => (c.term || ('title' in c ? (c as Concept).title : '') || '').toLowerCase() === part.toLowerCase());
                if (concept) {
                    return (
                        <Tooltip
                            key={`c-${i}-${part.substring(0, 10)}`}
                            text={concept.definition || concept.description || ''}
                            type={concept.type} // support 'concept' or 'person'
                            link={concept.link}
                        >
                            {part}
                        </Tooltip>
                    );
                }
                return part;
            });
        });
    }

    return <>{elements}</>;
};
