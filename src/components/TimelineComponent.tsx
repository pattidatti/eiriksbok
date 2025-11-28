import React from 'react';
import { motion } from 'framer-motion';

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
}

interface TimelineComponentProps {
    events: TimelineEvent[];
    title?: string;
    compact?: boolean;
}

export const TimelineComponent: React.FC<TimelineComponentProps> = ({ events, title, compact = false }) => {
    if (compact) {
        return (
            <div className="py-4">
                {title && (
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                        {title}
                    </h3>
                )}
                <div className="relative pl-4 border-l-2 border-indigo-100 space-y-6">
                    {events.map((event, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                            <div className="mb-1">
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full mb-1">
                                    {event.year}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{event.title}</h4>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed">{event.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="my-12 p-6 bg-slate-50 rounded-3xl border border-slate-200">
            {title && (
                <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">{title}</h3>
            )}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-200 transform md:-translate-x-1/2" />

                <div className="space-y-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Dot on the line */}
                            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm transform -translate-x-1/2 mt-1.5 z-10" />

                            {/* Content */}
                            <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                                <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                                    }`}>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-2">
                                        {event.year}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">{event.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
                                </div>
                            </div>

                            {/* Empty space for the other side */}
                            <div className="md:w-1/2" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
