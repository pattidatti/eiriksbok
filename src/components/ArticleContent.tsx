import React from 'react';
import { GlossaryText } from './GlossaryText';

import type { ContentBlock } from '../types';
// import { DemographyPage } from '../pages/DemographyPage';
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';
import { EICSimulation } from './EICSimulation';
import { TimelineComponent } from './TimelineComponent';
import { FactBox } from './FactBox';

interface ArticleContentProps {
    content: ContentBlock[];
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
    return (
        <div className="article-content space-y-8">
            {content.map((block, index) => {
                switch (block.type) {
                    case 'text':
                        return (
                            <div key={index} className="prose prose-invert max-w-none">
                                {block.title && (
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4 mt-8">{block.title}</h2>
                                )}
                                {block.content.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={pIndex} className="mb-4 text-slate-700 leading-relaxed">
                                        {paragraph.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i}><GlossaryText content={part.slice(2, -2)} /></strong>;
                                            }
                                            if (part.startsWith('*') && part.endsWith('*')) {
                                                return <em key={i}><GlossaryText content={part.slice(1, -1)} /></em>;
                                            }
                                            return <GlossaryText key={i} content={part} />;
                                        })}
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
                            default:
                                return (
                                    <div key={index} className="p-4 border border-red-500 rounded text-red-500">
                                        Unknown component: {block.name}
                                    </div>
                                );
                        }
                    default:
                        return null;
                }
            })}
        </div>
    );
};
