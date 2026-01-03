
import { useEffect, useRef, useState } from 'react';
import type { SimulationRoom, SimulationPlayer } from '../simulationTypes';
import { decideBotAction, type BotDecision } from '../logic/bots/botBrain';
import { performAction } from '../actions';
import { handleGlobalBribe } from '../globalActions'; // Specific global actions need direct import if not in registry

// Config
const BOT_TICK_RATE = 5000; // Bots think every 5 seconds
const BOTS_PER_TICK = 5;    // Only process 5 bots per tick to save performance


export const useBotManager = (pin: string, room: SimulationRoom | null, isHost: boolean) => {
    const [enabled, setEnabled] = useState(false);
    const [activeBotCount, setActiveBotCount] = useState(0);
    const [recentLogs, setRecentLogs] = useState<string[]>([]);
    const [botReports, setBotReports] = useState<BotReport[]>([]);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const botIndexRef = useRef(0);
    const roomRef = useRef(room);

    // Keep room ref updated for the interval closure
    useEffect(() => { roomRef.current = room; }, [room]);

    useEffect(() => {
        if (!isHost || !pin || !enabled) {
            if (tickRef.current) clearInterval(tickRef.current);
            return;
        }

        console.log(`🤖 BOT BRAIN ENABLED for room ${pin}`);

        tickRef.current = setInterval(async () => {
            const currentRoom = roomRef.current;
            if (!currentRoom) return;

            const bots = Object.values(currentRoom.players || {}).filter(p => p.id.startsWith('bot_') && (p.status?.hp || 0) > 0);
            setActiveBotCount(bots.length);

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
                const decision = decideBotAction(bot, currentRoom);
                if (decision) {

                    try {
                        if (decision.actionType === 'REPORT_FEEDBACK') {
                            // Special Feedback Handling
                            const report = `[FEEDBACK] ${bot.name}: ${decision.payload}`;
                            newLogs.push(report);
                            setBotReports(prev => [{
                                id: Date.now() + Math.random().toString(),
                                timestamp: Date.now(),
                                botName: bot.name,
                                message: decision.payload,
                                type: (decision.reason === 'Bug' ? 'BUG' : 'BALANCE') as 'BUG' | 'BALANCE'
                            }, ...prev].slice(0, 20)); // Keep last 20 reports
                        } else if (decision.actionType === 'BRIBE') {
                            newLogs.push(`[${bot.name}] BRIBE: ${decision.reason}`);
                            await handleGlobalBribe(pin, bot.id, decision.payload);
                        } else {
                            newLogs.push(`[${bot.name}] ${decision.actionType}: ${decision.reason}`);
                            const actionPayload = decision.payload ? { type: decision.actionType, ...decision.payload } : decision.actionType;
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
