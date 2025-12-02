import React from 'react';
import { Link } from 'react-router-dom';
import { textLibraryData } from '../data/textLibraryData';
import { GlossaryText } from './GlossaryText';

interface AuthorLinkerProps {
    content: string;
}

export const AuthorLinker: React.FC<AuthorLinkerProps> = ({ content }) => {
    // Get unique authors
    const authors = React.useMemo(() => {
        return Array.from(new Set(textLibraryData.map(t => t.author).filter(Boolean)));
    }, []);

    // Filter authors present in content
    const presentAuthors = authors.filter(author => content.includes(author));

    if (presentAuthors.length === 0) {
        return <GlossaryText content={content} />;
    }

    // Sort by length desc to match longest first
    const sortedAuthors = presentAuthors.sort((a, b) => b.length - a.length);
    // Escape special characters for regex
    const pattern = new RegExp(`(${sortedAuthors.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

    const parts = content.split(pattern);

    return (
        <>
            {parts.map((part, i) => {
                if (presentAuthors.includes(part)) {
                    return (
                        <Link
                            key={i}
                            to={`/bibliotek?author=${encodeURIComponent(part)}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                            title={`Se tekster av ${part} i biblioteket`}
                        >
                            {part}
                        </Link>
                    );
                }
                return <GlossaryText key={i} content={part} />;
            })}
        </>
    );
};
