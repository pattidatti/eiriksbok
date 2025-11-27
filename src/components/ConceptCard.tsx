import React from 'react';
import type { Concept } from '../types';
import './ConceptCard.css';
import { motion } from 'framer-motion';

interface ConceptCardProps {
    concept: Concept;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept }) => {
    return (
        <motion.div
            className="concept-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="concept-term">{concept.term}</h3>
            <p className="concept-definition">{concept.definition}</p>
            <div className="concept-example">
                <strong>Eksempel:</strong> {concept.example}
            </div>
        </motion.div>
    );
};
