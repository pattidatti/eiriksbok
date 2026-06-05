# eksamen-norsk

3D-mini-spill: **Muntlig eksamen i norsk**. Eleven spiller en avgangselev som
kommer opp til muntlig eksamen med temaet "Framgang og motgang": hvordan framgang
framstilles ulikt gjennom litteraturhistorien (Askeladden, Karens jul og Sult, tre
epoker).

- **URL:** `/oving/spill/eksamen-norsk`
- **Blueprint:** `docs/Design documents/minigames/eksamen-norsk-blueprint.md`
- **Type:** dialog-drevet quest-rom (samme arkitektur som `eksamen-samfunnsfag`/`caesar-ides`).
- **Faglig grunnlag:** modellsvaret i `/norsk/eksamen/muntlig-modell` og guiden `/norsk/eksamen/muntlig`.

## Filer
- `EksamenNorskConfig.ts` - `GameConfig` + dynamisk `endText` (karakter 2-6 ut fra flagg).
- `EksamenNorskAssets.ts` - `setupScene`: klasserom (buildRoom), tre soner, møbler, NPCer, og all dialog-wiring.
- `EksamenNorskDialogs.ts` - dialog-trær for lærer (trekk fag), faglærer (presentasjon) og sensor (fagsamtale).
- `EksamenNorskFlags.ts` - typesikre flagg (`defineFlags`).

## Tre dager (faser)
1. `trekke-fag` (Sone A, klasserom) - trekk faget hos læreren; du får norsk + temaet framgang og motgang.
2. `trekke-oppgave` (Sone B, forberedelsesrom) - les oppgaven og forbered deg på fire valgfrie stasjoner:
   velg tekster, skriv en skarp påstand, lag tankekart/epokekobling, forbered baklomme-tekster. Skriv så
   stikkordlapp (åpner døra til eksamen).
3. `framfore` (Sone C, eksamensrom) - hils på faglæreren, hold presentasjonen (åpning, struktur, rød tråd,
   sitater/virkemiddel, avslutning), og svar på fire spørsmål fra sensor (forståelse -> virkemiddel ->
   drøfting -> bredde, der det siste kobler temaet til vår egen tid, utenfor presentasjonen).

## Prep-gating (kjernesløyfe)
Det du forbereder i Sone B låser opp de sterke grepene i Sone C:
- `HAR_PAASTAND` -> `APNET_TESE` (skarp åpning) og `SIRKLET_TILBAKE` (helhetlig avslutning)
- `HAR_EPOKEKOBLING` -> `KOBLET_EPOKE` (analyse + historisk kontekst)
- `HAR_TEKSTER` -> `BRUKTE_SITATER` (presise sitater + navngitt virkemiddel)
- `HAR_BAKLOMME` -> tryggere svar på sensors breddespørsmål (Q4)

Uten forberedelse leser resultatnodene fallback-varianten ("du prøver, men det blir vagt"). Slik kan eleven
ikke fake en påstand, epokekobling eller et sitat som aldri ble forberedt.

## Wiring-merknad
Flagg settes via `choice.action` (fyrer ved valg, også midt i samtalen). `node.onEnd`
brukes kun for fase-overganger ved samtaleslutt (`next: null`). Se `wireChoice`/`wireDialogEnd`
i Assets. Presentasjonen har to mulige avslutningsnoder (`pres_avslutning_tilbake` /
`pres_avslutning_takk`); begge wires til samme `onPresentasjonFerdig`.

## Mangler / TODO
- Thumbnail (`config.thumbnail` er tom string). Generér et 16:9-bilde av et klasserom rigget
  for muntlig eksamen i norsk via `/bilde` og legg stien inn i Config.
