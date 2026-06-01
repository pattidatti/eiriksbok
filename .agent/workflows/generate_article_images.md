---
description: Generer hero-bilde og inline-bilder for artikler som mangler bilder (placeholder.webp eller manglende bildefiler)
---

# Bildegenerering for Eiriksbok-artikler

Kjør denne workflowen når du vil generere bilder for nye artikler som mangler bilder. Workflowen scanner repoet for plassholdere og brutte bildereferanser, skriver detaljerte Gemini-prompts basert på artikkelinnhold og stil, genererer bilder, og commiter resultatet.

---

## Steg 1: Skann etter artikler som mangler bilder

**Kjør alltid begge fasene og behandle resultatene i denne rekkefølgen: Fase B først, deretter Fase A.** Brutte referanser er mer kritiske — de vises som ødelagte bilder i appen — mens plassholdere bare er generiske. Behandler du Fase A først risikerer du å bruke opp kvoten uten å fikse de synlig ødelagte bildene.

### Fase B: Brutte bildereferanser (ekte sti i JSON, men fil mangler på disk) — KJØres FØRST

```bash
python3 -c "
import os, json, glob

broken = {}
for f in sorted(glob.glob('public/content/**/*.json', recursive=True)):
    try:
        data = json.load(open(f))
    except:
        continue

    def find_images(obj, paths=[]):
        if isinstance(obj, str) and obj.startswith('/images/') and 'placeholder' not in obj:
            paths.append(obj)
        elif isinstance(obj, dict):
            for v in obj.values(): find_images(v, paths)
        elif isinstance(obj, list):
            for item in obj: find_images(item, paths)
        return paths

    paths = find_images(data, [])
    missing = [p for p in set(paths) if not os.path.exists('public' + p)]
    if missing:
        broken[f] = missing

for f, imgs in sorted(broken.items()):
    print(f)
    for img in imgs: print('  ', img)
"
```

Merk: skriptet scanner **alle** JSON-filer, inkludert scenarier og andre filer uten `content`-array. Dette er bevisst — scenarier kan også ha manglende bildereferanser.

### Fase A: Plassholdere (placeholder.webp) — kjøres ETTER Fase B

```bash
grep -rl "placeholder.webp" public/content/ --include="*.json" | sort
```

For hver treff, noter filsti og om det er `heroImage`, inline `"type": "image"`-blokker, eller begge.

Filtrer bort ikke-artikler (manifest.json, global-timeline-images.json osv.) ved å sjekke at filen har et `id`-felt og enten `"content": [...]` eller `"nodes": [...]` (scenarier).

### Viktig: to ulike kjøringsmønstre

| Tilfelle | JSON-tilstand | Handling |
|----------|--------------|----------|
| **Brukket referanse** | `heroImage: "/images/topic/fil-hero.webp"` (fil finnes ikke) | Generer bilde → **lagre til stien som allerede er i JSON** — ingen JSON-endring |
| **Placeholder** | `heroImage: "/images/placeholder.webp"` | Generer bilde → **oppdater** JSON til ny sti + manifest |

For brutte referanser er filnavnet allerede kjent fra JSON-en. Lagre generert bilde direkte til den eksisterende stien, og oppdater verken artikkel-JSON eller manifest.

---

## Steg 2: Les og analyser artikkelen

For hver artikkel (både Fase B og Fase A): les hele JSON-filen og trekk ut:

- `id`, `title`, `year`, `category`, `subjectId` (fra filstien)
- De tre første tekst-blokkene (kontekst for hero-bildet)
- For inline `"type": "image"`-blokker: tekst-blokkene **rett før og etter** blokken (kontekst for hva bildet skal vise)

---

## Steg 3: Velg bildestil

Velg stil basert på fag og innhold. Ikke alltid cinematisk foto - velg det som gir best pedagogisk verdi:

| Fag / Kontekst | Anbefalt stil |
|---|---|
| Historie - krig, politikk, reise | Cinematisk fotorealisme |
| Historie - hverdagsliv, handel | Cinematisk fotorealisme med varmt lys |
| KRLE - religion, ritualer | Høykvalitets dokumentarfotografi eller kunstnerisk representasjon |
| KRLE - filosofi, etikk | Stilisert portrett eller konseptuelt bilde |
| Samfunnsfag - institusjoner, demokrati | Editorial/dokumentarfotografi |
| Musikk - instrumenter, fremføring | Nærbilde med bokeh, varm belysning |
| Norsk - litteratur, forfattere | Portrett eller bokstavelig scene fra teksten |

---

## Steg 4: Skriv bildeprompts

### Mal for hero-bilde (cinematisk standard):

```
A highly realistic 4K cinematic photograph of [konkret scene/motiv fra artikkelens åpning],
[tidsepoke med spesifikke detaljer, f.eks. "late 9th-century Scandinavia"].
[Lyssetting: morgenlys/kveldsglød/stearinlys/diffust dagslys].
[Kameravinkel: eye level / high angle / foreground+background-komposisjon].
[2-3 spesifikke historiske detaljer: klær, arkitektur, gjenstander].
16:9 ratio. No text, no watermarks.
```

### Mal for inline-bilder:

Samme struktur, men motiv er hentet fra konteksten rundt bildeplasseringen i artikkelen. Inline-bilder skal vise et **annet aspekt** av emnet enn hero-bildet - unngå repetisjon.

### Regler for gode prompts:

- Aldri generiske fraser som "ancient times" eller "long ago" - alltid spesifikt tidsrom
- Aldri "an AI image of..." - beskriv motivet direkte
- Spesifiser alltid et konkret motiv (person, scene, gjenstand) - ikke abstrakt konsept
- Unngå tekst og symboler i bildet med "No text, no watermarks, no anachronisms"
- For KRLE-bilder: "respectful, dignified representation" der det gjelder religiøse motiver

---

## Steg 5: Generer bilder med Gemini

Generer hvert bilde via Gemini Imagen. Bruk prompten fra Steg 4.

Filnavngivning:
- Hero-bilde: `public/images/[topic]/[lesson-id]-hero.webp`
- Inline-bilde 1: `public/images/[topic]/[lesson-id]-01.webp`
- Inline-bilde 2: `public/images/[topic]/[lesson-id]-02.webp`
- Inline-bilde 3: `public/images/[topic]/[lesson-id]-03.webp`

Eksempel for artikkelen `public/content/historie/vikingtiden/rikssamlingen.json`:
- `public/images/vikingtiden/rikssamlingen-hero.webp`
- `public/images/vikingtiden/rikssamlingen-01.webp`

Lagre genererte bilder i riktig WebP-format, maks 1600px bredde for inline, 1600px for hero.

---

## Steg 6: Oppdater artikkel-JSON og manifest.json

**Bare for placeholder-tilfeller (Fase A fra Steg 1).** For brutte referanser (Fase B) er stien allerede riktig i JSON — hopp over dette steget for dem.

For hvert bilde generert fra en placeholder, oppdater JSON-filen:

**Hero-bilde** - bytt ut i toppnivå-feltet i selve artikkelen (`public/content/[sti].json`):
```json
"heroImage": "/images/vikingtiden/rikssamlingen-hero.webp"
```

**Kortet i manifest.json** - Hero-bildet brukes også på artikkel-kortet! Finn artikkelen din i `public/content/manifest.json` og oppdater `image`-feltet der til samme path som hero-bildet.

**Inline-bilder** - bytt ut `src` i den aktuelle blokken i artikkel-JSON. Behold `alt` og `caption` som de er.

Verifiser at JSON fortsatt er gyldig etter endringene:
```bash
python3 -c "import json; json.load(open('public/content/[sti].json')); print('OK')"
python3 -c "import json; json.load(open('public/content/manifest.json')); print('OK')"
```

---

## Steg 7: Commit direkte til main

```bash
git config user.email "pattidatti@gmail.com"
git config user.name "Eiriksbok Image Agent"

DATO=$(date +%Y%m%d)

# Sørg for at vi er på main
git checkout main
git pull

# Legg til bilder og oppdaterte JSONer
git add public/images/
git add public/content/

git commit -m "bilder: legg til genererte artikkelbilder (${DATO})"
git push origin main
```

---

## Kjøringsmønster

Workflowen er designet for **ukentlig kjøring** etter at den daglige innholdsrutinen har produsert nye artikler gjennom uken. Kjør den manuelt i Antigravity når du vil ta et batch med bilder.

Har du ingen treff fra verken Fase B eller Fase A er det ingenting å gjøre — avslutt.

**Kvotehåndtering:** Hvis bildegenererings-API-et returnerer en kvote-feil, stopp umiddelbart og commit det som er generert så langt. **Ikke reset stier tilbake til `placeholder.webp`.** La de ubehandlede artiklene beholde sine spesifikke stier — neste kjøring vil plukke dem opp via Fase B. Å resette til placeholder er kontraproduktivt fordi det skjuler Fase B-oppgavene og fører til gjentatt omprioritering.
