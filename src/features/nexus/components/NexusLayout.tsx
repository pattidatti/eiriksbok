import React, { ReactNode } from 'react';
import { useNexus } from '../NexusContext';

interface NexusLayoutProps {
    children: ReactNode;
}

export const NexusLayout: React.FC<NexusLayoutProps> = ({ children }) => {
    const { metaProfile } = useNexus();

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#050510] text-slate-200">
            {/* Ambient Background - The Void */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Deep Noise / Nebula Effect */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                {/* Radial Aurora */}
                <div className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-indigo-900/30 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Grid Overlay for 'Technical' Feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            {/* Header / Meta-Status */}
            <header className="relative z-10 flex items-center justify-between px-12 py-8">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">
                        Nexus Link: <span className="text-emerald-400">Stable</span>
                    </span>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
                            {metaProfile.operatorName}
                        </h2>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">
                            Soul Rank {metaProfile.soulRank}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 shadow-xl"></div>
                </div>
            </header>

            {/* Content Container */}
            <main className="relative z-10 h-[calc(100vh-140px)] w-full flex flex-col items-center justify-center p-8">
                {children}
            </main>

            {/* Footer / System Status */}
            <footer className="absolute bottom-0 w-full p-6 flex justify-center z-10">
                <p className="text-[9px] text-slate-700 uppercase tracking-[0.5em] font-black">
                    Sim_Engine v1.2.0 • Meta-Layer Active
                </p>
            </footer>
        </div>
    );
};
