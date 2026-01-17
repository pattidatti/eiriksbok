import React from 'react';
import { Skeleton } from '../Skeleton';

export const LessonSkeleton: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {/* Hero Image Skeleton */}
            <div className="aspect-video w-full rounded-xl overflow-hidden mb-8 bg-slate-900/5 relative">
                <Skeleton className="absolute inset-0 w-full h-full" />
            </div>

            {/* Header Content */}
            <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                </div>

                <Skeleton className="h-12 w-3/4" />

                <div className="flex gap-8 border-y border-slate-200/50 py-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>

            {/* Article Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>

                {/* Sidebar Skeleton */}
                <div className="hidden lg:block space-y-8">
                    <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};
