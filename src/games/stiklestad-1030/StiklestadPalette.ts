import type { GamePalette } from '../engine/declarative';

// ─── Stiklestad 1030 - fargepalett (Fase 8 GamePalette-referanse) ─────────────
// Sen julikveld i Trøndelag: lavt, gyllent lys, lyng og gress, jern og blod.
// Alle scene-objektfarger hentes herfra - INGEN løse hex-tall i Map/Assets.
// Dette er referanseimplementasjonen for GamePalette-konvensjonen (se §6.2).

export const PALETTE = {
    // Terreng
    grass: 0x6f8348,
    grassDry: 0x97924f,
    rock: 0x6b6560,
    rockDark: 0x4a4640,
    path: 0x7a6440,

    // Himmel/lys (skumring)
    skyDusk: 0xd9a05a,
    fog: 0xb98a5c,

    // Leir + tre
    wood: 0x5a4632,
    woodDark: 0x3e3120,
    tentCloth: 0xb8a884,
    tentDark: 0x8a7c5c,

    // Ild
    emberCore: 0xff5522,
    flame: 0xff7a2a,
    glow: 0xffb05a,

    // Kongens merke (banner)
    bannerRed: 0x8e2018,
    bannerGold: 0xd4a017,

    // Folk og jern
    hirdBlue: 0x2f3d52,
    bondeBrown: 0x6a4a30,
    skin: 0xd8b48c,
    iron: 0x9aa0a6,
    ironDark: 0x4c5054,

    // Blod og fallne
    blood: 0x7a1f1f,
    bloodDark: 0x4a1212,

    // Etterspill / helgenlys
    holyLight: 0xfff0c0,
} satisfies GamePalette;
