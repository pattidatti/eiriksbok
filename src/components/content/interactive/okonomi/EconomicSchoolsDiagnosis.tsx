import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScenarioDef {
    id: string;
    label: string;
    description: string;
}

interface SchoolDef {
    id: string;
    name: string;
    color: 'amber' | 'blue' | 'green' | 'purple';
    thinkers: string;
    diagnoses: Record<string, string>;
}

interface EconomicSchoolsDiagnosisProps {
    scenarios: ScenarioDef[];
    schools: SchoolDef[];
}

const colorMap: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
    amber: {
        border: 'border-l-amber-400',
        bg: 'bg-amber-50',
        badge: 'bg-amber-100 text-amber-800',
        dot: 'bg-amber-400',
    },
    blue: {
        border: 'border-l-blue-400',
        bg: 'bg-blue-50',
        badge: 'bg-blue-100 text-blue-800',
        dot: 'bg-blue-400',
    },
    green: {
        border: 'border-l-emerald-400',
        bg: 'bg-emerald-50',
        badge: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-400',
    },
    purple: {
        border: 'border-l-purple-400',
        bg: 'bg-purple-50',
        badge: 'bg-purple-100 text-purple-800',
        dot: 'bg-purple-400',
    },
};

export function EconomicSchoolsDiagnosis({ scenarios, schools }: EconomicSchoolsDiagnosisProps) {
    const [selected, setSelected] = useState(scenarios[0]?.id ?? '');

    const activeScenario = scenarios.find((s) => s.id === selected);

    return (
        <div className="not-prose my-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Interaktiv
            </p>
            <h3 className="mb-1 text-base font-bold text-slate-900">
                Velg en krise — se fire diagnoser
            </h3>
            {activeScenario && (
                <p className="mb-4 text-sm text-slate-500">{activeScenario.description}</p>
            )}

            {/* Scenario buttons */}
            <div className="mb-5 flex flex-wrap gap-2">
                {scenarios.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSelected(s.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                            selected === s.id
                                ? 'bg-slate-800 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* 2x2 card grid */}
            <div className="grid grid-cols-2 gap-3">
                {schools.map((school) => {
                    const c = colorMap[school.color] ?? colorMap.amber;
                    return (
                        <div
                            key={school.id}
                            className={`rounded-xl border-l-4 p-4 ${c.border} ${c.bg}`}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${c.dot}`} />
                                <span className="text-sm font-bold text-slate-800">{school.name}</span>
                            </div>
                            <p className="mb-2 text-xs text-slate-500">{school.thinkers}</p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={selected}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-sm leading-snug text-slate-700"
                                >
                                    {school.diagnoses[selected] ?? '—'}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <p className="mt-3 text-right text-xs text-slate-400">
                Samme krise — fire ulike antakelser om hva som er problemet.
            </p>
        </div>
    );
}
