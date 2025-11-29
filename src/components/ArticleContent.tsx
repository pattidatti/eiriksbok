import React from 'react';
import { GlossaryText } from './GlossaryText';

import type { ContentBlock } from '../types';
// import { DemographyPage } from '../pages/DemographyPage';
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';
import { EICSimulation } from './EICSimulation';
import { TimelineComponent } from './TimelineComponent';

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
                                        <GlossaryText content={paragraph} />
                                    </p>
                                ))}
                            </div>
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
                                    <div key={index} className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl my-8">
                                        <h4 className="text-indigo-700 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
                                            Visste du at?
                                        </h4>
                                        <p className="text-slate-700 text-base leading-relaxed italic">
                                            {block.props?.content}
                                        </p>
                                    </div>
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
