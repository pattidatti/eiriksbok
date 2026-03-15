import { Link } from 'react-router-dom';
import type { LearningPathMetadata } from '../../types/LearningPath';
import { Clock, ChevronRight } from 'lucide-react';

const borderColors: Record<string, string> = {
    historie: 'border-l-amber-500',
    norsk: 'border-l-red-500',
    krle: 'border-l-violet-500',
    samfunnskunnskap: 'border-l-blue-500',
    musikk: 'border-l-pink-500',
    naturfag: 'border-l-green-500',
    annet: 'border-l-gray-400',
};

export const PathRow = ({ path }: { path: LearningPathMetadata }) => {
    const borderColor = borderColors[path.subjectId] || borderColors.annet;
    const title = path.title.replace('Laeringssti: ', '').replace('Læringssti: ', '');

    return (
        <Link to={path.path} className="block group">
            <div
                className={`
                    border-l-[3px] ${borderColor}
                    bg-white/60 backdrop-blur-sm
                    hover:bg-white/80 hover:shadow-sm
                    rounded-r-lg px-4 py-3
                    transition-all duration-200
                `}
            >
                {/* Line 1: Title + arrow */}
                <div className="flex items-center justify-between gap-3">
                    <span className="font-display font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                        {title}
                    </span>
                    <ChevronRight
                        size={14}
                        className="flex-shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
                    />
                </div>

                {/* Line 2: Description + metadata */}
                <div className="flex items-center gap-3 mt-1 min-w-0">
                    <span className="text-xs text-slate-400 truncate">
                        {path.description}
                    </span>
                    <span className="flex-shrink-0 flex items-center gap-2 ml-auto">
                        {path.year && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {path.year}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} />
                            {path.readTime || '2-3 timer'}
                        </span>
                    </span>
                </div>
            </div>
        </Link>
    );
};
