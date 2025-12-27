import React from 'react';

interface GameCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

export const GameCard: React.FC<GameCardProps> = ({ children, className = '', title, action }) => {
    return (
        <div className={`relative bg-game-ink/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
            {/* Header if title exists */}
            {(title || action) && (
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                    {title && <h3 className="font-display font-bold text-game-gold tracking-wider uppercase text-sm">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
