import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, User, Users, Scale, RotateCcw } from 'lucide-react';

interface Status {
    id: string;
    label: string;
    icon: React.ReactNode;
    amount: number;
    cows: number;
    parallel: string;
    consequence: string;
}

interface Tradition {
    id: string;
    name: string;
    period: string;
    source: string;
    currency: string;
    statuses: Status[];
}

const TRADITIONS: Tradition[] = [
    {
        id: 'frankisk',
        name: 'Frankisk',
        period: 'Ca. 500 e.Kr.',
        source: 'Lex Salica - frankernes nedskrevne lov',
        currency: 'sølvsolidi',
        statuses: [
            {
                id: 'edelmann',
                label: 'Edelmann (antrustio)',
                icon: <Crown size={20} />,
                amount: 600,
                cows: 600,
                parallel: 'En av kongens nærmeste menn. Drapet på ham kostet trefoldig.',
                consequence: 'En hel landsby måtte spleise i flere år.',
            },
            {
                id: 'fri-frank',
                label: 'Fri frank',
                icon: <Shield size={20} />,
                amount: 200,
                cows: 200,
                parallel: 'En vanlig bonde med våpenrett.',
                consequence: 'En stor gård kunne nettopp dekke boten.',
            },
            {
                id: 'romer',
                label: 'Fri romer',
                icon: <User size={20} />,
                amount: 100,
                cows: 100,
                parallel: 'En romer som levde under frankisk styre.',
                consequence: 'Verdt halvparten av en frank - selv om begge var frie.',
            },
            {
                id: 'trael',
                label: 'Træl',
                icon: <Users size={20} />,
                amount: 35,
                cows: 35,
                parallel: 'Erstatning betalt til eieren, ikke familien.',
                consequence: 'Trælen var en eiendel. Boten var prisen for tapt arbeid.',
            },
        ],
    },
    {
        id: 'anglosaksisk',
        name: 'Anglosaksisk',
        period: '700-tallet',
        source: 'Lovene til Ine av Wessex',
        currency: 'shillings',
        statuses: [
            {
                id: 'konge',
                label: 'Konge',
                icon: <Crown size={20} />,
                amount: 7500,
                cows: 7500,
                parallel: 'Ingen privat slekt kunne betale dette.',
                consequence: 'Boten gikk til kongedømmet selv. I praksis: krig.',
            },
            {
                id: 'thegn',
                label: 'Thegn (lavadel)',
                icon: <Shield size={20} />,
                amount: 1200,
                cows: 1200,
                parallel: 'En kriger med jord og menn under seg.',
                consequence: 'Seks ganger en fri bondes verdi.',
            },
            {
                id: 'ceorl',
                label: 'Ceorl (fribonde)',
                icon: <User size={20} />,
                amount: 200,
                cows: 200,
                parallel: 'En selvstendig bonde med egen jord.',
                consequence: 'Grunnenheten i samfunnet - wergildens nullpunkt.',
            },
            {
                id: 'slave',
                label: 'Slave',
                icon: <Users size={20} />,
                amount: 0,
                cows: 0,
                parallel: 'Ingen wergild. Eieren fikk erstatning som for et drept dyr.',
                consequence: 'I lovens øyne hadde slaven ingen egen verdi.',
            },
        ],
    },
    {
        id: 'norront',
        name: 'Norrønt',
        period: '1100-1200',
        source: 'Gulatingsloven og Frostatingsloven',
        currency: 'sølvmark',
        statuses: [
            {
                id: 'hauld',
                label: 'Hauld (odelsbonde)',
                icon: <Crown size={20} />,
                amount: 27,
                cows: 216,
                parallel: 'En odelsbonde med ætt langt tilbake.',
                consequence: 'Tilsvarte verdien av en middelstor gård.',
            },
            {
                id: 'bonde',
                label: 'Fri bonde',
                icon: <Shield size={20} />,
                amount: 12,
                cows: 96,
                parallel: 'En vanlig fri mann med rett på Tinget.',
                consequence: 'Familien kunne kreve dette eller velge blodhevn.',
            },
            {
                id: 'frigitt',
                label: 'Frigitt (leysingi)',
                icon: <User size={20} />,
                amount: 6,
                cows: 48,
                parallel: 'En tidligere træl som hadde kjøpt seg fri.',
                consequence: 'Halvparten av en fribondes verdi.',
            },
            {
                id: 'trael',
                label: 'Træl',
                icon: <Users size={20} />,
                amount: 3,
                cows: 24,
                parallel: 'Erstatning til eieren - ikke til familien.',
                consequence: 'Lavest pris. Ætten hadde ingen krav.',
            },
        ],
    },
];

const formatNumber = (n: number) => new Intl.NumberFormat('nb-NO').format(n);

export const WergildCalculator: React.FC = () => {
    const [traditionId, setTraditionId] = useState<string>(TRADITIONS[0].id);
    const [statusId, setStatusId] = useState<string>(TRADITIONS[0].statuses[1].id);

    const tradition = TRADITIONS.find((t) => t.id === traditionId)!;
    const status = tradition.statuses.find((s) => s.id === statusId) ?? tradition.statuses[1];

    const handleTradition = (id: string) => {
        setTraditionId(id);
        const next = TRADITIONS.find((t) => t.id === id)!;
        setStatusId(next.statuses[1].id);
    };

    const cowsToShow = Math.min(status.cows, 60);
    const overflow = status.cows - cowsToShow;

    return (
        <div className="my-8 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-stone-50 p-6 shadow-sm md:p-8">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <Scale size={22} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-stone-800">Wergild-tavla</h3>
                    <p className="text-sm text-stone-600">
                        Velg rettstradisjon og offerets status. Se hva drapet kostet.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setTraditionId(TRADITIONS[0].id);
                        setStatusId(TRADITIONS[0].statuses[1].id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 transition hover:bg-stone-50"
                    aria-label="Tilbakestill"
                >
                    <RotateCcw size={14} /> Start på nytt
                </button>
            </div>

            <div className="mb-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                    Rettstradisjon
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {TRADITIONS.map((t) => {
                        const active = t.id === traditionId;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleTradition(t.id)}
                                className={`rounded-xl border px-3 py-2 text-left transition ${
                                    active
                                        ? 'border-amber-500 bg-amber-100/70 text-stone-800 shadow-sm'
                                        : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300'
                                }`}
                            >
                                <div className="text-sm font-semibold">{t.name}</div>
                                <div className="text-[11px] text-stone-500">{t.period}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                    Offerets status
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {tradition.statuses.map((s) => {
                        const active = s.id === statusId;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setStatusId(s.id)}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                                    active
                                        ? 'border-stone-700 bg-stone-800 text-white shadow-sm'
                                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                                }`}
                            >
                                <span className={active ? 'text-amber-200' : 'text-stone-500'}>
                                    {s.icon}
                                </span>
                                <span className="text-sm font-medium leading-tight">{s.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${traditionId}-${statusId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                    className="rounded-xl bg-white/80 p-5 ring-1 ring-stone-200"
                >
                    <div className="mb-4 flex items-baseline gap-3">
                        <motion.span
                            key={status.amount}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                            className="text-5xl font-bold text-amber-700 md:text-6xl"
                        >
                            {formatNumber(status.amount)}
                        </motion.span>
                        <span className="text-base font-medium text-stone-600">
                            {tradition.currency}
                        </span>
                    </div>

                    {status.cows > 0 ? (
                        <div className="mb-4">
                            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">
                                Tilsvarte omtrent {formatNumber(status.cows)} kyr
                            </p>
                            <div className="flex flex-wrap gap-0.5 text-base leading-none">
                                {Array.from({ length: cowsToShow }).map((_, i) => (
                                    <span key={i} aria-hidden="true">
                                        🐄
                                    </span>
                                ))}
                                {overflow > 0 && (
                                    <span className="ml-1 self-center text-xs text-stone-500">
                                        + {formatNumber(overflow)} til
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
                            Ingen wergild. Drapet ga erstatning kun til eieren.
                        </div>
                    )}

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
                            <span className="font-semibold text-stone-800">Hvem var dette? </span>
                            {status.parallel}
                        </div>
                        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-stone-700">
                            <span className="font-semibold text-stone-800">I praksis: </span>
                            {status.consequence}
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-stone-500">
                        Kilde: {tradition.source}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WergildCalculator;
