import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Footprints, Ship, Radio, Phone, Zap, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Method {
    label: string;
    year: string;
    icon: 'horse' | 'ship' | 'telegraph' | 'phone';
    // hvor lang tid beskjeden bruker over Atlanteren
    timeLabel: string;
    // sekunder animasjonen bruker fra A til B (speiler hastigheten)
    duration: number;
    blurb: string;
}

interface MessageSpeedExplorerProps {
    title?: string;
    methods?: Method[];
}

const ICONS: Record<Method['icon'], LucideIcon> = {
    horse: Footprints,
    ship: Ship,
    telegraph: Radio,
    phone: Phone,
};

const DEFAULT_METHODS: Method[] = [
    {
        label: 'Budbringer til hest',
        year: 'oldtiden',
        icon: 'horse',
        timeLabel: 'flere uker',
        duration: 4.5,
        blurb: 'En rytter kunne bare ri så langt hesten orket. Over havet hjalp det ikke i det hele tatt.',
    },
    {
        label: 'Seilskip',
        year: '1700-tallet',
        icon: 'ship',
        timeLabel: 'rundt 6 uker',
        duration: 6,
        blurb: 'Et brev over Atlanteren måtte ligge i lasterommet på et skip som var prisgitt vinden.',
    },
    {
        label: 'Telegraf',
        year: 'fra 1844',
        icon: 'telegraph',
        timeLabel: 'noen minutter',
        duration: 1.1,
        blurb: 'Beskjeden ble til prikker og streker som fløy gjennom en kabel som elektriske støt.',
    },
    {
        label: 'Telefon',
        year: 'fra 1876',
        icon: 'phone',
        timeLabel: 'noen sekunder',
        duration: 0.5,
        blurb: 'Nå reiste ikke bare beskjeden, men selve stemmen din - i sanntid, mens du snakket.',
    },
];

export function MessageSpeedExplorer({
    title = 'Hvor lenge brukte en beskjed over havet?',
    methods = DEFAULT_METHODS,
}: MessageSpeedExplorerProps) {
    const [index, setIndex] = useState(0);
    // sendId tvinger en ny animasjon hver gang man bytter metode eller sender på nytt
    const [sendId, setSendId] = useState(0);

    const method = methods[index];
    const isFast = method.icon === 'telegraph' || method.icon === 'phone';
    const MethodIcon = ICONS[method.icon];

    const handleSelect = (i: number) => {
        setIndex(i);
        setSendId((n) => n + 1);
    };

    const handleResend = () => setSendId((n) => n + 1);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Send className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en måte å sende beskjeden på, og se hvor lenge den bruker over
                        Atlanteren.
                    </p>
                </div>
            </div>

            {/* Metodevelger */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="flex flex-wrap gap-2">
                    {methods.map((m, i) => {
                        const Icon = ICONS[m.icon];
                        const active = i === index;
                        return (
                            <button
                                key={m.label}
                                onClick={() => handleSelect(i)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Primær interaksjonsflate: ruten over havet */}
            <div className="px-6 py-7">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Europa</span>
                    <span>Amerika</span>
                </div>
                <div className="relative h-16 rounded-xl bg-gradient-to-r from-sky-100 via-blue-100 to-sky-100 border border-slate-200 overflow-hidden">
                    {/* Bølgemønster */}
                    <div className="absolute inset-0 flex items-center justify-around opacity-30">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <span key={i} className="text-blue-300 text-lg select-none">
                                ~
                            </span>
                        ))}
                    </div>

                    {/* Start- og endepunkt */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-emerald-600 text-xs font-bold">
                        A
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 text-xs font-bold">
                        B
                    </div>

                    {/* Beskjeden som beveger seg */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${index}-${sendId}`}
                            initial={{ left: '12px' }}
                            animate={{ left: 'calc(100% - 52px)' }}
                            transition={{
                                duration: method.duration,
                                ease: isFast ? 'easeIn' : 'linear',
                            }}
                            className="absolute top-1/2 -translate-y-1/2"
                        >
                            <motion.div
                                animate={{
                                    scale: isFast ? [1, 1.25, 1] : [1, 1.08, 1],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: isFast ? 0.4 : 1.2,
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow-md"
                            >
                                <MethodIcon className="h-4 w-4" />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Feedback-sone (alltid til stede) */}
            <div className="mx-6 mb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800">
                                {method.label}
                            </span>
                            <span className="text-xs text-slate-400">{method.year}</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-indigo-600">
                            {method.timeLabel}{' '}
                            <span className="text-sm font-medium text-slate-500">
                                over Atlanteren
                            </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{method.blurb}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsiktsbanner ved telefon */}
            <AnimatePresence>
                {method.icon === 'phone' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Zap className="h-4 w-4 shrink-0" />
                        En beskjed gikk fra å bruke uker til å komme fram på sekunder - for første
                        gang kunne folk snakke sammen over store avstander i sanntid.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    Samme distanse over Atlanteren for alle metodene
                </div>
                <button
                    onClick={handleResend}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Send på nytt
                </button>
            </div>
        </div>
    );
}
