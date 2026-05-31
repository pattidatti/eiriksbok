import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface BridgeNode {
    subject: string;
    text?: string;
    // Alternativt navn fra eldre/cron-generert JSON (normaliseres til `text`).
    description?: string;
    link?: string;
    color?: string;
}

interface InterdisciplinaryBridgeProps {
    title?: string;
    centerEvent: string;
    nodes: BridgeNode[];
}

const DEFAULT_COLOR = '#6366f1';

export const InterdisciplinaryBridge: React.FC<InterdisciplinaryBridgeProps> = ({
    title,
    centerEvent,
    nodes = [],
}) => {
    const navigate = useNavigate();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Normaliser node-data: cron-generert JSON bruker av og til `description` i stedet for `text`.
    const items = nodes.map((n) => ({ ...n, text: n.text || n.description || '' }));

    // SVG-layout (kompakt — geometrien er tett, lite tomme hjørner)
    const size = 300;
    const center = size / 2;
    const radius = 100;

    return (
        <div className="interdisciplinary-bridge-container my-8 p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            {title && (
                <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 mb-5 text-center uppercase tracking-tight">
                    {title}
                </h3>
            )}

            <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-center md:items-center">
                {/* Venstre: kompakt bro-diagram */}
                <div className="w-full max-w-[240px] shrink-0">
                    <svg
                        viewBox={`0 0 ${size} ${size}`}
                        className="w-full h-auto overflow-visible drop-shadow-sm"
                    >
                        {/* Bro-kurver */}
                        <g className="bridges">
                            {items.map((node, index) => {
                                const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
                                const x = center + radius * Math.cos(angle);
                                const y = center + radius * Math.sin(angle);
                                const isActive = hoverIndex === index;

                                return (
                                    <motion.path
                                        key={`bridge-${index}`}
                                        d={`M ${center} ${center} Q ${center + (x - center) / 2} ${center + (y - center) / 2 - 16} ${x} ${y}`}
                                        fill="none"
                                        stroke={isActive ? node.color || DEFAULT_COLOR : '#e2e8f0'}
                                        strokeWidth={isActive ? 4 : 2}
                                        strokeDasharray={isActive ? 'none' : '7 4'}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{
                                            pathLength: 1,
                                            opacity: 1,
                                            stroke: isActive ? node.color || DEFAULT_COLOR : '#e2e8f0',
                                        }}
                                        transition={{ duration: 0.7, delay: index * 0.08 }}
                                    />
                                );
                            })}
                        </g>

                        {/* Fag-noder rundt midten */}
                        <g className="nodes">
                            {items.map((node, index) => {
                                const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
                                const x = center + radius * Math.cos(angle);
                                const y = center + radius * Math.sin(angle);
                                const isActive = hoverIndex === index;
                                const color = node.color || DEFAULT_COLOR;

                                return (
                                    <motion.g
                                        key={`node-${index}`}
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoverIndex(index)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                        onClick={() => node.link && navigate(node.link)}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.35 + index * 0.08 }}
                                    >
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={36}
                                            fill="white"
                                            stroke={isActive ? color : '#f1f5f9'}
                                            strokeWidth={isActive ? 3 : 2}
                                            className="transition-all duration-300"
                                        />
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={isActive ? 31 : 28}
                                            fill={isActive ? color : '#f8fafc'}
                                            className="transition-all duration-300"
                                        />
                                        <text
                                            x={x}
                                            y={y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className={`text-[10px] font-bold select-none transition-colors duration-300 ${isActive ? 'fill-white' : 'fill-slate-600'}`}
                                        >
                                            {node.subject.toUpperCase()}
                                        </text>
                                    </motion.g>
                                );
                            })}
                        </g>

                        {/* Sentralt tema */}
                        <motion.g
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <circle cx={center} cy={center} r={52} fill="white" stroke={DEFAULT_COLOR} strokeWidth={4} className="drop-shadow-lg" />
                            <circle cx={center} cy={center} r={46} fill={DEFAULT_COLOR} />
                            <foreignObject x={center - 44} y={center - 44} width={88} height={88} className="pointer-events-none">
                                <div className="flex items-center justify-center w-full h-full text-center px-1">
                                    <span className="text-white font-black text-[10px] leading-tight break-words hyphens-auto">{centerEvent}</span>
                                </div>
                            </foreignObject>
                        </motion.g>
                    </svg>
                </div>

                {/* Høyre: alle fag synlige som liste */}
                <div className="flex-1 w-full space-y-2.5">
                    {items.map((node, index) => {
                        const color = node.color || DEFAULT_COLOR;
                        const isActive = hoverIndex === index;
                        const clickable = Boolean(node.link);

                        return (
                            <div
                                key={`row-${index}`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                onClick={() => node.link && navigate(node.link)}
                                role={clickable ? 'button' : undefined}
                                tabIndex={clickable ? 0 : undefined}
                                onKeyDown={(e) => {
                                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        navigate(node.link!);
                                    }
                                }}
                                className={`group flex items-start gap-3 p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${clickable ? 'cursor-pointer' : ''}`}
                                style={{
                                    borderColor: isActive ? color : '#f1f5f9',
                                    backgroundColor: isActive ? `${color}0d` : '#f8fafc',
                                }}
                            >
                                <span
                                    className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="min-w-0">
                                    <div
                                        className="text-xs font-bold uppercase tracking-wide mb-0.5"
                                        style={{ color }}
                                    >
                                        {node.subject}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{node.text}</p>
                                    {node.link && (
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                                            Åpne relatert artikkel <ArrowUpRight size={13} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
