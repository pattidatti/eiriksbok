import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import type { LiteraryDevice, DeviceProgress } from '../../data/virkemiddelverkstedet/types';
import { deviceColorMap } from '../../data/virkemiddelverkstedet/devices';
import { getExerciseCountForDevice, hasExercises } from '../../data/virkemiddelverkstedet/exercises';

interface DeviceCardProps {
    device: LiteraryDevice;
    progress: DeviceProgress;
    onClick: () => void;
}

export const DeviceCard = ({ device, progress, onClick }: DeviceCardProps) => {
    const colors = deviceColorMap[device.color];
    const totalExercises = getExerciseCountForDevice(device.id);
    const completedCount = progress.completedExercises.length;
    const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
    const isMastered = totalExercises > 0 && completedCount >= totalExercises;
    const isStarted = completedCount > 0;
    const available = hasExercises(device.id);

    // SVG progress ring
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <motion.button
            onClick={available ? onClick : undefined}
            disabled={!available}
            className={`group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 text-left w-full ${
                available
                    ? 'hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
            }`}
            whileHover={available ? { scale: 1.02 } : undefined}
            whileTap={available ? { scale: 0.98 } : undefined}
        >
            {/* Color accent */}
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-125`}
            />

            <div className="relative z-10 flex items-start gap-4">
                {/* Progress ring with emoji */}
                <div className="relative flex-shrink-0">
                    <svg width="68" height="68" className="-rotate-90">
                        <circle
                            cx="34"
                            cy="34"
                            r={radius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="4"
                        />
                        {progressPercent > 0 && (
                            <motion.circle
                                cx="34"
                                cy="34"
                                r={radius}
                                fill="none"
                                stroke={isMastered ? '#10b981' : '#6366f1'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        )}
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">
                        {device.emoji}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {device.name}
                        </h3>
                        {isMastered && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                        {!available && (
                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-sm text-slate-500 leading-snug line-clamp-2">
                        {device.shortDescription}
                    </p>

                    {/* Status badge */}
                    {available && (
                        <div className="mt-2">
                            {isMastered ? (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    Mester
                                </span>
                            ) : isStarted ? (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                    {Math.round(progressPercent)}%
                                </span>
                            ) : (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    Ny
                                </span>
                            )}
                        </div>
                    )}
                    {!available && (
                        <div className="mt-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                Kommer snart
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
};
