# Scenario Blueprint: I Supermaktenes Skygge
> **Status:** `Draft`
> **Engine:** `TimeTravel/Chronos`

---

## 1. Metadata & Stats

- **ID:** `kald-krig`
- **Tittel:** I Supermaktenes Skygge
- **Undertittel:** Den Kalde Krigen 1945-1991
- **Rolle:** Historiens Vitne (perspektivet skifter gjennom historien)
- **Era/År:** `1945-1991`
- **subjectId:** `historie`
- **topicId:** `den-kalde-krigen`
- **heroImage:** `/images/chronos/kald-krig/hero.webp`

### Stats

| ID | Navn | Ikon | Start | Max | Kategori |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `atomspanning` | Atomspenning | `zap` | 35 | 100 | core |
| `menneskekost` | Menneskelig Kostnad | `users` | 0 | 100 | core |
| `usa_innflytelse` | USA | `flag` | 65 | 100 | core |
| `sovjet_innflytelse` | Sovjet | `hammer` | 55 | 100 | core |
| `historisk_innsikt` | Historisk Innsikt | `book-open` | 10 | 100 | core |

**Spilldod:** Hvis `atomspanning` >= 100 -> `game_over_atomkrig`

**Endings:**
- `ending_fredsskaperen`: `atomspanning` < 50 OG `historisk_innsikt` >= 80 OG `menneskekost` < 40
- `ending_pyrrhusseiros`: Spillet fullfort, men `menneskekost` > 70
- `ending_pragmatikeren`: Standard (spillet fullfort uten atomkrig)
- `game_over_atomkrig`: `atomspanning` >= 100 (kan skje naar som helst)

**Estimert spilletid:** 90-120 minutter. Planlegges bygd **kapittel for kapittel**.

---

## 2. Perspektivmekanikken (Kjernedesign)

Dette er det viktigste og mest unike designgrepet. Spilleren er ikke fast i en rolle - de skifter mellom maktpersoner, diplomater og vanlige folk.

**Slik signaliseres perspektivskifte til spilleren:**
- `backgroundImage` endres dramatisk (fra prestisjefylt konferansesal til bombet landsby)
- `speaker`-feltet viser ny rolle med kontekst: `"Nguyen Thi Lan, bonde fra Nord-Vietnam"`
- En forteller-node varsler skiftet eksplisitt: *"Vi forlater Washington. La oss se hva dette betyr for menneskene pa bakken."*

**Regel:** Etter hvert maktnivavalg som utloses krig eller intervensjon, SKAL spillet vise konsekvensen fra grasrotniva.

**Personaer spilleren inntar:**
- **Maktnivaet:** Stalin, Brezjnev, Gorbatsjov / Truman, Eisenhower, Kennedy, LBJ, Nixon, Carter
- **Mellomnivaet:** CIA-operativ, KGB-offiser, FN-diplomat, journalist
- **Grasrotnivaet:** Koreansk sivilbefolkning, vietnamesisk bonde, kubansk husmor, afghansk landsbybeboer, osttysk ungdom

---

## 3. Den Narrative Buen (5 Kapitler)

### Kapittel 1: Ruiner og Rivaler (1945-1953)
*"Europa er i ruiner. Seierherrene smiler ikke lenger."*
Potsdam-konferansen. Berlin-blokkaden. NATO. Koreakrigen. Spilleren er Stalin ved starten - og en koreansk gutt ved slutten. Kjernetema: Ny verdensorden formes av frykt og mistenksomhet.

### Kapittel 2: Rust og Frykt (1953-1963)
*"De bygger raketter. Vi bygger raketter. Verden venter."*
CIA-kupp i Iran og Guatemala. Suez-krisen som markerer slutten pa britisk imperialisme. Sputnik. Berlinmuren. Kubakrisen - spillets forste store klimaks. Kjernetema: Kovert makt og at "new kids on the block" har erstattet det gamle imperiet.

### Kapittel 3: Brann i Jungelen (1964-1975)
*"Domino-teorien sier at faller ett land, faller alle. Men er det sant?"*
Vietnamkrigen sett fra tre vinkler: LBJ i Washington, en US-soldat i jungelen, og en nordvietnamesisk familie etter bombing. Praha-varen. Chile-kupet. Kjernetema: Proxykrig og menneskelig kostnad.

### Kapittel 4: Avspenning og ny uro (1975-1985)
*"Nixon reiser til Kina. Kissinger snakker med Sovjet. Er krigen over? Nei."*
Detente. Angola som proxyslagmark. Sovjet invaderer Afghanistan. CIA bevapner mujahideen. Kjernetema: Kortsiktig kalkyle, langvarige konsekvenser.

### Kapittel 5: Muren Faller (1985-1991)
*"Et system kan ikke overleve sine egne logner."*
Gorbatsjov og glasnost. Tsernobyl og dekkoperasjonen. Solidaritet-bevegelsen. Berlinmurens fall 9. november 1989. Sovjet-kollapsen. Kjernetema: Systemers sammenbrudd innenfra.

---

## 4. Flag-systemet: Utilsiktede Konsekvenser

Dette er HJERTET i dette scenariet. Flags settes gjennom spillet og avslorers som langvarige konsekvenser i epilog-noder - lenge etter at spilleren har glemt hva de valgte.

| Flag | Settes i | Avslorers/brukes i | Konsekvens |
| :--- | :--- | :--- | :--- |
| `atomspionasje_godkjent` | `potsdam_valg` | `sovjet_atombombe_1949` | Sovjet far bombe fortere - mer spenning |
| `luftbro_valgt` | `berlin_blokkade_hub` | Epilog | Diplomatisk losning verdsatt |
| `iran_shah_installert` | `iran_cia_1953` | Epilog | "1979: Islamsk revolusjon var reaksjonen" |
| `suez_ny_verdensorden` | `suez_beslutning` | `discovery: avkolonisering` | Markerer USAs nye rolle |
| `ignorert_ho_chi_minh` | `ho_brev_arkiv` | `vietnam_eskalasjon` | Apner mer aggressiv Vietnam-bane |
| `tonkin_godkjent` | `vietnam_tonkin` | `vietnam_strategi` | +menneskekost 10 |
| `napalm_godkjent` | `vietnam_strategi` | `vietnam_sivil_eller_soldat` | Tvinger perspektivskifte til sivilbefolkning |
| `chile_kupp_godkjent` | `chile_1973` | Epilog | "Pinochet drepte 3000 mennesker" |
| `afghanistan_invadert` | `afghanistan_sovjet_hub` | `cia_beslutning` | Apner mujahideen-bane |
| `mujahideen_bevapnet` | `cia_beslutning` | `epilog_mujahideen` | **STOR:** "Disse mennene kalte seg naa Taliban" |
| `tsernobyl_dekket_opp` | `tsernobyl_valg` | `tsernobyl_konsekvens` | -sovjet_innflytelse 15 |
| `reform_valgt` | `glasnost_tale` | Epilog | Bedre ending-tekst for Gorbatsjov |
| `muren_passert` | `berlin_mur_crowd` | `sovjet_kollaps` | Utloser seier-sekvens |

---

## 5. Items & Inventory

| ID | Navn | Beskrivelse | Funksjon |
| :--- | :--- | :--- | :--- |
| `atomkofferten` | Atomkofferten | Den rode knappen. Symbolsk makt. | Laser opp "atomvapen"-valg (som alltid leder til game over) |
| `cia_autorisasjon` | CIA-autorisasjon | Hemmelig ordre for kovert operasjon | Krav for a starte CIA-handlinger i Iran og Chile |
| `brev_fra_ho_1946` | Ho Chi Minhs brev | Et brev til Truman som aldri ble besvart | Endrer Vietnam-bane: diplomatisk losning mulig |
| `mujahideen_kontrakt` | Bevapningskontrakten | CIA-dokumentet som godkjenner stottestrom til afghanske opprorer | Vises i epilog som bevis pa utilsiktet konsekvens |
| `gorbachev_notater` | Gorbatsjovs notater | Handskrevne tanker om glasnost og perestroika | Laser opp reformbanen i Kapittel 5 |
| `berlin_stein` | Steinbit fra Berlinmuren | En graa betongbit. Et historisk vitnesbyrd. | Collectible gitt i epilog-node |

---

## 6. Nye Minispill (Trenger komponentutvikling)

### `propaganda` - Mediemanipulasjon
**Konsept:** Spilleren er informasjonssjef (Pravda / CBS News). Faar presentert 5 reelle historiske hendelser. For hver: velg mediestrategi.
**Alternativer:** "Rapporter sannheten" / "Fremstill fordelaktig" / "Minimer omtale" / "Angrip kilden" / "Nekt kommentar"
**Konsekvenser:** Kortsiktig: -/+ innflytelse. Langsiktig: flags paavirker epilog (troverdighet).
**Eksempelhendelser:** Tsernobyl (Pravda), My Lai (CBS), CIA i Chile (NYT)
**Routing:** `onComplete.nextNodeId`
**Pedagogisk verdi:** Propagandateori, kildekritikk, medieetikk

### `domino` - Strategisk kartintervensjon
**Konsept:** Et kart over Sost-Asia, Latin-Amerika eller Afrika. Farger: bla (vestlig), rod (kommunistisk), gul (ustabil). Spilleren har begrenset antall "innflytelse-tokens": CIA-operasjon, militaerhjelp, okonomisk pakke, diplomati. Noen virker; noen slaar tilbake.
**Mekanikk:** Terningkast-basert resolusjon per token med stat-modifikatorer.
**Routing:** `winNodeId` / `lossNodeId`
**Pedagogisk verdi:** Dominoteorien, begrensningene ved intervensjonslogikk, utilsiktede konsekvenser

---

## 7. Node-oversikt: Full Flyt

*Ca. 55 planlagte noder + 6 tilfeldige hendelser (randomEvents) + endings.*
*Bygges kapittel for kapittel - start med Kapittel 1 og 2.*

### Prolog

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `intro_prolog` | Narrativ | Forteller | "Det er 1945. To supermakter har vunnet en krig. Naa begynner en annen." | -> `intro_potsdam` | `discoveryEvent: kald_krig_def` |

---

### Kapittel 1: Ruiner og Rivaler (1945-1953)

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `intro_potsdam` | Narrativ | Stalin | Potsdam 1945. Truman nevner et "nytt vapen av enestaaende kraft" uten aa blunke. | A: Ignorer (-> `berlin_deling`) / B: Intensiver spionasje (-> `sovjet_spion_start`, sets `atomspionasje_godkjent`) | `ethicsLens` |
| `sovjet_spion_start` | Narrativ | KGB-offiser | Du rekrutterer agenter ved Los Alamos. Risikabelt. | A: Godkjenn (-> `berlin_deling`) / B: Avbryt (-> `berlin_deling`) | sets `atomspionasje_fullfort` |
| `berlin_deling` | Narrativ | Forteller | 1948. Berlin er delt. Sovjet blokkerer alle veier inn. | -> `berlin_blokkade_hub` | `discoveryEvent: berlin_blokkaden_1948` |
| `berlin_blokkade_hub` | Hub/Map | US-kommandant | Berlinkartet. Tre responsalternativer. | A: Luftbro (-> `luftbro_sekvens`, sets `luftbro_valgt`) / B: Tving gjennom konvoi (-> `berlin_konfrontasjon`) | |
| `luftbro_sekvens` | Narrativ | US-pilot | "Raisinbombers" over Berlin. Barn vinker fra bakken nedenfor. | -> `nato_1949` | +usa_innflytelse 10, +historisk_innsikt 5 |
| `berlin_konfrontasjon` | Narrativ | Forteller | Konvoien moter Sovjet-soldater. | A: Trekk tilbake (-> `nato_1949`) / B: Staa fast (+atomspanning 15, -> `nato_1949`) | |
| `nato_1949` | Narrativ | Forteller | NATO dannes. "En for alle, alle for en." Sovjet svarer med Warszawapakten. | -> `ho_brev_arkiv` | `discoveryEvent: nato_og_warszawa`, +historisk_innsikt 5 |
| `ho_brev_arkiv` | Narrativ | Arkiv-scene | Et stovet arkiv i Washington. Et brev fra 1946. Skrevet av en mann ved navn Ho Chi Minh. | A: Les brevet (-> `ho_brev_lest`, gives `brev_fra_ho_1946`) / B: La det ligge (-> `korea_hub`, sets `ignorert_ho_chi_minh`) | `discoveryEvent: ho_chi_minh_identitet` |
| `ho_brev_lest` | Narrativ | Forteller | "Han var nasjonalist, ikke bare kommunist. Han siterte den amerikanske uavhengighetserklaeringen." | -> `korea_hub` | +historisk_innsikt 15, sets `ho_brev_funnet` |
| `korea_hub` | Narrativ | Truman | 1950. Nordkorea krysser 38. breddegrad. General MacArthur vil bruke atomvaapen. | A: Nekt atomvaapen, send tropper (-> `korea_krig`) / B: Trua med atomvaapen (-> `korea_atom_true`) | |
| `korea_atom_true` | Narrativ | Forteller | MacArthur truer. Kina sender millioner av soldater. Verden rister. | +atomspanning 20, -> `korea_krig` | |
| `korea_krig` | Minigame: `allocation` | US-general | Fordel krigsressurser: infanteri, luftstotte, forsyninger, diplomatiske kanaler. | onComplete -> `korea_sivil_perspektiv` | +menneskekost basert paa fordeling |
| `korea_sivil_perspektiv` | Narrativ | **PERSPEKTIVSKIFTE**: Koreansk gutt, 12 aar | "Det var bare natten og brannene. Og ingen steder aa gaa." Bombardement over Seoul. | -> `kap1_konsekvenser` | +historisk_innsikt 10, +menneskekost 10, `discoveryEvent: koreakrigens_sivile` |
| `kap1_konsekvenser` | Narrativ | Forteller | Koreakrigen slutter uten vinner. 5 millioner doede. Grensen er identisk med da krigen begynte. | -> `hub_kap2` | `discoveryEvent: koreakrig_statistikk` |

---

### Kapittel 2: Rust og Frykt (1953-1963)

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hub_kap2` | Hub/Map | Forteller | Verdenskartet 1953. Fire kriser venter. | Velg: `iran_cia_1953` / `suez_krise_1956` / `sputnik_1957` / `berlin_mur_forb` - alle maa fullforers for Cuba | |
| `iran_cia_1953` | Narrativ | CIA-operativ | Operasjon Ajax. Mossadegh er demokratisk valgt, men vil nasjonalisere olja. | A: Gjennomfor kupp (-> `iran_shah_installert`, sets `iran_shah_installert`) / B: Trekk tilbake (-> `hub_kap2`, +historisk_innsikt 5) | `ethicsLens`, `discoveryEvent: iran_olje_1953` |
| `iran_shah_installert` | Narrativ | Forteller | Shahen av Iran settes inn. Vestlige oljeinteresser er ivaretatt. En demokratisk valgt leder er fjernet. | -> `hub_kap2` | +usa_innflytelse 5, +menneskekost 5 |
| `suez_krise_1956` | Narrativ | Eisenhower | Storbritannia og Frankrike angriper Egypt for aa ta tilbake Suezkanalen. Gamal Nasser har nasjonalisert den. | A: Krev tilbaketrekning (-> `suez_ny_orden`, sets `suez_ny_verdensorden`) / B: Stott allierte (-> `suez_old_empire`) | `ethicsLens`, `discoveryEvent: suez_kanalen_1956` |
| `suez_ny_orden` | Narrativ | Forteller | USA tvinger frem britisk tilbaketrekning. Den europeiske imperietiden er over. USA og Sovjet er de nye supermaktene - "new kids on the block." | -> `hub_kap2` | +usa_innflytelse 10, +historisk_innsikt 10, `discoveryEvent: avkolonisering_1950s` |
| `suez_old_empire` | Narrativ | Forteller | USA stotter allierte. Britene og franskmennene fullforer operasjonen - men taper ansikt internasjonalt. | -> `hub_kap2` | -usa_innflytelse 10 |
| `sputnik_1957` | Minigame: `signal` | CIA-analytiker | Analyser Sputnik-signalet. Hva betyr dette for USAs sikkerhet? | Win -> `nasa_respons` (+historisk_innsikt 5) / Loss -> `sputnik_panikk` (+atomspanning 10) | `discoveryEvent: sputnik_romkapplopet` |
| `nasa_respons` | Narrativ | Forteller | NASA dannes. Romkapplopet er i gang. | -> `hub_kap2` | +usa_innflytelse 5 |
| `sputnik_panikk` | Narrativ | Forteller | Panikk i Kongressen. Rakettprogrammet overfinansiert. Atomspanningen stiger. | -> `hub_kap2` | +atomspanning 5 |
| `berlin_mur_forb` | Narrativ | Forteller | 13. august 1961. Om natten reises en mur tvers gjennom Berlin. Om morgenen er familier skilt. | -> `berlin_mur_ost` | `discoveryEvent: berlinmuren_fakta` |
| `berlin_mur_ost` | Narrativ | **PERSPEKTIVSKIFTE**: Osttysk ungdom Klaus | "I morges var det ingen mur. Naa finnes ikke Vest-Berlin lenger - bare en vegg." | A: Forsok flukt (-> `flukt_fra_ost`, sets `forsokt_flukt`) / B: Bli (-> `kuba_hub`) | +menneskekost 5 |
| `flukt_fra_ost` | Minigame: `dice` | Klaus | Flukten er et sjansespill. Terning avgjor skjebnen. | Win -> `friheten_vest` / Loss -> `fengslet_ost` | |
| `friheten_vest` | Narrativ | Klaus | Du er i vest. Men familien er igjen paa den andre siden. | -> `kuba_hub` | +historisk_innsikt 5 |
| `fengslet_ost` | Narrativ | Forteller | Over 140 mennesker ble skutt og drept ved Berlinmuren fra 1961 til 1989. | -> `kuba_hub` | +menneskekost 10, +historisk_innsikt 5 |
| `kuba_hub` | Narrativ | Kennedy | Oktober 1962. Krisens 13 dager. Et CIA-fly har fotografert sovjetiske raketter paa Cuba. | -> `kuba_telegram` | `discoveryEvent: kubakrisen_bakgrunn` |
| `kuba_telegram` | Minigame: `telegram` | Kennedy | Sorter og prioriter hemmelige rapporter fra Kuba, Moskva, FN og Pentagon. | onComplete -> `kuba_tale` | |
| `kuba_tale` | Minigame: `speech` | Kennedy | Skriv talen til det amerikanske folk. Tone: rolig / aggressiv / diplomatisk. | onComplete -> `kuba_valg` | |
| `kuba_valg` | Narrativ | Kennedy | Ekskoms er delt. Luftangrep eller blokkade? Bobby Kennedy hvisker: "Tenk pa hva som skjer dagen etter." | A: Sjoblokkade (-> `kuba_blokkade_ok`, -atomspanning 10) / B: Luftangrep (-> `kuba_nesten_krig`, +atomspanning 30) | `ethicsLens` |
| `kuba_blokkade_ok` | Narrativ | Forteller | Krusjtsjev blinker. Krisens 13 dager er over. Hemmelig avtale: USA fjerner raketter fra Tyrkia. Verden vet ikke dette pa mange aar. | -> `kuba_sivil` | -atomspanning 15, `discoveryEvent: kubakrisen_hemmelig_avtale` |
| `kuba_nesten_krig` | Narrativ | Forteller | Et U-2-fly skytes ned. En Sovjet-ubaat under sjoen tar beslutning om aa avfyre torpedoer med atomstridshoder. En mann - Vasili Arkhipov - stemmer imot. Verden reddes av et enkelt nei. | -> `kuba_sivil` | +atomspanning 25, `discoveryEvent: arkhipov_mannen` |
| `kuba_sivil` | Narrativ | **PERSPEKTIVSKIFTE**: Kubansk husmor Elena i Havana | "Vi hadde hort at bombene kunne komme nar som helst. Barna sov med klaerne paa i fire naetter." | -> `kap2_konsekvenser` | +historisk_innsikt 10, +menneskekost 5 |
| `kap2_konsekvenser` | Narrativ | Forteller | Verden overlevde Kubakrisen - nesten ved et tilfelle. Den hete linjen mellom Washington og Moskva installeres. Aldri mer skal to menn ikke kunne snakke sammen. | -> `hub_kap3` | `discoveryEvent: hete_linjen` |

---

### Kapittel 3: Brann i Jungelen (1964-1975)

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hub_kap3` | Hub/Map | Forteller | 1964. Vietnam, Praha og Chile er brennpunktene. | Velg rekkefolgje: Vietnam-arc / Praha-arc / Chile-arc | |
| `vietnam_intro` | Narrativ | Forteller | "Ho Chi Minh har kjempet i 20 aar. Mot Frankrike. Mot Japan. Naa er USA neste." | -> `vietnam_tonkin` | `discoveryEvent: vietnam_bakgrunn_og_ho` |
| `vietnam_tonkin` | Minigame: `signal` | LBJ-raadigver | Analyser meldingene fra Tonkin-bukta. Er det virkelig et angrep, eller en feil? | Win (identifiserer tvil) -> `tonkin_tvilsom` / Loss -> `tonkin_godkjent_scene` | `discoveryEvent: tonkin_bukta_fakta` |
| `tonkin_godkjent_scene` | Narrativ | LBJ | Du godkjenner Tonkin-resolusjonen. Kongressen gir deg full krigsmyndighet basert paa et angrep som aldri skjedde. | +menneskekost 10, sets `tonkin_godkjent`, -> `vietnam_strategi` | |
| `tonkin_tvilsom` | Narrativ | LBJ | Bevisene er usikre. Vil du likevel godkjenne resolusjonen? | A: Godkjenn uansett (-> `tonkin_godkjent_scene`) / B: Krev mer informasjon (-> `vietnam_diplomati`) | |
| `vietnam_diplomati` | Narrativ | Forteller | USA velger en forsiktig linje. Krigen eskalerer ikke - ennaa. | -> `hub_kap3` | +historisk_innsikt 10, -menneskekost 10 |
| `vietnam_strategi` | Minigame: `allocation` | General Westmoreland | Fordel krigsressurser: infanteri, napalm, flyktningehjelp, fredsforhandlinger. | onComplete -> `vietnam_perspektiv_valg` | If napalm allocated: sets `napalm_godkjent`, +menneskekost 10 |
| `vietnam_perspektiv_valg` | Narrativ | Forteller | "La oss forlate Saigon et oyeblikk." | If `napalm_godkjent`: -> `vietnam_sivil_bombing` / Else: -> `vietnam_soldat_patrulje` | |
| `vietnam_sivil_bombing` | Minigame: `rationing` | **PERSPEKTIVSKIFTE**: Nordvietnamesisk familie | Landsbyen er rammet. Rasjoner mat og vann mellom familiemedlemmene. Hvem overlever? | onComplete -> `vietnam_usa_perspektiv` | +menneskekost 20, +historisk_innsikt 10, `discoveryEvent: napalm_agent_orange` |
| `vietnam_soldat_patrulje` | Narrativ | **PERSPEKTIVSKIFTE**: US-soldat James | "Vi vet ikke hvem fienden er. Alle er potensielle fiender. Skogens logikk lager sine egne regler." | A: Vaer aggressiv (-> `vietnam_sivil_bombing`) / B: Hold deg til reglene (-> `vietnam_usa_perspektiv`) | `ethicsLens` |
| `vietnam_usa_perspektiv` | Narrativ | James | "Jeg hadde vaert her i 8 maaneder. Jeg husket ikke lenger hvorfor vi var her." | -> `vietnam_avslutt` | +historisk_innsikt 5 |
| `vietnam_avslutt` | Narrativ | Forteller | 1973. Nixon trekker styrkene ut. 58.000 amerikanere er doede. 3 millioner vietnamesere. Saigon faller to aar senere. | -> `hub_kap3` | `discoveryEvent: vietnam_statistikk`, +historisk_innsikt 5 |
| `praha_1968` | Narrativ | Tsjekkisk student Miroslav | 1968. Praha-vaaren. Reformer og frihet. Natten til 21. august ruller Sovjet-tanks inn i gatene. | A: Delta i protest (-> `praha_protest`) / B: Hold deg unna (-> `hub_kap3`) | `discoveryEvent: praha_vaaren_1968` |
| `praha_protest` | Minigame: `crowd` | Miroslav og folkemassen | Folkemengden konfronterer Sovjet-tanks paa Vaclav-plassen. Haandter situasjonen. | Win -> `praha_symbol` / Loss -> `praha_knust` | +menneskekost 5 |
| `praha_symbol` | Narrativ | Forteller | Bildene spres verden over. Brezjnev-doktrinen stadfestes: Sovjet vil aldri la et ostblokkland forlate pakten. | -> `hub_kap3` | +historisk_innsikt 5, `discoveryEvent: brezjnev_doktrinen` |
| `praha_knust` | Narrativ | Forteller | Opproret slaaes ned. Men noe er endret. Mange tsjekkoslovaker vil aldri stole paa kommunismen igjen. | -> `hub_kap3` | +menneskekost 5, +historisk_innsikt 5 |
| `chile_1973` | Narrativ | Nixon/Kissinger | CIA har identifisert Allende som en trussel. Han er sosialist - og han ble demokratisk valgt. | A: Godkjenn CIA-kupp (-> `chile_kupp`, sets `chile_kupp_godkjent`) / B: Respekter demokratiet (-> `chile_demokrati`) | `ethicsLens`, `discoveryEvent: allende_og_demokrati` |
| `chile_kupp` | Narrativ | **PERSPEKTIVSKIFTE**: Chilensk journalist Carmen | 11. september 1973. La Moneda-palasset brenner. Salvador Allende er doed. Pinochet griper makten. | -> `kap3_konsekvenser` | +menneskekost 15, sets `chile_kupp_godkjent`, `discoveryEvent: pinochet_terror` |
| `chile_demokrati` | Narrativ | Forteller | USA trekker seg tilbake. Det chilenske demokratiet overlever noen aar til. | -> `kap3_konsekvenser` | +historisk_innsikt 5 |
| `kap3_konsekvenser` | Narrativ | Forteller | "Utilsiktede konsekvenser er ikke tilfeldigheter. De er resultater av valg gjort av mennesker som trodde de visste best." | -> `hub_kap4` | `discoveryEvent: kovert_operasjoner_kald_krig`, +historisk_innsikt 5 |

---

### Kapittel 4: Avspenning og ny uro (1975-1985)

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hub_kap4` | Hub/Map | Forteller | 1975. Detente-aera. Angola. Afghanistan banker paa. | Velg: Angola-arc / Afghanistan-arc | `discoveryEvent: detente_realpolitikk` |
| `angola_proxy` | Minigame: `allocation` | Carter-raadgiver | Angola er fritt fra Portugal. Cuba stotter MPLA. CIA stotter UNITA. Fordel ressurser. | onComplete -> `angola_konsekvens` | +menneskekost basert paa militaer-andel |
| `angola_konsekvens` | Narrativ | Forteller | Angola drukner i borgerkrig. Cuba sender 50.000 soldater. Det er en proxy-krig langt fra stormaktenes hjem. | -> `hub_kap4` | +menneskekost 10, `discoveryEvent: angola_borgerkrig` |
| `afghanistan_sovjet_hub` | Narrativ | Brezjnev | 1979. En kommunistisk regjering i Afghanistan er i ferd med aa falle. Militaeret anbefaler invasjon. | A: Invader (-> `afghanistan_invasjon`, sets `afghanistan_invadert`) / B: Diplomatisk losning (-> `afghanistan_diplomatisk`) | `ethicsLens`, `discoveryEvent: afghanistan_bakgrunn` |
| `afghanistan_invasjon` | Narrativ | Sovjet-general | Desember 1979. 100.000 Sovjet-soldater krysser grensen. En stormakt marsjerer inn i et land som aldri har latt seg beseira. | -> `afghanistan_landsby` | +menneskekost 15, +atomspanning 10 |
| `afghanistan_diplomatisk` | Narrativ | Forteller | Sovjet velger diplomati. Krigen unngaas. Mujahideen forblir lokale stammegrupper uten stormaaktsstotte. | -> `cia_beslutning` | +historisk_innsikt 5 |
| `afghanistan_landsby` | Minigame: `rationing` | **PERSPEKTIVSKIFTE**: Afghansk bonde Fatima | Landsbyen bombes av Sovjet-fly. Rasjoner mat og vann. Hvem kan du hjelpe? | onComplete -> `cia_beslutning` | +menneskekost 10, +historisk_innsikt 10, `discoveryEvent: afghanske_sivile_krigen` |
| `cia_beslutning` | Narrativ | Zbigniew Brzezinski | "Vi har sjansen til aa gi Sovjet sin Vietnam. Bevapne mujahideen - naa, forst de selv ber om hjelp." | A: Bevapne (-> `cia_domino_spill`, sets `mujahideen_bevapnet`, gives `mujahideen_kontrakt`) / B: Nekt (-> `kap4_advarsel`) | `ethicsLens`, `discoveryEvent: operasjon_syklus_brzezinski` |
| `cia_domino_spill` | Minigame: `domino` (NY) | CIA-operativ | Strategisk kart over Afghanistan. Plasser stingermissiler, treningsleire og agenter. | Win -> `mujahideen_suksess` / Loss -> `mujahideen_kaos` | |
| `mujahideen_suksess` | Narrativ | Forteller | Mujahideen slaar tilbake. Sovjet lider tap. Brzezinski er fornyd: "Vi gav dem sin Vietnam." | -> `kap4_advarsel` | -sovjet_innflytelse 10 |
| `mujahideen_kaos` | Narrativ | Forteller | Mujahideen er fragmentert og uforutsigbar. Vaapnene sprer seg til grupperinger USA ikke kontrollerer. | -> `kap4_advarsel` | +menneskekost 10 |
| `kap4_advarsel` | Narrativ | Forteller | "Men hvem er disse mennene vi bevapner? Og hva vil de gjore med sine nye vaapen nar Sovjet er borte?" | -> `hub_kap5` | +historisk_innsikt 5 |

---

### Kapittel 5: Muren Faller (1985-1991)

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hub_kap5` | Hub/Map | Forteller | 1985. Gorbatsjov. En ny tid? Tre kriser venter. | Velg: Tsernobyl / Solidarnosc / Glasnost | |
| `gorbachev_dilemma` | Minigame: `intrigue` | Gorbatsjov | Identifiser hvem i Politbyraaet som stotter reform - og hvem som vil sabotere deg. 7 karakterer, 2-3 forreedere. | onComplete -> `glasnost_tale` | +historisk_innsikt 10 |
| `glasnost_tale` | Minigame: `speech` | Gorbatsjov | Glasnost-talen. Kombiner kolonner: Aapenhet/Kontroll, Reform/Tradisjon, Vesten/Intern. | onComplete -> `hub_kap5` | If reform-kombo: sets `reform_valgt` |
| `tsernobyl_hub` | Narrativ | Forteller | 26. april 1986. Reaktor 4 ved Tsernobyl eksploderer. Den storste atomulykken i historien. | -> `tsernobyl_valg` | `discoveryEvent: tsernobyl_ulykken` |
| `tsernobyl_valg` | Minigame: `propaganda` (NY) | Sovjet-informasjonsminister | Sett opp Pravdas dekning av Tsernobyl. Fem nyheter. Velg strategi for hver. | onComplete -> `tsernobyl_konsekvens` | If dekket opp: sets `tsernobyl_dekket_opp` |
| `tsernobyl_konsekvens` | Narrativ | Forteller | "Logner rundt Tsernobyl kostet liv. Men de kostet systemet noe mer: Ingen trodde paa myndighetene lenger." | -> `hub_kap5` | If `tsernobyl_dekket_opp`: -sovjet_innflytelse 15, +menneskekost 5 |
| `solidarnosc` | Narrativ | Polsk arbeider Lech | 1980. Gdansk-verftet streiker. Solidaritet-bevegelsen nekter aa akseptere den kommunistiske regjeringens loegner. | A: Delta i streiken (-> `solidarnosc_seier`) / B: Hold deg unna (-> `berlin_mur_fall`) | `discoveryEvent: solidaritet_bevegelsen` |
| `solidarnosc_seier` | Narrativ | Forteller | Lech Walesa og Solidaritet tvinger frem frie valg. Et kommunistisk land velger fritt - for forste gang. | -> `berlin_mur_fall` | -sovjet_innflytelse 10, +historisk_innsikt 10 |
| `berlin_mur_fall` | Narrativ | **PERSPEKTIVSKIFTE**: Osttysk student Petra, 17 aar | 9. november 1989. Radioen sier at grensene er aapnet. Tusenvis stopper opp. Noen begynner aa gaa. | -> `berlin_mur_crowd` | `discoveryEvent: murens_fall_1989` |
| `berlin_mur_crowd` | Minigame: `crowd` | Petra og folkemengden | Menneskemassen trykker mot grensepunktet. Grensevaktene noebler. Ti minutter avgjor historien. | Win -> `muren_faller` / Loss -> `muren_holder_naatt` | |
| `muren_faller` | Narrativ | Forteller | Hammerne slaar. Muren faller. DDR er historie. Europa er ett igjen. | sets `muren_passert`, -> `sovjet_kollaps` | -atomspanning 20, +historisk_innsikt 15 |
| `muren_holder_naatt` | Narrativ | Forteller | Vakten holder tilbake mengden - men bare til neste morgen. Muren faller to doegn senere. Historien lar seg ikke stoppe. | -> `sovjet_kollaps` | |
| `sovjet_kollaps` | Narrativ | Gorbatsjov | 25. desember 1991. Gorbatsjov holder en siste tale. Det rode flagget senkes. Sovjet eksisterer ikke lenger. | -> `epilog_konsekvenser` | `discoveryEvent: sovjet_kollaps_arsakene`, +historisk_innsikt 10 |

---

### Epilog: Utilsiktede Konsekvenser

| Node ID | Type | Perspektiv | Beskrivelse | Valg/Neste | Flags/Minispill |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `epilog_konsekvenser` | Narrativ | Forteller | "Historien er ikke ferdig ennaa. La oss se hva valgene dine fikk aa si." | -> `epilog_mujahideen` if `mujahideen_bevapnet` / else `epilog_iran` | |
| `epilog_mujahideen` | Narrativ | Forteller | "1996. En gruppe kalt Taliban tar makten i Afghanistan. De har Stinger-missiler - amerikanske vaapen - fra 1980-tallets CIA-operasjoner." | -> `epilog_iran` | +historisk_innsikt 10 |
| `epilog_iran` | Narrativ | Forteller | If `iran_shah_installert`: "1979. Sjah-regimet faller i islamsk revolusjon. Den demokratisk valgte lederen USA fjernet i 1953, er en av grunnene til antiamerikansk sinne som fortsatt preger Iran." | -> `epilog_chile` | +historisk_innsikt 5 |
| `epilog_chile` | Narrativ | Forteller | If `chile_kupp_godkjent`: "1973-1990: Pinochets regime dreper og torturerer over 3.000 mennesker, og tvangsforsvinne tusener. USA sa ingenting." | -> `ending_select` | +historisk_innsikt 5 |
| `ending_select` | Logic | — | Sjekk ending-betingelser | Conditions -> riktig ending | |
| `ending_fredsskaperen` | Ending | Forteller | Beste: `atomspanning` < 50, `historisk_innsikt` >= 80, `menneskekost` < 40. "Du forsto at styrke ikke er det samme som rettferdighet. Det er den vanskeligste leksen historien laerer." | — | `epilogue` med flag-avsnitt, `historicalEcho` |
| `ending_pragmatikeren` | Ending | Forteller | Standard. "Du spilte realpolitikkens spill. Verden overlevde. Men regningene for de stille beslutningene betales ofte av andre enn de som tok dem." | — | `epilogue`, `historicalEcho` |
| `ending_pyrrhusseiros` | Ending | Forteller | `menneskekost` > 70. "Du 'vant'. Sovjet kollapset. USA dominerer. Men menneskekostnaden av dette 'seiersspillet' er lang og blodig." | — | `epilogue` med alle menneskekost-flags listet opp |
| `game_over_atomkrig` | Ending | Forteller | Atomspanning >= 100. "Det finnes ingen vinnere i en atomkrig. Det visste alle. Likevel var verden noen ganger bare ett feiltrinn unna." | Restart | |

---

### Tilfeldige Hendelser (randomEvents)

| ID | Beskrivelse | Effekt |
| :--- | :--- | :--- |
| `event_stanislav_petrov_1983` | Sovjet-radar varsler rakettangrep. Stanislav Petrov bestemmer at det er en feil. Vil du eskalere? | A: Eskaler (+atomspanning 30) / B: Vent (intet) |
| `event_spion_avsloert` | En CIA-agent er fanget av KGB. Byt dekke eller evakuer? | Valg paavirker `usa_innflytelse` |
| `event_pentagon_papers` | Hemmelige dokumenter om Vietnam lekker til pressen. | +historisk_innsikt 10, -usa_innflytelse 5 |
| `event_ungarn_1956` | Opprorer i Ungarn mot Sovjet-styre. Brezjnev-doktrinens forste test. | If handled: `discoveryEvent: ungarn_opproret` |
| `event_brev_fra_vietnam` | Et brev fra en US-soldat til moren sin. | +historisk_innsikt 5, +menneskekost 5 |
| `event_fredsbevegelse` | Anti-atomvaapenprotester i Vest-Europa. 500.000 i gatene. | Valg: Lytt eller ignorer |

---

## 8. Dialogtone og Stilguide

### Fortellerstemmens karakter
- Nytral, dokumentarisk, engasjerende - som en god historielarer
- Maks 4-5 setninger per node. Aldri en tekstvegg.
- Aldri anklagende mot ett land. Vis kompleksiteten.
- "Du"-perspektiv konsekvent, uansett hvem spilleren er.
- Norsk bokmal. Ikke ord som "kult", "awesome", "faktisk" overbrukt.
- Historiske personligheter snakker aldri som om de leser en Wikipedia-artikkel. Kort. Presist. Menneskelig.

### Eksempel-dialoger

**Stalin i Potsdam (riktig tone):**
> "Truman sier det uten aa blunke: 'Vi har et nytt vapen av enestaaende kraft.' Du noterer deg smilet hans. Det er ikke et vennlig smil."

**Vietnamesisk bonde (riktig tone):**
> "Flybralket er borte. Det er stille. Men stillheten er ikke trygg lenger."

**Kennedy under Kubakrisen (riktig tone):**
> "Bobby sier det lavt: 'Jack, broedrene vaare kommer til aa doe i tusentall hvis dette gaar galt.' Du kjenner vekten av det han ikke sier."

**Gorbatsjov (riktig tone):**
> "Du vet at systemet er sykt. Du vet ogsaa at medisinen kan vaere verre enn sykdommen."

---

## 9. Assets (AI Prompts)

**Hero Image:**
`A dramatic 16:9 cinematic photograph of a divided world. Left half: Manhattan skyline at night, neon signs, 1960s America, prosperity. Right half: grey Soviet city, Red Army parade, overcast sky, oppressive concrete. The Berlin Wall visible dividing the image exactly in the center. Cold morning light. Ultra-detailed photorealism.`

**Node Images:**
- `intro_potsdam`: `Five exhausted world leaders at a formal diplomatic table, Potsdam Palace, 1945. Heavy drapes, candlelight. Post-war gravity on their faces. Cinematic photograph, 16:9.`
- `berlin_mur_ost`: `A young East German man at the newly built Berlin Wall in 1961. Pre-dawn. Wire and concrete stretching into the distance. Guard tower silhouette. He looks west. Gritty film photography, 16:9.`
- `vietnam_sivil_bombing`: `A North Vietnamese family sheltering in a bomb crater, 1968. Mother covers three children. Orange glow of burning village visible through smoke above them. Documentary war photography, 16:9.`
- `kuba_tale`: `President Kennedy at the Oval Office podium, October 1962. Television cameras. American flag. The weight of the world in his expression. Black-and-white documentary style, 16:9.`
- `gorbachev_dilemma`: `Gorbachev at the head of a Soviet Politburo table, 1985. Stern older men around him. Fluorescent lighting. USSR map on the wall. Cinematic documentary, 16:9.`
- `berlin_mur_fall`: `Enormous crowd at the Berlin Wall the night of November 9, 1989. People climbing the wall, crying, embracing. Searchlights and car headlights illuminate the chaos and joy. Historic documentary photograph, 16:9.`
- `afghanistan_landsby`: `An Afghan village under bombardment in the Panjshir Valley, 1984. A woman runs through rubble with children. Smoke rising from ruins. Dust-filled air. Gritty war documentary photography, 16:9.`
- `epilog_mujahideen`: `Armed mujahideen fighters in the Afghan mountains, 1988. Some hold American Stinger missiles. A destroyed Soviet helicopter behind them. Cinematic early morning light. 16:9.`

---

## 10. Pedagogiske Mal (Lk20)

- **Proxykrig:** Elevene ser at USA og Sovjet kjempet indirekte gjennom andre land, og at disse landene led mest.
- **Utilsiktede konsekvenser:** Politiske beslutninger kan ha langvarige, uforutsette resultater. Flag-systemet gjor dette konkret.
- **Dekolonisering:** Den kalde krigen falt sammen med Europas tilbaketrekking fra koloniene. USA og Sovjet fylte maktvakuumet.
- **Menneskelige kostnader:** Perspektivskiftene sikrer at eleven ser konflikten fra vanlige menneskers stavsted, ikke bare stormaktenes.
- **Etikk:** `ethicsLens` paa noekkelvalg gir tre filosofiske rammer: Kant, utilitarisme, dygdsetikk.
- **Ny verdensorden:** Suez-krisen og andre hendelser viser brytningen fra det gamle britisk-franske imperieveldet til USA-Sovjet-bipolariteten.
- **Kompetansemal:** Utforske og reflektere over aarsaker og virkninger av historiske hendelser; kritisk kildekritikk; perspektivmangfold.

---

## 11. Byggenotat (For /build_scenario)

Dette er det storste scenariet som er planlagt. Bygg i denne rekkefolgjen:
1. **Fase 1:** Prolog + Kapittel 1 (15 noder)
2. **Fase 2:** Kapittel 2 (18 noder, inkl. Kubakrisen-sekvens)
3. **Fase 3:** Kapittel 3 (14 noder, inkl. Vietnam-perspektivskifte)
4. **Fase 4:** Kapittel 4 + nye minigame-stubs (`domino`)
5. **Fase 5:** Kapittel 5 + nye minigame-stubs (`propaganda`)
6. **Fase 6:** Epilog, endings, randomEvents, balansering

De to nye minigamene (`propaganda` og `domino`) maa utvikles som React-komponenter parallelt med byggefasene - de kan legges inn som `"type": "signal"` placeholders frem til komponentene er ferdige.
