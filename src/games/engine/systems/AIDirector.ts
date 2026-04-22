import * as THREE from 'three';
import type { NpcRouteConfig } from '../types';
import type { BuiltCharacter } from '../CharacterBuilder';

interface ActiveRoute {
    config: NpcRouteConfig;
    waypointIndex: number;
    direction: 1 | -1;
    pauseRemaining: number;
    completed: boolean;
}

// Enkel waypoint-vandring for NPCer.
// - Beveger karakter mot waypoint
// - Roterer mot bevegelsesretning
// - Pauser ved waypoints
// - Stopper når dialog/monolog er aktiv
// - Setter `_isWalking` på character.userData så CharacterBuilder kan animere
export class AIDirector {
    private routes = new Map<string, ActiveRoute>();
    private targetVec = new THREE.Vector3();
    private deltaVec = new THREE.Vector3();

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

    update(dt: number, characters: Map<string, BuiltCharacter>, blocked: boolean): void {
        for (const [id, route] of this.routes) {
            const char = characters.get(id);
            if (!char) continue;

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
                    } else {
                        route.completed = true;
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
    }
}
