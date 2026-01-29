import React from 'react';
import { useDeskStore } from '../../../stores/useDeskStore';
import { BookOpen, Star } from 'lucide-react';

export const Scrapbook: React.FC = () => {
    const { inventory } = useDeskStore();

    return (
        <div className="w-full h-full p-8">
            <header className="mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif text-amber-200/90 mb-1">Min Samling</h2>
                    <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Arkiverte Funn</p>
                </div>
                <div className="text-amber-500 font-mono text-xl flex items-center gap-2">
                    <BookOpen size={20} />
                    {inventory.length}
                </div>
            </header>

            {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-600 border-2 border-dashed border-stone-800 rounded-xl">
                    <Star size={48} className="mb-4 opacity-20" />
                    <p className="font-serif italic text-lg">Samlingen din er tom...</p>
                    <p className="text-xs font-mono mt-2 uppercase tracking-wider">Utforsk X-Ray for å finne elementer</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((itemId, i) => (
                        <div key={i} className="bg-stone-900/60 backdrop-blur-md border border-white/5 p-6 rounded-xl hover:border-amber-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                    <Star size={14} />
                                </div>
                                <h3 className="text-stone-200 font-serif text-lg">{itemId}</h3>
                            </div>
                            <p className="text-stone-500 text-xs font-mono uppercase tracking-wide">Funnet i: Jakten på Skatten</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
