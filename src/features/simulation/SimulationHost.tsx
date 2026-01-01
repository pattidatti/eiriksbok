import React, { useState, useEffect } from 'react';
import { ref, set, onValue, update, get, remove } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { useLayout } from '../../context/LayoutContext';

import { INITIAL_MARKET, ROLE_DEFINITIONS, INITIAL_RESOURCES, VILLAGE_BUILDINGS, SEASONS, RESOURCE_DETAILS } from './constants';
import type { SimulationRoom } from './simulationTypes';
import { Globe, Lock } from 'lucide-react';
import { assignRoles, collectTaxes } from './gameLogic';

const syncServerMetadata = async (pin: string, data: SimulationRoom | null) => {
    if (!pin || !data) return;
    const metadataRef = ref(db, `simulation_server_metadata/${pin}`);
    if (data.isPublic === false) {
        await set(metadataRef, null);
        return;
    }
    await set(metadataRef, {
        pin: pin,
        status: data.status,
        playerCount: Object.keys(data.players || {}).length,
        worldYear: data.world.year,
        season: data.world.season,
        isPublic: !!data.isPublic,
        hostName: data.hostName || "Anonym Host",
        lastUpdated: Date.now()
    });
};

export const SimulationHost: React.FC = () => {
    const [pin, setPin] = useState<string>('');
    const [roomData, setRoomData] = useState<SimulationRoom | null>(null);
    const [allRooms, setAllRooms] = useState<SimulationRoom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'LIST' | 'MANAGE' | 'ECONOMY'>('LIST');
    const { setFullWidth, setHideHeader } = useLayout();

    // Lazy load the blueprint
    const [SimulationEconomyBlueprint, setSimulationEconomyBlueprint] = useState<any>(null);

    useEffect(() => {
        import('./components/SimulationEconomyBlueprint').then(mod => {
            setSimulationEconomyBlueprint(() => mod.SimulationEconomyBlueprint);
        });
    }, []);

    const deleteRoom = async (roomPin: string) => {
        if (!window.confirm(`ER DU SIKKER? Dette vil slette rommet ${roomPin} permanent! Denne handlingen kan ikke angres.`)) return;
        setIsLoading(true);
        try {
            await remove(ref(db, `simulation_rooms/${roomPin}`));
        } catch (e) {
            console.error(e);
            alert("Kunne ikke slette rommet.");
        } finally {
            setIsLoading(false);
        }
    };


    // Handle Layout
    useEffect(() => {
        setFullWidth(true);
        setHideHeader(true);
        return () => {
            setFullWidth(false);
            setHideHeader(false);
        };
    }, [setFullWidth, setHideHeader]);

    // Fetch all rooms on mount
    useEffect(() => {
        const roomsRef = ref(db, 'simulation_rooms');
        const unsubscribe = onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const roomList = Object.entries(data).map(([key, val]: [string, any]) => ({
                    ...val,
                    pin: val.pin || key
                }));
                // Sort by pin or creation? Reverse seems to be the intent
                setAllRooms(roomList.reverse() as any[]);
            } else {
                setAllRooms([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Sync specific room data and patch market
    useEffect(() => {
        if (!pin) return;
        const roomRef = ref(db, `simulation_rooms/${pin}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRoomData(data);

                // DEBUG/PATCH: Ensure all market items exist in active markets
                let marketsUpdated = false;
                const newMarkets = { ...data.markets };

                // If legacy 'market' exists but 'markets' doesn't have capital, migrate it
                if (!newMarkets['capital'] && data.market) {
                    newMarkets['capital'] = data.market;
                    marketsUpdated = true;
                }

                // Patch each market with missing keys from INITIAL_MARKET
                Object.keys(newMarkets).forEach(regionId => {
                    const market = newMarkets[regionId];
                    let marketChanged = false;
                    Object.keys(INITIAL_MARKET).forEach(key => {
                        if (!market[key]) {
                            console.log(`Patching missing market item: ${key} in region ${regionId}`);
                            market[key] = (INITIAL_MARKET as any)[key];
                            marketChanged = true;
                        }
                    });
                    if (marketChanged) marketsUpdated = true;
                });

                if (marketsUpdated) {
                    console.log("Patching markets with new resources...");
                    update(ref(db, `simulation_rooms/${pin}/markets`), newMarkets);
                }
            }
        });
        return () => unsubscribe();
    }, [pin]);

    // Handle Title Change (Moved from inside previous useEffect)
    useEffect(() => {
        if (pin && view === 'MANAGE') {
            document.title = `Host: ${pin} | Eiriksbok`;
        } else {
            document.title = 'Simuleringshallen | Eiriksbok';
        }
        return () => {
            document.title = 'Eiriksbok';
        };
    }, [pin, view]);

    const createRoom = async () => {
        setIsLoading(true);
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        const initialRoomState: SimulationRoom = {
            pin: newPin,
            status: 'LOBBY',
            settings: 'feudal_europe',
            hostName: 'Admin',
            isPublic: true,
            market: JSON.parse(JSON.stringify(INITIAL_MARKET)),
            markets: {
                'capital': JSON.parse(JSON.stringify(INITIAL_MARKET))
            },
            regions: {},
            players: {},
            world: {
                year: 1100,
                season: 'Spring',
                weather: 'Clear',
                gameTick: 0,
                lastTickAt: Date.now(),
                taxRateDetails: { kingTax: 20 },
                settlement: {
                    buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                        ...acc,
                        [id]: { id, level: 0, progress: {}, target: 200, contributions: {} }
                    }), {}),

                }
            },
            worldEvents: {},
            diplomacy: {},
            messages: []
        };
        try {
            await set(ref(db, `simulation_rooms/${newPin}`), initialRoomState);
            await syncServerMetadata(newPin, initialRoomState);
            setPin(newPin);
            setView('MANAGE');
        } catch (error) {
            console.error(error);
            alert("Kunne ikke opprette rom.");
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const updatedPlayers = assignRoles(roomData.players);
            const newRegions: any = {};
            const newMarkets: any = { ...roomData.markets };

            // Ensure capital market exists
            if (!newMarkets['capital']) newMarkets['capital'] = JSON.parse(JSON.stringify(INITIAL_MARKET));

            Object.values(updatedPlayers).forEach(p => {
                if (p.role === 'BARON') {
                    const isVest = p.regionId === 'region_vest';
                    newRegions[p.regionId] = {
                        id: p.id,
                        name: isVest ? 'Baroniet Vest' : 'Baroniet Øst',
                        taxRate: 10,
                        defenseLevel: 50,
                        rulerName: p.name
                    };
                    // Create Local Market for this Baron
                    // Add some variance to prices
                    const localMarket: any = JSON.parse(JSON.stringify(INITIAL_MARKET));
                    Object.keys(localMarket).forEach(key => {
                        const item = localMarket[key];
                        // Random +/- 20% price and stock
                        item.price = Math.floor(item.price * (0.8 + Math.random() * 0.4));
                        item.stock = Math.floor(item.stock * (0.8 + Math.random() * 0.4));
                    });
                    newMarkets[p.regionId] = localMarket;
                }
            });

            const publicProfiles: any = {};
            Object.values(updatedPlayers).forEach(p => {
                publicProfiles[p.id] = {
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    regionId: p.regionId,
                    stats: { level: p.stats.level || 1 },
                    status: { isJailed: false, isFrozen: false, legitimacy: 100 },
                    online: true,
                    lastActive: p.lastActive
                };
            });
            const updates: any = {}; // Re-added missing declaration
            updates[`simulation_rooms/${pin}/players`] = updatedPlayers;
            updates[`simulation_rooms/${pin}/public_profiles`] = publicProfiles;
            updates[`simulation_rooms/${pin}/regions`] = newRegions;
            updates[`simulation_rooms/${pin}/markets`] = newMarkets;
            updates[`simulation_rooms/${pin}/status`] = 'PLAYING';
            await update(ref(db), updates);
            // Sync metadata
            const updatedRoom = { ...roomData, status: 'PLAYING' } as SimulationRoom;
            await syncServerMetadata(pin, updatedRoom);
        } catch (e) {
            console.error(e);
            alert("Klarte ikke starte.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaxation = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const kingTax = roomData.world.taxRateDetails.kingTax || 20;
            const { updatedPlayers, results } = collectTaxes(roomData.players, kingTax);

            await update(ref(db, `simulation_rooms/${pin}/players`), updatedPlayers);
            alert(`Suksess! ${results.length} bønder og baroner ble skattlagt.`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const regenAllStamina = async () => {
        if (!roomData || !roomData.players) return;
        setIsLoading(true);
        try {
            const updates: any = {};
            Object.keys(roomData.players).forEach(id => {
                updates[`simulation_rooms/${pin}/players/${id}/status/stamina`] = 100;
            });
            await update(ref(db), updates);
            alert("All energi er gjenopprettet!");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to normalize messages
    const getMessagesList = (msgs: string[] | Record<string, string> | undefined): string[] => {
        if (!msgs) return [];
        if (Array.isArray(msgs)) return msgs;
        return Object.values(msgs);
    };

    const nextSeason = async () => {
        if (!roomData) return;
        const seasonsList: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
        const currentIdx = seasonsList.indexOf(roomData.world.season);
        const nextIdx = (currentIdx + 1) % seasonsList.length;
        const nextSeasonVal = seasonsList[nextIdx];

        setIsLoading(true);
        try {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sLabel = (SEASONS as any)[nextSeasonVal]?.label || nextSeasonVal;
            const msg = `[${timestamp}] 🌍 Årstiden har skiftet til ${sLabel}!`;

            const currentMessages = getMessagesList(roomData.messages);
            const updatedMessages = [...currentMessages, msg].slice(-30);

            const updates: any = {};
            updates[`simulation_rooms/${pin}/world/season`] = nextSeasonVal;
            updates[`simulation_rooms/${pin}/messages`] = updatedMessages;

            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const changeWeather = async () => {
        if (!roomData) return;
        const weatherList: ('Clear' | 'Rain' | 'Storm' | 'Fog')[] = ['Clear', 'Rain', 'Storm', 'Fog'];
        const currentIdx = weatherList.indexOf(roomData.world.weather || 'Clear');
        const nextIdx = (currentIdx + 1) % weatherList.length;
        const nextWeather = weatherList[nextIdx];

        try {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const weatherMap: any = { Clear: 'Klart', Rain: 'Regn', Storm: 'Storm', Fog: 'Tåke' };
            const wLabel = weatherMap[nextWeather] || nextWeather;
            const msg = `[${timestamp}] ☁️ Været har skiftet til ${wLabel}!`;

            const currentMessages = getMessagesList(roomData.messages);
            const updatedMessages = [...currentMessages, msg].slice(-30);

            const updates: any = {};
            updates[`simulation_rooms/${pin}/world/weather`] = nextWeather;
            updates[`simulation_rooms/${pin}/messages`] = updatedMessages;

            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
        }
    };

    const startTing = async () => {
        if (!roomData) return;
        const { LAW_TEMPLATES } = await import('./constants');
        const law = LAW_TEMPLATES[Math.floor(Math.random() * LAW_TEMPLATES.length)];

        const activeVote = {
            lawId: law.id,
            title: law.label,
            votes: {},
            expiresAt: Date.now() + (60 * 1000) // 1 minute to vote
        };

        try {
            await update(ref(db, `simulation_rooms/${pin}`), { activeVote });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msg = `[${timestamp}] ⚖️ TINGET ER SATT! Det skal stemmes over loven: "${law.label}"!`;

            const currentMessages = getMessagesList(roomData.messages);
            const updatedMessages = [...currentMessages, msg].slice(-30);

            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });

            // Auto resolve after 1 minute
            setTimeout(() => resolveVote(law.id), 60000);
        } catch (e) {
            console.error(e);
        }
    };

    const resolveVote = async (lawId: string) => {
        const snapshot = await get(ref(db, `simulation_rooms/${pin}/activeVote`));
        if (!snapshot.exists()) return;
        const voteData = snapshot.val();

        const votes = Object.values(voteData.votes || {}) as ('YES' | 'NO' | 'ABSTAIN')[];
        const yesVotes = votes.filter(v => v === 'YES').length;
        const noVotes = votes.filter(v => v === 'NO').length;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let msg = '';
        let activeLaws = roomData?.world.activeLaws || [];

        if (yesVotes > noVotes) {
            msg = `[${timestamp}] ✅ LOVEN ER VEDTATT! "${voteData.title}" er nå gjeldende.`;
            activeLaws = [...activeLaws, lawId];
        } else {
            msg = `[${timestamp}] ❌ LOVEN BLE FORKASTET. "${voteData.title}" ble nedstemt.`;
        }

        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), { activeLaws });

            const currentMessages = getMessagesList(roomData?.messages);
            await update(ref(db, `simulation_rooms/${pin}`), {
                activeVote: null,
                messages: [...currentMessages, msg].slice(-30)
            });
        } catch (e) {
            console.error(e);
        }
    };

    const spawnRandomEvent = async () => {

        if (!roomData) return;
        const { WORLD_EVENT_TEMPLATES } = await import('./constants');
        const template = WORLD_EVENT_TEMPLATES[Math.floor(Math.random() * WORLD_EVENT_TEMPLATES.length)];
        const eventId = `event_${Date.now()}`;
        const newEvent = {
            ...template,
            id: eventId,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
        };

        try {
            await update(ref(db, `simulation_rooms/${pin}/worldEvents`), { [eventId]: newEvent });
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msg = `[${timestamp}] 🔔 HENDELSE: ${template.title}! Sjekk kartet!`;

            const currentMessages = getMessagesList(roomData.messages);
            const updatedMessages = [...currentMessages, msg].slice(-30);

            await update(ref(db, `simulation_rooms/${pin}`), { messages: updatedMessages });
        } catch (e) {
            console.error(e);
        }
    };

    const initializeSettlement = async () => {
        if (!roomData) return;
        setIsLoading(true);
        try {
            await update(ref(db, `simulation_rooms/${pin}/world`), {
                settlement: {
                    buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                        ...acc,
                        [id]: { id, level: 0, progress: {}, target: 200 }
                    }), {}),

                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const resetGame = async () => {
        console.log("Attempting resetGame...");
        if (!window.confirm("Er du sikker på at du vil starte spillet på nytt? Alle fremdrift slettes.")) {
            console.log("Reset cancelled by user.");
            return;
        }
        console.log("Reset confirmed. Pin:", pin);
        setIsLoading(true);
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/status`] = 'LOBBY';
            updates[`simulation_rooms/${pin}/worldEvents`] = {};
            updates[`simulation_rooms/${pin}/messages`] = [];
            updates[`simulation_rooms/${pin}/market`] = INITIAL_MARKET;
            updates[`simulation_rooms/${pin}/markets`] = { 'capital': INITIAL_MARKET };
            updates[`simulation_rooms/${pin}/regions`] = {}; // Clear regions
            updates[`simulation_rooms/${pin}/world/monumentProgress`] = 0;
            updates[`simulation_rooms/${pin}/world/activeLaws`] = [];
            updates[`simulation_rooms/${pin}/world/settlement`] = {
                buildings: Object.entries(VILLAGE_BUILDINGS).reduce((acc, [id]: [string, any]) => ({
                    ...acc,
                    [id]: { id, level: 0, progress: {}, target: 200 }
                }), {}),
            };

            // Reset players
            Object.keys(roomData?.players || {}).forEach(id => {
                updates[`simulation_rooms/${pin}/players/${id}/role`] = 'PEASANT'; // Reset role
                updates[`simulation_rooms/${pin}/players/${id}/regionId`] = 'capital'; // Reset region
                updates[`simulation_rooms/${pin}/players/${id}/resources`] = INITIAL_RESOURCES.PEASANT;
                updates[`simulation_rooms/${pin}/players/${id}/status`] = { stamina: 100, legitimacy: 100, authority: 50 };
                updates[`simulation_rooms/${pin}/players/${id}/equipment`] = {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'swords', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                };
                // Reset Public Profile Logic
                const publicPath = `simulation_rooms/${pin}/public_profiles/${id}`;
                updates[`${publicPath}/role`] = 'PEASANT';
                updates[`${publicPath}/regionId`] = 'capital';
                updates[`${publicPath}/stats/level`] = 1;

            });

            console.log("Constructed updates:", updates);
            await update(ref(db), updates);

            // Force immediate local state update to reflect changes
            if (roomData) {
                setRoomData({ ...roomData, status: 'LOBBY', messages: [] });
            }

            console.log("Update successful!");
            alert("Spillet er nullstilt!");
        } catch (e) {
            console.error("Reset failed:", e);
            alert("Kunne ikke nullstille spill: " + e);
        } finally {
            setIsLoading(false);
        }
    };


    const kickPlayer = async (playerId: string, playerName: string) => {
        if (!window.confirm(`Er du sikker på at du vil kaste ut ${playerName}?`)) return;
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/players/${playerId}`] = null;
            updates[`simulation_rooms/${pin}/public_profiles/${playerId}`] = null;
            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
            alert("Kunne ikke kaste ut spiller.");
        }
    };

    const kickAllPlayers = async () => {
        if (!window.confirm("ER DU SIKKER? Dette vil kaste ut ALLE spillere fra rommet!")) return;
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/players`] = {};
            await update(ref(db), updates);
            alert("Alle spillere er kastet ut.");
        } catch (e) {
            console.error(e);
            alert("Kunne ikke utføre handlingen.");
        }
    };

    const controlPlayer = (playerId: string) => {
        const url = `${window.location.origin}/sim/play/${pin}?impersonate=${playerId}`;
        window.open(url, '_blank');
    };

    const handleRoleChange = async (playerId: string, newRole: any) => {
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/players/${playerId}/role`] = newRole;
            updates[`simulation_rooms/${pin}/public_profiles/${playerId}/role`] = newRole;
            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
            alert("Kunne ikke endre rolle.");
        }
    };

    const handleRegionChange = async (playerId: string, newRegion: string) => {
        try {
            const updates: any = {};
            updates[`simulation_rooms/${pin}/players/${playerId}/regionId`] = newRegion;
            updates[`simulation_rooms/${pin}/public_profiles/${playerId}/regionId`] = newRegion;
            await update(ref(db), updates);
        } catch (e) {
            console.error(e);
            alert("Kunne ikke endre baroni.");
        }
    };

    const togglePublicRoom = async () => {
        if (!roomData) return;
        const newVal = !roomData.isPublic;
        try {
            await update(ref(db, `simulation_rooms/${pin}`), { isPublic: newVal });
            await syncServerMetadata(pin, { ...roomData, isPublic: newVal });
        } catch (e) {
            console.error(e);
        }
    };

    if (view === 'LIST') {
        return (
            <div className="fixed inset-0 top-0 bg-slate-950 text-slate-200 p-12 overflow-y-auto custom-scrollbar font-sans z-20">
                <div className="fixed inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-5xl font-black text-white px-2 tracking-tighter">Simuleringshallen</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 px-2">Sentralt kontrollpanel for administratoren</p>
                        </div>
                        <button
                            onClick={createRoom}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                            + Opprett Nytt Rike
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allRooms.map(r => (
                            <div key={r.pin} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] group hover:border-indigo-500/50 transition-all shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-5xl font-mono font-black text-white group-hover:text-indigo-400 transition-colors">{r.pin}</div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === 'PLAYING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {typeof r.status === 'string' ? r.status : 'KORRUPT'}
                                    </span>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                                        <span>Innbyggere:</span>
                                        <span className="text-white">{Object.keys(r.players || {}).length} sjeler</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                                        <span>Årstid:</span>
                                        <span className="text-indigo-300">{(INITIAL_MARKET as any)[r.world?.season] || r.world?.season || 'Ukjent'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setPin(r.pin); setView('MANAGE'); }}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                                    >
                                        Administrer &rarr;
                                    </button>
                                    <button
                                        onClick={() => deleteRoom(r.pin)}
                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 w-16 rounded-2xl flex items-center justify-center border border-rose-500/20 transition-all hover:scale-105 active:scale-95"
                                        title="Slett rom"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        );
    }
    if (!roomData) return null;

    // DATA INTEGRITY CHECK (Non-blocking warning)
    const isCorrupted = typeof roomData.status !== 'string' || !roomData.world;

    return (
        <div className="fixed inset-0 top-0 bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30 z-20">
            {/* Warning Banner */}
            {isCorrupted && (
                <div className="absolute top-0 inset-x-0 z-50 bg-rose-600 text-white px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4">
                    <span>⚠ ADVARSEL: Dette rommet inneholder ugyldig data.</span>
                    <button onClick={resetGame} className="bg-white text-rose-600 px-3 py-1 rounded hover:bg-slate-100 transition-colors">NULLSTILL NÅ</button>
                </div>
            )}

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
            </div>

            {/* LEFT PANEL: ADMIN COMMAND CENTER */}
            <aside className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl overflow-y-auto no-scrollbar">
                <div className="p-8 border-b border-white/5 bg-black/20">
                    <button onClick={() => setView('LIST')} className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4 hover:text-white transition-colors flex items-center gap-2">
                        &larr; Tilbake til oversikt
                    </button>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-4xl font-mono font-black text-white">{pin}</h1>
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Admin</span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                        {typeof roomData.status === 'string' ? roomData.status : 'FEIL: DATA KORRUPT'} MODUS
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={startGame}
                            disabled={roomData.status === 'PLAYING' || isLoading}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${roomData.status === 'PLAYING' ? 'bg-emerald-600/20 text-emerald-500 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'}`}
                        >
                            {roomData.status === 'PLAYING' ? '✅ SPILL AKTIVT' : '🚀 START SPILL'}
                        </button>
                        <button
                            onClick={togglePublicRoom}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 ${roomData.isPublic ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600 hover:text-white' : 'bg-slate-800 text-slate-500 border-white/5 hover:border-indigo-500/20'}`}
                        >
                            {roomData.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                            {roomData.isPublic ? 'OFFENTLIG SERVER' : 'PRIVAT (KUN PIN)'}
                        </button>
                        <button
                            onClick={resetGame}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                        >
                            ⚠ NULLSTILL ALT
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* World Controls */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Verdensstyring</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 italic">Årstid: {(SEASONS as any)[roomData.world?.season]?.label || 'Ukjent'}</span>
                                    <span className="text-2xl group-hover:rotate-12 transition-transform">{{ Spring: '🌱', Summer: '☀️', Autumn: '🍂', Winter: '❄️' }[roomData.world?.season || 'Spring']}</span>
                                </div>
                                <button onClick={nextSeason} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-all">Neste Årstid</button>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 italic">Vær: {roomData.world?.weather || 'Klart'}</span>
                                    <span className="text-2xl group-hover:scale-110 transition-transform">☁️</span>
                                </div>
                                <button onClick={changeWeather} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-all">Endre Vær</button>
                            </div>
                        </div>
                    </section>

                    {/* Mass Actions */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Massehandlinger</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleTaxation} className="w-full bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-600/20 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2">
                                💰 Skattlegg Riket
                            </button>
                            <button onClick={regenAllStamina} className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 text-center">
                                ⚡ Gjenopprett Stamina
                            </button>
                            <button onClick={kickAllPlayers} className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/20 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 text-center mt-2">
                                ☠️ Kast ut alle
                            </button>
                        </div>
                    </section>

                    {/* Special Events */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Intervensjoner</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={spawnRandomEvent} className="bg-rose-600/80 hover:bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-rose-600/20">🎲 Event</button>
                            <button onClick={startTing} disabled={!!roomData.activeVote} className="bg-amber-600/80 hover:bg-amber-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-amber-600/20 disabled:opacity-20 text-center">⚖️ Tinget</button>
                        </div>
                    </section>

                    {/* Settlement Management */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Landsby-fokus</h3>
                        {!roomData.world.settlement ? (
                            <button onClick={initializeSettlement} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] animate-pulse">Initialiser Landsby</button>
                        ) : (
                            <div className="text-xs text-slate-500 italic">
                                Landsbyen er initialisert.
                            </div>
                        )}
                    </section>
                </div>
            </aside>

            {/* CENTER PANEL: THE REALM OBSERVER */}
            <main className="flex-1 relative flex flex-col bg-slate-900/10 overflow-hidden no-scrollbar">
                <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-center gap-8">
                        <nav className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setView('MANAGE')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'MANAGE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Overvåking
                            </button>
                            <button
                                onClick={() => setView('ECONOMY')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'ECONOMY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                                Blueprint
                            </button>
                        </nav>
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Innbyggere:</span>
                                <span className="text-sm font-bold text-white">{Object.keys(roomData.players || {}).length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">År i Riket:</span>
                                <span className="text-sm font-bold text-white">{roomData.world.year || 1100}</span>
                            </div>
                        </div>
                    </div>
                    {isLoading && <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">Prosesserer Endringer...</div>}
                </header>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar no-scrollbar">
                    {view === 'ECONOMY' ? (
                        SimulationEconomyBlueprint ? <SimulationEconomyBlueprint /> : <div className="p-20 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Laster Blueprint...</div>
                    ) : (
                        <div className="space-y-12">
                            {/* Player Grid */}
                            <section>
                                <h2 className="text-3xl font-black text-white px-2 mb-8 tracking-tighter">Innbyggere i Riket</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.values(roomData.players || {}).map(p => (
                                        <div key={p.id} className="relative bg-slate-900/80 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); kickPlayer(p.id, p.name); }}
                                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white flex items-center justify-center font-bold text-xs"
                                                title="Kast ut spiller"
                                            >
                                                ✕
                                            </button>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                                    {p.avatar ? <img src={p.avatar} alt={p.role} className="w-full h-full object-cover" /> : ({
                                                        KING: '👑',
                                                        BARON: '🏰',
                                                        PEASANT: '🌾',
                                                        SOLDIER: '⚔️',
                                                        MERCHANT: '💰'
                                                    } as any)[p.role] || '👤'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-black text-white truncate">{p.name}</h3>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <select
                                                            value={p.role}
                                                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                                            className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border-none p-0 focus:ring-0 cursor-pointer hover:text-white transition-colors w-full text-left"
                                                        >
                                                            {Object.entries(ROLE_DEFINITIONS).map(([id, def]) => (
                                                                <option key={id} value={id} className="bg-slate-900">{def.label}</option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={p.regionId || 'capital'}
                                                            onChange={(e) => handleRegionChange(p.id, e.target.value)}
                                                            className="bg-white/5 text-slate-500 text-[9px] font-bold uppercase tracking-wider border-none p-0 focus:ring-0 cursor-pointer hover:text-slate-300 transition-colors w-full text-left"
                                                        >
                                                            <option value="capital" className="bg-slate-900">Hovedstaden</option>
                                                            <option value="region_ost" className="bg-slate-900">Baroniet Øst</option>
                                                            <option value="region_vest" className="bg-slate-900">Baroniet Vest</option>
                                                            <option value="marketplace" className="bg-slate-900">Markedsplassen</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div>
                                                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-1">
                                                        <span>Stamina</span>
                                                        <span className="text-white">{p.status.stamina}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${p.status.stamina}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-500">Gull:</span>
                                                    <span className="text-amber-500 font-black">{p.resources.gold}💰</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-6">
                                                {p.upgrades?.map((upg: string) => (
                                                    <span key={upg} className="text-[7px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">{upg}</span>
                                                ))}
                                                {(!p.upgrades || p.upgrades.length === 0) && <span className="text-[7px] font-bold text-slate-700 uppercase italic">Ingen oppgraderinger</span>}
                                            </div>

                                            <button
                                                onClick={() => controlPlayer(p.id)}
                                                className="w-full py-4 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all border border-indigo-500/20 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <span className="group-hover/btn:scale-125 transition-transform">🎮</span>
                                                Styr spiller
                                            </button>
                                        </div>
                                    ))}
                                    {Object.keys(roomData.players || {}).length === 0 && (
                                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                            <span className="text-6xl block mb-4 opacity-20">🏰</span>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Venter på at undersåtter skal ankomme...</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Settlement Progress */}
                            {roomData.world.settlement && (
                                <section className="bg-indigo-900/10 border border-indigo-500/10 p-10 rounded-[3rem] relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black text-white mb-8 tracking-tighter flex items-center justify-between">
                                            Landsbyutvikling
                                            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full">Status Rapport</span>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.values(roomData.world.settlement.buildings).map((building: any) => {
                                                const meta = (VILLAGE_BUILDINGS as any)[building.id];
                                                const progress = (building.progress / (building.target || 200)) * 100;
                                                return (
                                                    <div key={building.id} className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <h4 className="text-sm font-black text-white uppercase">{meta?.name}</h4>
                                                                <p className="text-[10px] text-slate-500 font-bold tracking-tight">Nivå {building.level}</p>
                                                            </div>
                                                            <span className="text-xs font-mono text-indigo-500">
                                                                {Object.values(building.progress || {}).reduce((sum: number, val: any) => sum + (val as number), 0)} / {building.target || 200}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                            <div className={`h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="absolute top-[-20%] right-[-10%] text-[15rem] text-indigo-500 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform duration-[3000ms]">🏠</div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT PANEL: INTELLIGENCE & FEED */}
            <aside className="w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl overflow-hidden">
                {/* Leaderboard */}
                <div className="p-8 border-b border-white/5 bg-black/20 shrink-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-6 flex items-center justify-between">
                        Rikets Formue
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    </h3>
                    <div className="space-y-4">
                        {Object.values(roomData.players || {})
                            .sort((a, b) => (b.resources.gold || 0) - (a.resources.gold || 0))
                            .slice(0, 5)
                            .map((p, i) => (
                                <div key={p.id} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-600 font-mono">#{i + 1}</span>
                                        <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{p.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-amber-400">{p.resources.gold}💰</span>
                                </div>
                            ))
                        }
                        {Object.keys(roomData.players || {}).length === 0 && <p className="text-[10px] text-slate-600 font-bold italic text-center py-4">Ingen data tilgjengelig...</p>}
                    </div>
                </div>

                {/* Market Intelligence */}
                <div className="p-8 border-b border-white/5 shrink-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Markedsanalyse</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(roomData.market || {}).slice(0, 4).map(([res, data]: [string, any]) => {
                            const details = (RESOURCE_DETAILS as any)[res] || { label: res };
                            return (
                                <div key={res} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-black uppercase text-slate-500 mb-1">{details.label}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white">{data.stock}</span>
                                        <span className="text-[10px] font-mono text-emerald-400">{data.price.toFixed(1)}g</span>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.entries(roomData.market || {}).slice(0, 4).length === 0 && (
                            <div className="col-span-2 text-[10px] text-slate-600 font-bold italic text-center py-4">Ingen markedsdata...</div>
                        )}
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-8 pb-4 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                            Global Logg
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8 custom-scrollbar">
                        {getMessagesList(roomData.messages).slice().reverse().map((msg: any, idx: number) => (
                            <div key={idx} className="bg-indigo-950/20 border-l-2 border-indigo-500/50 p-4 rounded-r-2xl animate-in slide-in-from-right-4 duration-300">
                                <p className="text-[10px] font-medium leading-relaxed text-slate-400 antialiased italic font-serif opacity-80">
                                    {typeof msg === 'object' ? JSON.stringify(msg) : msg}
                                </p>
                            </div>
                        ))}
                        {getMessagesList(roomData.messages).length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                <span className="text-4xl mb-4">📜</span>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Arkivet er tomt</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Global Styles for custom scrollbar */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
};
