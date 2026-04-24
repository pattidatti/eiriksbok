// Type-sikker flagg-definisjon.
//
// Problem: GameEngine.setFlag / getFlag tar string-nøkler. En typo kompilerer OK,
// men dialog-conditions (`flagsRequired: ['drakk-gigt']` i stedet for `'drakk-gift'`)
// vil aldri matche, og feilen oppdages kun via playtest - ofte timer senere.
//
// Løsning: definér flaggene som en const-map. TypeScript vet da hvilke strenger
// som er gyldige, og IDE-autocomplete + kompilator fanger typos.
//
// Eksempel:
//   // WattLabFlags.ts
//   export const WATT_FLAGS = defineFlags({
//       HAS_CYLINDER: 'watt-has-cylinder',
//       HAS_VALVE:    'watt-has-valve',
//       ENGINE_BUILT: 'watt-engine-built',
//   });
//   export type WattFlag = FlagValue<typeof WATT_FLAGS>;
//
//   // I bruk:
//   engine.setFlag(WATT_FLAGS.HAS_CYLINDER, true);   // ✓ typo-trygt
//   engine.getFlag(WATT_FLAGS.HAS_VALVE);            // ✓
//   engine.setFlag(WATT_FLAGS.HAS_CYLNDER, true);    // ✗ compile-error
//
// Runtime-sjekker:
//   - Duplikate flagg-verdier throw-er (forhindrer at to nøkler peker på samme flagg).
//   - Tom definisjon throw-er (meningsløst å kalle defineFlags({})).

export type FlagMap = Record<string, string>;

/**
 * Type-hjelper: gir unionstypen av alle flagg-verdier i en map.
 * `FlagValue<typeof WATT_FLAGS>` = `'watt-has-cylinder' | 'watt-has-valve' | ...`.
 */
export type FlagValue<T extends FlagMap> = T[keyof T];

/**
 * Definer en const-map av flagg-navn. Returnerer en frozen-kopi med narrow typing
 * (alle verdier blir literal types takket være `const` type-parameter).
 *
 * @throws hvis to nøkler har samme flagg-verdi, eller hvis map-en er tom.
 */
export function defineFlags<const T extends FlagMap>(flags: T): Readonly<T> {
    const keys = Object.keys(flags);
    if (keys.length === 0) {
        throw new Error('[defineFlags] Minst ett flagg må defineres.');
    }

    // Duplikat-sjekk: to nøkler som peker på samme flagg-navn er nesten alltid
    // en bug (f.eks. copy-paste-feil). Bedre å throw-e tidlig.
    const seen = new Map<string, string>();
    for (const k of keys) {
        const v = flags[k];
        if (typeof v !== 'string' || v.length === 0) {
            throw new Error(`[defineFlags] Verdien for '${k}' må være en ikke-tom streng. Fikk: ${JSON.stringify(v)}`);
        }
        const prev = seen.get(v);
        if (prev) {
            throw new Error(
                `[defineFlags] Duplikat flagg-verdi '${v}' brukes av både '${prev}' og '${k}'. ` +
                `Hvert flagg må ha unik streng-verdi.`
            );
        }
        seen.set(v, k);
    }

    return Object.freeze({ ...flags }) as Readonly<T>;
}

/**
 * Hent array av alle flagg-verdier fra en flagg-map. Nyttig for å passere til
 * validatorer eller logging.
 */
export function flagValues<T extends FlagMap>(flags: T): FlagValue<T>[] {
    return Object.values(flags) as FlagValue<T>[];
}
