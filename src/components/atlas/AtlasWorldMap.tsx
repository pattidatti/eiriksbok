import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { GlobalTimelineEvent } from '../../types';
import { COUNTRY_NAMES } from '../../features/infrastruktur/data/countryNames';
import { useAtlasWorld, type GeoFeature } from './useAtlasWorld';
import { recencyAt, upcomingAt, FLOOR_OPACITY } from './atlasFade';
import { AtlasCountryTooltip, type CountryTooltipData } from './AtlasCountryTooltip';
import { AtlasPinTooltip, type PinTooltipData } from './AtlasPinTooltip';
import { yearToX, formatYear } from '../../utils/timelineLayout';

const WIDTH = 960;
const HEIGHT = 452;
const MIN_SCALE = 0.6;
const MAX_SCALE = 9;

// Zoom-terskel der stedsnavn dukker opp ved pins.
const LABEL_SCALE = 2.2;
// Hvor lenge en programmatisk kamerareise (fly-til-land / region) varer.
const FLY_MS = 450;

// Faste regioner eleven kan hoppe til. Boksen er lat/lng; vi projiserer hjørnene
// og flyr kamera til utsnittet. «Verden» nullstiller i stedet.
interface RegionPreset {
    id: string;
    label: string;
    box?: { lng: [number, number]; lat: [number, number] };
}
const REGIONS: RegionPreset[] = [
    { id: 'verden', label: 'Verden' },
    { id: 'europa', label: 'Europa', box: { lng: [-12, 42], lat: [34, 71] } },
    { id: 'norden', label: 'Norden', box: { lng: [3, 32], lat: [54, 71] } },
    { id: 'middelhavet', label: 'Middelhavet', box: { lng: [-6, 36], lat: [30, 46] } },
    { id: 'midtosten', label: 'Midtøsten', box: { lng: [25, 63], lat: [12, 42] } },
];

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
    geo: GeoFeature;
}

interface Props {
    events: GlobalTimelineEvent[];
    currentYear: number;
    playing: boolean;
    selectedCountryId: number | null;
    onCountryClick: (countryId: number, name: string) => void;
    onClusterClick: (events: GlobalTimelineEvent[], label: string) => void;
    onRevealAll: () => void;
}

export function AtlasWorldMap({
    events,
    currentYear,
    playing,
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
    // To-finger pinch (dist/mid) ELLER én-finger pan (single).
    const touchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
    // Myk overgang kun under programmatiske kamerareiser (fly-til-land / region).
    const [animating, setAnimating] = useState(false);
    const flyTimerRef = useRef<number | null>(null);
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
            out.push({ id, name: COUNTRY_NAMES[id] || geo.properties?.name, d, geo });
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
            setAnimating(false);
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
            setAnimating(false);
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

    const onTouchStart = useCallback(
        (e: React.TouchEvent) => {
            setAnimating(false);
            if (e.touches.length === 2) {
                // To-finger pinch-zoom.
                const [t1, t2] = [e.touches[0], e.touches[1]];
                touchRef.current = {
                    dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
                    midX: (t1.clientX + t2.clientX) / 2,
                    midY: (t1.clientY + t2.clientY) / 2,
                };
                panRef.current.active = false;
            } else if (e.touches.length === 1) {
                // Én-finger pan (gjenbruker panRef-mønsteret fra mus).
                const t = e.touches[0];
                touchRef.current = null;
                panRef.current = {
                    active: true,
                    startX: t.clientX,
                    startY: t.clientY,
                    startTX: transform.x,
                    startTY: transform.y,
                    moved: false,
                };
                setPinTooltip(null);
            }
        },
        [transform.x, transform.y]
    );

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        // To-finger pinch-zoom.
        if (e.touches.length === 2 && touchRef.current) {
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
            return;
        }
        // Én-finger pan.
        if (e.touches.length === 1 && panRef.current.active) {
            const t = e.touches[0];
            const dx = t.clientX - panRef.current.startX;
            const dy = t.clientY - panRef.current.startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) panRef.current.moved = true;
            setTransform((prev) => ({ ...prev, x: panRef.current.startTX + dx, y: panRef.current.startTY + dy }));
        }
    }, []);

    const onTouchEnd = useCallback(() => {
        panRef.current.active = false;
        touchRef.current = null;
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
    // Start en myk kamerareise: slå på transform-transisjon og rydd den etter FLY_MS.
    const beginFly = useCallback(() => {
        setAnimating(true);
        if (flyTimerRef.current) window.clearTimeout(flyTimerRef.current);
        flyTimerRef.current = window.setTimeout(() => setAnimating(false), FLY_MS);
    }, []);

    const resetTransform = useCallback(() => {
        beginFly();
        setTransform({ scale: 1, x: 0, y: 0 });
    }, [beginFly]);

    // Fly kamera til en projisert bbox ([[x0,y0],[x1,y1]] i viewBox-rommet).
    const flyToBounds = useCallback(
        (b: [[number, number], [number, number]]) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            // preserveAspectRatio="xMidYMid slice": viewBox-px -> container-base-px ved transform {1,0,0}.
            const baseScale = Math.max(rect.width / WIDTH, rect.height / HEIGHT);
            const offX = (rect.width - WIDTH * baseScale) / 2;
            const offY = (rect.height - HEIGHT * baseScale) / 2;
            const toBase = (vx: number, vy: number) => [vx * baseScale + offX, vy * baseScale + offY];
            const [bx0, by0] = toBase(b[0][0], b[0][1]);
            const [bx1, by1] = toBase(b[1][0], b[1][1]);
            const bw = Math.max(1, bx1 - bx0);
            const bh = Math.max(1, by1 - by0);
            const cc = { x: (bx0 + bx1) / 2, y: (by0 + by1) / 2 };
            // 0.78 gir litt luft rundt utsnittet.
            const S = clampScale(0.78 * Math.min(rect.width / bw, rect.height / bh));
            beginFly();
            setTransform({ scale: S, x: rect.width / 2 - cc.x * S, y: rect.height / 2 - cc.y * S });
        },
        [beginFly]
    );

    const flyToFeature = useCallback(
        (geo: GeoFeature) => {
            const b = pathGenerator.bounds(geo as never) as [[number, number], [number, number]];
            if (!b || !Number.isFinite(b[0][0])) return;
            flyToBounds(b);
        },
        [pathGenerator, flyToBounds]
    );

    const flyToRegion = useCallback(
        (region: RegionPreset) => {
            if (!region.box) {
                resetTransform();
                return;
            }
            const { lng, lat } = region.box;
            const corners: [number, number][] = [
                [lng[0], lat[0]],
                [lng[1], lat[0]],
                [lng[1], lat[1]],
                [lng[0], lat[1]],
            ];
            let x0 = Infinity,
                y0 = Infinity,
                x1 = -Infinity,
                y1 = -Infinity;
            for (const c of corners) {
                const p = projection(c);
                if (!p) continue;
                x0 = Math.min(x0, p[0]);
                y0 = Math.min(y0, p[1]);
                x1 = Math.max(x1, p[0]);
                y1 = Math.max(y1, p[1]);
            }
            if (!Number.isFinite(x0)) return;
            flyToBounds([
                [x0, y0],
                [x1, y1],
            ]);
        },
        [projection, flyToBounds, resetTransform]
    );

    // Rydd fly-timeren ved unmount.
    useEffect(() => {
        return () => {
            if (flyTimerRef.current) window.clearTimeout(flyTimerRef.current);
        };
    }, []);

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
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
        >
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                    transition: animating ? `transform ${FLY_MS}ms ease` : 'none',
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
                                style={{ transition: playing ? 'none' : 'fill 0.4s ease' }}
                                onMouseEnter={
                                    p.name ? (e) => handleCountryHover(e, p.id, p.name) : undefined
                                }
                                onMouseMove={
                                    p.name ? (e) => handleCountryHover(e, p.id, p.name) : undefined
                                }
                                onMouseLeave={p.name ? clearHover : undefined}
                                onClick={
                                    hasContent && p.name
                                        ? () => {
                                              if (panRef.current.moved) return;
                                              flyToFeature(p.geo);
                                              onCountryClick(p.id, p.name!);
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
                        let upcomingNear = 0; // sterkeste "på vei"-hendelse (0 = ingen)
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
                            } else {
                                const u = upcomingAt(e.evX, curX);
                                if (u.upcoming) upcomingNear = Math.max(upcomingNear, u.nearness);
                            }
                        }
                        // Ingenting synlig ennå: vis en svak, stiplet "kommer snart"-ring om noe nærmer seg.
                        if (best < 0) {
                            if (upcomingNear <= 0) return null;
                            const gr = 3 * pinScale;
                            return (
                                <g key={c.key} transform={`translate(${xy[0]}, ${xy[1]})`} style={{ pointerEvents: 'none' }}>
                                    <circle
                                        r={gr}
                                        fill="none"
                                        stroke="#94a3b8"
                                        strokeWidth={pinScale}
                                        strokeDasharray={`${1.6 * pinScale} ${1.6 * pinScale}`}
                                        opacity={0.2 + 0.45 * upcomingNear}
                                    />
                                </g>
                            );
                        }
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
                                {/* Stedsnavn ved nær zoom (kun trygge tag-plasseringer) */}
                                {transform.scale >= LABEL_SCALE && c.confidence === 'tag' && (
                                    <text
                                        x={r + 2.5 * pinScale}
                                        y={1.2 * pinScale}
                                        fontSize={9 * pinScale}
                                        fontWeight={600}
                                        fill="#1e293b"
                                        stroke="#fff"
                                        strokeWidth={2.4 * pinScale}
                                        style={{ paintOrder: 'stroke', pointerEvents: 'none' }}
                                    >
                                        {c.label}
                                    </text>
                                )}
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

            {/* Region-snarveier */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur rounded-lg shadow-sm border border-slate-200 px-1.5 py-1">
                {REGIONS.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => flyToRegion(region)}
                        title={`Vis ${region.label}`}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                        {region.label}
                    </button>
                ))}
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
