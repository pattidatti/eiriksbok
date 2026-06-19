import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Scale, Sparkles, RotateCcw, Wheat, Fish, ArrowRight } from 'lucide-react';

// Signaturkomponent for artikkelen om komparativt og absolutt fortrinn.
// Lyspæren: Ada er best til ALT (absolutt fortrinn), men det lønner seg likevel
// at hver lager det den gir opp MINST for å lage (komparativt fortrinn). Da blir
// det like mye brød til alle, men mer fisk - ingen taper, begge vinner.
//
// Tallene er faste og forhåndsregnet for å holde det rent og ærlig:
//   Ada:   12 brød  ELLER 12 fisk per dag  -> 1 fisk koster 1 brød
//   Bjørn:  8 brød  ELLER  4 fisk per dag  -> 1 fisk koster 2 brød
// Ada har absolutt fortrinn i begge. Men Bjørn ofrer minst for å lage brød
// (komparativt fortrinn i brød), og Ada ofrer minst for fisk.

type Phase = 'start' | 'absolutt' | 'komparativt' | 'gevinst';

interface FortrinnsKalkulatorProps {
    title?: string;
}

const ADA = { navn: 'Ada', brod: 12, fisk: 12 };
const BJORN = { navn: 'Bjørn', brod: 8, fisk: 4 };

// Uten spesialisering: hver deler dagen likt mellom brød og fisk.
const UTEN = { brod: ADA.brod / 2 + BJORN.brod / 2, fisk: ADA.fisk / 2 + BJORN.fisk / 2 }; // 10 brød, 8 fisk
// Med spesialisering: Bjørn lager bare brød, Ada bruker dagen mest på fisk og
// fyller på med de siste brødene. Resultat: like mye brød, men flere fisk.
const MED = { brod: 10, fisk: 10 };

export function FortrinnsKalkulator({ title = 'Hvem bør lage hva?' }: FortrinnsKalkulatorProps) {
    const [phase, setPhase] = useState<Phase>('start');

    const reset = () => setPhase('start');

    const next: Record<Phase, Phase | null> = {
        start: 'absolutt',
        absolutt: 'komparativt',
        komparativt: 'gevinst',
        gevinst: null,
    };

    const ctaLabel: Record<Phase, string> = {
        start: 'Hvem er best?',
        absolutt: 'Regn ut hva de ofrer',
        komparativt: 'La hver spesialisere seg',
        gevinst: '',
    };

    const showAbsolutt = phase !== 'start';
    const showKomparativt = phase === 'komparativt' || phase === 'gevinst';
    const showGevinst = phase === 'gevinst';

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Ada og Bjørn lager brød og fisk. Trykk deg gjennom og se hvem som bør gjøre
                        hva.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* De to produsentene */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProducerCard
                        navn={ADA.navn}
                        brod={ADA.brod}
                        fisk={ADA.fisk}
                        accent="indigo"
                        bestAbsolutt={showAbsolutt}
                        offer={showKomparativt ? '1 fisk koster 1 brød' : null}
                        komparativtGode={showKomparativt ? 'fisk' : null}
                    />
                    <ProducerCard
                        navn={BJORN.navn}
                        brod={BJORN.brod}
                        fisk={BJORN.fisk}
                        accent="amber"
                        bestAbsolutt={false}
                        offer={showKomparativt ? '1 fisk koster 2 brød' : null}
                        komparativtGode={showKomparativt ? 'brod' : null}
                    />
                </div>

                {/* Feedback-sone: forklarer hvert steg. Alltid til stede. */}
                <div className="mt-5 min-h-[64px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={phase}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="rounded-lg text-sm leading-relaxed"
                        >
                            {phase === 'start' && (
                                <p className="text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                                    Ada er kjapp og lager mye av begge varene. Bjørn er tregere. Men
                                    hvem bør egentlig lage hva? Trykk for å finne ut.
                                </p>
                            )}
                            {phase === 'absolutt' && (
                                <div className="text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex gap-2">
                                    <Award className="w-5 h-5 flex-shrink-0 text-blue-500" />
                                    <p>
                                        Ada lager mest av <strong>begge</strong> varer. Vi sier at
                                        hun har <strong>absolutt fortrinn</strong> i både brød og
                                        fisk. Så da burde Ada lage alt selv?
                                    </p>
                                </div>
                            )}
                            {phase === 'komparativt' && (
                                <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex gap-2">
                                    <Scale className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                                    <p>
                                        Nei! Se på hva de <strong>ofrer</strong>. Når Bjørn lager ett
                                        brød, gir han bare opp en halv fisk. Når Ada lager ett brød,
                                        gir hun opp en hel fisk. Bjørn ofrer minst for brød - han har{' '}
                                        <strong>komparativt fortrinn</strong> i brød. Ada ofrer minst
                                        for fisk.
                                    </p>
                                </div>
                            )}
                            {phase === 'gevinst' && (
                                <div className="text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex gap-2">
                                    <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                                    <p>
                                        Bjørn lager brødet, Ada lager mest fisk. Da blir det{' '}
                                        <strong>like mange brød</strong> som før, men{' '}
                                        <strong>to fisk ekstra</strong> - uten at noen jobber mer.
                                        Ingen taper, begge vinner.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Gevinst-visualisering: sammenlign total produksjon */}
                <AnimatePresence>
                    {showGevinst && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 grid grid-cols-2 gap-4 overflow-hidden"
                        >
                            <TotalCard tittel="Uten spesialisering" brod={UTEN.brod} fisk={UTEN.fisk} highlight={false} />
                            <TotalCard tittel="Med spesialisering" brod={MED.brod} fisk={MED.fisk} highlight />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                {next[phase] ? (
                    <button
                        onClick={() => setPhase(next[phase]!)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                        {ctaLabel[phase]}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm">
                        <Sparkles className="w-4 h-4" />
                        Begge vant!
                    </div>
                )}
                <button
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors inline-flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}

function ProducerCard({
    navn,
    brod,
    fisk,
    accent,
    bestAbsolutt,
    offer,
    komparativtGode,
}: {
    navn: string;
    brod: number;
    fisk: number;
    accent: 'indigo' | 'amber';
    bestAbsolutt: boolean;
    offer: string | null;
    komparativtGode: 'brod' | 'fisk' | null;
}) {
    const max = 12;
    const accentBar = accent === 'indigo' ? 'bg-indigo-500' : 'bg-amber-500';
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-800">{navn}</span>
                <AnimatePresence>
                    {bestAbsolutt && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5"
                        >
                            <Award className="w-3 h-3" />
                            Best til alt
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <ProductionRow
                icon={<Wheat className="w-4 h-4 text-amber-600" />}
                label="Brød per dag"
                value={brod}
                max={max}
                barClass={accentBar}
                star={komparativtGode === 'brod'}
            />
            <div className="h-2.5" />
            <ProductionRow
                icon={<Fish className="w-4 h-4 text-sky-600" />}
                label="Fisk per dag"
                value={fisk}
                max={max}
                barClass={accentBar}
                star={komparativtGode === 'fisk'}
            />

            <AnimatePresence>
                {offer && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2"
                    >
                        Alternativkostnad: {offer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductionRow({
    icon,
    label,
    value,
    max,
    barClass,
    star,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    max: number;
    barClass: string;
    star: boolean;
}) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="inline-flex items-center gap-1.5">
                    {icon}
                    {label}
                </span>
                <span className="font-bold text-slate-800 inline-flex items-center gap-1">
                    {value}
                    <AnimatePresence>
                        {star && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-1.5 py-0.5"
                            >
                                Lager dette
                            </motion.span>
                        )}
                    </AnimatePresence>
                </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${barClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
            </div>
        </div>
    );
}

function TotalCard({
    tittel,
    brod,
    fisk,
    highlight,
}: {
    tittel: string;
    brod: number;
    fisk: number;
    highlight: boolean;
}) {
    return (
        <div
            className={`rounded-xl border p-4 ${
                highlight ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
            }`}
        >
            <p
                className={`text-xs font-bold uppercase tracking-wide mb-3 ${
                    highlight ? 'text-emerald-700' : 'text-slate-500'
                }`}
            >
                {tittel}
            </p>
            <div className="space-y-2">
                <TotalRow icon={<Wheat className="w-4 h-4 text-amber-600" />} value={brod} label="brød" />
                <TotalRow
                    icon={<Fish className="w-4 h-4 text-sky-600" />}
                    value={fisk}
                    label="fisk"
                    pop={highlight}
                />
            </div>
        </div>
    );
}

function TotalRow({
    icon,
    value,
    label,
    pop,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    pop?: boolean;
}) {
    return (
        <motion.div
            className="flex items-center gap-2"
            initial={pop ? { scale: 0.8, opacity: 0 } : false}
            animate={pop ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
        >
            {icon}
            <span className="text-2xl font-black text-slate-800 tabular-nums">{value}</span>
            <span className="text-sm text-slate-500">{label}</span>
            {pop && (
                <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5"
                >
                    +2
                </motion.span>
            )}
        </motion.div>
    );
}
