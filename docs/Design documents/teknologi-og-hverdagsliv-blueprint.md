# Subject Blueprint: Teknologi og hverdagsliv
> **Status:** `[Draft]`
> **Version:** 1.0
> **Flaggskip bygget:** `jordbrukets-historie` (referansestandard)

---

## 1. Metadata
*   **Type:** `Topic` (Emne)
*   **Parent (Fag):** `historie`
*   **Topic ID:** `teknologi-og-hverdagsliv`
*   **Title:** Teknologi og hverdagsliv
*   **Visual Theme:** Workshop Amber — varmt lys på hender, redskaper og materialer. Slitte treverktøy, jern, korn, tekstil og tidlig maskineri. Ikke storslåtte slagmarker eller troner, men nære, menneskelige scener fra verksted, åker, kjøkken og fabrikkgulv.

---

## 2. Begrunnelse: hvorfor dette emnet?
> *Hvilket hull fyller vi?*

Læreboka har i dag tung dekning av **krig og stat** (verdenskrigene, kald krig, rikssamling, revolusjoner). Det som faktisk forandret hverdagen til vanlige folk — redskapene, teknikkene og oppfinnelsene — ligger spredt og ufokusert. Fragmenter finnes allerede:

*   `historie/jordbruk-og-sivilisasjoner` — jordbruket som springbrett til de *første statene* (ikke som teknikk over tid).
*   `historie/industriell-revolusjon` — «Dampmaskinen», «Jernbanen», «Dopapirets historie» (appetitten for hverdagsteknologi finnes, men er bundet til 1800-tallet).
*   `samfunnskunnskap/handel-og-infrastruktur` og `arbeidsliv` — nåtidsrettet.

**Dette emnet samler trådene** til én sammenhengende fortelling: hvordan teknologi gjennom historien har endret hvordan folk lever, spiser, jobber, kommuniserer og holder seg friske. Plassert i **Historie** fordi det i sin natur er en utviklingsfortelling over tid, integrert med `/tidslinje`, og fordi alt det beslektede innholdet allerede bor her.

---

## 3. The Narrative Arc
> *Hva er historien vi forteller?*

**The Hook:**
"Vi husker kongene og krigene. Men det som virkelig forandret livet ditt, var en bedre plog, en vannkran og en lyspære."

**The Arc:**
Hver artikkel følger samme grep: ta én gjenstand eller teknikk som elevene tar helt for gitt, vis verden *før* den fantes, fortell hvordan den ble til, og avslør hvor enormt den endret hverdagen. Den røde tråden er at de dypeste forandringene i menneskelivet ofte var stille — ikke slag og troner, men redskaper og oppfinnelser som gjorde at færre mennesker kunne lage mer mat, lys, helse og kunnskap til flere.

**Pedagogisk kjerne:** sette eleven i stand til å se teknologi som drivkraft i historien, og å vurdere at ny teknologi alltid løser ett problem mens den skaper nye (jf. baksiden av den grønne revolusjonen).

---

## 4. The Learning Path (The Spine)

> Markert `[BYGGET]` = ferdig referanseartikkel. Resten er kandidatartikler, prioritert.

1.  **[Type: Article] [BYGGET]** Jordbrukets historie: fra hakke til traktor (ID: `jordbrukets-historie`) — *flaggskip / referansestandard*
2.  **[Type: Article]** Vannet som jobbet: vann- og vindmølla (ID: `vann-og-vindmolla`)
3.  **[Type: Article]** Klokka som styrte livet (ID: `klokka`)
4.  **[Type: Article]** Boktrykkerkunsten: kunnskap for folk flest (ID: `boktrykkerkunsten`)
5.  **[Type: Article]** Den usynlige revolusjonen: rent vann og kloakk (ID: `vann-og-kloakk`)
6.  **[Type: Article]** Da lyset kom inn i huset: elektrisiteten (ID: `elektrisiteten`)
7.  **[Type: Article]** Kjøleskapet og maten som holdt seg (ID: `kjoleskapet`)
8.  **[Type: Article]** Vaksiner og antibiotika: medisinen som forlenget livet (ID: `vaksiner-og-antibiotika`)
9.  **[Type: Article]** Å snakke over avstand: telegraf og telefon (ID: `telefonen`)
10. **[Type: Article]** Symaskinen: klær til alle (ID: `symaskinen`)
11. **[Type: Quiz]** Oppfinnelsene som forandret hverdagen
12. **[Type: Interactive]** Tidslinje: hverdagens revolusjoner (komponent: `TimelineComponent` / egen interaktiv «før og etter»-komponent)

> **Mulig læringssti senere:** `teknologi-og-hverdagsliv-sti` (3-akters bue) som binder 4-5 av artiklene sammen rundt spørsmålet «Hva forandret egentlig hverdagen mest?». Registreres da under `tools`, ikke `lessons`.

---

## 5. The Content Matrix (The Bricks)

### 1. Jordbrukets historie  `[BYGGET]`
*   **Pedagogical Goal:** Forstå hvordan plog, vekselbruk, kunstgjødsel, mekanisering og den grønne revolusjonen gjorde at samme åker kunne fø stadig flere med mindre arbeid.
*   **Beats:** Hook: 9 av 10 var bønder, i dag under 2 av 100. Conflict: jorda blir sliten / nitrogen er flaskehalsen / muskler har en grense. Resolution: den stille revolusjonen frigjorde mennesker til alt annet — men ny teknologi har en bakside.
*   **Komponenter brukt:** Comparison (ard vs tung plog), FactBox (Haber-Bosch), TimelineComponent, InterdisciplinaryBridge, Quiz.

### 2. Vann- og vindmølla
*   **Pedagogical Goal:** Se den første kraften utenfor muskler — hvordan møller malte korn og drev sager lenge før dampmaskinen.
*   **Beats:** Hook: bråket fra en kvern som maler korn mens ingen sveiver. Conflict: kraft bundet til elv og vind. Resolution: forløperen til industriell kraft; krysslenk til `dampmaskinen`.

### 3. Klokka som styrte livet
*   **Pedagogical Goal:** Forstå hvordan mekanisk tidsmåling endret arbeid, kirke og by.
*   **Beats:** Hook: før klokka begynte dagen når sola sto opp. Conflict: bondetid vs klokketid. Resolution: timeplaner, fabrikkfløyta og det moderne døgnet. Krysslenk til `jernbanen` (standardtid).

### 4. Boktrykkerkunsten
*   **Pedagogical Goal:** Hvordan Gutenbergs presse gjorde kunnskap billig og masseprodusert.
*   **Beats:** Hook: en bok kostet før like mye som et hus. Conflict: håndskrift vs trykk. Resolution: lesekyndighet, aviser, reformasjon (krysslenk til `reformasjonen`).

### 5. Rent vann og kloakk
*   **Pedagogical Goal:** Vise at det som reddet flest liv ikke var medisin, men rør og renseanlegg.
*   **Beats:** Hook: koleraen i byene. Conflict: John Snow og pumpa i London. Resolution: den usynlige infrastrukturen vi aldri tenker på. Krysslenk samfunn: `handel-og-infrastruktur`.

### 6. Elektrisiteten kommer hjem
*   **Pedagogical Goal:** Fra parafinlampe til strøm i veggen, og hva det gjorde med døgnet og hjemmet.
*   **Beats:** Hook: kvelden var mørk og kort. Conflict: gass vs elektrisk lys. Resolution: lengre dager, elektriske apparater, frigjort husarbeid.

### 7. Kjøleskapet og maten
*   **Pedagogical Goal:** Hvordan hermetikk, salting og kjøling endret kosthold og helse.
*   **Beats:** Hook: hvordan overleve vinteren før kjøleskap. Conflict: mat som råtner vs konservering. Resolution: variert kosthold hele året, færre matforgiftninger.

### 8. Vaksiner og antibiotika
*   **Pedagogical Goal:** Medisinen som mer enn doblet forventet levealder.
*   **Beats:** Hook: barn som døde av sykdommer vi knapt hører om i dag. Conflict: Jenner/kukopper, Fleming/penicillin. Resolution: lengre liv — og dagens problem med resistens.

### 9. Telegraf og telefon
*   **Pedagogical Goal:** Da en beskjed gikk fra uker til sekunder.
*   **Beats:** Hook: et brev brukte måneder over havet. Conflict: budbringer vs kabel. Resolution: sanntidskommunikasjon. Krysslenk: `internett-kabler` (samfunn).

### 10. Symaskinen
*   **Pedagogical Goal:** Hvordan klær gikk fra dyr luksus sydd for hånd til noe alle hadde råd til.
*   **Beats:** Hook: en skjorte tok dagevis å sy. Conflict: håndsøm vs maskin. Resolution: rimelige klær — og baksiden med tekstilfabrikker (krysslenk `barnearbeid`).

---

## 6. Visual Identity
*   **Hero-bilder:** Cinematisk, 16:9, varmt lys. Nære scener: hender på et redskap, korn som renner, en lyspære som tennes i et mørkt rom. Mennesker i arbeid, ikke portretter av makthavere.
*   **Palett:** Rav, varmt brunt, jern-grått, korngult. Mykt sidelys.
*   **Bildebane:** `/images/teknologi-og-hverdagsliv/[lesson-id]-hero.webp` + `[lesson-id]-01.webp` osv. (genereres av bilde-pipeline; artikkelen refererer banene, alt/caption fungerer som beskrivelse.)

---

## 7. Standarder (gjelder alle artikler i emnet)
*   Språk for en gjennomsnittlig 14-åring. Forklar fagord når de introduseres.
*   800-1200 ord per artikkel.
*   `"layout": "rich"`, flat `content`-array, `timeline: []` (events styres av `year` + scan:content).
*   Ingen fet skrift, ingen markdown-lister i `text`-blokker. Bruk `list`-blokker og konsept-systemet.
*   Riktige norske tegn (å, ø, æ). Ingen tankestrek/em-dash — bruk bindestrek.
*   Hver artikkel bør ha minst én Comparison eller FactBox, en compact TimelineComponent, en InterdisciplinaryBridge og en avsluttende Quiz — slik flaggskipet `jordbrukets-historie` viser.

---

## 8. Neste steg
1.  Bygg `jordbrukets-historie` ferdig og perfeksjoner den som referanse. ✅
2.  La bilde-pipelinen generere hero + inline-bilder for flaggskipet.
3.  Vurder flaggskipet i appen (les, sjekk konsepter, tidslinje, quiz).
4.  Når standarden sitter: bygg artikkel 2-3 fra spinen, deretter resten i bredde.
5.  Vurder egen læringssti og en «før/etter»-interaktiv komponent.
