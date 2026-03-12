import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, X } from 'lucide-react';
import { AtlasMap } from './components/AtlasMap';
import { LayerPanel } from './components/LayerPanel';
import { InfoPanel } from './components/InfoPanel';
import { StatsBar } from './components/StatsBar';
import { SearchField } from './components/SearchField';
import { useAtlasUrlSync } from './hooks/useAtlasUrlSync';
import { useLayout } from '../../context/LayoutContext';

interface Transform {
    scale: number;
    x: number;
    y: number;
}

export function InfrastrukturAtlasPage() {
    const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
    const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
    const { setHideHeader } = useLayout();

    useEffect(() => {
        setHideHeader(true);
        return () => setHideHeader(false);
    }, [setHideHeader]);

    const handleTransformChange = useCallback((t: Transform) => {
        setTransform(t);
    }, []);

    useAtlasUrlSync(transform);

    return (
        <div className="flex flex-col h-screen bg-[#0b1120] text-white overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex-shrink-0 z-10 gap-3">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                        to="/samfunnskunnskap/handel-og-infrastruktur"
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-none">InfrastrukturAtlas</h1>
                        <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                            Verdens årer — handel, energi og data
                        </p>
                    </div>
                </div>

                {/* Search field */}
                <div className="flex-1 max-w-xs mx-2 hidden sm:block">
                    <SearchField />
                </div>

                {/* Mobile layer toggle */}
                <button
                    className="md:hidden flex items-center gap-1.5 text-xs bg-slate-700 px-3 py-1.5 rounded-lg flex-shrink-0"
                    onClick={() => setMobileLayersOpen(true)}
                >
                    <Layers size={14} />
                    Lag
                </button>
            </header>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop layer panel */}
                <aside className="hidden md:flex flex-col w-52 bg-slate-900/80 border-r border-slate-800 overflow-y-auto flex-shrink-0">
                    <LayerPanel />
                </aside>

                {/* Map area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 p-2 overflow-hidden">
                        <AtlasMap onTransformChange={handleTransformChange} />
                    </div>
                    <StatsBar />
                </main>

                {/* Desktop info panel */}
                <aside className="hidden md:block w-60 bg-slate-900/80 border-l border-slate-800 overflow-y-auto flex-shrink-0 relative">
                    <div className="h-full p-3">
                        <InfoPanel />
                    </div>
                </aside>
            </div>

            {/* Mobile layers bottom sheet */}
            {mobileLayersOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 md:hidden">
                    <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-sm">Velg lag</h2>
                            <button onClick={() => setMobileLayersOpen(false)}>
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <LayerPanel />
                    </div>
                </div>
            )}
        </div>
    );
}

export default InfrastrukturAtlasPage;
