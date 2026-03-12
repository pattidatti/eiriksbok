
import type { GeoProjection } from 'd3-geo';
import { productionSites } from '../../data/productionSites';
import { useAtlasStore } from '../../store/atlasStore';
import type { ProductionSite } from '../../types';

interface Props {
    projection: GeoProjection;
}

const TYPE_COLORS: Record<string, string> = {
    oil: '#f97316',
    gas: '#a78bfa',
    both: '#facc15',
};

function getRadius(mbpd: number): number {
    if (mbpd <= 0) return 3;
    if (mbpd < 0.3) return 4;
    if (mbpd < 0.8) return 6;
    if (mbpd < 2.0) return 8;
    return 11;
}

export function ProductionLayer({ projection }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    return (
        <g>
            {productionSites.map((site) => {
                const pos = projection(site.coordinates);
                if (!pos) return null;
                const [x, y] = pos;
                const r = getRadius(site.mbpd);
                const color = TYPE_COLORS[site.type] ?? '#f97316';

                return (
                    <g
                        key={site.id}
                        transform={`translate(${x},${y})`}
                        className="cursor-pointer"
                        onClick={() =>
                            setSelectedFeature({ type: 'production', data: site as ProductionSite })
                        }
                    >
                        <circle
                            r={r}
                            fill={color}
                            fillOpacity={0.75}
                            stroke="rgba(0,0,0,0.4)"
                            strokeWidth={0.5}
                            className="hover:fill-white transition-all"
                        />
                    </g>
                );
            })}
        </g>
    );
}
