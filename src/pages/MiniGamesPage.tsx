import { Link } from 'react-router-dom';
import { skjoldborgConfig } from '../games/skjoldborg/SkjoldborgConfig';
import { wattLabConfig } from '../games/watt-lab/WattLabConfig';
import { lindisfarneConfig } from '../games/lindisfarne-793/LindisfarneConfig';
import { fordFactoryConfig } from '../games/ford-factory/FordFactoryConfig';
import { demoWorldConfig } from '../games/demo-world/DemoWorldConfig';
import { blueprintQuestConfig } from '../games/blueprint-quest/BlueprintQuestConfig';
import type { GameConfig } from '../games/engine/types';

// All registered historical games - add new entries here.
// Blueprint-quest står først som referanse-implementasjon for nye spill.
const HISTORICAL_GAMES: GameConfig[] = [blueprintQuestConfig, skjoldborgConfig, wattLabConfig, lindisfarneConfig, fordFactoryConfig, demoWorldConfig];

const subjectColors: Record<string, string> = {
    historie: 'bg-amber-100 text-amber-800',
    norsk: 'bg-blue-100 text-blue-800',
    krle: 'bg-purple-100 text-purple-800',
    samfunnsfag: 'bg-green-100 text-green-800',
    musikk: 'bg-pink-100 text-pink-800',
};

const subjectLabels: Record<string, string> = {
    historie: 'Historie',
    norsk: 'Norsk',
    krle: 'KRLE',
    samfunnsfag: 'Samfunnsfag',
    musikk: 'Musikk',
};

export function MiniGamesPage() {
    return (
        <div className="min-h-screen pt-6 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 text-slate-900">
                        Historiske Spill
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Lev deg inn i historien. Utforsk, samle, og løs gåter fra fortiden.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HISTORICAL_GAMES.map((game) => (
                        <Link
                            key={game.id}
                            to={`/oving/spill/${game.id}`}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-44 bg-stone-800 overflow-hidden">
                                {game.thumbnail ? (
                                    <img
                                        src={game.thumbnail}
                                        alt={game.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4">
                                    <h2 className="text-xl font-display font-bold text-white leading-tight">
                                        {game.title}
                                    </h2>
                                    <p className="text-xs text-stone-300 mt-0.5 tracking-widest uppercase">
                                        {game.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            subjectColors[game.subject] ?? 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {subjectLabels[game.subject] ?? game.subject}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                    {game.description}
                                </p>
                            </div>

                            {/* Play button */}
                            <div className="px-4 pb-4">
                                <div className="w-full py-2 rounded-xl bg-amber-600 text-white text-center text-sm font-semibold group-hover:bg-amber-500 transition-colors duration-200">
                                    Spill nå →
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Coming soon placeholder */}
                    <div className="relative bg-white/50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 min-h-[280px]">
                        <div className="text-4xl opacity-30">🏛</div>
                        <p className="text-slate-400 text-sm text-center font-medium">
                            Flere spill kommer snart
                        </p>
                        <p className="text-slate-300 text-xs text-center max-w-[180px]">
                            Vikingtokt, Bostonopprøret og mer er på vei.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
