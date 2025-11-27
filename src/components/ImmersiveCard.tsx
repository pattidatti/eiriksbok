import React from 'react';
import './ImmersiveCard.css';

interface ImmersiveCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ children, className = '', onClick }) => {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            className={`immersive-card ${className}`}
            onMouseMove={handleMouseMove}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
