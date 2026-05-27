import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import type { LearningPathTask } from '../../../types';
import { renderInlineMarkdown } from '../../markdownUtils';
import { useGlossary } from '../../../context/GlossaryContext';
import { CopyTasksButton } from '../CopyTasksButton';

interface OpenTasksPanelProps {
    tasks: (string | LearningPathTask)[];
    stepNumber: number;
}

export const OpenTasksPanel: React.FC<OpenTasksPanelProps> = ({ tasks, stepNumber }) => {
    const { entries } = useGlossary();

    if (tasks.length === 0) {
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">Oppgaver til diskusjon og skriving</h3>
                        <p className="text-xs text-slate-500">Bruk dem i klasserommet, hjemme eller som hjemmelekser.</p>
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
                    Oppgavene her krever ikke fullføring for å gå videre. Du kommer videre når
                    aktiviteten over er gjort.
                </span>
            </div>
        </motion.div>
    );
};
