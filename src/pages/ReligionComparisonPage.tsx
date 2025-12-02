import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchReligion } from '../utils/contentLoader';
import { DimensionComparison } from '../components/religion/DimensionComparison';
import { PageSkeleton } from '../components/Skeleton';
import type { Religion } from '../types';

export const ReligionComparisonPage: React.FC = () => {
    // Fetch multiple religions
    // In a real app, we would have a list endpoint or a selection mechanism
    const { data: kristendom, isLoading: loadingK } = useQuery({
        queryKey: ['religion', 'kristendom'],
        queryFn: () => fetchReligion('kristendom')
    });

    const { data: islam, isLoading: loadingI } = useQuery({
        queryKey: ['religion', 'islam'],
        queryFn: () => fetchReligion('islam')
    });

    const isLoading = loadingK || loadingI;

    if (isLoading) return <PageSkeleton />;

    const religions: Religion[] = [];
    if (kristendom) religions.push(kristendom);
    if (islam) religions.push(islam);

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
                    Sammenlign Religioner
                </h1>
                <p className="text-xl text-text-muted max-w-2xl mx-auto">
                    Utforsk likheter og forskjeller gjennom Ninian Smarts 7 dimensjoner.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <DimensionComparison religions={religions} />
            </motion.div>
        </div>
    );
};
