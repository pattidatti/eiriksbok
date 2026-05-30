import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Check, X, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

interface Evidence {
    id: string;
    text: string;
    source: string;
    valid: boolean;
    modernExplanation: string;
}

interface BevisVeierProps {
    title?: string;
}

const EVIDENCE_CARDS: Evidence[] = [
    {
        id: 'vannprove',
        text: 'Hun ble bundet og kastet i havet. Hun fløt, mens en uskyldig kvinne ville ha sunket.',
        source: 'Vannprøven, Vardø 1662',
        valid: false,
        modernExplanation:
            'Vannprøven er ikke et bevis - den er en felle. Hvis hun synker, drukner hun. Hvis hun flyter, blir hun brent. Det finnes ingen utvei. Moderne rett krever uavhengige bevis, ikke prøver som er umulige å bestå.',
    },
    {
        id: 'tilstaelse',
        text: 'Hun tilsto først etter fem netter uten søvn og pisking av lensmannen.',
        source: 'Tingbok fra Trondheim 1632',
        valid: false,
        modernExplanation:
            'Tortur gir falske tilståelser. Forskning viser at mennesker som utsettes for press, smerte og søvnmangel etter hvert sier hva som helst for å få det til å slutte. Norsk rett forbød tortur som rettsmiddel i 1734, og Grunnloven av 1814 forbyr det helt.',
    },
    {
        id: 'naboen-kua',
        text: 'Naboen sa at kua hennes døde dagen etter at hun og den anklagede kranglet om gjerdet.',
        source: 'Vitnemål, Finnmark 1652',
        valid: false,
        modernExplanation:
            'To hendelser som skjer etter hverandre er ikke bevis på årsak. En syk ku kunne dø av tusen ting. Moderne rett krever en konkret kobling mellom handling og skade - ikke bare et sammentreff og en mistenkelig fortelling.',
    },
    {
        id: 'djevelens-merke',
        text: 'Dommeren stakk en nål i en blå flekk på låret. Den blødde ikke, og hun kjente ingen smerte.',
        source: 'Sakspapirer, Bergen 1594',
        valid: false,
        modernExplanation:
            'Et arr eller en pigmentflekk er ikke et bevis. Død hud blør sjelden, og folk som var dypt redde merket ikke alltid små stikk. "Djevelens merke" var en oppfunnet test som speilet det dommerne allerede trodde.',
    },
    {
        id: 'barnet-vitnet',
        text: 'Hennes egen åtteåring fortalte at moren tok henne med på Domen for å danse med djevelen.',
        source: 'Barnevitne, Vardø 1663',
        valid: false,
        modernExplanation:
            'Barn er lette å lede med voksne spørsmål. I dag har vi egne regler for hvordan barn skal høres i retten - med nøytrale spørsmål, video og fagfolk. Et åtteårig barn presset av redde voksne kan fortelle hva som helst.',
    },
];

type Choice = 'valid' | 'invalid';
type Phase = 'active' | 'complete';

export function BevisVeier({ title = 'Bevis-veier - du er dommer i 1663' }: BevisVeierProps) {
    const [choices, setChoices] = useState<Record<string, Choice>>({});
    const [phase, setPhase] = useState<Phase>('active');

    const allAnswered = EVIDENCE_CARDS.every((c) => choices[c.id]);
    const correctCount = EVIDENCE_CARDS.filter(
        (c) => choices[c.id] === (c.valid ? 'valid' : 'invalid')
    ).length;
    const acceptedAsValid = EVIDENCE_CARDS.filter((c) => choices[c.id] === 'valid').length;

    const handleChoice = (id: string, choice: Choice) => {
        if (phase === 'complete') return;
        setChoices((prev) => ({ ...prev, [id]: choice }));
    };

    const handleReveal = () => {
        if (allAnswered) setPhase('complete');
    };

    const handleReset = () => {
        setChoices({});
        setPhase('active');
    };

    const verdict = (() => {
        if (acceptedAsValid >= 3) {
            return {
                tone: 'rose' as const,
                title: `Du dømte ${acceptedAsValid} bevis som holdbare.`,
                body: 'Slik så norsk rett ut på 1600-tallet. I Finnmark alene ble 91 kvinner brent på grunn av nettopp slike bevis. Du var en del av systemet.',
            };
        }
        if (acceptedAsValid >= 1) {
            return {
                tone: 'amber' as const,
                title: `Du godtok ${acceptedAsValid} av bevisene.`,
                body: 'Selv ett dårlig bevis kan koste et liv. Moderne rettssikkerhet bygger på "tvilen kommer den anklagede til gode" - i tvil, frifinn.',
            };
        }
        return {
            tone: 'emerald' as const,
            title: 'Du avviste alle fem. Du var som lagmann Mandrup Schønnebøl.',
            body: 'I 1663 reiste han til Vardø, leste protokollene og skrev til kongen at bevisene ikke holdt. Han er grunnen til at hekseprosessene begynte å stoppe.',
        };
    })();

    const toneClasses: Record<string, string> = {
        rose: 'bg-rose-50 border-rose-200 text-rose-800',
        amber: 'bg-amber-50 border-amber-200 text-amber-800',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Fem bevis fra ekte hekseprosesser. Hvilke holder? Velg for hver.
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {EVIDENCE_CARDS.map((card, i) => {
                    const choice = choices[card.id];
                    const revealed = phase === 'complete';
                    const correct = card.valid ? 'valid' : 'invalid';
                    const wasRight = choice === correct;

                    return (
                        <div
                            key={card.id}
                            className={`border rounded-xl p-4 transition-colors ${
                                revealed
                                    ? wasRight
                                        ? 'border-emerald-200 bg-emerald-50/50'
                                        : 'border-rose-200 bg-rose-50/50'
                                    : 'border-slate-200 bg-slate-50/40'
                            }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-slate-800 leading-relaxed">{card.text}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">
                                        Kilde: {card.source}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-10">
                                <button
                                    onClick={() => handleChoice(card.id, 'valid')}
                                    disabled={revealed}
                                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                                        choice === 'valid'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-400'
                                    } ${revealed ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <Check className="w-4 h-4" />
                                    Holdbart
                                </button>
                                <button
                                    onClick={() => handleChoice(card.id, 'invalid')}
                                    disabled={revealed}
                                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                                        choice === 'invalid'
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-500'
                                    } ${revealed ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <X className="w-4 h-4" />
                                    Tvilsomt
                                </button>
                            </div>

                            <AnimatePresence>
                                {revealed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 ml-10"
                                    >
                                        <div className="flex items-start gap-2 text-sm bg-white border border-slate-200 rounded-lg p-3">
                                            <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-slate-700 leading-relaxed">
                                                {card.modernExplanation}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {phase === 'complete' && (
                    <motion.div
                        key="verdict"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-5 py-4 rounded-xl border ${toneClasses[verdict.tone]}`}
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">{verdict.title}</p>
                                <p className="text-sm leading-relaxed">{verdict.body}</p>
                                <p className="text-xs mt-2 opacity-80">
                                    Du fikk {correctCount} av 5 riktig. Etter moderne rett er alle
                                    fem bevisene ugyldige.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                {phase === 'active' ? (
                    <button
                        onClick={handleReveal}
                        disabled={!allAnswered}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                            allAnswered
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Felle dom
                    </button>
                ) : (
                    <span className="text-sm text-slate-500">Dommen er falt.</span>
                )}
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
