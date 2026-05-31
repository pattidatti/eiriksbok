# Subject Blueprint: Det osmanske riket
> **Status:** `Draft`
> **Version:** 1.0

---

## 0. Hvorfor dette emnet

Eiriksbok mangler i dag dekning av Det osmanske riket - et åpenbart hull mellom
`perserriket` (antikken) og det moderne Midtøsten. Riket er et pedagogisk knutepunkt
som binder sammen fem emner som allerede finnes i boka:

- **Middelalderen** (`korstogene`, `det-hellige-romerske-rike`) - osmanerne reiste seg der Bysants falt.
- **Renessansen** (`oversikt`) - fallet av Konstantinopel i 1453 sendte greske lærde vestover.
- **Kolonialisering** (`verdenshandel-for-oppdagelsesreisene`) - osmansk kontroll over handelsrutene drev Europa til havs.
- **Første verdenskrig** - rikets inngang i krigen, Gallipoli og folkemordet på armenerne.
- **Mellomkrigstiden** (`midtoesten`) - artikkelen nevner allerede oppløsningen av riket og Sykes-Picot. Dette emnet leverer forhistorien den mangler.

Målet: et emne som forteller historien om et 600 år langt imperium på tre kontinenter,
fra grensekrigere til "Europas syke mann", på et språk en 14-åring forstår.

---

## 1. Metadata
- **Type:** `Topic` (Emne)
- **Parent (Fag):** `historie`
- **Topic ID:** `osmanske-riket`
- **Title:** Det osmanske riket: Imperiet mellom øst og vest
- **Visual Theme:** Fotorealistisk, filmatisk look etter `docs/image-style-guide.md` (alle prompts starter med "A highly realistic 4K cinematic photograph", spesifisert lys + kameravinkel + historisk epoke, 16:9). Gjennomgående visuelt motiv: İznik-blå fliser og gull i gullalderen som falmer til overskyet, diffust lys i forfallet.

---

## 2. The Narrative Arc

**The Hook:**
"I 600 år styrte sultanene et rike så stort at solen aldri gikk ned over det - helt til en verdenskrig rev det i filler og tegnet kartet vi fortsatt krangler om i dag."

**The Arc:**
Vi starter med en liten flokk grensekrigere ved ruinene av Romerriket, følger dem
gjennom det skjebnesvangre året 1453 og opp til gullalderen under Süleyman, ser
hvordan et rike av mange folk og religioner faktisk ble styrt - og hvordan den samme
kjempen sakte ble "Europas syke mann" før den brøt sammen i 1918 og fødte dagens
Tyrkia og Midtøsten.

---

## 3. The Learning Path (The Spine)

1. **[Article]** Oversikt: Riket mellom to verdener (ID: `oversikt`)
2. **[Article]** Fra grensekrigere til imperium (ID: `osman-og-oppkomsten`)
3. **[Article]** 1453: Da Konstantinopel falt (ID: `konstantinopels-fall`)
4. **[Article]** Süleyman den store og gullalderen (ID: `suleyman-gullalderen`)
5. **[Article]** Janitsjarene: Sultanens slavehær (ID: `janitsjarene`)
6. **[Article]** Et rike av mange folk (ID: `millet-mangfold`)
7. **[Article]** Topkapı: Maktens palass (ID: `topkapi-palasset`)
8. **[Article]** Handel, kaffe og kunst (ID: `handel-og-kultur`)
9. **[Article]** "Europas syke mann" (ID: `forfallet`)
10. **[Article]** Sammenbruddet og det nye Tyrkia (ID: `sammenbruddet`)
11. **[Quiz]** Det osmanske riket gjennom 600 år
12. **[Interactive]** Tidslinje + ekspansjonskart (1300 -> 1453 -> 1566 -> 1914)

---

## 4. The Content Matrix (The Bricks)

### 1. Oversikt: Riket mellom to verdener
- **File:** `public/content/historie/osmanske-riket/oversikt.json`
- **Pedagogical Goal:** Forstå rikets enorme utstrekning i tid (1299-1922) og rom (tre kontinenter), og hvorfor posisjonen mellom Europa og Asia ga det makt.
- **Beats:** Hook: Et rike på tre kontinenter, styrt fra én by. Conflict: Bro eller barriere mellom øst og vest? Resolution: Et knutepunkt som formet både Europa og Midtøsten.
- **Interactive:** `MapCarousel` - rikets vekst og fall i fem epoker.
- **Connection:** `historie/perserriket/oversikt` (samme region, tidligere storrike).

### 2. Fra grensekrigere til imperium
- **File:** `.../osman-og-oppkomsten.json`
- **Pedagogical Goal:** Se hvordan en liten flokk ghazi-krigere vokste i tomrommet etter et døende Bysants.
- **Beats:** Hook: Osman drømmer om et tre som dekker verden. Conflict: Små krigerstater kjemper om restene av Øst-Romerriket. Resolution: Disiplin og allianser gjør osmanerne til regional makt.
- **Connection:** `historie/middelalderen/korstogene` (det kristne Bysants svekket).

### 3. 1453: Da Konstantinopel falt
- **File:** `.../konstantinopels-fall.json`
- **Pedagogical Goal:** Forstå hvorfor fallet av den 1000 år gamle byen ble et vendepunkt for hele verden.
- **Beats:** Hook: Verdens sterkeste bymurer mot Mehmet 2.s gigantiske kanoner. Conflict: Det siste Roma mot et ungt imperium. Resolution: Bysants forsvinner; greske lærde flykter vest og handelsrutene endres.
- **Interactive:** `ScenarioRoleplay` - beleiringen sett fra mur og leir.
- **Connections:** `historie/renessansen/oversikt` (lærde vestover), `historie/kolonialisering/verdenshandel-for-oppdagelsesreisene` (stengte ruter -> oppdagelsesreiser).

### 4. Süleyman den store og gullalderen
- **File:** `.../suleyman-gullalderen.json`
- **Pedagogical Goal:** Se rikets høydepunkt: militær makt, lov og kultur under "Lovgiveren".
- **Beats:** Hook: Hærene står ved Wiens porter (1529). Conflict: Erobrer ute, lovgiver hjemme. Resolution: Et rike på toppen - men også grensene for hvor langt det kunne nå.
- **Connection:** `historie/reformasjonen/30-aarskrigen` (osmansk press lettet på Habsburg vestfra).

### 5. Janitsjarene: Sultanens slavehær
- **File:** `.../janitsjarene.json`
- **Pedagogical Goal:** Forstå devşirme-systemet (barnetributt) og hvordan slaver kunne bli rikets mektigste menn.
- **Beats:** Hook: Kristne gutter hentes fra landsbyer på Balkan. Conflict: Slaveri eller den ultimate karrierestigen? Resolution: En elitehær som til slutt ble for mektig for sultanen selv.
- **Interactive:** `BiasLens` eller valg-scenario - guttens skjebne.

### 6. Et rike av mange folk
- **File:** `.../millet-mangfold.json`
- **Pedagogical Goal:** Forstå millet-systemet - hvordan muslimer, kristne og jøder levde side om side under egne lover.
- **Beats:** Hook: Jøder som flykter fra Spania i 1492 ønskes velkommen. Conflict: Toleranse på osmansk vis - frihet, men ikke likhet. Resolution: Et mangfold som var en styrke, men også en fremtidig bruddlinje.
- **Connection:** `historie/reformasjonen/martin-luther` (kontrast: Europas religionskriger samtidig).

### 7. Topkapı: Maktens palass
- **File:** `.../topkapi-palasset.json`
- **Pedagogical Goal:** Se hvordan makt faktisk fungerte - sultanen, storvesiren og haremet.
- **Beats:** Hook: Bak murene der ingen utenforstående fikk se inn. Conflict: Hvem styrer egentlig - sultanen eller hoffet? Resolution: Et politisk system av seremoni, intriger og kvinnemakt.

### 8. Handel, kaffe og kunst
- **File:** `.../handel-og-kultur.json`
- **Pedagogical Goal:** Se rikets rolle som handelsknutepunkt og kulturell stormakt.
- **Beats:** Hook: Verdens første kaffehus i Istanbul. Conflict: Kontroll over Silkeveien = rikdom og europeisk misunnelse. Resolution: Arven - Mimar Sinans kupler, İznik-fliser, ord vi bruker i dag.
- **Connection:** `historie/kolonialisering/verdenshandel-for-oppdagelsesreisene` (hvorfor Europa søkte sjøveien).

### 9. "Europas syke mann"
- **File:** `.../forfallet.json`
- **Pedagogical Goal:** Forstå det lange forfallet: tapte kriger, reformforsøk (Tanzimat) og nasjonalisme på Balkan.
- **Beats:** Hook: Hæren som skremte Wien blir slått tilbake (1683). Conflict: Reform eller stagnasjon? Resolution: Et rike som krymper mens stormaktene sirkler.
- **Connection:** `historie/forste-verdenskrig/opptakt` (Balkan som "Europas kruttønne").

### 10. Sammenbruddet og det nye Tyrkia
- **File:** `.../sammenbruddet.json`
- **Pedagogical Goal:** Forstå rikets endelikt i 1. verdenskrig og fødselen av det moderne Tyrkia.
- **Beats:** Hook: Gallipoli - grøftene ved Dardanellene. Conflict: Krig, folkemordet på armenerne og indre kollaps. Resolution: Atatürk bygger en republikk; Sykes-Picot tegner dagens Midtøsten-kart.
- **Connections:** `historie/forste-verdenskrig/konsekvenser`, `historie/mellomkrigstiden/midtoesten` (direkte fortsettelse).

---

## 5. The Asset Tracker

Alle prompts følger `docs/image-style-guide.md`: starter med "A highly realistic 4K cinematic photograph", spesifisert lyskilde, kameravinkel og historisk epoke, ender med "16:9 ratio". WebP, inline < 100KB, hero opp til 1600px.

| Status | Type | Prompt | Filename |
| :--- | :--- | :--- | :--- |
| `[ ]` | Hero | A highly realistic 4K cinematic photograph of the Istanbul skyline at sunrise, Ottoman domes and slender minarets silhouetted against the Bosphorus, golden hour light, atmospheric perspective, high angle. 16:9 ratio. | `hero_oversikt.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a young 14th-century Anatolian warrior in worn leather and chainmail standing on a hill at dawn, misty Byzantine ruins in the distance, soft morning light casting long shadows, eye level. 16:9 ratio. | `osman-oppkomsten.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the 1453 siege of Constantinople, enormous bronze cannons firing at massive stone city walls, smoke and chaos, dramatic overcast light, foreground cannon and background walls for depth. 16:9 ratio. | `konstantinopels-fall.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of Sultan Süleyman in opulent 16th-century robes in a tiled Ottoman throne room, İznik-blue tiles and gold, warm light through high windows (god rays), eye level. 16:9 ratio. | `suleyman.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a young 16th-century Janissary soldier in a white börk headdress and blue coat, serious expression, stone barracks behind, diffuse daylight, eye level close-up. 16:9 ratio. | `janitsjarene.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a bustling 16th-century Ottoman bazaar with merchants of many peoples, colorful spices and textiles in the foreground, dusty god rays from above, detailed textures. 16:9 ratio. | `millet-mangfold.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the inner courtyard of Topkapı Palace in empty morning light, marble columns and domes, İznik tilework, atmospheric perspective, high angle. 16:9 ratio. | `topkapi.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a 17th-century Istanbul coffee house, steaming cups, men in Ottoman dress in conversation, warm candle and oil-lamp light, detailed textures, eye level. 16:9 ratio. | `handel-kultur.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a faded 19th-century Ottoman palace in the rain, soldiers in outdated uniforms, overcast diffuse light, melancholy atmosphere, eye level. 16:9 ratio. | `forfallet.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the Gallipoli trenches at the Dardanelles, 1915, weary soldiers, dramatic dusk light, smoke over the strait in the background, eye level. 16:9 ratio. | `sammenbruddet.webp` |

---

## 6. Neste steg

Dette blueprintet er klart for `/build_topic`. Bygget skal (ikke utført ennå):
1. Opprette 10 artikkel-JSON i `public/content/historie/osmanske-riket/`, hver `"layout": "rich"`, 800-1200 ord, flat `content`-array (ingen bold/markdown-lister i tekst).
2. Registrere nytt topic under `historie` i `public/content/manifest.json` (sjekk at IDen `osmanske-riket` ikke finnes fra før - unngå ghost data).
3. Sette `year` på toppnivå i hver artikkel; tidslinje-events plukkes opp av `npm run scan:content`. Konsistente tags på tvers av artikler og tidslinje.
4. Generere de 10 bildene via `/bilde`-flyten.
