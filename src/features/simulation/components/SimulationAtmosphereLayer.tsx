import React, { useMemo } from 'react';

interface AtmosphereProps {
    weather: 'Clear' | 'Rain' | 'Storm' | 'Fog';
    season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
    hideClouds?: boolean;
}

export const SimulationAtmosphereLayer: React.FC<AtmosphereProps> = ({ weather, season, hideClouds }) => {
    // Generate static random values once
    const clouds = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 60,
        duration: 40 + Math.random() * 60,
        scale: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.3
    })), []);

    const particles = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 20,
        duration: 10 + Math.random() * 20,
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
        drift: 50 + Math.random() * 150 // Individual drift variation
    })), []);

    const sunbeams = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        top: `${-10 + Math.random() * 40}%`,
        rotation: (i * 45) + (Math.random() * 20),
        delay: i * 2
    })), []);

    const getParticleEmoji = () => {
        if (season === 'Autumn') return '🍂';
        if (season === 'Spring') return '🌸';
        if (season === 'Winter') return '❄️';
        return '✨'; // Summer/Dust
    };

    // Calculate wind intensity based on weather
    const windIntensity = weather === 'Storm' ? 2.5 : weather === 'Rain' ? 1.5 : 1.0;
    const baseDrift = 100 * windIntensity;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
            {/* 1. Sunbeam Layer (Clear Weather) */}
            {weather === 'Clear' && (
                <div className="absolute inset-0 opacity-40">
                    {sunbeams.map(beam => (
                        <div
                            key={beam.id}
                            className="absolute w-[400px] h-[800px] animate-sunbeam"
                            style={{
                                left: beam.left,
                                top: beam.top,
                                background: 'radial-gradient(ellipse at top, rgba(253, 224, 71, 0.15) 0%, transparent 70%)',
                                transform: `rotate(${beam.rotation}deg)`,
                                animationDelay: `${beam.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* 2. Cloud Layer */}
            {!hideClouds && (
                <div className="absolute inset-0">
                    {clouds.map(cloud => (
                        <div
                            key={cloud.id}
                            className="absolute text-white animate-cloud-drift select-none"
                            style={{
                                top: cloud.top,
                                fontSize: `${cloud.scale * 4}rem`,
                                opacity: weather === 'Storm' ? cloud.opacity * 2 : cloud.opacity,
                                filter: 'blur(8px)',
                                animationDuration: `${weather === 'Storm' ? cloud.duration / 2 : cloud.duration}s`,
                                animationDelay: `-${cloud.delay}s`,
                                color: weather === 'Storm' ? '#475569' : 'white'
                            }}
                        >
                            ☁️
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Mist/Fog Layer */}
            {weather === 'Fog' && (
                <div className="absolute inset-0 bg-slate-400/10 backdrop-blur-[2px] animate-mist" />
            )}

            {/* 4. Particle Layer */}
            <div className="absolute inset-0">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute animate-particle opacity-0"
                        style={{
                            left: p.left,
                            fontSize: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            // @ts-ignore
                            '--wind-drift': `${baseDrift + p.drift}px`,
                            '--wind-rotation': `${720 + p.rotation}deg`
                        } as any}
                    >
                        {getParticleEmoji()}
                    </div>
                ))}
            </div>

            {/* 5. Rain/Storm Overlay */}
            {(weather === 'Rain' || weather === 'Storm') && (
                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay" />
            )}
        </div>
    );
};
