import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { StepRendererProps } from './types';

// Lenker til /oving/tidsreise/:scenarioId i ny fane. Når eleven kommer tilbake,
// markerer hun selv fullføring. (Senere kan dette krokes til
// TimeTravelProfile-kompletterings-flag for ekte verifikasjon.)
export const ScenarioStep: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    isAlreadyCompleted,
}) => {
    const [opened, setOpened] = useState(false);
    const [done, setDone] = useState(isAlreadyCompleted);

    if (!step.scenarioId) {
        return (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-sm">
                Konfigurasjonsfeil: scenario-steg uten scenarioId.
            </div>
        );
    }

    const handleConfirm = () => {
        setDone(true);
        onComplete({ completed: true, externalId: step.scenarioId });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 p-6 md:p-8 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow">
                    <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-700">
                    Tidsreise-scenario
                </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>

            <p className="text-slate-700 leading-relaxed mb-6">
                Du blir sendt inn i et historisk scenario der valgene dine former utfallet. Spill
                gjennom hele scenarioet, og kom tilbake hit etterpå.
            </p>

            <div className="flex flex-wrap gap-3">
                <Link
                    to={`/oving/tidsreise/${step.scenarioId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpened(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow hover:bg-purple-700 transition"
                >
                    {opened ? 'Åpne scenario igjen' : 'Start scenario i ny fane'}
                    <ArrowRight className="w-4 h-4" />
                </Link>

                {opened && !done && (
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Jeg har fullført scenarioet
                    </button>
                )}
            </div>

            {done && (
                <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-900 font-semibold text-sm">
                        Scenario fullført. Klar for neste steg.
                    </span>
                </div>
            )}
        </motion.div>
    );
};
