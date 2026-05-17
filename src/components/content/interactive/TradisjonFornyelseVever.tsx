import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Sparkles, RotateCcw, Check } from 'lucide-react';

interface Tradisjon {
    id: string;
    navn: string;
    epoke: string;
    forklaring: string;
    moderne: {
        artist: string;
        verk: string;
        hvordan: string;
    };
}

interface TradisjonFornyelseVeverProps {
    title?: string;
    undertittel?: string;
    tradisjoner?: Tradisjon[];
}

const STANDARD_TRADISJONER: Tradisjon[] = [
    {
        id: 'hardingfele',
        navn: 'Hardingfela',
        epoke: '1600-tallet → i dag',
        forklaring:
            'Fela med ekstra strenger under fingerbrettet. Når du stryker de øverste, vibrerer de nederste av seg selv og lager en surrende, magisk klang. Sentralt i bygdedans i Telemark, Hardanger og Setesdal.',
        moderne: {
            artist: 'Annbjørg Lien',
            verk: 'Elektrisk hardingfele med band',
            hvordan:
                'Hun beholder felas særegne understrenger og slått-motivene, men setter dem inn i rytmer fra rock, jazz og pop. Tradisjonen er der — bare med et nytt teppe under.',
        },
    },
    {
        id: 'slatt',
        navn: 'Slått',
        epoke: '1500-tallet → i dag',
        forklaring:
            'Dansemelodier for bygdedans: springar, halling og gangar. Hver bygd hadde sine egne slåtter, lært fra fela til fela uten noter. En slått er aldri helt lik to ganger.',
        moderne: {
            artist: 'Gåte',
            verk: 'Folkerock med slått-motiver',
            hvordan:
                'Trommer, elgitar og synth, men melodilinjene er hentet rett fra slåtter samlet på 1800-tallet. Springartakten ligger fortsatt under — du kjenner det i kroppen før du forstår det.',
        },
    },
    {
        id: 'kveding',
        navn: 'Kveding',
        epoke: 'Middelalderen → i dag',
        forklaring:
            'Norsk vokaltradisjon uten akkorder eller harmoni. Sangeren bærer alt: melodi, ornament, fortelling. Stev, ballader og viser ble overlevert ved at noen lyttet og lærte.',
        moderne: {
            artist: 'Aurora',
            verk: 'Vokalstil og melodiføring',
            hvordan:
                'Hun synger med en åpenhet og bruk av små ornamenter som peker rett tilbake til kvedertradisjonen. Selv om produksjonen er moderne, ligger det norske kvede-DNA-et i stemmen hennes.',
        },
    },
    {
        id: 'halling',
        navn: 'Halling',
        epoke: '1600-tallet → i dag',
        forklaring:
            'En rytmisk dans der mannen viser styrke og kontroll: hopp, kast, og til slutt et høyt spark på en hatt over hodet. Dansen krever et fast slått-tempo og en spilemann med driv.',
        moderne: {
            artist: 'Wardruna',
            verk: 'Rituell folkemusikk',
            hvordan:
                'De henter fram halling-rytmer og gamle instrumenter som langeleik og bukkehorn, og bygger seremonielle lydvegger rundt dem. Bevegelsen i hallingdans blir til energi i låten.',
        },
    },
];

type Phase = 'idle' | 'exploring' | 'complete';

export function TradisjonFornyelseVever({
    title = 'Tradisjon vever seg inn i fornyelse',
    undertittel = 'Klikk på en tradisjon for å se hvordan den lever i dag',
    tradisjoner = STANDARD_TRADISJONER,
}: TradisjonFornyelseVeverProps) {
    const [aktiv, setAktiv] = useState<string | null>(null);
    const [utforsket, setUtforsket] = useState<Set<string>>(new Set());
    const [phase, setPhase] = useState<Phase>('idle');

    const handleVelg = (id: string) => {
        if (aktiv === id) {
            setAktiv(null);
            return;
        }
        setAktiv(id);
        const ny = new Set(utforsket);
        ny.add(id);
        setUtforsket(ny);
        if (ny.size === tradisjoner.length) {
            setPhase('complete');
        } else if (phase === 'idle') {
            setPhase('exploring');
        }
    };

    const handleReset = () => {
        setAktiv(null);
        setUtforsket(new Set());
        setPhase('idle');
    };

    const valgt = tradisjoner.find((t) => t.id === aktiv);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-rose-50">
                <Music className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{undertittel}</p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    {utforsket.size} / {tradisjoner.length}
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {tradisjoner.map((t) => {
                    const erAktiv = aktiv === t.id;
                    const erUtforsket = utforsket.has(t.id);
                    return (
                        <motion.button
                            key={t.id}
                            onClick={() => handleVelg(t.id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative rounded-xl border p-4 text-left transition-colors ${
                                erAktiv
                                    ? 'bg-amber-50 border-amber-300 shadow-md'
                                    : erUtforsket
                                      ? 'bg-emerald-50 border-emerald-200'
                                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'
                            }`}
                        >
                            {erUtforsket && !erAktiv && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}
                            <div className="font-semibold text-slate-800">{t.navn}</div>
                            <div className="text-xs text-slate-500 mt-1">{t.epoke}</div>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {valgt && (
                    <motion.div
                        key={valgt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="mx-6 mb-6 grid md:grid-cols-2 gap-3"
                    >
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                                Tradisjon
                            </div>
                            <div className="mt-2 font-semibold text-slate-800">{valgt.navn}</div>
                            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                {valgt.forklaring}
                            </p>
                        </div>
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Fornyelse i dag
                            </div>
                            <div className="mt-2 font-semibold text-slate-800">
                                {valgt.moderne.artist}
                            </div>
                            <div className="text-xs text-slate-500 italic">
                                {valgt.moderne.verk}
                            </div>
                            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                {valgt.moderne.hvordan}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="mx-6 mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>
                            Du har vevd hele tråden! Tradisjon og fornyelse er to ender av samme
                            tau — folkemusikken lever videre fordi noen leker med den.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    {phase === 'idle' && 'Velg en tradisjon for å begynne'}
                    {phase === 'exploring' && `${tradisjoner.length - utforsket.size} igjen`}
                    {phase === 'complete' && 'Alle utforsket — godt gjort'}
                </div>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
