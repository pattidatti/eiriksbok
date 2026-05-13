import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from 'lucide-react';

interface Rute {
    id: string;
    fra: string;
    til: string;
    distanseKm: number;
    timerMedTog: number;
    dagerMedHest: number;
    aar: number;
    notat?: string;
}

interface JernbaneReisesammenligningProps {
    title?: string;
    ruter?: Rute[];
}

const STANDARD_RUTER: Rute[] = [
    {
        id: 'london-birmingham',
        fra: 'London',
        til: 'Birmingham',
        distanseKm: 180,
        timerMedTog: 5,
        dagerMedHest: 2,
        aar: 1838,
        notat: 'Jernbanen åpnet i 1838 og kuttet reisen fra to harde dager til en formiddag.',
    },
    {
        id: 'oslo-bergen',
        fra: 'Oslo',
        til: 'Bergen',
        distanseKm: 470,
        timerMedTog: 11,
        dagerMedHest: 5,
        aar: 1909,
        notat: 'Bergensbanen krøp over Hardangervidda og knyttet øst og vest sammen.',
    },
    {
        id: 'new-york-chicago',
        fra: 'New York',
        til: 'Chicago',
        distanseKm: 1500,
        timerMedTog: 24,
        dagerMedHest: 21,
        aar: 1853,
        notat: 'Tre uker i hestevogn ble ett døgn på toget. Vesten kunne plutselig nås.',
    },
];

type Phase = 'idle' | 'reiser' | 'ferdig';

const TOG_VARIGHET_S = 2.2;
const HEST_VARIGHET_S = 16;

export function JernbaneReisesammenligning({
    title = 'Hvor mye krympet jernbanen verden?',
    ruter = STANDARD_RUTER,
}: JernbaneReisesammenligningProps) {
    const [valgtId, setValgtId] = useState<string>(ruter[0]?.id ?? '');
    const [phase, setPhase] = useState<Phase>('idle');
    const [togFremdrift, setTogFremdrift] = useState(0);
    const [hestFremdrift, setHestFremdrift] = useState(0);
    const startTid = useRef<number | null>(null);
    const animasjonId = useRef<number | null>(null);

    const valgt = ruter.find((r) => r.id === valgtId) ?? ruter[0];
    const fartFaktor = valgt.dagerMedHest * 24 / valgt.timerMedTog;

    useEffect(() => {
        return () => {
            if (animasjonId.current !== null) cancelAnimationFrame(animasjonId.current);
        };
    }, []);

    const stoppAnimasjon = () => {
        if (animasjonId.current !== null) {
            cancelAnimationFrame(animasjonId.current);
            animasjonId.current = null;
        }
    };

    const velgRute = (id: string) => {
        if (id === valgtId) return;
        stoppAnimasjon();
        setValgtId(id);
        setPhase('idle');
        setTogFremdrift(0);
        setHestFremdrift(0);
        startTid.current = null;
    };

    const tikk = (nå: number) => {
        if (startTid.current === null) startTid.current = nå;
        const sekunder = (nå - startTid.current) / 1000;
        const togAndel = Math.min(1, sekunder / TOG_VARIGHET_S);
        const hestAndel = Math.min(1, sekunder / HEST_VARIGHET_S);
        setTogFremdrift(togAndel);
        setHestFremdrift(hestAndel);
        if (togAndel >= 1 && hestAndel >= 1) {
            setPhase('ferdig');
            animasjonId.current = null;
            return;
        }
        animasjonId.current = requestAnimationFrame(tikk);
    };

    const startReisen = () => {
        stoppAnimasjon();
        setPhase('reiser');
        setTogFremdrift(0);
        setHestFremdrift(0);
        startTid.current = null;
        animasjonId.current = requestAnimationFrame(tikk);
    };

    const tilbakestill = () => {
        stoppAnimasjon();
        setPhase('idle');
        setTogFremdrift(0);
        setHestFremdrift(0);
        startTid.current = null;
    };

    const togTimerVist = Math.round(valgt.timerMedTog * togFremdrift * 10) / 10;
    const hestDagerVist = Math.round(valgt.dagerMedHest * hestFremdrift * 10) / 10;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Train className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en rute og start reisen. Se hvor langt hestevogna når før toget er framme.
                    </p>
                </div>
            </div>

            <div className="px-6 pt-4 flex flex-wrap gap-2">
                {ruter.map((r) => {
                    const aktiv = r.id === valgtId;
                    return (
                        <button
                            key={r.id}
                            onClick={() => velgRute(r.id)}
                            className={
                                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ' +
                                (aktiv
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100')
                            }
                        >
                            {r.fra} → {r.til}
                        </button>
                    );
                })}
            </div>

            <div className="px-6 py-5 space-y-5">
                <div className="text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                        <span className="font-semibold text-slate-800">{valgt.distanseKm} km</span> mellom {valgt.fra} og {valgt.til}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Jernbanen åpnet i {valgt.aar}</span>
                </div>

                <Spor
                    label="Tog"
                    farge="indigo"
                    fremdrift={togFremdrift}
                    teller={`${togTimerVist} timer`}
                    ikon="🚂"
                />

                <Spor
                    label="Hestevogn"
                    farge="amber"
                    fremdrift={hestFremdrift}
                    teller={`${hestDagerVist} dager`}
                    ikon="🐴"
                />
            </div>

            <AnimatePresence mode="wait">
                {phase === 'ferdig' && (
                    <motion.div
                        key={`ferdig-${valgt.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                    >
                        <div className="font-semibold mb-1">Toget var omtrent {Math.round(fartFaktor)} ganger raskere</div>
                        <div>
                            Hestevogna brukte {valgt.dagerMedHest} dager. Toget brukte {valgt.timerMedTog} timer. {valgt.notat}
                        </div>
                    </motion.div>
                )}
                {phase === 'idle' && (
                    <motion.div
                        key={`hint-${valgt.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                    >
                        Klikk «Start reisen» for å se forskjellen.
                    </motion.div>
                )}
                {phase === 'reiser' && (
                    <motion.div
                        key={`reiser-${valgt.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm"
                    >
                        Reisen pågår … toget kommer fram først.
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={startReisen}
                    disabled={phase === 'reiser'}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    {phase === 'ferdig' ? 'Reis igjen' : 'Start reisen'}
                </button>
                <button
                    onClick={tilbakestill}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}

interface SporProps {
    label: string;
    farge: 'indigo' | 'amber';
    fremdrift: number;
    teller: string;
    ikon: string;
}

function Spor({ label, farge, fremdrift, teller, ikon }: SporProps) {
    const sporFarge = farge === 'indigo' ? 'bg-indigo-100' : 'bg-amber-100';
    const fyltFarge = farge === 'indigo' ? 'bg-indigo-400' : 'bg-amber-400';
    const tekstFarge = farge === 'indigo' ? 'text-indigo-700' : 'text-amber-700';
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
                <span className={`font-medium ${tekstFarge}`}>{label}</span>
                <span className="text-slate-500 tabular-nums">{teller}</span>
            </div>
            <div className={`relative h-9 ${sporFarge} rounded-full overflow-hidden`}>
                <div
                    className={`absolute inset-y-0 left-0 ${fyltFarge} opacity-60`}
                    style={{ width: `${fremdrift * 100}%` }}
                />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 text-xl"
                    style={{ left: `calc(${fremdrift * 100}% - 0.75rem)` }}
                >
                    {ikon}
                </motion.div>
            </div>
        </div>
    );
}
