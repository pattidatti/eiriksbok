
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAtlasStore } from '../store/atlasStore';
import type { Pipeline, ProductionSite, SubmarineCable, ShippingLane } from '../types';

export function InfoPanel() {
    const { selectedFeature, setSelectedFeature } = useAtlasStore();

    return (
        <AnimatePresence>
            {selectedFeature && (
                <motion.div
                    key="info-panel"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 text-sm text-slate-200 h-full overflow-y-auto"
                >
                    <button
                        onClick={() => setSelectedFeature(null)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>

                    {selectedFeature.type === 'pipelines' && (
                        <PipelineInfo data={selectedFeature.data as Pipeline} />
                    )}
                    {selectedFeature.type === 'production' && (
                        <ProductionInfo data={selectedFeature.data as ProductionSite} />
                    )}
                    {selectedFeature.type === 'cables' && (
                        <CableInfo data={selectedFeature.data as SubmarineCable} />
                    )}
                    {selectedFeature.type === 'shipping' && (
                        <ShippingInfo data={selectedFeature.data as ShippingLane} />
                    )}
                </motion.div>
            )}

            {!selectedFeature && (
                <motion.div
                    key="info-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center h-full text-center"
                >
                    <div className="text-3xl mb-2">🌍</div>
                    <p className="text-slate-400 text-sm">Klikk på et lag i kartet for å lese mer.</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function PipelineInfo({ data }: { data: Pipeline }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🛢️</span>
                <h3 className="font-bold text-base">{data.name}</h3>
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
                <h3 className="font-bold text-base">{data.name}</h3>
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
                <h3 className="font-bold text-base">{data.name}</h3>
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
                <h3 className="font-bold text-base">{data.name}</h3>
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

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2 text-xs">
            <span className="text-slate-500 flex-shrink-0">{label}</span>
            <span className="text-slate-300 text-right">{value}</span>
        </div>
    );
}
