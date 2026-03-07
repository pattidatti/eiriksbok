# Scenario Blueprint: Skyttergravenes Ekko
> **Status:** `Approved`
> **Engine:** `TimeTravel/Chronos`
> **Bekreftet:** Battle-node ved Somme | Realistisk foto-stil | Ingen historiske figurer

---

## 1. Metadata & Stats

*   **ID:** `ww1-vestfront`
*   **Tittel:** `Skyttergravenes Ekko`
*   **Rolle:** Thomas Berg, norsk-britisk frivillig soldat, 19 år
*   **Era/År:** Vestfronten, Frankrike — 1. juli 1916 (Somme-offensiven)
*   **Subject:** `historie` / `forste-verdenskrig`
*   **Summary:** Tre uker i skyttergravene ved Somme. Overlev artilleri, gass og ingenmannsland — og ta stilling til om en ordre alltid skal adlydes.
*   **Theme:** `{ "primaryColor": "#4a5a3e", "font": "serif" }`

### Stats

| Stat ID | Navn | Ikon | Start | Max | Faglig forankring |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `moral` | Moral | `heart` | 65 | 100 | Psykologisk tilstand — faller ved grufullheter, stiger ved menneskelig kontakt |
| `disiplin` | Disiplin | `shield` | 50 | 100 | Militær lydighet — påvirker hvilke valg som er tilgjengelige |
| `kameratskap` | Kameratskap | `users` | 40 | 100 | Bånd med medsoldater — nøkkel til "humanitet"-slutten |
| `overlevelse` | Overlevelse | `activity` | 75 | 100 | Fysisk tilstand — faller til null = spillslutt |

---

## 2. Den Narrative Buen

### Introduksjon
Thomas Berg vokste opp i Bergen, sønn av en norsk far og britisk mor. Da Storbritannia mobiliserte i 1914 meldte han seg frivillig. Nå, sommeren 1916, ankommer han Vestfronten for første gang. Toget stopper ved Arras. Kanontordenen er hørbar. Luften lukter svovel og råte.

### Hovedkonflikt (Pedagogisk kjerne)
Scenariet sirkler rundt ett spørsmål læreplanen stiller direkte: *Hva gjør krig med et menneske?* Eleven navigerer tre akter:
1. **Tilvenning** — forstå hverdagen i skyttergraven (skyttergravskrig som fenomen)
2. **Humanisering** — møte en såret fiende (etikk og menneskeverd)
3. **Valget** — adlyde eller nekte "over toppen"-ordren (individ vs. system)

### Læreplantilknytning (K20 — Kjerneelementer Historie) — alle 4 dekkes

| Kompetansemål | Dekket i |
| :--- | :--- |
| **Årsaker til WW1** — nasjonalisme, imperialisme, alliansesystemet, Sarajevo | `intro_ankomst` (rekrutteringspropaganda Thomas hørte), `kommandoposten` (offiseren forklarer stormaktspolitikken) |
| **Soldatlivet** — skyttergravskrig, psykologisk belastning, hverdagen | `hverdagen_skyttergraven`, `gassangrep`, `sanitetsposten` |
| **Etikk og menneskeverd** — humanisering av fienden, kjemisk krig, lydighetsplikt | `saarede_tysker`, `sanitetsposten` (giftgass-refleksjon), `ordre_over_toppen` |
| **Versailles-konsekvenser** — fredsoppgjøret, dolkesjøtlegenden, frøene til WW2 | Alle 4 slutt-noder viser hva som skjer etter krigen: Versailles 1919, 20 millioner døde, Weimarrepublikkens ustabilitet |

### Mulige avslutninger

| Slutt | Tittel | Betingelse | Beskrivelse |
| :--- | :--- | :--- | :--- |
| Seier | **Humaniteten overlever** | Vant slag + `moral >= 65` OG `kameratskap >= 55` | Thomas overlevde Somme. Han bærer arr, men også minner om det tyske ansiktet i krateret — et menneske, ikke en fiende. Versailles 1919: han leser om fredsvilkårene og frykter at ydmykelsen av Tyskland vil skape ny krig. |
| Kompromiss | **Plikten fullført** | Vant slag + `moral < 65` ELLER `kameratskap < 55` | Thomas kom hjem. Han snakker aldri om krigen. Versailles 1919: han ser aviser med overskriften "Tysklands skam" og tenker på mannen i krateret. Frøet til neste krig er allerede plantet. |
| Tap | **Falt ved Somme** | Tapte slag ELLER `overlevelse < 25` | En av 57 470 britiske tap den første Somme-dagen. Versailles 1919: hans navn er ikke på noen liste, men kostnadene av krigen — 20 millioner døde — tvinger frem et fredsoppgjør som planter frøet til den neste. |
| Alternativt tap | **Krigsretten** | Nektet ordre + `disiplin < 15` | Arrestert og stilt for krigsrett. 306 britiske soldater ble skutt for "feighet" under WW1. Parlamentet beklaget dette i 2006. Versailles 1919: fra fengselet leser Thomas om fredsvilkårene og dolkesjøtlegenden som vokser i Tyskland. |

---

## 3. Node-oversikt (Flyt)

```
intro_ankomst
      |
      v
hub_skyttergraven  <----+-----+-----+------+
      |                 |     |     |      |
      v                 |     |     |      |
hverdagen_skyttergraven |     |     |      |
      |                 |     |     |      |
      +---------------->+     |     |      |
                              |     |      |
patrulje_ingenmannsland       |     |      |
      |                       |     |      |
      +--[Win]-->saarede_tysker|     |      |
      |              |        |     |      |
      +--[Loss]-->patrulje_   |     |      |
              oppdaget        |     |      |
                   |          |     |      |
                   +-------->hub    |      |
                                    |      |
                             gassangrep    |
                                    |      |
                             sanitetsposten|
                                    |      |
                                    +----->+
                                          |
                                    kommandoposten
                                          |
                                          v
                                   ordre_over_toppen
                                    /            \
                              [Adlyd]          [Nekt]
                                |                 |
                          slag_ved_somme    slutt_krigsrett
                           /       \
                      [Vinn]      [Tap]
                        |              |
               [stats-sjekk]     slutt_fell
              /              \
  slutt_humanitet      slutt_soldat
```

| Node ID | Type | Beskrivelse | Valg / Utganger | Faglig kobling |
| :--- | :--- | :--- | :--- | :--- |
| `intro_ankomst` | Narrativ | Ankomst med tog til Arras. Første inntrykk av Vestfronten. | -> `hub_skyttergraven` | Skyttergravskrig som kontekst |
| `hub_skyttergraven` | Hub/Kart | Isometrisk kart over skyttergravssystemet. 4 lokasjoner. | Hverdagen, Ingenmannsland, Kommandoposten, Over toppen | Navigasjon og orientering |
| `hverdagen_skyttergraven` | Narrativ + JournalPrompt | Dagliglivet: rotter, lus, gjørme, hermetikk, brev. "Skriv et avsnitt til brev hjem — hva sier du?" | -> `hub_skyttergraven` | Soldatlivet og psykologisk belastning |
| `patrulje_ingenmannsland` | Terning (Dice) | Nattpatrulje. Mål: 4/6 for å unngå oppdagelse. | Win -> `saarede_tysker`, Loss -> `patrulje_oppdaget` | Ingenmannsland og patruljekrigføring |
| `patrulje_oppdaget` | Narrativ | Oppdaget — tyskerne åpner ild. Kameratene henter Thomas. | -> `hub_skyttergraven` (`kameratskap +10`, `overlevelse -20`) | Kamaratskap som overlevelsesmekanisme |
| `saarede_tysker` | Narrativ | En ung tysk soldat ligger skadet i et krateret. Han strekker hånden mot deg. | A: Hjelp (`moral +15`, `disiplin -10`) -> hub + `tysk_kobbkrus`, B: Forlat (`disiplin +10`, `moral -20`) -> hub, C: Ta til fange (`disiplin +5`, `kameratskap +5`, `moral +5`) -> hub | Humanisering av fienden, etikk |
| `gassangrep` | Narrativ | Klorgassangrep ved daggry. `checkInventory: gassmask`. | Med maske: `moral -10` -> hub. Uten maske: `overlevelse -35` -> `sanitetsposten` | Kjemisk krigføring og humanitær folkerett |
| `sanitetsposten` | Narrativ + JournalPrompt | Feltsykehus. Sårede menn overalt. "Hva tenker du om bruk av giftgass som våpen?" | -> `hub_skyttergraven` (`overlevelse +20`, `moral -5`) | Humanitær folkerett, Rødekors, Haag-konvensjonene |
| `kommandoposten` | Narrativ | Offiseren forklarer Somme-offensiven. "60 km frontlinje. Angrepet starter om tre dager." | A: Still spørsmål ved planen (`disiplin -15`, `moral +10`) -> hub, B: Adlyd og forbered (`disiplin +15`, `moral -5`) -> hub | Militær planlegging og ledelse, taktikk vs. strategi |
| `ordre_over_toppen` | Narrativ | 1. juli 1916, kl. 07:30. Fløyten blåser. Stigen er klar. | A: Klatr opp [krever `disiplin >= 20`] -> `slag_ved_somme`, B: Nekt -> `slutt_krigsrett`, C: Lede kameratene [krever `kameratskap >= 55`] (`kameratskap +10`) -> `slag_ved_somme` | Individ mot system, krigens mekanikk |
| `slag_ved_somme` | Kamp (Battle) | Storme den tyske skyttergraven gjennom piggtrådssperringen. | Win + stats -> `slutt_humanitet` / `slutt_soldat`, Loss -> `slutt_fell` | Somme-offensiven, moderne krigføring |
| `slutt_humanitet` | Avslutning (Seier) | Overlevde. Ansiktet til den tyske soldaten i krateret hjemsøker deg — men det var et menneskelig ansikt. | — | Menneskeverd, krigens psykologiske ettervirkninger |
| `slutt_soldat` | Avslutning (Kompromiss) | Overlevde. Hjemkommen i 1918. Snakker aldri om det. | — | Traumatisert generasjon, "the Lost Generation" |
| `slutt_fell` | Avslutning (Tap) | En av 57 470 britiske tap den første Somme-dagen. | — | Krigens menneskelige kostnad, statistikk vs. enkeltskjebner |
| `slutt_krigsrett` | Avslutning (Alternativt tap) | Stilt for krigsrett. 306 britiske soldater ble skutt for "feighet" i WW1. Parlamentet beklaget dette i 2006. | — | Rettferdig krig, militærjuss, historisk oppreisning |

---

## 4. Gjenstander

### Viktige Items

| Item ID | Navn | Ikon | Funksjon | Hvordan finnes |
| :--- | :--- | :--- | :--- | :--- |
| `gassmask` | Gassmaske | `shield` | Avgjørende ved `gassangrep` — uten den: `overlevelse -35` | Gis i `hverdagen_skyttergraven` |
| `brev_fra_hjemsted` | Brev hjemmefra | `mail` | Kan brukes i `sanitetsposten` for `moral +10` | Gis i `hverdagen_skyttergraven` |
| `tysk_kobbkrus` | Tysk kobbkrus | `star` | Symbol på humanisering. Påvirker `slutt_humanitet`-dialogen | Fås ved valg A i `saarede_tysker` |
| `forbindingspakke` | Forbindingspakke | `heart` | Alternativt valg i `saarede_tysker`: hjelp den tyske soldaten | Gis i `sanitetsposten` |

### Crafting
Ingen crafting-oppskrifter — realisme og historisk autentisitet prioriteres over spillmekanikk.

---

## 5. Battle-node: `slag_ved_somme`

*   **Fiende:** "Tysk maskingeværpost"
*   **Fiendtlige trekk:** `Ildkave` (suppression fire), `Siktet skudd` (aimed burst), `Pause` (reload)
*   **Spillertrekk:**

| Trekk | Slår | Beskrivelse |
| :--- | :--- | :--- |
| `Kast deg ned` | `Ildkave` | Flat mot gjørma. Ilden fyker over deg. |
| `Zig-zag løp` | `Siktet skudd` | Uforutsigbar bevegelse gjør deg vanskelig å treffe. |
| `Kast granat` | `Pause` | Utnytt reladepausen for å nøytralisere stillingen. |

*   **Stat-modifikator:** Hvis `kameratskap >= 55` ved kampstart: én ekstra HP (kameratene dekker flankene).
*   **Win-betingelse:** Bestem slutt basert på stats etter kamp (se avslutninger).

---

## 6. Assets (AI Image Prompts)

Visuell stil: **Gritty WWI Cinematic Realism** — desaturert palett med mudderbrun og bleikgrønn, dramatisk overskyet lys, autentiske detaljer. Stil som kjenner fra *1917* (filmen, 2019).

| Node | Prompt |
| :--- | :--- |
| **Hero Image** | A highly realistic 4K cinematic photograph of a young soldier standing in a muddy World War I trench, Western Front France 1916. Overcast dramatic lighting from above. Wide shot showing trench walls reinforced with sandbags and wooden planks. Barbed wire visible above. Soldier stares into the distance. Desaturated color palette, muted greens and browns. 16:9 ratio. |
| `intro_ankomst` | A highly realistic 4K cinematic photograph of British soldiers disembarking from a steam train at a French railway station, 1916. Arras, Northern France. Fog and dawn light. Long line of men with full kit, anxious faces. 16:9 ratio. |
| `hub_skyttergraven` | A hand-drawn military map illustration, top-down isometric view of a World War I trench system, Western Front. Zigzag trenches, machine gun nests, no man's land, barbed wire. Aged parchment style with blue pencil annotations. 16:9 ratio. |
| `hverdagen_skyttergraven` | A highly realistic 4K cinematic photograph of the interior of a World War I trench. Soldiers eating canned rations, a rat visible on a sandbag, a candle burns in a dugout entrance. Mud and rain. Low moody lighting. 16:9 ratio. |
| `patrulje_ingenmannsland` | A highly realistic 4K cinematic photograph of two British soldiers crawling through no man's land at night, World War I. Flare illuminating shell craters filled with water. Barbed wire silhouettes. Dark, tense atmosphere. 16:9 ratio. |
| `saarede_tysker` | A highly realistic 4K cinematic photograph of a British soldier kneeling beside a wounded German soldier in a muddy shell crater, Western Front 1916. Both men exhausted, no weapons visible. The German reaches out his hand. Soft overcast light. 16:9 ratio. |
| `gassangrep` | A highly realistic 4K cinematic photograph of a World War I gas attack, Western Front 1916. Yellow-green chlorine gas cloud rolling across no man's land. Soldiers scrambling for gas masks. Eerie backlit light through the gas. 16:9 ratio. |
| `ordre_over_toppen` | A highly realistic 4K cinematic photograph of British soldiers at the bottom of trench ladders, moments before going over the top, Battle of the Somme, July 1 1916. Officer's whistle at lips. Men's faces — fear and resolve mixed. Dramatic overcast morning light. 16:9 ratio. |

---

## 7. Pedagogiske Refleksjonsspørsmål (JournalPrompts)

1. **`hverdagen_skyttergraven`:** "Du skal skrive et brev hjem til familien din. Hva forteller du om livet i skyttergraven — og hva holder du tilbake? Beskriv ett valg du tar i brevet, og hvorfor."
2. **`sanitetsposten`:** "Giftgass brøt med tidligere krigsregler om å skåne sivile og ikke-stridende. Mener du bruk av kjemisk krigføring kan rettferdiggjøres? Hva sier den humanitære folkeretten?"

---

## 8. Manifest-registrering (etter godkjenning)

Legg til under `tools` i `forste-verdenskrig`-emnet i `manifest.json`:

```json
{
  "id": "ww1-vestfront",
  "title": "Tidsreise: Soldat ved Vestfronten",
  "description": "Lev som frivillig soldat ved Somme-fronten i 1916. Ta valg som avgjør din skjebne — og din samvittighet.",
  "link": "/oving/tidsreise/ww1-vestfront",
  "icon": "sword"
}
```

---

## 9. Bildeoversikt — Filer og AI-prompts

Alle bilder lagres under `public/images/chronos/` som `.webp` (16:9, maks 1600px bred, kvalitet 80).
Visuell stil: **Gritty WWI Cinematic Realism** — desaturert palett, muted greens/browns, dramatisk overskyet lys. Referanse: *1917* (2019).

| Fil | Node | AI-prompt |
| :--- | :--- | :--- |
| `ww1_trench_hero.webp` | Hero Image | A highly realistic 4K cinematic photograph of a young soldier standing in a muddy World War I trench, Western Front France 1916. Overcast dramatic lighting from above. Wide shot showing trench walls reinforced with sandbags and wooden planks. Barbed wire visible above. Soldier stares into the distance. Desaturated color palette, muted greens and browns. 16:9 ratio. |
| `ww1_arras_arrival.webp` | `intro_ankomst` | A highly realistic 4K cinematic photograph of British soldiers disembarking from a steam train at a French railway station, Arras, Northern France, 1916. Fog and pale dawn light. Long line of men with full kit, anxious faces. Desaturated greens and grey. 16:9 ratio. |
| `ww1_trench_hub.webp` | `hub_skyttergraven` (bg) | A highly realistic 4K cinematic photograph of the interior of a World War I trench system, Western Front. Zigzag walls of sandbags, duckboards underfoot, overcast sky above. Atmospheric muted palette. 16:9 ratio. |
| `ww1_trench_map.webp` | `hub_skyttergraven` (kart) | A hand-drawn military map illustration, top-down view of a World War I trench system, Western Front 1916. Zigzag trenches, machine gun nests, no man's land, barbed wire belts. Aged parchment with blue pencil annotations. 16:9 ratio. |
| `ww1_trench_dugout.webp` | `hverdagen_skyttergraven` | A highly realistic 4K cinematic photograph of the interior of a WWI trench dugout. Soldiers eating canned rations, a rat on a sandbag, a candle burning at a dugout entrance. Mud and rain. Low moody lighting. 16:9 ratio. |
| `ww1_no_mans_land.webp` | `patrulje_ingenmannsland` / `patrulje_oppdaget` | A highly realistic 4K cinematic photograph of two British soldiers crawling through no man's land at night, WWI. A flare illuminates shell craters filled with dark water. Barbed wire silhouettes. Tense, dark atmosphere. 16:9 ratio. |
| `ww1_shell_crater.webp` | `saarede_tysker` | A highly realistic 4K cinematic photograph of a British soldier kneeling beside a wounded German soldier in a muddy shell crater, Western Front 1916. Both men exhausted, no weapons visible. The German reaches out his hand. Soft overcast light. 16:9 ratio. |
| `ww1_gas_attack.webp` | `gassangrep` | A highly realistic 4K cinematic photograph of a WWI gas attack, Western Front 1916. Yellow-green chlorine gas cloud rolling low across no man's land. Soldiers scrambling for gas masks. Eerie backlit atmosphere through the gas. 16:9 ratio. |
| `ww1_field_hospital.webp` | `sanitetsposten` | A highly realistic 4K cinematic photograph of a WWI field hospital tent, France 1916. Wounded soldiers on stretchers and cots. Medical staff in white aprons. Dim lantern light, antiseptic atmosphere. 16:9 ratio. |
| `ww1_command_post.webp` | `kommandoposten` | A highly realistic 4K cinematic photograph of a WWI British command post in an underground bunker, 1916. Officers around a table studying a large map. Bare bulb lighting, tense faces. 16:9 ratio. |
| `ww1_over_top.webp` | `ordre_over_toppen` | A highly realistic 4K cinematic photograph of British soldiers at the base of trench ladders, moments before going over the top, Battle of the Somme, July 1 1916. Officer's whistle at lips. Men's faces — fear and resolve mixed. Dramatic overcast morning light. 16:9 ratio. |
| `ww1_somme_charge.webp` | `slag_ved_somme` | A highly realistic 4K cinematic photograph of British soldiers charging across no man's land, Battle of the Somme 1916. Open muddy terrain, barbed wire, shell craters. Overcast sky, dramatic low light. 16:9 ratio. |
| `ww1_trench_victory.webp` | `slag_etterspill` | A highly realistic 4K cinematic photograph of a single exhausted British soldier sitting in a captured German trench, WWI. Pale light breaking through clouds. Smoke in the distance. Muted desaturated palette. 16:9 ratio. |
| `ww1_homecoming.webp` | `slutt_humanitet` / `slutt_soldat` | A highly realistic 4K cinematic photograph of a WWI soldier walking home through a Norwegian coastal town, autumn 1918. Quiet streets, grey sky, civilian clothes. Melancholy and relieved expression. 16:9 ratio. |
| `ww1_fallen.webp` | `slutt_fell` | A highly realistic 4K cinematic photograph of a lone wooden cross in a WWI battlefield cemetery, France 1916. Rows of white crosses receding into fog. Overcast sky. Solemn and still. 16:9 ratio. |
| `ww1_courtmartial.webp` | `slutt_krigsrett` | A highly realistic 4K cinematic photograph of a WWI British military tribunal scene, 1916. Officers in uniform seated at a long table, a soldier standing alone before them. Grim, formal, sparse interior. 16:9 ratio. |
