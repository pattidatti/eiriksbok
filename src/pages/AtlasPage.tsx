import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { useLayout } from '../context/LayoutContext';
import { AtlasWorldMap } from '../components/atlas/AtlasWorldMap';
import { AtlasTimeline } from '../components/atlas/AtlasTimeline';
import { AtlasEventPanel } from '../components/atlas/AtlasEventPanel';
import { TOTAL_WIDTH, yearToX, xToYear } from '../utils/timelineLayout';
import type { GlobalTimelineEvent } from '../types';

// Hvor fort avspillingen beveger seg langs tidslinje-layouten (piksler/sekund ved 1×).
// ~340 px/s gir en gjennomspilling av hele historien på rundt ett minutt.
const BASE_PX_PER_SEC = 340;
// Avspilling starter her (ikke -200000 — den tomme forhistorien ville kjedet eleven).
const PLAY_START_YEAR = -3500;
const PRESENT_YEAR = 2025;

export function AtlasPage() {
    const { events, loading } = useGlobalTimeline();
    const { setHideHeader } = useLayout();

    const [currentYear, setCurrentYear] = useState(PRESENT_YEAR);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
    const [panel, setPanel] = useState<{ title: string; events: GlobalTimelineEvent[] } | null>(null);

    // curX speiler currentYear i piksel-domenet — avspillingen beveger curX jevnt.
    const curXRef = useRef(yearToX(PRESENT_YEAR));
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);

    useEffect(() => {
        setHideHeader(true);
        return () => setHideHeader(false);
    }, [setHideHeader]);

    const scrub = useCallback((year: number) => {
        curXRef.current = yearToX(year);
        setCurrentYear(year);
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

    const handleCountryClick = useCallback(
        (countryId: number, name: string) => {
            setSelectedCountryId(countryId);
            const matched = events.filter((e) => e.placeCountryId === countryId);
            setPanel({ title: name, events: matched });
        },
        [events]
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
                <Link
                    to="/tidslinje"
                    className="text-xs font-semibold text-amber-700 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Klassisk tidslinje →
                </Link>
            </header>

            {/* Kart */}
            <div className="flex-1 relative min-h-0">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        Laster historien …
                    </div>
                ) : (
                    <AtlasWorldMap
                        events={events}
                        currentYear={currentYear}
                        selectedCountryId={selectedCountryId}
                        onCountryClick={handleCountryClick}
                        onClusterClick={handleClusterClick}
                        onRevealAll={revealAll}
                    />
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
                />
            </div>
        </div>
    );
}
