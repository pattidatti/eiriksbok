import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../../types';
import { TOTAL_WIDTH, yearToX } from '../../../utils/timelineLayout';
import { HorizontalEventCard } from './HorizontalEventCard';
import { ParallaxBackground } from './ParallaxBackground';
import { ParallaxMidLayer } from './ParallaxMidLayer';
import { TimeAxisRail } from './TimeAxisRail';

interface HorizontalTimelineModeProps {
    events: GlobalTimelineEvent[];
    onEventClick: (event: GlobalTimelineEvent) => void;
    selectedEventId: string | null;
}

// Hvor mye vertikal scroll-distanse vi gir for å traversere horisontalt.
// Lavere = raskere, høyere = mer cinematisk. 0.7 = ganske rolig scroll.
const SCROLL_TO_HORIZONTAL_RATIO = 0.7;

// Banetilbud for DNA-strand-allokatoren — fem baner innen ±140 så vi holder
// klar av TimeAxisRail (bunn) og top-baren på Chromebook-høyde (768px).
const LANE_OFFSETS = [-140, -70, 0, 70, 140];

// Kortbredde + minimum horisontal margin mellom to kort i samme bane.
const CARD_WIDTH = 140;
const CARD_GAP = 12;
const MIN_LANE_GAP = CARD_WIDTH + CARD_GAP;

export const HorizontalTimelineMode: React.FC<HorizontalTimelineModeProps> = ({
    events,
    onEventClick,
    selectedEventId,
}) => {
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1366
    );

    useEffect(() => {
        const onResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const horizontalDistance = Math.max(0, TOTAL_WIDTH - viewportWidth);
    const scrollDistance = horizontalDistance * SCROLL_TO_HORIZONTAL_RATIO;
    const stageHeight = 'calc(100vh - 64px)';
    const containerHeight = `calc(100vh + ${scrollDistance}px)`;

    // useScroll uten target tracker window.scrollY direkte (mer pålitelig her enn
    // target-ref-varianten under en overflow-hidden-ancestor i Layout.tsx).
    const { scrollY } = useScroll();
    const scrollYProgress = useTransform(scrollY, [0, scrollDistance || 1], [0, 1], {
        clamp: true,
    });
    const x = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance]);
    const xMid = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance * 0.6]);
    const xBg = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance * 0.3]);

    // Push-allokator: hver event velger banen som krever minst skyv mot høyre
    // for å holde MIN_LANE_GAP til forrige event på samme bane. I lite-tette
    // perioder står events på sin sanne yearToX. I tette klynger fanes events
    // ut horisontalt — året-merket på rail-aksen blir stående, men event-kortet
    // skyves litt til høyre for å unngå overlapp.
    const positionedEvents = useMemo(() => {
        const lastXPerLane: number[] = LANE_OFFSETS.map(() => -Infinity);
        const sorted = events
            .filter((e) => typeof e.startDate === 'number')
            .slice()
            .sort((a, b) => a.startDate - b.startDate);
        return sorted.map((event) => {
            const naturalX = yearToX(event.startDate);
            let bestLane = 0;
            let bestPush = Infinity;
            for (let i = 0; i < LANE_OFFSETS.length; i++) {
                const push = Math.max(0, lastXPerLane[i] + MIN_LANE_GAP - naturalX);
                if (push < bestPush) {
                    bestPush = push;
                    bestLane = i;
                }
            }
            const finalX = naturalX + bestPush;
            lastXPerLane[bestLane] = finalX;
            return { event, eventX: finalX, laneOffset: LANE_OFFSETS[bestLane] };
        });
    }, [events]);

    return (
        <div style={{ height: containerHeight }} className="relative">
            <div
                className="fixed left-0 right-0 top-16 z-0 overflow-hidden bg-slate-900"
                style={{ height: stageHeight }}
            >
                <ParallaxBackground x={xBg} viewportWidth={viewportWidth} />
                <ParallaxMidLayer x={xMid} viewportWidth={viewportWidth} />

                <motion.div
                    className="absolute inset-0"
                    style={{ x, width: TOTAL_WIDTH, willChange: 'transform', zIndex: 5 }}
                >
                    {positionedEvents.map(({ event, eventX, laneOffset }) => (
                        <HorizontalEventCard
                            key={event.id}
                            event={event}
                            x={eventX}
                            laneOffset={laneOffset}
                            onEventClick={onEventClick}
                            isSelected={event.id === selectedEventId}
                        />
                    ))}
                </motion.div>

                <TimeAxisRail
                    scrollProgress={scrollYProgress}
                    horizontalDistance={horizontalDistance}
                    viewportWidth={viewportWidth}
                />

                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent" />

                <ScrollHint scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
};

const ScrollHint: React.FC<{ scrollYProgress: MotionValue<number> }> = ({ scrollYProgress }) => {
    const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
    return (
        <motion.div
            style={{ opacity }}
            className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 font-display text-sm uppercase tracking-[0.3em] text-white/70"
        >
            ↓ scroll for å reise gjennom tiden ↓
        </motion.div>
    );
};
