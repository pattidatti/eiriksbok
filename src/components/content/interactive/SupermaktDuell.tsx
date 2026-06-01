import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Cpu, Landmark, Globe2, Sparkles, Eye, Scale } from 'lucide-react';

type Leder = 'kina' | 'usa' | 'likt';

interface Front {
    id: string;
    navn: string;
    Icon: typeof Factory;
    sporsmal: string;
    leder: Leder;
    fasit: string;
}

const FRONTER: Front[] = [
    {
        id: 'fabrikk',
        navn: 'Verdens fabrikk',
        Icon: Factory,
        sporsmal: 'Hvem produserer flest industrivarer?',
        leder: 'kina',
        fasit: 'Kina lager rundt 30% av verdens industrivarer - fra mobiltelefoner til møbler. Halvparten av verdens solpaneler og 60% av sementen kommer derfra.',
    },
    {
        id: 'halvledere',
        navn: 'Halvledere',
        Icon: Cpu,
        sporsmal: 'Hvem leder på de mest avanserte databrikkene?',
        leder: 'usa',
        fasit: 'USA og allierte leder klart. USA har forbudt eksport av de mest avanserte halvlederne til Kina for å bremse kinesisk teknologi. Kina investerer enormt for å ta igjen.',
    },
    {
        id: 'taiwan',
        navn: 'Taiwan',
        Icon: Landmark,
        sporsmal: 'Hvem kontrollerer Taiwan?',
        leder: 'likt',
        fasit: 'Et åpent stridsspørsmål. Taiwan styrer seg selv som et demokrati, Kina ser øya som en provins som skal gjenforenes, og USA selger våpen til Taiwan. En av verdens farligste konflikter.',
    },
    {
        id: 'belte-vei',
        navn: 'Belte- og vei',
        Icon: Globe2,
        sporsmal: 'Hvem bygger mest infrastruktur i fattige land?',
        leder: 'kina',
        fasit: 'Kina bygger veier, jernbaner og havner i over 140 land. Kritikere advarer mot «gjeldsfellen» - Sri Lanka mistet en havn til Kina i 2017 da de ikke klarte å betale.',
    },
    {
        id: 'soft-power',
        navn: 'Soft power',
        Icon: Sparkles,
        sporsmal: 'Hvem har mest kulturell tiltrekningskraft i verden?',
        leder: 'usa',
        fasit: 'USA leder fortsatt på film, musikk, universiteter og merkevarer som mange land ser opp til. Kinas styrke er mest økonomisk og teknologisk, ikke kulturell.',
    },
];

const LEDER_STIL: Record<Leder, { tekst: string; klasse: string }> = {
    kina: { tekst: 'Kina leder', klasse: 'bg-rose-100 text-rose-700 border-rose-200' },
    usa: { tekst: 'USA leder', klasse: 'bg-blue-100 text-blue-700 border-blue-200' },
    likt: { tekst: 'Uavgjort / omstridt', klasse: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export function SupermaktDuell({ title = 'Supermakt-duellen' }: { title?: string }) {
    const [aktiv, setAktiv] = useState(0);
    const [avslort, setAvslort] = useState<Record<string, boolean>>({});

    const front = FRONTER[aktiv];
    const erAvslort = !!avslort[front.id];
    const antallAvslort = Object.values(avslort).filter(Boolean).length;

    const avslor = () => setAvslort((a) => ({ ...a, [front.id]: true }));

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-rose-50">
                <Scale className="w-5 h-5 text-slate-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">USA mot Kina, front for front. Gjett hvem som leder.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Front tabs */}
                <div className="flex flex-wrap gap-2">
                    {FRONTER.map((f, i) => {
                        const Icon = f.Icon;
                        const valgt = i === aktiv;
                        const ferdig = !!avslort[f.id];
                        return (
                            <button
                                key={f.id}
                                onClick={() => setAktiv(i)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    valgt
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : ferdig
                                          ? 'bg-slate-50 text-slate-500 border-slate-200'
                                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" /> {f.navn}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={front.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <front.Icon className="w-5 h-5 text-slate-600" />
                            <span className="font-semibold text-slate-800">{front.navn}</span>
                        </div>

                        {/* Versus */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div
                                className={`flex-1 text-center py-2 rounded-lg border text-sm font-semibold ${
                                    erAvslort && front.leder === 'usa'
                                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                                        : 'bg-white border-slate-200 text-slate-500'
                                }`}
                            >
                                🇺🇸 USA
                            </div>
                            <span className="text-xs font-bold text-slate-400">VS</span>
                            <div
                                className={`flex-1 text-center py-2 rounded-lg border text-sm font-semibold ${
                                    erAvslort && front.leder === 'kina'
                                        ? 'bg-rose-100 border-rose-300 text-rose-800'
                                        : 'bg-white border-slate-200 text-slate-500'
                                }`}
                            >
                                🇨🇳 Kina
                            </div>
                        </div>

                        {!erAvslort ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-3">{front.sporsmal}</p>
                                <button
                                    onClick={avslor}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition-colors"
                                >
                                    <Eye className="w-4 h-4" /> Avslør hvem som leder
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${LEDER_STIL[front.leder].klasse}`}>
                                    {LEDER_STIL[front.leder].tekst}
                                </span>
                                <p className="text-sm text-slate-700">{front.fasit}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {antallAvslort === FRONTER.length && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2"
                    >
                        <Scale className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                            <strong>Ingen vinner alt.</strong>
                            <p className="text-xs mt-1 text-emerald-800">
                                Kina leder på produksjon og infrastruktur, USA på avansert teknologi og soft power, og
                                noen fronter er helt åpne. Det er en konkurranse på mange fronter samtidig - ikke en krig
                                med én vinner. Hvem som får overtaket, vil forme verden i tiår framover.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
