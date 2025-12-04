import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { client } from '../../tina/__generated__/client';
import { PageSkeleton } from '../components/Skeleton';
import { ArticleContent } from '../components/ArticleContent';
import { fetchReligion } from '../utils/contentLoader';

export const TopicComparisonPage: React.FC = () => {
    const { tag } = useParams<{ tag: string }>();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            if (!tag) return;
            setLoading(true);

            let allArticles: any[] = [];

            // Attempt 1: Try Tina Client
            try {
                const res = await client.queries.articleConnection({ first: 100 });
                allArticles = res.data.articleConnection.edges?.map(e => e?.node) || [];
            } catch (e: any) {
                console.warn("Tina client failed, falling back to manual fetch", e);
            }

            // Attempt 2: Fallback to manual fetch if Tina failed or returned nothing
            if (allArticles.length === 0) {
                try {
                    const religions = ['kristendom', 'islam', 'jodedom', 'buddhisme', 'hinduisme', 'sikhisme', 'bahai', 'jehovas-vitner', 'mormonisme'];
                    const potentialArticles: any[] = [];
                    const tagSlug = tag.replace(/_/g, '-');

                    await Promise.all(religions.map(async (religion) => {
                        try {
                            const path = `content/krle/religion/${religion}/${tagSlug}/artikkel.json`;
                            const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
                            const res = await fetch(`${basePath}${path}`);
                            if (res.ok) {
                                const data = await res.json();
                                data._sys = { breadcrumbs: ['krle', 'religion', religion, tagSlug, 'artikkel'] };
                                potentialArticles.push(data);
                            }
                        } catch (err) {
                            // Ignore
                        }
                    }));

                    allArticles = potentialArticles;
                } catch (fallbackError: any) {
                    console.error("Fallback fetch failed", fallbackError);
                }
            }

            try {
                const filtered = allArticles.filter((article: any) => {
                    return article?.comparison_tags?.includes(tag);
                });

                // Enrich articles with religion data
                const enrichedArticles = await Promise.all(filtered.map(async (article: any) => {
                    if (article.religion) {
                        const religionData = await fetchReligion(article.religion);
                        return { ...article, religionData };
                    }
                    return article;
                }));

                setArticles(enrichedArticles);
            } catch (e: any) {
                console.error("Error processing articles", e);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [tag]);

    if (loading) return <PageSkeleton />;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <Link to="/krle/sammenlign" className="text-sm text-text-muted hover:text-text-main mb-4 inline-block">
                    ← Tilbake til oversikt
                </Link>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-text-main mb-6 capitalize">
                    {tag?.replace(/_/g, ' ')}
                </h1>
                <p className="text-xl text-text-muted max-w-2xl mx-auto">
                    Sammenligning på tvers av religioner.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                    <motion.div
                        key={`${article.id}-${article.religion || index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-bg-card border border-border-main rounded-2xl overflow-hidden flex flex-col shadow-sm"
                    >
                        <div
                            className="p-4 border-b border-border-main bg-bg-subtle flex items-center gap-3"
                            style={{ borderLeft: article.religionData?.color ? `4px solid ${article.religionData.color}` : undefined }}
                        >
                            {article.religionData?.icon && (
                                <img src={article.religionData.icon} alt="" className="w-6 h-6 object-contain" />
                            )}
                            <h3 className="font-display font-bold text-lg text-text-main capitalize">
                                {article.religionData?.name || article.religion || "Ukjent Religion"}
                            </h3>
                        </div>
                        <div className="p-6 flex flex-col h-full">
                            <h4 className="text-xl font-bold mb-4 text-text-main">{article.title}</h4>

                            <div className="flex-grow prose prose-indigo max-w-none mb-6">
                                {article.content ? (
                                    <ArticleContent content={article.content} />
                                ) : (
                                    <p className="text-text-muted italic">Ingen innhold tilgjengelig.</p>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-border-subtle">
                                <Link
                                    to={`/${article._sys.breadcrumbs.join('/')}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                >
                                    Gå til full artikkel →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {articles.length === 0 && (
                <div className="text-center text-text-muted py-12 bg-bg-subtle rounded-2xl border border-border-dashed">
                    <p>Ingen artikler funnet for dette temaet.</p>
                    <p className="text-sm mt-2">Prøv å legge til taggen "{tag}" på noen artikler i CMS.</p>
                </div>
            )}
        </div>
    );
};
