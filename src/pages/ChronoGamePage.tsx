import React from 'react';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { ChronoBoard } from '../components/games/chrono/ChronoBoard';
import { PageSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';

const ChronoGamePage: React.FC = () => {
    const { events, loading, error } = useGlobalTimeline();

    if (loading) return <PageSkeleton />;
    if (error) return <div className="p-8 text-center text-red-500">Klarte ikke laste spilldata. Prøv igjen senere.</div>;

    // Filter events to ensure they have valid dates and descriptions
    const validEvents = events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        startDate: e.startDate,
        displayDate: e.displayDate,
        sourceUrl: e.link
    })).filter(e => e.description && e.description.length > 10); // Simple filter to ensure quality cards

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/oving" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            <span>Tilbake</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Chrono Cards
                        </h1>
                    </div>
                    <div className="hidden sm:block text-sm text-slate-500 font-medium">
                        Plasser hendelsene i riktig rekkefølge!
                    </div>
                </div>
            </header>

            {/* Game Content */}
            <main className="p-4 sm:p-8">
                <ChronoBoard events={validEvents} onGameOver={(finalScore) => console.log('Game over with score:', finalScore)} />
            </main>
        </div>
    );
};

export default ChronoGamePage;
