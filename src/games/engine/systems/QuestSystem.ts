import * as THREE from 'three';

// Fase 4.1: quest-system. Lightweight event-basert: hver quest har en kjede av
// objectives. Objectives fullføres ved flag-trigger, item-pickup, NPC-samtale,
// eller posisjon-trigger. Worldspace-markers viser aktive objectives i scenen
// som gule diamant-sprites (sizeAttenuation=false — konstant skjermstørrelse).

// Delt canvas-texture for alle markers. Genereres én gang per prosess.
let _markerTexture: THREE.CanvasTexture | null = null;
function getMarkerTexture(): THREE.CanvasTexture {
    if (_markerTexture) return _markerTexture;
    const size = 64;
    const cvs = document.createElement('canvas');
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    // Gul diamant med mørk kant + svak glød
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;
    // Glød
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
    grad.addColorStop(0, 'rgba(255,220,80,0.55)');
    grad.addColorStop(1, 'rgba(255,220,80,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // Diamant
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fillStyle = '#ffd84a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4a2e00';
    ctx.stroke();
    _markerTexture = new THREE.CanvasTexture(cvs);
    _markerTexture.anisotropy = 4;
    return _markerTexture;
}

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
    // Fase 4.1 (post-verifisering): worldspace-markers. Key = `${questId}:${objectiveId}`.
    private markerSprites = new Map<string, THREE.Sprite>();
    private markerParent: THREE.Scene | null = null;

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

    /**
     * Aktiver en quest eksplisitt (fra dialog-action eller scripting). Ignorerer
     * prerequisites — kall kun hvis konteksten rettferdiggjør det. Returnerer
     * true hvis statusen endret seg (var locked). No-op hvis allerede active/completed.
     */
    startQuest(questId: string): boolean {
        const state = this.state.get(questId);
        if (!state) return false;
        if (state.status !== 'locked') return false;
        state.status = 'active';
        return true;
    }

    /**
     * Marker et objective som fullført manuelt. Går gjennom samme pipeline som
     * evaluateCondition — når alle objectives er ferdig, neste update()-tick
     * setter status=completed og deler ut rewardFlags. Returnerer true hvis
     * objective ble markert (ikke allerede ferdig).
     */
    completeObjective(questId: string, objectiveId: string): boolean {
        const state = this.state.get(questId);
        if (!state || state.status !== 'active') return false;
        const def = this.quests.get(questId);
        if (!def || !def.objectives.some((o) => o.id === objectiveId)) return false;
        if (state.completedObjectives.has(objectiveId)) return false;
        state.completedObjectives.add(objectiveId);
        return true;
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

    /**
     * Synkroniser worldspace-markers med aktive objectives. Lager sprites for nye
     * markers, oppdaterer posisjon for eksisterende, og fjerner markers for
     * objectives som er fullført eller nå inaktive.
     */
    updateMarkers(scene: THREE.Scene): void {
        this.markerParent = scene;
        const active = this.getActiveMarkers();
        const seen = new Set<string>();
        for (const { questId, objective, worldPos } of active) {
            if (!worldPos) continue;
            const key = `${questId}:${objective.id}`;
            seen.add(key);
            let sprite = this.markerSprites.get(key);
            if (!sprite) {
                const mat = new THREE.SpriteMaterial({
                    map: getMarkerTexture(),
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    sizeAttenuation: false,
                });
                sprite = new THREE.Sprite(mat);
                sprite.scale.set(0.05, 0.05, 1);
                sprite.renderOrder = 999;
                scene.add(sprite);
                this.markerSprites.set(key, sprite);
            }
            // Løft markøren litt over worldPos slik at den står tydelig over NPC/objektet.
            sprite.position.set(worldPos.x, worldPos.y + 2.2, worldPos.z);
        }
        // Rydd markers som ikke er aktive lenger
        for (const [key, sprite] of this.markerSprites) {
            if (seen.has(key)) continue;
            scene.remove(sprite);
            sprite.material.dispose();
            this.markerSprites.delete(key);
        }
    }

    dispose(): void {
        if (this.markerParent) {
            for (const sprite of this.markerSprites.values()) {
                this.markerParent.remove(sprite);
                sprite.material.dispose();
            }
        }
        this.markerSprites.clear();
        this.markerParent = null;
        this.quests.clear();
        this.state.clear();
        this.npcTalkedTo.clear();
    }

    // Fase 5.2: serialisering for SaveSystem. Set → array så JSON.stringify fungerer.
    serialize(): { quests: Array<{ id: string; status: QuestState['status']; completedObjectives: string[] }>; npcTalkedTo: string[] } {
        const quests: Array<{ id: string; status: QuestState['status']; completedObjectives: string[] }> = [];
        for (const s of this.state.values()) {
            quests.push({ id: s.id, status: s.status, completedObjectives: Array.from(s.completedObjectives) });
        }
        return { quests, npcTalkedTo: Array.from(this.npcTalkedTo) };
    }

    restore(data: { quests: Array<{ id: string; status: QuestState['status']; completedObjectives: string[] }>; npcTalkedTo: string[] }): void {
        for (const q of data.quests) {
            const s = this.state.get(q.id);
            if (!s) continue; // quest fra eldre save-versjon som ikke finnes lenger
            s.status = q.status;
            s.completedObjectives = new Set(q.completedObjectives);
        }
        this.npcTalkedTo = new Set(data.npcTalkedTo);
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
