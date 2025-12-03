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

// Simple markdown renderer fallback
const renderWithMarkdown = (text: string) => {
    if (!text) return null;
    // Basic bold support
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

interface ArticleContentProps {
    content: any[];
    activeBlockIndex?: number;
    onBlockClick?: (index: number) => void;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, activeBlockIndex, onBlockClick }) => {
    if (!content || !Array.isArray(content)) return null;

    return (
        <div className="article-content max-w-5xl mx-auto">
            {content.map((block, index) => {
                // Handle both 'type' (standard) and 'name' (TinaCMS sometimes)
                const type = block.type || block.name;

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
                                {renderWithMarkdown(block.content || block.value)}
                            </div>
                        );

                    case 'header':
                        return (
                            <h2 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-8">
                                {block.content || block.value}
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
                                    {renderWithMarkdown(block.content)}
                                </div>
                            );
                        }
                        return null;
                }
            })}
        </div>
    );
};
