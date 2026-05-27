import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Package, Banknote, Users, AlertCircle, ChevronRight, RotateCcw, Lock } from 'lucide-react';

interface StepInfo {
    label: string;
    explanation: string;
    colorClass: string;
}

const STEPS: StepInfo[] = [
    {
        label: 'Steg 1: Missilsalget',
        explanation:
            'USA selger Hawk-missiler til Iran (1985-1986). Iran betaler rundt 30 millioner dollar - et hemmelig vapen­handel med en erklart fiende Reagan offentlig kalte en "terroristnasjon".',
        colorClass: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
        label: 'Steg 2: De hemmelige kontoane',
        explanation:
            'Oliver North oppretter hemmelige sveitsiske bankkontoer. Overskuddet fra missilsalget havner der - helt utenom Kongressens innsyn og kontroll.',
        colorClass: 'border-orange-200 bg-orange-50 text-orange-800',
    },
    {
        label: 'Steg 3: Det ulovlige kretslopet',
        explanation:
            'Pengene sendes videre til Contra-geriljaen i Nicaragua - stikk i strid med Boland-tillegget (1984), som uttrykkelig forbod Kongressen a finansiere Contras.',
        colorClass: 'border-rose-200 bg-rose-50 text-rose-800',
    },
];

const ACTORS = [
    { id: 'cia', label: 'Reagan / CIA', sub: 'Washington', icon: ShieldAlert, activeBg: 'bg-blue-50 border-blue-300 text-blue-700' },
    { id: 'iran', label: 'Iran', sub: 'Teheran', icon: Package, activeBg: 'bg-amber-50 border-amber-300 text-amber-700' },
    { id: 'north', label: 'Oliver North', sub: 'Hemmelig konto', icon: Banknote, activeBg: 'bg-slate-100 border-slate-400 text-slate-700' },
    { id: 'contras', label: 'Contras', sub: 'Nicaragua', icon: Users, activeBg: 'bg-green-50 border-green-300 text-green-700' },
];

export function IranContraSpor({ title = 'Det forbudte kretslopet' }: { title?: string }) {
    const [step, setStep] = useState(0);
    const isComplete = step >= 4;

    const advance = () => setStep((s) => Math.min(s + 1, 4));
    const reset = () => setStep(0);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 my-6 not-prose">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-rose-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Klikk deg gjennom det hemmelige nettverket - ett steg av gangen</p>
                </div>
            </div>

            {/* Flow diagram */}
            <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
                {ACTORS.map((actor, i) => {
                    const Icon = actor.icon;
                    const isActive = step > i;
                    return (
                        <React.Fragment key={actor.id}>
                            {/* Actor box */}
                            <motion.div
                                className={`flex-shrink-0 rounded-lg border-2 p-2.5 text-center w-[90px] transition-all duration-300 ${
                                    isActive ? actor.activeBg : 'bg-slate-50 border-slate-200'
                                } ${isComplete ? 'ring-2 ring-rose-400 ring-offset-1' : ''}`}
                                animate={step === i + 1 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                                transition={{ duration: 0.35 }}
                            >
                                <Icon
                                    size={18}
                                    className={`mx-auto mb-1 ${isActive ? '' : 'text-slate-300'}`}
                                />
                                <div className={`text-[11px] font-semibold leading-tight ${isActive ? '' : 'text-slate-400'}`}>
                                    {actor.label}
                                </div>
                                <div className={`text-[9px] mt-0.5 ${isActive ? 'opacity-70' : 'text-slate-300'}`}>
                                    {actor.sub}
                                </div>
                            </motion.div>

                            {/* Arrow between actors */}
                            {i < ACTORS.length - 1 && (
                                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                    {/* Boland barrier label above arrow 2→3 */}
                                    {i === 2 && (
                                        <motion.div
                                            className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                step >= 3
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-red-50 text-red-500 border border-red-200'
                                            }`}
                                            animate={step === 3 ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <Lock size={8} />
                                            BOLAND
                                        </motion.div>
                                    )}
                                    {/* Arrow */}
                                    <AnimatePresence mode="wait">
                                        {step > i ? (
                                            <motion.div
                                                key="active"
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                                className="flex items-center origin-left"
                                            >
                                                <div className={`w-6 h-0.5 ${step >= 3 && i === 2 ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                                                <div
                                                    className={`w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] ${
                                                        step >= 3 && i === 2 ? 'border-l-rose-500' : 'border-l-indigo-500'
                                                    }`}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="inactive"
                                                className="flex items-center"
                                            >
                                                <div className="w-6 border-t-2 border-dashed border-slate-200" />
                                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-slate-200" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step explanation */}
            <AnimatePresence mode="wait">
                {step > 0 && !isComplete && (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className={`rounded-lg border p-3.5 mb-4 text-sm ${STEPS[step - 1].colorClass}`}
                    >
                        <div className="font-semibold text-xs mb-1">{STEPS[step - 1].label}</div>
                        <div className="text-xs leading-relaxed">{STEPS[step - 1].explanation}</div>
                    </motion.div>
                )}

                {isComplete && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.93 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'backOut' }}
                        className="rounded-lg border-2 border-rose-400 bg-rose-50 p-4 mb-4 text-center"
                    >
                        <div className="text-rose-700 font-bold text-base mb-1.5">ULOVLIG KRETS AVDEKKET</div>
                        <div className="text-rose-600 text-xs leading-relaxed">
                            Reagan-administrasjonen hadde omgatt Boland-tillegget ved a rute vapen­penger gjennom Iran til Contra-geriljaen i Nicaragua.
                            Da libanesiske Al-Shiraa avslarte nettverket i november 1986, ble det en konstitusjonell krise i USA.
                        </div>
                    </motion.div>
                )}

                {step === 0 && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 mb-4 text-center"
                    >
                        <p className="text-slate-500 text-xs">
                            Klikk pa knappen nedenfor for a avsloere hvordan pengene flosset i det hemmelige nettverket.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <RotateCcw size={11} />
                    Tilbakestill
                </button>

                {!isComplete && (
                    <motion.button
                        onClick={advance}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 transition-colors"
                    >
                        {step === 0
                            ? 'Start avsloringen'
                            : step === 3
                              ? 'Se det ulovlige kretslopet'
                              : 'Avdekk neste steg'}
                        <ChevronRight size={13} />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
