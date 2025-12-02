import React from 'react';
import { Link } from 'react-router-dom';
import { GlossaryText } from './GlossaryText';
import { AuthorLinker } from './AuthorLinker';

import type { ContentBlock } from '../types';
// import { DemographyPage } from '../pages/DemographyPage';
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';
import { EICSimulation } from './EICSimulation';
import { TimelineComponent } from './TimelineComponent';
import { FactBox } from './FactBox';
import { PlotGraph } from './PlotGraph';

interface ArticleContentProps {
    content: ContentBlock[];
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
    const renderWithMarkdown = (text: string) => {
        return text.split(/(\[.*?\]\(.*?\)|(?:\*\*|__).*?(?:\*\*|__)|\*[^*]+?\*)/g).map((part, i) => {
            // Check for link
            const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
                const [, linkText, url] = linkMatch;
                const isExternal = url.startsWith('http');
                const className = "text-indigo-600 hover:text-indigo-800 underline";
                if (isExternal) {
                    return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={className}>
                            {linkText}
                        </a>
                    );
                }
                return (
                    <Link key={i} to={url} className={className}>
                        {linkText}
                    </Link>
                );
            }

            // Check for bold
            if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                return <strong key={i}><AuthorLinker content={part.slice(2, -2)} /></strong>;
            }

            // Check for italic
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}><AuthorLinker content={part.slice(1, -1)} /></em>;
            }

            return <AuthorLinker key={i} content={part} />;
        });
    };

    return (
        <div className="article-content space-y-8">
            {content.map((block, index) => {
                switch (block.type) {
                    case 'text':
                        const textContent = block.content || block.text || '';
                        return (
                            <div key={index} className="prose prose-invert max-w-none">
                                {block.title && (
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4 mt-8">{block.title}</h2>
                                )}
                                {textContent.split('\n\n').map((paragraph: string, pIndex: number) => (
                                    <p key={pIndex} className="mb-4 text-slate-700 leading-relaxed">
                                        {renderWithMarkdown(paragraph)}
                                    </p>
                                ))}
                            </div>
                        );
                    case 'header':
                        return (
                            <h2 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-8">
                                {block.content}
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
                                    alt={block.alt}
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
                        // Registry of available components
                        // In a real app, this might be dynamic or lazy loaded
                        switch (block.name) {
                            // case 'DemographyModel':
                            //     return <DemographyPage key={index} />;
                            case 'GovernmentExplorer':
                                return <GovernmentExplorer key={index} />;
                            case 'HistoryLongLines':
                                return <HistoryLongLines key={index} />;
                            case 'Quiz':
                                return <Quiz key={index} questions={block.props?.questions || []} />;
                            case 'EICSimulation':
                                return <EICSimulation key={index} />;
                            case 'FactBox':
                                return (
                                    <FactBox
                                        key={index}
                                        title={block.props?.title}
                                        content={block.props?.content}
                                    />
                                );
                            case 'TimelineComponent':
                                return (
                                    <TimelineComponent
                                        key={index}
                                        events={block.props?.events || []}
                                        title={block.props?.title}
                                    />
                                );
                            case 'PlotGraph':
                                return (
                                    <PlotGraph
                                        key={index}
                                        points={block.props?.points || []}
                                        title={block.props?.title}
                                        description={block.props?.description}
                                        xAxisLabel={block.props?.xAxisLabel}
                                        yAxisLabel={block.props?.yAxisLabel}
                                    />
                                );
                            default:
                                return (
                                    <div key={index} className="p-4 border border-red-500 rounded text-red-500">
                                        Unknown component: {block.name}
                                    </div>
                                );
                        }
                    case 'link':
                        const isExternal = block.url.startsWith('http');
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
                        return null;
                }
            })}
        </div>
    );
};
