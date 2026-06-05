import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { GlobalTimelineEvent } from '../../types';
import { COUNTRY_NAMES } from '../../features/infrastruktur/data/countryNames';
import { useAtlasWorld, type GeoFeature } from './useAtlasWorld';
import { recencyAt, FLOOR_OPACITY } from './atlasFade';
import { AtlasCountryTooltip, type CountryTooltipData } from './AtlasCountryTooltip';
import { AtlasPinTooltip, type PinTooltipData } from './AtlasPinTooltip';
import { yearToX, formatYear } from '../../utils/timelineLayout';

const WIDTH = 960;
const HEIGHT = 452;
const MIN_SCALE = 0.6;
const MAX_SCALE = 9;

// Nåtids-avsløring: når eleven scrubber mot vår tid lyser alle land med innhold opp som
// et tetthets-kart (etter antall artikler). I forhistorien er faktoren ~0 og kun den
// ferske «sveipen» av hendelser farger kartet. Slik beholder vi dramaet under avspilling,
// men i nåtid ser eleven HELE verden av innhold — ingen land forsvinner i falming.
const REVEAL_START_YEAR = 1750;
const PRESENT_YEAR = 2025;

// Lyst tema: rolig hav, lyse landmasser, varm glød der historien er aktiv.
const OCEAN = '#eaf2fb';
const LAND_BASE = '#dbe4ee';
const LAND_STROKE = '#c2cedd';
const LAND_HAS_CONTENT = '#cdd9e8';

function smoothstep(a: number, b: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
}

// Varm aktivitets-gradient (kald -> het) for heatmap-fyllet.
function heatColor(intensity: number): string {
    const stops = [
        [219, 228, 238], // base (ingen aktivitet)
        [254, 240, 199], // blek gul
        [253, 200, 120], // gyllen
        [244, 146, 64], // oransje
        [220, 74, 42], // het
    ];
    const t = Math.max(0, Math.min(1, intensity)) * (stops.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = stops[i];
    const b = stops[Math.min(stops.length - 1, i + 1)];
    const mix = (j: number) => Math.round(a[j] + (b[j] - a[j]) * f);
    return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

interface Cluster {
    key: string;
    lat: number;
    lng: number;
    label: string;
    events: { ev: GlobalTimelineEvent; evX: number }[];
    minX: number;
    confidence: 'tag' | 'guess';
}

interface CountryStats {
    name: string;
    articleCount: number; // unike artikler (deduplisert på lenke)
    subjects: { id: string; count: number }[];
    latest?: GlobalTimelineEvent;
    evXs: number[];
    densityNorm: number; // 0..1, log-skalert mot tettest befolkede land
}

interface Transform {
    scale: number;
    x: number;
    y: number;
}

interface RenderedPath {
    id: number;
    name?: string;
    d: string;
}

interface Props {
    events: GlobalTimelineEvent[];
    currentYear: number;
    selectedCountryId: number | null;
    onCountryClick: (countryId: number, name: string) => void;
    onClusterClick: (events: GlobalTimelineEvent[], label: string) => void;
    onRevealAll: () => void;
}

export function AtlasWorldMap({
    events,
    currentYear,
    selectedCountryId,
    onCountryClick,
    onClusterClick,
    onRevealAll,
}: Props) {
    const { geographies, loading } = useAtlasWorld();

    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
    const panRef = useRef({ active: false, startX: 0, startY: 0, startTX: 0, startTY: 0, moved: false });
    const [isPanning, setIsPanning] = useState(false);
    const touchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
    const [hoverId, setHoverId] = useState<number | null>(null);
    const [tooltip, setTooltip] = useState<CountryTooltipData | null>(null);
    const [pinTooltip, setPinTooltip] = useState<PinTooltipData | null>(null);

    const projection = useMemo(
        () => geoNaturalEarth1().scale(190).translate([WIDTH / 2, HEIGHT / 2 + 28]),
        []
    );
    const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

    // Statisk geometri (path-d) beregnes ÉN gang — ikke per frame. Kritisk for Chromebook:
    // ellers ville ~170 geoPath-kall kjørt hver animasjonsramme under avspilling.
    const renderedPaths = useMemo<RenderedPath[]>(() => {
        const out: RenderedPath[] = [];
        for (const geo of geographies as GeoFeature[]) {
            const d = pathGenerator(geo as never);
            if (!d) continue;
            const id = Number(geo.id);
            out.push({ id, name: COUNTRY_NAMES[id] || geo.properties?.name, d });
        }
        return out;
    }, [geographies, pathGenerator]);

    // Klynger (for pins) + rike land-statistikker (for heatmap + tooltip) i ett sveip.
    const { clusters, countryStats } = useMemo(() => {
        const clusterMap = new Map<string, Cluster>();
        const statMap = new Map<number, CountryStats & { links: Set<string>; subj: Map<string, number> }>();

        for (const ev of events) {
            if (typeof ev.lat !== 'number' || typeof ev.lng !== 'number') continue;
            const evX = yearToX(ev.startDate);

            // Pin-klynge (samme koordinat = ett punkt).
            const key = `${ev.lat.toFixed(2)},${ev.lng.toFixed(2)}`;
            let c = clusterMap.get(key);
            if (!c) {
                c = {
                    key,
                    lat: ev.lat,
                    lng: ev.lng,
                    label: ev.placeLabel || 'Ukjent sted',
                    events: [],
                    minX: Infinity,
                    confidence: ev.geoConfidence === 'guess' ? 'guess' : 'tag',
                };
                clusterMap.set(key, c);
            }
            c.events.push({ ev, evX });
            c.minX = Math.min(c.minX, evX);
            if (ev.geoConfidence !== 'guess') c.confidence = 'tag';

            // Land-statistikk.
            if (typeof ev.placeCountryId === 'number') {
                const cid = ev.placeCountryId;
                let s = statMap.get(cid);
                if (!s) {
                    s = {
                        name: COUNTRY_NAMES[cid] || 'Ukjent land',
                        articleCount: 0,
                        subjects: [],
                        latest: undefined,
                        evXs: [],
                        densityNorm: 0,
                        links: new Set<string>(),
                        subj: new Map<string, number>(),
                    };
                    statMap.set(cid, s);
                }
                s.evXs.push(evX);
                if (ev.link && !s.links.has(ev.link)) {
                    s.links.add(ev.link);
                    s.subj.set(ev.subjectId, (s.subj.get(ev.subjectId) || 0) + 1);
                }
                if (!s.latest || ev.startDate > s.latest.startDate) s.latest = ev;
            }
        }

        // Normaliser tetthet (log-skala) og bygg fag-listene.
        let maxCount = 1;
        for (const s of statMap.values()) {
            s.articleCount = s.links.size;
            maxCount = Math.max(maxCount, s.articleCount);
        }
        const denom = Math.log(1 + maxCount);
        const finalStats = new Map<number, CountryStats>();
        for (const [cid, s] of statMap) {
            finalStats.set(cid, {
                name: s.name,
                articleCount: s.articleCount,
                subjects: [...s.subj.entries()]
                    .map(([id, count]) => ({ id, count }))
                    .sort((a, b) => b.count - a.count),
                latest: s.latest,
                evXs: s.evXs,
                densityNorm: denom > 0 ? Math.log(1 + s.articleCount) / denom : 0,
            });
        }

        return { clusters: [...clusterMap.values()], countryStats: finalStats };
    }, [events]);

    const curX = yearToX(currentYear);
    const reveal = smoothstep(REVEAL_START_YEAR, PRESENT_YEAR, currentYear);

    // Effektiv intensitet per land: max(fersk sveip, tetthet × nåtids-avsløring).
    const countryFill = useMemo(() => {
        const m = new Map<number, number>();
        for (const [cid, s] of countryStats) {
            let heat = 0;
            for (const evX of s.evXs) {
                const { visible, recency } = recencyAt(evX, curX);
                if (visible) heat = Math.max(heat, recency);
            }
            m.set(cid, Math.max(heat, s.densityNorm * reveal));
        }
        return m;
    }, [countryStats, curX, reveal]);

    const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

    // Wheel-zoom (non-passive for preventDefault).
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            setTransform((prev) => {
                const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
                const newScale = clampScale(prev.scale * factor);
                const ratio = newScale / prev.scale;
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                return { scale: newScale, x: mx - (mx - prev.x) * ratio, y: my - (my - prev.y) * ratio };
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0) return;
            panRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startTX: transform.x,
                startTY: transform.y,
                moved: false,
            };
            setIsPanning(true);
            setPinTooltip(null);
        },
        [transform.x, transform.y]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Peker-posisjon (for tooltip) oppdateres alltid, ikke bare under panorering.
        if (panRef.current.active) {
            const dx = e.clientX - panRef.current.startX;
            const dy = e.clientY - panRef.current.startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) panRef.current.moved = true;
            setTransform((prev) => ({ ...prev, x: panRef.current.startTX + dx, y: panRef.current.startTY + dy }));
        }
    }, []);

    const stopPan = useCallback(() => {
        panRef.current.active = false;
        setIsPanning(false);
    }, []);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 2) return;
        const [t1, t2] = [e.touches[0], e.touches[1]];
        touchRef.current = {
            dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
            midX: (t1.clientX + t2.clientX) / 2,
            midY: (t1.clientY + t2.clientY) / 2,
        };
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 2 || !touchRef.current) return;
        e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const factor = newDist / touchRef.current.dist;
        const rect = containerRef.current!.getBoundingClientRect();
        const mx = touchRef.current.midX - rect.left;
        const my = touchRef.current.midY - rect.top;
        setTransform((prev) => {
            const newScale = clampScale(prev.scale * factor);
            const ratio = newScale / prev.scale;
            return { scale: newScale, x: mx - (mx - prev.x) * ratio, y: my - (my - prev.y) * ratio };
        });
        touchRef.current.dist = newDist;
    }, []);

    const zoomBy = (factor: number) => {
        setTransform((prev) => {
            const newScale = clampScale(prev.scale * factor);
            const ratio = newScale / prev.scale;
            const rect = containerRef.current?.getBoundingClientRect();
            const cx = rect ? rect.width / 2 : 0;
            const cy = rect ? rect.height / 2 : 0;
            return { scale: newScale, x: cx - (cx - prev.x) * ratio, y: cy - (cy - prev.y) * ratio };
        });
    };
    const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

    // Hover -> bygg tooltip-data i container-koordinater (uavhengig av kart-zoom).
    const handleCountryHover = useCallback(
        (e: React.MouseEvent, id: number, name?: string) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const stats = countryStats.get(id);
            setHoverId(id);
            setTooltip({
                name: name || stats?.name || 'Ukjent',
                articleCount: stats?.articleCount ?? 0,
                subjects: stats?.subjects ?? [],
                latestTitle: stats?.latest?.title,
                latestDate: stats?.latest
                    ? stats.latest.displayDate || formatYear(stats.latest.startDate)
                    : undefined,
                x,
                y,
                flip: x > rect.width * 0.62,
            });
        },
        [countryStats]
    );

    const clearHover = useCallback(() => {
        setHoverId(null);
        setTooltip(null);
    }, []);

    // Pin-hover -> tooltip med stedet og dets synlige hendelser.
    const handlePinHover = useCallback(
        (e: React.MouseEvent, label: string, items: { title: string; date: string }[], extra: number) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setPinTooltip({ label, items, extra, x, y, flip: x > rect.width * 0.62 });
        },
        []
    );

    const clearPinHover = useCallback(() => setPinTooltip(null), []);

    // Pin-radius krymper med zoom så de ikke vokser i hjel.
    const pinScale = 1 / Math.sqrt(transform.scale);
    const hoveredPath = hoverId != null ? renderedPaths.find((p) => p.id === hoverId) : undefined;
    const contentCountryCount = countryStats.size;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden relative touch-none select-none ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ background: OCEAN }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopPan}
            onMouseLeave={() => {
                stopPan();
                clearHover();
                clearPinHover();
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
        >
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                <defs>
                    <filter id="atlas-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#b45309" floodOpacity="0.55" />
                    </filter>
                </defs>

                <rect width={WIDTH} height={HEIGHT} fill={OCEAN} />

                {/* Land */}
                <g>
                    {renderedPaths.map((p, i) => {
                        const stats = countryStats.get(p.id);
                        const hasContent = !!stats;
                        const eff = countryFill.get(p.id) ?? 0;
                        const isSelected = selectedCountryId === p.id;
                        const fill = !hasContent
                            ? LAND_BASE
                            : eff > 0.02
                              ? heatColor(eff)
                              : LAND_HAS_CONTENT;
                        return (
                            <path
                                key={i}
                                d={p.d}
                                fill={fill}
                                stroke={isSelected ? '#b45309' : LAND_STROKE}
                                strokeWidth={isSelected ? 1.4 : 0.4}
                                className={hasContent ? 'cursor-pointer' : undefined}
                                style={{ transition: 'fill 0.4s ease' }}
                                onMouseEnter={
                                    p.name ? (e) => handleCountryHover(e, p.id, p.name) : undefined
                                }
                                onMouseMove={
                                    p.name ? (e) => handleCountryHover(e, p.id, p.name) : undefined
                                }
                                onClick={
                                    hasContent && p.name
                                        ? () => {
                                              if (!panRef.current.moved) onCountryClick(p.id, p.name!);
                                          }
                                        : undefined
                                }
                            />
                        );
                    })}
                </g>

                {/* Uthevet land ved hover (tegnes over for glød + klar kontur) */}
                {hoveredPath && (
                    <path
                        d={hoveredPath.d}
                        fill="none"
                        stroke="#b45309"
                        strokeWidth={1.6 * pinScale}
                        filter="url(#atlas-glow)"
                        style={{ pointerEvents: 'none' }}
                    />
                )}

                {/* Hendelses-pins (akkumulert + fade) */}
                <g>
                    {clusters.map((c) => {
                        const xy = projection([c.lng, c.lat]);
                        if (!xy) return null;
                        let best = -1;
                        let visibleCount = 0;
                        // Synlige hendelser (freshest først) for tooltip.
                        const visible: { title: string; date: string; recency: number }[] = [];
                        for (const e of c.events) {
                            const r = recencyAt(e.evX, curX);
                            if (r.visible) {
                                visibleCount += 1;
                                best = Math.max(best, r.recency);
                                visible.push({
                                    title: e.ev.title,
                                    date: e.ev.displayDate || formatYear(e.ev.startDate),
                                    recency: r.recency,
                                });
                            }
                        }
                        if (best < 0) return null;
                        visible.sort((a, b) => b.recency - a.recency);
                        const tipItems = visible.slice(0, 3).map(({ title, date }) => ({ title, date }));
                        const tipExtra = Math.max(0, visible.length - tipItems.length);
                        const opacity = FLOOR_OPACITY + (1 - FLOOR_OPACITY) * best;
                        const r = (3.2 + best * 4 + Math.min(visibleCount, 6) * 0.5) * pinScale;
                        const hit = Math.max(r, 11 * pinScale);
                        const fresh = best > 0.55;
                        const isGuess = c.confidence === 'guess';
                        const fill = isGuess ? '#94a3b8' : fresh ? '#dc2626' : '#b45309';
                        return (
                            <g
                                key={c.key}
                                transform={`translate(${xy[0]}, ${xy[1]})`}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (panRef.current.moved) return;
                                    onClusterClick(
                                        c.events.map((x) => x.ev),
                                        c.label
                                    );
                                }}
                                onMouseEnter={(e) => handlePinHover(e, c.label, tipItems, tipExtra)}
                                onMouseMove={(e) => handlePinHover(e, c.label, tipItems, tipExtra)}
                                onMouseLeave={clearPinHover}
                            >
                                {/* Usynlig, romslig treff-flate for touch/mus */}
                                <circle r={hit} fill="transparent" />
                                <g style={{ opacity }}>
                                {fresh && (
                                    <circle r={r * 2.1} fill={fill} opacity={0.18}>
                                        <animate
                                            attributeName="r"
                                            values={`${r};${r * 2.6};${r}`}
                                            dur="2.4s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                                <circle r={r} fill={fill} stroke="#fff" strokeWidth={pinScale} />
                                {visibleCount > 1 && best > 0.3 && (
                                    <text
                                        textAnchor="middle"
                                        dy={r * 0.35}
                                        fontSize={r * 0.95}
                                        fontWeight={700}
                                        fill="#fff"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {visibleCount}
                                    </text>
                                )}
                                </g>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Custom tooltip (HTML over SVG for skarp tekst + glass) */}
            <AtlasCountryTooltip data={tooltip} />
            <AtlasPinTooltip data={pinTooltip} />

            {/* Zoom-kontroller */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
                <button
                    onClick={() => zoomBy(1.5)}
                    title="Zoom inn"
                    className="w-9 h-9 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 text-lg leading-none flex items-center justify-center transition-colors"
                >
                    +
                </button>
                <button
                    onClick={() => zoomBy(1 / 1.5)}
                    title="Zoom ut"
                    className="w-9 h-9 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 text-lg leading-none flex items-center justify-center transition-colors"
                >
                    −
                </button>
                <button
                    onClick={resetTransform}
                    title="Tilbakestill"
                    className="w-9 h-9 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 text-lg leading-none flex items-center justify-center transition-colors"
                >
                    ↺
                </button>
            </div>

            {/* Forklaring + «vis alle land» */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                <button
                    onClick={onRevealAll}
                    title="Hopp til nåtid og vis alle land med innhold"
                    className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-amber-700 rounded-lg shadow-sm border border-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Vis alle land ({contentCountryCount})
                </button>
                <div className="bg-white/85 backdrop-blur rounded-lg shadow-sm border border-slate-200 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500">eldre</span>
                        <div
                            className="h-2 w-20 rounded-full"
                            style={{
                                background:
                                    'linear-gradient(90deg, rgb(254,240,199), rgb(253,200,120), rgb(244,146,64), rgb(220,74,42))',
                            }}
                        />
                        <span className="text-[10px] font-medium text-slate-500">nylig</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                    Laster verdenskart …
                </div>
            )}
        </div>
    );
}
