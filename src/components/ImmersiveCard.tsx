import React from 'react';
import './ImmersiveCard.css';

interface ImmersiveCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`immersive-card ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
