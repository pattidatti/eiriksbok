import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';

interface TopicInteractiveModelProps {
    topicId: string;
    subjectId: string;
}

interface EraNode {
    id: string;
    title: string;
    period: string;
    description: string;
    color: string;
    dotColor: string;
}

const literaryEras: EraNode[] = [
    {
        id: 'nasjonalromantikken',
        title: 'Nasjonalromantikken',
        period: '1840 - 1870',
        description: 'Bønder, natur og det typisk norske.',
        color: 'text-green-700',
        dotColor: 'bg-green-500',
    },
    {
        id: 'realismen',
        title: 'Realismen',
        period: '1870 - 1890',
        description: 'Sannheten skal frem. Samfunnskritikk.',
        color: 'text-blue-700',
        dotColor: 'bg-blue-500',
    },
    {
        id: 'ny-romantikken',
        title: 'Nyromantikken',
        period: '1890 - 1905',
        description: 'Følelser, mystikk og det ubevisste.',
        color: 'text-purple-700',
        dotColor: 'bg-purple-500',
    },
    {
        id: 'ny-realismen',
        title: 'Nyrealismen',
        period: '1905 - 1940',
        description: 'Etikk, historie og vanlige folks liv.',
        color: 'text-orange-700',
        dotColor: 'bg-orange-500',
    },
];

export const TopicInteractiveModel: React.FC<TopicInteractiveModelProps> = ({ topicId, subjectId }) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (topicId !== 'litteraturhistorie') {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 240;
            scrollContainerRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        Litterær Tidslinje
                    </h2>

                    {/* Compact Scroll Controls */}
                    <div className="hidden md:flex gap-1">
                        <button
                            onClick={() => scroll('left')}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    {/* Fade gradients */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent z-20 pointer-events-none md:hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent z-20 pointer-events-none md:hidden" />

                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex gap-4 min-w-max relative pt-2">
                            {/* Timeline Line */}
                            <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-100 z-0 rounded-full" />

                            {literaryEras.map((era, index) => (
                                <motion.button
                                    key={era.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/${subjectId}/${topicId}/${era.id}`)}
                                    className="group/card relative text-left w-[200px] flex-shrink-0 pt-3"
                                >
                                    {/* Timeline Dot */}
                                    <div className={`
                                        absolute top-0 left-4 w-2.5 h-2.5 rounded-full ${era.dotColor} 
                                        ring-4 ring-white shadow-sm z-10 transition-transform duration-300
                                        group-hover/card:scale-125
                                    `} />

                                    <div className={`
                                        h-full bg-white border border-slate-100 rounded-lg p-4 
                                        hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300
                                        flex flex-col relative overflow-hidden
                                    `}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {era.period}
                                            </span>
                                        </div>

                                        <h3 className={`text-sm font-bold mb-1.5 ${era.color} group-hover/card:text-indigo-600 transition-colors`}>
                                            {era.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {era.description}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
