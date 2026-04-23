import * as THREE from 'three';
import type { DetectionGuardConfig } from '../types';
import type { BuiltCharacter } from '../CharacterBuilder';
import type { PhysicsWorld } from './PhysicsWorld';

const _guardWorld = new THREE.Vector3();
const _playerWorld = new THREE.Vector3();
const _toPlayer = new THREE.Vector3();

export class DetectionSystem {
    private guards: DetectionGuardConfig[];
    private level = 0; // 0..1 samlet deteksjonsniva
    private fullyDetected = false;
    private fullyDetectedFired = false;

    constructor(guards: DetectionGuardConfig[]) {
        this.guards = guards;
    }

    /**
     * Oppdaterer deteksjonsniva basert pa vakter og spillerposisjon.
     * @param dt delta-tid i sekunder
     * @param playerGroup spillerens Group (for verdensposisjon)
     * @param characters alle NPC-er registrert i motoren
     * @param physics valgfri — brukes for okklusjonssjekk (vegg mellom vakt og spiller)
     * @param setFlag callback for a sette motor-flagg ved full deteksjon
     */
    update(
        dt: number,
        playerGroup: THREE.Group,
        characters: Map<string, BuiltCharacter>,
        physics?: PhysicsWorld | null,
        setFlag?: (key: string, value: unknown) => void,
    ): void {
        playerGroup.getWorldPosition(_playerWorld);

        let maxIncrease = 0;
        let anyInCone = false;

        for (const guard of this.guards) {
            const char = characters.get(guard.characterId);
            if (!char) continue;

            char.group.getWorldPosition(_guardWorld);
            _toPlayer.subVectors(_playerWorld, _guardWorld);

            // Horisontal avstand
            const distXZ = Math.sqrt(_toPlayer.x * _toPlayer.x + _toPlayer.z * _toPlayer.z);
            if (distXZ > (guard.visionDistance ?? 8)) continue;

            // Synsvinkel-sjekk (horisontal). NPC-ens "fremover" = lokal +Z rotert av rotation.y
            const guardYaw = char.group.rotation.y;
            const guardFwdX = Math.sin(guardYaw);
            const guardFwdZ = Math.cos(guardYaw);

            const toPlayerAngle = Math.atan2(_toPlayer.x, _toPlayer.z);
            const guardAngle = Math.atan2(guardFwdX, guardFwdZ);
            let angleDiff = Math.abs(toPlayerAngle - guardAngle);
            // Normaliser til 0..PI
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

            const halfAngleRad = (guard.visionAngleDeg ?? 50) * (Math.PI / 180) * 0.5;
            if (angleDiff > halfAngleRad) continue;

            // Okklusjonssjekk: er det en vegg mellom vakt og spiller?
            if (physics) {
                const t = physics.raycastSegmentXZ(_guardWorld, _playerWorld);
                if (t < 0.95) continue; // vegg blokkerer
            }

            anyInCone = true;
            const rate = guard.detectionRate ?? 0.25;
            maxIncrease = Math.max(maxIncrease, rate);
        }

        if (anyInCone) {
            this.level = Math.min(1, this.level + maxIncrease * dt);
        } else {
            // Bruk laveste decay-rate blant alle vakter
            const decayRate = this.guards.reduce((min, g) => Math.min(min, g.decayRate ?? 0.15), 0.15);
            this.level = Math.max(0, this.level - decayRate * dt);
        }

        // Full deteksjon: utloster callback og setter flagg én gang
        if (this.level >= 1 && !this.fullyDetectedFired) {
            this.fullyDetected = true;
            this.fullyDetectedFired = true;
            for (const guard of this.guards) {
                if (guard.detectedFlag && setFlag) {
                    setFlag(guard.detectedFlag, true);
                }
                guard.onFullDetection?.();
            }
        }

        // Tilbakestill fired-flagg nar niva faller under terskel (gir mulighet for ny deteksjon)
        if (this.level < 0.05) {
            this.fullyDetected = false;
            this.fullyDetectedFired = false;
        }
    }

    getLevel(): number {
        return this.level;
    }

    isFullyDetected(): boolean {
        return this.fullyDetected;
    }

    reset(): void {
        this.level = 0;
        this.fullyDetected = false;
        this.fullyDetectedFired = false;
    }
}
