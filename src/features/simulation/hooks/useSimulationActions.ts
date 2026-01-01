import { useState, useCallback } from 'react';
import { performAction } from '../actions';
import { checkActionRequirements } from '../utils/actionUtils';
import type { SimulationPlayer, SimulationRoom, ActionType } from '../simulationTypes';

export function useSimulationActions(
    pin: string | undefined,
    player: SimulationPlayer | null,
    world: SimulationRoom['world'] | null,
    setActiveMinigame: (m: ActionType | null) => void,
    setActiveMinigameMethod: (m: string | null) => void,
    setActiveMinigameAction: (a: any | null) => void,
    activeMinigame: ActionType | null
) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionResult, setActionResult] = useState<any | null>(null);

    const handleClearActionResult = useCallback(() => {
        setActionResult(null);
    }, []);

    const handleAction = useCallback(async (action: any) => {
        if (!pin || !player || actionLoading) return;

        const actionType = typeof action === 'string' ? action : action.type;
        const actionMethod = typeof action === 'object' ? action.method : null;

        const minigameTypes: ActionType[] = ['WORK', 'CHOP', 'CRAFT', 'MILL', 'DEFEND', 'EXPLORE', 'MINE', 'QUARRY', 'PATROL', 'FORAGE', 'REFINE', 'SMELT', 'BAKE', 'WEAVE', 'MIX', 'PLANT', 'HARVEST'];

        if (minigameTypes.includes(actionType as any) && !activeMinigame && (!action.performance)) {
            const currentSeason = (world?.season || 'Spring') as any;
            const currentWeather = (world?.weather || 'Clear') as any;
            const gameTick = world?.gameTick || 0;

            const check = checkActionRequirements(player, action as any, currentSeason, currentWeather, gameTick);
            if (!check.success) {
                alert(`Du har ikke råd til dette: ${check.reason}`);
                setActionResult({
                    success: false,
                    timestamp: Date.now(),
                    message: `Kan ikke utføre: ${check.reason}`,
                    utbytte: [],
                    xp: [],
                    durability: []
                });
                return;
            }

            let actualType = actionType;
            if (actionType === 'REFINE') {
                const rid = action.recipeId;
                if (rid === 'flour') actualType = 'MILL';
                if (rid === 'iron_ingot' || rid === 'glass' || rid === 'smelt') actualType = 'SMELT';
                if (rid === 'bread' || rid === 'pie' || rid === 'mead' || rid === 'bake') actualType = 'BAKE';
                if (rid === 'cloth' || rid === 'weave') actualType = 'WEAVE';
                if (rid === 'timber') actualType = 'CHOP';
            }
            if (actionType === 'CRAFT') {
                const sid = action.subType || action.id;
                if (sid === 'CRAFT_MEDICINE' || sid === 'CRAFT_POISON' || sid === 'mix') actualType = 'MIX';
                if (sid === 'CRAFT_BREAD' || sid === 'bakery') actualType = 'BAKE';
            }

            setActiveMinigame(actualType as any);
            if (actionMethod) setActiveMinigameMethod(actionMethod);
            setActiveMinigameAction(action);
            setActionResult(null);
            return;
        }

        const isSilentAction = actionType === 'EQUIP_ITEM' || actionType === 'UNEQUIP_ITEM';

        if (action.performance && !isSilentAction) {
            setActiveMinigame(null);
            setActiveMinigameAction(null);
            setActiveMinigameMethod(null);
        }

        if (!isSilentAction) {
            setActionLoading(actionType);
        }

        const timeoutPromise = new Promise<{ success: boolean, error: any }>((_, reject) => {
            setTimeout(() => reject(new Error("Handlingen tok for lang tid (Timeout)")), 30000);
        });

        try {
            const result = await Promise.race([performAction(pin, player.id, action), timeoutPromise]) as any;

            if (!isSilentAction) {
                if (result.data) {
                    setActionResult(result.data);
                } else if (!result.success) {
                    setActionResult({
                        success: false,
                        timestamp: Date.now(),
                        message: `Handlingen feilet: ${(result as any).error?.message || (result as any).error || 'Ukjent feil'}`,
                        utbytte: [],
                        xp: [],
                        durability: []
                    });
                }
            }
        } catch (err: any) {
            console.error("Action Timeout/Error:", err);
            if (!isSilentAction) {
                setActionResult({
                    success: false,
                    timestamp: Date.now(),
                    message: `⚠️ ${err.message || 'Ukjent feil'}`,
                    utbytte: [],
                    xp: [],
                    durability: []
                });
            }
        }

        if (!isSilentAction) {
            setActionLoading(null);
        }
        setActiveMinigame(null);
        setActiveMinigameAction(null);
        setActiveMinigameMethod(null);

    }, [pin, player, actionLoading, world, activeMinigame, setActiveMinigame, setActiveMinigameMethod, setActiveMinigameAction]);

    return {
        actionLoading,
        actionResult,
        handleAction,
        handleClearActionResult,
        setActionLoading
    };
}
