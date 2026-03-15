import { useState } from 'react';
import type { LearningPathMetadata } from '../../types/LearningPath';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PathRow } from './PathRow';

const headerColors: Record<string, string> = {
    historie: 'text-amber-700',
    norsk: 'text-red-700',
    krle: 'text-violet-700',
    samfunnskunnskap: 'text-blue-700',
    musikk: 'text-pink-700',
    naturfag: 'text-green-700',
    annet: 'text-slate-700',
};

interface SubjectSectionProps {
    subjectId: string;
    subjectName: string;
    paths: LearningPathMetadata[];
    defaultOpen?: boolean;
}

export const SubjectSection = ({
    subjectId,
    subjectName,
    paths,
    defaultOpen = true,
}: SubjectSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const textColor = headerColors[subjectId] || headerColors.annet;

    if (paths.length === 0) return null;

    return (
        <section id={`subject-${subjectId}`} className="scroll-mt-28">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
                <div
                    className={`p-0.5 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                >
                    <ChevronDown size={18} />
                </div>
                <h2 className={`text-base font-display font-bold ${textColor}`}>
                    {subjectName}
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {paths.length}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                            transitionEnd: { overflow: 'visible' },
                        }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        <div className="space-y-1 pb-2 pl-2">
                            {paths.map((path) => (
                                <PathRow key={path.id} path={path} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
