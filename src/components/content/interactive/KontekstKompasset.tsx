import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, XCircle, Lightbulb, ChevronRight, RotateCcw } from 'lucide-react';

// Signaturkomponent for "Å kjempe for endring".
// Lyspære: geografiske og historiske rammer bestemmer hvilken strategi som fungerer.
// Riktig kamp på feil sted mislykkes - og omvendt.

type StrategyId = 'politisk' | 'sivil' | 'streik';

interface ContextBar {
    label: string;
    value: number;
    description: string;
    color: string;
}

interface Case {
    title: string;
    year: string;
    location: string;
    summary: string;
    context: ContextBar[];
    correct: StrategyId;
    correctLabel: string;
    correctExplanation: string;
    wrongExplanation: string;
    cardHue: 'blue' | 'yellow' | 'red';
}

const CASES: Case[] = [
    {
        title: 'Norske kvinner og stemmeretten',
        year: '1907-1913',
        location: 'Norge',
        summary:
            'Norske kvinner krevde stemmerett i et ungt demokrati. Politiske kanaler var relativt åpne, og bevegelsen valgte en diplomatisk vei gjennom underskriftskampanjer og samarbeid med mannlige stortingsrepresentanter.',
        context: [
            { label: 'Demokrati', value: 75, description: 'Relativt åpent fra 1814', color: 'bg-blue-500' },
            { label: 'Pressefrihet', value: 80, description: 'Ganske fri presse', color: 'bg-emerald-500' },
            { label: 'Fare for vold', value: 20, description: 'Lav - fredelig klima', color: 'bg-red-400' },
        ],
        correct: 'politisk',
        correctLabel: 'Lovlig politisk arbeid',
        correctExplanation:
            'Riktig. Norske kvinner brukte underskriftskampanjer og lobbying i Stortinget. Det åpne demokratiet fra 1814 ga dem tilgang til politiske kanaler - noe britiske suffragetter ikke hadde, og som tvang dem til dramatiske metoder i stedet.',
        wrongExplanation:
            'I et relativt åpent demokrati med fri presse og lite vold fungerte lovlig politisk arbeid best. Politiske kanaler var tilgjengelige, og diplomatisk påvirkning ga resultater der dramatiske metoder hadde skadet saken.',
        cardHue: 'blue',
    },
    {
        title: 'Norske arbeidere og LO-kampen',
        year: '1879-1935',
        location: 'Norge',
        summary:
            'Norske industriarbeidere krevde kortere arbeidstid, høyere lønn og tryggere arbeidsforhold. Mange hadde begrenset politisk innflytelse, og arbeidsgiverne nektet å forhandle med enkeltpersoner.',
        context: [
            {
                label: 'Demokrati',
                value: 50,
                description: 'Begrenset for arbeidere',
                color: 'bg-blue-500',
            },
            {
                label: 'Pressefrihet',
                value: 60,
                description: 'Delvis fri presse',
                color: 'bg-emerald-500',
            },
            {
                label: 'Fare for vold',
                value: 45,
                description: 'Moderat - lockout og politi',
                color: 'bg-red-400',
            },
        ],
        correct: 'streik',
        correctLabel: 'Streik og boikott',
        correctExplanation:
            'Riktig. Arbeidsgiverne ignorerte enkeltarbeidere. Kollektiv streik og organisering var det som tvang frem forhandlinger. Slik ble Landsorganisasjonen (LO) til - og til slutt Hovedavtalen i 1935.',
        wrongExplanation:
            'Lovlig politisk arbeid nyttet lite da arbeidsgiverne ignorerte enkeltpersoner og mange arbeidere hadde begrenset stemmerett. Det var kollektiv streik og organisering som tvang frem Hovedavtalen i 1935.',
        cardHue: 'yellow',
    },
    {
        title: 'Rosa Parks og busboikotten',
        year: '1955',
        location: 'Montgomery, USA',
        summary:
            'Rosa Parks nektet å gi fra seg bussetet sitt til en hvit passasjer. Jim Crow-lovene lovfestet raseskilnad. Svarte amerikanere hadde nominelt stemmerett, men systematisk diskriminering stengte politiske kanaler.',
        context: [
            {
                label: 'Demokrati',
                value: 15,
                description: 'Svært begrenset for Svarte',
                color: 'bg-blue-500',
            },
            {
                label: 'Pressefrihet',
                value: 20,
                description: 'Fiendtlig og sensurert',
                color: 'bg-emerald-500',
            },
            {
                label: 'Fare for vold',
                value: 75,
                description: 'Høy - KKK og politiovergrep',
                color: 'bg-red-400',
            },
        ],
        correct: 'sivil',
        correctLabel: 'Sivil ulydighet',
        correctExplanation:
            'Riktig. Jim Crow-lovene var selve problemet - å bryte dem fredelig viste verden at de var urettferdige. Politiske kanaler var stengt, og vold ville snudd opinionen mot bevegelsen. Sivil ulydighet skapte internasjonal oppmerksomhet.',
        wrongExplanation:
            'Politiske kanaler var i praksis stengt for Svarte amerikanere. Sivil ulydighet - å bryte urettferdige lover fredelig - viste verden hva som foregikk og skapte presset som endret lovene.',
        cardHue: 'red',
    },
    {
        title: 'Norsk fredsbevegelse mot atomvåpen',
        year: '1982',
        location: 'Norge',
        summary:
            'Titusenvis av nordmenn demonstrerte mot atomvåpen. Norge var NATO-medlem og grenset mot Sovjet. Fredsbevegelsen ønsket norsk innflytelse på nedrustning gjennom internasjonalt samarbeid.',
        context: [
            {
                label: 'Demokrati',
                value: 90,
                description: 'Fullt fungerende demokrati',
                color: 'bg-blue-500',
            },
            {
                label: 'Pressefrihet',
                value: 95,
                description: 'Svært fri presse',
                color: 'bg-emerald-500',
            },
            {
                label: 'Fare for vold',
                value: 5,
                description: 'Nesten ingen risiko',
                color: 'bg-red-400',
            },
        ],
        correct: 'politisk',
        correctLabel: 'Lovlig politisk arbeid',
        correctExplanation:
            'Riktig. Med fullt demokrati og fri presse var lobbyisme og massedemonstrasjoner den rette veien. Det fantes ingen urettferdige lover å bryte, og streik gir ikke mening mot internasjonale militæravtaler. Politisk påvirkning ga Norge en sterk stemme for nedrustning i FN.',
        wrongExplanation:
            'I et fullt demokrati med fri presse er lovlig politisk arbeid mest effektivt. Det var ingen urettferdige lover å bryte (sivil ulydighet gir da ingen mening), og streik gir ikke mening overfor NATO-avtaler.',
        cardHue: 'blue',
    },
];

const STRATEGY_OPTIONS: { id: StrategyId; label: string; description: string }[] = [
    {
        id: 'politisk',
        label: 'Lovlig politisk arbeid',
        description: 'Stemme, lobbying, underskriftskampanjer',
    },
    {
        id: 'sivil',
        label: 'Sivil ulydighet',
        description: 'Fredelig lovbrudd for å synliggjøre urettferdighet',
    },
    {
        id: 'streik',
        label: 'Streik og boikott',
        description: 'Nekte å delta i systemet som undertrykker deg',
    },
];

const CARD_STYLES: Record<Case['cardHue'], { bg: string; border: string; badge: string }> = {
    blue: { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-800' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
    red: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800' },
};

export const KontekstKompasset: React.FC = () => {
    const [caseIdx, setCaseIdx] = useState(0);
    const [selected, setSelected] = useState<StrategyId | null>(null);
    const [completed, setCompleted] = useState<boolean[]>([]);
    const [done, setDone] = useState(false);

    const current = CASES[caseIdx];
    const isCorrect = selected === current.correct;
    const colors = CARD_STYLES[current.cardHue];

    const handleSelect = (id: StrategyId) => {
        if (selected !== null) return;
        setSelected(id);
    };

    const handleNext = () => {
        const newCompleted = [...completed, selected === current.correct];
        setCompleted(newCompleted);
        if (caseIdx < CASES.length - 1) {
            setSelected(null);
            setCaseIdx((i) => i + 1);
        } else {
            setDone(true);
        }
    };

    const handleReset = () => {
        setCaseIdx(0);
        setSelected(null);
        setCompleted([]);
        setDone(false);
    };

    if (done) {
        const score = completed.filter(Boolean).length;
        const allCorrect = score === CASES.length;
        return (
            <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-display font-bold text-lg text-slate-800">
                            Kontekst og strategi
                        </h3>
                    </div>
                </div>
                <div className="p-6 text-center">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    >
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                allCorrect ? 'bg-emerald-100' : score >= 3 ? 'bg-amber-100' : 'bg-slate-100'
                            }`}
                        >
                            <span className="text-3xl font-bold text-slate-800">{score}/4</span>
                        </div>
                    </motion.div>
                    <p className="font-display font-bold text-xl text-slate-900 mb-2">
                        {allCorrect
                            ? 'Du behersker det viktigste prinsippet!'
                            : score >= 3
                              ? 'Nesten perfekt - ett skritt fra mål'
                              : score >= 2
                                ? 'Halvveis - les kontekst-barene grundigere'
                                : 'Prøv igjen - konteksten gir deg svaret'}
                    </p>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-5">
                        Konteksten er ikke bare bakgrunn - den bestemmer strategien. Demokrati,
                        pressefrihet og risiko for vold avgjør hvilke metoder som er mulige og
                        effektive. Samme mål kan kreve helt ulike veier.
                    </p>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Prøv på nytt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <h3 className="font-display font-bold text-lg text-slate-800">
                                Kontekst og strategi
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                            Velg riktig strategi for hvert historisk eksempel. Konteksten er ikke
                            bare bakgrunn - den bestemmer hva som er mulig.
                        </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-indigo-600 bg-indigo-100 rounded-full px-2.5 py-1">
                        {caseIdx + 1}/{CASES.length}
                    </span>
                </div>
                {/* Progress dots */}
                <div className="flex items-center gap-2 mt-3">
                    {CASES.map((_, i) => (
                        <motion.div
                            key={i}
                            className="h-2 rounded-full bg-indigo-200"
                            animate={{
                                width: i === caseIdx ? 32 : i < caseIdx ? 20 : 10,
                                backgroundColor: i < caseIdx ? '#6366f1' : i === caseIdx ? '#4f46e5' : '#e0e7ff',
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={caseIdx}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="p-5 grid gap-4"
                >
                    {/* Case card */}
                    <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-display font-bold text-slate-900 text-base leading-tight">
                                {current.title}
                            </h4>
                            <span
                                className={`flex-shrink-0 text-xs font-semibold rounded-full px-2.5 py-0.5 ${colors.badge}`}
                            >
                                {current.year}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500">{current.location}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{current.summary}</p>
                    </div>

                    {/* Context bars */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                            Kontekst
                        </p>
                        <div className="grid gap-3">
                            {current.context.map((bar) => (
                                <div key={bar.label}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">
                                            {bar.label}
                                        </span>
                                        <span className="text-slate-500">{bar.description}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${bar.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{
                                                delay: 0.15,
                                                type: 'spring',
                                                stiffness: 180,
                                                damping: 22,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strategy buttons */}
                    <div className="grid gap-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Velg strategi
                        </p>
                        {STRATEGY_OPTIONS.map((opt) => {
                            const isSelected = selected === opt.id;
                            const isCorrectOpt = opt.id === current.correct;
                            let cls =
                                'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer';
                            if (selected !== null) {
                                if (isSelected && isCorrect)
                                    cls =
                                        'border-emerald-400 bg-emerald-50 text-emerald-800 cursor-default';
                                else if (isSelected && !isCorrect)
                                    cls = 'border-red-400 bg-red-50 text-red-800 cursor-default';
                                else if (isCorrectOpt && !isCorrect)
                                    cls =
                                        'border-emerald-200 bg-emerald-50/60 text-emerald-700 cursor-default';
                                else cls = 'border-slate-100 bg-slate-50 text-slate-400 cursor-default';
                            }
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelect(opt.id)}
                                    disabled={selected !== null}
                                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${cls}`}
                                >
                                    <div className="font-semibold text-sm">{opt.label}</div>
                                    <div className="text-xs opacity-70 mt-0.5">{opt.description}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Reveal + Next */}
                    <AnimatePresence>
                        {selected !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            >
                                <div
                                    className={`rounded-xl border p-4 mb-3 ${
                                        isCorrect
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            {!isCorrect && (
                                                <p className="text-xs font-bold text-slate-600 mb-1">
                                                    Riktig strategi:{' '}
                                                    <span className="text-emerald-700">
                                                        {current.correctLabel}
                                                    </span>
                                                </p>
                                            )}
                                            <p
                                                className={`text-sm leading-relaxed ${
                                                    isCorrect ? 'text-emerald-800' : 'text-red-900'
                                                }`}
                                            >
                                                {isCorrect
                                                    ? current.correctExplanation
                                                    : current.wrongExplanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                                >
                                    {caseIdx < CASES.length - 1 ? 'Neste sak' : 'Se resultatet'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
