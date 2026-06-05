import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Link2, Check } from 'lucide-react';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { useLayout } from '../context/LayoutContext';
import { AtlasWorldMap } from '../components/atlas/AtlasWorldMap';
import { AtlasTimeline } from '../components/atlas/AtlasTimeline';
import { AtlasEventPanel } from '../components/atlas/AtlasEventPanel';
import { AtlasSubjectFilter } from '../components/atlas/AtlasSubjectFilter';
import { TOTAL_WIDTH, yearToX, xToYear } from '../utils/timelineLayout';
import type { GlobalTimelineEvent } from '../types';

// Hvor fort avspillingen beveger seg langs tidslinje-layouten (piksler/sekund ved 1×).
// ~340 px/s gir en gjennomspilling av hele historien på rundt ett minutt.
const BASE_PX_PER_SEC = 340;
// Avspilling starter her (ikke -200000 — den tomme forhistorien ville kjedet eleven).
const PLAY_START_YEAR = -3500;
const PRESENT_YEAR = 2025;

// Tidslinje-grenser i år (for tastatur-clamping).
const MIN_YEAR = xToYear(0);
const MAX_YEAR = xToYear(TOTAL_WIDTH);

export function AtlasPage() {
    const { events, loading } = useGlobalTimeline();
    const { setHideHeader } = useLayout();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initial år fra URL (?year=793), ellers nåtid.
    const [currentYear, setCurrentYear] = useState(() => {
        const y = Number(searchParams.get('year'));
        return Number.isFinite(y) && y !== 0 ? y : PRESENT_YEAR;
    });
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
    const [panel, setPanel] = useState<{ title: string; events: GlobalTimelineEvent[] } | null>(null);

    // null = alle fag på. En Set = bare disse fagene vises.
    const [activeSubjects, setActiveSubjects] = useState<Set<string> | null>(() => {
        const fag = searchParams.get('fag');
        return fag ? new Set(fag.split(',').filter(Boolean)) : null;
    });
    const [copied, setCopied] = useState(false);

    // curX speiler currentYear i piksel-domenet — avspillingen beveger curX jevnt.
    const curXRef = useRef(yearToX(currentYear));
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);

    useEffect(() => {
        setHideHeader(true);
        return () => setHideHeader(false);
    }, [setHideHeader]);

    // Fag som finnes i datasettet (for filter-chipsene).
    const availableSubjects = useMemo(() => {
        const s = new Set<string>();
        for (const e of events) s.add(e.subjectId);
        return [...s];
    }, [events]);

    // Events filtrert på aktive fag (null = alle).
    const visibleEvents = useMemo(
        () => (activeSubjects ? events.filter((e) => activeSubjects.has(e.subjectId)) : events),
        [events, activeSubjects]
    );

    // Sorterte, unike event-år (for hopp forrige/neste).
    const eventYears = useMemo(() => {
        const s = new Set<number>();
        for (const e of visibleEvents) s.add(e.startDate);
        return [...s].sort((a, b) => a - b);
    }, [visibleEvents]);

    const scrub = useCallback((year: number) => {
        const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
        curXRef.current = yearToX(clamped);
        setCurrentYear(clamped);
    }, []);

    const togglePlay = useCallback(() => {
        setPlaying((p) => {
            const next = !p;
            // Starter eleven avspilling mens vi står i nåtid (siste ~10 % av tidslinjen),
            // spoler vi tilbake til starten så hele historien kan rulle. Står vi parkert
            // tidligere (eleven har scrubbet til et punkt), fortsetter vi derfra.
            if (next && curXRef.current >= TOTAL_WIDTH * 0.9) {
                curXRef.current = yearToX(PLAY_START_YEAR);
                setCurrentYear(PLAY_START_YEAR);
            }
            return next;
        });
    }, []);

    // Avspillingsløkke.
    useEffect(() => {
        if (!playing) {
            lastTsRef.current = null;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }
        const tick = (ts: number) => {
            if (lastTsRef.current == null) lastTsRef.current = ts;
            const dt = (ts - lastTsRef.current) / 1000;
            lastTsRef.current = ts;
            curXRef.current += BASE_PX_PER_SEC * speed * dt;
            if (curXRef.current >= TOTAL_WIDTH) {
                curXRef.current = TOTAL_WIDTH;
                setCurrentYear(xToYear(TOTAL_WIDTH));
                setPlaying(false);
                return;
            }
            setCurrentYear(xToYear(curXRef.current));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing, speed]);

    // Hopp til forrige/neste hendelse (stopper avspilling).
    const jumpToNext = useCallback(() => {
        const next = eventYears.find((y) => y > currentYear);
        if (next === undefined) return;
        setPlaying(false);
        scrub(next);
    }, [eventYears, currentYear, scrub]);

    const jumpToPrev = useCallback(() => {
        let prev: number | undefined;
        for (const y of eventYears) {
            if (y < currentYear) prev = y;
            else break;
        }
        if (prev === undefined) return;
        setPlaying(false);
        scrub(prev);
    }, [eventYears, currentYear, scrub]);

    const hasNext = eventYears.length > 0 && currentYear < eventYears[eventYears.length - 1];
    const hasPrev = eventYears.length > 0 && currentYear > eventYears[0];

    const handleCountryClick = useCallback(
        (countryId: number, name: string) => {
            setSelectedCountryId(countryId);
            const matched = visibleEvents.filter((e) => e.placeCountryId === countryId);
            setPanel({ title: name, events: matched });
        },
        [visibleEvents]
    );

    const handleClusterClick = useCallback((clusterEvents: GlobalTimelineEvent[], label: string) => {
        setSelectedCountryId(null);
        setPanel({ title: label, events: clusterEvents });
    }, []);

    const closePanel = useCallback(() => {
        setPanel(null);
        setSelectedCountryId(null);
    }, []);

    // «Vis alle land»: stopp avspilling og hopp til nåtid, der nåtids-avsløringen lyser
    // opp hvert land med innhold.
    const revealAll = useCallback(() => {
        setPlaying(false);
        scrub(PRESENT_YEAR);
    }, [scrub]);

    const toggleSubject = useCallback(
        (id: string) => {
            setActiveSubjects((prev) => {
                const base = prev ?? new Set(availableSubjects);
                const next = new Set(base);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                // Lukk panelet — innholdet kan nå være filtrert bort.
                setPanel(null);
                setSelectedCountryId(null);
                // Alle på igjen → tilbake til null (renere URL).
                if (next.size === availableSubjects.length) return null;
                return next;
            });
        },
        [availableSubjects]
    );

    // Tastatur-styring. Refs for å unngå stale closures uten å re-binde lytteren ofte.
    const stateRef = useRef({ currentYear, jumpToNext, jumpToPrev, togglePlay, scrub });
    stateRef.current = { currentYear, jumpToNext, jumpToPrev, togglePlay, scrub };
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            const s = stateRef.current;
            const step = e.shiftKey ? 10 : 1;
            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    s.scrub(s.currentYear + step);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    s.scrub(s.currentYear - step);
                    break;
                case ' ':
                    e.preventDefault();
                    s.togglePlay();
                    break;
                case '.':
                case ']':
                    e.preventDefault();
                    s.jumpToNext();
                    break;
                case ',':
                case '[':
                    e.preventDefault();
                    s.jumpToPrev();
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Synk tilstand til URL — men ikke hver frame under avspilling (kun når parkert).
    useEffect(() => {
        if (playing) return;
        const next = new URLSearchParams(searchParams);
        next.set('year', String(Math.round(currentYear)));
        if (activeSubjects) next.set('fag', [...activeSubjects].sort().join(','));
        else next.delete('fag');
        setSearchParams(next, { replace: true });
        // searchParams med vilje utelatt: vi vil ikke fyre på vår egen skriving.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentYear, activeSubjects, playing, setSearchParams]);

    const copyLink = useCallback(() => {
        navigator.clipboard?.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    }, []);

    const activeSet = activeSubjects ?? new Set(availableSubjects);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Topplinje */}
            <header className="flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur border-b border-slate-200 flex-shrink-0 z-20 gap-3">
                <div className="flex items-center gap-3">
                    <Link to="/" className="text-slate-400 hover:text-slate-700 transition-colors" title="Til forsiden">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-none text-slate-800">Verdensatlas</h1>
                        <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                            Dra tidslinjen eller spill av for å se hvor historien skjer
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyLink}
                        title="Kopier lenke til dette tidspunktet"
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={14} /> : <Link2 size={14} />}
                        <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopier lenke'}</span>
                    </button>
                    <Link
                        to="/tidslinje"
                        className="text-xs font-semibold text-amber-700 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Klassisk tidslinje →
                    </Link>
                </div>
            </header>

            {/* Kart */}
            <div className="flex-1 relative min-h-0">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        Laster historien …
                    </div>
                ) : (
                    <>
                        <AtlasWorldMap
                            events={visibleEvents}
                            currentYear={currentYear}
                            playing={playing}
                            selectedCountryId={selectedCountryId}
                            onCountryClick={handleCountryClick}
                            onClusterClick={handleClusterClick}
                            onRevealAll={revealAll}
                        />
                        <AtlasSubjectFilter
                            available={availableSubjects}
                            active={activeSet}
                            onToggle={toggleSubject}
                        />
                    </>
                )}
                <AtlasEventPanel
                    title={panel?.title ?? null}
                    events={panel?.events ?? []}
                    onClose={closePanel}
                />
            </div>

            {/* Tidslinje-kontroll */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur border-t border-slate-200 z-20">
                <AtlasTimeline
                    currentYear={currentYear}
                    onScrub={scrub}
                    playing={playing}
                    onTogglePlay={togglePlay}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    onJumpPrev={jumpToPrev}
                    onJumpNext={jumpToNext}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                />
            </div>
        </div>
    );
}
