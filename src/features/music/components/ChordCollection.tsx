import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus } from 'lucide-react';
import { CHORD_QUALITIES } from '../utils/musicTheory';

interface SavedChord {
    id: string;
    root: string;
    quality: string;
    timestamp: number;
}

interface ChordCollectionProps {
    currentRoot: string;
    currentQuality: string;
    onLoadChord: (root: string, quality: string) => void;
}

export const ChordCollection: React.FC<ChordCollectionProps> = ({ currentRoot, currentQuality, onLoadChord }) => {
    const [savedChords, setSavedChords] = useState<SavedChord[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('akkordbank_collection');
        if (stored) {
            try {
                setSavedChords(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved chords", e);
            }
        }
    }, []);

    // Save to localStorage whenever list changes
    const persist = (chords: SavedChord[]) => {
        setSavedChords(chords);
        localStorage.setItem('akkordbank_collection', JSON.stringify(chords));
    };

    const handleSave = () => {
        const newChord: SavedChord = {
            id: Date.now().toString(),
            root: currentRoot,
            quality: currentQuality,
            timestamp: Date.now()
        };
        persist([...savedChords, newChord]);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        persist(savedChords.filter(c => c.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    Mine Akkorder
                </h3>

                <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Lagre denne akkorden
                </button>
            </div>

            {savedChords.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>Du har ingen lagrede akkorder enda.</p>
                    <p className="text-sm mt-1">Trykk på "Lagre denne akkorden" for å samle favorittene dine.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {savedChords.map(chord => (
                        <div
                            key={chord.id}
                            onClick={() => onLoadChord(chord.root, chord.quality)}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer group hover:border-indigo-300 hover:shadow-md transition-all relative"
                        >
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-slate-800">
                                    {chord.root}
                                    <span className="text-lg font-normal text-slate-500 ml-1">
                                        {CHORD_QUALITIES[chord.quality as keyof typeof CHORD_QUALITIES]?.label.split(' ')[0]}
                                    </span>
                                </span>
                            </div>

                            <button
                                onClick={(e) => handleRemove(chord.id, e)}
                                className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Fjern"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
