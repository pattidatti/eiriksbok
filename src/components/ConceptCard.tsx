import React from 'react';
import type { Concept } from '../types';
import { ImmersiveCard } from './ImmersiveCard';
import './ConceptCard.css';

interface ConceptCardProps {
    concept: Concept;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept }) => {
    return (
        <ImmersiveCard className="concept-card">
            <div className="card-content">
                <h3 className="card-term">{concept.term}</h3>
                <p className="card-definition">{concept.definition}</p>
                <div className="card-example">
                    <strong>Eksempel:</strong> {concept.example}
                </div>
            </div>
        </ImmersiveCard>
    );
};