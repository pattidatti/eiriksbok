import React from 'react';
import { motion } from 'framer-motion';

interface Point {
    x: number;
    y: number;
}

interface PlotGraphProps {
    points: Point[];
    title: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

export const PlotGraph: React.FC<PlotGraphProps> = ({
    points,
    title,
    description,
    xAxisLabel = "Tid",
    yAxisLabel = "Lykke / Skjebne"
}) => {
    // Normalize points to SVG coordinates
    // Assuming x is 0-100 and y is 0-100 input, mapping to viewBox
    const width = 400;
    const height = 200;
    const padding = 40;

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(0, ...points.map(p => p.y));
    const maxY = Math.max(100, ...points.map(p => p.y));

    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;

    const mapX = (x: number) => padding + ((x - minX) / xRange) * (width - 2 * padding);
    const mapY = (y: number) => height - padding - ((y - minY) / yRange) * (height - 2 * padding);

    // Create path string
    const pathD = points.reduce((acc, point, index) => {
        const x = mapX(point.x);
        const y = mapY(point.y);
        return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            {description && <p className="text-slate-600 text-sm mb-6">{description}</p>}

            <div className="relative w-full max-w-lg mx-auto">
                {/* Y Axis Label */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-400 font-bold tracking-wider">
                    {yAxisLabel}
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    {/* Axes */}
                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                    />
                    <line
                        x1={padding}
                        y1={padding}
                        x2={padding}
                        y2={height - padding}
                        stroke="#cbd5e1"
                        strokeWidth="2"
                    />

                    {/* X Axis Label */}
                    <text
                        x={width / 2}
                        y={height - 10}
                        textAnchor="middle"
                        className="text-xs fill-slate-400 font-bold tracking-wider"
                    >
                        {xAxisLabel}
                    </text>

                    {/* The Plot Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#4f46e5" // Indigo-600
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />

                    {/* Points */}
                    {points.map((point, index) => (
                        <motion.circle
                            key={index}
                            cx={mapX(point.x)}
                            cy={mapY(point.y)}
                            r="4"
                            fill="#fff"
                            stroke="#4f46e5"
                            strokeWidth="2"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5 + (index * 0.1), duration: 0.3 }}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
};
