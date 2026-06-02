import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Check, Vote, PartyPopper, RotateCcw } from 'lucide-react';

// Signaturkomponent for "Det norske demokratiet i dag".
// Lyspære: stemmer blir ikke til makt 1:1. Sperregrensen (4 %) avgjør hvem som
// kommer inn i salen, og ingen styrer alene - makt i Norge krever koalisjon.
// Eleven skrur sperregrensen av/på (og ser de minste partiene vinne eller miste
// utjevningsmandater) og klikker partier sammen til de når flertall (85 mandater).

interface Party {
    id: string;
    name: string;
    short: string;
    color: string;
    pct: number; // stemmeandel i prosent (illustrasjonstall)
    seatsOn: number; // mandater MED sperregrense
    seatsOff: number; // mandater UTEN sperregrense
    underThreshold: boolean; // under 4 % - mister utjevningsmandater
}

// Illustrasjonstall. Plassert i venstre-høyre-rekkefølge for et realistisk amfi.
// seatsOn summerer til 169. seatsOff summerer også til 169.
const PARTIES: Party[] = [
    { id: 'r', name: 'Rødt', short: 'R', color: '#7f1d1d', pct: 4.7, seatsOn: 8, seatsOff: 8, underThreshold: false },
    { id: 'sv', name: 'Sosialistisk Venstreparti', short: 'SV', color: '#db2777', pct: 7.6, seatsOn: 13, seatsOff: 12, underThreshold: false },
    { id: 'ap', name: 'Arbeiderpartiet', short: 'Ap', color: '#d11d2c', pct: 26.3, seatsOn: 48, seatsOff: 47, underThreshold: false },
    { id: 'sp', name: 'Senterpartiet', short: 'Sp', color: '#5b8a2b', pct: 13.5, seatsOn: 28, seatsOff: 27, underThreshold: false },
    { id: 'mdg', name: 'Miljøpartiet De Grønne', short: 'MDG', color: '#16a34a', pct: 3.9, seatsOn: 4, seatsOff: 7, underThreshold: true },
    { id: 'v', name: 'Venstre', short: 'V', color: '#0d9488', pct: 4.6, seatsOn: 8, seatsOff: 7, underThreshold: false },
    { id: 'krf', name: 'Kristelig Folkeparti', short: 'KrF', color: '#eab308', pct: 3.8, seatsOn: 3, seatsOff: 6, underThreshold: true },
    { id: 'h', name: 'Høyre', short: 'H', color: '#2563eb', pct: 20.4, seatsOn: 36, seatsOff: 35, underThreshold: false },
    { id: 'frp', name: 'Fremskrittspartiet', short: 'FrP', color: '#1e3a8a', pct: 11.6, seatsOn: 21, seatsOff: 20, underThreshold: false },
];

const TOTAL_SEATS = 169;
const MAJORITY = 85; // flertall = minst 85 mandater

// Amfi-geometri (halvsirkel).
const SVG_W = 460;
const SVG_H = 250;
const ROWS = 8;

interface Seat {
    x: number;
    y: number;
    angle: number;
}

// Legg 169 seter ut i en halvsirkel, rad for rad. Returneres sortert venstre->høyre.
function buildSeats(): Seat[] {
    const cx = SVG_W / 2;
    const cy = SVG_H - 22;
    const rInner = 64;
    const rOuter = 210;
    // Antall seter per rad ~ proporsjonalt med radien.
    const rowR: number[] = [];
    for (let r = 0; r < ROWS; r++) rowR.push(rInner + ((rOuter - rInner) * r) / (ROWS - 1));
    const weights = rowR.reduce((a, b) => a + b, 0);
    const rowCounts = rowR.map((r) => Math.max(1, Math.round((TOTAL_SEATS * r) / weights)));
    // Juster så summen blir akkurat 169.
    let diff = TOTAL_SEATS - rowCounts.reduce((a, b) => a + b, 0);
    let i = ROWS - 1;
    while (diff !== 0) {
        rowCounts[i] += diff > 0 ? 1 : -1;
        diff += diff > 0 ? -1 : 1;
        i = (i - 1 + ROWS) % ROWS;
    }
    const seats: Seat[] = [];
    rowR.forEach((radius, r) => {
        const n = rowCounts[r];
        for (let s = 0; s < n; s++) {
            // Vinkel fra 180° (venstre) til 0° (høyre).
            const t = n === 1 ? 0.5 : s / (n - 1);
            const ang = Math.PI - t * Math.PI;
            seats.push({
                x: cx + radius * Math.cos(ang),
                y: cy - radius * Math.sin(ang),
                angle: ang,
            });
        }
    });
    // Sorter venstre->høyre etter vinkel (stor vinkel = venstre).
    return seats.sort((a, b) => b.angle - a.angle);
}

export const Valgmaskinen: React.FC = () => {
    const [thresholdOn, setThresholdOn] = useState(true);
    const [coalition, setCoalition] = useState<Set<string>>(new Set());

    const seats = useMemo(() => buildSeats(), []);

    // Hvilket parti eier hvert sete? Fyll partiene i rekkefølge langs amfiet.
    const seatOwner = useMemo(() => {
        const owners: string[] = [];
        PARTIES.forEach((p) => {
            const n = thresholdOn ? p.seatsOn : p.seatsOff;
            for (let k = 0; k < n; k++) owners.push(p.id);
        });
        return owners;
    }, [thresholdOn]);

    const seatsOf = (p: Party) => (thresholdOn ? p.seatsOn : p.seatsOff);

    const coalitionSeats = PARTIES.filter((p) => coalition.has(p.id)).reduce(
        (sum, p) => sum + seatsOf(p),
        0
    );
    const hasMajority = coalitionSeats >= MAJORITY;

    const toggleParty = (id: string) => {
        setCoalition((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const reset = () => setCoalition(new Set());

    const pctToMajority = Math.min(100, (coalitionSeats / MAJORITY) * 100);

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-lg">Fra kryss til makt</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Stemmene er talt opp. Skru sperregrensen av og på, og klikk partier sammen til de
                    når flertall. Slik blir kryssene dine til en regjering.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                {/* Venstre: Stortings-amfiet */}
                <div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Stortinget - 169 mandater
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                                Din koalisjon: {coalitionSeats}
                            </span>
                        </div>
                        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" role="img"
                            aria-label="Amfi over Stortinget med 169 seter">
                            {seats.map((seat, idx) => {
                                const ownerId = seatOwner[idx];
                                const owner = PARTIES.find((p) => p.id === ownerId)!;
                                const inCoalition = coalition.has(ownerId);
                                const dimmed = coalition.size > 0 && !inCoalition;
                                return (
                                    <motion.circle
                                        key={idx}
                                        cx={seat.x}
                                        cy={seat.y}
                                        r={5}
                                        initial={false}
                                        animate={{
                                            fill: owner.color,
                                            opacity: dimmed ? 0.28 : 1,
                                            scale: inCoalition ? 1.18 : 1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                        style={{ transformOrigin: `${seat.x}px ${seat.y}px` }}
                                        stroke={inCoalition ? '#1e293b' : 'transparent'}
                                        strokeWidth={inCoalition ? 1.4 : 0}
                                    />
                                );
                            })}
                            {/* Flertallslinje-tekst i midten */}
                            <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fontSize={11}
                                fill="#64748b" fontWeight={700}>
                                Flertall = {MAJORITY}
                            </text>
                        </svg>
                    </div>

                    {/* Flertallsmåler */}
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">Vei til flertall</span>
                            <span
                                className="text-xs font-bold"
                                style={{ color: hasMajority ? '#16a34a' : '#d97706' }}
                            >
                                {coalitionSeats} / {MAJORITY}
                            </span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: hasMajority ? '#16a34a' : '#4f46e5' }}
                                animate={{ width: `${pctToMajority}%` }}
                                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            {hasMajority ? (
                                <motion.div
                                    key="win"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2.5 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-2.5 text-sm text-green-800"
                                >
                                    <PartyPopper className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                    <span>
                                        Du har flertall! Disse partiene kan styre sammen. Slik dannes
                                        nesten alle norske regjeringer - som koalisjoner.
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="hint"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 text-xs text-slate-500"
                                >
                                    {coalition.size === 0
                                        ? 'Klikk partier til høyre for å bygge en regjering.'
                                        : `Mangler ${MAJORITY - coalitionSeats} mandater på flertall.`}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Høyre: sperregrense + partiliste */}
                <div className="flex flex-col gap-3">
                    {/* Sperregrense-bryter */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-700">
                                    Sperregrense (4 %)
                                </span>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                    Partier under 4 % mister utjevningsmandatene sine.
                                </p>
                            </div>
                            <button
                                onClick={() => setThresholdOn((v) => !v)}
                                className={`relative h-7 w-14 flex-shrink-0 rounded-full transition ${
                                    thresholdOn ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                                aria-pressed={thresholdOn}
                                aria-label="Skru sperregrensen av eller på"
                            >
                                <motion.span
                                    className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                                    animate={{ left: thresholdOn ? 32 : 4 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                />
                            </button>
                        </div>
                        <p className="mt-1.5 text-[11px] font-bold"
                            style={{ color: thresholdOn ? '#4f46e5' : '#d97706' }}>
                            {thresholdOn
                                ? 'PÅ: KrF og MDG kommer bare inn med direktemandater.'
                                : 'AV: KrF og MDG får utjevningsmandater - se mandatene hoppe.'}
                        </p>
                    </div>

                    {/* Partiliste */}
                    <div className="grid grid-cols-1 gap-1.5">
                        {PARTIES.map((p) => {
                            const seatCount = seatsOf(p);
                            const selected = coalition.has(p.id);
                            const faded = thresholdOn && p.underThreshold;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => toggleParty(p.id)}
                                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
                                        selected
                                            ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                    style={{ opacity: faded && !selected ? 0.62 : 1 }}
                                >
                                    <span
                                        className="h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white"
                                        style={{ backgroundColor: p.color }}
                                    >
                                        {p.short}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-slate-800 leading-tight">
                                            {p.name}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            {p.pct.toLocaleString('nb-NO')} % av stemmene
                                            {faded && (
                                                <span className="ml-1 font-bold text-amber-600">
                                                    · under 4 %
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                    <motion.span
                                        key={`${p.id}-${seatCount}`}
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                                        className="flex-shrink-0 text-right"
                                    >
                                        <span className="block text-sm font-extrabold text-slate-900">
                                            {seatCount}
                                        </span>
                                        <span className="text-[10px] text-slate-400">mandater</span>
                                    </motion.span>
                                    <span
                                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                                            selected
                                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                                : 'border-slate-300 text-transparent'
                                        }`}
                                    >
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {coalition.size > 0 && (
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                            <RotateCcw className="w-4 h-4" /> Start på nytt
                        </button>
                    )}
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-indigo-50 border-t border-indigo-100 px-5 py-3 text-sm text-indigo-900">
                <Vote className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                <p>
                    Stemmene blir ikke til makt rett fram: sperregrensen siler ut de minste, og fordi
                    ingen får rent flertall alene, må partiene bygge koalisjoner for å danne regjering.
                    Det er derfor norsk politikk handler så mye om samarbeid.
                </p>
            </div>
        </div>
    );
};
