import React from 'react';
import type { Concept } from '../types';
import './ConceptCard.css';

interface ConceptCardProps {
    concept: Concept;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept }) => {
    
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
            className="immersive-card"
            onMouseMove={handleMouseMove}
        >
            <div className="card-content">
                <h3 className="card-term">{concept.term}</h3>
                <p className="card-definition">{concept.definition}</p>
                <div className="card-example">
                    <strong>Eksempel:</strong> {concept.example}
                </div>
            </div>
        </div>
    );
};