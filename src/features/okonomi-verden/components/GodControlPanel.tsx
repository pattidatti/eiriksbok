import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, RotateCcw, Sparkles, Wind, Landmark, Building2, Scale } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';

interface Tooltip {
    label: string;
    body: string;
}

const TOOLTIPS: Record<string, Tooltip> = {
    freeMarket: {
        label: 'Frimarked-modus',
        body: 'Slå av sentralbanken. Styringsrenten følger den naturlige renten automatisk, og pengetrykket stopper. Rothbards og Hayeks drøm.',
    },
    policyRate: {
        label: 'Styringsrente',
        body: 'Sentralbankens rente. Når den ligger under den naturlige renten, oppstår feilinvesteringer (Hayek/Mises).',
    },
    moneyGrowth: {
        label: 'Pengetrykk per år',
        body: 'Hvor raskt pengemengden vokser. Høyt pengetrykk gir inflasjon, først i de stadiene som ligger nærmest kreditten (Cantillon-effekt).',
    },
    taxRate: {
        label: 'Skattenivå',
        body: 'Hvor stor del av lønnen som går til staten. Påvirker hva folk har igjen til å spare og bruke.',
    },
    publicSpend: {
        label: 'Offentlig forbruk',
        body: 'Hvor stor andel av økonomien som styres politisk i stedet for av markedet.',
    },
    priceCeiling: {
        label: 'Pristak',
        body: 'Lovbestemt makspris på forbruksvarer. Skaper varemangel, prisene kan ikke lenger signalisere knapphet.',
    },
    wageFloor: {
        label: 'Lønnsgulv',
        body: 'Minimumslønn. Skaper arbeidsledighet hos de minst produktive arbeiderne.',
    },
    regulation: {
        label: 'Reguleringsbyrde',
        body: 'Generelt regelverk for næringslivet. Bremser entreprenørskap og kapitaldannelse.',
    },
};

export function GodControlPanel() {
    const controls = useWorldStore((s) => s.controls);
    const setPolicyRate = useWorldStore((s) => s.setPolicyRate);
    const setMoneyGrowth = useWorldStore((s) => s.setMoneyGrowth);
    const setTaxRate = useWorldStore((s) => s.setTaxRate);
    const setPublicSpend = useWorldStore((s) => s.setPublicSpend);
    const setPriceCeiling = useWorldStore((s) => s.setPriceCeiling);
    const setWageFloor = useWorldStore((s) => s.setWageFloor);
    const setRegulation = useWorldStore((s) => s.setRegulation);
    const setFreeMarket = useWorldStore((s) => s.setFreeMarket);
    const liberateMarket = useWorldStore((s) => s.liberateMarket);
    const resetToEquilibrium = useWorldStore((s) => s.resetToEquilibrium);

    const free = controls.freeMarket;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    Gud-kontroller
                </h2>
                <button
                    type="button"
                    onClick={resetToEquilibrium}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 active:scale-95 transition-all"
                >
                    <RotateCcw size={12} />
                    Reset
                </button>
            </div>

            <motion.button
                type="button"
                onClick={liberateMarket}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 border-2 border-amber-300/70 hover:border-amber-400 shadow-md shadow-amber-200/40 hover:shadow-lg hover:shadow-amber-300/50 transition-all text-left"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                    <Wind size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-amber-900 leading-tight">
                        Frigjør markedet
                    </div>
                    <div className="text-xs text-amber-800/80 leading-snug mt-0.5">
                        Ingen sentralbank, ingen skatt, ingen regulering.
                    </div>
                </div>
            </motion.button>

            <Section title="Frimarked" icon={Wind}>
                <Toggle
                    id="freeMarket"
                    enabled={controls.freeMarket}
                    onToggle={setFreeMarket}
                />
                {free && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-amber-800/90 leading-snug bg-amber-50 border border-amber-200/70 rounded-lg p-2.5 -mt-1"
                    >
                        Sentralbanken er av. Renten følger naturlig nivå, pengetrykket er null.
                    </motion.p>
                )}
            </Section>

            <Section
                title="Pengepolitikk"
                icon={Landmark}
                disabled={free}
                disabledReason="Sentralbank av"
            >
                <Slider
                    id="policyRate"
                    value={controls.policyRate}
                    min={0}
                    max={15}
                    step={0.25}
                    formatter={(v) => `${v.toFixed(2)} %`}
                    onChange={setPolicyRate}
                    disabled={free}
                />
                <Slider
                    id="moneyGrowth"
                    value={controls.moneyGrowth * 100}
                    min={-5}
                    max={50}
                    step={0.5}
                    formatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} % / år`}
                    onChange={(v) => setMoneyGrowth(v / 100)}
                    disabled={free}
                />
            </Section>

            <Section title="Finanspolitikk" icon={Building2}>
                <Slider
                    id="taxRate"
                    value={controls.taxRate * 100}
                    min={0}
                    max={70}
                    step={1}
                    formatter={(v) => `${v.toFixed(0)} %`}
                    onChange={(v) => setTaxRate(v / 100)}
                />
                <Slider
                    id="publicSpend"
                    value={controls.publicSpend * 100}
                    min={0}
                    max={70}
                    step={1}
                    formatter={(v) => `${v.toFixed(0)} % av BNP`}
                    onChange={(v) => setPublicSpend(v / 100)}
                />
            </Section>

            <Section title="Reguleringer" icon={Scale}>
                <Toggle
                    id="priceCeiling"
                    enabled={controls.priceCeiling.enabled}
                    onToggle={(v) => setPriceCeiling(v, controls.priceCeiling.level)}
                />
                <Toggle
                    id="wageFloor"
                    enabled={controls.wageFloor.enabled}
                    onToggle={(v) => setWageFloor(v, controls.wageFloor.level)}
                />
                <Slider
                    id="regulation"
                    value={controls.regulation}
                    min={0}
                    max={10}
                    step={0.5}
                    formatter={(v) => `${v.toFixed(1)} / 10`}
                    onChange={setRegulation}
                />
            </Section>
        </div>
    );
}

function Section({
    title,
    icon: Icon,
    children,
    disabled = false,
    disabledReason,
}: {
    title: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    children: React.ReactNode;
    disabled?: boolean;
    disabledReason?: string;
}) {
    return (
        <div className="flex flex-col gap-3">
            <h3
                className={`text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                    disabled ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
                {Icon && <Icon size={12} className={disabled ? 'text-slate-400' : 'text-indigo-500'} />}
                {title}
                {disabled && disabledReason && (
                    <span className="ml-1 normal-case tracking-normal italic text-slate-400 font-normal text-[10px]">
                        ({disabledReason})
                    </span>
                )}
            </h3>
            <div
                className={`flex flex-col gap-3.5 transition-opacity ${
                    disabled ? 'opacity-40 pointer-events-none' : ''
                }`}
            >
                {children}
            </div>
        </div>
    );
}

function Slider({
    id,
    value,
    min,
    max,
    step,
    formatter,
    onChange,
    disabled = false,
}: {
    id: string;
    value: number;
    min: number;
    max: number;
    step: number;
    formatter: (v: number) => string;
    onChange: (v: number) => void;
    disabled?: boolean;
}) {
    const tooltip = TOOLTIPS[id];
    return (
        <div className="okonomi-slider">
            <div className="flex items-center justify-between mb-2">
                <LabelWithTooltip tooltip={tooltip} />
                <motion.span
                    key={value}
                    initial={{ scale: 1.18, color: '#4f46e5' }}
                    animate={{ scale: 1, color: '#312e81' }}
                    transition={{ duration: 0.25 }}
                    className="text-sm font-bold font-mono tabular-nums text-indigo-900"
                >
                    {formatter(value)}
                </motion.span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
            />
        </div>
    );
}

function Toggle({
    id,
    enabled,
    onToggle,
}: {
    id: string;
    enabled: boolean;
    onToggle: (v: boolean) => void;
}) {
    const tooltip = TOOLTIPS[id];
    return (
        <div className="flex items-center justify-between">
            <LabelWithTooltip tooltip={tooltip} />
            <button
                type="button"
                onClick={() => onToggle(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors active:scale-95 ${
                    enabled
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-300/40'
                        : 'bg-slate-300'
                }`}
                aria-pressed={enabled}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md ${
                        enabled ? 'left-[1.4rem]' : 'left-0.5'
                    }`}
                />
            </button>
        </div>
    );
}

function LabelWithTooltip({ tooltip }: { tooltip: Tooltip }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative flex items-center gap-1.5">
            <label className="text-sm text-slate-800 font-semibold">{tooltip.label}</label>
            <button
                type="button"
                aria-label={`Hva er ${tooltip.label}?`}
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 100)}
                className="text-slate-400 hover:text-indigo-500 active:scale-90 transition-all"
            >
                <Info size={13} />
            </button>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-30 left-0 top-6 w-64 p-3 bg-slate-900 text-slate-50 border border-slate-700 rounded-xl shadow-xl text-xs leading-snug"
                >
                    {tooltip.body}
                </motion.div>
            )}
        </div>
    );
}
