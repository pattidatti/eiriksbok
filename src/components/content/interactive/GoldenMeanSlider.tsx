import React, { useState } from 'react';

type DygdType = {
    deficiency: string;
    virtue: string;
    excess: string;
    context: string;
};

const dygder: DygdType[] = [
    { deficiency: 'Feighet', virtue: 'Mot', excess: 'Dumdristighet', context: 'I møte med fare' },
    { deficiency: 'Gjerrighet', virtue: 'Gavmildhet', excess: 'Sløseri', context: 'I møte med penger' },
    { deficiency: 'Selvutslettelse', virtue: 'Sannferdighet', excess: 'Skrythals', context: 'I omtale av seg selv' },
    { deficiency: 'Kjiphet', virtue: 'Vennlighet', excess: 'Smisker', context: 'I sosiale lag' },
];

export const GoldenMeanSlider: React.FC = () => {
    const [value, setValue] = useState(50);
    const [selectedDygd, setSelectedDygd] = useState(0);

    const current = dygder[selectedDygd];

    // Determine the current state based on slider value
    let state = '';
    let description = '';
    let color = '';

    if (value < 40) {
        state = current.deficiency;
        description = "For lite! Du mangler handlekraft eller evne.";
        color = "text-red-600";
    } else if (value > 60) {
        state = current.excess;
        description = "For mye! Du overdriver og mister kontrollen.";
        color = "text-red-600";
    } else {
        state = current.virtue;
        description = "Perfekt balanse! Dette er den gylne middelvei.";
        color = "text-green-600";
    }

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Den gylne middelvei</h3>
                <select
                    value={selectedDygd}
                    onChange={(e) => { setSelectedDygd(Number(e.target.value)); setValue(50); }}
                    className="bg-white border text-sm border-slate-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {dygder.map((d, i) => (
                        <option key={i} value={i}>{d.virtue}</option>
                    ))}
                </select>
            </div>

            <p className="text-sm font-medium text-slate-500 mb-8 text-center uppercase tracking-wide">
                Situasjon: {current.context}
            </p>

            <div className="relative h-12 mb-8">
                {/* Background Bar */}
                <div className="absolute top-1/2 left-0 w-full h-4 bg-gradient-to-r from-red-200 via-green-200 to-red-200 rounded-full -translate-y-1/2"></div>

                {/* Center Marker */}
                <div className="absolute top-1/2 left-1/2 w-1 h-8 bg-slate-400 -translate-y-1/2 -translate-x-1/2 rounded"></div>

                {/* Slider Input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-0 cursor-pointer h-12 z-20"
                />

                {/* Visible Handle */}
                <div
                    className="absolute top-1/2 w-8 h-8 bg-white border-2 border-slate-600 rounded-full shadow-lg -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all z-10 font-bold flex items-center justify-center text-xs"
                    style={{ left: `${value}%` }}
                >
                    {value < 40 ? '-' : value > 60 ? '+' : '✓'}
                </div>
            </div>

            <div className="text-center">
                <h4 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${color}`}>
                    {state}
                </h4>
                <p className="text-slate-600 min-h-[3rem]">
                    {description}
                </p>
            </div>

            <div className="flex justify-between text-xs text-slate-400 mt-4 px-2">
                <span>Underskudd (Last)</span>
                <span>Middelvei (Dygd)</span>
                <span>Overskudd (Last)</span>
            </div>
        </div>
    );
};
