import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Vote,
    Scale,
    GraduationCap,
    Check,
    Minus,
    X,
    UserCheck,
    Lightbulb,
} from 'lucide-react';

// Signaturkomponent for "Å være medborger".
// Lyspære: forskjellen på å være innbygger og medborger er ikke om det finnes
// valg, men om rettighetene dine er reelle og om du kan bytte ut makta. Eleven
// velger et politisk system og ser hvilke medborgerhandlinger som faktisk er
// mulige - gruppert i de tre rettighetstypene. Alle fire systemene har
// innbyggere, men bare noen gjør deg til en ekte medborger.

type Status = 'ja' | 'kontrollert' | 'nei';
type RightGroup = 'sivile' | 'politiske' | 'sosiale';

interface ActionDef {
    id: string;
    label: string;
    right: RightGroup;
}

const ACTIONS: ActionDef[] = [
    { id: 'ytring', label: 'Si meningen din om lederne fritt', right: 'sivile' },
    { id: 'rettssak', label: 'Få en rettferdig rettssak', right: 'sivile' },
    { id: 'opposisjon', label: 'Stemme på en reell opposisjon', right: 'politiske' },
    { id: 'bytte', label: 'Bytte ut ledelsen ved valg', right: 'politiske' },
    { id: 'parti', label: 'Starte ditt eget politiske parti', right: 'politiske' },
    { id: 'skole', label: 'Få gratis skolegang', right: 'sosiale' },
    { id: 'helse', label: 'Få helsehjelp når du trenger det', right: 'sosiale' },
];

interface SystemDef {
    id: string;
    name: string;
    examples: string;
    note: string;
    statuses: Record<string, { status: Status; why: string }>;
}

const SYSTEMS: SystemDef[] = [
    {
        id: 'demokrati',
        name: 'Liberalt demokrati',
        examples: 'Norge, Sverige, Tyskland',
        note: 'Du er en full medborger: du har både rettigheter og reell makt over styringa.',
        statuses: {
            ytring: { status: 'ja', why: 'Du kan kritisere statsministeren uten å risikere noe.' },
            rettssak: { status: 'ja', why: 'Domstolene er uavhengige av politikerne.' },
            opposisjon: { status: 'ja', why: 'Flere partier konkurrerer fritt om stemmene.' },
            bytte: { status: 'ja', why: 'Taper de som styrer valget, må de gå av.' },
            parti: { status: 'ja', why: 'Hvem som helst kan stifte et nytt parti.' },
            skole: { status: 'ja', why: 'Gratis skole for alle.' },
            helse: { status: 'ja', why: 'Offentlig helsehjelp til alle.' },
        },
    },
    {
        id: 'eittparti',
        name: 'Ettpartistyre',
        examples: 'Kina, Cuba, Nord-Korea',
        note: 'Du har noen sosiale goder, men ingen politisk makt. Du er innbygger, ikke medborger i demokratisk forstand.',
        statuses: {
            ytring: { status: 'nei', why: 'Du kan klage på lokale problemer, men ikke kritisere partiledelsen.' },
            rettssak: { status: 'kontrollert', why: 'Domstolene er underordnet partiet.' },
            opposisjon: { status: 'nei', why: 'Alle kandidater må godkjennes av partiet først.' },
            bytte: { status: 'nei', why: 'Folket kan ikke bytte ut ledelsen fredelig.' },
            parti: { status: 'nei', why: 'Uavhengige partier er forbudt.' },
            skole: { status: 'ja', why: 'Staten gir skolegang til innbyggerne.' },
            helse: { status: 'ja', why: 'Staten gir helsehjelp.' },
        },
    },
    {
        id: 'teokrati',
        name: 'Teokrati',
        examples: 'Iran',
        note: 'Et religiøst toppsjikt overstyrer folkeviljen. Du er innbygger under et styre du ikke kan endre.',
        statuses: {
            ytring: { status: 'nei', why: 'Å kritisere det religiøse styret kan straffes hardt.' },
            rettssak: { status: 'kontrollert', why: 'Religiøse domstoler tolker loven.' },
            opposisjon: { status: 'nei', why: 'Vokterrådet siler bort kandidater de ikke godtar.' },
            bytte: { status: 'nei', why: 'Religiøse ledere har vetorett over folkeviljen.' },
            parti: { status: 'nei', why: 'Bare partier regimet godtar får stille til valg.' },
            skole: { status: 'kontrollert', why: 'Skole finnes, men pensum styres av religionen.' },
            helse: { status: 'ja', why: 'Helsehjelp finnes.' },
        },
    },
    {
        id: 'monarki',
        name: 'Konstitusjonelt monarki',
        examples: 'Storbritannia, Japan, Danmark',
        note: 'Monarken er mest symbolsk - den reelle makta er folkevalgt. Et arvelig statsoverhode hindrer ikke at du er en full medborger.',
        statuses: {
            ytring: { status: 'ja', why: 'Fri presse og ytringsfrihet, som i andre demokratier.' },
            rettssak: { status: 'ja', why: 'Uavhengige domstoler.' },
            opposisjon: { status: 'ja', why: 'Flere partier konkurrerer i frie valg.' },
            bytte: { status: 'ja', why: 'Det folkevalgte parlamentet kan byttes ut ved valg.' },
            parti: { status: 'ja', why: 'Frie partier er tillatt.' },
            skole: { status: 'ja', why: 'Gratis skole for alle.' },
            helse: { status: 'ja', why: 'Offentlig helsehjelp til alle.' },
        },
    },
];

const RIGHT_META: Record<RightGroup, { label: string; icon: typeof Scale; color: string }> = {
    sivile: { label: 'Sivile rettigheter', icon: Scale, color: 'text-sky-600' },
    politiske: { label: 'Politiske rettigheter', icon: Vote, color: 'text-indigo-600' },
    sosiale: { label: 'Sosiale rettigheter', icon: GraduationCap, color: 'text-emerald-600' },
};

const STATUS_META: Record<
    Status,
    { label: string; icon: typeof Check; bg: string; text: string; ring: string; weight: number }
> = {
    ja: { label: 'Ja', icon: Check, bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'border-emerald-200', weight: 2 },
    kontrollert: { label: 'Kontrollert', icon: Minus, bg: 'bg-amber-50', text: 'text-amber-700', ring: 'border-amber-200', weight: 1 },
    nei: { label: 'Nei', icon: X, bg: 'bg-rose-50', text: 'text-rose-700', ring: 'border-rose-200', weight: 0 },
};

export const Medborgartesten: React.FC = () => {
    const [selectedId, setSelectedId] = useState(SYSTEMS[0].id);
    const system = SYSTEMS.find((s) => s.id === selectedId) ?? SYSTEMS[0];

    const score = useMemo(() => {
        const max = ACTIONS.length * 2;
        const sum = ACTIONS.reduce(
            (acc, a) => acc + STATUS_META[system.statuses[a.id].status].weight,
            0
        );
        return Math.round((sum / max) * 100);
    }, [system]);

    const verdict =
        score >= 85
            ? { label: 'Full medborger', color: '#059669', bar: '#10b981' }
            : score >= 40
              ? { label: 'Begrenset medborger', color: '#b45309', bar: '#f59e0b' }
              : { label: 'Bare innbygger', color: '#be123c', bar: '#f43f5e' };

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-lg">Innbygger eller medborger?</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Velg et politisk system og se hvilke medborgerhandlinger som faktisk er mulige.
                    Bytt mellom systemene og sammenlign - alle har innbyggere, men ikke alle gir deg
                    ekte makt.
                </p>
            </div>

            {/* System-velger */}
            <div className="px-5 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
                {SYSTEMS.map((s) => {
                    const active = s.id === selectedId;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setSelectedId(s.id)}
                            className={`relative rounded-xl border px-3 py-2.5 text-left transition ${
                                active
                                    ? 'border-indigo-400 bg-indigo-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId="medborger-tab"
                                    className="absolute inset-0 rounded-xl ring-2 ring-indigo-400"
                                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                />
                            )}
                            <span className="relative z-10 block text-sm font-bold text-slate-800 leading-tight">
                                {s.name}
                            </span>
                            <span className="relative z-10 block text-[11px] text-slate-500 mt-0.5">
                                {s.examples}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                {/* Venstre: handlingene */}
                <div className="space-y-2">
                    {ACTIONS.map((a, i) => {
                        const entry = system.statuses[a.id];
                        const sm = STATUS_META[entry.status];
                        const rm = RIGHT_META[a.right];
                        const RightIcon = rm.icon;
                        const StatusIcon = sm.icon;
                        return (
                            <motion.div
                                key={`${selectedId}-${a.id}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 220, damping: 22 }}
                                className={`flex items-center gap-3 rounded-xl border p-3 ${sm.ring} ${sm.bg}`}
                            >
                                <RightIcon className={`w-4 h-4 flex-shrink-0 ${rm.color}`} aria-hidden />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                        {a.label}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{entry.why}</p>
                                </div>
                                <motion.span
                                    key={`${selectedId}-${a.id}-badge`}
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 + 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold flex-shrink-0 ${sm.text} bg-white border ${sm.ring}`}
                                >
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {sm.label}
                                </motion.span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Høyre: medborger-måler + dom */}
                <div className="flex flex-col gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">Medborger-status</span>
                            <span className="text-xs font-bold" style={{ color: verdict.color }}>
                                {verdict.label}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: verdict.bar }}
                                animate={{ width: `${score}%` }}
                                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                            Reelle rettigheter: {score} %
                        </p>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={selectedId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="text-sm text-slate-700 mt-3 leading-relaxed"
                            >
                                {system.note}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            De tre rettighetstypene
                        </span>
                        <div className="mt-2 space-y-1.5">
                            {(Object.keys(RIGHT_META) as RightGroup[]).map((r) => {
                                const rm = RIGHT_META[r];
                                const Icon = rm.icon;
                                return (
                                    <div key={r} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Icon className={`w-4 h-4 ${rm.color}`} />
                                        {rm.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-indigo-50 border-t border-indigo-100 px-5 py-3 text-sm text-indigo-900">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                <p>
                    I alle fire systemene bor det innbyggere. Men bare der rettighetene er reelle - og
                    du kan bytte ut makta - er du en ekte medborger. Legg merke til at «det finnes
                    valg» ikke betyr at stemmen din faktisk teller.
                </p>
            </div>
        </div>
    );
};
