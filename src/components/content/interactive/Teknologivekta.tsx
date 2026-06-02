import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building2,
    Sprout,
    TrendingUp,
    TrendingDown,
    Scale,
    Sparkles,
    RotateCcw,
} from 'lucide-react';

// Signaturkomponent for "Teknologien som endrar alt".
// Lyspære: inga teknologi er berre god eller berre vond. Same teknologi er på
// éin gong velsigning og forbanning - ho skaper vinnarar og taparar, og treffer
// enkeltmenneske, samfunn og natur ulikt. Å DRØFTE = å vege alle sidene.
// Eleven vel ein teknologi, sorterer kvar konsekvens som gevinst eller kostnad,
// og ser at vektskåla aldri tippar heilt over: korta landar alltid på begge
// sider og spenner over alle tre arenaene.

type Arena = 'person' | 'samfunn' | 'natur';
type Side = 'gevinst' | 'kostnad';

interface Card {
    text: string;
    arena: Arena;
    side: Side;
}

interface Tech {
    id: string;
    label: string;
    blurb: string;
    cards: Card[];
}

const ARENA_META: Record<Arena, { label: string; Icon: typeof User; color: string; bg: string }> = {
    person: { label: 'Enkeltmenneske', Icon: User, color: 'text-sky-700', bg: 'bg-sky-100' },
    samfunn: { label: 'Samfunn', Icon: Building2, color: 'text-violet-700', bg: 'bg-violet-100' },
    natur: { label: 'Natur', Icon: Sprout, color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

const TECHS: Tech[] = [
    {
        id: 'damp',
        label: 'Dampmaskinen',
        blurb: 'Industrialiseringen på 1800-tallet',
        cards: [
            { text: 'Maskiner gjorde det tunge arbeidet lettere for håndverkeren.', arena: 'person', side: 'gevinst' },
            { text: 'Veverne mistet levebrødet til de nye vevstolene.', arena: 'person', side: 'kostnad' },
            { text: 'Varer ble billige, og flere fikk råd til mer enn før.', arena: 'samfunn', side: 'gevinst' },
            { text: 'Kullrøyk fra fabrikkene startet den menneskeskapte klimaendringen.', arena: 'natur', side: 'kostnad' },
        ],
    },
    {
        id: 'mobil',
        label: 'Smarttelefonen',
        blurb: 'Fra 2007 og framover',
        cards: [
            { text: 'Et bibliotek, et kart og et kamera i lomma til alle.', arena: 'person', side: 'gevinst' },
            { text: 'Mange unge sover dårligere og sammenligner seg hele tiden.', arena: 'person', side: 'kostnad' },
            { text: 'Folk kan organisere seg og dele nyheter på sekunder.', arena: 'samfunn', side: 'gevinst' },
            { text: 'Litium til batteriene hentes ut under harde forhold.', arena: 'natur', side: 'kostnad' },
        ],
    },
    {
        id: 'sosiale',
        label: 'Sosiale medier',
        blurb: 'Plattformene som bandt verden sammen',
        cards: [
            { text: 'Stemmer som før ble tiet i hjel, når nå helt fram.', arena: 'samfunn', side: 'gevinst' },
            { text: 'Algoritmer lager ekkokamre og lokker deg til å bli værende.', arena: 'person', side: 'kostnad' },
            { text: 'Falske nyheter sprer seg raskere enn sannheten.', arena: 'samfunn', side: 'kostnad' },
            { text: 'Du holder kontakten med venner over hele verden.', arena: 'person', side: 'gevinst' },
        ],
    },
    {
        id: 'ai',
        label: 'Kunstig intelligens',
        blurb: 'Maskiner som lærer, fra 2022',
        cards: [
            { text: 'AI kan oppdage sykdom tidlig og redde liv.', arena: 'samfunn', side: 'gevinst' },
            { text: 'Mange yrker kan forsvinne når maskiner overtar arbeidet.', arena: 'person', side: 'kostnad' },
            { text: 'Store datasentre sluker enorme mengder strøm.', arena: 'natur', side: 'kostnad' },
            { text: 'AI kan styre strømnettet smartere og spare energi.', arena: 'natur', side: 'gevinst' },
        ],
    },
];

export const Teknologivekta: React.FC = () => {
    const [techIdx, setTechIdx] = useState(0);
    const [cardIdx, setCardIdx] = useState(0);
    const [placed, setPlaced] = useState<Card[]>([]);
    const [wrong, setWrong] = useState<Side | null>(null);
    // Arenaer eleven har sett på begge sider, på tvers av heile økta.
    const [seen, setSeen] = useState<Set<string>>(new Set());

    const tech = TECHS[techIdx];
    const finished = cardIdx >= tech.cards.length;
    const card = finished ? null : tech.cards[cardIdx];

    const gevinst = placed.filter((c) => c.side === 'gevinst');
    const kostnad = placed.filter((c) => c.side === 'kostnad');

    // Bjelken vippar mot den tyngste skåla. Balanserte kort => endar nær midten.
    const tilt = Math.max(-15, Math.min(15, (kostnad.length - gevinst.length) * 7));

    const switchTech = (i: number) => {
        setTechIdx(i);
        setCardIdx(0);
        setPlaced([]);
        setWrong(null);
    };

    const pick = (side: Side) => {
        if (!card) return;
        if (side !== card.side) {
            setWrong(side);
            window.setTimeout(() => setWrong(null), 450);
            return;
        }
        setWrong(null);
        setPlaced((p) => [...p, card]);
        setSeen((s) => {
            const next = new Set(s);
            next.add(`${card.arena}-${card.side}`);
            return next;
        });
        setCardIdx((i) => i + 1);
    };

    // Har eleven funne både gevinst og kostnad på alle tre arenaene (samla)?
    const allArenasBothSides = useMemo(
        () =>
            (['person', 'samfunn', 'natur'] as Arena[]).every(
                (a) => seen.has(`${a}-gevinst`) && seen.has(`${a}-kostnad`)
            ),
        [seen]
    );

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Topp */}
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Scale className="w-5 h-5 text-amber-600" />
                    <h3 className="font-display font-bold text-lg">Vei sidene mot hverandre</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Velg en teknologi. Avgjør for hver konsekvens om den er en gevinst eller en
                    kostnad, og se hvordan vekta nesten aldri tipper helt over.
                </p>
            </div>

            {/* Teknologi-veljar */}
            <div className="px-5 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TECHS.map((t, i) => {
                        const active = i === techIdx;
                        return (
                            <button
                                key={t.id}
                                onClick={() => switchTech(i)}
                                className={`rounded-xl border-2 px-3 py-2 text-left transition ${
                                    active
                                        ? 'border-amber-400 bg-amber-100 shadow-sm'
                                        : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50'
                                }`}
                            >
                                <span className="block text-sm font-bold text-slate-800 leading-tight">
                                    {t.label}
                                </span>
                                <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">
                                    {t.blurb}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* Venstre: sjølve vekta */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <Balance tilt={tilt} gevinst={gevinst} kostnad={kostnad} />
                </div>

                {/* Høgre: kort + val, eller oppsummering */}
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="wait">
                        {card ? (
                            <motion.div
                                key={`${tech.id}-${cardIdx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.22 }}
                                className="rounded-xl border-2 border-slate-200 bg-white p-4"
                            >
                                <ArenaBadge arena={card.arena} />
                                <p className="text-base font-semibold text-slate-800 leading-snug mt-2">
                                    {card.text}
                                </p>
                                <div className="grid grid-cols-2 gap-2.5 mt-4">
                                    <SideButton
                                        side="gevinst"
                                        wrong={wrong === 'gevinst'}
                                        onClick={() => pick('gevinst')}
                                    />
                                    <SideButton
                                        side="kostnad"
                                        wrong={wrong === 'kostnad'}
                                        onClick={() => pick('kostnad')}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-3">
                                    Konsekvens {cardIdx + 1} av {tech.cards.length}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${tech.id}-done`}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4"
                            >
                                <div className="flex items-start gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-emerald-900 leading-snug">
                                        {tech.label}: {gevinst.length} gevinster og {kostnad.length}{' '}
                                        kostnader. Vekta ender nesten i balanse - ingen teknologi er
                                        bare god eller bare vond.
                                    </p>
                                </div>
                                <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                                    Det er nettopp dette å drøfte betyr: ikke å avgjøre om teknologi
                                    er bra eller dårlig, men å veie gevinst mot kostnad - for
                                    enkeltmennesket, samfunnet og naturen.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        onClick={() => switchTech(techIdx)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Prøv på nytt
                                    </button>
                                    {TECHS.map((t, i) =>
                                        i === techIdx ? null : (
                                            <button
                                                key={t.id}
                                                onClick={() => switchTech(i)}
                                                className="px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-200 transition"
                                            >
                                                {t.label}
                                            </button>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Arena-sporing */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Innvirkning på alle tre arenaene
                        </span>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {(['person', 'samfunn', 'natur'] as Arena[]).map((a) => {
                                const meta = ARENA_META[a];
                                const both = seen.has(`${a}-gevinst`) && seen.has(`${a}-kostnad`);
                                return (
                                    <div
                                        key={a}
                                        className={`flex flex-col items-center gap-1 rounded-lg py-2 text-center transition ${
                                            both ? meta.bg : 'bg-slate-50'
                                        }`}
                                    >
                                        <meta.Icon
                                            className={`w-5 h-5 ${both ? meta.color : 'text-slate-400'}`}
                                        />
                                        <span
                                            className={`text-[10px] font-semibold leading-tight ${
                                                both ? meta.color : 'text-slate-400'
                                            }`}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <AnimatePresence>
                            {allArenasBothSides && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-xs text-emerald-700 font-semibold mt-2 leading-relaxed"
                                >
                                    Du har funnet både gevinst og kostnad på alle tre arenaene. Det
                                    er en fullstendig drøfting.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bunnlinje */}
            <div className="flex items-start gap-2 bg-amber-50 border-t border-amber-100 px-5 py-3 text-sm text-amber-900">
                <Scale className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <p>
                    Å drøfte teknologi er ikke å rope «bra!» eller «farlig!». Det er å spørre: Hvem
                    vinner? Hvem taper? Og hva skjer med naturen? Samme teknologi bærer alltid begge
                    sidene i seg.
                </p>
            </div>
        </div>
    );
};

// Vektskåla: ein bjelke som vippar med spring, to skåler som heng under.
function Balance({ tilt, gevinst, kostnad }: { tilt: number; gevinst: Card[]; kostnad: Card[] }) {
    // HTML/CSS-vekt: framer-motion overstyrer CSS-transform, så animerte element
    // sentreres med left/marginLeft (ikkje Tailwind-translate som blir overkøyrt).
    return (
        <div>
            <div className="relative mx-auto h-[210px] w-full max-w-[320px]">
                {/* Søyle + fot */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-3 h-[150px] rounded bg-slate-300" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-1 w-28 h-3 rounded-full bg-slate-400" />

                {/* Bjelken roterer rundt midten (pivot på toppen av søyla) */}
                <motion.div
                    className="absolute h-2.5 w-[248px] rounded-full bg-amber-700"
                    style={{ left: '50%', marginLeft: -124, top: 30, originX: 0.5, originY: 0.5 }}
                    animate={{ rotate: tilt }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                >
                    {/* pivot-knott */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900" />
                    <Pan side="left" count={gevinst.length} tone="gevinst" tilt={tilt} />
                    <Pan side="right" count={kostnad.length} tone="kostnad" tilt={tilt} />
                </motion.div>
            </div>

            {/* Etikettar under skålene */}
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">Gevinst ({gevinst.length})</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-rose-700">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-bold">Kostnad ({kostnad.length})</span>
                </div>
            </div>
        </div>
    );
}

// Ei skål som heng frå enden av bjelken og motroterer så ho held seg vassrett.
function Pan({ side, count, tone, tilt }: { side: 'left' | 'right'; count: number; tone: Side; tilt: number }) {
    const isGev = tone === 'gevinst';
    const dish = isGev ? 'bg-emerald-400/90 border-emerald-600' : 'bg-rose-400/90 border-rose-600';
    const weight = isGev ? 'bg-emerald-200' : 'bg-rose-200';
    return (
        <motion.div
            className="absolute top-1/2 flex flex-col items-center"
            // Sentrer 64px-brei hengar nær bjelke-enden: left -26 => senter ~6px frå tippen.
            style={side === 'left' ? { left: -26, originX: 0.5, originY: 0 } : { right: -26, originX: 0.5, originY: 0 }}
            animate={{ rotate: -tilt }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
            <div className="w-0.5 h-9 bg-slate-400" />
            <div className={`relative w-16 h-8 rounded-b-[40px] border-b-4 ${dish}`}>
                <div className="absolute inset-x-0 bottom-1 flex flex-col-reverse items-center gap-0.5">
                    {Array.from({ length: count }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`h-1.5 w-9 rounded-sm border border-white ${weight}`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function ArenaBadge({ arena }: { arena: Arena }) {
    const meta = ARENA_META[arena];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}
        >
            <meta.Icon className="w-3.5 h-3.5" />
            {meta.label}
        </span>
    );
}

function SideButton({
    side,
    wrong,
    onClick,
}: {
    side: Side;
    wrong: boolean;
    onClick: () => void;
}) {
    const isGevinst = side === 'gevinst';
    const Icon = isGevinst ? TrendingUp : TrendingDown;
    return (
        <motion.button
            onClick={onClick}
            animate={wrong ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                wrong
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : isGevinst
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'
                      : 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300'
            }`}
        >
            <Icon className="w-4 h-4" />
            {isGevinst ? 'Gevinst' : 'Kostnad'}
        </motion.button>
    );
}
