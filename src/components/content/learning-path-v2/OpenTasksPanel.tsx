import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, BookOpen, ExternalLink, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LearningPathTask, StepResource } from '../../../types';
import { renderInlineMarkdown } from '../../markdownUtils';
import { useGlossary } from '../../../context/GlossaryContext';
import { CopyTasksButton } from '../CopyTasksButton';

interface OpenTasksPanelProps {
    tasks: (string | LearningPathTask)[];
    stepNumber: number;
    resources?: StepResource[];
}

export const OpenTasksPanel: React.FC<OpenTasksPanelProps> = ({
    tasks,
    stepNumber,
    resources,
}) => {
    const { entries } = useGlossary();

    if (tasks.length === 0 && (!resources || resources.length === 0)) {
        return (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-slate-600 text-sm">
                Dette steget har ingen åpne oppgaver. Fokuser på aktiviteten.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm"
        >
            {resources && resources.length > 0 && <ResourceList resources={resources} />}

            {tasks.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">
                                    Oppgaver til diskusjon og skriving
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Bruk dem i klasserommet, hjemme eller som hjemmelekser.
                                </p>
                            </div>
                        </div>
                        <CopyTasksButton tasks={tasks} stepNumber={stepNumber} />
                    </div>

                    <ul className="space-y-3">
                        {tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                                <span className="font-mono text-xs font-bold text-slate-400 mt-1 bg-slate-50 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 flex-shrink-0">
                                    {stepNumber}.{i + 1}
                                </span>
                                <span className="text-sm md:text-base leading-relaxed">
                                    {renderInlineMarkdown(
                                        typeof task === 'string' ? task : task.text,
                                        entries
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>
                            Oppgavene her krever ikke fullføring for å gå videre. Du kommer
                            videre når aktiviteten over er gjort.
                        </span>
                    </div>
                </>
            )}
        </motion.div>
    );
};

const ResourceList: React.FC<{ resources: StepResource[] }> = ({ resources }) => {
    return (
        <div className="mb-6 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                        Kilder du kan bruke for å svare
                    </h3>
                    <p className="text-xs text-slate-500">
                        Artikler og ressurser som dekker dette steget.
                    </p>
                </div>
            </div>
            <ul className="space-y-2">
                {resources.map((r) => (
                    <ResourceLink key={r.url} resource={r} />
                ))}
            </ul>
        </div>
    );
};

const ResourceLink: React.FC<{ resource: StepResource }> = ({ resource }) => {
    const isExternal = /^https?:\/\//i.test(resource.url);
    const kind = resource.kind ?? (isExternal ? 'external' : 'article');

    const Icon =
        kind === 'video' ? PlayCircle : kind === 'external' ? ExternalLink : BookOpen;

    const content = (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition group">
            <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                    {resource.title}
                </p>
                {resource.description && (
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {resource.description}
                    </p>
                )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition flex-shrink-0 mt-0.5" />
        </div>
    );

    if (isExternal) {
        return (
            <li>
                <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    {content}
                </a>
            </li>
        );
    }

    return (
        <li>
            <Link to={resource.url} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </Link>
        </li>
    );
};
