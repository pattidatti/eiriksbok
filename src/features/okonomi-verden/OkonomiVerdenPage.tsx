import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, X, Globe2 } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useWorldStore } from './store/worldStore';
import { useWorldTick } from './store/useWorldTick';
import { useWorldUrlSync } from './store/useWorldUrlSync';
import { ViewTabs } from './components/ViewTabs';
import { SpeedControls } from './components/SpeedControls';
import { GodControlPanel } from './components/GodControlPanel';
import { InfoDrawer } from './components/InfoDrawer';
import { PresetBanner } from './components/PresetBanner';
import { CockpitView } from './views/cockpit/CockpitView';
import { TriangleView } from './views/triangle/TriangleView';
import { VillageView } from './views/village/VillageView';
import { CapsulesView } from './views/capsules/CapsulesView';
import { AtlasView } from './views/atlas/AtlasView';
import type { ViewKind } from './types';

export function OkonomiVerdenPage() {
    const { setHideHeader } = useLayout();
    const activeView = useWorldStore((s) => s.activeView);
    const presetId = useWorldStore((s) => s.presetId);
    const [controlsOpen, setControlsOpen] = useState(false);

    useEffect(() => {
        setHideHeader(true);
        return () => setHideHeader(false);
    }, [setHideHeader]);

    useWorldTick();
    useWorldUrlSync();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50/60 text-slate-900">
            <header className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-white/85 backdrop-blur-md border-b-2 border-amber-200/60 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.08)] flex-shrink-0 z-20">
                <Link
                    to="/samfunnskunnskap/okonomi"
                    className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
                    aria-label="Tilbake til økonomi-emnet"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden md:flex w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center shadow-md shadow-amber-200/60">
                        <Globe2 size={22} className="text-white" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-lg font-display font-bold leading-tight tracking-tight text-slate-900">
                            Økonomi-Verden
                        </h1>
                        <p className="text-xs text-slate-500 leading-tight">
                            Spill gud i en levende økonomi
                        </p>
                    </div>
                </div>
                <div className="flex-1 flex justify-center min-w-0 px-2">
                    <ViewTabs />
                </div>
                <SpeedControls />
                <button
                    type="button"
                    onClick={() => setControlsOpen((v) => !v)}
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 transition-all"
                    aria-label="Vis kontroller"
                >
                    <SlidersHorizontal size={18} />
                </button>
            </header>

            {presetId && <PresetBanner />}

            <main className="flex-1 flex overflow-hidden">
                <section className="flex-1 overflow-hidden">
                    <ActiveView view={activeView} />
                </section>

                <aside className="hidden lg:flex flex-col gap-5 w-80 xl:w-96 border-l border-slate-200/80 bg-white/60 backdrop-blur-sm p-5 overflow-y-auto flex-shrink-0">
                    <GodControlPanel />
                    <InfoDrawer />
                </aside>
            </main>

            {controlsOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex justify-end"
                    onClick={() => setControlsOpen(false)}
                >
                    <div
                        className="w-[22rem] max-w-full bg-white shadow-2xl p-5 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-display font-bold text-slate-900">
                                Kontroller
                            </h2>
                            <button
                                type="button"
                                onClick={() => setControlsOpen(false)}
                                aria-label="Lukk"
                                className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <GodControlPanel />
                            <InfoDrawer />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActiveView({ view }: { view: ViewKind }) {
    switch (view) {
        case 'cockpit':
            return <CockpitView />;
        case 'triangle':
            return <TriangleView />;
        case 'village':
            return <VillageView />;
        case 'capsules':
            return <CapsulesView />;
        case 'atlas':
            return <AtlasView />;
    }
}
