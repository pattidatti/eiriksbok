# Simulation - Todo & Utviklingsplan

Dette er en dedikert liste for videreutvikling av Simulation-spillet i Eiriksbok.

## 🚀 Prioritert (Neste skritt)
- [ ] **Balansering av Utbytte:** Finjustere "Utbytte" (tidligere Yield) for ulike verktøy og handlinger.
- [ ] **Holdbarhet:** Implementere tydeligere visuelle varsler når verktøy er i ferd med å ødelegges.

- [ ] **minigames** Legge til flere minigames.
- [x] **Minigames** De minigames som skal "treffe" et felt, som brødbaking. Der bør feltet flytte litt rundt på seg for å gjøre det mer interresant for spilleren. 
- [x] **Høsting** UI Høsting er klar timer vises fremedeles etter at man har høstet. 
- [] **Fjerne slettede items** Manpower og tools ligger fremdeles i ryggsekken. 
- [x] **Hogge tre** Når jeg ble ferdig med minigame stod det 3 tre i tooltippen på toppen, men animasjonen som fløy og et annet tall sa +6. 
- [ ] **Notificationsenter** et sted hvor alt som skjer med karakteren, spesielt hendelser og minigames, kan vises. Betyr ikke at man fjerner noe annet. dette er et tillegg.   
- [ ] **Smien** minigame: Jeg fikk startet produksjon av en item uten å ha nok energi. Fikk ingen feedback underveis om jeg traff på riktig felt eller ikke, ingen tilbakemelding på progressjon. 
- [x] **POI** ikonene på mappet snur seg med mouseover nå, det er bedre hvis de heller øker litt i størrelse. 
- [x] **oppgradere Smien** går ikke an å bidra, kommer feilmelding. 
- [x] **Åpne smien** Går ikke an å åpne produksjon/reperasjonsvindu hvis en mangler ressurser. Dette er legacy, vi kan alltid åpne UI, bare ikke lage items. 
- [ ] **Staminabar** Når man har fått lav staminia, og fyller den opp igjen, så er feltet rundt statusbarene fremdeles rød. 
- [ ] **Hugge stein** Feedbacken man får når man treffer på minigame, med tallene +1,2,3 osv, samsvarer ikke med den totale mengden man får når minigamet er fullført.
- [ ] **Marked** Går ikke an å selge, får error: "Markedet tar ikke imot denne varen her."
- [x] **Gamecard** fjerne forstørrelseseffekt, det er forstyrrende element i UIen.  
- [ ] **Kylling og egg** Legge til kylling og egge minigame på Husmannsplassen med egen POI. Man bruker Grain til å mate kyllingene, etter timer er ferdig kan man plukke opp eggene. Eggene kan brukes i bakeriet til et ny mattype som gir en midlertidig buff. Buffen varer i 15 min og gir 20% mindre staminabruk på handlinger. BUffs må kunne ses på en timer på toppen. For å aktivere buffen må spilleren spise den nye mattypen fra ryggsekken. Vi trenger derfor å lage denne funksjonen også; å bruke/konsumere items fra ryggsekk. 

## 🛠️ Planlagt (Underveis/Snart)

- [ ] **Handelsruter:** Implementere Merchant-spesifikke handlinger for import/eksport mellom byer.
- [ ] **Patruljering:** Utvide soldatens patrulje-funksjon med flere typer hendelser og minispill.
- [ ] **Profil** Global profil må vise de aktive karakterene man har og at man kan logge inn der fra. Oppe til høyre hvor "profil" er, må navnet på profilen være. Må koble profilknappen i instillinger til global profi også. 
- [ ] **Signup** Har lagt til Google som signup i  firebase, men dette må vel implementeres i koden vår? Samme med login antar jeg. 
- [] **Planlagte prosjekter** Fjerne hele konseptet med planlegge og aktive prosjekter med sawmill osv. VI har et bedre system for å oppgrader bygninger. 
- [] **Penger** Må bare ha 2 desimaler. Spesielt når man selger på marked kommer det popup med bøttevis av desimaler. 
- [x] **Sucsess tooltip** tror den heter noe sånt. Når man har et vindu oppe, marked, produksjon osv, så må tooltippen være midtstilt vinduet og 5% fra toppen av nettsiden. Det ser rart ut når den er off center til høyre. Dette stammer fra av at tooltipen i utgangspunktet er sentrert på kartet, kan vi få til en løsning som er kontekst-smart?. 
- [ ] **fjerne tools** Vi har fjernet tools som item (mener jeg), men det går fremdeles an å kjøpe og selge på markedet. 
. [ ] **musikkspiller** i instillinger må det være tilgang en musikkspiller med sangene, mulighet for å bytte, stoppe, play og mute/ignorere bestemte sanger. (Vi må også oppdatere navne på sangene til mer unike titler på norsk )
-
## 💡 Ideer & Konsepter
- [ ] **Diplomati:** Dypere system for forhold mellom baronier.
- [ ] **Vær-effekter:** Hvordan vær påvirker produksjon og utbytte.
- [ ] **Tid** Spillet må kunne "kjøre" på egenhånd, med dag, natt, vær og årstider. Kanskje best å starte på år 1, og så gå videre. Sørge for at spillet bare går videre når det er aktive spillere inne, slik at det ikke kjører inn i evigheten på egenhånd. Dag kan være 21 minutter og natt 9 kanskje? Burde vi bruke måneder, eller bare årstider? Kanskje det er bedre å ikke tracke antall år, eller ihvertfall ikke vise det for spilleren, da kan spillet bare gå sitt eget forløp. 
- [ ] **Historiske hendelser:** Tilfeldige hendelser basert på historisk kontekst som påvirker økonomien.
- [ ] **Bygging:** Oppgradering av produksjonsbygninger for å låse opp nye oppskrifter.
- [ ] **Chat-system:** Implementere et omfattende kommunikasjonssystem.
    - **Kanaler:** Egne kanaler for hvert baroni og interne kanaler for hver rolle.
    - **Diplomati:** Baroner har en egen felleskanal; Kongen har tilgang til alt.
    - **Brev-system:** Mulighet for private meldinger. Meldinger sendt utenfor eget baroni koster penger (budbringer-avgift).

- [ ] **Handelskaravane (Kjøpmann):** Et interaktivt minispill for transport og handel av ressurser mellom baronier.
    - **Visuelt:** En sidescroller med parallax-effekt (lagdelte bakgrunner i ulikt tempo) som gir grafisk dybde under reisen gjennom variert terreng som skog, fjell og vann.
    - **Spillmekanikk:** Tilfeldige hendelser og små utfordringer underveis som må håndteres for å sikre lasten.
    - **Mål:** Nå fremmede markeder for å fylle opp karavanen med ressurser som kan selges med profitt eller brukes i eget baroni.

- [ ] **Teologi & Gunst (Favor):** Implementere et system hvor "Gunst" (Favor) kan brukes.
    - **Ideer:** Kjøpe "Gudommelig flaks" (luck bonus, bedre utbytte i en periode, midlertidig buff) eller "Tilgi synder" (fjerne utmattelse / stamina-boost).

## ✅ Ferdig
- [x] Grunnleggende Peasant-loop (Høsting uten verktøy med redusert utbytte).
- [x] Navneendring: Yield -> Utbytte.
- [x] Musikk-spilleliste med loop og overgangers.
- [x] Lavpassfilter for dempet musikk i innstillinger.
- [x] Oppgraderings- og reparasjonssystem for utstyr.
- [x] Admin-panel for styring av roller og baronier.
- [x] **Utstyrsystem:** Videreutvikling av systemet for å ha flere verktøy utrustet samtidig.
- [x] **Lydbilde:** Forbedre overgangers i spillelisten og finjustere "Dempet musikk"-filteret.
- [x] **Harvest** Mer tilpassende minigames, flere varianter. Kan vi f.eks. ha et hvor man planter frø på åkeren, få opp en timer, og så høster mann inn når de er ferdige. Da bør vi også ha en notification til brukeren at åkeren er klar til å høstes. Kanskje timeren skal vises på toppen? Game design messig, så holder timere spilleren mer engasjert såvidt jeg vet. Andre steder vi kan bruke dette?
- [x] **Ferdigheter** Oppdatere UI, grid system, utnytte bredden på skjermer bedre (kanskje overflow for mindre skjermer?). Vi kan ha individuelle farger på skills for å skille dem bedre. Det bør være tydligere på tooltips ved produksjonsbygninger, harvest (og senere combat osv) hvilke skill som er aktuell og hvilket level man har. Litt på samme måte som vi har med verktøy nå, men med skiller. Må dog passe på at tooltippen ikke blir gigantisk. 
- [x] **Eiendeler** Utnytte widescreen bedre, penere ragdoll. Mulighet for å flytte rundt på items og kunne dra dem av og på rag-doll. 
- [x] **items** Få en komplett oversikt over hvilke items som er, hvor de lages, foredles. Har vi items som ikke brukes til noe? Har vi items som skal brukes til noe? Er det mulig å crafte alle items som trengs? Hvor lager man hammer og sigd?Har vi produksjonsmetoder som ikke kan skaffe de nødvendige ressursene? Hva er manpower og tools til? 
- [x] **Ressurser:** Legge til kilder for kjøtt (jakti skogen), ull (sauer på 33åkeren?) og honning (bikuber i åkeren).