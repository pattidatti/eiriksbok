import React, { useState } from 'react';
import MapChart from './MapChart';
import TimelineSlider from './TimelineSlider';

const ColonizationMap: React.FC = () => {
    const [year, setYear] = useState(1492);

    return (
        <div className="flex flex-col h-screen bg-gray-100 p-4">
            <header className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Colonization Era Explorer</h1>
                    <p className="text-gray-600">Explore the history of colonization from 1492 to present.</p>
                </div>
                <div className="text-2xl font-bold text-neon-accent bg-white px-4 py-2 rounded-lg shadow-sm">
                    {year}
                </div>
            </header>

            <div className="flex-1 bg-white rounded-xl shadow-lg p-4 overflow-hidden relative flex flex-col">
                <div className="flex-1 min-h-0">
                    <MapChart year={year} />
                </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-xl shadow-lg">
                <TimelineSlider
                    year={year}
                    setYear={setYear}
                    minYear={1492}
                    maxYear={2025}
                />
            </div>
        </div>
    );
};

export default ColonizationMap;
