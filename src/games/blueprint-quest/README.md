# Blueprint Quest - Sokrates i fengselet

Dette er **referanse-implementasjonen** for mini-spill i Eiriksbok. Bruk den som mal når du lager et nytt spill.

## Hva spillet demonstrerer

- Deklarativ scene-bygging (`buildRoom`, `addProp`)
- Pickup-items koblet til inventar (`addPickup`)
- Puzzle-slots som aksepterer items og trigger callback (`addPuzzleSlot`)
- NPCer med dialog og emosjon (`addNPC`)
- Per-NPC-dialog-konvensjon (`{npcId}_greeting`)
- Indre monolog med proximity-trigger (`addMonolog`)
- Ambient audio (`addAmbientAudio`)
- Variabel slutt basert på flagg (`endText: (engine) => ...`)
- Fase-progresjon og flagg-basert dør-åpning

## Struktur

```
blueprint-quest/
├── BlueprintQuestConfig.ts   # GameConfig - items, quests, endText, metadata
├── BlueprintQuestAssets.ts   # setupScene - kun deklarative builder-kall
└── README.md                 # denne filen
```

> **Mellomstore/store spill:** Når dialog-innholdet passerer ~100 linjer, eller du har 3+ NPCer med lange dialoger, splitt ut til separate filer:
>
> ```
> ditt-spill/
> ├── DittSpillConfig.ts      # metadata, items, quests, endText
> ├── DittSpillAssets.ts      # setupScene
> ├── DittSpillDialogs.ts     # export const dittSpillDialogs: Record<string, DialogNode | DialogNode[]>
> ├── DittSpillMonologs.ts    # export const dittSpillMonologs (+ triggers)
> └── DittSpillFlags.ts       # valgfritt: defineFlags({...}) for typed flag-navn
> ```
>
> Eksempler: `src/games/lindisfarne-793/`, `src/games/ford-factory/`.
>
> Se `.agent/workflows/BUILD_GAME_GUIDE.md` §5.1 for full filkonvensjon.

## Kopier for nytt spill

1. Kopier hele `blueprint-quest/`-mappen til `src/games/ditt-nye-spill/`
2. Rename filnavn og eksport: `DittNyeSpillConfig`, `DittNyeSpillAssets`, `setupDittNyeSpillScene`
3. Endre:
   - `id`, `title`, `subtitle`, `subject`, `description`, `thumbnail` i Config
   - `items` (hva spilleren kan bære)
   - `quests` (fase + objective-tekst)
   - `endText` (slutt-tekst-funksjon)
   - `setupScene` (bygg rom, props, NPCer, monologer)
4. Registrer i `src/pages/MiniGamesPage.tsx` (`HISTORICAL_GAMES`) og `src/pages/GamePage.tsx` (`GAME_REGISTRY`)
5. `npm run dev` og test

## Kvalitetskrav

Blueprint-spillet skal alltid passere:

- **0 validering-warnings** i konsollen ved `npm run dev`
- **0 raw Three.js** i `*Assets.ts` (ingen `new THREE.Mesh`, `new THREE.Group`, `scene.add`)
- **Null-sikkert**: ingen `!`-assertions eller ukvalifiserte `engine.get*()`-kall
- **Norsk språk**: konsekvent å/ø/æ, direkte setninger, 14-årings vokabular

Hvis du gjør endringer i blueprint-spillet, kjør checklist i `.agent/workflows/BUILD_GAME_GUIDE.md` før commit.
