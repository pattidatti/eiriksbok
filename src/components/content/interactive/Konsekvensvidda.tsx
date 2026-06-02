import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Car,
    Landmark,
    ShoppingBag,
    User,
    Users,
    Clock,
    CalendarRange,
    Lightbulb,
    Eye,
} from 'lucide-react';

// Signaturkomponent for km-14 (Lover, normer og konsekvenser).
// Kjerne: kompetansemålet ber eleven DRØFTE konsekvenser av regelbrudd "for den
// enkelte og for samfunnet på kort og lang sikt". Det er nettopp en 2x2-matrise:
// Den enkelte / Samfunnet  x  Kort sikt / Lang sikt.
// Eleven velger et regelbrudd og avdekker hver rute. Aha-en: ruta "den enkelte /
// kort sikt" ser nesten alltid harmløs ut (du tjener på det), mens "samfunnet /
// lang sikt" er den alvorlige. Konsekvenser vokser når du beveger deg utover i
// tid og omfang. Det du knapt merker nært, blir dyrt i stor skala over tid.

type Axis = 'enkelt' | 'samfunn';
type Term = 'kort' | 'lang';
type CellKey = `${Axis}-${Term}`;

interface Cell {
    text: string;
    // 0 = nesten ufarlig, 3 = svært alvorlig. Styrer fargen og glød.
    severity: 0 | 1 | 2 | 3;
}

interface Case {
    id: string;
    label: string;
    sub: string;
    icon: typeof GraduationCap;
    kind: string; // lovbrudd / normbrudd
    cells: Record<CellKey, Cell>;
}

const CASES: Case[] = [
    {
        id: 'juks',
        label: 'Juks på prøve',
        sub: 'Normbrudd og regelbrudd',
        icon: GraduationCap,
        kind: 'Regelbrudd',
        cells: {
            'enkelt-kort': {
                text: 'Du får kanskje en bedre karakter på prøven enn du hadde fortjent.',
                severity: 0,
            },
            'enkelt-lang': {
                text: 'Du sitter igjen med hull i kunnskapen og en vane med å ta snarveier som er vanskelig å bli kvitt.',
                severity: 2,
            },
            'samfunn-kort': {
                text: 'Karakteren din blir litt mindre å stole på enn dem som faktisk kunne stoffet.',
                severity: 1,
            },
            'samfunn-lang': {
                text: 'Blir juks vanlig, mister vitnemål og prøver verdi. Da kan ingen stole på hva en karakter egentlig betyr.',
                severity: 3,
            },
        },
    },
    {
        id: 'fyllekjoring',
        label: 'Fyllekjøring',
        sub: 'Brudd på straffeloven',
        icon: Car,
        kind: 'Lovbrudd',
        cells: {
            'enkelt-kort': {
                text: 'Du sparer en taxi og kommer kjapt hjem.',
                severity: 0,
            },
            'enkelt-lang': {
                text: 'Førerkortet ryker, du får bot eller fengsel, og må leve med at du kunne ha skadet noen.',
                severity: 3,
            },
            'samfunn-kort': {
                text: 'Én sjåfør til som setter andre i livsfare på veien akkurat nå.',
                severity: 2,
            },
            'samfunn-lang': {
                text: 'Blir fyllekjøring normalisert, blir veiene farligere for alle, og flere liv går tapt hvert år.',
                severity: 3,
            },
        },
    },
    {
        id: 'lyve',
        label: 'Politiker lyver til Stortinget',
        sub: 'Brudd på sterk norm',
        icon: Landmark,
        kind: 'Normbrudd',
        cells: {
            'enkelt-kort': {
                text: 'Politikeren slipper unna en pinlig sannhet akkurat nå.',
                severity: 0,
            },
            'enkelt-lang': {
                text: 'Når løgnen blir avslørt, mister velgerne tilliten, og politikeren kan miste jobben.',
                severity: 2,
            },
            'samfunn-kort': {
                text: 'Stortinget tar kanskje en viktig beslutning på feil grunnlag.',
                severity: 2,
            },
            'samfunn-lang': {
                text: 'Tilliten til dem som styrer svekkes. Mister folk troen på politikerne, vakler hele demokratiet.',
                severity: 3,
            },
        },
    },
    {
        id: 'tyveri',
        label: 'Stjele i butikk',
        sub: 'Brudd på straffeloven',
        icon: ShoppingBag,
        kind: 'Lovbrudd',
        cells: {
            'enkelt-kort': {
                text: 'Du får en vare uten å betale for den.',
                severity: 0,
            },
            'enkelt-lang': {
                text: 'Blir du tatt, får du en anmerkning som kan følge deg når du søker jobb i årevis.',
                severity: 2,
            },
            'samfunn-kort': {
                text: 'Butikken taper penger på akkurat denne varen.',
                severity: 1,
            },
            'samfunn-lang': {
                text: 'Mye tyveri gir høyere priser, mer overvåking og mindre tillit mellom folk og butikker.',
                severity: 3,
            },
        },
    },
];

const SEVERITY = {
    0: { dot: 'bg-emerald-500', tint: 'bg-emerald-50', border: 'border-emerald-300', word: 'Knapt merkbart', text: 'text-emerald-700' },
    1: { dot: 'bg-amber-500', tint: 'bg-amber-50', border: 'border-amber-300', word: 'Litt alvorlig', text: 'text-amber-700' },
    2: { dot: 'bg-orange-500', tint: 'bg-orange-50', border: 'border-orange-300', word: 'Alvorlig', text: 'text-orange-700' },
    3: { dot: 'bg-rose-500', tint: 'bg-rose-50', border: 'border-rose-400', word: 'Svært alvorlig', text: 'text-rose-700' },
} as const;

const ROWS: { term: Term; label: string; icon: typeof Clock }[] = [
    { term: 'kort', label: 'Kort sikt', icon: Clock },
    { term: 'lang', label: 'Lang sikt', icon: CalendarRange },
];

const COLS: { axis: Axis; label: string; icon: typeof User }[] = [
    { axis: 'enkelt', label: 'Den enkelte', icon: User },
    { axis: 'samfunn', label: 'Samfunnet', icon: Users },
];

export const Konsekvensvidda = () => {
    const [activeId, setActiveId] = useState<string>(CASES[0].id);
    const [revealed, setRevealed] = useState<Set<CellKey>>(new Set());

    const active = useMemo(() => CASES.find((c) => c.id === activeId)!, [activeId]);
    const allKeys: CellKey[] = ['enkelt-kort', 'enkelt-lang', 'samfunn-kort', 'samfunn-lang'];
    const allRevealed = allKeys.every((k) => revealed.has(k));

    const pickCase = (id: string) => {
        setActiveId(id);
        setRevealed(new Set());
    };

    const reveal = (key: CellKey) => {
        setRevealed((prev) => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    };

    return (
        <div className="my-10 rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 sm:p-7 shadow-lg">
            <div className="mb-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Hvor langt rekker et regelbrudd?
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                    Konsekvensvidda
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
                    Velg et regelbrudd. Klikk deg gjennom de fire rutene og se hvor konsekvensene
                    treffer: den enkelte eller samfunnet, på kort eller lang sikt.
                </p>
            </div>

            {/* Velg regelbrudd */}
            <div className="mb-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {CASES.map((c) => {
                    const Icon = c.icon;
                    const on = c.id === activeId;
                    return (
                        <button
                            key={c.id}
                            onClick={() => pickCase(c.id)}
                            className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition ${
                                on
                                    ? 'border-amber-400 bg-amber-100 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50'
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                                    on ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-bold leading-tight text-slate-800">
                                    {c.label}
                                </span>
                                <span className="block text-[11px] font-semibold text-slate-400">
                                    {c.kind}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 2x2-matrisen */}
            <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-slate-200">
                <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3">
                    {/* topp-rad: kolonneoverskrifter */}
                    <div />
                    {COLS.map((col) => {
                        const ColIcon = col.icon;
                        return (
                            <div
                                key={col.axis}
                                className="flex items-center justify-center gap-1.5 pb-1 text-slate-700"
                            >
                                <ColIcon className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-bold">{col.label}</span>
                            </div>
                        );
                    })}

                    {/* rader */}
                    {ROWS.map((row) => {
                        const RowIcon = row.icon;
                        return (
                            <FragmentRow key={row.term}>
                                <div className="flex flex-col items-center justify-center gap-1 pr-1 text-slate-700">
                                    <RowIcon className="h-4 w-4 text-slate-400" />
                                    <span className="text-center text-xs font-bold leading-tight">
                                        {row.label}
                                    </span>
                                </div>
                                {COLS.map((col) => {
                                    const key = `${col.axis}-${row.term}` as CellKey;
                                    return (
                                        <MatrixCell
                                            key={key}
                                            cell={active.cells[key]}
                                            shown={revealed.has(key)}
                                            onReveal={() => reveal(key)}
                                        />
                                    );
                                })}
                            </FragmentRow>
                        );
                    })}
                </div>
            </div>

            {/* Aha-melding når alle fire er avdekket */}
            <AnimatePresence>
                {allRevealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                        className="mt-5 flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4"
                    >
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
                            <Lightbulb className="h-5 w-5" />
                        </span>
                        <p className="text-sm font-medium leading-relaxed text-amber-900">
                            Legg merke til mønsteret: ruta <strong>«den enkelte, kort sikt»</strong> er
                            grønn og nesten ufarlig - derfor frister regelbruddet. Men beveger du deg
                            mot <strong>«samfunnet, lang sikt»</strong>, blir det rødt og alvorlig. Et
                            regelbrudd ser harmløst ut når du står tett på det, men koster mye når det
                            sprer seg i tid og omfang. Derfor finnes reglene.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function FragmentRow({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function MatrixCell({
    cell,
    shown,
    onReveal,
}: {
    cell: Cell;
    shown: boolean;
    onReveal: () => void;
}) {
    const sev = SEVERITY[cell.severity];
    return (
        <button
            onClick={onReveal}
            disabled={shown}
            className={`relative min-h-[120px] sm:min-h-[130px] overflow-hidden rounded-xl border-2 p-3 text-left transition ${
                shown
                    ? `${sev.tint} ${sev.border} cursor-default`
                    : 'border-dashed border-slate-300 bg-slate-50 hover:border-amber-300 hover:bg-amber-50 cursor-pointer'
            }`}
        >
            <AnimatePresence mode="wait">
                {shown ? (
                    <motion.div
                        key="open"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="flex h-full flex-col"
                    >
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${sev.dot}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wide ${sev.text}`}>
                                {sev.word}
                            </span>
                        </div>
                        <p className="text-[13px] font-medium leading-snug text-slate-700">
                            {cell.text}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="closed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400"
                    >
                        <Eye className="h-5 w-5" />
                        <span className="text-xs font-semibold">Klikk for å se</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
