import * as THREE from 'three';

// Fase 3.1: 3D-audio + ambient + one-shot lyd for mini-spill-motoren.
// Bygger direkte på Web Audio API (Tone.js er tilgjengelig, men vi trenger
// bare PannerNode og GainNode — holder bundle-size nede).
//
// Lydfiler lastes lazy fra `url` (relativt til public/). Første playSpatial()
// for en gitt url fetcher og dekoder buffer; subsequenter kall er gratis.

export interface AmbientOptions {
    loop?: boolean;       // default true
    volume?: number;      // 0..1, default 0.7
    fadeIn?: number;      // sek, default 0 (ingen fade)
}

export interface SpatialOptions {
    position: THREE.Object3D | [number, number, number];
    loop?: boolean;
    volume?: number;
    radius?: number;      // distanse-attenuasjon; default 30 (hør ved 30m)
    maxDistance?: number; // utenfor = inaudible; default 60
}

export interface OneShotOptions {
    position?: [number, number, number];  // hvis undefined, ikke-spatial
    volume?: number;
}

// Intern handle for å kunne stoppe / fade-ut en lyd.
export interface AudioHandle {
    stop: (fadeOutSec?: number) => void;
    setVolume: (volume: number) => void;
}

const MAX_SIMULTANEOUS = 8;

export class AudioSystem {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private bufferCache = new Map<string, Promise<AudioBuffer>>();
    // Aktive spatial-kilder — oppdateres hver frame med ny posisjon.
    private spatialSources: Array<{
        source: AudioBufferSourceNode;
        panner: PannerNode;
        gain: GainNode;
        target: THREE.Object3D | [number, number, number];
    }> = [];
    private allActiveGains = new Set<GainNode>();
    private muted = false;
    private masterVolume = 1.0;
    // Fase 3.2: aktive musikk-lag per layer-ID. Hver inneholder en crossfade-gain
    // som kan rampes til 0 (fade out) eller opp mot target-volum (fade in).
    private musicLayers = new Map<string, { source: AudioBufferSourceNode; gain: GainNode; target: number }>();

    constructor() {
        // AudioContext opprettes lazy ved første bruker-interaksjon (for å unngå
        // autoplay-policy-krav på de fleste nettlesere).
    }

    private ensureCtx(): AudioContext {
        if (!this.ctx) {
            const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.ctx.destination);
        }
        return this.ctx;
    }

    private async loadBuffer(url: string): Promise<AudioBuffer> {
        const existing = this.bufferCache.get(url);
        if (existing) return existing;
        const ctx = this.ensureCtx();
        const p = fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error(`AudioSystem: fetch failed for ${url} (${r.status})`);
                return r.arrayBuffer();
            })
            .then((buf) => ctx.decodeAudioData(buf));
        this.bufferCache.set(url, p);
        return p;
    }

    private enforceSimultaneousLimit(): void {
        // Hvis vi er over grensen, stopp eldste gain-node og rydd også i
        // spatialSources og musicLayers slik at vi ikke oppdaterer døde pannere.
        while (this.allActiveGains.size > MAX_SIMULTANEOUS) {
            const oldest = this.allActiveGains.values().next().value as GainNode | undefined;
            if (!oldest) break;
            oldest.disconnect();
            this.allActiveGains.delete(oldest);
            // Fjern fra spatialSources hvis gain matcher
            const sIdx = this.spatialSources.findIndex((s) => s.gain === oldest);
            if (sIdx >= 0) {
                const s = this.spatialSources[sIdx];
                try { s.source.stop(); } catch { /* already stopped */ }
                s.panner.disconnect();
                this.spatialSources.splice(sIdx, 1);
            }
            // Fjern fra musicLayers hvis gain matcher
            for (const [id, layer] of this.musicLayers) {
                if (layer.gain === oldest) {
                    try { layer.source.stop(); } catch { /* already stopped */ }
                    this.musicLayers.delete(id);
                    break;
                }
            }
        }
    }

    /** Ambient loop: én global kilde uten 3D-plassering. */
    async playAmbient(url: string, opts: AmbientOptions = {}): Promise<AudioHandle | null> {
        try {
            const ctx = this.ensureCtx();
            const buffer = await this.loadBuffer(url);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = opts.loop ?? true;
            const gain = ctx.createGain();
            const targetVol = opts.volume ?? 0.7;
            const fade = opts.fadeIn ?? 0;
            if (fade > 0) {
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + fade);
            } else {
                gain.gain.value = targetVol;
            }
            source.connect(gain);
            gain.connect(this.masterGain!);
            source.start();
            this.allActiveGains.add(gain);
            this.enforceSimultaneousLimit();
            return this.makeHandle(source, gain);
        } catch (e) {
            console.warn('playAmbient failed:', e);
            return null;
        }
    }

    /** Posisjonert 3D-lyd. Følger Object3D eller fast posisjon. */
    async playSpatial(url: string, opts: SpatialOptions): Promise<AudioHandle | null> {
        try {
            const ctx = this.ensureCtx();
            const buffer = await this.loadBuffer(url);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = opts.loop ?? true;
            const panner = ctx.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.rolloffFactor = 1;
            panner.maxDistance = opts.maxDistance ?? 60;
            const gain = ctx.createGain();
            gain.gain.value = opts.volume ?? 0.8;
            source.connect(panner);
            panner.connect(gain);
            gain.connect(this.masterGain!);
            source.start();
            const entry = { source, panner, gain, target: opts.position };
            this.spatialSources.push(entry);
            this.allActiveGains.add(gain);
            // Rydd opp automatisk når ikke-looping kilde er ferdig.
            source.onended = () => {
                const idx = this.spatialSources.indexOf(entry);
                if (idx >= 0) this.spatialSources.splice(idx, 1);
                this.allActiveGains.delete(gain);
                try { panner.disconnect(); } catch { /* already disconnected */ }
                try { gain.disconnect(); } catch { /* already disconnected */ }
            };
            this.enforceSimultaneousLimit();
            // Sett initial posisjon synkront slik at lyden ikke starter på 0,0,0.
            this.updateSpatialNode(panner, opts.position);
            return this.makeHandle(source, gain);
        } catch (e) {
            console.warn('playSpatial failed:', e);
            return null;
        }
    }

    /** Én-gangs lyd (dialog-klikk, pickup, eksplosjon). */
    async playOneShot(url: string, opts: OneShotOptions = {}): Promise<void> {
        try {
            const ctx = this.ensureCtx();
            const buffer = await this.loadBuffer(url);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.value = opts.volume ?? 1.0;
            if (opts.position) {
                const panner = ctx.createPanner();
                panner.panningModel = 'HRTF';
                panner.setPosition?.(...opts.position);
                source.connect(panner);
                panner.connect(gain);
            } else {
                source.connect(gain);
            }
            gain.connect(this.masterGain!);
            this.allActiveGains.add(gain);
            source.start();
            source.onended = () => {
                this.allActiveGains.delete(gain);
                gain.disconnect();
            };
        } catch (e) {
            console.warn('playOneShot failed:', e);
        }
    }

    /** Oppdater lytter-posisjon + spatial-kilder. Kalles hver frame fra GameEngine. */
    update(listenerWorldPos: THREE.Vector3, listenerForward: THREE.Vector3): void {
        if (!this.ctx || !this.masterGain) return;
        const listener = this.ctx.listener;
        // Bruk setPosition for bred kompatibilitet (fallback når positionX/Y/Z-AudioParam ikke finnes).
        if (listener.positionX && listener.forwardX) {
            listener.positionX.value = listenerWorldPos.x;
            listener.positionY.value = listenerWorldPos.y;
            listener.positionZ.value = listenerWorldPos.z;
            listener.forwardX.value = listenerForward.x;
            listener.forwardY.value = listenerForward.y;
            listener.forwardZ.value = listenerForward.z;
        } else if (listener.setPosition) {
            listener.setPosition(listenerWorldPos.x, listenerWorldPos.y, listenerWorldPos.z);
            listener.setOrientation?.(
                listenerForward.x, listenerForward.y, listenerForward.z,
                0, 1, 0,
            );
        }
        for (const s of this.spatialSources) {
            this.updateSpatialNode(s.panner, s.target);
        }
    }

    private updateSpatialNode(panner: PannerNode, target: THREE.Object3D | [number, number, number]): void {
        let x: number, y: number, z: number;
        if (Array.isArray(target)) {
            [x, y, z] = target;
        } else {
            const v = _audioPosScratch;
            target.getWorldPosition(v);
            x = v.x; y = v.y; z = v.z;
        }
        if (panner.positionX) {
            panner.positionX.value = x;
            panner.positionY.value = y;
            panner.positionZ.value = z;
        } else if (panner.setPosition) {
            panner.setPosition(x, y, z);
        }
    }

    setMasterVolume(v: number): void {
        this.masterVolume = Math.max(0, Math.min(1, v));
        if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }

    setMuted(m: boolean): void {
        this.muted = m;
        if (this.masterGain) this.masterGain.gain.value = m ? 0 : this.masterVolume;
    }

    // ─── Dynamisk musikk (Fase 3.2) ──────────────────────────────────────────
    // Layered music: flere spor spilles samtidig, hver med egen volum-rampe.
    // Basis-sporet starter på ønsket volum; ekstra lag (f.eks. dramatisk
    // streng-lag) fades inn/ut via setMusicLayer(layer, targetVolume, fadeSec).

    /** Sett opp et musikk-lag. Loop'er alltid. Kalles ved spillstart for basis + lag. */
    async addMusicLayer(layerId: string, url: string, initialVolume = 0): Promise<void> {
        try {
            const ctx = this.ensureCtx();
            const buffer = await this.loadBuffer(url);
            const existing = this.musicLayers.get(layerId);
            if (existing) return; // idempotent
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            const gain = ctx.createGain();
            gain.gain.value = initialVolume;
            source.connect(gain);
            gain.connect(this.masterGain!);
            source.start();
            this.musicLayers.set(layerId, { source, gain, target: initialVolume });
            this.allActiveGains.add(gain);
            this.enforceSimultaneousLimit();
        } catch (e) {
            console.warn('addMusicLayer failed:', e);
        }
    }

    /** Fade et lag til target-volum over `fadeSec` sekunder. 0 = fade ut. */
    setMusicLayer(layerId: string, targetVolume: number, fadeSec = 1.5): void {
        const layer = this.musicLayers.get(layerId);
        if (!layer || !this.ctx) return;
        const now = this.ctx.currentTime;
        const v = Math.max(0, Math.min(1, targetVolume));
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
        layer.gain.gain.linearRampToValueAtTime(v, now + Math.max(0.01, fadeSec));
        layer.target = v;
    }

    /** Stopp og fjern alle musikk-lag. */
    stopAllMusic(fadeOutSec = 1.0): void {
        for (const [id, layer] of this.musicLayers) {
            this.setMusicLayer(id, 0, fadeOutSec);
            window.setTimeout(() => {
                try { layer.source.stop(); } catch { /* already stopped */ }
                this.allActiveGains.delete(layer.gain);
                layer.gain.disconnect();
                this.musicLayers.delete(id);
            }, fadeOutSec * 1000 + 50);
        }
    }

    /** Krav for mobile/autoplay: resume context etter user-gesture. */
    async resume(): Promise<void> {
        if (this.ctx && this.ctx.state === 'suspended') {
            try { await this.ctx.resume(); } catch { /* ignore */ }
        }
    }

    dispose(): void {
        for (const s of this.spatialSources) {
            try { s.source.stop(); } catch { /* already ended */ }
            s.gain.disconnect();
            s.panner.disconnect();
        }
        this.spatialSources.length = 0;
        for (const layer of this.musicLayers.values()) {
            try { layer.source.stop(); } catch { /* already ended */ }
            layer.gain.disconnect();
        }
        this.musicLayers.clear();
        for (const g of this.allActiveGains) g.disconnect();
        this.allActiveGains.clear();
        if (this.ctx) {
            void this.ctx.close();
            this.ctx = null;
            this.masterGain = null;
        }
    }

    private makeHandle(source: AudioBufferSourceNode, gain: GainNode): AudioHandle {
        const ctx = this.ctx!;
        return {
            stop: (fadeOutSec = 0) => {
                if (fadeOutSec > 0) {
                    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSec);
                    window.setTimeout(() => {
                        try { source.stop(); } catch { /* already stopped */ }
                        this.allActiveGains.delete(gain);
                        gain.disconnect();
                    }, fadeOutSec * 1000);
                } else {
                    try { source.stop(); } catch { /* already stopped */ }
                    this.allActiveGains.delete(gain);
                    gain.disconnect();
                }
            },
            setVolume: (v: number) => {
                gain.gain.value = Math.max(0, Math.min(1, v));
            },
        };
    }
}

const _audioPosScratch = new THREE.Vector3();
