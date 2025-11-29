import React, { useMemo } from 'react';

interface PlaceholderImageProps {
    seed: string;
    className?: string;
}

const COLORS = [
    ['#EEF2FF', '#C7D2FE', '#818CF8', '#4F46E5'], // Indigo
    ['#F0F9FF', '#BAE6FD', '#38BDF8', '#0EA5E9'], // Sky
    ['#ECFEFF', '#A5F3FC', '#22D3EE', '#06B6D4'], // Cyan
    ['#F0FDFA', '#99F6E4', '#2DD4BF', '#0D9488'], // Teal
    ['#FDF4FF', '#F0ABFC', '#E879F9', '#C026D3'], // Fuchsia
    ['#FFF1F2', '#FECDD3', '#FB7185', '#E11D48'], // Rose
    ['#FFF7ED', '#FED7AA', '#FB923C', '#EA580C'], // Orange
];

const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ seed, className = '' }) => {
    const { palette, shapes } = useMemo(() => {
        const hash = hashCode(seed);
        const paletteIndex = hash % COLORS.length;
        const palette = COLORS[paletteIndex];

        // Generate 3-5 shapes
        const numShapes = 3 + (hash % 3);
        const shapes = [];

        for (let i = 0; i < numShapes; i++) {
            const shapeHash = hashCode(seed + i);
            const type = shapeHash % 3; // 0: circle, 1: rect, 2: path
            const x = (shapeHash % 80) + 10; // 10-90%
            const y = ((shapeHash >> 8) % 80) + 10; // 10-90%
            const size = (shapeHash % 40) + 20; // 20-60%
            const rotation = shapeHash % 360;
            const colorIndex = (shapeHash % 3) + 1; // Skip lightest background color
            const opacity = 0.3 + ((shapeHash % 50) / 100); // 0.3-0.8

            shapes.push({ type, x, y, size, rotation, color: palette[colorIndex], opacity });
        }

        return { palette, shapes };
    }, [seed]);

    return (
        <div className={`w-full h-full overflow-hidden ${className}`} style={{ backgroundColor: palette[0] }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                {shapes.map((shape, i) => {
                    if (shape.type === 0) {
                        return (
                            <circle
                                key={i}
                                cx={shape.x}
                                cy={shape.y}
                                r={shape.size / 2}
                                fill={shape.color}
                                fillOpacity={shape.opacity}
                            />
                        );
                    } else if (shape.type === 1) {
                        return (
                            <rect
                                key={i}
                                x={shape.x - shape.size / 2}
                                y={shape.y - shape.size / 2}
                                width={shape.size}
                                height={shape.size}
                                rx={shape.size / 4}
                                fill={shape.color}
                                fillOpacity={shape.opacity}
                                transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
                            />
                        );
                    } else {
                        // Simple triangle/polygon
                        const s = shape.size / 2;
                        return (
                            <path
                                key={i}
                                d={`M ${shape.x} ${shape.y - s} L ${shape.x + s} ${shape.y + s} L ${shape.x - s} ${shape.y + s} Z`}
                                fill={shape.color}
                                fillOpacity={shape.opacity}
                                transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
                            />
                        );
                    }
                })}

                {/* Overlay gradient for depth */}
                <defs>
                    <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="black" stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grad-${seed})`} />
            </svg>
        </div>
    );
};
