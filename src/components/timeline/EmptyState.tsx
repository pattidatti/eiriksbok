import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
    onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <SearchX className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
            Ingen hendelser passer
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5">
            Prøv å fjerne et filter, søke etter noe annet, eller bla i en annen
            epoke.
        </p>
        <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
        >
            Nullstill alle filtre
        </button>
    </div>
);
