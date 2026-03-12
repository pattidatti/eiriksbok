
import { useAtlasStore } from '../store/atlasStore';
import type { LayerType } from '../types';

const LAYERS: { id: LayerType; label: string; color: string; description: string }[] = [
    {
        id: 'shipping',
        label: 'Skipsruter',
        color: '#38bdf8',
        description: '90 % av all handel fraktes med skip.',
    },
    {
        id: 'cables',
        label: 'Internettkabler',
        color: '#f59e0b',
        description: '99 % av internetttrafikken går under vann.',
    },
    {
        id: 'pipelines',
        label: 'Rørledninger',
        color: '#f97316',
        description: 'Olje- og gassrørledninger på land og hav.',
    },
    {
        id: 'production',
        label: 'Produksjonsfelt',
        color: '#facc15',
        description: 'De største olje- og gassfeltene i verden.',
    },
];

export function LayerPanel() {
    const { activeLayers, toggleLayer } = useAtlasStore();

    return (
        <div className="flex flex-col gap-2 p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lag</p>
            {LAYERS.map((layer) => {
                const active = activeLayers.has(layer.id);
                return (
                    <button
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id)}
                        className={`flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm w-full ${
                            active
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <span
                            className="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full"
                            style={{ backgroundColor: active ? layer.color : '#475569' }}
                        />
                        <span className="flex flex-col gap-0.5">
                            <span className="font-medium">{layer.label}</span>
                            <span className="text-xs text-slate-500">{layer.description}</span>
                        </span>
                    </button>
                );
            })}

            {/* Legend */}
            <div className="mt-4 border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Rørledningstype
                </p>
                {[
                    { color: '#f97316', label: 'Olje' },
                    { color: '#a78bfa', label: 'Gass' },
                    { color: '#34d399', label: 'LNG' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <span
                            className="inline-block w-6 h-1 rounded"
                            style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                    </div>
                ))}
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-3">
                    Produksjonsstørrelse
                </p>
                {[
                    { size: 4, label: 'Liten (< 0.3 mill. fat/dag)' },
                    { size: 7, label: 'Middels (0.3–2 mill. fat/dag)' },
                    { size: 11, label: 'Gigant (> 2 mill. fat/dag)' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <span
                            className="inline-block rounded-full bg-yellow-400 flex-shrink-0"
                            style={{ width: item.size * 2, height: item.size * 2 }}
                        />
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Data sources */}
            <div className="mt-4 border-t border-slate-700 pt-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span>ℹ</span> Datakilder
                </p>
                {[
                    { icon: '🗺', label: 'Geografi', source: 'Natural Earth / world-atlas 110m' },
                    { icon: '🚢', label: 'Skipsruter', source: 'IMO / UNCTAD 2024 (red.)' },
                    { icon: '🌐', label: 'Kabler', source: 'TeleGeography SubmarineCableMap' },
                    { icon: '🛢', label: 'Rørledninger', source: 'IEA / EIA / Wikipedia (red.)' },
                    { icon: '⚡', label: 'Produksjon', source: 'IEA World Energy Outlook 2024' },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col mb-1.5">
                        <span className="text-[10px] text-slate-400">
                            {item.icon} {item.label}
                        </span>
                        <span className="text-[10px] text-slate-500 pl-4 leading-tight">
                            {item.source}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
