import React from 'react';
import type { Context, Concept } from '../types';
import './ContextBuilder.css';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ContextBuilderProps {
    context: Context;
    concepts: Concept[];
}

export const ContextBuilder: React.FC<ContextBuilderProps> = ({ context, concepts }) => {
    const getConceptTerm = (id: string) => concepts.find(c => c.id === id)?.term || id;

    if (!context.connections || context.connections.length === 0) {
        return null;
    }

    return (
        <div className="context-builder">
            <h3>Sammenhenger</h3>
            <div className="connections-list">
                {context.connections.map((conn, index) => (
                    <motion.div
                        key={index}
                        className="connection-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="concept-node">{getConceptTerm(conn.from)}</span>
                        <div className="connection-arrow">
                            <span className="connection-label">{conn.label}</span>
                            <ArrowRight size={20} />
                        </div>
                        <span className="concept-node">{getConceptTerm(conn.to)}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
