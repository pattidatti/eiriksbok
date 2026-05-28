import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, Sparkles, BookOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PHILOSOPHY_NETWORK, formatBirthShort, formatLifespan } from '../../../../data/philosophy/network';
import type { NetworkNode } from '../../../../data/philosophy/network';
import type { Era } from '../../../../data/philosophy/types';
import { ERA_LABELS } from '../../../../data/philosophy/types';
import { getQuestsForPhilosopher } from '../../../../data/philosophy/questRegistry';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';

interface PhilosophyTimelineProps {
    onStartQuest?: (questId: string) => void;
}

const ERA_ORDER: Era[] = ['antikken', 'middelalder', 'opplysning', 'moderne'];

const ERA_STYLES: Record<Era, { bg: string; border: string; dot: string; text: string }> = {
    antikken: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
    middelalder: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    opplysning: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
    moderne: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
};

function groupByEra(nodes: NetworkNode[]): Record<Era, NetworkNode[]> {
    const groups = {} as Record<Era, NetworkNode[]>;
    for (const era of ERA_ORDER) groups[era] = [];
    for (const node of nodes) groups[node.era].push(node);
    return groups;
}

export const PhilosophyTimeline: React.FC<PhilosophyTimelineProps> = ({ onStartQuest }) => {
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const { profile } = usePhilosophyProfile();
    const scrollRef = useRef<HTMLDivElement>(null);

    const nodes = PHILOSOPHY_NETWORK.nodes;
    const links = PHILOSOPHY_NETWORK.links;
    const grouped = groupByEra(nodes);

    const findNode = (id: string) => nodes.find(n => n.id === id);
    const getIncoming = (id: string) => links.filter(l => l.target === id).map(l => findNode(l.source)).filter(Boolean) as NetworkNode[];
    const getOutgoing = (id: string) => links.filter(l => l.source === id).map(l => findNode(l.target)).filter(Boolean) as NetworkNode[];

    const hasCompletedQuest = (philosopherId: string) => {
        const quests = getQuestsForPhilosopher(philosopherId);
        return quests.some(q => profile.completedQuests.includes(q.id));
    };

    return (
        <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-black tracking-tight">Tankenes Tidslinje</h3>
                    <p className="text-xs text-slate-400">Trykk på en filosof for å utforske ideer og påvirkninger.</p>
                </div>
                <div className="flex gap-3">
                    {ERA_ORDER.map(era => (
                        <div key={era} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${ERA_STYLES[era].dot}`} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">{ERA_LABELS[era]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline scroll container */}
            <div
                ref={scrollRef}
                className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div className="flex gap-1 min-w-max">
                    {ERA_ORDER.map(era => {
                        const style = ERA_STYLES[era];
                        const eraNodes = grouped[era];
                        if (eraNodes.length === 0) return null;

                        return (
                            <div key={era} className={`flex items-end gap-0.5 ${style.bg} rounded-xl px-3 py-2.5 border ${style.border}`}>
                                {/* Era label - vertical */}
                                <div className={`text-[9px] font-black uppercase tracking-widest ${style.text} writing-mode-vertical mr-1 opacity-60 self-center`}
                                    style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
                                    {ERA_LABELS[era]}
                                </div>

                                {eraNodes.map((node, i) => {
                                    const isSelected = selectedNode?.id === node.id;
                                    const completed = hasCompletedQuest(node.id);
                                    const isConnected = selectedNode && (
                                        links.some(l => (l.source === selectedNode.id && l.target === node.id) ||
                                                       (l.target === selectedNode.id && l.source === node.id))
                                    );

                                    return (
                                        <React.Fragment key={node.id}>
                                            {/* Connection arrow between same-era nodes */}
                                            {i > 0 && links.some(l =>
                                                (l.source === eraNodes[i-1].id && l.target === node.id) ||
                                                (l.source === node.id && l.target === eraNodes[i-1].id)
                                            ) && (
                                                <ChevronRight size={12} className={`text-slate-300 shrink-0 self-center ${
                                                    isConnected || (selectedNode?.id === eraNodes[i-1].id) ? 'text-indigo-400' : ''
                                                }`} />
                                            )}

                                            <button
                                                onClick={() => setSelectedNode(isSelected ? null : node)}
                                                className={`flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all shrink-0 ${
                                                    isSelected
                                                        ? 'bg-white shadow-md scale-105 ring-2 ring-indigo-400'
                                                        : isConnected
                                                            ? 'bg-white/60 shadow-sm scale-[1.02]'
                                                            : 'hover:bg-white/50'
                                                }`}
                                            >
                                                <div className="relative">
                                                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${
                                                        isSelected ? 'border-indigo-500' :
                                                        isConnected ? 'border-indigo-300' :
                                                        'border-white'
                                                    }`}>
                                                        <img
                                                            src={`/images/filosofi/${node.id}_hero.webp`}
                                                            alt={node.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    {completed && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                            <CheckCircle size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center leading-tight max-w-[64px]">
                                                    <span className={`text-[10px] font-bold text-center ${
                                                        isSelected ? 'text-indigo-700' : 'text-slate-600'
                                                    }`}>
                                                        {node.name}
                                                    </span>
                                                    <span className="text-[8px] text-slate-400 font-medium mt-0.5">
                                                        {formatBirthShort(node)}
                                                    </span>
                                                </div>
                                            </button>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Panel - expands below timeline */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2" style={{ borderColor: selectedNode.color }}>
                                        <img
                                            src={`/images/filosofi/${selectedNode.id}_hero.webp`}
                                            alt={selectedNode.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-lg font-black">{selectedNode.name}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${ERA_STYLES[selectedNode.era].bg} ${ERA_STYLES[selectedNode.era].text}`}>
                                                {selectedNode.period}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                                                {formatLifespan(selectedNode)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">{selectedNode.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 italic mb-4">{selectedNode.keyIdea}</p>

                            {/* Influences */}
                            <div className="flex flex-wrap gap-4 mb-4">
                                <InfluenceChips
                                    label="Inspirert av"
                                    nodes={getIncoming(selectedNode.id)}
                                    onSelect={setSelectedNode}
                                    emptyText="Grunnlegger"
                                />
                                <InfluenceChips
                                    label="Påvirket"
                                    nodes={getOutgoing(selectedNode.id)}
                                    onSelect={setSelectedNode}
                                    emptyText="Ingen registrerte"
                                />
                            </div>

                            {/* Quests + Library link */}
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                                <QuestButtons
                                    philosopherId={selectedNode.id}
                                    profile={profile}
                                    onStartQuest={onStartQuest}
                                />
                                <Link
                                    to={`/krle/filosofi/${selectedNode.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                                >
                                    <BookOpen size={12} />
                                    Les mer
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function InfluenceChips({ label, nodes, onSelect, emptyText }: {
    label: string;
    nodes: NetworkNode[];
    onSelect: (node: NetworkNode) => void;
    emptyText: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}:</span>
            {nodes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {nodes.map(node => (
                        <button
                            key={node.id}
                            onClick={() => onSelect(node)}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                        >
                            <div className="w-3.5 h-3.5 rounded-full overflow-hidden">
                                <img src={`/images/filosofi/${node.id}_hero.webp`} alt="" className="w-full h-full object-cover" />
                            </div>
                            {node.name}
                        </button>
                    ))}
                </div>
            ) : (
                <span className="text-[10px] text-slate-300 italic">{emptyText}</span>
            )}
        </div>
    );
}

function QuestButtons({ philosopherId, profile, onStartQuest }: {
    philosopherId: string;
    profile: { completedQuests: string[] };
    onStartQuest?: (id: string) => void;
}) {
    const quests = getQuestsForPhilosopher(philosopherId);
    if (quests.length === 0) return null;

    return (
        <>
            {quests.map(q => {
                const done = profile.completedQuests.includes(q.id);
                const locked = q.prerequisites.some(p => !profile.completedQuests.includes(p));
                return (
                    <button
                        key={q.id}
                        disabled={locked}
                        onClick={() => !locked && onStartQuest?.(q.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            locked
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                : done
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        }`}
                    >
                        <Sparkles size={12} />
                        {q.title}
                        {done && ' ✓'}
                        {q.isSecondary && !done && ' (bonus)'}
                    </button>
                );
            })}
        </>
    );
}
