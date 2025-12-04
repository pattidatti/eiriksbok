import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchReligion } from '../utils/contentLoader';
import { DimensionComparison } from '../components/religion/DimensionComparison';
import { PageSkeleton } from '../components/Skeleton';
import type { Religion } from '../types';

export const ReligionComparisonPage: React.FC = () => {
    // Fetch all religions
    const { data: kristendom, isLoading: loadingK } = useQuery({ queryKey: ['religion', 'kristendom'], queryFn: () => fetchReligion('kristendom') });
    const { data: islam, isLoading: loadingI } = useQuery({ queryKey: ['religion', 'islam'], queryFn: () => fetchReligion('islam') });
    const { data: buddhisme, isLoading: loadingB } = useQuery({ queryKey: ['religion', 'buddhisme'], queryFn: () => fetchReligion('buddhisme') });
    const { data: jodedom, isLoading: loadingJ } = useQuery({ queryKey: ['religion', 'jodedom'], queryFn: () => fetchReligion('jodedom') });
    const { data: hinduisme, isLoading: loadingH } = useQuery({ queryKey: ['religion', 'hinduisme'], queryFn: () => fetchReligion('hinduisme') });
    const { data: bahai, isLoading: loadingBa } = useQuery({ queryKey: ['religion', 'bahai'], queryFn: () => fetchReligion('bahai') });
    const { data: mormonisme, isLoading: loadingM } = useQuery({ queryKey: ['religion', 'mormonisme'], queryFn: () => fetchReligion('mormonisme') });
    const { data: jehovas, isLoading: loadingJe } = useQuery({ queryKey: ['religion', 'jehovas-vitner'], queryFn: () => fetchReligion('jehovas-vitner') });

    const isLoading = loadingK || loadingI || loadingB || loadingJ || loadingH || loadingBa || loadingM || loadingJe;

    if (isLoading) return <PageSkeleton />;

    const religions: Religion[] = [];
    if (kristendom) religions.push(kristendom);
    if (islam) religions.push(islam);
    if (buddhisme) religions.push(buddhisme);
    if (jodedom) religions.push(jodedom);
    if (hinduisme) religions.push(hinduisme);
    if (bahai) religions.push(bahai);
    if (mormonisme) religions.push(mormonisme);
    if (jehovas) religions.push(jehovas);

    const POPULAR_TOPICS = [
        { id: 'sentrale_trekk', label: 'Sentrale trekk' },
        { id: 'bønn', label: 'Bønn' },
        { id: 'skapelse', label: 'Skapelsen' },
        { id: 'døden', label: 'Døden' },
        { id: 'gudsbilde', label: 'Gudsbilde' },
        { id: 'hellige_tekster', label: 'Hellige tekster' },
        { id: 'overgangsriter', label: 'Overgangsriter' },
    ];

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
                <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8">
                    Utforsk likheter og forskjeller gjennom Ninian Smarts 7 dimensjoner eller velg et spesifikt tema.
                </p>

                {/* Topic Selector */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {POPULAR_TOPICS.map((topic) => (
                        <Link
                            key={topic.id}
                            to={`/krle/sammenlign/tema/${topic.id}`}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                        >
                            #{topic.label}
                        </Link>
                    ))}
                </div>
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
