import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../../types';
import { Image } from '../../Image';
import { getEraForYear } from '../../../data/timelineEras';

interface BaseProps {
    event: GlobalTimelineEvent;
    x: number;
    y: number;
    onEventClick: (event: GlobalTimelineEvent) => void;
    isSelected: boolean;
}

// === MARQUEE ===
// Stor kort med bilde. Brukes for events med både hero-image og lesson-link
// som ligger nær viewport-fokus. Outer motion.div eier posisjon, inner
// motion.button eier scale — sånn unngår vi at whileHover overskriver translate.
interface MarqueeProps extends BaseProps {
    imageSrc: string;
}

export const MarqueeCard: React.FC<MarqueeProps> = React.memo(
    ({ event, x, y, imageSrc, onEventClick, isSelected }) => {
        const era = getEraForYear(event.startDate);
        const handleClick = useCallback(() => onEventClick(event), [event, onEventClick]);

        return (
            <motion.div
                className="absolute left-0 top-1/2 pointer-events-none"
                style={{
                    x,
                    y,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform',
                }}
            >
                <motion.button
                    type="button"
                    onClick={handleClick}
                    aria-label={`${event.title} (${event.displayDate})`}
                    className="pointer-events-auto block w-[200px] cursor-pointer select-none overflow-hidden rounded-xl bg-white text-left shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)] ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    style={{
                        transformOrigin: 'center',
                        boxShadow: isSelected
                            ? `0 16px 40px -8px ${era.color}, 0 0 0 3px ${era.color}`
                            : undefined,
                    }}
                    whileHover={{
                        scale: 1.06,
                        transition: { type: 'spring', stiffness: 320, damping: 22 },
                    }}
                    whileTap={{ scale: 0.97 }}
                >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                        <Image
                            src={imageSrc}
                            alt={event.title}
                            className="h-full w-full object-cover"
                        />
                        <div
                            className="absolute inset-x-0 bottom-0 h-1"
                            style={{ background: era.color }}
                        />
                    </div>
                    <div className="px-2.5 py-2">
                        <div
                            className="mb-0.5 font-display text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: era.color }}
                        >
                            {event.displayDate}
                        </div>
                        <div className="line-clamp-2 text-[12px] font-semibold leading-tight text-slate-900">
                            {event.title}
                        </div>
                    </div>
                </motion.button>
            </motion.div>
        );
    }
);
MarqueeCard.displayName = 'MarqueeCard';

// === CHIP ===
// Liten pille med årstall + tittel. Ingen bilde, ingen hover-scale (kun fargeendring).
// Brukes for events utenfor fokus eller events uten bilde/lesson-link.
export const ChipCard: React.FC<BaseProps> = React.memo(
    ({ event, x, y, onEventClick, isSelected }) => {
        const era = getEraForYear(event.startDate);
        const handleClick = useCallback(() => onEventClick(event), [event, onEventClick]);

        return (
            <motion.div
                className="absolute left-0 top-1/2 pointer-events-none"
                style={{
                    x,
                    y,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform',
                }}
            >
                <button
                    type="button"
                    onClick={handleClick}
                    aria-label={`${event.title} (${event.displayDate})`}
                    className="pointer-events-auto group flex max-w-[180px] items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-left backdrop-blur-sm ring-1 ring-white/10 hover:bg-slate-800/90 hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    style={{
                        boxShadow: isSelected ? `0 0 0 2px ${era.color}` : undefined,
                    }}
                >
                    <span
                        className="font-display text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: era.color }}
                    >
                        {event.displayDate}
                    </span>
                    <span className="truncate text-[10px] font-medium text-white/90">
                        {event.title}
                    </span>
                </button>
            </motion.div>
        );
    }
);
ChipCard.displayName = 'ChipCard';

// === DOT ===
// Bare en farget prikk — for events langt unna fokus. Klikkbar.
export const DotMarker: React.FC<BaseProps> = React.memo(
    ({ event, x, y, onEventClick, isSelected }) => {
        const era = getEraForYear(event.startDate);
        const handleClick = useCallback(() => onEventClick(event), [event, onEventClick]);

        return (
            <motion.button
                type="button"
                onClick={handleClick}
                aria-label={`${event.title} (${event.displayDate})`}
                className="absolute left-0 top-1/2 h-2.5 w-2.5 rounded-full ring-1 ring-white/40 hover:scale-150 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                style={{
                    x,
                    y,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: era.color,
                    boxShadow: isSelected ? `0 0 0 3px ${era.color}66` : undefined,
                    willChange: 'transform',
                }}
            />
        );
    }
);
DotMarker.displayName = 'DotMarker';
