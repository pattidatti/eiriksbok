import type { GeoProjection } from 'd3-geo';
import { chokepoints } from '../../data/chokepoints';
import { useAtlasStore } from '../../store/atlasStore';
import type { Chokepoint } from '../../types';

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
    shipping: '#38bdf8',
    both: '#ef4444',
};

export function ChokepointLayer({ projection, zoomScale, onHover }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    return (
        <g>
            {chokepoints.map((cp) => {
                const pos = projection(cp.coordinates);
                if (!pos) return null;
                const [x, y] = pos;
                const color = TYPE_COLORS[cp.type] ?? '#ef4444';
                const baseR = Math.max(3, 5 / Math.sqrt(zoomScale));

                return (
                    <g
                        key={cp.id}
                        transform={`translate(${x},${y})`}
                        className="cursor-pointer"
                        onClick={() =>
                            setSelectedFeature({ type: 'chokepoints', data: cp as Chokepoint })
                        }
                        onMouseEnter={(e) =>
                            onHover({ label: cp.name, stat: cp.throughput }, e.clientX, e.clientY)
                        }
                        onMouseLeave={() => onHover(null, 0, 0)}
                    >
                        {/* Pulsing ring */}
                        <circle r={baseR * 2} fill="none" stroke={color} strokeWidth={1} opacity={0}>
                            <animate
                                attributeName="r"
                                from={String(baseR)}
                                to={String(baseR * 3)}
                                dur="2s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="opacity"
                                from="0.8"
                                to="0"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        {/* Solid center */}
                        <circle
                            r={baseR}
                            fill={color}
                            fillOpacity={0.9}
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth={0.5}
                        />
                    </g>
                );
            })}
        </g>
    );
}
