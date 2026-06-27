import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';

// Lyspaere-oeyeblikket: Etter denne interaksjonen skal eleven forstaa at
// helleristninger er kilder vi maa TOLKE. Vi kan resonnere oss fram til hva de
// kan bety, men vi kan sjelden vaere helt sikre. Det er nettopp slik en
// historiker leser et spor fra fortida.

interface Tydning {
    tekst: string;
    forskerne: boolean; // er dette tolkningen forskerne heller mot?
}

interface Motiv {
    id: string;
    navn: string;
    figur: 'baat' | 'sol' | 'elg' | 'jeger';
    sporsmal: string;
    tydninger: Tydning[];
    fasit: string; // hva forskerne tror
    sikkerhet: 'ganske-sikkert' | 'usikkert';
}

const MOTIVER: Motiv[] = [
    {
        id: 'baat',
        navn: 'Båten',
        figur: 'baat',
        sporsmal: 'Hva tror du båten betyr?',
        tydninger: [
            { tekst: 'En ekte båt folk reiste i', forskerne: false },
            { tekst: 'En reise, kanskje sjelens ferd etter døden', forskerne: true },
            { tekst: 'Bare pynt uten mening', forskerne: false },
        ],
        fasit: 'Båten er det vanligste motivet i Norden. Mange forskere tror den viser en reise. Noen mener en ekte ferd over havet, andre sjelens reise etter døden. Vi vet ikke sikkert.',
        sikkerhet: 'usikkert',
    },
    {
        id: 'sol',
        navn: 'Solhjulet',
        figur: 'sol',
        sporsmal: 'Hva tror du solhjulet betyr?',
        tydninger: [
            { tekst: 'Solen som ga lys, varme og avlinger', forskerne: true },
            { tekst: 'Et vognhjul', forskerne: false },
            { tekst: 'En blomst', forskerne: false },
        ],
        fasit: 'Solen var trolig hellig i bronsealderen. Den styrte lys, varme og når kornet kunne høstes. Solsymboler dukker opp over hele Norden.',
        sikkerhet: 'ganske-sikkert',
    },
    {
        id: 'elg',
        navn: 'Elgen',
        figur: 'elg',
        sporsmal: 'Hva tror du elgen betyr?',
        tydninger: [
            { tekst: 'Et viktig jaktdyr', forskerne: true },
            { tekst: 'Et kjæledyr', forskerne: false },
            { tekst: 'Et uhyre folk var redde for', forskerne: false },
        ],
        fasit: 'Elg og rein var livsviktig mat for jegerne. Mange tror de hugget dyrene i stein for å sikre seg jaktlykke.',
        sikkerhet: 'ganske-sikkert',
    },
    {
        id: 'jeger',
        navn: 'Jegeren',
        figur: 'jeger',
        sporsmal: 'Hva tror du figuren med bue betyr?',
        tydninger: [
            { tekst: 'En jeger på jakt', forskerne: true },
            { tekst: 'En kriger i kamp', forskerne: false },
            { tekst: 'En gud fra himmelen', forskerne: false },
        ],
        fasit: 'Figurer med bue viser nok jakt. Men noen kan også være ritualer for å sikre god fangst. Grensa mellom jakt og magi er uklar.',
        sikkerhet: 'usikkert',
    },
];

function CarvingIcon({ figur }: { figur: Motiv['figur'] }) {
    const stroke = '#b91c1c';
    const common = {
        fill: 'none',
        stroke,
        strokeWidth: 3,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
    };
    return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {figur === 'baat' && (
                <g {...common}>
                    <path d="M8 40 Q32 54 56 40" />
                    <path d="M8 40 L6 32" />
                    <path d="M56 40 L58 30" />
                    <line x1="18" y1="44" x2="18" y2="30" />
                    <line x1="26" y1="46" x2="26" y2="30" />
                    <line x1="34" y1="46" x2="34" y2="30" />
                    <line x1="42" y1="45" x2="42" y2="30" />
                </g>
            )}
            {figur === 'sol' && (
                <g {...common}>
                    <circle cx="32" cy="32" r="14" />
                    <line x1="32" y1="6" x2="32" y2="58" />
                    <line x1="6" y1="32" x2="58" y2="32" />
                    <line x1="14" y1="14" x2="50" y2="50" />
                    <line x1="50" y1="14" x2="14" y2="50" />
                </g>
            )}
            {figur === 'elg' && (
                <g {...common}>
                    <path d="M14 46 L14 30 Q14 22 24 22 L44 22 Q50 22 50 28" />
                    <line x1="18" y1="46" x2="18" y2="56" />
                    <line x1="40" y1="46" x2="40" y2="56" />
                    <path d="M50 28 L54 18" />
                    <path d="M52 22 L46 16" />
                    <path d="M54 22 L60 16" />
                </g>
            )}
            {figur === 'jeger' && (
                <g {...common}>
                    <circle cx="32" cy="14" r="6" />
                    <line x1="32" y1="20" x2="32" y2="42" />
                    <line x1="32" y1="42" x2="24" y2="56" />
                    <line x1="32" y1="42" x2="40" y2="56" />
                    <line x1="32" y1="28" x2="48" y2="24" />
                    <path d="M48 12 Q56 24 48 36" />
                    <line x1="48" y1="24" x2="32" y2="28" />
                </g>
            )}
        </svg>
    );
}

interface HelleristningTyderProps {
    title?: string;
}

export function HelleristningTyder({
    title = 'Tyd helleristningene',
}: HelleristningTyderProps) {
    const [aktiv, setAktiv] = useState<string | null>(null);
    const [svar, setSvar] = useState<Record<string, string>>({});

    const ferdig = Object.keys(svar).length === MOTIVER.length;
    const motiv = MOTIVER.find((m) => m.id === aktiv) ?? null;
    const valgt = motiv ? svar[motiv.id] : undefined;

    const velgTydning = (motivId: string, tekst: string) => {
        setSvar((s) => (s[motivId] ? s : { ...s, [motivId]: tekst }));
    };

    const handleReset = () => {
        setAktiv(null);
        setSvar({});
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk en figur og gjett hva den kan bety. Se etterpå hva forskerne tror.
                    </p>
                </div>
            </div>

            {/* Motivvelger */}
            <div className="px-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MOTIVER.map((m) => {
                    const løst = !!svar[m.id];
                    const erAktiv = aktiv === m.id;
                    return (
                        <motion.button
                            key={m.id}
                            onClick={() => setAktiv(m.id)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                                erAktiv
                                    ? 'border-indigo-400 bg-indigo-50 shadow-md'
                                    : løst
                                      ? 'border-emerald-200 bg-emerald-50'
                                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                            <div className="w-12 h-12">
                                <CarvingIcon figur={m.figur} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{m.navn}</span>
                            {løst && (
                                <CheckCircle2 className="absolute top-1.5 right-1.5 w-4 h-4 text-emerald-500" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Interaksjons- og feedback-sone (alltid i DOM) */}
            <div className="px-6 py-4 min-h-[150px]">
                <AnimatePresence mode="wait">
                    {!motiv ? (
                        <motion.p
                            key="tom"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-slate-400 flex items-center gap-2 pt-6"
                        >
                            <HelpCircle className="w-4 h-4" /> Velg en av figurene over for å
                            begynne å tyde.
                        </motion.p>
                    ) : !valgt ? (
                        <motion.div
                            key={`q-${motiv.id}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-sm font-medium text-slate-700 mb-3">
                                {motiv.sporsmal}
                            </p>
                            <div className="flex flex-col gap-2">
                                {motiv.tydninger.map((t) => (
                                    <button
                                        key={t.tekst}
                                        onClick={() => velgTydning(motiv.id, t.tekst)}
                                        className="text-left text-sm rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 transition-colors"
                                    >
                                        {t.tekst}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`a-${motiv.id}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col gap-3"
                        >
                            <div
                                className={`text-sm font-medium ${
                                    motiv.tydninger.find((t) => t.tekst === valgt)?.forskerne
                                        ? 'text-emerald-700'
                                        : 'text-indigo-700'
                                }`}
                            >
                                {motiv.tydninger.find((t) => t.tekst === valgt)?.forskerne
                                    ? 'Du tenkte som forskerne!'
                                    : 'Godt resonnert! Forskerne heller mot noe annet.'}
                            </div>
                            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                                {motiv.fasit}
                            </div>
                            <span
                                className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${
                                    motiv.sikkerhet === 'ganske-sikkert'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                                {motiv.sikkerhet === 'ganske-sikkert'
                                    ? 'Forskerne er ganske sikre'
                                    : 'Her er forskerne usikre'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Suksess-sone */}
            <AnimatePresence>
                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                    >
                        <motion.span
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                        >
                            <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                        </motion.span>
                        <span>
                            Du tydet alle fire figurene som en arkeolog: du resonnerte deg fram til
                            mening, men måtte godta at noen svar er usikre. Slik leser vi spor fra
                            fortida.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    Tydet {Object.keys(svar).length} av {MOTIVER.length}
                </span>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
