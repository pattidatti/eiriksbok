import React, { useState, useEffect } from 'react';
import { Monitor, Volume2, User, Server, LogOut, X } from 'lucide-react';
import { GameButton } from '../ui/GameButton';
import { Badge } from '../ui/Badge';

interface SimulationSettingsProps {
    onClose: () => void;
}

export const SimulationSettings: React.FC<SimulationSettingsProps> = ({ onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="max-w-4xl w-full bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Monitor className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Innstillinger</h2>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest opacity-60">Konfigurer din opplevelse</p>
                    </div>
                </div>
                <GameButton variant="ghost" size="sm" onClick={onClose} className="rounded-full !p-2">
                    <X className="w-6 h-6" />
                </GameButton>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Core Settings */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Skjerm
                        </h3>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold">Fullskjerm</p>
                                    <p className="text-xs text-slate-400">Fjern nettleserens verktøylinje for maksimal innlevelse.</p>
                                </div>
                                <button
                                    onClick={toggleFullscreen}
                                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isFullscreen ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isFullscreen ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <Volume2 className="w-4 h-4" /> Lyd & Musikk
                        </h3>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-300 uppercase">
                                    <span>Musikk</span>
                                    <span>70%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-indigo-500 w-[70%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-300 uppercase">
                                    <span>Lydeffekter</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-indigo-500 w-[85%]" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Profile & Servers */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Konto & Profil
                        </h3>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-white/10">
                                👤
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm">Brukerprofil</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Kommer snart</p>
                            </div>
                            <Badge variant="outline" className="text-[8px]">ALPHA</Badge>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <Server className="w-4 h-4" /> Servervalg
                        </h3>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-white">Europe-West-1 (Aktiv)</span>
                                </div>
                                <span className="text-[10px] text-indigo-400 font-black">12ms</span>
                            </div>
                            <div className="flex items-center justify-between p-2 opacity-40 grayscale">
                                <span className="text-xs font-bold text-slate-400">US-East-1</span>
                                <span className="text-[10px] text-slate-500 font-black">115ms</span>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full mt-4 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500/40 text-rose-500 hover:text-white px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Avslutt Spill
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                    Version 1.2.0 • Eiriksbok Simulation Engine
                </p>
            </div>
        </div>
    );
};
