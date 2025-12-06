import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';
import { EICSimulation } from './EICSimulation';
import { FactBox } from './FactBox';
import { TimelineComponent } from './TimelineComponent';
import { PlotGraph } from './PlotGraph';
import { InflationCalculator } from './content/interactive/InflationCalculator';
import { TimePreferenceModel } from './content/interactive/TimePreferenceModel';
import { BusinessCycleModel } from './content/interactive/BusinessCycleModel';
import { BusinessCycleGraph } from './content/interactive/BusinessCycleGraph';

// Simple markdown renderer fallback
const renderWithMarkdown = (text: string, concepts?: Concept[]) => {
    if (!text) return null;

    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);

    return (
        <>
            {paragraphs.map((paragraph, pIndex) => {
                // Check for headers
                if (paragraph.startsWith('#')) {
                    const level = paragraph.match(/^#+/)?.[0].length || 0;
                    const content = paragraph.replace(/^#+\s*/, '');

                    const HeaderTag = `h${Math.min(level + 1, 6)}` as React.ElementType; // Shift down one level (h1 -> h2)

                    return (
                        <HeaderTag key={pIndex} className={`font-bold text-slate-800 mb-4 mt-6 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}>
                            {renderInlineMarkdown(content, concepts)}
                        </HeaderTag>
                    );
                }

                // Standard paragraph
                return (
                    <p key={pIndex} className="mb-4 leading-relaxed">
                        {renderInlineMarkdown(paragraph, concepts)}
                    </p>
                );
            })}
        </>
    );
};

const renderInlineMarkdown = (text: string, concepts?: Concept[]) => {
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
                        {linkText}
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

    if (concepts && concepts.length > 0) {
        const sortedConcepts = [...concepts].sort((a, b) => (b.term || b.title || '').length - (a.term || a.title || '').length);
        const pattern = new RegExp(`\\b(${sortedConcepts.map(c => (c.term || c.title || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

        elements = elements.flatMap((el): React.ReactNode[] => {
            if (typeof el !== 'string') return [el];

            // Use split with capturing group to keep delimiters (the concepts)
            return el.split(pattern).map((part, i) => {
                const concept = sortedConcepts.find(c => (c.term || c.title || '').toLowerCase() === part.toLowerCase());
                if (concept) {
                    return (
                        <Tooltip key={`c-${i}-${part.substring(0, 10)}`} text={concept.definition || concept.description || ''}>
                            <span className="concept-highlight cursor-help border-b-2 border-neon-accent/30 hover:border-neon-accent transition-colors">
                                {part}
                            </span>
                        </Tooltip>
                    );
                }
                return part;
            });
        });
    }

    return <>{elements}</>;
};

import { Tooltip } from './Tooltip';
import type { Concept, ContentBlock } from '../types';

interface ArticleContentProps {
    content: any[];
    concepts?: Concept[];
    activeBlockIndex?: number;
    onBlockClick?: (index: number) => void;
    fallbackUrl?: string;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, concepts, activeBlockIndex, onBlockClick, fallbackUrl }) => {
    if (!content || !Array.isArray(content)) return null;
    // DEBUG: Fallback fetch if content is truncated
    const [fullContent, setFullContent] = React.useState<ContentBlock[] | null>(null);

    React.useEffect(() => {
        if (content.length < 25 && !fullContent && fallbackUrl) {
            fetch(fallbackUrl + '?t=' + Date.now())
                .then(res => res.json())
                .then(data => {
                    console.log('ArticleContent: Fetched full content, length:', data.content.length);
                    setFullContent(data.content);
                })
                .catch(err => console.error('ArticleContent: Fetch failed', err));
        }
    }, [content, fallbackUrl]);

    const displayContent = fullContent || content;

    return (
        <div className="article-content max-w-5xl mx-auto">
            {displayContent.map((block, index) => {
                // Handle 'type' (standard), 'name' (legacy), and '__typename' (GraphQL)
                let type = block.type || block.name;

                if (!type && block.__typename) {
                    switch (block.__typename) {
                        case 'ArticleContentText': type = 'text'; break;
                        case 'ArticleContentImage': type = 'image'; break;
                        case 'ArticleContentHeader': type = 'header'; break;
                        case 'ArticleContentList': type = 'list'; break;
                        case 'ArticleContentComponent': type = 'component'; break;
                    }
                }

                // Check for active state if interactive
                const isActive = activeBlockIndex === index;
                const interactiveClass = onBlockClick ? "cursor-pointer transition-colors duration-200 hover:bg-blue-50 rounded-lg p-2 -mx-2" : "";
                const activeClass = isActive ? "bg-yellow-100 ring-2 ring-yellow-300 relative" : "";

                switch (type) {
                    case 'text':
                        return (
                            <div
                                key={index}
                                className={`mb-6 text-lg text-slate-700 leading-relaxed group ${interactiveClass} ${activeClass}`}
                                onClick={() => onBlockClick?.(index)}
                            >
                                {block.title && (
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4 block">
                                        {block.title}
                                    </h3>
                                )}
                                {isActive && (
                                    <div className="absolute -left-12 top-2 hidden md:flex items-center justify-center w-8 h-8">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Volume2 className="w-5 h-5 text-yellow-600" />
                                        </motion.div>
                                    </div>
                                )}
                                {renderWithMarkdown(block.content || block.text || block.value, concepts)}
                            </div>
                        );

                    case 'header':
                        return (
                            <h2 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-8">
                                {block.content || block.text || block.value}
                            </h2>
                        );

                    case 'section':
                        return (
                            <div key={index} className="my-8">
                                {block.title && (
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{block.title}</h2>
                                )}
                                {block.content && <ArticleContent content={block.content} />}
                            </div>
                        );

                    case 'list':
                        return (
                            <ul key={index} className="list-disc list-inside space-y-2 mb-8 text-slate-700">
                                {block.items?.map((item: string, i: number) => (
                                    <li key={i} className="leading-relaxed">
                                        {renderWithMarkdown(item)}
                                    </li>
                                ))}
                            </ul>
                        );

                    case 'image':
                        return (
                            <figure key={index} className="my-8">
                                <img
                                    src={block.src}
                                    alt={block.alt || ''}
                                    className="w-full rounded-xl shadow-lg"
                                />
                                {block.caption && (
                                    <figcaption className="mt-2 text-center text-sm text-gray-400 italic">
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case 'component':
                        switch (block.name || block.component) {
                            case 'GovernmentExplorer':
                                return <GovernmentExplorer key={index} />;
                            case 'HistoryLongLines':
                                return <HistoryLongLines key={index} />;
                            case 'Quiz':
                                return <Quiz key={index} questions={(block.props?.questions as any) || []} />;
                            case 'EICSimulation':
                                return <EICSimulation key={index} />;
                            case 'FactBox':
                                return (
                                    <FactBox
                                        key={index}
                                        title={block.props?.title as string}
                                        content={block.props?.content as string}
                                    />
                                );
                            case 'TimelineComponent':
                                return (
                                    <TimelineComponent
                                        key={index}
                                        events={(block.props?.events as any) || []}
                                        title={block.props?.title as string}
                                    />
                                );
                            case 'PlotGraph':
                                return (
                                    <PlotGraph
                                        key={index}
                                        points={(block.props?.points as any) || []}
                                        title={block.props?.title as string}
                                        description={block.props?.description as string}
                                        xAxisLabel={block.props?.xAxisLabel as string}
                                        yAxisLabel={block.props?.yAxisLabel as string}
                                    />
                                );
                            case 'InflationCalculator':
                                return <InflationCalculator key={index} />;
                            case 'TimePreferenceModel':
                                return <TimePreferenceModel key={index} />;
                            case 'BusinessCycleModel':
                                return <BusinessCycleModel key={index} />;
                            case 'BusinessCycleGraph':
                                return <BusinessCycleGraph key={index} />;
                            default:
                                return (
                                    <div key={index} className="p-4 border border-red-500 rounded text-red-500">
                                        Unknown component: {block.name || block.component}
                                    </div>
                                );
                        }

                    case 'link':
                        const isExternal = block.url?.startsWith('http');
                        const className = "inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-medium hover:bg-indigo-100 transition-colors my-4";

                        if (isExternal) {
                            return (
                                <a key={index} href={block.url} className={className} target="_blank" rel="noopener noreferrer">
                                    {block.text}
                                </a>
                            );
                        }

                        return (
                            <Link key={index} to={block.url} className={className}>
                                {block.text}
                            </Link>
                        );

                    default:
                        // Fallback for unknown blocks, try to render content if available
                        if (block.content && typeof block.content === 'string') {
                            return (
                                <div key={index} className="mb-4 text-slate-700">
                                    {renderWithMarkdown(block.content, concepts)}
                                </div>
                            );
                        }
                        return null;
                }
            })}
        </div >
    );
};
