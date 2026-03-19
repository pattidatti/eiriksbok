import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    TrendingUp,
    TrendingDown,
    Users,
    RefreshCcw,
    ArrowRight,
    Factory,
    Heart,
    Scissors,
    Monitor,
} from 'lucide-react';

interface WageNegotiationSimProps {
    title?: string;
}

type Role = 'lo' | 'nho';
type Phase = 'intro' | 'negotiation' | 'result' | 'summary';

interface Sector {
    id: string;
    name: string;
    icon: React.ReactNode;
    baseWage: number;
    workers: string;
    exportExposed: boolean;
    productivityGrowth: number;
}

interface EconomyState {
    inflation: number;
    unemployment: number;
    competitiveness: number;
    inequality: number;
}

interface RoundResult {
    sector: Sector;
    settlement: number;
    consequence: string;
}

const SECTORS: Sector[] = [
    {
        id: 'industri',
        name: 'Industri (frontfaget)',
        icon: <Factory className="w-4 h-4" />,
        baseWage: 520,
        workers: '250 000',
        exportExposed: true,
        productivityGrowth: 3.2,
    },
    {
        id: 'helse',
        name: 'Helse og omsorg',
        icon: <Heart className="w-4 h-4" />,
        baseWage: 480,
        workers: '400 000',
        exportExposed: false,
        productivityGrowth: 1.5,
    },
    {
        id: 'privat-tjeneste',
        name: 'Private tjenester',
        icon: <Scissors className="w-4 h-4" />,
        baseWage: 380,
        workers: '300 000',
        exportExposed: false,
        productivityGrowth: 2.0,
    },
    {
        id: 'tech',
        name: 'Teknologi',
        icon: <Monitor className="w-4 h-4" />,
        baseWage: 650,
        workers: '120 000',
        exportExposed: true,
        productivityGrowth: 5.0,
    },
];

interface WageOption {
    label: string;
    percent: number;
    description: string;
}

const getOptions = (role: Role, sector: Sector, _round: number): WageOption[] => {
    const base = sector.productivityGrowth;
    if (role === 'lo') {
        return [
            {
                label: 'Forsiktig krav',
                percent: Math.round((base - 0.5) * 10) / 10,
                description: 'Holder seg under produktivitetsveksten. Trygt, men lite populært blant medlemmene.',
            },
            {
                label: 'Moderat krav',
                percent: Math.round((base + 0.8) * 10) / 10,
                description: 'Litt over produktivitetsveksten. Balansert, men kan presse marginene.',
            },
            {
                label: 'Offensivt krav',
                percent: Math.round((base + 2.5) * 10) / 10,
                description: 'Godt over produktivitetsveksten. Populært blant medlemmene, men risikabelt for økonomien.',
            },
        ];
    } else {
        return [
            {
                label: 'Stramt tilbud',
                percent: Math.round((base - 1.5) * 10) / 10,
                description: 'Langt under produktivitetsveksten. Holder kostnadene nede, men kan utløse streik.',
            },
            {
                label: 'Markedstilpasset tilbud',
                percent: Math.round((base - 0.3) * 10) / 10,
                description: 'Nær produktivitetsveksten. Balansert tilbud som de fleste kan leve med.',
            },
            {
                label: 'Sjenerøst tilbud',
                percent: Math.round((base + 1.0) * 10) / 10,
                description: 'Over produktivitetsveksten. Bra for rekruttering, men presser lønnsomheten.',
            },
        ];
    }
};

const getConsequence = (
    settlement: number,
    sector: Sector,
    _economy: EconomyState
): { text: string; inflationDelta: number; unemploymentDelta: number; competitivenessDelta: number; inequalityDelta: number } => {
    const diff = settlement - sector.productivityGrowth;

    if (diff > 2) {
        return {
            text: sector.exportExposed
                ? `Lønnsveksten i ${sector.name.toLowerCase()} er mye høyere enn produktiviteten. Bedriftene taper konkurransekraft mot utlandet, og noen vurderer å flytte produksjon.`
                : `Høy lønnsvekst i ${sector.name.toLowerCase()} presser opp prisene. Kommunene sliter med å finansiere tjenestene.`,
            inflationDelta: 0.8,
            unemploymentDelta: sector.exportExposed ? 0.6 : 0.2,
            competitivenessDelta: sector.exportExposed ? -8 : -3,
            inequalityDelta: -2,
        };
    } else if (diff > 0.5) {
        return {
            text: `Lønnsveksten i ${sector.name.toLowerCase()} er noe over produktiviteten. Det gir et moderat press på prisene, men er håndterbart på kort sikt.`,
            inflationDelta: 0.3,
            unemploymentDelta: 0.1,
            competitivenessDelta: sector.exportExposed ? -4 : -1,
            inequalityDelta: -1,
        };
    } else if (diff > -0.5) {
        return {
            text: `Lønnsveksten i ${sector.name.toLowerCase()} følger produktiviteten tett. En bærekraftig utvikling som holder prisene stabile.`,
            inflationDelta: 0.1,
            unemploymentDelta: 0,
            competitivenessDelta: sector.exportExposed ? 1 : 0,
            inequalityDelta: 0,
        };
    } else {
        return {
            text: `Lønnsveksten i ${sector.name.toLowerCase()} er lavere enn produktiviteten. Bedriftene tjener mer, men arbeiderne føler seg urettferdig behandlet.`,
            inflationDelta: -0.1,
            unemploymentDelta: -0.2,
            competitivenessDelta: sector.exportExposed ? 3 : 1,
            inequalityDelta: 3,
        };
    }
};

const INITIAL_ECONOMY: EconomyState = {
    inflation: 2.0,
    unemployment: 3.5,
    competitiveness: 75,
    inequality: 25,
};

const StatBox: React.FC<{
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    good?: boolean;
}> = ({ label, value, trend, good }) => {
    const trendColor = good ? 'text-emerald-500' : 'text-rose-500';
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                {label}
            </div>
            <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1">
                {value}
                {trend === 'up' && <TrendingUp className={`w-3 h-3 ${trendColor}`} />}
                {trend === 'down' && <TrendingDown className={`w-3 h-3 ${trendColor}`} />}
            </div>
        </div>
    );
};

export const WageNegotiationSim: React.FC<WageNegotiationSimProps> = ({
    title = 'Lønnsforhandlingene',
}) => {
    const [role, setRole] = useState<Role | null>(null);
    const [phase, setPhase] = useState<Phase>('intro');
    const [round, setRound] = useState(0);
    const [economy, setEconomy] = useState<EconomyState>(INITIAL_ECONOMY);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [selectedOption, setSelectedOption] = useState<WageOption | null>(null);
    const [frontfagNorm, setFrontfagNorm] = useState<number>(0);

    const currentSector = SECTORS[round];

    const handleRoleSelect = (r: Role) => {
        setRole(r);
        setPhase('negotiation');
    };

    const handleWageSelect = (option: WageOption) => {
        setSelectedOption(option);

        // If this is the frontfag round, set the norm
        let settlement = option.percent;

        // For non-frontfag sectors, the norm constrains the settlement
        if (round > 0 && !currentSector.exportExposed) {
            // Settlement is pulled toward the frontfag norm
            const pull = (frontfagNorm - settlement) * 0.3;
            settlement = Math.round((settlement + pull) * 10) / 10;
        }

        if (round === 0) {
            setFrontfagNorm(settlement);
        }

        const consequence = getConsequence(settlement, currentSector, economy);

        const newEconomy = {
            inflation: Math.round((economy.inflation + consequence.inflationDelta) * 10) / 10,
            unemployment: Math.max(
                1,
                Math.round((economy.unemployment + consequence.unemploymentDelta) * 10) / 10
            ),
            competitiveness: Math.max(
                0,
                Math.min(100, economy.competitiveness + consequence.competitivenessDelta)
            ),
            inequality: Math.max(
                0,
                Math.min(100, economy.inequality + consequence.inequalityDelta)
            ),
        };

        setEconomy(newEconomy);
        setResults([
            ...results,
            { sector: currentSector, settlement, consequence: consequence.text },
        ]);
        setPhase('result');
    };

    const nextRound = () => {
        if (round >= SECTORS.length - 1) {
            setPhase('summary');
        } else {
            setRound(round + 1);
            setSelectedOption(null);
            setPhase('negotiation');
        }
    };

    const reset = () => {
        setRole(null);
        setPhase('intro');
        setRound(0);
        setEconomy(INITIAL_ECONOMY);
        setResults([]);
        setSelectedOption(null);
        setFrontfagNorm(0);
    };

    const getSummaryVerdict = (): { title: string; text: string } => {
        const { inflation, unemployment, competitiveness, inequality } = economy;

        if (inflation > 5 || competitiveness < 40) {
            return {
                title: 'Økonomien er i trøbbel',
                text: 'Lønnsveksten har vært for høy i forhold til produktiviteten. Inflasjonen har økt, og norske bedrifter sliter med å konkurrere mot utlandet. Dette er akkurat det frontfagmodellen er designet for å forhindre. Når lønningene vokser raskere enn verdiskapningen, taper alle til slutt.',
            };
        } else if (inequality > 40 || unemployment > 6) {
            return {
                title: 'Ulikheten vokser',
                text: 'Lønnsveksten har vært for lav for mange arbeidstakere. Bedriftene tjener godt, men arbeiderne henger etter. Kritikere av frontfagmodellen peker på nettopp dette: Modellen kan holde lønningene nede i sektorer der det egentlig er rom for mer.',
            };
        } else {
            return {
                title: 'En balansert økonomi',
                text: 'Du klarte å holde lønnsveksten i takt med produktiviteten. Inflasjonen er lav, bedriftene er konkurransedyktige, og arbeiderne får sin rettferdige del. Dette er idealet frontfagmodellen sikter mot. Men er det alltid rettferdig at industrien bestemmer for alle?',
            };
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto font-sans">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                        Lønnsforhandlings-simulator
                    </p>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                I Norge forhandler eksportindustrien (frontfaget) lønn
                                først. Resultatet setter normen for alle andre. Spill som
                                fagforeningsleder eller arbeidsgiver og se hva som skjer
                                med økonomien.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => handleRoleSelect('lo')}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Spill som LO-leder
                                </button>
                                <button
                                    onClick={() => handleRoleSelect('nho')}
                                    className="px-6 py-3 bg-slate-700 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Spill som NHO-leder
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* NEGOTIATION */}
                    {phase === 'negotiation' && role && currentSector && (
                        <motion.div
                            key={`negotiation-${round}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Economy dashboard */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                                <StatBox
                                    label="Inflasjon"
                                    value={`${economy.inflation}%`}
                                    trend={economy.inflation > 2.5 ? 'up' : economy.inflation < 1.5 ? 'down' : 'stable'}
                                    good={economy.inflation <= 2.5 && economy.inflation >= 1.5}
                                />
                                <StatBox
                                    label="Ledighet"
                                    value={`${economy.unemployment}%`}
                                    trend={economy.unemployment > 4 ? 'up' : 'stable'}
                                    good={economy.unemployment <= 4}
                                />
                                <StatBox
                                    label="Konkurransekraft"
                                    value={`${economy.competitiveness}`}
                                    trend={economy.competitiveness < 70 ? 'down' : 'stable'}
                                    good={economy.competitiveness >= 70}
                                />
                                <StatBox
                                    label="Ulikhet"
                                    value={`${economy.inequality}`}
                                    trend={economy.inequality > 30 ? 'up' : 'stable'}
                                    good={economy.inequality <= 30}
                                />
                            </div>

                            {/* Round info */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        Runde {round + 1} av {SECTORS.length}
                                    </span>
                                    {round === 0 && (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                            Frontfaget
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    {currentSector.icon}
                                    <h4 className="font-bold text-slate-800">
                                        {currentSector.name}
                                    </h4>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {currentSector.workers} ansatte - Snittlønn{' '}
                                    {currentSector.baseWage} 000 kr -
                                    Produktivitetsvekst {currentSector.productivityGrowth}
                                    %
                                </p>
                                {round > 0 && (
                                    <p className="text-sm text-indigo-600 mt-2 font-medium">
                                        Frontfagnormen er satt til {frontfagNorm}%
                                        lønnsvekst
                                    </p>
                                )}
                            </div>

                            {/* Options */}
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                {role === 'lo'
                                    ? 'Velg ditt lønnskrav'
                                    : 'Velg ditt lønnstilbud'}
                            </h5>
                            <div className="space-y-2">
                                {getOptions(role, currentSector, round).map(
                                    (option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => handleWageSelect(option)}
                                            className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-800 group-hover:text-indigo-700">
                                                    {option.label}
                                                </span>
                                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                    +{option.percent}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {option.description}
                                            </p>
                                        </button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* RESULT */}
                    {phase === 'result' && selectedOption && (
                        <motion.div
                            key={`result-${round}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Economy dashboard */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                                <StatBox
                                    label="Inflasjon"
                                    value={`${economy.inflation}%`}
                                    trend={economy.inflation > 2.5 ? 'up' : economy.inflation < 1.5 ? 'down' : 'stable'}
                                    good={economy.inflation <= 2.5 && economy.inflation >= 1.5}
                                />
                                <StatBox
                                    label="Ledighet"
                                    value={`${economy.unemployment}%`}
                                    trend={economy.unemployment > 4 ? 'up' : 'stable'}
                                    good={economy.unemployment <= 4}
                                />
                                <StatBox
                                    label="Konkurransekraft"
                                    value={`${economy.competitiveness}`}
                                    trend={economy.competitiveness < 70 ? 'down' : 'stable'}
                                    good={economy.competitiveness >= 70}
                                />
                                <StatBox
                                    label="Ulikhet"
                                    value={`${economy.inequality}`}
                                    trend={economy.inequality > 30 ? 'up' : 'stable'}
                                    good={economy.inequality <= 30}
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 p-5 mb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    {currentSector.icon}
                                    <h4 className="font-bold text-slate-800">
                                        {currentSector.name}: +
                                        {results[results.length - 1]?.settlement}%
                                        lønnsvekst
                                    </h4>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {results[results.length - 1]?.consequence}
                                </p>
                            </div>

                            <button
                                onClick={nextRound}
                                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {round >= SECTORS.length - 1
                                    ? 'Se oppsummering'
                                    : 'Neste sektor'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* SUMMARY */}
                    {phase === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            {/* Final economy dashboard */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                                <StatBox
                                    label="Inflasjon"
                                    value={`${economy.inflation}%`}
                                    trend={economy.inflation > 3 ? 'up' : 'stable'}
                                    good={economy.inflation <= 3}
                                />
                                <StatBox
                                    label="Ledighet"
                                    value={`${economy.unemployment}%`}
                                    trend={economy.unemployment > 4 ? 'up' : 'stable'}
                                    good={economy.unemployment <= 4}
                                />
                                <StatBox
                                    label="Konkurransekraft"
                                    value={`${economy.competitiveness}`}
                                    trend={economy.competitiveness < 70 ? 'down' : 'stable'}
                                    good={economy.competitiveness >= 70}
                                />
                                <StatBox
                                    label="Ulikhet"
                                    value={`${economy.inequality}`}
                                    trend={economy.inequality > 30 ? 'up' : 'stable'}
                                    good={economy.inequality <= 30}
                                />
                            </div>

                            {(() => {
                                const verdict = getSummaryVerdict();
                                return (
                                    <>
                                        <h4 className="text-xl font-bold text-slate-800 mb-3">
                                            {verdict.title}
                                        </h4>
                                        <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                                            {verdict.text}
                                        </p>
                                    </>
                                );
                            })()}

                            {/* Round history */}
                            <div className="text-left bg-white rounded-lg border border-slate-200 p-4 mb-6">
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Forhandlingshistorikk
                                </h5>
                                <div className="space-y-3">
                                    {results.map((r, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                {r.sector.icon}
                                                <span className="text-slate-700 font-medium">
                                                    {r.sector.name}
                                                </span>
                                            </div>
                                            <span
                                                className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                                    r.settlement >
                                                    r.sector.productivityGrowth + 1
                                                        ? 'bg-rose-50 text-rose-600'
                                                        : r.settlement <
                                                            r.sector
                                                                .productivityGrowth -
                                                                0.5
                                                          ? 'bg-amber-50 text-amber-600'
                                                          : 'bg-emerald-50 text-emerald-600'
                                                }`}
                                            >
                                                +{r.settlement}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 italic mb-4">
                                Dette er en forenklet modell. I virkeligheten påvirkes
                                lønnsforhandlinger av mange flere faktorer.
                            </p>

                            <button
                                onClick={reset}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Prøv igjen
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
