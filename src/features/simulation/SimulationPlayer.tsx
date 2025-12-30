import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';

import { useLayout } from '../../context/LayoutContext';

import { simulationDb as db } from './simulationFirebase';
import type { SimulationPlayer as SimulationPlayerType, SimulationRoom, ActionResult } from './simulationTypes';
import { LEVEL_XP, ROLE_TITLES, RESOURCE_DETAILS, ROLE_DEFINITIONS } from './constants';

import { performAction } from './actions';
import { Trophy, User as UserIcon, ArrowRight, Check } from 'lucide-react';
import { MinigameOverlay } from './SimulationMinigames';
import { SimulationProvider, useSimulation } from './SimulationContext';
import { SimulationAudioProvider, useAudio } from './SimulationAudioContext';
import { checkActionRequirements } from './utils/actionUtils';
import { useSimulationAuth } from './SimulationAuthContext';


// Components
import { SimulationHeader } from './components/SimulationHeader';
import { SimulationSidebar } from './components/SimulationSidebar';
import { SimulationViewport } from './components/SimulationViewport';
import { SimulationAnimationLayer } from './components/SimulationAnimationLayer';
import { animationManager } from './logic/AnimationManager';

// Premium Tool UI Effects
const premiumStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s infinite linear;
  }
  .tool-glow {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1);
  }
  .upgrade-glow {
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.2);
  }
`;

export default function SimulationPlayerWrapper() {
    return (
        <>
            <style>{premiumStyles}</style>
            <SimulationPlayer />
        </>
    );
}

export const SimulationPlayer: React.FC = () => {
    return (
        <SimulationProvider>
            <SimulationAudioProvider>
                <style>{premiumStyles}</style>
                <SimulationGame />
            </SimulationAudioProvider>
        </SimulationProvider>
    );
};

const SimulationGame: React.FC = () => {
    const { pin } = useParams();
    const [searchParams] = useSearchParams();
    const impersonateId = searchParams.get('impersonate');
    const {
        activeMinigame, setActiveMinigame,
        activeMinigameMethod, setActiveMinigameMethod,
        activeMinigameAction, setActiveMinigameAction,
        actionLoading, setActionLoading
    } = useSimulation();

    const { user, loading: authLoading } = useSimulationAuth();

    const { startPlaylist, stopMusic } = useAudio();

    // Data State
    const [player, setPlayer] = useState<SimulationPlayerType | null>(null);

    // Play Music on Mount
    useEffect(() => {
        startPlaylist();
        return () => stopMusic();
    }, [startPlaylist, stopMusic]);
    const [world, setWorld] = useState<SimulationRoom['world'] | null>(null);
    const [players, setPlayers] = useState<Record<string, SimulationPlayerType>>({});
    const [roomStatus, setRoomStatus] = useState<SimulationRoom['status']>('LOBBY');
    const [markets, setMarkets] = useState<Record<string, any>>({});
    const [messages, setMessages] = useState<string[]>([]);
    const [activeVote, setActiveVote] = useState<SimulationRoom['activeVote'] | null>(null);
    const [diplomacy, setDiplomacy] = useState<Record<string, any>>({});

    const [levelUpData, setLevelUpData] = useState<{ level: number, title: string } | null>(null);
    const [actionResult, setActionResult] = useState<ActionResult | null>(null);
    const [isRetired, setIsRetired] = useState(false);

    // Onboarding State
    const [onboardingStep, setOnboardingStep] = useState<'WELCOME' | 'CREATE' | 'SUCCESS'>('WELCOME');
    const [obName, setObName] = useState('');
    const [obRole, setObRole] = useState<Role>('PEASANT');
    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate();

    // Layout Context
    const { setFullWidth, setHideHeader } = useLayout();
    useEffect(() => {
        setFullWidth(true);
        setHideHeader(true);
        return () => {
            setFullWidth(false);
            setHideHeader(false);
        };
    }, [setFullWidth, setHideHeader]);

    // Data Fetching
    useEffect(() => {
        if (authLoading) return;

        const playerId = impersonateId || localStorage.getItem('sim_player_id') || user?.uid;
        if (!playerId || !pin) return;

        const baseUrl = `simulation_rooms/${pin}`;

        // 1. Current Player Sub
        const playerRef = ref(db, `${baseUrl}/players/${playerId}`);
        const unsubPlayer = onValue(playerRef, (snap) => {
            const data = snap.val();
            if (data) {
                setPlayer({ ...data, id: playerId });
            } else {
                setPlayer(null);
                // If we were in the middle of a game and data becomes null, we likely retired or died
                if (roomStatus === 'PLAYING') {
                    setIsRetired(true);
                }
            }
        });

        // 2. Room Status & Basic World Sub
        const worldRef = ref(db, `${baseUrl}/world`);
        const unsubWorld = onValue(worldRef, (snap) => {
            const data = snap.val();
            if (data) setWorld(data);
        });

        const statusRef = ref(db, `${baseUrl}/status`);
        const unsubStatus = onValue(statusRef, (snap) => {
            const data = snap.val();
            if (data) setRoomStatus(data || 'LOBBY');
        });

        // 3. Markets Sub
        const marketsRef = ref(db, `${baseUrl}/markets`);
        const unsubMarkets = onValue(marketsRef, (snap) => {
            const data = snap.val();
            if (data) setMarkets(data);
        });

        // 4. Messages Sub (Limit results locally or via Firebase if possible)
        const messagesRef = ref(db, `${baseUrl}/messages`);
        const unsubMessages = onValue(messagesRef, (snap) => {
            const data = snap.val();
            if (data) setMessages(data);
        });

        // 5. Active Vote Sub
        const voteRef = ref(db, `${baseUrl}/activeVote`);
        const unsubVote = onValue(voteRef, (snap) => {
            setActiveVote(snap.val());
        });

        // 6. Diplomacy Sub
        const diplomacyRef = ref(db, `${baseUrl}/diplomacy`);
        const unsubDiplomacy = onValue(diplomacyRef, (snap) => {
            setDiplomacy(snap.val() || {});
        });

        // 7. Players Sub (For hierarchy/map) - This could be further optimized selectively
        const playersRef = ref(db, `${baseUrl}/players`);
        const unsubPlayers = onValue(playersRef, (snap) => {
            const data = snap.val();
            if (data) setPlayers(data);
        });

        return () => {
            unsubPlayer();
            unsubWorld();
            unsubStatus();
            unsubMarkets();
            unsubMessages();
            unsubVote();
            unsubDiplomacy();
            unsubPlayers();
        };
    }, [pin, impersonateId]);

    // Title Update
    useEffect(() => {
        if (player) {
            const roleLabel = (ROLE_DEFINITIONS as any)[player.role]?.label || player.role;
            document.title = `${player.name} (${roleLabel}) | Eiriksbok`;
        } else {
            document.title = 'Rikesimulator | Eiriksbok';
        }
        return () => {
            document.title = 'Eiriksbok';
        };
    }, [player]);

    // --- RESOURCE ANIMATION SYSTEM ---
    const prevResourcesRef = useRef<Record<string, number> | null>(null);
    const initialLoadRef = useRef(true);

    useEffect(() => {
        if (!player || !player.resources) return;

        if (initialLoadRef.current) {
            prevResourcesRef.current = { ...player.resources };
            initialLoadRef.current = false;
            return;
        }

        const prev = prevResourcesRef.current || {};
        const current = player.resources;
        const newItems: { id: string, label: string, icon: string, amount: number }[] = [];

        Object.keys(current).forEach((key) => {
            const diff = (current[key as keyof typeof current] || 0) - (prev[key as keyof typeof prev] || 0);
            if (diff > 0 && key !== 'manpower') {
                const details = (RESOURCE_DETAILS as any)[key] || { label: key, icon: '📦' };
                newItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    label: details.label,
                    icon: details.icon,
                    amount: diff
                });
            }
        });

        if (newItems.length > 0) {
            newItems.forEach((item, idx) => {
                // Staggered appearance
                setTimeout(() => {
                    animationManager.spawnFloatingText(`${item.icon} +${item.amount}`, 50, 50, 'text-amber-400');
                }, idx * 150);
            });
        }

        prevResourcesRef.current = { ...player.resources };
    }, [player?.resources]);

    // --- LEVEL UP SYSTEM ---
    const prevXpRef = useRef<number | null>(null);
    useEffect(() => {
        if (!player) return;
        const currentXp = player.stats.xp || 0;

        if (prevXpRef.current === null) {
            prevXpRef.current = currentXp;
            return;
        }

        const getLevel = (xp: number) => {
            const index = LEVEL_XP.findIndex(req => xp < req);
            return index === -1 ? LEVEL_XP.length : index;
        };

        const oldLevel = getLevel(prevXpRef.current);
        const newLevel = getLevel(currentXp);

        if (newLevel > oldLevel) {
            const titles = ROLE_TITLES[player.role as keyof typeof ROLE_TITLES] || [];
            const newTitle = titles[newLevel - 1] || titles[titles.length - 1] || player.role;
            setLevelUpData({ level: newLevel, title: newTitle });
        }

        prevXpRef.current = currentXp;
    }, [player?.stats.xp, player?.role]);

    // --- LEVEL SYNC (RETROACTIVE) ---
    useEffect(() => {
        if (!player || !pin || !player.id) return;

        const getLevel = (xp: number) => {
            const index = LEVEL_XP.findIndex(req => xp < req);
            return index === -1 ? LEVEL_XP.length : index;
        };

        const correctLevel = getLevel(player.stats.xp || 0);
        if ((player.stats.level || 1) !== correctLevel) {
            const statsRef = ref(db, `simulation_rooms/${pin}/players/${player.id}/stats`);
            update(statsRef, { level: correctLevel });
        }
    }, [player?.stats.xp, pin, player?.id, player?.stats?.level]);



    // --- ACTION HANDLER ---
    const handleClearActionResult = React.useCallback(() => {
        setActionResult(null);
    }, []);

    const handleAction = async (action: any) => {
        if (!pin || !player || actionLoading) return;

        const actionType = typeof action === 'string' ? action : action.type;
        const actionMethod = typeof action === 'object' ? action.method : null;

        const minigameTypes = ['WORK', 'CHOP', 'CRAFT', 'MILL', 'DEFEND', 'EXPLORE', 'MINE', 'QUARRY', 'PATROL', 'FORAGE', 'REFINE', 'SMELT', 'BAKE', 'WEAVE', 'MIX'];

        if (minigameTypes.includes(actionType) && !activeMinigame && (!action.performance)) {
            // PRE-CHECK REQUIREMENTS
            const currentSeason = (world?.season || 'Spring') as any;
            const currentWeather = (world?.weather || 'Clear') as any;

            // We must temporarily map "REFINE" to the specific cost ID if needed, 
            // but checkActionRequirements handles the 'action.id' vs 'action.type' 
            // The tooltip uses action.id. Here we use action object which should contain the ID.

            const check = checkActionRequirements(player, action, currentSeason, currentWeather);
            if (!check.success) {
                alert(`Du har ikke råd til dette: ${check.reason}`);
                setActionResult({
                    success: false,
                    timestamp: Date.now(),
                    message: `Kan ikke utføre: ${check.reason}`,
                    yields: [],
                    xp: [],
                    durability: []
                });
                return;
            }

            let actualType = actionType;

            // Map refined actions to thematic games
            if (actionType === 'REFINE') {
                if (action.recipeId === 'flour') actualType = 'MILL';
                if (action.recipeId === 'iron_ingot') actualType = 'SMELT';
                if (action.recipeId === 'bread' || action.recipeId === 'pie' || action.recipeId === 'mead') actualType = 'BAKE';
                if (action.recipeId === 'cloth') actualType = 'WEAVE';
            }
            if (actionType === 'CRAFT' && (action.id === 'CRAFT_MEDICINE' || action.id === 'CRAFT_POISON')) {
                actualType = 'MIX';
            }

            setActiveMinigame(actualType as any);
            if (actionMethod) setActiveMinigameMethod(actionMethod);
            setActiveMinigameAction(action);
            return;
        }


        setActionLoading(actionType);
        const result = await performAction(pin, player.id, action);

        if (result.data) {
            setActionResult(result.data);
        } else if (!result.success) {
            // Fallback error if no data
            setActionResult({
                success: false,
                timestamp: Date.now(),
                message: `Handlingen feilet: ${(result as any).error?.message || (result as any).error || 'Ukjent feil'}`,
                yields: [],
                xp: [],
                durability: []
            });
        }

        setActionLoading(null);
        setActiveMinigame(null);
        setActiveMinigameAction(null);
        setActiveMinigameMethod(null);

    };

    const handleCreatePlayer = async () => {
        if (!pin || !obName.trim() || isCreating) return;
        setIsCreating(true);

        try {
            const playerId = user?.uid || `guest_${Date.now()}`;
            const role = pin === 'TEST' ? obRole : 'PEASANT';

            let regionId = 'unassigned';
            if (role === 'BARON') regionId = `region_${playerId}`;
            else if (role === 'KING') regionId = 'capital';

            const newPlayer: SimulationPlayerType = {
                id: playerId,
                uid: user?.uid,
                name: obName.trim(),
                role: role,
                regionId: regionId,
                resources: INITIAL_RESOURCES[role] || INITIAL_RESOURCES.PEASANT,
                skills: INITIAL_SKILLS[role] || INITIAL_SKILLS.PEASANT,
                stats: { xp: 0, level: 1, reputation: 50, contribution: 0 },
                status: { hp: 100, morale: 100, stamina: 50, legitimacy: 100, authority: 50, loyalty: 100, isJailed: false, isFrozen: false },
                equipment: INITIAL_EQUIPMENT[role] || INITIAL_EQUIPMENT.PEASANT,
                upgrades: [],
                lastActive: Date.now()
            };

            await set(ref(db, `simulation_rooms/${pin}/players/${playerId}`), newPlayer);
            localStorage.setItem('sim_player_id', playerId);
            localStorage.setItem('sim_room_pin', pin);

            setOnboardingStep('SUCCESS');
            // Player subscription will pick up the new data automatically
        } catch (err) {
            console.error("Failed to create player:", err);
        } finally {
            setIsCreating(false);
        }
    };

    if (authLoading) return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!player) {
        // --- ONBOARDING UI ---
        // We show this even if 'world' is loading to give a good first impression.
        // If it's a real room, we still need to verify it exists eventually, 
        // but for now, the Welcome screen is the priority.

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_100%)]">
                <div className="max-w-2xl w-full">
                    {onboardingStep === 'WELCOME' && (
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-12 md:p-16 rounded-[3.5rem] text-center space-y-10 shadow-2xl animate-in fade-in zoom-in duration-500">
                            <div className="space-y-4">
                                <h1 className="text-6xl md:text-8xl font-black italic text-white tracking-tighter leading-none">FEUDAL SIM</h1>
                                <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-xs">En Levende Simulator</p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                                    Dette er et spill om makt, ressurser og overlevelse i et føydalt samfunn.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-indigo-400 font-black text-[10px] uppercase mb-1">Bygg</div>
                                        <p className="text-slate-500 text-xs">Samle ressurser og bygg opp produksjonen din.</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-indigo-400 font-black text-[10px] uppercase mb-1">Samarbeid</div>
                                        <p className="text-slate-500 text-xs">Handle med andre og styrk baroniet ditt.</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-indigo-400 font-black text-[10px] uppercase mb-1">Herske</div>
                                        <p className="text-slate-500 text-xs">Ta politiske valg som påvirker hele riket.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    onClick={() => {
                                        setObName(account?.displayName || '');
                                        setOnboardingStep('CREATE');
                                    }}
                                    className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto w-64"
                                >
                                    Skap din Karakter <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => navigate('/sim')}
                                    className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                                >
                                    Gå til Lobby
                                </button>
                            </div>
                        </div>
                    )}

                    {onboardingStep === 'CREATE' && (
                        <div className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">Hvem er du?</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Opprett din karakter i {pin}</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Ditt Navn i Riket</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-6 flex items-center text-slate-500 group-focus-within:text-indigo-400">
                                            <UserIcon size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={obName}
                                            onChange={(e) => setObName(e.target.value)}
                                            placeholder="f.eks. Eirik den Røde"
                                            className="w-full bg-slate-950 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-6 text-xl font-black text-white outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {pin === 'TEST' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Velg din Rolle (Kun TEST-server)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {(['PEASANT', 'SOLDIER', 'MERCHANT', 'BARON'] as Role[]).map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => setObRole(role)}
                                                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${obRole === role
                                                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                        : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button
                                        onClick={() => setOnboardingStep('WELCOME')}
                                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-xs transition-all"
                                    >
                                        Tilbake
                                    </button>
                                    <button
                                        onClick={handleCreatePlayer}
                                        disabled={!obName.trim() || isCreating}
                                        className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isCreating ? 'Oppretter...' : 'Start Reises'}
                                        {!isCreating && <ArrowRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {onboardingStep === 'SUCCESS' && (
                        <div className="bg-emerald-500/10 backdrop-blur-3xl border border-emerald-500/30 p-16 rounded-[4rem] text-center space-y-8 shadow-2xl animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                                <Check size={48} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">Velkommen inn!</h2>
                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Din karakter er klar</p>
                            </div>
                            <p className="text-slate-400 font-medium">Laster dine ressurser og kartet...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!world) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 p-12">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Henter Verden...</h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Laster ressurser og kart</p>
                </div>
            </div>
        );
    }

    // Construct a lightweight virtual room object for components that expect the full room
    // This maintains backward compatibility with SimulationHeader, SimulationSidebar, SimulationViewport
    const room = {
        status: roomStatus,
        world,
        players,
        messages,
        markets,
        diplomacy,
        activeVote,
        pin: pin || ''
    } as SimulationRoom;


    // --- RENDER ---
    if (isRetired) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border-2 border-indigo-500/30 rounded-[3rem] p-12 text-center shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-indigo-500/40 shadow-2xl">
                        <Trophy size={48} className="text-white animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black italic text-white tracking-tighter">ET LIV ER OVER</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Karakteren din har trukket seg tilbake</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <p className="text-slate-400 text-sm italic">
                            "Alle eventyr har en slutt, men legendene lever evig i krønikene."
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/sim/profile')}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <UserIcon size={18} /> Se Global Profil
                        </button>
                        <button
                            onClick={() => navigate('/sim')}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        >
                            Tilbake til Lobby
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
            {impersonateId && (
                <div className="fixed top-0 inset-x-0 z-[2000] bg-rose-600 text-white px-4 py-1.5 flex items-center justify-between font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl border-b border-white/20">
                    <div className="flex items-center gap-4">
                        <span className="animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            ADMIN KONTROLL AKTIV
                        </span>
                        <span className="opacity-40">|</span>
                        <span>Styrer: <span className="text-rose-200">{player.name}</span> ({player.role})</span>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="bg-black/20 hover:bg-black/40 px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95 border border-white/10"
                    >
                        Avslutt & Lukk ✕
                    </button>
                </div>
            )}

            {room.status === 'LOBBY' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" >
                    <div className="animate-bounce text-6xl mb-8">⏳</div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">Venter på Kongen...</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Du er registrert som <strong className="text-white text-base block mt-2">{player.name}</strong>
                    </p>
                </div>
            ) : (
                <div className={`flex-1 flex flex-col relative ${impersonateId ? 'pt-8' : ''}`}>
                    <div className="fixed inset-0 top-0 bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30">
                        {/* Background Atmosphere */}
                        <div className="fixed inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
                        </div>

                        {/* Minigame Overlay */}
                        {
                            activeMinigame && (
                                <MinigameOverlay
                                    type={activeMinigame}
                                    playerUpgrades={player.upgrades}
                                    equipment={Object.values(player.equipment || {})}
                                    skills={player.skills}
                                    selectedMethod={activeMinigameMethod || undefined}
                                    onComplete={(score) => handleAction({ ...(activeMinigameAction || {}), performance: score, method: activeMinigameMethod })}
                                    onCancel={() => { setActiveMinigame(null); setActiveMinigameAction(null); setActiveMinigameMethod(null); }}

                                    currentSeason={(room.world?.season || 'Spring') as any}
                                    currentWeather={(room.world?.weather || 'Clear') as any}
                                />
                            )

                        }

                        {/* ANIMATION LAYER */}
                        <SimulationAnimationLayer />

                        <div className="flex flex-col h-full w-full">
                            {/* TOP HEADER */}
                            <SimulationHeader room={room} player={player} pin={pin} />

                            {/* MAIN ROW */}
                            <div className="flex flex-1 overflow-hidden">
                                <SimulationSidebar player={player} room={room} />
                                <SimulationViewport
                                    player={player}
                                    room={room}
                                    pin={pin}
                                    onAction={handleAction}
                                    actionResult={actionResult}
                                    onClearActionResult={handleClearActionResult}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {levelUpData && (
                <LevelUpOverlay
                    level={levelUpData.level}
                    title={levelUpData.title}
                    onClose={() => setLevelUpData(null)}
                />
            )}
        </div>
    );
};

const LevelUpOverlay: React.FC<{ level: number, title: string, onClose: () => void }> = ({ level, title, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-in zoom-in duration-500">
                <div className="bg-white rounded-[2.2rem] p-10 text-center relative overflow-hidden max-w-sm">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" />

                    <div className="relative z-10">
                        <div className="text-7xl mb-6 animate-bounce">🎊</div>
                        <h2 className="text-sm font-black text-amber-600 uppercase tracking-[0.3em] mb-2">Nivå Oppnådd!</h2>
                        <h3 className="text-6xl font-black text-slate-800 mb-4">Nivå {level}</h3>

                        <div className="h-0.5 w-16 bg-slate-200 mx-auto mb-6" />

                        <p className="text-slate-500 font-medium mb-1">Ny Tittel:</p>
                        <p className="text-3xl font-black text-indigo-600 mb-8">{title}</p>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95"
                        >
                            FORTSETT REISEN
                        </button>
                    </div>

                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-amber-500 rounded-full animate-ping"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes ping-slow {
                        0% { transform: scale(1); opacity: 0.8; }
                        100% { transform: scale(3); opacity: 0; }
                    }
                `}} />
        </div>
    );
};
