import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Landmark, Castle, Swords, Wheat, Coins, Sparkles, Zap } from 'lucide-react';

// Lyspære-øyeblikket: I føydale Japan passet ikke formell rang og reell makt sammen.
// Keiseren satt øverst, men var bare et symbol uten makt. Kjøpmennene sto nederst,
// men var ofte de rikeste. Den virkelige makten lå hos krigerne i midten.

interface Tier {
    id: string;
    navn: string;
    rolle: string;
    makt: number; // 0-5, reell makt
    twist?: string; // overraskelsen ved dette trinnet
    icon: typeof Crown;
    color: string;
    width: string; // bredde på pyramidetrinnet
}

const TIERS: Tier[] = [
    {
        id: 'keiser',
        navn: 'Keiseren',
        rolle: 'Satt øverst og ble sett på som hellig. Men han bestemte nesten ingenting selv.',
        makt: 0,
        twist: 'Øverst i rang, men nesten uten makt. Han var et symbol andre styrte i navnet til.',
        icon: Crown,
        color: 'amber',
        width: '32%',
    },
    {
        id: 'shogun',
        navn: 'Shogunen',
        rolle: 'Den øverste krigsherren. Han styrte hele landet fra sin egen regjering.',
        makt: 5,
        twist: 'Her lå den virkelige makten. Shogunen var hærfører, ikke konge, men han bestemte alt.',
        icon: Landmark,
        color: 'rose',
        width: '44%',
    },
    {
        id: 'daimyo',
        navn: 'Daimyoene',
        rolle: 'Mektige lensherrer som styrte hvert sitt landområde med egne borger og hærer.',
        makt: 4,
        icon: Castle,
        color: 'indigo',
        width: '56%',
    },
    {
        id: 'samurai',
        navn: 'Samuraiene',
        rolle: 'Krigerne. De fikk lønn i ris og hadde rett til å bære to sverd.',
        makt: 3,
        icon: Swords,
        color: 'sky',
        width: '70%',
    },
    {
        id: 'bonder',
        navn: 'Bøndene',
        rolle: 'Lav rang, men de dyrket risen som hele samfunnet levde av.',
        makt: 1,
        twist: 'Lav status, men høyere enn kjøpmennene. Risen de dyrket var selve rikdommen i landet.',
        icon: Wheat,
        color: 'emerald',
        width: '85%',
    },
    {
        id: 'kjopmenn',
        navn: 'Kjøpmennene',
        rolle: 'Handelsfolk som kjøpte og solgte varer i byene.',
        makt: 1,
        twist: 'Nederst i rang, men ofte de rikeste av alle. Penger ga ikke status i føydale Japan.',
        icon: Coins,
        color: 'slate',
        width: '100%',
    },
];

const COLOR: Record<string, { bar: string; ring: string; chip: string; icon: string }> = {
    amber: {
        bar: 'from-amber-100 to-amber-200 border-amber-300',
        ring: 'ring-amber-400',
        chip: 'bg-amber-50 border-amber-200 text-amber-700',
        icon: 'text-amber-600',
    },
    rose: {
        bar: 'from-rose-100 to-rose-200 border-rose-300',
        ring: 'ring-rose-400',
        chip: 'bg-rose-50 border-rose-200 text-rose-700',
        icon: 'text-rose-600',
    },
    indigo: {
        bar: 'from-indigo-100 to-indigo-200 border-indigo-300',
        ring: 'ring-indigo-400',
        chip: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        icon: 'text-indigo-600',
    },
    sky: {
        bar: 'from-sky-100 to-sky-200 border-sky-300',
        ring: 'ring-sky-400',
        chip: 'bg-sky-50 border-sky-200 text-sky-700',
        icon: 'text-sky-600',
    },
    emerald: {
        bar: 'from-emerald-100 to-emerald-200 border-emerald-300',
        ring: 'ring-emerald-400',
        chip: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        icon: 'text-emerald-600',
    },
    slate: {
        bar: 'from-slate-100 to-slate-200 border-slate-300',
        ring: 'ring-slate-400',
        chip: 'bg-slate-50 border-slate-200 text-slate-700',
        icon: 'text-slate-600',
    },
};

interface MaktpyramidenJapanProps {
    title?: string;
}

export function MaktpyramidenJapan({ title = 'Maktpyramiden i føydale Japan' }: MaktpyramidenJapanProps) {
    const [valgt, setValgt] = useState<string | null>(null);
    const [utforsket, setUtforsket] = useState<Set<string>>(new Set());

    const ferdig = utforsket.size === TIERS.length;
    const aktiv = TIERS.find((t) => t.id === valgt) ?? null;

    const velg = (id: string) => {
        setValgt(id);
        setUtforsket((prev) => {
            const neste = new Set(prev);
            neste.add(id);
            return neste;
        });
    };

    const reset = () => {
        setValgt(null);
        setUtforsket(new Set());
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Castle className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hvert trinn og oppdag hvem som egentlig hadde makten.
                    </p>
                </div>
                <span className="ml-auto text-xs font-medium text-slate-400">
                    {utforsket.size}/{TIERS.length}
                </span>
            </div>

            {/* Pyramiden */}
            <div className="px-6 py-5 flex flex-col items-center gap-2">
                {TIERS.map((t) => {
                    const c = COLOR[t.color];
                    const er = utforsket.has(t.id);
                    const Icon = t.icon;
                    return (
                        <motion.button
                            key={t.id}
                            onClick={() => velg(t.id)}
                            style={{ width: t.width }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            animate={valgt === t.id ? { scale: 1.03 } : { scale: 1 }}
                            className={`relative bg-gradient-to-b ${c.bar} border rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 shadow-sm ${
                                valgt === t.id ? `ring-2 ${c.ring}` : ''
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${c.icon} shrink-0`} />
                            <span className="font-semibold text-slate-700 text-sm truncate">
                                {t.navn}
                            </span>
                            {er && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute right-2 text-emerald-600"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                </motion.span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Feedback-sone — alltid til stede */}
            <div className="mx-6 mb-4 min-h-[5.5rem]">
                <AnimatePresence mode="wait">
                    {aktiv ? (
                        <motion.div
                            key={aktiv.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className={`rounded-lg border p-4 ${COLOR[aktiv.color].chip}`}
                        >
                            <div className="flex items-center justify-between gap-3 mb-1">
                                <span className="font-semibold text-slate-800">{aktiv.navn}</span>
                                <span className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Zap
                                            key={i}
                                            className={`w-3.5 h-3.5 ${
                                                i < aktiv.makt
                                                    ? 'text-amber-500 fill-amber-400'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    ))}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 leading-snug">{aktiv.rolle}</p>
                            {aktiv.twist && (
                                <p className="mt-2 text-sm font-medium text-slate-800 leading-snug">
                                    {aktiv.twist}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                Lynene viser reell makt, ikke rang.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400 flex items-center justify-center text-center min-h-[5.5rem]"
                        >
                            Trykk på et trinn i pyramiden for å se hvor mye makt de egentlig hadde.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Suksess-tilstand */}
            <AnimatePresence>
                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mx-6 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <motion.span
                                animate={{ rotate: [0, -12, 12, 0] }}
                                transition={{ duration: 0.6 }}
                            >
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                            </motion.span>
                            <span className="font-semibold text-emerald-800">
                                Du har sett hele pyramiden!
                            </span>
                        </div>
                        <p className="text-sm text-emerald-700 leading-snug">
                            Legg merke til to ting: keiseren satt øverst, men hadde ingen makt. Og
                            kjøpmennene sto nederst, men var ofte de rikeste. Formell rang og reell
                            makt fulgte altså ikke hverandre. Den ekte makten lå hos krigerne i
                            midten.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
