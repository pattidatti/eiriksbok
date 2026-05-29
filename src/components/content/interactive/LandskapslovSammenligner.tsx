import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, RotateCcw, Crown, MapPin } from 'lucide-react';

type LandskapId = 'gulating' | 'frostating' | 'eidsivating' | 'borgarting';

interface Dom {
    by: string;
    region: string;
    straff: string;
    forklaring: string;
}

interface Sak {
    id: string;
    tittel: string;
    beskrivelse: string;
    dommerFor: Record<LandskapId, Dom>;
    domEtter: {
        straff: string;
        forklaring: string;
    };
}

interface LandskapslovSammenlignerProps {
    title?: string;
    saker?: Sak[];
}

const DEFAULT_SAKER: Sak[] = [
    {
        id: 'sau',
        tittel: 'Tor stjeler en sau',
        beskrivelse: 'En fattig bonde tar naboens sau om natten for å mette familien sin.',
        dommerFor: {
            gulating: {
                by: 'Bergen',
                region: 'Gulating',
                straff: '3 mark sølv i bot',
                forklaring: 'Boten går til eieren. Hvis Tor ikke kan betale, blir han trell hos eieren i ett år.',
            },
            frostating: {
                by: 'Trondheim',
                region: 'Frostating',
                straff: '6 mark sølv eller landsforvisning',
                forklaring: 'Trøndelag hadde strengere lover for tyveri. Kan Tor ikke betale, må han flykte fra Trøndelag.',
            },
            eidsivating: {
                by: 'Hamar',
                region: 'Eidsivating',
                straff: 'Pisking pluss bot til offeret',
                forklaring: 'På Opplandene var pisking vanlig for små tyverier. Ætten hans måtte hjelpe med boten.',
            },
            borgarting: {
                by: 'Sarpsborg',
                region: 'Borgarting',
                straff: 'Henging hvis sauen er verdt mer enn 2 ører',
                forklaring: 'I Viken var straffen ofte hard, særlig hvis verdien oversteg en bestemt grense.',
            },
        },
        domEtter: {
            straff: 'Bot til offeret pluss bot til kongen. Ingen dødsstraff for lite tyveri.',
            forklaring: 'Landsloven setter samme grense overalt. Kongens fogd dømmer. Liv og kropp er beskyttet.',
        },
    },
    {
        id: 'drap',
        tittel: 'Eirik dreper Vidar i en krangel',
        beskrivelse: 'To naboer kommer i slagsmål etter et bryllup. Eirik trekker kniven og dreper Vidar.',
        dommerFor: {
            gulating: {
                by: 'Bergen',
                region: 'Gulating',
                straff: '60 mark sølv i mannebot til Vidars ætt',
                forklaring: 'Wergild-systemet gjelder. Ætten kan velge bot eller blodhevn.',
            },
            frostating: {
                by: 'Trondheim',
                region: 'Frostating',
                straff: '40 mark sølv pluss landsforvisning i tre år',
                forklaring: 'Trøndelag krevde både bot og at drapsmannen forsvant fra området en stund.',
            },
            eidsivating: {
                by: 'Hamar',
                region: 'Eidsivating',
                straff: 'Blodhevn tillatt av Vidars ætt',
                forklaring: 'På Opplandene kunne ætten lovlig drepe Eirik tilbake. Hver hevn fødte nye hevner.',
            },
            borgarting: {
                by: 'Sarpsborg',
                region: 'Borgarting',
                straff: 'Fredløshet — alle kan drepe Eirik straffritt',
                forklaring: 'I Viken kunne en drapsmann erklæres fredløs. Han hadde da ingen beskyttelse fra noen.',
            },
        },
        domEtter: {
            straff: 'Kongen dømmer. Bot til ætten, bot til kongen, eller dødsstraff ved overlegg.',
            forklaring: 'Blodhevn er forbudt. Det er kongen som straffer, ikke familien. Saken er statens, ikke ættens.',
        },
    },
    {
        id: 'overgrep',
        tittel: 'Ingrid blir overfalt på vei hjem',
        beskrivelse: 'En ukjent mann angriper Ingrid på en øde sti. Hun overlever, men er hardt skadet.',
        dommerFor: {
            gulating: {
                by: 'Bergen',
                region: 'Gulating',
                straff: 'Bot til Ingrids far',
                forklaring: 'Kvinner var under farens eller mannens vergeansvar. Boten gikk til ham, ikke til Ingrid.',
            },
            frostating: {
                by: 'Trondheim',
                region: 'Frostating',
                straff: 'Bot til ætten pluss kirkebot',
                forklaring: 'Kirken krevde også sin del. Ingrid selv fikk ingenting.',
            },
            eidsivating: {
                by: 'Hamar',
                region: 'Eidsivating',
                straff: 'Avhengig av Ingrids status',
                forklaring: 'Var Ingrid datter av en høvding, ble boten høy. Var hun trell, fikk eieren erstatning.',
            },
            borgarting: {
                by: 'Sarpsborg',
                region: 'Borgarting',
                straff: 'Fredløshet for gjerningsmannen',
                forklaring: 'I Viken kunne overfallsmenn erklæres fredløse, men ofte måtte familien selv fange dem.',
            },
        },
        domEtter: {
            straff: 'Kongens dom. Bot til Ingrid selv, fengsel eller dødsstraff for gjerningsmannen.',
            forklaring: 'Landsloven anerkjenner offeret som person. Kvinner får egen rett til erstatning, ikke bare familien.',
        },
    },
];

const LANDSKAP_ORDER: LandskapId[] = ['gulating', 'frostating', 'eidsivating', 'borgarting'];

export function LandskapslovSammenligner({
    title = 'Fire lover - eller én?',
    saker = DEFAULT_SAKER,
}: LandskapslovSammenlignerProps) {
    const [valgtSakIdx, setValgtSakIdx] = useState(0);
    const [aapneDommer, setAapneDommer] = useState<Set<LandskapId>>(new Set());
    const [viserLandsloven, setViserLandsloven] = useState(false);

    const sak = saker[valgtSakIdx];
    const alleAapne = aapneDommer.size === LANDSKAP_ORDER.length;

    const toggleDom = (id: LandskapId) => {
        const ny = new Set(aapneDommer);
        if (ny.has(id)) ny.delete(id);
        else ny.add(id);
        setAapneDommer(ny);
    };

    const bytteSak = (idx: number) => {
        setValgtSakIdx(idx);
        setAapneDommer(new Set());
        setViserLandsloven(false);
    };

    const reset = () => {
        setAapneDommer(new Set());
        setViserLandsloven(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en sak, sammenlign hva de fire landskapene dømte, og se hva Magnus endret.
                    </p>
                </div>
            </div>

            <div className="px-6 pt-4 pb-3">
                <div className="flex flex-wrap gap-2">
                    {saker.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => bytteSak(idx)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                idx === valgtSakIdx
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {s.tittel}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 pb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700">{sak.beskrivelse}</p>
                </div>
            </div>

            <div className="px-6 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    {viserLandsloven ? 'Etter Landsloven 1274' : 'Før Landsloven (rundt 1250)'}
                </p>

                <AnimatePresence mode="wait">
                    {!viserLandsloven ? (
                        <motion.div
                            key="for"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                            {LANDSKAP_ORDER.map((id) => {
                                const dom = sak.dommerFor[id];
                                const aapen = aapneDommer.has(id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => toggleDom(id)}
                                        className={`text-left p-3 rounded-lg border transition-all ${
                                            aapen
                                                ? 'bg-amber-50 border-amber-300 shadow-md'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-amber-600" />
                                            <span className="font-semibold text-sm text-slate-800">
                                                {dom.by}
                                            </span>
                                            <span className="text-xs text-slate-500">({dom.region})</span>
                                        </div>
                                        <AnimatePresence mode="wait">
                                            {aapen ? (
                                                <motion.div
                                                    key="aapen"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-sm font-medium text-amber-800 mt-1">
                                                        {dom.straff}
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        {dom.forklaring}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.p
                                                    key="lukket"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="text-xs text-slate-400 italic"
                                                >
                                                    Klikk for å se dommen
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="etter"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 shadow-md"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Crown className="w-6 h-6 text-emerald-700" />
                                <div>
                                    <p className="font-bold text-emerald-900">
                                        Kongens dom - lik for hele Norge
                                    </p>
                                    <p className="text-xs text-emerald-700">
                                        Bergen, Trondheim, Hamar, Sarpsborg - samme lov
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-900 mt-2">
                                {sak.domEtter.straff}
                            </p>
                            <p className="text-sm text-emerald-800 mt-2">{sak.domEtter.forklaring}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {alleAapne && !viserLandsloven && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200"
                    >
                        <p className="text-sm text-blue-800">
                            Fire byer, fire dommer for samme handling. Hvilken straff Tor fikk, kom an
                            på hvor han var. Trykk knappen under for å se hva Magnus Lagabøte endret.
                        </p>
                    </motion.div>
                )}
                {viserLandsloven && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200"
                    >
                        <p className="text-sm text-indigo-800">
                            Lyspæren: Etter 1274 er straffen den samme uansett hvor du bor. Det er
                            kongen - ikke familien - som straffer. Dette er begynnelsen pa
                            rettsstaten i Norge.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between gap-3">
                <button
                    onClick={() => setViserLandsloven(!viserLandsloven)}
                    disabled={!alleAapne && !viserLandsloven}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                        alleAapne || viserLandsloven
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Crown className="w-4 h-4" />
                    {viserLandsloven ? 'Tilbake til de fire lovene' : '1274 - Magnus samler Norge'}
                </button>
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
