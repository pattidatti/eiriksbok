import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../../types';
import { TOTAL_WIDTH, yearToX, xToYear } from '../../../utils/timelineLayout';
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

export const HorizontalTimelineMode: React.FC<HorizontalTimelineModeProps> = ({
    events,
    onEventClick,
    selectedEventId,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1366
    );
    const [currentYear, setCurrentYear] = useState<number>(-200000);

    useEffect(() => {
        const onResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const horizontalDistance = Math.max(0, TOTAL_WIDTH - viewportWidth);
    const scrollDistance = horizontalDistance * SCROLL_TO_HORIZONTAL_RATIO;
    // Stage er fixed (Layout.tsx har overflow:hidden som dreper sticky);
    // container er en høy spacer som driver scrollYProgress via window-scroll.
    const stageHeight = 'calc(100vh - 64px)';
    const containerHeight = `calc(100vh + ${scrollDistance}px)`;

    // useScroll uten target tracker window.scrollY direkte (mer pålitelig her enn
    // target-ref-varianten under en overflow-hidden-ancestor i Layout.tsx).
    // Vi mapper scrollY [0, scrollDistance] → horisontal forflytning manuelt.
    const { scrollY } = useScroll();

    const scrollYProgress = useTransform(scrollY, [0, scrollDistance || 1], [0, 1], {
        clamp: true,
    });
    const x = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance]);
    const xMid = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance * 0.6]);
    const xBg = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance * 0.3]);

    useMotionValueEvent(scrollYProgress, 'change', (latest) => {
        const xVal = latest * horizontalDistance;
        setCurrentYear(xToYear(xVal + viewportWidth / 2));
    });

    // Forbered event-posisjoner. Bruker en lokal grid-allokator slik at nær-overlappende
    // events får ulike baner — vi sjekker forrige tildeling per bane og velger den banen
    // som er lengst unna i x-retning. Gir "DNA-strand"-mønster uten harde overlapp.
    const positionedEvents = useMemo(() => {
        const laneOffsets = [-220, -75, 75, 220];
        const lastXPerLane = laneOffsets.map(() => -Infinity);
        const sorted = events
            .filter((e) => typeof e.startDate === 'number')
            .sort((a, b) => a.startDate - b.startDate);
        return sorted.map((event) => {
            const eventX = yearToX(event.startDate);
            // Velg banen med størst horisontal avstand siden sist
            let bestLane = 0;
            let bestGap = -Infinity;
            for (let i = 0; i < laneOffsets.length; i++) {
                const gap = eventX - lastXPerLane[i];
                if (gap > bestGap) {
                    bestGap = gap;
                    bestLane = i;
                }
            }
            lastXPerLane[bestLane] = eventX;
            return { event, eventX, laneOffset: laneOffsets[bestLane] };
        });
    }, [events]);

    return (
        <div ref={containerRef} style={{ height: containerHeight }} className="relative">
            <div
                className="fixed left-0 right-0 top-16 z-0 overflow-hidden bg-slate-900"
                style={{ height: stageHeight }}
            >
                <ParallaxBackground x={xBg} viewportWidth={viewportWidth} />
                <ParallaxMidLayer x={xMid} viewportWidth={viewportWidth} />

                {/* Forgrunnslag: eventkort */}
                <motion.div
                    className="absolute inset-0"
                    style={{ x, width: TOTAL_WIDTH, willChange: 'transform' }}
                >
                    {positionedEvents.map(({ event, eventX, laneOffset }) => (
                        <HorizontalEventCard
                            key={event.id}
                            event={event}
                            x={eventX}
                            laneOffset={laneOffset}
                            onClick={() => onEventClick(event)}
                            isSelected={event.id === selectedEventId}
                        />
                    ))}
                </motion.div>

                <TimeAxisRail currentYear={currentYear} scrollProgress={scrollYProgress} />

                {/* Edge fades — visuell innramming */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent" />

                {/* Scroll-hint, vises kun i starten */}
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
