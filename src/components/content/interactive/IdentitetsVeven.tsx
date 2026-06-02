import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Lightbulb, ArrowLeftRight } from 'lucide-react';

// Signaturkomponent for "Identitet og mangfold".
// Lyspære: identitet er mange lag, ikke ett stempel. Du deler alltid noe med
// alle, og skiller deg alltid fra alle. Eleven velger to ungdommer og ser
// fasettene deres veve seg inn i tre kolonner - Bare A, Delt, Bare B - og
// oppdager at to "ulike" personer deler mer enn du tror, og to "like" aldri
// er helt identiske. Likskap og ulikskap finnes i hvert eneste par.

interface Person {
    id: string;
    name: string;
    color: string; // avatar-farge
    short: string; // én linje
    // Samme seks kategorier for alle, så sammenligning gir mening.
    facets: Record<Category, string>;
}

type Category = 'Alder' | 'Bosted' | 'Språk hjemme' | 'Tro' | 'Fritid' | 'Familie';

const CATEGORIES: Category[] = ['Alder', 'Bosted', 'Språk hjemme', 'Tro', 'Fritid', 'Familie'];

const PEOPLE: Person[] = [
    {
        id: 'leila',
        name: 'Leila',
        color: '#db2777',
        short: 'Norsk-marokkansk, kaptein på jentelaget',
        facets: {
            Alder: '15 år',
            Bosted: 'Drammen',
            'Språk hjemme': 'Norsk + arabisk',
            Tro: 'Muslim',
            Fritid: 'Fotball',
            Familie: 'Storfamilie',
        },
    },
    {
        id: 'jonas',
        name: 'Jonas',
        color: '#2563eb',
        short: 'Etnisk norsk, gamer og keeper',
        facets: {
            Alder: '15 år',
            Bosted: 'Drammen',
            'Språk hjemme': 'Norsk',
            Tro: 'Ingen',
            Fritid: 'Fotball',
            Familie: 'Delt bosted',
        },
    },
    {
        id: 'amina',
        name: 'Amina',
        color: '#7c3aed',
        short: 'Norsk-somalisk, elsker å tegne',
        facets: {
            Alder: '16 år',
            Bosted: 'Oslo',
            'Språk hjemme': 'Norsk + somali',
            Tro: 'Muslim',
            Fritid: 'Tegning',
            Familie: 'Storfamilie',
        },
    },
    {
        id: 'sondre',
        name: 'Sondre',
        color: '#059669',
        short: 'Vokst opp på gård i Trøndelag',
        facets: {
            Alder: '14 år',
            Bosted: 'Trøndelag',
            'Språk hjemme': 'Norsk',
            Tro: 'Kristen',
            Fritid: 'Fotball + ski',
            Familie: 'Bor på gård',
        },
    },
];

// Kuraterte innsiktsmeldinger per par (sortert id-par som nøkkel).
const PAIR_MESSAGE: Record<string, string> = {
    'jonas|leila':
        'En norsk-marokkansk muslim og en etnisk norsk gutt - likevel deler de tre ting: alder, hjemby og fotball. "Oss mot dem" sprekker så snart du ser alle lagene.',
    'amina|leila':
        'To muslimske jenter, men de er langt fra like: ulik alder, by, språk og fritid. Samme tro betyr ikke samme person.',
    'leila|sondre':
        'På overflaten helt ulike liv - by mot gård, muslim mot kristen. Men begge er fotballglade tenåringer. Du deler alltid noe med alle.',
    'amina|jonas':
        'Lite til felles her - bare språket norsk. Men ingen av dem kan reduseres til ett stempel: begge er mange ting på en gang.',
    'jonas|sondre':
        'To etnisk norske gutter, men ulik by, tro, familie og fritid. Selv folk fra "samme gruppe" er aldri kopier av hverandre.',
    'amina|sondre':
        'Ulik bakgrunn, ulik tro, ulik by - men begge er kreative tenåringer med sterke familiebånd. Forskjell og likhet finnes side om side.',
};

function pairKey(a: string, b: string) {
    return [a, b].sort().join('|');
}

export const IdentitetsVeven: React.FC = () => {
    // Inntil to valgte personer (rekkefølge bevart: [A, B]).
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (id: string) => {
        setSelected((cur) => {
            if (cur.includes(id)) return cur.filter((x) => x !== id);
            if (cur.length < 2) return [...cur, id];
            // Allerede to valgt: skyv ut den eldste.
            return [cur[1], id];
        });
    };

    const a = selected[0] ? PEOPLE.find((p) => p.id === selected[0])! : null;
    const b = selected[1] ? PEOPLE.find((p) => p.id === selected[1])! : null;

    const comparison = useMemo(() => {
        if (!a || !b) return null;
        const shared: Category[] = [];
        const onlyA: Category[] = [];
        const onlyB: Category[] = [];
        for (const c of CATEGORIES) {
            if (a.facets[c] === b.facets[c]) shared.push(c);
            else {
                onlyA.push(c);
                onlyB.push(c);
            }
        }
        return { shared, onlyA, onlyB };
    }, [a, b]);

    const message = a && b ? PAIR_MESSAGE[pairKey(a.id, b.id)] : null;

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-fuchsia-50 to-indigo-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Users className="w-5 h-5 text-fuchsia-600" />
                    <h3 className="font-display font-bold text-lg">Vev sammen to identiteter</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Velg to ungdommer. Se hvilke trekk de deler, og hvilke som skiller dem. Ingen er
                    bare ett stempel.
                </p>
            </div>

            {/* Personvelger */}
            <div className="px-5 pt-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PEOPLE.map((p) => {
                        const isSel = selected.includes(p.id);
                        const slot = selected.indexOf(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => toggle(p.id)}
                                className={`relative text-left rounded-xl border p-3 transition ${
                                    isSel
                                        ? 'border-transparent shadow-md'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}
                                style={isSel ? { backgroundColor: `${p.color}14` } : undefined}
                            >
                                {isSel && (
                                    <motion.span
                                        layoutId="vev-selring"
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow"
                                        style={{ backgroundColor: p.color }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                                    >
                                        {slot === 0 ? 'A' : 'B'}
                                    </motion.span>
                                )}
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                                        style={{ backgroundColor: p.color }}
                                    >
                                        {p.name[0]}
                                    </span>
                                    <span className="font-semibold text-slate-800 leading-tight">
                                        {p.name}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                                    {p.short}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Veven */}
            <div className="p-5">
                <AnimatePresence mode="wait">
                    {!a || !b ? (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
                        >
                            <ArrowLeftRight className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">
                                {selected.length === 1
                                    ? 'Velg én person til, så vever vi identitetene sammen.'
                                    : 'Velg to personer for å se hva de deler - og hva som skiller dem.'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={pairKey(a.id, b.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Delt-teller */}
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-fuchsia-500" />
                                <span className="text-sm font-bold text-slate-700">
                                    {a.name} og {b.name} deler{' '}
                                    <span className="text-fuchsia-600">
                                        {comparison!.shared.length} av {CATEGORIES.length}
                                    </span>{' '}
                                    trekk
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-start">
                                <Column
                                    title={`Bare ${a.name}`}
                                    accent={a.color}
                                    cats={comparison!.onlyA}
                                    person={a}
                                />
                                <Column
                                    title="Delt"
                                    accent="#9333ea"
                                    highlight
                                    cats={comparison!.shared}
                                    person={a}
                                />
                                <Column
                                    title={`Bare ${b.name}`}
                                    accent={b.color}
                                    cats={comparison!.onlyB}
                                    person={b}
                                />
                            </div>

                            {message && (
                                <motion.div
                                    key={`msg-${pairKey(a.id, b.id)}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-900"
                                >
                                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                                    <p>{message}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-fuchsia-50 border-t border-fuchsia-100 px-5 py-3 text-sm text-fuchsia-900">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-fuchsia-600" />
                <p>
                    Identitet er satt sammen av mange lag. Ingen er helt lik deg - og ingen er helt
                    ulik deg heller. Derfor sier ett stempel aldri hele sannheten om et menneske.
                </p>
            </div>
        </div>
    );
};

// Én kolonne med fasett-brikker.
function Column({
    title,
    accent,
    cats,
    person,
    highlight,
}: {
    title: string;
    accent: string;
    cats: Category[];
    person: Person;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border p-2.5 sm:p-3 min-h-[140px] ${
                highlight ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-slate-50'
            }`}
        >
            <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 truncate">
                    {title}
                </span>
            </div>
            <div className="flex flex-col gap-1.5">
                <AnimatePresence mode="popLayout">
                    {cats.length === 0 && (
                        <motion.span
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[11px] text-slate-400 italic"
                        >
                            {highlight ? 'Ingen felles trekk her' : 'Alt er delt'}
                        </motion.span>
                    )}
                    {cats.map((c) => (
                        <motion.div
                            key={c}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                            className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 shadow-sm"
                        >
                            <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                {c}
                            </span>
                            <span className="block text-xs font-semibold text-slate-700 leading-tight">
                                {person.facets[c]}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
