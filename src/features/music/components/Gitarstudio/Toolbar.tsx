import { NOTES_SHARP } from '../../utils/musicTheory';
import { SCALES, SCALE_ORDER, type ScaleFamily } from '../../theory/scaleEngine';
import { GENRES, GENRE_ORDER, type Genre } from '../../audio/genrePresets';
import type { ToneLabel } from './FullFretboard';

interface ToolbarProps {
    rootNote: string;
    scaleFamily: ScaleFamily;
    genre: Genre;
    toneLabel: ToneLabel;
    onRootChange: (root: string) => void;
    onScaleChange: (family: ScaleFamily) => void;
    onGenreChange: (genre: Genre) => void;
    onToneLabelChange: (label: ToneLabel) => void;
    onSaveClick: () => void;
    onLoadClick: () => void;
}

export function Toolbar({
    rootNote,
    scaleFamily,
    genre,
    toneLabel,
    onRootChange,
    onScaleChange,
    onGenreChange,
    onToneLabelChange,
    onSaveClick,
    onLoadClick,
}: ToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
                <Field label="Toneart">
                    <select
                        value={rootNote}
                        onChange={(e) => onRootChange(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                        {NOTES_SHARP.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Skala">
                    <select
                        value={scaleFamily}
                        onChange={(e) => onScaleChange(e.target.value as ScaleFamily)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                        {SCALE_ORDER.map((id) => (
                            <option key={id} value={id}>{SCALES[id].label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Sjanger">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {GENRE_ORDER.map((g) => (
                            <button
                                key={g}
                                onClick={() => onGenreChange(g)}
                                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                    genre === g
                                        ? 'bg-rose-500 text-white shadow'
                                        : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {GENRES[g].label}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="Etiketter">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => onToneLabelChange('note')}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                toneLabel === 'note'
                                    ? 'bg-slate-800 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Noter
                        </button>
                        <button
                            onClick={() => onToneLabelChange('degree')}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                toneLabel === 'degree'
                                    ? 'bg-slate-800 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Intervaller
                        </button>
                    </div>
                </Field>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onLoadClick}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                    Last
                </button>
                <button
                    onClick={onSaveClick}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
                >
                    Lagre
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">{label}</span>
            {children}
        </div>
    );
}
