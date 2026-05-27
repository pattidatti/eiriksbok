import { Pause, Play, FastForward, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorldStore, type Speed } from '../store/worldStore';

const SPEED_OPTIONS: { value: Speed; label: string }[] = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
];

const FAST_FORWARD_TICKS = 180; // ~3 simulerte år (60 ticks = 1 år)

export function SpeedControls() {
    const speed = useWorldStore((s) => s.speed);
    const setSpeed = useWorldStore((s) => s.setSpeed);
    const fastForward = useWorldStore((s) => s.fastForward);
    const isPlaying = speed > 0;

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/60 rounded-2xl">
                <motion.button
                    type="button"
                    onClick={() => setSpeed(isPlaying ? 0 : 1)}
                    whileTap={{ scale: 0.92 }}
                    className={`flex items-center justify-center w-9 h-8 rounded-xl text-white transition-colors shadow-md ${
                        isPlaying
                            ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-300/40'
                            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-300/40'
                    }`}
                    aria-label={isPlaying ? 'Pause simulering' : 'Start simulering'}
                >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </motion.button>
                <div className="w-px h-5 bg-slate-300" />
                {SPEED_OPTIONS.map((opt) => {
                    const active = speed === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSpeed(opt.value)}
                            className={`relative flex items-center gap-1 px-2 h-8 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                                active ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId="active-speed-pill"
                                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-300/40"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative flex items-center gap-0.5 tabular-nums">
                                {opt.value === 4 && <FastForward size={10} />}
                                {opt.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <motion.button
                type="button"
                onClick={() => fastForward(FAST_FORWARD_TICKS)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0.45)', '0 0 0 10px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                className="flex items-center gap-1.5 px-3 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
                aria-label="Spol tre år fram"
            >
                <ChevronsRight size={14} />
                <span className="hidden md:inline">Spol 3 år</span>
            </motion.button>
        </div>
    );
}
