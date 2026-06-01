import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';

interface KunnskapsMigrasjonsKartProps {
    title?: string;
}

interface Word {
    id: string;
    word: string;
    origin: string;
    originLabel: string;
    bagdad: string;
    europe: string;
    today: string;
    emoji: string;
}

const WORDS: Word[] = [
    {
        id: 'algebra',
        word: 'algebra',
        emoji: '➗',
        origin: 'Al-jabr - arabisk for "å sette tilbake brutte bein". Al-Khwarizmi brukte det om å flytte tall fra en side av ligningen til den andre.',
        originLabel: 'Bagdad, ca. 820',
        bagdad: 'Al-Khwarizmis bok "Kitab al-mukhtasar fi hisab al-jabr wal-muqabala" samlet systematiske metoder for å løse ligninger.',
        europe: 'Oversatt til latin på 1100-tallet. Europeiske studenter lærte matematikk fra arabiske tekster i Toledo og Palermo.',
        today: 'Du bruker algebra på skolen - og datamaskiner kjører på den samme logikken, millioner av ganger per sekund.',
    },
    {
        id: 'algoritme',
        word: 'algoritme',
        emoji: '⚙️',
        origin: 'Fra al-Khwarizmis latiniserte navn: Algoritmi. Hans navn ble synonymt med hans metode.',
        originLabel: 'Bagdad, ca. 820',
        bagdad: 'Al-Khwarizmi beskrev steg-for-steg-metoder for beregning. Selve konseptet "fremgangsmåte" kom fra ham.',
        europe: 'Latinsk oversettelse spredte metoden til europeiske klostre og universiteter på 1100-1200-tallet.',
        today: 'TikTok, Spotify og Google bruker algoritmer - steg-for-steg-regler - til å bestemme hva du ser.',
    },
    {
        id: 'kaffe',
        word: 'kaffe',
        emoji: '☕',
        origin: 'Fra arabisk qahwa. Kaffetreet vokste i Etiopia, men det var i Jemen på 900-tallet man begynte å koke bønnene.',
        originLabel: 'Jemen, ca. 900-tallet',
        bagdad: 'Kaffehus spredte seg til Mekka og Kairo - verdens aller første. De var møtesteder for politikk og musikk.',
        europe: 'Kaffe nådde Venezia i 1600 og spredte seg raskt. London fikk over 300 kaffehus på 1700-tallet.',
        today: 'Kaffehusene der opplysningstidens ideer ble diskutert stammer direkte fra middelalderens islamske kaffehus.',
    },
    {
        id: 'admiral',
        word: 'admiral',
        emoji: '⚓',
        origin: 'Fra arabisk amir al-bahr - havets prins. Tittelen ble brukt i den islamske marinen.',
        originLabel: 'Middelhavet, 900-tallet',
        bagdad: 'Islamske flåter dominerte Middelhavet. Tittelen amir al-bahr gikk til øverstkommanderende.',
        europe: 'Normannere og korsfarere tok med seg tittelen. Admiral ble standard europisk militærgrad.',
        today: 'Norske, britiske og amerikanske admiraler bærer en tittel som er arabisk - fra en tid da islam styrte havet.',
    },
    {
        id: 'sukker',
        word: 'sukker',
        emoji: '🍬',
        origin: 'Fra arabisk sukkar, som kom fra sanskrit sharkara. Sukkerrøret ble dyrket i India, raffinering spredde seg vestover.',
        originLabel: 'India → arabiske land, 700-tallet',
        bagdad: 'Arabiske handelsmenn spredde sukkerrøret gjennom hele den islamske verden og lærte Europa raffinering.',
        europe: 'Korsfarerne smakte sukker i Midtøsten og tok det med hjem. Europa kalte det "arabisk salt".',
        today: 'Sukker er i nesten all mat - og reisen fra India via Bagdad til din matfat tok over tusen år.',
    },
    {
        id: 'siffer',
        word: 'siffer (0-9)',
        emoji: '🔢',
        origin: 'Tallsystemet ble utviklet i India rundt år 500. Arabisk sifr (null) ga oss ordet "siffer" og "null".',
        originLabel: 'India → Bagdad, ca. 800',
        bagdad: 'Al-Khwarizmi introduserte det indiske tallsystemet i sin bok om tallregning - og det revolusjonerte matematikken.',
        europe: 'Fibonacci viste Europa de arabiske tallene i 1202. Romertallene ble gradvis forlatt.',
        today: 'Du bruker 0-9 daglig. Prøv å gange XLVII × CXIX. Nå forstår du hvorfor verden byttet system.',
    },
];

const STEPS = [
    { key: 'origin' as const, label: 'Opprinnelse', color: 'bg-amber-50 border-amber-200 text-amber-900', dot: 'bg-amber-400' },
    { key: 'bagdad' as const, label: 'Bagdad', color: 'bg-orange-50 border-orange-200 text-orange-900', dot: 'bg-orange-500' },
    { key: 'europe' as const, label: 'Europa', color: 'bg-blue-50 border-blue-200 text-blue-900', dot: 'bg-blue-500' },
    { key: 'today' as const, label: 'I dag', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', dot: 'bg-emerald-500' },
];

export function KunnskapsMigrasjonsKart({ title = 'Kunnskapens stafettløp' }: KunnskapsMigrasjonsKartProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [seen, setSeen] = useState<Set<string>>(new Set());

    const selectedWord = WORDS.find((w) => w.id === selected) ?? null;
    const isComplete = seen.size >= 3;

    const handleSelect = (id: string) => {
        setSelected(id);
        setSeen((prev) => new Set([...prev, id]));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Klikk et ord for a se reisen det tok gjennom historien</p>
                </div>
            </div>

            {/* Word grid */}
            <div className="p-4 grid grid-cols-3 gap-2">
                {WORDS.map((w) => (
                    <button
                        key={w.id}
                        onClick={() => handleSelect(w.id)}
                        className={`rounded-lg border px-2 py-2.5 text-center transition-all ${
                            selected === w.id
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm'
                                : seen.has(w.id)
                                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        <div className="text-lg mb-0.5">{w.emoji}</div>
                        <div className="text-xs font-medium">{w.word}</div>
                    </button>
                ))}
            </div>

            {/* Journey display */}
            <AnimatePresence mode="wait">
                {selectedWord && (
                    <motion.div
                        key={selectedWord.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22 }}
                        className="px-4 pb-4"
                    >
                        {/* Journey header */}
                        <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-500 font-medium">
                            <span>Reisen til</span>
                            <span className="text-indigo-700 font-bold">«{selectedWord.word}»</span>
                            {STEPS.map((s) => (
                                <span key={s.key} className="flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" />
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.color.split(' ')[0]} ${s.color.split(' ')[2]}`}>
                                        {s.label}
                                    </span>
                                </span>
                            ))}
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                            {STEPS.map((step, i) => (
                                <motion.div
                                    key={step.key}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`rounded-lg border px-3 py-2.5 ${step.color}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${step.dot} flex-shrink-0`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                                            {step.label}
                                        </span>
                                        {step.key === 'origin' && (
                                            <span className="text-[10px] opacity-50 font-mono ml-auto">
                                                {selectedWord.originLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs leading-relaxed">
                                        {selectedWord[step.key]}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {!selectedWord && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 pb-4 text-center text-slate-400 text-xs py-2"
                    >
                        Velg et ord for a se reisen det tok
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-4 mb-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200"
                    >
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                            Kunnskap tilhorer ingen sivilisasjon. Det er et stafettlop - og uten Bagdad som mellomledd hadde Europa aldri fatt tilbake sin egen arv fra Aristoteles og Euklid.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{seen.size} av {WORDS.length} ord utforsket</span>
                <button
                    onClick={() => { setSelected(null); setSeen(new Set()); }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
