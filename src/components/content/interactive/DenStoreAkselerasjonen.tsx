import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Factory, Building2, Cloud, TrendingUp } from 'lucide-react';

interface Curve {
    id: string;
    label: string;
    color: string;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    points: { year: number; value: number }[];
    formatValue: (v: number) => string;
}

const CURVES: Curve[] = [
    {
        id: 'energy',
        label: 'Energi per person',
        color: '#f59e0b',
        Icon: Zap,
        points: [
            { year: 1700, value: 20 },
            { year: 1750, value: 21 },
            { year: 1800, value: 28 },
            { year: 1830, value: 35 },
            { year: 1850, value: 45 },
            { year: 1870, value: 60 },
            { year: 1900, value: 85 },
        ],
        formatValue: (v) => `${Math.round(v)} GJ/år`,
    },
    {
        id: 'coal',
        label: 'Britisk kullproduksjon',
        color: '#94a3b8',
        Icon: Factory,
        points: [
            { year: 1700, value: 3 },
            { year: 1750, value: 5 },
            { year: 1800, value: 11 },
            { year: 1830, value: 22 },
            { year: 1850, value: 60 },
            { year: 1870, value: 120 },
            { year: 1900, value: 225 },
        ],
        formatValue: (v) => `${Math.round(v)} mill t`,
    },
    {
        id: 'urban',
        label: 'Britisk bybefolkning',
        color: '#6366f1',
        Icon: Building2,
        points: [
            { year: 1700, value: 17 },
            { year: 1750, value: 18 },
            { year: 1800, value: 28 },
            { year: 1830, value: 34 },
            { year: 1850, value: 40 },
            { year: 1870, value: 55 },
            { year: 1900, value: 67 },
        ],
        formatValue: (v) => `${Math.round(v)} %`,
    },
    {
        id: 'co2',
        label: 'CO₂ i atmosfæren',
        color: '#ef4444',
        Icon: Cloud,
        points: [
            { year: 1700, value: 277 },
            { year: 1750, value: 278 },
            { year: 1800, value: 283 },
            { year: 1830, value: 285 },
            { year: 1850, value: 285 },
            { year: 1870, value: 289 },
            { year: 1900, value: 296 },
        ],
        formatValue: (v) => `${v.toFixed(1)} ppm`,
    },
    {
        id: 'gdp',
        label: 'BNP per person (verden)',
        color: '#10b981',
        Icon: TrendingUp,
        points: [
            { year: 1700, value: 615 },
            { year: 1750, value: 625 },
            { year: 1800, value: 666 },
            { year: 1830, value: 700 },
            { year: 1850, value: 800 },
            { year: 1870, value: 1000 },
            { year: 1900, value: 1262 },
        ],
        formatValue: (v) => `$${Math.round(v).toLocaleString('no-NO')}`,
    },
];

const MARKERS: { year: number; label: string }[] = [
    { year: 1769, label: 'Watts patent' },
    { year: 1825, label: 'Første jernbane' },
    { year: 1840, label: '50 % av verdensindustrien' },
];

const interpolate = (points: { year: number; value: number }[], year: number): number => {
    if (year <= points[0].year) return points[0].value;
    if (year >= points[points.length - 1].year) return points[points.length - 1].value;
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (year >= a.year && year <= b.year) {
            const t = (year - a.year) / (b.year - a.year);
            return a.value + (b.value - a.value) * t;
        }
    }
    return points[points.length - 1].value;
};

const START_YEAR = 1700;
const END_YEAR = 1900;
const W = 1000;
const H = 360;
const PAD_L = 50;
const PAD_R = 30;
const PAD_T = 40;
const PAD_B = 50;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

const xAt = (year: number) =>
    PAD_L + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * CHART_W;
const yAt = (norm: number) => PAD_T + (1 - norm) * CHART_H;

const normalize = (curve: Curve, value: number): number => {
    const v0 = curve.points[0].value;
    const vEnd = curve.points[curve.points.length - 1].value;
    const range = vEnd - v0;
    if (range === 0) return 0;
    return (value - v0) / range;
};

const PRECOMPUTED_PATHS: Record<string, string> = (() => {
    const samples = 200;
    const result: Record<string, string> = {};
    CURVES.forEach((curve) => {
        const segs: string[] = [];
        for (let i = 0; i <= samples; i++) {
            const year = START_YEAR + (i / samples) * (END_YEAR - START_YEAR);
            const v = interpolate(curve.points, year);
            const norm = normalize(curve, v);
            const x = xAt(year);
            const y = yAt(norm);
            segs.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        result[curve.id] = segs.join(' ');
    });
    return result;
})();

const narrationFor = (year: number): { title: string; text: string } => {
    if (year < 1750) {
        return {
            title: 'Verden står stille',
            text: 'Slik har det vært i tusenvis av år. Energi kommer fra muskler, vind og vann. De fleste mennesker bor på landet og lever omtrent som besteforeldrene sine.',
        };
    }
    if (year < 1810) {
        return {
            title: 'Noe rører seg',
            text: 'Watt har gjort dampmaskinen kraftig, og de første fabrikkene åpner i Lancashire. Endringene er knapt synlige i tallene ennå, men kursen er satt.',
        };
    }
    if (year < 1870) {
        return {
            title: 'Linjene knekker oppover',
            text: 'Jernbaner krysser øyriket, kullgruvene leverer mer enn noen gang, og byene vokser raskere enn historikere har sett før. Hockey-stick-kurven blir født.',
        };
    }
    return {
        title: 'Verden er ugjenkjennelig',
        text: 'Alle fem kurvene skyter fart samtidig. Et menneske født i 1700 ville ikke gjenkjent verden barnebarna lever i. Vi ser også de første sporene av CO₂-økningen som driver klimakrisen i dag.',
    };
};

interface Props {
    initialYear?: number;
}

export const DenStoreAkselerasjonen = ({ initialYear = 1780 }: Props) => {
    const [year, setYear] = useState(initialYear);
    const cursorX = xAt(year);
    const narration = narrationFor(year);

    return (
        <figure className="my-10 w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-slate-100 border-b border-slate-700">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80 font-semibold mb-1">
                    Interaktiv visualisering
                </p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                    Den store akselerasjonen
                </h3>
                <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
                    Etter 10 000 år med flate kurver knekker fem nøkkeltall oppover på samme tid.
                    Dra slideren og se det skje.
                </p>
            </header>

            <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full h-auto block"
                    role="img"
                    aria-labelledby="aks-title aks-desc"
                >
                    <title id="aks-title">Fem historiske kurver fra 1700 til 1900</title>
                    <desc id="aks-desc">{`I år ${year} viser visualiseringen hvordan energi, kull, bybefolkning, CO₂ og BNP utvikler seg.`}</desc>

                    <defs>
                        <clipPath id="aks-progress-clip">
                            <rect
                                x={PAD_L}
                                y={0}
                                width={Math.max(0, cursorX - PAD_L)}
                                height={H}
                            />
                        </clipPath>
                        <filter
                            id="aks-glow"
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                        >
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {[1700, 1750, 1800, 1850, 1900].map((y) => (
                        <g key={y}>
                            <line
                                x1={xAt(y)}
                                y1={PAD_T}
                                x2={xAt(y)}
                                y2={PAD_T + CHART_H}
                                stroke="rgba(148, 163, 184, 0.15)"
                                strokeWidth="1"
                                strokeDasharray="2 4"
                            />
                            <text
                                x={xAt(y)}
                                y={H - 18}
                                textAnchor="middle"
                                fontSize="13"
                                fill="rgba(148, 163, 184, 0.7)"
                                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                            >
                                {y}
                            </text>
                        </g>
                    ))}

                    <line
                        x1={PAD_L}
                        y1={PAD_T + CHART_H}
                        x2={PAD_L + CHART_W}
                        y2={PAD_T + CHART_H}
                        stroke="rgba(148, 163, 184, 0.3)"
                        strokeWidth="1"
                    />

                    {CURVES.map((curve) => (
                        <path
                            key={`ghost-${curve.id}`}
                            d={PRECOMPUTED_PATHS[curve.id]}
                            fill="none"
                            stroke={curve.color}
                            strokeWidth="2"
                            strokeOpacity="0.18"
                            strokeDasharray="2 5"
                        />
                    ))}

                    <g clipPath="url(#aks-progress-clip)" filter="url(#aks-glow)">
                        {CURVES.map((curve) => (
                            <path
                                key={`active-${curve.id}`}
                                d={PRECOMPUTED_PATHS[curve.id]}
                                fill="none"
                                stroke={curve.color}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                    </g>

                    {CURVES.map((curve) => {
                        const v = interpolate(curve.points, year);
                        const norm = normalize(curve, v);
                        return (
                            <circle
                                key={`dot-${curve.id}`}
                                cx={cursorX}
                                cy={yAt(norm)}
                                r="5"
                                fill={curve.color}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })}

                    {MARKERS.map((m) => {
                        const active = year >= m.year;
                        return (
                            <g key={m.year}>
                                <line
                                    x1={xAt(m.year)}
                                    y1={PAD_T}
                                    x2={xAt(m.year)}
                                    y2={PAD_T + CHART_H}
                                    stroke="rgba(251, 191, 36, 0.35)"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                                {active && (
                                    <motion.circle
                                        cx={xAt(m.year)}
                                        cy={PAD_T - 8}
                                        r="5"
                                        fill="#fbbf24"
                                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}
                                <text
                                    x={xAt(m.year)}
                                    y={PAD_T - 18}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill={active ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)'}
                                    fontWeight="700"
                                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                >
                                    {m.year}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={cursorX}
                        y1={PAD_T - 4}
                        x2={cursorX}
                        y2={PAD_T + CHART_H}
                        stroke="white"
                        strokeWidth="1.5"
                        strokeOpacity="0.85"
                    />
                    <rect
                        x={cursorX - 32}
                        y={PAD_T + CHART_H + 8}
                        width="64"
                        height="22"
                        rx="11"
                        fill="white"
                    />
                    <text
                        x={cursorX}
                        y={PAD_T + CHART_H + 23}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="700"
                        fill="#0f172a"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    >
                        {year}
                    </text>
                </svg>
            </div>

            <div className="bg-slate-50 px-4 py-4 border-y border-slate-200">
                <div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
                    aria-live="polite"
                >
                    {CURVES.map((curve) => {
                        const v = interpolate(curve.points, year);
                        const v0 = curve.points[0].value;
                        const pctChange = v0 === 0 ? 0 : (v / v0 - 1) * 100;
                        const Icon = curve.Icon;
                        return (
                            <div
                                key={curve.id}
                                className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 shadow-sm flex flex-col gap-1"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Icon
                                        className="w-3.5 h-3.5 shrink-0"
                                        style={{ color: curve.color }}
                                    />
                                    <span className="text-[11px] font-semibold text-slate-600 leading-tight">
                                        {curve.label}
                                    </span>
                                </div>
                                <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                                    {curve.formatValue(v)}
                                </div>
                                <div
                                    className={`text-[11px] font-semibold ${
                                        pctChange > 0 ? 'text-emerald-600' : 'text-slate-500'
                                    }`}
                                >
                                    {pctChange >= 0 ? '+' : ''}
                                    {Math.round(pctChange).toLocaleString('no-NO')}% siden 1700
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 py-5 bg-white">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">{START_YEAR}</span>
                    <span className="text-xs font-mono text-slate-400">{END_YEAR}</span>
                </div>
                <input
                    type="range"
                    min={START_YEAR}
                    max={END_YEAR}
                    step={1}
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    aria-label="Velg år mellom 1700 og 1900"
                    aria-valuenow={year}
                    aria-valuemin={START_YEAR}
                    aria-valuemax={END_YEAR}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 mr-1">Hopp til:</span>
                    {[1700, 1769, 1825, 1900].map((y) => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => setYear(y)}
                            className={`px-3 py-1 text-xs font-bold font-mono rounded-md border transition-colors ${
                                year === y
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                            aria-label={`Sett år til ${y}`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>

            <figcaption className="bg-gradient-to-br from-amber-50 via-white to-slate-50 px-6 py-5 border-t border-slate-200">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={narration.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-1">
                            År {year}
                        </p>
                        <h4 className="text-lg font-black text-slate-900 mb-1">
                            {narration.title}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {narration.text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </figcaption>
        </figure>
    );
};
