import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { WorkshopMode } from '../../data/virkemiddelverkstedet/types';
import { devices } from '../../data/virkemiddelverkstedet/devices';
import { useVirkemiddelStore } from '../../stores/useVirkemiddelStore';
import { DeviceCard } from './DeviceCard';

interface DeviceGridProps {
    mode: WorkshopMode;
    onSelectDevice: (deviceId: string) => void;
}

export const DeviceGrid = ({ mode, onSelectDevice }: DeviceGridProps) => {
    const { totalPoints, applyTotalPoints, getDeviceProgress, getApplyDeviceProgress } =
        useVirkemiddelStore();

    const getProgress = mode === 'analyser' ? getDeviceProgress : getApplyDeviceProgress;

    const virkemidler = devices.filter((d) => d.category === 'virkemiddel');
    const analyse = devices.filter((d) => d.category === 'analyse');

    const subtitle =
        mode === 'analyser'
            ? 'Velg et virkemiddel og tren på å kjenne det igjen.'
            : 'Velg et virkemiddel og tren på å bruke det selv.';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                    Virkemiddelverkstedet
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">{subtitle}</p>

                {/* Total stats */}
                {(totalPoints > 0 || applyTotalPoints > 0) && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                        {totalPoints > 0 && (
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                                    mode === 'analyser'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Trophy className="w-4 h-4" />
                                🔍 {totalPoints.toLocaleString()}
                            </div>
                        )}
                        {applyTotalPoints > 0 && (
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                                    mode === 'bruk'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Trophy className="w-4 h-4" />
                                ✏️ {applyTotalPoints.toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Virkemidler section */}
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Virkemidler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {virkemidler.map((device, i) => (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <DeviceCard
                                device={device}
                                mode={mode}
                                progress={getProgress(device.id)}
                                onClick={() => onSelectDevice(device.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Analyse section */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Analyse
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyse.map((device, i) => (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (virkemidler.length + i) * 0.04 }}
                        >
                            <DeviceCard
                                device={device}
                                mode={mode}
                                progress={getProgress(device.id)}
                                onClick={() => onSelectDevice(device.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
