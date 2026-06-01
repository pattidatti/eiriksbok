import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Users, Crown, RotateCcw, Check, X, ArrowUp } from 'lucide-react';

interface ExamLevel {
    navn: string;
    sted: string;
    startKandidater: number;
    beståttKandidater: number;
    sporsmal: string;
    valg: { tekst: string; riktig: boolean }[];
    forklaring: string;
}

const LEVELS: ExamLevel[] = [
    {
        navn: 'Lokaleksamen',
        sted: 'I hjembyen din',
        startKandidater: 3000,
        beståttKandidater: 600,
        sporsmal: 'For å bestå må du kunne tekstene til en bestemt tenker nesten ordrett. Hvem?',
        valg: [
            { tekst: 'Konfutsios', riktig: true },
            { tekst: 'Buddha', riktig: false },
            { tekst: 'Qin Shi Huang', riktig: false },
        ],
        forklaring:
            'Hele eksamenssystemet bygde på Konfutsios sine skrifter. Den som kunne dem best, kom videre.',
    },
    {
        navn: 'Provinseksamen',
        sted: 'I provinshovedstaden',
        startKandidater: 600,
        beståttKandidater: 90,
        sporsmal: 'Hva gjorde keju-systemet så uvanlig for sin tid?',
        valg: [
            { tekst: 'Bare adelens sønner fikk delta', riktig: false },
            { tekst: 'I prinsippet kunne hvem som helst delta, uansett fødsel', riktig: true },
            { tekst: 'Man måtte betale keiseren for å få bestå', riktig: false },
        ],
        forklaring:
            'Ikke fødsel, ikke rikdom, men kunnskap åpnet døra. Sønner av bønder kunne i teorien nå toppen. Det var revolusjonerende.',
    },
    {
        navn: 'Hoffeksamen',
        sted: 'I Beijing, foran keiseren',
        startKandidater: 90,
        beståttKandidater: 30,
        sporsmal: 'Hva het tittelen de aller beste fikk - en av rikets mest prestisjefylte?',
        valg: [
            { tekst: 'Mandarin', riktig: false },
            { tekst: 'Shi Huang', riktig: false },
            { tekst: 'Jinshi', riktig: true },
        ],
        forklaring:
            'Den som klarte alle tre nivåene ble jinshi og kunne få de høyeste embetene i riket. De fleste brukte hele livet på å forberede seg og kom aldri hit.',
    },
];

type Phase = 'intro' | 'asking' | 'feedback' | 'failed' | 'jinshi';

export function KejuEksamen({ title = 'Keisereksamen' }: { title?: string }) {
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<Phase>('intro');
    const [valgtIndex, setValgtIndex] = useState<number | null>(null);

    const level = LEVELS[step];

    const handleSvar = (index: number) => {
        if (phase !== 'asking') return;
        setValgtIndex(index);
        const riktig = level.valg[index].riktig;
        setPhase(riktig ? 'feedback' : 'failed');
    };

    const handleNeste = () => {
        if (step + 1 >= LEVELS.length) {
            setPhase('jinshi');
        } else {
            setStep(step + 1);
            setValgtIndex(null);
            setPhase('asking');
        }
    };

    const handleReset = () => {
        setStep(0);
        setValgtIndex(null);
        setPhase('intro');
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-rose-50">
                <Scroll className="w-5 h-5 text-amber-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Klatre de tre eksamensnivåene - om du klarer det.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Ladder progress */}
                <div className="flex items-center justify-between gap-2">
                    {LEVELS.map((l, i) => {
                        const reached = i < step || (i === step && phase !== 'intro');
                        const cleared = i < step || phase === 'jinshi';
                        return (
                            <div key={l.navn} className="flex-1 flex flex-col items-center">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                                        cleared
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : reached
                                              ? 'bg-amber-100 border-amber-400 text-amber-700'
                                              : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                >
                                    {cleared ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className="text-[11px] text-slate-500 mt-1 text-center leading-tight">{l.navn}</span>
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-4"
                        >
                            <p className="text-slate-600 text-sm mb-4">
                                3000 kandidater stiller til eksamen i hjembyen din. Bare de klokeste kommer videre.
                                Klarer du å bli en av de 30 som blir jinshi?
                            </p>
                            <button
                                onClick={() => setPhase('asking')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                            >
                                Start eksamen
                            </button>
                        </motion.div>
                    )}

                    {(phase === 'asking' || phase === 'feedback' || phase === 'failed') && (
                        <motion.div
                            key={`q-${step}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-slate-500">{level.sted}</div>
                                    <div className="font-semibold text-slate-800">{level.navn}</div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm tabular-nums">{level.startKandidater.toLocaleString('nb-NO')} kandidater</span>
                                </div>
                            </div>

                            <p className="text-slate-800 font-medium">{level.sporsmal}</p>

                            <div className="space-y-2">
                                {level.valg.map((v, i) => {
                                    const erValgt = valgtIndex === i;
                                    const visFasit = phase !== 'asking';
                                    let stil = 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-slate-700';
                                    if (visFasit && v.riktig) stil = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                                    else if (visFasit && erValgt && !v.riktig) stil = 'bg-rose-50 border-rose-300 text-rose-800';
                                    else if (visFasit) stil = 'bg-white border-slate-200 text-slate-400';
                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: phase === 'asking' ? 1.01 : 1 }}
                                            whileTap={{ scale: phase === 'asking' ? 0.99 : 1 }}
                                            disabled={phase !== 'asking'}
                                            onClick={() => handleSvar(i)}
                                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between transition-colors ${stil}`}
                                        >
                                            <span>{v.tekst}</span>
                                            {visFasit && v.riktig && <Check className="w-4 h-4 text-emerald-600" />}
                                            {visFasit && erValgt && !v.riktig && <X className="w-4 h-4 text-rose-600" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase === 'feedback' && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                        >
                            <div className="flex items-start gap-2">
                                <ArrowUp className="w-4 h-4 mt-0.5 shrink-0" />
                                <div>
                                    <strong>Bestått!</strong> Bare {level.beståttKandidater.toLocaleString('nb-NO')} av {level.startKandidater.toLocaleString('nb-NO')} kommer videre. {level.forklaring}
                                </div>
                            </div>
                            <button
                                onClick={handleNeste}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                            >
                                {step + 1 >= LEVELS.length ? 'Møt keiseren' : 'Neste nivå'}
                            </button>
                        </motion.div>
                    )}

                    {phase === 'failed' && (
                        <motion.div
                            key="failed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm"
                        >
                            <strong>Du strøk.</strong> Som de fleste kandidatene reiser du hjem og leser videre til neste år. {level.forklaring}
                            <button
                                onClick={handleReset}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Prøv igjen
                            </button>
                        </motion.div>
                    )}

                    {phase === 'jinshi' && (
                        <motion.div
                            key="jinshi"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-4 py-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2"
                        >
                            <Crown className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                            <div>
                                <strong>Du er blitt jinshi.</strong>
                                <p className="text-xs mt-1 text-amber-800">
                                    Av 3000 kandidater er du en av rundt 30. Nå venter et embete i keiserens tjeneste.
                                    Familien din - kanskje bønder - har fått en mandarin i slekta. Slik lot keju vanlige folk
                                    klatre til maktens tinder gjennom kunnskap alene.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-3 inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Start på nytt
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
