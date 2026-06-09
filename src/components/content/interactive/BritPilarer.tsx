import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Link2, Star } from 'lucide-react';

interface Pilar {
    id: string;
    hebrewLabel: string;
    name: string;
    subtitle: string;
    description: string;
    examples: string[];
    accentColor: string;
    bgFrom: string;
    badgeClass: string;
    ringClass: string;
}

const PILARER: Pilar[] = [
    {
        id: 'shema',
        hebrewLabel: 'שְׁמַע',
        name: 'Shema',
        subtitle: 'Én Gud',
        description:
            'Kjernebekjennelsen i jødedommen lyder: "Hør, Israel - Herren er vår Gud, Herren er én." Troen på én Gud er absolutt. Gud er skaperen, lovgiveren og dommeren - barmhjertig og rettferdig. Det er ingen treenighet og ingen gudesønn. Bare én.',
        examples: [
            'Shema leses to ganger daglig - om morgenen og om kvelden',
            'Det er de første ordene et jødisk barn lærer',
            'Mange jøder leser Shema som siste ord de uttaler',
        ],
        accentColor: '#d97706',
        bgFrom: 'from-amber-50',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
        ringClass: 'ring-amber-400',
    },
    {
        id: 'brit',
        hebrewLabel: 'בְּרִית',
        name: 'Brit',
        subtitle: 'Pakten',
        description:
            'Brit betyr pakt - en toveis avtale mellom Gud og det jødiske folk. Gud lovet Abraham etterkommere og et eget land. I gjengjeld forpliktet folket seg til å følge Guds bud. Ikke én part som gir: begge har ansvar. Det er denne gjensidigheten som gjør jødedommen unik.',
        examples: [
            'Abraham er den første som inngår pakten med Gud',
            'Moses fornyer pakten på Sinai-fjellet med de ti bud',
            'Jødene ser seg som Guds utvalgte folk - ikke fordi de er bedre, men fordi de har et særlig ansvar',
        ],
        accentColor: '#2563eb',
        bgFrom: 'from-blue-50',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
        ringClass: 'ring-blue-400',
    },
    {
        id: 'mitzvot',
        hebrewLabel: 'מִצְווֹת',
        name: 'Mitzvot',
        subtitle: '613 bud',
        description:
            'Mitzvot er de 613 budene som regulerer alt: hva du spiser (kashrut), når du hviler (Shabbat), hvordan du behandler andre, og hva du gir til fattige. Hele livet er hellig - ikke bare én dag i uken. Jødedommen er en handlingsreligion: religion er noe du gjør, ikke bare noe du tror.',
        examples: [
            'Kashrut - kostholdsregler: ikke svin, ikke blandede kjøtt- og melkeretter',
            'Shabbat - hvile fra fredag kveld til lørdag kveld er et bud, ikke bare en tradisjon',
            'Tzedakah - å gi til de fattige er en plikt, ikke frivillig veldedighet',
        ],
        accentColor: '#16a34a',
        bgFrom: 'from-green-50',
        badgeClass: 'bg-green-100 text-green-700 border-green-200',
        ringClass: 'ring-green-400',
    },
];

export function BritPilarer() {
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

    const allSeen = seen.size === PILARER.length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">Jødedommens tre søyler</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hver søyle for å utforske kjernebegrepet
                    </p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {PILARER.map((pilar, idx) => {
                    const isOpen = expanded === pilar.id;
                    const isSeen = seen.has(pilar.id);
                    return (
                        <motion.div
                            key={pilar.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                isOpen
                                    ? `ring-2 ${pilar.ringClass} border-transparent`
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <button
                                onClick={() => toggle(pilar.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left bg-gradient-to-r ${pilar.bgFrom} to-white transition-colors`}
                            >
                                <span
                                    className="text-lg font-bold shrink-0 w-12 text-right leading-none"
                                    style={{ color: pilar.accentColor, fontFamily: 'serif' }}
                                >
                                    {pilar.hebrewLabel}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${pilar.badgeClass}`}
                                        >
                                            {pilar.name}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            {pilar.subtitle}
                                        </span>
                                    </div>
                                </div>
                                {isSeen && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                                <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="shrink-0 text-slate-400"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                                    >
                                        <div className="px-4 pb-4 pt-1">
                                            <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                                {pilar.description}
                                            </p>
                                            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                                                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                                                    I praksis
                                                </div>
                                                <ul className="flex flex-col gap-1.5">
                                                    {pilar.examples.map((ex, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-2 text-sm text-slate-700"
                                                        >
                                                            <span
                                                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                                                style={{
                                                                    backgroundColor: pilar.accentColor,
                                                                }}
                                                            />
                                                            {ex}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Sammenhengen
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {PILARER.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-2">
                            <span
                                className={`text-sm font-semibold px-2.5 py-1 rounded-full transition-all duration-500 ${
                                    seen.has(p.id)
                                        ? `${p.badgeClass} border`
                                        : 'bg-slate-200 text-slate-400'
                                }`}
                            >
                                {p.name}
                            </span>
                            {i < PILARER.length - 1 && (
                                <Link2
                                    className={`w-3.5 h-3.5 transition-colors duration-500 ${
                                        seen.has(p.id) && seen.has(PILARER[i + 1].id)
                                            ? 'text-slate-400'
                                            : 'text-slate-200'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                    <span className="text-xs text-slate-500 ml-1">= Tikkun Olam</span>
                </div>
            </div>

            <AnimatePresence>
                {allSeen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-4 mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Én Gud (Shema) skapte pakten (Brit) som forplikter til handlinger (Mitzvot)
                        - og alt dette sammen driver Tikkun Olam: å reparere verden.
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-4 pb-4 flex items-center gap-2">
                {PILARER.map((p) => (
                    <div
                        key={p.id}
                        className="flex-1 h-1.5 rounded-full transition-all duration-500"
                        style={{ backgroundColor: seen.has(p.id) ? p.accentColor : '#e2e8f0' }}
                    />
                ))}
                <span className="text-xs text-slate-400 shrink-0">
                    {seen.size}/{PILARER.length} utforsket
                </span>
            </div>
        </div>
    );
}
