# Scenario Blueprint: Veien mot mørket — Mellomkrigstiden
> **Status:** `Draft`
> **Engine:** `TimeTravel/Chronos`

---

## 1. Metadata & Stats

- **IDs:** `mellomkrigstiden-del1` + `mellomkrigstiden-del2`
- **Tittel:** Veien mot mørket
- **Undertittel Del 1:** Festen (1919-1929)
- **Undertittel Del 2:** Stormen (1930-1939)
- **Rolle:** Historiens Vitne (perspektivet skifter gjennom historien)
- **Era/År:** `1919-1939`
- **subjectId:** `historie`
- **topicId:** `mellomkrigstiden`
- **heroImage Del 1:** `/images/chronos/mellomkrigstiden/del1-hero.webp`
- **heroImage Del 2:** `/images/chronos/mellomkrigstiden/del2-hero.webp`
- **Visuell stil:** Farge/Art Deco for 1920s-noder, sort-hvitt Noir for 1930s-noder
- **Estimert spilletid:** 45-60 min per del (90-120 min totalt)
- **Pedagogiske kjernetemaer:**
  1. Demokrati kan dø
  2. Økonomi driver politikk (Keynes vs. Hayek / børskrakket)
  3. Alle veier leder til 1939

### Stats

| ID | Navn | Ikon | Start | Max | Kategori |
|---|---|---|---|---|---|
| `totalitar_makt` | Totalitær Makt | `zap` | 10 | 100 | core |
| `sosial_desperasjon` | Sosial Desperasjon | `users` | 20 | 100 | core |
| `historisk_innsikt` | Historisk Innsikt | `book-open` | 0 | 100 | core |
| `demokratisk_motstand` | Demokratisk Motstand | `shield` | 70 | 100 | core |

**Game-over:** Ingen game-over-betingelse. Alle spillere når 1939, men tre ulike epilog-varianter basert på flags og stats.

**Endings:**
- `ending_historisk_vitne`: `historisk_innsikt` >= 70 OG `motstod_propagandaen`-flag satt
- `ending_medskyldig`: `hjalp_fascistene`-flag satt OG `historisk_innsikt` < 40
- `ending_haplost_vitne`: Standard (alt annet)

---

## 2. Perspektivmekanikken (Kjernedesign)

Som i Kald Krig-scenariet bruker dette scenariet skiftende perspektiver. Eleven hopper mellom ulike historiske aktører og roller, og opplever mellomkrigstiden fra innsiden av de store begivenhetene.

Perspektivskiftet signaliseres gjennom:
- **Årstall og sted** i nodeteksten ("Berlin, 1923")
- **Speaker-feltet** endres til den nye rollen
- **Bakgrunnsbildet** skifter fra fargerikt Art Deco (1920s) til mørk Noir (1930s)
- **Hub-kartet** viser hvilke land/byer som er tilgjengelige

### Perspektiv-register

| ID | Navn | Fraksjon | Flagg | Rolle |
|---|---|---|---|---|
| `forteller` | Forteller | `forteller` | `📖` | Narrator mellom perspektivene |
| `clemenceau` | Georges Clemenceau | `frankrike` | `🇫🇷` | Fransk statsminister i Versailles |
| `wilson` | Woodrow Wilson | `usa` | `🇺🇸` | Amerikansk president i Versailles |
| `mussolini` | Benito Mussolini | `fascisme` | `⚡` | Fascistleder i Italia |
| `stalin` | Josef Stalin | `sovjet` | `☭` | Sovjetleder |
| `goebbels` | Joseph Goebbels | `nazisme` | `🦅` | Nazistisk propagandaminister |
| `haile_selassie` | Haile Selassie | `etiopia` | `🦁` | Etiopisk keiser |
| `chamberlain` | Neville Chamberlain | `storbritannia` | `🇬🇧` | Britisk statsminister |
| `elev_karakter` | Du (skiftende) | `vitne` | `👁` | Elevens perspektiv |

---

## 3. Narrative Flags

| Flag | Settes når | Brukes i |
|---|---|---|
| `forsto_okonomien` | Riktig valg i signal-minispillet (Black Tuesday) | Epilog |
| `valgte_fred_over_rettferdighet` | Aksepterte Versailles-vilkårene ukritisk i intro, eller støttet Chamberlain i München | Epilog |
| `hjalp_fascistene` | Tok valg som styrket Mussolini, Hitler eller Franco | Epilog-variant `ending_medskyldig` |
| `motstod_propagandaen` | Avviste propaganda-ramma i 2+ av propaganda/censor-minispillene | Epilog-variant `ending_historisk_vitne` |
| `visited_roma` | Fullført Roma-kapitlet | Hub-navigasjon Del 1 |
| `visited_berlin_1923` | Fullført Berlin 1923-kapitlet | Hub-navigasjon Del 1 |
| `visited_moskva` | Fullført Moskva-kapitlet | Hub-navigasjon Del 1 |
| `visited_new_york` | Fullført New York-kapitlet | Hub-navigasjon Del 1 |

---

## 4. DEL 1: FESTEN (1919-1929)

**Fil:** `public/content/scenarios/mellomkrigstiden-del1.json`
**startingNodeId:** `intro_versailles_1919`

### Node-oversikt Del 1

| # | Node ID | Type | Perspektiv | År | Sted | Minispill |
|---|---|---|---|---|---|---|
| 1 | `intro_versailles_1919` | Narrativ | Wilsons assistent | 1919 | Paris | - |
| 2 | `hub_verdenskart_del1` | Hub (map) | Forteller | 1919-1929 | Verden | - |
| 3 | `roma_1922_marsjen` | Narrativ | Michele (ung ital. veteran) | 1922 | Roma | - |
| 4 | `roma_speech_minispill` | Speech | Mussolini | 1922 | Roma | `speech` |
| 5 | `roma_etterpaa` | Narrativ | Forteller | 1922 | Roma | - |
| 6 | `berlin_1923_hyperinflasjon` | Narrativ | Klaus (tysk arbeider) | 1923 | Berlin | - |
| 7 | `moskva_1924_nep` | Narrativ | Aleksej (ung kommunist) | 1924 | Moskva | - |
| 8 | `moskva_allocation_minispill` | Allocation | Stalin | 1928 | Moskva | `allocation` |
| 9 | `moskva_etterpaa` | Narrativ | Forteller | 1928 | Moskva | - |
| 10 | `berlin_1928_gyldne_aar` | Narrativ | Weimar-borger | 1928 | Berlin | - |
| 11 | `weimar_propaganda_minispill` | Propaganda | NSDAP-plakatmaker | 1928 | Berlin | `propaganda` |
| 12 | `new_york_1929_pre` | Narrativ | Margaret (Wall Street-megler) | 1929 | New York | - |
| 13 | `new_york_1929_signal` | Signal | Margaret | 1929 | New York | `signal` |
| 14 | `ending_del1_bridge` | Narrativ (Overgang) | Forteller | 1929 | - | - |

### Detaljert nodeflyt Del 1

---

#### `intro_versailles_1919`
**Speaker:** Forteller → Wilson → Clemenceau
**Bakgrunn:** Speilsalen i Versailles, gylden og storslått
**Tekst:** "Paris, juni 1919. Krigen som skulle ende alle kriger er over. 17 millioner er døde. Nå skal seierherrene bestemme hvordan freden skal se ut. Du er assistent for den amerikanske delegasjonen, og to visjoner kolliderer i Speilsalen."
**Discovery Event:** Versailles-traktatens vilkår - reparasjoner på 132 milliarder gullmark, skyldparagrafen (artikkel 231), Rhinlandets avmilitarisering. Keynes advarte profetisk: "Denne freden vil ødelegge Europa."
**Kobling:** `/historie/mellomkrigstiden/oversikt`
**Valg:**
- A: "Clemenceau har rett - Tyskland må aldri kunne true oss igjen" → setter `valgte_fred_over_rettferdighet`, `totalitar_makt` +5, `sosial_desperasjon` +10 → `hub_verdenskart_del1`
- B: "Wilson har rett - en rettferdig fred er den eneste varige freden" → `historisk_innsikt` +10, `demokratisk_motstand` +5 → `hub_verdenskart_del1`
**isHistoricalChoice:** "I virkeligheten vant Clemenceaus linje. Keynes' advarsel slo til: ydmykelsen av Tyskland ble drivstoff for nazismen."

---

#### `hub_verdenskart_del1`
**uiType:** `map`
**Speaker:** Forteller
**Tekst:** "Verden 1919-1929. Fire steder kaller. Fire skjebner som former tiåret."
**Kartpunkter:**
1. 🇮🇹 Roma, 1922 → `roma_1922_marsjen` | `visitedFlag: visited_roma`
2. 🇩🇪 Berlin, 1923 → `berlin_1923_hyperinflasjon` | `visitedFlag: visited_berlin_1923`
3. ☭ Moskva, 1924 → `moskva_1924_nep` | `visitedFlag: visited_moskva`
4. 🇺🇸 New York, 1929 → `new_york_1929_pre` | `visitedFlag: visited_new_york`
5. ⏩ "Neste kapittel" → `ending_del1_bridge` | `condition.all: [visited_roma, visited_berlin_1923, visited_moskva, visited_new_york]`

---

#### `roma_1922_marsjen`
**Speaker:** Forteller → Michele
**Bakgrunn:** Roma, gatene fulle av sorthemder, fakkeltog, Art Deco i gull og rødt
**Tekst:** "Roma, oktober 1922. Du er Michele, 26 år, veteran fra Isonzo-fronten. Krigen ga deg ingenting. Ingen jobb, ingen ære. Men en mann lover alt det Italia fortjener: Benito Mussolini. 30 000 sorthemder marsjerer mot Roma. Kong Victor Emmanuel III må velge: militæret mot demonstrantene, eller gi fascistene makt."
**Discovery Event:** Fascismens ideologiske kjennetegn - anti-marxisme, anti-liberalisme, nasjonal mytologi, korporativismen som "tredje vei"
**Kobling:** `/historie/mellomkrigstiden/italia`
**Valg:**
- A: "Støtt marsjen - Italia trenger en sterk leder" → `hjalp_fascistene`, `totalitar_makt` +10 → `roma_speech_minispill`
- B: "Si til kongen at han må stanse dem med hæren" → `demokratisk_motstand` +5 → `roma_speech_minispill`

---

#### `roma_speech_minispill`
**Minispill:** `speech`
**Speaker:** Mussolini
**Tekst:** "Mussolini står foran kongen. Han skal overbevise monarken om at fascistene fortjener makten. Hvilken retorisk strategi bruker han?"
**Config:**
```json
{
  "type": "speech",
  "topic": "Italias framtid",
  "audience": "Kong Victor Emmanuel III og hans rådgivere",
  "goal": "Overbevis kongen om å utnevne deg til statsminister",
  "frames": [
    {
      "id": "nasjonal_tragedie",
      "label": "Nasjonal tragedie",
      "description": "Italia ble sveket i Versailles. Vi vant krigen men tapte freden. Bare fascistene kan gjenreise Italias ære.",
      "effectiveness": 85
    },
    {
      "id": "orden_og_stabilitet",
      "label": "Orden og stabilitet",
      "description": "Kommunistene truer med revolusjon. Bare fascistene kan gjenopprette orden. Alternativet er borgerkrig.",
      "effectiveness": 90
    },
    {
      "id": "demokratisk_reform",
      "label": "Demokratisk reform",
      "description": "Fascistene vil arbeide innenfor systemet. Vi vil styrke parlamentet, ikke erstatte det.",
      "effectiveness": 40
    }
  ],
  "winNode": "roma_etterpaa",
  "loseNode": "roma_etterpaa"
}
```
**Win-effekter:** `historisk_innsikt` +10 (forstår retorikken)
**Loss-effekter:** `totalitar_makt` +15
**isHistoricalChoice:** "Mussolini brukte begge de to første strategiene. Kongen ga etter uten kamp - marsjen mot Roma var egentlig en bløff."

---

#### `roma_etterpaa`
**Speaker:** Forteller
**Tekst:** "28. oktober 1922. Kongen nekter å erklære unntakstilstand. I stedet inviterer han Mussolini til å danne regjering. Demokratiet i Italia dør ikke med et smell - det dør med en invitasjon."
**Effekter:** `totalitar_makt` +5, `demokratisk_motstand` -5
→ `hub_verdenskart_del1`

---

#### `berlin_1923_hyperinflasjon`
**Speaker:** Forteller → Klaus
**Bakgrunn:** Berlin 1923, sort-hvitt, en mann med trillebår full av sedler, tomme butikkhyller
**Tekst:** "Berlin, november 1923. Du er Klaus, 31 år, mekaniker. I januar kostet et brød 250 mark. I november koster det 200 milliarder. Din families sparepenger fra 20 år er nå verdt mindre enn én fyrstikk. Utenfor Münchens ølhaller prøver en østerriksk korporal ved navn Adolf Hitler å ta makten med kupp."
**Discovery Event:** Den østerrikske konjunkturteorien - Riksbanken trykket penger for å betale krigserstatning, kunstig lav rente skapte feilinvesteringer, hyperinflasjonen knuste middelklassens tillit til demokratiet
**Kobling:** `/historie/mellomkrigstiden/borskrakk`, `/samfunnskunnskap/okonomi/inflasjon-og-rente`
**Valg:**
- A: "Gå på protestmøtet - krev at politikerne tar ansvar" → `historisk_innsikt` +10, `demokratisk_motstand` +5 → `hub_verdenskart_del1`
- B: "Gjemmer restene av sparepengene, vent og se" → `sosial_desperasjon` -5 → `hub_verdenskart_del1`
- C: "Hør på NSDAP-taleren - kanskje han har rett om at noen er skyld i dette" → `hjalp_fascistene`, `totalitar_makt` +5, `sosial_desperasjon` +10 → `hub_verdenskart_del1`

---

#### `moskva_1924_nep`
**Speaker:** Forteller → Aleksej
**Bakgrunn:** Moskva, røde bannere, Kreml i bakgrunnen, industriell estetikk
**Tekst:** "Moskva, januar 1924. Lenin er død. Du er Aleksej, 22 år, overbevist kommunist. Lenins testament advarte mot Stalin - 'for brutal' - men testamentet ble undertrykt. Nå kjemper Stalin, Trotskij, Zinovjev og Kamenev om makten. Og et enormt spørsmål gjenstår: skal Russland industrialiseres gradvis (NEP) eller med tvang (femårsplaner)?"
**Discovery Event:** Lenins testament - undertrykt av Stalin, advarte mot hans brutalitet og maktkonsentrasjon
**Kobling:** `/historie/mellomkrigstiden/sovjet`
**Valg:**
- A: "Støtt Stalins linje - Russland må industrialiseres raskt" → `totalitar_makt` +10 → `moskva_allocation_minispill`
- B: "Støtt Trotskijs linje - verdensrevolusjonen først" → `historisk_innsikt` +5 → `moskva_allocation_minispill`

---

#### `moskva_allocation_minispill`
**Minispill:** `allocation`
**Speaker:** Stalin
**Tekst:** "Femårsplanen begynner. Du skal fordele Sovjetunionens ressurser. Stål og demninger, eller mat til folket?"
**Config:**
```json
{
  "type": "allocation",
  "title": "Den første femårsplanen (1928-1932)",
  "budget": 100,
  "categories": [
    {
      "id": "tungindustri",
      "label": "Tungindustri",
      "description": "Stål, kullgruver, demninger. Bygger militær og økonomisk makt.",
      "icon": "factory",
      "min": 10,
      "max": 80
    },
    {
      "id": "landbruk",
      "label": "Landbruk og mat",
      "description": "Kornproduksjon, traktorer, gjødsel. Metter befolkningen.",
      "icon": "wheat",
      "min": 10,
      "max": 80
    },
    {
      "id": "utdanning",
      "label": "Utdanning og vitenskap",
      "description": "Universiteter, leseferdighet, teknisk opplæring.",
      "icon": "book",
      "min": 5,
      "max": 40
    }
  ],
  "winCondition": "landbruk >= 30",
  "winNode": "moskva_etterpaa",
  "loseNode": "moskva_etterpaa"
}
```
**Win-effekter (balanse):** `totalitar_makt` +10, `historisk_innsikt` +15
**Loss-effekter (for lite landbruk):** `totalitar_makt` +20, `sosial_desperasjon` +15
**isHistoricalChoice:** "Stalin ga 80% til tungindustri. Resultatet: verdens tredje største industriøkonomi - og Holodomor."

---

#### `moskva_etterpaa`
**Speaker:** Forteller
**Tekst (loss):** "Jernverket i Magnitogorsk reiser seg. Dnepr-demningen tennes. Men på landsbygda begynner kulakkene å forsvinne. Bønder som nekter å gi fra seg kornet kalles 'klassefiender'. Snart vil millioner sulte."
**Tekst (win):** "Du valgte å investere i mat til folket. I virkeligheten gjorde ikke Stalin det. Resultatet ble Holodomor - 4-7 millioner døde av sult i Ukraina."
→ `hub_verdenskart_del1`

---

#### `berlin_1928_gyldne_aar`
**Speaker:** Forteller
**Bakgrunn:** Berlin kabaret, jazz, neonlys, fargerikt Art Deco
**Tekst:** "Berlin, 1928. Dawes-planen pumper amerikanske dollar inn i tysk økonomi. Kabaretene svinger, Josephine Baker danser, Bauhaus bygger framtiden. NSDAP får bare 2,6% i riksdagsvalget. Alt ser ut til å gå bra. Men pengene som holder festen i gang, er lånte penger. Fra Wall Street."
**Discovery Event:** Wall Street finansierer Weimars 'gyldne år' - amerikanske lån holder tysk økonomi kunstig i live. Dawes-planen er et korthus.
→ `weimar_propaganda_minispill`

---

#### `weimar_propaganda_minispill`
**Minispill:** `propaganda`
**Speaker:** NSDAP-plakatmaker
**Tekst:** "Selv i de gyldne årene jobber NSDAP i bakgrunnen. Du er en ung grafisk designer. NSDAP ber deg designe en propagandaplakat for valgkampen 1928. Hvilken appell velger du?"
**Config:**
```json
{
  "type": "propaganda",
  "title": "NSDAP valgkamp 1928",
  "role": "Grafisk designer",
  "articles": [
    {
      "id": "nasjonal_skam",
      "headline": "Dolkestøtet: Hvem svek Tyskland?",
      "angle": "Jøder og kommunister har skylden for Versailles-ydmykelsen",
      "tone": "hatefullt",
      "truthRating": 1,
      "effects": { "totalitar_makt": 10, "sosial_desperasjon": 5 }
    },
    {
      "id": "orden_og_fremtid",
      "headline": "Hitler: Orden, arbeid, nasjonalt fellesskap",
      "angle": "Positiv framtidsvisjon med sterk leder",
      "tone": "populistisk",
      "truthRating": 2,
      "effects": { "totalitar_makt": 5 }
    },
    {
      "id": "avvis_oppdraget",
      "headline": "Nei takk - jeg designer ikke hat",
      "angle": "Du nekter å lage plakaten",
      "tone": "modig",
      "truthRating": 5,
      "effects": { "historisk_innsikt": 10, "demokratisk_motstand": 5 }
    }
  ],
  "winNode": "hub_verdenskart_del1",
  "loseNode": "hub_verdenskart_del1"
}
```
**Avvist → setter `motstod_propagandaen` (teller +1)**
**Godkjent → setter `hjalp_fascistene`**

---

#### `new_york_1929_pre`
**Speaker:** Forteller → Margaret
**Bakgrunn:** Wall Street, sepia toner, ticker-maskiner, hektisk handel
**Tekst:** "New York, oktober 1929. Du er Margaret, 28 år, en av få kvinnelige meglere på Wall Street. I fem år har aksjer bare gått oppover. Alle kjøper 'on margin' - med lånte penger. Federal Reserve har holdt renten kunstig lav. En økonom ved navn Friedrich Hayek advarer om at boblene må sprekke. Men hvem lytter til advarsler når alle tjener penger?"
→ `new_york_1929_signal`

---

#### `new_york_1929_signal`
**Minispill:** `signal`
**Speaker:** Margaret
**Tekst:** "24. oktober 1929. Markedet vakler. Signalene strømmer inn. Du må tolke dem."
**Config:**
```json
{
  "type": "signal",
  "title": "Black Tuesday - Wall Street 1929",
  "timeLimit": 45,
  "signals": [
    {
      "id": "ticker_crash",
      "text": "TICKER: US Steel ned 12% på åpning. Worst opening since...",
      "type": "warning",
      "correctAction": "sell"
    },
    {
      "id": "bank_rumor",
      "text": "RYKTE: Bank of United States kan ikke dekke margin calls",
      "type": "critical",
      "correctAction": "sell"
    },
    {
      "id": "fed_statement",
      "text": "FEDERAL RESERVE: 'Markedet har solid fundament, ingen grunn til panikk'",
      "type": "neutral",
      "correctAction": "ignore"
    },
    {
      "id": "morgan_buying",
      "text": "J.P. Morgan-bankene kjøper aksjer! Kanskje bunnen er nådd?",
      "type": "misleading",
      "correctAction": "sell"
    }
  ],
  "winNode": "ending_del1_bridge",
  "loseNode": "ending_del1_bridge"
}
```
**Win (solgte i tide) →** `forsto_okonomien`, `historisk_innsikt` +20
**Loss (holdt/kjøpte) →** `sosial_desperasjon` +25
**Discovery Event:** Den østerrikske teorien om børskrakket - Federal Reserve holdt renten kunstig lav i 1920-årene, dette skapte en kredittboble. Da boblen sprakk mistet 14 milliarder dollar sin verdi på en dag. Hayeks forklaring: feilinvesteringer drevet av falske prissignaler.
**Kobling:** `/historie/mellomkrigstiden/borskrakk`, `/samfunnskunnskap/okonomi/finanskriser`

---

#### `ending_del1_bridge`
**Speaker:** Forteller
**Bakgrunn:** Sort skjerm med hvit tekst, fade to black
**Tekst:** "29. oktober 1929. 16 millioner aksjer dumpet på en dag. Festen er over. Lysene slukkes. Verdenshandelen kollapser. Arbeidsledigheten eksploderer. I mørket som følger, våkner de gamle demonene. Mussolini har allerede makten i Roma. Stalin strammer grepet i Moskva. Og i Berlin sitter en mann med bart og venter tålmodig på sin sjanse."
**journalPrompt:** "Hva tror du skjer med vanlige folk i Tyskland, Italia og Sovjet nå som den økonomiske krisen rammer?"
**Stats-oppsummering vises.**
→ "Fortsett til Del 2: Stormen"

---

## 5. DEL 2: STORMEN (1930-1939)

**Fil:** `public/content/scenarios/mellomkrigstiden-del2.json`
**startingNodeId:** `intro_del2_1930`

### Node-oversikt Del 2

| # | Node ID | Type | Perspektiv | År | Sted | Minispill |
|---|---|---|---|---|---|---|
| 1 | `intro_del2_1930` | Narrativ | Forteller | 1930 | - | - |
| 2 | `hub_verdenskart_del2` | Hub (map) | Forteller | 1930-1939 | Verden | - |
| 3 | `berlin_1932_demokratiet` | Narrativ | Heinrich (arbeidsløs) | 1932 | Berlin | - |
| 4 | `berlin_1933_goebbels` | Narrativ + Censor | Redaktør | 1933 | Berlin | `censor` |
| 5 | `berlin_1933_etterpaa` | Narrativ | Forteller | 1933 | Berlin | - |
| 6 | `ukraina_1932_holodomor` | Narrativ | Mykola (bonde) | 1932-33 | Ukraina | - |
| 7 | `geneve_1935_abessinia` | Narrativ + Intrigue | Britisk diplomat | 1935 | Geneve | `intrigue` |
| 8 | `geneve_etterpaa` | Narrativ | Forteller | 1935 | Geneve | - |
| 9 | `mandsjuria_1931_japan` | Narrativ | Lytton-observatør | 1931-37 | Mandsjuria | - |
| 10 | `mandsjuria_domino_minispill` | Domino | Lytton-observatør | 1931-37 | Mandsjuria | `domino` |
| 11 | `mandsjuria_etterpaa` | Narrativ | Forteller | 1937 | Tokyo | - |
| 12 | `madrid_1937_guernica` | Narrativ | Fotojournalist | 1937 | Guernica | - |
| 13 | `guernica_propaganda_minispill` | Propaganda | Fotojournalist | 1937 | Guernica | `propaganda` |
| 14 | `guernica_etterpaa` | Narrativ | Forteller | 1937 | Madrid | - |
| 15 | `munchen_1938_appeasement` | Narrativ | Britisk diplomat | 1938 | München | - |
| 16 | `epilog_overgang` | Narrativ | Forteller | 1939 | Verden | - |
| 17 | `ending_historisk_vitne` | Ending | Forteller | 1939 | - | - |
| 18 | `ending_medskyldig` | Ending | Forteller | 1939 | - | - |
| 19 | `ending_haplost_vitne` | Ending | Forteller | 1939 | - | - |

### Detaljert nodeflyt Del 2

---

#### `intro_del2_1930`
**Speaker:** Forteller
**Bakgrunn:** Mørk, grå, fabrikkskorsteiner, kø utenfor suppekjøkken
**Tekst:** "1930. Krakket sprer seg som pest over verden. I USA mister 13 millioner jobben. I Tyskland stiger arbeidsledigheten fra 1,4 millioner til 6 millioner på tre år. NSDAP vokser fra 2,6% til 18,3% i riksdagsvalget. Desperasjonen har et ansikt, og demagoger kappes om å gi den en stemme."
**Importerer flags fra Del 1** (forsto_okonomien, valgte_fred_over_rettferdighet, hjalp_fascistene, motstod_propagandaen)
→ `hub_verdenskart_del2`

---

#### `hub_verdenskart_del2`
**uiType:** `map`
**Speaker:** Forteller
**Tekst:** "Verden 1930-1939. Kartet mørkner. Demokratiene faller, ett etter ett."
**Kartpunkter (sekvensielle - åpnes etter hvert som tidligere fullføres):**
1. 🇩🇪 Berlin, 1932-33 → `berlin_1932_demokratiet` | `visitedFlag: visited_berlin_1932`
2. 🇺🇦 Ukraina, 1932-33 → `ukraina_1932_holodomor` | `visitedFlag: visited_ukraina` | `condition.all: [visited_berlin_1932]`
3. 🇪🇹 Geneve, 1935 → `geneve_1935_abessinia` | `visitedFlag: visited_geneve` | `condition.all: [visited_ukraina]`
4. 🇯🇵 Mandsjuria, 1931-37 → `mandsjuria_1931_japan` | `visitedFlag: visited_mandsjuria` | `condition.all: [visited_geneve]`
5. 🇪🇸 Guernica, 1937 → `madrid_1937_guernica` | `visitedFlag: visited_guernica` | `condition.all: [visited_mandsjuria]`
6. 🇩🇪 München, 1938 → `munchen_1938_appeasement` | `visitedFlag: visited_munchen` | `condition.all: [visited_guernica]`

---

#### `berlin_1932_demokratiet`
**Speaker:** Forteller → Heinrich
**Bakgrunn:** Berlin suppekjøkken, grå, kald, Nazi-plakater på veggen
**Tekst:** "Berlin, juli 1932. Du er Heinrich, 38 år, familiefar, arbeidsløs i to år. Kona vasker klær for andre. Barna er tynne. Utenfor suppekjøkkenet roper en NSDAP-taler: 'Vi gir dere arbeid, brød og ære!' På den andre siden roper kommunistene: 'Arbeidere, foren dere!' Og midt imellom sitter Weimar-demokratene og virker maktesløse."
**Valg:**
- A: "Stem på Weimar-koalisjonen (SPD) - demokratiet må overleve" → `demokratisk_motstand` +5, `historisk_innsikt` +10 → `berlin_1933_goebbels`
- B: "Stem på NSDAP - de er i det minste handlekraftige" → `hjalp_fascistene`, `totalitar_makt` +15, `demokratisk_motstand` -10 → `berlin_1933_goebbels`
- C: "Stem på KPD (kommunistene) - arbeiderne må ta makten" → `sosial_desperasjon` -5, `totalitar_makt` +10 → `berlin_1933_goebbels`
**isHistoricalChoice:** "30. januar 1933. President Hindenburg utnevner Hitler til rikskansler. 'Vi har hyret ham,' sa politikerne som trodde de kunne kontrollere ham. De tok feil."

---

#### `berlin_1933_goebbels`
**Minispill:** `censor`
**Speaker:** Goebbels → Redaktør
**Bakgrunn:** Avisredaksjon i Berlin, røyk, Riksdagsbrannen i bakgrunnen
**Tekst:** "Berlin, mars 1933. Riksdagsbrannen har nettopp gitt Hitler påskudd til Fullmaktsloven. Du er redaktør i Berliner Tageblatt. Telefonen ringer. Det er Goebbels' kontor: 'Fra nå av godkjenner vi alle forsider. Her er morgendagens overskrift.'"
**Config:**
```json
{
  "type": "censor",
  "title": "Pressefrihetens fall - Berlin 1933",
  "role": "Redaktør, Berliner Tageblatt",
  "articles": [
    {
      "id": "riksdagsbrannen",
      "headline": "Riksdagsbrannen: Kommunistisk sammensvergelse avslørt!",
      "realStory": "Sannsynligvis påsatt av nazistene selv, eller utført av en enkelt pyroman (van der Lubbe). Brukt som påskudd for nødforordningen.",
      "options": [
        { "label": "Trykk som det er", "censored": false, "truthful": false },
        { "label": "Legg til tvil om bevisene", "censored": false, "truthful": true },
        { "label": "Nekt å trykke løgnen", "censored": true, "truthful": true }
      ]
    },
    {
      "id": "fullmaktsloven",
      "headline": "Fullmaktsloven: Parlamentet gir Hitler all makt",
      "realStory": "Vedtatt 23. mars 1933. Bare SPD stemte mot. KPD var allerede forbudt. Demokratiet avviklet seg selv ved avstemning.",
      "options": [
        { "label": "Kall det en seier for stabiliteten", "censored": false, "truthful": false },
        { "label": "Rapporter nøytralt at SPD stemte mot", "censored": false, "truthful": true },
        { "label": "Skriv at dette er slutten for demokratiet", "censored": true, "truthful": true }
      ]
    }
  ],
  "winNode": "berlin_1933_etterpaa",
  "loseNode": "berlin_1933_etterpaa"
}
```
**Motstår (truthful) →** `motstod_propagandaen` (+1), `demokratisk_motstand` +10
**Bøyer seg →** `hjalp_fascistene`, `demokratisk_motstand` -10
**Discovery Event:** Pressefrihetens fall - innen 1934 var alle uavhengige aviser i Tyskland enten stengt eller ensrettet under Goebbels' kontroll
**Kobling:** `/historie/mellomkrigstiden/tyskland`

---

#### `berlin_1933_etterpaa`
**Speaker:** Forteller
**Tekst:** "Innen slutten av 1933 er Tyskland forvandlet. Fagforeninger forbudt. Opposisjonspartier oppløst. Bokbål i Berlin. Konsentrasjonsleiren Dachau åpner for politiske fanger. Alt på under ett år. Demokratiet døde ikke med en invasjon - det stemte seg selv bort."
**Effekter:** `totalitar_makt` +10, `demokratisk_motstand` -15
→ `hub_verdenskart_del2`

---

#### `ukraina_1932_holodomor`
**Speaker:** Forteller → Mykola
**Bakgrunn:** Ukrainsk landsby, vinter, tom jord, gråtoneskala
**Tekst:** "Ukraina, vinteren 1932-33. Du er Mykola, 34 år, bonde i landsbyen Harkiv. Stalins brigader har tømt kornlagrene. Landsbyen er sperret av - ingen får reise til byen for å kjøpe mat. Naboene dine sulter. Du har gjemt en liten sekk korn under gulvet."
**Discovery Event:** Holodomor - 4-7 millioner ukrainere sultet i hjel som resultat av Stalins tvangskollektivisering. Landsbyer ble sperret av, korn konfiskert, flukt straffet med arrestasjon. Verden ignorerte det.
**Kobling:** `/historie/mellomkrigstiden/sovjet`
**Valg:**
- A: "Del kornet med naboens barn - de sulter" → `historisk_innsikt` +10, `sosial_desperasjon` +5 → `hub_verdenskart_del2`
- B: "Rapporter at naboen gjemmer korn (for å redde deg selv)" → `hjalp_fascistene` (autoritær medløper), `sosial_desperasjon` +10 → `hub_verdenskart_del2`
- C: "Flykt til byen med familien din" → `sosial_desperasjon` +10, `demokratisk_motstand` -5 → `hub_verdenskart_del2`
**ethicsLens:**
  - **Deontological:** "Å angi naboen er galt uansett konsekvens. Du vet at personen er uskyldig."
  - **Consequentialist:** "Hvis du deler kornet, redder du kanskje noen, men familien din kan dø. Hva gir flest overlevende?"
  - **Virtue:** "Hva slags person vil du være? En som delte eller en som angi?"

---

#### `geneve_1935_abessinia`
**Minispill:** `intrigue`
**Speaker:** Forteller → Britisk diplomat
**Bakgrunn:** Folkeforbundets storsal i Geneve, marmorsøyler, diplomatisk spenning
**Tekst:** "Geneve, oktober 1935. Keiser Haile Selassie av Etiopia står foran Folkeforbundet. Mussolinis hær har invadert med fly, tanks og sennepsgass mot spyd og skjold. Selassie taler: 'Det er oss i dag. Det er dere i morgen.' Du er britisk diplomat. Hva gjør Storbritannia?"
**Config:**
```json
{
  "type": "intrigue",
  "title": "Folkeforbundets Abessinia-krise 1935",
  "role": "Britisk diplomat",
  "parties": [
    { "id": "storbritannia", "label": "Storbritannia", "trust": 60 },
    { "id": "frankrike", "label": "Frankrike", "trust": 50 },
    { "id": "italia", "label": "Italia", "trust": 30 },
    { "id": "etiopia", "label": "Etiopia", "trust": 80 }
  ],
  "rounds": 3,
  "winCondition": "etiopia.trust >= 60 AND italia.trust <= 20",
  "winNode": "geneve_etterpaa",
  "loseNode": "geneve_etterpaa"
}
```
**Krever sanksjoner →** `demokratisk_motstand` +15, `historisk_innsikt` +10
**Kompromiss →** `valgte_fred_over_rettferdighet`
**Ingen reaksjon →** `totalitar_makt` +20
**Discovery Event:** Folkeforbundets strukturelle svakheter - USA aldri med, ingen egen hærmakt, vetomakt for stormaktene, sanksjoner uten tyngde
**Kobling:** `/historie/mellomkrigstiden/folkeforbundet`
**isHistoricalChoice:** "I virkeligheten vedtok Folkeforbundet sanksjoner, men utelot olje, stål og kull - akkurat det Italia trengte for krigen. Etiopia falt i mai 1936."

---

#### `geneve_etterpaa`
**Speaker:** Haile Selassie
**Tekst:** "'I dag er det oss. I morgen er det dere.' Keiseren hadde rett. Da Italia angrep Etiopia uten konsekvenser, lærte Hitler og Japan at Folkeforbundet var tannløst. Veien til München 1938 startet her."
→ `hub_verdenskart_del2`

---

#### `mandsjuria_1931_japan`
**Speaker:** Forteller → Lytton-observatør
**Bakgrunn:** Mandsjuria, tog, japanske soldater, dokumentarisk noir
**Tekst:** "Mandsjuria, september 1931. Du er medlem av Lytton-kommisjonen, sendt av Folkeforbundet for å undersøke Japans invasjon. Kwantung-hæren sprengte sitt eget jernbanespor og skyldte på kineserne - et falskt flagg-angrep. Nå kontrollerer Japan hele Mandsjuria og har satt opp marionettstaten Manchukuo med den siste Qing-keiseren som nikkedukke."
**Discovery Event:** Militærets gradvise kontroll over japansk demokrati - unge offiserer myrdet to statsministre mellom 1930-36, og innen 1937 styrte militæret utenrikspolitikken
**Kobling:** `/historie/mellomkrigstiden/japan`
→ `mandsjuria_domino_minispill`

---

#### `mandsjuria_domino_minispill`
**Minispill:** `domino`
**Speaker:** Lytton-observatør
**Tekst:** "Japans ekspansjon er en dominoeffekt. Kan du stoppe den?"
**Config:**
```json
{
  "type": "domino",
  "title": "Japans ekspansjon i Asia (1931-1941)",
  "rounds": 4,
  "territories": [
    { "id": "mandsjuria", "label": "Mandsjuria (1931)", "difficulty": 40 },
    { "id": "jehol", "label": "Jehol-provinsen (1933)", "difficulty": 55 },
    { "id": "kina", "label": "Krig i Kina (1937)", "difficulty": 70 },
    { "id": "indokina", "label": "Fransk Indokina (1940)", "difficulty": 85 }
  ],
  "winCondition": "stopped >= 2",
  "winNode": "mandsjuria_etterpaa",
  "loseNode": "mandsjuria_etterpaa"
}
```
**Stopper 2+ →** `historisk_innsikt` +15
**Stopper 0-1 →** `totalitar_makt` +15

---

#### `mandsjuria_etterpaa`
**Speaker:** Forteller
**Tekst:** "Da Lytton-rapporten erklærte Japans invasjon ulovlig, svarte Japan med å forlate Folkeforbundet. Ingen løftet en finger. I 1937 angrep Japan Kina. Massakren i Nanjing tok livet av minst 100 000 sivile. Veien mot Pearl Harbor var åpen."
→ `hub_verdenskart_del2`

---

#### `madrid_1937_guernica`
**Speaker:** Forteller → Fotojournalist
**Bakgrunn:** Guernicas ruiner, røyk, sort-hvitt, dramatisk skygge
**Tekst:** "Guernica, 26. april 1937. Du er fotojournalist i den spanske borgerkrigen. I dag bombet Hitlers Condor-legion den lille baskiske byen Guernica i tre timer. Minst 200 sivile drept. Francos folk sier det aldri skjedde - at republikanerne selv satte fyr på byen for propaganda. Du har bildene. Hva gjør du med dem?"
**Kobling:** `/historie/mellomkrigstiden/spania`
→ `guernica_propaganda_minispill`

---

#### `guernica_propaganda_minispill`
**Minispill:** `propaganda`
**Speaker:** Fotojournalist
**Tekst:** "Du har dokumentert sannheten. Men hvem forteller historien?"
**Config:**
```json
{
  "type": "propaganda",
  "title": "Hvem eier sannheten om Guernica?",
  "role": "Fotojournalist",
  "articles": [
    {
      "id": "publiser_sannheten",
      "headline": "GUERNICA I RUINER: Tyske fly bomber sivile i tre timer",
      "angle": "Dokumentar - dine bilder viser bombingene, øyenvitnene, de døde barna",
      "tone": "saklig",
      "truthRating": 5,
      "effects": { "historisk_innsikt": 15, "demokratisk_motstand": 5 }
    },
    {
      "id": "franco_narrativ",
      "headline": "Baskiske anarkister brenner sin egen by - frykter Francos frigjøring",
      "angle": "Francos versjon: republikanerne satte fyr på byen som propaganda",
      "tone": "løgnaktig",
      "truthRating": 1,
      "effects": { "totalitar_makt": 10 }
    },
    {
      "id": "begge_sider",
      "headline": "Uklare rapporter fra Guernica - begge sider anklager hverandre",
      "angle": "Falsk balanse: presenterer løgnen og sannheten som likeverdige",
      "tone": "feig",
      "truthRating": 2,
      "effects": { "sosial_desperasjon": 5 }
    }
  ],
  "winNode": "guernica_etterpaa",
  "loseNode": "guernica_etterpaa"
}
```
**Publiserer sannheten →** `motstod_propagandaen` (+1), `historisk_innsikt` +15
**Franco-narrativ →** `hjalp_fascistene`
**isHistoricalChoice:** "Pablo Picasso svarte med maleriet Guernica - et av historiens mektigste antikrigskunstverk. Sannheten vant til slutt. Men i 1937 klarte Franco å holde løgnen levende i mange aviser."

---

#### `guernica_etterpaa`
**Speaker:** Forteller
**Tekst:** "Den spanske borgerkrigen var generalprøven. Hitler testet Luftwaffe. Mussolini sendte tropper. Stalin sendte våpen til republikanerne. Storbritannia og Frankrike valgte 'ikke-intervensjon.' Og 35 000 frivillige fra 50 land reiste til Spania for å kjempe mot fascismen - de internasjonale brigadene. Blant dem var George Orwell og Ernest Hemingway."
→ `hub_verdenskart_del2`

---

#### `munchen_1938_appeasement`
**Speaker:** Forteller → Britisk diplomat
**Bakgrunn:** München-konferansen, mørkt mahogni-rom, Chamberlain og Hitler
**Tekst:** "München, 29. september 1938. Du er rådgiver for statsminister Chamberlain. Hitler krever Sudetenland - den tysktalende delen av Tsjekkoslovakia. Chamberlain har fløyet til München for å forhandle. Churchill advarer fra London: 'Dere hadde valget mellom vanære og krig. Dere valgte vanæren, og dere vil få krigen.' Tsjekkoslovakia er ikke invitert til forhandlingene om sitt eget land."
**Discovery Event:** Appeasement-begrepet - å gi etter for en aggressors krav for å unngå krig. München 1938 viste at appeasement bare utsetter konflikten og styrker angriperen.
**Valg:**
- A: "Støtt Chamberlain - fred i vår tid er verdt ethvert kompromiss" → `valgte_fred_over_rettferdighet`, `demokratisk_motstand` -10, `totalitar_makt` +10 → `epilog_overgang`
- B: "Advar Chamberlain - dette er ikke fred, det er kapitulasjon" → `historisk_innsikt` +15, `demokratisk_motstand` +5 → `epilog_overgang`
- C: "Foreslå en folkeavstemning i Sudetenland - la folket bestemme" → `historisk_innsikt` +5, `demokratisk_motstand` +5 → `epilog_overgang`
**isHistoricalChoice:** "Chamberlain kom hjem med avtalen og erklærte 'Fred i vår tid.' Seks måneder senere okkuperte Hitler resten av Tsjekkoslovakia. Ett år senere startet andre verdenskrig."

---

#### `epilog_overgang`
**Speaker:** Forteller
**Bakgrunn:** Helt sort, gradvis fade-in av hvit tekst
**Tekst:** "1. september 1939. Klokken 04:45 åpner det tyske slagskipet Schleswig-Holstein ild mot den polske garnisonen på Westerplatte. Tyske stridsvogner krysser grensen. Luftwaffe bomber Warszawa. Radioen kunngjør krig. Du har vært vitne til alt som ledet hit. Tjue år med feilgrep, desperasjon, hat og feighet kulminerer i det øyeblikket verden fryktet mest. Forstod du det du så?"
**journalPrompt:** "Hvilke av de valgene du tok kunne ha endret historien? Eller var krigen uunngåelig fra det øyeblikket Versailles-traktaten ble signert?"
**Klasseromsspørsmål:**
1. "Kunne andre verdenskrig vært unngått? Når var 'point of no return'?"
2. "Hvem bærer mest skyld - lederne som grep makten, eller vanlige folk som lot det skje?"
3. "Ser du paralleller til dagens politiske debatter?"
→ epilog basert på flags

---

#### `ending_historisk_vitne`
**Betingelse:** `historisk_innsikt` >= 70 OG `motstod_propagandaen`-flag satt
**Speaker:** Forteller
**Tekst:** "Du reiste gjennom tjue år med kaos, løgner og frykt. Du gjennomskuet propagandaen. Du forsto at børskrakket ikke bare var uflaks, men resultatet av kunstig kredittekspansjon. Du så at demokratiet ikke ble styrtet med kupp, men stemte seg selv bort. Du valgte å stå imot der du kunne. Du er et historisk vitne - en som forsto det de så."
**historicalEcho:** "Winston Churchill sa: 'De som ikke lærer av historien, er dømt til å gjenta den.' Du lærte."
**epilogue flag-entries:**
- `forsto_okonomien`: "Du gjennomskuet Federal Reserves falske signaler og solgte i tide. Hayek ville vært stolt."
- `motstod_propagandaen`: "Du nektet å bøye deg for Goebbels og Franco. Sannheten overlevde."
- `valgte_fred_over_rettferdighet` (if set): "Men i Versailles og München valgte du den enkle freden. Kanskje ingen kunne gjort det annerledes."

---

#### `ending_medskyldig`
**Betingelse:** `hjalp_fascistene`-flag satt OG `historisk_innsikt` < 40
**Speaker:** Forteller
**Tekst:** "Du tok de valgene som var lettest i øyeblikket. Du stemte med frykten. Du trykket løgnene. Du ga makten til dem som ropte høyest. Du er ikke ond - du er menneskelig. Og det var akkurat slik det skjedde med millioner av vanlige folk i Italia, Tyskland, Japan og Sovjet. De fleste medløpere mente ikke noe vondt. De var bare redde."
**historicalEcho:** "Hannah Arendt kalte det 'ondskapens banalitet' - evnen til å gjøre forferdelige ting uten å mene det."
**epilogue flag-entries:**
- `hjalp_fascistene`: "Du støttet marsjen mot Roma, stemte NSDAP, og trykket Francos løgner. Slik bygges diktaturer - stein for stein, av vanlige folk."
- `valgte_fred_over_rettferdighet` (if set): "Og da freden sto på spill, valgte du alltid det mest komfortable. Det gjorde Chamberlain også."

---

#### `ending_haplost_vitne`
**Betingelse:** Standard (alt annet)
**Speaker:** Forteller
**Tekst:** "Du så det skje. Du skjønte ikke alltid hva du så. Du tok noen gode valg og noen dårlige. Du var verken helt eller medløper - du var et menneske fanget i historiens malstrøm. Som de fleste. Og kanskje er det den viktigste lærdommen: historien formes ikke bare av diktatorer og helter, men av vanlige folk som deg."
**historicalEcho:** "Primo Levi skrev: 'Det skjedde, altså kan det skje igjen.' Spørsmålet er om du nå vil gjenkjenne tegnene."

---

## 6. Gjenstander & Crafting

Ingen gjenstander i dette scenariet. Mekanikken drives av stats, flags og minispill.

---

## 7. Asset-prompts (AI-bilder)

### Hero Images
- **Del 1 Hero:** `A vibrant, colorful Art Deco cinematic 16:9 photograph of 1920s Paris or New York, champagne glasses, jazz musicians, skyscrapers under construction, golden light, glamour and excess, the last party before the storm. Highly realistic, 4K.`
- **Del 2 Hero:** `A dark, gritty film noir cinematic 16:9 photograph of 1930s Berlin, grey skies, swastika flags visible in background, unemployed men in soup kitchen lines, factory smokestacks, stark shadows, despair and menace. Black and white with deep contrast. Highly realistic, 4K.`

### Node-bilder (16:9 WebP)
| Filnavn | Prompt |
|---|---|
| `versailles_1919.webp` | `Cinematic 16:9 of the Hall of Mirrors, Versailles, 1919. Politicians in dark formal suits signing documents at a grand table. Tense faces, gilded chandeliers, baroque splendor. Warm golden light. Realistic historical photograph aesthetic.` |
| `roma_marsjen_1922.webp` | `Cinematic 16:9 of Blackshirts marching through Rome streets, October 1922. Thousands of men in black shirts with torches and Italian flags. Art Deco buildings, warm autumn light. Period color photography aesthetic.` |
| `berlin_hyperinflasjon_1923.webp` | `A German worker pushing a wheelbarrow overflowing with banknotes through 1923 Berlin streets. Desperate expression, worn clothes, empty shop windows behind. Black and white, documentary film noir aesthetic. 16:9.` |
| `moskva_femarsplan_1928.webp` | `Massive Soviet industrial construction - the Dnepr Dam rises against grey skies, workers in silhouette. Red banners, smoke, industrial power. Cinematic 16:9, propaganda poster meets documentary realism.` |
| `berlin_kabaret_1928.webp` | `1920s Berlin cabaret scene - jazz musicians, Art Deco interior, neon lights, dancers, champagne. Colorful, vibrant, golden glow. A last glimpse of Weimar's golden age. 16:9 cinematic.` |
| `new_york_black_tuesday.webp` | `Panicked Wall Street brokers on October 29, 1929. Ticker tape machines spewing paper. Crowds pressing against stock exchange doors. Cinematic 16:9, warm sepia tones fading to cold grey.` |
| `berlin_suppekjokken_1932.webp` | `Unemployed German men in long queue outside a soup kitchen, Berlin 1932. Nazi election posters on walls behind. Grey, cold, desperate. Black and white documentary, stark shadows. 16:9.` |
| `berlin_riksdagsbrannen_1933.webp` | `The Reichstag building burning at night, February 1933. Flames and smoke against black sky. Fire trucks, crowd watching. Dramatic noir lighting. 16:9 cinematic.` |
| `ukraina_holodomor_1933.webp` | `Empty Ukrainian wheat fields in winter, a lone farmhouse, grey skies, bare trees. Desolate and haunting. No people visible - just absence. Muted tones, documentary aesthetic. 16:9.` |
| `geneve_folkeforbundet.webp` | `Haile Selassie speaks at the League of Nations in Geneva, 1936. Small African emperor at enormous podium. European delegates in suits stare impassively. Grand marble hall, cold light. Documentary 16:9 realism.` |
| `mandsjuria_1931.webp` | `Japanese soldiers marching through Manchurian landscape, 1931. Railway tracks, military vehicles, occupied Chinese town in background. Documentary black and white, hard shadows. 16:9.` |
| `guernica_1937.webp` | `Smoking ruins of Guernica, April 1937. A lone photographer kneels in rubble, camera in hand. Destroyed buildings, dust in air. Dramatic black and white, hard shadows, documentary cinematography. 16:9.` |
| `munchen_1938.webp` | `Munich Conference, September 1938. Chamberlain and Hitler shake hands in a dark mahogany room. Tense, formal atmosphere. Period photography aesthetic, slightly warm tones. 16:9 cinematic.` |
| `epilog_1939.webp` | `German Panzer tanks crossing the Polish border at dawn, September 1, 1939. Grey morning light, dust, advancing column. The beginning of war. Black and white, stark, documentary. 16:9.` |

---

## 8. Koblingspunkter til eksisterende innhold

| Discovery Event / Node | Kobles til artikkel |
|---|---|
| Versailles-vilkårene | `/historie/mellomkrigstiden/oversikt` |
| Fascismens kjennetegn | `/historie/mellomkrigstiden/italia` |
| Østerriksk konjunkturteori / hyperinflasjon | `/historie/mellomkrigstiden/borskrakk`, `/samfunnskunnskap/okonomi/inflasjon-og-rente` |
| Lenins testament / Stalins maktkamp | `/historie/mellomkrigstiden/sovjet` |
| Børskrakket 1929 | `/historie/mellomkrigstiden/borskrakk`, `/samfunnskunnskap/okonomi/finanskriser` |
| Weimars fall / NSDAP | `/historie/mellomkrigstiden/tyskland` |
| Pressefrihetens fall | `/historie/mellomkrigstiden/tyskland` |
| Holodomor | `/historie/mellomkrigstiden/sovjet` |
| Folkeforbundets svakheter | `/historie/mellomkrigstiden/folkeforbundet` |
| Japansk militarisme | `/historie/mellomkrigstiden/japan` |
| Guernica / spanske borgerkrig | `/historie/mellomkrigstiden/spania` |
| Appeasement | `/historie/mellomkrigstiden/oversikt` |

---

## 9. Manifest-registrering

Legg til under `historie/mellomkrigstiden/tools` i `manifest.json`:

```json
{
  "id": "mellomkrigstiden-del1",
  "title": "Tidsreise: Veien mot mørket - Del 1 (1919-1929)",
  "description": "Spill som vitne til mellomkrigstiden - fra Versailles til børskrakket.",
  "link": "/oving/tidsreise/mellomkrigstiden-del1",
  "icon": "clock"
},
{
  "id": "mellomkrigstiden-del2",
  "title": "Tidsreise: Veien mot mørket - Del 2 (1930-1939)",
  "description": "Fra Hitlers maktovertakelse til 1. september 1939.",
  "link": "/oving/tidsreise/mellomkrigstiden-del2",
  "icon": "clock"
}
```

Legg til begge scenariene i `TimeTravelPage.tsx` scenariolisten.
