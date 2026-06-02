import { useState } from 'react';
import { motion } from 'framer-motion';

// Signaturkomponent for km-13-digital-debatt.
// Eleven reagerer på 6 innlegg om TikTok og skole (som på sosiale medier).
// Etter alle reaksjoner kjøres algoritmen og viser at emosjonelle innlegg
// forsterkes 5-8x, balanserte 1x – uavhengig av elevens egne valg.
// Lyspære: du reagerte, men algoritmen bestemte hvem som ble hørt.

type Reaction = 'like' | 'comment' | 'share' | 'skip';

interface Post {
    id: number;
    headline: string;
    source: string;
    type: 'outrage' | 'factual' | 'humorous' | 'nuanced' | 'sensational' | 'informative';
    baseMultiplier: number;
}

const POSTS: Post[] = [
    {
        id: 0,
        headline: 'FORBUD NU! TikTok ødelegger ungdomshjernen – forsker slår alarm',
        source: 'nettnyheter24.no',
        type: 'outrage',
        baseMultiplier: 8,
    },
    {
        id: 1,
        headline: 'Studie: 13-åringer bruker gjennomsnittlig 2,5 timer daglig på TikTok',
        source: 'forskning.no',
        type: 'factual',
        baseMultiplier: 1,
    },
    {
        id: 2,
        headline: 'Læreren min så meg scrolle i timen og det ble litt pinlig 😬',
        source: 'TikTok @skole_drama',
        type: 'humorous',
        baseMultiplier: 5,
    },
    {
        id: 3,
        headline: 'Eksperter er uenige om skjermbegrensning i skolen kan gi bedre læring',
        source: 'utdanningsforskning.no',
        type: 'nuanced',
        baseMultiplier: 1.5,
    },
    {
        id: 4,
        headline: 'AVSLØRT: TikTok samler ansiktsdata fra barn – uten å varsle foreldrene',
        source: 'teknologiavisen.no',
        type: 'sensational',
        baseMultiplier: 7,
    },
    {
        id: 5,
        headline: 'Mobilfrie timer på Tromsø-skole: Lærerne merker tydelig bedre fokus',
        source: 'nordlys.no',
        type: 'informative',
        baseMultiplier: 2,
    },
];

const TYPE_META: Record<Post['type'], { badge: string; bg: string; bar: string }> = {
    outrage:     { badge: 'Emosjonell',        bg: 'border-red-300 bg-red-50',      bar: 'bg-red-500' },
    sensational: { badge: 'Oppsiktsvekkende',  bg: 'border-orange-300 bg-orange-50', bar: 'bg-orange-500' },
    humorous:    { badge: 'Underholdende',      bg: 'border-yellow-300 bg-yellow-50', bar: 'bg-yellow-500' },
    informative: { badge: 'Informativ',         bg: 'border-teal-300 bg-teal-50',    bar: 'bg-teal-500' },
    nuanced:     { badge: 'Nyansert',           bg: 'border-sky-300 bg-sky-50',      bar: 'bg-sky-400' },
    factual:     { badge: 'Faktabasert',        bg: 'border-blue-300 bg-blue-50',    bar: 'bg-blue-400' },
};

const REACTION_MODIFIER: Record<Reaction, number> = {
    share: 1.5,
    comment: 1.2,
    like: 1.0,
    skip: 0.3,
};

const REACTION_LABELS: Record<Reaction, string> = {
    like: '❤️ Like',
    comment: '💬 Svar',
    share: '↗️ Del',
    skip: 'Hopp over',
};

export function EngasjementsMaskinen() {
    const [reactions, setReactions] = useState<Record<number, Reaction>>({});
    const [phase, setPhase] = useState<'reacting' | 'analyzing' | 'reveal'>('reacting');

    const allReacted = POSTS.every((p) => reactions[p.id] !== undefined);
    const reactedCount = Object.keys(reactions).length;

    const react = (id: number, r: Reaction) => {
        if (phase !== 'reacting') return;
        setReactions((prev) => ({ ...prev, [id]: r }));
    };

    const submit = () => {
        if (!allReacted) return;
        setPhase('analyzing');
        setTimeout(() => setPhase('reveal'), 1800);
    };

    const reset = () => {
        setReactions({});
        setPhase('reacting');
    };

    const getReach = (post: Post): number => {
        const r = reactions[post.id] ?? 'skip';
        return Math.round(post.baseMultiplier * REACTION_MODIFIER[r] * 1000);
    };

    const reaches = POSTS.map(getReach);
    const maxReach = Math.max(...reaches, 1);

    return (
        <div className="rounded-xl border border-amber-200 bg-white p-4 sm:p-5 space-y-4">
            {/* Topptekst */}
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-100 p-2.5 flex-shrink-0">
                    <span className="text-xl" aria-hidden="true">📊</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">
                        Engasjementsmaskinen
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {phase === 'reacting' && 'Reager på seks innlegg om TikTok og skole – som om du var på nettet nå.'}
                        {phase === 'analyzing' && 'Algoritmen analyserer engasjementet ditt...'}
                        {phase === 'reveal' && 'Dette er hva algoritmen valgte å forsterke.'}
                    </p>
                </div>
            </div>

            {/* Analysefase */}
            {phase === 'analyzing' && (
                <div className="flex flex-col items-center gap-3 py-8">
                    <motion.div
                        className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-sm text-slate-600 font-medium">Beregner rekkevidde...</p>
                </div>
            )}

            {/* Innleggskorter */}
            {phase !== 'analyzing' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {POSTS.map((post, idx) => {
                        const meta = TYPE_META[post.type];
                        const r = reactions[post.id];
                        const reach = reaches[idx];
                        const widthPct = Math.round((reach / maxReach) * 100);

                        return (
                            <div
                                key={post.id}
                                className={`rounded-lg border ${meta.bg} p-3 space-y-2`}
                            >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white/70 text-slate-700">
                                        {meta.badge}
                                    </span>
                                    <span className="text-xs text-slate-400 truncate">{post.source}</span>
                                </div>

                                <p className="text-sm font-medium text-slate-800 leading-snug">
                                    {post.headline}
                                </p>

                                {phase === 'reacting' && (
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {(['like', 'comment', 'share', 'skip'] as Reaction[]).map((reaction) => (
                                            <button
                                                key={reaction}
                                                onClick={() => react(post.id, reaction)}
                                                className={`text-xs px-2 py-1 rounded-md border transition font-medium
                                                    ${r === reaction
                                                        ? 'bg-amber-500 text-white border-amber-600'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                                                    }`}
                                            >
                                                {REACTION_LABELS[reaction]}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {phase === 'reveal' && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-slate-500 flex-shrink-0">
                                                Du: {REACTION_LABELS[reactions[post.id] ?? 'skip']}
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 tabular-nums">
                                                {reach.toLocaleString('nb-NO')} visninger
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${meta.bar}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${widthPct}%` }}
                                                transition={{
                                                    delay: post.id * 0.1,
                                                    duration: 0.7,
                                                    ease: 'easeOut',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Se resultatet-knapp */}
            {phase === 'reacting' && (
                <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                        {reactedCount} av 6 reagert
                    </span>
                    <button
                        onClick={submit}
                        disabled={!allReacted}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition
                            ${allReacted
                                ? 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Se resultatet →
                    </button>
                </div>
            )}

            {/* Lyspære-reveal */}
            {phase === 'reveal' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2"
                >
                    <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0" aria-hidden="true">💡</span>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            <strong>Du reagerte – men algoritmen bestemte hvem som ble hørt.</strong>{' '}
                            Emosjonelle og oppsiktsvekkende innlegg fikk opp til 8 ganger mer rekkevidde enn
                            faktabaserte, uavhengig av hva du valgte. Det er ikke du som er problemet – det
                            er reglene plattformen er bygd etter.
                        </p>
                    </div>
                    <button
                        onClick={reset}
                        className="text-xs text-amber-700 hover:underline font-medium"
                    >
                        Prøv igjen med andre reaksjoner
                    </button>
                </motion.div>
            )}
        </div>
    );
}
