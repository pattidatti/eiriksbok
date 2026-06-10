import type { AudioPresetName } from '../types';

// Audio-presets: mapper preset-navn til URL. Alle lyder syntetiseres prosedyralt
// via `proc:`-skjemaet (se engine/systems/ProceduralAudio.ts) - prosjektet har
// ingen lydfiler. En preset kan når som helst byttes til en ekte fil-URL
// (relativt til public/) uten endringer i call-sites. Verdi `null` = stille no-op.

export const AUDIO_PRESETS: Record<AudioPresetName, string | null> = {
    'pickup-tool':    'proc:blip-pickup?base=440',
    'pickup-paper':   'proc:blip-pickup?base=660&gain=0.3',
    'puzzle-win':     'proc:chime-success',
    'puzzle-fail':    'proc:buzz-fail',
    'dialog-open':    'proc:blip-pickup?base=330&gain=0.2',
    'door-open':      'proc:drum-hit?freq=70&gain=0.3',
    'door-locked':    'proc:buzz-fail?gain=0.2',
    'footstep-wood':  'proc:footstep?cutoff=600',
    'footstep-stone': 'proc:footstep?cutoff=1100',
    'fire-crackle':   'proc:fire-crackle',
    'wind-indoor':    'proc:wind?gain=0.25&freq=300',
    'chains-rattle':  'proc:rattle',
    'water-drip':     'proc:drip',
    'rain':           'proc:rain',
    'wind-outdoor':   'proc:wind',
    'crowd-murmur':   'proc:crowd-murmur',
    'thunder':        'proc:thunder',
    'drum-hit':       'proc:drum-hit',
    'shutter-click':  'proc:shutter-click',
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
