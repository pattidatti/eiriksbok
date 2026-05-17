import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, RefreshCcw, User, Briefcase, Sparkles } from 'lucide-react';

interface MerverdiSliderProps {
    title?: string;
}

interface Zone {
    min: number;
    max: number;
    label: string;
    marxTerm: string;
    description: string;
    example: string;
    accent: 'rose' | 'amber' | 'emerald' | 'indigo';
}

const ZONES: Zone[] = [
    {
        min: 0,
        max: 25,
        label: 'Utbytting',
        marxTerm: 'Klassisk kapitalisme',
        description:
            'Eieren beholder nesten alt verdien arbeideren skaper. Marx mente dette var grunnoppskriften for industrialiseringens lidelse — og at det måtte ende i opprør.',
        example: 'Manchester 1840: 14-timers dager, sultelønn, kjettingstigene i fabrikkene.',
        accent: 'rose',
    },
    {
        min: 25,
        max: 50,
        label: 'Tøff klassekamp',
        marxTerm: 'Tidlig fagforeningstid',
        description:
            'Arbeiderne får litt mer gjennom streiker og kamp, men eierne tar fortsatt det meste. Marx kalte dette et midlertidig kompromiss som ikke løser selve maktproblemet.',
        example: 'Norge på 1920-tallet: lange streiker, lav lønn, jevnlig nød.',
        accent: 'amber',
    },
    {
        min: 50,
        max: 75,
        label: 'Velferdsstat-kompromiss',
        marxTerm: 'Reformert kapitalisme',
        description:
            'Arbeiderne får brorparten via lønn, skatt og offentlige tjenester. Marx ville sagt at eierne fortsatt sitter på maktmidlene — men resten av samfunnet har lært å dele kaka.',
        example: 'Norge i dag: tariffavtaler, AFP, gratis skole og helsevesen.',
        accent: 'emerald',
    },
    {
        min: 75,
        max: 100,
        label: 'Arbeiderkontroll',
        marxTerm: 'Marx sin drøm',
        description:
            'Arbeiderne får hele eller nesten hele verdien de skaper, fordi de selv eier produksjonsmidlene. I praksis har dette vist seg utrolig vanskelig — men det var Marx sitt mål.',
        example: 'Samvirkelag, kibbutzer og kooperativer som Mondragón i Spania.',
        accent: 'indigo',
    },
];

const getZone = (value: number): Zone => {
    return ZONES.find((z) => value >= z.min && value < z.max) ?? ZONES[ZONES.length - 1];
};

const accentStyles: Record<Zone['accent'], { bg: string; border: string; text: string; bar: string }> = {
    rose: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
    },
    amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
    },
    emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
    },
    indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        bar: 'bg-indigo-500',
    },
};

const TOTAL_VALUE = 1000;

export function MerverdiSlider({ title = 'Merverdimaskinen' }: MerverdiSliderProps) {
    const [wageShare, setWageShare] = useState(20);
    const [hasMoved, setHasMoved] = useState(false);

    const zone = getZone(wageShare);
    const wageKr = Math.round((wageShare / 100) * TOTAL_VALUE);
    const profitKr = TOTAL_VALUE - wageKr;
    const styles = accentStyles[zone.accent];

    const handleChange = (v: number) => {
        setWageShare(v);
        if (!hasMoved) setHasMoved(true);
    };

    const handleReset = () => {
        setWageShare(20);
        setHasMoved(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Factory className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Flytt glideren: hvor mye av verdien arbeideren skaper, skal hun selv beholde?
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
                        <span>Verdien arbeideren skaper på en dag</span>
                        <span className="text-slate-700">{TOTAL_VALUE} kr</span>
                    </div>
                    <div className="h-10 w-full rounded-lg overflow-hidden flex border border-slate-200 bg-white">
                        <motion.div
                            className={`${styles.bar} flex items-center justify-start px-3 text-white text-sm font-bold`}
                            animate={{ width: `${wageShare}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            {wageShare >= 10 && (
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                    <User className="w-3.5 h-3.5" />
                                    {wageKr} kr
                                </span>
                            )}
                        </motion.div>
                        <motion.div
                            className="bg-slate-700 flex items-center justify-end px-3 text-white text-sm font-bold"
                            animate={{ width: `${100 - wageShare}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            {wageShare <= 90 && (
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {profitKr} kr
                                </span>
                            )}
                        </motion.div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 mt-2">
                        <span>Lønn til arbeideren</span>
                        <span>Profitt (merverdi) til eieren</span>
                    </div>
                </div>

                <div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={wageShare}
                        onChange={(e) => handleChange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        aria-label="Andel av verdien som går til arbeideren"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-medium">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={zone.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs uppercase tracking-wider font-bold ${styles.text}`}>
                                {zone.marxTerm}
                            </span>
                        </div>
                        <h4 className={`text-lg font-bold ${styles.text} mb-2`}>{zone.label}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed mb-2">
                            {zone.description}
                        </p>
                        <p className={`text-xs italic ${styles.text}`}>
                            <span className="font-bold not-italic">Eksempel: </span>
                            {zone.example}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {hasMoved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p>
                                Forskjellen mellom det arbeideren produserer ({TOTAL_VALUE} kr) og det hun
                                får i lønn ({wageKr} kr) er det Marx kalte <strong>merverdi</strong>.
                                I dette eksempelet er den {profitKr} kr — eierens fortjeneste.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Tilbakestill
                    </button>
                </div>
            </div>
        </div>
    );
}
