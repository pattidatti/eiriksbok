import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles, Wind, Landmark, Building2, Scale, ChevronDown, RefreshCw } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import { usePulseStore } from '../store/pulseStore';

interface Tooltip {
    label: string;
    body: string;
}

const TOOLTIPS: Record<string, Tooltip> = {
    freeMarket: {
        label: 'Marked uten sentralbank',
        body: 'Slå av sentralbanken. Renten følger det folk faktisk sparer og låner, og pengemengden vokser ikke. I denne modellen blir resultatet stabilt - andre økonomiske skoler ville sagt at markedet alene kan bomme stygt på kriser.',
    },
    policyRate: {
        label: 'Styringsrente',
        body: 'Renten sentralbanken bestemmer. Når den ligger langt under det folk faktisk vil låne ut for, bygger økonomien for mye på lån (det modellen kaller feilinvestering).',
    },
    moneyGrowth: {
        label: 'Pengetrykk per år',
        body: 'Hvor raskt pengemengden vokser. Mye pengetrykk gir inflasjon. I denne modellen treffer pengene de tyngste produksjonsleddene først (kalt Cantillon-effekten).',
    },
    taxRate: {
        label: 'Skattenivå',
        body: 'Hvor stor del av lønnen som går til staten. Påvirker hva folk har igjen til å spare og bruke.',
    },
    publicSpend: {
        label: 'Offentlig forbruk',
        body: 'Hvor stor del av økonomien som styres av politiske valg framfor av markedet.',
    },
    priceCeiling: {
        label: 'Pristak',
        body: 'Lovbestemt makspris på forbruksvarer. Skaper ofte vareknapphet fordi prisene ikke lenger viser hvor knapt noe er.',
    },
    wageFloor: {
        label: 'Lønnsgulv',
        body: 'Minimumslønn. Kan gi arbeidsledighet hos de som er minst produktive, fordi det blir for dyrt å ansette dem.',
    },
    regulation: {
        label: 'Reguleringsbyrde',
        body: 'Hvor mange regler bedriftene må følge. Mye regulering bremser nyetableringer og kapitaloppbygging.',
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
    const firePulse = usePulseStore((s) => s.fire);

    const [advancedOpen, setAdvancedOpen] = useState(false);
    const free = controls.freeMarket;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Gud-kontroller
                </h2>
                <motion.button
                    type="button"
                    onClick={resetToEquilibrium}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                    aria-label="Nullstill alle kontroller"
                >
                    <RefreshCw size={11} />
                    Nullstill
                </motion.button>
            </div>

            <motion.button
                type="button"
                onClick={() => {
                    liberateMarket();
                    firePulse('freeMarket');
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 border-2 border-amber-300/70 hover:border-amber-400 shadow-md shadow-amber-200/40 hover:shadow-lg hover:shadow-amber-300/50 transition-all text-left"
            >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform flex-shrink-0">
                    <Wind size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-amber-900 leading-tight">
                        Slå av alle inngrep
                    </div>
                    <div className="text-[11px] text-amber-800/80 leading-snug mt-0.5">
                        Test scenarioet uten sentralbank, skatt eller regulering.
                    </div>
                </div>
            </motion.button>

            <Section title="Marked uten sentralbank" icon={Wind}>
                <Toggle
                    id="freeMarket"
                    enabled={controls.freeMarket}
                    onToggle={(v) => {
                        setFreeMarket(v);
                        firePulse('freeMarket');
                    }}
                />
                {free && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-amber-800/90 leading-snug bg-amber-50 border border-amber-200/70 rounded-lg p-2 -mt-1"
                    >
                        Sentralbanken er av. Renten settes av sparing og lån.
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
                    onCommit={() => firePulse('policyRate')}
                    disabled={free}
                    pulseColor="#6366f1"
                />
                <Slider
                    id="moneyGrowth"
                    value={controls.moneyGrowth * 100}
                    min={-5}
                    max={50}
                    step={0.5}
                    formatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} % / år`}
                    onChange={(v) => setMoneyGrowth(v / 100)}
                    onCommit={() => firePulse('moneyGrowth')}
                    disabled={free}
                    pulseColor="#f59e0b"
                />
            </Section>

            <Section title="Skatt" icon={Building2}>
                <Slider
                    id="taxRate"
                    value={controls.taxRate * 100}
                    min={0}
                    max={70}
                    step={1}
                    formatter={(v) => `${v.toFixed(0)} %`}
                    onChange={(v) => setTaxRate(v / 100)}
                    onCommit={() => firePulse('taxRate')}
                    pulseColor="#0ea5e9"
                />
            </Section>

            <div className="border-t border-slate-200 pt-3">
                <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-bold text-slate-600 hover:text-slate-900 transition-colors py-1"
                    aria-expanded={advancedOpen}
                >
                    <span className="flex items-center gap-1.5">
                        <Scale size={12} className="text-slate-500" />
                        Avansert
                    </span>
                    <motion.span animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} />
                    </motion.span>
                </button>
                <AnimatePresence initial={false}>
                    {advancedOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col gap-4 pt-3">
                                <Section title="Finanspolitikk" icon={Building2} compact>
                                    <Slider
                                        id="publicSpend"
                                        value={controls.publicSpend * 100}
                                        min={0}
                                        max={70}
                                        step={1}
                                        formatter={(v) => `${v.toFixed(0)} % av BNP`}
                                        onChange={(v) => setPublicSpend(v / 100)}
                                        onCommit={() => firePulse('publicSpend')}
                                        pulseColor="#8b5cf6"
                                    />
                                </Section>
                                <Section title="Reguleringer" icon={Scale} compact>
                                    <Toggle
                                        id="priceCeiling"
                                        enabled={controls.priceCeiling.enabled}
                                        onToggle={(v) => {
                                            setPriceCeiling(v, controls.priceCeiling.level);
                                            firePulse('priceCeiling');
                                        }}
                                    />
                                    <Toggle
                                        id="wageFloor"
                                        enabled={controls.wageFloor.enabled}
                                        onToggle={(v) => {
                                            setWageFloor(v, controls.wageFloor.level);
                                            firePulse('wageFloor');
                                        }}
                                    />
                                    <Slider
                                        id="regulation"
                                        value={controls.regulation}
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        formatter={(v) => `${v.toFixed(1)} / 10`}
                                        onChange={setRegulation}
                                        onCommit={() => firePulse('regulation')}
                                        pulseColor="#64748b"
                                    />
                                </Section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Section({
    title,
    icon: Icon,
    children,
    disabled = false,
    disabledReason,
    compact = false,
}: {
    title: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    children: React.ReactNode;
    disabled?: boolean;
    disabledReason?: string;
    compact?: boolean;
}) {
    return (
        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-2.5'}`}>
            <h3
                className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                    disabled ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
                {Icon && <Icon size={11} className={disabled ? 'text-slate-400' : 'text-indigo-500'} />}
                {title}
                {disabled && disabledReason && (
                    <span className="ml-1 normal-case tracking-normal italic text-slate-400 font-normal text-[10px]">
                        ({disabledReason})
                    </span>
                )}
            </h3>
            <div
                className={`flex flex-col ${compact ? 'gap-2.5' : 'gap-3'} transition-opacity ${
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
    onCommit,
    disabled = false,
    pulseColor = '#6366f1',
}: {
    id: string;
    value: number;
    min: number;
    max: number;
    step: number;
    formatter: (v: number) => string;
    onChange: (v: number) => void;
    onCommit?: () => void;
    disabled?: boolean;
    pulseColor?: string;
}) {
    const tooltip = TOOLTIPS[id];
    const [grabbed, setGrabbed] = useState(false);
    return (
        <div className="okonomi-slider">
            <div className="flex items-center justify-between mb-1.5">
                <LabelWithTooltip tooltip={tooltip} />
                <motion.span
                    key={value}
                    initial={{ scale: 1.18, color: pulseColor }}
                    animate={{ scale: 1, color: '#1e1b4b' }}
                    transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                    className="text-sm font-bold font-mono tabular-nums"
                >
                    {formatter(value)}
                </motion.span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    onPointerDown={() => setGrabbed(true)}
                    onPointerUp={() => {
                        setGrabbed(false);
                        onCommit?.();
                    }}
                    onKeyUp={(e) => {
                        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
                            onCommit?.();
                        }
                    }}
                    style={{
                        accentColor: pulseColor,
                    }}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed relative z-10"
                />
                {grabbed && (
                    <motion.span
                        initial={{ opacity: 0.4, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ background: `${pulseColor}30` }}
                    />
                )}
            </div>
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
            <label className="text-[13px] text-slate-800 font-semibold">{tooltip.label}</label>
            <button
                type="button"
                aria-label={`Hva er ${tooltip.label}?`}
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 100)}
                className="text-slate-400 hover:text-indigo-500 active:scale-90 transition-all"
            >
                <Info size={12} />
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

