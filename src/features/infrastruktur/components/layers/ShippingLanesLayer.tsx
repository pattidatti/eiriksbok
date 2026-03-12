
import type { GeoPath } from 'd3-geo';
import { shippingLanes } from '../../data/shippingLanes';
import { useAtlasStore } from '../../store/atlasStore';
import type { ShippingLane } from '../../types';

interface HoverInfo {
    label: string;
    stat: string;
}

interface Props {
    pathGenerator: GeoPath;
    zoomScale: number;
    onHover: (info: HoverInfo | null, x: number, y: number) => void;
}

export function ShippingLanesLayer({ pathGenerator, zoomScale, onHover }: Props) {
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
                const dotR = Math.max(1.5, 2.5 / Math.sqrt(zoomScale));
                const dur = lane.type === 'major' ? '35s' : '50s';

                return (
                    <g key={lane.id}>
                        <path
                            id={`lane-${lane.id}`}
                            d={d}
                            fill="none"
                            stroke={lane.type === 'major' ? '#38bdf8' : '#7dd3fc'}
                            strokeWidth={Math.max(
                                0.3,
                                (lane.type === 'major' ? 1.5 : 0.8) / Math.sqrt(zoomScale)
                            )}
                            strokeOpacity={0.7}
                            strokeDasharray={lane.type === 'secondary' ? '4,3' : undefined}
                            className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                            onClick={() =>
                                setSelectedFeature({ type: 'shipping', data: lane as ShippingLane })
                            }
                            onMouseEnter={(e) =>
                                onHover(
                                    {
                                        label: lane.name,
                                        stat: lane.type === 'major' ? 'Hovedrute' : 'Sekundærrute',
                                    },
                                    e.clientX,
                                    e.clientY
                                )
                            }
                            onMouseLeave={() => onHover(null, 0, 0)}
                        />
                        {/* Animated dots moving along the lane */}
                        {[0, 0.33, 0.66].map((offset, i) => (
                            <circle key={i} r={dotR} fill="#38bdf8" fillOpacity={0.7}>
                                <animateMotion
                                    dur={dur}
                                    begin={`${-offset * parseFloat(dur)}s`}
                                    repeatCount="indefinite"
                                >
                                    <mpath href={`#lane-${lane.id}`} />
                                </animateMotion>
                            </circle>
                        ))}
                    </g>
                );
            })}
        </g>
    );
}
