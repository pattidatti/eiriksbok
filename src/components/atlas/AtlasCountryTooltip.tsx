import { motion } from 'framer-motion';
import { SUBJECT_COLOR, SUBJECT_LABEL } from './atlasSubjects';

export interface CountryTooltipData {
    name: string;
    articleCount: number;
    subjects: { id: string; count: number }[];
    latestTitle?: string;
    latestDate?: string;
    x: number; // piksel-posisjon i kart-containeren
    y: number;
    flip: boolean; // legg kortet til venstre for peker når nær høyre kant
}

interface Props {
    data: CountryTooltipData | null;
}

export function AtlasCountryTooltip({ data }: Props) {
    if (!data) return null;
    const hasContent = data.articleCount > 0;

    return (
        <motion.div
            key={data.name}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.5 }}
            className="pointer-events-none absolute z-40 w-56"
            style={{
                left: data.x,
                top: data.y,
                transform: `translate(${data.flip ? '-100%' : '0'}, -50%) translateX(${
                    data.flip ? '-14px' : '14px'
                })`,
            }}
        >
            <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/80 overflow-hidden">
                <div className="px-3.5 pt-2.5 pb-2">
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-bold text-slate-800 leading-tight text-[15px]">{data.name}</h3>
                        {hasContent && (
                            <span className="shrink-0 text-[11px] font-bold tabular-nums text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                {data.articleCount} {data.articleCount === 1 ? 'artikkel' : 'artikler'}
                            </span>
                        )}
                    </div>

                    {!hasContent && (
                        <p className="text-[11px] text-slate-400 mt-1">Ingen artikler her ennå</p>
                    )}

                    {hasContent && data.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {data.subjects.map((s) => {
                                const color = SUBJECT_COLOR[s.id] || '#64748b';
                                return (
                                    <span
                                        key={s.id}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                        style={{ color, background: `${color}1a` }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: color }}
                                        />
                                        {SUBJECT_LABEL[s.id] || s.id}
                                        <span className="tabular-nums opacity-70">{s.count}</span>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {hasContent && data.latestTitle && (
                    <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-100">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                            Siste hendelse
                        </p>
                        <p className="text-[12px] text-slate-700 leading-snug line-clamp-2 mt-0.5">
                            {data.latestDate && (
                                <span className="font-semibold text-slate-500 tabular-nums">
                                    {data.latestDate}{' · '}
                                </span>
                            )}
                            {data.latestTitle}
                        </p>
                    </div>
                )}

                {hasContent && (
                    <div className="px-3.5 py-1.5 bg-amber-600/95 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-white/95">
                            Klikk for å utforske
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
