import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sailboat, Users, Eye, Scale, EyeOff } from 'lucide-react';

// Signaturkomponent for "Kven skriv historia?".
// Lyspaere: historie er aldri noytral. Den som velger HVEM som star i sentrum,
// HVILKE ord som brukes, og HVA som nevnes, former hva folk tror - og dermed
// makta. Eleven flytter en spotlight mellom to grupper (Columbus 1492), vrir pa
// verbet og pa om landet "alt var bebodd" nevnes, og ser den samme hendelsen bli
// helt ulike historier. Noen blir alltid skjovet i skyggen - og bare den
// balanserte innrammingen lar ingen forsvinne.

type Center = 'sjofarerne' | 'begge' | 'folket';
type Verb = 'oppdaget' | 'erobret' | 'motte';

const VERB_WORD: Record<Verb, string> = {
    oppdaget: 'oppdaget',
    erobret: 'erobret',
    motte: 'møtte',
};

// Bygger historiebok-setningen ut fra de tre valgene.
function buildSentence(center: Center, verb: Verb, mention: boolean): string {
    if (center === 'begge') {
        return 'I 1492 møttes to verdener: sjøfarere fra Europa og folket som alt hadde bodd i landet i tusenvis av år.';
    }
    if (center === 'sjofarerne') {
        const base = `I 1492 ${VERB_WORD[verb]} europeiske sjøfarere et nytt land langt mot vest.`;
        return mention ? `${base} Men landet var allerede hjem for millioner av mennesker.` : base;
    }
    // center === 'folket'
    const tail =
        verb === 'oppdaget'
            ? ' De fremmede sa de hadde «oppdaget» et land som lenge hadde vært bebodd.'
            : verb === 'erobret'
              ? ' De fremmede kom snart til å erobre hjemmet deres.'
              : ' Det ble det første møtet mellom to folk.';
    return `I 1492 så folket som hadde bodd i landet i tusenvis av år, fremmede skip dukke opp ved kysten.${tail}`;
}

// Hvem tjener innrammingen, og hvor balansert er den?
function analyse(center: Center, verb: Verb, mention: boolean) {
    if (center === 'begge') {
        return {
            serves: 'Ingen ensidig - begge perspektivene står ved siden av hverandre',
            invisible: null as string | null,
            frame: 'Balansert: ingen blir skjult',
            tone: 'green' as const,
        };
    }
    if (center === 'sjofarerne') {
        const hard = verb === 'oppdaget' || verb === 'erobret';
        return {
            serves: hard
                ? 'Europas rett til landet gjøres til det selvfølgelige'
                : 'Fortsatt et europeisk blikk, men i en mildere form',
            invisible: mention ? 'Folket i landet havner i skyggen' : 'Folket som alt bodde der',
            frame: mention
                ? 'Ensidig (europeisk), men nevner sannheten'
                : 'Ensidig - og skjuler at landet var bebodd',
            tone: mention ? ('amber' as const) : ('red' as const),
        };
    }
    return {
        serves: 'Urfolkets perspektiv løftes fram',
        invisible: 'Sjøfarernes blikk tones ned',
        frame: 'Ensidig (urfolkets side)',
        tone: 'amber' as const,
    };
}

const TONE_COLOR: Record<'green' | 'amber' | 'red', string> = {
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
};

export const HistoriensSpotlight: React.FC = () => {
    const [center, setCenter] = useState<Center>('sjofarerne');
    const [verb, setVerb] = useState<Verb>('oppdaget');
    const [mention, setMention] = useState(false);

    const sentence = useMemo(() => buildSentence(center, verb, mention), [center, verb, mention]);
    const info = useMemo(() => analyse(center, verb, mention), [center, verb, mention]);

    // Lysstyrke per gruppe (0-1). Spotlight + "nevn at landet var bebodd" styrer
    // hvor synlig folket er.
    const seaLit = center === 'sjofarerne' ? 1 : center === 'begge' ? 1 : 0.4;
    const peopleLit =
        center === 'folket'
            ? 1
            : center === 'begge'
              ? 1
              : mention
                ? 0.4
                : 0.12; // usynliggjort naar landet ikke nevnes som bebodd

    // Spotlight-senter i prosent av scenebredden.
    const spotX = center === 'sjofarerne' ? 27 : center === 'folket' ? 73 : 50;
    const spotWide = center === 'begge';

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Eye className="w-5 h-5 text-amber-600" />
                    <h3 className="font-display font-bold text-lg">Hvem setter du i sentrum?</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Samme hendelse - Columbus i 1492. Flytt spotlighten, vri på ordet, og bestem om
                    sannheten skal nevnes. Se hvordan historieboka endrer seg.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                {/* Venstre: scenen + historiebok-setningen */}
                <div>
                    {/* Scenen */}
                    <div className="relative rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-100/70 overflow-hidden h-52">
                        {/* Spotlight-glod */}
                        <motion.div
                            className="pointer-events-none absolute top-0 bottom-10 rounded-full"
                            style={{
                                background:
                                    'radial-gradient(closest-side, rgba(255,237,170,0.95), rgba(255,237,170,0))',
                                filter: 'blur(2px)',
                            }}
                            animate={{
                                left: `${spotX}%`,
                                width: spotWide ? '95%' : '52%',
                                x: '-50%',
                            }}
                            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                        {/* Scenegulv */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-amber-200/60 border-t border-amber-300/70" />

                        {/* De to gruppene */}
                        <div className="absolute inset-0 flex items-end justify-around pb-10 px-4">
                            <ActorGroup
                                lit={seaLit}
                                color="#2563eb"
                                label="Europeiske sjøfarere"
                                icon={<Sailboat className="w-5 h-5" />}
                            />
                            <ActorGroup
                                lit={peopleLit}
                                color="#16a34a"
                                label="Folket i landet"
                                icon={<Users className="w-5 h-5" />}
                            />
                        </div>

                        {/* Usynliggjort-stempel naar folket nesten forsvinner */}
                        <AnimatePresence>
                            {peopleLit <= 0.12 && (
                                <motion.div
                                    key="usynlig"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-1"
                                >
                                    <EyeOff className="w-3.5 h-3.5" /> Usynliggjort
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Historiebok-setningen */}
                    <div className="mt-3 rounded-xl border border-slate-200 bg-[#fcfbf7] p-4">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Slik står det i historieboka
                        </span>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={sentence}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="font-display text-[15px] leading-relaxed text-slate-800 mt-1"
                            >
                                {sentence}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Hoyre: bryterne + analyse */}
                <div className="flex flex-col gap-3">
                    <Segmented
                        label="Spotlight"
                        options={[
                            { id: 'sjofarerne', text: 'Sjøfarerne' },
                            { id: 'begge', text: 'Begge' },
                            { id: 'folket', text: 'Folket' },
                        ]}
                        value={center}
                        onChange={(v) => setCenter(v as Center)}
                    />
                    <Segmented
                        label="Ordet de bruker"
                        options={[
                            { id: 'oppdaget', text: 'oppdaget' },
                            { id: 'erobret', text: 'erobret' },
                            { id: 'motte', text: 'møtte' },
                        ]}
                        value={verb}
                        onChange={(v) => setVerb(v as Verb)}
                    />

                    {/* Nevn-sannheten-bryter */}
                    <button
                        onClick={() => setMention((m) => !m)}
                        className={`flex items-center justify-between rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                            mention
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="text-left">Nevn at landet alt var bebodd</span>
                        <span
                            className={`ml-3 flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                                mention ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                        >
                            <motion.span layout className="h-5 w-5 rounded-full bg-white shadow" />
                        </span>
                    </button>

                    {/* Analyse */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mt-1 space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 flex-shrink-0" style={{ color: TONE_COLOR[info.tone] }} />
                            <span className="text-sm font-bold" style={{ color: TONE_COLOR[info.tone] }}>
                                {info.frame}
                            </span>
                        </div>
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold text-slate-500">Tjener: </span>
                            {info.serves}
                        </div>
                        <AnimatePresence mode="wait">
                            {info.invisible && (
                                <motion.div
                                    key={info.invisible}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-start gap-2 text-sm text-amber-700"
                                >
                                    <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{info.invisible}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-amber-50 border-t border-amber-100 px-5 py-3 text-sm text-amber-900">
                <Eye className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <p>
                    Hendelsen er den samme hele tiden. Det er hvem du setter i sentrum, hvilke ord du
                    velger, og hva du nevner, som avgjør historien. Ingen framstilling er nøytral - og
                    noen blir nesten alltid skjøvet ut i skyggen.
                </p>
            </div>
        </div>
    );
};

// En gruppe figurer pa scenen. `lit` (0-1) styrer farge, storrelse og opacitet:
// i spotlighten = full farge og storre, i skyggen = gra og liten.
function ActorGroup({
    lit,
    color,
    label,
    icon,
}: {
    lit: number;
    color: string;
    label: string;
    icon: React.ReactNode;
}) {
    const inLight = lit >= 0.9;
    return (
        <motion.div
            className="flex flex-col items-center gap-1.5"
            animate={{
                opacity: Math.max(lit, 0.12),
                scale: 0.86 + lit * 0.2,
                y: inLight ? -6 : 0,
                filter: inLight ? 'grayscale(0)' : `grayscale(${1 - lit})`,
            }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        >
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <Silhouette key={i} color={color} />
                ))}
            </div>
            <span
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
                style={{ backgroundColor: color }}
            >
                {icon}
                {label}
            </span>
        </motion.div>
    );
}

// Enkel figur-silhuett (hode + kropp).
function Silhouette({ color }: { color: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <div
                className="h-6 w-4 rounded-t-md -mt-0.5"
                style={{ backgroundColor: color, opacity: 0.85 }}
            />
        </div>
    );
}

// Segmentert tre-/to-valgs-bryter med glidende markor.
function Segmented({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: { id: string; text: string }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <div
                className="mt-1 grid gap-1.5 p-1 rounded-xl bg-slate-100"
                style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
            >
                {options.map((opt) => {
                    const active = value === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={`relative rounded-lg px-2 py-2 text-sm font-semibold transition ${
                                active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {active && (
                                <motion.span
                                    layoutId={`seg-${label}`}
                                    className="absolute inset-0 rounded-lg bg-amber-600"
                                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                />
                            )}
                            <span className="relative z-10">{opt.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
