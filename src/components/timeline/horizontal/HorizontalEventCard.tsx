import React from 'react';
import { motion } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../../types';
import { useTimelineImage } from '../../../hooks/useTimelineImage';
import { Image } from '../../Image';

interface HorizontalEventCardProps {
    event: GlobalTimelineEvent;
    x: number;
    laneOffset: number;
    onClick: () => void;
    isSelected: boolean;
}

export const HorizontalEventCard: React.FC<HorizontalEventCardProps> = React.memo(
    ({ event, x, laneOffset, onClick, isSelected }) => {
        const { src, eraColor } = useTimelineImage(event);

        return (
            <motion.button
                type="button"
                onClick={onClick}
                aria-label={`${event.title} (${event.displayDate})`}
                className="absolute left-0 top-1/2 w-[220px] -translate-x-1/2 cursor-pointer select-none overflow-hidden rounded-xl bg-white text-left shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                style={{
                    transform: `translate3d(${x}px, calc(-50% + ${laneOffset}px), 0)`,
                    willChange: 'transform',
                    boxShadow: isSelected
                        ? `0 12px 32px -8px ${eraColor}, 0 0 0 3px ${eraColor}`
                        : undefined,
                }}
                whileHover={{
                    scale: 1.06,
                    zIndex: 20,
                    transition: { type: 'spring', stiffness: 320, damping: 22 },
                }}
                whileTap={{ scale: 0.97 }}
            >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {src ? (
                        <Image src={src} alt={event.title} className="h-full w-full object-cover" />
                    ) : (
                        <div
                            className="h-full w-full"
                            style={{
                                background: `linear-gradient(135deg, ${eraColor}33 0%, ${eraColor}88 100%)`,
                            }}
                        />
                    )}
                    <div
                        className="absolute inset-x-0 bottom-0 h-1"
                        style={{ background: eraColor }}
                    />
                </div>
                <div className="px-3 py-2">
                    <div
                        className="mb-0.5 font-display text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: eraColor }}
                    >
                        {event.displayDate}
                    </div>
                    <div className="line-clamp-2 text-[13px] font-semibold leading-tight text-slate-900">
                        {event.title}
                    </div>
                </div>
            </motion.button>
        );
    }
);

HorizontalEventCard.displayName = 'HorizontalEventCard';
