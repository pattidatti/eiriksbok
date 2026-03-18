import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star } from 'lucide-react';

interface ScoreDisplayProps {
    score: number;
    streak: number;
    currentExercise: number;
    totalExercises: number;
}

export const ScoreDisplay = ({ score, streak, currentExercise, totalExercises }: ScoreDisplayProps) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                {/* Score */}
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="w-3.5 h-3.5" />
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={score}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                        >
                            {score}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Streak */}
                <AnimatePresence>
                    {streak >= 2 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold"
                        >
                            <Flame className="w-3.5 h-3.5" />
                            {streak}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                    {currentExercise} / {totalExercises}
                </span>
                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${(currentExercise / totalExercises) * 100}%`,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </div>
    );
};
