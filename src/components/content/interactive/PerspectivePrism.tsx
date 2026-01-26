import React, { useRef, useState, useEffect } from 'react';
import type { PanInfo } from 'framer-motion';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import styles from './PerspectivePrism.module.css';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface PerspectiveSide {
    id: string;
    title: string;
    color: string;
    icon?: string;
    content: string;
    image?: string;
    sourceCredit?: string;
}

interface PerspectivePrismProps {
    title?: string;
    instruction?: string;
    sides: PerspectiveSide[];
}

export const PerspectivePrism: React.FC<PerspectivePrismProps> = ({
    title = "Perspektivprisme",
    instruction = "Dra for å rotere og se saken fra flere sider.",
    sides
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(300);
    const controls = useAnimation();

    // 3D Math configuration
    const sideCount = sides.length;
    const theta = 360 / sideCount;
    // Apothem: distance from center to side
    const radius = Math.round((width / 2) / Math.tan(Math.PI / sideCount));

    // Motion values for direct manipulation
    const rotation = useMotionValue(0);

    // Update width on mount and resize
    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                // Limit max width for better 3D effect on desktop
                const newWidth = Math.min(containerRef.current.offsetWidth, 420);
                setWidth(newWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Snap logic
    const handleDragEnd = (_: any, info: PanInfo) => {
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        // Determine direction based on drag distance or velocity
        let direction = 0;
        if (offset > 100 || velocity > 500) direction = 1; // Previous
        else if (offset < -100 || velocity < -500) direction = -1; // Next

        const newIndex = currentIndex - direction;
        // Keep index properly normalized if we want circular, but for rotation math
        // strictly, we just keep adding/subtracting degrees.
        // However, to track "active side", we need state.

        // Let's settle on the target angle
        rotateToSide(newIndex);
    };

    const rotateToSide = (index: number) => {
        setCurrentIndex(index);
        const targetAngle = index * -theta;

        controls.start({
            rotateY: targetAngle,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 18,
                mass: 1.2
            }
        });
    };

    // Calculate normalized index (0 to sideCount-1) for UI display
    const normalizedIndex = ((currentIndex % sideCount) + sideCount) % sideCount;

    return (
        <div className="my-12 flex flex-col items-center select-none">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{title}</h3>

            {/* Instruction with explicit visual cue */}
            <div className="text-slate-500 dark:text-slate-400 mb-8 flex flex-col items-center gap-2 text-center animate-pulse">
                <div className="flex items-center gap-2">
                    <Info size={16} />
                    <span className="text-sm font-medium uppercase tracking-wider">{instruction}</span>
                </div>
            </div>

            <div
                ref={containerRef}
                className={`${styles.scene} h-[420px] w-full max-w-[420px] cursor-grab active:cursor-grabbing touch-none perspective-[1200px]`}
            >
                <motion.div
                    className={styles.prism}
                    animate={controls}
                    initial={{ rotateY: 0 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.05} // Stiffer drag for better control
                    onDragEnd={handleDragEnd}
                    style={{
                        rotateY: rotation,
                    }}
                >
                    {sides.map((side, index) => {
                        const angle = index * theta;
                        const isActive = index === normalizedIndex;

                        // We calculate dynamic opacity based on distance from active index?
                        // Simple active check is usually enough

                        return (
                            <div
                                key={side.id}
                                className={`${styles.side} ${styles.glass} rounded-2xl overflow-hidden shadow-2xl transition-all duration-300`}
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                    width: `${width}px`,
                                    left: '50%',
                                    marginLeft: `-${width / 2}px`,
                                    // Subtle lighting effect based on active state
                                    filter: isActive ? 'brightness(1)' : 'brightness(0.5) blur(1px)',
                                    opacity: isActive ? 1 : 0.8 // Fade out non-active sides for depth
                                }}
                            >
                                {/* Header Bar - More vivid colors */}
                                <div
                                    className="h-20 flex items-center px-6 border-b border-black/5"
                                    style={{
                                        background: `linear-gradient(to right, ${side.color}, ${side.color}dd)`,
                                        color: 'white'
                                    }}
                                >
                                    <div className="p-3 bg-white/20 rounded-lg mr-4 shadow-inner text-2xl">
                                        {side.icon || '📜'}
                                    </div>
                                    <h4 className="font-bold text-xl tracking-tight truncate">
                                        {side.title}
                                    </h4>
                                </div>

                                {/* Body Content - Improved readability */}
                                <div className="p-6 pb-8 h-[calc(100%-5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                                    {side.image && (
                                        <div className="mb-6 rounded-lg overflow-hidden h-40 w-full shadow-md border border-slate-200 dark:border-slate-700 relative group">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                                            <img
                                                src={side.image}
                                                alt=""
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    )}

                                    {/* Quote style branding */}
                                    <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                        {side.content.split('\n').map((p, i) => {
                                            if (p.startsWith('**') && p.endsWith('**')) { // Simple bold detection
                                                return <p key={i} className="font-bold text-xl text-slate-900 dark:text-white mb-4 border-l-4 border-blue-500 pl-4">{p.replace(/\*\*/g, '')}</p>;
                                            }
                                            if (p.startsWith('*') && p.endsWith('*')) { // Simple quote detection
                                                return (
                                                    <blockquote key={i} className="border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:text-slate-400 my-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-r-lg">
                                                        "{p.replace(/\*/g, '').replace(/"/g, '')}"
                                                    </blockquote>
                                                );
                                            }
                                            if (p.trim() === "") return <br key={i} />;
                                            return <p key={i} className="mb-4">{p.replace(/\*\*/g, '')}</p>;
                                        })}
                                    </div>

                                    {side.sourceCredit && (
                                        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                            <span className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                                                — {side.sourceCredit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* 3D Depth Floor Shadow to ground the object */}
                {/* 3D Depth Floor Shadow Removed for cleaner look */}
            </div>

            {/* Navigation Controls - More prominent */}
            <div className="mt-16 flex flex-col items-center gap-4 z-10 relative">
                <div className="flex gap-6 items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-full border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => rotateToSide(currentIndex - 1)}
                        className="p-4 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition shadow-lg group border border-slate-100 dark:border-slate-600"
                        aria-label="Previous Perspective"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex gap-3 px-4">
                        {sides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => rotateToSide(i)}
                                className={`h-3 rounded-full transition-all duration-300 shadow-sm ${i === normalizedIndex
                                    ? 'w-10 bg-blue-600 dark:bg-blue-400 scale-100 ring-2 ring-blue-200 dark:ring-blue-900'
                                    : 'w-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                                    }`}
                                aria-label={`Go to side ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => rotateToSide(currentIndex + 1)}
                        className="p-4 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition shadow-lg group border border-slate-100 dark:border-slate-600"
                        aria-label="Next Perspective"
                    >
                        <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                    Side {normalizedIndex + 1} / {sides.length}
                </p>
            </div>
        </div>
    );
};
