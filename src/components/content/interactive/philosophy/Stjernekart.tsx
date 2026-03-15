import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHILOSOPHY_NETWORK } from '../../../../data/philosophy/network';
import type { NetworkNode } from '../../../../data/philosophy/network';
import { Info, Users, Link as LinkIcon, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getQuestsForPhilosopher } from '../../../../data/philosophy/questRegistry';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';

interface StjernekartProps {
    onStartQuest?: (questId: string) => void;
}

export const Stjernekart: React.FC<StjernekartProps> = ({ onStartQuest }) => {
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const { profile } = usePhilosophyProfile();

    const nodes = PHILOSOPHY_NETWORK.nodes;
    const links = PHILOSOPHY_NETWORK.links;

    const findNode = (id: string) => nodes.find(n => n.id === id);

    return (
        <div className="relative w-full h-[min(65vh,550px)] bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-xl border border-white/5">
            {/* Background Stars */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                {[...Array(80)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-px h-px bg-white rounded-full"
                        style={{
                            left: `${(i * 37 + 13) % 100}%`,
                            top: `${(i * 53 + 7) % 100}%`,
                            opacity: ((i * 29) % 100) / 100,
                        }}
                    />
                ))}
            </div>

            {/* Draggable Container */}
            <motion.div
                className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
                drag
                dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                whileTap={{ cursor: 'grabbing' }}
            >
                <svg
                    className="w-full h-full"
                    style={{ pointerEvents: 'all', userSelect: 'none' }}
                    viewBox="-20 -20 140 140"
                    preserveAspectRatio="xMidYMid slice"
                    onDragStart={(e) => e.preventDefault()}
                >
                    <defs>
                        {/* Per-era gradients */}
                        <radialGradient id="grad-antikken" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                            <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                        </radialGradient>
                        <radialGradient id="grad-middelalder" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                        </radialGradient>
                        <radialGradient id="grad-opplysning" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
                        </radialGradient>
                        <radialGradient id="grad-moderne" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                        </radialGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <g>
                        {/* Links */}
                        {links.map((link, i) => {
                            const source = findNode(link.source);
                            const target = findNode(link.target);
                            if (!source || !target) return null;

                            const isHighlighted = hoveredNode === link.source || hoveredNode === link.target ||
                                (selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target));

                            return (
                                <motion.line
                                    key={`${link.source}-${link.target}`}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke={isHighlighted ? '#818cf8' : '#ffffff'}
                                    strokeWidth={isHighlighted ? '0.4' : '0.1'}
                                    strokeOpacity={isHighlighted ? '0.6' : '0.15'}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: i * 0.08 }}
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
                                    cx={node.x} cy={node.y}
                                    r={node.size / 15}
                                    fill={`url(#grad-${node.era})`}
                                    filter="url(#glow)"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                                />
                                <text
                                    x={node.x}
                                    y={node.y + node.size / 10 + 2}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="1.8"
                                    fontWeight="900"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    opacity={hoveredNode === node.id || selectedNode?.id === node.id ? 0.9 : 0.4}
                                >
                                    {node.name}
                                </text>
                            </g>
                        ))}
                    </g>
                </svg>
            </motion.div>

            {/* Info Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute top-4 right-4 bottom-4 w-72 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 z-20 flex flex-col text-white overflow-y-auto"
                    >
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div className="mb-6">
                            <div
                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3"
                                style={{ backgroundColor: `${selectedNode.color}30`, borderColor: `${selectedNode.color}50`, border: '1px solid' }}
                            >
                                <Sparkles size={10} />
                                <span>{selectedNode.period}</span>
                            </div>
                            <h3 className="text-2xl font-black">{selectedNode.name}</h3>
                        </div>

                        <div className="space-y-4 flex-1 text-sm text-white/70 font-medium">
                            {/* Description */}
                            <div className="flex gap-3">
                                <Info className="shrink-0 mt-0.5" size={16} style={{ color: selectedNode.color }} />
                                <div>
                                    <p>{selectedNode.description}</p>
                                    <p className="text-white/40 text-xs mt-1 italic">{selectedNode.keyIdea}</p>
                                </div>
                            </div>

                            {/* Influences */}
                            <div className="flex gap-3">
                                <Users className="shrink-0 mt-0.5" size={16} style={{ color: selectedNode.color }} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Inspirert av</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {links.filter(l => l.target === selectedNode.id).map(l => (
                                            <button
                                                key={l.source}
                                                onClick={() => { const n = findNode(l.source); if (n) setSelectedNode(n); }}
                                                className="px-2 py-0.5 rounded bg-white/5 text-[10px] hover:bg-white/15 transition-colors"
                                            >
                                                {findNode(l.source)?.name || l.source}
                                            </button>
                                        ))}
                                        {links.filter(l => l.target === selectedNode.id).length === 0 && (
                                            <span className="text-white/20 text-xs italic">Grunnlegger</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <LinkIcon className="shrink-0 mt-0.5" size={16} style={{ color: selectedNode.color }} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Har pavirket</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {links.filter(l => l.source === selectedNode.id).map(l => (
                                            <button
                                                key={l.target}
                                                onClick={() => { const n = findNode(l.target); if (n) setSelectedNode(n); }}
                                                className="px-2 py-0.5 rounded bg-white/5 text-[10px] hover:bg-white/15 transition-colors"
                                            >
                                                {findNode(l.target)?.name || l.target}
                                            </button>
                                        ))}
                                        {links.filter(l => l.source === selectedNode.id).length === 0 && (
                                            <span className="text-white/20 text-xs italic">Ingen registrerte</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Available quests for this philosopher */}
                            <QuestButtons philosopherId={selectedNode.id} profile={profile} onStartQuest={onStartQuest} />
                        </div>

                        <div className="mt-auto pt-4">
                            <Link
                                to={`/krle/filosofi/${selectedNode.id}`}
                                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors text-center block"
                            >
                                Les mer i biblioteket
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-4">
                {[
                    { label: 'Antikken', color: '#d97706' },
                    { label: 'Middelalder', color: '#059669' },
                    { label: 'Opplysning', color: '#2563eb' },
                    { label: 'Moderne', color: '#7c3aed' },
                ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component: quest buttons for selected philosopher
function QuestButtons({
    philosopherId,
    profile,
    onStartQuest,
}: {
    philosopherId: string;
    profile: { completedQuests: string[] };
    onStartQuest?: (id: string) => void;
}) {
    const quests = getQuestsForPhilosopher(philosopherId);
    if (quests.length === 0) return null;

    return (
        <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Dialoger</p>
            {quests.map(q => {
                const done = profile.completedQuests.includes(q.id);
                const locked = q.prerequisites.some(p => !profile.completedQuests.includes(p));
                return (
                    <button
                        key={q.id}
                        disabled={locked}
                        onClick={() => !locked && onStartQuest?.(q.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${
                            locked
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : done
                                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                    : 'bg-indigo-500/30 text-white hover:bg-indigo-500/50'
                        }`}
                    >
                        <span>{q.title}{q.isSecondary ? ' (bonus)' : ''}</span>
                        {done && <span className="text-green-400">&#10003;</span>}
                        {locked && <span className="text-white/20">&#128274;</span>}
                    </button>
                );
            })}
        </div>
    );
}
