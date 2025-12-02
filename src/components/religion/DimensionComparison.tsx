import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { Link } from 'react-router-dom';
import { client } from '../../../tina/__generated__/client';
import type { Religion } from '../../types';

interface DimensionComparisonProps {
    religions: Religion[];
}

const DIMENSIONS = [
    { key: 'ritual', label: 'Ritualer og kult' },
    { key: 'narrative', label: 'Fortellinger og myter' },
    { key: 'experiential', label: 'Opplevelser og erfaringer' },
    { key: 'social', label: 'Sosial organisering' },
    { key: 'ethical', label: 'Etikk og moral' },
    { key: 'doctrinal', label: 'Lære og filosofi' },
    { key: 'material', label: 'Materielle uttrykk' },
] as const;

export const DimensionComparison: React.FC<DimensionComparisonProps> = ({ religions }) => {
    const [activeDim, setActiveDim] = useState<typeof DIMENSIONS[number]['key']>('ritual');
    const [linkedArticles, setLinkedArticles] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await client.queries.articleConnection({
                    filter: { dimension: { eq: activeDim } }
                });
                const articles = res.data.articleConnection.edges?.map(e => e?.node) || [];

                const grouped: Record<string, any[]> = {};
                articles.forEach((article: any) => {
                    if (article?.religion) {
                        // Handle reference (might be object or string path)
                        const ref = article.religion;
                        let religionId = '';
                        if (typeof ref === 'string') {
                            religionId = ref.split('/').pop()?.replace('.json', '') || '';
                        } else if (ref._sys) {
                            religionId = ref._sys.filename;
                        }

                        if (religionId) {
                            if (!grouped[religionId]) grouped[religionId] = [];
                            grouped[religionId].push(article);
                        }
                    }
                });
                setLinkedArticles(grouped);
            } catch (e) {
                console.error("Error fetching linked articles", e);
            }
        };
        fetchArticles();
    }, [activeDim]);

    return (
        <div className="space-y-8">
            {/* Dimension Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {DIMENSIONS.map((dim) => (
                    <button
                        key={dim.key}
                        onClick={() => setActiveDim(dim.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeDim === dim.key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'bg-bg-card border border-border-main text-text-muted hover:text-text-main hover:border-indigo-500/50'
                            }`}
                    >
                        {dim.label}
                    </button>
                ))}
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {religions.map((religion) => (
                    <motion.div
                        key={religion.id}
                        layoutId={`card-${religion.id}`}
                        className="bg-bg-card border border-border-main rounded-2xl overflow-hidden flex flex-col shadow-sm"
                    >
                        <div
                            className="p-4 border-b border-border-main flex items-center gap-3"
                            style={{ borderTop: `4px solid ${religion.color || '#6366f1'}` }}
                        >
                            <h3 className="font-display font-bold text-lg text-text-main">
                                {religion.name}
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="prose prose-sm max-w-none text-text-main prose-headings:text-text-main prose-p:text-text-muted prose-strong:text-text-main mb-6">
                                {religion.dimensions[activeDim] ? (
                                    <TinaMarkdown content={religion.dimensions[activeDim]} />
                                ) : (
                                    <p className="text-text-muted italic">Ingen informasjon tilgjengelig.</p>
                                )}
                            </div>

                            {/* Linked Articles */}
                            {linkedArticles[religion.id] && linkedArticles[religion.id].length > 0 && (
                                <div className="mt-auto pt-4 border-t border-border-main">
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                        Fordypning
                                    </h4>
                                    <ul className="space-y-2">
                                        {linkedArticles[religion.id].map((article) => (
                                            <li key={article.id}>
                                                <Link
                                                    to={`/${article._sys.breadcrumbs.join('/')}`}
                                                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
                                                >
                                                    <span className="group-hover:underline">{article.title}</span>
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
