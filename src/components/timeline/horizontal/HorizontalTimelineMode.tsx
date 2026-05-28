import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../../types';
import { TOTAL_WIDTH, yearToX } from '../../../utils/timelineLayout';
import { MarqueeCard, ChipCard, DotMarker } from './HorizontalEventCard';
import { EraBackgroundLayer } from './EraBackgroundLayer';
import { ParallaxMidLayer } from './ParallaxMidLayer';
import { TimeAxisRail } from './TimeAxisRail';
import { useTimelineImageMap } from '../../../hooks/useTimelineImage';

interface HorizontalTimelineModeProps {
    events: GlobalTimelineEvent[];
    onEventClick: (event: GlobalTimelineEvent) => void;
    selectedEventId: string | null;
}

// Hvor mye vertikal scroll-distanse vi gir for å traversere horisontalt.
// Lavere = raskere, høyere = mer cinematisk. 0.7 = ganske rolig scroll.
const SCROLL_TO_HORIZONTAL_RATIO = 0.7;

// LOD-terskler (avstand fra viewport-fokus i timeline-px).
const MARQUEE_DIST = 700;
const CHIP_DIST = 1600;
// Bare events innen dette vinduet er virtualiserings-aktive (rundet til 200px-snapping).
const VIRTUAL_WINDOW = 2400;

// Tre-bånds layout: marquees i senterbåndet, chips/dots over og under.
const MARQUEE_Y = 0;
const MARQUEE_GAP = 220; // 200px kortbredde + 20px luft
// Tak på hvor langt marquee kan skyves fra sin naturlige x før den demoteres
// til chip. Hindrer at tette klynger akkumulerer push og havner langt unna sitt år.
const MAX_MARQUEE_PUSH = 500;
const CHIP_UPPER_LANES = [-150, -180, -210]; // 3 sub-lanes ovenfor senter
const CHIP_LOWER_LANES = [120, 150, 180];    // 3 sub-lanes nedenfor senter
const CHIP_LANE_GAP = 160;

type LodClass = 'marquee' | 'chip' | 'dot';

interface PositionedEvent {
    event: GlobalTimelineEvent;
    eventX: number;
    yOffset: number;
    isFeatured: boolean; // har bilde + lesson-link
    imageSrc: string | null;
}

export const HorizontalTimelineMode: React.FC<HorizontalTimelineModeProps> = ({
    events,
    onEventClick,
    selectedEventId,
}) => {
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1366
    );
    const imageMap = useTimelineImageMap();

    useEffect(() => {
        const onResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const horizontalDistance = Math.max(0, TOTAL_WIDTH - viewportWidth);
    const scrollDistance = horizontalDistance * SCROLL_TO_HORIZONTAL_RATIO;
    const stageHeight = 'calc(100vh - 64px)';
    const containerHeight = `calc(100vh + ${scrollDistance}px)`;

    const { scrollY } = useScroll();
    const scrollYProgress = useTransform(scrollY, [0, scrollDistance || 1], [0, 1], {
        clamp: true,
    });
    const x = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance]);
    const xMid = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance * 0.6]);

    // focusX = posisjon i timeline-koordinater som er midt i viewport.
    // Brukt av bakgrunns-cross-fade og LOD-klassifisering.
    const focusX = useTransform(
        scrollYProgress,
        (p) => p * horizontalDistance + viewportWidth / 2
    );

    // Throttled state for LOD/virtualisering — oppdateres maks én gang per rAF og
    // snappet til nærmeste 200px så vi ikke re-rendrer hver scroll-tick.
    const [focusXSnap, setFocusXSnap] = useState(viewportWidth / 2);
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<number>(viewportWidth / 2);
    useMotionValueEvent(focusX, 'change', (latest) => {
        pendingRef.current = latest;
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const snapped = Math.round(pendingRef.current / 200) * 200;
            setFocusXSnap((prev) => (prev === snapped ? prev : snapped));
        });
    });
    useEffect(() => () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    }, []);

    // Steg 1: klassifiser events som featured/chip og beregn natural-X.
    const classified = useMemo(() => {
        if (!imageMap) return [] as PositionedEvent[];
        return events
            .filter((e) => typeof e.startDate === 'number')
            .slice()
            .sort((a, b) => a.startDate - b.startDate)
            .map<PositionedEvent>((event) => {
                const imageSrc = imageMap[event.id] ?? null;
                const isFeatured = !!imageSrc && !!event.link;
                return {
                    event,
                    eventX: yearToX(event.startDate),
                    yOffset: 0,
                    isFeatured,
                    imageSrc,
                };
            });
    }, [events, imageMap]);

    // Steg 2: tre-bånds layout-allokator. Sorter events kronologisk, plasser
    // featured i marquee-bånd, øvrige alternerende i over/under-bånd.
    const positioned = useMemo(() => {
        const result: PositionedEvent[] = [];
        let marqueeLastX = -Infinity;
        const upperLastX: number[] = CHIP_UPPER_LANES.map(() => -Infinity);
        const lowerLastX: number[] = CHIP_LOWER_LANES.map(() => -Infinity);
        let alternator = 0;

        const placeAsChip = (item: PositionedEvent, naturalX: number) => {
            const useUpper = alternator % 2 === 0;
            alternator++;
            const lanes = useUpper ? CHIP_UPPER_LANES : CHIP_LOWER_LANES;
            const lastX = useUpper ? upperLastX : lowerLastX;
            let bestLane = 0;
            let bestPush = Infinity;
            for (let i = 0; i < lanes.length; i++) {
                const push = Math.max(0, lastX[i] + CHIP_LANE_GAP - naturalX);
                if (push < bestPush) {
                    bestPush = push;
                    bestLane = i;
                }
            }
            const finalX = naturalX + bestPush;
            lastX[bestLane] = finalX;
            result.push({ ...item, eventX: finalX, yOffset: lanes[bestLane], isFeatured: false });
        };

        for (const item of classified) {
            const naturalX = item.eventX;
            if (item.isFeatured) {
                const push = Math.max(0, marqueeLastX + MARQUEE_GAP - naturalX);
                if (push <= MAX_MARQUEE_PUSH) {
                    const finalX = naturalX + push;
                    marqueeLastX = finalX;
                    result.push({ ...item, eventX: finalX, yOffset: MARQUEE_Y });
                } else {
                    // Marquee-båndet er fullt her — demoter til chip.
                    placeAsChip(item, naturalX);
                }
            } else {
                placeAsChip(item, naturalX);
            }
        }
        return result;
    }, [classified]);

    // Steg 3: virtualisering — kun events innen vindu rundt fokus.
    const visible = useMemo(() => {
        const minX = focusXSnap - VIRTUAL_WINDOW;
        const maxX = focusXSnap + VIRTUAL_WINDOW;
        return positioned.filter((p) => p.eventX >= minX && p.eventX <= maxX);
    }, [positioned, focusXSnap]);

    return (
        <div style={{ height: containerHeight }} className="relative">
            <div
                className="fixed left-0 right-0 top-16 z-0 overflow-hidden bg-slate-950"
                style={{ height: stageHeight }}
            >
                {/* Cinematic full-bleed epoke-bakgrunn med cross-fade */}
                <EraBackgroundLayer focusX={focusX} />

                {/* Midt-lag: epoke-titler og årstall som driver forbi (parallax) */}
                <ParallaxMidLayer x={xMid} viewportWidth={viewportWidth} />

                {/* Forgrunns-lag: event-kort */}
                <motion.div
                    className="absolute inset-0"
                    style={{ x, width: TOTAL_WIDTH, willChange: 'transform', zIndex: 5 }}
                >
                    {visible.map((p) => {
                        const dist = Math.abs(p.eventX - focusXSnap);
                        const lod: LodClass =
                            dist < MARQUEE_DIST
                                ? p.isFeatured
                                    ? 'marquee'
                                    : 'chip'
                                : dist < CHIP_DIST
                                  ? 'chip'
                                  : 'dot';

                        const isSelected = p.event.id === selectedEventId;

                        if (lod === 'marquee' && p.imageSrc) {
                            return (
                                <MarqueeCard
                                    key={p.event.id}
                                    event={p.event}
                                    x={p.eventX}
                                    y={p.yOffset}
                                    imageSrc={p.imageSrc}
                                    onEventClick={onEventClick}
                                    isSelected={isSelected}
                                />
                            );
                        }
                        if (lod === 'chip') {
                            return (
                                <ChipCard
                                    key={p.event.id}
                                    event={p.event}
                                    x={p.eventX}
                                    y={p.yOffset}
                                    onEventClick={onEventClick}
                                    isSelected={isSelected}
                                />
                            );
                        }
                        return (
                            <DotMarker
                                key={p.event.id}
                                event={p.event}
                                x={p.eventX}
                                y={p.yOffset}
                                onEventClick={onEventClick}
                                isSelected={isSelected}
                            />
                        );
                    })}
                </motion.div>

                <TimeAxisRail
                    scrollProgress={scrollYProgress}
                    horizontalDistance={horizontalDistance}
                    viewportWidth={viewportWidth}
                />

                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950/95 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950/95 to-transparent" />

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
            className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 font-display text-sm uppercase tracking-[0.3em] text-white/70"
        >
            ↓ scroll for å reise gjennom tiden ↓
        </motion.div>
    );
};
