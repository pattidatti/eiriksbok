import * as THREE from 'three';

// Fase 4.1: quest-system. Lightweight event-basert: hver quest har en kjede av
// objectives. Objectives fullføres ved flag-trigger, item-pickup, NPC-samtale,
// eller posisjon-trigger. Worldspace-markers viser aktive objectives i scenen.

export interface QuestCondition {
    flag?: string;               // flagget må være truthy
    itemCollected?: string;      // item-ID lagt til i inventar
    npcTalkedTo?: string;        // character-id spilt dialog med
    positionNear?: { pos: [number, number, number]; radius: number };
}

export interface QuestObjective {
    id: string;
    label: string;
    condition: QuestCondition;
    // Valgfri worldspace-markør. 'attachTo' følger character-id, 'pos' er fast punkt.
    marker?: { attachTo?: string; pos?: [number, number, number] };
}

export interface QuestDef {
    id: string;
    title: string;
    description: string;
    objectives: QuestObjective[];
    // Hvilke quests må være fullført FØR denne kan startes.
    prerequisites?: string[];
    // Flag som settes når questen fullfører. Nyttig for å tråde narrative.
    rewardFlags?: string[];
}

export interface QuestState {
    id: string;
    status: 'locked' | 'active' | 'completed';
    completedObjectives: Set<string>;
}

export interface QuestEngineRef {
    getFlag: (k: string) => unknown;
    inventoryHas: (id: string) => boolean;
    getPlayerPosition: () => THREE.Vector3;
    setFlag: (k: string, v: unknown) => void;
    getCharacterPosition: (id: string) => THREE.Vector3 | null;
}

export class QuestSystem {
    private quests = new Map<string, QuestDef>();
    private state = new Map<string, QuestState>();
    private npcTalkedTo = new Set<string>();
    private engineRef: QuestEngineRef;

    constructor(defs: QuestDef[], engineRef: QuestEngineRef) {
        this.engineRef = engineRef;
        for (const q of defs) {
            this.quests.set(q.id, q);
            this.state.set(q.id, {
                id: q.id,
                status: (q.prerequisites && q.prerequisites.length > 0) ? 'locked' : 'active',
                completedObjectives: new Set(),
            });
        }
    }

    /** Kalles av GameEngine ved hver dialog-ferdig slik at npcTalkedTo-condition kan trigges. */
    markNpcTalkedTo(characterId: string): void {
        this.npcTalkedTo.add(characterId);
    }

    /** Hver frame: sjekk hvilke objectives som nå er oppfylt. Returnerer liste av nyfullførte. */
    update(): QuestState[] {
        const changed: QuestState[] = [];
        for (const quest of this.quests.values()) {
            const state = this.state.get(quest.id)!;
            if (state.status === 'completed') continue;
            // Unlock hvis prerequisites er oppfylt
            if (state.status === 'locked') {
                if (!quest.prerequisites || quest.prerequisites.every((p) => this.isCompleted(p))) {
                    state.status = 'active';
                    changed.push(state);
                }
                continue;
            }
            // Sjekk hvert objective
            for (const obj of quest.objectives) {
                if (state.completedObjectives.has(obj.id)) continue;
                if (this.evaluateCondition(obj.condition)) {
                    state.completedObjectives.add(obj.id);
                    changed.push(state);
                }
            }
            // Complete hvis alle objectives er gjort
            if (state.completedObjectives.size >= quest.objectives.length) {
                state.status = 'completed';
                if (quest.rewardFlags) {
                    for (const f of quest.rewardFlags) this.engineRef.setFlag(f, true);
                }
                changed.push(state);
            }
        }
        return changed;
    }

    isCompleted(questId: string): boolean {
        return this.state.get(questId)?.status === 'completed';
    }

    isActive(questId: string): boolean {
        return this.state.get(questId)?.status === 'active';
    }

    getAll(): Array<{ def: QuestDef; state: QuestState }> {
        return Array.from(this.quests.values()).map((def) => ({ def, state: this.state.get(def.id)! }));
    }

    /** Returnerer alle aktive objectives med marker-info — for UI rendering av worldspace-pins. */
    getActiveMarkers(): Array<{ questId: string; objective: QuestObjective; worldPos: THREE.Vector3 | null }> {
        const out: Array<{ questId: string; objective: QuestObjective; worldPos: THREE.Vector3 | null }> = [];
        for (const quest of this.quests.values()) {
            const st = this.state.get(quest.id)!;
            if (st.status !== 'active') continue;
            for (const obj of quest.objectives) {
                if (st.completedObjectives.has(obj.id)) continue;
                if (!obj.marker) continue;
                let pos: THREE.Vector3 | null = null;
                if (obj.marker.attachTo) {
                    pos = this.engineRef.getCharacterPosition(obj.marker.attachTo);
                } else if (obj.marker.pos) {
                    pos = new THREE.Vector3(...obj.marker.pos);
                }
                out.push({ questId: quest.id, objective: obj, worldPos: pos });
            }
        }
        return out;
    }

    private evaluateCondition(c: QuestCondition): boolean {
        if (c.flag && !this.engineRef.getFlag(c.flag)) return false;
        if (c.itemCollected && !this.engineRef.inventoryHas(c.itemCollected)) return false;
        if (c.npcTalkedTo && !this.npcTalkedTo.has(c.npcTalkedTo)) return false;
        if (c.positionNear) {
            const player = this.engineRef.getPlayerPosition();
            const [x, y, z] = c.positionNear.pos;
            const dx = player.x - x;
            const dy = player.y - y;
            const dz = player.z - z;
            if (dx * dx + dy * dy + dz * dz > c.positionNear.radius * c.positionNear.radius) return false;
        }
        return true;
    }
}
