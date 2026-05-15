import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

type Approach = 'terror' | 'kontroll' | 'toleranse';

interface Option {
    id: string;
    label: string;
    approach: Approach;
    outcome: string;
}

interface Scenario {
    id: string;
    title: string;
    question: string;
    options: Option[];
    kyrosChoice: string;
    explanation: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'babylon-konge',
        title: 'Babylons konge',
        question:
            'Du har erobret Babylon i 539 fvt. Hva gjør du med kong Nabonidus?',
        options: [
            {
                id: 'drep',
                label: 'Drep ham og hele slekten hans',
                approach: 'terror',
                outcome: 'Adelen i Babylon hater deg. Opprør innen et år.',
            },
            {
                id: 'exil',
                label: 'Send ham i eksil til Karmania',
                approach: 'toleranse',
                outcome: 'Babylonerne aksepterer din makt uten blod.',
            },
            {
                id: 'marionett',
                label: 'Behold ham som marionett-konge',
                approach: 'kontroll',
                outcome: 'Han konspirerer mot deg innen seks måneder.',
            },
        ],
        kyrosChoice: 'exil',
        explanation:
            'Kyros sendte Nabonidus i eksil. Han trengte ikke å knuse fienden, bare flytte ham ut av veien.',
    },
    {
        id: 'marduk-tempel',
        title: 'Marduk-tempelet',
        question: 'Babylonerne tilber guden Marduk. Hva gjør du med tempelet hans?',
        options: [
            {
                id: 'rive',
                label: 'Riv det og bygg et persisk tempel der',
                approach: 'terror',
                outcome: 'Prestene hisser folket mot deg.',
            },
            {
                id: 'stenge',
                label: 'Steng det og forby tilbedelse',
                approach: 'kontroll',
                outcome: 'Folket gjør motstand i skjul i flere generasjoner.',
            },
            {
                id: 'restaurere',
                label: 'Restaurer det og hyll Marduk',
                approach: 'toleranse',
                outcome: 'Prestene erklærer deg utvalgt av Marduk selv.',
            },
        ],
        kyrosChoice: 'restaurere',
        explanation:
            'Kyros lot seg krone i Marduks navn. Babylonske prester ble hans største heiagjeng.',
    },
    {
        id: 'jodene',
        title: 'Jødene i fangenskap',
        question:
            'Babylonerne tok jødene som fanger 60 år tidligere. Hva gjør du med dem?',
        options: [
            {
                id: 'beholde',
                label: 'Behold dem – de gir billig arbeidskraft',
                approach: 'kontroll',
                outcome: 'Jødene gjør motstand i hemmelighet.',
            },
            {
                id: 'spre',
                label: 'Spre dem over hele imperiet',
                approach: 'terror',
                outcome: 'Du skaper et nettverk av misfornøyde minoriteter.',
            },
            {
                id: 'hjem',
                label: 'La dem reise hjem og bygg opp tempelet',
                approach: 'toleranse',
                outcome:
                    'En takknemlig provins. Jødiske skrifter kaller deg «Herrens salvede».',
            },
        ],
        kyrosChoice: 'hjem',
        explanation:
            'Kyros lot rundt 40 000 jøder vende tilbake til Jerusalem og finansierte gjenoppbyggingen av tempelet.',
    },
    {
        id: 'forvaltning',
        title: 'Hvordan styre imperiet?',
        question:
            'Imperiet ditt strekker seg fra Lilleasia til India. Hvordan styrer du det?',
        options: [
            {
                id: 'sentralt',
                label: 'Sentralt fra Persia – egne folk i alle byer',
                approach: 'kontroll',
                outcome: 'Korrupsjon og opprør. Du er for langt unna alt.',
            },
            {
                id: 'streng',
                label: 'Streng straff for minste ulydighet',
                approach: 'terror',
                outcome: 'Imperiet blør penger på å slå ned opprør.',
            },
            {
                id: 'satrap',
                label: 'Lokale satrapier – lokale ledere som dine guvernører',
                approach: 'toleranse',
                outcome: 'Lokal lojalitet under persisk paraply. Effektivt og fredelig.',
            },
        ],
        kyrosChoice: 'satrap',
        explanation:
            'Satrap-systemet lot lokale ledere styre på sine egne språk, så lenge de betalte skatt og var lojale mot kongen.',
    },
    {
        id: 'sylinderen',
        title: 'Din proklamasjon',
        question:
            'Du skal etterlate et skriftlig vitnemål om hvem du er. Hva sier du?',
        options: [
            {
                id: 'erobrer',
                label: '«Jeg knuste mine fiender og spredte deres aske»',
                approach: 'terror',
                outcome: 'Du blir husket som en tyrann blant tyranner.',
            },
            {
                id: 'gud',
                label: '«Jeg er den eneste sanne gud – bøy dere for meg»',
                approach: 'kontroll',
                outcome: 'Etterfølgerne dine får motstand fra hvert tempel.',
            },
            {
                id: 'befrier',
                label: '«Jeg lot fanger vende hjem og guder finne ro»',
                approach: 'toleranse',
                outcome:
                    'Teksten din kalles 2500 år senere «verdens første menneskerettighetscharter».',
            },
        ],
        kyrosChoice: 'befrier',
        explanation:
            'Kyros-sylinderen, funnet i Babylon i 1879, beskriver hvordan han lot folk vende hjem og gjenoppbygge templer.',
    },
];

const APPROACH_COLORS: Record<Approach, { card: string; ring: string; tag: string }> = {
    terror: {
        card: 'border-rose-200 hover:border-rose-300 hover:bg-rose-50',
        ring: 'ring-rose-400',
        tag: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    kontroll: {
        card: 'border-amber-200 hover:border-amber-300 hover:bg-amber-50',
        ring: 'ring-amber-400',
        tag: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    toleranse: {
        card: 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50',
        ring: 'ring-emerald-400',
        tag: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
};

interface KyrosValgetProps {
    title?: string;
}

export function KyrosValget({ title = 'Kyros-valget: Hvordan styrer du et imperium?' }: KyrosValgetProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({});

    const current = SCENARIOS[stepIndex];
    const selected = current ? selections[current.id] : undefined;
    const isLast = stepIndex === SCENARIOS.length - 1;
    const complete = stepIndex >= SCENARIOS.length;

    const toleranseMatches = useMemo(() => {
        let n = 0;
        SCENARIOS.forEach((s) => {
            const opt = s.options.find((o) => o.id === selections[s.id]);
            if (opt && opt.id === s.kyrosChoice) n += 1;
        });
        return n;
    }, [selections]);

    const handleSelect = (optionId: string) => {
        if (!current || selections[current.id]) return;
        setSelections((s) => ({ ...s, [current.id]: optionId }));
    };

    const handleNext = () => {
        setStepIndex((i) => i + 1);
    };

    const handleReset = () => {
        setStepIndex(0);
        setSelections({});
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
                <Crown className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Du er Kyros. Ta fem avgjørelser og se hvordan imperiet ditt vokser.
                    </p>
                </div>
                {!complete && (
                    <div className="text-xs text-slate-500 font-medium">
                        {stepIndex + 1} / {SCENARIOS.length}
                    </div>
                )}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {!complete && current && (
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-4">
                                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                    Scene {stepIndex + 1}: {current.title}
                                </div>
                                <p className="text-slate-800 text-base leading-relaxed">
                                    {current.question}
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {current.options.map((opt) => {
                                    const isSelected = selected === opt.id;
                                    const colors = APPROACH_COLORS[opt.approach];
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelect(opt.id)}
                                            disabled={!!selected}
                                            className={`text-left px-4 py-3 rounded-lg border-2 transition-all bg-white ${
                                                isSelected
                                                    ? `ring-2 ${colors.ring} ${colors.card}`
                                                    : selected
                                                      ? 'border-slate-200 opacity-50'
                                                      : `${colors.card} cursor-pointer`
                                            }`}
                                        >
                                            <span className="text-slate-800 text-sm">
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <AnimatePresence>
                                {selected && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-5 space-y-3"
                                    >
                                        {(() => {
                                            const opt = current.options.find(
                                                (o) => o.id === selected
                                            )!;
                                            const matchedKyros = selected === current.kyrosChoice;
                                            return (
                                                <>
                                                    <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
                                                        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                                            Konsekvens
                                                        </div>
                                                        <div className="text-sm text-slate-700">
                                                            {opt.outcome}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`px-4 py-3 rounded-lg border ${
                                                            matchedKyros
                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                : 'bg-blue-50 border-blue-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold mb-1">
                                                            {matchedKyros ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    <span className="text-emerald-700">
                                                                        Slik valgte Kyros også
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-blue-700">
                                                                    Slik valgte Kyros i stedet
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-700">
                                                            {current.explanation}
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {complete && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ rotate: -8, scale: 0.7 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4"
                            >
                                <Sparkles className="w-8 h-8 text-amber-600" />
                            </motion.div>
                            <h4 className="text-lg font-semibold text-slate-800 mb-2">
                                Du valgte som Kyros {toleranseMatches} av {SCENARIOS.length} ganger.
                            </h4>
                            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-4">
                                {toleranseMatches >= 4
                                    ? 'Du har sett mønsteret: Kyros vant ikke med sverd alene. Han lot folk beholde sine guder, sitt språk og sine ledere — så lenge de betalte skatt og var lojale.'
                                    : toleranseMatches >= 2
                                      ? 'Du tok noen «harde» valg. Det er menneskelig. Men hver gang Kyros valgte mildhet, vokste imperiet — uten at han måtte slåss for hver provins.'
                                      : 'Du valgte den harde linjen. Historisk gikk slike herskere som regel under raskt. Kyros bygde det største imperiet verden hadde sett — uten å brenne en eneste by til grunnen.'}
                            </p>
                            <div className="inline-block px-5 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                                Toleranse var ikke svakhet. Det var verdens første verdensimperium sin
                                hemmelige strategi.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 pb-5 flex items-center justify-between">
                {!complete ? (
                    <button
                        onClick={handleNext}
                        disabled={!selected}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        {isLast ? 'Se mønsteret' : 'Neste scene'}
                    </button>
                ) : (
                    <div />
                )}
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors inline-flex items-center gap-1"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
