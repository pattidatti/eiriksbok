import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    color?: 'purple' | 'red' | 'yellow' | 'cyan' | 'blue' | 'green';
}

export const Slider: React.FC<SliderProps> = ({ className = '', color = 'blue', ...props }) => {
    const accentColors = {
        purple: 'accent-purple-500',
        red: 'accent-red-500',
        yellow: 'accent-yellow-500',
        cyan: 'accent-cyan-500',
        blue: 'accent-blue-600',
        green: 'accent-green-500',
    };

    return (
        <input
            type="range"
            className={`w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer ${accentColors[color]} ${className}`}
            {...props}
        />
    );
};
