import React from 'react';

import type { ContentBlock } from '../types';
import { DemographyPage } from '../pages/DemographyPage';
import { GovernmentExplorer } from './GovernmentExplorer';
import { HistoryLongLines } from './HistoryLongLines';
import { Quiz } from './Quiz';

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
                                {block.content.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={pIndex} className="mb-4">{paragraph}</p>
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
                            case 'DemographyModel':
                                return <DemographyPage key={index} />;
                            case 'GovernmentExplorer':
                                return <GovernmentExplorer key={index} />;
                            case 'HistoryLongLines':
                                return <HistoryLongLines key={index} initialLessonId={block.props?.initialLessonId} />;
                            case 'Quiz':
                                return <Quiz key={index} questions={block.props?.questions || []} />;
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
