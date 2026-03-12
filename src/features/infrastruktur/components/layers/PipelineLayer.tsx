
import type { GeoPath } from 'd3-geo';
import { pipelines } from '../../data/pipelines';
import { useAtlasStore } from '../../store/atlasStore';
import type { Pipeline } from '../../types';

interface HoverInfo {
    label: string;
    stat: string;
}

interface Props {
    pathGenerator: GeoPath;
    zoomScale: number;
    onHover: (info: HoverInfo | null, x: number, y: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
    oil: '#f97316',
    gas: '#a78bfa',
    lng: '#34d399',
};

export function PipelineLayer({ pathGenerator, zoomScale, onHover }: Props) {
    const setSelectedFeature = useAtlasStore((s) => s.setSelectedFeature);
    const setCompareFeature = useAtlasStore((s) => s.setCompareFeature);
    const yearFilter = useAtlasStore((s) => s.yearFilter);
    const selectedCountry = useAtlasStore((s) => s.selectedCountry);

    return (
        <g>
            {pipelines.map((pipeline) => {
                // Year filter
                if (pipeline.yearCompleted != null && pipeline.yearCompleted > yearFilter) return null;

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

                const dimmed =
                    selectedCountry != null && !pipeline.countries.includes(selectedCountry);
                const statLabel = pipeline.capacity ?? pipeline.type.toUpperCase();

                return (
                    <path
                        key={pipeline.id}
                        d={d}
                        fill="none"
                        stroke={TYPE_COLORS[pipeline.type] ?? '#f97316'}
                        strokeWidth={Math.max(0.5, 2 / Math.sqrt(zoomScale))}
                        strokeOpacity={dimmed ? 0.1 : 0.8}
                        className="cursor-pointer hover:stroke-white hover:stroke-[3px] transition-all"
                        onClick={(e) => {
                            if (e.shiftKey) setCompareFeature({ type: 'pipelines', data: pipeline as Pipeline });
                            else setSelectedFeature({ type: 'pipelines', data: pipeline as Pipeline });
                        }}
                        onMouseEnter={(e) =>
                            onHover({ label: pipeline.name, stat: statLabel }, e.clientX, e.clientY)
                        }
                        onMouseLeave={() => onHover(null, 0, 0)}
                    />
                );
            })}
        </g>
    );
}
