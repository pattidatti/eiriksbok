import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, ArrowRight } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';

type TriggerId = 'first-bust' | 'high-inflation' | 'high-unemployment' | 'high-inequality';

interface Trigger {
    id: TriggerId;
    title: string;
    intro: string;
    questions: string[];
}

const TRIGGERS: Record<TriggerId, Trigger> = {
    'first-bust': {
        id: 'first-bust',
        title: 'Krisen er her',
        intro: 'Økonomien gikk fra boom til bust. Stopp opp et øyeblikk og tenk gjennom hva som nettopp skjedde.',
        questions: [
            'Hvilke kontroller endret du like før krisen kom?',
            'Hva tror du startet boblen i utgangspunktet?',
            'Hvem tror du sliter mest i landsbyen akkurat nå - og hvorfor?',
        ],
    },
    'high-inflation': {
        id: 'high-inflation',
        title: 'Inflasjonen løper løpsk',
        intro: 'Prisene stiger raskere enn 20 prosent i året. Hva skjer med folk som har spart?',
        questions: [
            'Hvem vinner på høy inflasjon? Hvem taper?',
            'Hvilken kontroll vil du justere først for å bremse prisveksten?',
            'Hva tror du ville skjedd i din egen hverdag hvis prisene doblet seg på et halvt år?',
        ],
    },
    'high-unemployment': {
        id: 'high-unemployment',
        title: 'Mange er uten jobb',
        intro: 'Mer enn 15 prosent av arbeiderne i landsbyen har mistet jobben.',
        questions: [
            'Hva slags innbyggere er mest berørt - sparere, forbrukere, eller arbeidere i bestemte ledd?',
            'Hva ville en keynesianer foreslått her? Hva ville en østerriker sagt?',
            'Hvilke verktøy har du tilgjengelig som faktisk kan endre situasjonen?',
        ],
    },
    'high-inequality': {
        id: 'high-inequality',
        title: 'Ulikheten har vokst',
        intro: 'Gini-koeffisienten har krysset 0,5 - det er svært høy ulikhet.',
        questions: [
            'Hvilke roller har bygget mest formue? Hvorfor tror du det?',
            'Tror du dette er rettferdig konsekvens av valg, eller systemets oppbygging?',
            'Hva kunne motvirket ulikheten uten å stoppe veksten?',
        ],
    },
};

const STORAGE_KEY = 'okonomi-verden-reflections-seen';

function loadSeen(): Set<TriggerId> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as TriggerId[]);
    } catch {
        return new Set();
    }
}

function persistSeen(seen: Set<TriggerId>) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
    } catch {
        // ignore
    }
}

export function ReflectionModal() {
    const seenRef = useRef<Set<TriggerId>>(loadSeen());
    const [active, setActive] = useState<Trigger | null>(null);

    useEffect(() => {
        const initial = useWorldStore.getState();
        let lastPhase = initial.sim.phase;
        const unsub = useWorldStore.subscribe((state) => {
            const phase = state.sim.phase;
            const tick = state.sim.tick;
            const inflation = state.sim.money.inflation;
            const latest = state.sim.history[state.sim.history.length - 1];
            const seen = seenRef.current;

            if (tick < 5) {
                lastPhase = phase;
                return;
            }

            let trigger: Trigger | null = null;
            if (phase === 'bust' && lastPhase !== 'bust' && !seen.has('first-bust')) {
                trigger = TRIGGERS['first-bust'];
            } else if (inflation > 20 && !seen.has('high-inflation')) {
                trigger = TRIGGERS['high-inflation'];
            } else if (latest && latest.unemployment > 15 && !seen.has('high-unemployment')) {
                trigger = TRIGGERS['high-unemployment'];
            } else if (latest && latest.gini > 0.5 && !seen.has('high-inequality')) {
                trigger = TRIGGERS['high-inequality'];
            }

            if (trigger) setActive(trigger);
            lastPhase = phase;
        });
        return unsub;
    }, []);

    function dismiss() {
        if (active) {
            seenRef.current.add(active.id);
            persistSeen(seenRef.current);
        }
        setActive(null);
    }

    return (
        <AnimatePresence>
            {active && <Card trigger={active} onClose={dismiss} />}
        </AnimatePresence>
    );
}

function Card({ trigger, onClose }: { trigger: Trigger; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.94, y: 14, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/70"
            >
                <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                            <Brain size={18} className="text-white" />
                        </span>
                        <div>
                            <h2 className="text-lg font-display font-bold text-slate-900 leading-tight">
                                {trigger.title}
                            </h2>
                            <p className="text-xs text-slate-500">Tenk gjennom dette før du går videre</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                        aria-label="Lukk"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="px-6 py-5 flex flex-col gap-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{trigger.intro}</p>
                    <ul className="flex flex-col gap-2">
                        {trigger.questions.map((q, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 bg-slate-50 border border-slate-200/70 rounded-2xl p-3"
                            >
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-slate-800 leading-snug">{q}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={onClose}
                        className="self-end flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                    >
                        Tilbake til simuleringen
                        <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
