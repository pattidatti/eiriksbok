import type { Variants, Transition } from 'framer-motion';

/**
 * Common Transitions
 */
export const transitions = {
    spring: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
    } as Transition,
    springSoft: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
    } as Transition,
    springBouncy: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
    } as Transition,
    default: {
        duration: 0.3,
        ease: 'easeOut',
    } as Transition,
};

/**
 * Animation Variants
 */
export const motionPresets: Record<string, Variants> = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideInRight: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    slideInLeft: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    zoomIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    },
    staggerContainer: {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.05,
            },
        },
    },
};

/**
 * Hover & Tap Effects
 */
export const interactionPresets = {
    hoverScale: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
    },
    hoverGlow: {
        whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
        whileTap: { scale: 0.98 },
    },
    tapOnly: {
        whileTap: { scale: 0.95 },
    },
};
