import React, { useState, useEffect, useRef } from 'react';
import { ChronoCard, type TimelineEvent } from './ChronoCard';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, Zap, RotateCcw, BookOpen } from 'lucide-react';

interface ChronoBoardProps {
    events: TimelineEvent[];
    onGameOver: (score: number) => void;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export const ChronoBoard: React.FC<ChronoBoardProps> = ({ events, onGameOver, difficulty = 'medium' }) => {
    // ... (state vars same)
    const [deck, setDeck] = useState<TimelineEvent[]>([]);
    const [hand, setHand] = useState<TimelineEvent | null>(null);
    const [placedCards, setPlacedCards] = useState<TimelineEvent[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
    const [highlightSlots, setHighlightSlots] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [highscore, setHighscore] = useState(0);
    const [hints, setHints] = useState(2);
    const [undos, setUndos] = useState(1);
    const [isHintActive, setIsHintActive] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [lastWrongHand, setLastWrongHand] = useState<TimelineEvent | null>(null);
    const [missedCards, setMissedCards] = useState<TimelineEvent[]>([]);

    // Load Highscore
    useEffect(() => {
        const saved = localStorage.getItem('chrono_highscore');
        if (saved) setHighscore(parseInt(saved, 10));
    }, []);

    const updateHighscore = (newScore: number) => {
        if (newScore > highscore) {
            setHighscore(newScore);
            localStorage.setItem('chrono_highscore', newScore.toString());
        }
    };

    // Drag and Drop State
    const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
    const dropZoneRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    // Auto-scroll State
    const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollDirection) return;
        const scrollAmount = 15;
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                if (scrollDirection === 'left') {
                    scrollContainerRef.current.scrollLeft -= scrollAmount;
                } else {
                    scrollContainerRef.current.scrollLeft += scrollAmount;
                }
            }
        }, 16);
        return () => clearInterval(interval);
    }, [scrollDirection]);

    useEffect(() => {
        if (events.length > 0) initGame();
    }, [events]);

    useEffect(() => {
        // Auto-highlight logic for tutorial
        if (hand && gameState === 'playing') {
            const timer = setTimeout(() => setHighlightSlots(true), 2500);
            return () => clearTimeout(timer);
        } else {
            setHighlightSlots(false);
        }
    }, [hand, gameState]);

    const initGame = () => {
        const shuffled = [...events].sort(() => Math.random() - 0.5);
        const firstCard = shuffled.pop();
        if (firstCard) {
            setPlacedCards([firstCard]);
            setHand(shuffled.pop() || null);
            setDeck(shuffled);
            setScore(0);
            setLives(3);
            setStreak(0);
            setHints(2);
            setUndos(1);
            setIsHintActive(false);
            setCanUndo(false);
            setLastWrongHand(null);
            setMissedCards([]);
            setGameState('playing');
            setHighlightSlots(false);
        }
    };

    const handleDrag = (info: PanInfo) => {
        // Simple collision detection
        const point = { x: info.point.x, y: info.point.y };
        let foundZone: number | null = null;

        dropZoneRefs.current.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (
                point.x >= rect.left &&
                point.x <= rect.right &&
                point.y >= rect.top &&
                point.y <= rect.bottom
            ) {
                foundZone = index;
            }
        });

        setActiveDropZone(foundZone);

        // Auto-scroll trigger based on container bounds
        if (scrollContainerRef.current) {
            const rect = scrollContainerRef.current.getBoundingClientRect();
            const margin = 120; // Distance from edge to start scrolling

            if (point.x < rect.left + margin && rect.left > 0) {
                setScrollDirection('left');
            } else if (point.x > rect.right - margin && rect.right < window.innerWidth) {
                setScrollDirection('right');
            } else if (point.x < 100) { // Screen edge fallbacks
                setScrollDirection('left');
            } else if (point.x > window.innerWidth - 100) {
                setScrollDirection('right');
            } else {
                setScrollDirection(null);
            }
        }
    };

    // Removed unused 'info' parameter
    const handleDragEnd = () => {
        if (activeDropZone !== null) {
            handlePlaceCard(activeDropZone);
        }
        setActiveDropZone(null);
        setScrollDirection(null);
    };

    const handlePlaceCard = (index: number) => {
        if (!hand || gameState !== 'playing' || feedback) return;

        let isValid = true;
        const prevCard = index > 0 ? placedCards[index - 1] : null;
        const nextCard = index < placedCards.length ? placedCards[index] : null;

        if (prevCard && hand.startDate < prevCard.startDate) isValid = false;
        if (nextCard && hand.startDate > nextCard.startDate) isValid = false;

        if (isValid) {
            // Success
            const newPlaced = [...placedCards];
            newPlaced.splice(index, 0, hand);
            setPlacedCards(newPlaced);
            setHand(null); // Clear hand immediately to prevent snapback

            setFeedback('correct');
            setTimeout(() => {
                setFeedback(null);

                // Scoring with streak bonus
                const streakBonus = Math.floor(streak / 3);
                const pointsEarned = 1 + streakBonus;
                setScore(prev => prev + pointsEarned);

                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > maxStreak) setMaxStreak(newStreak);

                // Celebrations
                if (newStreak >= 5 && newStreak % 5 === 0) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#4f46e5', '#818cf8', '#ffffff']
                    });
                }

                setIsHintActive(false);
                setHighlightSlots(false);

                const nextCardFromDeck = deck.length > 0 ? deck[deck.length - 1] : null;
                if (nextCardFromDeck) {
                    setDeck(prev => prev.slice(0, -1));
                    setHand(nextCardFromDeck);
                } else {
                    setHand(null);
                    updateHighscore(score + pointsEarned);
                    onGameOver(score + pointsEarned);
                }
            }, 600); // Wait for animation
            setCanUndo(false); // Can't undo a success
        } else {
            // Fail
            setFeedback('incorrect');
            setLastWrongHand(hand);
            setCanUndo(undos > 0);
            setTimeout(() => {
                setFeedback(null);
                setStreak(0); // Reset streak on mistake
                setIsHintActive(false);

                // Add to missed cards if not already there
                setMissedCards(prev => {
                    if (prev.find(c => c.id === hand.id)) return prev;
                    return [...prev, hand];
                });

                setLives(prev => {
                    const newLives = prev - 1;
                    if (newLives <= 0) {
                        setGameState('gameover');
                        updateHighscore(score);
                        onGameOver(score);
                    }
                    return newLives;
                });

                // Discard incorrectly placed card and draw new one
                const nextCardFromDeck = deck.length > 0 ? deck[deck.length - 1] : null;
                if (nextCardFromDeck) {
                    setDeck(prev => prev.slice(0, -1));
                    setHand(nextCardFromDeck);
                } else {
                    setHand(null);
                }
            }, 800);
        }
    };

    const handleUndo = () => {
        if (undos > 0 && canUndo && lastWrongHand) {
            setUndos(prev => prev - 1);
            setLives(prev => prev + 1); // Reclaim life
            setHand(lastWrongHand); // Get same card back
            setCanUndo(false);
        }
    };

    const useHint = () => {
        if (hints > 0 && !isHintActive && hand) {
            setHints(prev => prev - 1);
            setIsHintActive(true);
            setHighlightSlots(true);
        }
    };

    // Helper to get era color
    const getEraColor = () => {
        if (!hand) return 'indigo';
        const year = hand.startDate;
        if (year < 500) return 'amber'; // Ancient
        if (year < 1500) return 'emerald'; // Medieval
        if (year < 1900) return 'rose'; // Modern
        return 'indigo'; // Contemporary
    };

    const eraColor = getEraColor();

    return (
        <div className={`w-full flex flex-col gap-8 pb-32 relative transition-colors duration-1000 bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border border-slate-200/50`}>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 ${feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}
                        >
                            <span className="text-6xl font-black">
                                {feedback === 'correct' ? 'Riktig!' : 'Feil!'}
                            </span>
                            {feedback === 'correct' && streak >= 3 && (
                                <span className="bg-white/20 px-4 py-1 rounded-full font-bold text-sm">
                                    Combo Bonus! +{Math.floor(streak / 3) + 1}
                                </span>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Bar */}
            <div className={`flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-md border border-slate-100 sticky top-[64px] z-20 transition-all duration-500`}>
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Poeng</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-black text-${eraColor}-600 leading-none`}>{score}</span>
                            {highscore > 0 && (
                                <span className="text-[10px] font-bold text-slate-400">Best: {highscore}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">Liv</span>
                        <motion.div
                            key={lives}
                            className="flex gap-1 text-2xl"
                        >
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={i < lives ? "text-red-500 drop-shadow-sm" : "text-slate-200"}>♥</span>
                            ))}
                        </motion.div>
                    </div>

                    <div className="h-10 w-px bg-slate-100 mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase">Streak</span>
                            <div className="flex items-center gap-1">
                                <span className={`text-2xl font-black transition-colors ${streak > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                                    {streak}
                                </span>
                                {streak >= 3 && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1"
                                    >
                                        <Flame className="w-3 h-3 fill-current" />
                                        {Math.floor(streak / 3) + 1}x Bonus
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={useHint}
                        disabled={hints <= 0 || isHintActive || gameState !== 'playing'}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all
                            ${hints > 0 && !isHintActive
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}
                        `}
                    >
                        <Zap className={`w-3.5 h-3.5 ${hints > 0 ? 'fill-amber-500' : ''}`} />
                        Hint ({hints})
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={undos <= 0 || !canUndo}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all
                            ${undos > 0 && canUndo
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 animate-pulse'
                                : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}
                        `}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Angre ({undos})
                    </button>
                    <button onClick={initGame} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors">
                        Restart
                    </button>
                </div>
            </div>

            {/* The Board / Timeline */}
            <div ref={scrollContainerRef} className="relative min-h-[280px] flex items-center overflow-x-auto pb-4 pt-2 px-2 gap-0 no-scrollbar touch-pan-x">
                <div className="absolute top-1/2 left-0 w-full h-3 bg-slate-100 -z-10 rounded-full" />

                <DropZone
                    index={0}
                    onClick={() => handlePlaceCard(0)}
                    disabled={!hand || gameState !== 'playing'}
                    highlight={highlightSlots || activeDropZone === 0}
                    cardInHand={hand}
                    onRegister={(el) => { if (el) dropZoneRefs.current.set(0, el); else dropZoneRefs.current.delete(0); }}
                />

                <AnimatePresence>
                    {placedCards.map((card, index) => (
                        <React.Fragment key={card.id}>
                            <motion.div
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-2 z-10 shrink-0"
                            >
                                <ChronoCard event={card} isRevealed={true} />
                            </motion.div>
                            <DropZone
                                index={index + 1}
                                onClick={() => handlePlaceCard(index + 1)}
                                disabled={!hand || gameState !== 'playing'}
                                highlight={highlightSlots || activeDropZone === (index + 1)}
                                cardInHand={hand}
                                onRegister={(el) => { if (el) dropZoneRefs.current.set(index + 1, el); else dropZoneRefs.current.delete(index + 1); }}
                            />
                        </React.Fragment>
                    ))}
                </AnimatePresence>
            </div>

            <div className="h-48" /> {/* Increased spacer for the fixed bottom area */}

            {/* Hand / Draggable Area */}
            <div className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-${eraColor}-200 py-4 px-4 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]`}>
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    {gameState === 'gameover' ? (
                        <div className="w-full animate-in slide-in-from-bottom-5 fade-in duration-500 flex flex-col items-center">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-black text-slate-800 mb-2">Game Over!</h2>
                                <p className="text-slate-500 font-medium">Du klarte å plassere {score} hendelser riktig.</p>
                            </div>

                            {missedCards.length > 0 && (
                                <div className="w-full max-w-2xl bg-amber-50/50 border border-amber-100 rounded-[2rem] p-6 mb-8">
                                    <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Les deg opp på det du bommet på:
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {missedCards.map(card => (
                                            <div key={card.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
                                                <div>
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-md mb-1 inline-block">
                                                        {card.displayDate}
                                                    </span>
                                                    <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{card.title}</h4>
                                                </div>
                                                {card.sourceUrl && (
                                                    <a
                                                        href={card.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:underline"
                                                    >
                                                        Les artikkel →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={initGame} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-3">
                                <RotateCcw className="w-5 h-5" />
                                Prøv igjen
                            </button>
                        </div>
                    ) : hand ? (
                        <div className="flex flex-row items-center gap-8 min-h-[160px]">
                            <div className="hidden md:block text-right self-center">
                                <p className={`text-sm font-black text-${eraColor}-900 leading-tight`}>Din tur!</p>
                                <p className="text-slate-400 text-[10px] max-w-[120px] leading-tight mt-0.5">
                                    Dra kortet til riktig plass.
                                </p>
                            </div>

                            <div className="relative group cursor-grab active:cursor-grabbing">
                                <motion.div
                                    drag
                                    dragSnapToOrigin
                                    onDrag={(_, info) => handleDrag(info)}
                                    onDragEnd={() => handleDragEnd()}
                                    whileDrag={{ scale: 1.1, rotate: 5, zIndex: 100 }}
                                    className="touch-none"
                                >
                                    <ChronoCard
                                        event={hand}
                                        isRevealed={false}
                                        className={`shadow-2xl ring-4 ring-${eraColor}-50 border-${eraColor}-200 pointer-events-none-children`}
                                        showDescriptionWhenUnrevealed={difficulty !== 'hard'}
                                    />
                                </motion.div>

                                {/* Hint arrow only if not dragging */}
                                {gameState === 'playing' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
                                        className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-${eraColor}-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg pointer-events-none`}
                                    >
                                        Dra meg opp! ↑
                                    </motion.div>
                                )}
                            </div>

                            <div className="hidden md:block text-left opacity-30 self-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Neste:</p>
                                <div className="w-16 h-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <span className="text-slate-200 font-bold text-lg">?</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Laster...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface DropZoneProps {
    onClick: () => void;
    disabled: boolean;
    highlight: boolean;
    cardInHand: TimelineEvent | null;
    index: number;
    onRegister: (el: HTMLButtonElement | null) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onClick, disabled, highlight, cardInHand, onRegister }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (disabled) {
        return <div className="w-4 shrink-0" />;
    }

    return (
        <motion.button
            ref={onRegister}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={false}
            animate={{
                width: isHovered || highlight ? "12rem" : "1.5rem", // Narrower by default
                opacity: 1,
                scale: isHovered || highlight ? 1.02 : 1,
                backgroundColor: highlight ? 'rgba(238, 242, 255, 0.8)' : 'rgba(255, 255, 255, 0)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
                relative h-56 rounded-xl border-2 border-dashed mx-1 shrink-0 flex items-center justify-center overflow-hidden
                transition-colors duration-200 snap-center z-0
                ${highlight ? 'border-indigo-500 animate-pulse bg-indigo-50/50' : 'border-slate-200'}
                ${isHovered ? 'border-indigo-500 bg-indigo-100/50 cursor-pointer' : 'hover:border-indigo-300'}
                ${cardInHand && !disabled ? 'cursor-pointer' : ''}
            `}
        >
            <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                <span className={`
                    text-xl font-black transition-all duration-300
                    ${isHovered || highlight ? 'text-indigo-500 scale-150' : 'text-slate-200'}
                `}>
                    +
                </span>
                {(isHovered || highlight) && (
                    <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-indigo-600 uppercase tracking-wider text-center px-2 bg-white/80 rounded-full py-1"
                    >
                        Klikk eller Slipp
                    </motion.span>
                )}
            </div>

            {/* Ghost Card Effect when highlighting/hovering */}
            {(isHovered || highlight) && cardInHand && (
                <div className="absolute inset-0 p-2 opacity-30 grayscale pointer-events-none scale-90 origin-center top-2">
                    <ChronoCard
                        event={cardInHand}
                        isRevealed={false}
                        className="h-full w-full"
                        showDescriptionWhenUnrevealed={true}
                    />
                </div>
            )}
        </motion.button>
    );
};
