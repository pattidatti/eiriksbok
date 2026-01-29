import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface InkParticleProps {
    sourceRect: DOMRect | null;
    targetSelector: string; // e.g., "#scrapbook-icon"
    color?: string;
    onComplete?: () => void;
}

export const InkParticles: React.FC<InkParticleProps> = ({ sourceRect, targetSelector, color = '#3e2723', onComplete }) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        if (!sourceRect) return;

        const targetEl = document.querySelector(targetSelector);
        if (targetEl) {
            setTargetRect(targetEl.getBoundingClientRect());
            // Spawn particles
            setParticles(Array.from({ length: 8 }, (_, i) => i));
        }
    }, [sourceRect, targetSelector]);

    useEffect(() => {
        if (particles.length > 0) {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [particles, onComplete]);

    if (!sourceRect || !targetRect) return null;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <AnimatePresence>
                {particles.map((i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: sourceRect.left + sourceRect.width / 2,
                            y: sourceRect.top + sourceRect.height / 2,
                            scale: Math.random() * 0.5 + 0.5,
                            opacity: 1
                        }}
                        animate={{
                            x: targetRect.left + targetRect.width / 2,
                            y: targetRect.top + targetRect.height / 2,
                            scale: 0.2,
                            opacity: 0,
                            rotate: Math.random() * 360
                        }}
                        transition={{
                            duration: 0.8 + Math.random() * 0.4,
                            ease: "easeInOut",
                            delay: Math.random() * 0.2
                        }}
                        className="absolute w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
};
