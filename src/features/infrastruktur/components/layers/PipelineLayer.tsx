
import type { GeoPath } from 'd3-geo';
import { pipelines } from '../../data/pipelines';
import { useAtlasStore } from '../../store/atlasStore';
import type { Pipeline } from '../../types';

interface Props {
    pathGenerator: GeoPath;
}

const TYPE_COLORS: Record<string, string> = {
    oil: '#f97316',
    gas: '#a78bfa',
    lng: '#34d399',
};

export function PipelineLayer({ pathGenerator }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);

    return (
        <g>
            {pipelines.map((pipeline) => {
                const lineFeature = {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: pipeline.coordinates,
                    },
                    properties: {},
                };
                const d = pathGenerator(lineFeature);
                if (!d) return null;
                return (
                    <path
                        key={pipeline.id}
                        d={d}
                        fill="none"
                        stroke={TYPE_COLORS[pipeline.type] ?? '#f97316'}
                        strokeWidth={2}
                        strokeOpacity={0.8}
                        className="cursor-pointer hover:stroke-white hover:stroke-[3px] transition-all"
                        onClick={() =>
                            setSelectedFeature({ type: 'pipelines', data: pipeline as Pipeline })
                        }
                    />
                );
            })}
        </g>
    );
}
