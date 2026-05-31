import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Scale, ChevronRight } from 'lucide-react';

interface LawgiverOrConquerorProps {
    title?: string;
}

interface Side {
    key: 'erobrer' | 'lovgiver';
    name: string;
    tagline: string;
    icon: typeof Swords;
    accent: string;
    bg: string;
    deeds: { head: string; text: string }[];
}

const SIDES: Side[] = [
    {
        key: 'erobrer',
        name: 'Erobreren',
        tagline: 'Europa kalte ham "den store" (the Magnificent)',
        icon: Swords,
        accent: '#b91c1c',
        bg: 'from-red-50',
        deeds: [
            { head: 'Wien 1529', text: 'Hæren marsjerer helt til portene av Wien - lenger inn i Europa enn noen osmansk hær før.' },
            { head: 'Beograd og Rhodos', text: 'To festninger som hadde stått imot i hundre år, faller på få år.' },
            { head: 'Herre over havet', text: 'Den osmanske flåten kontrollerer store deler av Middelhavet.' },
            { head: 'Ungarn under riket', text: 'Et helt kongerike legges under sultanen etter slaget ved Mohács.' },
        ],
    },
    {
        key: 'lovgiver',
        name: 'Lovgiveren',
        tagline: 'Hjemme kalte folket ham Kanuni - "Lovgiveren"',
        icon: Scale,
        accent: '#1d4ed8',
        bg: 'from-blue-50',
        deeds: [
            { head: 'Samlet lovene', text: 'Han ordnet rikets lover (kanun) i et system som varte i 300 år etter ham.' },
            { head: 'Vern for bonden', text: 'Nye regler skulle hindre at skatteinnkrevere presset bøndene for hardt.' },
            { head: 'Bygde med Sinan', text: 'Sammen med stjernearkitekten Sinan reiste han moskeer som fortsatt står.' },
            { head: 'Rett for alle', text: 'Også kristne og jøder kunne søke rettferd i sultanens domstoler.' },
        ],
    },
];

export function LawgiverOrConqueror({
    title = 'Süleyman: én mann, to ansikter',
}: LawgiverOrConquerorProps) {
    const [sideKey, setSideKey] = useState<'erobrer' | 'lovgiver'>('erobrer');
    const side = SIDES.find((s) => s.key === sideKey)!;
    const Icon = side.icon;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-600">
                Süleyman var krigeren naboene fryktet og dommeren folket elsket på samme tid. Vipp
                mellom de to sidene av samme sultan.
            </p>

            {/* Vippebryter */}
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {SIDES.map((s) => {
                    const SIcon = s.icon;
                    const selected = s.key === sideKey;
                    return (
                        <button
                            key={s.key}
                            onClick={() => setSideKey(s.key)}
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                                selected ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                            }`}
                            style={selected ? { color: s.accent } : undefined}
                        >
                            <SIcon className="h-4 w-4" /> {s.name}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={side.key}
                    initial={{ opacity: 0, rotateY: 12, y: 10 }}
                    animate={{ opacity: 1, rotateY: 0, y: 0 }}
                    exit={{ opacity: 0, rotateY: -12, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className={`rounded-xl bg-gradient-to-b ${side.bg} to-white p-4`}
                    style={{ borderTop: `4px solid ${side.accent}` }}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <Icon className="h-6 w-6" style={{ color: side.accent }} />
                        <div>
                            <p className="text-base font-bold" style={{ color: side.accent }}>
                                {side.name}
                            </p>
                            <p className="text-xs text-slate-500">{side.tagline}</p>
                        </div>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {side.deeds.map((d) => (
                            <li key={d.head} className="rounded-lg bg-white/80 p-3 ring-1 ring-slate-100">
                                <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                                    <ChevronRight className="h-4 w-4" style={{ color: side.accent }} />
                                    {d.head}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.text}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
