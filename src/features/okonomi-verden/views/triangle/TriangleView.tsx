import { motion } from 'framer-motion';
import { Triangle as TriangleIcon, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';
import type { ProductionStage } from '../../types';

const STAGE_COLOR_LIGHT = ['#a7f3d0', '#bfdbfe', '#fde68a', '#fecaca', '#ddd6fe'];
const STAGE_COLOR_DARK = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

export function TriangleView() {
    const stages = useWorldStore((s) => s.sim.stages);
    const naturalRate = useWorldStore((s) => s.sim.loanMarket.clearingRate);
    const policyRate = useWorldStore((s) => s.controls.policyRate);
    const freeMarket = useWorldStore((s) => s.controls.freeMarket);
    const phase = useWorldStore((s) => s.sim.phase);

    const effectivePolicy = freeMarket ? naturalRate : policyRate;
    const gap = naturalRate - effectivePolicy;
    const distortion = Math.abs(gap);

    let mode: 'natural' | 'low' | 'high';
    if (Math.abs(gap) < 0.5) mode = 'natural';
    else if (gap > 0) mode = 'low';
    else mode = 'high';

    const modeConfig = {
        natural: {
            icon: CheckCircle,
            title: 'Naturlig likevekt',
            text: 'Rente og sparing er i takt. Hvert produksjonsledd får akkurat de ressursene det trenger. Bærekraftig vekst.',
            color: 'emerald',
            bg: 'bg-emerald-50',
            border: 'border-emerald-300',
            iconColor: 'text-emerald-600',
            titleColor: 'text-emerald-900',
        },
        low: {
            icon: AlertTriangle,
            title: 'Kunstig lav rente',
            text: 'Ressurser flommer inn i lange, kapitaltunge prosjekter. Forbruket lider. En boble bygger seg opp - hør tikkingen.',
            color: 'rose',
            bg: 'bg-rose-50',
            border: 'border-rose-300',
            iconColor: 'text-rose-600',
            titleColor: 'text-rose-900',
        },
        high: {
            icon: TrendingDown,
            title: 'Stram rente',
            text: 'Penger holdes nær forbrukeren. Langsiktige investeringer utsettes. Veksten bremses, men strukturen er ærlig.',
            color: 'sky',
            bg: 'bg-sky-50',
            border: 'border-sky-300',
            iconColor: 'text-sky-600',
            titleColor: 'text-sky-900',
        },
    }[mode];

    const Icon = modeConfig.icon;

    return (
        <div className="flex flex-col gap-6 p-5 lg:p-8 overflow-y-auto h-full">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-300/40">
                            <TriangleIcon size={22} className="text-white" />
                        </span>
                        Hayeks produksjonstriangel
                    </h1>
                    <p className="text-base lg:text-lg text-slate-600 mt-1">
                        Bredden på hvert ledd viser hvor mange arbeidere som jobber der akkurat nå.
                    </p>
                </div>
                <RateBadge naturalRate={naturalRate} policyRate={effectivePolicy} phase={phase} />
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center justify-center">
                <div className="flex-1 max-w-2xl w-full">
                    <Pyramid stages={stages} distortion={distortion} mode={mode} />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 px-2 font-medium">
                        <span>Nær forbruker (i dag)</span>
                        <span>Langt fra forbruker (fremtid)</span>
                    </div>
                </div>

                <motion.div
                    layout
                    className={`flex-1 max-w-md p-6 rounded-3xl border-2 ${modeConfig.bg} ${modeConfig.border} shadow-md`}
                >
                    <div className="flex items-start gap-3 mb-3">
                        <Icon className={`w-8 h-8 flex-shrink-0 ${modeConfig.iconColor}`} />
                        <div>
                            <h3 className={`text-2xl font-display font-bold ${modeConfig.titleColor}`}>
                                {modeConfig.title}
                            </h3>
                            <p className="text-sm text-slate-700 mt-0.5">
                                Gap: {gap > 0 ? '+' : ''}{gap.toFixed(2)} prosentpoeng
                            </p>
                        </div>
                    </div>
                    <p className="text-base text-slate-800 leading-relaxed">{modeConfig.text}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                        <RateBox label="Naturlig" value={naturalRate} color="emerald" />
                        <RateBox label="Styring" value={effectivePolicy} color="indigo" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Pyramid({
    stages,
    distortion,
    mode,
}: {
    stages: ProductionStage[];
    distortion: number;
    mode: 'natural' | 'low' | 'high';
}) {
    const maxLaborers = Math.max(1, ...stages.map((s) => s.laborers));
    const ordered = [...stages].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col gap-2 py-4">
            {ordered.map((stage, index) => {
                const widthPct = Math.max(8, (stage.laborers / maxLaborers) * 100);
                const lightColor = STAGE_COLOR_LIGHT[stage.id];
                const darkColor = STAGE_COLOR_DARK[stage.id];
                const pulseIntensity = mode === 'low' && index >= 3 ? distortion / 4 : 0;

                return (
                    <motion.div
                        key={stage.id}
                        className="flex items-center gap-3"
                        animate={
                            pulseIntensity > 0
                                ? {
                                      x: [0, -1.5, 1.5, 0],
                                  }
                                : {}
                        }
                        transition={{
                            duration: 0.6,
                            repeat: pulseIntensity > 0 ? Infinity : 0,
                        }}
                    >
                        <div className="w-44 text-right">
                            <div className="text-sm font-bold text-slate-900">{stage.name}</div>
                            <div className="text-xs text-slate-500 font-mono tabular-nums">
                                {stage.laborers} arb · pris {stage.price.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex-1 h-12 lg:h-14 bg-slate-100 rounded-2xl relative overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full rounded-2xl shadow-md flex items-center justify-end pr-4"
                                style={{
                                    background: `linear-gradient(135deg, ${lightColor} 0%, ${darkColor} 100%)`,
                                    boxShadow: `0 4px 12px -2px ${darkColor}40`,
                                }}
                                initial={false}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                            >
                                <span className="text-white text-lg font-bold font-mono tabular-nums drop-shadow-md">
                                    {stage.laborers}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function RateBox({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: 'emerald' | 'indigo';
}) {
    const colorMap = {
        emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        indigo: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    };
    return (
        <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-70">
                {label}
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums">{value.toFixed(2)}%</div>
        </div>
    );
}

function RateBadge({
    naturalRate,
    policyRate,
    phase,
}: {
    naturalRate: number;
    policyRate: number;
    phase: string;
}) {
    return (
        <div className="flex items-center gap-3 bg-white border border-slate-200/70 rounded-2xl p-3 shadow-sm">
            <div className="text-center px-3 border-r border-slate-200">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    Naturlig
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
                    {naturalRate.toFixed(1)}%
                </div>
            </div>
            <div className="text-center px-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    Styring
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700">
                    {policyRate.toFixed(1)}%
                </div>
            </div>
            <div className="text-xs text-slate-500 capitalize pl-2 border-l border-slate-200">
                Fase: {phase}
            </div>
        </div>
    );
}
