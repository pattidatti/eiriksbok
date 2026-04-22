import * as THREE from 'three';

export interface DebugStats {
    fps: number;
    frameMs: number;
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    programs: number;
    materials: number;
    physicsBodies: number;
    phase: string;
    qualityTier: 'low' | 'medium' | 'high';
    flags: Record<string, unknown>;
}

export interface DebugStatsSource {
    getPhase: () => string;
    getQualityTier: () => 'low' | 'medium' | 'high';
    getFlags: () => Record<string, unknown>;
    getPhysicsBodies: () => number;
    getMaterialCount: () => number;
}

const FPS_WINDOW = 30;

export class DebugHudSystem {
    private renderer: THREE.WebGLRenderer;
    private source: DebugStatsSource;
    private dtBuffer: number[] = [];
    private lastStats: DebugStats;
    private accDrawCalls = 0;
    private accTriangles = 0;

    constructor(renderer: THREE.WebGLRenderer, source: DebugStatsSource) {
        this.renderer = renderer;
        this.source = source;
        this.lastStats = this.emptyStats();
        // Slå av auto-reset slik at draw calls akkumuleres over hele post-processing-kjeden.
        // Vi resetter manuelt i tick().
        this.renderer.info.autoReset = false;
    }

    // Kall FØR composer.render() hver frame — leser akkumulert info fra forrige frame
    // og resetter tellerne for den kommende frame.
    tick(dt: number): void {
        if (dt > 0) {
            this.dtBuffer.push(dt);
            if (this.dtBuffer.length > FPS_WINDOW) this.dtBuffer.shift();
        }
        this.accDrawCalls = this.renderer.info.render.calls;
        this.accTriangles = this.renderer.info.render.triangles;
        this.renderer.info.reset();
    }

    collect(): DebugStats {
        const info = this.renderer.info;
        const avgDt = this.dtBuffer.length > 0
            ? this.dtBuffer.reduce((a, b) => a + b, 0) / this.dtBuffer.length
            : 0;
        this.lastStats = {
            fps: avgDt > 0 ? Math.round(1 / avgDt) : 0,
            frameMs: avgDt > 0 ? Math.round(avgDt * 1000 * 10) / 10 : 0,
            drawCalls: this.accDrawCalls,
            triangles: this.accTriangles,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            programs: info.programs?.length ?? 0,
            materials: this.source.getMaterialCount(),
            physicsBodies: this.source.getPhysicsBodies(),
            phase: this.source.getPhase(),
            qualityTier: this.source.getQualityTier(),
            flags: this.source.getFlags(),
        };
        return this.lastStats;
    }

    getLast(): DebugStats {
        return this.lastStats;
    }

    dispose(): void {
        this.renderer.info.autoReset = true;
    }

    private emptyStats(): DebugStats {
        return {
            fps: 0,
            frameMs: 0,
            drawCalls: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            programs: 0,
            materials: 0,
            physicsBodies: 0,
            phase: '',
            qualityTier: 'medium',
            flags: {},
        };
    }
}
