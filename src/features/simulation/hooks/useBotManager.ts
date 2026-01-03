
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
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const botIndexRef = useRef(0);

    // Filter bots from players
    const getBots = (): SimulationPlayer[] => {
        if (!room || !room.players) return [];
        return Object.values(room.players).filter(p => p.id.startsWith('bot_') && p.status?.hp > 0);
    };

    useEffect(() => {
        if (!isHost || !pin || !enabled) {
            if (tickRef.current) clearInterval(tickRef.current);
            return;
        }

        console.log(`🤖 BOT BRAIN ENABLED for room ${pin}`);

        tickRef.current = setInterval(async () => {
            if (!room) return;
            const bots = getBots();
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
            batch.forEach(async (bot) => {
                const decision = decideBotAction(bot, room);
                if (decision) {
                    // Execute
                    // console.log(`🤖 ${bot.name} decided: ${decision.actionType} (${decision.reason})`);

                    try {
                        if (decision.actionType === 'BRIBE') {
                            await handleGlobalBribe(pin, bot.id, decision.payload);
                        } else {
                            // Standard Action
                            const actionPayload = decision.payload ? { type: decision.actionType, ...decision.payload } : decision.actionType;
                            await performAction(pin, bot.id, actionPayload);
                        }
                    } catch (e) {
                        console.error(`Bot ${bot.name} failed action ${decision.actionType}`, e);
                    }
                }
            });

        }, BOT_TICK_RATE);

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isHost, pin, enabled, room]); // Re-bind if room updates (expensive? room updates often...)
    // Wait, if room updates every second, this effect re-runs every second and resets the interval.
    // That kills the timer. We need to use a Ref for the latest room state inside the interval.

    // FIX: Use ref for room
    const roomRef = useRef(room);
    useEffect(() => { roomRef.current = room; }, [room]);

    useEffect(() => {
        if (!isHost || !pin || !enabled) {
            if (tickRef.current) clearInterval(tickRef.current);
            return;
        }

        tickRef.current = setInterval(async () => {
            const currentRoom = roomRef.current;
            if (!currentRoom) return;

            const bots = Object.values(currentRoom.players || {}).filter(p => p.id.startsWith('bot_') && (p.status?.hp || 0) > 0);
            setActiveBotCount(bots.length);
            if (bots.length === 0) return;

            const startIndex = botIndexRef.current % bots.length;
            const batch = [];
            for (let i = 0; i < BOTS_PER_TICK; i++) {
                const idx = (startIndex + i) % bots.length;
                batch.push(bots[idx]);
            }
            botIndexRef.current = (startIndex + BOTS_PER_TICK) % bots.length;

            batch.forEach(async (bot) => {
                const decision = decideBotAction(bot, currentRoom);
                if (decision) {
                    try {
                        if (decision.actionType === 'BRIBE') {
                            await handleGlobalBribe(pin, bot.id, decision.payload);
                        } else {
                            const actionPayload = decision.payload ? { type: decision.actionType, ...decision.payload } : decision.actionType;
                            await performAction(pin, bot.id, actionPayload);
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }
            });
        }, BOT_TICK_RATE);

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isHost, pin, enabled]); // Removed 'room' from dependency array

    return {
        enabled,
        setEnabled,
        activeBotCount
    };
};
