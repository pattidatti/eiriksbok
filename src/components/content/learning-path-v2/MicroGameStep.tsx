import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Loader2 } from 'lucide-react';
import { MICRO_GAMES } from '../../microgames/registry';
import type { StepRendererProps } from './types';
import type { MicroGameProps } from '../../microgames/types';

export const MicroGameStep: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    isAlreadyCompleted,
}) => {
    const id = step.microGameId;
    const entry = id ? MICRO_GAMES[id] : undefined;

    if (!entry) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900">
                <p className="font-semibold mb-1">Mikro-spillet ble ikke funnet.</p>
                <p className="text-sm">
                    Sti-konfigurasjonen refererer til <code>{id ?? '(mangler)'}</code>, men det
                    finnes ikke i registry.
                </p>
            </div>
        );
    }

    const GameComponent = entry.Component as unknown as React.ComponentType<MicroGameProps>;
    const extraProps = (step.microGameProps ?? {}) as Partial<MicroGameProps>;

    if (isAlreadyCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            Mikro-spill fullført
                        </span>
                        <h3 className="font-bold text-slate-900">{entry.title}</h3>
                    </div>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">
                    Du har spilt {entry.title}. Du kan starte det på nytt fra ramme-knappen, eller
                    gå videre til neste steg.
                </p>
                <button
                    onClick={() =>
                        onComplete({ completed: true, score: 1 })
                    }
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                >
                    Gå videre
                </button>
            </motion.div>
        );
    }

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-16 bg-slate-900 text-slate-400 rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Laster {entry.title}...
                </div>
            }
        >
            <GameComponent {...extraProps} onComplete={onComplete} />
        </Suspense>
    );
};
