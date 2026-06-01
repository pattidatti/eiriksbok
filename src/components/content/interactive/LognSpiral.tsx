import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Wheat, TriangleAlert, Megaphone, Skull } from 'lucide-react';

interface Runde {
    aar: number;
    faktiskAvling: number; // tonn
    naboRapport: number; // hva naboene melder inn (stiger hvert år)
    sannResultat: string;
    lognResultat: string;
    lognDode: number; // sultedøde dette året om du lyver
}

const RUNDER: Runde[] = [
    {
        aar: 1958,
        faktiskAvling: 100,
        naboRapport: 200,
        sannResultat:
            'Partisekretæren rynker på pannen. Hvorfor høster du så lite når nabolandsbyen melder det dobbelte? Du blir kalt inn til "samtale" og stemplet som en mulig sabotør.',
        lognResultat:
            'Du blir rost som en mønsterbonde! Men staten krever korn etter tallet du oppga. De henter nesten alt - også såkornet. Landsbyen begynner å sulte.',
        lognDode: 12,
    },
    {
        aar: 1959,
        faktiskAvling: 90,
        naboRapport: 350,
        sannResultat:
            'Nå melder alle andre svimlende tall. Sannheten din ser ut som svik mot revolusjonen. Du risikerer å miste stillingen - eller verre.',
        lognResultat:
            'Du melder enda høyere for å holde tritt. Staten øker kvoten og tar enda mer korn. Folk spiser bark og gress. Barn dør.',
        lognDode: 28,
    },
    {
        aar: 1960,
        faktiskAvling: 70,
        naboRapport: 500,
        sannResultat:
            'Frykten har gjort alle til løgnere. Den ærlige står helt alene - og blir ikke trodd uansett.',
        lognResultat:
            'Løgnene har bygd seg opp til en katastrofe. Staten tror på papiret, ikke på de sultne. Landsbyen tømmes for folk.',
        lognDode: 45,
    },
];

type Valg = 'sann' | 'logn' | null;

export function LognSpiral({ title = 'Løgnens spiral' }: { title?: string }) {
    const [index, setIndex] = useState(0);
    const [valg, setValg] = useState<Valg>(null);
    const [dode, setDode] = useState(0);

    const ferdig = index >= RUNDER.length;
    const runde = ferdig ? null : RUNDER[index];

    const velg = (v: 'sann' | 'logn') => {
        if (valg || !runde) return;
        setValg(v);
        if (v === 'logn') setDode((d) => d + runde.lognDode);
    };

    const neste = () => {
        setValg(null);
        setIndex(index + 1);
    };

    const reset = () => {
        setIndex(0);
        setValg(null);
        setDode(0);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-rose-50">
                <Megaphone className="w-5 h-5 text-rose-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Du er lokal partileder. Hva rapporterer du oppover?</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Progress */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    {RUNDER.map((r, i) => (
                        <div
                            key={r.aar}
                            className={`flex-1 text-center py-1 rounded ${
                                i < index ? 'bg-slate-200 text-slate-600' : i === index && !ferdig ? 'bg-rose-100 text-rose-700 font-semibold' : 'bg-slate-50'
                            }`}
                        >
                            {r.aar}
                        </div>
                    ))}
                </div>

                {runde && (
                    <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                <Wheat className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                <div className="text-xs text-slate-500">Faktisk avling</div>
                                <div className="text-2xl font-bold text-slate-800 tabular-nums">{runde.faktiskAvling}</div>
                                <div className="text-xs text-slate-500">tonn korn</div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                <Megaphone className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                                <div className="text-xs text-slate-500">Naboene melder</div>
                                <div className="text-2xl font-bold text-rose-600 tabular-nums">{runde.naboRapport}</div>
                                <div className="text-xs text-slate-500">tonn korn</div>
                            </div>
                        </div>

                        {!valg ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => velg('sann')}
                                    className="px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-medium transition-colors"
                                >
                                    Rapporter sannheten ({runde.faktiskAvling} tonn)
                                </button>
                                <button
                                    onClick={() => velg('logn')}
                                    className="px-4 py-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-sm font-medium transition-colors"
                                >
                                    Rapporter høyt (som de andre)
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`px-4 py-3 rounded-lg border text-sm ${
                                    valg === 'sann'
                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                        : 'bg-rose-50 border-rose-200 text-rose-900'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div>
                                        <p>{valg === 'sann' ? runde.sannResultat : runde.lognResultat}</p>
                                        {valg === 'logn' && (
                                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-700">
                                                <Skull className="w-3.5 h-3.5" /> {runde.lognDode} døde av sult i landsbyen
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={neste}
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors"
                                >
                                    {index + 1 >= RUNDER.length ? 'Se hele bildet' : 'Neste år'}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2"
                    >
                        <Skull className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
                        <div>
                            <strong>Slik vokste hungersnøden fram.</strong>
                            <p className="text-xs mt-1 text-rose-800">
                                {dode > 0
                                    ? `I din landsby døde ${dode} mennesker av sult.`
                                    : 'Du fortalte sannheten hver gang - men da risikerte du alt, og ble ikke trodd.'}{' '}
                                Det farligste med Det store spranget var ikke planen, men at ingen torde si sannheten. Når
                                løgn ble tryggere enn sannhet, løy alle - og mellom 15 og 55 millioner mennesker sultet i hjel.
                            </p>
                            <button
                                onClick={reset}
                                className="mt-3 inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 text-xs transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Start på nytt
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
