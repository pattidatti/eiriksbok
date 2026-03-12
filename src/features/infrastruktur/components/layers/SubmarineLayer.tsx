
import type { GeoPath } from 'd3-geo';
import { useSubmarineCables } from '../../hooks/useSubmarineCables';
import { useAtlasStore } from '../../store/atlasStore';
import type { SubmarineCable } from '../../types';

interface Props {
    pathGenerator: GeoPath;
}

export function SubmarineLayer({ pathGenerator }: Props) {
    const { data: cables } = useSubmarineCables();
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    if (!cables) return null;

    return (
        <g>
            {cables.map((cable) => {
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
                return (
                    <path
                        key={cable.id}
                        d={d}
                        fill="none"
                        stroke={cable.color ?? '#f59e0b'}
                        strokeWidth={1}
                        strokeOpacity={0.65}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                        onClick={() =>
                            setSelectedFeature({ type: 'cables', data: cable as SubmarineCable })
                        }
                    />
                );
            })}
        </g>
    );
}
