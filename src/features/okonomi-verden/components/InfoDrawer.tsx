import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorldStore } from '../store/worldStore';
import { selectQuote, lensOf, LENS_LABELS } from '../data/economic-thinkers';
import { findCapsule } from '../data/presets';

const ARTICLE_TITLES: Record<string, string> = {
    'naturlig-rente': 'Den naturlige renten',
    'inflasjon-og-rente': 'Inflasjon og rente',
    'pengesystem-vs-naturalhandel': 'Penger vs. byttehandel',
    finanskriser: 'Finanskriser',
    produksjon: 'Produksjon',
    arbeidsspesialisering: 'Arbeidsspesialisering',
    'okonomiske-skoler': 'Ulike økonomiske skoler',
};

export function InfoDrawer() {
    const sim = useWorldStore((s) => s.sim);
    const controls = useWorldStore((s) => s.controls);
    const activeView = useWorldStore((s) => s.activeView);
    const presetId = useWorldStore((s) => s.presetId);
    const quoteSeed = useWorldStore((s) => s.quoteSeed);
    const rollQuoteSeed = useWorldStore((s) => s.rollQuoteSeed);

    const naturalRate = sim.loanMarket.clearingRate;

    const quote = useMemo(
        () =>
            selectQuote(
                {
                    policyRate: controls.policyRate,
                    naturalRate,
                    inflation: sim.money.inflation,
                    phase: sim.phase,
                    activeView,
                    freeMarket: controls.freeMarket,
                },
                quoteSeed
            ),
        [controls.policyRate, controls.freeMarket, naturalRate, sim.money.inflation, sim.phase, activeView, quoteSeed]
    );

    const lens = lensOf(quote);
    const capsule = findCapsule(presetId);
    const linkedArticles = capsule?.linkedArticles ?? defaultArticlesForView(activeView);

    return (
        <aside className="flex flex-col gap-4">
            <motion.div
                key={quote.author + quote.text.slice(0, 20)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border-2 border-amber-200/70 shadow-md shadow-amber-100/40"
            >
                <Quote
                    size={48}
                    className="absolute -top-2 -right-2 text-amber-200/60"
                    strokeWidth={1.2}
                />
                <div className="flex items-center justify-between mb-2 relative">
                    <h3 className="text-xs uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1.5">
                        Tankesmie
                    </h3>
                    <button
                        type="button"
                        onClick={rollQuoteSeed}
                        className="text-amber-600 hover:text-amber-800 active:scale-90 active:rotate-180 transition-all duration-300"
                        aria-label="Bytt sitat"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
                <blockquote className="text-sm text-slate-800 leading-relaxed font-serif italic relative">
                    "{quote.text}"
                </blockquote>
                <footer className="mt-3 text-xs text-amber-900/80 font-medium relative flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{quote.author}</span>
                    {quote.source && <span className="text-amber-700/60">· {quote.source}</span>}
                    {lens && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            {LENS_LABELS[lens]}
                        </span>
                    )}
                </footer>
            </motion.div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5 mb-3">
                    <BookOpen size={13} className="text-indigo-500" />
                    Les mer
                </h3>
                <ul className="flex flex-col gap-1">
                    {linkedArticles.map((slug) => (
                        <li key={slug}>
                            <Link
                                to={`/samfunnskunnskap/okonomi/${slug}`}
                                className="flex items-center justify-between text-sm text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 -mx-2.5 rounded-lg transition-colors group"
                            >
                                <span className="font-medium">{ARTICLE_TITLES[slug] ?? slug}</span>
                                <ExternalLink
                                    size={12}
                                    className="opacity-30 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                Simuleringen er en pedagogisk forenkling. Den bygger på antakelser fra
                <em> Austrian Business Cycle Theory</em>; andre økonomiske skoler ville modellert
                noe annerledes. Se "Om modellen" i toppen.
            </p>
        </aside>
    );
}

function defaultArticlesForView(view: string): string[] {
    if (view === 'triangle') return ['naturlig-rente', 'inflasjon-og-rente', 'okonomiske-skoler'];
    if (view === 'village') return ['arbeidsspesialisering', 'produksjon'];
    if (view === 'atlas') return ['produksjon', 'pengesystem-vs-naturalhandel'];
    return ['naturlig-rente', 'inflasjon-og-rente', 'okonomiske-skoler', 'finanskriser'];
}
