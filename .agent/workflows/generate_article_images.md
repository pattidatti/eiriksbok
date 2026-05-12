---
description: Generer hero-bilde og inline-bilder for artikler som mangler bilder (placeholder.webp)
---

# Bildegenerering for Eiriksbok-artikler

Kjør denne workflowen når du vil generere bilder for nye artikler som mangler bilder. Workflowen scanner repoet for plassholdere, skriver detaljerte Gemini-prompts basert på artikkelinnhold og stil, genererer bilder, og commiter resultatet.

---

## Steg 1: Skann etter artikler som mangler bilder

Finn alle artikkel-JSONer med `placeholder.webp`:

```bash
grep -rl "placeholder.webp" public/content/ --include="*.json" | sort
```

For hver treff, noter:
- Filsti (f.eks. `public/content/historie/vikingtiden/rikssamlingen.json`)
- Om det er `heroImage`-feltet, inline `"type": "image"`-blokker, eller begge deler

Filtrer bort ikke-artikler (scenarios, learning paths, kompetansemaal osv.) ved å sjekke at filen har `"content": [...]`.

---

## Steg 2: Les og analyser artikkelen

For hver artikkel med plassholdere: les hele JSON-filen og trekk ut:

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

## Steg 6: Oppdater artikkel-JSON

For hvert generert bilde, oppdater JSON-filen:

**Hero-bilde** - bytt ut i toppnivå-feltet:
```json
"heroImage": "/images/vikingtiden/rikssamlingen-hero.webp"
```

**Inline-bilder** - bytt ut `src` i den aktuelle blokken. Behold `alt` og `caption` som de er.

Verifiser at JSON fortsatt er gyldig etter endringene:
```bash
python3 -c "import json; json.load(open('public/content/[sti].json')); print('OK')"
```

---

## Steg 7: Commit og PR

```bash
git config user.email "pattidatti@gmail.com"
git config user.name "Eiriksbok Image Agent"

DATO=$(date +%Y%m%d)
git checkout -b "auto-images/batch-${DATO}"

# Legg til bilder og oppdaterte JSONer
git add public/images/
git add public/content/

git commit -m "bilder: legg til genererte artikkelbilder (${DATO})"
git push origin HEAD

gh pr create \
  --title "Bilder: batch $(date +%Y-%m-%d)" \
  --body "## Automatisk bildegenerering

Generert hero-bilde og inline-bilder for artikler med placeholder.webp.

### Behandlede artikler
[list: tittel — antall bilder generert]

### Genererte filer
[list: filstier]

### Merk
Kontroller bildekvaliteten visuelt før merge. Trykk på bildene i PR-fildifferansen for forhåndsvisning." \
  --repo pattidatti/eiriksbok
```

---

## Kjøringsmønster

Workflowen er designet for **ukentlig kjøring** etter at den daglige innholdsrutinen har produsert nye artikler gjennom uken. Kjør den manuelt i Antigravity når du vil ta et batch med bilder.

Har du ingen artikler med `placeholder.webp` er det ingenting å gjøre - avslutt.
