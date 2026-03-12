
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAtlasStore } from '../store/atlasStore';
import type {
    Pipeline,
    ProductionSite,
    SubmarineCable,
    ShippingLane,
    Chokepoint,
    RiskZone,
    SelectedFeature,
} from '../types';
import { DidYouKnow } from './DidYouKnow';

export function InfoPanel() {
    const { selectedFeature, setSelectedFeature, compareFeature, setCompareFeature } =
        useAtlasStore();

    return (
        <AnimatePresence>
            {selectedFeature ? (
                <motion.div
                    key="info-panel"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 text-sm text-slate-200 h-full overflow-y-auto relative"
                >
                    <button
                        onClick={() => {
                            setSelectedFeature(null);
                            setCompareFeature(null);
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors z-10"
                    >
                        <X size={16} />
                    </button>

                    {compareFeature ? (
                        <div className="flex gap-2 h-full">
                            <div className="flex-1 border-r border-slate-700 pr-2 min-w-0">
                                <FeatureInfo feature={selectedFeature} />
                            </div>
                            <div className="flex-1 pl-2 min-w-0 relative">
                                <button
                                    onClick={() => setCompareFeature(null)}
                                    className="absolute top-0 right-0 text-slate-500 hover:text-white text-xs"
                                >
                                    ✕
                                </button>
                                <FeatureInfo feature={compareFeature} />
                            </div>
                        </div>
                    ) : (
                        <FeatureInfo feature={selectedFeature} />
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key="info-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                >
                    <DidYouKnow />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function FeatureInfo({ feature }: { feature: SelectedFeature }) {
    if (feature.type === 'pipelines') return <PipelineInfo data={feature.data as Pipeline} />;
    if (feature.type === 'production') return <ProductionInfo data={feature.data as ProductionSite} />;
    if (feature.type === 'cables') return <CableInfo data={feature.data as SubmarineCable} />;
    if (feature.type === 'shipping') return <ShippingInfo data={feature.data as ShippingLane} />;
    if (feature.type === 'chokepoints') return <ChokepointInfo data={feature.data as Chokepoint} />;
    if (feature.type === 'riskzones') return <RiskZoneInfo data={feature.data as RiskZone} />;
    return null;
}

function PipelineInfo({ data }: { data: Pipeline }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🛢️</span>
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <div className="space-y-1.5">
                <InfoRow label="Rute" value={data.countries} />
                <InfoRow label="Type" value={data.type.toUpperCase()} />
                {data.capacity && <InfoRow label="Kapasitet" value={data.capacity} />}
                {data.yearCompleted && <InfoRow label="Ferdigstilt" value={String(data.yearCompleted)} />}
            </div>
            {data.description && (
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">{data.description}</p>
            )}
        </div>
    );
}

function ProductionInfo({ data }: { data: ProductionSite }) {
    const typeIcon: Record<string, string> = { oil: '🛢️', gas: '💨', both: '⚡' };
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{typeIcon[data.type]}</span>
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <div className="space-y-1.5">
                <InfoRow label="Land" value={data.country} />
                <InfoRow label="Type" value={{ oil: 'Olje', gas: 'Gass', both: 'Olje + Gass' }[data.type]} />
                {data.mbpd > 0 && (
                    <InfoRow label="Produksjon" value={`${data.mbpd} mill. fat/dag`} />
                )}
            </div>
            {data.description && (
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">{data.description}</p>
            )}
        </div>
    );
}

function CableInfo({ data }: { data: SubmarineCable }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: data.color ?? '#f59e0b' }}
                />
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <div className="space-y-1.5">
                {data.capacityTbps && (
                    <InfoRow label="Kapasitet" value={`${data.capacityTbps} Tbps`} />
                )}
                {data.yearCompleted && (
                    <InfoRow label="Ferdigstilt" value={String(data.yearCompleted)} />
                )}
                {data.owners && data.owners.length > 0 && (
                    <InfoRow label="Eiere" value={data.owners.join(', ')} />
                )}
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Undersjøiske fiberoptiske kabler frakter data med lysets hastighet mellom kontinenter.
                En enkel kabel kan transportere data nok til millioner av videosamtaler simultant.
            </p>
        </div>
    );
}

function ShippingInfo({ data }: { data: ShippingLane }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🚢</span>
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <div className="mb-2">
                <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        data.type === 'major'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-600/50 text-slate-300'
                    }`}
                >
                    {data.type === 'major' ? 'Hovedrute' : 'Sekundærrute'}
                </span>
            </div>
            {data.description && (
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{data.description}</p>
            )}
        </div>
    );
}

function ChokepointInfo({ data }: { data: Chokepoint }) {
    const typeLabel: Record<string, string> = { oil: 'Olje', shipping: 'Shipping', both: 'Olje + Shipping' };
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <div className="space-y-1.5">
                <InfoRow label="Gjennomstrømning" value={data.throughput} />
                <InfoRow label="Type" value={typeLabel[data.type]} />
                {data.shipsPerDay && (
                    <InfoRow label="Skip/dag" value={String(data.shipsPerDay)} />
                )}
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">{data.description}</p>
            {data.snlUrl && (
                <a
                    href={data.snlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                    Les mer på SNL →
                </a>
            )}
        </div>
    );
}

function RiskZoneInfo({ data }: { data: RiskZone }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: data.color }}
                />
                <h3 className="font-bold text-base leading-tight">{data.name}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{data.description}</p>
            {data.snlUrl && (
                <a
                    href={data.snlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                    Les mer på SNL →
                </a>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2 text-xs">
            <span className="text-slate-500 flex-shrink-0">{label}</span>
            <span className="text-slate-300 text-right">{value}</span>
        </div>
    );
}
