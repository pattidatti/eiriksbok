import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight, RotateCcw, Coins, MapPin, TriangleAlert } from 'lucide-react';

interface Etappe {
    fra: string;
    til: string;
    handelsmann: string;
    paslag: number; // hvor mye prisen ganges
    risiko: string;
}

const ETAPPER: Etappe[] = [
    {
        fra: "Chang'an",
        til: 'Dunhuang',
        handelsmann: 'Kinesiske kjøpmenn',
        paslag: 1.6,
        risiko: 'Ørkenvind og lange dagsmarsjer. Kamelene må ha vann.',
    },
    {
        fra: 'Dunhuang',
        til: 'Samarkand',
        handelsmann: 'Sogdiske kjøpmenn',
        paslag: 2.0,
        risiko: 'Banditter i fjellpassene krever betaling for trygg ferd.',
    },
    {
        fra: 'Samarkand',
        til: 'Persia',
        handelsmann: 'Persiske kjøpmenn',
        paslag: 1.8,
        risiko: 'Herskere langs ruten krever toll for å slippe karavanen gjennom.',
    },
    {
        fra: 'Persia',
        til: 'Konstantinopel',
        handelsmann: 'Arabiske kjøpmenn',
        paslag: 1.9,
        risiko: 'Enda en mellommann tar sin del før varene når Middelhavet.',
    },
    {
        fra: 'Konstantinopel',
        til: 'Roma',
        handelsmann: 'Bysantinske kjøpmenn',
        paslag: 1.7,
        risiko: 'Siste ledd. Romerske senatorers koner betaler nesten hva som helst.',
    },
];

const START_PRIS = 100;

export function SilkeveiStafett({ title = 'Silkeveien-stafetten' }: { title?: string }) {
    const [steg, setSteg] = useState(0); // antall fullførte etapper
    const [pris, setPris] = useState(START_PRIS);
    const [sisteEtappe, setSisteEtappe] = useState<Etappe | null>(null);

    const ferdig = steg >= ETAPPER.length;
    const nesteEtappe = ferdig ? null : ETAPPER[steg];
    const gangerStart = Math.round(pris / START_PRIS);

    const sendVidere = () => {
        if (ferdig || !nesteEtappe) return;
        const nyPris = Math.round(pris * nesteEtappe.paslag);
        setPris(nyPris);
        setSisteEtappe(nesteEtappe);
        setSteg(steg + 1);
    };

    const reset = () => {
        setSteg(0);
        setPris(START_PRIS);
        setSisteEtappe(null);
    };

    const posisjon = ferdig ? 'Roma' : steg === 0 ? "Chang'an" : ETAPPER[steg - 1].til;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-sky-50">
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Send en balle silke fra Kina til Roma - ledd for ledd.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Route line */}
                <div className="flex items-center justify-between gap-1">
                    {["Chang'an", 'Dunhuang', 'Samarkand', 'Persia', 'Konstantinopel', 'Roma'].map((by, i) => {
                        const naadd = i <= steg;
                        return (
                            <div key={by} className="flex flex-col items-center flex-1 min-w-0">
                                <MapPin
                                    className={`w-4 h-4 ${naadd ? 'text-amber-600' : 'text-slate-300'}`}
                                    fill={naadd ? 'currentColor' : 'none'}
                                />
                                <span className={`text-[10px] mt-0.5 text-center truncate w-full ${naadd ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {by}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Price box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-600" />
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">Ballen er nå i</div>
                            <div className="font-semibold text-slate-800">{posisjon}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1 justify-end">
                            <Coins className="w-3.5 h-3.5" /> Pris
                        </div>
                        <motion.div
                            key={pris}
                            initial={{ scale: 1.2, color: '#b45309' }}
                            animate={{ scale: 1, color: '#1e293b' }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                            className="text-2xl font-bold tabular-nums"
                        >
                            {pris.toLocaleString('nb-NO')}
                        </motion.div>
                        <div className="text-xs text-slate-500">sølvmynt ({gangerStart}x startpris)</div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {sisteEtappe && (
                        <motion.div
                            key={`${sisteEtappe.fra}-${sisteEtappe.til}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-sm"
                        >
                            <div className="font-medium mb-1">
                                {sisteEtappe.handelsmann} tok ballen fra {sisteEtappe.fra} til {sisteEtappe.til}.
                            </div>
                            <div className="flex items-start gap-2 text-xs text-sky-800">
                                <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>{sisteEtappe.risiko} Hver mellommann legger på prisen for strevet og risikoen.</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!ferdig && nesteEtappe && (
                    <button
                        onClick={sendVidere}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                    >
                        Send videre til {nesteEtappe.til}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2"
                    >
                        <Coins className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                            <strong>Silken er framme i Roma - til {gangerStart} ganger startprisen.</strong>
                            <p className="text-xs mt-1 text-emerald-800">
                                Ingen enkelt karavane reiste hele veien. Silkeveien var et stafettløp der varene skiftet
                                hender mange ganger, og hver mellommann tok sin del. Derfor kunne en kilo silke koste like
                                mye som en kilo gull da den endelig nådde Roma.
                            </p>
                            <button
                                onClick={reset}
                                className="mt-3 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 text-xs transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Send en ny balle
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
