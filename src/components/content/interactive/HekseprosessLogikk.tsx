import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Scale, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';

interface Defense {
    id: string;
    label: string;
    elevenLogic: string;
    courtTwist: string;
}

const DEFENSES: Defense[] = [
    {
        id: 'alibi',
        label: 'Hun hadde alibi - hun var hjemme den natten heksesabbaten skulle skje.',
        elevenLogic: 'Hvis hun var hjemme, kan hun ikke ha vært i fjellet sammen med djevelen.',
        courtTwist:
            'Hekser kan fly. Kroppen lå hjemme, men sjelen reiste til sabbat. Alibiet beviser bare at hun behersker svartekunst.',
    },
    {
        id: 'tilstaar-ikke',
        label: 'Hun nekter for alt, selv under tortur.',
        elevenLogic: 'En uskyldig vil nekte. En skyldig ville tilstå for å slippe smerten.',
        courtTwist:
            'Djevelen gir sine egne overnaturlig styrke til å tåle tortur. Jo lenger hun holder ut, jo sterkere band til Satan.',
    },
    {
        id: 'godt-ord',
        label: 'Naboer vitner om at hun har vært snill og hjelpsom hele livet.',
        elevenLogic: 'Et godt rykte over mange år tyder på at hun ikke er ond.',
        courtTwist:
            'Sluheten er djevelens fremste gave. Hun har lurt naboene i årevis nettopp fordi hun er en mester i forstillelse.',
    },
    {
        id: 'bibel',
        label: 'Hun kan Fadervår og leser i Bibelen hver kveld.',
        elevenLogic: 'En heks skulle hate Guds ord og ikke klare å si bønnen.',
        courtTwist:
            'Hun har lært bønnen utenat for å skjule seg. Eller djevelen tillater henne å si den - akkurat så feilfritt at det vekker mistanke.',
    },
    {
        id: 'utpekt',
        label: 'En annen tiltalt utpekte henne under tortur. Den utpekingen er eneste bevis.',
        elevenLogic: 'Et vitnemål fremtvunget med smerte er ikke verdt noe.',
        courtTwist:
            'Når en heks tilstår, røper hun samtidig sine medsammensvorne. Utpekingen er nettopp slik Gud bringer sannheten frem i lyset.',
    },
];

type Phase = 'choose' | 'verdict';

interface HekseprosessLogikkProps {
    title?: string;
}

export const HekseprosessLogikk: React.FC<HekseprosessLogikkProps> = ({
    title = 'Forsvar henne - hvis du kan',
}) => {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [phase, setPhase] = useState<Phase>('choose');

    const handleReveal = (id: string) => {
        const next = new Set(revealed);
        next.add(id);
        setRevealed(next);
        if (next.size === DEFENSES.length) {
            window.setTimeout(() => setPhase('verdict'), 700);
        }
    };

    const handleReset = () => {
        setRevealed(new Set());
        setPhase('choose');
    };

    return (
        <div className="my-8 rounded-2xl border border-stone-200 bg-gradient-to-b from-amber-50/60 to-stone-50 p-5 shadow-sm md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-stone-800 p-2 text-amber-200">
                        <Gavel size={22} />
                    </span>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-800 md:text-xl">{title}</h3>
                        <p className="text-sm text-stone-600">
                            Du er forsvarer i Vardø, 1621. Klikk på et forsvar for å legge det frem
                            for retten - og se hva som skjer.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-200"
                    aria-label="Tilbakestill rettssaken"
                >
                    <RotateCcw size={14} /> Tilbakestill
                </button>
            </div>

            <div className="space-y-3">
                {DEFENSES.map((d) => {
                    const isRevealed = revealed.has(d.id);
                    return (
                        <motion.div
                            key={d.id}
                            layout
                            className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                        >
                            <button
                                type="button"
                                onClick={() => !isRevealed && handleReveal(d.id)}
                                disabled={isRevealed}
                                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                                    isRevealed
                                        ? 'cursor-default bg-rose-50/60'
                                        : 'hover:bg-amber-50'
                                }`}
                            >
                                <span
                                    className={`mt-0.5 shrink-0 ${
                                        isRevealed ? 'text-rose-500' : 'text-stone-400'
                                    }`}
                                >
                                    {isRevealed ? (
                                        <AlertTriangle size={18} />
                                    ) : (
                                        <Scale size={18} />
                                    )}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-stone-800">{d.label}</p>
                                    {!isRevealed && (
                                        <p className="mt-1 text-xs text-stone-500">
                                            Din tanke: {d.elevenLogic}
                                        </p>
                                    )}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isRevealed && (
                                    <motion.div
                                        key="twist"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="border-t border-rose-100 bg-rose-50/40 px-4 py-3"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                                            Rettens tolkning
                                        </p>
                                        <p className="mt-1 text-sm text-stone-700">{d.courtTwist}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-5 min-h-[6rem]">
                <AnimatePresence mode="wait">
                    {phase === 'verdict' ? (
                        <motion.div
                            key="verdict"
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                            className="rounded-xl border-2 border-stone-800 bg-stone-900 p-5 text-amber-50"
                        >
                            <div className="mb-2 flex items-center gap-2 text-amber-200">
                                <Sparkles size={18} />
                                <span className="text-xs font-semibold uppercase tracking-widest">
                                    Dommen er falt
                                </span>
                            </div>
                            <p className="text-3xl font-bold tracking-wide md:text-4xl">SKYLDIG</p>
                            <p className="mt-3 text-sm leading-relaxed text-amber-50/90">
                                Du klarte ikke å forsvare henne. Det er ikke fordi du argumenterte
                                dårlig - det er fordi systemet var bygget slik at hvert forsvar ble
                                snudd til bevis for skyld. Dette kalles{' '}
                                <span className="font-semibold text-amber-200">
                                    sirkulær argumentasjon
                                </span>
                                : konklusjonen er bestemt på forhånd, og alle &quot;bevis&quot;
                                bekrefter den.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-stone-500"
                        >
                            Avslørt {revealed.size} av {DEFENSES.length} forsvar. Hva svarer
                            retten?
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HekseprosessLogikk;
