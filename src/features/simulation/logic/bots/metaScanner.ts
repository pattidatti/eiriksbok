import { VILLAGE_BUILDINGS, REFINERY_RECIPES, CRAFTING_RECIPES } from './../../data/production';
import type { Resources } from '../../simulationTypes';

/**
 * META-SCANNER
 * 
 * Automatically analyzes game data files to build a dependency graph.
 * This allows bots to "reason" about what they need to achieve a goal.
 */

export interface ActionDependency {
    id: string;
    type: 'BUILDING' | 'RECIPE' | 'ACTION';
    requirements: Partial<Resources>;
    unlocks: string[];
    locationId?: string;
}

export const getGameKnowledgeMap = () => {
    const knowledge = {
        buildings: [] as ActionDependency[],
        recipes: [] as ActionDependency[],
        actions: [] as ActionDependency[],
        resourceOrigins: {} as Record<string, string[]> // resource -> actions that produce it
    };

    // 1. Scan Buildings
    Object.values(VILLAGE_BUILDINGS).forEach((b: any) => {
        Object.entries(b.levels).forEach(([level, data]: [string, any]) => {
            knowledge.buildings.push({
                id: `${b.id}_v${level}`,
                type: 'BUILDING',
                requirements: data.requirements,
                unlocks: data.unlocks,
                locationId: b.locationId
            });
        });
    });

    // 2. Scan Recipes (Refining)
    Object.entries(REFINERY_RECIPES).forEach(([id, r]: [string, any]) => {
        knowledge.recipes.push({
            id: `REFINE_${id.toUpperCase()}`,
            type: 'RECIPE',
            requirements: r.input,
            unlocks: [r.outputResource],
            locationId: r.buildingId
        });

        // Track resource origins
        const outRes = r.outputResource;
        if (!knowledge.resourceOrigins[outRes]) knowledge.resourceOrigins[outRes] = [];
        knowledge.resourceOrigins[outRes].push(`REFINE_${id.toUpperCase()}`);
    });

    // 2b. Scan Crafting Recipes (Items)
    Object.entries(CRAFTING_RECIPES).forEach(([id, r]: [string, any]) => {
        knowledge.recipes.push({
            id: `CRAFT_${id.toUpperCase()}`,
            type: 'RECIPE',
            requirements: r.input,
            unlocks: [r.outputItemId],
            locationId: r.buildingId
        });

        // Track origin
        const outItem = r.outputItemId;
        if (!knowledge.resourceOrigins[outItem]) knowledge.resourceOrigins[outItem] = [];
        // Helper: store recipe ID with prefix
        knowledge.resourceOrigins[outItem].push(id); // Use raw ID for crafting lookup later? Or formatted?
        // Let's use formatted to be consistent, but crafting handler needs specific subtype.
        // Actually, let's store "CRAFT:<subtype>"
        knowledge.resourceOrigins[outItem].push(`CRAFT:${id}`);
    });

    // 3. Scan Generic Actions (Gathering)
    // We map these manually as they are often hardcoded in the engine loop
    const basicGatherers = [
        { id: 'CHOP', out: 'wood' },
        { id: 'MINE', out: 'iron_ore' },
        { id: 'QUARRY', out: 'stone' },
        { id: 'FORAGE', out: 'bread' },
        { id: 'HUNT', out: 'meat' },
        { id: 'GATHER_WOOL', out: 'wool' },
        { id: 'GATHER_HONEY', out: 'honey' },
        { id: 'PLANT', out: 'grain' } // Added planting logic
    ];

    basicGatherers.forEach(g => {
        knowledge.actions.push({
            id: g.id,
            type: 'ACTION',
            requirements: {}, // Usually just stamina, handled by economy engine
            unlocks: [g.out]
        });

        if (!knowledge.resourceOrigins[g.out]) knowledge.resourceOrigins[g.out] = [];
        knowledge.resourceOrigins[g.out].push(g.id);
    });

    return knowledge;
};

/**
 * PATHFINDER
 * Finds the shortest path to acquire a specific resource or unlock a building level.
 */
export const findPathToGoal = (target: string, currentResources: Partial<Resources>) => {
    if ((currentResources as any)[target] > 0) return { action: 'NONE', message: `Jeg har allerede ${target}.` };
    const map = getGameKnowledgeMap();

    // Check if it's a resource
    const origins = map.resourceOrigins[target];
    if (origins && origins.length > 0) {
        return { action: origins[0], message: `Jeg trenger ${target}, så jeg må utføre ${origins[0]}.` };
    }

    // Check if it's a building
    const bld = map.buildings.find(b => b.unlocks.includes(target) || b.id.includes(target));
    if (bld) {
        return { action: 'CONTRIBUTE', payload: { buildingId: bld.id.split('_v')[0] }, message: `Jeg vil ha ${target}, så jeg må bygge ${bld.id}.` };
    }

    return null;
};
