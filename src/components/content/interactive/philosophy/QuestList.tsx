import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, ChevronRight } from 'lucide-react';
import { QUEST_REGISTRY, type QuestConfig } from '../../../../data/philosophy/questRegistry';
import { ERA_LABELS, type Era } from '../../../../data/philosophy/types';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';

interface QuestListProps {
    onSelectQuest: (questId: string) => void;
}

const ERA_ORDER: Era[] = ['antikken', 'middelalder', 'opplysning', 'moderne'];

const ERA_BADGE_STYLES: Record<Era, string> = {
    antikken: 'bg-amber-50 text-amber-700 border-amber-200',
    middelalder: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    opplysning: 'bg-blue-50 text-blue-700 border-blue-200',
    moderne: 'bg-purple-50 text-purple-700 border-purple-200',
};

function groupByEra(quests: QuestConfig[]): Record<Era, { primary: QuestConfig[]; secondary: QuestConfig[] }> {
    const groups = {} as Record<Era, { primary: QuestConfig[]; secondary: QuestConfig[] }>;
    for (const era of ERA_ORDER) {
        groups[era] = { primary: [], secondary: [] };
    }
    for (const q of quests) {
        const bucket = q.isSecondary ? 'secondary' : 'primary';
        groups[q.era][bucket].push(q);
    }
    return groups;
}

export const QuestList: React.FC<QuestListProps> = ({ onSelectQuest }) => {
    const { profile } = usePhilosophyProfile();
    const allQuests = Object.values(QUEST_REGISTRY);
    const grouped = groupByEra(allQuests);

    return (
        <div className="space-y-8">
            {ERA_ORDER.map(era => {
                const group = grouped[era];
                const quests = [...group.primary, ...group.secondary];
                if (quests.length === 0) return null;

                return (
                    <div key={era}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${ERA_BADGE_STYLES[era]}`}>
                                {ERA_LABELS[era]}
                            </span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quests.map((quest, index) => (
                                <QuestCard
                                    key={quest.id}
                                    quest={quest}
                                    profile={profile}
                                    index={index}
                                    onSelect={onSelectQuest}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface QuestCardProps {
    quest: QuestConfig;
    profile: ReturnType<typeof usePhilosophyProfile>['profile'];
    index: number;
    onSelect: (id: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, profile, index, onSelect }) => {
    const isCompleted = profile.completedQuests.includes(quest.id);
    const isLocked = quest.prerequisites.some(
        prereq => !profile.completedQuests.includes(prereq)
    );
    const imagePath = `/images/filosofi/${quest.philosopherId}_hero.png`;
    const philosopherName = quest.philosopherId.charAt(0).toUpperCase() + quest.philosopherId.slice(1);

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            disabled={isLocked}
            onClick={() => !isLocked && onSelect(quest.id)}
            className={`
                relative w-full text-left rounded-2xl border overflow-hidden transition-all group
                ${isLocked
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                    : isCompleted
                        ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                }
            `}
        >
            <div className="flex gap-4 p-4">
                {/* Philosopher thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                        src={imagePath}
                        alt={philosopherName}
                        className={`w-full h-full object-cover ${isLocked ? 'grayscale' : ''}`}
                        loading="lazy"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            {quest.isSecondary && (
                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Bonusdialog</span>
                            )}
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">
                                {quest.title}
                            </h3>
                        </div>
                        {isCompleted && <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />}
                        {isLocked && <Lock size={14} className="text-slate-300 shrink-0 mt-0.5" />}
                    </div>

                    <p className="text-xs text-slate-500 leading-snug mb-2 line-clamp-2">
                        {quest.description}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">{philosopherName}</span>
                        {!isLocked && !isCompleted && (
                            <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        )}
                    </div>
                </div>
            </div>
        </motion.button>
    );
};
