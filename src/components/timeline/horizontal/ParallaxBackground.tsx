import React from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { ERA_BOUNDS, TOTAL_WIDTH } from '../../../utils/timelineLayout';

// Statisk gradient bygget én gang — bytter epoke-farge ved hver epoke-grense
// (harde stop-par), så bandet morpher synlig når det skyves forbi.
const ERA_GRADIENT = (() => {
    const stops: string[] = [];
    for (const bound of ERA_BOUNDS) {
        const startPct = (bound.xStart / TOTAL_WIDTH) * 100;
        const endPct = (bound.xEnd / TOTAL_WIDTH) * 100;
        stops.push(`${bound.era.color} ${startPct}%`);
        stops.push(`${bound.era.color} ${endPct}%`);
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
})();

interface Props {
    x: MotionValue<number>;
    viewportWidth: number;
}

export const ParallaxBackground: React.FC<Props> = ({ x, viewportWidth }) => {
    return (
        <motion.div
            className="absolute inset-0"
            style={{ x, width: TOTAL_WIDTH + viewportWidth, willChange: 'transform' }}
        >
            <div
                className="absolute inset-0 opacity-40"
                style={{ background: ERA_GRADIENT }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/80" />
        </motion.div>
    );
};
