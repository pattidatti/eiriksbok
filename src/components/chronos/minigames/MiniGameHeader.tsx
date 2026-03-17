import type { LucideIcon } from 'lucide-react';

export const MiniGameHeader = ({
    icon: Icon,
    title,
    badge,
}: {
    icon: LucideIcon;
    title: string;
    badge?: React.ReactNode;
}) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-stone-800 border-b border-stone-700/50">
        <Icon size={13} className="text-stone-400 flex-shrink-0 opacity-70" />
        <span className="text-xs font-display font-semibold text-stone-100 tracking-wide">
            {title}
        </span>
        {badge && <div className="ml-auto">{badge}</div>}
    </div>
);
