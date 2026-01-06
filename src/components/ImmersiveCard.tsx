import React from 'react';
import './ImmersiveCard.css';

interface ImmersiveCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ children, className = '', onClick }) => {
    if (onClick) {
        return (
            <button
                className={`immersive-card text-left w-full cursor-pointer hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                onClick={onClick}
                type="button"
            >
                {children}
            </button>
        );
    }

    return (
        <div className={`immersive-card ${className}`}>
            {children}
        </div>
    );
};
