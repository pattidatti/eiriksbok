# Mini-spill Blueprint: Marsjen mot Roma

> **Status:** `Approved`
> **ID:** `marsjen-mot-roma`
> **Mappe:** `src/games/marsjen-mot-roma/`
> **Knyttet til:** Mellomkrigstiden-stien, steg 6 «Fascismens fødsel» (`/historie/mellomkrigstiden/italia`)
> **Estimert omfang:** `~1100-1300 linjer (narrativt flerfase, open preset)`
> **Re-design v2 (2026-06-09):** «Bløffen med egne øyne» - eleven gjøres til etterforsker, ikke
> tilskuer. Signaturmekanikk: *Sannhetens linse*. Streng historisk observatør beholdes.

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Bygger på læringsstiens steg 6.
- **Læreplankobling:** LK20 Historie - gjøre rede for mellomkrigstiden, framveksten av diktaturer og hvordan demokratier kan undergraves.
- **Læringsmål:**
  1. Eleven kan forklare hvordan Mussolini gikk fra sosialist til fascist, og hvordan han faktisk fikk makten i 1922.
  2. Eleven kan beskrive de viktigste kjennetegnene ved fascismen (ultranasjonalisme, sterk leder, vold som politisk virkemiddel, forakt for liberale verdier).
  3. Eleven kan forklare hvorfor «marsjen mot Roma» var en bløff, og hvordan kongen og eliten lot demokratiet falle uten kamp.
- **Suksesskriterier:** Eleven *oppdager selv* - gjennom Sannhetens linse - at skrekkhæren er våte, dårlig bevæpnede menn, før noen bekrefter det. Eleven snakker med svartskjorta, offiseren og industrieieren, samler notater, og bygger til slutt forsidesaken sin av det den selv har sett. Marsjen «vinner» uten kamp fordi kongen nekter å bruke hæren. End-teksten reflekterer over at demokratiet ble myrdet av sine egne beskyttere, og at elevens makt var å *se klart og notere* - ikke å endre 1922.
- **Hva kan IKKE læres i formatet?** Den korporative staten, Matteotti-affæren, Etiopia-krigen og fascismens lange utvikling - disse hører til artikkelen `italia.json`.

---

## 2. Narrativ kjerne

- **Setting:** Veien mot Roma, oktober 1922. Regn, gjørme, kolonner av svartskjorter som forsvinner inn i tåka.
- **Spillerens rolle:** En ung journalist som etterforsker marsjen for å skrive dagens forsidesak. Kritisk observatør - ser forbi overflaten, men kan ikke endre utfallet.
- **Hovedspenning:** Vil hæren stoppe marsjen? Og: stemmer det skremmende bildet propagandaen maler, eller skjuler det noe annet?
- **Emosjonell bue:** Fra ærefrykt («for en disiplinert hær!») til avsløring («det er våte gutter med kosteskaft») til innsikt («bløffen virket fordi de som kunne stoppet den, lot være»).

---

## 3. Mekanisk kjerne

### 3.1 Signaturmekanikk: Sannhetens linse (avstand vs. nært)

Ett verb, gjentatt 5-6 ganger. Noe ser én vei ut på avstand/ved første blikk, og avsløres som noe
annet når eleven går inntil og inspiserer (`E` - «Se nærmere»). Gapet mellom propaganda-bildet og
virkeligheten ER leksjonen (kildekritikk + hvordan fascismens teater virket). Hver avsløring
registreres som et **notat** i journalistens notatbok (= et item i inventaret + et flagg).

| # | På avstand (løgnen) | Nært (sannheten) | Kilde | Notat-item |
|---|---|---|---|---|
| 1 | Disiplinert hær i tåka | Gjennomvåt gutt, kosteskaft, ingen støvler | linse (marsjerende) | `notat-haeren-kledning` |
| 2 | «Bevæpnet» kolonne | Jaktrifler og staur, knapt et ekte gevær | linse (våpenbod) | `notat-darlig-bevaepnet` |
| 3 | Heroisk plakat | «Enten med oss eller mot oss» - ingen nyanser | linse (plakat) | `notat-propaganda` |
| 4 | Krigsskadd hus | Påsatt brann, politiet så bort | linse (trykkeri) | `notat-volden` |
| 5 | Hæren = det som stopper marsjen | Lammet; venter på en ordre som aldri kommer | linse (soldat) | `notat-haeren-lammet` |
| 6 | Rik mann som heier på pøbler | Kald kalkyle: fascisme verner eiendom mot kommunisme | Conti (dialog) | `notat-elitens-svik` |

Inversjonen #1/#2 mot #5 er kjernen: den *falske* hæren marsjerer, den *ekte* hæren står stille.
De fem fysiske observasjonene ses gjennom linsen; elitens motiv (#6) kan man ikke *se* - det må man
spørre seg til. Hero-avsløringene (#1, #2) bruker en kort 1,5-2 s kamera-push-in
(`engine.playCinematic`); de øvrige en nær-monolog uten å kapre kameraet.

### 3.2 Quest-struktur

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| `samling` | Se nærmere på marsjen i leiren | Mussolinis bakgrunn; oppdag at «hæren» er en kledning |
| `marsjen` | Følg marsjen, samle bevis | Fascismens kjennetegn + squadristi-volden + propagandaen |
| `bloeffen` | Møt hæren og eliten ved veisperringen | Bløffen (Renzi) + elitens kalkyle (Conti) |
| `kongens-valg` | Vent på avgjørelsen i palasset | Kongen nekter unntakstilstanden; hæren trekker seg |
| `seieren` | Gå inn i Roma | Statskupp kledd i legalitet; demokratiet ble myrdet |
| `puzzleWon` | Forsidesaken er skrevet | Syntese; historiens dom |

- **Obligatoriske beats før klimaks** (gater `openPuzzle`, hindrer soft-lock): Renzi (`learned_bluff`),
  Gino (`learned_fascism_traits`), Conti (`learned_elite_motive`), og linse-avsløringen av
  våpnene (`saw_weapons`). Disse garanterer at de tre svar-notatene er i notatboka.

### 3.3 Syntese-finale (station-puzzle)

I stedet for en løsrevet pop-quiz: eleven bygger forsidesaken av bevisene den selv samlet. Tre
slots, merket med påstandene, der eleven plasserer det skarpeste notatet i hver:

| Slot | Påstand | Riktig notat (svar) |
|---|---|---|
| 1 | «Bevis på at marsjen var teater» | `notat-darlig-bevaepnet` |
| 2 | «Bevis på fascismens sanne natur» | `notat-fascismens-natur` (fra Gino) |
| 3 | «Bevis på hvorfor de mektige lot det skje» | `notat-elitens-svik` |

De øvrige innsamlede notatene er plausible distraktorer. `requiresItems` = de tre svar-notatene
(garantert tilstede via de obligatoriske beats). Riktig plassering starter `kongens-valg`-klimakset.
Fallback: MCQ-spørsmålene beholdes i kommentar hvis station-mode føles for vrient for målgruppen.

### 3.4 Levende verden

- `npcRoutes`: marsjerende svartskjorter vandrer (`pingpong`/`loop`) langs veien.
- `npcBehaviors`: Renzi og Conti `playerReaction: face` - de snur seg mot eleven.
- 1 lett `openActivity` (`rhythm`): synk til korsangen «A noi! A noi!» så eleven *kjenner* den
  emosjonelle dragningen `marsj_rop`-monologen beskriver. Sparsomt, valgfritt.

---

## 4. Visuell kjerne

- **Miljø:** `utendørs`, open preset. Ikke én rett korridor: leir (sør), et sidetorg mot vest med
  det utbrente trykkeriet, hovedveien, barrikade-plassen, palass-oppgangen (nord). Tåke skjuler
  begge ender av kolonnen → 96 m leses som «tusenvis».
- **Atmosfære-bue (verden forteller historien):**

| Fase | Vær | Lys (`timeOfDay`) | Effekt |
|---|---|---|---|
| samling | tungt regn, tett tåke | lav (~0.40) | klaustrofobisk; ser ikke kolonnens ende |
| marsjen | regnet letner | tåke løfter litt | skalaen avsløres |
| bloeffen | regn stopper, stille | kald, flat | spenning ved barrikaden |
| kongens-valg | tynn sprekk i skyene | svakt soldrag på palasset (`getSunDirection` + bloom) | holdt pust |
| seieren | grått igjen → mot demring | hul «seier» | togfløyte i det fjerne |

- **Fargepalett:** Behold den dempede paletten (grå himmel `0x8a8a92`, terrakotta/oker bygninger,
  sotsvarte svartskjorter, dyp rød på fanene). Tilfør dramatisk kontrast: våte refleksjoner,
  varme bål/fakler som nålestikk mot det grå, faner som henger tunge av regn.
- **Signaturobjekt:** Quirinale-palasset i enden av veien - målet marsjen aldri trenger å storme.
  I klimaks treffes det av det eneste lyset i scenen (soldraget) idet kongens beskjed kommer.
- **Lyd:** Periode-riktig 1922-lyd finnes ikke i repoet; soundscapet holdes minimalt og ærlig
  (regn-ambient + stille no-op-presets der lydfiler senere kan registreres). Den visuelle
  vær/lys-buen bærer dramaet.

---

## 5. Teknisk skisse

- **Layout:** +Z = sør (start), -Z = mot Roma. Sidetorg mot vest (-X). Spilleren går framover i -Z.
- **Player startPosition:** `[0, 0, 28]` (leiren, godt klar av bakkant for tredjepersons-kamera).
- **Faseprogresjon:** `registerUpdate` på spillerposisjon (`samling`→`marsjen`→`bloeffen`) +
  `checkClimax` (flaggsjekk: bløff + fascisme + elite + våpen-linse) som åpner syntese-puzzlen,
  hvis `onCorrect` starter `kongens-valg`→`seieren`-klimakset.
- **Linse:** `engine.registerInteract(mesh, { label: 'Se nærmere (E)', radius, onInteract })`;
  `onInteract` → `unregisterInteract` + `addItem('notat-X')` + `setFlag('saw_X')` + push-in/monolog.
- **Følsomhet:** Nøktern, advarende. Vold vises som ettervirkning (utbrent trykkeri), aldri utspilt.
  Ingen forherligelse av fascismen. Eleven kan ikke endre 1922 - det er hele poenget.

---

## 6. Pedagogisk sjekkliste

- [x] Læringsmålene er konkrete og dekker oppgavene i steg 6
- [x] 14-åring forstår teksten
- [x] Den pedagogiske kjernen (bløffen) er noe eleven OPPDAGER selv gjennom linsen, ikke bare leser
- [x] Suksesskriteriene kan observeres (linse-notater + NPC-dialoger + syntese-puzzle + end-text)
- [x] 3D-formatet er riktig verktøy (avstand-vs-nært-mekanikken finnes kun i 3D)
- [x] Streng historisk observatør: ingen elev-agens endrer utfallet
