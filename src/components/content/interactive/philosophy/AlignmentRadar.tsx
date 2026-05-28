import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from 'chart.js';
import type { PhilosophyAxis } from '../../../../data/philosophy/types';
import { AXIS_LABELS, AXIS_DESCRIPTIONS } from '../../../../data/philosophy/types';
import { Info } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface AlignmentRadarProps {
    alignment: Record<PhilosophyAxis, number>;
    compact?: boolean;
}

const RADAR_AXES: PhilosophyAxis[] = [
    'rationalism', 'idealism', 'stoicism', 'individualism', 'existentialism', 'skepticism',
    'empiricism', 'materialism', 'epicureanism', 'collectivism', 'essentialism', 'dogmatism',
];

export const AlignmentRadar: React.FC<AlignmentRadarProps> = ({ alignment, compact = false }) => {
    const [showDescriptions, setShowDescriptions] = useState(false);

    const data = {
        labels: RADAR_AXES.map(a => AXIS_LABELS[a]),
        datasets: [
            {
                data: RADAR_AXES.map(a => alignment[a] || 50),
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.6)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(99, 102, 241, 0.8)',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: compact ? 3 : 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: { raw: unknown }) => `${ctx.raw}/100`,
                },
            },
        },
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: {
                    display: false,
                    stepSize: 25,
                },
                grid: {
                    color: 'rgba(0,0,0,0.06)',
                },
                angleLines: {
                    color: 'rgba(0,0,0,0.06)',
                },
                pointLabels: {
                    font: {
                        size: compact ? 9 : 11,
                        weight: 700 as const,
                    },
                    color: '#64748b',
                    padding: 4,
                },
            },
        },
    };

    return (
        <div>
            <Radar data={data} options={options} />
            <button
                onClick={() => setShowDescriptions(!showDescriptions)}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-500 transition-colors mx-auto"
            >
                <Info size={10} />
                {showDescriptions ? 'Skjul forklaring' : 'Hva betyr aksene?'}
            </button>
            {showDescriptions && (
                <div className="mt-3 space-y-1.5">
                    {RADAR_AXES.map(axis => (
                        <div key={axis} className="flex gap-2 text-[10px]">
                            <span className="font-bold text-indigo-500 shrink-0 w-24">{AXIS_LABELS[axis]}</span>
                            <span className="text-slate-500">{AXIS_DESCRIPTIONS[axis]}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
