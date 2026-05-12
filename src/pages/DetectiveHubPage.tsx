import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    ArrowRight,
    Shield,
    MapPin,
    Calendar,
    Clock,
    Star,
    CheckCircle2,
    Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAllProgress } from '../components/content/interactive/detective/useDetectiveProgress';

interface CaseIndexEntry {
    id: string;
    title: string;
    description: string;
    image?: string;
    period?: string;
    location?: string;
    difficulty?: 'Lett' | 'Middels' | 'Høy';
    estimatedTime?: string;
    theme?: string;
    epoch?: 'oldtid' | 'middelalder' | 'tidlig-moderne' | 'moderne' | 'samtid';
    totalEvidence?: number;
    schemaVersion?: number;
}

interface IndexFile {
    cases: CaseIndexEntry[];
}

const EPOCH_LABEL: Record<NonNullable<CaseIndexEntry['epoch']>, string> = {
    oldtid: 'Oldtid',
    middelalder: 'Middelalder',
    'tidlig-moderne': 'Tidlig moderne',
    moderne: 'Moderne',
    samtid: 'Samtid',
};

const DIFFICULTY_ORDER: Record<NonNullable<CaseIndexEntry['difficulty']>, number> = {
    Lett: 0,
    Middels: 1,
    Høy: 2,
};

type EpochFilter = 'alle' | NonNullable<CaseIndexEntry['epoch']>;
type DifficultyFilter = 'alle' | NonNullable<CaseIndexEntry['difficulty']>;

export const DetectiveHubPage: React.FC = () => {
    const [cases, setCases] = useState<CaseIndexEntry[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [epoch, setEpoch] = useState<EpochFilter>('alle');
    const [difficulty, setDifficulty] = useState<DifficultyFilter>('alle');
    const progress = useAllProgress();

    useEffect(() => {
        const base = import.meta.env.BASE_URL.replace(/\/$/, '');
        const url = `${base}/content/interactive/detective/_index.json`;
        fetch(url)
            .then(async (r) => {
                if (!r.ok) throw new Error('Klarte ikke å laste sak-indeks.');
                const data = (await r.json()) as IndexFile;
                setCases(data.cases ?? []);
            })
            .catch((err) => setLoadError(err.message));
    }, []);

    const epochs = useMemo(() => {
        const set = new Set<string>();
        cases.forEach((c) => c.epoch && set.add(c.epoch));
        return Array.from(set) as Array<NonNullable<CaseIndexEntry['epoch']>>;
    }, [cases]);

    const filtered = useMemo(() => {
        return cases
            .filter((c) => epoch === 'alle' || c.epoch === epoch)
            .filter((c) => difficulty === 'alle' || c.difficulty === difficulty)
            .sort((a, b) => {
                const aDone = progress[a.id]?.completed ? 1 : 0;
                const bDone = progress[b.id]?.completed ? 1 : 0;
                if (aDone !== bDone) return aDone - bDone;
                const aD = DIFFICULTY_ORDER[a.difficulty ?? 'Middels'];
                const bD = DIFFICULTY_ORDER[b.difficulty ?? 'Middels'];
                if (aD !== bD) return aD - bD;
                return a.title.localeCompare(b.title, 'no');
            });
    }, [cases, epoch, difficulty, progress]);

    const completedCount = useMemo(
        () => cases.filter((c) => progress[c.id]?.completed).length,
        [cases, progress]
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold mb-6"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Kaldssaks-avdelingen</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900"
                    >
                        Historisk Detektiv
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Gå dypt inn i historiens uoppklarte mysterier. Bruk kildemateriale,
                        tolkningsferdigheter og logikk for å finne svar.
                    </motion.p>

                    {cases.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 inline-flex items-center gap-2 text-base text-slate-600"
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span>
                                <strong className="text-slate-800">{completedCount}</strong> av{' '}
                                <strong className="text-slate-800">{cases.length}</strong> saker
                                fullført
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Filter */}
                {cases.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mr-1 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </span>

                        <div className="flex gap-1 rounded-full bg-white border border-slate-200 p-1">
                            <FilterChip
                                active={epoch === 'alle'}
                                onClick={() => setEpoch('alle')}
                            >
                                Alle epoker
                            </FilterChip>
                            {epochs.map((e) => (
                                <FilterChip
                                    key={e}
                                    active={epoch === e}
                                    onClick={() => setEpoch(e)}
                                >
                                    {EPOCH_LABEL[e]}
                                </FilterChip>
                            ))}
                        </div>

                        <div className="flex gap-1 rounded-full bg-white border border-slate-200 p-1">
                            {(['alle', 'Lett', 'Middels', 'Høy'] as const).map((d) => (
                                <FilterChip
                                    key={d}
                                    active={difficulty === d}
                                    onClick={() => setDifficulty(d as DifficultyFilter)}
                                >
                                    {d === 'alle' ? 'Alle nivåer' : d}
                                </FilterChip>
                            ))}
                        </div>
                    </div>
                )}

                {loadError && (
                    <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-base text-amber-900">
                        <p className="font-semibold mb-1">Indeks ikke tilgjengelig</p>
                        <p className="text-sm">
                            {loadError}. Kjør{' '}
                            <code className="bg-amber-100 px-1 rounded">npm run scan:content</code>{' '}
                            for å generere _index.json.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {filtered.map((caseItem, index) => (
                        <CaseCard
                            key={caseItem.id}
                            caseItem={caseItem}
                            progress={progress[caseItem.id]}
                            delay={index * 0.05 + 0.3}
                        />
                    ))}

                    {cases.length > 0 && filtered.length === 0 && (
                        <div className="col-span-full text-center text-base text-slate-500 py-12">
                            Ingen saker matcher de valgte filtrene.
                        </div>
                    )}

                    {cases.length === 0 && !loadError && (
                        <div className="col-span-full text-center text-base text-slate-500 py-12">
                            Laster saker...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );
}

interface CaseCardProps {
    caseItem: CaseIndexEntry;
    progress?: { completed: boolean; stars: number; foundClues?: string[] };
    delay: number;
}

function CaseCard({ caseItem, progress, delay }: CaseCardProps) {
    const completed = progress?.completed === true;
    const inProgress = !completed && (progress?.foundClues?.length ?? 0) > 0;
    const stars = progress?.stars ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Link
                to={`/oving/detektiv/${caseItem.id}`}
                className={`group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border transition-all duration-300 ${
                    completed
                        ? 'border-emerald-200 ring-1 ring-emerald-100'
                        : 'border-slate-100'
                }`}
            >
                <div className="h-44 relative overflow-hidden">
                    {caseItem.image ? (
                        <img
                            src={caseItem.image}
                            alt={caseItem.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

                    {/* Statusmerke øverst */}
                    {completed && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Fullført
                        </div>
                    )}
                    {inProgress && !completed && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
                            Pågående
                        </div>
                    )}
                    {caseItem.difficulty && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold bg-white/95 text-slate-900 shadow-sm">
                            {caseItem.difficulty}
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        {caseItem.location && (
                            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1 opacity-95">
                                <MapPin className="w-3.5 h-3.5" />
                                {caseItem.location}
                            </div>
                        )}
                        <h3 className="text-xl font-bold font-display leading-tight">
                            {caseItem.title}
                        </h3>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-base text-slate-600 mb-4 line-clamp-2 leading-snug">
                        {caseItem.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {caseItem.period && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <span className="truncate">{caseItem.period}</span>
                            </div>
                        )}
                        {caseItem.estimatedTime && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <span>{caseItem.estimatedTime}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center text-indigo-600 font-bold text-base group-hover:translate-x-1 transition-transform">
                            <span>
                                {completed
                                    ? 'Se gjennom igjen'
                                    : inProgress
                                      ? 'Fortsett'
                                      : 'Start etterforskning'}
                            </span>
                            <ArrowRight className="w-5 h-5 ml-1.5" />
                        </div>
                        {completed ? (
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3].map((i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i <= stars
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-slate-200 fill-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                <Search className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
