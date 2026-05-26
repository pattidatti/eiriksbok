import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Library, Wind, Scale, Flame, Play, BookOpen, Target, Check, GraduationCap, ExternalLink } from 'lucide-react';
import { useWorldStore } from '../../store/worldStore';
import { CAPSULES } from '../../data/presets';
import type { Capsule } from '../../types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    wind: Wind,
    scale: Scale,
    flame: Flame,
};

const CAPSULE_STYLES = [
    {
        bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100',
        border: 'border-amber-300/70',
        accent: 'from-amber-400 to-orange-500',
        text: 'text-amber-950',
        shadow: 'shadow-amber-200/40',
    },
    {
        bg: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100',
        border: 'border-emerald-300/70',
        accent: 'from-emerald-400 to-teal-500',
        text: 'text-emerald-950',
        shadow: 'shadow-emerald-200/40',
    },
    {
        bg: 'bg-gradient-to-br from-rose-100 via-red-50 to-orange-100',
        border: 'border-rose-300/70',
        accent: 'from-rose-500 to-orange-500',
        text: 'text-rose-950',
        shadow: 'shadow-rose-200/40',
    },
    {
        bg: 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100',
        border: 'border-indigo-300/70',
        accent: 'from-indigo-500 to-purple-600',
        text: 'text-indigo-950',
        shadow: 'shadow-indigo-200/40',
    },
];

export function CapsulesView() {
    const presetId = useWorldStore((s) => s.presetId);
    const loadPreset = useWorldStore((s) => s.loadPreset);
    const setActiveView = useWorldStore((s) => s.setActiveView);

    function startCapsule(c: Capsule) {
        loadPreset(
            c.id,
            c.initialControls ?? {},
            c.initialState?.avgTimePreference,
            c.initialState?.M
        );
        setActiveView('cockpit');
    }

    return (
        <div className="flex flex-col gap-6 p-5 lg:p-8 overflow-y-auto h-full">
            <header>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-md shadow-rose-300/40">
                        <Library size={22} className="text-white" />
                    </span>
                    Tidskapsler
                </h1>
                <p className="text-base lg:text-lg text-slate-600 mt-2 max-w-2xl">
                    Last et historisk eksperiment eller en filosofisk visjon. Hver kapsel starter
                    økonomien i en bestemt tilstand, med fortelling og læringsmål.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {CAPSULES.map((c, idx) => {
                    const style = CAPSULE_STYLES[idx % CAPSULE_STYLES.length];
                    const Icon = ICON_MAP[c.icon ?? ''] ?? Library;
                    const active = presetId === c.id;
                    return (
                        <motion.button
                            key={c.id}
                            type="button"
                            onClick={() => startCapsule(c)}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                            className={`group relative overflow-hidden text-left p-6 rounded-3xl border-2 ${style.bg} ${style.border} shadow-md ${style.shadow} hover:shadow-xl transition-shadow`}
                        >
                            {active && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-emerald-700 shadow"
                                >
                                    <Check size={12} />
                                    Aktiv
                                </motion.div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.accent} flex items-center justify-center shadow-md mb-4 group-hover:rotate-6 group-hover:scale-110 transition-transform`}>
                                <Icon size={28} className="text-white" />
                            </div>

                            <h3 className={`text-xl lg:text-2xl font-display font-bold leading-tight ${style.text}`}>
                                {c.title}
                            </h3>
                            <p className={`text-sm font-medium mt-0.5 ${style.text} opacity-70`}>
                                {c.subtitle}
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed mt-3">
                                {c.summary}
                            </p>

                            {c.objectives && c.objectives.length > 0 && (
                                <div className="mt-4 flex items-start gap-2 text-xs text-slate-700">
                                    <Target size={13} className="mt-0.5 flex-shrink-0 opacity-60" />
                                    <span>{c.objectives[0].text}</span>
                                </div>
                            )}

                            {c.linkedArticles && c.linkedArticles.length > 0 && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-slate-600">
                                    <BookOpen size={13} className="mt-0.5 flex-shrink-0 opacity-60" />
                                    <span>{c.linkedArticles.length} relaterte artikler</span>
                                </div>
                            )}

                            <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br ${style.accent} text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow`}>
                                <Play size={14} fill="currentColor" />
                                {active ? 'Gjenstart kapsel' : 'Start kapsel'}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mt-2 max-w-2xl">
                Hver kapsel laster en starttilstand og åpner cockpit-visningen. Du kan deretter
                bytte til triangel, landsby eller atlas for å se det samme datagrunnlaget på andre
                måter. Avslutt kapselen med X-knappen i bannerlinjen.
            </p>

            <div className="mt-2 max-w-2xl bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-4 flex items-start gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0">
                    <GraduationCap size={18} />
                </span>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        For lærere
                    </h3>
                    <p className="text-sm text-slate-700 leading-snug mt-0.5">
                        Økonomi-Verden støtter kompetansemål 12 i samfunnsfag 10. trinn -
                        "vurdere korleis arbeid, inntekt og forbruk kan påverke personleg
                        økonomi, levestandard og livskvalitet".
                    </p>
                    <Link
                        to="/oving/kompetansemal"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                    >
                        Se alle kompetansemål
                        <ExternalLink size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
