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
    Edit2,
    Check,
    X,
    Shield,
    Calendar,
    Award,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

export const SimulationProfile: React.FC = () => {
    const { user, account, loading, logout, isAnonymous } = useSimulationAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(account?.displayName || '');
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const { setFullWidth, setHideHeader } = useLayout();

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
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
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
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/sim')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold uppercase tracking-widest text-xs">Lobby</span>
                        </button>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <div className="text-left">
                            <h1 className="text-xl md:text-3xl font-black italic text-white tracking-tighter uppercase leading-none">Global Profil</h1>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Identity v1.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
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

                {/* Main Profile Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Hero Section */}
                    <div className="md:col-span-12 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield size={200} className="text-indigo-500" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-900/40 shrink-0">
                                <UserIcon size={64} className="text-white" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-slate-950/50 border-2 border-indigo-500/50 rounded-xl px-4 py-2 text-2xl font-black text-white outline-none focus:border-indigo-500"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            disabled={saving}
                                            className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => setIsEditingName(false)}
                                            className="p-3 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 justify-center md:justify-start group/name">
                                        <h2 className="text-5xl font-black tracking-tighter text-white">
                                            {account?.displayName || 'Anonym Reisende'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setNewName(account?.displayName || '');
                                                setIsEditingName(true);
                                            }}
                                            className="p-2 opacity-0 group-hover/name:opacity-100 hover:bg-white/5 rounded-lg transition-all text-slate-500 hover:text-indigo-400"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                        Level {account?.globalLevel || 1}
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                        {account?.globalXp || 0} Total XP
                                    </div>
                                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">
                                        UID: {user?.uid.slice(0, 12)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem]">
                            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 font-mono">
                                <Award size={14} className="text-indigo-400" /> Utmerkelser
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className={`aspect-square rounded-xl border border-white/5 flex items-center justify-center transition-all ${account?.unlockedAchievements?.[i] ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-950/40 text-slate-800'}`}>
                                        <Trophy size={16} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-bold text-slate-600 uppercase text-center mt-6">
                                {account?.unlockedAchievements?.length || 0} av 12 samlet
                            </p>
                        </div>
                    </div>

                    {/* Character History */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] min-h-[400px]">
                            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-white mb-8">
                                <History size={18} className="text-indigo-400" /> Karakterhistorikk (Lives Lived)
                            </h3>

                            {(!account?.characterHistory || account.characterHistory.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                    <div className="w-16 h-16 bg-slate-950/40 rounded-3xl flex items-center justify-center mb-4">
                                        <Star size={24} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest">Ingen tidligere liv registrert</p>
                                    <p className="text-[10px] font-medium mt-1">Dra til en verden og gjør deg bemerket!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {account.characterHistory.slice().reverse().map((history, i) => (
                                        <div key={i} className="group bg-slate-950/40 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-xl border border-indigo-500/10 group-hover:scale-110 transition-transform">
                                                    {history.role === 'KING' ? '👑' : history.role === 'BARON' ? '🏰' : '🌾'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{history.name}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                                        <span className="text-indigo-500">Nivå {history.level} {history.role}</span>
                                                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(history.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">VERDEN</p>
                                                <p className="text-sm font-mono font-bold text-indigo-400">#{history.roomPin}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Logout Confirmation Overlay */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)} />
                    <div className="relative bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-6 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                            <LogOut size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">Logge ut?</h3>
                            <p className="text-slate-400 text-sm font-medium">Er du sikker på at du vil avslutte sesjonen? Du kan alltids logge inn igjen senere.</p>
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
                                Ja, Logg Ut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
