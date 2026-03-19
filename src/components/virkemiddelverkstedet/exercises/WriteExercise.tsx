import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Eye } from 'lucide-react';
import type { Exercise, WriteData } from '../../../data/virkemiddelverkstedet/types';

interface WriteExerciseProps {
    exercise: Exercise;
    deviceColor?: string;
    onCorrect: (points: number) => void;
    onWrong?: () => void;
}

export const WriteExercise = ({ exercise, onCorrect }: WriteExerciseProps) => {
    const data = exercise.data as WriteData;
    const [text, setText] = useState('');
    const [showExample, setShowExample] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        setShowExample(true);
        onCorrect(100);
    };

    return (
        <div>
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            <div className="bg-slate-50 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <PenLine className="w-4 h-4 text-indigo-500" />
                    <p className="font-bold text-slate-800">{data.prompt}</p>
                </div>
                {data.hint && (
                    <p className="text-sm text-slate-400 italic">{data.hint}</p>
                )}
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitted}
                placeholder="Skriv her..."
                className="w-full p-4 border-2 border-slate-200 rounded-xl text-slate-800 resize-none focus:border-indigo-400 focus:outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-600"
                rows={3}
            />

            {!submitted && (
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleSubmit}
                        disabled={text.trim().length < 5}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Ferdig
                    </button>
                </div>
            )}

            {showExample && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        <p className="font-bold text-emerald-800 text-sm">Eksempel på godt svar:</p>
                    </div>
                    <p className="text-emerald-700 italic">"{data.exampleAnswer}"</p>
                </motion.div>
            )}
        </div>
    );
};
