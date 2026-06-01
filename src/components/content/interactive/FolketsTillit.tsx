import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, X, Flag, Star } from 'lucide-react';

interface Hendelse {
    aar: number;
    tekst: string;
    skift: number; // positiv = mot kommunistene, negativ = mot Kuomintang
    forklaring: string;
}

// skift er hvor mange prosentpoeng støtten flytter seg mot kommunistene (KKP)
const HENDELSER: Hendelse[] = [
    {
        aar: 1927,
        tekst: 'Sjanghai-massakren: Kuomintang arresterer og skyter tusenvis av kommunister på én natt.',
        skift: 8,
        forklaring:
            'Sviket skapte dyp frykt og sinne. Borgerkrigen var i gang, og mange begynte å se kommunistene som ofre.',
    },
    {
        aar: 1934,
        tekst: 'Den lange marsjen: kommunistene går 10 000 km gjennom fjell og sump for å overleve.',
        skift: 10,
        forklaring:
            'Av 86 000 overlevde bare 8000 - men marsjen skapte en legende om styrke og offervilje, og ga Mao status som leder.',
    },
    {
        aar: 1938,
        tekst: 'Kommunistene gir bøndene jord og bygger lokal administrasjon på landsbygda.',
        skift: 12,
        forklaring:
            'Bøndene utgjorde det store flertallet. Den som hjalp dem direkte, vant tilliten deres.',
    },
    {
        aar: 1940,
        tekst: 'Mens Japan herjer, trekker Chiang Kai-sheks regjering seg innover og holder seg unna de verste kampene.',
        skift: 9,
        forklaring:
            'Kommunistene kjempet gerilja mot japanerne ute i landsbyene. Folk merket hvem som faktisk forsvarte dem.',
    },
    {
        aar: 1947,
        tekst: 'Kuomintang-offiserer stjeler soldatenes lønn, og pengetrykking skaper galopperende inflasjon.',
        skift: 11,
        forklaring:
            'Korrupsjon og inflasjon utraderte sparepengene til millioner av familier. Tilliten til Kuomintang smuldret bort.',
    },
];

const START = 35; // kommunistenes utgangsstøtte i prosent (Kuomintang hadde regjering og USA-støtte)

type Gjett = 'kkp' | 'kmt';

export function FolketsTillit({ title = 'Hvem vinner folket?' }: { title?: string }) {
    const [index, setIndex] = useState(0);
    const [stotte, setStotte] = useState(START); // kommunistenes støtte
    const [gjett, setGjett] = useState<Gjett | null>(null);
    const [poeng, setPoeng] = useState(0);

    const ferdig = index >= HENDELSER.length;
    const hendelse = ferdig ? null : HENDELSER[index];

    const handleGjett = (g: Gjett) => {
        if (gjett || !hendelse) return;
        setGjett(g);
        // alle hendelsene her flytter mot kommunistene, så riktig gjett er alltid 'kkp'
        if (g === 'kkp') setPoeng(poeng + 1);
        setStotte((s) => Math.min(95, s + hendelse.skift));
    };

    const neste = () => {
        setGjett(null);
        setIndex(index + 1);
    };

    const reset = () => {
        setIndex(0);
        setStotte(START);
        setGjett(null);
        setPoeng(0);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-rose-50 to-amber-50">
                <Flag className="w-5 h-5 text-rose-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Gjett hvilken vei folkets støtte flytter seg - før du ser svaret.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Tug-of-war bar */}
                <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-700">Kuomintang {100 - stotte}%</span>
                        <span className="text-rose-700">Kommunistene {stotte}%</span>
                    </div>
                    <div className="relative h-5 rounded-full overflow-hidden bg-amber-200 border border-slate-200">
                        <motion.div
                            className="absolute right-0 top-0 h-full bg-rose-500"
                            initial={false}
                            animate={{ width: `${stotte}%` }}
                            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
                        />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/70" />
                    </div>
                </div>

                {hendelse && (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="text-xs font-bold text-slate-500 mb-1">{hendelse.aar}</div>
                            <p className="text-slate-800 text-sm">{hendelse.tekst}</p>
                        </div>

                        {!gjett ? (
                            <div>
                                <p className="text-sm text-slate-600 mb-2">Hvem vinner folkets tillit på dette?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleGjett('kmt')}
                                        className="px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-medium transition-colors"
                                    >
                                        Kuomintang
                                    </button>
                                    <button
                                        onClick={() => handleGjett('kkp')}
                                        className="px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-sm font-medium transition-colors"
                                    >
                                        Kommunistene
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`px-4 py-3 rounded-lg border text-sm ${
                                    gjett === 'kkp'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}
                            >
                                <div className="flex items-center gap-2 font-semibold mb-1">
                                    {gjett === 'kkp' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    {gjett === 'kkp' ? 'Riktig!' : 'Ikke denne gangen.'} Støtten flyttet seg mot kommunistene.
                                </div>
                                <p className="text-xs">{hendelse.forklaring}</p>
                                <button
                                    onClick={neste}
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors"
                                >
                                    {index + 1 >= HENDELSER.length ? 'Se resultatet (1949)' : 'Neste hendelse'}
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
                        <Star className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
                        <div>
                            <strong>1. oktober 1949: Mao proklamerer Folkerepublikken Kina.</strong>
                            <p className="text-xs mt-1 text-rose-800">
                                Kuomintang hadde USAs penger og våpen, men tapte likevel. Krigen ble ikke vunnet med utstyr,
                                men med tillit: bøndene valgte dem som ga dem jord og rettferdighet. Du traff {poeng} av {HENDELSER.length} ganger.
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
