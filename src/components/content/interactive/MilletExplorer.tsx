import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Scroll, Check, Minus } from 'lucide-react';

interface MilletExplorerProps {
    title?: string;
}

interface Community {
    id: string;
    name: string;
    leader: string;
    color: string;
    freedoms: string[];
    limits: string[];
    note: string;
}

const COMMUNITIES: Community[] = [
    {
        id: 'muslim',
        name: 'Muslimer',
        leader: 'Sjeik-ul-islam (øverste lærde)',
        color: '#15803d',
        freedoms: [
            'Styrer riket og fyller de fleste embetene',
            'Lever etter sharia, rikets grunnlov',
            'Betaler lavere skatt enn de andre',
        ],
        limits: ['Forventes å verne riket i krig'],
        note: 'Den styrende gruppen - men langt fra et flertall over hele riket.',
    },
    {
        id: 'ortodoks',
        name: 'Gresk-ortodokse',
        leader: 'Patriarken i Konstantinopel',
        color: '#1d4ed8',
        freedoms: [
            'Egne kirker, skoler og domstoler',
            'Avgjør egne saker om ekteskap og arv',
            'Fri til å dyrke sin tro',
        ],
        limits: ['Betaler ekstra skatt (cizye)', 'Får ikke bære våpen', 'Egne regler for klær og bygg'],
        note: 'Den største kristne gruppen, ledet av sin egen kirkefyrste.',
    },
    {
        id: 'armensk',
        name: 'Armenske kristne',
        leader: 'Den armenske patriarken',
        color: '#b45309',
        freedoms: ['Egen kirke og egne lover', 'Sterke som håndverkere og kjøpmenn', 'Egne domstoler'],
        limits: ['Betaler ekstra skatt (cizye)', 'Står utenfor de høyeste embetene'],
        note: 'Et eget trossamfunn med egen leder, anerkjent av sultanen.',
    },
    {
        id: 'jodisk',
        name: 'Jøder',
        leader: 'Overrabbineren (hakham bashi)',
        color: '#7c3aed',
        freedoms: [
            'Ønsket velkommen da de ble jaget fra Spania i 1492',
            'Egne synagoger, skoler og domstoler',
            'Frie til å drive handel og håndverk',
        ],
        limits: ['Betaler ekstra skatt (cizye)', 'Lever etter de samme reglene som andre ikke-muslimer'],
        note: 'Mens Europa jaget jødene bort, ga sultanen dem et hjem.',
    },
];

export function MilletExplorer({
    title = 'Millet-systemet: frihet, men ikke likhet',
}: MilletExplorerProps) {
    const [id, setId] = useState(COMMUNITIES[0].id);
    const c = COMMUNITIES.find((x) => x.id === id)!;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">
                Riket var delt i trossamfunn - millet - der hver gruppe styrte seg selv etter egne
                lover. Velg en gruppe og se hva de fikk lov til, og hva de ikke fikk.
            </p>

            {/* Faner */}
            <div className="mb-5 flex flex-wrap gap-2">
                {COMMUNITIES.map((com) => {
                    const selected = com.id === id;
                    return (
                        <button
                            key={com.id}
                            onClick={() => setId(com.id)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                                selected ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            style={selected ? { backgroundColor: com.color } : undefined}
                        >
                            {com.name}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                >
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <Crown className="h-4 w-4" style={{ color: c.color }} />
                        <span className="text-sm text-slate-600">Egen leder:</span>
                        <span className="text-sm font-semibold text-slate-900">{c.leader}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Frihet
                            </p>
                            <ul className="space-y-1.5">
                                {c.freedoms.map((f) => (
                                    <li key={f} className="flex gap-2 text-sm text-slate-700">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Grenser
                            </p>
                            <ul className="space-y-1.5">
                                {c.limits.map((l) => (
                                    <li key={l} className="flex gap-2 text-sm text-slate-700">
                                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p
                        className="mt-3 flex items-center gap-2 rounded-lg border-l-4 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                        style={{ borderColor: c.color }}
                    >
                        <Scroll className="h-4 w-4 shrink-0" style={{ color: c.color }} />
                        {c.note}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
