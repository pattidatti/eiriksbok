import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drum, Coins, Sparkles, RotateCcw, ArrowDown, Handshake } from 'lucide-react';

interface DenTauseHandelenProps {
    title?: string;
}

// Lyspaere: i Ghana-riket byttet to folk gull mot salt UTEN aa motes eller
// snakke samme sprak. Saltkaravanen la salt paa elvebredden, slo paa trommen
// og trakk seg unna. Gullgraverne kom fram, la igjen gull og forsvant. Slik
// gikk det fram og tilbake til begge var fornoyde. Eleven spiller ut ritualet:
// legg salt, slaa tromme, og avgjor om gullet er nok eller om man skal pruta
// ved aa slaa trommen igjen. Innsikten: handel trenger ikke felles sprak eller
// tillit til personen - bare tillit til reglene. Og gruvene forble hemmelige.

type Phase = 'intro' | 'offered' | 'asked' | 'done';

const FIRST_OFFER = 2; // forste bud fra gullgraverne (for lavt)
const FAIR_OFFER = 4; // rettferdig pris etter at man har slatt trommen igjen

export function DenTauseHandelen({ title = 'Den tause handelen' }: DenTauseHandelenProps) {
    const [phase, setPhase] = useState<Phase>('intro');
    const [gold, setGold] = useState(0);
    const [askedForMore, setAskedForMore] = useState(false);
    const [drumPulse, setDrumPulse] = useState(0);

    const lay = () => {
        setDrumPulse((d) => d + 1);
        setGold(FIRST_OFFER);
        setPhase('offered');
    };

    const askMore = () => {
        setDrumPulse((d) => d + 1);
        setGold(FAIR_OFFER);
        setAskedForMore(true);
        setPhase('asked');
    };

    const accept = () => setPhase('done');

    const reset = () => {
        setPhase('intro');
        setGold(0);
        setAskedForMore(false);
        setDrumPulse(0);
    };

    const saltBlocks = phase === 'intro' ? 0 : 4;
    const goldCoins = Array.from({ length: gold });

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Handshake className="w-5 h-5 text-amber-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Bytt salt mot gull uten å møte den andre. Følg reglene i den tause handelen.
                    </p>
                </div>
            </div>

            {/* Selve elvebredden: din side nede, gullgravernes side oppe */}
            <div className="px-6 pt-5">
                <div className="relative rounded-xl border border-slate-100 bg-gradient-to-b from-emerald-50 via-sky-50 to-amber-50 p-4 overflow-hidden">
                    {/* Gullgravernes bredd (oppe) */}
                    <div className="text-center">
                        <span className="text-xs font-semibold text-amber-700">
                            Gullgravernes bredd
                        </span>
                        <div className="min-h-[56px] mt-1 flex flex-wrap justify-center items-center gap-1.5">
                            <AnimatePresence mode="popLayout">
                                {goldCoins.map((_, i) => (
                                    <motion.div
                                        key={`gold-${i}`}
                                        initial={{ scale: 0, y: -14, opacity: 0 }}
                                        animate={{ scale: 1, y: 0, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{
                                            delay: i * 0.08,
                                            type: 'spring',
                                            stiffness: 280,
                                            damping: 16,
                                        }}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 shadow-md flex items-center justify-center"
                                    >
                                        <Coins className="w-3.5 h-3.5 text-amber-800/70" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {phase === 'intro' && (
                                <span className="text-xs text-slate-400 italic">
                                    Ingen er å se. Gullgraverne gjemmer seg.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Elva i midten */}
                    <div className="my-2 h-7 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-sky-300 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center gap-6 text-sky-700/40 text-[10px]">
                            <span>~ ~ ~</span>
                            <span>Elva</span>
                            <span>~ ~ ~</span>
                        </div>
                    </div>

                    {/* Din bredd (nede): salt + trommen */}
                    <div className="text-center">
                        <div className="min-h-[44px] flex flex-wrap justify-center items-center gap-1.5">
                            <AnimatePresence mode="popLayout">
                                {Array.from({ length: saltBlocks }).map((_, i) => (
                                    <motion.div
                                        key={`salt-${i}`}
                                        initial={{ scale: 0, y: 12, opacity: 0 }}
                                        animate={{ scale: 1, y: 0, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{
                                            delay: i * 0.06,
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 18,
                                        }}
                                        className="w-6 h-6 rounded-sm bg-white border-2 border-slate-300 shadow-sm"
                                    />
                                ))}
                            </AnimatePresence>
                            {phase === 'intro' && (
                                <span className="text-xs text-slate-400 italic">
                                    Saltet ditt ligger pakket og klart.
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 mt-1 inline-block">
                            Din bredd – du har saltet
                        </span>
                    </div>

                    {/* Trommen som pulserer naar du slaar paa den */}
                    <motion.div
                        key={drumPulse}
                        initial={{ scale: drumPulse ? 1.4 : 1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                        className="absolute bottom-3 right-3"
                    >
                        <Drum
                            className={`w-6 h-6 ${drumPulse ? 'text-rose-500' : 'text-slate-300'}`}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Knapperad / valg */}
            <div className="px-6 pt-4">
                {phase === 'intro' && (
                    <button
                        onClick={lay}
                        className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Drum className="w-4 h-4" />
                        Legg ut saltet og slå på trommen
                    </button>
                )}

                {phase === 'offered' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={askMore}
                            className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold py-3 shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Drum className="w-4 h-4" />
                            Slå på trommen igjen – be om mer
                        </button>
                        <button
                            onClick={accept}
                            className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Handshake className="w-4 h-4" />
                            Ta gullet nå
                        </button>
                    </div>
                )}

                {phase === 'asked' && (
                    <button
                        onClick={accept}
                        className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Handshake className="w-4 h-4" />
                        Ta gullet og avslutt handelen
                    </button>
                )}
            </div>

            {/* Feedback-sone (alltid til stede) */}
            <div className="mx-6 mt-4 mb-2 min-h-[72px]">
                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-start gap-2"
                        >
                            <ArrowDown className="w-4 h-4 shrink-0 mt-0.5" />
                            Du er en handelsmann fra nord med salt. Gullgraverne i sør vil ikke vise
                            seg. Hvordan kan dere likevel bytte? Start med å legge ut saltet.
                        </motion.div>
                    )}
                    {phase === 'offered' && (
                        <motion.div
                            key="offered"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm"
                        >
                            Mens du var borte, kom gullgraverne fram og la igjen {FIRST_OFFER} klumper
                            gull – så forsvant de igjen. Er det nok for saltet ditt, eller skal du slå
                            på trommen og be om mer?
                        </motion.div>
                    )}
                    {phase === 'asked' && (
                        <motion.div
                            key="asked"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm"
                        >
                            Trommen lød over elva. Gullgraverne forsto at budet var for lavt, kom
                            tilbake og la til mer gull – nå {FAIR_OFFER} klumper. Trommingen var måten
                            å prute på, helt uten ord.
                        </motion.div>
                    )}
                    {phase === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm"
                        >
                            <span className="flex items-center gap-2 font-semibold text-emerald-700 mb-1">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Handelen er gjort – uten et eneste ord
                            </span>
                            {askedForMore
                                ? 'Du forhandlet med trommen og fikk en rettferdig pris. To folk som aldri møttes eller snakket samme språk, byttet likevel gull mot salt. De stolte ikke på hverandre, men på reglene i den tause handelen. Og gullgraverne ga aldri bort hemmeligheten: hvor gullet kom fra.'
                                : 'Du tok det første budet. Handelen ble gjort, men du kunne kanskje fått mer ved å slå på trommen og prute. Slik byttet to folk gull mot salt uten å møtes eller snakke sammen – de stolte på reglene, ikke på hverandre. Og hvor gullet kom fra, forble en godt voktet hemmelighet.'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                {phase !== 'intro' && (
                    <button
                        onClick={reset}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Start på nytt
                    </button>
                )}
            </div>
        </div>
    );
}
