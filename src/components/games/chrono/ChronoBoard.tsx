import React, { useState, useEffect, useRef } from 'react';
import { ChronoCard, type TimelineEvent } from './ChronoCard';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

interface ChronoBoardProps {
    events: TimelineEvent[];
    onGameOver: (score: number) => void;
}

export const ChronoBoard: React.FC<ChronoBoardProps> = ({ events, onGameOver }) => {
    // ... (state vars same)
    const [deck, setDeck] = useState<TimelineEvent[]>([]);
    const [hand, setHand] = useState<TimelineEvent | null>(null);
    const [placedCards, setPlacedCards] = useState<TimelineEvent[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
    const [highlightSlots, setHighlightSlots] = useState(false);

    // Drag and Drop State
    const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
    const dropZoneRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

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
    };

    // Removed unused 'info' parameter
    const handleDragEnd = () => {
        if (activeDropZone !== null) {
            handlePlaceCard(activeDropZone);
        }
        setActiveDropZone(null);
    };

    const handlePlaceCard = (index: number) => {
        if (!hand || gameState !== 'playing') return;

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
            setScore(prev => prev + 1);
            setHighlightSlots(false);

            const nextCardFromDeck = deck.length > 0 ? deck[deck.length - 1] : null;
            if (nextCardFromDeck) {
                setDeck(prev => prev.slice(0, -1));
                setHand(nextCardFromDeck);
            } else {
                setHand(null);
                onGameOver(score + 1);
            }
        } else {
            // Fail
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameState('gameover');
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
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-32">
            {/* Status Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-20 z-20">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">Poeng</span>
                        <span className="text-2xl font-black text-indigo-600">{score}</span>
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
                </div>
                <div>
                    <button onClick={initGame} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        Start på nytt
                    </button>
                </div>
            </div>

            {/* The Board / Timeline */}
            <div className="relative min-h-[350px] flex items-center overflow-x-auto pb-8 pt-4 px-4 gap-0 no-scrollbar touch-pan-x">
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

            {/* Hand / Draggable Area */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-8 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-xl mx-auto flex flex-col items-center">
                    {gameState === 'gameover' ? (
                        <div className="text-center animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <h2 className="text-3xl font-black text-slate-800 mb-2">Game Over!</h2>
                            <p className="text-slate-600 mb-4">Du klarte å plassere {score} hendelser riktig.</p>
                            <button onClick={initGame} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">
                                Prøv igjen
                            </button>
                        </div>
                    ) : hand ? (
                        <div className="flex flex-row items-center gap-8 min-h-[220px]">
                            <div className="hidden md:block text-right">
                                <p className="text-lg font-bold text-indigo-900">Din tur!</p>
                                <p className="text-slate-500 text-sm max-w-[200px]">
                                    Dra kortet til riktig plass på tidslinjen.
                                </p>
                            </div>

                            <div className="relative group cursor-grab active:cursor-grabbing">
                                <motion.div
                                    drag
                                    dragSnapToOrigin
                                    onDrag={(_, info) => handleDrag(info)}
                                    onDragEnd={(_, info) => handleDragEnd(info)}
                                    whileDrag={{ scale: 1.1, rotate: 5, zIndex: 100 }}
                                    className="touch-none"
                                >
                                    <ChronoCard event={hand} isRevealed={false} className="shadow-2xl ring-4 ring-indigo-50 border-indigo-200 pointer-events-none-children" />
                                </motion.div>

                                {/* Hint arrow only if not dragging */}
                                {gameState === 'playing' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg pointer-events-none"
                                    >
                                        Dra meg opp! ↑
                                    </motion.div>
                                )}
                            </div>

                            <div className="hidden md:block text-left opacity-50">
                                <p className="text-sm font-medium text-slate-400">Neste kort:</p>
                                <div className="w-24 h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                                    <span className="text-slate-300 font-bold text-xl">?</span>
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
                width: isHovered || highlight ? "12rem" : "5rem", // Expand if highlighted (drag over)
                opacity: 1,
                scale: isHovered || highlight ? 1.05 : 1,
                backgroundColor: highlight ? 'rgba(238, 242, 255, 0.8)' : 'rgba(255, 255, 255, 0)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
                relative h-64 rounded-xl border-2 border-dashed mx-1 shrink-0 flex items-center justify-center overflow-hidden
                transition-colors duration-200 snap-center z-0
                ${highlight ? 'border-indigo-500' : 'border-slate-300'}
                ${isHovered ? 'border-indigo-500 bg-indigo-100' : 'hover:border-indigo-400 hover:bg-indigo-50'}
            `}
        >
            <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                <span className={`
                    text-4xl font-black transition-all duration-300
                    ${isHovered || highlight ? 'text-indigo-500 scale-125' : 'text-slate-300'}
                `}>
                    +
                </span>
                {(isHovered || highlight) && (
                    <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-indigo-600 uppercase tracking-wider text-center px-2 bg-white/80 rounded-full py-1"
                    >
                        Slipp her
                    </motion.span>
                )}
            </div>

            {/* Ghost Card Effect when highlighting/hovering */}
            {(isHovered || highlight) && cardInHand && (
                <div className="absolute inset-0 p-2 opacity-30 grayscale pointer-events-none scale-90 origin-center top-2">
                    <ChronoCard event={cardInHand} isRevealed={false} className="h-full w-full" />
                </div>
            )}
        </motion.button>
    );
};
