import { useRef, useCallback } from 'react';
import { ERA_BOUNDS, TOTAL_WIDTH, yearToX, xToYear } from '../../utils/timelineLayout';
import { getEraForYear, formatEraRange } from '../../data/timelineEras';
import { formatYear } from '../../utils/timelineLayout';

interface Props {
    currentYear: number;
    onScrub: (year: number) => void;
    playing: boolean;
    onTogglePlay: () => void;
    speed: number;
    onSpeedChange: (s: number) => void;
}

const SPEEDS = [1, 2, 4];

export function AtlasTimeline({
    currentYear,
    onScrub,
    playing,
    onTogglePlay,
    speed,
    onSpeedChange,
}: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const era = getEraForYear(currentYear);
    const handleFrac = yearToX(currentYear) / TOTAL_WIDTH;

    const yearFromClientX = useCallback((clientX: number) => {
        const el = trackRef.current;
        if (!el) return currentYear;
        const rect = el.getBoundingClientRect();
        const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return xToYear(frac * TOTAL_WIDTH);
    }, [currentYear]);

    const onPointerDown = (e: React.PointerEvent) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        onScrub(yearFromClientX(e.clientX));
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        onScrub(yearFromClientX(e.clientX));
    };
    const onPointerUp = () => {
        dragging.current = false;
    };

    return (
        <div className="w-full px-4 pb-4 pt-2 select-none">
            <div className="flex items-center gap-4">
                {/* Play / pause */}
                <button
                    onClick={onTogglePlay}
                    className="shrink-0 w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center justify-center text-xl transition-transform active:scale-95"
                    title={playing ? 'Pause' : 'Spill av'}
                >
                    {playing ? '⏸' : '▶'}
                </button>

                {/* Årsvisning */}
                <div className="shrink-0 w-28 text-center">
                    <div className="text-2xl font-bold text-slate-800 tabular-nums leading-none">
                        {formatYear(currentYear)}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: era.color }}>
                        {era.shortLabel}
                    </div>
                </div>

                {/* Skala-spor med epoke-bånd */}
                <div className="flex-1">
                    <div
                        ref={trackRef}
                        className="relative h-11 rounded-lg overflow-hidden cursor-pointer touch-none shadow-inner"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    >
                        {/* Epoke-bånd */}
                        {ERA_BOUNDS.map((b) => {
                            const left = (b.xStart / TOTAL_WIDTH) * 100;
                            const width = ((b.xEnd - b.xStart) / TOTAL_WIDTH) * 100;
                            return (
                                <div
                                    key={b.era.id}
                                    className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        background: b.era.color,
                                        opacity: 0.32,
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-slate-900/70 truncate px-1">
                                        {b.era.shortLabel}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Fylt fortid */}
                        <div
                            className="absolute top-0 bottom-0 left-0 bg-amber-500/15 pointer-events-none"
                            style={{ width: `${handleFrac * 100}%` }}
                        />

                        {/* Håndtak */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-700 pointer-events-none"
                            style={{ left: `${handleFrac * 100}%` }}
                        >
                            <div className="absolute -top-0.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white shadow" />
                            <div className="absolute -bottom-0.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white shadow" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-1 px-0.5 text-[10px] text-slate-400 font-medium">
                        <span>{formatEraRange(ERA_BOUNDS[0].era).split(' - ')[0]}</span>
                        <span>i dag</span>
                    </div>
                </div>

                {/* Hastighet */}
                <div className="shrink-0 flex flex-col gap-1">
                    {SPEEDS.map((s) => (
                        <button
                            key={s}
                            onClick={() => onSpeedChange(s)}
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                                speed === s
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {s}×
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
