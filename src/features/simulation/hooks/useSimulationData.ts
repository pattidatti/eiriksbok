import { useState, useEffect, useRef, useMemo } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { simulationDb as db } from '../simulationFirebase';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { useSimulationAuth } from '../SimulationAuthContext';
import { getSeasonForTick, getYearForTick } from '../utils/timeUtils';

export function useSimulationData(pin: string | undefined, impersonateId: string | null) {
    const { user, authLoading } = useSimulationAuth() as any;

    const [player, setPlayer] = useState<SimulationPlayer | null>(null);
    const [world, setWorld] = useState<SimulationRoom['world'] | null>(null);
    const [players, setPlayers] = useState<Record<string, SimulationPlayer>>({});
    const [roomStatus, setRoomStatus] = useState<SimulationRoom['status']>('LOBBY');
    const [markets, setMarkets] = useState<Record<string, any>>({});
    const [messages, setMessages] = useState<string[]>([]);
    const [activeVote, setActiveVote] = useState<SimulationRoom['activeVote'] | null>(null);
    const [diplomacy, setDiplomacy] = useState<Record<string, any>>({});
    const [hasAttemptedPlayerLoad, setHasAttemptedPlayerLoad] = useState(false);
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [isRetired, setIsRetired] = useState(false);

    const nullTimeoutRef = useRef<any>(null);
    const lastValidPlayerRef = useRef<SimulationPlayer | null>(null);

    useEffect(() => {
        if (authLoading) return;

        const playerId = impersonateId || localStorage.getItem('sim_player_id') || user?.uid;
        if (!playerId || !pin) return;

        const baseUrl = `simulation_rooms/${pin}`;

        const playerRef = ref(db, `${baseUrl}/players/${playerId}`);
        const unsubPlayer = onValue(playerRef, (snap) => {
            setHasAttemptedPlayerLoad(true);
            if (snap.exists()) {
                if (nullTimeoutRef.current) {
                    clearTimeout(nullTimeoutRef.current);
                    nullTimeoutRef.current = null;
                }
                const data = snap.val();
                if (pin === 'TEST' && data.regionId === 'unassigned' && data.role !== 'KING') {
                    const newRegion = Math.random() > 0.5 ? 'region_east' : 'region_west';
                    update(playerRef, { regionId: newRegion });
                }
                const fullPlayerData = { ...data, id: playerId };
                setPlayer(fullPlayerData);
                lastValidPlayerRef.current = fullPlayerData;
                setHasActiveSession(true);
            } else {
                if (hasActiveSession) {
                    if (!nullTimeoutRef.current) {
                        nullTimeoutRef.current = setTimeout(() => {
                            setIsRetired(true);
                            setPlayer(null);
                            setHasActiveSession(false);
                            lastValidPlayerRef.current = null;
                        }, 5000);
                    }
                } else {
                    setPlayer(null);
                }
            }
        });

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

        const marketsRef = ref(db, `${baseUrl}/markets`);
        const unsubMarkets = onValue(marketsRef, (snap) => {
            const data = snap.val();
            if (data) setMarkets(data);
        });

        const messagesRef = ref(db, `${baseUrl}/messages`);
        const unsubMessages = onValue(messagesRef, (snap) => {
            const data = snap.val();
            if (data) setMessages(data);
        });

        const voteRef = ref(db, `${baseUrl}/activeVote`);
        const unsubVote = onValue(voteRef, (snap) => {
            setActiveVote(snap.val());
        });

        const diplomacyRef = ref(db, `${baseUrl}/diplomacy`);
        const unsubDiplomacy = onValue(diplomacyRef, (snap) => {
            setDiplomacy(snap.val() || {});
        });

        const profilesRef = ref(db, `${baseUrl}/public_profiles`);
        const unsubPlayers = onValue(profilesRef, (snap) => {
            const data = snap.val() || {};
            setPlayers(data);
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
    }, [pin, impersonateId, user?.uid, authLoading, hasActiveSession]);

    // --- LEADER ELECTION ---
    const isLeader = useMemo(() => {
        const pId = impersonateId || localStorage.getItem('sim_player_id') || user?.uid;
        if (!pId || !players) return false;

        const activePlayerIds = Object.keys(players).filter(id => {
            const p = players[id];
            return p.online || (Date.now() - (p.lastActive || 0) < 120000);
        });

        if (activePlayerIds.length === 0) return true;
        const sortedIds = activePlayerIds.sort();
        return sortedIds[0] === pId;
    }, [players, user?.uid, impersonateId]);

    // --- WORLD TICKER ---
    const worldRefPersistence = useRef(world);
    useEffect(() => { worldRefPersistence.current = world; }, [world]);

    useEffect(() => {
        if (!pin || roomStatus === 'LOBBY' || !isLeader) return;

        const initClock = async () => {
            const currentWorld = worldRefPersistence.current;
            if (currentWorld && !currentWorld.lastTickAt) {
                const worldRef = ref(db, `simulation_rooms/${pin}/world`);
                await update(worldRef, {
                    gameTick: currentWorld.gameTick || 0,
                    lastTickAt: Date.now()
                });
            }
        };
        initClock();

        const heartbeat = setInterval(async () => {
            const currentWorld = worldRefPersistence.current;
            if (!currentWorld) return;

            const now = Date.now();
            const lastTickAt = currentWorld.lastTickAt;
            if (!lastTickAt) return;

            const diff = now - lastTickAt;
            if (diff >= 60000) {
                const ticksToAdd = Math.floor(diff / 60000);
                const newTick = (currentWorld.gameTick || 0) + ticksToAdd;
                const dbRef = ref(db, `simulation_rooms/${pin}/world`);
                try {
                    await update(dbRef, {
                        gameTick: newTick,
                        lastTickAt: now
                    });
                } catch (e) {
                    console.error("Heartbeat sync failed", e);
                }
            }
        }, 10000);

        return () => clearInterval(heartbeat);
    }, [pin, roomStatus, isLeader]);

    // --- AUTO-ADVANCE SEASONS & YEARS ---
    useEffect(() => {
        if (!pin || roomStatus === 'LOBBY' || !world) return;

        const currentSeason = world.season;
        const currentYear = world.year;
        const calculatedSeason = getSeasonForTick(world.gameTick || 0);
        const calculatedYear = getYearForTick(world.gameTick || 0, 1100);

        if (currentSeason !== calculatedSeason || currentYear !== calculatedYear) {
            update(ref(db, `simulation_rooms/${pin}/world`), {
                season: calculatedSeason,
                year: calculatedYear
            });
        }
    }, [world?.gameTick, pin, world?.season, world?.year, roomStatus]);

    return {
        player,
        world,
        players,
        roomStatus,
        markets,
        messages,
        activeVote,
        diplomacy,
        hasAttemptedPlayerLoad,
        hasActiveSession,
        isRetired,
        setIsRetired,
        setPlayer,
        isLeader,
        lastValidPlayer: lastValidPlayerRef.current
    };
}
