import { useState, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Film, ChevronDown } from 'lucide-react';

interface TimelineDirectorProps {
    title?: string;
    scenes: {
        id: string;
        title: string;
        description: string;
        chronologicalOrder: number;
        icon: string;
    }[];
    techniques: {
        id: string;
        name: string;
        icon: string;
        effect: string;
        description: string;
    }[];
}

type SceneWithTechnique = TimelineDirectorProps['scenes'][number] & {
    techniqueId?: string;
};

const EFFECT_CLASSES: Record<string, string> = {
    sepia: 'sepia brightness-90',
    shake: 'animate-[shake_0.4s_ease-in-out_2]',
    shimmer: 'brightness-125 saturate-150',
    slowmo: 'opacity-70 blur-[1px]',
};

const EFFECT_BG: Record<string, string> = {
    sepia: 'bg-amber-900/20',
    shake: 'bg-red-900/20',
    shimmer: 'bg-cyan-400/20',
    slowmo: 'bg-indigo-900/20',
};

export const TimelineDirector = ({
    title = 'Regissørens klipperom',
    scenes,
    techniques,
}: TimelineDirectorProps) => {
    const [items, setItems] = useState<SceneWithTechnique[]>(() =>
        [...scenes].sort(() => Math.random() - 0.5)
    );
    const [phase, setPhase] = useState<'edit' | 'playing' | 'result'>('edit');
    const [activeScene, setActiveScene] = useState(-1);
    const [score, setScore] = useState(0);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const assignTechnique = (sceneId: string, techniqueId: string | undefined) => {
        setItems((prev) =>
            prev.map((s) => (s.id === sceneId ? { ...s, techniqueId } : s))
        );
        setOpenDropdown(null);
    };

    const getTechnique = (id?: string) => techniques.find((t) => t.id === id);

    const calculateScore = useCallback(() => {
        let s = 0;
        const first = items[0];
        if (first.chronologicalOrder >= 3) s += 25;
        const hasAnyTechnique = items.some((i) => i.techniqueId);
        if (hasAnyTechnique) s += 15;
        const uniqueTechniques = new Set(items.filter((i) => i.techniqueId).map((i) => i.techniqueId));
        s += Math.min(uniqueTechniques.size * 10, 30);
        const isNotChronological = !items.every(
            (item, idx) => idx === 0 || item.chronologicalOrder >= items[idx - 1].chronologicalOrder
        );
        if (isNotChronological) s += 20;
        const last = items[items.length - 1];
        if (last.chronologicalOrder === Math.max(...items.map((i) => i.chronologicalOrder))) s += 10;
        return Math.min(s, 100);
    }, [items, techniques]);

    const playSequence = async () => {
        setPhase('playing');
        for (let i = 0; i < items.length; i++) {
            setActiveScene(i);
            await new Promise((r) => setTimeout(r, 1800));
        }
        setActiveScene(-1);
        const finalScore = calculateScore();
        setScore(finalScore);
        setPhase('result');
        if (finalScore >= 70) {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
        }
    };

    const reset = () => {
        setItems([...scenes].sort(() => Math.random() - 0.5).map((s) => ({ ...s, techniqueId: undefined })));
        setPhase('edit');
        setActiveScene(-1);
        setScore(0);
    };

    const meterColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
    const meterLabel = score >= 70 ? 'Mesterlig!' : score >= 40 ? 'Lovende klipp' : 'Trenger mer dramatikk';

    return (
        <div className="bg-slate-950 border border-slate-700 rounded-xl p-5 shadow-lg max-w-2xl mx-auto my-6">
            <div className="flex items-center gap-2 mb-4">
                <Film className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-slate-100">{title}</h3>
                <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    Dra og slipp
                </span>
            </div>

            {phase === 'edit' && (
                <>
                    <Reorder.Group
                        axis="x"
                        values={items}
                        onReorder={setItems}
                        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin"
                    >
                        {items.map((scene, idx) => {
                            const tech = getTechnique(scene.techniqueId);
                            return (
                                <Reorder.Item
                                    key={scene.id}
                                    value={scene}
                                    className="flex-shrink-0 w-40 bg-slate-900 border-2 border-slate-600 rounded-lg
                                        cursor-grab active:cursor-grabbing select-none"
                                    whileDrag={{ scale: 1.06, rotate: 2, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                                >
                                    <div className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-t-md flex justify-between">
                                        <span>Scene {idx + 1}</span>
                                        <span className="font-mono">#{scene.chronologicalOrder}</span>
                                    </div>
                                    <div className="p-3 text-center">
                                        <span className="text-2xl">{scene.icon}</span>
                                        <p className="text-sm font-semibold text-slate-200 mt-1 leading-tight">
                                            {scene.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                            {scene.description}
                                        </p>
                                    </div>
                                    <div className="relative px-2 pb-2">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === scene.id ? null : scene.id)}
                                            className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300
                                                rounded px-2 py-1.5 flex items-center justify-between transition-colors"
                                        >
                                            <span>{tech ? `${tech.icon} ${tech.name}` : 'Velg teknikk...'}</span>
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                        <AnimatePresence>
                                            {openDropdown === scene.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    className="absolute left-2 right-2 top-full mt-1 bg-slate-800
                                                        border border-slate-600 rounded-lg z-20 overflow-hidden shadow-xl"
                                                >
                                                    <button
                                                        onClick={() => assignTechnique(scene.id, undefined)}
                                                        className="w-full text-left text-xs px-3 py-1.5 text-slate-400
                                                            hover:bg-slate-700 transition-colors"
                                                    >
                                                        Ingen teknikk
                                                    </button>
                                                    {techniques.map((t) => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => assignTechnique(scene.id, t.id)}
                                                            className="w-full text-left text-xs px-3 py-1.5 text-slate-200
                                                                hover:bg-slate-700 transition-colors"
                                                        >
                                                            {t.icon} {t.name}
                                                            <span className="block text-[10px] text-slate-500">
                                                                {t.description}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Reorder.Item>
                            );
                        })}
                    </Reorder.Group>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={playSequence}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950
                                font-bold px-6 py-2.5 rounded-lg transition-colors"
                        >
                            <Play className="w-4 h-4" /> Spill av!
                        </button>
                    </div>
                </>
            )}

            {phase === 'playing' && (
                <div className="flex flex-col items-center py-6">
                    <p className="text-slate-400 text-sm mb-4">Avspilling...</p>
                    <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden bg-black border border-slate-700">
                        <AnimatePresence mode="wait">
                            {items.map((scene, idx) => {
                                if (idx !== activeScene) return null;
                                const tech = getTechnique(scene.techniqueId);
                                const effectCls = tech ? EFFECT_CLASSES[tech.effect] || '' : '';
                                const bgCls = tech ? EFFECT_BG[tech.effect] || '' : '';
                                return (
                                    <motion.div
                                        key={scene.id}
                                        initial={{ opacity: 0, x: 60 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -60 }}
                                        transition={{ duration: 0.5 }}
                                        className={`absolute inset-0 flex flex-col items-center justify-center
                                            p-6 text-center ${bgCls} ${effectCls}`}
                                    >
                                        <span className="text-4xl mb-2">{scene.icon}</span>
                                        <p className="text-white font-bold text-lg">{scene.title}</p>
                                        <p className="text-slate-300 text-sm mt-1">{scene.description}</p>
                                        {tech && (
                                            <span className="mt-3 text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full">
                                                {tech.icon} {tech.name}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    <div className="flex gap-1.5 mt-4">
                        {items.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    i === activeScene ? 'bg-amber-400' : i < activeScene ? 'bg-amber-700' : 'bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {phase === 'result' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                >
                    <p className="text-slate-300 text-sm mb-2">Drama-meter</p>
                    <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-full h-5 overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${meterColor}`}
                        />
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{score} / 100</p>
                    <p className="text-amber-400 font-semibold mt-1">{meterLabel}</p>
                    <p className="text-slate-500 text-xs mt-3 max-w-sm mx-auto">
                        Tips: Start med en scene fra midten for spenning, bruk ulike teknikker, og bryt kronologien!
                    </p>
                    <button
                        onClick={reset}
                        className="mt-5 flex items-center gap-2 mx-auto bg-slate-800 hover:bg-slate-700
                            text-slate-200 px-5 py-2 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Prøv igjen
                    </button>
                </motion.div>
            )}
        </div>
    );
};
