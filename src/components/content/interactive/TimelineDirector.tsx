import { useState, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Film, GripVertical } from 'lucide-react';

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

    const assignTechnique = (sceneId: string, techniqueId: string) => {
        setItems((prev) =>
            prev.map((s) =>
                s.id === sceneId
                    ? { ...s, techniqueId: s.techniqueId === techniqueId ? undefined : techniqueId }
                    : s
            )
        );
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
    const labelColor =
        score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-rose-600';

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl mx-auto my-6">
            {/* Header bar */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-3">
                <div className="bg-amber-500 rounded-lg p-2">
                    <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-slate-400 text-sm">
                        Dra scenene i den rekkefølgen du vil fortelle
                    </p>
                </div>
            </div>

            <div className="p-5">
                {phase === 'edit' && (
                    <>
                        <Reorder.Group
                            axis="y"
                            values={items}
                            onReorder={setItems}
                            className="space-y-3"
                        >
                            {items.map((scene, idx) => {
                                return (
                                    <Reorder.Item
                                        key={scene.id}
                                        value={scene}
                                        className="bg-white rounded-xl border-2 border-slate-200 hover:border-amber-300
                                            cursor-grab active:cursor-grabbing select-none transition-colors"
                                        whileDrag={{
                                            scale: 1.02,
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                        }}
                                    >
                                        <div className="flex items-start gap-3 p-4">
                                            {/* Left: number + grip */}
                                            <div className="flex flex-col items-center gap-1 pt-0.5">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <GripVertical className="w-4 h-4 text-slate-300" />
                                            </div>

                                            {/* Center: content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{scene.icon}</span>
                                                    <p className="font-bold text-slate-800">
                                                        {scene.title}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {scene.description}
                                                </p>

                                                {/* Technique pills */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {techniques.map((t) => (
                                                        <button
                                                            key={t.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                assignTechnique(scene.id, t.id);
                                                            }}
                                                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                                                scene.techniqueId === t.id
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {t.icon} {t.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>
                        <div className="flex justify-center mt-5">
                            <button
                                onClick={playSequence}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white
                                    font-bold px-6 py-2.5 rounded-lg transition-colors"
                            >
                                <Play className="w-4 h-4" /> Spill av!
                            </button>
                        </div>
                    </>
                )}

                {phase === 'playing' && (
                    <div className="flex flex-col items-center py-6">
                        <p className="text-slate-500 text-sm mb-4">Avspilling...</p>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
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
                                                p-8 text-center ${bgCls} ${effectCls}`}
                                        >
                                            <span className="text-5xl mb-3">{scene.icon}</span>
                                            <p className="text-white font-bold text-xl">
                                                {scene.title}
                                            </p>
                                            <p className="text-slate-300 text-sm mt-1">
                                                {scene.description}
                                            </p>
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
                                        i === activeScene
                                            ? 'bg-amber-400'
                                            : i < activeScene
                                              ? 'bg-amber-200'
                                              : 'bg-slate-200'
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
                        className="py-6 space-y-5"
                    >
                        {/* Score card */}
                        <div className="bg-gradient-to-br from-amber-50 to-indigo-50 rounded-xl border border-amber-200/60 p-6 text-center">
                            <p className="text-slate-500 text-sm mb-3">Drama-meter</p>
                            <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-5 overflow-hidden mb-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${meterColor}`}
                                />
                            </div>
                            <p className="text-4xl font-bold text-slate-800">{score} / 100</p>
                            <p className={`font-semibold mt-1 ${labelColor}`}>{meterLabel}</p>
                        </div>

                        {/* Tip card */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
                            <p className="text-slate-600 text-sm">
                                Tips: Start med en scene fra midten for spenning, bruk ulike
                                teknikker, og bryt kronologien!
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                                    text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" /> Prøv igjen
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
