import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Play, Scroll } from 'lucide-react';
import { QUEST_REGISTRY } from '../../../../data/philosophy/questRegistry';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';

interface QuestListProps {
    onSelectQuest: (questId: string) => void;
}

export const QuestList: React.FC<QuestListProps> = ({ onSelectQuest }) => {
    const { profile } = usePhilosophyProfile();

    // Group quests by some logic if needed, for now just list all
    const quests = Object.values(QUEST_REGISTRY);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {quests.map((quest, index) => {
                const isCompleted = profile.completedQuests.includes(quest.id);
                // Future logic for locking quests can go here
                const isLocked = false;

                return (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-all group
                            ${isCompleted
                                ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-200'
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                            }
                        `}
                        onClick={() => !isLocked && onSelectQuest(quest.id)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center text-xl
                                ${isCompleted ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}
                            `}>
                                <Scroll size={24} />
                            </div>
                            {isCompleted && (
                                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                                    <CheckCircle size={20} />
                                </div>
                            )}
                            {isLocked && (
                                <div className="bg-slate-100 text-slate-400 p-2 rounded-full">
                                    <Lock size={20} />
                                </div>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {quest.title}
                        </h3>

                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                            Dialog med {quest.philosopherId.charAt(0).toUpperCase() + quest.philosopherId.slice(1)}
                        </p>

                        <div className={`
                            flex items-center gap-2 font-bold text-sm uppercase tracking-wider
                            ${isCompleted ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}
                        `}>
                            {isCompleted ? (
                                <span>Fullført</span>
                            ) : (
                                <>
                                    <span>Start Reise</span>
                                    <Play size={16} fill="currentColor" />
                                </>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
