# Simulation - Todo & Utviklingsplan

Dette er en dedikert liste for videreutvikling av Simulation-spillet i Eiriksbok.

## 🚀 Prioritert (Neste skritt)
- [ ] **Balansering av Utbytte:** Finjustere "Utbytte" (tidligere Yield) for ulike verktøy og handlinger.
- [ ] **Holdbarhet:** Implementere tydeligere visuelle varsler når verktøy er i ferd med å ødelegges.
- [ ] **minigames** Legge til flere minigames.
- [ ] **Notificationsenter** et sted hvor alt som skjer med karakteren, spesielt hendelser og minigames, kan vises. Betyr ikke at man fjerner noe annet. dette er et tillegg.   
 ressurser. Dette er legacy, vi kan alltid åpne UI, bare ikke lage items. 
- [ ] **Bueskyting** står at jeg mangler bue, selv om jeg har det equip på riktig slot. Fjern brød fra kostnaden til Dra på jakt. Hvis utbytte er redusert på pga sesong, så må dette fjernes. Det er alltid dyr i skogen. 
- [ ] **lage omelett** Å lage omelett trigger smedarbeid minigame. Slik skal det ikke være. Omelett mangler også ikon.  
 - [ ] **Åker** det skal ikke gå an å så åkeren når det er vinter. Dette bygger opp under at man må gjøre seg klar til vinteren, og dytter spilleren inn på andre deler av spillet. 

- [ ] **lokalbefolkning** Oppgradere UI til dialogen. Også legge til bilder av personene de snakker med, i en egen kolonne til høyre?
## 🛠️ Planlagt (Underveis/Snart) 
- [ ] **Handelsruter:** Implementere Merchant-spesifikke handlinger for import/eksport mellom byer.
- [ ] **Patruljering:** Utvide soldatens patrulje-funksjon med flere typer hendelser og minispill.
- [ ] **Profil** Global profil må vise de aktive karakterene man har og at man kan logge inn der fra. Må koble profilknappen i instillinger til global profi også. 
- [ ] **Signup** Har lagt til Google som signup i  firebase, men dette må vel implementeres i koden vår? Samme med login antar jeg. 
- [] **Planlagte prosjekter** Fjerne hele konseptet med planlegge og aktive prosjekter med sawmill osv. VI har et bedre system for å oppgrader bygninger. 
- [] **Penger** Må bare ha 2 desimaler. Spesielt når man selger på marked kommer det popup med bøttevis av desimaler. 
- [ ] **fjerne tools** Vi har fjernet tools som item (mener jeg), men det går fremdeles an å kjøpe og selge på markedet. 
. [ ] **musikkspiller** i instillinger må det være tilgang en musikkspiller med sangene, mulighet for å bytte, stoppe, play og mute/ignorere bestemte sanger. (Vi må også oppdatere navne på sangene til mer unike titler på norsk )
- [ ] **Minigames punch** På trehogging har vi en ikro annimasjonspause pause når man treffer, slik burde det være i alle minigames. 
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