import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchPhilosopher } from '../utils/contentLoader';
import { PhilosopherDimensionComparison } from '../components/philosophy/PhilosopherDimensionComparison';
import { PageSkeleton } from '../components/Skeleton';
import type { Philosopher } from '../types';

export const PhilosophyComparisonPage: React.FC = () => {
    // Fetch philosophers
    const { data: sokrates, isLoading: loadingS } = useQuery({ queryKey: ['philosophy', 'sokrates'], queryFn: () => fetchPhilosopher('sokrates') });
    const { data: platon, isLoading: loadingP } = useQuery({ queryKey: ['philosophy', 'platon'], queryFn: () => fetchPhilosopher('platon') });
    const { data: aristoteles, isLoading: loadingA } = useQuery({ queryKey: ['philosophy', 'aristoteles'], queryFn: () => fetchPhilosopher('aristoteles') });
    const { data: kant, isLoading: loadingK } = useQuery({ queryKey: ['philosophy', 'kant'], queryFn: () => fetchPhilosopher('kant') });
    const { data: nietzsche, isLoading: loadingN } = useQuery({ queryKey: ['philosophy', 'nietzsche'], queryFn: () => fetchPhilosopher('nietzsche') });
    const { data: mises, isLoading: loadingM } = useQuery({ queryKey: ['philosophy', 'mises'], queryFn: () => fetchPhilosopher('mises') });
    const { data: rothbard, isLoading: loadingR } = useQuery({ queryKey: ['philosophy', 'rothbard'], queryFn: () => fetchPhilosopher('rothbard') });

    const isLoading = loadingS || loadingP || loadingA || loadingK || loadingN || loadingM || loadingR;

    if (isLoading) return <PageSkeleton />;

    const philosophers: Philosopher[] = [];
    if (sokrates) philosophers.push(sokrates);
    if (platon) philosophers.push(platon);
    if (aristoteles) philosophers.push(aristoteles);
    if (kant) philosophers.push(kant);
    if (nietzsche) philosophers.push(nietzsche);
    if (mises) philosophers.push(mises);
    if (rothbard) philosophers.push(rothbard);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <Link to="/krle" className="text-sm text-text-muted hover:text-text-main mb-4 inline-block">
                    ← Tilbake til oversikt
                </Link>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-text-main mb-6">
                    Sammenlign Filosofer
                </h1>
                <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8">
                    Utforsk likheter og forskjeller mellom noen av historiens mest innflytelsesrike tenkere langs fem sentrale dimensjoner.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <PhilosopherDimensionComparison philosophers={philosophers} />
            </motion.div>
        </div>
    );
};
