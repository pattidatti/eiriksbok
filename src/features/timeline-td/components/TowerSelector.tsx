import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { TowerType } from '../store/gameStore';

type TowerDefinition = {
    type: TowerType;
    name: string;
    cost: number;
    description: string;
    damage: number;
    range: number;
    cooldown: number;
    color: string;
}

export const TOWER_TYPES: TowerDefinition[] = [
    {
        type: 'GUTENBERG',
        name: 'Gutenberg',
        cost: 100,
        description: 'Sprer kunnskap (AoE)',
        damage: 10,
        range: 100,
        cooldown: 1.5,
        color: 'bg-blue-500' // Visual helper
    },
    {
        type: 'DA_VINCI',
        name: 'Da Vinci',
        cost: 250,
        description: 'Mekanisk tank (Høy skade)',
        damage: 50,
        range: 150,
        cooldown: 2.5,
        color: 'bg-amber-600'
    },
    {
        type: 'TESLA',
        name: 'Tesla',
        cost: 400,
        description: 'Lynangrep (Kjede)',
        damage: 30,
        range: 120,
        cooldown: 0.8,
        color: 'bg-cyan-500'
    }
];

interface TowerSelectorProps {
    onSelect: (tower: TowerDefinition) => void;
    selectedType: TowerType | null;
}

export const TowerSelector: React.FC<TowerSelectorProps> = ({ onSelect, selectedType }) => {
    const { money } = useGameStore();

    return (
        <div className="space-y-3">
            {TOWER_TYPES.map((tower) => {
                const canAfford = money >= tower.cost;
                const isSelected = selectedType === tower.type;

                return (
                    <div
                        key={tower.type}
                        onClick={() => canAfford ? onSelect(tower) : null}
                        className={`
                            p-3 border rounded-lg cursor-pointer transition-all
                            ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50' : 'border-slate-200 bg-white'}
                            ${canAfford ? 'hover:border-indigo-400' : 'opacity-50 cursor-not-allowed grayscale'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="font-bold text-slate-800">{tower.name}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${canAfford ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {tower.cost}g
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{tower.description}</div>
                        <div className="flex gap-2 text-[10px] text-slate-400">
                            <span>S: {tower.damage}</span>
                            <span>R: {tower.range}</span>
                            <span>CD: {tower.cooldown}s</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
