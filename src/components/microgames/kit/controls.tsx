import { useState } from 'react';
import { ArrowRight, Check, X, type LucideIcon } from 'lucide-react';

// Input-widgets som bor UNDER spillvinduet (aldri oppå scenen). Gir rik
// interaksjon utover enkle knapper: kortvalg, stegmåler, kontinuerlig slider og
// verktøypalett. Kombiner fritt med de direkte 3D-primitivene (Interactive,
// Hotspot, Draggable) - knapper og 3D-klikk utelukker ikke hverandre.

export type ChoiceStatus = 'done' | 'active' | 'locked';

export interface ChoiceItem {
    id: string;
    title: string;
    blurb?: string;
    icon?: LucideIcon;
    status: ChoiceStatus;
}

// Vannrett rad med valgkort (referanse: Hamskiftet sine reformkort). Fullførte
// blir grønne, aktivt pulserer, låste er nedtonet.
export function ChoiceRow({
    items,
    onSelect,
}: {
    items: ChoiceItem[];
    onSelect: (id: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {items.map((it) => {
                const Icon = it.icon;
                const done = it.status === 'done';
                const active = it.status === 'active';
                return (
                    <button
                        key={it.id}
                        onClick={() => onSelect(it.id)}
                        disabled={!active}
                        className={`relative text-left rounded-xl border-2 p-3 transition ${
                            done
                                ? 'bg-emerald-50 border-emerald-300'
                                : active
                                  ? 'bg-amber-100 border-amber-400 hover:bg-amber-200 hover:border-amber-500 shadow-sm cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 opacity-55 cursor-not-allowed'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {Icon && (
                                <span
                                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                        done
                                            ? 'bg-emerald-500 text-white'
                                            : active
                                              ? 'bg-amber-500 text-white'
                                              : 'bg-slate-200 text-slate-400'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                    {it.title}
                                </p>
                            </div>
                            {active && (
                                <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
                            )}
                        </div>
                        {it.blurb && (
                            <p className="text-xs text-slate-500 mt-1.5 leading-snug">{it.blurb}</p>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// Liten "Steg X av N" med prikker.
export function StepTracker({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Steg {Math.min(current, total)} av {total}
            </span>
            <div className="flex gap-1">
                {Array.from({ length: total }).map((_, i) => (
                    <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                            i < current ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

// Kontinuerlig slider/spak som styrer scene-tilstand i sanntid (f.eks. vannstand,
// år, temperatur). Gir en helt annen interaksjon enn diskrete knapper.
export function SceneSlider({
    label,
    min,
    max,
    step = 1,
    value,
    onChange,
    valueLabel,
}: {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (v: number) => void;
    valueLabel?: (v: number) => string;
}) {
    return (
        <div className="rounded-xl border-2 border-amber-200 bg-white/70 p-3">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">{label}</span>
                <span className="text-xs font-bold text-amber-700 tabular-nums">
                    {valueLabel ? valueLabel(value) : value}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
            />
        </div>
    );
}

// Aha-sjekk: ett spørsmål som popper akkurat når innsikten lander. Knytter
// interaksjonen til en konkret forståelse, og gir umiddelbar feedback.
//   <SceneQuiz question="Hvorfor flyter det?" options={[...]} answerIndex={1}
//       onResult={(correct) => correct ? score.hit() : score.miss()} />
export function SceneQuiz({
    question,
    options,
    answerIndex,
    explanation,
    onResult,
}: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
    onResult?: (correct: boolean) => void;
}) {
    const [picked, setPicked] = useState<number | null>(null);
    const answered = picked !== null;
    const correct = picked === answerIndex;
    return (
        <div className="rounded-xl border-2 border-amber-200 bg-white p-3">
            <p className="text-sm font-bold text-slate-800 mb-2">{question}</p>
            <div className="grid sm:grid-cols-2 gap-2">
                {options.map((opt, i) => {
                    const isPicked = picked === i;
                    const showCorrect = answered && i === answerIndex;
                    const showWrong = answered && isPicked && i !== answerIndex;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                if (answered) return;
                                setPicked(i);
                                onResult?.(i === answerIndex);
                            }}
                            disabled={answered}
                            className={`flex items-center gap-2 text-left rounded-lg border-2 px-3 py-2 text-sm transition ${
                                showCorrect
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                    : showWrong
                                      ? 'bg-rose-50 border-rose-400 text-rose-900'
                                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700'
                            }`}
                        >
                            {showCorrect && <Check className="w-4 h-4 flex-shrink-0" />}
                            {showWrong && <X className="w-4 h-4 flex-shrink-0" />}
                            {opt}
                        </button>
                    );
                })}
            </div>
            {answered && explanation && (
                <p
                    className={`text-xs mt-2 leading-relaxed ${
                        correct ? 'text-emerald-800' : 'text-slate-600'
                    }`}
                >
                    {explanation}
                </p>
            )}
        </div>
    );
}

// Sammenlign-bryter: la eleven veksle mellom to tilstander (f.eks. for/etter,
// A/B) og se forskjellen direkte i scenen.
export function CompareToggle({
    labelA,
    labelB,
    value,
    onChange,
}: {
    labelA: string;
    labelB: string;
    value: 'a' | 'b';
    onChange: (v: 'a' | 'b') => void;
}) {
    return (
        <div className="inline-flex rounded-xl border-2 border-amber-200 bg-white p-1">
            {(['a', 'b'] as const).map((key) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                        value === key
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-amber-50'
                    }`}
                >
                    {key === 'a' ? labelA : labelB}
                </button>
            ))}
        </div>
    );
}

export interface Tool {
    id: string;
    label: string;
    icon?: LucideIcon;
}

// Verktøypalett: velg et verktøy, klikk så i 3D-scenen for å bruke det (plassere,
// rive, male...). Aktivt verktøy er markert.
export function ToolPalette({
    tools,
    activeId,
    onPick,
}: {
    tools: Tool[];
    activeId: string | null;
    onPick: (id: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {tools.map((t) => {
                const Icon = t.icon;
                const active = t.id === activeId;
                return (
                    <button
                        key={t.id}
                        onClick={() => onPick(t.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition ${
                            active
                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
