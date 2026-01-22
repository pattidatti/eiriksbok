import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';

// Letter Content Configuration
const LETTER_SEGMENTS = [
    { id: 1, text: "Kjære Mor og Far,", type: "safe" },
    { id: 2, text: "Livet i skyttergravene er hardt, men vi holder motet oppe.", type: "safe" },
    { id: 3, text: "Rasjonene kommer frem, og vi har godt med ammunisjon.", type: "safe" },
    { id: 4, text: "I går stormet vi tyskernes linjer. Det var et blodbad.", type: "danger" },
    { id: 5, text: "Jeg så Jakob bli revet i to av granatsplinter rett foran meg.", type: "danger" },
    { id: 6, text: "Løytnanten sier vi vinner, men jeg tror han lyver.", type: "suspicious" },
    { id: 7, text: "Send flere ullsokker. Vinteren kommer til å bli kald.", type: "safe" },
    { id: 8, text: "Din sønn, Peder.", type: "safe" },
];

const FEEDBACK = {
    lenient: {
        title: "For mild sensur!",
        message: "Brevet ble sendt med sjokkerende detaljer. Foreldrene er i opprør og deler historiene med naboene. Krigsmoralen synker.",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200"
    },
    strict: {
        title: "For streng sensur!",
        message: "Du sladdet nesten alt. Foreldrene mottar bare svarte streker og blir livredde. Rykter om mytteri begynner å gå.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200"
    },
    perfect: {
        title: "Perfekt sensur",
        message: "Godt jobbet! Brevet er trygt. Familien blir beroliget av at sønnen er i live, men skjermes for krigens grusomme virkelighet.",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200"
    }
};

export const CensorTask: React.FC = () => {
    const [redactedIds, setRedactedIds] = useState<Set<number>>(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<'lenient' | 'strict' | 'perfect' | null>(null);

    const toggleRedaction = (id: number) => {
        if (submitted) return;
        const newRedacted = new Set(redactedIds);
        if (newRedacted.has(id)) {
            newRedacted.delete(id);
        } else {
            newRedacted.add(id);
        }
        setRedactedIds(newRedacted);
    };

    const checkResult = () => {
        const dangerousVisible = LETTER_SEGMENTS.filter(s => (s.type === 'danger' || s.type === 'suspicious') && !redactedIds.has(s.id));
        const safeRedacted = LETTER_SEGMENTS.filter(s => s.type === 'safe' && redactedIds.has(s.id));

        // Logic:
        // Fail if ANY dangerous/suspicious content is visible -> Lenient
        // Fail if MORE THAN 1 safe line is redacted -> Strict (Too much black ink looks suspicious)
        // Pass otherwise

        if (dangerousVisible.length > 0) {
            setResult('lenient');
        } else if (safeRedacted.length > 1) {
            setResult('strict');
        } else {
            setResult('perfect');
        }
        setSubmitted(true);
    };

    const reset = () => {
        setRedactedIds(new Set());
        setSubmitted(false);
        setResult(null);
    };

    return (
        <div className="my-12 max-w-2xl mx-auto font-sans">
            <div className="bg-stone-100 p-6 rounded-lg shadow-sm border border-stone-200 relative overflow-hidden">

                {/* Header / Context */}
                <div className="mb-6 border-b border-stone-300 pb-4">
                    <h3 className="text-lg font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-800 rounded-full animate-pulse"></span>
                        Sensurkontoret - Instruks
                    </h3>
                    <p className="text-stone-600 mt-2 text-sm leading-relaxed">
                        Du er militærsensor. Svartsladd setninger som kan svekke moralen eller avsløre hemmeligheter.
                        Klikk på teksten for å bruke tusjen. Trykk "Godkjenn" når du er ferdig.
                    </p>
                </div>

                {/* The Letter */}
                <div
                    className="bg-[#f4e4bc] p-8 shadow-inner relative font-mono text-stone-900 leading-loose text-lg"
                    style={{
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")', // Fallback/Subtle noise
                        fontFamily: '"Courier Prime", Courier, monospace'
                    }}
                >
                    {/* Stamp */}
                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 2, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: -12 }}
                            className={`absolute top-10 right-10 text-4xl border-4 font-bold p-2 uppercase opacity-80 z-20 pointer-events-none transform -rotate-12 mix-blend-multiply
                 ${result === 'perfect' ? 'border-green-700 text-green-700' : 'border-red-800 text-red-800'}
               `}
                        >
                            {result === 'perfect' ? 'GODKJENT' : 'AVVIST'}
                        </motion.div>
                    )}

                    {LETTER_SEGMENTS.map((segment) => (
                        <div
                            key={segment.id}
                            onClick={() => toggleRedaction(segment.id)}
                            className={`
                relative inline text-justify cursor-pointer transition-colors duration-200 select-none mr-2
                ${!submitted && !redactedIds.has(segment.id) ? 'hover:bg-yellow-200/50 rounded px-1 -mx-1' : ''}
              `}
                            title={submitted ? "" : "Klikk for å sladde"}
                        >
                            <span className="relative z-10">{segment.text}</span>

                            {/* Blackout Animation */}
                            <AnimatePresence>
                                {redactedIds.has(segment.id) && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        exit={{ width: "0%" }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full bg-black z-20 opacity-90 block"
                                        style={{
                                            clipPath: "polygon(0 2%, 100% 0, 98% 100%, 2% 98%)", // Organic marker look
                                            transform: "skewX(-2deg)"
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Controls / Feedback */}
                <div className="mt-6">
                    {!submitted ? (
                        <button
                            onClick={checkResult}
                            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-6 rounded shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-outlined">edit</span> Godkjenn Brev
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border ${FEEDBACK[result!].bg} ${FEEDBACK[result!].border} ${FEEDBACK[result!].color}`}
                        >
                            <h4 className="font-bold flex items-center gap-2 mb-1">
                                {result === 'perfect' ? <Check size={20} /> : result === 'strict' ? <AlertTriangle size={20} /> : <X size={20} />}
                                {FEEDBACK[result!].title}
                            </h4>
                            <p className="text-sm text-stone-800">{FEEDBACK[result!].message}</p>

                            <button
                                onClick={reset}
                                className="mt-4 text-sm underline font-semibold hover:text-stone-900"
                            >
                                Prøv igjen
                            </button>
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
};
