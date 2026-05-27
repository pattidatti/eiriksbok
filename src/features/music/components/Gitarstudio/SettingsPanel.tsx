import { useState, useRef, useEffect } from 'react';
import type {
    FretboardSize,
    FretCount,
    Handedness,
} from '../../hooks/useGitarstudioSettings';

interface SettingsPanelProps {
    fretboardSize: FretboardSize;
    fretCount: FretCount;
    handedness: Handedness;
    highlightRoot: boolean;
    highlightChord: boolean;
    onFretboardSizeChange: (size: FretboardSize) => void;
    onFretCountChange: (count: FretCount) => void;
    onHandednessChange: (h: Handedness) => void;
    onHighlightRootChange: (v: boolean) => void;
    onHighlightChordChange: (v: boolean) => void;
    onReset: () => void;
}

export function SettingsPanel({
    fretboardSize,
    fretCount,
    handedness,
    highlightRoot,
    highlightChord,
    onFretboardSizeChange,
    onFretCountChange,
    onHandednessChange,
    onHighlightRootChange,
    onHighlightChordChange,
    onReset,
}: SettingsPanelProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors flex items-center gap-1.5 ${
                    open
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                aria-label="Innstillinger"
            >
                <GearIcon />
                <span className="hidden md:inline">Innstillinger</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-4 space-y-4">
                    <SettingRow label="Halsstørrelse">
                        <SegmentedControl
                            value={fretboardSize}
                            options={[
                                { value: 'small', label: 'Liten' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'large', label: 'Stor' },
                            ]}
                            onChange={onFretboardSizeChange}
                        />
                    </SettingRow>

                    <SettingRow label="Antall bånd">
                        <SegmentedControl
                            value={fretCount}
                            options={[
                                { value: 12, label: '12' },
                                { value: 15, label: '15' },
                                { value: 22, label: '22' },
                            ]}
                            onChange={onFretCountChange}
                        />
                    </SettingRow>

                    <SettingRow label="Hendthet">
                        <SegmentedControl
                            value={handedness}
                            options={[
                                { value: 'right', label: 'Høyre' },
                                { value: 'left', label: 'Venstre' },
                            ]}
                            onChange={onHandednessChange}
                        />
                    </SettingRow>

                    <SettingRow label="Framhev på halsen">
                        <div className="flex flex-col gap-1.5">
                            <ToneToggle
                                color="bg-rose-500 ring-rose-200"
                                label="Grunntone"
                                checked={highlightRoot}
                                onChange={onHighlightRootChange}
                            />
                            <ToneToggle
                                color="bg-amber-300 ring-amber-100"
                                label="Akkord-toner"
                                checked={highlightChord}
                                onChange={onHighlightChordChange}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 px-1">
                            Alle skala-toner vises alltid. Togglene styrer kun farge og pulsering.
                        </p>
                    </SettingRow>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 italic">
                            Lagres automatisk
                        </span>
                        <button
                            onClick={() => {
                                onReset();
                                setOpen(false);
                            }}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                            Nullstill alt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold mb-1.5">
                {label}
            </div>
            {children}
        </div>
    );
}

interface SegmentedControlProps<T extends string | number> {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}

function SegmentedControl<T extends string | number>({ value, options, onChange }: SegmentedControlProps<T>) {
    return (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {options.map((opt) => (
                <button
                    key={String(opt.value)}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 px-2.5 py-1 rounded-md text-sm font-semibold transition-colors ${
                        value === opt.value
                            ? 'bg-white text-slate-800 shadow'
                            : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function ToneToggle({
    color,
    label,
    checked,
    onChange,
}: {
    color: string;
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className={`inline-block w-3.5 h-3.5 rounded-full ring-2 ${color}`} />
                {label}
            </span>
            <SwitchTrack checked={checked} onChange={onChange} />
        </label>
    );
}

function SwitchTrack({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
                checked ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

function GearIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}
