import * as THREE from 'three';
import type { WeatherType, WeatherState } from '../types';
import type { QualityTier } from './PostProcessingSystem';
import type { TimeOfDaySystem } from './TimeOfDaySystem';

// Vær-system med tre overgangsstiler: regn (vertikale streker), snø (drift), tåke (fog tetthet).
// Partikler forfølger spilleren (følger XZ) så det ikke trengs hav av instanser.
export class WeatherSystem {
    private scene: THREE.Scene;
    private current: WeatherState = { type: 'clear', intensity: 0 };
    private rainPoints: THREE.Points | null = null;
    private rainPositions: Float32Array | null = null;
    private rainVelocities: Float32Array | null = null;
    private snowPoints: THREE.Points | null = null;
    private snowPositions: Float32Array | null = null;
    private snowDrift: Float32Array | null = null;
    private rainCount: number;
    private snowCount: number;
    private originalFog: THREE.Fog | THREE.FogExp2 | null = null;
    private fogTarget: THREE.FogExp2 | null = null;
    private radius = 30;
    private heightCeiling = 18;
    private timeOfDay: TimeOfDaySystem | null = null;

    constructor(scene: THREE.Scene, tier: QualityTier) {
        this.scene = scene;
        this.rainCount = tier === 'low' ? 800 : tier === 'medium' ? 1400 : 2200;
        this.snowCount = tier === 'low' ? 400 : tier === 'medium' ? 800 : 1200;
        this.originalFog = (scene.fog as THREE.Fog | THREE.FogExp2 | null) ?? null;
    }

    // Fase 1.3: gi WeatherSystem referanse til TimeOfDay slik at fog-kontroll overføres
    // mykt mellom de to. Uten dette ville rain/snow/fog permanent erstatte TOD-drevet fog.
    attachTimeOfDay(tod: TimeOfDaySystem): void {
        this.timeOfDay = tod;
    }

    // Fase 4.5: gameplay-kobling. Kalles av GameEngine før hver setWeather og
    // etter weather-endring slik at flagg kan settes/ryddes.
    private onChangeListener: ((from: WeatherType, to: WeatherType) => void) | null = null;
    setChangeListener(fn: (from: WeatherType, to: WeatherType) => void): void {
        this.onChangeListener = fn;
    }

    setWeather(state: WeatherState): void {
        const previousType = this.current.type;
        this.current = { ...state };
        this.ensureSystemFor(state.type);
        this.applyVisibility();
        this.applyFog();
        if (previousType !== state.type) {
            this.onChangeListener?.(previousType, state.type);
        }
    }

    getWeather(): WeatherState {
        return { ...this.current };
    }

    private ensureSystemFor(type: WeatherType): void {
        if ((type === 'rain') && !this.rainPoints) this.buildRain();
        if ((type === 'snow') && !this.snowPoints) this.buildSnow();
    }

    private buildRain(): void {
        const positions = new Float32Array(this.rainCount * 3);
        const velocities = new Float32Array(this.rainCount * 3);
        for (let i = 0; i < this.rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * this.radius * 2;
            positions[i * 3 + 1] = Math.random() * this.heightCeiling;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.radius * 2;
            velocities[i * 3] = -1.5;
            velocities[i * 3 + 1] = -22;
            velocities[i * 3 + 2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xc0d0e8,
            size: 0.12,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        this.scene.add(points);
        this.rainPoints = points;
        this.rainPositions = positions;
        this.rainVelocities = velocities;
    }

    private buildSnow(): void {
        const positions = new Float32Array(this.snowCount * 3);
        const drift = new Float32Array(this.snowCount * 2);
        for (let i = 0; i < this.snowCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * this.radius * 2;
            positions[i * 3 + 1] = Math.random() * this.heightCeiling;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.radius * 2;
            drift[i * 2] = (Math.random() - 0.5) * 1.5;
            drift[i * 2 + 1] = (Math.random() - 0.5) * 1.2;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.18,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        this.scene.add(points);
        this.snowPoints = points;
        this.snowPositions = positions;
        this.snowDrift = drift;
    }

    private applyVisibility(): void {
        const isRain = this.current.type === 'rain';
        const isSnow = this.current.type === 'snow';
        if (this.rainPoints) {
            this.rainPoints.visible = isRain;
            const mat = this.rainPoints.material as THREE.PointsMaterial;
            mat.opacity = 0.4 + this.current.intensity * 0.4;
        }
        if (this.snowPoints) {
            this.snowPoints.visible = isSnow;
            const mat = this.snowPoints.material as THREE.PointsMaterial;
            mat.opacity = 0.5 + this.current.intensity * 0.45;
        }
    }

    private applyFog(): void {
        const isWet = this.current.type === 'fog' || this.current.type === 'rain' || this.current.type === 'snow';
        const isFog = this.current.type === 'fog';
        if (isFog) {
            const density = 0.008 + this.current.intensity * 0.04;
            const color = (this.scene.background as THREE.Color | null)?.clone?.() ?? new THREE.Color(0x9bb3c8);
            this.fogTarget = new THREE.FogExp2(color, density);
            this.scene.fog = this.fogTarget;
        } else if (this.fogTarget && this.scene.fog === this.fogTarget) {
            this.scene.fog = this.originalFog;
            this.fogTarget = null;
        }
        // La TimeOfDay eie fog-kontrollen igjen når været er klart.
        if (this.timeOfDay) this.timeOfDay.setFogActive(!isWet);
    }

    update(_dt: number, playerX: number, playerZ: number): void {
        if (this.current.type === 'rain' && this.rainPoints && this.rainPositions && this.rainVelocities) {
            const positions = this.rainPositions;
            const velocities = this.rainVelocities;
            const dt = _dt;
            for (let i = 0; i < this.rainCount; i++) {
                positions[i * 3] += velocities[i * 3] * dt;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3] = playerX + (Math.random() - 0.5) * this.radius * 2;
                    positions[i * 3 + 1] = this.heightCeiling;
                    positions[i * 3 + 2] = playerZ + (Math.random() - 0.5) * this.radius * 2;
                }
            }
            this.rainPoints.geometry.attributes.position.needsUpdate = true;
        }
        if (this.current.type === 'snow' && this.snowPoints && this.snowPositions && this.snowDrift) {
            const positions = this.snowPositions;
            const drift = this.snowDrift;
            const dt = _dt;
            for (let i = 0; i < this.snowCount; i++) {
                positions[i * 3] += drift[i * 2] * dt;
                positions[i * 3 + 1] -= (1.0 + 0.4 * Math.sin(positions[i * 3 + 2] * 0.2 + i)) * dt;
                positions[i * 3 + 2] += drift[i * 2 + 1] * dt;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3] = playerX + (Math.random() - 0.5) * this.radius * 2;
                    positions[i * 3 + 1] = this.heightCeiling;
                    positions[i * 3 + 2] = playerZ + (Math.random() - 0.5) * this.radius * 2;
                }
            }
            this.snowPoints.geometry.attributes.position.needsUpdate = true;
        }
    }

    dispose(): void {
        for (const p of [this.rainPoints, this.snowPoints]) {
            if (!p) continue;
            this.scene.remove(p);
            p.geometry.dispose();
            (p.material as THREE.Material).dispose();
        }
        this.rainPoints = null;
        this.snowPoints = null;
        if (this.fogTarget && this.scene.fog === this.fogTarget) {
            this.scene.fog = this.originalFog;
        }
    }
}
