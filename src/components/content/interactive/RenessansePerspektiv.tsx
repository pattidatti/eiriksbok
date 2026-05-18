import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Church, User, Crown, Compass, Palette, Telescope } from 'lucide-react';

interface RenessansePerspektivProps {
    title?: string;
    intro?: string;
}

type Shift = {
    id: string;
    icon: typeof User;
    sporsmal: string;
    middelalder: { svar: string; bilde: string };
    renessanse: { svar: string; bilde: string; sitat?: { tekst: string; kilde: string } };
};

const SHIFTS: Shift[] = [
    {
        id: 'menneske',
        icon: User,
        sporsmal: 'Hva er mennesket?',
        middelalder: {
            svar: 'En syndig sjel på vei mot Gud. Vi er små og lave. Jordelivet er en kort prøvelse før himmelen.',
            bilde: '👤⛪',
        },
        renessanse: {
            svar: 'Et mikrokosmos — en hel verden i seg selv. Vi har uendelig potensial og kan velge hvem vi vil bli.',
            bilde: '🧍✨',
            sitat: {
                tekst: 'Du kan stige opp til det guddommelige, eller synke til det dyriske. Du velger selv.',
                kilde: 'Pico della Mirandola, "Om menneskets verdighet" (1486)',
            },
        },
    },
    {
        id: 'sannhet',
        icon: Telescope,
        sporsmal: 'Hvor finner vi sannheten?',
        middelalder: {
            svar: 'I Bibelen og hos kirkens lærde. Det Kirken sier, er sant. Å tvile er farlig.',
            bilde: '📖✝️',
        },
        renessanse: {
            svar: 'I Bibelen, ja — men også i antikkens bøker, i naturen, og gjennom egne øyne. Observer og tenk selv.',
            bilde: '🔭📚',
        },
    },
    {
        id: 'kunst',
        icon: Palette,
        sporsmal: 'Hvordan ser vi verden?',
        middelalder: {
            svar: 'Flat. Gullbakgrunn. Helgener er størst, vanlige folk er små. Bildet skal vise hva som er hellig, ikke hva øyet ser.',
            bilde: '🟨👼',
        },
        renessanse: {
            svar: 'I perspektiv. Med dybde, lys og skygge. Maleriet skal vise verden slik den faktisk ser ut — også mennesket.',
            bilde: '🖼️🌅',
        },
    },
    {
        id: 'liv',
        icon: Crown,
        sporsmal: 'Hva er et godt liv?',
        middelalder: {
            svar: 'Et liv viet bønn, lydighet og kirken. Stoltheten over egne evner er en synd.',
            bilde: '🙏🕯️',
        },
        renessanse: {
            svar: 'Å bli en "l\'uomo universale" — et helt menneske. Maler, kriger, dikter, ingeniør og filosof i én person.',
            bilde: '🎨⚔️📐',
            sitat: {
                tekst: 'Jern ruster av mangel på bruk; stillestående vann mister sin renhet — slik også gjør et stillesittende sinn.',
                kilde: 'Leonardo da Vinci',
            },
        },
    },
];

type Phase = 'idle' | 'exploring' | 'complete';

export function RenessansePerspektiv({
    title = 'Renessansens perspektivskifte',
    intro = 'Trykk på hvert spørsmål for å se hvordan svaret skiftet fra middelalder til renessanse.',
}: RenessansePerspektivProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [aktivId, setAktivId] = useState<string | null>(null);
    const [utforsket, setUtforsket] = useState<Set<string>>(new Set());

    const handleVelg = (id: string) => {
        const nyttSett = new Set(utforsket);
        nyttSett.add(id);
        setUtforsket(nyttSett);
        setAktivId(id);
        if (nyttSett.size === SHIFTS.length) {
            setPhase('complete');
        } else if (phase === 'idle') {
            setPhase('exploring');
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setAktivId(null);
        setUtforsket(new Set());
    };

    const aktiv = SHIFTS.find((s) => s.id === aktivId);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    {SHIFTS.map((s) => {
                        const Icon = s.icon;
                        const erAktiv = aktivId === s.id;
                        const erUtforsket = utforsket.has(s.id);
                        return (
                            <button
                                key={s.id}
                                onClick={() => handleVelg(s.id)}
                                className={`p-3 rounded-xl border text-left transition-colors ${
                                    erAktiv
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                        : erUtforsket
                                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-4 h-4 mb-1" />
                                <div className="text-xs font-medium leading-tight">{s.sporsmal}</div>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {aktiv ? (
                        <motion.div
                            key={aktiv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="grid sm:grid-cols-2 gap-3"
                        >
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2 text-amber-700">
                                    <Church className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        Middelalderens svar
                                    </span>
                                </div>
                                <div className="text-3xl mb-2">{aktiv.middelalder.bilde}</div>
                                <p className="text-sm text-amber-900 leading-relaxed">
                                    {aktiv.middelalder.svar}
                                </p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                    <Compass className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        Renessansens svar
                                    </span>
                                </div>
                                <div className="text-3xl mb-2">{aktiv.renessanse.bilde}</div>
                                <p className="text-sm text-emerald-900 leading-relaxed">
                                    {aktiv.renessanse.svar}
                                </p>
                                {aktiv.renessanse.sitat && (
                                    <blockquote className="mt-3 pt-3 border-t border-emerald-200 text-xs italic text-emerald-800">
                                        "{aktiv.renessanse.sitat.tekst}"
                                        <footer className="not-italic mt-1 text-emerald-600">
                                            — {aktiv.renessanse.sitat.kilde}
                                        </footer>
                                    </blockquote>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500"
                        >
                            Velg et spørsmål for å se hvordan svaret skiftet.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                    >
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong>Du har sett renessansens kjerne.</strong> Alle fire spørsmål
                                fikk nye svar — fordi mennesket fikk en ny rolle. Fra brikke i Guds
                                plan til hovedperson i sitt eget liv.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    {utforsket.size} av {SHIFTS.length} skift utforsket
                </div>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
