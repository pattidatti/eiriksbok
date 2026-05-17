import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

type Approach = 'oedeleggelse' | 'tradisjon' | 'integrasjon';

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
    aleksanderChoice: string;
    explanation: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'dareios-familie',
        title: 'Dareios sin familie',
        question:
            'Du har vunnet slaget ved Issos i 333 fvt. I leiren finner du Dareios sin mor, kone og barn. Hva gjør du?',
        options: [
            {
                id: 'drep',
                label: 'Drep dem alle — Dareios skal lære',
                approach: 'oedeleggelse',
                outcome: 'Persisk adel sverger evig hat. Du må slåss for hver eneste by.',
            },
            {
                id: 'geisler',
                label: 'Hold dem som geisler du kan bytte med',
                approach: 'tradisjon',
                outcome: 'De er nyttige bytteobjekter, men du vinner ingen lojalitet.',
            },
            {
                id: 'aere',
                label: 'Behandle dem som kongelige, med full ære',
                approach: 'integrasjon',
                outcome: 'Dareios sin egen mor blir så imponert at hun kaller deg sin sønn.',
            },
        ],
        aleksanderChoice: 'aere',
        explanation:
            'Aleksander lot Dareios sin familie beholde sine titler, klær og tjenere. Dareios skrev senere et brev der han ba om at om han måtte miste imperiet, så håpet han Aleksander tok det.',
    },
    {
        id: 'persepolis',
        title: 'Persepolis sitt skjebnetime',
        question:
            'Du står i Persepolis, hovedstaden i det persiske riket. Mer gull og kunst enn dine soldater har sett. Hva gjør du i 330 fvt?',
        options: [
            {
                id: 'brenn',
                label: 'Brenn det ned — hevn for Perserkrigene',
                approach: 'oedeleggelse',
                outcome:
                    'Et symbol jevnes med jorden. Men ett av verdens vakreste byggverk er borte for alltid.',
            },
            {
                id: 'plyndre',
                label: 'Plyndre gullet, men la byen stå',
                approach: 'tradisjon',
                outcome: 'Soldatene er rike. Men ingen ser deg som mer enn en plyndrer.',
            },
            {
                id: 'bevar',
                label: 'Bevar byen som en gresk-persisk hovedstad',
                approach: 'integrasjon',
                outcome: 'En logisk plan — men du valgte motsatt den natten.',
            },
        ],
        aleksanderChoice: 'brenn',
        explanation:
            'Aleksander brente faktisk Persepolis — kanskje i fyll under en fest, kanskje som symbolsk hevn for at Xerxes brente Athen 150 år tidligere. Det er hans største kulturelle bommert. Han angret etterpå.',
    },
    {
        id: 'persisk-drakt',
        title: 'Persisk drakt og skikker',
        question:
            'Du har erobret hele Persia. Hvordan skal du kle deg og oppføre deg som hersker?',
        options: [
            {
                id: 'gresk',
                label: 'Hold på greske skikker — du er gresk konge',
                approach: 'tradisjon',
                outcome:
                    'Greske soldater respekterer deg, men perserne ser deg som en utenlandsk erobrer.',
            },
            {
                id: 'persisk',
                label: 'Bli helt persisk — kron deg som stor-konge',
                approach: 'oedeleggelse',
                outcome: 'Greske soldater forakter deg. Flere planlegger drap.',
            },
            {
                id: 'bland',
                label: 'Bland greske og persiske skikker — alle er like',
                approach: 'integrasjon',
                outcome:
                    'Begge sider mumler. Men over tid blir kulturen til én blandingskultur.',
            },
        ],
        aleksanderChoice: 'bland',
        explanation:
            'Aleksander bar persisk diadem og kappe, men beholdt greske skikker for sine venner. Det forarget noen av hans generaler, men det viste lokale ledere at de fortsatt hadde verdi.',
    },
    {
        id: 'roxana',
        title: 'Et giftermål',
        question:
            'Du må gifte deg for å sikre et dynasti. I 327 fvt møter du Roxana, datter av en lokal høvding i Baktria. Hvem velger du?',
        options: [
            {
                id: 'gresk-prinsesse',
                label: 'En gresk kongedatter — hold blodet rent',
                approach: 'tradisjon',
                outcome:
                    'Greske velsignelser, men perserne ser deg fortsatt som en fremmed erobrer.',
            },
            {
                id: 'ingen',
                label: 'Ingen — du trenger ikke en kone, du har imperiet',
                approach: 'oedeleggelse',
                outcome: 'Når du dør, faller imperiet i biter. Ingen tronarving.',
            },
            {
                id: 'roxana',
                label: 'Roxana — den lokale høvdingdatteren',
                approach: 'integrasjon',
                outcome:
                    'Perserne juber. Du har vist at deres adel er like verdig som den greske.',
            },
        ],
        aleksanderChoice: 'roxana',
        explanation:
            'Roxana var ikke kongelig, men en baktrisk høvdingdatter. Valget var politisk og personlig: Aleksander viste at hans nye verden ikke skilte på blod og opprinnelse.',
    },
    {
        id: 'india-snu',
        title: 'Ved elven Hyphasis',
        question:
            'Det er 326 fvt. Soldatene dine er utslitt etter 11 år i krig. Foran deg ligger Ganges-sletten — et nytt rikt land. Hva gjør du?',
        options: [
            {
                id: 'tving',
                label: 'Tving dem fremover — bare litt til',
                approach: 'oedeleggelse',
                outcome:
                    'De gjør mytteri. Du må snu uansett, og fra nå av frykter du dine egne menn.',
            },
            {
                id: 'bli',
                label: 'Bli i India — bygg et nytt imperium her',
                approach: 'tradisjon',
                outcome:
                    'Du splitter hæren. Halvparten gjør mytteri. Du dør syk i et fremmed land.',
            },
            {
                id: 'snu',
                label: 'Lytt — snu hjem, men grunnlegg byer på veien',
                approach: 'integrasjon',
                outcome:
                    'Soldatene heier på deg igjen. Du grunnlegger flere nye Aleksandrier på reisen tilbake.',
            },
        ],
        aleksanderChoice: 'snu',
        explanation:
            'Aleksander lyttet til soldatene og snudde. Det var ikke svakhet — det var en lederbeslutning som reddet hæren og lot ham fortsette å så hellenistisk kultur over hele Asia.',
    },
];

const APPROACH_COLORS: Record<Approach, { card: string; ring: string; tag: string }> = {
    oedeleggelse: {
        card: 'border-rose-200 hover:border-rose-300 hover:bg-rose-50',
        ring: 'ring-rose-400',
        tag: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    tradisjon: {
        card: 'border-amber-200 hover:border-amber-300 hover:bg-amber-50',
        ring: 'ring-amber-400',
        tag: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    integrasjon: {
        card: 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50',
        ring: 'ring-emerald-400',
        tag: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
};

interface AleksandersValgProps {
    title?: string;
}

export function AleksandersValg({
    title = 'Aleksanders valg: Erobrer eller integrator?',
}: AleksandersValgProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({});

    const current = SCENARIOS[stepIndex];
    const selected = current ? selections[current.id] : undefined;
    const isLast = stepIndex === SCENARIOS.length - 1;
    const complete = stepIndex >= SCENARIOS.length;

    const matches = useMemo(() => {
        let n = 0;
        SCENARIOS.forEach((s) => {
            if (selections[s.id] === s.aleksanderChoice) n += 1;
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white">
                <Swords className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Du er Aleksander. Ta fem avgjørelser og se hvordan hellenismen blir til.
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
                                            const matched = selected === current.aleksanderChoice;
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
                                                            matched
                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                : 'bg-blue-50 border-blue-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold mb-1">
                                                            {matched ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    <span className="text-emerald-700">
                                                                        Slik valgte Aleksander også
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-blue-700">
                                                                    Slik valgte Aleksander i stedet
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
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4"
                            >
                                <Sparkles className="w-8 h-8 text-indigo-600" />
                            </motion.div>
                            <h4 className="text-lg font-semibold text-slate-800 mb-2">
                                Du valgte som Aleksander {matches} av {SCENARIOS.length} ganger.
                            </h4>
                            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-4">
                                {matches >= 4
                                    ? 'Du har sett mønsteret. Aleksander vant verden ved å smelte kulturer sammen, ikke ved å utslette dem. Det er derfor hellenismen — gresk språk og kunst i Egypt og Afghanistan — varte i 1000 år etter at han var død.'
                                    : matches >= 2
                                      ? 'Du valgte hardere enn Aleksander. Han brente Persepolis, ja — men ellers var integrasjon hans signatur. Det er derfor han fortsatt blir kalt «den store».'
                                      : 'Du valgte den harde linjen. Aleksander gjorde stort sett det motsatte. Hadde han gjort som deg, ville imperiet hans falt fra hverandre før det rakk å spre en eneste skåle gresk i Asia.'}
                            </p>
                            <div className="inline-block px-5 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                                Integrasjon var ikke svakhet. Det var hellenismens hemmelighet.
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
