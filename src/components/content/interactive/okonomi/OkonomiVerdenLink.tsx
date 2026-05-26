import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface OkonomiVerdenLinkProps {
    preset?: string;
    view?: 'cockpit' | 'triangle' | 'village' | 'capsules' | 'atlas';
    label?: string;
    description?: string;
}

export function OkonomiVerdenLink({
    preset,
    view = 'cockpit',
    label = 'Test dette i Økonomi-Verden',
    description = 'Åpne den interaktive sandkassen og se teorien i bevegelse.',
}: OkonomiVerdenLinkProps) {
    const params = new URLSearchParams();
    params.set('view', view);
    if (preset) params.set('preset', preset);
    const href = `/samfunnskunnskap/okonomi/verden?${params.toString()}`;

    return (
        <Link
            to={href}
            className="my-8 not-prose group flex items-center justify-between gap-4 p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-amber-50 hover:border-indigo-400 hover:shadow-lg transition-all"
        >
            <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{label}</h3>
                    <p className="text-sm text-slate-600 leading-snug mt-0.5">{description}</p>
                </div>
            </div>
            <ArrowRight
                size={20}
                className="text-indigo-500 flex-shrink-0 transition-transform group-hover:translate-x-1"
            />
        </Link>
    );
}
