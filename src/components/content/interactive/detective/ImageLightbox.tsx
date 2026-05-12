import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
    src: string;
    alt: string;
    open: boolean;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, open, onClose }) => {
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+') setZoom((z) => Math.min(z + 0.3, 4));
            if (e.key === '-') setZoom((z) => Math.max(z - 0.3, 0.5));
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    const reset = () => setZoom(1);

    return (
        <AnimatePresence onExitComplete={reset}>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={onClose}
                >
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoom((z) => Math.max(z - 0.3, 0.5));
                            }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Zoom ut"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoom((z) => Math.min(z + 0.3, 4));
                            }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Zoom inn"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Lukk"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <motion.div
                        className="max-w-[90vw] max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.img
                            src={src}
                            alt={alt}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: zoom }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className="max-w-none rounded-lg shadow-2xl origin-center select-none"
                            style={{ cursor: zoom > 1 ? 'grab' : 'zoom-in' }}
                            onClick={() =>
                                setZoom((z) => (z < 2 ? Math.min(z + 0.5, 4) : 1))
                            }
                            draggable={false}
                        />
                    </motion.div>

                    <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-slate-300">
                        Klikk på bildet for å zoome · ESC for å lukke
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
