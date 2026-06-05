# Mini-spill Blueprint: Muntlig eksamen i norsk

> **Status:** `Approved`
> **ID:** `eksamen-norsk`
> **Mappe:** `src/games/eksamen-norsk/`
> **Estimert omfang:** `eksamen-samfunnsfag-nivå (~800 linjer)`
> **Søsterspill:** `eksamen-samfunnsfag` (samme tre-dagers arkitektur)

---

## 1. Pedagogisk kjerne

- **Fag:** `norsk`
- **Målgruppe:** 10. trinn, rett før muntlig eksamen. Eleven har lest eksamensartiklene (`/norsk/eksamen/muntlig` og modellsvaret `/norsk/eksamen/muntlig-modell`), men har aldri kjent på selve situasjonen.
- **Læreplankobling:** Norsk etter 10. trinn (LK20): presentere fagstoff med fagspråk og argumentere saklig; lese og reflektere over skjønnlitteratur; sammenligne og tolke tekster ut fra historisk kontekst og egen samtid; bruke kunnskap om språk og tekst i samtaler om tekster.
- **Læringsmål:**
  1. Eleven kan bygge en presentasjon rundt en skarp påstand i stedet for å gjenfortelle handling.
  2. Eleven kan koble tekster til litteraturhistoriske epoker, navngi virkemidler og forklare effekten med presise sitater.
  3. Eleven kan møte oppfølgingsspørsmål i en fagsamtale, også et spørsmål som kobler temaet til vår egen tid (utenfor det man forberedte).
- **Suksesskriterier:** Observeres i valgene: eleven åpner med en påstand framfor en innholdsfortegnelse, analyserer i stedet for å referere, holder en rød tråd gjennom tre epoker, bruker presise sitater og navngir virkemidler, sirkler tilbake til påstanden, og svarer på sensors breddespørsmål om en moderne tekst. `endText` gir karakter 2-6 med konkret tilbakemelding bygd på hvilke flagg som er satt.
- **Hva kan IKKE læres i dette formatet?** Selve tekstanalysen i dybden (det hører hjemme i artiklene og biblioteket). Spillet trener *eksamenshåndverket og situasjonen*, ikke memorering av tekstinnhold.

---

## 2. Narrativ kjerne

- **Setting:** En norsk skole på eksamensdag(ene) i juni. Tre soner: klasserommet (trekke fag), forberedelsesrommet, og eksamensrommet. Varmt dagslys gjennom vinduene.
- **Spillerens rolle:** En avgangselev på 10. trinn som skal opp til muntlig eksamen i norsk - fra trekning til framføring.
- **Hovedspenning:** Hvor godt framføringen går, avhenger av hvor godt du brukte forberedelsesdagen. Og sensor graver alltid litt utenfor det du forberedte.
- **Emosjonell bue:** Fra nervøsitet til mestring.

---

## 3. Mekanisk kjerne

- **Spill-type:** `quest-rom` (dialog-drevet, som eksamen-samfunnsfag). Ett langt rom delt i tre soner med skillevegger og låste dører - én sone per "eksamensdag".
- **Quest-struktur (de tre dagene):**

| Fase | Sone | Mål | Pedagogisk funksjon |
|---|---|---|---|
| `trekke-fag` | A: Klasserom | Trekk faget hos læreren (du får norsk + temaet framgang og motgang). | Rammer inn eksamensgangen; senker terskel |
| `trekke-oppgave` | B: Forberedelse | Les oppgaven og forbered deg (tekster, påstand, epokekobling, baklomme, stikkordlapp). | Selvstendig arbeid; forberedelsen avgjør del 3 |
| `framfore` | C: Eksamensrom | Hils på faglærer, hold presentasjonen, svar på sensor. | Eleven anvender og drøfter, også utenfor det forberedte |

**Forberedelse → framføring (kjernesløyfe):** Det du forbereder i sone B låser opp de sterke grepene i sone C. Uten forberedt påstand/epokekobling/tekster blir åpningen vag, analysen rotete og sitatgrepet tomt (dialog-varianter som leser execution-flagget). Slik kjenner eleven at forberedelsesdagen er det som avgjør karakteren.

- **NPCer:**
  - `laerer` - Læreren (`noble`) - i klasserommet (Sone A). Rammer inn eksamen, deler ut fag og tema.
  - `faglarer` - Faglærer Berg (`noble`) - kjenner eleven, oppmuntrende. Leder presentasjonsfasen.
  - `sensor` - Sensor (`scientist`) - ekstern, nøytral. Leder fagsamtalen med gradvis vanskeligere spørsmål.
- **Nøkkel-items:** Ingen. Spillet er rent dialog-drevet (ingen pickups/inventar).
- **Valg som driver læring (flagg):**
  - Åpning: `apnet_tese` (skarp påstand, krever `har_paastand`) vs `leste_manus` (svak).
  - Struktur: `koblet_epoke` (analyse + epoke punkt for punkt, krever `har_epokekobling`) vs referat.
  - Rød tråd: `kjerne_riktig` (framgang betyr ulikt i hver epoke) vs vag fellesnevner.
  - Virkemiddel: `brukte_sitater` (presise sitater + navngitt virkemiddel, krever `har_tekster`) / `brukte_patos` / `brukte_etos`.
  - Avslutning: `sirklet_tilbake` (binder slutten til påstanden, krever `har_paastand`).
  - Fagsamtale: `q1_riktig` (forståelse: hvor motgangen ligger), `q2_riktig` (virkemiddel i dybden: ironien i Karens jul), `q3_riktig` (drøfting: fortjener Askeladden framgangen), `q4_riktig` (bredde: koble til vår egen tid, utenfor presentasjonen, belønner `har_baklomme`).
- **Slutt-tekst(er):** `endText`-funksjon teller sterke presentasjonsgrep + riktige svar -> karakter 2-6 med konkret, konstruktiv tilbakemelding (hva satt, hva manglet) og en "Les mer"-henvisning til eksamensartiklene.

---

## 4. Faglig innhold (fra modellsvaret)

Temaet og tekstene er hentet direkte fra modellsvaret `/norsk/eksamen/muntlig-modell`:

- **Tema:** Framgang og motgang.
- **Påstand:** "Framgang flytter seg gjennom litteraturhistorien - fra en belønning du kan vinne med list og vilje, til noe samfunnet eller ditt eget hode kan nekte deg."
- **Tre tekster, tre epoker:**
  - *Askeladden som kappåt med trollet* (Asbjørnsen og Moe, 1843) - folkediktning/nasjonalromantikk. Virkemiddel: kontrast (liten/smart mot stor/dum). Framgang = belønning for kløkt.
  - *Karens jul* (Amalie Skram, 1885) - realisme/naturalisme. Virkemiddel: ironi (julens lys mot barnets død i kulde), miljøskildring. Framgang nektes av samfunnet.
  - *Sult* (Knut Hamsun, 1890) - nyromantikk. Virkemiddel: indre monolog. Framgang og motgang bor i samme hode.
- **Baklomme-tekster:** *Aldri godt nok* (2024, motgang flyttet inn i selvbildet), *Piken med svovelstikkene*, *Jeg ser* (Obstfelder).

---

## 5. Visuell kjerne

- **Miljø:** `interiør` (norsk ungdomsskole-klasserom rigget for muntlig eksamen).
- **Tid på døgnet:** `timeOfDay 0.5` (lys formiddag), `colorGrading: 'warm'`.
- **Stemning:** Lyst, rolig, litt høytidelig. Ikke mørkt eller truende - eksamen skal kjennes overkommelig.
- **Fargepalett:** tregulv `#b9925a`, lyse pussvegger `#e6ddcd`, grønn tavle `#2f4a3a`, varmt trebord `#6a4a2e`, dagslys-aksent `#ffe6b0`.

### Teknisk skisse

- **Rom-dimensjoner:** ett langt rom `size: [12, 4, 32]`, `center: [0, -6]`, delt i tre soner (A: z 2.5..10, B: z -8..2.5, C: z -22..-8) med skillevegger og 1.8m døråpninger.
- **Player startPosition:** `[0, 0, 5.5]` (i Sone A, kamera følger bak).
- **Lys:** `warm-interior` + ekstra `HemisphereLight` og `DirectionalLight` for projektor-vennlig lys i det store rommet, pluss mykt taklys per sone (`config.lights`).
- **Gating (flag -> konsekvens):**
  - `FAG_TRUKKET` -> låser opp døra til Sone B; lærer-markør av.
  - `HAR_MANUS` -> låser opp døra til Sone C; setter fase `framfore`; faglærer-markør på.
  - `PRESENTASJON_FERDIG` -> sensor åpner fagsamtalen; faglærer-markør av, sensor-markør på.
  - `FAGSAMTALE_FERDIG` -> `registerUpdate` planlegger `triggerEnd()` -> `endText`.

### Pedagogisk sjekkliste

- [x] Læringsmålene er konkrete og etterprøvbare.
- [x] All tekst er forståelig for en 14-åring (bokmål, riktige tegn).
- [x] Valgene har synlige konsekvenser (NPC-reaksjon + karakter i `endText`).
- [x] Suksesskriteriene kan observeres (dialogvalg + `endText`).
- [x] Spillet utnytter situasjonen/3D-formatet (eksamensrommet), ikke bare en quiz - det er et bedre supplement til artikkelen enn en ny artikkel.

### Slutt-modell

`Kredittrull (triggerEnd)`. Eksamen har en definitiv slutt: eleven får sin "karakter". `endText` er en funksjon som leser flagg og gir karakter 2-6 med tilbakemelding. Ikke loop-spillbart - når sensoren er ferdig, er eksamen over.
