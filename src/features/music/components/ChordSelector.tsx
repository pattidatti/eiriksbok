import { NOTES_SHARP, CHORD_QUALITIES } from '../utils/musicTheory';

interface ChordSelectorProps {
    root: string;
    quality: string;
    onRootChange: (root: string) => void;
    onQualityChange: (quality: string) => void;
}

export const ChordSelector: React.FC<ChordSelectorProps> = ({ root, quality, onRootChange, onQualityChange }) => {

    // Helper to get available qualities from our definition
    const availableQualities = Object.keys(CHORD_QUALITIES);

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Root Note Selector (Keyboard Strip) */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Grunntone</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                    {NOTES_SHARP.map((note) => (
                        <button
                            key={note}
                            onClick={() => onRootChange(note)}
                            className={`
                                flex-shrink-0 w-10 h-14 rounded-lg font-bold text-lg transition-all flex items-center justify-center border-b-4
                                ${root === note
                                    ? 'bg-indigo-600 text-white border-indigo-800 shadow-lg transform -translate-y-1'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'}
                            `}
                        >
                            {note}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quality Selector (Chips) */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                <div className="flex flex-wrap gap-2">
                    {availableQualities.map((q) => (
                        <button
                            key={q}
                            onClick={() => onQualityChange(q)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-bold transition-all border
                                ${quality === q
                                    ? 'bg-slate-800 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'}
                            `}
                        >
                            {/* Use label but remove redundant text if needed, or just key if label is long */}
                            {q === 'Major' ? 'Major (Dur)' :
                                q === 'Minor' ? 'Minor (Moll)' :
                                    q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
