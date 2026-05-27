import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Users,
    DollarSign,
    AlertOctagon,
    Scale,
    TrendingUp,
    Sparkles,
} from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';
import type { KeyMetrics, Phase, ProductionStage } from '../../types';
import { NarrativeFeed } from '../../components/NarrativeFeed';
import { FlowParticles } from '../../components/FlowParticles';
import { usePulsesForTarget, type PulseTarget } from '../../store/pulseStore';

const PHASE_STYLES: Record<Phase, { label: string; bg: string; ring: string; text: string; emoji: string }> = {
    expansion: { label: 'Stabil ekspansjon', bg: 'bg-emerald-50', ring: 'ring-emerald-300', text: 'text-emerald-800', emoji: '🌱' },
    boom: { label: 'Kunstig boom', bg: 'bg-amber-50', ring: 'ring-amber-400', text: 'text-amber-900', emoji: '🔥' },
    bust: { label: 'Krisen er her', bg: 'bg-rose-50', ring: 'ring-rose-400', text: 'text-rose-900', emoji: '⚡' },
    recovery: { label: 'Restitusjon', bg: 'bg-sky-50', ring: 'ring-sky-300', text: 'text-sky-900', emoji: '🛠️' },
};

const STAGE_COLOR_LIGHT = ['#a7f3d0', '#bfdbfe', '#fde68a', '#fecaca', '#ddd6fe'];
const STAGE_COLOR_DARK = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

export function LiveView() {
    const sim = useWorldStore((s) => s.sim);
    const controls = useWorldStore((s) => s.controls);
    const history = sim.history;
    const latest = history[history.length - 1];
    const phase = PHASE_STYLES[sim.phase];
    const effectivePolicyRate = controls.freeMarket ? sim.loanMarket.clearingRate : controls.policyRate;
    const rateGap = sim.loanMarket.clearingRate - effectivePolicyRate;

    return (
        <div className="flex flex-col gap-3 lg:gap-4 p-4 lg:p-6 overflow-y-auto h-full">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 tracking-tight">
                        Live
                    </h1>
                    <p className="text-sm lg:text-base text-slate-600">
                        Dra i kontrollene til høyre — se konsekvensen i samme bilde.
                    </p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sim.phase}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm ring-2 shadow-md bg-white ${phase.text} ${phase.ring}`}
                    >
                        <PulseHalo target="phase" />
                        <span className="text-lg">{phase.emoji}</span>
                        {phase.label}
                    </motion.div>
                </AnimatePresence>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
                <KPI icon={Activity} label="Inflasjon" value={latest?.inflation ?? 0} suffix=" %" decimals={1} tone={kpiTone(latest?.inflation, 6, 0, true)} target="inflation" />
                <KPI icon={Users} label="Ledighet" value={latest?.unemployment ?? 0} suffix=" %" decimals={1} tone={kpiTone(latest?.unemployment, 10, 5, true)} target="unemployment" />
                <KPI icon={DollarSign} label="BNP" value={latest?.bnp ?? 0} decimals={0} tone="indigo" target="bnp" />
                <KPI icon={AlertOctagon} label="Feilinvestering" value={latest?.malinvestment ?? 0} suffix=" / 60" decimals={0} tone={kpiTone(latest?.malinvestment, 40, 20, true)} target="malinvestment" />
                <KPI icon={Scale} label="Ulikhet" value={latest?.gini ?? 0} decimals={2} tone={kpiTone(latest?.gini, 0.5, 0.35, true)} target="gini" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
                <ProductionScene stages={sim.stages} rateGap={rateGap} phase={sim.phase} />
                <RateCard naturalRate={sim.loanMarket.clearingRate} policyRate={effectivePolicyRate} freeMarket={controls.freeMarket} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SparkCard title="Rente-gap" tone="indigo" history={history} keyName="naturalRate" secondaryKey="policyRate" />
                <SparkCard title="Inflasjon" tone="amber" history={history} keyName="inflation" />
                <SparkCard title="Ledighet" tone="rose" history={history} keyName="unemployment" />
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-indigo-500" />
                    <h2 className="text-xs uppercase tracking-wider font-bold text-slate-600">
                        Hva skjer akkurat nå
                    </h2>
                </div>
                <NarrativeFeed />
            </div>
        </div>
    );
}

function kpiTone(value: number | undefined, danger: number, warn: number, higherIsWorse: boolean): Tone {
    if (value === undefined) return 'slate';
    if (higherIsWorse) {
        if (value > danger) return 'rose';
        if (value > warn) return 'amber';
        return 'emerald';
    }
    return 'indigo';
}

type Tone = 'slate' | 'indigo' | 'amber' | 'rose' | 'sky' | 'emerald';

const TONE_RING: Record<Tone, string> = {
    slate: 'ring-slate-200',
    indigo: 'ring-indigo-300',
    amber: 'ring-amber-300',
    rose: 'ring-rose-300',
    sky: 'ring-sky-300',
    emerald: 'ring-emerald-300',
};
const TONE_ICON_BG: Record<Tone, string> = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-600',
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-700',
};
const TONE_VALUE: Record<Tone, string> = {
    slate: 'text-slate-900',
    indigo: 'text-indigo-900',
    amber: 'text-amber-900',
    rose: 'text-rose-900',
    sky: 'text-sky-900',
    emerald: 'text-emerald-900',
};

function KPI({
    icon: Icon,
    label,
    value,
    suffix = '',
    decimals = 0,
    tone = 'slate',
    target,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: number;
    suffix?: string;
    decimals?: number;
    tone?: Tone;
    target: PulseTarget;
}) {
    const display = useCountUp(value, decimals);
    return (
        <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`relative bg-white rounded-xl p-2.5 lg:p-3 ring-1 ${TONE_RING[tone]} border border-white shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
        >
            <PulseHalo target={target} />
            <div className="flex items-center justify-between mb-1.5">
                <span className={`flex items-center justify-center w-6 h-6 rounded-lg ${TONE_ICON_BG[tone]}`}>
                    <Icon size={12} />
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">
                    {label}
                </span>
            </div>
            <div className={`text-xl lg:text-2xl font-display font-bold tabular-nums ${TONE_VALUE[tone]}`}>
                {display}
                <span className="text-sm font-bold text-slate-400">{suffix}</span>
            </div>
        </motion.div>
    );
}

function useCountUp(target: number, decimals: number): string {
    const [shown, setShown] = useState(target);
    const shownRef = useRef(target);
    useEffect(() => {
        const start = shownRef.current;
        const startTime = performance.now();
        const duration = 250;
        let raf = 0;
        const tick = (t: number) => {
            const p = Math.min(1, (t - startTime) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = start + (target - start) * eased;
            shownRef.current = v;
            setShown(v);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target]);
    return shown.toLocaleString('nb-NO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function PulseHalo({ target }: { target: PulseTarget }) {
    const pulses = usePulsesForTarget(target);
    return (
        <AnimatePresence>
            {pulses.map((p) => (
                <motion.span
                    key={p.id}
                    initial={{ opacity: 0.6, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ boxShadow: `0 0 0 3px ${p.color}`, background: `${p.color}10` }}
                />
            ))}
        </AnimatePresence>
    );
}

function ProductionScene({ stages, rateGap, phase }: { stages: ProductionStage[]; rateGap: number; phase: Phase }) {
    const ordered = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const maxLab = Math.max(1, ...ordered.map((s) => s.laborers));
    const distortion = Math.abs(rateGap);

    const SCENE_W = 720;
    const SCENE_H = 230;
    const STAGE_W = 110;
    const STAGE_GAP = (SCENE_W - STAGE_W * ordered.length) / (ordered.length + 1);

    const positions = useMemo(
        () =>
            ordered.map((_, i) => ({
                x: STAGE_GAP + STAGE_W / 2 + i * (STAGE_W + STAGE_GAP),
                y: SCENE_H / 2,
            })),
        [ordered, STAGE_GAP]
    );

    const stagePulseTargets: PulseTarget[] = [
        'stage-consumer',
        'stage-distribution',
        'stage-machines',
        'stage-intermediate',
        'stage-raw',
    ];

    return (
        <div className="relative bg-gradient-to-br from-white to-amber-50/40 border border-amber-200/50 rounded-2xl p-3 shadow-sm overflow-hidden">
            <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600">
                    Produksjonsledd
                </h3>
                <span className="text-[10px] text-slate-500">
                    Forbruker ← → Råvarer
                </span>
            </div>
            <div className="relative" style={{ width: '100%', aspectRatio: `${SCENE_W} / ${SCENE_H}` }}>
                <svg
                    viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
                    className="absolute inset-0 w-full h-full"
                    aria-label="Produksjonsledd"
                >
                    {/* connectors */}
                    {positions.slice(0, -1).map((pos, i) => {
                        const next = positions[i + 1];
                        return (
                            <line
                                key={`conn-${i}`}
                                x1={pos.x}
                                y1={pos.y}
                                x2={next.x}
                                y2={next.y}
                                stroke="#fcd34d"
                                strokeWidth="2"
                                strokeDasharray="2 4"
                                opacity={0.5}
                            />
                        );
                    })}
                    {ordered.map((stage, i) => {
                        const pos = positions[i];
                        const height = Math.max(28, (stage.laborers / maxLab) * 110);
                        const isLate = stage.order >= 4;
                        const wiggle = phase === 'boom' && isLate ? distortion * 0.4 : 0;
                        return (
                            <g key={stage.id} transform={`translate(${pos.x - STAGE_W / 2}, ${pos.y - height / 2})`}>
                                <StageRect
                                    width={STAGE_W}
                                    height={height}
                                    lightColor={STAGE_COLOR_LIGHT[stage.id]}
                                    darkColor={STAGE_COLOR_DARK[stage.id]}
                                    wiggle={wiggle}
                                    pulseTarget={stagePulseTargets[stage.id]}
                                />
                                <text
                                    x={STAGE_W / 2}
                                    y={height + 18}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="700"
                                    fill="#334155"
                                >
                                    {stage.name.split(' ')[0]}
                                </text>
                                <text
                                    x={STAGE_W / 2}
                                    y={height + 31}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="#64748b"
                                >
                                    {stage.laborers} arb · {stage.price.toFixed(2)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                <FlowParticles
                    width={SCENE_W}
                    height={SCENE_H}
                    stagePositions={positions}
                    intensity={1 + distortion * 0.2}
                />
            </div>
        </div>
    );
}

function StageRect({
    width,
    height,
    lightColor,
    darkColor,
    wiggle,
    pulseTarget,
}: {
    width: number;
    height: number;
    lightColor: string;
    darkColor: string;
    wiggle: number;
    pulseTarget: PulseTarget;
}) {
    const pulses = usePulsesForTarget(pulseTarget);
    const stagesPulses = usePulsesForTarget('stages');
    const activePulses = [...pulses, ...stagesPulses];
    return (
        <g>
            <defs>
                <linearGradient id={`grad-${pulseTarget}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lightColor} />
                    <stop offset="100%" stopColor={darkColor} />
                </linearGradient>
            </defs>
            <motion.rect
                width={width}
                height={height}
                rx={10}
                fill={`url(#grad-${pulseTarget})`}
                animate={wiggle > 0 ? { x: [0, -wiggle, wiggle, 0] } : { x: 0 }}
                transition={{ duration: 0.5, repeat: wiggle > 0 ? Infinity : 0 }}
            />
            {activePulses.map((p) => (
                <motion.rect
                    key={p.id}
                    width={width}
                    height={height}
                    rx={10}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={3}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                />
            ))}
        </g>
    );
}

function RateCard({
    naturalRate,
    policyRate,
    freeMarket,
}: {
    naturalRate: number;
    policyRate: number;
    freeMarket: boolean;
}) {
    const gap = naturalRate - policyRate;
    const mode = Math.abs(gap) < 0.5 ? 'balance' : gap > 0 ? 'low' : 'high';
    const config = {
        balance: { textClass: 'text-emerald-800', label: 'I balanse', desc: 'Renten matcher folks tålmodighet.' },
        low: { textClass: 'text-rose-800', label: 'Renten er for lav', desc: 'Lange ledd vokser over evne.' },
        high: { textClass: 'text-sky-800', label: 'Renten er stram', desc: 'Lite investering, sakte vekst.' },
    }[mode];

    return (
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3 shadow-sm relative overflow-hidden">
            <PulseHalo target="rate" />
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-indigo-500" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600">
                    Rente
                </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                    <div className="text-[9px] uppercase tracking-wider font-bold text-emerald-700">
                        Naturlig
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-emerald-900">
                        {naturalRate.toFixed(2)}%
                    </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2">
                    <div className="text-[9px] uppercase tracking-wider font-bold text-indigo-700">
                        {freeMarket ? 'Marked' : 'Styring'}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-indigo-900">
                        {policyRate.toFixed(2)}%
                    </div>
                </div>
            </div>
            <div className={`text-[11px] leading-snug font-semibold ${config.textClass}`}>
                {config.label}
            </div>
            <p className="text-[10px] text-slate-600 leading-snug mt-0.5">{config.desc}</p>
            <div className="mt-2 text-[10px] text-slate-500">
                Gap: <span className="font-mono tabular-nums font-bold text-slate-700">
                    {gap > 0 ? '+' : ''}{gap.toFixed(2)} pp
                </span>
            </div>
        </div>
    );
}

function SparkCard({
    title,
    tone,
    history,
    keyName,
    secondaryKey,
}: {
    title: string;
    tone: 'indigo' | 'amber' | 'rose';
    history: KeyMetrics[];
    keyName: keyof KeyMetrics;
    secondaryKey?: keyof KeyMetrics;
}) {
    const values = history.map((h) => h[keyName] as number);
    const secondary = secondaryKey ? history.map((h) => h[secondaryKey] as number) : null;
    const min = Math.min(0, ...values, ...(secondary ?? []));
    const max = Math.max(...values, ...(secondary ?? []), 1);
    const range = max - min || 1;
    const W = 200;
    const H = 60;
    const points = (arr: number[]) =>
        arr.length === 0
            ? ''
            : arr
                  .map((v, i) => {
                      const x = (i / Math.max(1, arr.length - 1)) * W;
                      const y = H - ((v - min) / range) * H;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

    const stroke = { indigo: '#6366f1', amber: '#f59e0b', rose: '#f43f5e' }[tone];
    const fill = { indigo: 'rgba(99,102,241,0.12)', amber: 'rgba(245,158,11,0.18)', rose: 'rgba(244,63,94,0.15)' }[tone];
    const latest = values[values.length - 1];

    return (
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3 shadow-sm">
            <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600">{title}</h3>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {latest !== undefined ? latest.toFixed(1) : '–'}
                </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
                {values.length > 1 && (
                    <>
                        <polyline
                            fill={fill}
                            stroke="none"
                            points={`0,${H} ${points(values)} ${W},${H}`}
                        />
                        <polyline
                            fill="none"
                            stroke={stroke}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={points(values)}
                        />
                    </>
                )}
                {secondary && secondary.length > 1 && (
                    <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.6"
                        strokeDasharray="3 3"
                        strokeLinejoin="round"
                        points={points(secondary)}
                    />
                )}
            </svg>
        </div>
    );
}
