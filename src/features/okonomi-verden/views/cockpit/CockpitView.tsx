import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    TrendingUp,
    Users,
    DollarSign,
    Triangle,
    AlertOctagon,
    Activity,
    Sparkles,
} from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';
import type { KeyMetrics, Phase } from '../../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PHASE_STYLES: Record<
    Phase,
    { label: string; bg: string; ring: string; text: string; emoji: string }
> = {
    expansion: {
        label: 'Stabil ekspansjon',
        bg: 'bg-gradient-to-r from-emerald-100 to-emerald-50',
        ring: 'ring-emerald-300',
        text: 'text-emerald-800',
        emoji: '🌱',
    },
    boom: {
        label: 'Kunstig boom',
        bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
        ring: 'ring-amber-400',
        text: 'text-amber-900',
        emoji: '🔥',
    },
    bust: {
        label: 'Krisen er her',
        bg: 'bg-gradient-to-r from-rose-100 to-red-100',
        ring: 'ring-rose-400',
        text: 'text-rose-900',
        emoji: '⚡',
    },
    recovery: {
        label: 'Restitusjon',
        bg: 'bg-gradient-to-r from-sky-100 to-blue-100',
        ring: 'ring-sky-300',
        text: 'text-sky-900',
        emoji: '🛠️',
    },
};

export function CockpitView() {
    const history = useWorldStore((s) => s.sim.history);
    const sim = useWorldStore((s) => s.sim);
    const controls = useWorldStore((s) => s.controls);

    const latest = history[history.length - 1];
    const phase = PHASE_STYLES[sim.phase];

    return (
        <div className="flex flex-col gap-5 p-5 lg:p-8 overflow-y-auto h-full">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight">
                        Cockpit
                    </h1>
                    <p className="text-base lg:text-lg text-slate-600 mt-1">
                        Sanntidsbilde av økonomien. Vri på kontrollene og se hva som skjer.
                    </p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sim.phase}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-base ring-2 shadow-md ${phase.bg} ${phase.text} ${phase.ring}`}
                    >
                        <span className="text-xl">{phase.emoji}</span>
                        {phase.label}
                    </motion.div>
                </AnimatePresence>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI
                    icon={Activity}
                    label="Inflasjon"
                    value={latest ? latest.inflation : 0}
                    suffix=" %"
                    decimals={1}
                    tone={latest && latest.inflation > 6 ? 'rose' : latest && latest.inflation < 0 ? 'sky' : 'slate'}
                />
                <KPI
                    icon={Users}
                    label="Arbeidsledighet"
                    value={latest ? latest.unemployment : 0}
                    suffix=" %"
                    decimals={1}
                    tone={latest && latest.unemployment > 10 ? 'rose' : latest && latest.unemployment > 5 ? 'amber' : 'emerald'}
                />
                <KPI
                    icon={DollarSign}
                    label="BNP"
                    value={latest ? latest.bnp : 0}
                    decimals={0}
                    tone="indigo"
                />
                <KPI
                    icon={AlertOctagon}
                    label="Feilinvestering"
                    value={latest ? latest.malinvestment : 0}
                    suffix=" / 60"
                    decimals={0}
                    tone={latest && latest.malinvestment > 40 ? 'rose' : latest && latest.malinvestment > 20 ? 'amber' : 'emerald'}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <ChartCard
                    title="Rente: naturlig vs. styringsrente"
                    description="Når styringsrenten ligger under den naturlige, akkumulerer feilinvesteringer."
                    icon={TrendingUp}
                    tone="indigo"
                >
                    <RateChart history={history} />
                </ChartCard>

                <ChartCard
                    title="Inflasjon"
                    description="Vokser pengemengden raskere enn produksjonen, stiger prisene."
                    icon={Activity}
                    tone="amber"
                >
                    <InflationChart history={history} />
                </ChartCard>

                <ChartCard
                    title="Arbeidsledighet"
                    description="Når strukturen kollapser, mister mange jobben - særlig i tidlige produksjonsledd."
                    icon={Users}
                    tone="rose"
                >
                    <UnemploymentChart history={history} />
                </ChartCard>

                <ChartCard
                    title="Produksjonsstruktur (live Hayek-triangel)"
                    description="Hvor mange arbeidere som er sysselsatt i hvert produksjonsledd akkurat nå."
                    icon={Triangle}
                    tone="emerald"
                >
                    <StageBars />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <Sparkles size={16} className="text-indigo-500 flex-shrink-0" />
                    <div>
                        <strong className="text-slate-900">Styringsrente:</strong>{' '}
                        <span className="font-mono tabular-nums text-indigo-700 font-semibold">
                            {controls.policyRate.toFixed(2)} %
                        </span>
                        {latest && (
                            <span className="text-slate-500">
                                {' '}· naturlig:{' '}
                                <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                                    {latest.naturalRate.toFixed(2)} %
                                </span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <DollarSign size={16} className="text-amber-500 flex-shrink-0" />
                    <div>
                        <strong className="text-slate-900">Pengetrykk:</strong>{' '}
                        <span className="font-mono tabular-nums text-amber-700 font-semibold">
                            {(controls.moneyGrowth * 100).toFixed(1)} % / år
                        </span>
                        {latest && (
                            <span className="text-slate-500">
                                {' '}· M:{' '}
                                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                                    {Math.round(latest.M).toLocaleString('nb-NO')}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2">
                Modellen er en pedagogisk forenkling fundert i den østerrikske skolen
                (Menger - Mises - Hayek - Böhm-Bawerk). Tall og dynamikk er kalibrert for å vise
                sammenhenger, ikke for å gi økonomiske prognoser.
            </p>
        </div>
    );
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
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: number;
    suffix?: string;
    decimals?: number;
    tone?: Tone;
}) {
    const display = useCountUp(value, decimals);
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`relative bg-white rounded-2xl p-4 lg:p-5 border ring-1 ${TONE_RING[tone]} border-white shadow-md hover:shadow-lg transition-shadow`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${TONE_ICON_BG[tone]}`}>
                    <Icon size={14} />
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    {label}
                </span>
            </div>
            <div className={`text-3xl lg:text-4xl font-display font-bold tabular-nums ${TONE_VALUE[tone]}`}>
                {display}
                <span className="text-xl font-bold text-slate-400">{suffix}</span>
            </div>
        </motion.div>
    );
}

function useCountUp(target: number, decimals: number): string {
    const [shown, setShown] = useState(target);
    useEffect(() => {
        const start = shown;
        const startTime = performance.now();
        const duration = 250;
        let raf = 0;
        const tick = (t: number) => {
            const p = Math.min(1, (t - startTime) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = start + (target - start) * eased;
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

function ChartCard({
    title,
    description,
    icon: Icon,
    tone = 'slate',
    children,
}: {
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    tone?: Tone;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            whileHover={{ y: -1 }}
            className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start gap-3 mb-3">
                <span className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${TONE_ICON_BG[tone]}`}>
                    <Icon size={16} />
                </span>
                <div>
                    <h3 className="text-lg font-display font-bold text-slate-900 leading-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-snug mt-0.5">{description}</p>
                </div>
            </div>
            <div className="h-52">{children}</div>
        </motion.div>
    );
}

const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 } as const,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: {
                color: '#475569',
                font: { size: 12, weight: 'bold' as const },
                boxWidth: 16,
                padding: 12,
            },
        },
        tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#1e293b',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
        },
    },
    scales: {
        x: {
            ticks: { color: '#94a3b8', font: { size: 11 }, maxTicksLimit: 6 },
            grid: { color: '#f1f5f9' },
        },
        y: {
            ticks: { color: '#94a3b8', font: { size: 11 } },
            grid: { color: '#f1f5f9' },
        },
    },
};

function buildLabels(history: KeyMetrics[]): string[] {
    return history.map((h) => String(h.tick));
}

function RateChart({ history }: { history: KeyMetrics[] }) {
    const data = useMemo(
        () => ({
            labels: buildLabels(history),
            datasets: [
                {
                    label: 'Naturlig rente',
                    data: history.map((h) => h.naturalRate),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    tension: 0.4,
                },
                {
                    label: 'Styringsrente',
                    data: history.map((h) => h.policyRate),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    borderDash: [6, 4],
                    tension: 0.4,
                },
            ],
        }),
        [history]
    );
    return <Line data={data} options={baseChartOptions} />;
}

function InflationChart({ history }: { history: KeyMetrics[] }) {
    const data = useMemo(
        () => ({
            labels: buildLabels(history),
            datasets: [
                {
                    label: 'Inflasjon (%/år)',
                    data: history.map((h) => h.inflation),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.18)',
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 3,
                    tension: 0.4,
                },
            ],
        }),
        [history]
    );
    return <Line data={data} options={baseChartOptions} />;
}

function UnemploymentChart({ history }: { history: KeyMetrics[] }) {
    const data = useMemo(
        () => ({
            labels: buildLabels(history),
            datasets: [
                {
                    label: 'Arbeidsledighet (%)',
                    data: history.map((h) => h.unemployment),
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.18)',
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 3,
                    tension: 0.4,
                },
            ],
        }),
        [history]
    );
    return <Line data={data} options={baseChartOptions} />;
}

function StageBars() {
    const stages = useWorldStore((s) => s.sim.stages);
    const maxLaborers = Math.max(1, ...stages.map((s) => s.laborers));
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="flex flex-col gap-2 h-full justify-center">
            {[...stages].reverse().map((stage) => {
                const widthPct = (stage.laborers / maxLaborers) * 100;
                const color = colors[stage.id];
                return (
                    <div key={stage.id} className="flex items-center gap-3">
                        <span className="text-xs text-slate-700 w-36 truncate text-right font-medium">
                            {stage.name}
                        </span>
                        <div className="flex-1 h-7 bg-slate-100 rounded-lg relative overflow-hidden">
                            <motion.div
                                className="h-full rounded-lg shadow-sm"
                                style={{ backgroundColor: color }}
                                initial={false}
                                animate={{ width: `${Math.max(2, widthPct)}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                            />
                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs text-slate-900 font-bold font-mono tabular-nums">
                                {stage.laborers}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
