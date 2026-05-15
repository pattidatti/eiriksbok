import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

type Phase = 'idle' | 'one-found' | 'complete';

interface Clue {
    id: string;
    label: string;
    isKey: boolean;
    wrongHint: string;
}

const AMNESTY_CLUES: Clue[] = [
    {
        id: 'amnesty-tilgivelse',
        label: 'full tilgivelse',
        isKey: false,
        wrongHint: 'Ordet «tilgivelse» klinger fint, men det forteller ikke hvor begrensningen ligger.',
    },
    {
        id: 'amnesty-mot-kronen',
        label: 'mot kronen',
        isKey: true,
        wrongHint: '',
    },
    {
        id: 'amnesty-kongelig-ord',
        label: 'mitt kongelige ord',
        isKey: false,
        wrongHint: 'Kongens ord var alvor — men selv et alvorlig løfte kan ha et hull.',
    },
];

const VERDICT_CLUES: Clue[] = [
    {
        id: 'verdict-domsbrev',
        label: 'domsbrev',
        isKey: false,
        wrongHint: 'Selve domsbrevet er bare papiret. Se etter hva folk ble dømt for.',
    },
    {
        id: 'verdict-kjetteri',
        label: 'kjetteri',
        isKey: true,
        wrongHint: '',
    },
    {
        id: 'verdict-biskop',
        label: 'biskop Brask',
        isKey: false,
        wrongHint: 'Hvem som dømte er viktig, men spørsmålet er hva anklagen handlet om.',
    },
];

interface LovensSmutthullProps {
    title?: string;
}

export function LovensSmutthull({ title = 'Lovens smutthull' }: LovensSmutthullProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [picked, setPicked] = useState<{ amnesty?: string; verdict?: string }>({});
    const [feedback, setFeedback] = useState<string>('Klikk det viktigste ordet i hvert dokument. Sammen avslører de fellen.');
    const [feedbackKind, setFeedbackKind] = useState<'info' | 'warn' | 'success'>('info');

    const handlePick = (side: 'amnesty' | 'verdict', clue: Clue) => {
        if (phase === 'complete') return;

        if (!clue.isKey) {
            setFeedback(clue.wrongHint);
            setFeedbackKind('warn');
            return;
        }

        const next = { ...picked, [side]: clue.id };
        setPicked(next);

        if (next.amnesty && next.verdict) {
            setPhase('complete');
            setFeedback(
                'Amnesti-brevet dekket bare forbrytelser «mot kronen». Anklagen om «kjetteri» var en synd mot Gud — og falt utenfor brevets ord. Christian II brukte kirkens domstol til å gjøre det hans eget løfte forbød.'
            );
            setFeedbackKind('success');
        } else {
            setPhase('one-found');
            const remaining = side === 'amnesty' ? 'domsbrevet til biskopen' : 'amnesti-brevet fra kongen';
            setFeedback(`Bra. Finn nå det avgjørende ordet i ${remaining}.`);
            setFeedbackKind('info');
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setPicked({});
        setFeedback('Klikk det viktigste ordet i hvert dokument. Sammen avslører de fellen.');
        setFeedbackKind('info');
    };

    const renderClue = (side: 'amnesty' | 'verdict', clue: Clue) => {
        const isPicked = picked[side] === clue.id;
        const isLockedRight = phase === 'complete' && clue.isKey;
        return (
            <button
                key={clue.id}
                onClick={() => handlePick(side, clue)}
                disabled={phase === 'complete'}
                className={
                    'inline-block px-2 py-0.5 mx-0.5 rounded-md border transition-all ' +
                    (isLockedRight
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400'
                        : isPicked
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer')
                }
            >
                {clue.label}
            </button>
        );
    };

    const feedbackColor =
        feedbackKind === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : feedbackKind === 'warn'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-blue-50 border-blue-200 text-blue-700';

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <ScrollText className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Finn ordet i hvert dokument som forklarer hvorfor amnestiet ikke reddet adelsmennene.
                    </p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    layout
                    className={
                        'rounded-lg border p-5 transition-colors ' +
                        (picked.amnesty
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-amber-50/30 border-amber-200')
                    }
                >
                    <div className="flex items-center gap-2 mb-3">
                        <ScrollText className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                            Amnesti-brevet — november 1520
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                        «Jeg, Christian, konge av Danmark og nå også Sverige, gir herved{' '}
                        {renderClue('amnesty', AMNESTY_CLUES[0])} til enhver svensk adelsmann og borger
                        som har handlet {renderClue('amnesty', AMNESTY_CLUES[1])} i krigens år. Dette
                        bekrefter jeg med {renderClue('amnesty', AMNESTY_CLUES[2])}.»
                    </p>
                </motion.div>

                <motion.div
                    layout
                    className={
                        'rounded-lg border p-5 transition-colors ' +
                        (picked.verdict
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/30 border-rose-200')
                    }
                >
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                            Domsbrevet — 7. november 1520
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                        «Etter at {renderClue('verdict', VERDICT_CLUES[2])} har lagt frem bevis for kirkens
                        domstol, finnes de under-skrevne adelsmenn skyldige i{' '}
                        {renderClue('verdict', VERDICT_CLUES[1])} mot Den hellige kirke. Dette{' '}
                        {renderClue('verdict', VERDICT_CLUES[0])} sender dem til bøddelens øks i morgen
                        ved daggry.»
                    </p>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={feedback + feedbackKind}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={'mx-6 mb-4 px-4 py-3 rounded-lg border text-sm ' + feedbackColor}
                >
                    {phase === 'complete' && (
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="flex items-center gap-2 mb-2 font-semibold text-emerald-800"
                        >
                            <Sparkles className="w-4 h-4" />
                            Du fant smutthullet
                        </motion.div>
                    )}
                    <p>{feedback}</p>
                </motion.div>
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {phase === 'complete'
                        ? 'Ferdig — prøv igjen for å se hvordan ordene henger sammen.'
                        : 'To klikk avslører tyrannens triks.'}
                </span>
                <button
                    onClick={handleReset}
                    className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
