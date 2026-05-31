import { useState } from 'react';
import { Swords, Banknote, Flag, Tag, Crown, Landmark, Ship, TrendingUp, Target } from 'lucide-react';

interface KolonimaktSkifteProps {
    title?: string;
}

interface Aspect {
    name: string;
    oldIcon: typeof Swords;
    newIcon: typeof Banknote;
    oldText: string;
    newText: string;
}

const ASPECTS: Aspect[] = [
    {
        name: 'Maktmiddel',
        oldIcon: Swords,
        newIcon: Banknote,
        oldText: 'Soldater, kanoner og erobring.',
        newText: 'Lån, gjeld og renter.',
    },
    {
        name: 'Ansikt utad',
        oldIcon: Flag,
        newIcon: Tag,
        oldText: 'Fremmede flagg og en guvernør.',
        newText: 'Merkevarer og store selskaper.',
    },
    {
        name: 'Hvem bestemmer',
        oldIcon: Crown,
        newIcon: Landmark,
        oldText: 'Kolonien styres direkte fra Europa.',
        newText: 'IMF og banker setter betingelsene.',
    },
    {
        name: 'Hvor rikdommen går',
        oldIcon: Ship,
        newIcon: TrendingUp,
        oldText: 'Råvarer fraktes til moderlandet.',
        newText: 'Billige råvarer og renter strømmer til vesten.',
    },
];

export function KolonimaktSkifte({
    title = 'Gammelt og nytt: dra i tiden',
}: KolonimaktSkifteProps) {
    const [value, setValue] = useState(0); // 0 = år 1900, 100 = i dag
    const v = value / 100;
    const year = Math.round(1900 + v * 125);
    const era = value < 50 ? 'Gammel kolonialisme' : 'Nykolonialisme';

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-500">
                Kolonitiden tok ikke slutt - den byttet klær. Dra i håndtaket og se hva som forandrer seg,
                og hva som forblir likt.
            </p>

            {/* Tidslinje-slider */}
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                <span className={value < 50 ? 'text-amber-700' : 'text-slate-400'}>1900 · Da</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">{year}</span>
                <span className={value >= 50 ? 'text-rose-700' : 'text-slate-400'}>I dag · Nå</span>
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="mb-1 w-full cursor-pointer accent-slate-900"
                aria-label="Dra fra fortid til nåtid"
            />
            <p className="mb-4 text-center text-sm font-bold text-slate-700">{era}</p>

            {/* Aspekt-kort som morpher */}
            <div className="grid gap-2.5 sm:grid-cols-2">
                {ASPECTS.map((a) => {
                    const ShowIcon = value < 50 ? a.oldIcon : a.newIcon;
                    return (
                        <div
                            key={a.name}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors duration-300"
                                    style={{
                                        backgroundColor: value < 50 ? '#b45309' : '#be123c',
                                    }}
                                >
                                    <ShowIcon className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {a.name}
                                </span>
                            </div>
                            {/* Crossfade gammel/ny tekst */}
                            <div className="relative min-h-[40px]">
                                <p
                                    className="absolute inset-0 text-sm font-medium text-amber-800 transition-opacity duration-200"
                                    style={{ opacity: 1 - v }}
                                >
                                    {a.oldText}
                                </p>
                                <p
                                    className="absolute inset-0 text-sm font-medium text-rose-800 transition-opacity duration-200"
                                    style={{ opacity: v }}
                                >
                                    {a.newText}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Det som ikke endrer seg */}
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-900 p-3.5 text-white">
                <Target className="h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-sm font-medium">
                    Uansett hvor du drar håndtaket: målet er det samme - kontroll over andres ressurser
                    og rikdom.
                </p>
            </div>
        </div>
    );
}
