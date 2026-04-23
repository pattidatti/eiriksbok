import * as THREE from 'three';
import type { NpcRouteConfig, NpcBehaviorConfig } from '../types';
import type { BuiltCharacter } from '../CharacterBuilder';

interface ActiveRoute {
    config: NpcRouteConfig;
    waypointIndex: number;
    direction: 1 | -1;
    pauseRemaining: number;
    completed: boolean;
}

// Fase 4.3: reaktiv atferd per NPC. Aktiveres når spilleren er innenfor
// trigger-distansen; hysterese på 1.5x for å slippe ping-pong.
interface ActiveBehavior {
    config: NpcBehaviorConfig;
    reactionActive: boolean;
    flagAlreadySet: boolean;
}

// Enkel waypoint-vandring for NPCer.
// - Beveger karakter mot waypoint
// - Roterer mot bevegelsesretning
// - Pauser ved waypoints
// - Stopper når dialog/monolog er aktiv
// - Setter `_isWalking` på character.userData så CharacterBuilder kan animere
export class AIDirector {
    private routes = new Map<string, ActiveRoute>();
    private behaviors = new Map<string, ActiveBehavior>();
    private targetVec = new THREE.Vector3();
    private deltaVec = new THREE.Vector3();
    private _playerPosScratch = new THREE.Vector3();

    assignBehavior(config: NpcBehaviorConfig): void {
        this.behaviors.set(config.characterId, {
            config,
            reactionActive: false,
            flagAlreadySet: false,
        });
    }

    removeBehavior(characterId: string): void {
        this.behaviors.delete(characterId);
    }

    assignRoute(config: NpcRouteConfig): void {
        this.routes.set(config.characterId, {
            config: { ...config, speed: config.speed ?? 1.4, pauseMs: config.pauseMs ?? 600 },
            waypointIndex: 0,
            direction: 1,
            pauseRemaining: 0,
            completed: false,
        });
    }

    removeRoute(characterId: string): void {
        const route = this.routes.get(characterId);
        if (route) {
            this.routes.delete(characterId);
        }
    }

    update(
        dt: number,
        characters: Map<string, BuiltCharacter>,
        blocked: boolean,
        playerWorldPos?: THREE.Vector3,
        setFlag?: (key: string, value: unknown) => void,
    ): void {
        // Fase 4.3: reaktive behaviors kjøres FØR waypoints for å kunne overstyre dem.
        if (playerWorldPos) {
            this.updateBehaviors(dt, characters, blocked, playerWorldPos, setFlag);
        }

        for (const [id, route] of this.routes) {
            const char = characters.get(id);
            if (!char) continue;

            // Hvis karakteren har en aktiv reactive behavior, skipp waypoint-bevegelse.
            const behavior = this.behaviors.get(id);
            if (behavior?.reactionActive) {
                continue;
            }

            if (blocked || route.completed) {
                char.group.userData._isWalking = false;
                continue;
            }

            if (route.pauseRemaining > 0) {
                route.pauseRemaining -= dt * 1000;
                char.group.userData._isWalking = false;
                continue;
            }

            const waypoints = route.config.waypoints;
            if (waypoints.length === 0) {
                char.group.userData._isWalking = false;
                continue;
            }

            const target = waypoints[route.waypointIndex];
            this.targetVec.set(target[0], char.group.position.y, target[1]);
            this.deltaVec.subVectors(this.targetVec, char.group.position);
            this.deltaVec.y = 0;
            const dist = this.deltaVec.length();

            const speed = route.config.speed ?? 1.4;
            const step = speed * dt;

            if (dist <= step + 0.05) {
                // Snap til waypoint
                char.group.position.x = this.targetVec.x;
                char.group.position.z = this.targetVec.z;
                char.group.userData._isWalking = false;

                // Avansér til neste waypoint
                if (route.config.mode === 'loop') {
                    route.waypointIndex = (route.waypointIndex + 1) % waypoints.length;
                    route.pauseRemaining = route.config.pauseMs ?? 600;
                } else if (route.config.mode === 'pingpong') {
                    let next = route.waypointIndex + route.direction;
                    if (next >= waypoints.length) {
                        route.direction = -1;
                        next = waypoints.length - 2;
                    } else if (next < 0) {
                        route.direction = 1;
                        next = 1;
                    }
                    route.waypointIndex = Math.max(0, Math.min(waypoints.length - 1, next));
                    route.pauseRemaining = route.config.pauseMs ?? 600;
                } else {
                    // 'once'
                    if (route.waypointIndex < waypoints.length - 1) {
                        route.waypointIndex++;
                        route.pauseRemaining = route.config.pauseMs ?? 600;
                    } else if (!route.completed) {
                        route.completed = true;
                        route.config.onComplete?.();
                    }
                }
            } else {
                // Beveg
                this.deltaVec.normalize();
                char.group.position.x += this.deltaVec.x * step;
                char.group.position.z += this.deltaVec.z * step;

                // Roter mot bevegelse (lerp)
                const targetYaw = Math.atan2(this.deltaVec.x, this.deltaVec.z);
                let diff = targetYaw - char.group.rotation.y;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                char.group.rotation.y += diff * Math.min(1, dt * 6);

                char.group.userData._isWalking = true;
                char.group.userData._walkSpeed = speed;
            }
        }
    }

    // Fase 4.3: reactive behaviors. Kjør FØR waypoints for å kunne overstyre.
    private updateBehaviors(
        dt: number,
        characters: Map<string, BuiltCharacter>,
        blocked: boolean,
        playerPos: THREE.Vector3,
        setFlag?: (key: string, value: unknown) => void,
    ): void {
        for (const [id, bh] of this.behaviors) {
            const char = characters.get(id);
            if (!char || blocked) {
                bh.reactionActive = false;
                continue;
            }
            const reaction = bh.config.playerReaction;
            if (!reaction) {
                bh.reactionActive = false;
                continue;
            }

            char.group.getWorldPosition(this._playerPosScratch);
            const dx = playerPos.x - this._playerPosScratch.x;
            const dz = playerPos.z - this._playerPosScratch.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Hysterese: trigg-terskel er `distance`, utkobling er distance*1.5.
            if (!bh.reactionActive && dist < reaction.distance) {
                bh.reactionActive = true;
                if (reaction.setFlag && !bh.flagAlreadySet) {
                    setFlag?.(reaction.setFlag, true);
                    bh.flagAlreadySet = true;
                }
            } else if (bh.reactionActive && dist > reaction.distance * 1.5) {
                bh.reactionActive = false;
            }

            if (!bh.reactionActive) continue;

            // Utfør reaksjonen
            const mult = reaction.speedMultiplier ?? (reaction.behavior === 'flee' ? 2.0 : 1.5);
            const baseSpeed = 1.4;
            const step = baseSpeed * mult * dt;

            if (reaction.behavior === 'face') {
                // Bare snu mot spilleren, ikke flytt.
                const targetYaw = Math.atan2(dx, dz);
                let diff = targetYaw - char.group.rotation.y;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                char.group.rotation.y += diff * Math.min(1, dt * 6);
                char.group.userData._isWalking = false;
            } else if (reaction.behavior === 'approach') {
                if (dist > 1.2) {
                    const nx = dx / dist;
                    const nz = dz / dist;
                    char.group.position.x += nx * step;
                    char.group.position.z += nz * step;
                    const targetYaw = Math.atan2(nx, nz);
                    let diff = targetYaw - char.group.rotation.y;
                    while (diff > Math.PI) diff -= 2 * Math.PI;
                    while (diff < -Math.PI) diff += 2 * Math.PI;
                    char.group.rotation.y += diff * Math.min(1, dt * 6);
                    char.group.userData._isWalking = true;
                    char.group.userData._walkSpeed = baseSpeed * mult;
                } else {
                    char.group.userData._isWalking = false;
                }
            } else if (reaction.behavior === 'flee') {
                const nx = -dx / dist;
                const nz = -dz / dist;
                char.group.position.x += nx * step;
                char.group.position.z += nz * step;
                const targetYaw = Math.atan2(nx, nz);
                let diff = targetYaw - char.group.rotation.y;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                char.group.rotation.y += diff * Math.min(1, dt * 6);
                char.group.userData._isWalking = true;
                char.group.userData._walkSpeed = baseSpeed * mult;
            } else if (reaction.behavior === 'alert') {
                // Samme som 'face' men setter også en emotion-hint via userData
                char.group.userData._alerted = true;
                char.group.userData._isWalking = false;
                const targetYaw = Math.atan2(dx, dz);
                let diff = targetYaw - char.group.rotation.y;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                char.group.rotation.y += diff * Math.min(1, dt * 6);
            }
        }
    }

    hasRoute(characterId: string): boolean {
        return this.routes.has(characterId);
    }

    // For debug-visualisering: alle aktive ruter (waypoints, current index)
    getRoutes(): { characterId: string; waypoints: [number, number][]; currentIndex: number }[] {
        const out: { characterId: string; waypoints: [number, number][]; currentIndex: number }[] = [];
        for (const [id, route] of this.routes) {
            out.push({
                characterId: id,
                waypoints: route.config.waypoints,
                currentIndex: route.waypointIndex,
            });
        }
        return out;
    }

    dispose(): void {
        this.routes.clear();
        this.behaviors.clear();
    }

    // Fase 5.2: serialisering for SaveSystem. Lagrer kun progresjon per rute;
    // posisjoner hentes separat fra selve karakteren.
    serialize(): Array<{ characterId: string; waypointIndex: number; direction: 1 | -1; pauseRemaining: number; completed: boolean }> {
        const out: Array<{ characterId: string; waypointIndex: number; direction: 1 | -1; pauseRemaining: number; completed: boolean }> = [];
        for (const [id, r] of this.routes) {
            out.push({
                characterId: id,
                waypointIndex: r.waypointIndex,
                direction: r.direction,
                pauseRemaining: r.pauseRemaining,
                completed: r.completed,
            });
        }
        return out;
    }

    restore(data: Array<{ characterId: string; waypointIndex: number; direction: 1 | -1; pauseRemaining: number; completed: boolean }>): void {
        for (const d of data) {
            const r = this.routes.get(d.characterId);
            if (!r) continue;
            r.waypointIndex = d.waypointIndex;
            r.direction = d.direction;
            r.pauseRemaining = d.pauseRemaining;
            r.completed = d.completed;
        }
    }
}
