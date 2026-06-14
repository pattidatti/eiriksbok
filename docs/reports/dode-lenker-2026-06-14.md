# Døde interne lenker — full kartlegging 2026-06-14

Oppfølging av kvalitetsaudit 2026-06-08 (GitHub issue #118). Den ukentlige auditen
rapporterte 9 «døde» lenker. En ny, korrekt lenkesjekker
(`scripts/check-internal-links.cjs`) viser at auditen tok feil i **begge** retninger:

- **8 av 9 var falske positiver** — gyldige ruter auditen ikke modellerte
  (`/krle/religion/:religionId`, nested-lesson `:subject/:topic/:subTopic/:lesson`,
  `/oving/detektiv/:caseId`).
- **1 var reelt død** og er fikset: `opiumskrigene.json` → `/historie/kolonialisering`.
- **~50 reelle døde lenker auditen aldri fanget** (den allowlistet `/persongalleri`
  og `/concepts`, og hoppet over 54 ikke-artikkelfiler).

## Allerede løst i denne omgangen

| Tiltak | Status |
|---|---|
| `scripts/check-internal-links.cjs` — korrekt lenkesjekker | ✅ ny |
| `opiumskrigene.json` → `/historie/kolonialisering` | ✅ fikset |
| `/persongalleri/:slug` deep-link + persondetalj-visning | ✅ bygget (løser 19 lenker) |
| Null-safe søkefilter i `PersonGallery` (latent krasj på manglende `definition`) | ✅ fikset |

Etter dette rapporterer sjekkeren **31 gjenværende reelt døde lenker** (under).
Disse er bevisst **ikke** endret ennå — de venter på beslutning per kategori.

## Gjenværende døde lenker (31)

### Kategori 1 — slug-fiks, målartikkelen finnes (anbefalt: omskriv lenke)

| Død lenke | Riktig mål | Forekomster |
|---|---|---|
| `/historie/middelalder/mongolske-riket` | `/historie/middelalderen/mongolske-riket` | concepts/meritokrati, concepts/pax-mongolica, concepts/yam, global-timeline.json, global-timeline.manual.json, people/genghis-khan, people/kublai-khan (7) |
| `/historie/middelalder/knut-alvsson` | `/historie/norgeshistorie/knut-alvsson` | people/henrik-krummedige, people/knut-alvsson-bio (2) |
| `/historie/middelalder/karl-den-store` | `/historie/vikingtiden/karl-den-store` | people/karl-den-store-bio (1) |
| `/historie/boktrykkerkunsten/boktrykkerkunsten` | `/historie/middelalderen/boktrykkerkunsten` | middelalderen.json (1) |
| `/historie/romerriket/augustus` | `/historie/romerriket/augustus-og-keiserdomme` | people/gaius-octavius, people/marcus-antonius (2) |
| `/samfunnskunnskap/demografi-okonomi/inflasjon-og-rente` | `/samfunnskunnskap/okonomi/inflasjon-og-rente` | romerriket/diokletian (1) |
| `/samfunnskunnskap/demografi-okonomi/produksjon` | `/samfunnskunnskap/okonomi/produksjon` | romerriket/diokletian (1) |
| `/krle/religion/sikhisme/introduksjon` | `/krle/religion/sikhisme/intro` | kompetansemal/krle-10-trinn (1) |

> Merk: `global-timeline.json` regenereres av `scripts/generate-timeline.js` — fiks
> kilden (`global-timeline.manual.json` eller artikkelens `link`), ikke den genererte fila.
> Mange av disse ligger i `link`/`url`-felt (ikke markdown `](...)`), så de fanges **ikke**
> av `scripts/fix-dead-links.cjs` (som kun rører markdown-lenker). De må omskrives i kilden.

### Kategori 2 — ingen målartikkel finnes (anbefalt: fjern lenke, evt. lag innhold)

| Død lenke | Kilde | Kommentar |
|---|---|---|
| `/historie/middelalder/jeanne-d-arc` | people/jeanne-d-arc | ingen artikkel |
| `/historie/middelalderen/lange-linjer` | middelalderen/svartedauden-sti | ingen artikkel |
| `/historie/reformasjonen/30-arskrigen` | people/gustav-ii-adolf | ingen artikkel |
| `/historie/antikken/platon-og-aristoteles` | people/aristoteles-bio, people/platon-bio | ingen `antikken`-artikkel |
| `/historie/antikken/princeps-til-guds-utvalgte` | people/augustin-bio | ingen artikkel |
| `/historie/antikken/sokrates` | people/sokrates-bio | ingen artikkel |
| `/filosofi/opplysningstid/david-hume` | people/david-hume | feil prefiks `/filosofi`; ingen tilsvarende side |
| `/filosofi/opplysningstid/john-locke` | people/john-locke | samme |
| `/filosofi/eksistensialisme/friedrich-nietzsche` | people/friedrich-nietzsche | samme |
| `/filosofi/eksistensialisme/martin-heidegger` | people/martin-heidegger | samme |
| `/filosofi/middelalder/thomas-aquinas` | people/thomas-aquinas | samme |

> `people/*.json` sin `link` rendres som «Lær mer»-knapp i persongalleriet og som
> tooltip-lenke. Når målet mangler bør `link` fjernes fra oppføringen (knappen blir
> da deaktivert, allerede støttet i `PersonGallery`).

### Kategori 3 — `/concepts/{id}` inline-lenker (anbefalt: pakk ut til ren tekst)

| Død lenke | Kilde |
|---|---|
| `/concepts/aksjeselskap` | samfunnskunnskap/ideer-og-verdenssyn/store-sykluser (blokk 6) |
| `/concepts/merkantilisme` | samfunnskunnskap/ideer-og-verdenssyn/store-sykluser (blokk 6) |
| `/concepts/kapitalisme` | samfunnskunnskap/ideer-og-verdenssyn/store-sykluser (blokk 17) |

> Det finnes ingen `/concepts/:id`-rute. Glossary-systemet uthever disse begrepene
> automatisk inline (CLAUDE.md), så de eksplisitte lenkene bør fjernes (behold teksten).

## Anbefalte oppfølginger

1. **Pek den eksterne ukentlige auditen** («eiriksbok-quality-audit», remote cron) på
   `node scripts/check-internal-links.cjs --json` i stedet for sin egen naive sjekk.
   Dette fjerner de tilbakevendende falske positivene og fanger de reelle. Endringen
   gjøres på cron-rutinen (utenfor repoet).
2. **Behandle de 31 over** kategori for kategori (slug-fiks → fjern → pakk ut).
3. Vurder `/concepts/:id`-rute hvis dype begrepslenker ønskes på sikt (i dag dekkes
   begreper av inline-tooltips + `/oving/flashcards`).

---
*Generert manuelt som oppfølging av #118. Kjør `node scripts/check-internal-links.cjs`
for oppdatert liste.*
