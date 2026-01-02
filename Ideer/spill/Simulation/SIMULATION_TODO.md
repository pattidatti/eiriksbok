# Simulation - Todo & Utviklingsplan

Dette er en dedikert liste for videreutvikling av Simulation-spillet i Eiriksbok.

## 🚀 Prioritert (Neste skritt)
- [ ] **Balansering av Utbytte:** Finjustere "Utbytte" (tidligere Yield) for ulike verktøy og handlinger.
- [ ] **Holdbarhet:** Implementere tydeligere visuelle varsler når verktøy er i ferd med å ødelegges.
- [ ] **minigames** Legge til flere minigames.
- [ ] **Notificationsenter** et sted hvor alt som skjer med karakteren, spesielt hendelser og minigames, kan vises. Betyr ikke at man fjerner noe annet. dette er et tillegg.   
 ressurser. Dette er legacy, vi kan alltid åpne UI, bare ikke lage items. 
-  [ ] **Global proil** når man lager ny karakter her, må man velge server. 


- [ ] **lokalbefolkning** Oppgradere UI til dialogen. Også legge til bilder av personene de snakker med, i en egen kolonne til høyre?
## 🛠️ Planlagt (Underveis/Snart) 
- [ ] **Handelsruter:** Implementere Merchant-spesifikke handlinger for import/eksport mellom byer.
- [ ] **Patruljering:** Utvide soldatens patrulje-funksjon med flere typer hendelser og minispill.
- [ ] **Global Profil (The Nexus):** En meta-layer hub som ligger "over" selve simuleringen.
    - **Estetikk:** "Void/Astral" tema. Mørkere, mer teknisk/admin-aktig design enn selve spillet for å skille "Player" fra "Character". Glassmorphism med dypere blur og "kaldere" toner.
    - **Karakter-velger (The Vessels):**
        - Visning av alle aktive karakterer som "Cards" eller "Cryo-pods" med 3D- eller parallax-effekt.
        - **Live Snapshot:** Vist Lokasjon, Rolle, Gold, Helse og "Sist spilt" tidspunkt.
        - **Quick-Jump:** Knapp for å hoppe direkte inn i en annen karakter ("Possess Vessel").
    - **Meta-Progresjon (Soul Rank):**
        - Et nivåsystem for *spilleren* (The Operator) basert på samlet tid/bragder.
        - **Legacy Hall:** Arkiv over døde/pensjonerte karakterer. En kirkegård eller hall of fame hvor man kan se stats fra tidligere liv.
        - **Acievements / Triumphs:** Globale meritter som følger kontoen, ikke karakteren (f.eks. "Master Trader", "Warlord").
    - **Konto-innstillinger:**
        - **Cloud Sync:** Tydelig indikator på sync-status mellom enheter.
        - **Global Overrides:** Mulighet til å låse settings (lyd/bilde) for alle karakterer.
    - **Sosialt (Fremtidig):**
        - **Friend Constellations:** Vis venner som stjerner i et system, hvor lysstyrke indikerer aktivitet.
        - **Barony Management:** Hvis spilleren eier flere karakterer i maktposisjoner, en oversikt over "Player Empire".
- [ ] **Login / Signup Flyt:**
    - Full integrasjon av Firebase Auth i egen lekker UI-wrapper.
    - "Velkommen tilbake, [Operator Name]" skjerm før man velger karakter. 
- [ ] **Signup** Har lagt til Google som signup i  firebase, men dette må vel implementeres i koden vår? Samme med login antar jeg. 
- [x] **Planlagte prosjekter** Fjerne hele konseptet med planlegge og aktive prosjekter med sawmill osv. VI har et bedre system for å oppgrader bygninger. 
- [] **Penger** Må bare ha 2 desimaler. Spesielt når man selger på marked kommer det popup med bøttevis av desimaler. 
- [ ] **fjerne tools** Vi har fjernet tools som item (mener jeg), men det går fremdeles an å kjøpe og selge på markedet. 
 
## 💡 Ideer & Konsepter
- [ ] **Diplomati:** Dypere system for forhold mellom baronier.
- [ ] **Vær-effekter:** Hvordan vær påvirker produksjon og utbytte.
- [ ] **Historiske hendelser:** Tilfeldige hendelser basert på historisk kontekst som påvirker økonomien.
- [ ] **Bygging:** Oppgradering av produksjonsbygninger for å låse opp nye oppskrifter. Må finne mer til alle bygninger. 
- [ ] **Rivaliserende ressurser** Det må være en unik ressurs for baroni vest og øst, slik at de tvinges til å handle for progressjon. Dette muliggjøre kanskje også enda en grunn raids på hverandres baronier. 
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