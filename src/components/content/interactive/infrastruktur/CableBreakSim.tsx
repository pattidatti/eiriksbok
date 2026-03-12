import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    title?: string;
    description?: string;
}

const CABLES = [
    {
        id: 'north-atlantic',
        name: 'MAREA (USA–Europa)',
        capacity: 200,
        region: 'Nord-Atlanterhavet',
        users: 'Europa ↔ USA finansmarkeder',
        consequence:
            'Latens for transatlantiske finanstransaksjoner øker. Backup-kabler overbelastes. HFT-handel (høyfrekvent handel) på NYSE og London Stock Exchange forsinkes.',
    },
    {
        id: 'pacific',
        name: 'Trans Pacific Network',
        capacity: 128,
        region: 'Stillehavet',
        users: 'Asia ↔ USA',
        consequence:
            'Asiatiske børser mister direkte tilkobling til Wall Street. Cloud-tjenester fra AWS og Google opplever forsinkelser for asiatiske brukere. TikTok og Alibaba bremses.',
    },
    {
        id: 'africa',
        name: '2Africa (Rundt Afrika)',
        capacity: 180,
        region: 'Afrika',
        users: 'Subsahara-Afrika internett',
        consequence:
            '620 millioner mennesker i Subsahara-Afrika mister mesteparten av sin internettbåndbredde. Mobilbetalinger og banktjenester går ned. Myndighetene varsler om krise.',
    },
    {
        id: 'seamewe5',
        name: 'SEA-ME-WE 5 (Europa–Asia)',
        capacity: 24,
        region: 'Middelhavet–Indiahavet',
        users: 'Europa ↔ Midtøsten ↔ Asia',
        consequence:
            'Mellomøsten taper mesteparten av sin europeiske tilkobling. Backup-ruter via USA og Afrika overbelastes. Streamingkvalitet faller dramatisk over hele Midt-Østen.',
    },
    {
        id: 'eassy',
        name: 'EASSy (Øst-Afrika)',
        capacity: 10,
        region: 'Øst-Afrika',
        users: 'Kenya, Tanzania, Etiopia',
        consequence:
            'Østafrika mister hoveddelen av sin internasjonale konnektivitet. Bedrifter kan ikke gjennomføre internasjonale transaksjoner. Digitale betalingstjenester som M-Pesa bremses kraftig.',
    },
];

export function CableBreakSim({ title, description }: Props) {
    const [brokenCables, setBrokenCables] = useState<Set<string>>(new Set());
    const [lastConsequence, setLastConsequence] = useState<(typeof CABLES)[0] | null>(null);

    function toggleCable(cable: (typeof CABLES)[0]) {
        const next = new Set(brokenCables);
        if (next.has(cable.id)) {
            next.delete(cable.id);
            setLastConsequence(null);
        } else {
            next.add(cable.id);
            setLastConsequence(cable);
        }
        setBrokenCables(next);
    }

    const totalCapacity = CABLES.reduce((s, c) => s + c.capacity, 0);
    const brokenCapacity = CABLES.filter((c) => brokenCables.has(c.id)).reduce((s, c) => s + c.capacity, 0);
    const remaining = totalCapacity - brokenCapacity;
    const pct = Math.round((remaining / totalCapacity) * 100);

    return (
        <div className="my-6 rounded-xl border border-slate-200 bg-slate-900 overflow-hidden">
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
                <h4 className="font-bold text-white text-sm">{title ?? 'Hva skjer når en kabel kuttes?'}</h4>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>

            <div className="p-4 space-y-3">
                {/* Capacity meter */}
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Global kabelkapasitet</span>
                        <span className={`font-mono font-bold ${pct > 70 ? 'text-green-400' : pct > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {pct}% operativ
                        </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${pct}%`,
                                backgroundColor: pct > 70 ? '#4ade80' : pct > 40 ? '#facc15' : '#f87171',
                            }}
                            animate={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {/* Cable list */}
                <div className="space-y-1.5">
                    {CABLES.map((cable) => {
                        const broken = brokenCables.has(cable.id);
                        return (
                            <button
                                key={cable.id}
                                onClick={() => toggleCable(cable)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                    broken
                                        ? 'bg-red-500/10 border border-red-500/30'
                                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${broken ? 'bg-red-500' : 'bg-green-500'}`} />
                                <span className="flex-1">
                                    <span className={broken ? 'text-red-300 line-through' : 'text-white'}>{cable.name}</span>
                                    <span className="text-xs text-slate-500 ml-2">{cable.region}</span>
                                </span>
                                <span className="text-xs text-slate-400">{cable.capacity} Tbps</span>
                            </button>
                        );
                    })}
                </div>

                {/* Consequence panel */}
                <AnimatePresence>
                    {lastConsequence && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                        >
                            <p className="text-xs font-semibold text-red-300 mb-1">
                                Konsekvens: {lastConsequence.name} er kuttet
                            </p>
                            <p className="text-xs text-slate-300">{lastConsequence.consequence}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-[10px] text-slate-500">
                    Klikk på en kabel for å simulere et brudd. Kapasitetsmåleren viser globalt internett-kapasitet.
                </p>
            </div>
        </div>
    );
}
