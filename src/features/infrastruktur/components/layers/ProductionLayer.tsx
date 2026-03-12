
import type { GeoProjection } from 'd3-geo';
import { productionSites } from '../../data/productionSites';
import { useAtlasStore } from '../../store/atlasStore';
import type { ProductionSite } from '../../types';

interface HoverInfo {
    label: string;
    stat: string;
}

interface Props {
    projection: GeoProjection;
    zoomScale: number;
    onHover: (info: HoverInfo | null, x: number, y: number) => void;
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

export function ProductionLayer({ projection, zoomScale, onHover }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);
    const setCompareFeature = useAtlasStore((s) => s.setCompareFeature);
    const selectedCountry = useAtlasStore((s) => s.selectedCountry);

    return (
        <g>
            {productionSites.map((site) => {
                const pos = projection(site.coordinates);
                if (!pos) return null;
                const [x, y] = pos;
                const r = Math.max(2, getRadius(site.mbpd) / Math.sqrt(zoomScale));
                const color = TYPE_COLORS[site.type] ?? '#f97316';
                const dimmed = selectedCountry != null && site.country !== selectedCountry;

                return (
                    <g
                        key={site.id}
                        transform={`translate(${x},${y})`}
                        className="cursor-pointer"
                        onClick={(e) => {
                            if (e.shiftKey) setCompareFeature({ type: 'production', data: site as ProductionSite });
                            else setSelectedFeature({ type: 'production', data: site as ProductionSite });
                        }}
                        onMouseEnter={(e) =>
                            onHover(
                                { label: site.name, stat: `${site.mbpd} mill. fat/dag` },
                                e.clientX,
                                e.clientY
                            )
                        }
                        onMouseLeave={() => onHover(null, 0, 0)}
                    >
                        <circle
                            r={r}
                            fill={color}
                            fillOpacity={dimmed ? 0.1 : 0.75}
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
