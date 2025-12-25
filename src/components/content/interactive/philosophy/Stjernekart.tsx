import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHILOSOPHY_NETWORK } from '../../../../data/philosophy/network';
import type { NetworkNode } from '../../../../data/philosophy/network';
import { Info, Users, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stjernekart: React.FC = () => {
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const nodes = PHILOSOPHY_NETWORK.nodes;
    const links = PHILOSOPHY_NETWORK.links;

    const findNode = (id: string) => nodes.find(n => n.id === id);

    return (
        <div className="relative w-full h-[700px] bg-[#0A0A0A] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
            {/* Background Stars Effect */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-px h-px bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random()
                        }}
                    />
                ))}
            </div>

            {/* Draggable Container */}
            <motion.div
                className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
                drag
                dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                whileTap={{ cursor: "grabbing" }}
            >
                <svg
                    className="w-full h-full outline-none"
                    style={{
                        pointerEvents: 'all',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                    viewBox="-20 -20 140 140"
                    preserveAspectRatio="xMidYMid slice"
                    onDragStart={(e) => e.preventDefault()}
                >
                    <defs>
                        <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
                        </radialGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Group */}
                    <g>
                        {/* Connections */}
                        {links.map((link, i) => {
                            const source = findNode(link.source);
                            const target = findNode(link.target);
                            if (!source || !target) return null;

                            const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;

                            return (
                                <motion.line
                                    key={`${link.source}-${link.target}`}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    stroke={isHighlighted ? "#818cf8" : "#ffffff"}
                                    strokeWidth={isHighlighted ? "0.4" : "0.1"}
                                    strokeOpacity={isHighlighted ? "0.6" : "0.15"}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: i * 0.1 }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node) => (
                            <g
                                key={node.id}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(node);
                                }}
                            >
                                <motion.circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={node.size / 15}
                                    fill="url(#nodeGradient)"
                                    filter="url(#glow)"
                                    whileHover={{ r: node.size / 12, stroke: "#ffffff", strokeWidth: 0.2 }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, delay: 0.5 }}
                                />
                                <motion.text
                                    x={node.x}
                                    y={node.y + node.size / 10 + 2}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="1.8"
                                    fontWeight="900"
                                    className="pointer-events-none select-none uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                                >
                                    {node.name}
                                </motion.text>
                            </g>
                        ))}
                    </g>
                </svg>
            </motion.div>

            {/* Info Panel Overlay */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute top-8 right-8 bottom-8 w-80 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 p-8 z-20 flex flex-col text-white"
                    >
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            ×
                        </button>

                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Sparkles size={10} />
                                <span>{selectedNode.period}</span>
                            </div>
                            <h3 className="text-3xl font-black">{selectedNode.name}</h3>
                        </div>

                        <div className="space-y-6 flex-1 text-sm text-white/70 font-medium">
                            <div className="flex gap-4">
                                <Info className="shrink-0 text-indigo-400" size={20} />
                                <p>En sentral figur i {selectedNode.period.toLowerCase()} filosofi, kjent for sine bidrag til epistemologi og etikk.</p>
                            </div>
                            <div className="flex gap-4">
                                <Users className="shrink-0 text-indigo-400" size={20} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Inspirert av</p>
                                    <div className="flex flex-wrap gap-2">
                                        {links.filter(l => l.target === selectedNode.id).map(l => (
                                            <button
                                                key={l.source}
                                                onClick={() => {
                                                    const node = findNode(l.source);
                                                    if (node) setSelectedNode(node);
                                                }}
                                                className="px-2 py-1 rounded bg-white/5 text-[10px] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-left"
                                            >
                                                {findNode(l.source)?.name || l.source}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <LinkIcon className="shrink-0 text-indigo-400" size={20} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Har påvirket</p>
                                    <div className="flex flex-wrap gap-2">
                                        {links.filter(l => l.source === selectedNode.id).map(l => (
                                            <button
                                                key={l.target}
                                                onClick={() => {
                                                    const node = findNode(l.target);
                                                    if (node) setSelectedNode(node);
                                                }}
                                                className="px-2 py-1 rounded bg-white/5 text-[10px] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-left"
                                            >
                                                {findNode(l.target)?.name || l.target}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            to={`/krle/filosofi/${selectedNode.id}`}
                            className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all mt-auto shadow-xl text-center block"
                        >
                            Les Mer i Biblioteket
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend/Instructions */}
            <div className="absolute bottom-12 left-12 z-20">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Navigasjon</p>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Filosof</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-px bg-white/20" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Inflytelse</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .group:hover text { opacity: 1 !important; }
            ` }} />
        </div>
    );
};
