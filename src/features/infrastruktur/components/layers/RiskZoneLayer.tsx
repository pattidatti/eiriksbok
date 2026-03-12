import type { GeoPath } from 'd3-geo';
import { riskZones } from '../../data/riskZones';
import { useAtlasStore } from '../../store/atlasStore';
import type { RiskZone } from '../../types';

interface Props {
    pathGenerator: GeoPath;
}

export function RiskZoneLayer({ pathGenerator }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    return (
        <g>
            {riskZones.map((zone) => {
                const polygonFeature = {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Polygon' as const,
                        coordinates: [zone.coordinates],
                    },
                    properties: {},
                };
                const d = pathGenerator(polygonFeature);
                if (!d) return null;
                return (
                    <path
                        key={zone.id}
                        d={d}
                        fill={zone.color}
                        fillOpacity={0.15}
                        stroke={zone.color}
                        strokeOpacity={0.4}
                        strokeWidth={1}
                        strokeDasharray="6,3"
                        className="cursor-pointer hover:fill-opacity-30 transition-all"
                        onClick={() =>
                            setSelectedFeature({ type: 'riskzones', data: zone as RiskZone })
                        }
                    />
                );
            })}
        </g>
    );
}
