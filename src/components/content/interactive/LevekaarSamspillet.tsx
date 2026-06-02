import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Mountain, Hourglass, HeartPulse, Lightbulb, Globe2 } from 'lucide-react';

// Signaturkomponent for "Levekår rundt om i verden".
// Lyspære: levekår er et SAMSPILL av tre krefter - politikk, geografi og historie -
// ikke en sum. Skrur du bare den ene til topp, løftes levekårene lite. Den svakeste
// kraften drar ned. Eleven vrir på de tre kreftene og ser levekårene svare, og kan
// hente fram fire ekte land for å sammenligne (det kompetansemålet ber om).

type ForceKey = 'politikk' | 'geografi' | 'historie';

interface Force {
    key: ForceKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    low: string;
    high: string;
    color: string; // tailwind-fargenavn for aksent
}

const FORCES: Force[] = [
    {
        key: 'politikk',
        label: 'Politikk',
        icon: Landmark,
        low: 'Krig og ustabilt styre',
        high: 'Stabilt demokrati',
        color: '#2563eb',
    },
    {
        key: 'geografi',
        label: 'Geografi',
        icon: Mountain,
        low: 'Karrig jord og tørke',
        high: 'Fruktbar natur',
        color: '#16a34a',
    },
    {
        key: 'historie',
        label: 'Historie',
        icon: Hourglass,
        low: 'Tung kolonihistorie',
        high: 'Sterke institusjoner',
        color: '#d97706',
    },
];

interface Profile {
    politikk: number;
    geografi: number;
    historie: number;
}

// Fire ekte land som presets - illustrasjonsverdier for de tre kreftene.
const COUNTRIES: { id: string; name: string; flag: string; profile: Profile }[] = [
    { id: 'niger', name: 'Niger', flag: '🇳🇪', profile: { politikk: 20, geografi: 25, historie: 20 } },
    { id: 'brasil', name: 'Brasil', flag: '🇧🇷', profile: { politikk: 58, geografi: 80, historie: 42 } },
    { id: 'japan', name: 'Japan', flag: '🇯🇵', profile: { politikk: 88, geografi: 48, historie: 82 } },
    { id: 'norge', name: 'Norge', flag: '🇳🇴', profile: { politikk: 95, geografi: 55, historie: 92 } },
];

// Levekår som vektet geometrisk snitt: politikk og historie veier tyngst,
// geografi mindre (geografi er ikke skjebne - Japan og Norge har krevende natur,
// men er likevel velstående). Et geometrisk snitt knuser resultatet hvis EN kraft
// er lav - det er nettopp samspillet eleven skal kjenne på.
function levekaarIndex(p: Profile): number {
    const pol = Math.max(0.02, p.politikk / 100);
    const geo = Math.max(0.02, p.geografi / 100);
    const his = Math.max(0.02, p.historie / 100);
    return Math.pow(pol, 0.4) * Math.pow(geo, 0.2) * Math.pow(his, 0.4); // 0..1
}

function category(L: number): { label: string; color: string } {
    if (L < 0.18) return { label: 'Svært lav', color: '#b91c1c' };
    if (L < 0.45) return { label: 'Lav', color: '#ea580c' };
    if (L < 0.65) return { label: 'Middels', color: '#ca8a04' };
    if (L < 0.82) return { label: 'Høy', color: '#16a34a' };
    return { label: 'Svært høy', color: '#15803d' };
}

const DEFAULT: Profile = { politikk: 50, geografi: 50, historie: 50 };

export const LevekaarSamspillet: React.FC = () => {
    const [profile, setProfile] = useState<Profile>(DEFAULT);

    const setForce = (key: ForceKey, value: number) =>
        setProfile((prev) => ({ ...prev, [key]: value }));

    const activeCountry = COUNTRIES.find(
        (c) =>
            c.profile.politikk === profile.politikk &&
            c.profile.geografi === profile.geografi &&
            c.profile.historie === profile.historie
    );

    const L = useMemo(() => levekaarIndex(profile), [profile]);
    const cat = category(L);
    const levealder = Math.round(54 + L * 32); // illustrasjon: ca. 55-86 år
    const indeks = Math.round(L * 100);

    // Finn svakeste og sterkeste kraft for samspill-merknaden.
    const entries: { key: ForceKey; label: string; v: number }[] = FORCES.map((f) => ({
        key: f.key,
        label: f.label,
        v: profile[f.key],
    }));
    const weakest = entries.reduce((a, b) => (b.v < a.v ? b : a));
    const strongest = entries.reduce((a, b) => (b.v > a.v ? b : a));
    const spread = strongest.v - weakest.v;

    let note: string;
    if (weakest.v >= 70) {
        note = 'Alle tre kreftene er sterke. Da blir levekårene svært gode - akkurat slik kompetansemålet beskriver.';
    } else if (strongest.v <= 35) {
        note = 'Alle tre kreftene er svake. Levekårene blir svært vanskelige uansett hvor du begynner.';
    } else if (spread >= 30) {
        note = `Du har skrudd ${strongest.label.toLowerCase()} høyt, men ${weakest.label.toLowerCase()} ligger lavt. De tre virker sammen, så levekårene løftes lite før du også løfter ${weakest.label.toLowerCase()}.`;
    } else {
        note = 'Levekår er et samspill. Ingen enkelt kraft avgjør alene - de tre må løftes sammen.';
    }

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Globe2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-display font-bold text-lg">Tre krefter, ett liv</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Vri på politikk, geografi og historie - eller hent fram et ekte land - og se
                    hvordan levekårene svarer. Følg med: én sterk kraft alene er ikke nok.
                </p>
            </div>

            {/* Land-presets */}
            <div className="px-5 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Hent fram et land
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                    {COUNTRIES.map((c) => {
                        const active = activeCountry?.id === c.id;
                        return (
                            <button
                                key={c.id}
                                onClick={() => setProfile(c.profile)}
                                className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                                    active
                                        ? 'text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="country-pill"
                                        className="absolute inset-0 rounded-full bg-emerald-600"
                                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                    />
                                )}
                                <span className="relative z-10">{c.flag}</span>
                                <span className="relative z-10">{c.name}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setProfile(DEFAULT)}
                        className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition"
                    >
                        Nullstill
                    </button>
                </div>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                {/* Venstre: de tre kreftene */}
                <div className="flex flex-col gap-3">
                    {FORCES.map((f) => {
                        const Icon = f.icon;
                        const v = profile[f.key];
                        const isWeak = f.key === weakest.key && spread >= 30 && weakest.v < 60;
                        return (
                            <div
                                key={f.key}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: f.color }}
                                        >
                                            <Icon className="h-4 w-4 text-white" />
                                        </span>
                                        <span className="font-bold text-slate-800">{f.label}</span>
                                    </div>
                                    <AnimatePresence>
                                        {isWeak && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700"
                                            >
                                                trekker ned
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={v}
                                    onChange={(e) => setForce(f.key, Number(e.target.value))}
                                    className="mt-2.5 w-full cursor-pointer"
                                    style={{ accentColor: f.color }}
                                    aria-label={f.label}
                                />
                                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                                    <span>{f.low}</span>
                                    <span>{f.high}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Høyre: levekår-resultatet */}
                <div className="flex flex-col gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Forventet levealder
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <HeartPulse className="h-5 w-5 text-rose-500" />
                                    <motion.span
                                        key={levealder}
                                        initial={{ scale: 1.18, color: cat.color }}
                                        animate={{ scale: 1, color: '#0f172a' }}
                                        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                                        className="font-display text-4xl font-extrabold tabular-nums"
                                    >
                                        {levealder}
                                    </motion.span>
                                    <span className="text-lg font-bold text-slate-400">år</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Levekår
                                </span>
                                <p
                                    className="font-display text-lg font-extrabold"
                                    style={{ color: cat.color }}
                                >
                                    {cat.label}
                                </p>
                            </div>
                        </div>

                        {/* Levekårsmåler */}
                        <div className="mt-3">
                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                    animate={{ width: `${indeks}%` }}
                                    transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                                />
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                <span>Svært lav</span>
                                <span>Svært høy</span>
                            </div>
                        </div>
                    </div>

                    {/* Samspill-merknad */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={note}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="text-sm leading-relaxed text-slate-700"
                            >
                                {note}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <p>
                    Ingen land er fattig eller rikt av én grunn. Politikk, geografi og historie virker
                    alltid sammen - og den svakeste kraften setter ofte taket for levekårene.
                </p>
            </div>
        </div>
    );
};
