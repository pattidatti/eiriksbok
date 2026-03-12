# Scenario Blueprint: Tsarens Skjebne — Nikolaj II og Den Store Krigen
> **Status:** `Draft`
> **Engine:** `TimeTravel/Chronos`
> **Scenario ID:** `nikolaj-ii`

---

## 1. Metadata & Stats

- **ID:** `nikolaj-ii`
- **Tittel:** `Tsarens Skjebne`
- **Undertittel:** `Nikolaj II og Den Store Krigen`
- **Rolle:** `Tsar Nikolaj II av Russland`
- **Era/År:** `1914–1918`
- **Fag:** `historie`
- **Tema:** `Første verdenskrig, Russland, Revolusjon, Autokrati`
- **SubjectId:** `historie`
- **TopicId:** `forste-verdenskrig`
- **Summary:** `Du er Nikolaj II — den siste tsaren av Russland. Fra attentatet i Sarajevo til revolusjonens ild navigerer du et imperium i krise. Hvert valg du tar kan forandre historien — eller gjenta den.`
- **StartingNodeId:** `intro_sarajevo`
- **Theme:** `{ "primaryColor": "#8B0000", "font": "serif" }`

### Stats (5 kjerne-stats)

| ID | Navn | Ikon | Start | Maks | Kategori |
|---|---|---|---|---|---|
| `autoritet` | Tsarens Autoritet | `crown` | 65 | 100 | core |
| `folkets_stotte` | Folkelig Støtte | `heart` | 30 | 100 | core |
| `krigsevne` | Militær Styrke | `shield` | 55 | 100 | core |
| `hoffets_tillit` | Hoffets Tillit | `users` | 60 | 100 | relation |
| `aleksej_helse` | Aleksejs Helse | `star` | 35 | 100 | special |

**Pedagogisk forankring:**
- `folkets_stotte` starter lavt (30) — reflekterer at Nicholas allerede er upopulær etter Blodige Søndag 1905 og Russland–Japan-krigen.
- `aleksej_helse` er den stille drivkraften bak Rasputins innflytelse. Når den er lav, blir Alexandra og Rasputin mer desperate.

---

## 2. Gjenstander (Items)

| ID | Navn | Beskrivelse | Ikon |
|---|---|---|---|
| `nicky_willy_telegram` | Telegram fra "Willy" | Personlig appell fra Kaiser Wilhelm II om å stoppe mobiliseringen. | `mail` |
| `militær_rapport` | Frontrapporten | En direkte rapport fra fronten — langt dystrere enn det offisielle bildet. | `scroll` |
| `rasputin_brev` | Rasputins Brev | Et brev fra Grigorij Rasputin med profetiske advarsler mot krigen. | `feather` |
| `abdikasjonsdokument` | Abdikasjonsdokumentet | Det offisielle abdikasjonsdokumentet. Å signere dette avslutter din tidsalder. | `pen` |
| `britisk_tilbud` | Tilbud om Eksil | Et hemmelig tilbud fra kong Georg V om asyl i Storbritannia. | `shield` |

---

## 3. Narrative Flags

| Flag | Beskrivelse |
|---|---|
| `telegraferte_willy` | Sendte personlig telegram til Kaiser Wilhelm for å stoppe krigen |
| `full_mobilisering` | Beordret full mobilisering — utløste krigen (historisk valg) |
| `tok_personlig_kommando` | Tok personlig kommando over hæren august 1915 (historisk valg) |
| `støttet_rasputin` | Tillot Rasputins innflytelse på regjeringen (historisk valg) |
| `avslo_duma` | Avslo Dumas krav om ansvarlig regjering (historisk valg) |
| `abdiserte` | Abdiserte som tsar (historisk valg) |
| `avviker_fra_historien` | Master-flagg: satt når et ikke-historisk valg tas første gang |
| `diplomatisk_løsning_1914` | Unngikk mobilisering — endret historiens løp |
| `konstitusjonell_monarki` | Innrømmet Duma-kravene — beholder tronen som konstitusjonell monark |
| `separatfred` | Inngikk separat fred med Tyskland (brest-litovsk-lignende) |
| `aksepterte_eksil` | Aksepterte britisk eksiltilbud |

**Om historisk-avvik-systemet:**
Alle historiske valg er tydelig merket i JSON med `isHistoricalChoice: true`. Spillet viser subtilt en liten notis ("★ Historien gikk en annen vei") første gang et ikke-historisk valg tas. Epilogen avslutter med sammenligning: "Du fulgte historiens gang på X av 6 kritiske valg."

---

## 4. Den Narrative Buen

### Introduksjon
Juli 1914. Nyheten om attentatet mot erkehertug Frans Ferdinand når Tsarskoje Selo. Nikolaj er på ferie med familien. I løpet av tre dager eskalerer en regional krise til et kontinentalt inferno. Eleven må navigere diplomatiske telegrammer, militære krav og familiepresset — og avgjøre om Russland skal kaste seg inn i krigen.

### Akt 1: Krigens Utbrudd (Juli–August 1914)
Fokus: Den europeiske maktsstrukturen, allianser, nasjonalisme. Eleven introduseres for den politiske anatomien til WWI — ikke som abstrakt årsak, men som ekte press på en enkelt person.

### Akt 2: Krigens Gang (1914–1916)
Fokus: Militær ledelse, Rasputins innflytelse, Duma-krisen, Brusilov-offensiven. Eleven styrer ikke bare ett land i krig, men et autokratisk system i oppløsning. Valg om å ta personlig kommando over hæren er den kritiske feilen som binder tsarens personlige prestisje til militære tap.

### Akt 3: Revolusjon og Skjebne (1917–1918)
Fokus: Revolusjon, abdikasjonen, bolsjevikene, eksilet. Avhengig av valgene i akt 1 og 2 kan eleven enten følge historien til sin bitre slutt, eller ha bygget nok handlingsrom til å unnslippe den.

### Mulige Avslutninger (5 endings)

| Ending ID | Navn | Betingelse |
|---|---|---|
| `epilog_jekaterinburg` | Den Historiske Skjebnen | Abdiserte + ingen eksil-flagg. Historisk slutt: henrettet juli 1918. |
| `epilog_eksil` | Det Stille Eksilet | `abdiserte` + `aksepterte_eksil`. Familien overlever i Storbritannia/Europa. |
| `epilog_konstitusjonelt_monarki` | Tsarens Gave | `konstitusjonell_monarki` flag + `hoffets_tillit >= 50` + `folkets_stotte >= 45`. Beholder tronen, Russland reformeres. |
| `epilog_separatfred` | Freden som Reddet Imperiet | `separatfred` + ikke abdisert. Mister territorier, men revolusjon avvertes. |
| `epilog_kollaps` | Det Store Tapet | `krigsevne < 20` + `folkets_stotte < 20` + `autoritet < 20`. Verste utfall: kaos. |

---

## 5. Nodeflyt (20 noder)

### ACT 1 — Juli-Krisen (Juli–August 1914)

| Node ID | Type | Beskrivelse | Valg / Utganger | Faglig Kobling | Flags / Discovery / Ethics |
|---|---|---|---|---|---|
| `intro_sarajevo` | Narrativ | **28. juni 1914.** Nikolaj vil drikke te i fred da en aide-de-camp stormer inn med et telegram. Scenesett: Tsarskoje Selo, sommer. | → `intro_telegram` | Juli-krisen, allianser, Trippel-ententen | — |
| `intro_telegram` | Narrativ | Telegrammet: erkehertug Frans Ferdinand er myrdet i Sarajevo. `discoveryEvent: "juli_krisen"`. Ominøs avslutning: 37 dager. | → `hub_tsarskoje_1914` | Juli-krisen, allianser | `discoveryEvent: "juli_krisen"` |
| `hub_tsarskoje_1914` | Hub/Kart | **Tsarskoje Selo, sommer 1914.** Ditt private arbeidsrom. Tre rådgivere venter. Utenriksminister Sazonov, Krigsminister Sukhomlinov, og et ubesvart telegram fra Berlin. `uiType: "map"` | 1. Les telegram fra Willy → `nicky_willy_telegram` \| 2. Konsulter Sazonov → `sazonov_press` \| 3. Les militær vurdering → `militær_vurdering_1914` \| 4. Ta beslutning → `mobilisering_beslutning` | Russlands allianseforpliktelser til Serbia | — |
| `nicky_willy_telegram` | Narrativ | **"Nicky og Willy" — de siste telegramene.** Nikolaj og Kaiser Wilhelm II (kusiner) utveksler desperate personlige appeller. | Valg A: Appell om fred → setter `telegraferte_willy`, `hoffets_tillit -5` \| Valg B: Kald avvisning → `hoffets_tillit +5` | Personlig diplomati vs. statlig logikk | `ethicsLens: deontologisk (lojalitet til slektning) vs. konsekvensialisme (millioner liv)` |
| `mobilisering_beslutning` | Narrativ (KEY) | **31. juli 1914 — Det uunngåelige valget.** | **Valg A (historisk):** Full mobilisering → `full_mobilisering` flag, → `krigsutbrudd` \| **Valg B (alt):** Stans → `avviker_fra_historien` flag, → `diplomatisk_løsning_1914` \| **Valg C:** Deleger → `autoritet -15`, → `krigsutbrudd` | Militær planlegging, domino-effekten | `isHistoricalChoice: true` for Valg A |
| `krigsutbrudd` | Narrativ | **1. august 1914 — Krigen er et faktum.** | → `tannenberg_katastrofe` | Krigsbegeistringens psykologi | `discoveryEvent: "krigens_utbrudd_1914"` |
| `diplomatisk_løsning_1914` | Narrativ (Alt) | **(Alt-history)** Russland trekker seg tilbake. | `autoritet -20`, `folkets_stotte -15` → `konstitusjonell_reform_spor` | Geopolitisk realisme | `setFlags: ["avviker_fra_historien", "diplomatisk_løsning_1914"]` |

### ACT 2 — Krigen (1914–1916)

| Node ID | Type | Beskrivelse | Valg / Utganger | Faglig Kobling | Flags / Discovery / Ethics |
|---|---|---|---|---|---|
| `tannenberg_katastrofe` | Narrativ | **August–September 1914 — Tannenberg.** To russiske arméer omringet. | Valg A: Undersøkelse → `østfront_krise` \| Valg B: Ta ansvar → `krigsevne +5`, `folkets_stotte +5`, → `østfront_krise` | Militær taktikk, to-frontskrig | `discoveryEvent: "tannenberg_1914"`, `add militær_rapport` |
| `østfront_krise` | Hub | **1915 — Det Store Tilbaketog.** | 1. Ta personlig kommando → `personlig_kommando` \| 2. Støtt Storfyrst Nikolai → `støtt_nikolai` \| 3. Søk fred → `fredsonderhandlinger_1915` | Kommandostrukturer, ressurser | — |
| `personlig_kommando` | Narrativ (KEY) | **August 1915 — Nikolaj tar kommando.** | `autoritet +10`, `hoffets_tillit -10`, `tok_personlig_kommando` → `rasputin_dilemma` | Karismatisk vs. institusjonell autoritet | `isHistoricalChoice: true` |
| `rasputin_dilemma` | Narrativ | **1915–1916 — Rasputin og Aleksandras Sirkel.** | A (hist): passivt → `støttet_rasputin`, `hoffets_tillit -15` \| B: Konfronter → `aleksej_helse -10` \| C: Sibir → `aleksej_helse -20`, `hoffets_tillit +15` | Informell makt, favorittisme | `discoveryEvent: "rasputin_innflytelse"` |
| `hub_petrograd_1916` | Hub | **1916 — Russland i krise.** | 1. Brusilov-offensiven → `brusilov_offensiv` \| 2. Duma-krisen → `duma_krav` \| 3. Rasputins mord → `rasputin_mord` | Oversikt over 1916 | — |
| `brusilov_offensiv` | Battle | **Juni 1916 — Brusilov-offensiven.** Minigame: ressursallokering. | Win → `krigsevne +25`, `folkets_stotte +10` \| Loss → `krigsevne +5` | Militær innovasjon, infiltrasjonstaktikk | `discoveryEvent: "brusilov_offensiven"` |
| `duma_krav` | Justice | **Høst 1916 — Dumas ultimatum.** | Nekter (hist) → `avslo_duma`, `hoffets_tillit -20` → `petrograd_vinter_1917` \| Innrømmer → `konstitusjonell_monarki` → `reformspor` | Parlamentarisme vs. autokrati | `isHistoricalChoice: true` for å nekte |
| `rasputin_mord` | Narrativ | **17. desember 1916 — Rasputin drapes.** | A (hist): Se bort → `hoffets_tillit +5`, `aleksej_helse -15` \| B: Arrest → `hoffets_tillit -20`, `autoritet +5` | Strafferett, klassebeskyttelse | `discoveryEvent: "rasputin_mord"` |

### ACT 3 — Revolusjon (Februar 1917 – Juli 1918)

| Node ID | Type | Beskrivelse | Valg / Utganger | Faglig Kobling | Flags / Discovery / Ethics |
|---|---|---|---|---|---|
| `petrograd_vinter_1917` | Narrativ | **Februar 1917 — Petrograd brenner.** | A (hist): Bli → `krigsevne +5`, `folkets_stotte -15` \| B: Reis → `autoritet +10` \| C: Unntakstilstand → `autoritet -20` | Revolusjonsteori, masse-bevegelser | `discoveryEvent: "februar_revolusjon_1917"` |
| `abdikasjon_beslutning` | Narrativ (KEY) | **2. mars 1917 — Avslutningen.** | A (hist): Abdiser → `abdiserte`, → `abdikasjon_scene` \| B (cond: `konstitusjonell_monarki`): Forkast → `reformspor_avslutning` \| C (cond: `britisk_tilbud`): Eksil → `aksepterte_eksil`, → `eksil_spor` | `isHistoricalChoice: true` for A |
| `abdikasjon_scene` | Narrativ | **Pskov, 3. mars 1917 — 304 år med Romanov er over.** | → `hus_arrest` | Dynastiers fall, legitimitet | `discoveryEvent: "romanov_dynastiets_fall"` |
| `hus_arrest` | Narrativ | **Mars–Oktober 1917 — Tsarskoje Selo.** | Valg: Be om eksil / Vent / Krim | — | — |
| `bolsjevik_makt` | Narrativ | **Oktober 1917 — Aurora skyter.** | → `jekaterinburg` eller `eksil_spor` | Bolsjevikenes revolusjon | `discoveryEvent: "oktoberrevolusjonen"` |
| `jekaterinburg` | Narrativ | **April–Juli 1918 — Ipatiev-huset.** | → `epilog_jekaterinburg` | Krigsforbrytelser, politisk vold | `discoveryEvent: "jekaterinburg_henrettelsen"` |

### Alternative Spor

| Node ID | Type | Beskrivelse | Betingelse |
|---|---|---|---|
| `konstitusjonell_reform_spor` | Narrativ | Russland unngår krigen. Annerledes europeisk 1914–. | Flag: `avviker_fra_historien` |
| `reformspor` | Hub | Nikolaj innrømmer Dumas krav. Konstitusjonelt monarki. | Flag: `konstitusjonell_monarki` |
| `reformspor_avslutning` | Narrativ | Styrer som konstitusjonell monark. Dynastiet overlever. | Flag: `konstitusjonell_monarki` + ikke abdisert |
| `eksil_spor` | Narrativ | Familien flykter til Storbritannia via Finland. | Flag: `aksepterte_eksil` |
| `fredsonderhandlinger_1915` | Narrativ | Forsøker separat fred med Tyskland. | Fra `østfront_krise` |

---

## 6. Discovery Events (Læreskjold)

| Event ID | Tittel | Faktaboks | Artikkellink |
|---|---|---|---|
| `juli_krisen` | Juli-krisen 1914 | 37 dager fra attentat til verdenskrig. Europas alliansenett som dominobrikker. | `/historie/forste-verdenskrig/opptakt` |
| `krigens_utbrudd_1914` | Den Store Krigens Utbrudd | Krigsbegeistringen ("Augusterlebnis") i alle europeiske storbyer. Ingen trodde det ville vare mer enn noen måneder. | `/historie/forste-verdenskrig/oversikt` |
| `tannenberg_1914` | Katastrofen ved Tannenberg | Russlands største militære nederlaget siden Napoleon. 2 arméer, 170 000 soldater, tilintetgjort på 4 dager. | `/historie/forste-verdenskrig/krigens-lop` |
| `rasputin_innflytelse` | Rasputins Skygge | Grigorij Rasputin — den mystiske munken fra Sibir. Tsarevitsjens hemofili og en mors desperate kjærlighet. | `/historie/forste-verdenskrig/russiske-revolusjon` |
| `brusilov_offensiven` | Brusilov-offensivens Geni | Den eneste vellykkede frontoffensiven i WWI. Brusilows taktiske innovasjon redefinerte moderne krigsføring. | `/historie/forste-verdenskrig/krigens-lop` |
| `februar_revolusjon_1917` | Februar-revolusjonen | 8 dager fra brødopprør til tsarens abdikasjon. Spontan revolusjon — ingen planla det slik. | `/historie/forste-verdenskrig/russiske-revolusjon` |
| `abdikasjonsdokumentet` | Abdikasjonsdokumentet | Nikolaj IIs abdikasjon: håndskrevet, udramatisk, på en togstasjon i Pskov. Slutten på 300 år med Romanov-styre. | `/historie/forste-verdenskrig/russiske-revolusjon` |
| `romanov_dynastiets_fall` | Romanov-dynastiets Fall | Fra Mikhail Romanov (1613) til Nikolaj II (1917): 304 år. | `/historie/forste-verdenskrig/russiske-revolusjon` |
| `oktoberrevolusjonen` | Oktoberrevolusjonen | Lenins bolsjeviker og Aurora-skuddet. Verdens første kommunistiske statskupp. | `/historie/forste-verdenskrig/russiske-revolusjon` |
| `jekaterinburg_henrettelsen` | Natten i Jekaterinburg | 16.–17. juli 1918. Ipatiev-huset. Hele familien Romanov, tjenere inkludert. En av historiens mørkeste netter. | `/historie/forste-verdenskrig/russiske-revolusjon` |

---

## 7. Ethics Lenses (Alle moralske valg)

| Node | Deontologisk (Kant) | Konsekvensialisme | Dygdsetikk |
|---|---|---|---|
| `mobilisering_beslutning` | Plikt til alliansen med Serbia — en avtale er en avtale. | Mobilisering vil drepe millioner. En kalkulert fred redder liv. | En sann leder bærer ansvaret for konsekvensene av sine valg. |
| `personlig_kommando` | Tsaren har plikt til å lede sitt folk i krig. | Å binde din prestisje til militære tap er strategisk selvmord. | Ekte mot er å vite grensene for din egen kompetanse. |
| `duma_krav` | Loven om tsarens absolutt styre er grunnlovsfestet. Du bryter din ed. | Å gi reformer nå kan redde millioner fra revolusjonens blodbad. | En rettferdig hersker lytter til folket sitt. |
| `abdikasjon_beslutning` | Du svikter din plikt til kronen og Russland. | Din abdikasjon kan stoppe borgerkrigen og redde millioner. | En vis mann vet når hans tid er over. |

---

## 8. Random Events (Replayability)

| ID | Betingelse | Beskrivelse | Effekt |
|---|---|---|---|
| `event_aleksej_krise` | `aleksej_helse < 40` | Aleksej er alvorlig syk. Alexandra ber deg komme hjem fra fronten. | `krigsevne -5`, `aleksej_helse +10`, `hoffets_tillit -5` |
| `event_offiser_desertering` | `krigsevne < 40` | Rapport om massedeserteringer ved Nordvestfronten. | Valg: Strengt straffe / Se bort / Amnesti |
| `event_tyske_forhandler` | Fase 2 | En tysk emissær tilbyr hemmelig fredsforhandling. | Kan gi `britisk_tilbud`-item eller sette `separatfred`-flag |
| `event_folkeopprør` | `folkets_stotte < 25` | Spontane opprør i Moskva. | `folkets_stotte -10`, `autoritet -10` |
| `event_brev_fra_fronten` | Fase 2, alltid | Et anonymt brev fra en soldat beskriver virkeligheten i skyttergravene. | `discoveryEvent: "soldatenes_verden"` |
| `event_alexandra_press` | `aleksej_helse < 50` + `støttet_rasputin` flag | Alexandra ber deg avsette en krigsminister Rasputin misliker. | Setter `hoffets_tillit -10` hvis man etterkom |

---

## 9. Epilog-system (Flag-drevne tekster)

Epilogen personaliseres basert på flags. Eksempel-kombinasjoner:

- `abdiserte` + `tok_personlig_kommando` + `avslo_duma` → Ren historisk tekst: "Historien falt ut nøyaktig som den alltid har gjort."
- `abdiserte` + `aksepterte_eksil` → "Du valgte familien over kronen, og familien overlevde."
- `konstitusjonell_monarki` + ikke `abdiserte` → "Russland ble et konstitusjonelt monarki. Kanskje."
- `diplomatisk_løsning_1914` → "WWI ble aldri 'Verdenskrigen'. Og Russland..."
- Alle ending inkluderer `historicalEcho` som sammenligner med det som virkelig skjedde.
- Klasseromsspørsmål tilpasset valgte sti.

---

## 10. Asset Prompts (AI Bildegenerering)

**Hero Image:**
> A cinematic 16:9 oil painting portrait of Tsar Nicholas II in full military regalia, standing before a frost-covered window of the Winter Palace, looking out over Petrograd. Warm candle light inside, cold grey winter light outside. 1914. Painterly, dramatic, historical realism in the style of Ilya Repin.

**Node Images:**

| Node | Prompt |
|---|---|
| `intro_sarajevo` | A cinematic 16:9 wide shot of Tsarskoje Selo palace gardens in summer 1914. A uniformed aide rushes across manicured lawns with a telegram. Golden afternoon light. Historical realism. |
| `mobilisering_beslutning` | A dimly lit 16:9 study in the Winter Palace, 1914. Tsar Nicholas II sits alone at a large oak desk, staring at military mobilization papers. A telephone and oil lamp. Deep shadows, moral weight. Historical oil painting style. |
| `tannenberg_katastrofe` | A cinematic 16:9 aerial view of the Masurian Lakes battlefield, August 1914. Columns of Russian soldiers surrounded by encircling German forces. Smoke, chaos, defeat. Dramatic realism. |
| `brusilov_offensiv` | A cinematic 16:9 war map table from 1916. Russian officers huddle over a massive tactical map showing the Brusilov Offensive lines. General Brusilov points at Galicia. Dramatic overhead lighting. |
| `duma_krav` | A tense 16:9 scene inside the Tauride Palace (Duma), Petrograd 1916. Milyukov at the podium, packed galleries, dramatic gaslight. Historical realism. |
| `abdikasjon_beslutning` | A heartbreaking 16:9 scene inside a railway carriage at Pskov station, March 1917. Nicholas II sits alone at a small table, pen in hand, abdication document before him. Snow falls outside the frosted window. Muted, grey palette. |
| `jekaterinburg` | A somber 16:9 exterior shot of the Ipatiev House in Yekaterinburg, July 1918. Night. A single light in a basement window. Dark and atmospheric. Historical realism, documentary style. |

---

## 11. Manifest-oppdatering

Legg til under `tools` for topic `forste-verdenskrig` i manifest.json:

```json
{
  "id": "nikolaj-ii",
  "title": "Tidsreise: Tsarens Skjebne",
  "description": "Spill som Nikolaj II — fra Juli-krisen 1914 til revolusjonen 1917. Kan du endre historiens løp?",
  "link": "/oving/tidsreise/nikolaj-ii",
  "icon": "crown"
}
```

---

## 12. Pedagogiske Læringsmål

Etter fullført scenario skal eleven kunne:
1. Forklare årsaksrekkefølgen fra Sarajevo-attentatet til verdenskrig (Juli-krisen)
2. Beskrive Russlands militære situasjon og sentrale slag (Tannenberg, Brusilov)
3. Analysere Rasputins rolle og uformelle maktstrukturers fare
4. Vurdere autokratiets sårbarhet i moderne industriell krig
5. Reflektere over historisk kausalitet: var revolusjonen uunngåelig?
6. Anvende etiske teorier (Kant, konsekvensialisme) på reelle politiske dilemmaer

---

## 13. Verifikasjon etter bygging

- [ ] `npm run dev` — sjekk at `/oving/tidsreise/nikolaj-ii` laster uten errors
- [ ] Naviger gjennom alle historiske valg → verifiser epilog_jekaterinburg
- [ ] Naviger gjennom alt-history (avvis mobilisering 1914) → verifiser diplomatisk_løsning-sti
- [ ] Verifiser Discovery Events vises korrekt (læreskjold med faktaboks)
- [ ] Verifiser Ethics Lens vises på alle tre viktige valg-noder
- [ ] Test Battle-minigame (Brusilov) — vinn og tap
- [ ] Test Justice-minigame (Duma) — alle tre caser
- [ ] Verifiser manifest.json oppdatert og scenariet vises under Første Verdenskrig
- [ ] Test random events trigger korrekt
- [ ] Sjekk flag-drevne epilog-tekster for minst 3 ulike sti-kombinasjoner
