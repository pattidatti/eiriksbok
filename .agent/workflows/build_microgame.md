---
description: Lag et lett, embeddbart mikrospill som kjører inline i en artikkel eller læringssti. Bruk dette når spillet skal bo MIDT i innholdet (ikke fullskjerm), gjerne en kort 3D-scene à la Colosseum3D/Teodosianmuren.
---

# Skill: Build Micro-Game

Bruk denne skillet når du skal lage et **mikrospill** — et lett, selvstendig spill som kjører
**inline** i en artikkel eller et læringsstisteg. Et mikrospill er en quick skill-check eller en
romlig "aha"-opplevelse på 1-3 minutter, ikke en immersiv 15-minutters quest.

---

## Mikrospill vs. den tunge 3D-motoren — velg riktig spor

| | Mikrospill (dette sporet) | Full 3D-motor (`src/games/engine/`) |
|---|---|---|
| **Bor** | Inline i artikkel/sti | Egen rute `/oving/spill/:id` |
| **Stack** | React + Framer Motion, evt. R3F (`@react-three/fiber` + `drei`) | Rå Three.js + Rapier3D WASM |
| **Vekt** | Lett, lazy-lastet, Chromebook-vennlig | Tung (~1 MB WASM), fullskjerm, pointer-lock |
| **Lengde** | 1-3 min | 10-20 min |
| **Guide** | Denne fila | `.agent/workflows/BUILD_GAME_GUIDE.md` |

Skal spillet ligge midt i en artikkel? → mikrospill. Skal det være en egen verden å gå rundt i? →
full motor. **Embed aldri den tunge motoren i en artikkel.**

3D i et mikrospill = lett R3F-scene (Canvas + OrbitControls + klikkbare mesher), slik
`src/components/microgames/Colosseum3D.tsx` og `TheodosianWalls3D.tsx` gjør det. R3F rydder
WebGL-konteksten automatisk ved unmount.

---

## Design Law (arves fra interaktive komponenter)

- **Lys stil alltid.** Bruk `MicroGameFrame` som ramme (amber/lys). Ingen mørk base.
- **Én pedagogisk kjerne.** Definer lyspære-øyeblikket før du koder. Én ting eleven skal forstå.
- **Fem-sekunders-regelen.** Eleven vet hva de skal gjøre innen 5 sek. Ingen velkomstmodal.
- **Juicy feedback.** Umiddelbar respons på hvert klikk, spring-animasjon ved fullføring, tydelig
  completion-state, reset alltid tilgjengelig (`onRetry` på `MicroGameFrame`).
- **Norsk for en 14-åring.** Korte setninger. Riktige tegn (å, ø, æ). Ingen em-dash/tankestrek.
- **Unik mekanikk.** Ikke kopier et eksisterende spills mekanikk; bygg en ny, tilpasset læringsmålet.
- **Chromebook-først.** Les på ~1366×768. Gi alltid et klikkbart sidepanel/listalternativ ved siden
  av 3D-canvaset (trackpad-klikk i 3D er fiklete).

---

## Slik bygger du ett

1. **Opprett spillet:** `src/components/microgames/<Navn>.tsx`.
   - Default-eksporter en komponent som tar `MicroGameProps` (`{ onComplete, onRetry?, ... }` fra
     `./types`).
   - Eier sin egen `MicroGameFrame` internt (tittel, undertittel, `estimatedSeconds`, `onRetry`).
   - Kall `onComplete({ score, completed: true, artifact? })` når spillet er vunnet.
   - Lyd via `useStepSounds()` (`play('correct' | 'incorrect' | 'advance' | 'complete' | ...)`).

2. **Registrer i registeret:** legg en entry i `MICRO_GAMES` i
   `src/components/microgames/registry.ts` med `lazy(() => import('./<Navn>'))` (Three.js belaster
   ikke bundlen før eleven åpner spillet).

3. **Bruk i innhold** — to veier, samme registry:
   - **I en artikkel** (via `ComponentRegistry` → `MicroGameBlock`):
     ```json
     { "type": "component", "name": "MicroGame", "props": { "gameId": "<id>" } }
     ```
   - **I et læringssti-steg** (via `MicroGameStep`):
     ```json
     { "type": "microgame", "microGameId": "<id>", "microGameProps": { } }
     ```

Ingen endring i `ComponentRegistry.tsx` trengs per spill — broen `MicroGame` slår opp `gameId` i
registeret. Du registrerer kun i `registry.ts`.

---

## Sjekkliste før du er ferdig

- [ ] Lys `MicroGameFrame`-ramme, ingen mørk base
- [ ] Lyspære-øyeblikket er tydelig og oppnådd
- [ ] Fungerer med klikk i 3D **og** via sidepanel/liste (Chromebook)
- [ ] Juicy: umiddelbar respons, spring-finale, reset (`onRetry`)
- [ ] `onComplete` kalles ved seier
- [ ] Lazy-registrert i `MICRO_GAMES`
- [ ] Norsk for 14-åring, riktige tegn, ingen em-dash
- [ ] Testet inline i en ekte artikkel på ~1366×768
- [ ] `npm run build` + `npm run lint` rent

**Referanse-standard:** `src/components/microgames/TheodosianWalls3D.tsx` (3D, spørsmålsdrevet
hotspot + finale) og `Colosseum3D.tsx` (3D, sekvens).
