import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetectiveEngine } from '../components/content/interactive/detective/DetectiveEngine';
import type { DetectiveCase } from '../components/content/interactive/detective/types';
import { useLayout } from '../context/LayoutContext';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DetectiveCasePage: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const [caseData, setCaseData] = useState<DetectiveCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setFullWidth } = useLayout();

    useEffect(() => {
        // Force full width for the detective experience
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    useEffect(() => {
        const fetchCase = async () => {
            setLoading(true);
            try {
                // Determine which JSON to load. Default to greenland.
                const idToLoad = caseId || 'greenland';

                // Construct path for local development/production
                const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/content/interactive/detective/${idToLoad}.json`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Klarte ikke å laste saken: ${response.statusText}`);
                }
                const data = await response.json();
                setCaseData(data);
                setError(null);
            } catch (err) {
                console.error("Error loading detective case:", err);
                setError(err instanceof Error ? err.message : "En uventet feil oppstod");
            } finally {
                setLoading(false);
            }
        };

        fetchCase();
    }, [caseId]);

    const handleBack = () => {
        // If we came from a specific topic, we might want to go back there, 
        // but for now, going back to the hub is safest.
        navigate('/oving/detektiv');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            {/* Minimal Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Avslutt etterforskning</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Aktiv Etterforskning
                    </span>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900"
                        >
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="text-slate-400 font-medium italic">Samler kildemateriale...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Ops! Noe gikk galt</h2>
                            <p className="text-slate-400 max-w-md mb-8">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Prøv igjen
                            </button>
                        </motion.div>
                    ) : caseData ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full"
                        >
                            <DetectiveEngine data={caseData} />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
        </div>
    );
};
