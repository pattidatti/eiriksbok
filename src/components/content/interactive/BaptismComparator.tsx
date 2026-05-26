import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, CheckCircle2 } from 'lucide-react';

interface ChurchAnswer {
    name: string;
    short: string;
    explanation: string;
}

interface Dimension {
    id: string;
    label: string;
    question: string;
    verse: string;
    verseRef: string;
    churches: [ChurchAnswer, ChurchAnswer, ChurchAnswer];
}

interface BaptismComparatorProps {
    title?: string;
}

const DIMENSIONS: Dimension[] = [
    {
        id: 'hvem',
        label: 'Hvem?',
        question: 'Hvem har rett til å bli døpt?',
        verse: 'Omvend dere, og la dere alle døpe i Jesu Kristi navn til syndenes forlatelse.',
        verseRef: 'Apostlenes gjerninger 2,38',
        churches: [
            {
                name: 'Baptistene',
                short: 'Bare troende voksne',
                explanation:
                    'Kun den som selv kan bekjenne troen sin. Et spedbarn kan ikke forstå hva det sier ja til. Dåpen er en bevisst handling.',
            },
            {
                name: 'Den norske kirke',
                short: 'Spedbarn og voksne',
                explanation:
                    'Barnedåpen er innarbeidet tradisjon. Foreldrene og fadderforeldre lover å oppdra barnet i kristen tro. Dåpen er Guds gave, ikke barnets prestasjon.',
            },
            {
                name: 'Den katolske kirke',
                short: 'Helst som spedbarn',
                explanation:
                    'Barnedåp er normen fordi arvesynden fjernes ved dåpen. Jo raskere, jo bedre - barnet trenger Guds nåde fra starten.',
            },
        ],
    },
    {
        id: 'metode',
        label: 'Hvordan?',
        question: 'Hvordan utføres dåpen?',
        verse: 'Da Jesus var blitt døpt, steg han straks opp av vannet.',
        verseRef: 'Matteus 3,16',
        churches: [
            {
                name: 'Baptistene',
                short: 'Full neddykking',
                explanation:
                    'Hele kroppen senkes under vann. Symbolet er kraftigst slik: du dør fra det gamle livet og stiger opp til det nye. Jesus ble selv neddykket i Jordanelven.',
            },
            {
                name: 'Den norske kirke',
                short: 'Stenking med vann',
                explanation:
                    'Presten heller noen dråper vann over hodet tre ganger, i Faderens, Sønnens og Den hellige ånds navn. Symbolikken er den samme, formen er enklere.',
            },
            {
                name: 'Den katolske kirke',
                short: 'Stenking eller øsing',
                explanation:
                    'Vann helles over hodet. Selve vannmengden er ikke avgjørende - det er ordene og intensjonen som gjør handlingen til et sakrament.',
            },
        ],
    },
    {
        id: 'teologi',
        label: 'Hva betyr det?',
        question: 'Hva skjer teologisk i dåpen?',
        verse: 'Den som tror og blir døpt, skal bli frelst.',
        verseRef: 'Markus 16,16',
        churches: [
            {
                name: 'Baptistene',
                short: 'Lydighetshandling',
                explanation:
                    'Dåpen frelser deg ikke - du er allerede frelst av tro. Dåpen er et offentlig vitnesbyrd: "Jeg er kristen." Det er en lydighetshandling, ikke et nådemiddel.',
            },
            {
                name: 'Den norske kirke',
                short: 'Nådemiddel',
                explanation:
                    'Gud virker gjennom dåpen. Det er ikke bare en handling vi gjør - det er noe Gud gjør med oss. Dåpen gir syndstilgivelse og Den hellige ånd.',
            },
            {
                name: 'Den katolske kirke',
                short: 'Sakrament som gir nåde',
                explanation:
                    'Dåpen er ett av sju sakramenter. Den fjerner arvesynden, gir helliggjørende nåde og gjør deg til lem av Kirkens kropp. Det er ikke mulig å bli frelst uten.',
            },
        ],
    },
    {
        id: 'konsekvens',
        label: 'Hva skjer etterpå?',
        question: 'Hva betyr dåpen for fellesskapet?',
        verse: 'Vi ble alle døpt med én Ånd til å være ett legeme.',
        verseRef: '1. Korinterbrev 12,13',
        churches: [
            {
                name: 'Baptistene',
                short: 'Inn i menigheten av troende',
                explanation:
                    'Du blir tatt opp i en lokal menighet av bevisste kristne. Fellesskapet er frivillig og aktivt - alle som er der har valgt å være der.',
            },
            {
                name: 'Den norske kirke',
                short: 'Pakt og kirkemedlemskap',
                explanation:
                    'Du inngår en pakt med Gud og blir registrert som kirkemedlem. Konfirmasjonen bekrefter dåpsløftet bevisst i tenårene.',
            },
            {
                name: 'Den katolske kirke',
                short: 'Del av Kirkens kropp',
                explanation:
                    'Du blir innlemmet i den ene, hellige, katolske og apostoliske kirke. Dåpen etterfølges av ferming og første nattverd - de tre initiasjonssakramentene.',
            },
        ],
    },
];

const CHURCH_COLORS = [
    { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    { border: 'border-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
];

export function BaptismComparator({ title = 'Tre kirker, tre svar' }: BaptismComparatorProps) {
    const [active, setActive] = useState<string>(DIMENSIONS[0].id);
    const [explored, setExplored] = useState<Set<string>>(new Set([DIMENSIONS[0].id]));

    const activeDim = DIMENSIONS.find((d) => d.id === active)!;
    const allExplored = explored.size === DIMENSIONS.length;

    const handleSelect = (id: string) => {
        setActive(id);
        setExplored((prev) => new Set([...prev, id]));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk pa en dimensjon og se hva de tre kirkene svarer
                    </p>
                </div>
                <div className="ml-auto text-sm text-slate-400 font-medium">
                    {explored.size}/{DIMENSIONS.length} utforsket
                </div>
            </div>

            {/* Dimension tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50">
                {DIMENSIONS.map((dim) => {
                    const isExplored = explored.has(dim.id);
                    const isActive = active === dim.id;
                    return (
                        <button
                            key={dim.id}
                            onClick={() => handleSelect(dim.id)}
                            className={`flex-1 px-3 py-3 text-sm font-medium transition-all relative ${
                                isActive
                                    ? 'bg-white text-blue-700 border-b-2 border-blue-500'
                                    : isExplored
                                      ? 'text-slate-600 hover:bg-white'
                                      : 'text-slate-400 hover:bg-white hover:text-slate-600'
                            }`}
                        >
                            {dim.label}
                            {isExplored && !isActive && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                    >
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                            {activeDim.question}
                        </p>

                        {/* Church cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {activeDim.churches.map((church, i) => {
                                const color = CHURCH_COLORS[i];
                                return (
                                    <motion.div
                                        key={church.name}
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.06 }}
                                        className={`rounded-xl border-t-4 ${color.border} bg-white border border-slate-200 border-t-4 p-4 shadow-sm`}
                                    >
                                        <p
                                            className={`text-xs font-bold uppercase tracking-wide ${color.text} mb-1`}
                                        >
                                            {church.name}
                                        </p>
                                        <p className="font-semibold text-slate-800 text-sm mb-2">
                                            {church.short}
                                        </p>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {church.explanation}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Bible verse */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg"
                        >
                            <p className="text-sm italic text-blue-800">«{activeDim.verse}»</p>
                            <p className="text-xs text-blue-500 mt-1">{activeDim.verseRef}</p>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Completion banner */}
            <AnimatePresence>
                {allExplored && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm text-emerald-700">
                            Du har utforsket alle fire dimensjonene. Legg merke til: det handler ikke om
                            hvem som gjor det «riktig» - men om hva dåpen betyr for den enkelte retningen.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
