import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

// Signaturkomponent for "Slik undersøker vi samfunnet".
// Lyspære: tall lyver ikke, men samme datasett kan rope eller hviske alt etter
// hvordan du tegner grafen. Eleven vrir på tre brytere - y-akse, utsnitt og
// enhet - og ser den samme statistikken bli dramatisk eller rolig. En kritisk
// leser sjekker alltid aksen og hvilket tidsrom som vises.

interface Point {
    year: number;
    pct: number; // ungdomsarbeidsledighet i prosent (illustrasjonstall)
}

// Illustrasjonsdata - samme tall i alle visninger.
const DATA: Point[] = [
    { year: 2015, pct: 9.8 },
    { year: 2016, pct: 10.1 },
    { year: 2017, pct: 9.5 },
    { year: 2018, pct: 9.2 },
    { year: 2019, pct: 9.0 },
    { year: 2020, pct: 11.8 },
    { year: 2021, pct: 9.6 },
    { year: 2022, pct: 8.8 },
    { year: 2023, pct: 8.9 },
    { year: 2024, pct: 9.1 },
    { year: 2025, pct: 9.0 },
];

const YOUTH_FORCE = 3600; // personer per prosentpoeng (illustrasjon)
const toAbsolute = (pct: number) => Math.round(pct * YOUTH_FORCE);

type Window = 'full' | 'korona';
type Unit = 'pct' | 'absolute';

// Plot-geometri
const W = 460;
const H = 250;
const PAD_L = 64;
const PAD_R = 18;
const PAD_T = 24;
const PAD_B = 36;

export const StatistikkVri: React.FC = () => {
    const [truncated, setTruncated] = useState(false);
    const [windowSel, setWindowSel] = useState<Window>('full');
    const [unit, setUnit] = useState<Unit>('pct');

    const visible = useMemo(
        () => (windowSel === 'korona' ? DATA.filter((d) => d.year >= 2019 && d.year <= 2020) : DATA),
        [windowSel]
    );

    const values = visible.map((d) => (unit === 'pct' ? d.pct : toAbsolute(d.pct)));
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    // Y-domene: ærlig = fra null. Avkuttet = zoomet rundt dataene.
    const yMin = truncated ? dataMin - (dataMax - dataMin) * 0.25 - 0.01 : 0;
    const yMax = truncated ? dataMax + (dataMax - dataMin) * 0.25 + 0.01 : dataMax * 1.12;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const xOf = (i: number) =>
        PAD_L + (visible.length === 1 ? plotW / 2 : (i / (visible.length - 1)) * plotW);
    const yOf = (v: number) => PAD_T + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

    const points = visible.map((d, i) => ({
        x: xOf(i),
        y: yOf(unit === 'pct' ? d.pct : toAbsolute(d.pct)),
        year: d.year,
    }));
    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

    // Y-akse-merker
    const ticks = useMemo(() => {
        const out: number[] = [];
        const steps = 4;
        for (let i = 0; i <= steps; i++) out.push(yMin + ((yMax - yMin) / steps) * i);
        return out;
    }, [yMin, yMax]);

    const fmt = (v: number) =>
        unit === 'pct' ? `${v.toFixed(1)} %` : Math.round(v).toLocaleString('nb-NO');

    // Villedingsscore
    const score = (truncated ? 35 : 0) + (windowSel === 'korona' ? 45 : 0) + (unit === 'absolute' ? 20 : 0);

    const headline =
        windowSel === 'korona' && truncated
            ? 'ALARM: Ungdomsledigheten eksploderer!'
            : windowSel === 'korona'
              ? 'Kraftig hopp i ungdomsledigheten'
              : truncated
                ? 'Ungdomsledigheten stiger merkbart'
                : 'Stabilt: ungdomsledigheten ligger rundt 9 prosent';

    const pctMax = Math.max(...visible.map((d) => d.pct));
    const subline =
        unit === 'absolute'
            ? `Over ${toAbsolute(pctMax).toLocaleString('nb-NO')} unge står uten jobb`
            : windowSel === 'korona'
              ? 'Tallene steg fra 9,0 til 11,8 prosent'
              : 'Tallene har holdt seg rundt 9 prosent i ti år';

    const warnings: string[] = [];
    if (truncated) warnings.push('Y-aksen starter ikke på null. Da ser små endringer enorme ut.');
    if (windowSel === 'korona')
        warnings.push('Bare korona-året vises. Et normalår ville gitt et helt annet bilde.');
    if (unit === 'absolute')
        warnings.push('Store tall i antall høres mer dramatisk ut enn samme tall i prosent.');

    const honest = score === 0;

    const meterColor = score >= 60 ? '#dc2626' : score >= 30 ? '#d97706' : '#16a34a';

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-lg">Samme tall - ulik historie</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Datasettet er det samme hele tiden. Vri på bryterne og se hvordan en graf kan få
                    de samme tallene til å rope eller hviske.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                {/* Venstre: avisoppslag + graf */}
                <div>
                    {/* Auto-generert "avisoppslag" */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Dagens oppslag
                        </span>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={headline}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <p
                                    className="font-display font-extrabold leading-tight text-slate-900"
                                    style={{ fontSize: score >= 45 ? '1.4rem' : '1.15rem' }}
                                >
                                    {headline}
                                </p>
                                <p className="text-sm text-slate-600 mt-0.5">{subline}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Graf */}
                    <div className="rounded-xl border border-slate-200 bg-white p-2">
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
                            aria-label="Graf over ungdomsarbeidsledighet">
                            {/* Y-akse-merker og gridlinjer */}
                            {ticks.map((t, i) => {
                                const y = yOf(t);
                                return (
                                    <g key={i}>
                                        <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                                            stroke="#e2e8f0" strokeWidth={1} />
                                        <text x={PAD_L - 8} y={y + 4} textAnchor="end"
                                            fontSize={11} fill="#64748b">
                                            {fmt(t)}
                                        </text>
                                    </g>
                                );
                            })}
                            {/* Nulllinje-markør hvis avkuttet */}
                            {truncated && (
                                <text x={PAD_L} y={H - 6} fontSize={10} fill="#dc2626">
                                    ⚠ aksen starter ikke på 0
                                </text>
                            )}
                            {/* X-akse-etiketter */}
                            {points.map((p) => (
                                <text key={p.year} x={p.x} y={H - PAD_B + 18} textAnchor="middle"
                                    fontSize={11} fill="#64748b">
                                    {p.year}
                                </text>
                            ))}
                            {/* Linje */}
                            <motion.polyline
                                points={polyline}
                                fill="none"
                                stroke={score >= 45 ? '#dc2626' : '#4f46e5'}
                                strokeWidth={3}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                initial={false}
                                animate={{ stroke: score >= 45 ? '#dc2626' : '#4f46e5' }}
                            />
                            {/* Punkter */}
                            {points.map((p) => (
                                <motion.circle
                                    key={p.year}
                                    cx={p.x}
                                    r={4.5}
                                    fill="#fff"
                                    stroke={score >= 45 ? '#dc2626' : '#4f46e5'}
                                    strokeWidth={2.5}
                                    initial={false}
                                    animate={{ cy: p.y }}
                                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                                />
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Høyre: bryterne + ærlighetsmåler */}
                <div className="flex flex-col gap-3">
                    <Toggle
                        label="Y-akse"
                        optionA={{ id: 'full', text: 'Start på 0' }}
                        optionB={{ id: 'trunc', text: 'Zoom inn' }}
                        value={truncated ? 'trunc' : 'full'}
                        onChange={(v) => setTruncated(v === 'trunc')}
                    />
                    <Toggle
                        label="Tidsrom"
                        optionA={{ id: 'full', text: 'Hele 2015-2025' }}
                        optionB={{ id: 'korona', text: 'Bare 2019-2020' }}
                        value={windowSel}
                        onChange={(v) => setWindowSel(v as Window)}
                    />
                    <Toggle
                        label="Enhet"
                        optionA={{ id: 'pct', text: 'Prosent' }}
                        optionB={{ id: 'absolute', text: 'Antall personer' }}
                        value={unit}
                        onChange={(v) => setUnit(v as Unit)}
                    />

                    {/* Ærlighetsmåler */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mt-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">Hvor villedende?</span>
                            <span className="text-xs font-bold" style={{ color: meterColor }}>
                                {honest ? 'Ærlig' : score >= 60 ? 'Sterkt villedende' : 'Litt villedende'}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: meterColor }}
                                animate={{ width: `${score}%` }}
                                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                            />
                        </div>

                        <div className="mt-3 space-y-1.5">
                            <AnimatePresence initial={false}>
                                {honest ? (
                                    <motion.div
                                        key="honest"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start gap-2 text-sm text-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>
                                            Ærlig framstilling: hele perioden, y-akse fra null,
                                            tydelig enhet.
                                        </span>
                                    </motion.div>
                                ) : (
                                    warnings.map((w) => (
                                        <motion.div
                                            key={w}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 text-sm text-amber-700"
                                        >
                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{w}</span>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-indigo-50 border-t border-indigo-100 px-5 py-3 text-sm text-indigo-900">
                <Eye className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                <p>
                    En kritisk leser spør alltid: Starter y-aksen på null? Hvilket tidsrom vises? Er
                    det prosent eller antall? Tallene er de samme - det er innpakningen som lurer
                    deg.
                </p>
            </div>
        </div>
    );
};

// Liten to-valgs-bryter.
function Toggle({
    label,
    optionA,
    optionB,
    value,
    onChange,
}: {
    label: string;
    optionA: { id: string; text: string };
    optionB: { id: string; text: string };
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <div className="mt-1 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100">
                {[optionA, optionB].map((opt) => {
                    const active = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId={`toggle-${label}`}
                                    className="absolute inset-0 rounded-lg bg-indigo-600"
                                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                />
                            )}
                            <span className="relative z-10">{opt.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
