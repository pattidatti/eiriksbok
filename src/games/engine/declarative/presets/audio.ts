import type { AudioPresetName } from '../types';

// Audio-presets: mapper preset-navn til URL. Verdi `null` = ingen lyd registrert
// for dette presetet ennå (stille fallback - IKKE feil). AI-agenter kan trygt bruke
// en preset selv om lydfilen ikke eksisterer; builder logger en stille warning
// og hopper over avspilling.
//
// Når en ny lyd legges til public/sounds/sfx/, oppdater denne tabellen.

export const AUDIO_PRESETS: Record<AudioPresetName, string | null> = {
    'pickup-tool':    null,
    'pickup-paper':   null,
    'puzzle-win':     null,
    'puzzle-fail':    null,
    'dialog-open':    null,
    'door-open':      null,
    'door-locked':    null,
    'footstep-wood':  null,
    'footstep-stone': null,
    'fire-crackle':   null,
    'wind-indoor':    null,
    'chains-rattle':  null,
    'water-drip':     null,
};

/** Returner URL for et preset, eller null hvis ikke registrert. */
export function getAudioUrl(preset: AudioPresetName): string | null {
    if (!(preset in AUDIO_PRESETS)) {
        throw new Error(`[declarative] Ukjent audio-preset: '${preset}'. Gyldige: ${Object.keys(AUDIO_PRESETS).join(', ')}`);
    }
    return AUDIO_PRESETS[preset];
}

export function isValidAudioPreset(name: string): name is AudioPresetName {
    return name in AUDIO_PRESETS;
}
