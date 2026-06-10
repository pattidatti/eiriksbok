// Prosedural lydsyntese for mini-spillmotoren. Prosjektet har ingen lydfiler -
// all lyd genereres med Web Audio API. To kategorier:
//
//  1) Offline-rendrede buffere (OfflineAudioContext): looper og one-shots som
//     adresseres via URL-skjemaet `proc:navn` eller `proc:navn?gain=0.4&cutoff=900`.
//     AudioSystem.loadBuffer intercepter `proc:`-prefikset, så alle eksisterende
//     call-sites (playAmbient/playOneShot/playSpatial/addMusicLayer) fungerer uendret.
//     Looper får hale-til-hode equal-power crossfade så de er sømløse.
//
//  2) Live-generatorer (createLiveSound): lyder som styres i sanntid av spill-state,
//     f.eks. marsj-tramp med bpm/intensity. Bruker lookahead-scheduling mot
//     ctx.currentTime (aldri Date.now()) så tab-throttling ikke gir hakking.

type Params = Record<string, number>;

type ProceduralRenderer = (ctx: OfflineAudioContext, p: Params) => void;

interface ProceduralDef {
    duration: number; // sekunder
    loop: boolean;    // true => crossfade-søm i etterkant
    render: ProceduralRenderer;
}

// ─── Hjelpere ────────────────────────────────────────────────────────────────

function makeNoiseBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
    const length = Math.max(1, Math.floor(seconds * ctx.sampleRate));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

function noiseSource(ctx: BaseAudioContext, seconds: number): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, seconds);
    src.loop = true;
    return src;
}

// Eksponentiell decay-envelope på en gain-node (Web Audio tåler ikke 0 i exp-ramp).
function decayEnv(gain: GainNode, t0: number, peak: number, decaySec: number): void {
    gain.gain.setValueAtTime(Math.max(0.0001, peak), t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decaySec);
}

// ─── Renderere ───────────────────────────────────────────────────────────────

const renderRain: ProceduralRenderer = (ctx, p) => {
    // Bredbåndet sus (regnteppe)
    const body = noiseSource(ctx, 2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = p.cutoff ?? 1300;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = (p.gain ?? 0.5) * 0.8;
    body.connect(lp).connect(bodyGain).connect(ctx.destination);
    body.start();
    // Lyse drypp (svakt høyfrekvent lag med langsom amplitudevariasjon)
    const drops = noiseSource(ctx, 2);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3200;
    const dropGain = ctx.createGain();
    dropGain.gain.value = (p.gain ?? 0.5) * 0.12;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.31;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = (p.gain ?? 0.5) * 0.05;
    lfo.connect(lfoGain).connect(dropGain.gain);
    drops.connect(hp).connect(dropGain).connect(ctx.destination);
    drops.start();
    lfo.start();
};

const renderWind: ProceduralRenderer = (ctx, p) => {
    const src = noiseSource(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = p.freq ?? 420;
    bp.Q.value = 1.1;
    const out = ctx.createGain();
    out.gain.value = p.gain ?? 0.4;
    // Langsom "gust"-LFO på både filterfrekvens og volum
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const toFreq = ctx.createGain();
    toFreq.gain.value = (p.freq ?? 420) * 0.4;
    lfo.connect(toFreq).connect(bp.frequency);
    const toGain = ctx.createGain();
    toGain.gain.value = (p.gain ?? 0.4) * 0.3;
    lfo.connect(toGain).connect(out.gain);
    src.connect(bp).connect(out).connect(ctx.destination);
    src.start();
    lfo.start();
};

const renderMurmur: ProceduralRenderer = (ctx, p) => {
    // To bandpass-lag i stemmeleie + to usynkrone LFO-er = "mange stemmer langt unna"
    const base = p.gain ?? 0.4;
    const layers: Array<[number, number, number]> = [
        // [senterfrekvens, Q, relativ gain]
        [480, 2.0, 0.6],
        [260, 1.6, 0.4],
    ];
    for (const [freq, q, rel] of layers) {
        const src = noiseSource(ctx, 2);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq;
        bp.Q.value = q;
        const g = ctx.createGain();
        g.gain.value = base * rel;
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start();
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.17 + freq * 0.0002;
        const lg = ctx.createGain();
        lg.gain.value = base * rel * 0.35;
        lfo.connect(lg).connect(g.gain);
        lfo.start();
    }
};

const renderFire: ProceduralRenderer = (ctx, p) => {
    const base = p.gain ?? 0.5;
    // Lavfrekvent rumling
    const rumble = noiseSource(ctx, 2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const rg = ctx.createGain();
    rg.gain.value = base * 0.35;
    rumble.connect(lp).connect(rg).connect(ctx.destination);
    rumble.start();
    // Knitring: tilfeldige korte spikes på et bandpass-lag
    const crackle = noiseSource(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const cg = ctx.createGain();
    cg.gain.value = 0.0001;
    crackle.connect(bp).connect(cg).connect(ctx.destination);
    crackle.start();
    const dur = ctx.length / ctx.sampleRate;
    let t = 0.05;
    while (t < dur - 0.1) {
        const peak = base * (0.2 + Math.random() * 0.5);
        cg.gain.setValueAtTime(0.0001, t);
        cg.gain.exponentialRampToValueAtTime(peak, t + 0.005);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.05);
        t += 0.04 + Math.random() * 0.25;
    }
};

const renderThunder: ProceduralRenderer = (ctx, p) => {
    const base = p.gain ?? 0.8;
    const makeRumble = (t0: number, peak: number, decay: number, cutoff: number): void => {
        const src = noiseSource(ctx, 2);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(cutoff, t0);
        lp.frequency.exponentialRampToValueAtTime(55, t0 + decay);
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
        src.connect(lp).connect(g).connect(ctx.destination);
        src.start(t0);
        src.stop(t0 + decay + 0.1);
    };
    makeRumble(0, base, 3.2, 320);       // hovedsmell med lang hale
    makeRumble(0.55, base * 0.5, 2.2, 180); // etterskjelv
};

const renderFootstep: ProceduralRenderer = (ctx, p) => {
    // Knas (filtrert støy) + dump (lav sinus)
    const noise = noiseSource(ctx, 0.3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = p.cutoff ?? 1000;
    const ng = ctx.createGain();
    decayEnv(ng, 0, (p.gain ?? 0.7) * 0.8, 0.12);
    noise.connect(lp).connect(ng).connect(ctx.destination);
    noise.start();
    const thump = ctx.createOscillator();
    thump.frequency.setValueAtTime(85, 0);
    thump.frequency.exponentialRampToValueAtTime(50, 0.08);
    const tg = ctx.createGain();
    decayEnv(tg, 0, (p.gain ?? 0.7) * 0.5, 0.09);
    thump.connect(tg).connect(ctx.destination);
    thump.start();
};

const renderDrum: ProceduralRenderer = (ctx, p) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(p.freq ?? 115, 0);
    osc.frequency.exponentialRampToValueAtTime((p.freq ?? 115) * 0.4, 0.28);
    const og = ctx.createGain();
    decayEnv(og, 0, p.gain ?? 0.9, 0.42);
    osc.connect(og).connect(ctx.destination);
    osc.start();
    // Skinn-transient
    const noise = noiseSource(ctx, 0.1);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    const ng = ctx.createGain();
    decayEnv(ng, 0, (p.gain ?? 0.9) * 0.3, 0.04);
    noise.connect(bp).connect(ng).connect(ctx.destination);
    noise.start();
};

const renderShutterClick: ProceduralRenderer = (ctx, p) => {
    // To mekaniske klikk: lukker åpner + lukker
    const base = p.gain ?? 0.6;
    for (const [t0, peak, dur] of [
        [0, base, 0.012],
        [0.07, base * 0.7, 0.009],
    ] as Array<[number, number, number]>) {
        const noise = noiseSource(ctx, 0.05);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        noise.connect(hp).connect(g).connect(ctx.destination);
        noise.start(t0);
        noise.stop(t0 + dur + 0.02);
    }
};

const renderBlip: ProceduralRenderer = (ctx, p) => {
    // Kort to-tone-arpeggio opp (pickup/UI)
    const base = p.base ?? 587;
    const notes: Array<[number, number]> = [
        [base, 0],
        [base * 1.5, 0.07],
    ];
    for (const [freq, t0] of notes) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(p.gain ?? 0.4, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.12);
    }
};

const renderChime: ProceduralRenderer = (ctx, p) => {
    // C5-E5-G5 staggered (suksess)
    const notes: Array<[number, number]> = [
        [523.25, 0],
        [659.25, 0.09],
        [783.99, 0.18],
    ];
    for (const [freq, t0] of notes) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(p.gain ?? 0.35, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.6);
    }
};

const renderBuzz: ProceduralRenderer = (ctx, p) => {
    // Dyp, kort buzz (feil)
    for (const freq of [123, 98]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 650;
        const g = ctx.createGain();
        decayEnv(g, 0, (p.gain ?? 0.3) * 0.5, 0.32);
        osc.connect(lp).connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(0.4);
    }
};

const renderRattle: ProceduralRenderer = (ctx, p) => {
    // Metallisk rasling: høye, smale pings i rask uregelmessig rekke
    const base = p.gain ?? 0.4;
    let t = 0;
    for (let i = 0; i < 7; i++) {
        const noise = noiseSource(ctx, 0.05);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1900 + Math.random() * 1400;
        bp.Q.value = 9;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(base * (0.4 + Math.random() * 0.6), t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        noise.connect(bp).connect(g).connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.08);
        t += 0.04 + Math.random() * 0.06;
    }
};

const renderDrip: ProceduralRenderer = (ctx, p) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, 0);
    osc.frequency.exponentialRampToValueAtTime(520, 0.1);
    const g = ctx.createGain();
    decayEnv(g, 0, p.gain ?? 0.3, 0.14);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(0.18);
};

export const PROCEDURAL_SOUNDS: Record<string, ProceduralDef> = {
    'rain':          { duration: 6,    loop: true,  render: renderRain },
    'wind':          { duration: 8,    loop: true,  render: renderWind },
    'crowd-murmur':  { duration: 8,    loop: true,  render: renderMurmur },
    'fire-crackle':  { duration: 5,    loop: true,  render: renderFire },
    'thunder':       { duration: 4,    loop: false, render: renderThunder },
    'footstep':      { duration: 0.25, loop: false, render: renderFootstep },
    'drum-hit':      { duration: 0.5,  loop: false, render: renderDrum },
    'shutter-click': { duration: 0.12, loop: false, render: renderShutterClick },
    'blip-pickup':   { duration: 0.25, loop: false, render: renderBlip },
    'chime-success': { duration: 0.8,  loop: false, render: renderChime },
    'buzz-fail':     { duration: 0.45, loop: false, render: renderBuzz },
    'rattle':        { duration: 0.7,  loop: false, render: renderRattle },
    'drip':          { duration: 0.2,  loop: false, render: renderDrip },
};

// ─── proc:-parsing + offline-rendering ───────────────────────────────────────

function parseSpec(spec: string): { name: string; params: Params } {
    const [name, query] = spec.split('?');
    const params: Params = {};
    if (query) {
        for (const pair of query.split('&')) {
            const [k, v] = pair.split('=');
            const num = Number(v);
            if (k && Number.isFinite(num)) params[k] = num;
        }
    }
    return { name, params };
}

// Equal-power crossfade av halen inn i hodet → sømløs loop. Returnerer kortere buffer.
function crossfadeLoop(buffer: AudioBuffer, fadeSec: number): AudioBuffer {
    const sr = buffer.sampleRate;
    const fade = Math.min(Math.floor(fadeSec * sr), Math.floor(buffer.length / 3));
    if (fade <= 0) return buffer;
    const outLength = buffer.length - fade;
    // Lag ny buffer via en midlertidig offline-kontekst (createBuffer trenger en kontekst)
    const tmp = new OfflineAudioContext(buffer.numberOfChannels, outLength, sr);
    const out = tmp.createBuffer(buffer.numberOfChannels, outLength, sr);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const src = buffer.getChannelData(ch);
        const dst = out.getChannelData(ch);
        for (let i = 0; i < fade; i++) {
            const t = i / fade;
            dst[i] = src[i] * Math.sqrt(t) + src[outLength + i] * Math.sqrt(1 - t);
        }
        for (let i = fade; i < outLength; i++) dst[i] = src[i];
    }
    return out;
}

/** Render en `proc:`-lyd til en AudioBuffer. `spec` er alt etter `proc:`-prefikset. */
export async function renderProceduralBuffer(spec: string, sampleRate: number): Promise<AudioBuffer> {
    const { name, params } = parseSpec(spec);
    const def = PROCEDURAL_SOUNDS[name];
    if (!def) {
        throw new Error(
            `[ProceduralAudio] Ukjent proc-lyd: '${name}'. Gyldige: ${Object.keys(PROCEDURAL_SOUNDS).join(', ')}`,
        );
    }
    const ctx = new OfflineAudioContext(1, Math.ceil(def.duration * sampleRate), sampleRate);
    def.render(ctx, params);
    const rendered = await ctx.startRendering();
    return def.loop ? crossfadeLoop(rendered, 0.5) : rendered;
}

// ─── Live-generatorer ────────────────────────────────────────────────────────

export type LiveSoundName = 'march-footsteps' | 'crowd-murmur-live';

export interface LiveSoundOptions {
    volume?: number;    // 0..1, default 0.7
    bpm?: number;       // kun march-footsteps, default 116
    intensity?: number; // 0..1, default 0.5 (0 = stille)
}

export interface LiveSoundHandle {
    stop: (fadeOutSec?: number) => void;
    setVolume: (v: number) => void;
    /** 'intensity' (begge), 'bpm' (march-footsteps). Verdier rampes mykt. */
    setParam: (name: 'intensity' | 'bpm', value: number) => void;
}

export interface LiveSoundInstance {
    handle: LiveSoundHandle;
    gain: GainNode; // master-gain for registrering i AudioSystem (mute/limit/dispose)
}

export function createLiveSound(
    ctx: AudioContext,
    destination: AudioNode,
    name: LiveSoundName,
    opts: LiveSoundOptions = {},
): LiveSoundInstance {
    if (name === 'march-footsteps') return createMarchFootsteps(ctx, destination, opts);
    return createCrowdMurmurLive(ctx, destination, opts);
}

// Marsj-tramp: noise-bursts på et bpm-grid via lookahead-scheduling. `intensity`
// styrer både volum og hvor mange jittrede "føtter" som lander per slag, slik at
// 0.2 høres ut som spredte folk og 1.0 som en hel kolonne i takt.
function createMarchFootsteps(
    ctx: AudioContext,
    destination: AudioNode,
    opts: LiveSoundOptions,
): LiveSoundInstance {
    const master = ctx.createGain();
    master.gain.value = opts.volume ?? 0.7;
    master.connect(destination);
    const noiseBuf = makeNoiseBuffer(ctx, 0.2);

    let bpm = opts.bpm ?? 116;
    let intensity = Math.max(0, Math.min(1, opts.intensity ?? 0.5));
    let nextBeat = ctx.currentTime + 0.1;
    let stopped = false;

    const scheduleBeat = (t: number): void => {
        const feet = 1 + Math.round(intensity * 7);
        for (let k = 0; k < feet; k++) {
            const offset = k === 0 ? 0 : Math.random() * 0.09;
            const src = ctx.createBufferSource();
            src.buffer = noiseBuf;
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 650 + Math.random() * 350;
            const g = ctx.createGain();
            const peak = (0.1 + Math.random() * 0.08) * (0.4 + intensity * 0.6);
            g.gain.setValueAtTime(0.0001, t + offset);
            g.gain.exponentialRampToValueAtTime(peak, t + offset + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.1);
            src.connect(lp).connect(g).connect(master);
            src.start(t + offset);
            src.stop(t + offset + 0.15);
        }
    };

    const intervalId = window.setInterval(() => {
        if (stopped) return;
        // Ikke planlegg slag mens konteksten er suspendert (før brukergest) -
        // de ville alle blitt avspilt i en klump ved resume.
        if (ctx.state !== 'running') return;
        const now = ctx.currentTime;
        // Tab-throttling: ikke backfill gamle slag, hopp frem
        if (nextBeat < now) nextBeat = now + 0.05;
        while (nextBeat < now + 0.25) {
            if (intensity > 0.01) scheduleBeat(nextBeat);
            nextBeat += 60 / bpm;
        }
    }, 50);

    return {
        gain: master,
        handle: {
            stop: (fadeOutSec = 0.3) => {
                if (stopped) return;
                stopped = true;
                window.clearInterval(intervalId);
                master.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSec);
                window.setTimeout(() => master.disconnect(), fadeOutSec * 1000 + 60);
            },
            setVolume: (v) => {
                master.gain.linearRampToValueAtTime(
                    Math.max(0, Math.min(1, v)),
                    ctx.currentTime + 0.1,
                );
            },
            setParam: (param, value) => {
                if (param === 'bpm') bpm = Math.max(40, Math.min(200, value));
                else intensity = Math.max(0, Math.min(1, value));
            },
        },
    };
}

// Folkemengde-summing live: bandpassede støy-lag med LFO; `intensity` rampes mykt.
function createCrowdMurmurLive(
    ctx: AudioContext,
    destination: AudioNode,
    opts: LiveSoundOptions,
): LiveSoundInstance {
    const master = ctx.createGain();
    const volume = opts.volume ?? 0.6;
    let intensity = Math.max(0, Math.min(1, opts.intensity ?? 0.5));
    master.gain.value = volume * intensity;
    master.connect(destination);

    const nodes: Array<{ stop: () => void }> = [];
    const layers: Array<[number, number, number]> = [
        [480, 2.0, 0.6],
        [260, 1.6, 0.4],
    ];
    for (const [freq, q, rel] of layers) {
        const src = ctx.createBufferSource();
        src.buffer = makeNoiseBuffer(ctx, 2);
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq;
        bp.Q.value = q;
        const g = ctx.createGain();
        g.gain.value = rel;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.17 + freq * 0.0002;
        const lg = ctx.createGain();
        lg.gain.value = rel * 0.3;
        lfo.connect(lg).connect(g.gain);
        src.connect(bp).connect(g).connect(master);
        src.start();
        lfo.start();
        nodes.push({
            stop: () => {
                try { src.stop(); } catch { /* allerede stoppet */ }
                try { lfo.stop(); } catch { /* allerede stoppet */ }
            },
        });
    }

    let stopped = false;
    return {
        gain: master,
        handle: {
            stop: (fadeOutSec = 0.5) => {
                if (stopped) return;
                stopped = true;
                master.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSec);
                window.setTimeout(() => {
                    for (const n of nodes) n.stop();
                    master.disconnect();
                }, fadeOutSec * 1000 + 60);
            },
            setVolume: (v) => {
                master.gain.linearRampToValueAtTime(
                    Math.max(0, Math.min(1, v)) * intensity,
                    ctx.currentTime + 0.1,
                );
            },
            setParam: (param, value) => {
                if (param !== 'intensity') return;
                intensity = Math.max(0, Math.min(1, value));
                master.gain.linearRampToValueAtTime(volume * intensity, ctx.currentTime + 0.6);
            },
        },
    };
}
