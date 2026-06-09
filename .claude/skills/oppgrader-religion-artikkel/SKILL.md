---
name: oppgrader-religion-artikkel
description: Finn og oppgrader én placeholder-religionsartikkel i KRLE verdensreligioner til plan_article-standard (signaturkomponent + 3D-mikrospill + rikt innhold). Scanner public/content/krle/religion/, identifiserer artikler som mangler interaktive komponenter, lar brukeren velge blant 4 kandidater fra ulike religioner, og kjører /plan_article automatisk på den valgte. Valgfritt argument: religion-navn for å begrense søket (f.eks. "islam", "buddhisme").
---

# Oppgrader Religionsartikkel

Workflow for å systematisk løfte placeholder-artikler i KRLE verdensreligioner til
full plan_article-standard. Kjøres én artikkel om gangen.

## Steg 1: Skann placeholder-artikler

Kjør dette Python-skriptet for å identifisere kandidater:

```bash
python3 << 'EOF'
import json, os, sys

ARGS = sys.argv[1:] if len(sys.argv) > 1 else []
FILTER_RELIGION = ARGS[0].lower() if ARGS else None

SIG_IGNORE = {'Quiz', 'FactBox', 'QuoteBlock', 'TimelineComponent', 'MicroGame',
              'Gallery', 'MapCarousel', 'LinkButton', 'Comparison', 'WritingFix'}

base = 'public/content/krle/religion/'
results = []

for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith('.json'):
            continue
        path = os.path.join(root, f)
        try:
            with open(path) as fp:
                d = json.load(fp)
            if not isinstance(d, dict) or 'content' not in d:
                continue
            religion = d.get('religion', path.split(os.sep)[3] if len(path.split(os.sep)) > 3 else '?')
            if FILTER_RELIGION and religion.lower() != FILTER_RELIGION:
                continue
            content = d.get('content', [])
            has_sig = any(
                b.get('type') == 'component' and b.get('name') not in SIG_IGNORE
                for b in content
            )
            has_micro = any(
                b.get('type') == 'component' and b.get('name') == 'MicroGame'
                for b in content
            )
            if has_sig and has_micro:
                continue  # Ferdigstilt - hopp over
            score = (3 if not has_sig else 0) + (2 if not has_micro else 0) + max(0, 20 - len(content))
            article_id = d.get('id', f.replace('.json', ''))
            title = d.get('title', article_id)
            results.append({
                'path': path,
                'religion': religion,
                'title': title,
                'id': article_id,
                'blocks': len(content),
                'has_sig': has_sig,
                'has_micro': has_micro,
                'score': score,
            })
        except Exception:
            pass

# Prioriter: intro/sentrale-trekk per religion over andre
PRIORITY_KEYWORDS = ['intro', 'sentrale', 'introduksjon', 'grunnlegger']
seen_religions = set()
priority_first = []
rest = []

for r in sorted(results, key=lambda x: -x['score']):
    is_key = any(kw in r['id'].lower() or kw in r['title'].lower() for kw in PRIORITY_KEYWORDS)
    if is_key and r['religion'] not in seen_religions:
        priority_first.append(r)
        seen_religions.add(r['religion'])
    else:
        rest.append(r)

ordered = priority_first + rest

print('STATUS|RELIGION|TITLE|BLOCKS|ID|PATH')
for r in ordered[:20]:
    status = 'EMPTY' if not r['has_sig'] and not r['has_micro'] else 'PARTIAL'
    print(f"{status}|{r['religion']}|{r['title']}|{r['blocks']}|{r['id']}|{r['path']}")
EOF
```

Merk: Kjør skriptet fra `/home/irik/eiriksbok/` som working directory.

## Steg 2: Velg kandidat

Parse output-linjene. Velg de **4 øverste kandidatene** — de er allerede sortert slik at
intro/sentrale-trekk-artikler fra ulike religioner kommer først.

Bruk **AskUserQuestion** med fire valg formatert slik:
- `label`: `[Religion]: [Tittel]`
- `description`: `[N] innholdsblokker · [status: ingen signaturkomponent + ingen mikrospill / mangler mikrospill]`

Eksempel på valgmuligheter:
```
label: "Islam: Sentrale trekk i Islam"
description: "6 blokker · ingen signaturkomponent · ingen mikrospill"

label: "Buddhisme: Siddhartha Gautama (Buddha)"
description: "6 blokker · ingen signaturkomponent · ingen mikrospill"

label: "Hinduisme: Sentrale trekk i Hinduismen"
description: "6 blokker · ingen signaturkomponent · ingen mikrospill"

label: "Jødedommen: Abraham og Moses"
description: "6 blokker · ingen signaturkomponent · ingen mikrospill"
```

## Steg 3: Kjør plan_article

Når brukeren har valgt en artikkel:

1. Les artikkelfilen (path fra skannen) for å forstå eksisterende innhold og KRLE-felt
   (`religion`, `dimension`, `comparison_tags`)

2. Invokér `plan_article`-skillen via Skill-toolet med alle KRLE-krav bakt direkte inn i args:

```
Skill({
  skill: "plan_article",
  args: "[religion] [artikkel-tittel] — KRLE-krav: (1) Bevar feltene religion/dimension/comparison_tags — disse driver sammenligningssystemet på /krle/sammenlign/tema/:tag. (2) Tone objektiv og respektfull ('Muslimer tror...', 'Buddhister mener...'), aldri normativ. (3) Signaturkomponenten MÅ være ny og spesialtilpasset denne artikkelen — aldri gjenbruk av eksisterende komponent. (4) Mikrospillet MÅ være 3D (referanse: kristendom-spredning-spillet). (5) Mål 800-1200 ord, tilgjengelig for 14-åringer. Referanse-mal: public/content/krle/religion/kristendom/intro/artikkel.json"
})
```

Eksempler på args (fyll inn riktig religion og tittel):
- `"islam sentrale trekk — KRLE-krav: ..."`
- `"buddhisme siddhartha gautama — KRLE-krav: ..."`
- `"hinduisme introduksjon til hinduismen — KRLE-krav: ..."`
- `"jodedom abraham og moses — KRLE-krav: ..."`

## Argument-støtte

Hvis brukeren kjørte skillen med et argument (f.eks. `/oppgrader-religion-artikkel islam`):
- Send religion-navnet til Python-skriptet som filter
- Hopp direkte til steg 2 med kun artikler fra den religionen
- Presenter de 4 beste kandidatene for den valgte religionen
