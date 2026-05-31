import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, UserCheck, GraduationCap, Crown, ArrowRight, RotateCcw } from 'lucide-react';

interface DevsirmeJourneyProps {
    title?: string;
}

interface Step {
    icon: typeof Home;
    place: string;
    text: string;
    burden: string; // slaveri-siden
    chance: string; // karriere-siden
    chanceWeight: number; // 0-100, hvor mye mulighet veier her
}

const STEPS: Step[] = [
    {
        icon: Home,
        place: 'Landsbyen på Balkan',
        text: 'Du er sønn av en kristen bonde. Hvert femte år kommer sultanens menn til landsbyen for å hente gutter til devşirme - barnetributten.',
        burden: 'Familien har ikke noe valg. Å nekte er farlig.',
        chance: 'For en fattig familie kan dette være eneste vei ut av fattigdommen.',
        chanceWeight: 25,
    },
    {
        icon: UserCheck,
        place: 'Utvelgelsen',
        text: 'De friskeste og smarteste guttene blir plukket ut. Du blir skrevet inn i en bok og ført bort fra alt du kjenner.',
        burden: 'Du tas fra familien med makt og blir sultanens eiendom - en slave.',
        chance: 'Bare de mest lovende blir valgt. Det er en utmerkelse å bli sett.',
        chanceWeight: 40,
    },
    {
        icon: GraduationCap,
        place: 'Opplæringen',
        text: 'Du blir muslim, lærer tyrkisk og trenes hardt i år etter år - i krig, men kanskje også i jus, språk og kunst.',
        burden: 'Du mister språket, troen og navnet du ble født med.',
        chance: 'Du får en utdanning ingen bonde i Europa kunne drømme om.',
        chanceWeight: 60,
    },
    {
        icon: Crown,
        place: 'Karrieren',
        text: 'De fleste blir janitsjarer - rikets fryktede elitesoldater. De aller flinkeste utdannes i palasset og kan stige helt til topps.',
        burden: 'Du forblir formelt en slave hele livet.',
        chance: 'En bondegutt kunne ende som storvesir - rikets nest mektigste mann etter sultanen.',
        chanceWeight: 80,
    },
];

export function DevsirmeJourney({
    title = 'Devşirme: slaveri eller karrierestige?',
}: DevsirmeJourneyProps) {
    const [step, setStep] = useState(0);
    const s = STEPS[step];
    const Icon = s.icon;
    const atEnd = step === STEPS.length - 1;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>

            {/* Stegprikker */}
            <div className="mb-5 flex items-center gap-2">
                {STEPS.map((st, i) => {
                    const StIcon = st.icon;
                    return (
                        <div key={i} className="flex flex-1 items-center">
                            <button
                                onClick={() => setStep(i)}
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                                    i <= step ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                <StIcon className="h-4 w-4" />
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`h-1 flex-1 rounded ${i < step ? 'bg-amber-600' : 'bg-slate-100'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                >
                    <div className="mb-3 flex items-center gap-2 text-amber-700">
                        <Icon className="h-5 w-5" />
                        <span className="text-base font-bold">{s.place}</span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-slate-700">{s.text}</p>

                    {/* Vekten */}
                    <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                            className="h-full bg-rose-400"
                            initial={false}
                            animate={{ width: `${100 - s.chanceWeight}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        />
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={false}
                            animate={{ width: `${s.chanceWeight}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg bg-rose-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Tvang</p>
                            <p className="mt-1 text-sm text-slate-700">{s.burden}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Mulighet</p>
                            <p className="mt-1 text-sm text-slate-700">{s.chance}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
                >
                    <RotateCcw className="h-4 w-4" /> Start på nytt
                </button>
                {!atEnd ? (
                    <button
                        onClick={() => setStep((p) => Math.min(p + 1, STEPS.length - 1))}
                        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
                    >
                        Videre <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Begge svar er sanne på én gang.
                    </motion.span>
                )}
            </div>
        </div>
    );
}
