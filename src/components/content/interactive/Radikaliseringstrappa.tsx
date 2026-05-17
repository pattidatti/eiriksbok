import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    DoorOpen,
    HeartHandshake,
    RefreshCw,
    Shield,
    Sparkles,
} from 'lucide-react';

type StepKind = 'start' | 'normal' | 'top';

interface TrappeSteg {
    id: string;
    tittel: string;
    tanke: string;
    paavirkning: string;
    utvei: string;
    utveiResultat: string;
    kind: StepKind;
}

const STEG: TrappeSteg[] = [
    {
        id: 'nysgjerrig',
        tittel: '1. Nysgjerrig',
        tanke: '«Voksne forstår ikke nyhetene. Jeg vil finne ut hva som egentlig skjer.»',
        paavirkning:
            'En venn deler en YouTube-video som lover «sannheten media skjuler». Algoritmen anbefaler tre nye videoer.',
        utvei: 'Snakk med en lærer eller forelder om det du har sett.',
        utveiResultat:
            'En voksen hjelper deg å sjekke kilder. Du lærer å skille mellom dokumentert fakta og påstander.',
        kind: 'start',
    },
    {
        id: 'engasjert',
        tittel: '2. Engasjert',
        tanke: '«Det finnes et problem ingen tør å snakke om. Jeg må lære mer.»',
        paavirkning:
            'Du bruker stadig mer tid i forum og chatter der alle er enige. De som tviler blir kastet ut eller hånet.',
        utvei: 'Søk opp motargumenter. Snakk med noen som mener noe annet enn deg.',
        utveiResultat:
            'Du oppdager at virkeligheten er mer sammensatt enn det forumet sa. Sinnet ditt får luft.',
        kind: 'normal',
    },
    {
        id: 'sint',
        tittel: '3. Sint',
        tanke: '«De som styrer landet er forrædere. Vanlige folk forstår ikke faren.»',
        paavirkning:
            'Du føler deg ensom utenfor nettet. Nye «venner» på nettet sier at sinnet ditt er bevis på at du har skjønt det.',
        utvei: 'Snakk med helsesøster, fastlege eller en ungdomstelefon.',
        utveiResultat:
            'En profesjonell hjelper deg å skille mellom det du føler og det som faktisk er sant. Du får hjelp til å sove og fungere igjen.',
        kind: 'normal',
    },
    {
        id: 'isolert',
        tittel: '4. Isolert',
        tanke: '«Bare jeg og likesinnede ser sannheten. Andre er fiender eller dumme.»',
        paavirkning:
            'Du kutter kontakten med gamle venner. Du leser tekster som rettferdiggjør hat og deler dem videre.',
        utvei: 'En slektning som ikke har gitt deg opp, ber deg om å møtes for å spise.',
        utveiResultat:
            'Måltidet bryter isolasjonen. Du blir minnet på at noen bryr seg om deg som menneske, ikke om meningene dine.',
        kind: 'normal',
    },
    {
        id: 'forberedt',
        tittel: '5. Forberedt på vold',
        tanke: '«Ord er ikke nok. Jeg må handle for å redde landet mitt.»',
        paavirkning:
            'Du skriver et manifest og lager planer. Du føler at du er den eneste som tør.',
        utvei: 'Politiet, PST og helsevesenet har egne tips-kanaler. Naboer, lærere eller foreldre som varsler tidlig, kan stoppe et angrep.',
        utveiResultat:
            'Et tips fører til at planene avdekkes før noen blir skadet. Den unge får hjelp, ikke straff alene.',
        kind: 'top',
    },
];

type Phase = 'klatre' | 'utvei' | 'topp';

interface RadikaliseringstrappaProps {
    title?: string;
}

export function Radikaliseringstrappa({
    title = 'Radikaliseringstrappa',
}: RadikaliseringstrappaProps) {
    const [stegNr, setStegNr] = useState(0);
    const [phase, setPhase] = useState<Phase>('klatre');

    const aktiv = STEG[stegNr];
    const erTopp = stegNr === STEG.length - 1;

    const handleFortsett = () => {
        if (erTopp) {
            setPhase('topp');
            return;
        }
        setStegNr((n) => Math.min(STEG.length - 1, n + 1));
    };

    const handleUtvei = () => {
        setPhase('utvei');
    };

    const handleReset = () => {
        setStegNr(0);
        setPhase('klatre');
    };

    const stegFarge = useMemo(() => {
        return STEG.map((_, i) => {
            if (phase === 'utvei' && i <= stegNr) return 'gronn';
            if (i < stegNr) return 'rod';
            if (i === stegNr) return phase === 'topp' ? 'morkrod' : 'gul';
            return 'grå';
        });
    }, [stegNr, phase]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Følg stegene oppover — eller velg utveien.
                    </p>
                </div>
            </div>

            {/* Trapp-visualisering */}
            <div className="px-6 pt-5 pb-3">
                <div className="flex items-end justify-between gap-1">
                    {STEG.map((s, i) => {
                        const f = stegFarge[i];
                        const hoyde = 36 + i * 14;
                        const bgKlasse =
                            f === 'rod'
                                ? 'bg-rose-400 border-rose-500'
                                : f === 'morkrod'
                                ? 'bg-rose-700 border-rose-800'
                                : f === 'gul'
                                ? 'bg-amber-300 border-amber-500'
                                : f === 'gronn'
                                ? 'bg-emerald-300 border-emerald-500'
                                : 'bg-slate-100 border-slate-300';
                        return (
                            <motion.div
                                key={s.id}
                                animate={{ y: f === 'gronn' ? 6 : 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div
                                    className={`w-full border-2 rounded-t-md ${bgKlasse}`}
                                    style={{ height: `${hoyde}px` }}
                                />
                                <span className="mt-1 text-[10px] text-slate-500 text-center leading-tight">
                                    {s.tittel.replace(/^\d\.\s*/, '')}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Aktivt steg */}
            <div className="px-6 pb-4">
                <AnimatePresence mode="wait">
                    {phase === 'klatre' && (
                        <motion.div
                            key={`klatre-${stegNr}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="space-y-3"
                        >
                            <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                    {aktiv.tittel}
                                </p>
                                <p className="text-sm text-slate-800 italic">{aktiv.tanke}</p>
                            </div>
                            <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                                <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-amber-700 mb-1">
                                        Det som dytter videre opp
                                    </p>
                                    <p className="text-sm text-amber-900">{aktiv.paavirkning}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'utvei' && (
                        <motion.div
                            key={`utvei-${stegNr}`}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 flex gap-3">
                                <HeartHandshake className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1">
                                        Utveien — {aktiv.tittel.toLowerCase()}
                                    </p>
                                    <p className="text-sm text-emerald-900 mb-2">
                                        <strong>Det som hjelper:</strong> {aktiv.utvei}
                                    </p>
                                    <p className="text-sm text-emerald-900">
                                        <Sparkles className="inline w-4 h-4 mr-1 text-emerald-600" />
                                        {aktiv.utveiResultat}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'topp' && (
                        <motion.div
                            key="topp"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <div className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-rose-700 mb-1">
                                        Toppen av trappen
                                    </p>
                                    <p className="text-sm text-rose-900 mb-2">
                                        Når noen er her, er angrepet ofte allerede planlagt. Få
                                        rekker å bli stoppet uten hjelp utenfra.
                                    </p>
                                    <p className="text-sm text-rose-900">
                                        Men selv her finnes utveier — varsler fra familie eller
                                        bekjente har stoppet planlagte angrep mange ganger.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    {phase === 'klatre' && (
                        <>
                            <button
                                onClick={handleFortsett}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {erTopp ? 'Se hva som skjer' : 'Fortsett opp'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleUtvei}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <DoorOpen className="w-4 h-4" />
                                Ta utveien
                            </button>
                        </>
                    )}
                    {(phase === 'utvei' || phase === 'topp') && (
                        <button
                            onClick={handleReset}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Begynn på nytt
                        </button>
                    )}
                </div>
                {phase === 'klatre' && (
                    <button
                        onClick={handleReset}
                        className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                    >
                        Tilbakestill
                    </button>
                )}
            </div>
        </div>
    );
}
