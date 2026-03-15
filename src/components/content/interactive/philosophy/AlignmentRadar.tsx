import React from 'react';
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
import { AXIS_LABELS } from '../../../../data/philosophy/types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface AlignmentRadarProps {
    alignment: Record<PhilosophyAxis, number>;
    compact?: boolean;
}

const RADAR_AXES: PhilosophyAxis[] = [
    'rationalism', 'idealism', 'stoicism',
    'individualism', 'existentialism', 'skepticism',
];

export const AlignmentRadar: React.FC<AlignmentRadarProps> = ({ alignment, compact = false }) => {
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
                pointRadius: compact ? 2 : 3,
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
                },
            },
        },
    };

    return <Radar data={data} options={options} />;
};
