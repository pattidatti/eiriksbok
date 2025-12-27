import React, { useState } from 'react';
import type { SimulationPlayer, SkillType } from '../simulationTypes';
import { SKILL_DETAILS } from '../constants';

import { GameCard } from '../ui/GameCard';
import { Target, Zap, ChevronRight, Lock } from 'lucide-react';

interface SimulationSkillsProps {
    player: SimulationPlayer;
}

export const SimulationSkills: React.FC<SimulationSkillsProps> = ({ player }) => {
    const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);

    const skillsList = Object.keys(player.skills) as SkillType[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto p-4">
            <header className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-4">
                        <Target className="w-10 h-10 text-emerald-400" />
                        Ferdigheter
                    </h2>
                    <p className="text-slate-400 mt-1 font-medium italic">Se din fremgang og lær hvordan du blir en mester</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Skill List */}
                <div className="lg:col-span-5 space-y-4">
                    {skillsList.map(skillId => {
                        const skillData = player.skills[skillId];
                        const details = SKILL_DETAILS[skillId];
                        const isSelected = selectedSkill === skillId;
                        const progress = (skillData.xp / skillData.maxXp) * 100;

                        return (
                            <button
                                key={skillId}
                                onClick={() => setSelectedSkill(skillId)}
                                className={`w-full text-left p-4 rounded-3xl border-2 transition-all duration-300 group ${isSelected
                                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className={`text-lg font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                                            {details?.label || skillId}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nivå {skillData.level}</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : 'text-slate-600 group-hover:translate-x-1'}`} />
                                </div>
                                <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isSelected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 font-mono italic">{skillData.xp} XP</span>
                                    <span className="text-[10px] font-bold text-slate-500 font-mono italic">{skillData.maxXp} XP</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Skill Details */}
                <div className="lg:col-span-7">
                    {selectedSkill ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <GameCard className="bg-emerald-950/20 border-emerald-500/20">
                                <div className="space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
                                                {SKILL_DETAILS[selectedSkill]?.label}
                                            </h3>
                                            <p className="text-emerald-400 font-bold text-sm mt-1">Status: {player.skills[selectedSkill].level >= 10 ? 'Mester' : 'Læring'}</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                            <Zap className="w-8 h-8 text-emerald-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 px-1">Beskrivelse</h5>
                                            <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                                "{SKILL_DETAILS[selectedSkill]?.description}"
                                            </p>
                                        </div>

                                        <div>
                                            <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 px-1">Hvordan få erfaring</h5>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                    <Target className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <p className="text-sm text-slate-300">{SKILL_DETAILS[selectedSkill]?.xpSource}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 px-1">Nivåbonuser</h5>
                                            <div className="space-y-2">
                                                {Object.entries(SKILL_DETAILS[selectedSkill]?.bonuses || {}).map(([level, bonus]) => {
                                                    const isUnlocked = player.skills[selectedSkill!].level >= parseInt(level);
                                                    return (
                                                        <div
                                                            key={level}
                                                            className={`flex items-center gap-4 p-3 rounded-2xl border transition-colors ${isUnlocked
                                                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                                                : 'bg-black/20 border-white/5 opacity-50'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-display ${isUnlocked ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-600'
                                                                }`}>
                                                                {level}
                                                            </div>
                                                            <p className={`text-sm flex-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                                {bonus}
                                                            </p>
                                                            {!isUnlocked && <Lock className="w-4 h-4 text-slate-700" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GameCard>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                            <Target className="w-16 h-16 mb-6 text-slate-500" />
                            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Velg en ferdighet</h3>
                            <p className="text-sm text-slate-600 mt-2">Trykk på en ferdighet til venstre for å se detaljer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
