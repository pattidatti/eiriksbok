
import { useEffect, useRef, useState } from 'react';
import { ref, push, update, onValue, limitToLast, query } from 'firebase/database';
import { simulationDb as db } from '../simulationFirebase';
import type { SimulationRoom, BotFeedbackEntry } from '../simulationTypes';
import { decideBotAction } from '../logic/bots/botBrain';
import { performAction } from '../actions';
import { handleGlobalBribe, handleClaimEmptyThrone } from '../globalActions';

// Config - "GOD MODE TURBO" enabled by user request
export const BOT_TICK_RATE = 200;   // Bots think every 0.2 second (Ultra fast)
export const BOTS_PER_TICK = 100;   // Process 100 bots per tick (Maximize CPU/RAM usage)


export const useBotManager = (pin: string, room: SimulationRoom | null, isHost: boolean) => {
    const [enabled, setEnabled] = useState(false);
    const [activeBotCount, setActiveBotCount] = useState(0);
    const [recentLogs, setRecentLogs] = useState<string[]>([]);
    const [botReports, setBotReports] = useState<BotReport[]>([]);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const botIndexRef = useRef(0);
    const roomRef = useRef(room);

    // Keep room ref updated for the interval closure
    // AND Update count reactively (so it shows up even when disabled)
    useEffect(() => {
        roomRef.current = room;
        if (room?.players) {
            const bots = Object.values(room.players).filter(p => p?.id?.startsWith('bot_') && (p.status?.hp || 0) > 0);
            setActiveBotCount(bots.length);
        }
    }, [room]);

    // PERSISTENT FEEDBACK SUBSCRIPTION
    useEffect(() => {
        if (!pin) return;
        const fbRef = query(ref(db, `simulation_rooms/${pin}/bot_feedback`), limitToLast(50));
        const unsub = onValue(fbRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const list = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
                setBotReports(list as any);
            }
        });
        return () => unsub();
    }, [pin]);

    useEffect(() => {
        if (!isHost || !pin || !enabled) {
            if (tickRef.current) clearInterval(tickRef.current);
            return;
        }

        console.log(`🤖 BOT BRAIN ENABLED for room ${pin}`);

        tickRef.current = setInterval(async () => {
            const currentRoom = roomRef.current;
            if (!currentRoom) return;

            const bots = Object.values(currentRoom.players || {}).filter(p => p?.id?.startsWith('bot_') && (p.status?.hp || 0) > 0 && !p.status?.isFrozen);
            // setActiveBotCount(bots.length); // Handled in other effect now

            if (bots.length === 0) return;

            // Round Robin Processing
            const startIndex = botIndexRef.current % bots.length;
            const batch = [];
            for (let i = 0; i < BOTS_PER_TICK; i++) {
                const idx = (startIndex + i) % bots.length;
                batch.push(bots[idx]);
            }
            botIndexRef.current = (startIndex + BOTS_PER_TICK) % bots.length;

            // Process Batch
            const newLogs: string[] = [];

            for (const bot of batch) {
                let decision = null;
                try {
                    decision = decideBotAction(bot, currentRoom);
                } catch (e) {
                    console.error(`[Brain Freeze] Bot ${bot.name} crashed thinking:`, e);
                    continue; // Skip this bot, save the loop
                }

                if (decision) {
                    // QA TELEMETRY: Update bot "thought" in Firebase
                    const thoughtRef = ref(db, `simulation_rooms/${pin}/players/${bot.id}/status`);
                    update(thoughtRef, {
                        lastAction: decision.actionType,
                        thought: decision.reason,
                        lastTick: Date.now()
                    });

                    try {
                        if (decision.actionType === 'REPORT_FEEDBACK') {
                            // PERSISTENT Feedback Handling
                            const entry: BotFeedbackEntry = {
                                id: `fb_${Date.now()}_${bot.id}`,
                                botId: bot.id,
                                botName: bot.name,
                                message: decision.payload,
                                type: (decision.reason === 'Bug' ? 'BUG' : 'BALANCE'),
                                timestamp: Date.now(),
                                roomYear: currentRoom.world?.year || 0
                            };

                            // 1. Push to Firebase for persistence
                            push(ref(db, `simulation_rooms/${pin}/bot_feedback`), entry);

                            // 2. Local fallback
                            newLogs.push(`[FEEDBACK] ${bot.name}: ${decision.payload}`);
                            setBotReports(prev => [entry as any, ...prev].slice(0, 20));
                        } else if (decision.actionType === 'BRIBE') {
                            newLogs.push(`[${bot.name}] BRIBE: ${decision.reason}`);
                            await handleGlobalBribe(pin, bot.id, decision.payload);
                        } else if (decision.actionType === 'CONTRIBUTE_BUILDING') {
                            // Call global contribution handler to build castle
                            newLogs.push(`[${bot.name}] BYGGER: ${decision.payload.buildingId} (${decision.payload.amount})`);
                            // We need to import handleGlobalContribution or similar. 
                            // Using performAction with type 'CONTRIBUTE'? Or direct global call.
                            // performAction handles 'CONTRIBUTE' if routed correctly in actions.ts.
                            await performAction(pin, bot.id, { type: 'CONTRIBUTE', ...decision.payload });
                        } else if (decision.actionType === 'CLAIM_TITLE') {
                            // Logic to claim title (Upgrade to Baron) if requirements met
                            newLogs.push(`[${bot.name}] KREVER TITTEL: ${decision.payload.regionId}`);
                            await handleClaimEmptyThrone(pin, bot.id, decision.payload.regionId);
                        } else {
                            newLogs.push(`[${bot.name}] ${decision.actionType}${decision.subType ? ` (${decision.subType})` : ''}: ${decision.reason}`);
                            const actionPayload = decision.payload ? { type: decision.actionType, subType: decision.subType, ...decision.payload } : { type: decision.actionType, subType: decision.subType };
                            await performAction(pin, bot.id, actionPayload);
                        }
                    } catch (e) {
                        console.error(`Bot ${bot.name} failed action ${decision.actionType}`, e);
                    }
                }
            }

            if (newLogs.length > 0) {
                setRecentLogs(prev => [...newLogs, ...prev].slice(0, 50));
            }

        }, BOT_TICK_RATE);

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isHost, pin, enabled]); // Stable dependencies

    // --- ANALYTICS HEARTBEAT ---
    useEffect(() => {
        if (!isHost || !pin || !enabled || !room) return;

        const recordMetrics = async () => {
            const bots = Object.values(room.players || {}).filter(p => p?.id?.startsWith('bot_'));
            if (bots.length === 0) return;

            const totalGold = bots.reduce((sum, b) => sum + (b.resources?.gold || 0), 0);
            const avgLevel = bots.reduce((sum, b) => sum + (b.stats?.level || 0), 0) / bots.length;

            const metrics = {
                timestamp: Date.now(),
                totalGold,
                avgLevel,
                activeBots: bots.length,
                year: room.world?.year || 0,
                season: room.world?.season || 'Spring'
            };

            push(ref(db, `simulation_rooms/${pin}/analytics/bot_metrics`), metrics);
            console.log("📊 Bot Analytics Heartbeat recorded.");
        };

        const interval = setInterval(recordMetrics, 60000); // Every minute
        return () => clearInterval(interval);
    }, [isHost, pin, enabled, room]);

    return {
        enabled,
        setEnabled,
        activeBotCount,
        recentLogs,
        botReports
    };
};


export interface BotReport {
    id: string;
    timestamp: number;
    botName: string;
    message: string;
    type: 'BUG' | 'BALANCE';
}
