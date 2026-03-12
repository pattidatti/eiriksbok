import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Telegram {
    id: string;
    from: string;
    preview: string;
    correctBucket: 'urgent' | 'wait';
}

interface TelegramGameProps {
    config: {
        onComplete: { nextNodeId: string };
        telegrams: Telegram[];
    };
    onComplete: (results: any) => void;
}

export const TelegramGame: React.FC<TelegramGameProps> = ({ config, onComplete }) => {
    const [sorted, setSorted] = useState<Record<string, 'urgent' | 'wait'>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const sortedCount = Object.keys(sorted).length;
    const allSorted = sortedCount === config.telegrams.length;

    const handleSort = (id: string, bucket: 'urgent' | 'wait') => {
        setSorted((prev) => ({ ...prev, [id]: bucket }));
    };

    const handleSubmit = () => {
        let correct = 0;
        config.telegrams.forEach((t) => {
            if (sorted[t.id] === t.correctBucket) correct++;
        });
        setScore(correct);
        setSubmitted(true);
        setTimeout(() => {
            onComplete({ correct, total: config.telegrams.length });
        }, 2500);
    };

    if (submitted) {
        const pct = score / config.telegrams.length;
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-stone-100 rounded-3xl border border-stone-200">
                <CheckCircle className="text-emerald-600 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                    {score}/{config.telegrams.length} riktig prioritert
                </h3>
                <p className="text-stone-600 text-center text-sm">
                    {pct >= 0.8
                        ? 'Utmerket diplomatisk instinkt — de kritiske meldingene ble fanget opp.'
                        : pct >= 0.5
                          ? 'Noen feilprioritering i kaosen — noen viktige meldinger gikk tapt.'
                          : 'Katastrofal prioritering — de viktigste diplomatiske signalene ble oversett.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-800 text-stone-100 p-5 text-center">
                <Mail className="mx-auto mb-2 opacity-80" size={28} />
                <h2 className="text-xl font-display font-medium tracking-wide">Telegram-triage</h2>
                <p className="text-xs text-stone-400 mt-1">
                    Juli 1914 — Sorter meldingene: hva haster nå?
                </p>
            </div>

            <div className="p-4 space-y-3">
                {config.telegrams.map((telegram, i) => (
                    <motion.div
                        key={telegram.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`p-4 bg-white rounded-2xl border-2 transition-colors ${
                            sorted[telegram.id] === 'urgent'
                                ? 'border-red-300 bg-red-50'
                                : sorted[telegram.id] === 'wait'
                                  ? 'border-stone-300 bg-stone-50'
                                  : 'border-stone-200'
                        }`}
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
                            Fra: {telegram.from}
                        </div>
                        <p className="text-sm text-stone-700 mb-3 leading-relaxed italic">
                            &quot;{telegram.preview}&quot;
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSort(telegram.id, 'urgent')}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                                    sorted[telegram.id] === 'urgent'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                }`}
                            >
                                <AlertTriangle size={11} />
                                Svar umiddelbart
                            </button>
                            <button
                                onClick={() => handleSort(telegram.id, 'wait')}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                                    sorted[telegram.id] === 'wait'
                                        ? 'bg-stone-700 text-white'
                                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                                }`}
                            >
                                <Clock size={11} />
                                Kan vente
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 pt-0">
                <button
                    onClick={handleSubmit}
                    disabled={!allSorted}
                    className="w-full py-3 bg-stone-900 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                    {allSorted
                        ? 'Send instrukser'
                        : `${config.telegrams.length - sortedCount} telegram gjenstår`}
                </button>
            </div>
        </div>
    );
};
