import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Coins, TrendingUp, Users, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';

type LayerId = 'money' | 'prices' | 'labor' | 'capital';

interface LayerDef {
    id: LayerId;
    label: string;
    description: string;
    color: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const LAYERS: LayerDef[] = [
    {
        id: 'money',
        label: 'Pengeflyt',
        description: 'Hvem får pengene først når pengemengden vokser (Cantillon-effekten).',
        color: '#f59e0b',
        icon: Coins,
    },
    {
        id: 'prices',
        label: 'Prissignaler',
        description: 'Hva hvert ledd betaler for innsatsfaktorene.',
        color: '#ef4444',
        icon: TrendingUp,
    },
    {
        id: 'labor',
        label: 'Arbeidskraft',
        description: 'Antall personer som jobber i hvert ledd.',
        color: '#10b981',
        icon: Users,
    },
    {
        id: 'capital',
        label: 'Kapital',
        description: 'Verktøy og maskiner per ledd.',
        color: '#6366f1',
        icon: Briefcase,
    },
];

const STAGE_LAYOUT = [
    { id: 0, name: 'Forbruk', cx: 110, cy: 250 },
    { id: 1, name: 'Distribusjon', cx: 280, cy: 180 },
    { id: 2, name: 'Maskiner', cx: 450, cy: 130 },
    { id: 3, name: 'Halvfabrikata', cx: 620, cy: 180 },
    { id: 4, name: 'Råvarer', cx: 790, cy: 250 },
];

export function AtlasView() {
    const [active, setActive] = useState<Set<LayerId>>(new Set<LayerId>(['money', 'labor']));
    const stages = useWorldStore((s) => s.sim.stages);
    const naturalRate = useWorldStore((s) => s.sim.loanMarket.clearingRate);
    const policyRate = useWorldStore((s) => s.controls.policyRate);
    const freeMarket = useWorldStore((s) => s.controls.freeMarket);

    const effectivePolicy = freeMarket ? naturalRate : policyRate;
    const gap = naturalRate - effectivePolicy;

    function toggleLayer(id: LayerId) {
        setActive((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    return (
        <div className="flex flex-col gap-5 p-5 lg:p-8 overflow-y-auto h-full">
            <header>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-300/40">
                        <Layers size={22} className="text-white" />
                    </span>
                    Atlas
                </h1>
                <p className="text-base lg:text-lg text-slate-600 mt-1">
                    Slå av og på lag for å se hvordan penger, priser, kapital og arbeid flyter
                    mellom produksjonsleddene.
                </p>
            </header>

            <div className="flex flex-wrap gap-2">
                {LAYERS.map((l) => {
                    const on = active.has(l.id);
                    const Icon = l.icon;
                    return (
                        <motion.button
                            key={l.id}
                            type="button"
                            onClick={() => toggleLayer(l.id)}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                                on
                                    ? 'bg-white shadow-md text-slate-900'
                                    : 'bg-slate-50 text-slate-500 border-slate-200/70'
                            }`}
                            style={on ? { borderColor: l.color, color: l.color } : {}}
                        >
                            {on ? <Eye size={14} /> : <EyeOff size={14} />}
                            <Icon size={14} />
                            {l.label}
                        </motion.button>
                    );
                })}
            </div>

            <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-md">
                <svg viewBox="0 0 900 400" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        {LAYERS.map((l) => (
                            <marker
                                key={l.id}
                                id={`arrow-${l.id}`}
                                viewBox="0 0 10 10"
                                refX="8"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill={l.color} />
                            </marker>
                        ))}
                    </defs>

                    {STAGE_LAYOUT.slice(0, -1).map((from, i) => {
                        const to = STAGE_LAYOUT[i + 1];
                        const stageStrength = stages[i + 1]?.laborers ?? 1;
                        const baseW = 2 + Math.min(8, stageStrength / 6);
                        return (
                            <g key={from.id}>
                                {active.has('money') && (
                                    <MoneyFlow from={from} to={to} gap={gap} index={i} />
                                )}
                                {active.has('labor') && (
                                    <FlowLine from={from} to={to} color="#10b981" width={baseW} dashed offset={0} />
                                )}
                                {active.has('capital') && (
                                    <FlowLine from={from} to={to} color="#6366f1" width={baseW * 0.7} dashed={false} offset={6} />
                                )}
                                {active.has('prices') && (
                                    <PriceFlow from={from} to={to} priceFrom={stages[i].price} priceTo={stages[i + 1].price} />
                                )}
                            </g>
                        );
                    })}

                    {STAGE_LAYOUT.map((s) => {
                        const stage = stages[s.id];
                        const radius = 38 + Math.min(22, (stage?.laborers ?? 0) * 0.7);
                        return (
                            <g key={s.id}>
                                <motion.circle
                                    cx={s.cx}
                                    cy={s.cy}
                                    fill="white"
                                    stroke="#cbd5e1"
                                    strokeWidth={2}
                                    initial={false}
                                    animate={{ r: radius }}
                                    transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                                    style={{ filter: 'drop-shadow(0 4px 8px rgba(15,23,42,0.08))' }}
                                />
                                <text
                                    x={s.cx}
                                    y={s.cy - 6}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fontWeight="700"
                                    fill="#0f172a"
                                >
                                    {s.name}
                                </text>
                                <text
                                    x={s.cx}
                                    y={s.cy + 12}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#64748b"
                                    fontFamily="monospace"
                                >
                                    {stage?.laborers ?? 0} arb
                                </text>
                                <text
                                    x={s.cx}
                                    y={s.cy + 26}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#94a3b8"
                                    fontFamily="monospace"
                                >
                                    {stage?.price.toFixed(2) ?? '0.00'} kr
                                </text>
                            </g>
                        );
                    })}

                    <text x="450" y="380" textAnchor="middle" fontSize="13" fontWeight="600" fill="#64748b">
                        Råvarer flyter mot venstre, ferdigvarer mot forbrukeren. Penger gjør motsatt.
                    </text>
                </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LAYERS.filter((l) => active.has(l.id)).map((l) => (
                    <div
                        key={l.id}
                        className="p-4 rounded-2xl border bg-white shadow-sm flex items-start gap-3"
                        style={{ borderColor: `${l.color}40` }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: l.color }}
                        >
                            <l.icon size={18} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900">{l.label}</h4>
                            <p className="text-sm text-slate-600 leading-snug">{l.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FlowLine({
    from,
    to,
    color,
    width,
    dashed,
    offset,
}: {
    from: { cx: number; cy: number };
    to: { cx: number; cy: number };
    color: string;
    width: number;
    dashed: boolean;
    offset: number;
}) {
    const dy = offset;
    return (
        <line
            x1={from.cx}
            y1={from.cy + dy}
            x2={to.cx}
            y2={to.cy + dy}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={dashed ? '5 5' : undefined}
            opacity={0.55}
        />
    );
}

function MoneyFlow({
    from,
    to,
    gap,
    index,
}: {
    from: { cx: number; cy: number };
    to: { cx: number; cy: number };
    gap: number;
    index: number;
}) {
    const stageBoost = gap > 0 ? Math.min(3, gap * (index + 1) * 0.3) : 0;
    const width = 3 + stageBoost;
    return (
        <>
            <line
                x1={to.cx}
                y1={to.cy - 8}
                x2={from.cx}
                y2={from.cy - 8}
                stroke="#f59e0b"
                strokeWidth={width}
                opacity={0.7}
                markerEnd="url(#arrow-money)"
            />
            <motion.circle
                r={4 + stageBoost / 2}
                fill="#f59e0b"
                initial={{ cx: to.cx, cy: to.cy - 8 }}
                animate={{ cx: from.cx, cy: from.cy - 8 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
        </>
    );
}

function PriceFlow({
    from,
    to,
    priceFrom,
    priceTo,
}: {
    from: { cx: number; cy: number };
    to: { cx: number; cy: number };
    priceFrom: number;
    priceTo: number;
}) {
    const ratio = priceTo / Math.max(0.01, priceFrom);
    const intensity = Math.min(1, Math.abs(ratio - 1) * 2);
    return (
        <line
            x1={from.cx}
            y1={from.cy + 14}
            x2={to.cx}
            y2={to.cy + 14}
            stroke="#ef4444"
            strokeWidth={1 + intensity * 3}
            opacity={0.4 + intensity * 0.3}
        />
    );
}
