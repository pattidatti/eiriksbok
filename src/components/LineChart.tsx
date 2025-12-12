import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DataPoint {
    year: number;
    value: number;
}

interface LineChartProps {
    title: string;
    data: DataPoint[];
    xAxisLabel?: string;
    yAxisLabel?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ title, data, xAxisLabel, yAxisLabel }) => {
    const chartData = {
        labels: data.map(d => d.year),
        datasets: [
            {
                label: 'Befolkning',
                data: data.map(d => d.value),
                borderColor: 'rgb(79, 70, 229)', // Indigo 600
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const
                },
                color: '#1e293b'
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            // Format number with spaces
                            label += new Intl.NumberFormat('no-NO').format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: !!yAxisLabel,
                    text: yAxisLabel
                }
            },
            x: {
                title: {
                    display: !!xAxisLabel,
                    text: xAxisLabel
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 my-10">
            <Line options={options} data={chartData} />
        </div>
    );
};
