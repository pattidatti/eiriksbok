import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, RotateCcw, Sparkles, AlertTriangle, Waves, Swords, Wheat, Scale } from 'lucide-react';

type EventCategory = 'natur' | 'krig' | 'styre' | 'jordbruk';

interface MandatEvent {
    id: string;
    title: string;
    impact: number;
    category: EventCategory;
    forklaring: string;
}

interface Dynasty {
    navn: string;
    periode: string;
    fall: string;
}

const DYNASTIES: Dynasty[] = [
    { navn: 'Shang-dynastiet', periode: '1600 – 1046 fvt', fall: 'Siste konge ble sett på som grusom og umoralsk. Zhou-hæren erobret hovedstaden.' },
    { navn: 'Zhou-dynastiet', periode: '1046 – 256 fvt', fall: 'Etter århundrer med krig mellom lensherrer mistet keiseren all reell makt.' },
    { navn: 'Qin-dynastiet', periode: '221 – 206 fvt', fall: 'Tunge byggeprosjekt og brutale lover skapte opprør bare fire år etter Qin Shi Huangdis død.' },
    { navn: 'Han-dynastiet', periode: '206 fvt – 220 evt', fall: 'Korrupsjon ved hoffet og store bondeopprør (Gult turban-opprøret) brøt riket fra hverandre.' },
];

const EVENTS: MandatEvent[] = [
    { id: 'flom', title: 'Den gule elven flommer over', impact: -25, category: 'natur', forklaring: 'Millioner mister hjem og avling. Folk hvisker at himmelen er sint.' },
    { id: 'avling', title: 'Rik avling i ti år', impact: 15, category: 'jordbruk', forklaring: 'Magasinene er fulle. Himmelen smiler tydeligvis på keiseren.' },
    { id: 'jordskjelv', title: 'Stort jordskjelv i Henan', impact: -20, category: 'natur', forklaring: 'Naturkatastrofer ble tolket som varsel om at mandatet er på vei bort.' },
    { id: 'mur', title: 'Keiseren bygger en stor mur', impact: -10, category: 'styre', forklaring: 'Bøndene tvinges til hardt arbeid. Mange dør, og familier sulter.' },
    { id: 'fred', title: 'Et fredsår uten krig', impact: 10, category: 'styre', forklaring: 'Soldatene blir hjemme. Bønder kan dyrke jord i fred.' },
    { id: 'invasjon', title: 'Nomader angriper fra nord', impact: -15, category: 'krig', forklaring: 'Hæren er svekket. Folket spør om himmelen har vendt seg vekk.' },
    { id: 'kanal', title: 'Ny kanal kobler nord og sør', impact: 12, category: 'jordbruk', forklaring: 'Handel blomstrer, og ris kan sendes fra sør til den sultne nord.' },
    { id: 'korrupsjon', title: 'Korrupsjon ved hoffet', impact: -18, category: 'styre', forklaring: 'Embetsmenn tar bestikkelser. Domstolen virker urettferdig.' },
    { id: 'profet', title: 'Vis lærer rådgir keiseren', impact: 10, category: 'styre', forklaring: 'En klok rådgiver hjelper keiseren med å herske rettferdig.' },
    { id: 'opprør', title: 'Bondeopprør i sør', impact: -22, category: 'krig', forklaring: 'Når mandatet er svakt, gjør folket opprør — og opprør gjør mandatet svakere.' },
];

const CAT_ICON: Record<EventCategory, typeof Waves> = {
    natur: Waves,
    krig: Swords,
    styre: Scale,
    jordbruk: Wheat,
};

const CAT_COLOR: Record<EventCategory, string> = {
    natur: 'text-sky-600',
    krig: 'text-rose-600',
    styre: 'text-indigo-600',
    jordbruk: 'text-amber-600',
};

type Phase = 'ruling' | 'falling' | 'complete';

function pickEvents(seed: number): MandatEvent[] {
    const copy = [...EVENTS];
    const out: MandatEvent[] = [];
    let s = seed * 9301 + 49297;
    while (out.length < 4 && copy.length > 0) {
        s = (s * 9301 + 49297) % 233280;
        const idx = s % copy.length;
        out.push(copy[idx]);
        copy.splice(idx, 1);
    }
    return out;
}

interface HimmelensMandatProps {
    title?: string;
}

export function HimmelensMandat({ title = 'Himmelens mandat' }: HimmelensMandatProps) {
    const [dynastyIndex, setDynastyIndex] = useState(0);
    const [mandate, setMandate] = useState(70);
    const [phase, setPhase] = useState<Phase>('ruling');
    const [usedIds, setUsedIds] = useState<string[]>([]);
    const [lastEvent, setLastEvent] = useState<MandatEvent | null>(null);
    const [seed, setSeed] = useState(1);

    const dynasty = DYNASTIES[dynastyIndex];
    const events = useMemo(() => pickEvents(seed + dynastyIndex), [seed, dynastyIndex]);

    const handleEvent = (ev: MandatEvent) => {
        if (phase !== 'ruling') return;
        const next = Math.max(0, Math.min(100, mandate + ev.impact));
        setMandate(next);
        setLastEvent(ev);
        setUsedIds([...usedIds, ev.id]);
        if (next === 0) {
            setPhase('falling');
            setTimeout(() => {
                if (dynastyIndex + 1 >= DYNASTIES.length) {
                    setPhase('complete');
                } else {
                    setDynastyIndex(dynastyIndex + 1);
                    setMandate(70);
                    setUsedIds([]);
                    setLastEvent(null);
                    setPhase('ruling');
                    setSeed(seed + 1);
                }
            }, 1800);
        }
    };

    const handleReset = () => {
        setDynastyIndex(0);
        setMandate(70);
        setPhase('ruling');
        setUsedIds([]);
        setLastEvent(null);
        setSeed(s => s + 7);
    };

    const mandateColor =
        mandate >= 60 ? 'from-amber-400 to-amber-500'
        : mandate >= 30 ? 'from-orange-400 to-orange-500'
        : 'from-rose-500 to-rose-700';

    const mandateLabel =
        mandate >= 60 ? 'Sterkt mandat'
        : mandate >= 30 ? 'Mandatet vakler'
        : 'Mandatet svikter';

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-rose-50">
                <Crown className="w-5 h-5 text-amber-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Klikk på en hendelse og se hva som skjer med dynastiet.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Regjerer nå</div>
                            <div className="text-lg font-semibold text-slate-800">{dynasty.navn}</div>
                            <div className="text-xs text-slate-500">{dynasty.periode}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs uppercase tracking-wide text-slate-500">Mandat</div>
                            <div className="text-2xl font-bold text-slate-800 tabular-nums">{mandate}%</div>
                            <div className="text-xs text-slate-500">{mandateLabel}</div>
                        </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${mandateColor}`}
                            initial={false}
                            animate={{ width: `${mandate}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                        />
                    </div>
                </div>

                {phase === 'ruling' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {events.map(ev => {
                            const Icon = CAT_ICON[ev.category];
                            const used = usedIds.includes(ev.id);
                            return (
                                <motion.button
                                    key={ev.id}
                                    whileHover={{ scale: used ? 1 : 1.02 }}
                                    whileTap={{ scale: used ? 1 : 0.98 }}
                                    disabled={used}
                                    onClick={() => handleEvent(ev)}
                                    className={`text-left p-3 rounded-lg border transition-colors ${
                                        used
                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-4 h-4 ${used ? 'text-slate-300' : CAT_COLOR[ev.category]}`} />
                                        <span className="text-sm font-medium">{ev.title}</span>
                                    </div>
                                    <div className={`text-xs font-semibold tabular-nums ${ev.impact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {ev.impact >= 0 ? '+' : ''}{ev.impact} mandat
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {phase === 'ruling' && lastEvent && (
                        <motion.div
                            key={lastEvent.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm"
                        >
                            <strong>{lastEvent.title}:</strong> {lastEvent.forklaring}
                        </motion.div>
                    )}
                    {phase === 'falling' && (
                        <motion.div
                            key="falling"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2"
                        >
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <strong>Mandatet er tapt — {dynasty.navn} faller.</strong>
                                <div className="text-xs mt-1 text-rose-700">{dynasty.fall}</div>
                            </div>
                        </motion.div>
                    )}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-4 py-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                        >
                            <Sparkles className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
                            <div>
                                <strong>Du har sett dynastisykluset.</strong>
                                <p className="text-xs mt-1 text-emerald-700">
                                    Hver gang mandatet falt, kom et nytt dynasti. Slik forklarte kineserne historien i over to tusen år: himmelen ga og himmelen tok.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    Dynasti {dynastyIndex + 1} av {DYNASTIES.length}
                </div>
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
