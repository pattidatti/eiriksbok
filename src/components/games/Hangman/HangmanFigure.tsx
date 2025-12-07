import { motion } from 'framer-motion';

type HangmanFigureProps = {
    wrongGuesses: number;
};

export const HangmanFigure = ({ wrongGuesses }: HangmanFigureProps) => {
    // SVG paths for each part of the hangman
    const parts = [
        // Base
        <motion.line
            key="base"
            x1="10" y1="250" x2="150" y2="250"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Pole
        <motion.line
            key="pole"
            x1="80" y1="250" x2="80" y2="20"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Top Bar
        <motion.line
            key="top-bar"
            x1="80" y1="20" x2="200" y2="20"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Rope
        <motion.line
            key="rope"
            x1="200" y1="20" x2="200" y2="50"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Head
        <motion.circle
            key="head"
            cx="200" cy="80" r="30"
            stroke="currentColor" strokeWidth="4" fill="transparent"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Body
        <motion.line
            key="body"
            x1="200" y1="110" x2="200" y2="170"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Left Arm
        <motion.line
            key="l-arm"
            x1="200" y1="130" x2="170" y2="160"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Right Arm
        <motion.line
            key="r-arm"
            x1="200" y1="130" x2="230" y2="160"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Left Leg
        <motion.line
            key="l-leg"
            x1="200" y1="170" x2="170" y2="210"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
        // Right Leg
        <motion.line
            key="r-leg"
            x1="200" y1="170" x2="230" y2="210"
            stroke="currentColor" strokeWidth="4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        />,
    ];

    return (
        <div className="relative w-64 h-64 mx-auto text-slate-800 dark:text-slate-200">
            <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                {parts.slice(0, wrongGuesses)}
            </svg>
        </div>
    );
};
