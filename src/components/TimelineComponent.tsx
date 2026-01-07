
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
    link?: string;
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
                        <div key={index} className="relative group">
                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                            <div className="mb-1">
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full mb-1">
                                    {event.year}
                                </span>
                                {event.link ? (
                                    event.link.startsWith('http') ? (
                                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-indigo-700 hover:text-indigo-900 hover:underline leading-tight transition-colors">
                                            {event.title} <ArrowRight size={14} className="inline opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ) : (
                                        <Link to={event.link} className="block text-sm font-bold text-indigo-700 hover:text-indigo-900 hover:underline leading-tight transition-colors">
                                            {event.title} <ArrowRight size={14} className="inline opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    )
                                ) : (
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{event.title}</h4>
                                )}
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed">{event.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="my-20">
            {title && (
                <div className="text-center mb-16">
                    <span className="inline-flex items-center justify-center p-3 bg-neon-accent/10 text-neon-accent rounded-2xl mb-4 ring-1 ring-neon-accent/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Calendar size={32} />
                    </span>
                    <h3 className="text-4xl font-display font-bold text-text-main mb-2 tracking-tight">{title}</h3>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-neon-accent to-transparent mx-auto rounded-full opacity-50" />
                </div>
            )}

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent transform md:-translate-x-1/2" />

                <div className="space-y-12 md:space-y-24">
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Dot on the line */}
                            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-slate-950 rounded-full border-2 border-neon-accent shadow-[0_0_15px_rgba(99,102,241,0.6)] transform -translate-x-1/2 mt-6 z-10 hidden md:block" />

                            {/* Content */}
                            <div className="ml-12 md:ml-0 md:w-1/2 md:px-12 group">
                                <div className={`relative p-8 rounded-2xl bg-surface-card border border-white/5 hover:border-neon-accent/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                                    }`}>
                                    {/* Connecting line to center - standard logic is hard with responsive text, simplified with hover glow */}

                                    <span className="inline-block px-3 py-1 bg-neon-accent/10 text-neon-accent text-sm font-mono font-bold rounded border border-neon-accent/20 mb-4 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                        {event.year}
                                    </span>
                                    <h4 className="text-2xl font-bold text-text-main mb-4 group-hover:text-neon-accent transition-colors">{event.title}</h4>
                                    <p className="text-text-muted text-base leading-relaxed">{event.description}</p>
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
