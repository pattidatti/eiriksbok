// Declarative high-level builder API for mini-games.
//
// Bruk: importer builders og presets direkte:
//
//   import { buildRoom, addProp, addPickup, addNPC } from '@/games/engine/declarative';
//
// Se README.md i denne mappen for API-oversikt og eksempler.

export * from './types';
export * from './builders';

// Preset-utils er også re-eksportert for brukere som vil introspektere eller
// registrere egne audio-URLer.
export {
    MATERIAL_PRESETS,
    AUDIO_PRESETS,
    isValidMaterialPreset,
    isValidLightingPreset,
    isValidModelPreset,
    isValidAudioPreset,
    isValidParticlePreset,
} from './presets';
