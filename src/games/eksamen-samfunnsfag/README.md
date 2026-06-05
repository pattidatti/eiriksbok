# eksamen-samfunnsfag

3D-mini-spill: **Muntlig eksamen i samfunnsfag**. Eleven spiller en avgangselev som
kommer opp til muntlig eksamen med temaet "Makt og styringsformer" (Roma og Weimar:
hvordan et folkestyre blir ettmannsstyre).

- **URL:** `/oving/spill/eksamen-samfunnsfag`
- **Blueprint:** `docs/Design documents/minigames/eksamen-samfunnsfag-blueprint.md`
- **Type:** dialog-drevet quest-rom (samme arkitektur som `caesar-ides`).

## Filer
- `EksamenSamfunnsfagConfig.ts` - `GameConfig` + dynamisk `endText` (karakter 2-6 ut fra flagg).
- `EksamenSamfunnsfagAssets.ts` - `setupScene`: klasserom (buildRoom), møbler, to NPCer, og all dialog-wiring.
- `EksamenSamfunnsfagDialogs.ts` - dialog-trær for faglærer (presentasjon) og sensor (fagsamtale).
- `EksamenSamfunnsfagFlags.ts` - typesikre flagg (`defineFlags`).

## Faser
1. `ankomst` - hils på faglæreren ved kateteret.
2. `presentasjon` - bygg presentasjonen: åpning (problemstilling vs manus), sammenligning
   Roma/Weimar, kjernepoeng (makt tatt innenfra/lovlig), og virkemiddel (etos/patos/logos).
3. `fagsamtale` - sensor stiller fire spørsmål (fakta -> forståelse -> drøfting -> bredde),
   der det siste ligger utenfor presentasjonen (dagens norske demokrati).

## Wiring-merknad
Flagg settes via `choice.action` (fyrer ved valg, også midt i samtalen). `node.onEnd`
brukes kun for fase-overganger ved samtaleslutt (`next: null`). Se `wireChoice`/`wireDialogEnd`
i Assets.

## Mangler / TODO
- Thumbnail (`config.thumbnail` er tom string). Generér et 16:9-bilde av et klasserom rigget
  for eksamen via `/bilde` og legg stien inn i Config.
