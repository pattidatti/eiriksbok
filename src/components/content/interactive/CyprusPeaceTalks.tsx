import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronRight, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface Option {
    id: string;
    text: string;
    greekDelta: number;
    turkishDelta: number;
    feedback: string;
}

interface Issue {
    title: string;
    description: string;
    options: Option[];
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const issues: Issue[] = [
    {
        title: 'Eiendomsrettigheter',
        description:
            'Krigen i 1974 drev 160 000 gresk-kyprioter fra hjemmene sine i nord. Tyrkiske kyprioter som flyktet sørover fikk tildelt disse husene. Hva skjer med eiendommene i en gjenforent Kypros?',
        options: [
            {
                id: 'a',
                text: 'Alle eiendommer tilbakeføres til de opprinnelige eierne. De som bor der nå må flytte ut.',
                greekDelta: 22,
                turkishDelta: -18,
                feedback:
                    'Gresk-kyprioter er fornøyde, men de tyrkisk-kypriotiske familiene som har bodd i husene i 30 år er rasende og sier de aldri vil godta planen.',
            },
            {
                id: 'b',
                text: 'Nåværende beboere beholder hjemmene sine. De opprinnelige eierne får erstatning i penger.',
                greekDelta: -18,
                turkishDelta: 22,
                feedback:
                    'Tyrkiske kyprioter er lettet. Men gresk-kyprioter sier dette er å selge ut retten til hjemstedet, og mange vil aldri ta imot penger for huset der de vokste opp.',
            },
            {
                id: 'c',
                text: 'Blandet løsning: noen eiendommer tilbakeføres, andre kompenseres. En FN-kommisjon avgjør sak for sak.',
                greekDelta: 8,
                turkishDelta: 6,
                feedback:
                    'En forsiktig enighet. Begge sider er usikre, men ingen forlater bordet ennå.',
            },
        ],
    },
    {
        title: 'Tyrkiske soldater',
        description:
            'Tyrkia har hatt 30 000-40 000 soldater på Kypros siden 1974. Gresk-kyprioter kaller det en okkupasjon. Tyrkia kaller det en garanti for tyrkisk-kyprioters sikkerhet. Hva skjer med troppene?',
        options: [
            {
                id: 'a',
                text: 'Alle tyrkiske soldater trekkes tilbake innen tre år. Ingen fremmed hær på øya.',
                greekDelta: 22,
                turkishDelta: -18,
                feedback:
                    'Gresk-kyprioter er fornøyde. Men Tyrkia og tyrkiske kyprioter er nervøse: hva hindrer et nytt statskupp uten tyrkisk militærgaranti?',
            },
            {
                id: 'b',
                text: 'Tyrkiske styrker kan forbli permanent som garantist for tyrkisk-kyprioters sikkerhet.',
                greekDelta: -20,
                turkishDelta: 22,
                feedback:
                    'For tyrkiske kyprioter er dette en nødvendig trygghet. Gresk-kyprioter mener ingen land kan godta en permanent fremmed hær på eget territorium.',
            },
            {
                id: 'c',
                text: 'Gradvis nedtrapning over ti år under FN-overvåking. En liten fredsbevarende styrke kan bli igjen.',
                greekDelta: 8,
                turkishDelta: 8,
                feedback:
                    'Begge sider kan leve med dette - for nå. Spørsmålet er hva som skjer etter ti år.',
            },
        ],
    },
    {
        title: 'Varosha',
        description:
            'Spøkelsesbyen Varosha har stått tom siden 1974. 40 000 gresk-kyprioter flyktet herfra. Mange holder fremdeles på nøklene til husene sine og drømmer om å vende hjem.',
        options: [
            {
                id: 'a',
                text: 'Varosha åpnes umiddelbart og tilbakeføres til de gresk-kypriotiske flyktningene.',
                greekDelta: 18,
                turkishDelta: -16,
                feedback:
                    'Et sterkt symbol på forsoning for gresk-kyprioter. Tyrkiske kyprioter er bekymret for at dette skaper presedens som truer alle andre boliger i nord.',
            },
            {
                id: 'b',
                text: 'Varosha holdes stengt som forhandlingskort i minst ti år til.',
                greekDelta: -20,
                turkishDelta: 15,
                feedback:
                    'Gresk-kyprioter er rasende. De har allerede ventet i 30 år. Mange sier de vil aldri stole på en plan som ikke åpner Varosha umiddelbart.',
            },
            {
                id: 'c',
                text: 'Varosha overtas av FN og åpnes gradvis over fem år, styrt av en blandet kommisjon.',
                greekDelta: 10,
                turkishDelta: 6,
                feedback:
                    'En pragmatisk løsning. Ikke perfekt for noen, men gjennomførbar for begge.',
            },
        ],
    },
    {
        title: 'Styreform',
        description:
            'Gresk-kyprioter utgjør om lag 80% av befolkningen. Tyrkiske kyprioter er en minoritet på rundt 18%. Hvordan skal makt fordeles i en gjenforent Kypros?',
        options: [
            {
                id: 'a',
                text: 'Proporsjonal representasjon - den største gruppen kontrollerer parlamentet naturlig.',
                greekDelta: 20,
                turkishDelta: -22,
                feedback:
                    'Demokratisk sett logisk for gresk-kyprioter. Men tyrkiske kyprioter sier dette gjør dem til en evig minoritet uten reell makt - akkurat det de frykter mest.',
            },
            {
                id: 'b',
                text: 'Lik representasjon uavhengig av folketal - begge grupper har vetorett i viktige saker.',
                greekDelta: -20,
                turkishDelta: 20,
                feedback:
                    'Tyrkiske kyprioter føler seg trygge. Gresk-kyprioter mener det er urimelig at 18% av befolkningen kan blokkere flertallet.',
            },
            {
                id: 'c',
                text: 'Føderal løsning med roterende presidentskap og delt vetorett på utvalgte saker.',
                greekDelta: 7,
                turkishDelta: 10,
                feedback:
                    'Begge sider er skeptiske, men ser at en føderal modell kanskje er det eneste som kan fungere i praksis.',
            },
        ],
    },
    {
        title: 'EU-integrasjon',
        description:
            'Kypros ble EU-medlem i 2004, men bare den gresk-kypriotiske sørlige delen. Hva skjer med Nord-Kypros og EU-regelverket ved en gjenforening?',
        options: [
            {
                id: 'a',
                text: 'Nord-Kypros implementerer alle EU-regler umiddelbart ved gjenforening.',
                greekDelta: 18,
                turkishDelta: -16,
                feedback:
                    'Raskest mulig normalisering. Men nord har en annen økonomi og lovgivning - full EU-implementering fra dag én kan sette mange nordlige virksomheter konkurs.',
            },
            {
                id: 'b',
                text: 'Nord-Kypros får 20 år unntak fra EU-regler for å beskytte sin økonomi.',
                greekDelta: -12,
                turkishDelta: 20,
                feedback:
                    'Gir nord tid til omstilling. Gresk-kyprioter mener 20 år er en evig utsettelse og skaper et permanent to-klassesystem innad i landet.',
            },
            {
                id: 'c',
                text: 'Nord-Kypros får 10 år på å gradvis innføre EU-standarder, med støtte fra EU-fondet.',
                greekDelta: 6,
                turkishDelta: 10,
                feedback: 'Et realistisk kompromiss. Begge sider nikker forsiktig.',
            },
        ],
    },
];

interface SatBarProps {
    value: number;
    label: string;
}

const SatBar = ({ value, label }: SatBarProps) => {
    const barColor =
        value >= 50 ? 'bg-emerald-500' : value >= 30 ? 'bg-amber-400' : 'bg-rose-500';
    const textColor =
        value >= 50 ? 'text-emerald-600' : value >= 30 ? 'text-amber-600' : 'text-rose-600';
    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 truncate pr-2">{label}</span>
                <span className={`text-xs font-bold shrink-0 ${textColor}`}>{value}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export const CyprusPeaceTalks: React.FC = () => {
    const [phase, setPhase] = useState<'intro' | 'negotiating' | 'result'>('intro');
    const [issueIdx, setIssueIdx] = useState(0);
    const [greek, setGreek] = useState(45);
    const [turkish, setTurkish] = useState(45);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const currentIssue = issues[issueIdx];
    const isLast = issueIdx === issues.length - 1;

    const select = (opt: Option) => {
        if (chosen) return;
        setGreek((v) => clamp(v + opt.greekDelta));
        setTurkish((v) => clamp(v + opt.turkishDelta));
        setChosen(opt.id);
        setFeedback(opt.feedback);
    };

    const advance = () => {
        if (isLast) {
            setPhase('result');
        } else {
            setIssueIdx((i) => i + 1);
            setChosen(null);
            setFeedback(null);
        }
    };

    const reset = () => {
        setPhase('intro');
        setIssueIdx(0);
        setGreek(45);
        setTurkish(45);
        setChosen(null);
        setFeedback(null);
    };

    const bothOK = greek >= 50 && turkish >= 50;
    const greekOnly = greek >= 50 && turkish < 50;
    const turkishOnly = turkish >= 50 && greek < 50;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto my-6">
            {/* Header */}
            <div className="bg-[#4b9cd3] text-white px-5 py-4 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                    <Scale className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-base leading-tight">Forhandlingsbordet</h3>
                    <p className="text-white/70 text-[11px] uppercase tracking-widest font-semibold">
                        FN-mekler-simulering - Annan-planen 2004
                    </p>
                </div>
            </div>

            {/* Satisfaction bars - visible during game */}
            {phase !== 'intro' && (
                <div className="px-5 py-3 bg-white border-b border-slate-100 flex gap-6">
                    <SatBar value={greek} label="Gresk-kypriotisk delegasjon" />
                    <SatBar value={turkish} label="Tyrkisk-kypriotisk delegasjon" />
                </div>
            )}

            <div className="p-5">
                {/* ── INTRO ─────────────────────────────────────────────────── */}
                {phase === 'intro' && (
                    <div className="text-center py-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4b9cd3]/10 mb-4">
                            <Scale className="w-8 h-8 text-[#4b9cd3]" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-3">
                            Kan du megle frem en fredsavtale?
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                            Det er april 2004. FN-generalsekretær Kofi Annan har lagt frem en fredsplan
                            for et gjenforent Kypros. Du er FN-mekler. De to delegasjonene sitter ved
                            bordet, men begge er skeptiske. Du har fem store stridsspørsmål å løse.
                            Klarer du å finne en avtale begge sider kan godta?
                        </p>
                        <div className="flex justify-center gap-12 mb-6 text-center">
                            <div>
                                <div className="text-2xl mb-1">🏛</div>
                                <div className="text-xs font-semibold text-slate-600">Gresk-kyprioter</div>
                                <div className="text-xs text-slate-400">Tilfredshet: 45%</div>
                            </div>
                            <div>
                                <div className="text-2xl mb-1">🕌</div>
                                <div className="text-xs font-semibold text-slate-600">Tyrkiske kyprioter</div>
                                <div className="text-xs text-slate-400">Tilfredshet: 45%</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setPhase('negotiating')}
                            className="bg-[#4b9cd3] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3a8bc2] transition-colors shadow-md"
                        >
                            Start forhandlingene
                        </button>
                    </div>
                )}

                {/* ── NEGOTIATING ───────────────────────────────────────────── */}
                {phase === 'negotiating' && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={issueIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.22 }}
                        >
                            {/* Progress */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Sak {issueIdx + 1} av {issues.length}
                                </span>
                                <div className="flex gap-1">
                                    {issues.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-5 rounded-full transition-colors ${
                                                i < issueIdx
                                                    ? 'bg-[#4b9cd3]'
                                                    : i === issueIdx
                                                      ? 'bg-[#4b9cd3]/40'
                                                      : 'bg-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Issue */}
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-800 text-base mb-1.5">
                                    {currentIssue.title}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {currentIssue.description}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-4">
                                {currentIssue.options.map((opt) => {
                                    const isChosen = chosen === opt.id;
                                    const isDisabled = chosen !== null && !isChosen;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => select(opt)}
                                            disabled={!!chosen}
                                            className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all ${
                                                isChosen
                                                    ? 'bg-[#4b9cd3]/10 border-[#4b9cd3] text-slate-800 font-medium'
                                                    : isDisabled
                                                      ? 'bg-slate-50 border-slate-100 text-slate-400'
                                                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#4b9cd3] hover:shadow-sm cursor-pointer'
                                            }`}
                                        >
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-4"
                                    >
                                        <p className="text-sm text-amber-800 leading-relaxed">
                                            {feedback}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Next button */}
                            {chosen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-end"
                                >
                                    <button
                                        onClick={advance}
                                        className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 transition-colors"
                                    >
                                        {isLast ? 'Se resultatet' : 'Neste sak'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── RESULT ────────────────────────────────────────────────── */}
                {phase === 'result' && (
                    <div>
                        <div className="text-center mb-6 pt-2">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                    bothOK ? 'bg-emerald-100' : 'bg-rose-100'
                                }`}
                            >
                                {bothOK ? (
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-8 h-8 text-rose-500" />
                                )}
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">
                                {bothOK && 'Avtale! Kypros kan gjenforenes.'}
                                {greekOnly && 'Tyrkisk-kypriotisk delegasjon forlot bordet.'}
                                {turkishOnly && 'Gresk-kypriotisk delegasjon forlot bordet.'}
                                {!bothOK && !greekOnly && !turkishOnly && 'Begge sider avviste planen.'}
                            </h4>
                            <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                                {bothOK &&
                                    `Begge delegasjonene godtar planen (gresk-kyprioter: ${greek}%, tyrkiske kyprioter: ${turkish}%). Et historisk kompromiss er mulig.`}
                                {greekOnly &&
                                    `De gresk-kypriotiske forhandlerne er fornøyde (${greek}%), men den tyrkisk-kypriotiske delegasjonen (${turkish}%) mener planen gir dem for lite.`}
                                {turkishOnly &&
                                    `Tyrkiske kyprioter er fornøyde (${turkish}%), men den gresk-kypriotiske delegasjonen (${greek}%) mener planen krever for store ofre.`}
                                {!bothOK &&
                                    !greekOnly &&
                                    !turkishOnly &&
                                    `Ingen av sidene er fornøyde nok (gresk-kyprioter: ${greek}%, tyrkiske kyprioter: ${turkish}%). Forhandlingene kollapser.`}
                            </p>
                        </div>

                        {/* Historical context */}
                        <div className="bg-slate-100 rounded-lg p-4 mb-5 border border-slate-200">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Hva skjedde i virkeligheten?
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Annan-planen av 2004 inneholdt mange kompromisser, men likevel stemte{' '}
                                <strong>76% av gresk-kyprioter NEI</strong>. Tyrkiske kyprioter stemte 65%
                                JA. For mange gresk-kyprioter føltes planen som å akseptere okkupasjonen
                                for alltid. De hadde liten tillit til at Tyrkia ville overholde avtalene,
                                og mange ønsket å vente på bedre vilkår. Kypros forblir delt den dag i dag.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 border border-slate-200 px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Prøv igjen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
