import { useRef, useState } from 'react';

interface TransportProps {
    isPlaying: boolean;
    bpm: number;
    onPlay: () => void;
    onStop: () => void;
    onBpmChange: (bpm: number) => void;
    canPlay: boolean;
    stemMutes: { drums: boolean; bass: boolean; comp: boolean };
    onToggleStem: (stem: 'drums' | 'bass' | 'comp') => void;
}

export function Transport({
    isPlaying,
    bpm,
    onPlay,
    onStop,
    onBpmChange,
    canPlay,
    stemMutes,
    onToggleStem,
}: TransportProps) {
    const tapTimes = useRef<number[]>([]);
    const [tapFlash, setTapFlash] = useState(false);

    const handleTap = () => {
        const now = performance.now();
        const last = tapTimes.current[tapTimes.current.length - 1];
        if (last && now - last > 2000) {
            tapTimes.current = [];
        }
        tapTimes.current.push(now);
        if (tapTimes.current.length > 6) {
            tapTimes.current.shift();
        }
        if (tapTimes.current.length >= 2) {
            const intervals: number[] = [];
            for (let i = 1; i < tapTimes.current.length; i++) {
                intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
            }
            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const newBpm = Math.round(60000 / avg);
            if (newBpm >= 40 && newBpm <= 240) {
                onBpmChange(newBpm);
            }
        }
        setTapFlash(true);
        setTimeout(() => setTapFlash(false), 80);
    };

    return (
        <div className="flex items-center gap-4 px-4 h-14 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
                {isPlaying ? (
                    <button
                        onClick={onStop}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        aria-label="Stopp (Space)"
                        title="Stopp (Space)"
                    >
                        <span className="w-3.5 h-3.5 bg-white rounded-sm" />
                    </button>
                ) : (
                    <button
                        onClick={onPlay}
                        disabled={!canPlay}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        aria-label="Spill (Space)"
                        title="Spill (Space)"
                    >
                        <PlayIcon />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">
                    Tempo
                </span>
                <input
                    type="range"
                    min={40}
                    max={240}
                    step={1}
                    value={bpm}
                    onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
                    className="flex-1 accent-rose-500 cursor-pointer"
                />
                <div className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-14 text-right">
                    {bpm}
                </div>
                <button
                    onClick={handleTap}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        tapFlash
                            ? 'bg-rose-500 text-white border-rose-500 scale-95'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Trykk i takt for å sette tempo"
                >
                    TAP
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div className="hidden md:flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1">
                    Mute
                </span>
                <StemToggle label="Trommer" muted={stemMutes.drums} onClick={() => onToggleStem('drums')} />
                <StemToggle label="Bass" muted={stemMutes.bass} onClick={() => onToggleStem('bass')} />
                <StemToggle label="Komp" muted={stemMutes.comp} onClick={() => onToggleStem('comp')} />
            </div>
        </div>
    );
}

function StemToggle({ label, muted, onClick }: { label: string; muted: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${
                muted
                    ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                    : 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700'
            }`}
            title={muted ? `${label} av` : `${label} på`}
        >
            {label}
        </button>
    );
}

function PlayIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M4 2 L15 9 L4 16 Z" />
        </svg>
    );
}
