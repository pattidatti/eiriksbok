import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Crown, Shield, RotateCcw, Sword, Flag } from 'lucide-react';

interface StormaktVagskalProps {
    title?: string;
    intro?: string;
}

type EventChoice = {
    label: string;
    detail: string;
    territory: number;
    cost: number;
    historisk: boolean;
};

type Event = {
    year: string;
    leder: string;
    situasjon: string;
    krig: EventChoice;
    fred: EventChoice;
    fasit: string;
};

const EVENTS: Event[] = [
    {
        year: '1626',
        leder: 'Gustav II Adolf',
        situasjon: 'Polen kontrollerer Livland og Østersjø-havnene. Skal Sverige erklære krig for å sikre tollinntektene?',
        krig: {
            label: 'Erklær krig mot Polen',
            detail: 'Sverige vinner Livland og tollinntektene fra Danzig.',
            territory: 2,
            cost: 1,
            historisk: true,
        },
        fred: {
            label: 'Hold freden',
            detail: 'Sverige forblir et fattig kornland uten kontroll over Østersjøen.',
            territory: 0,
            cost: 0,
            historisk: false,
        },
        fasit: 'Sverige valgte krig. Tollpengene fra Danzig finansierte den moderne hæren.',
    },
    {
        year: '1630',
        leder: 'Gustav II Adolf',
        situasjon: 'Den katolske keiseren knuser protestantene i Tyskland. Skal Sverige gripe inn i 30-årskrigen?',
        krig: {
            label: 'Gå inn i Tyskland',
            detail: 'Sverige redder protestantene og vinner Pommern, Bremen og store deler av Nord-Tyskland (Westfalske fred 1648).',
            territory: 3,
            cost: 2,
            historisk: true,
        },
        fred: {
            label: 'Forbli nøytral',
            detail: 'Sverige sparer penger, men taper sjansen til å bli en stormakt.',
            territory: 0,
            cost: 0,
            historisk: false,
        },
        fasit: 'Sverige gikk inn. Gustav II Adolf falt ved Lützen 1632, men landet vant en plass ved Europas bord.',
    },
    {
        year: '1657',
        leder: 'Karl X Gustav',
        situasjon: 'Danmark prøver å ta tilbake tapte områder. Karl X Gustav marsjerer hæren over isen på Storebælt.',
        krig: {
            label: 'Marsjer over isen',
            detail: 'Roskildefreden 1658: Sverige får Skåne, Halland, Blekinge og Bohuslen.',
            territory: 3,
            cost: 1,
            historisk: true,
        },
        fred: {
            label: 'Inngå kompromiss',
            detail: 'Sverige holder dagens grense, men Skåne forblir dansk.',
            territory: 0,
            cost: 0,
            historisk: false,
        },
        fasit: 'Sverige gikk over isen. Det vågestykket ga landet grensene som fortsatt gjelder i dag.',
    },
    {
        year: '1700',
        leder: 'Karl XII',
        situasjon: 'Danmark, Russland og Polen angriper Sverige samtidig. Den nye 18 år gamle kongen må svare.',
        krig: {
            label: 'Angrip alle tre',
            detail: 'Karl XII slår Danmark på 3 uker og knuser tsarens hær ved Narva.',
            territory: 1,
            cost: 2,
            historisk: true,
        },
        fred: {
            label: 'Forhandle om fred',
            detail: 'Sverige beholder territoriet, men taper anseelse.',
            territory: 0,
            cost: 0,
            historisk: false,
        },
        fasit: 'Karl XII slo Danmark og Russland raskt — men nektet å slutte fred. Han ville knuse fienden helt.',
    },
    {
        year: '1708',
        leder: 'Karl XII',
        situasjon: 'Karl XII har jaget russerne i åtte år. Skal han marsjere dypere inn mot Moskva?',
        krig: {
            label: 'Marsjer mot Russland',
            detail: 'Poltava 1709: Russerne knuser Sverige. Hele hæren går tapt.',
            territory: 0,
            cost: 5,
            historisk: true,
        },
        fred: {
            label: 'Trekk hæren hjem',
            detail: 'Sverige beholder Østersjøen og forblir en regional stormakt.',
            territory: 0,
            cost: 0,
            historisk: false,
        },
        fasit: 'Karl XII gikk inn i Russland. Etter Poltava 1709 hadde Sverige verken hær eller penger. Stormaktstiden var over.',
    },
];

type Phase = 'playing' | 'complete';

export function StormaktVagskal({
    title = 'Stormakts-vekten',
    intro = 'Velg hva Sverige skal gjøre i fem skjebnesvangre øyeblikk. Hver krig gir land, men koster ressurser. Når faller balansen?',
}: StormaktVagskalProps) {
    const [phase, setPhase] = useState<Phase>('playing');
    const [step, setStep] = useState(0);
    const [territory, setTerritory] = useState(0);
    const [cost, setCost] = useState(0);
    const [log, setLog] = useState<{ year: string; choice: 'krig' | 'fred'; fasit: string }[]>([]);

    const current = EVENTS[step];

    const handleChoice = (choice: 'krig' | 'fred') => {
        const c = choice === 'krig' ? current.krig : current.fred;
        const nextTerritory = territory + c.territory;
        const nextCost = cost + c.cost;
        const nextLog = [...log, { year: current.year, choice, fasit: current.fasit }];

        setTerritory(nextTerritory);
        setCost(nextCost);
        setLog(nextLog);

        if (step + 1 >= EVENTS.length) {
            setPhase('complete');
        } else {
            setStep(step + 1);
        }
    };

    const handleReset = () => {
        setPhase('playing');
        setStep(0);
        setTerritory(0);
        setCost(0);
        setLog([]);
    };

    const tilt = useMemo(() => {
        const diff = territory - cost;
        const clamped = Math.max(-7, Math.min(7, diff));
        return clamped * 3.5;
    }, [territory, cost]);

    const overstretched = cost > territory;
    const overstretchedFinal = phase === 'complete' && overstretched;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
                <Scale className="w-6 h-6 text-amber-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            <div className="px-6 pt-6 pb-2 bg-slate-50">
                <div className="relative h-44 flex items-end justify-center">
                    <div className="absolute bottom-0 w-2 h-32 bg-slate-700 rounded-full" />
                    <motion.div
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-64"
                        animate={{ rotate: tilt }}
                        transition={{ type: 'spring', stiffness: 80, damping: 14 }}
                        style={{ transformOrigin: 'center' }}
                    >
                        <div className="h-2 bg-slate-700 rounded-full" />
                        <div className="absolute -left-4 top-2 flex flex-col items-center gap-1">
                            <div className="w-px h-6 bg-slate-400" />
                            <div className="bg-emerald-100 border border-emerald-300 rounded-lg px-3 py-2 min-w-[5rem]">
                                <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                                    <Flag className="w-3 h-3" /> Erobring
                                </div>
                                <div className="text-emerald-900 font-bold text-lg leading-tight">
                                    +{territory}
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-4 top-2 flex flex-col items-center gap-1">
                            <div className="w-px h-6 bg-slate-400" />
                            <div className="bg-rose-100 border border-rose-300 rounded-lg px-3 py-2 min-w-[5rem]">
                                <div className="flex items-center gap-1 text-rose-700 text-xs font-semibold">
                                    <Sword className="w-3 h-3" /> Belastning
                                </div>
                                <div className="text-rose-900 font-bold text-lg leading-tight">
                                    -{cost}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="text-center text-xs text-slate-500 mt-1">
                    {phase === 'playing'
                        ? `Hendelse ${step + 1} av ${EVENTS.length}`
                        : overstretched
                          ? 'Belastningen ble for stor'
                          : 'Sverige overlevde balansen'}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'playing' ? (
                    <motion.div
                        key={`event-${step}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-sm font-bold">
                                {current.year}
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 text-sm">
                                <Crown className="w-4 h-4" />
                                {current.leder}
                            </div>
                        </div>
                        <p className="text-slate-800 mb-5 leading-relaxed">{current.situasjon}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => handleChoice('krig')}
                                className="text-left bg-white border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50 rounded-lg p-4 transition-colors group"
                            >
                                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-1">
                                    <Sword className="w-4 h-4" />
                                    {current.krig.label}
                                </div>
                                <div className="text-sm text-slate-600">{current.krig.detail}</div>
                            </button>
                            <button
                                onClick={() => handleChoice('fred')}
                                className="text-left bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-4 transition-colors group"
                            >
                                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                                    <Shield className="w-4 h-4" />
                                    {current.fred.label}
                                </div>
                                <div className="text-sm text-slate-600">{current.fred.detail}</div>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className={`rounded-xl border p-5 mb-4 ${
                                overstretchedFinal
                                    ? 'bg-rose-50 border-rose-200'
                                    : 'bg-emerald-50 border-emerald-200'
                            }`}
                        >
                            <h4
                                className={`font-bold text-lg mb-2 ${
                                    overstretchedFinal ? 'text-rose-800' : 'text-emerald-800'
                                }`}
                            >
                                {overstretchedFinal
                                    ? 'Stormakten faller'
                                    : 'Sverige holder balansen'}
                            </h4>
                            <p
                                className={`text-sm leading-relaxed ${
                                    overstretchedFinal ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                            >
                                {overstretchedFinal
                                    ? 'Belastningen ble større enn erobringen. Slik gikk det også for Sverige: i 1721 mistet landet nesten alt det hadde vunnet siden 1626. Lærdommen: stormakter faller når kostnaden av krig overskrider gevinsten.'
                                    : 'Du visste når du skulle stoppe. Det gjorde ikke Karl XII. Han presset på til hæren ble knust ved Poltava 1709, og i 1721 var stormaktstiden slutt.'}
                            </p>
                        </motion.div>

                        <div className="space-y-2 mb-4">
                            <h5 className="text-sm font-semibold text-slate-700">Slik gikk det historisk:</h5>
                            {log.map((entry, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                                >
                                    <div className="font-semibold text-slate-800 mb-1">
                                        {entry.year}
                                    </div>
                                    <div className="text-slate-600">{entry.fasit}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end border-t border-slate-100 pt-3">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
