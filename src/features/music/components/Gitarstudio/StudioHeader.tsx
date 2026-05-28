import { Link } from 'react-router-dom';
import { Link2, Unlink2 } from 'lucide-react';
import { NOTES_SHARP } from '../../utils/musicTheory';
import { SCALES, SCALE_ORDER, type ScaleFamily } from '../../theory/scaleEngine';
import { GENRES, GENRE_ORDER, type Genre } from '../../audio/genrePresets';
import type { ToneLabel } from './FullFretboard';

interface StudioCommandBarProps {
    rootNote: string;
    chordScale: ScaleFamily;
    fretboardScale: ScaleFamily;
    scalesLinked: boolean;
    genre: Genre;
    isPlaying: boolean;
    toneLabel: ToneLabel;
    onRootChange: (root: string) => void;
    onChordScaleChange: (family: ScaleFamily) => void;
    onFretboardScaleChange: (family: ScaleFamily) => void;
    onToggleScalesLinked: () => void;
    onGenreChange: (genre: Genre) => void;
    onToneLabelChange: (label: ToneLabel) => void;
    rightSlot?: React.ReactNode;
}

export function StudioCommandBar({
    rootNote,
    chordScale,
    fretboardScale,
    scalesLinked,
    genre,
    isPlaying,
    toneLabel,
    onRootChange,
    onChordScaleChange,
    onFretboardScaleChange,
    onToggleScalesLinked,
    onGenreChange,
    onToneLabelChange,
    rightSlot,
}: StudioCommandBarProps) {
    return (
        <div className="flex items-center gap-3 px-4 h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 shrink-0">
            {/* Brand */}
            <Link
                to="/musikk"
                className="flex items-center gap-2 group shrink-0"
                aria-label="Tilbake til Musikk"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <GuitarIcon />
                </div>
                <span className="text-white font-bold tracking-tight text-sm hidden sm:inline">
                    Gitarstudio
                </span>
            </Link>

            <div className="h-6 w-px bg-slate-700 shrink-0" />

            {/* Toneart */}
            <ControlGroup label="Toneart">
                <select
                    value={rootNote}
                    onChange={(e) => onRootChange(e.target.value)}
                    className="bg-transparent text-white text-sm font-bold cursor-pointer focus:outline-none"
                >
                    {NOTES_SHARP.map((n) => (
                        <option key={n} value={n} className="bg-slate-800 text-white">
                            {n}
                        </option>
                    ))}
                </select>
            </ControlGroup>

            {/* Akkord-skala */}
            <ControlGroup label="Akkord-skala" wide>
                <select
                    value={chordScale}
                    onChange={(e) => onChordScaleChange(e.target.value as ScaleFamily)}
                    className="bg-transparent text-white text-sm font-semibold cursor-pointer focus:outline-none"
                >
                    {SCALE_ORDER.map((id) => (
                        <option key={id} value={id} className="bg-slate-800 text-white">
                            {SCALES[id].label}
                        </option>
                    ))}
                </select>
            </ControlGroup>

            {/* Lenke-knapp */}
            <button
                type="button"
                onClick={onToggleScalesLinked}
                title={
                    scalesLinked
                        ? 'Skalaene følger hverandre - klikk for å frikoble'
                        : 'Skalaene er uavhengige - klikk for å synkronisere'
                }
                aria-pressed={scalesLinked}
                aria-label={scalesLinked ? 'Frikoble skalaer' : 'Synkroniser skalaer'}
                className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                    scalesLinked
                        ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/60 shadow-[0_0_10px_rgba(244,63,94,0.35)]'
                        : 'bg-slate-700/40 text-slate-400 hover:text-slate-200'
                }`}
            >
                {scalesLinked ? <Link2 size={14} /> : <Unlink2 size={14} />}
            </button>

            {/* Gripebrett-skala */}
            <ControlGroup label="Gripebrett-skala" wide>
                <select
                    value={fretboardScale}
                    onChange={(e) => onFretboardScaleChange(e.target.value as ScaleFamily)}
                    className="bg-transparent text-white text-sm font-semibold cursor-pointer focus:outline-none"
                >
                    {SCALE_ORDER.map((id) => (
                        <option key={id} value={id} className="bg-slate-800 text-white">
                            {SCALES[id].label}
                        </option>
                    ))}
                </select>
            </ControlGroup>

            <div className="h-6 w-px bg-slate-700 shrink-0" />

            {/* Sjanger */}
            <ControlGroup label="Sjanger">
                <DarkSegmented
                    value={genre}
                    options={GENRE_ORDER.map((g) => ({ value: g, label: GENRES[g].label }))}
                    onChange={onGenreChange}
                    accent="rose"
                />
            </ControlGroup>

            <div className="h-6 w-px bg-slate-700 shrink-0" />

            {/* Etiketter */}
            <ControlGroup label="Etiketter">
                <DarkSegmented
                    value={toneLabel}
                    options={[
                        { value: 'note', label: 'Noter' },
                        { value: 'degree', label: 'Intervaller' },
                    ]}
                    onChange={onToneLabelChange}
                    accent="slate"
                />
            </ControlGroup>

            {/* Playing indicator */}
            <div className="flex items-center ml-auto shrink-0">
                <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                        isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                />
            </div>

            {rightSlot && (
                <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
            )}
        </div>
    );
}

function ControlGroup({
    label,
    wide,
    children,
}: {
    label: string;
    wide?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`flex flex-col justify-center ${wide ? 'min-w-[120px]' : ''}`}>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-0.5">
                {label}
            </span>
            {children}
        </div>
    );
}

interface DarkSegmentedProps<T extends string> {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
    accent: 'rose' | 'slate';
}

function DarkSegmented<T extends string>({
    value,
    options,
    onChange,
    accent,
}: DarkSegmentedProps<T>) {
    const activeClass =
        accent === 'rose' ? 'bg-rose-500 text-white' : 'bg-slate-600 text-white';
    return (
        <div className="flex gap-0.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${
                        value === opt.value ? activeClass : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function GuitarIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11.9 12.1 17 7l3-3 1 1-3 3-5.1 5.1" />
            <path d="M11.5 14a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
            <path d="m6 12 6 6" />
            <path d="m18 8 1 1" />
        </svg>
    );
}
