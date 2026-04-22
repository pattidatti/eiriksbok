import { useEffect, useState } from 'react';
import type { DebugStats } from '../systems/DebugHudSystem';

interface DebugHudProps {
    getStats: () => DebugStats;
}

export function DebugHud({ getStats }: DebugHudProps) {
    const [stats, setStats] = useState<DebugStats | null>(null);

    useEffect(() => {
        const id = window.setInterval(() => {
            setStats(getStats());
        }, 250);
        return () => window.clearInterval(id);
    }, [getStats]);

    if (!stats) return null;

    const row = (label: string, value: string | number) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ opacity: 0.7 }}>{label}</span>
            <span>{value}</span>
        </div>
    );

    return (
        <div
            style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0,0,0,0.82)',
                border: '1px solid #00ff88',
                padding: '10px 14px',
                fontSize: 11,
                color: '#b8ffd8',
                borderRadius: 3,
                fontFamily: 'monospace',
                lineHeight: 1.55,
                pointerEvents: 'none',
                zIndex: 30,
                minWidth: 180,
            }}
        >
            <div style={{ color: '#00ff88', marginBottom: 4, fontWeight: 'bold' }}>DEBUG · F3</div>
            {row('fps', `${stats.fps} (${stats.frameMs}ms)`)}
            {row('drawcalls', stats.drawCalls)}
            {row('triangles', stats.triangles.toLocaleString('en-US'))}
            {row('geometries', stats.geometries)}
            {row('textures', stats.textures)}
            {row('programs', stats.programs)}
            {row('materials', stats.materials)}
            {row('phys.bodies', stats.physicsBodies)}
            {row('tier', stats.qualityTier)}
            {row('phase', stats.phase)}
            {Object.keys(stats.flags).length > 0 && (
                <div style={{ marginTop: 6, borderTop: '1px solid #2a5a3a', paddingTop: 4 }}>
                    {Object.entries(stats.flags).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span style={{ opacity: 0.7 }}>{k}</span>
                            <span>{String(v)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
