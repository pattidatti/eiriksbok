import React, { useEffect, useState } from 'react';
import { Settings, Map, MessageSquare, LayoutGrid, Scroll, Package, Menu, X } from 'lucide-react';
import { useSimulation } from '../SimulationContext';
import { useAudio } from '../SimulationAudioContext';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { ResourceIcon } from '../ui/ResourceIcon';
import { LEVEL_XP, SEASONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationHeaderProps {
    room: SimulationRoom;
    player: SimulationPlayer;
    pin?: string;
}

// Simple CountUp hook (Ported from Sidebar)
const useCountUp = (target: number, duration: number = 800) => {
    const [count, setCount] = React.useState(target);
    const prevTarget = React.useRef(target);

    React.useEffect(() => {
        if (prevTarget.current === target) return;
        const start = prevTarget.current;
        const end = target;
        let startTime: number | null = null;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            setCount(start + (end - start) * progress);
            if (progress < 1) requestAnimationFrame(animate);
            else prevTarget.current = target;
        };
        requestAnimationFrame(animate);
    }, [target, duration]);

    return count;
};

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({ room, player }) => {
    const { activeTab, setActiveTab } = useSimulation();
    const { playSfx } = useAudio();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- KEYBOARD SHORTCUTS (Ported from Sidebar) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const key = e.key.toLowerCase();
            const tabMap: Record<string, any> = {
                'm': 'MAP',
                'l': 'ACTIVITY',
                'p': 'PROFILE',
                'i': 'INVENTORY',
                'f': 'SKILLS',
                'd': 'DIPLOMACY',
                'h': 'HIERARCHY'
            };

            if (tabMap[key]) {
                if (key === 'd' && player.role === 'PEASANT') return;
                setActiveTab(tabMap[key]);
                playSfx('ui_click.ogg');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setActiveTab, player.role, playSfx]);

    // --- VITALS CALCULATIONS ---
    const staminaWidth = player.status.stamina || 0;
    const healthWidth = player.status.hp || 0;
    const currentXp = player.stats.xp || 0;
    const currentLvl = player.stats.level || 1;
    const targetXp = LEVEL_XP[currentLvl] || 1000;
    const xpPercent = Math.min(100, (currentXp / targetXp) * 100);

    const displayedStamina = useCountUp(staminaWidth);
    const displayedHealth = useCountUp(healthWidth);

    // --- NAVIGATION ITEMS ---
    const navItems = [
        { id: 'MAP', label: 'Kart', icon: Map, short: 'M' },
        { id: 'ACTIVITY', label: 'Live', icon: MessageSquare, short: 'L' },
        { id: 'INVENTORY', label: 'Eiendeler', icon: Package, short: 'I' },
        { id: 'SKILLS', label: 'Ferdigheter', icon: Scroll, short: 'F' },
        // Diplomacy/Hierarchy combined or separate? Keeping separate for now but hiding based on role
        ...(player.role !== 'PEASANT' ? [{ id: 'DIPLOMACY', label: 'Diplomati', icon: MessageSquare, short: 'D' }] : []),
        { id: 'HIERARCHY', label: 'Samfunn', icon: LayoutGrid, short: 'H' },
    ];

    const year = room.world?.year || 1100;
    const season = (SEASONS as any)[room.world?.season]?.label || room.world?.season;
    const weather = room.world?.weather || 'Clear';

    return (
        <header className="flex-none h-16 md:h-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-50 relative shrink-0 transition-all">

            {/* LEFT: LOGO & WORLD STATE */}
            <div className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white leading-none">
                        SIM<span className="text-indigo-500">ULATOR</span>
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] mobile-hide font-bold uppercase tracking-widest text-slate-500">
                        <span>År {year}</span>
                        <span className="text-amber-500">{season}</span>
                        <span>{weather}</span>
                    </div>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    {navItems.map(item => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); playSfx('ui_click.ogg'); }}
                                className={`
                                    relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all group overflow-hidden
                                    ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? '' : ''}`}>{item.label}</span>
                                {item.short && (
                                    <span className={`text-[10px] absolute top-0.5 right-1 font-mono font-bold transition-opacity ${isActive ? 'text-indigo-300' : 'text-slate-700 group-hover:text-slate-500'}`}>
                                        {item.short}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* RIGHT: PLAYER VITALS & ACTIONS */}
            <div className="flex items-center gap-4 md:gap-6">

                {/* RESOURCES (Compact) */}
                <button
                    onClick={() => setActiveTab('INVENTORY')}
                    className="hidden lg:flex items-center gap-3 bg-slate-900/50 hover:bg-slate-800 px-4 py-1.5 rounded-full border border-white/5 transition-colors cursor-pointer active:scale-95"
                    title="Åpne Eiendeler (I)"
                >
                    <ResourceIcon resource="gold" amount={player.resources.gold} size="sm" />
                    <div className="w-px h-3 bg-white/10" />
                    <ResourceIcon resource="bread" amount={player.resources.bread || 0} size="sm" />
                </button>

                {/* VITALS BARS */}
                <div className="flex flex-col gap-1 w-24 md:w-32">
                    {/* HP */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative group">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-rose-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${displayedHealth}%` }}
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-black text-white bg-black/50 transition-opacity">
                            HP {Math.round(displayedHealth)}%
                        </div>
                    </div>
                    {/* STAMINA */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative group">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${displayedStamina}%` }}
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-black text-black bg-white/50 transition-opacity">
                            STA {Math.round(displayedStamina)}%
                        </div>
                    </div>
                    {/* XP */}
                    <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden relative group mt-0.5">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercent}%` }}
                        />
                    </div>
                </div>

                {/* PROFILE BUTTON (Integrated Name & Avatar) */}
                <button
                    onClick={() => { setActiveTab('PROFILE'); playSfx('ui_click.ogg'); }}
                    className="group flex items-center gap-3 bg-white/0 hover:bg-white/5 pl-4 pr-1 py-1 rounded-2xl border border-transparent hover:border-white/10 transition-all active:scale-95"
                    title="Min Karakter (P)"
                >
                    {/* Name */}
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-xl font-black italic tracking-tighter text-white leading-none">
                            {player.name}
                        </span>
                    </div>

                    {/* Avatar Container */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg overflow-hidden group-hover:shadow-indigo-500/20">
                            {player.avatar ? (
                                <img src={player.avatar} alt="Profile" className="w-full h-full object-cover rounded-[10px]" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-[10px] text-lg">
                                    {player.role === 'KING' ? '👑' : '👤'}
                                </div>
                            )}
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 text-[9px] font-black text-white z-10">
                            {currentLvl}
                        </div>
                    </div>
                </button>

                {/* SETTINGS */}
                <ButtonIcon icon={Settings} onClick={() => setActiveTab('SETTINGS')} title="Innstillinger" />

                {/* MOBILE MENU TOGGLE */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* MOBILE NAVIGATION DROPDOWN */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-white/10 p-4 shadow-2xl md:hidden flex flex-col gap-2 z-40"
                    >
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                                className={`w-full p-4 rounded-xl text-left font-black uppercase flex items-center gap-4 ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                        <div className="h-px bg-white/5 my-2" />
                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest px-2">
                            <span>År {year}</span>
                            <span>{season}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

// Topbar helper button
const ButtonIcon = ({ icon: Icon, onClick, title, className }: any) => (
    <button
        onClick={onClick}
        title={title}
        className={`hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all ${className}`}
    >
        <Icon size={20} />
    </button>
);

