import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ShoppingCart, Vote, Landmark, Sparkles, RotateCcw } from 'lucide-react';

interface Posisjon {
    id: string;
    label: string;
    sub?: string;
    markedstilgang: number;
    innflytelse: number;
    selvstyre: number;
    feedback: string;
}

const POSISJONER: Posisjon[] = [
    {
        id: 'alene',
        label: 'Stå helt alene',
        markedstilgang: 25,
        innflytelse: 0,
        selvstyre: 100,
        feedback: 'Norge bestemmer alt selv. Men uten avtaler blir det tollmurer, og det blir dyrt og vanskelig å selge varer til Europa. Bedrifter taper penger, og Norge står utenfor det store samarbeidet.',
    },
    {
        id: 'eos',
        label: 'EØS-avtalen',
        sub: 'Det Norge faktisk valgte',
        markedstilgang: 95,
        innflytelse: 20,
        selvstyre: 55,
        feedback: 'Dette er løsningen Norge valgte. Vi får selge varer fritt i hele EU og er en del av det indre markedet. Men her er haken: Norge må følge nesten alle EU-reglene uten å være med og stemme over dem. Vi følger reglene, men sitter ikke ved bordet der de lages.',
    },
    {
        id: 'medlem',
        label: 'Fullt EU-medlem',
        markedstilgang: 100,
        innflytelse: 90,
        selvstyre: 30,
        feedback: 'Som fullt medlem får Norge stemmerett og kan være med og bestemme reglene. Men da gir landet fra seg mer selvstyre, fordi EU får bestemme over flere områder. Folket stemte nei til dette to ganger, i 1972 og i 1994.',
    },
];

interface Maler {
    key: 'markedstilgang' | 'innflytelse' | 'selvstyre';
    label: string;
    desc: string;
    icon: typeof ShoppingCart;
    bar: string;
    text: string;
}

const MALERE: Maler[] = [
    {
        key: 'markedstilgang',
        label: 'Markedstilgang',
        desc: 'Hvor lett Norge kan selge varer til Europa',
        icon: ShoppingCart,
        bar: 'bg-emerald-500',
        text: 'text-emerald-700',
    },
    {
        key: 'innflytelse',
        label: 'Innflytelse på reglene',
        desc: 'Om Norge er med og bestemmer EUs regler',
        icon: Vote,
        bar: 'bg-indigo-500',
        text: 'text-indigo-700',
    },
    {
        key: 'selvstyre',
        label: 'Selvstyre',
        desc: 'Hvor mye Norge bestemmer helt selv',
        icon: Landmark,
        bar: 'bg-amber-500',
        text: 'text-amber-700',
    },
];

interface SuverenitetsSkalaProps {
    title?: string;
}

export function SuverenitetsSkala({ title = 'Hvor mye skal Norge samarbeide med Europa?' }: SuverenitetsSkalaProps) {
    const [valgt, setValgt] = useState<string | null>(null);
    const [utforsket, setUtforsket] = useState<string[]>([]);

    const pos = POSISJONER.find((p) => p.id === valgt) ?? null;
    const ferdig = utforsket.length === POSISJONER.length;

    const velg = (id: string) => {
        setValgt(id);
        setUtforsket((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const reset = () => {
        setValgt(null);
        setUtforsket([]);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk et valg og se hva Norge får og gir fra seg.
                    </p>
                </div>
            </div>

            {/* Posisjonsvalg */}
            <div className="p-6 pb-2">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {POSISJONER.map((p) => {
                        const aktiv = p.id === valgt;
                        const sett = utforsket.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => velg(p.id)}
                                className={`relative text-center rounded-xl border p-3 transition-colors ${
                                    aktiv
                                        ? 'bg-indigo-50 border-indigo-300 shadow-md'
                                        : 'bg-slate-50 border-slate-200 hover:shadow-sm hover:border-slate-300'
                                }`}
                            >
                                {sett && !aktiv && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                                )}
                                <span className="block text-sm font-bold text-slate-700 leading-tight">
                                    {p.label}
                                </span>
                                {p.sub && (
                                    <span className="block text-[11px] text-indigo-500 mt-0.5">
                                        {p.sub}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between px-1 text-[11px] font-medium text-slate-400">
                    <span>Mest selvstyre</span>
                    <span>Mest samarbeid</span>
                </div>
            </div>

            {/* Målere */}
            <div className="px-6 py-3 space-y-3">
                {MALERE.map((m) => {
                    const verdi = pos ? pos[m.key] : 0;
                    const Ikon = m.icon;
                    return (
                        <div key={m.key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                    <Ikon className={`w-4 h-4 ${m.text}`} />
                                    {m.label}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${pos ? m.text : 'text-slate-300'}`}>
                                    {verdi}%
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${m.bar}`}
                                    animate={{ width: `${verdi}%` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 mb-3 min-h-[64px]">
                <AnimatePresence mode="wait">
                    {pos ? (
                        <motion.div
                            key={pos.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
                                pos.id === 'eos'
                                    ? 'bg-blue-50 border border-blue-200 text-blue-800'
                                    : 'bg-slate-50 border border-slate-200 text-slate-700'
                            }`}
                        >
                            {pos.feedback}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tom"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400"
                        >
                            Velg et av de tre alternativene over for å se hva det betyr for Norge.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Suksess-sone */}
            <AnimatePresence>
                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800"
                    >
                        <p className="flex items-center gap-2 text-sm font-bold">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Du har sett byttehandelen!
                        </p>
                        <p className="text-xs mt-1 leading-relaxed">
                            Jo mer Norge samarbeider, jo mer markedstilgang og innflytelse, men jo mindre
                            selvstyre. EØS er mellomveien: Norge får nesten full tilgang til markedet, men
                            følger regler landet ikke selv er med og stemmer over.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    Utforsket {utforsket.length} av {POSISJONER.length}
                </span>
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
