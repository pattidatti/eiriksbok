import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Stat {
    value: number;
    target: number;
    unit: string;
    label: string;
    source: string;
}

const STATS: Omit<Stat, 'value'>[] = [
    { target: 90, unit: '%', label: 'av verdenshandelen', source: 'IMO 2024' },
    { target: 99, unit: '%', label: 'av internetttrafikk under vann', source: 'TeleGeography 2024' },
    { target: 450, unit: 'mill. fat/dag', label: 'global oljeproduksjon per år', source: 'IEA 2024' },
    { target: 1_400, unit: 'kabler', label: 'aktive undersjøiske fiberkabler', source: 'TeleGeography 2024' },
    { target: 55_000, unit: 'skip', label: 'i den globale handelsflåten', source: 'UNCTAD 2024' },
    { target: 800, unit: 'mrd. m³', label: 'gass gjennom rørledninger per år', source: 'IEA 2024' },
];

function AnimatedNumber({ target, duration = 1800 }: { target: number; duration?: number }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);

    return <>{value.toLocaleString('no-NO')}</>;
}

export function StatsBar() {
    return (
        <div className="bg-slate-800/80 border-t border-slate-700 px-4 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-around">
                {STATS.map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col items-center text-center min-w-[120px]"
                    >
                        <div className="text-xl font-bold text-white tabular-nums">
                            <AnimatedNumber target={stat.target} />
                            <span className="text-sm font-normal text-slate-400 ml-0.5">{stat.unit}</span>
                        </div>
                        <div className="text-xs text-slate-400 leading-tight mt-0.5">{stat.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{stat.source}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
