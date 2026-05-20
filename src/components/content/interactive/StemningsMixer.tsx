import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, RotateCcw, Sparkles } from 'lucide-react';

interface StemningsMixerProps {
    title?: string;
}

type Toneart = 'dur' | 'moll';
type Dynamikk = 'svak' | 'middels' | 'sterk';
type Instrument = 'piano' | 'band' | 'strykere' | 'elektronikk';

interface Mood {
    label: string;
    emoji: string;
    color: string;
    ring: string;
    description: string;
    eksempler: string[];
}

const INSTRUMENT_OPTIONS: { id: Instrument; label: string; hint: string }[] = [
    { id: 'piano', label: 'Piano alene', hint: 'Nakent og personlig' },
    { id: 'band', label: 'Akustisk band', hint: 'Varmt og levende' },
    { id: 'strykere', label: 'Strykere', hint: 'Stort og filmaktig' },
    { id: 'elektronikk', label: 'Elektronikk', hint: 'Moderne og pulserende' },
];

const DYNAMIKK_OPTIONS: { id: Dynamikk; label: string }[] = [
    { id: 'svak', label: 'Svak' },
    { id: 'middels', label: 'Middels' },
    { id: 'sterk', label: 'Sterk' },
];

function tempoBucket(bpm: number): 'lav' | 'middels' | 'hoy' {
    if (bpm < 95) return 'lav';
    if (bpm < 135) return 'middels';
    return 'hoy';
}

function tempoLabel(bpm: number): string {
    const b = tempoBucket(bpm);
    if (b === 'lav') return 'Langsomt';
    if (b === 'middels') return 'Medium';
    return 'Raskt';
}

function instrumentFlavor(instrument: Instrument): string {
    switch (instrument) {
        case 'piano':
            return ' Piano alene gjør det nakent og personlig.';
        case 'band':
            return ' Et akustisk band gir varme og menneskelig nærhet.';
        case 'strykere':
            return ' Strykere løfter uttrykket og gir det filmaktig størrelse.';
        case 'elektronikk':
            return ' Elektronikken gjør uttrykket moderne og pulserende.';
    }
}

function calcMood(
    toneart: Toneart,
    bpm: number,
    dynamikk: Dynamikk,
    instrument: Instrument
): Mood {
    const base = calcBaseMood(toneart, bpm, dynamikk);
    return { ...base, description: base.description + instrumentFlavor(instrument) };
}

function calcBaseMood(toneart: Toneart, bpm: number, dynamikk: Dynamikk): Mood {
    const t = tempoBucket(bpm);
    const sterk = dynamikk === 'sterk';
    const svak = dynamikk === 'svak';

    if (toneart === 'dur') {
        if (t === 'lav') {
            return {
                label: svak ? 'Fredfull' : 'Varm',
                emoji: svak ? '🌅' : '☀️',
                color: 'from-amber-200 to-orange-300',
                ring: 'shadow-amber-300/60',
                description: 'Lyse toner i sakte tempo gir en rolig, åpen følelse — som en stille morgen.',
                eksempler: ['"Here Comes the Sun" — The Beatles', '"Vårsøg" — folkemelodi'],
            };
        }
        if (t === 'middels') {
            return {
                label: sterk ? 'Triumferende' : 'Glad',
                emoji: sterk ? '🎉' : '😊',
                color: 'from-yellow-200 to-amber-400',
                ring: 'shadow-yellow-300/70',
                description: 'Dur i normalt tempo er hverdagens optimisme — pop, barnesanger, glade refrenger.',
                eksempler: ['"Happy" — Pharrell Williams', '"Ja, vi elsker"'],
            };
        }
        return {
            label: sterk ? 'Eksplosiv' : 'Energisk',
            emoji: sterk ? '⚡' : '🚀',
            color: 'from-orange-300 to-rose-400',
            ring: 'shadow-orange-400/80',
            description: 'Rask dur løfter pulsen og driver kroppen — danselåter, festmusikk, jubel.',
            eksempler: ['"Don\'t Stop Me Now" — Queen', '"Dance Monkey" — Tones and I'],
        };
    }

    // moll
    if (t === 'lav') {
        return {
            label: svak ? 'Sårbar' : 'Vemodig',
            emoji: svak ? '🌙' : '🕯️',
            color: 'from-indigo-300 to-slate-400',
            ring: 'shadow-indigo-400/60',
            description: 'Moll i sakte tempo bærer sorg og lengsel — ballader, requiem, avskjedssanger.',
            eksempler: ['"Hallelujah" — Leonard Cohen', '"Mitt hjerte alltid vanker"'],
        };
    }
    if (t === 'middels') {
        return {
            label: sterk ? 'Mektig' : 'Tankefull',
            emoji: sterk ? '🌊' : '🌧️',
            color: 'from-sky-400 to-indigo-500',
            ring: 'shadow-sky-400/70',
            description: 'Moll i medium tempo gir tyngde og ettertanke — filmmusikk, rockballader, salmer.',
            eksempler: ['"Mad World" — Gary Jules', '"Stairway to Heaven" — Led Zeppelin'],
        };
    }
    return {
        label: sterk ? 'Dramatisk' : 'Anspent',
        emoji: sterk ? '🌩️' : '🔥',
        color: 'from-violet-500 to-fuchsia-600',
        ring: 'shadow-violet-500/80',
        description: 'Rask moll skaper drama og uro — actionscener, kampmusikk, intense refrenger.',
        eksempler: ['Imperial March — John Williams', '"Bohemian Rhapsody" (rock-delen) — Queen'],
    };
}

export function StemningsMixer({ title = 'Stemningsmikseren' }: StemningsMixerProps) {
    const [toneart, setToneart] = useState<Toneart>('dur');
    const [tempo, setTempo] = useState<number>(110);
    const [dynamikk, setDynamikk] = useState<Dynamikk>('middels');
    const [instrument, setInstrument] = useState<Instrument>('piano');
    const [hasInteracted, setHasInteracted] = useState(false);

    const mood = useMemo(
        () => calcMood(toneart, tempo, dynamikk, instrument),
        [toneart, tempo, dynamikk, instrument]
    );

    const pulseDuration = 60 / tempo;

    const touch = () => {
        if (!hasInteracted) setHasInteracted(true);
    };

    const handleReset = () => {
        setToneart('dur');
        setTempo(110);
        setDynamikk('middels');
        setInstrument('piano');
        setHasInteracted(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                <Music className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg fire virkemidler — se hvilken stemning som oppstår.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-5">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            Toneart
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {(['dur', 'moll'] as Toneart[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        touch();
                                        setToneart(t);
                                    }}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                                        toneart === t
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {t === 'dur' ? 'Dur (lys)' : 'Moll (mørk)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-baseline">
                            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                                Tempo
                            </label>
                            <span className="text-sm text-slate-600">
                                {tempo} BPM · {tempoLabel(tempo)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={60}
                            max={180}
                            step={2}
                            value={tempo}
                            onChange={(e) => {
                                touch();
                                setTempo(Number(e.target.value));
                            }}
                            className="mt-2 w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Langsom (60)</span>
                            <span>Medium (110)</span>
                            <span>Rask (180)</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            Dynamikk
                        </label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {DYNAMIKK_OPTIONS.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        touch();
                                        setDynamikk(d.id);
                                    }}
                                    className={`rounded-lg px-2 py-2 text-sm font-medium border transition-colors ${
                                        dynamikk === d.id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            Instrumentering
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {INSTRUMENT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        touch();
                                        setInstrument(opt.id);
                                    }}
                                    className={`rounded-lg px-3 py-2 text-left border transition-colors ${
                                        instrument === opt.id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="text-sm font-medium">{opt.label}</div>
                                    <div
                                        className={`text-xs ${
                                            instrument === opt.id
                                                ? 'text-indigo-100'
                                                : 'text-slate-500'
                                        }`}
                                    >
                                        {opt.hint}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 self-start flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Stemnings­resultat
                    </div>

                    <div className="relative flex items-center justify-center w-full">
                        <motion.div
                            key={`${toneart}-${tempoBucket(tempo)}-${dynamikk}-${instrument}`}
                            initial={{ scale: 0.85, opacity: 0.6 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                            className={`w-40 h-40 rounded-full bg-gradient-to-br ${mood.color} shadow-xl ${mood.ring} flex items-center justify-center`}
                        >
                            <motion.span
                                className="text-6xl select-none"
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{
                                    duration: pulseDuration,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                {mood.emoji}
                            </motion.span>
                        </motion.div>
                    </div>

                    <div className="mt-4 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mood.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="text-2xl font-bold text-slate-800">
                                    {mood.label}
                                </div>
                                <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">
                                    {mood.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-4 w-full">
                        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                            Eksempler du kanskje kjenner
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1">
                            {mood.eksempler.map((ex) => (
                                <li key={ex} className="flex gap-2">
                                    <span className="text-indigo-400">♪</span>
                                    <span>{ex}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {hasInteracted && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                    >
                        Legg merke til: du har ikke endret melodien — bare virkemidlene rundt den.
                        Likevel skifter hele følelsen. Det er kraften i musikalske virkemidler.
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
