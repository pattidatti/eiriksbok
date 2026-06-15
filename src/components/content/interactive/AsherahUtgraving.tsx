import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pickaxe,
    Brush,
    ScrollText,
    Landmark,
    Box,
    Sparkles,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';

interface Artifact {
    id: string;
    name: string;
    place: string;
    finding: string;
    interpretation: string;
    icon?: 'inskripsjon' | 'grav' | 'figurin' | 'tekst';
}

interface AsherahUtgravingProps {
    title?: string;
    intro?: string;
    artifacts?: Artifact[];
    conclusionTitle?: string;
    conclusionText?: string;
}

const DEFAULT_ARTIFACTS: Artifact[] = [
    {
        id: 'kuntillet',
        name: 'Kuntillet Ajrud',
        place: 'Krukke i ørkenen, ca. 700-tallet f.Kr.',
        finding: 'En stor krukke med teksten: «Jeg velsigner deg ved Yahweh ... og hans Asherah.»',
        interpretation:
            'Her står Yahweh og Asherah side om side, nesten som et gudepar. Det tyder på at folk dyrket dem sammen.',
        icon: 'inskripsjon',
    },
    {
        id: 'khirbet',
        name: 'Khirbet el-Qom',
        place: 'Gravinnskrift, ca. 700-tallet f.Kr.',
        finding: 'En innskrift hugget i en grav nevner også «Yahweh og hans Asherah».',
        interpretation:
            'Et funn til, et helt annet sted. To uavhengige kilder peker samme vei: Yahweh hadde en gudinne ved sin side.',
        icon: 'grav',
    },
    {
        id: 'figuriner',
        name: 'Pilarfigurinene',
        place: 'Leirfigurer i hundrevis av hjem',
        finding: 'Arkeologer har funnet hundrevis av små leirfigurer av en kvinne i vanlige hjem i Juda.',
        interpretation:
            'Gudinnen var ikke bare i tempelet. Hun sto hjemme hos folk flest, for hell og fruktbarhet.',
        icon: 'figurin',
    },
    {
        id: 'kongeboker',
        name: 'Kongebøkene',
        place: 'Tekst i Bibelen',
        finding: 'Bibelen selv forteller at en Asherah-statue sto i Yahwehs tempel, og at kvinner vevde for henne der.',
        interpretation:
            'Til og med Bibelen husker at hun var der - før hun ble fjernet og navnet hennes nesten glemt.',
        icon: 'tekst',
    },
];

const ICONS = {
    inskripsjon: ScrollText,
    grav: Landmark,
    figurin: Box,
    tekst: ScrollText,
};

const REVEAL_AT = 100;

export function AsherahUtgraving({
    title = 'Asherah-utgravingen',
    intro = 'Børst bort jorda for å grave fram bevisene for Yahwehs glemte gudinne.',
    artifacts = DEFAULT_ARTIFACTS,
    conclusionTitle = 'Yahweh hadde en gudinne ved sin side',
    conclusionText = 'Funnene peker samme vei: i lange perioder ble Yahweh dyrket sammen med gudinnen Asherah. Senere ble hun renset ut av kulten, og navnet hennes ble nesten glemt. Slik kan arkeologien vise oss en eldre tro enn den vi kjenner i dag.',
}: AsherahUtgravingProps) {
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [selected, setSelected] = useState<string | null>(null);

    const revealedIds = artifacts.filter((a) => (progress[a.id] ?? 0) >= REVEAL_AT).map((a) => a.id);
    const allRevealed = revealedIds.length === artifacts.length;

    const brush = (id: string, amount: number) => {
        setProgress((prev) => {
            const cur = prev[id] ?? 0;
            if (cur >= REVEAL_AT) return prev;
            const next = Math.min(REVEAL_AT, cur + amount);
            if (next >= REVEAL_AT && cur < REVEAL_AT) {
                setSelected(id);
            }
            return { ...prev, [id]: next };
        });
    };

    const handleReset = () => {
        setProgress({});
        setSelected(null);
    };

    const selectedArtifact = artifacts.find((a) => a.id === selected) ?? null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-amber-50/60">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Pickaxe className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            {/* Utgravingsfelt */}
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {artifacts.map((a) => {
                        const p = progress[a.id] ?? 0;
                        const revealed = p >= REVEAL_AT;
                        const Icon = ICONS[a.icon ?? 'inskripsjon'];
                        const isSelected = selected === a.id;
                        return (
                            <div
                                key={a.id}
                                onClick={() => revealed && setSelected(a.id)}
                                className={`relative aspect-[3/4] rounded-xl overflow-hidden border transition-shadow ${
                                    revealed
                                        ? `cursor-pointer ${isSelected ? 'border-amber-400 shadow-md' : 'border-slate-200 shadow-sm'}`
                                        : 'border-amber-900/20'
                                }`}
                            >
                                {/* Avdekket funn under jorda */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white p-3 flex flex-col">
                                    <motion.div
                                        initial={false}
                                        animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.4 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                        className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center mb-2"
                                    >
                                        <Icon className="w-5 h-5 text-amber-700" />
                                    </motion.div>
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{a.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{a.place}</p>
                                    {revealed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-auto flex items-center gap-1 text-emerald-600"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-medium">Avdekket</span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Jordlaget som børstes bort */}
                                <AnimatePresence>
                                    {!revealed && (
                                        <motion.div
                                            exit={{ opacity: 0, scale: 1.1 }}
                                            transition={{ duration: 0.3 }}
                                            onPointerDown={(e) => {
                                                e.currentTarget.setPointerCapture?.(e.pointerId);
                                                brush(a.id, 30);
                                            }}
                                            onPointerMove={() => brush(a.id, 7)}
                                            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
                                            style={{
                                                opacity: 1 - (p / REVEAL_AT) * 0.85,
                                                background:
                                                    'repeating-linear-gradient(45deg, #8a6d4b, #8a6d4b 6px, #7d6243 6px, #7d6243 12px)',
                                            }}
                                        >
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-amber-50/90">
                                                <Brush className="w-5 h-5" />
                                                <span className="text-[10px] font-semibold tracking-wide">
                                                    {p > 0 ? 'Børst videre' : 'Grav her'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Bevis-måler */}
                <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 flex-shrink-0">Bevis</span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                            initial={false}
                            animate={{ width: `${(revealedIds.length / artifacts.length) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 flex-shrink-0">
                        {revealedIds.length}/{artifacts.length}
                    </span>
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="mx-4 sm:mx-6 mb-2 min-h-[88px]">
                <AnimatePresence mode="wait">
                    {allRevealed ? (
                        <motion.div
                            key="conclusion"
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3"
                        >
                            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                                <Sparkles className="w-4 h-4" />
                                {conclusionTitle}
                            </div>
                            <p className="text-sm text-emerald-900/80 mt-1 leading-relaxed">{conclusionText}</p>
                        </motion.div>
                    ) : selectedArtifact ? (
                        <motion.div
                            key={selectedArtifact.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3"
                        >
                            <p className="text-sm text-slate-700 leading-relaxed">{selectedArtifact.finding}</p>
                            <p className="text-sm text-amber-800 mt-1.5 leading-relaxed">
                                <span className="font-semibold">Hva forskerne mener: </span>
                                {selectedArtifact.interpretation}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-400 flex items-center"
                        >
                            Grav fram et funn for å lese hva forskerne mener om det.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-4 sm:px-6 pb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {allRevealed ? 'Alle funn avdekket' : `${artifacts.length - revealedIds.length} funn igjen`}
                </span>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Dekk til igjen
                </button>
            </div>
        </div>
    );
}
