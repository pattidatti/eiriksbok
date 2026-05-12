import React, { useMemo } from 'react';
import { Search, X, ArrowUpDown, Link2 } from 'lucide-react';
import { getSubjectColor, SUBJECT_COLORS } from '../../utils/subjectColors';
import type { GlobalTimelineEvent } from '../../types';

export type SortOrder = 'asc' | 'desc';

export interface TimelineFiltersState {
    query: string;
    subjects: string[];
    tags: string[];
    sort: SortOrder;
    showConnections: boolean;
}

interface TimelineFiltersProps {
    events: GlobalTimelineEvent[];
    state: TimelineFiltersState;
    onChange: (next: TimelineFiltersState) => void;
    onReset: () => void;
    resultCount: number;
    totalCount: number;
}

const MAX_TAG_CHIPS = 12;

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
    events,
    state,
    onChange,
    onReset,
    resultCount,
    totalCount,
}) => {
    const availableSubjects = useMemo(() => {
        const counts = new Map<string, number>();
        for (const e of events) {
            counts.set(e.subjectId, (counts.get(e.subjectId) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({ id, count }));
    }, [events]);

    const topTags = useMemo(() => {
        const counts = new Map<string, number>();
        for (const e of events) {
            if (!Array.isArray(e.tags)) continue;
            for (const tag of e.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_TAG_CHIPS)
            .map(([tag]) => tag);
    }, [events]);

    const toggleSubject = (id: string) => {
        const next = state.subjects.includes(id)
            ? state.subjects.filter((s) => s !== id)
            : [...state.subjects, id];
        onChange({ ...state, subjects: next });
    };

    const toggleTag = (tag: string) => {
        const next = state.tags.includes(tag)
            ? state.tags.filter((t) => t !== tag)
            : [...state.tags, tag];
        onChange({ ...state, tags: next });
    };

    const hasActiveFilters =
        state.query.trim() !== '' ||
        state.subjects.length > 0 ||
        state.tags.length > 0;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 sm:p-4 space-y-3">
            {/* Top row: search + sort + samtidighet */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="search"
                        value={state.query}
                        onChange={(e) => onChange({ ...state, query: e.target.value })}
                        placeholder="Søk i tittel, beskrivelse, tagger..."
                        className="w-full pl-9 pr-9 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                        aria-label="Søk i tidslinjen"
                    />
                    {state.query && (
                        <button
                            type="button"
                            onClick={() => onChange({ ...state, query: '' })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label="Tøm søk"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onChange({ ...state, sort: state.sort === 'asc' ? 'desc' : 'asc' })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-full border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                    title="Bytt sortering"
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {state.sort === 'asc' ? 'Eldst først' : 'Nyest først'}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onChange({ ...state, showConnections: !state.showConnections })
                    }
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full border transition-colors ${
                        state.showConnections
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
                    }`}
                    title="Vis koblinger mellom samtidige hendelser på tvers av fag"
                    aria-pressed={state.showConnections}
                >
                    <Link2 className="w-3.5 h-3.5" />
                    Samtidighet
                </button>
            </div>

            {/* Subject chips */}
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Fag
                </span>
                {availableSubjects.map(({ id, count }) => {
                    const color = getSubjectColor(id);
                    const isActive = state.subjects.length === 0 || state.subjects.includes(id);
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => toggleSubject(id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                                isActive
                                    ? `${color.border} ${color.bgSoft} ${color.text}`
                                    : 'border-slate-200 bg-slate-50 text-slate-400 line-through opacity-70'
                            }`}
                            aria-pressed={state.subjects.includes(id)}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                            {SUBJECT_COLORS[id]?.label ?? id}
                            <span className="text-[10px] opacity-70">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tag chips */}
            {topTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                        Tagger
                    </span>
                    {topTags.map((tag) => {
                        const isActive = state.tags.includes(tag);
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                                    isActive
                                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                                aria-pressed={isActive}
                            >
                                #{tag}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Result count + reset */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                    Viser <strong className="text-slate-700">{resultCount}</strong> av{' '}
                    {totalCount} hendelser
                </p>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Nullstill filter
                    </button>
                )}
            </div>
        </div>
    );
};
