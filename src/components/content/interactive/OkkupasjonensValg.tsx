import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

type Stance = 'tilpasning' | 'stille-motstand' | 'aktiv-motstand';

interface Option {
    id: string;
    label: string;
    stance: Stance;
    outcome: string;
}

interface Dilemma {
    id: string;
    year: string;
    title: string;
    setup: string;
    question: string;
    options: Option[];
    historicalChoice: string;
    historicalNote: string;
}

const DILEMMAS: Dilemma[] = [
    {
        id: 'oscarsborg',
        year: '9. april 1940',
        title: 'Kommandanten på Oscarsborg',
        setup: 'Klokken er 04:17. Et stort, ukjent krigsskip glir gjennom Drøbaksundet i mørket. Du er oberst Birger Eriksen, kommandant på Oscarsborg festning. Ingen har sagt at det er krig.',
        question: 'Hva gjør du?',
        options: [
            {
                id: 'passordsignal',
                label: 'Be om passord og vent på svar',
                stance: 'tilpasning',
                outcome: 'Skipet seiler videre opp fjorden. Det er det tyske krigsskipet Blücher, fullt av soldater på vei mot Oslo.',
            },
            {
                id: 'varselskudd',
                label: 'Skyt varselskudd, krev at de stopper',
                stance: 'stille-motstand',
                outcome: 'Tyskerne svarer ikke. Du har tapt minutter — nå er skipet for nær til at kanonene treffer godt.',
            },
            {
                id: 'aapne-ild',
                label: 'Åpne ild med de gamle Krupp-kanonene',
                stance: 'aktiv-motstand',
                outcome: 'To 28 cm granater treffer Blücher midt på. Skipet synker. Tusen tyskere drukner — men kongen, regjeringen og gullbeholdningen rekker å flykte fra Oslo.',
            },
        ],
        historicalChoice: 'aapne-ild',
        historicalNote: 'Eriksen sa: «Enten faller jeg i unåde, eller jeg får medalje. Fyr!» Han fikk medalje. Forsinkelsen gjorde at Norge ikke ble erobret på timer, slik tyskerne hadde planlagt.',
    },
    {
        id: 'laerersamband',
        year: 'Februar 1942',
        title: 'Læreren og Lærersambandet',
        setup: 'Du er lærer på en ungdomsskole. Quislings nye lov krever at alle lærere melder seg inn i Lærersambandet, en NS-organisasjon som skal nazifisere skolen. Du skal lære elevene om «germansk rase» og «Førerens visdom».',
        question: 'Hva svarer du?',
        options: [
            {
                id: 'meld-inn',
                label: 'Meld deg inn — du må jo forsørge familien',
                stance: 'tilpasning',
                outcome: 'Du beholder jobben, men hver dag må du si ord du ikke tror på. Elevene merker det.',
            },
            {
                id: 'meld-inn-skjult',
                label: 'Meld deg inn, men sabotér undervisningen i smug',
                stance: 'stille-motstand',
                outcome: 'Du «glemmer» rasekapitlene. Mange lærere gjorde det samme. Effekten i klasserommet ble dempet.',
            },
            {
                id: 'nekt',
                label: 'Skriv under på protestbrevet sammen med tusenvis andre',
                stance: 'aktiv-motstand',
                outcome: 'Du blir en av 1100 lærere som arresteres og sendes til Kirkenes på tvangsarbeid. Lærersambandet kollapser.',
            },
        ],
        historicalChoice: 'nekt',
        historicalNote: 'Rundt 12 000 av Norges 14 000 lærere skrev under på protestbrevet. Quisling raste: «Det er dere lærere som har ødelagt alt for meg!» Protesten ble en av krigens største sivile motstandsaksjoner.',
    },
    {
        id: 'sara',
        year: 'Oktober 1942',
        title: 'Familien Levin på døra',
        setup: 'Sara Levin er nabodattera di. I natt har Statspolitiet arrestert 532 norske jøder. Familien har gjemt seg på loftet. Sara banker på og spør om dere kan hjelpe dem til Sverige.',
        question: 'Hva svarer du?',
        options: [
            {
                id: 'avvis',
                label: 'Avvis dem — det er for risikabelt for din egen familie',
                stance: 'tilpasning',
                outcome: 'Familien Levin blir tatt to dager senere. Sara og foreldrene hennes sendes med Donau til Auschwitz.',
            },
            {
                id: 'natt-mat',
                label: 'Gi dem mat og varme klær, men ikke mer',
                stance: 'stille-motstand',
                outcome: 'De drar videre, men uten en kontakt eller bil rekker de ikke grensen før Statspolitiet finner dem.',
            },
            {
                id: 'gjem-og-frakte',
                label: 'Gjem dem på låven, ring en kontakt i Carl Fredriksens Transport',
                stance: 'aktiv-motstand',
                outcome: 'Du risikerer dødsstraff. Men nettverket bringer familien til Sverige. Sara overlever krigen.',
            },
        ],
        historicalChoice: 'gjem-og-frakte',
        historicalNote: 'Av 2173 norske jøder ble 772 deportert. Bare 34 overlevde. Cirka 1100 ble reddet til Sverige, ofte via nettverk som «Carl Fredriksens Transport» — vanlige nordmenn som risikerte livet.',
    },
    {
        id: 'radio',
        year: 'Sommer 1943',
        title: 'BBC i hagebua',
        setup: 'Det er forbudt å eie radio. Du har gravd ned en liten apparat i hagebua, og hver kveld lytter du til BBC sin norske sending. Du forteller naboene hva som skjer på fronten. En dag står en tysk patrulje på trappa.',
        question: 'Hva gjør du?',
        options: [
            {
                id: 'fornekt',
                label: 'Fornekt alt — vis dem rundt i huset',
                stance: 'tilpasning',
                outcome: 'De finner ikke radioen. Men en angiver har allerede meldt deg. Du arresteres uken etter.',
            },
            {
                id: 'skyld-noen',
                label: 'Si at det må være en feiltagelse',
                stance: 'stille-motstand',
                outcome: 'Patruljen leter. De finner radioen. Du sendes til Grini fangeleir i ett år.',
            },
            {
                id: 'forsvar-stille',
                label: 'Stå rolig, ikke bekreft noe, gi rom for at de skal lete forgjeves',
                stance: 'aktiv-motstand',
                outcome: 'Du er på Hjemmefrontens varselsliste over Stapo-aksjoner. Du visste de kom. Radioen er flyttet — du er fortsatt i nettverket.',
            },
        ],
        historicalChoice: 'forsvar-stille',
        historicalNote: 'Hjemmefronten bygde et hemmelig varslingsnett. Mange tusen «illegale aviser» ble skrevet på basis av BBC-sendinger. Sivil motstand var ikke spektakulær — den var stille, daglig og massiv.',
    },
    {
        id: 'rettsoppgjor',
        year: 'Sommer 1945',
        title: 'Etter krigen',
        setup: 'Krigen er over. Naboen din, en lærer, meldte seg inn i NS i 1941 fordi han var redd for å miste jobben. Han angret raskt og hjalp aldri tyskerne aktivt. Nå skal landssvikeroppgjøret behandle saken hans.',
        question: 'Hva mener du bør skje?',
        options: [
            {
                id: 'glem',
                label: 'Tilgi og glem — han var ung og redd',
                stance: 'tilpasning',
                outcome: 'Mange ønsket dette. Men hva med dem som ofret alt for å nekte? Hvor blir det av rettferdigheten deres?',
            },
            {
                id: 'bot',
                label: 'Bot, fratagelse av borgerlige rettigheter i noen år',
                stance: 'stille-motstand',
                outcome: 'Dette ble det vanligste utfallet for «vanlige» NS-medlemmer. Cirka 53 000 nordmenn fikk slike dommer.',
            },
            {
                id: 'fengsel',
                label: 'Fengsel — han var medlem av NS, det får konsekvenser',
                stance: 'aktiv-motstand',
                outcome: 'Mer enn 17 000 nordmenn fikk fengselsstraff. Quisling og 24 andre ble henrettet.',
            },
        ],
        historicalChoice: 'bot',
        historicalNote: 'Landssvikeroppgjøret er fortsatt omstridt. Var det for hardt? For mildt? Mange mener det manglet nyanser — den som meldte seg inn av frykt og den som angav jøder fikk lignende stempel. Historien har ikke ett riktig svar her.',
    },
];

const STANCE_COLORS: Record<Stance, { card: string; ring: string; chip: string; label: string }> = {
    tilpasning: {
        card: 'border-amber-300 hover:bg-amber-50/60',
        ring: 'ring-amber-400',
        chip: 'bg-amber-100 text-amber-800',
        label: 'Tilpasning',
    },
    'stille-motstand': {
        card: 'border-blue-300 hover:bg-blue-50/60',
        ring: 'ring-blue-400',
        chip: 'bg-blue-100 text-blue-800',
        label: 'Stille motstand',
    },
    'aktiv-motstand': {
        card: 'border-emerald-300 hover:bg-emerald-50/60',
        ring: 'ring-emerald-400',
        chip: 'bg-emerald-100 text-emerald-800',
        label: 'Aktiv motstand',
    },
};

interface OkkupasjonensValgProps {
    title?: string;
}

export function OkkupasjonensValg({ title = 'Hva ville du valgt?' }: OkkupasjonensValgProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({});

    const current = DILEMMAS[stepIndex];
    const selected = current ? selections[current.id] : undefined;
    const isLast = stepIndex === DILEMMAS.length - 1;
    const complete = stepIndex >= DILEMMAS.length;

    const stanceCounts = useMemo(() => {
        const counts: Record<Stance, number> = {
            tilpasning: 0,
            'stille-motstand': 0,
            'aktiv-motstand': 0,
        };
        DILEMMAS.forEach((d) => {
            const opt = d.options.find((o) => o.id === selections[d.id]);
            if (opt) counts[opt.stance] += 1;
        });
        return counts;
    }, [selections]);

    const matchedHistorical = useMemo(() => {
        let n = 0;
        DILEMMAS.forEach((d) => {
            if (selections[d.id] === d.historicalChoice) n += 1;
        });
        return n;
    }, [selections]);

    const handleSelect = (optionId: string) => {
        if (!current || selections[current.id]) return;
        setSelections((s) => ({ ...s, [current.id]: optionId }));
    };

    const handleNext = () => setStepIndex((i) => i + 1);

    const handleReset = () => {
        setStepIndex(0);
        setSelections({});
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Fem dilemmaer fra okkupasjonen 1940–1945. Velg, og se hva som faktisk
                        skjedde.
                    </p>
                </div>
                {!complete && (
                    <div className="text-xs text-slate-500 font-medium">
                        {stepIndex + 1} / {DILEMMAS.length}
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
                                <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-1">
                                    {current.year} · {current.title}
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                    {current.setup}
                                </p>
                                <p className="text-slate-900 text-base font-medium leading-relaxed">
                                    {current.question}
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {current.options.map((opt) => {
                                    const isSelected = selected === opt.id;
                                    const colors = STANCE_COLORS[opt.stance];
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelect(opt.id)}
                                            disabled={!!selected}
                                            className={`text-left px-4 py-3 rounded-lg border-2 transition-all bg-white ${
                                                isSelected
                                                    ? `ring-2 ${colors.ring} ${colors.card}`
                                                    : selected
                                                      ? 'border-slate-200 opacity-50 cursor-default'
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
                                            const matched = selected === current.historicalChoice;
                                            const colors = STANCE_COLORS[opt.stance];
                                            return (
                                                <>
                                                    <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
                                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full ${colors.chip}`}
                                                            >
                                                                {colors.label}
                                                            </span>
                                                            <span>Konsekvens</span>
                                                        </div>
                                                        <div className="text-sm text-slate-700 leading-relaxed">
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
                                                                        Slik gikk det i virkeligheten
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-blue-700">
                                                                    Historisk utfall
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-700 leading-relaxed">
                                                            {current.historicalNote}
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
                        >
                            <div className="text-center mb-5">
                                <motion.div
                                    initial={{ rotate: -8, scale: 0.7 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4"
                                >
                                    <Sparkles className="w-8 h-8 text-indigo-600" />
                                </motion.div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                                    Du valgte som historien {matchedHistorical} av {DILEMMAS.length}{' '}
                                    ganger.
                                </h4>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {(Object.keys(STANCE_COLORS) as Stance[]).map((s) => {
                                    const c = STANCE_COLORS[s];
                                    return (
                                        <div
                                            key={s}
                                            className="px-3 py-3 rounded-lg bg-slate-50 border border-slate-200 text-center"
                                        >
                                            <div className="text-2xl font-bold text-slate-800">
                                                {stanceCounts[s]}
                                            </div>
                                            <div
                                                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.chip}`}
                                            >
                                                {c.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-5 py-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm leading-relaxed">
                                Det fantes ingen «trygge» valg under okkupasjonen. Hver av de fem
                                personene du nettopp var, måtte avveie egen sikkerhet mot
                                samvittighet. Mange nordmenn gjorde litt av alt: tilpasset seg om
                                dagen, drev stille motstand om kvelden, og hjalp aktivt når nøden
                                krevde det. Det er denne hverdagsmotstanden som gjorde at Norge
                                aldri ble fullt nazifisert.
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
                        {isLast ? 'Se oppsummering' : 'Neste dilemma'}
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
