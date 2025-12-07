import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { BarChart, Activity, BookOpen } from 'lucide-react';

interface ViewData {
    id: string;
    count: number;
    title: string;
    type: 'topic' | 'lesson';
}

export const StatsPage: React.FC = () => {
    const [data, setData] = useState<ViewData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyticsRef = ref(db, 'analytics/views');

        // Listen for real-time updates
        const unsubscribe = onValue(analyticsRef, (snapshot) => {
            const raw = snapshot.val();
            if (!raw) {
                setData([]);
                setLoading(false);
                return;
            }

            const formatted: ViewData[] = Object.entries(raw).map(([key, value]) => {
                // Key format: subject_topic_lesson or subject_topic
                // Reconstruct readable title/path from safe ID (underscores back to slashes-ish)
                const parts = key.split('_');
                let type: 'topic' | 'lesson' = 'lesson';
                let title = key;

                // Simple heuristic: if 2 parts (subject_topic), likely topic. If 3+, lesson.
                // Note: subtopics make this harder, but good enough for v1.
                if (parts.length === 2) {
                    type = 'topic';
                }

                // Make prettier title
                title = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');

                return {
                    id: key,
                    count: value as number,
                    title: title,
                    type
                };
            });

            // Sort by views desc
            formatted.sort((a, b) => b.count - a.count);
            setData(formatted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const totalViews = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <BarChart className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900">Lesestatistikk</h1>
                        <p className="text-slate-500">Oversikt over populært innhold</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Totale Visninger</div>
                            <div className="text-3xl font-bold text-slate-900">{totalViews}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Unike Artikler Lest</div>
                            <div className="text-3xl font-bold text-slate-900">{data.length}</div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Mest leste innhold</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Laster data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 w-20">Rank</th>
                                        <th className="px-6 py-4">Tittel / Sti</th>
                                        <th className="px-6 py-4 text-right">Visninger</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-slate-200 text-slate-700' :
                                                            index === 2 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}
                                                `}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{item.title}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-1">{item.id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                                                    {item.count}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                Ingen data registrert ennå.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
