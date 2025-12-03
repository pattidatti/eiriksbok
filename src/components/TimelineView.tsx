import React, { useMemo, useState } from 'react';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


interface TimelineViewProps {
    startYear?: number;
    endYear?: number;
    subjects?: string[];
    className?: string;
    title?: string;
}



export const TimelineView: React.FC<TimelineViewProps> = ({
    startYear = -200000,
    endYear = 2025,
    subjects,
    className = "",
    title = "Tidslinje"
}) => {
    const { events, loading, error } = useGlobalTimeline();
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            if (event.startDate < startYear || (event.startDate > endYear)) return false;
            if (subjects && !subjects.includes(event.subjectId)) return false;
            if (selectedSubject !== 'all' && event.subjectId !== selectedSubject) return false;
            return true;
        });
    }, [events, startYear, endYear, subjects, selectedSubject]);

    // Get unique subjects for filter dropdown
    const uniqueSubjects = useMemo(() => {
        const subs = new Set(events.map(e => e.subjectId));
        return Array.from(subs).sort();
    }, [events]);

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Laster tidslinje...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Kunne ikke laste tidslinje</div>;

    // Sort by date descending (newest first)
    const sortedEvents = filteredEvents.sort((a, b) => b.startDate - a.startDate);

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Header / Filter */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-slate-800">{title}</h2>

                    {!subjects && (
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 rounded-full border border-slate-200 text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-indigo-300 transition-colors"
                        >
                            <option value="all">Alle fag</option>
                            {uniqueSubjects.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative max-w-6xl mx-auto w-full px-4">
                {/* Center Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 md:transform" />

                <div className="space-y-2">
                    {sortedEvents.map((event, index) => {
                        const isLeft = index % 2 === 0;
                        const isHovered = hoveredEventId === event.id;

                        // Subject Colors
                        const colorClass =
                            event.subjectId === 'historie' ? 'bg-amber-500 border-amber-500 text-amber-600' :
                                event.subjectId === 'norsk' ? 'bg-red-500 border-red-500 text-red-600' :
                                    event.subjectId === 'samfunnskunnskap' ? 'bg-blue-500 border-blue-500 text-blue-600' :
                                        'bg-slate-500 border-slate-500 text-slate-600';



                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index % 5 * 0.1 }}
                                className={`relative flex items-center md:justify-between ${isLeft ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Spacer for opposite side */}
                                <div className="hidden md:block w-5/12" />

                                {/* Center Year Marker */}
                                <div className={`absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${colorClass.split(' ')[0]} ${isHovered ? 'w-4 h-4 ring-2 ring-indigo-100' : ''}`} />
                                    <div className={`mt-1 bg-white px-2.5 py-1 rounded-md border shadow-sm text-sm font-bold whitespace-nowrap transition-colors duration-300 ${isHovered ? 'border-indigo-200 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>
                                        {event.displayDate}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                    <Link
                                        to={event.link}
                                        className="block group relative"
                                        onMouseEnter={() => setHoveredEventId(event.id)}
                                        onMouseLeave={() => setHoveredEventId(null)}
                                    >
                                        {/* Connector Line */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300
                                            ${isLeft
                                                ? `hidden md:block ${isHovered ? '-right-40 w-40' : '-right-16 w-16'}`
                                                : `hidden md:block ${isHovered ? '-left-40 w-40' : '-left-16 w-16'}`
                                            }
                                            md:block hidden
                                            ${isHovered ? 'bg-indigo-300 h-0.5' : 'bg-slate-200 h-px'}`}
                                        />
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 transition-all duration-300 md:hidden ${isHovered ? 'bg-indigo-300 h-0.5' : 'bg-slate-200 h-px'}`} />

                                        <div className={`p-4 rounded-xl border shadow-sm transition-all duration-300 bg-white ${isHovered ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-slate-100'}`}>
                                            <div className={`flex flex-col ${isLeft ? 'md:items-end' : ''}`}>
                                                <h3 className={`text-base font-bold mb-1 transition-colors ${isHovered ? 'text-indigo-700' : 'text-slate-800'}`}>
                                                    {event.title}
                                                </h3>

                                                {event.description && (
                                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-2">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${colorClass.split(' ')[0]}`} />
                                                    {event.subjectId}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
