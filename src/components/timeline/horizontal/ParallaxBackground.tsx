import React, { useMemo } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { ERA_BOUNDS, TOTAL_WIDTH } from '../../../utils/timelineLayout';

interface Props {
    x: MotionValue<number>;
    viewportWidth: number;
}

// Bakgrunnslag: bred horisontal gradient som morpher mellom epoke-farger.
// Vi rendrer én lang div som strekker seg over TOTAL_WIDTH med en linear-gradient
// bygget fra ERA_BOUNDS — så bytter epokefargen seg når bandet skyves forbi.
export const ParallaxBackground: React.FC<Props> = ({ x, viewportWidth }) => {
    const gradient = useMemo(() => {
        const stops: string[] = [];
        for (const bound of ERA_BOUNDS) {
            const startPct = (bound.xStart / TOTAL_WIDTH) * 100;
            const endPct = (bound.xEnd / TOTAL_WIDTH) * 100;
            // Lager en myk gradient med epoke-fargen som mørk, dyp tone
            stops.push(`${bound.era.color} ${startPct}%`);
            stops.push(`${bound.era.color} ${endPct}%`);
        }
        return `linear-gradient(to right, ${stops.join(', ')})`;
    }, []);

    // Bakgrunn er nesten dobbelt så bred som total — gir rom å skyve sakte
    return (
        <motion.div
            className="absolute inset-0"
            style={{ x, width: TOTAL_WIDTH + viewportWidth, willChange: 'transform' }}
        >
            <div
                className="absolute inset-0 opacity-40"
                style={{ background: gradient }}
            />
            {/* Vignett-overlay som demper kantene */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/80" />
        </motion.div>
    );
};
