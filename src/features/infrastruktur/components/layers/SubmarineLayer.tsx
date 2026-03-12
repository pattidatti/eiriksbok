
import type { GeoPath } from 'd3-geo';
import { useSubmarineCables } from '../../hooks/useSubmarineCables';
import { useAtlasStore } from '../../store/atlasStore';
import type { SubmarineCable } from '../../types';

interface HoverInfo {
    label: string;
    stat: string;
}

interface Props {
    pathGenerator: GeoPath;
    zoomScale: number;
    onHover: (info: HoverInfo | null, x: number, y: number) => void;
}

export function SubmarineLayer({ pathGenerator, zoomScale, onHover }: Props) {
    const { data: cables } = useSubmarineCables();
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);
    const setCompareFeature = useAtlasStore((s) => s.setCompareFeature);
    const yearFilter = useAtlasStore((s) => s.yearFilter);

    if (!cables) return null;

    return (
        <g>
            {cables.map((cable) => {
                // Year filter
                if (cable.yearCompleted != null && cable.yearCompleted > yearFilter) return null;

                const lineFeature = {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: cable.coordinates,
                    },
                    properties: {},
                };
                const d = pathGenerator(lineFeature);
                if (!d) return null;
                const statLabel = cable.capacityTbps ? `${cable.capacityTbps} Tbps` : 'Internett';

                return (
                    <path
                        key={cable.id}
                        d={d}
                        fill="none"
                        stroke={cable.color ?? '#f59e0b'}
                        strokeWidth={Math.max(0.3, 1 / Math.sqrt(zoomScale))}
                        strokeOpacity={0.65}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                        onClick={(e) => {
                            if (e.shiftKey) setCompareFeature({ type: 'cables', data: cable as SubmarineCable });
                            else setSelectedFeature({ type: 'cables', data: cable as SubmarineCable });
                        }}
                        onMouseEnter={(e) =>
                            onHover({ label: cable.name, stat: statLabel }, e.clientX, e.clientY)
                        }
                        onMouseLeave={() => onHover(null, 0, 0)}
                    />
                );
            })}
        </g>
    );
}
