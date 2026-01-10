import React, { useState } from 'react';
import { Package, Anchor, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PackItem {
    id: string;
    name: string;
    weight: number;
    value: number; // Pedagogical value/utility
    icon: string;
}

interface PackTheBagProps {
    capacity: number;
    items: PackItem[];
    targetValue: number; // Minimum value to win
    title?: string;
    descriptionOverride?: string;
    overweightLabel?: string;
    successLabel?: string;
    pendingLabel?: string;
}

export const PackTheBag: React.FC<PackTheBagProps> = ({
    capacity,
    items,
    targetValue,
    title = "Pakk sekken",
    descriptionOverride,
    overweightLabel = "Det er for tungt!",
    successLabel = "Alt er klart!",
    pendingLabel = "Mangler utstyr..."
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const currentWeight = items
        .filter(i => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.weight, 0);

    const currentValue = items
        .filter(i => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.value, 0);

    const isOverweight = currentWeight > capacity;
    const isSuccess = !isOverweight && currentValue >= targetValue;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto font-sans">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold">{title}</h3>
                </div>
                <div className={`font-mono font-bold text-sm px-3 py-1 rounded ${isOverweight ? 'bg-rose-500' : 'bg-emerald-600'}`}>
                    {currentWeight} / {capacity} kg
                </div>
            </div>

            <div className="p-6">
                <p className="text-slate-600 mb-6 text-sm">
                    {descriptionOverride || (items.length > 0 ? `Velg utstyr som gir nok verdi (${targetValue} poeng) uten å overstige grensen (${capacity} kg).` : "Ingen ting å pakke.")}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {items.map(item => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`
                                    p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group
                                    ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]'
                                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'}
                                `}
                            >
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                                <div className="flex justify-between text-xs font-mono text-slate-500">
                                    <span>{item.weight}kg</span>
                                    <span className="text-indigo-600 font-bold">+{item.value}p</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Status</div>
                        {isOverweight ? (
                            <div className="text-rose-600 font-bold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {overweightLabel}
                            </div>
                        ) : isSuccess ? (
                            <div className="text-emerald-600 font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {successLabel}
                            </div>
                        ) : (
                            <div className="text-amber-500 font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                {pendingLabel}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-900">{currentValue}</div>
                        <div className="text-xs text-slate-400">Verdi-poeng</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
