import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ship,
    ArrowRight,
    Map as MapIcon,
    Info,
    ArrowDownRight,
    Users,
    Package,
    Factory
} from 'lucide-react';

interface TradePath {
    id: string;
    from: string;
    to: string;
    resource: string;
    resourceNo: string;
    icon: React.ElementType;
    description: string;
    color: string;
    points: string;
    impact: string;
}

const tradePaths: TradePath[] = [
    {
        id: 'africa-americas',
        from: 'Afrika',
        to: 'Amerika',
        resource: 'Human Capital (Enslaved)',
        resourceNo: 'Slaver',
        icon: Users,
        description: 'Den mest brutale delen av handelen. Mennesker ble fraktet over Atlanterhavet under umenneskelige forhold.',
        color: '#f43f5e', // rose-500
        points: 'M 450 380 Q 300 400 150 350',
        impact: 'Grimmeste kapittel i menneskehetens historie'
    },
    {
        id: 'americas-europe',
        from: 'Amerika',
        to: 'Europa',
        resource: 'Raw Materials (Sugar, Cotton)',
        resourceNo: 'Råvarer',
        icon: Package,
        description: 'Råvarer produsert av slavekraft ble sendt til Europa for å drive den gryende industrien.',
        color: '#f59e0b', // amber-500
        points: 'M 120 310 Q 250 180 550 120',
        impact: 'La grunnlaget for den industrielle revolusjonen'
    },
    {
        id: 'europe-africa',
        from: 'Europa',
        to: 'Afrika',
        resource: 'Manufactured Goods',
        resourceNo: 'Industrivarer',
        icon: Factory,
        description: 'Europeiske fabrikkvarer ble sendt til Afrika og byttet mot mennesker, noe som fullførte sirkelen.',
        color: '#6366f1', // indigo-500
        points: 'M 580 140 Q 620 280 480 350',
        impact: 'Sementerte europeisk økonomisk dominans'
    }
];

export const ResourceTradeFlows: React.FC = () => {
    const [activePath, setActivePath] = useState<TradePath | null>(null);

    return (
        <section className="my-16 bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/20 relative overflow-hidden">
            {/* Background Map Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <MapIcon className="w-80 h-80 text-slate-900" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
                    <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
                        <Ship className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Den globale trekantshandelen</h2>
                        <p className="text-slate-500 font-medium text-sm">Velg en rute for å se detaljer om strømmen av varer og mennesker</p>
                    </div>
                </div>

                {/* Interaction Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 border-b border-slate-100 pb-6">
                    {tradePaths.map((path) => (
                        <button
                            key={path.id}
                            onClick={() => setActivePath(activePath?.id === path.id ? null : path)}
                            onMouseEnter={() => setActivePath(path)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider ${activePath?.id === path.id
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50'
                                }`}
                        >
                            <path.icon className={`w-3.5 h-3.5 ${activePath?.id === path.id ? 'text-white' : 'text-slate-400'}`} />
                            {path.resourceNo}
                        </button>
                    ))}
                    {activePath && (
                        <button
                            onClick={() => setActivePath(null)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-3 uppercase tracking-widest"
                        >
                            Nullstill
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-12 items-center">
                    {/* Map/SVG Visualization */}
                    <div className="w-full relative aspect-[4/3] max-w-2xl bg-slate-50 rounded-[2rem] border border-slate-100 p-4 shadow-inner">
                        <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
                            {/* Stylized Continents */}
                            <path d="M 50 150 Q 80 100 150 100 Q 200 150 180 300 Q 100 450 50 350 Z" fill="#e2e8f0" /> {/* Americas */}
                            <path d="M 500 50 Q 600 50 650 150 Q 600 200 550 150 Z" fill="#e2e8f0" /> {/* Europe */}
                            <path d="M 450 280 Q 600 280 550 480 Q 450 480 400 380 Z" fill="#e2e8f0" /> {/* Africa */}

                            {/* Trade Paths */}
                            {tradePaths.map((path) => (
                                <g
                                    key={path.id}
                                    onClick={() => setActivePath(activePath?.id === path.id ? null : path)}
                                    onMouseEnter={() => setActivePath(path)}
                                    onMouseLeave={() => setActivePath(null)}
                                    className="cursor-pointer group"
                                >
                                    {/* Invisible "Hit Area" Path */}
                                    <path
                                        d={path.points}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth="30"
                                        strokeLinecap="round"
                                    />
                                    {/* Visual Path */}
                                    <path
                                        d={path.points}
                                        fill="none"
                                        stroke={path.color}
                                        strokeWidth={activePath?.id === path.id ? "5" : "3"}
                                        strokeLinecap="round"
                                        opacity={activePath ? (activePath.id === path.id ? 1 : 0.1) : 0.4}
                                        className="transition-all duration-300"
                                    />
                                    {/* Animation Dot */}
                                    <circle r="5" fill={path.color} opacity={activePath ? (activePath.id === path.id ? 1 : 0) : 0.6}>
                                        <animateMotion
                                            dur="4s"
                                            repeatCount="indefinite"
                                            path={path.points}
                                        />
                                    </circle>
                                </g>
                            ))}
                        </svg>

                        {/* Connection Labels */}
                        <div className="absolute inset-0 pointer-events-none">
                            <Label x="12%" y="40%" text="Amerika" />
                            <Label x="68%" y="18%" text="Europa" />
                            <Label x="60%" y="78%" text="Afrika" />
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="w-full max-w-2xl flex flex-col pt-4 min-h-[220px]">
                        <AnimatePresence mode="wait">
                            {activePath ? (
                                <motion.div
                                    key={activePath.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-slate-50/80 border border-slate-200 p-8 rounded-3xl"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${activePath.color}15` } as any}>
                                            <activePath.icon className="w-5 h-5" style={{ color: activePath.color } as any} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{activePath.resourceNo}</h3>
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                        <span>{activePath.from}</span>
                                        <div className="h-[1px] flex-1 bg-slate-200" />
                                        <ArrowRight className="w-3 h-3" />
                                        <div className="h-[1px] flex-1 bg-slate-200" />
                                        <span>{activePath.to}</span>
                                    </div>

                                    <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium">
                                        {activePath.description}
                                    </p>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-3 items-start shadow-sm">
                                        <ArrowDownRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="text-xs font-bold text-slate-500 italic">
                                            {activePath.impact}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 text-center md:text-left"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-6">
                                        <Info className="w-3.5 h-3.5" />
                                        Velg en rute over eller klikk på kartet
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">Systemet som krympet verden</h3>
                                    <p className="text-slate-500 leading-relaxed text-base italic">
                                        "Ved å koble sammen tre kontinenter skapte europeiske stormakter et system
                                        som maksimerte profitt for moderlandet, men med ufattelige menneskelige kostnader."
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Label: React.FC<{ x: string, y: string, text: string }> = ({ x, y, text }) => (
    <div
        className="absolute text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 bg-white/90 backdrop-blur-sm shadow-sm px-2.5 py-1.5 rounded-lg border border-slate-100"
        style={{ left: x, top: y }}
    >
        {text}
    </div>
);
