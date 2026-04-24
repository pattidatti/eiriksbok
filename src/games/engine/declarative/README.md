# Declarative Builder API

Høy-nivå deklarativ API for mini-spill. Erstatter direkte Three.js-kode med navngitte `add*` / `build*`-funksjoner som gjemmer alle standard-feilene (shadow-flagg, fysikk-registrering, interactable-wiring, rekkefølge).

## Hvorfor

AI-agenter (og mennesker) gjør feil når de skriver imperative Three.js-koden. Typiske feil:
- Glemmer `userData.solid = true` → spiller faller gjennom gulvet
- Glemmer `castShadow = true` → flatt visuelt uttrykk
- Glemmer å `registerPickup` → gjenstand er død visuell
- Glemmer damping → dynamiske objekter ruller evig
- Dialog-variants i feil rekkefølge → aldri nådd

Builders gjør disse tingene automatisk. Det AI-en aldri skriver, kan den ikke gjøre feil i.

## Bruk

```ts
import {
    buildRoom, addProp, addPickup, addNPC, addMonolog, addAmbientAudio
} from '@/games/engine/declarative';

const setupScene = (engine: GameEngineRef) => {
    buildRoom(engine, {
        id: 'cell',
        size: [8, 4, 8],
        floor: 'stone',
        walls: 'stone',
        ceiling: 'stone',
        lights: 'prison-cell',
        doors: [{ wall: 'north', offset: 0, openFlag: 'door_unlocked' }],
        windows: [{ wall: 'east', offset: 0 }],
    });

    addProp(engine, {
        id: 'bench',
        model: 'bench',
        pos: [0, 0, -2],
    });

    addPickup(engine, {
        id: 'cup',
        itemId: 'poison-cup',
        model: 'cup',
        pos: [-2, 1.0, 0],
    });

    addNPC(engine, {
        id: 'sokrates',
        name: 'Sokrates',
        characterType: 'monk',
        pos: [0, 0, -2.3],
        dialogs: { /* ... */ },
        questMarker: true,
    });
};
```

## Designprinsipper

1. **Alle defaults er sane**: `castShadow=true`, `receiveShadow=true`, `solid=true` (statisk), `linearDamping=0.3` (dynamisk). AI trenger aldri å skrive disse.
2. **Auto-registrering**: `addPickup` wirer inventory + interactable + audio i én call.
3. **Validering ved konstruksjon**: ugyldige verdier kaster feilmelding umiddelbart (ikke silent fail).
4. **Ingen rekkefølge-sensitivitet**: kall builders i hvilken rekkefølge som helst fra `setupScene`.
5. **Escape hatch**: `addRawMesh` finnes for edge-cases, men hovedpath går gjennom builders.

## Builder-oversikt

| Builder | Bruk |
|---|---|
| `buildRoom` | Lukket rom med vegger/gulv/tak/lys + valgfrie dører/vinduer |
| `buildOutdoor` | Utendørs-scene med bakke, sky, grense |
| `addProp` | Dekor / struktur (bord, stol, tønner, ...) - statisk eller dynamisk |
| `addPickup` | Gjenstand spilleren kan plukke opp (auto-wires inventar) |
| `addPuzzleSlot` | Plass der items kan plasseres (auto-wires interact + callback) |
| `addInteractable` | E-key-trigger på et objekt |
| `addDoor` | Standalone dør-objekt med lås-/åpne-logikk |
| `addNPC` | Karakter med dialog, emosjon, quest-marker |
| `addMonolog` | Indre monolog med trigger (proximity/phase/flag/manual) |
| `addAmbientAudio` | Bakgrunnslyd (ambient eller spatial) |
| `addParticle` | Partikkel-effekt (damp, røyk, støv, ...) |
| `addRawMesh` | **Escape hatch**. Brukes kun for ting som ikke kan uttrykkes deklarativt. |

## Preset-kataloger

Se `presets/`:
- `materials.ts` - `wood`, `brick`, `stone`, `iron`, `marble`, ...
- `lighting.ts` - `warm-interior`, `prison-cell`, `outdoor-day`, ...
- `models.ts` - `bench`, `cup`, `amphora`, `door`, `candle`, ...
- `audio.ts` - `pickup-tool`, `door-open`, `footstep-stone`, ...
- `particles.ts` - `steam`, `dust`, `torch-flame`, ...

## Validering

Builders kaster feil ved konstruksjon hvis:
- `addPickup.itemId` ikke er i `GameConfig.items`
- `addNPC.characterType` er ugyldig
- `addProp.model` er ukjent preset
- `addDoor.lockedUntilFlag` refererer et flagg som ikke settes noen steder (advarsel, ikke feil)

## Referansespill

`src/games/blueprint-quest/` - den kanoniske blueprint-implementasjonen. Kopier denne mappen for å starte et nytt spill.
