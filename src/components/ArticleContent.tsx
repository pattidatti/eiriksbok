import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getComponent } from './ComponentRegistry';

// ... standard imports remain (Link, Volume2, motion, etc.)

import type { Concept, ContentBlock } from '../types';
import { renderInlineMarkdown } from './markdownUtils';

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

                    const HeaderTag = `h${Math.min(level + 1, 6)}` as any; // Shift down one level (h1 -> h2)

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



interface ArticleContentProps {
    content: any[];
    concepts?: Concept[];
    activeBlockIndex?: number;
    onBlockClick?: (index: number) => void;
    fallbackUrl?: string;
    isTool?: boolean;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, concepts, activeBlockIndex, onBlockClick, fallbackUrl, isTool = false }) => {
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
        <div className={`article-content ${isTool ? 'w-full max-w-none' : 'max-w-5xl mx-auto'}`}>
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
                        const ListTag = block.ordered ? 'ol' : 'ul';
                        const listStyle = block.ordered ? "list-decimal" : "list-disc";

                        return (
                            <ListTag key={index} className={`${listStyle} list-inside space-y-2 mb-8 text-slate-700`}>
                                {block.items?.map((item: string, i: number) => (
                                    <li key={i} className="leading-relaxed">
                                        {renderInlineMarkdown(item, concepts)}
                                    </li>
                                ))}
                            </ListTag>
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
                        const ComponentName = block.name || block.component;
                        const RegisteredComponent = getComponent(ComponentName);

                        if (!RegisteredComponent) {
                            return (
                                <div key={index} className="p-4 border border-red-500 rounded text-red-500 my-4">
                                    Unknown component: {ComponentName}
                                </div>
                            );
                        }

                        return (
                            <React.Suspense key={index} fallback={<div className="h-40 w-full animate-pulse bg-slate-100 rounded-xl my-4 flex items-center justify-center text-slate-400">Laster modul...</div>}>
                                <RegisteredComponent {...(block.props || {})} />
                            </React.Suspense>
                        );

                    case 'quiz':
                        const QuizComp = getComponent('Quiz');
                        if (!QuizComp) return null;
                        return (
                            <div key={index} className="my-12">
                                <QuizComp
                                    questions={(block.questions as any) || []}
                                />
                            </div>
                        );

                    case 'quote':
                        return (
                            <blockquote key={index} className="my-8 pl-8 border-l-4 border-indigo-500 italic text-xl text-slate-700 bg-slate-50 py-4 pr-4 rounded-r-lg shadow-sm">
                                "{block.content}"
                                {(block.author || block.source) && (
                                    <footer className="mt-4 text-sm not-italic flex flex-col text-slate-500 font-medium">
                                        {block.author && <cite className="not-italic text-slate-800 text-base mb-1">— {block.author}</cite>}
                                        {block.source && <span className="text-slate-400">{block.source}</span>}
                                    </footer>
                                )}
                            </blockquote>
                        );

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

                    case 'video':
                        const videoUrl = block.url || block.value;
                        const videoTitle = block.title || "YouTube video";
                        // Extract video ID from URL if it's a full link
                        let embedUrl = videoUrl;
                        if (videoUrl.includes('youtube.com/watch?v=')) {
                            const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (videoUrl.includes('youtu.be/')) {
                            const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }

                        return (
                            <div key={index} className="my-10 aspect-video w-full overflow-hidden rounded-xl shadow-lg border border-slate-200">
                                <iframe
                                    src={embedUrl}
                                    title={videoTitle}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
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
