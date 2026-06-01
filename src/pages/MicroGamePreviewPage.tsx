import { Link, useParams } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Clock } from 'lucide-react';
import { MICRO_GAMES } from '../components/microgames/registry';
import { MicroGameBlock } from '../components/microgames/MicroGameBlock';

// Isolert preview-/testrute for mikrospill. Lar oss (og de automatiske
// cron-jobbene) teste et mikrospill kant-i-kant uten å embedde det i en artikkel
// først. Galleri på /mikrospill, enkeltspill på /mikrospill/:gameId.
export function MicroGamePreviewPage() {
    const { gameId } = useParams<{ gameId?: string }>();
    const games = Object.values(MICRO_GAMES);

    if (gameId) {
        const entry = MICRO_GAMES[gameId];
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <Link
                            to="/mikrospill"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-amber-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Alle mikrospill
                        </Link>
                        <span className="text-xs font-mono text-slate-400">{gameId}</span>
                    </div>
                    {entry ? (
                        <MicroGameBlock gameId={gameId} />
                    ) : (
                        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900">
                            <p className="font-semibold">Fant ikke mikrospillet «{gameId}».</p>
                            <p className="text-sm mt-1">
                                Sjekk at id-en er registrert i{' '}
                                <code>src/components/microgames/registry.ts</code>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Mikrospill - preview</h1>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                    Isolert testrute. {games.length} registrerte mikrospill. Klikk for å spille kant-i-kant.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {games.map((g) => (
                        <Link
                            key={g.id}
                            to={`/mikrospill/${g.id}`}
                            className="block rounded-2xl border-2 border-amber-200 bg-white p-4 hover:border-amber-400 hover:shadow-sm transition"
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h2 className="font-bold text-slate-900">{g.title}</h2>
                                {g.estimatedSeconds !== undefined && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {g.estimatedSeconds < 60
                                            ? `${g.estimatedSeconds}s`
                                            : `${Math.round(g.estimatedSeconds / 60)} min`}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 leading-snug">{g.description}</p>
                            <p className="text-[11px] font-mono text-amber-700 mt-2">{g.id}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MicroGamePreviewPage;
