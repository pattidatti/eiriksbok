import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Shield, Bird, RotateCcw, Sparkles } from 'lucide-react';

// Lyspære: Wienerkongressen valgte bevisst maktbalanse og stabilitet framfor
// folkets frihet. Eleven kjenner trade-offen ved å se to målere dra mot
// hverandre: nesten hvert valg som gir mer fred mellom stormaktene, gir mindre
// frihet til folket. Diplomatene valgte freden.

interface Option {
    label: string;
    fred: number;
    frihet: number;
    følge: string;
    historisk?: boolean;
}

interface Issue {
    spørsmål: string;
    a: Option;
    b: Option;
}

const ISSUES: Issue[] = [
    {
        spørsmål: 'Hva skal vi gjøre med Frankrike etter Napoleon?',
        a: {
            label: 'Straff Frankrike hardt og del opp landet',
            fred: -12,
            frihet: 0,
            følge: 'Et ydmyket Frankrike blir bittert. Hevnlyst kan tenne en ny krig senere.',
        },
        b: {
            label: 'La Frankrike bestå som en av stormaktene',
            fred: 16,
            frihet: 0,
            følge: 'Frankrike blir en motvekt i systemet. Ingen enkelt makt kan herske over resten.',
            historisk: true,
        },
    },
    {
        spørsmål: 'Hva gjør vi med de mange tyske småstatene?',
        a: {
            label: 'Saml dem til én sterk tysk nasjon',
            fred: -12,
            frihet: 14,
            følge: 'Tyskere som drømmer om én nasjon, jubler. Men en stor ny stat i midten av Europa skremmer naboene.',
        },
        b: {
            label: 'Hold dem delt og svake',
            fred: 14,
            frihet: -14,
            følge: '39 småstater holder midten av Europa rolig. Men folk som vil ha én nasjon, blir skuffet.',
            historisk: true,
        },
    },
    {
        spørsmål: 'Hva gjør vi med folk som krever grunnlover og rettigheter?',
        a: {
            label: 'Gi folket grunnlover og mer selvstyre',
            fred: -12,
            frihet: 18,
            følge: 'Frihetsideene fra revolusjonen får leve videre. Men de sprer uro blant de gamle kongene.',
        },
        b: {
            label: 'Gjeninnsett kongene og slå ned opprør',
            fred: 14,
            frihet: -18,
            følge: 'Eneveldige konger vender tilbake. Ro på overflaten, men sinne ulmer under.',
            historisk: true,
        },
    },
    {
        spørsmål: 'Hva gjør vi med Norge, som nettopp skrev sin egen grunnlov?',
        a: {
            label: 'La Norge bli helt selvstendig',
            fred: -8,
            frihet: 12,
            følge: 'Nordmenn får styre seg selv. Men det bryter avtalen stormaktene gjorde med Sverige.',
        },
        b: {
            label: 'La Norge gå i union med Sverige',
            fred: 12,
            frihet: -6,
            følge: 'Norge får beholde Grunnloven, men deler konge med Sverige. Stormaktene får roen sin.',
            historisk: true,
        },
    },
];

interface WienerkongressenForhandlingProps {
    title?: string;
}

type Phase = 'play' | 'done';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

function Meter({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    {icon}
                    {label}
                </span>
                <span className="text-xs font-bold tabular-nums text-slate-700">
                    {Math.round(value)}
                </span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
            </div>
        </div>
    );
}

export function WienerkongressenForhandling({
    title = 'Forhandlingsbordet i Wien',
}: WienerkongressenForhandlingProps) {
    const [step, setStep] = useState(0);
    const [fred, setFred] = useState(50);
    const [frihet, setFrihet] = useState(50);
    const [picked, setPicked] = useState<'a' | 'b' | null>(null);
    const [phase, setPhase] = useState<Phase>('play');

    const issue = ISSUES[step];

    const choose = (which: 'a' | 'b') => {
        if (picked) return;
        const opt = which === 'a' ? issue.a : issue.b;
        setFred((f) => clamp(f + opt.fred));
        setFrihet((f) => clamp(f + opt.frihet));
        setPicked(which);
    };

    const next = () => {
        if (step + 1 >= ISSUES.length) {
            setPhase('done');
            return;
        }
        setStep((s) => s + 1);
        setPicked(null);
    };

    const reset = () => {
        setStep(0);
        setFred(50);
        setFrihet(50);
        setPicked(null);
        setPhase('play');
    };

    const sluttord = useMemo(() => {
        if (fred >= frihet + 12)
            return 'Du valgte som diplomatene i Wien: stabilitet og maktbalanse framfor frihet. Det ga ro mellom stormaktene, men folket måtte vente på rettighetene sine.';
        if (frihet >= fred + 12)
            return 'Du satte folkets frihet høyt. Det er edelt, men i 1815 ville slike valg ha skremt de gamle kongene og kanskje tent ny uro.';
        return 'Du prøvde å balansere fred og frihet. Diplomatene i Wien valgte nesten alltid freden, og merket at de to sjelden kan løftes samtidig.';
    }, [fred, frihet]);

    const valgtOpt = picked ? (picked === 'a' ? issue.a : issue.b) : null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg som diplomatene. Se hva hvert valg gjør med freden og friheten.
                    </p>
                </div>
            </div>

            {/* Målere */}
            <div className="px-6 pt-4 flex gap-5">
                <Meter
                    label="Fred mellom stormaktene"
                    value={fred}
                    icon={<Shield className="w-3.5 h-3.5 text-blue-500" />}
                    color="bg-blue-500"
                />
                <Meter
                    label="Frihet for folket"
                    value={frihet}
                    icon={<Bird className="w-3.5 h-3.5 text-emerald-500" />}
                    color="bg-emerald-500"
                />
            </div>

            {/* Interaksjonsflate */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {phase === 'play' ? (
                        <motion.div
                            key={`issue-${step}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
                                Sak {step + 1} av {ISSUES.length}
                            </p>
                            <p className="font-medium text-slate-800 mb-4">{issue.spørsmål}</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {(['a', 'b'] as const).map((key) => {
                                    const opt = key === 'a' ? issue.a : issue.b;
                                    const isPicked = picked === key;
                                    const dimmed = picked && !isPicked;
                                    return (
                                        <motion.button
                                            key={key}
                                            onClick={() => choose(key)}
                                            disabled={!!picked}
                                            whileHover={!picked ? { scale: 1.02 } : undefined}
                                            whileTap={!picked ? { scale: 0.98 } : undefined}
                                            className={`text-left rounded-xl border-2 p-4 transition-colors ${
                                                isPicked
                                                    ? 'bg-indigo-50 border-indigo-400'
                                                    : dimmed
                                                      ? 'bg-slate-50 border-slate-200 opacity-50'
                                                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold text-slate-800">
                                                {opt.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-3">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Kongressen er ferdig</h4>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                                {sluttord}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto mt-3">
                                I virkeligheten valgte diplomatene stabilitet nesten hver gang. Det
                                ga Europa nesten hundre år uten storkrig mellom stormaktene. Men de
                                undertrykte folkets ønske om frihet og selvstyre, og det tente nye
                                opprør i 1830 og 1848.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 mb-4 min-h-[3.5rem]">
                <AnimatePresence mode="wait">
                    {valgtOpt && phase === 'play' ? (
                        <motion.div
                            key={`fb-${step}-${picked}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm"
                        >
                            {valgtOpt.følge}
                        </motion.div>
                    ) : (
                        phase === 'play' && (
                            <p className="px-1 text-sm text-slate-400 italic">
                                Velg ett av de to alternativene over.
                            </p>
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                {phase === 'play' ? (
                    <button
                        onClick={next}
                        disabled={!picked}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                            picked
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {step + 1 >= ISSUES.length ? 'Avslutt kongressen' : 'Neste sak'}
                    </button>
                ) : (
                    <span className="text-sm font-medium text-emerald-600">
                        Maktbalansen er satt.
                    </span>
                )}
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
