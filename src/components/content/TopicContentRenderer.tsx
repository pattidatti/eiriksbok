
import React from 'react';
import { motion } from 'framer-motion';
import { FactBox } from '../FactBox';
import { Comparison } from '../Comparison';
import { TimelineComponent } from '../TimelineComponent';
import { GlossaryText } from '../GlossaryText';

interface ContentBlock {
    type: 'header' | 'paragraph' | 'list' | 'component';
    level?: number;
    text?: string;
    items?: string[];
    component?: string;
    props?: any;
    // For specific content types
    title?: string;
    description?: string;
}

interface TopicContentRendererProps {
    content: ContentBlock[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const TopicContentRenderer: React.FC<TopicContentRendererProps> = ({ content }) => {
    if (!content || !Array.isArray(content)) return null;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8 max-w-4xl mx-auto"
        >
            {content.map((block, index) => {
                switch (block.type) {
                    case 'header':
                        const HeaderTag = `h${Math.min(Math.max(block.level || 2, 1), 6)}`;
                        const headerClasses = {
                            1: "text-4xl font-display font-bold text-slate-800 mt-12 mb-6",
                            2: "text-3xl font-display font-bold text-slate-800 mt-10 mb-4 border-b border-slate-200 pb-2",
                            3: "text-2xl font-display font-bold text-slate-700 mt-8 mb-3",
                            4: "text-xl font-display font-bold text-slate-700 mt-6 mb-2",
                            5: "text-lg font-bold text-slate-700 mt-4 mb-2",
                            6: "text-base font-bold text-slate-700 mt-4 mb-2"
                        };

                        return (
                            <motion.div key={index} variants={item}>
                                {React.createElement(
                                    HeaderTag,
                                    { className: headerClasses[block.level as keyof typeof headerClasses] || headerClasses[2] },
                                    block.text
                                )}
                            </motion.div>
                        );

                    case 'paragraph':
                        console.log('Rendering paragraph:', block.text);
                        return (
                            <div key={index} className="border-2 border-red-500 p-2">
                                <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {block.text || 'EMPTY TEXT'}
                                </p>
                            </div>
                        );

                    case 'list':
                        return (
                            <motion.div key={index} variants={item}>
                                <ul className="space-y-3 my-4">
                                    {block.items?.map((listItem, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700">
                                            <span className="mt-2 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                                            <span><GlossaryText content={listItem} /></span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );

                    case 'component':
                        if (block.component === 'FactBox') {
                            const { items, content, ...restProps } = block.props;
                            // Transform items array to content string if necessary, or pass items if updated FactBox supports it
                            // For now, let's join items if content is missing
                            const boxContent = content || (Array.isArray(items) ? items.join('\n') : '');

                            return (
                                <motion.div key={index} variants={item} className="my-8">
                                    <FactBox {...restProps} content={boxContent} />
                                </motion.div>
                            );
                        }

                        if (block.component === 'Comparison') {
                            // Transformation for Comparison component
                            // The JSON has leftItems and rightItems arrays
                            // we need to zip them into items array of objects
                            const { leftItems, rightItems, ...restProps } = block.props;
                            let comparedItems = block.props.items;

                            if (!comparedItems && Array.isArray(leftItems) && Array.isArray(rightItems)) {
                                comparedItems = leftItems.map((left: string, i: number) => ({
                                    left,
                                    right: rightItems[i] || ''
                                }));
                            }

                            return (
                                <motion.div key={index} variants={item} className="my-12">
                                    <Comparison {...restProps} items={comparedItems} />
                                </motion.div>
                            );
                        }

                        if (block.component === 'TimelineComponent') {
                            // Transformation for Timeline
                            // JSON events might lack 'title', mapping description to it or title if missing
                            const events = block.props.events.map((e: any) => ({
                                ...e,
                                title: e.title || e.year.toString(), // Fallback title
                                year: e.year.toString()
                            }));

                            return (
                                <motion.div key={index} variants={item} className="my-12">
                                    <TimelineComponent {...block.props} events={events} />
                                </motion.div>
                            );
                        }

                        return null;

                    default:
                        return null;
                }
            })}
        </motion.div>
    );
};
