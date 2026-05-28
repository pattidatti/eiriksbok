import React from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ERA_BOUNDS } from '../../../utils/timelineLayout';
import { ERA_HERO_IMAGES } from '../../../data/timelineEraImages';

interface Props {
    // focusX: scroll-progress oversatt til posisjon i timeline-koordinater (px).
    focusX: MotionValue<number>;
}

// Full-bleed hero-bilde per epoke som cross-fader når man scroller forbi.
// Hvert bilde er en fixed full-stage layer (ikke klippet til epoke-bredde),
// så det ser cinematic ut uten visuelle sømmer ved epoke-grenser.
export const EraBackgroundLayer: React.FC<Props> = ({ focusX }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {ERA_BOUNDS.map((bound) => (
                <EraImage key={bound.era.id} bound={bound} focusX={focusX} />
            ))}
            {/* Mørk overlay for kontrast mot kortene */}
            <div className="pointer-events-none absolute inset-0 bg-slate-950/55" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />
        </div>
    );
};

interface EraImageProps {
    bound: (typeof ERA_BOUNDS)[number];
    focusX: MotionValue<number>;
}

const EraImage: React.FC<EraImageProps> = ({ bound, focusX }) => {
    const src = ERA_HERO_IMAGES[bound.era.id];
    const fadeIn = 600;
    // Opacity stiger gradvis før epoke-start, holder 1 inni epoken, faller etter slutt.
    // Dette gir overlappende cross-fade mellom nabo-epoker — ingen brå overganger.
    const opacity = useTransform(
        focusX,
        [
            bound.xStart - fadeIn,
            bound.xStart + 200,
            bound.xEnd - 200,
            bound.xEnd + fadeIn,
        ],
        [0, 1, 1, 0],
        { clamp: true }
    );

    // Ken Burns-aktig sakte zoom: bildet svever sakte mens man er i epoken.
    // Bruker scroll-progress innen epoken som driver for scale.
    const scale = useTransform(
        focusX,
        [bound.xStart - fadeIn, bound.xEnd + fadeIn],
        [1.08, 1.18],
        { clamp: true }
    );

    if (!src) return null;

    return (
        <motion.div
            className="absolute inset-0"
            style={{
                opacity,
                scale,
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'opacity, transform',
            }}
        />
    );
};
