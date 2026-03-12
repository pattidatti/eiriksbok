
import { useAtlasStore } from '../store/atlasStore';
import type { LayerType } from '../types';
import { pipelines } from '../data/pipelines';
import { productionSites } from '../data/productionSites';
import { shippingLanes } from '../data/shippingLanes';
import { chokepoints } from '../data/chokepoints';
import { riskZones } from '../data/riskZones';

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
    {
        id: 'chokepoints',
        label: 'Flaskehalser',
        color: '#ef4444',
        description: 'Strategiske sund og kanaler for verdenshandelen.',
    },
    {
        id: 'riskzones',
        label: 'Risikosoner',
        color: '#8b5cf6',
        description: 'Geopolitiske konflikt- og risikoområder.',
    },
];

const LAYER_COUNTS: Partial<Record<LayerType, number>> = {
    shipping: shippingLanes.length,
    pipelines: pipelines.length,
    production: productionSites.length,
    chokepoints: chokepoints.length,
    riskzones: riskZones.length,
};

const REGIONS = [
    { label: 'Nordsjøen', target: { scale: 3.5, x: -175, y: 65 } },
    { label: 'Persiagulfen', target: { scale: 4.0, x: -520, y: 80 } },
    { label: 'Malacca', target: { scale: 4.5, x: -830, y: 120 } },
    { label: 'Øst-Asia', target: { scale: 3.0, x: -750, y: 50 } },
];

export function LayerPanel() {
    const { activeLayers, toggleLayer, layerOpacities, setLayerOpacity, yearFilter, setYearFilter, setViewTarget } =
        useAtlasStore();

    return (
        <div className="flex flex-col gap-2 p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lag</p>
            {LAYERS.map((layer) => {
                const active = activeLayers.has(layer.id);
                const count = LAYER_COUNTS[layer.id];
                return (
                    <div key={layer.id} className="flex flex-col gap-1">
                        <button
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
                            <span className="flex flex-col gap-0.5 flex-1">
                                <span className="font-medium">{layer.label}</span>
                                <span className="text-xs text-slate-500">
                                    {layer.description}
                                    {count != null && (
                                        <span className="ml-1 text-slate-600">({count})</span>
                                    )}
                                </span>
                            </span>
                        </button>
                        {active && (
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={layerOpacities[layer.id]}
                                onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value))}
                                className="w-full h-1 accent-slate-400 mx-1"
                                title="Gjennomsiktighet"
                            />
                        )}
                    </div>
                );
            })}

            {/* Region shortcuts */}
            <div className="mt-3 border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gå til region
                </p>
                <div className="grid grid-cols-2 gap-1">
                    {REGIONS.map((r) => (
                        <button
                            key={r.label}
                            onClick={() => setViewTarget(r.target)}
                            className="text-xs bg-slate-800/70 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg transition-colors text-left"
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Year filter */}
            <div className="mt-3 border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tidsfilter
                </p>
                <input
                    type="range"
                    min={1960}
                    max={2024}
                    value={yearFilter}
                    onChange={(e) => setYearFilter(Number(e.target.value))}
                    className="w-full accent-sky-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Vis infrastruktur t.o.m. {yearFilter}
                </p>
            </div>

            {/* Legend */}
            <div className="mt-3 border-t border-slate-700 pt-3">
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
                    { icon: '🗺', label: 'Geografi', source: 'Natural Earth / world-atlas 110m', url: 'https://www.naturalearthdata.com/' },
                    { icon: '🚢', label: 'Skipsruter', source: 'IMO / UNCTAD 2024 (red.)', url: 'https://unctad.org/topic/transport-and-trade-logistics' },
                    { icon: '🌐', label: 'Kabler', source: 'TeleGeography SubmarineCableMap', url: 'https://www.submarinecablemap.com/' },
                    { icon: '🛢', label: 'Rørledninger', source: 'IEA / EIA / Wikipedia (red.)', url: 'https://www.iea.org/data-and-statistics' },
                    { icon: '⚡', label: 'Produksjon', source: 'IEA World Energy Outlook 2024', url: 'https://www.iea.org/reports/world-energy-outlook-2024' },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col mb-1.5">
                        <span className="text-[10px] text-slate-400">
                            {item.icon} {item.label}
                        </span>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-500 pl-4 leading-tight hover:text-sky-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {item.source}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
