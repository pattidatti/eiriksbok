import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, ChevronDown, Info, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getComponent } from './ComponentRegistry';
import { useGlossary } from '../context/GlossaryContext';
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

                // Check for blockquotes
                if (paragraph.startsWith('>')) {
                    const content = paragraph.replace(/^>\s*/gm, ''); // Remove > from start of lines
                    return (
                        <blockquote key={pIndex} className="my-6 pl-6 border-l-4 border-indigo-500 italic text-lg text-slate-700 bg-slate-50 py-3 pr-4 rounded-r-lg">
                            {renderInlineMarkdown(content, concepts)}
                        </blockquote>
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

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, concepts: explicitConcepts, activeBlockIndex, onBlockClick, fallbackUrl, isTool = false }) => {
    const { entries: globalEntries } = useGlossary();

    if (!content || !Array.isArray(content)) return null;

    // Merge explicit concepts with global ones, explicit takes priority
    const mergedConcepts = [...(explicitConcepts || [])];
    globalEntries.forEach(entry => {
        if (!mergedConcepts.some(c => c.term.toLowerCase() === entry.term.toLowerCase())) {
            mergedConcepts.push(entry as any);
        }
    });

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
                // ... (rest of the mapping using mergedConcepts instead of concepts)
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
                    case 'paragraph':
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
                                {renderWithMarkdown(block.content || block.text || block.value, mergedConcepts)}
                            </div>
                        );



                    case 'poem':
                        return (
                            <div key={index} className="my-10 max-w-lg mx-auto">
                                <div className="bg-[#fcfbf7] border border-[#e8e6dc] p-8 rounded-sm shadow-sm relative overflow-hidden">
                                    {/* Decorative top border */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />

                                    {block.title && (
                                        <h4 className="font-serif italic text-lg text-slate-500 text-center mb-6">
                                            {block.title}
                                        </h4>
                                    )}

                                    <div className="font-serif text-lg leading-loose text-slate-800 text-center whitespace-pre-line">
                                        {block.content}
                                    </div>

                                    {block.author && (
                                        <div className="mt-6 text-center text-sm font-sans font-bold text-slate-400 uppercase tracking-widest">
                                            — {block.author}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );

                    case 'header':
                        return (
                            <h2 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-8">
                                {block.content || block.text || block.value}
                            </h2>
                        );

                    case 'subheader':
                        return (
                            <h3 key={index} className="text-xl font-bold text-slate-800 mb-3 mt-6">
                                {block.content || block.text || block.value}
                            </h3>
                        );

                    case 'comparison':
                        return (
                            <div key={index} className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 'Before' / Negative Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                        <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">
                                            {block.before?.label || 'Før'}
                                        </span>
                                    </div>
                                    <div className="p-6 text-slate-600 italic leading-relaxed bg-slate-50/30">
                                        "{block.before?.content}"
                                    </div>
                                </div>

                                {/* 'After' / Positive Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden group hover:shadow-md transition-shadow relative">
                                    <div className="bg-green-50 border-b border-green-100 p-4 flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-green-800 uppercase tracking-wide text-sm">
                                            {block.after?.label || 'Etter'}
                                        </span>
                                    </div>
                                    <div className="p-6 text-slate-800 font-medium leading-relaxed bg-green-50/10">
                                        "{block.after?.content}"
                                    </div>
                                </div>
                            </div>
                        );

                    case 'section':
                        return (
                            <div key={index} className="my-8">
                                {block.title && (
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{block.title}</h2>
                                )}
                                {block.content && <ArticleContent content={block.content} concepts={mergedConcepts} />}
                            </div>
                        );

                    case 'list':
                        const ListTag = block.ordered ? 'ol' : 'ul';

                        // Check if this is a "Definition List" (items start with **Bold**:)
                        const isDefinitionList = block.items?.every((item: string) =>
                            item.trim().startsWith('**') && item.includes('**:')
                        );

                        if (isDefinitionList) {
                            return (
                                <div key={index} className="my-10 space-y-6">
                                    {block.items?.map((item: string, i: number) => {
                                        // Parse "**Title**: Content"
                                        const match = item.match(/^\*\*(.*?)\*\*:\s*(.*)/);
                                        if (!match) return null;

                                        const [, title, content] = match;

                                        return (
                                            <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-indigo-100 transition-colors">
                                                <div className="font-bold text-indigo-900 text-lg mb-2">{title}</div>
                                                <div className="text-slate-700 leading-relaxed">
                                                    {renderInlineMarkdown(content, mergedConcepts)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }

                        const listStyle = block.ordered ? "list-decimal" : "list-disc";

                        return (
                            <ListTag key={index} className={`${listStyle} list-outside ml-6 space-y-3 mb-8 text-slate-700`}>
                                {block.items?.map((item: string, i: number) => (
                                    <li key={i} className="leading-relaxed pl-2">
                                        {renderInlineMarkdown(item, mergedConcepts)}
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

                    case 'expandable':
                        return (
                            <details key={index} className="group my-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-shadow">
                                <summary className="flex items-center justify-between p-6 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors list-none select-none">
                                    <h3 className="text-xl font-bold text-slate-800">{block.title}</h3>
                                    <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="p-6 pt-2 text-slate-700 leading-relaxed border-t border-slate-100">
                                    {renderWithMarkdown(block.content, mergedConcepts)}
                                </div>
                            </details>
                        );

                    case 'info':
                    case 'info_box':
                        return (
                            <div key={index} className="my-8 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-900 mb-2">{block.title}</h3>
                                        <div className="text-blue-800 leading-relaxed">
                                            {renderWithMarkdown(block.content, mergedConcepts)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                    case 'comparison_card':
                        return (
                            <div key={index} className="my-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {block.items?.map((item: any, i: number) => {
                                        // Map string color names to tailwind classes
                                        const colorMap: Record<string, string> = {
                                            blue: 'bg-blue-50 border-blue-100 text-blue-900',
                                            purple: 'bg-purple-50 border-purple-100 text-purple-900',
                                            orange: 'bg-orange-50 border-orange-100 text-orange-900',
                                            green: 'bg-green-50 border-green-100 text-green-900',
                                            red: 'bg-red-50 border-red-100 text-red-900',
                                        };
                                        const colorClass = colorMap[item.color] || 'bg-slate-50 border-slate-100 text-slate-900';

                                        return (
                                            <div key={i} className={`p-6 rounded-xl border ${colorClass} shadow-sm`}>
                                                <h4 className="text-lg font-bold mb-3">{item.title}</h4>
                                                <p className="text-sm leading-relaxed opacity-90">{item.content}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );

                    default:
                        // Fallback for unknown blocks, try to render content if available
                        if (block.content && typeof block.content === 'string') {
                            return (
                                <div key={index} className="mb-4 text-slate-700">
                                    {renderWithMarkdown(block.content, mergedConcepts)}
                                </div>
                            );
                        }
                        return null;
                }
            })}
        </div >
    );
};
