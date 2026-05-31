import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Droplet, AlertTriangle, CheckCircle2, Hand, RotateCcw } from 'lucide-react';

interface Pump {
    id: string;
    label: string;
    x: number; // 0-100 prosent av bredden
    y: number; // 0-100 prosent av høyden
    correct: boolean;
}

interface DeathDot {
    id: number;
    x: number;
    y: number;
    nearPump: string; // hvilken pumpe dødsfallet klynger seg rundt
}

interface BroadStreetInvestigatorProps {
    title?: string;
}

// Fast, ikke-tilfeldig layout. Broad Street-pumpa i midten med en tett klynge dødsfall.
const PUMPS: Pump[] = [
    { id: 'broad', label: 'Broad Street', x: 50, y: 48, correct: true },
    { id: 'crown', label: 'Crown Court', x: 18, y: 22, correct: false },
    { id: 'warwick', label: 'Warwick Street', x: 82, y: 26, correct: false },
    { id: 'rupert', label: 'Rupert Street', x: 24, y: 78, correct: false },
    { id: 'castle', label: 'Castle Street', x: 80, y: 80, correct: false },
];

// Dødsfallene klynger seg tett rundt Broad Street, spredte enkeltdødsfall ellers.
const DEATHS: DeathDot[] = [
    // Tett klynge rundt Broad Street
    { id: 1, x: 46, y: 42, nearPump: 'broad' },
    { id: 2, x: 53, y: 44, nearPump: 'broad' },
    { id: 3, x: 49, y: 40, nearPump: 'broad' },
    { id: 4, x: 44, y: 50, nearPump: 'broad' },
    { id: 5, x: 55, y: 52, nearPump: 'broad' },
    { id: 6, x: 51, y: 55, nearPump: 'broad' },
    { id: 7, x: 47, y: 56, nearPump: 'broad' },
    { id: 8, x: 57, y: 47, nearPump: 'broad' },
    { id: 9, x: 42, y: 45, nearPump: 'broad' },
    { id: 10, x: 53, y: 38, nearPump: 'broad' },
    { id: 11, x: 45, y: 59, nearPump: 'broad' },
    { id: 12, x: 59, y: 53, nearPump: 'broad' },
    { id: 13, x: 50, y: 48, nearPump: 'broad' },
    { id: 14, x: 40, y: 52, nearPump: 'broad' },
    { id: 15, x: 56, y: 41, nearPump: 'broad' },
    // Noen få spredte dødsfall langt unna
    { id: 16, x: 22, y: 30, nearPump: 'crown' },
    { id: 17, x: 78, y: 32, nearPump: 'warwick' },
    { id: 18, x: 28, y: 72, nearPump: 'rupert' },
    { id: 19, x: 75, y: 74, nearPump: 'castle' },
    { id: 20, x: 30, y: 50, nearPump: 'broad' },
];

type Stage = 'investigating' | 'wrong' | 'found' | 'solved';

export function BroadStreetInvestigator({
    title = 'Detektiv i London, 1854',
}: BroadStreetInvestigatorProps) {
    const [stage, setStage] = useState<Stage>('investigating');
    const [selectedPump, setSelectedPump] = useState<string | null>(null);

    const handlePumpClick = (pump: Pump) => {
        if (stage === 'solved') return;
        setSelectedPump(pump.id);
        setStage(pump.correct ? 'found' : 'wrong');
    };

    const handleRemoveHandle = () => setStage('solved');

    const handleReset = () => {
        setStage('investigating');
        setSelectedPump(null);
    };

    // Hvilke dødsfall skal vises? Etter at håndtaket er fjernet fader de nye vekk.
    const deathVisible = (d: DeathDot) => {
        if (stage !== 'solved') return true;
        // Når pumpa er stengt, stopper de nye dødsfallene rundt Broad Street.
        return d.nearPump !== 'broad';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Koleraen herjer i nabolaget. Klikk på vannpumpene og finn ut hvilken som
                        gjør folk syke.
                    </p>
                </div>
            </div>

            {/* Kartet */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="relative mx-auto w-full max-w-xl aspect-[4/3] rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
                    {/* Enkelt gaterutenett */}
                    <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {[20, 40, 60, 80].map((p) => (
                            <line
                                key={`v${p}`}
                                x1={p}
                                y1="0"
                                x2={p}
                                y2="100"
                                stroke="#e2e8f0"
                                strokeWidth="0.6"
                            />
                        ))}
                        {[20, 40, 60, 80].map((p) => (
                            <line
                                key={`h${p}`}
                                x1="0"
                                y1={p}
                                x2="100"
                                y2={p}
                                stroke="#e2e8f0"
                                strokeWidth="0.6"
                            />
                        ))}
                    </svg>

                    {/* Dødsfall (prikker) */}
                    <AnimatePresence>
                        {DEATHS.filter(deathVisible).map((d) => {
                            const highlight =
                                stage === 'found' && selectedPump === 'broad' && d.nearPump === 'broad';
                            return (
                                <motion.span
                                    key={d.id}
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: highlight ? 1.5 : 1,
                                        opacity: 1,
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                    className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                                        highlight
                                            ? 'bg-amber-500 ring-2 ring-amber-300'
                                            : 'bg-slate-400'
                                    }`}
                                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                />
                            );
                        })}
                    </AnimatePresence>

                    {/* Pumper (knapper) */}
                    {PUMPS.map((pump) => {
                        const active = selectedPump === pump.id;
                        const isSolvedBroad = stage === 'solved' && pump.id === 'broad';
                        return (
                            <button
                                key={pump.id}
                                onClick={() => handlePumpClick(pump)}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                                style={{ left: `${pump.x}%`, top: `${pump.y}%` }}
                            >
                                <motion.span
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={
                                        active && stage === 'found'
                                            ? { scale: [1, 1.25, 1] }
                                            : { scale: 1 }
                                    }
                                    transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm ${
                                        isSolvedBroad
                                            ? 'bg-emerald-500 border-emerald-600 text-white'
                                            : active && stage === 'found'
                                              ? 'bg-amber-500 border-amber-600 text-white'
                                              : active && stage === 'wrong'
                                                ? 'bg-slate-300 border-slate-400 text-slate-600'
                                                : 'bg-white border-indigo-400 text-indigo-600 group-hover:border-indigo-600'
                                    }`}
                                >
                                    <Droplet className="h-4 w-4" />
                                </motion.span>
                                <span className="mt-1 rounded bg-white/80 px-1 text-[10px] font-medium text-slate-600">
                                    {pump.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tegnforklaring */}
                <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
                        Hvert punkt er et dødsfall
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Droplet className="h-3 w-3 text-indigo-500" />
                        Vannpumpe (klikk for å undersøke)
                    </span>
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 mt-5 mb-2">
                <AnimatePresence mode="wait">
                    {stage === 'investigating' && (
                        <motion.div
                            key="investigating"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600"
                        >
                            Se nøye på kartet. Hvor klynger dødsfallene seg sammen? Klikk på pumpa du
                            mistenker.
                        </motion.div>
                    )}

                    {stage === 'wrong' && (
                        <motion.div
                            key="wrong"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
                        >
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                Rundt denne pumpa er det bare ett enkelt dødsfall, spredt og uten
                                sammenheng. Dette er ikke kilden. Se etter klyngen.
                            </span>
                        </motion.div>
                    )}

                    {stage === 'found' && (
                        <motion.div
                            key="found"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3"
                        >
                            <div className="flex items-start gap-2 text-sm text-amber-800">
                                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    Der! Nesten alle dødsfallene klynger seg rundt Broad
                                    Street-pumpa. Folk her drikker av samme skitne vann. Hva gjør du
                                    nå?
                                </span>
                            </div>
                            <button
                                onClick={handleRemoveHandle}
                                className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700"
                            >
                                <Hand className="h-4 w-4" />
                                Fjern pumpehåndtaket
                            </button>
                        </motion.div>
                    )}

                    {stage === 'solved' && (
                        <motion.div
                            key="solved"
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                        >
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                Pumpa er stengt, og de nye dødsfallene stopper. Det var ikke medisin
                                som stoppet koleraen - det var rent vann. Snow beviste at sykdom
                                spredte seg gjennom skittent vann.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 pt-1 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
