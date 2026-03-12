import { useMemo, useRef } from 'react';
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

async function fetchWorld() {
    const res = await fetch(GEO_URL);
    if (!res.ok) throw new Error('Failed to load world data');
    return res.json();
}

export function AtlasMap() {
    const activeLayers = useAtlasStore((s) => s.activeLayers);
    const svgRef = useRef<SVGSVGElement>(null);

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

    return (
        <div className="w-full h-full overflow-hidden rounded-xl bg-[#0f172a] relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
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
        </div>
    );
}
