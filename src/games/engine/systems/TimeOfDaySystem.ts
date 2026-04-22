import * as THREE from 'three';
import type { SkySystem } from './SkySystem';

// Tidspunkt: 0 = midnatt, 0.25 = soloppgang, 0.5 = middag, 0.75 = solnedgang.
// Påvirker sun-direction (gjennom SkySystem) og farger på directional/ambient lys.
export class TimeOfDaySystem {
    private timeOfDay: number;
    private sky: SkySystem | null;
    private sun: THREE.DirectionalLight | null = null;
    private ambient: THREE.AmbientLight | null = null;
    private hemi: THREE.HemisphereLight | null = null;
    private dirty = true;
    private sunDir = new THREE.Vector3();

    constructor(initialTime = 0.5, sky: SkySystem | null = null) {
        this.timeOfDay = initialTime;
        this.sky = sky;
    }

    setSky(sky: SkySystem): void {
        this.sky = sky;
        this.dirty = true;
    }

    registerSun(light: THREE.DirectionalLight): void {
        this.sun = light;
        this.dirty = true;
    }

    registerAmbient(light: THREE.AmbientLight): void {
        this.ambient = light;
        this.dirty = true;
    }

    registerHemisphere(light: THREE.HemisphereLight): void {
        this.hemi = light;
        this.dirty = true;
    }

    setTimeOfDay(t: number): void {
        this.timeOfDay = ((t % 1) + 1) % 1;
        this.dirty = true;
    }

    getTimeOfDay(): number {
        return this.timeOfDay;
    }

    getSunDirection(): THREE.Vector3 {
        // Beregn sol-retning basert på timeOfDay. Gå fra øst (sun-up t=0.25) til vest (t=0.75)
        // i en bue rundt øst-vest-aksen. Ved natt er solen under horisonten.
        const angle = (this.timeOfDay - 0.25) * Math.PI * 2;
        // x = øst-vest, y = oppover, z = nord-sør
        this.sunDir.set(
            Math.cos(angle),
            Math.sin(angle),
            -0.3,
        ).normalize();
        return this.sunDir;
    }

    update(): void {
        if (!this.dirty) return;
        this.dirty = false;

        const dir = this.getSunDirection();

        if (this.sky) {
            this.sky.setSunDirection(dir);
        }

        if (this.sun) {
            // Posisjon stort nok til å virke som "uendelig"
            this.sun.position.set(dir.x * 100, dir.y * 100, dir.z * 100);
            const t = this.timeOfDay;
            // Fargetone: varm dawn/dusk, hvit middag, kjølig sent natt.
            const color = sunColorFor(t);
            this.sun.color.copy(color);
            // Intensitet: høyere midt på dagen
            const elevation = Math.max(0, dir.y);
            this.sun.intensity = 0.4 + elevation * 1.6;
        }

        if (this.ambient) {
            const color = ambientColorFor(this.timeOfDay);
            this.ambient.color.copy(color);
            const elevation = Math.max(0, this.getSunDirection().y);
            this.ambient.intensity = 0.25 + elevation * 0.5;
        }

        if (this.hemi) {
            this.hemi.color.copy(skyColorFor(this.timeOfDay));
            this.hemi.intensity = 0.3 + Math.max(0, this.getSunDirection().y) * 0.6;
        }
    }
}

function sunColorFor(t: number): THREE.Color {
    // Dawn (0.2-0.3) varm rosa, Middag (0.4-0.6) hvit, Dusk (0.7-0.8) varm oransje, Natt (>0.85, <0.15) kald blå
    if (t < 0.2 || t > 0.85) return new THREE.Color(0x6e8aaa);
    if (t < 0.3) return new THREE.Color(0xffb077);
    if (t < 0.4) return new THREE.Color(0xffe2b8);
    if (t < 0.6) return new THREE.Color(0xfff5e0);
    if (t < 0.7) return new THREE.Color(0xffe2b8);
    if (t < 0.8) return new THREE.Color(0xff9466);
    return new THREE.Color(0xa07866);
}

function ambientColorFor(t: number): THREE.Color {
    if (t < 0.2 || t > 0.85) return new THREE.Color(0x404868);
    if (t < 0.35) return new THREE.Color(0x9a7a78);
    if (t < 0.65) return new THREE.Color(0xddd2c0);
    if (t < 0.8) return new THREE.Color(0xb0866a);
    return new THREE.Color(0x6a5878);
}

function skyColorFor(t: number): THREE.Color {
    if (t < 0.2 || t > 0.85) return new THREE.Color(0x10192e);
    if (t < 0.3) return new THREE.Color(0xea9b7a);
    if (t < 0.4) return new THREE.Color(0xc6dded);
    if (t < 0.6) return new THREE.Color(0xbfd8ee);
    if (t < 0.7) return new THREE.Color(0xc6dded);
    if (t < 0.8) return new THREE.Color(0xea8c5a);
    return new THREE.Color(0x36436a);
}
