import React from 'react';
import { TimelineView } from '../components/TimelineView';

const GlobalTimelinePage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Tidslinje</h1>
                <p className="text-xl text-slate-600 max-w-2xl">
                    Utforsk historien på tvers av fag. Se sammenhenger mellom litteratur, historiske hendelser og samfunnsutvikling.
                </p>
            </div>

            <TimelineView className="min-h-[600px]" />
        </div>
    );
};

export default GlobalTimelinePage;
