import { LayoutDashboard, Triangle, Home, Library, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorldStore } from '../store/worldStore';
import type { ViewKind } from '../types';

interface TabDef {
    id: ViewKind;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabDef[] = [
    { id: 'cockpit', label: 'Cockpit', icon: LayoutDashboard },
    { id: 'triangle', label: 'Triangel', icon: Triangle },
    { id: 'village', label: 'Landsby', icon: Home },
    { id: 'capsules', label: 'Kapsler', icon: Library },
    { id: 'atlas', label: 'Atlas', icon: Layers },
];

export function ViewTabs() {
    const activeView = useWorldStore((s) => s.activeView);
    const setActiveView = useWorldStore((s) => s.setActiveView);

    return (
        <nav
            className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60"
            aria-label="Visninger"
        >
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeView === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveView(tab.id)}
                        className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors active:scale-95 ${
                            active
                                ? 'text-white'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                    >
                        {active && (
                            <motion.span
                                layoutId="active-tab-pill"
                                className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-300/40"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        <span className="relative flex items-center gap-2">
                            <Icon size={16} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
