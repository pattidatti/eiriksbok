// Type-sikre DSL-hjelpere for mini-spill.
//
// Filosofien: legg til TypeScript-garanter der runtime-validering ikke strekker
// til. Flagg-navn, quest-IDer, phase-navn osv. er strenger - og strenger
// typo-er enkelt. Disse hjelperne gir narrow typing slik at kompilatoren
// fanger navnefeil.
//
// Se BUILD_GAME_GUIDE.md §10 for bruk.

export { defineFlags, flagValues } from './defineFlags';
export type { FlagMap, FlagValue } from './defineFlags';
