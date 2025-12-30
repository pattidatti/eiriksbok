import React from 'react';

interface ProductionHeaderProps {
    building?: {
        name: string;
        description: string;
        icon: string;
    };
    currentBuildingLevel: number;
    isStationWithRepair: boolean;
    viewMode: 'PRODUCE' | 'REPAIR';
    setViewMode: (mode: 'PRODUCE' | 'REPAIR') => void;
}

export const ProductionHeader: React.FC<ProductionHeaderProps> = ({
    building,
    currentBuildingLevel,
    isStationWithRepair,
    viewMode,
    setViewMode
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-indigo-500/30">
                    {building?.icon || '🏢'}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{building?.name || 'Produksjon'}</h2>
                    <p className="text-slate-400 text-sm font-medium">{building?.description} (Nivå {currentBuildingLevel})</p>
                </div>
            </div>

            {/* TAB SWITCHER */}
            {isStationWithRepair && (
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setViewMode('PRODUCE')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'PRODUCE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Produksjon
                    </button>
                    <button
                        onClick={() => setViewMode('REPAIR')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'REPAIR' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Reparasjon
                    </button>
                </div>
            )}
        </div>
    );
};
