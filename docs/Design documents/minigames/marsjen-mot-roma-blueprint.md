# Mini-spill Blueprint: Marsjen mot Roma

> **Status:** `Approved`
> **ID:** `marsjen-mot-roma`
> **Mappe:** `src/games/marsjen-mot-roma/`
> **Knyttet til:** Mellomkrigstiden-stien, steg 6 «Fascismens fødsel» (`/historie/mellomkrigstiden/italia`)
> **Estimert omfang:** `~700-900 linjer (narrativt flerfase, open preset)`

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Bygger på læringsstiens steg 6.
- **Læreplankobling:** LK20 Historie - gjøre rede for mellomkrigstiden, framveksten av diktaturer og hvordan demokratier kan undergraves.
- **Læringsmål:**
  1. Eleven kan forklare hvordan Mussolini gikk fra sosialist til fascist, og hvordan han faktisk fikk makten i 1922.
  2. Eleven kan beskrive de viktigste kjennetegnene ved fascismen (ultranasjonalisme, sterk leder, vold som politisk virkemiddel, forakt for liberale verdier).
  3. Eleven kan forklare hvorfor «marsjen mot Roma» var en bløff, og hvordan kongen og eliten lot demokratiet falle uten kamp.
- **Suksesskriterier:** Eleven snakker med svartskjorta, offiseren og industrieieren, og opplever at marsjen «vinner» uten å kjempe fordi kongen nekter å bruke hæren. End-teksten reflekterer over at demokratiet ble myrdet av sine egne beskyttere, og spør om moderne paralleller.
- **Hva kan IKKE læres i formatet?** Den korporative staten, Matteotti-affæren, Etiopia-krigen og fascismens lange utvikling - disse hører til artikkelen `italia.json`.

---

## 2. Narrativ kjerne

- **Setting:** Veien mot Roma, oktober 1922. Regn, gjørme, kolonner av svartskjorter.
- **Spillerens rolle:** En ung journalist som følger marsjen for å forstå hva som egentlig skjer. Kritisk tilskuer - ikke deltaker.
- **Hovedspenning:** Vil hæren stoppe marsjen? Kan denne dårlig bevæpnede, våte flokken virkelig ta makten?
- **Emosjonell bue:** Fra forvirring («er dette en revolusjon?») til innsikt («det var en bløff - og den virket fordi ingen turte å stoppe den»).

---

## 3. Mekanisk kjerne

- **Spill-type:** `utendørs-utforskning` (open preset), fler-fase «marsj framover med innskutt læring» (samme mønster som `caesar-ides`).
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon | Oppgave i steg 6 |
|---|---|---|---|
| `samling` | Snakk med svartskjortene i leiren | Mussolinis bakgrunn, hvorfor de marsjerer | Oppg. 1 |
| `marsjen` | Følg marsjen mot Roma | Fascismens kjennetegn + squadristi-volden (utbrent trykkeri) | Oppg. 3 |
| `bloeffen` | Møt hæren ved veisperringen | Marsjen er en bløff - hæren kunne knust dem | Oppg. 2 |
| `kongens-valg` | Forstå hvem som slipper dem gjennom | Elitens kalkyle + fascisme vs. kommunisme | Oppg. 4 + 5 |
| `seieren` | Gå inn i Roma | Statskupp kledd i legalitet; demokratiet ble myrdet | Oppg. 6 (refleksjon i end-text) |

- **NPCer:**
  - `carlo` - Carlo, svartskjorte-veteran (`farmer`) - Mussolinis bakgrunn
  - `gino` - Gino, ung fanatiker (`farmer`) - fascismens kjennetegn + skryt om volden
  - `pietro` - Pietro, typograf med utbrent trykkeri (`farmer`, worried) - volden sett fra offeret + hvorfor staten ser bort
  - `kaptein` - Kaptein Renzi (`noble`) - bløffen; hæren venter på en ordre som aldri kommer
  - `conti` - Signor Conti, industrieier (`noble`) - elitens kalkyle + fascisme vs. kommunisme
- **Nøkkel-items:** `presskort` (journalistens identitet), `fascist-program` (det kaotiske 1919-programmet - leses i inventar). Flavor/dybde, ikke puzzle.
- **Gating:** En veisperring (soldater) blokkerer veien ved z=-6. Den fjernes først når eleven har lært bløffen (Renzi) og elitens motiv (Conti) - da «kommer beskjeden» om at kongen nekter unntakstilstanden, og soldatene trekker seg.
- **Slutt-tekst:** Variabel - en ekstra linje hvis eleven sammenlignet fascisme og kommunisme med Conti.

---

## 4. Visuell kjerne

- **Miljø:** `utendørs`, open preset
- **Tid på døgnet:** `0.45` med tungt skydekke (overskyet, regn)
- **Vær:** `rain`, intensitet ~0.55 (den ekte marsjen var regnvåt)
- **Stemning:** Grå, våt, truende - men kaotisk, ikke heroisk. Bløffen skal SES: dårlig utstyr, gjørme.
- **Fargepalett:** Grå himmel `0x8a8a92`, terrakotta/oker bygninger, sotsvarte svartskjorter, dyp rød på fanene (sobert, ikke dyrket).
- **Signaturobjekt:** Quirinale-palasset i enden av veien (marmor-portiko) - målet marsjen aldri trenger å storme.

---

## 5. Teknisk skisse

- **Layout:** +Z = sør (start), -Z = mot Roma. Spilleren går framover i -Z. Vei langs Z-aksen.
- **Player startPosition:** `[0, 0, 28]` (leiren, godt klar av bakkant for tredjepersons-kamera).
- **Faseprogresjon:** `registerUpdate` på spillerposisjon (`samling`→`marsjen`→`bloeffen`) + flaggsjekk (`checkAdvance`) for `kongens-valg`→`seieren`-klimakset.
- **Følsomhet:** Nøktern, advarende. Fokus på mekanismen (bløffen, demokratiets overgivelse). Vold vises som ettervirkning (utbrent trykkeri), aldri utspilt. Ingen forherligelse av fascismen.

---

## 6. Pedagogisk sjekkliste

- [x] Læringsmålene er konkrete og dekker oppgavene i steg 6
- [x] 14-åring forstår teksten
- [x] Den pedagogiske kjernen (bløffen) er noe eleven OPPLEVER, ikke bare leser
- [x] Suksesskriteriene kan observeres (NPC-dialoger + end-text)
- [x] 3D-formatet er riktig verktøy (atmosfære og «marsj framover» bærer læringen)
