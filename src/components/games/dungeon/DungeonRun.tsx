import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Shield, Sword, Target, Sparkles, Skull } from 'lucide-react';
import { HeroStats, Monster, CombatAction } from './types';
import { fetchLesson } from '../../../utils/contentLoader'; // Re-use existing loader
import { Quiz } from '../../../components/Quiz'; // We might need a custom Quiz renderer, but let's try to adapt or build a mini one.
// Actually, for RPG integration, we need a custom "QuestionCard" that calls back onAnswer.
// The existing Quiz component manages its own state too much.

interface DungeonRunProps {
    subjectId: string;
    topicId: string;
    onExit: () => void;
}

// Mock Monsters for now
const MONSTERS: Partial<Monster>[] = [
    { name: 'Slime', emoji: '🟢', maxHp: 30, damage: 5, xpReward: 10 },
    { name: 'Goblin', emoji: '👺', maxHp: 50, damage: 8, xpReward: 20 },
    { name: 'Skeleton', emoji: '💀', maxHp: 40, damage: 12, xpReward: 25 },
    { name: 'Orc', emoji: '👹', maxHp: 80, damage: 15, xpReward: 40 },
    { name: 'Dragon', emoji: '🐉', maxHp: 200, damage: 25, xpReward: 100 },
];

export const DungeonRun: React.FC<DungeonRunProps> = ({ subjectId, topicId, onExit }) => {
    // Game State
    const [hero, setHero] = useState<HeroStats>({
        maxHp: 100,
        currentHp: 100,
        xp: 0,
        level: 1,
        mana: 3,
        maxMana: 5
    });

    const [monster, setMonster] = useState<Monster | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);

    // Quiz State
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Visual State
    const [shake, setShake] = useState(0);
    const [flash, setFlash] = useState(false);
    const [damageNumber, setDamageNumber] = useState<{ val: number, type: 'hero' | 'monster', id: number } | null>(null);

    // Initial Load
    useEffect(() => {
        loadQuestions();
    }, [subjectId, topicId]);

    // Spawn Monster if none
    useEffect(() => {
        if (!monster && !loading && questions.length > 0) {
            spawnMonster();
        }
    }, [monster, loading, questions]);

    const loadQuestions = async () => {
        // Mocking question loading or using a simple fetch loop for MVP
        // In a real implementation we would fetch all lessons for the topic.
        setLoading(true);
        // For now, we simulate loading
        setTimeout(() => {
            // Mock questions
            const mocks = [
                { question: "Hva er hovedstaden i Norge?", options: ["Oslo", "Bergen", "Trondheim"], correct: 0 },
                { question: "Hvem malte Skrik?", options: ["Munch", "Tidemand", "Gude"], correct: 0 },
                { question: "Når startet 2. verdenskrig?", options: ["1939", "1940", "1945"], correct: 0 },
                { question: "Hva er 2 + 2?", options: ["4", "5", "3"], correct: 0 },
                { question: "Hvilket årstall ble grunnloven underskrevet?", options: ["1814", "1905", "1884"], correct: 0 },
            ];
            setQuestions(mocks);
            setLoading(false);
        }, 1000);
    };

    const spawnMonster = () => {
        const template = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        // Scale with level
        const scale = 1 + (hero.level - 1) * 0.2;

        setMonster({
            id: Math.random().toString(),
            name: template.name!,
            emoji: template.emoji!,
            maxHp: Math.floor(template.maxHp! * scale),
            currentHp: Math.floor(template.maxHp! * scale),
            damage: Math.floor(template.damage! * scale),
            xpReward: Math.floor(template.xpReward! * scale),
            level: hero.level
        });

        // Pick new question
        setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
        setSelectedAction(null);
    };

    const handleActionSelect = (action: CombatAction) => {
        setSelectedAction(action);
    };

    const handleAnswer = (index: number) => {
        if (!monster || !currentQuestion || !selectedAction) return;

        const isCorrect = index === currentQuestion.correct;

        if (isCorrect) {
            // Player Attack
            let damage = 20; // Base sword
            if (selectedAction === 'BOW') {
                // Bow logic: 50% crit chance for 2x damage
                if (Math.random() > 0.5) {
                    damage = 40;
                    log("Fulltreffer med buen! (Kritisk treff)");
                } else {
                    damage = 15;
                    log("Pil traff, men ikke perfekt.");
                }
            } else if (selectedAction === 'MAGIC') {
                damage = 50; // High damage
                log("Magien dine treffer hardt!");
            } else {
                log("Du hugger til med sverdet!");
            }

            // Apply Damage to Monster
            const newHp = Math.max(0, monster.currentHp - damage);
            setMonster(prev => prev ? ({ ...prev, currentHp: newHp }) : null);
            showDamage(damage, 'monster');

            // Check Death
            if (newHp <= 0) {
                setTimeout(() => handleMonsterDeath(monster), 1000);
            } else {
                // Monster survived, prep next turn
                // Maybe small heal or mana gain?
                if (hero.mana < hero.maxMana) setHero(h => ({ ...h, mana: h.mana + 1 }));

                // New question
                setTimeout(() => {
                    setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
                    setSelectedAction(null);
                }, 1500);
            }

        } else {
            // Wrong Aswer - Monster Attacks
            let damageTaken = monster.damage;

            // Magic Risk
            if (selectedAction === 'MAGIC') {
                damageTaken = Math.floor(damageTaken * 1.5);
                log("Magien slo feil tilbake på deg! (Ekstra skade)");
            } else {
                log(`${monster.name} angriper deg!`);
            }

            const newHeroHp = Math.max(0, hero.currentHp - damageTaken);
            setHero(prev => ({ ...prev, currentHp: newHeroHp }));
            showDamage(damageTaken, 'hero');
            triggerShake();

            if (newHeroHp <= 0) {
                // Game Over
            } else {
                // New question
                setTimeout(() => {
                    setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
                    setSelectedAction(null);
                }, 1500);
            }
        }
    };

    const handleMonsterDeath = (m: Monster) => {
        log(`Du beseiret ${m.name}! +${m.xpReward} XP`);

        setHero(prev => {
            const newXp = prev.xp + m.xpReward;
            const nextLevelXp = prev.level * 100;
            if (newXp >= nextLevelXp) {
                log("LEVEL UP!");
                return {
                    ...prev,
                    xp: newXp - nextLevelXp,
                    level: prev.level + 1,
                    maxHp: prev.maxHp + 20,
                    currentHp: prev.maxHp + 20, // Full heal on level up
                };
            }
            return { ...prev, xp: newXp };
        });

        setMonster(null); // Will trigger spawn effect
    };

    const log = (msg: string) => {
        setCombatLog(prev => [msg, ...prev].slice(0, 3));
    };

    const showDamage = (val: number, type: 'hero' | 'monster') => {
        setDamageNumber({ val, type, id: Math.random() });
        setTimeout(() => setDamageNumber(null), 1000);
    };

    const triggerShake = () => {
        setShake(Date.now());
    };

    if (hero.currentHp <= 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black/90 text-white z-50">
                <h1 className="text-6xl font-black text-red-600 mb-4">GAME OVER</h1>
                <p className="text-2xl mb-8">Du nådde Level {hero.level}</p>
                <button
                    onClick={onExit}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Tilbake til menyen
                </button>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full flex flex-col p-4 max-w-5xl mx-auto ${shake ? 'animate-shake' : ''}`}>
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 3; }
            `}</style>

            {/* Top Bar: Hero Stats */}
            <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 mb-8 shadow-xl">
                <div className="flex items-center gap-6">
                    {/* Level */}
                    <div className="relative">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-900 shadow-lg z-10 relative">
                            {hero.level}
                        </div>
                        <div className="absolute -bottom-2 w-full text-center text-[10px] font-bold uppercase tracking-wider text-indigo-400">Lvl</div>
                    </div>

                    {/* HP Bar */}
                    <div className="w-48">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1 text-slate-400">
                            <span>Health</span>
                            <span>{hero.currentHp}/{hero.maxHp}</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: \`\${(hero.currentHp / hero.maxHp) * 100}%\` }}
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                            />
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="w-32 hidden sm:block">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1 text-slate-400">
                            <span>XP</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: \`\${(hero.xp / (hero.level * 100)) * 100}%\` }}
                            className="h-full bg-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onExit} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">

                {/* Damage Numbers */}
                <AnimatePresence>
                    {damageNumber && (
                        <motion.div
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, y: -50, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            className={`absolute font-black text-6xl z-50 drop-shadow-lg ${damageNumber.type === 'hero' ? 'text-red-500 top-1/2' : 'text-white top-1/4'}`}
                        >
                            -{damageNumber.val}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Monster */}
                <AnimatePresence mode="wait">
                    {monster ? (
                        <motion.div
                            key={monster.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0, rotate: 20 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            {/* Monster HP */}
                            <div className="w-32 h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
                                <motion.div
                                    animate={{ width: \`\${(monster.currentHp / monster.maxHp) * 100}%\` }}
                                className="h-full bg-red-500"
                                />
                            </div>

                            <div className="text-[150px] leading-none filter drop-shadow-2xl animate-bounce-slow">
                                {monster.emoji}
                            </div>

                            <h2 className="text-2xl font-black text-white mt-4 flex items-center gap-2">
                                {monster.name}
                                <span className="text-sm bg-slate-700 px-2 py-1 rounded text-slate-300">Lvl {monster.level}</span>
                            </h2>
                        </motion.div>
                    ) : (
                        <div className="text-slate-500 animate-pulse">Søker etter fiende...</div>
                    )}
                </AnimatePresence>
            </div>

            {/* Combat Controls */}
            <div className="mt-8 relative z-20">
                {/* Select Action Phase */}
                {!selectedAction && monster && (
                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <ActionCard
                            icon={Sword}
                            title="Sverd"
                            desc="Standard angrep"
                            color="from-blue-500 to-blue-600"
                            onClick={() => handleActionSelect('SWORD')}
                        />
                        <ActionCard
                            icon={Target}
                            title="Bue"
                            desc="Høy sjanse for kritisk treff"
                            color="from-green-500 to-green-600"
                            onClick={() => handleActionSelect('BOW')}
                        />
                        <ActionCard
                            icon={Zap}
                            title="Magi"
                            desc="Høy skade, men risikabelt!"
                            color="from-purple-500 to-purple-600"
                            onClick={() => handleActionSelect('MAGIC')}
                        />
                    </div>
                )}

                {/* Question Phase */}
                {selectedAction && currentQuestion && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                {selectedAction} angrep valgt
                            </h3>
                            <div className="text-xs text-slate-500">Svar riktig for å angripe!</div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-8 text-center leading-relaxed">
                            {currentQuestion.question}
                        </h2>

                        <div className="grid grid-cols-1 gap-3">
                            {currentQuestion.options.map((opt: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    className="p-4 rounded-xl bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium transition-all text-left border border-slate-600 hover:border-indigo-400"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Log */}
            <div className="fixed bottom-4 right-4 w-64 pointer-events-none">
                <AnimatePresence>
                    {combatLog.map((entry, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/50 text-white text-xs p-2 rounded mb-1 backdrop-blur-sm"
                        >
                            {entry}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ActionCard = ({ icon: Icon, title, desc, color, onClick }: any) => (
    <button
        onClick={onClick}
        className={`relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg hover:scale-105 transition-transform text-left border border-white/10`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform origin-top-right">
            <Icon className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <Icon className="w-8 h-8" />
            <div>
                <div className="font-black text-xl uppercase italic">{title}</div>
                <div className="text-xs text-white/80 font-medium">{desc}</div>
            </div>
        </div>
    </button>
);
