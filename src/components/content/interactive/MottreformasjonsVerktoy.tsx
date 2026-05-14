import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shield, Scale, RotateCcw, Check, ArrowRight } from 'lucide-react';

type ToolId = 'trento' | 'jesuitter' | 'inkvisisjon';

interface Tool {
    id: ToolId;
    title: string;
    short: string;
    icon: typeof BookOpen;
    color: string;
    ring: string;
}

interface Challenge {
    text: string;
    answer: ToolId;
    explanation: string;
}

const TOOLS: Tool[] = [
    {
        id: 'trento',
        title: 'Tridentinerkonsilet',
        short: 'Avklare læren',
        icon: BookOpen,
        color: 'bg-amber-50 border-amber-300 text-amber-800',
        ring: 'ring-amber-400',
    },
    {
        id: 'jesuitter',
        title: 'Jesuittene',
        short: 'Misjon og skoler',
        icon: Shield,
        color: 'bg-indigo-50 border-indigo-300 text-indigo-800',
        ring: 'ring-indigo-400',
    },
    {
        id: 'inkvisisjon',
        title: 'Inkvisisjon og Index',
        short: 'Kontroll og sensur',
        icon: Scale,
        color: 'bg-rose-50 border-rose-300 text-rose-800',
        ring: 'ring-rose-400',
    },
];

const CHALLENGES: Challenge[] = [
    {
        text: 'En luthersk pamflett selges i smug på markedet i Antwerpen. Hvilket verktøy stopper den?',
        answer: 'inkvisisjon',
        explanation:
            'Inkvisisjonen og Index Librorum Prohibitorum — den forbudte-bok-listen — gjorde det livsfarlig å trykke eller selge kjettersk litteratur. Bøker ble brent, trykkerier ble stengt.',
    },
    {
        text: 'Katolske prester strides om frelse: holder det å tro, eller må man også gjøre gode gjerninger?',
        answer: 'trento',
        explanation:
            'På Tridentinerkonsilet (1545–1563) avklarte kirken læren: både tro OG gjerninger trengs. Læresetningene ble skrevet ned i 25 sesjoner over 18 år.',
    },
    {
        text: 'Indianerne i Paraguay har aldri hørt om Jesus. Hvem reiser ut for å undervise dem?',
        answer: 'jesuitter',
        explanation:
            'Jesuittene var pavens spesialstyrke for misjon. De grunnla skoler og «misjoner» i Sør-Amerika, Asia og Afrika, og bygget hele samfunn av nyomvendte.',
    },
    {
        text: 'En spansk kvinne sier at hun har egne åpenbaringer fra Gud og trenger ikke prester. Hva svarer kirken?',
        answer: 'inkvisisjon',
        explanation:
            'Inkvisisjonen, særlig den spanske, jaktet på alle som hevdet egne sannheter ved siden av kirkens. Forhør, tortur og bål var verktøyene.',
    },
    {
        text: 'Kongebarnet i Frankrike trenger god utdanning i katolsk tro og latin. Hvem ansetter de?',
        answer: 'jesuitter',
        explanation:
            'Jesuittene bygget Europas beste skoler. På 1600-tallet var jesuittutdanning gullstandarden — også fyrster og konger lot barna sine gå der.',
    },
    {
        text: 'Mange prester kan ikke lese latin og kjenner ikke til kirkens egen lære. Hva må gjøres?',
        answer: 'trento',
        explanation:
            'Tridentinerkonsilet vedtok at hvert bispedømme måtte starte seminarer — egne skoler der prester ble grundig utdannet før de fikk lov til å preke.',
    },
];

type Phase = 'idle' | 'feedback' | 'complete';

export function MottreformasjonsVerktoy({ title = 'Pavens verktøykasse' }: { title?: string }) {
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<ToolId | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const [correctCount, setCorrectCount] = useState(0);

    const current = CHALLENGES[index];
    const isCorrect = picked !== null && picked === current.answer;
    const isLast = index === CHALLENGES.length - 1;

    function pickTool(toolId: ToolId) {
        if (phase !== 'idle') return;
        setPicked(toolId);
        setPhase('feedback');
        if (toolId === current.answer) {
            setCorrectCount((c) => c + 1);
        }
    }

    function next() {
        if (isLast) {
            setPhase('complete');
            return;
        }
        setIndex((i) => i + 1);
        setPicked(null);
        setPhase('idle');
    }

    function reset() {
        setIndex(0);
        setPicked(null);
        setCorrectCount(0);
        setPhase('idle');
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg verktøyet kirken brukte mot hver utfordring.
                    </p>
                </div>
                <div className="ml-auto text-sm text-slate-500">
                    {phase === 'complete'
                        ? `Ferdig — ${correctCount} av ${CHALLENGES.length}`
                        : `${index + 1} / ${CHALLENGES.length}`}
                </div>
            </div>

            <div className="p-6">
                {phase !== 'complete' && (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="mb-5 px-4 py-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-base"
                            >
                                {current.text}
                            </motion.div>
                        </AnimatePresence>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {TOOLS.map((tool) => {
                                const Icon = tool.icon;
                                const isPicked = picked === tool.id;
                                const showAsRight =
                                    phase === 'feedback' && tool.id === current.answer;
                                const showAsWrong =
                                    phase === 'feedback' && isPicked && !isCorrect;
                                return (
                                    <motion.button
                                        key={tool.id}
                                        onClick={() => pickTool(tool.id)}
                                        disabled={phase !== 'idle'}
                                        whileHover={phase === 'idle' ? { y: -2 } : undefined}
                                        whileTap={phase === 'idle' ? { scale: 0.97 } : undefined}
                                        animate={
                                            showAsWrong
                                                ? { x: [0, -6, 6, -4, 4, 0] }
                                                : showAsRight
                                                  ? { scale: [1, 1.04, 1] }
                                                  : { x: 0, scale: 1 }
                                        }
                                        transition={{ duration: 0.4 }}
                                        className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                                            tool.color
                                        } ${
                                            showAsRight
                                                ? 'ring-2 ring-emerald-400 border-emerald-400'
                                                : showAsWrong
                                                  ? 'ring-2 ring-rose-400 border-rose-400 opacity-90'
                                                  : phase === 'feedback'
                                                    ? 'opacity-60'
                                                    : `hover:shadow-md hover:${tool.ring}`
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-semibold text-sm">
                                                {tool.title}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-80">{tool.short}</p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </>
                )}

                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-3"
                        >
                            <Check className="w-8 h-8" />
                        </motion.div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-1">
                            Verktøykassa er kartlagt
                        </h4>
                        <p className="text-slate-600 text-sm">
                            Du fikk {correctCount} av {CHALLENGES.length} riktig. Mottreformasjonen
                            var ikke ett angrep, men tre samtidige strategier: avklare læren,
                            spre den, og kontrollere det folk leste.
                        </p>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {phase === 'feedback' && (
                    <motion.div
                        key={`fb-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg border text-sm ${
                            isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                    >
                        <strong className="block mb-1">
                            {isCorrect ? 'Riktig.' : 'Ikke helt.'}
                        </strong>
                        {current.explanation}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={next}
                    disabled={phase === 'idle'}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                        phase === 'idle'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : phase === 'complete'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    {isLast && phase === 'feedback' ? 'Avslutt' : 'Neste utfordring'}
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
