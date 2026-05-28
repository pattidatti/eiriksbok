import React, { useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ERA_BOUNDS, formatYear, TOTAL_WIDTH } from '../../../utils/timelineLayout';
import { getEraForYear } from '../../../data/timelineEras';

interface Props {
    currentYear: number;
    scrollProgress: MotionValue<number>;
}

// Tynn akse nederst med epoke-bånd + flytende "current year"-lesetall.
// Hele aksen er en sammendrag-strek i full bredde, ikke parallax — den representerer
// hele tidsspennet i komprimert form, mens scene-en over driver det utvidede synet.
export const TimeAxisRail: React.FC<Props> = ({ currentYear, scrollProgress }) => {
    const era = useMemo(() => getEraForYear(currentYear), [currentYear]);
    const progressPct = useTransform(scrollProgress, [0, 1], ['0%', '100%']);

    return (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/85 backdrop-blur-sm">
            {/* Stor current-year readout */}
            <div className="flex items-center justify-between px-6 py-3 text-white">
                <div className="flex items-baseline gap-3">
                    <span
                        className="font-display text-3xl font-black leading-none md:text-5xl"
                        style={{ color: era.color }}
                    >
                        {formatYear(currentYear)}
                    </span>
                    <span className="font-display text-sm uppercase tracking-[0.25em] text-white/60">
                        {era.label}
                    </span>
                </div>
                <div className="hidden text-xs uppercase tracking-widest text-white/40 md:block">
                    Magisk modus · scroll for å reise
                </div>
            </div>

            {/* Komprimert epoke-bånd */}
            <div className="relative h-2 w-full overflow-hidden">
                {ERA_BOUNDS.map(({ era: e, xStart, xEnd }) => (
                    <div
                        key={e.id}
                        className="absolute top-0 h-full"
                        style={{
                            left: `${(xStart / TOTAL_WIDTH) * 100}%`,
                            width: `${((xEnd - xStart) / TOTAL_WIDTH) * 100}%`,
                            background: e.color,
                            opacity: 0.6,
                        }}
                    />
                ))}
                {/* Posisjons-indikator */}
                <motion.div
                    className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ left: progressPct }}
                />
            </div>
        </div>
    );
};
