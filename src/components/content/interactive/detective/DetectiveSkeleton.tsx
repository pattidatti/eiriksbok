import React from 'react';
import { Skeleton } from '../../../Skeleton';

export const DetectiveSkeleton: React.FC = () => {
    return (
        <div className="relative bg-[#0a0c10] text-slate-200 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar / Case File Skeleton */}
            <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900/50 p-6 space-y-8 hidden md:block">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4 bg-slate-800/50" />
                    <Skeleton className="h-4 w-1/2 bg-slate-800/30" />
                </div>

                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full bg-slate-800/50" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 bg-slate-800/40" />
                                <Skeleton className="h-3 w-1/2 bg-slate-800/30" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Investigation Area Skeleton */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24 bg-indigo-900/20" />
                        <Skeleton className="h-8 w-64 bg-slate-800/50" />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 space-y-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl bg-slate-800/20" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full bg-slate-800/30" />
                            <Skeleton className="h-4 w-full bg-slate-800/30" />
                            <Skeleton className="h-4 w-2/3 bg-slate-800/30" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
