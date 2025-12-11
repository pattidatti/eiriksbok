import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import type { Monster } from './types';
import type { QuizQuestion } from '../../../types';
import { useDungeonQuestions } from './useDungeonQuestions';

// Constants
const GRAVITY = 0.8;
const JUMP_FORCE = -20;
const GROUND_Y = 620;
const HERO_SPEED = 6;
const HERO_SIZE = 128;
const MONSTER_SIZE = 96;
const SPAWN_INTERVAL = 3000; // ms

interface DungeonRunProps {
    subjectId: string;
    topicId: string;
    onExit: () => void;
}

interface ActiveMonster {
    instanceId: string;
    x: number;
    y: number;
    data: Monster;
    frame: number;
}

const SAMPLE_MONSTERS: Monster[] = [
    { id: 'troll', name: 'Troll', emoji: '👹', maxHp: 30, currentHp: 30, damage: 10, xpReward: 20, level: 1 },
    { id: 'dragon', name: 'Drage', emoji: '🐉', maxHp: 50, currentHp: 50, damage: 20, xpReward: 50, level: 5 },
    { id: 'ghost', name: 'Spøkelse', emoji: '👻', maxHp: 15, currentHp: 15, damage: 5, xpReward: 15, level: 2 },
];

export const DungeonRun: React.FC<DungeonRunProps> = ({ subjectId, topicId, onExit }) => {
    // 1. Data Loading
    const { questions, loading: questionsLoading } = useDungeonQuestions(subjectId, topicId);

    // Fix stale closure in game loop
    const questionsRef = useRef<QuizQuestion[]>([]);
    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    // Game Loop Ref
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    // Input Ref
    const keys = useRef<{ [key: string]: boolean }>({});

    // Game State Ref
    const gameStateRef = useRef<'EXPLORE' | 'COMBAT' | 'GAMEOVER' | 'QUIZ'>('EXPLORE');


    // Hero Ref
    const heroRef = useRef({
        x: 100,
        y: GROUND_Y - HERO_SIZE,
        vx: 0,
        vy: 0,
        facingRight: true,
        state: 'IDLE' as 'IDLE' | 'RUN' | 'ATTACK' | 'JUMP',
        frame: 0,
        frameTimer: 0,
        isAttacking: false,
    });

    // World Ref
    const activeMonstersRef = useRef<ActiveMonster[]>([]);
    const spawnTimerRef = useRef(0);
    const bgRef = useRef({ x: 0 });

    // React State for UI
    const [uiState, setUiState] = useState({
        hp: 100, maxHp: 100, mana: 50, level: 1
    });

    const [resources, setResources] = useState({
        durability: 100, // Sword
        arrows: 10,      // Bow
        mana: 50         // Magic
    });

    const [activeWeapon, setActiveWeapon] = useState<'SWORD' | 'BOW' | 'MAGIC'>('SWORD');

    // Game Mode State
    // COMBAT is now 'QUIZ' (Study Mode)
    // EXPLORE is the default "Action" mode
    const [gameMode, setGameMode] = useState<'EXPLORE' | 'QUIZ'>('EXPLORE');


    // Combat/Quiz State
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [answerFeedback, setAnswerFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);


    // Effect: Input Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
                e.preventDefault();
            }
            keys.current[e.code] = true;

            // Weapon Switching
            if (e.key === '1') setActiveWeapon('SWORD');
            if (e.key === '2') setActiveWeapon('BOW');
            if (e.key === '3') setActiveWeapon('MAGIC');

            // Toggle Study Mode
            if (e.code === 'KeyR' && gameStateRef.current === 'EXPLORE') {
                setGameMode('QUIZ');
                gameStateRef.current = 'QUIZ'; // Pause game loop updates

                pickNewQuestion();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Helper: Pick new question
    const pickNewQuestion = () => {
        const qs = questionsRef.current;
        if (qs.length === 0) return;
        const q = qs[Math.floor(Math.random() * qs.length)];
        setCurrentQuestion(q);

        // Shuffle options
        const opts = [...q.options];
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        setShuffledOptions(opts);
        setAnswerFeedback(null);
    };

    // --- UPDATE LOGIC ---
    const update = (dt: number) => {
        const hero = heroRef.current;
        const input = keys.current;

        // 1. Spawning Logic
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current > SPAWN_INTERVAL) {
            spawnTimerRef.current = 0;
            const monsterType = SAMPLE_MONSTERS[Math.floor(Math.random() * SAMPLE_MONSTERS.length)];

            // Spawn way off screen
            activeMonstersRef.current.push({
                instanceId: Math.random().toString(36).substr(2, 9),
                x: 1300 + (Math.random() * 500),
                y: GROUND_Y - MONSTER_SIZE,
                data: { ...monsterType }, // Clone stats
                frame: 0
            });
        }

        // 2. Hero Movement
        hero.vx = 0;
        if (input['ArrowRight'] || input['KeyD']) {
            hero.vx = HERO_SPEED;
            hero.facingRight = true;
            hero.state = 'RUN';
        } else if (input['ArrowLeft'] || input['KeyA']) {
            hero.vx = -HERO_SPEED;
            hero.facingRight = false;
            hero.state = 'RUN';
        } else {
            hero.state = 'IDLE';
        }

        const onGround = hero.y + HERO_SIZE >= GROUND_Y - 1;
        if (input['Space'] && onGround) {
            hero.vy = JUMP_FORCE;
            hero.state = 'JUMP';
        }

        // Physics
        hero.vy += GRAVITY;
        hero.x += hero.vx;
        hero.y += hero.vy;

        // Ground Collision
        if (hero.y + HERO_SIZE > GROUND_Y) {
            hero.y = GROUND_Y - HERO_SIZE;
            hero.vy = 0;
            if (hero.state === 'JUMP') hero.state = 'IDLE';
        }

        // 3. Screen Boundaries & Scrolling
        let scrollSpeed = 0;
        if (hero.x > 600 && hero.vx > 0) {
            scrollSpeed = hero.vx;
            hero.x = 600;
            bgRef.current.x -= scrollSpeed;
        }
        if (hero.x < 50) hero.x = 50;

        // 4. Update Monsters
        activeMonstersRef.current.forEach(m => {
            m.x -= scrollSpeed;
            m.x -= 1; // Walk left
        });

        activeMonstersRef.current = activeMonstersRef.current.filter(m => m.x > -200);

        // 5. Collision Detection => DAMAGE HERO
        for (const m of activeMonstersRef.current) {
            if (
                hero.x < m.x + MONSTER_SIZE &&
                hero.x + HERO_SIZE > m.x &&
                hero.y < m.y + MONSTER_SIZE &&
                hero.y + HERO_SIZE > m.y
            ) {
                // Contact Damage
                hero.vx = -10;
                hero.vy = -5;

                // React State update
                if (Math.random() > 0.9) {
                    setUiState(prev => ({ ...prev, hp: Math.max(0, prev.hp - 1) }));
                }
            }
        }

        // Animation Frame Logic
        hero.frameTimer += dt;
        if (hero.frameTimer > 100) {
            hero.frame++;
            hero.frameTimer = 0;
        }
    };

    // Game Loop
    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            const deltaTime = time - previousTimeRef.current;
            // Only update physics/logic if not in QUIZ mode
            if (gameStateRef.current !== 'QUIZ') {
                update(deltaTime);
            }
            // Always render
            renderCanvas();
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // --- RENDER ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const heroSpriteRef = useRef<HTMLCanvasElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement>(new Image());

    useEffect(() => {
        bgImageRef.current.src = '/assets/dungeon/bg.png';
        const rawHero = new Image();
        rawHero.src = '/assets/dungeon/hero.png';
        rawHero.onload = () => {
            const c = document.createElement('canvas');
            c.width = rawHero.width;
            c.height = rawHero.height;
            const ctx = c.getContext('2d');
            if (ctx) {
                ctx.drawImage(rawHero, 0, 0);
                const imageData = ctx.getImageData(0, 0, c.width, c.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 200 && data[i + 1] < 50 && data[i + 2] > 200) {
                        data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                heroSpriteRef.current = c;
            }
        };
    }, []);

    const renderCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const h = heroRef.current;
        ctx.clearRect(0, 0, 1280, 720);

        // BG
        const bgX = bgRef.current.x % 1280;
        if (bgImageRef.current.complete) {
            ctx.drawImage(bgImageRef.current, bgX - 1280, 0, 1280, 720);
            ctx.drawImage(bgImageRef.current, bgX, 0, 1280, 720);
            ctx.drawImage(bgImageRef.current, bgX + 1280, 0, 1280, 720);
        } else {
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(0, 0, 1280, 720);
        }

        // Ground Line
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(1280, GROUND_Y);
        ctx.stroke();

        // Monsters
        activeMonstersRef.current.forEach(m => {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(m.x + MONSTER_SIZE / 2, m.y + MONSTER_SIZE, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Monster
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(m.x, m.y, MONSTER_SIZE, MONSTER_SIZE);

            // Emoji
            ctx.font = '40px serif';
            ctx.textAlign = 'center';
            ctx.fillText(m.data.emoji, m.x + MONSTER_SIZE / 2, m.y + MONSTER_SIZE / 2 + 10);

            // HP Bar
            const hpPercent = m.data.currentHp / m.data.maxHp;
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(m.x, m.y - 15, MONSTER_SIZE, 8);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(m.x, m.y - 15, MONSTER_SIZE * hpPercent, 8);
        });

        // Hero
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(h.x + HERO_SIZE / 2, Math.min(h.y + HERO_SIZE, GROUND_Y), 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        let row = 0;
        if (h.state === 'RUN') row = 1;

        ctx.save();
        const centerX = h.x + HERO_SIZE / 2;
        if (!h.facingRight) {
            ctx.translate(centerX, h.y);
            ctx.scale(-1, 1);
            ctx.translate(-(centerX), -h.y);
        }

        if (heroSpriteRef.current) {
            const imgW = heroSpriteRef.current.width;
            const imgH = heroSpriteRef.current.height;
            const numFrames = 4;
            const frameW = imgW / numFrames;
            const isStrip = imgH < 96;
            const frameH = isStrip ? imgH : frameW;
            const sy = isStrip ? 0 : row * frameH;
            const sx = (h.frame % numFrames) * frameW;

            ctx.drawImage(heroSpriteRef.current, sx, sy, frameW, frameH, h.x, h.y, HERO_SIZE, HERO_SIZE);
        } else {
            ctx.fillStyle = h.facingRight ? '#4f46e5' : '#818cf8';
            ctx.fillRect(h.x, h.y, HERO_SIZE, HERO_SIZE);
        }
        ctx.restore();
    };

    // STUDY ACTIONS
    const handleStudyAnswer = (option: string) => {
        if (!currentQuestion) return;

        // Verify Answer
        let isCorrect = false;
        if (typeof currentQuestion.correctAnswer === 'number') {
            const correctText = currentQuestion.options[currentQuestion.correctAnswer];
            isCorrect = option === correctText;
        } else {
            isCorrect = option === currentQuestion.answer;
        }

        if (isCorrect) {
            setAnswerFeedback('CORRECT');
            // Auto-reward for now (can add selection screen later)
            setResources(prev => ({
                durability: Math.min(100, prev.durability + 30),
                arrows: prev.arrows + 10,
                mana: Math.min(100, prev.mana + 30)
            }));
            setUiState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 20) }));

            setTimeout(() => {
                setGameMode('EXPLORE');
                gameStateRef.current = 'EXPLORE';
                setAnswerFeedback(null);
            }, 1000);

        } else {
            setAnswerFeedback('WRONG');
            setTimeout(() => {
                // Punishment? Lose HP? For now just try again or exit
                setUiState(prev => ({ ...prev, hp: Math.max(0, prev.hp - 10) }));
                pickNewQuestion();
            }, 1000);
        }
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain bg-black shadow-2xl image-pixelated" />
            <style>{`.image-pixelated { image-rendering: pixelated; }`}</style>

            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                {/* Left: Stats */}
                <div className="flex gap-4">
                    <div className="bg-slate-800/90 p-4 rounded-xl border-2 border-slate-600 text-white w-64 shadow-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-sm text-slate-300 uppercase tracking-widest flex items-center gap-2"><Heart className="w-4 h-4 text-red-500 fill-red-500" /> Health</span>
                            <span className="font-mono text-sm">{uiState.hp}/{uiState.maxHp}</span>
                        </div>
                        <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" style={{ width: `${(uiState.hp / uiState.maxHp) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Center: Helper */}
                <div className="text-white/80 font-mono text-sm bg-black/50 px-4 py-2 rounded-full h-fit mt-2">
                    [R] Study Mode | [1] Sword [2] Bow [3] Magic | [Space] Attack
                </div>

                {/* Right: Weapons & Resources */}
                <div className="flex gap-2">
                    <div className={`p-4 rounded-xl border-2 transition-all ${activeWeapon === 'SWORD' ? 'bg-indigo-600 border-indigo-300 scale-110' : 'bg-slate-800/90 border-slate-600 opacity-50'}`}>
                        <div className="text-2xl mb-1">⚔️</div>
                        <div className="font-mono text-xs text-white">Durability</div>
                        <div className="font-bold text-white">{resources.durability}%</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 transition-all ${activeWeapon === 'BOW' ? 'bg-indigo-600 border-indigo-300 scale-110' : 'bg-slate-800/90 border-slate-600 opacity-50'}`}>
                        <div className="text-2xl mb-1">🏹</div>
                        <div className="font-mono text-xs text-white">Arrows</div>
                        <div className="font-bold text-white">{resources.arrows}</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 transition-all ${activeWeapon === 'MAGIC' ? 'bg-indigo-600 border-indigo-300 scale-110' : 'bg-slate-800/90 border-slate-600 opacity-50'}`}>
                        <div className="text-2xl mb-1">✨</div>
                        <div className="font-mono text-xs text-white">Mana</div>
                        <div className="font-bold text-white">{resources.mana}</div>
                    </div>
                </div>
            </div>

            {/* QUIZ / STUDY OVERLAY */}
            {gameMode === 'QUIZ' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 pointer-events-auto">
                    <div className="bg-slate-900 border-4 border-indigo-500 p-8 rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col gap-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Study Session</h2>
                            <p className="text-slate-400">Answer correctly to replenish your supplies!</p>
                        </div>

                        {/* Quiz Section */}
                        <div className="w-full flex flex-col">
                            {currentQuestion ? (
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {shuffledOptions.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => !answerFeedback && handleStudyAnswer(opt)}
                                                disabled={!!answerFeedback}
                                                className={`p-4 rounded-xl font-medium text-left transition-all border-2
                                                    ${answerFeedback === 'CORRECT' && (opt === currentQuestion.options[currentQuestion.correctAnswer as number] || opt === currentQuestion.answer)
                                                        ? 'bg-green-600 border-green-400 text-white'
                                                        : answerFeedback === 'WRONG' && (opt === currentQuestion.options[currentQuestion.correctAnswer as number] || opt === currentQuestion.answer)
                                                            ? 'bg-green-600/50 border-green-400/50 text-white' // Show correct one
                                                            : answerFeedback === 'WRONG' && opt === currentQuestion.options[currentQuestion.correctAnswer as number] // In case answer state logic highlights wrong 
                                                                ? 'bg-red-900/50 border-red-500/50 text-red-200'
                                                                : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500 hover:bg-slate-750'
                                                    }
                                                `}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {answerFeedback && (
                                        <div className={`mt-4 text-center font-black text-xl uppercase animate-pulse ${answerFeedback === 'CORRECT' ? 'text-green-400' : 'text-red-500'}`}>
                                            {answerFeedback === 'CORRECT' ? 'CORRECT! RESOURCES REPLENISHED!' : 'WRONG! OUCH!'}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-slate-400 py-10">
                                    <p>{questionsLoading ? "Loading..." : "No questions available."}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setGameMode('EXPLORE');
                                gameStateRef.current = 'EXPLORE';
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            Close [ESC]
                        </button>
                    </div>
                </div>
            )}

            <button onClick={onExit} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/50 p-3 rounded-full pointer-events-auto z-40">
                <ArrowLeft className="w-8 h-8" />
            </button>
        </div>
    );
};
