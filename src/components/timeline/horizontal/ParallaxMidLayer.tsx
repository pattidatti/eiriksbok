import React, { useMemo } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { ERA_BOUNDS, TOTAL_WIDTH, getYearLandmarks, formatYear } from '../../../utils/timelineLayout';

interface Props {
    x: MotionValue<number>;
    viewportWidth: number;
}

// Midtlag: enorme epoke-bannere og flytende årstall som driver forbi.
// Beveger seg langsommere enn forgrunnen (0.6× via x-multiplikator i parent),
// så det føles som en bakvegg av historie elever beveger seg gjennom.
export const ParallaxMidLayer: React.FC<Props> = ({ x, viewportWidth }) => {
    const landmarks = useMemo(() => getYearLandmarks(), []);

    return (
        <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ x, width: TOTAL_WIDTH + viewportWidth, willChange: 'transform' }}
        >
            {/* Epoke-bannere — løftet over senterlinjen så de ikke kolliderer med årstall */}
            {ERA_BOUNDS.map(({ era, xStart, xEnd }) => {
                const center = (xStart + xEnd) / 2;
                return (
                    <div
                        key={era.id}
                        className="absolute -translate-x-1/2 select-none"
                        style={{ left: center, top: '12%' }}
                    >
                        <div
                            className="font-display font-black uppercase tracking-tight leading-none"
                            style={{
                                fontSize: 'clamp(6rem, 11vw, 13rem)',
                                color: era.color,
                                opacity: 0.18,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {era.label}
                        </div>
                    </div>
                );
            })}

            {/* Årstall-landemerker — plassert nær bunnen, over tidsaksen */}
            {landmarks.map((mark) => (
                <div
                    key={mark.year}
                    className="absolute -translate-x-1/2 select-none font-display font-bold leading-none"
                    style={{
                        left: mark.x,
                        bottom: '14%',
                        fontSize: mark.isMajor ? '4.5rem' : '2.25rem',
                        color: 'rgba(255,255,255,0.09)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {formatYear(mark.year)}
                </div>
            ))}
        </motion.div>
    );
};
