import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, update } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { useSimulationAuth } from './SimulationAuthContext';
import {
    User as UserIcon,
    ArrowLeft,
    Trophy,
    Star,
    History,
    Check,
    X,
    Award,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { NexusProvider, useNexus } from '../nexus/NexusContext';
import { VesselSelector } from '../nexus/components/VesselSelector';

const InnerSimulationProfile: React.FC = () => {
    const { user, account, loading, logout, isAnonymous } = useSimulationAuth();
    useNexus(); // Ensure context is loaded
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(account?.displayName || '');
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const { setFullWidth, setHideHeader } = useLayout();

    // Sync local state with loaded account
    useEffect(() => {
        if (account?.displayName) setNewName(account.displayName);
    }, [account]);

    useEffect(() => {
        setFullWidth(true);
        setHideHeader(true);
        return () => {
            setFullWidth(false);
            setHideHeader(false);
        };
    }, [setFullWidth, setHideHeader]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#050510] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleSaveName = async () => {
        if (!user || !newName.trim()) return;
        setSaving(true);
        try {
            await update(ref(db, `simulation_accounts/${user.uid}`), {
                displayName: newName.trim()
            });
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-slate-200 overflow-x-hidden relative selection:bg-indigo-500/30">
            {/* --- VOID ATMOSPHERE (From NexusLayout) --- */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-indigo-900/20 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 space-y-16">

                {/* Header / Navigate Home */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/sim')}
                        className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors pl-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs">Tilbake til Lobby</span>
                    </button>

                    <div className="flex items-center gap-4">
                        {isAnonymous ? (
                            <button
                                onClick={() => navigate('/sim')}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                <ShieldAlert size={14} /> Sikre Profil
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="px-5 py-2.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:border-rose-500/30 transition-all flex items-center gap-2"
                            >
                                <LogOut size={14} /> Logg Ut
                            </button>
                        )}
                    </div>
                </div>

                {/* Identity Section (Hero) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-12 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                            <div className="w-32 h-32 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl">
                                <UserIcon size={64} className="text-slate-200" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 uppercase tracking-wider">
                                Operator
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div>
                                <h1 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.4em] mb-2">Global Profil</h1>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-white/5 border border-indigo-500/50 rounded-lg px-4 py-2 text-3xl font-black text-white outline-none focus:bg-white/10 w-full max-w-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleSaveName} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Check size={20} /></button>
                                        <button onClick={() => setIsEditingName(false)} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><X size={20} /></button>
                                    </div>
                                ) : (
                                    <h2
                                        onClick={() => { setNewName(account?.displayName || ''); setIsEditingName(true); }}
                                        className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter cursor-pointer hover:to-indigo-300 transition-all"
                                    >
                                        {account?.displayName || 'Ukjent Identitet'}
                                    </h2>
                                )}
                            </div>

                            {/* Meta Stats Badges */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                    <div className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><Award size={14} /></div>
                                    <div className="text-left">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Sjelsnivå</p>
                                        <p className="text-sm font-mono font-bold text-white">{account?.globalLevel || 1}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-400"><Star size={14} /></div>
                                    <div className="text-left">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total XP</p>
                                        <p className="text-sm font-mono font-bold text-white">{account?.globalXp || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* VESSELS SECTION (THE CORE UPGRADE) */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Vessels</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Velg karakter for å gå inn i simuleringen</p>
                            </div>
                        </div>
                    </div>

                    {/* The Vessel Selector Component embedded directly */}
                    <VesselSelector />
                </div>


                {/* Legacy History / Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Achievements */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Trophy size={14} /> Utmerkelser
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i} className={`aspect-square rounded-xl border border-white/5 flex items-center justify-center transition-all ${account?.unlockedAchievements?.[i] ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-black/20 text-slate-800'}`}>
                                    <Trophy size={14} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <History size={14} /> Legacy Archives
                        </h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(!account?.characterHistory || account.characterHistory.length === 0) ? (
                                <div className="text-center py-8 opacity-50">
                                    <p className="text-xs font-bold uppercase">Ingen arkiver funnet</p>
                                </div>
                            ) : (
                                account.characterHistory.slice().reverse().map((history, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl opacity-50">💀</div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-wide">{history.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">{history.role} • Lvl {history.level}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-600">{new Date(history.timestamp).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Logout Confirmation Overlay */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)} />
                    <div className="relative bg-[#0A0A15] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-6 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                            <LogOut size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">Logge ut?</h3>
                            <p className="text-slate-400 text-sm font-medium">Er du sikker på at du vil avslutte sesjonen?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/sim');
                                }}
                                className="py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-rose-600/20"
                            >
                                Logg Ut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Wrap with NexusProvider to allow Vessel Selection logic to work
export const SimulationProfile = () => {
    return (
        <NexusProvider>
            <InnerSimulationProfile />
        </NexusProvider>
    );
};

