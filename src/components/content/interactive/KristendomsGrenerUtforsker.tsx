import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Users, Crown, BookOpen, Cross } from 'lucide-react';

interface Branch {
    id: string;
    name: string;
    founded: string;
    leader: string;
    followers: string;
    distinctives: string[];
    norgeLink: string;
    accentColor: string;
    bgFrom: string;
    badgeClass: string;
    ringClass: string;
}

const BRANCHES: Branch[] = [
    {
        id: 'katolsk',
        name: 'Katolsk',
        founded: 'Apostolisk grunnlag; etter Romerrikets fall ble Roma sentrum',
        leader: 'Paven i Roma',
        followers: '1,3 milliarder',
        distinctives: [
            'Paven har den høyeste autoritet i kirkespørsmål',
            'Syv sakramenter - dåp, nattverd, konfirmasjon m.fl.',
            'Maria og helgener vises ærbødighet',
            'Gudstjenestens liturgi er svært gammel og rik',
        ],
        norgeLink: 'Ca. 130 000 katolikker bor i Norge i dag',
        accentColor: '#2563eb',
        bgFrom: 'from-blue-50',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
        ringClass: 'ring-blue-400',
    },
    {
        id: 'ortodoks',
        name: 'Ortodoks',
        founded: 'Det store skismaet 1054 - skilt fra Roma',
        leader: 'Patriarker (f.eks. i Konstantinopel og Moskva)',
        followers: '260 millioner',
        distinctives: [
            'Ingen sentral pave - fellesskap av jevnbyrdige patriarker',
            'Rik tradisjon med ikoner, sang og mystikk',
            'Sterk i Russland, Hellas, Serbia og Romania',
            'Bevart den bysantinske liturgien fra antikken',
        ],
        norgeLink: 'Ca. 20 000 ortodokse kristne bor i Norge i dag',
        accentColor: '#7c3aed',
        bgFrom: 'from-purple-50',
        badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
        ringClass: 'ring-purple-400',
    },
    {
        id: 'protestantisk',
        name: 'Protestantisk',
        founded: 'Reformasjonen 1517 - Martin Luther',
        leader: 'Ingen felles leder - mange selvstendige kirkesamfunn',
        followers: '900 millioner',
        distinctives: [
            'Bibelen alene er den øverste autoritet',
            'Frelse ved tro alene - ikke gode gjerninger',
            'To sakramenter: dåp og nattverd',
            'Den norske kirke er luthersk-protestantisk',
        ],
        norgeLink: 'Den norske kirke har rundt 3,5 millioner medlemmer',
        accentColor: '#d97706',
        bgFrom: 'from-amber-50',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
        ringClass: 'ring-amber-400',
    },
];

const COMMON_GROUNDS = [
    { icon: Cross, text: 'Jesus er Guds sønn' },
    { icon: BookOpen, text: 'Bibelen er Guds ord' },
    { icon: Crown, text: 'Jesus stod opp fra de døde' },
    { icon: Users, text: 'Treenigheten: Fader, Sønn og Ånd' },
];

export function KristendomsGrenerUtforsker() {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [seen, setSeen] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        if (expanded === id) {
            setExpanded(null);
        } else {
            setExpanded(id);
            setSeen((prev) => new Set([...prev, id]));
        }
    };

    const allSeen = seen.size === BRANCHES.length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">Kristendommens tre grener</h3>
                    <p className="text-sm text-slate-500">Klikk hver gren for å utforske hva som gjør den unik</p>
                </div>
            </div>

            {/* Grener */}
            <div className="p-4 flex flex-col gap-2">
                {BRANCHES.map((branch) => {
                    const isOpen = expanded === branch.id;
                    const isSeen = seen.has(branch.id);
                    return (
                        <div
                            key={branch.id}
                            className={`rounded-xl border-2 overflow-hidden transition-all ${
                                isOpen
                                    ? `ring-2 ${branch.ringClass} border-transparent`
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {/* Kort-header */}
                            <button
                                onClick={() => toggle(branch.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left bg-gradient-to-r ${branch.bgFrom} to-white transition-colors hover:to-slate-50`}
                            >
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${branch.badgeClass} shrink-0`}
                                >
                                    {branch.name}
                                </span>
                                <span className="text-sm text-slate-600 flex-1">{branch.followers} tilhengere</span>
                                {isSeen && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                                {isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                            </button>

                            {/* Utvidet innhold */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                                    >
                                        <div className="px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                                                    Grunnlagt
                                                </div>
                                                <p className="text-sm text-slate-700">{branch.founded}</p>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mt-3 mb-1.5">
                                                    Leder
                                                </div>
                                                <p className="text-sm text-slate-700">{branch.leader}</p>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mt-3 mb-1.5">
                                                    I Norge
                                                </div>
                                                <p className="text-sm text-slate-700">{branch.norgeLink}</p>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                                                    Særtrekk
                                                </div>
                                                <ul className="flex flex-col gap-1.5">
                                                    {branch.distinctives.map((d, i) => (
                                                        <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
                                                            <span
                                                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: branch.accentColor }}
                                                            />
                                                            {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Felles grunnlag - alltid synlig */}
            <div className="mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                    Det alle tre er enige om
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {COMMON_GROUNDS.map(({ icon: Icon, text }, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fullforingsstatus */}
            <AnimatePresence>
                {allSeen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-4 mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Du har utforsket alle tre grener. De er uenige om mye - men roten er den samme: Jesus fra Nasaret.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progresjonsindikatorer */}
            <div className="px-4 pb-4 flex items-center gap-2">
                {BRANCHES.map((branch) => (
                    <div
                        key={branch.id}
                        className="flex-1 h-1.5 rounded-full transition-colors duration-500"
                        style={{
                            backgroundColor: seen.has(branch.id) ? branch.accentColor : '#e2e8f0',
                        }}
                    />
                ))}
                <span className="text-xs text-slate-400 shrink-0">{seen.size}/3 utforsket</span>
            </div>
        </div>
    );
}
