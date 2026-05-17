import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coins, Users, Church, RotateCcw, Sparkles } from 'lucide-react';

interface VasaMaktSpakerProps {
    title?: string;
}

type LeverKey = 'konfiskering' | 'sentralisering' | 'reformTempo';

interface Lever {
    key: LeverKey;
    label: string;
    description: string;
    icon: typeof Coins;
    color: string;
    lowText: string;
    highText: string;
}

const LEVERS: Lever[] = [
    {
        key: 'konfiskering',
        label: 'Konfisker kirkens gods',
        description: 'Hvor mye av kirkens jord og gull tar du fra biskopene?',
        icon: Church,
        color: 'amber',
        lowText: 'Kirken beholder rikdommen',
        highText: 'Alle klostre tømmes',
    },
    {
        key: 'sentralisering',
        label: 'Bygg sentralt byråkrati',
        description: 'Hvor mye makt flytter du fra lokale adelsmenn til kronen?',
        icon: Crown,
        color: 'indigo',
        lowText: 'Adelen styrer lokalt',
        highText: 'Alt går gjennom kongen',
    },
    {
        key: 'reformTempo',
        label: 'Tempo på reformasjonen',
        description: 'Skal du innføre den nye troen forsiktig eller raskt?',
        icon: Users,
        color: 'rose',
        lowText: 'Forsiktig, over en generasjon',
        highText: 'Brått, alle messer forbudt nå',
    },
];

const VASA_HISTORIC = { konfiskering: 70, sentralisering: 75, reformTempo: 45 };
const TARGET_RADIUS = 18;

interface Outcomes {
    statskasse: number;
    lojalitet: number;
    sentralMakt: number;
}

function calcOutcomes(values: Record<LeverKey, number>): Outcomes {
    const { konfiskering, sentralisering, reformTempo } = values;

    const statskasse = Math.round(konfiskering * 0.9 + sentralisering * 0.1);

    const bondeOpprorRisk = Math.max(0, reformTempo - 40) * 0.7 + Math.max(0, konfiskering - 80) * 0.5;
    const adelOpprorRisk = Math.max(0, sentralisering - 55) * 0.8;
    const lojalitet = Math.max(0, Math.round(100 - bondeOpprorRisk - adelOpprorRisk));

    const sentralMakt = Math.round(sentralisering * 0.55 + konfiskering * 0.35 + (50 - Math.abs(reformTempo - 50)) * 0.2);

    return {
        statskasse: Math.min(100, statskasse),
        lojalitet: Math.min(100, lojalitet),
        sentralMakt: Math.min(100, sentralMakt),
    };
}

function vasaTarget(): Outcomes {
    return calcOutcomes(VASA_HISTORIC);
}

function distanceFromTarget(values: Record<LeverKey, number>): number {
    const dx = values.konfiskering - VASA_HISTORIC.konfiskering;
    const dy = values.sentralisering - VASA_HISTORIC.sentralisering;
    const dz = values.reformTempo - VASA_HISTORIC.reformTempo;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function VasaMaktSpaker({ title = 'Vasas tre maktspaker' }: VasaMaktSpakerProps) {
    const [values, setValues] = useState<Record<LeverKey, number>>({
        konfiskering: 30,
        sentralisering: 30,
        reformTempo: 50,
    });
    const [revealVasa, setRevealVasa] = useState(false);

    const outcomes = useMemo(() => calcOutcomes(values), [values]);
    const target = useMemo(() => vasaTarget(), []);
    const distance = useMemo(() => distanceFromTarget(values), [values]);
    const matchesVasa = distance < TARGET_RADIUS;

    const handleReset = () => {
        setValues({ konfiskering: 30, sentralisering: 30, reformTempo: 50 });
        setRevealVasa(false);
    };

    const handleReveal = () => {
        setValues({ ...VASA_HISTORIC });
        setRevealVasa(true);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Crown className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra på spakene og se hvordan Sverige forandrer seg under din ledelse.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-5">
                    {LEVERS.map((lever) => {
                        const Icon = lever.icon;
                        const value = values[lever.key];
                        return (
                            <div key={lever.key} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 text-${lever.color}-600`} />
                                    <span className="font-medium text-slate-800 text-sm">{lever.label}</span>
                                    <span className="ml-auto text-xs font-mono text-slate-500">{value}%</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">{lever.description}</p>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={value}
                                    onChange={(e) =>
                                        setValues((v) => ({
                                            ...v,
                                            [lever.key]: Number(e.target.value),
                                        }))
                                    }
                                    className="w-full accent-indigo-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>{lever.lowText}</span>
                                    <span>{lever.highText}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-3">
                    <Meter
                        label="Statskasse"
                        value={outcomes.statskasse}
                        targetValue={target.statskasse}
                        icon={<Coins className="w-4 h-4" />}
                        color="amber"
                        hint="Hvor mye gull og land kronen rår over."
                    />
                    <Meter
                        label="Lojalitet i folket"
                        value={outcomes.lojalitet}
                        targetValue={target.lojalitet}
                        icon={<Users className="w-4 h-4" />}
                        color="emerald"
                        hint="Hvor lite bønder og adel gjør opprør."
                    />
                    <Meter
                        label="Sentral makt"
                        value={outcomes.sentralMakt}
                        targetValue={target.sentralMakt}
                        icon={<Crown className="w-4 h-4" />}
                        color="indigo"
                        hint="Hvor mye kronen styrer hverdagen i hele Sverige."
                    />

                    <AnimatePresence mode="wait">
                        {matchesVasa ? (
                            <motion.div
                                key="match"
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2"
                            >
                                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>
                                    <strong>Du bygget Sverige.</strong> Spakene dine ligger nær Gustav
                                    Vasas faktiske valg. Statskassen vokste, folket holdt ut, og
                                    kongen ble sterkere enn noen før ham.
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs"
                            >
                                Prøv å oppnå <strong>høy</strong> statskasse, <strong>moderat</strong> lojalitet
                                og <strong>høy</strong> sentral makt på samme tid. Det er ikke lett —
                                drar du én spak for langt, vakler hele balansen.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="px-6 pb-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                    onClick={handleReveal}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                        revealVasa
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    {revealVasa ? 'Vasas faktiske valg vist' : 'Slik gjorde Vasa det'}
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}

interface MeterProps {
    label: string;
    value: number;
    targetValue: number;
    icon: React.ReactNode;
    color: 'amber' | 'emerald' | 'indigo';
    hint: string;
}

function Meter({ label, value, targetValue, icon, color, hint }: MeterProps) {
    const palette = {
        amber: { bar: 'bg-amber-500', track: 'bg-amber-100', text: 'text-amber-700', target: 'bg-amber-700' },
        emerald: { bar: 'bg-emerald-500', track: 'bg-emerald-100', text: 'text-emerald-700', target: 'bg-emerald-800' },
        indigo: { bar: 'bg-indigo-500', track: 'bg-indigo-100', text: 'text-indigo-700', target: 'bg-indigo-800' },
    }[color];

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
                <span className={palette.text}>{icon}</span>
                <span className="font-medium text-slate-800 text-sm">{label}</span>
                <span className={`ml-auto text-xs font-mono ${palette.text}`}>{value}</span>
            </div>
            <div className={`relative h-3 rounded-full ${palette.track} overflow-hidden`}>
                <motion.div
                    className={`h-full ${palette.bar}`}
                    initial={false}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                />
                <div
                    className={`absolute top-0 bottom-0 w-0.5 ${palette.target}`}
                    style={{ left: `${targetValue}%` }}
                    title={`Vasas mål: ${targetValue}`}
                />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>
        </div>
    );
}
