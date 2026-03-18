import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { devices } from '../../data/virkemiddelverkstedet/devices';
import { useVirkemiddelStore } from '../../stores/useVirkemiddelStore';
import { DeviceCard } from './DeviceCard';

interface DeviceGridProps {
    onSelectDevice: (deviceId: string) => void;
}

export const DeviceGrid = ({ onSelectDevice }: DeviceGridProps) => {
    const { totalPoints, getDeviceProgress } = useVirkemiddelStore();

    const virkemidler = devices.filter((d) => d.category === 'virkemiddel');
    const analyse = devices.filter((d) => d.category === 'analyse');

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
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Velg et virkemiddel og tren deg opp gjennom tre nivåer.
                </p>

                {/* Total stats */}
                {totalPoints > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold">
                            <Trophy className="w-4 h-4" />
                            {totalPoints.toLocaleString()} poeng
                        </div>
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
                                progress={getDeviceProgress(device.id)}
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
                                progress={getDeviceProgress(device.id)}
                                onClick={() => onSelectDevice(device.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
