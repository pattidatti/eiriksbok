import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';

interface Sang {
    id: string;
    tittel: string;
    artist: string;
    aar: string;
    kontekst: string;
    lyrikk: string;
    urett: string;
    virkemiddel: string;
    effekt: string;
    farge: string;
    aksent: string;
}

interface ProtestsangAnalyseProps {
    title?: string;
}

const SANGER: Sang[] = [
    {
        id: 'strange-fruit',
        tittel: 'Strange Fruit',
        artist: 'Billie Holiday',
        aar: '1939',
        kontekst:
            'Sunget i en mørk klubb i New York. Billie Holiday var en svart sangerinne. Hun ville at folk skulle se det de helst lukket øynene for.',
        lyrikk: '"Sørstatens trær bærer en merkelig frukt — blod på bladene, og blod ved rotten."',
        urett: 'Lynsjing — drap på svarte mennesker som hang i trær uten rettssak. Politiet så ofte en annen vei.',
        virkemiddel:
            'En makaber metafor. Holiday synger om "frukt" — men beskriver lik. Den rolige, vakre melodien gjør grusomheten enda mer brutal å høre.',
        effekt:
            'Klubben slukket lysene. Ingen drikker ble servert. Ingen klappet etterpå. Sangen ble for mange amerikanere det første sjokket — og en av kjernepunktene i det som ble borgerrettsbevegelsen.',
        farge: 'bg-amber-50',
        aksent: 'border-amber-200',
    },
    {
        id: 'blowin-in-the-wind',
        tittel: 'Blowin’ in the Wind',
        artist: 'Bob Dylan',
        aar: '1962',
        kontekst:
            'En 21 år gammel folkemusiker fra Minnesota. USA var i ferd med å gå inn i Vietnamkrigen, og svarte amerikanere kjempet for like rettigheter.',
        lyrikk:
            '"Hvor mange veier må en mann gå før vi kaller ham en mann? Svaret, min venn, blåser i vinden."',
        urett: 'Krigen i Vietnam og rasismen i USA — to urettferdigheter som mange ikke ville snakke om.',
        virkemiddel:
            'Spørsmål i stedet for svar. Dylan peker ikke på en synder — han tvinger lytteren til å spørre seg selv. Enkel melodi som alle kan lære på fem minutter.',
        effekt:
            'Sangen ble en hymne i demonstrasjoner mot krigen og for borgerrettigheter. Når tusen mennesker synger samme spørsmål, blir tausheten umulig å holde ut.',
        farge: 'bg-sky-50',
        aksent: 'border-sky-200',
    },
    {
        id: 'free-nelson-mandela',
        tittel: 'Free Nelson Mandela',
        artist: 'The Special AKA',
        aar: '1984',
        kontekst:
            'Et britisk ska-band laget en festsang med politisk budskap. Nelson Mandela hadde da sittet 22 år i fengsel under apartheid-regimet i Sør-Afrika.',
        lyrikk: '"Free — Nelson Mandela! Free — Nelson Mandela!"',
        urett: 'Apartheid i Sør-Afrika — et system som ga svarte mennesker færre rettigheter og fengslet de som protesterte.',
        virkemiddel:
            'En glad, dansbar rytme kombinert med et tøft politisk krav. Sangen er nesten umulig å ikke synge med på — selv om du ikke vet hvem Mandela var.',
        effekt:
            'Spilt på radio over hele verden. Den lærte millioner av tenåringer navnet "Mandela". Internasjonalt press økte. I 1990 ble Mandela løslatt. I 1994 ble han Sør-Afrikas president.',
        farge: 'bg-emerald-50',
        aksent: 'border-emerald-200',
    },
    {
        id: 'mitt-lille-land',
        tittel: 'Mitt lille land',
        artist: 'Ole Paus',
        aar: '1994 — og 2011',
        kontekst:
            'Ole Paus skrev sangen i 1994. Etter terrorangrepet i Oslo og på Utøya 22. juli 2011 ble den sunget på minnemarkeringer over hele landet.',
        lyrikk:
            '"Mitt lille land. Et lite sted, en håndfull fred slengt ut blant vidder og fjord."',
        urett:
            'Terrorangrep mot demokrati og åpen ungdom. 77 mennesker mistet livet på Utøya og i regjeringskvartalet.',
        virkemiddel:
            'Enkel, sårbar melodi som alle kan synge sammen. Teksten beskriver Norge med kjærlighet, ikke sinne. Sorgen blir et fellesskap, ikke hat.',
        effekt:
            'Ble samlingspunktet for nasjonen. 200 000 mennesker stod på Rådhusplassen i Oslo og sang sammen. Sangen viste at man kan svare på vold med samhold — og at en sang kan bli et helt folks bønn.',
        farge: 'bg-rose-50',
        aksent: 'border-rose-200',
    },
];

type Slot = 'urett' | 'virkemiddel' | 'effekt';

const SLOT_LABELS: Record<Slot, string> = {
    urett: 'Urett',
    virkemiddel: 'Virkemiddel',
    effekt: 'Effekt',
};

const SLOT_BESKRIVELSE: Record<Slot, string> = {
    urett: 'Hva er det sangen protesterer mot?',
    virkemiddel: 'Hva gjør sangen musikalsk for å treffe deg?',
    effekt: 'Hva førte sangen til?',
};

export function ProtestsangAnalyse({ title = 'Protestsang-analysator' }: ProtestsangAnalyseProps) {
    const [aktivIndex, setAktivIndex] = useState(0);
    const [avsloert, setAvsloert] = useState<Record<string, Set<Slot>>>({});

    const aktiv = SANGER[aktivIndex];
    const avsloertForAktiv = avsloert[aktiv.id] ?? new Set<Slot>();
    const alleAvsloertForAktiv =
        avsloertForAktiv.has('urett') &&
        avsloertForAktiv.has('virkemiddel') &&
        avsloertForAktiv.has('effekt');

    const alleSangerFerdige = SANGER.every((s) => {
        const sett = avsloert[s.id];
        return sett && sett.has('urett') && sett.has('virkemiddel') && sett.has('effekt');
    });

    const avsloer = (slot: Slot) => {
        setAvsloert((prev) => {
            const eksisterende = prev[aktiv.id] ?? new Set<Slot>();
            const nytt = new Set(eksisterende);
            nytt.add(slot);
            return { ...prev, [aktiv.id]: nytt };
        });
    };

    const gaaTilSang = (retning: 1 | -1) => {
        setAktivIndex((i) => {
            const ny = i + retning;
            if (ny < 0) return SANGER.length - 1;
            if (ny >= SANGER.length) return 0;
            return ny;
        });
    };

    const tilbakestill = () => {
        setAktivIndex(0);
        setAvsloert({});
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk på de tre kortene for å avsløre hvordan sangen virker.
                    </p>
                </div>
            </div>

            <div className="px-6 pt-4 flex items-center justify-between text-sm text-slate-500">
                <button
                    onClick={() => gaaTilSang(-1)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Forrige sang"
                >
                    <ChevronLeft className="w-4 h-4" /> Forrige
                </button>
                <span className="font-medium text-slate-600">
                    {aktivIndex + 1} / {SANGER.length}
                </span>
                <button
                    onClick={() => gaaTilSang(1)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Neste sang"
                >
                    Neste <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={aktiv.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className={`${aktiv.farge} ${aktiv.aksent} border rounded-xl p-5`}
                    >
                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                            <h4 className="text-lg font-semibold text-slate-800">
                                {aktiv.tittel}
                            </h4>
                            <span className="text-sm text-slate-500">
                                {aktiv.artist} · {aktiv.aar}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{aktiv.kontekst}</p>
                        <p className="mt-3 italic text-slate-700 text-sm">{aktiv.lyrikk}</p>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(['urett', 'virkemiddel', 'effekt'] as Slot[]).map((slot) => {
                                const erAvsloert = avsloertForAktiv.has(slot);
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => avsloer(slot)}
                                        className={`text-left rounded-lg border transition-all ${
                                            erAvsloert
                                                ? 'bg-white border-slate-200 shadow-sm'
                                                : 'bg-white/70 border-slate-300 border-dashed hover:bg-white hover:shadow-sm'
                                        } p-3 min-h-[7rem]`}
                                        aria-pressed={erAvsloert}
                                    >
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {SLOT_LABELS[slot]}
                                        </div>
                                        {erAvsloert ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-slate-700 leading-snug"
                                            >
                                                {aktiv[slot]}
                                            </motion.p>
                                        ) : (
                                            <p className="mt-1 text-sm text-slate-500">
                                                {SLOT_BESKRIVELSE[slot]}
                                                <span className="block mt-1 text-indigo-500 font-medium">
                                                    Klikk for å avsløre
                                                </span>
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {alleAvsloertForAktiv && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-4 bg-white border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-start gap-2"
                                >
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Du har funnet mønsteret i denne sangen: konkret urett,
                                        musikalsk virkemiddel og målbar effekt.
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {alleSangerFerdige && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800"
                    >
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Du ser oppskriften nå.</p>
                                <p className="text-sm mt-1">
                                    Alle protestsanger bruker samme tre ingredienser: en konkret
                                    urett som ikke kan ignoreres, et musikalsk grep som setter
                                    seg fast i hodet, og en melodi som er enkel nok til at vi kan
                                    synge den sammen.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={tilbakestill}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
