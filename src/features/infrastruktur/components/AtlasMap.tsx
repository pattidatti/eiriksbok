import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import { useQuery } from '@tanstack/react-query';
import { useAtlasStore } from '../store/atlasStore';
import { ShippingLanesLayer } from './layers/ShippingLanesLayer';
import { SubmarineLayer } from './layers/SubmarineLayer';
import { PipelineLayer } from './layers/PipelineLayer';
import { ProductionLayer } from './layers/ProductionLayer';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WIDTH = 900;
const HEIGHT = 500;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

async function fetchWorld() {
    const res = await fetch(GEO_URL);
    if (!res.ok) throw new Error('Failed to load world data');
    return res.json();
}

interface Transform {
    scale: number;
    x: number;
    y: number;
}

export function AtlasMap() {
    const activeLayers = useAtlasStore((s) => s.activeLayers);
    const containerRef = useRef<HTMLDivElement>(null);

    const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
    // Store pan start state in a ref to avoid stale closures in mousemove
    const panRef = useRef({ active: false, startX: 0, startY: 0, startTX: 0, startTY: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const { data: worldData } = useQuery({
        queryKey: ['world-atlas'],
        queryFn: fetchWorld,
        staleTime: 24 * 60 * 60 * 1000,
    });

    const geographies = useMemo(() => {
        if (!worldData) return [];
        const countries = topojson.feature(worldData, worldData.objects.countries);
        return (countries as any).features;
    }, [worldData]);

    const projection = useMemo(
        () => geoNaturalEarth1().scale(153).translate([WIDTH / 2, HEIGHT / 2]),
        []
    );
    const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

    const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

    // Zoom toward mouse position using a native non-passive listener so
    // preventDefault() actually blocks browser pinch-zoom (React onWheel is passive).
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            setTransform((prev) => {
                const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
                const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
                const ratio = newScale / prev.scale;
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                return {
                    scale: newScale,
                    x: mouseX - (mouseX - prev.x) * ratio,
                    y: mouseY - (mouseY - prev.y) * ratio,
                };
            });
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []); // containerRef and setTransform are both stable

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0) return;
            panRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startTX: transform.x,
                startTY: transform.y,
            };
            setIsPanning(true);
        },
        [transform.x, transform.y]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!panRef.current.active) return;
        const dx = e.clientX - panRef.current.startX;
        const dy = e.clientY - panRef.current.startY;
        setTransform((prev) => ({
            ...prev,
            x: panRef.current.startTX + dx,
            y: panRef.current.startTY + dy,
        }));
    }, []);

    const stopPan = useCallback(() => {
        panRef.current.active = false;
        setIsPanning(false);
    }, []);

    const zoomBy = (factor: number) => {
        setTransform((prev) => {
            const newScale = clampScale(prev.scale * factor);
            const ratio = newScale / prev.scale;
            const rect = containerRef.current?.getBoundingClientRect();
            const cx = rect ? rect.width / 2 : 0;
            const cy = rect ? rect.height / 2 : 0;
            return {
                scale: newScale,
                x: cx - (cx - prev.x) * ratio,
                y: cy - (cy - prev.y) * ratio,
            };
        });
    };

    const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden rounded-xl bg-[#0f172a] relative touch-none select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopPan}
            onMouseLeave={stopPan}
        >
            {/* CSS transform on the SVG element keeps coordinate math in pixel space */}
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                {/* Ocean background */}
                <rect width={WIDTH} height={HEIGHT} fill="#0f172a" />

                {/* Countries */}
                <g>
                    {geographies.map((geo: any, i: number) => {
                        const d = pathGenerator(geo);
                        return (
                            <path
                                key={i}
                                d={d || ''}
                                fill="#1e293b"
                                stroke="#334155"
                                strokeWidth={0.3}
                            />
                        );
                    })}
                </g>

                {/* Data layers */}
                {activeLayers.has('shipping') && (
                    <ShippingLanesLayer pathGenerator={pathGenerator} />
                )}
                {activeLayers.has('cables') && (
                    <SubmarineLayer pathGenerator={pathGenerator} />
                )}
                {activeLayers.has('pipelines') && (
                    <PipelineLayer pathGenerator={pathGenerator} />
                )}
                {activeLayers.has('production') && (
                    <ProductionLayer projection={projection} />
                )}
            </svg>

            {/* Zoom controls (absolutely positioned over the map) */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-10">
                <button
                    onClick={() => zoomBy(1.5)}
                    className="w-8 h-8 bg-slate-700/90 hover:bg-slate-600 text-white rounded-md text-lg leading-none flex items-center justify-center transition-colors"
                    title="Zoom inn"
                >
                    +
                </button>
                <button
                    onClick={() => zoomBy(1 / 1.5)}
                    className="w-8 h-8 bg-slate-700/90 hover:bg-slate-600 text-white rounded-md text-lg leading-none flex items-center justify-center transition-colors"
                    title="Zoom ut"
                >
                    −
                </button>
                <button
                    onClick={resetTransform}
                    className="w-8 h-8 bg-slate-700/90 hover:bg-slate-600 text-white rounded-md text-sm leading-none flex items-center justify-center transition-colors"
                    title="Tilbakestill"
                >
                    ↺
                </button>
            </div>
        </div>
    );
}
