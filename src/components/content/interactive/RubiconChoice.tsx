import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Scale, Handshake, Dices, RotateCcw, Check } from 'lucide-react';

interface RubiconChoiceProps {
    title?: string;
}

type ChoiceId = 'cross' | 'surrender' | 'negotiate';
type Phase = 'choosing' | 'revealed';

interface Choice {
    id: ChoiceId;
    label: string;
    subtitle: string;
    icon: typeof Swords;
    consequence: string;
    outcome: string;
    tone: 'rose' | 'amber' | 'blue';
}

const CHOICES: Choice[] = [
    {
        id: 'cross',
        label: 'Krysse Rubicon med hæren',
        subtitle: 'Bryt loven. Marsjer mot Roma.',
        icon: Swords,
        consequence:
            'Du blir høyforræder. Senatet erklærer deg fiende av staten. Borgerkrigen starter med ett skritt.',
        outcome:
            'Du vinner. Etter fire års kamp er du Romas eneste hersker. Men det er gjort: du har bevist at en general med en hær kan styrte republikken. Andre vil prøve det samme etter deg.',
        tone: 'rose',
    },
    {
        id: 'surrender',
        label: 'Send hæren hjem og dra alene',
        subtitle: 'Følg loven. Stol på rettferdigheten.',
        icon: Scale,
        consequence:
            'Du møter senatet uten beskyttelse. Fiendene dine — Cato, Pompeius — venter med anklager.',
        outcome:
            'Rettssaken er rigget. Du blir dømt for krigsforbrytelser i Gallia, fratatt alt, og sannsynligvis henrettet. Navnet ditt forsvinner fra historien.',
        tone: 'blue',
    },
    {
        id: 'negotiate',
        label: 'Forhandle med senatet',
        subtitle: 'Tilby kompromiss. Behold litt makt.',
        icon: Handshake,
        consequence:
            'Du sender bud: gi meg lov til å stille som konsul uten å møte personlig. Senatet svarer nei. Pompeius støtter dem.',
        outcome:
            'Forhandlingene bryter sammen. Du står likevel ved Rubicon — bare svakere, fordi du har vist at du nølte. Valget er det samme: krysse, eller forsvinne.',
        tone: 'amber',
    },
];

const TONE_CLASSES: Record<Choice['tone'], { card: string; icon: string; chip: string }> = {
    rose: {
        card: 'border-rose-200 bg-rose-50 hover:border-rose-300',
        icon: 'text-rose-600 bg-rose-100',
        chip: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    blue: {
        card: 'border-blue-200 bg-blue-50 hover:border-blue-300',
        icon: 'text-blue-600 bg-blue-100',
        chip: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    amber: {
        card: 'border-amber-200 bg-amber-50 hover:border-amber-300',
        icon: 'text-amber-600 bg-amber-100',
        chip: 'bg-amber-100 text-amber-700 border-amber-200',
    },
};

export function RubiconChoice({ title = 'Ved Rubicon, januar 49 fvt.' }: RubiconChoiceProps) {
    const [explored, setExplored] = useState<Set<ChoiceId>>(new Set());
    const [active, setActive] = useState<ChoiceId | null>(null);
    const [phase, setPhase] = useState<Phase>('choosing');

    const handleChoose = (id: ChoiceId) => {
        setActive(id);
        setExplored((prev) => new Set(prev).add(id));
    };

    const handleReset = () => {
        setExplored(new Set());
        setActive(null);
        setPhase('choosing');
    };

    const handleReveal = () => setPhase('revealed');

    const allExplored = explored.size === CHOICES.length;
    const activeChoice = CHOICES.find((c) => c.id === active) ?? null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Dices className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Du er Cæsar. Hæren venter. Tre veier ligger foran deg — utforsk alle.
                    </p>
                </div>
            </div>

            <div className="p-6 grid gap-3 sm:grid-cols-3">
                {CHOICES.map((choice) => {
                    const Icon = choice.icon;
                    const tone = TONE_CLASSES[choice.tone];
                    const isExplored = explored.has(choice.id);
                    const isActive = active === choice.id;
                    return (
                        <motion.button
                            key={choice.id}
                            onClick={() => handleChoose(choice.id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={phase === 'revealed'}
                            className={`text-left rounded-xl border-2 p-4 transition-colors ${tone.card} ${
                                isActive ? 'ring-2 ring-indigo-400' : ''
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            <div className="flex items-start justify-between">
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone.icon}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                {isExplored && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </motion.div>
                                )}
                            </div>
                            <h4 className="mt-3 font-semibold text-slate-800 text-sm leading-tight">
                                {choice.label}
                            </h4>
                            <p className="mt-1 text-xs text-slate-600">{choice.subtitle}</p>
                        </motion.button>
                    );
                })}
            </div>

            <div className="px-6 pb-4 min-h-[112px]">
                <AnimatePresence mode="wait">
                    {activeChoice && phase === 'choosing' && (
                        <motion.div
                            key={activeChoice.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className={`rounded-lg border px-4 py-3 text-sm ${
                                TONE_CLASSES[activeChoice.tone].chip
                            }`}
                        >
                            <span className="font-semibold">Hva skjer:</span>{' '}
                            {activeChoice.consequence}
                        </motion.div>
                    )}
                    {phase === 'revealed' && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-4 py-3"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Alea iacta est — Terningen er kastet
                            </p>
                            <p className="mt-2 text-sm text-slate-700 leading-snug">
                                Cæsar krysset Rubicon. Han vant borgerkrigen — men beviste samtidig
                                at en general med en lojal hær kunne velte republikken. Etter ham
                                ville andre prøve det samme. Republikken som hadde stått i 460 år,
                                fikk dødsstøtet ved denne ene elven.
                            </p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                {CHOICES.map((c) => (
                                    <div
                                        key={c.id}
                                        className="text-xs bg-white border border-slate-200 rounded-md px-3 py-2"
                                    >
                                        <div className="font-semibold text-slate-700">
                                            {c.label.split(' ').slice(0, 2).join(' ')}…
                                        </div>
                                        <div className="text-slate-500 mt-1 leading-snug">
                                            {c.outcome}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {!activeChoice && phase === 'choosing' && (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400"
                        >
                            Klikk på et valg for å se konsekvensen.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={handleReveal}
                    disabled={!allExplored || phase === 'revealed'}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    {allExplored
                        ? phase === 'revealed'
                            ? 'Cæsars valg avslørt'
                            : 'Vis hva Cæsar faktisk gjorde'
                        : `Utforsk alle tre (${explored.size}/3)`}
                </button>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
