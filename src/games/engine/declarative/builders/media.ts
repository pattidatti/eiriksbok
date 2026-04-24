import type { GameEngineRef } from '../../types';
import type { AddAmbientAudioConfig, AddParticleConfig, BuildResult } from '../types';
import { getAudioUrl, isValidAudioPreset, createParticle } from '../presets';
import { applyTransform } from './_util';

/**
 * Legg til ambient bakgrunnslyd. Hvis audio-preset ikke har registrert URL,
 * blir dette en stille no-op (ikke feil).
 */
export function addAmbientAudio(
    engine: GameEngineRef,
    config: AddAmbientAudioConfig
): void {
    let url: string | null = null;
    if (typeof config.audio === 'string') {
        if (!isValidAudioPreset(config.audio)) {
            throw new Error(`[addAmbientAudio] Ukjent audio-preset: '${config.audio}'.`);
        }
        url = getAudioUrl(config.audio);
    } else {
        url = config.audio.url;
    }
    if (!url) {
        // Stille fallback - preset har ikke registrert fil ennå
        return;
    }

    const trigger = config.trigger ?? 'onStart';
    const play = () => {
        engine.playAmbient(url!, {
            loop: config.loop !== false,
            volume: config.volume ?? 0.5,
            fadeIn: 1.0,
        });
    };

    if (trigger === 'onStart') {
        // playAmbient krever typisk resumeAudio() etter brukergesture - motoren
        // håndterer dette via sin interne audio-kø ved startGame.
        play();
    } else if ('flag' in trigger) {
        const flag = trigger.flag;
        let fired = false;
        engine.registerUpdate(() => {
            if (fired) return;
            if (engine.getFlag(flag)) { fired = true; play(); }
        });
    } else if ('phase' in trigger) {
        const phase = trigger.phase;
        let fired = false;
        engine.registerUpdate(() => {
            if (fired) return;
            if (engine.getPhase() === phase) { fired = true; play(); }
        });
    }
}

/** Legg til et partikkel-system på en posisjon. */
export function addParticle(
    engine: GameEngineRef,
    config: AddParticleConfig
): BuildResult {
    const result = createParticle(config.preset, config.scale ?? 1);
    applyTransform(result.group, config.pos);
    result.group.userData.declarativeId = config.id;
    engine.scene.add(result.group);
    engine.registerUpdate(result.update);
    return { group: result.group };
}
