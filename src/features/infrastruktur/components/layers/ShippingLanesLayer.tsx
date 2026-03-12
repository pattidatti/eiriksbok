
import type { GeoPath } from 'd3-geo';
import { shippingLanes } from '../../data/shippingLanes';
import { useAtlasStore } from '../../store/atlasStore';
import type { ShippingLane } from '../../types';

interface Props {
    pathGenerator: GeoPath;
}

export function ShippingLanesLayer({ pathGenerator }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    return (
        <g>
            {shippingLanes.map((lane) => {
                const lineFeature = {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: lane.coordinates,
                    },
                    properties: {},
                };
                const d = pathGenerator(lineFeature);
                if (!d) return null;
                return (
                    <path
                        key={lane.id}
                        d={d}
                        fill="none"
                        stroke={lane.type === 'major' ? '#38bdf8' : '#7dd3fc'}
                        strokeWidth={lane.type === 'major' ? 1.5 : 0.8}
                        strokeOpacity={0.7}
                        strokeDasharray={lane.type === 'secondary' ? '4,3' : undefined}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                        onClick={() =>
                            setSelectedFeature({ type: 'shipping', data: lane as ShippingLane })
                        }
                    />
                );
            })}
        </g>
    );
}
