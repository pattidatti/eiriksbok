import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Info, ArrowUpRight } from 'lucide-react';
import { motionPresets } from '../../../styles/motion-presets';

interface BridgeNode {
    subject: string;
    text: string;
    link?: string;
    color?: string;
}

interface InterdisciplinaryBridgeProps {
    title?: string;
    centerEvent: string;
    nodes: BridgeNode[];
}

export const InterdisciplinaryBridge: React.FC<InterdisciplinaryBridgeProps> = ({
    title,
    centerEvent,
    nodes = []
}) => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const displayIndex = activeIndex !== null ? activeIndex : hoverIndex;

    // SVG Layout Constants
    const size = 400;
    const center = size / 2;
    const radius = 130;

    return (
        <div
            className="interdisciplinary-bridge-container my-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveIndex(null)}
        >
            {title && (
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6 text-center uppercase tracking-tight">
                    {title}
                </h3>
            )}

            <div className="flex justify-center items-center h-[400px] mb-4">
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="w-full h-full max-w-[400px] drop-shadow-sm overflow-visible"
                >
                    {/* Connection Lines (Bridges) */}
                    <g className="bridges">
                        {nodes.map((node, index) => {
                            const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
                            const x = center + radius * Math.cos(angle);
                            const y = center + radius * Math.sin(angle);

                            const isActive = displayIndex === index;
                            const isSelected = activeIndex === index;

                            return (
                                <motion.path
                                    key={`bridge-${index}`}
                                    d={`M ${center} ${center} Q ${center + (x - center) / 2} ${center + (y - center) / 2 - 20} ${x} ${y}`}
                                    fill="none"
                                    stroke={isActive ? (node.color || '#6366f1') : '#e2e8f0'}
                                    strokeWidth={isActive ? 4 : 2}
                                    strokeDasharray={(isActive || isSelected) ? "none" : "8 4"}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: 1,
                                        stroke: isActive ? (node.color || '#6366f1') : '#e2e8f0'
                                    }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                            );
                        })}
                    </g>

                    {/* Surrounding Subject Nodes */}
                    <g className="nodes">
                        {nodes.map((node, index) => {
                            const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
                            const x = center + radius * Math.cos(angle);
                            const y = center + radius * Math.sin(angle);

                            const isActive = displayIndex === index;
                            const isSelected = activeIndex === index;

                            return (
                                <motion.g
                                    key={`node-${index}`}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoverIndex(index)}
                                    onMouseLeave={() => setHoverIndex(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSelected && node.link) {
                                            navigate(node.link);
                                        } else {
                                            setActiveIndex(index);
                                        }
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.5 + index * 0.1 }}
                                >
                                    {/* Pulse effect when active */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.circle
                                                cx={x}
                                                cy={y}
                                                r={50}
                                                fill={node.color || '#6366f1'}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1.4, opacity: 0.2 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Main Node Circle */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={45}
                                        fill="white"
                                        stroke={isActive ? (node.color || '#6366f1') : '#f1f5f9'}
                                        strokeWidth={isActive ? 3 : 2}
                                        className="transition-all duration-300"
                                    />

                                    {/* Icon/Subject Background */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isActive ? 38 : 35}
                                        fill={isActive ? (node.color || '#6366f1') : '#f8fafc'}
                                        className="transition-all duration-300"
                                    />

                                    {/* Subject Text (In Node) */}
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className={`text-[11px] font-bold select-none transition-colors duration-300 ${isActive ? 'fill-white' : 'fill-slate-600'}`}
                                    >
                                        {node.subject.toUpperCase()}
                                    </text>
                                </motion.g>
                            );
                        })}
                    </g>

                    {/* Central Event Node */}
                    <motion.g
                        className="center-node cursor-pointer"
                        onClick={() => setActiveIndex(null)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <circle
                            cx={center}
                            cy={center}
                            r={65}
                            fill="white"
                            stroke="#6366f1"
                            strokeWidth={4}
                            className="drop-shadow-lg"
                        />
                        <circle
                            cx={center}
                            cy={center}
                            r={58}
                            fill="#6366f1"
                        />
                        <foreignObject
                            x={center - 50}
                            y={center - 50}
                            width={100}
                            height={100}
                            className="pointer-events-none"
                        >
                            <div className="flex items-center justify-center w-full h-full text-center p-2">
                                <span className="text-white font-black text-xs leading-none">
                                    {centerEvent}
                                </span>
                            </div>
                        </foreignObject>
                    </motion.g>
                </svg>
            </div>

            {/* Detail Information Area - Now Stacked Below */}
            <div className="min-h-[140px] flex flex-col justify-center">

                <AnimatePresence mode="wait">
                    {displayIndex !== null ? (
                        <motion.div
                            key="detail"
                            {...motionPresets.fadeIn}
                            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative group"
                        >
                            <button
                                onClick={() => setActiveIndex(null)}
                                className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600 transition-colors"
                            >
                                <Info size={16} />
                            </button>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                                    <BookOpen size={20} />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-indigo-900 mb-1">
                                        {nodes[displayIndex].subject}
                                    </h4>
                                    <p className="text-indigo-800 text-sm leading-relaxed mb-3">
                                        {nodes[displayIndex].text}
                                    </p>
                                    {nodes[displayIndex].link && (
                                        <button
                                            onClick={() => navigate(nodes[displayIndex].link!)}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm"
                                        >
                                            Åpne relatert artikkel <ArrowUpRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center max-w-xs mx-auto"
                        >
                            <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
                                <Info size={14} /> Klikk på fagområdene for detaljer
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
