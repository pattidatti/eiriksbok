import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone, ChevronRight, RefreshCw } from 'lucide-react';

interface KalifatvalgetTreProps {
    title?: string;
}

interface Node {
    year: string;
    title: string;
    who: string;
    whyMatters: string;
    consequence: string;
    isKarbala?: boolean;
}

const NODES: Node[] = [
    {
        year: '632',
        title: 'Muhammed dor - hvem tar over?',
        who: 'Abu Bakr, Muhammeds svigerfar og venn, velges av fremste ledere.',
        whyMatters:
            'Muhammed utpekte ingen arvtaker. Det oppsto umiddelbart strid: Alis tilhengere mente lederskapet tilhørte familien. Majoriteten mente man skulle velge den mest skikkede.',
        consequence:
            'Abu Bakr ble den første kalif. Ali - som mange mente hadde naturlig rett - ble forbigatt. Saret ble aldri leget.',
    },
    {
        year: '644',
        title: 'Ali forbigatt igjen',
        who: 'Etter Abu Bakr kom Umar, deretter Uthman. Ali ble ikke valgt.',
        whyMatters:
            'Tre ganger ble lederskapet gitt til andre. Uthman kom fra den mektige Umayya-klanen i Mekka - mange mente han brukte makten til a berike familien.',
        consequence:
            'Uthman ble myrdet av opprørere i 656. Ali fikk endelig makten. Men riket var delt, og borgerkrig brøt ut.',
    },
    {
        year: '656-661',
        title: 'Alis tid - og hans drap',
        who: 'Ali ibn Abi Talib, Muhammeds fetter og svigersønn, styrer som kalif.',
        whyMatters:
            'Ali måtte kjempe mot Muawiya fra Umayya-klanen om makten. Etter år med borgerkrig ble Ali drept av en fanatiker i 661. Muawiya tok over og grunnla Umayyadedynastiet.',
        consequence:
            'Alis tilhengere nektet a anerkjenne Umayyadene. Stridens frø var lagt for generasjoner.',
    },
    {
        year: '680',
        title: 'Karbala: Politikk blir hellig sorg',
        who: 'Alis sønn Husayn samler tilhengere og marsjerer mot Kufa i Irak. Umayyadene sender hæren.',
        whyMatters:
            'Husayn og 72 menn møtte Umayyadenes hær pa Karbala-sletten. De ble omringet og nektet vann i dagvis. Husayn nektet a gi seg. Han ble drept 10. muharram.',
        consequence:
            'Husayns martyrdød forvandlet en politisk strid til en hellig fortelling. Det politiske spørsmalet om hvem som skulle lede - ble til et religiøst traume som lever den dag i dag.',
        isKarbala: true,
    },
];

export function KalifatvalgetTre({ title = 'Fra arvefølge til religiøst skille' }: KalifatvalgetTreProps) {
    const [step, setStep] = useState(0);
    const isComplete = step >= NODES.length;

    const current = NODES[step] ?? null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Milestone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Klikk deg gjennom de fire valgpunktene som skapte sunni-shia-splittelsen</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-0.5 px-5 pt-4">
                {NODES.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i < step ? 'bg-indigo-400' : i === step ? 'bg-indigo-200' : 'bg-slate-100'
                        }`}
                    />
                ))}
            </div>

            {/* Node display */}
            <div className="p-5">
                <AnimatePresence mode="wait">
                    {!isComplete && current && (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.22 }}
                        >
                            {/* Year badge */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${current.isKarbala ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {current.year}
                                </span>
                                <span className={`text-sm font-semibold ${current.isKarbala ? 'text-rose-800' : 'text-slate-800'}`}>
                                    {current.title}
                                </span>
                            </div>

                            {/* Who */}
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 mb-2">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">Hva skjedde</div>
                                <p className="text-xs text-amber-900 leading-relaxed">{current.who}</p>
                            </div>

                            {/* Why it matters */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 mb-2">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-700 mb-1">Hvorfor dette ma</div>
                                <p className="text-xs text-blue-900 leading-relaxed">{current.whyMatters}</p>
                            </div>

                            {/* Consequence */}
                            <div className={`rounded-lg border px-3 py-2.5 ${current.isKarbala ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${current.isKarbala ? 'text-rose-700' : 'text-slate-600'}`}>
                                    Konsekvens
                                </div>
                                <p className={`text-xs leading-relaxed ${current.isKarbala ? 'text-rose-900' : 'text-slate-700'}`}>
                                    {current.consequence}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {isComplete && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center"
                        >
                            <div className="text-emerald-700 font-bold text-sm mb-1.5">Det handler ikke om Koranen</div>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                Sunni og shia ber de samme bønnene og leser den samme Koranen. Det som skilte dem, var et politisk spørsmål: hvem har rett til a lede? Et arvefølgestrid ble over generasjoner til dype kulturelle og religiøse identiteter.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="px-5 pb-5 flex items-center justify-between">
                <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Start pa nytt
                </button>
                {!isComplete && (
                    <motion.button
                        onClick={() => setStep((s) => s + 1)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 transition-colors"
                    >
                        {step === 0 ? 'Start' : step === NODES.length - 1 ? 'Se sluttresultatet' : 'Neste valgpunkt'}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
