import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, XCircle, HeartPulse } from 'lucide-react';
import { MiniGameHeader } from './MiniGameHeader';
import type { ChronosEffect } from '../../../data/chronos/types';

interface Patient {
    id: string;
    name: string;
    wound: string;
    age?: string;
    correctBucket: 'treat_now' | 'can_wait' | 'expectant';
}

interface TriageGameProps {
    config: {
        onComplete: { nextNodeId: string };
        treatCapacity: number;
        patients: Patient[];
    };
    onComplete: (results: { effects?: ChronosEffect }) => void;
}

type Bucket = 'treat_now' | 'can_wait' | 'expectant';

const BUCKET_META: Record<Bucket, { label: string; color: string; activeColor: string; icon: React.ReactNode }> = {
    treat_now: {
        label: 'Behandle nå',
        color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
        activeColor: 'bg-red-500 text-white',
        icon: <AlertTriangle size={10} />,
    },
    can_wait: {
        label: 'Kan vente',
        color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
        activeColor: 'bg-amber-500 text-white',
        icon: <Clock size={10} />,
    },
    expectant: {
        label: 'Ingen sjanse',
        color: 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100',
        activeColor: 'bg-stone-600 text-white',
        icon: <XCircle size={10} />,
    },
};

const BORDER_FOR_BUCKET: Record<Bucket, string> = {
    treat_now: 'border-red-300 bg-red-50/50',
    can_wait: 'border-amber-300 bg-amber-50/50',
    expectant: 'border-stone-300 bg-stone-50/50',
};

export const TriageGame: React.FC<TriageGameProps> = ({ config, onComplete }) => {
    const [sorted, setSorted] = useState<Record<string, Bucket>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const sortedCount = Object.keys(sorted).length;
    const allSorted = sortedCount === config.patients.length;
    const treatNowCount = Object.values(sorted).filter((v) => v === 'treat_now').length;

    const handleSort = (id: string, bucket: Bucket) => {
        if (submitted) return;
        if (bucket === 'treat_now' && treatNowCount >= config.treatCapacity && sorted[id] !== 'treat_now') return;
        setSorted((prev) => ({ ...prev, [id]: bucket }));
    };

    const handleSubmit = () => {
        let correct = 0;
        config.patients.forEach((p) => {
            if (sorted[p.id] === p.correctBucket) correct++;
        });
        setScore(correct);
        setSubmitted(true);
        const pct = correct / config.patients.length;
        const effects: ChronosEffect = {};
        if (pct >= 0.8) { effects.moral = 10; effects.kameratskap = 5; }
        else if (pct >= 0.5) { effects.moral = 5; }
        else { effects.moral = -5; effects.overlevelse = -5; }
        setTimeout(() => onComplete({ effects }), 2800);
    };

    if (submitted) {
        const pct = score / config.patients.length;
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-stone-100 rounded-3xl border border-stone-200">
                <HeartPulse className="text-rose-500 mb-1.5" size={24} />
                <h3 className="text-base font-bold text-stone-800 mb-1">
                    {score}/{config.patients.length} riktig prioritert
                </h3>
                <p className="text-stone-600 text-center text-xs leading-relaxed max-w-xs">
                    {pct >= 0.8
                        ? 'Utmerket triage. Legen opererte på grunnlag av din prioritering — de fleste overlevde.'
                        : pct >= 0.5
                          ? 'Noen feilprioritering. Én ressurs ble brukt på feil pasient. Konsekvensene kjenner du ikke ennå.'
                          : 'Kritisk feilprioritering. Triasjesystemet er til for å redde flest mulig — men det forutsetter riktige vurderinger.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <MiniGameHeader icon={HeartPulse} title="Triasje" />

            <div className="p-3 bg-stone-200/60 border-b border-stone-200 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                {(['treat_now', 'can_wait', 'expectant'] as Bucket[]).map((b) => (
                    <div key={b} className="flex items-center gap-1">
                        <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                                b === 'treat_now' ? 'bg-red-500' : b === 'can_wait' ? 'bg-amber-500' : 'bg-stone-500'
                            }`}
                        />
                        {BUCKET_META[b].label}
                        {b === 'treat_now' && (
                            <span className="text-red-600">
                                ({treatNowCount}/{config.treatCapacity})
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-3 space-y-2">
                {config.patients.map((patient, i) => (
                    <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`p-3 bg-white rounded-2xl border-2 transition-colors ${
                            sorted[patient.id] ? BORDER_FOR_BUCKET[sorted[patient.id]] : 'border-stone-200'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                                    {patient.name}
                                    {patient.age ? ` — ${patient.age}` : ''}
                                </span>
                                <p className="text-sm text-stone-700 mt-0.5 leading-snug italic">
                                    {patient.wound}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {(['treat_now', 'can_wait', 'expectant'] as Bucket[]).map((bucket) => {
                                const meta = BUCKET_META[bucket];
                                const isActive = sorted[patient.id] === bucket;
                                const isDisabled =
                                    bucket === 'treat_now' &&
                                    treatNowCount >= config.treatCapacity &&
                                    !isActive;
                                return (
                                    <button
                                        key={bucket}
                                        onClick={() => handleSort(patient.id, bucket)}
                                        disabled={isDisabled}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border ${
                                            isActive
                                                ? meta.activeColor
                                                : isDisabled
                                                  ? 'opacity-30 cursor-not-allowed bg-stone-50 text-stone-400 border-stone-200'
                                                  : meta.color
                                        }`}
                                    >
                                        {meta.icon}
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-3 pt-0">
                <button
                    onClick={handleSubmit}
                    disabled={!allSorted}
                    className="w-full py-2 bg-stone-900 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                    {allSorted
                        ? 'Rapporter til legen'
                        : `${config.patients.length - sortedCount} pasient${config.patients.length - sortedCount === 1 ? '' : 'er'} gjenstår`}
                </button>
            </div>
        </div>
    );
};
