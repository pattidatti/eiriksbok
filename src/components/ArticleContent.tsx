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
import { GrammarRuleCard } from './content/interactive/GrammarRuleCard';
import { TextHighlighter } from './content/interactive/TextHighlighter';
import { SentenceBuilder } from './content/interactive/SentenceBuilder';
import { ConflictMap } from './viking/ConflictMap';
import { FeudalPyramid } from './viking/FeudalPyramid';
import { PantheonExplorer } from './viking/PantheonExplorer';
import { LanguageMixer } from './viking/LanguageMixer';
import { TradeRouteMap } from './viking/TradeRouteMap';
import { TimelineSlider } from './viking/TimelineSlider';
import { QuoteBlock } from './QuoteBlock';
import { Comparison } from './Comparison';
import { LineChart } from './LineChart';

import { renderInlineMarkdown } from './markdownUtils';
import type { Concept, ContentBlock } from '../types';

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
                            case 'GrammarRuleCard':
                                return (
                                    <GrammarRuleCard
                                        key={index}
                                        title={block.props?.title}
                                        rule={block.props?.rule}
                                        examples={block.props?.examples || []}
                                    />
                                );
                            case 'TextHighlighter':
                                return (
                                    <TextHighlighter
                                        key={index}
                                        text={block.props?.text}
                                        correctWords={block.props?.correctWords || []}
                                        instruction={block.props?.instruction}
                                    />
                                );
                            case 'SentenceBuilder':
                                return (
                                    <SentenceBuilder
                                        key={index}
                                        segments={block.props?.segments || []}
                                        correctOrder={block.props?.correctOrder || []}
                                        instruction={block.props?.instruction}
                                    />
                                );
                            case 'ConflictMap':
                                return <ConflictMap key={index} />;
                            case 'FeudalPyramid':
                                return <FeudalPyramid key={index} />;
                            case 'PantheonExplorer':
                                return <PantheonExplorer key={index} />;
                            case 'LanguageMixer':
                                return <LanguageMixer key={index} />;
                            case 'TradeRouteMap':
                                return <TradeRouteMap key={index} />;
                            case 'TimelineSlider':
                                return <TimelineSlider key={index} />;
                            case 'QuoteBlock':
                                return (
                                    <QuoteBlock
                                        key={index}
                                        text={block.props?.text}
                                        author={block.props?.author}
                                    />
                                );
                            case 'Comparison':
                                return (
                                    <Comparison
                                        key={index}
                                        title={block.props?.title}
                                        leftTitle={block.props?.leftTitle}
                                        rightTitle={block.props?.rightTitle}
                                        items={block.props?.items || []}
                                    />
                                );
                            case 'LineChart':
                                return (
                                    <LineChart
                                        key={index}
                                        title={block.props?.title}
                                        data={block.props?.data || []}
                                        xAxisLabel={block.props?.xAxisLabel}
                                        yAxisLabel={block.props?.yAxisLabel}
                                    />
                                );
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
