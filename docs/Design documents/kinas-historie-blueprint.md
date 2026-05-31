# Subject Blueprint: Kinas historie
> **Status:** `Draft`
> **Version:** 1.0

---

## 0. Hvorfor dette emnet

Kina er verdens mest befolkede land og en global supermakt, men mangler fullstendig dekning i Eiriksbok. Det er et pedagogisk hull som blir mer merkbart for hvert år — moderne nyheter, økonomi og geopolitikk gir liten mening uten å forstå Kinas særegne historiske selvbilde.

Emnet binder seg tett til eksisterende innhold:

- **Kolonialisering** — Opiumskrigene er Europas imperialisme i Øst-Asia.
- **Industriell revolusjon** — Kina som råvareleverandør og markedsdrøm for vestlige stormakter.
- **Den kalde krigen** — Kina er ikke bare en sidelinje, det er en tredje pol.
- **Dekolonisering** — Kommunistrevolusjonen er Kinas svar på vestlig dominans.
- **Teknologi og hverdagsliv** — Kina er i dag en teknologisk ledernasjon.

Målet: et emne som tar eleven fra de store dynastiene frem til Xi Jinpings supermakt, og gir dem verktøy til å forstå nyheter om Kina i dag.

---

## 1. Metadata
- **Type:** `Topic` (Emne)
- **Parent (Fag):** `historie`
- **Topic ID:** `kinas-historie`
- **Title:** Kinas historie: Midtens rike
- **Visual Theme:** Fotorealistisk, filmatisk look etter `docs/image-style-guide.md`. Gjennomgående visuelt motiv: Imperialrødt og gull i dynastitiden som gradvis erstattes av revolusjonens røde flagg, og til slutt det moderne Shanghais lysende skyline. Sterk kontrast mellom antikk stein og moderne betong.

---

## 2. The Narrative Arc

**The Hook:**
"I over 2000 år trodde kineserne at de bodde i midten av verden — og i lange perioder hadde de rett. Så kom europeerne med opium og kanonbåter, og det tok et helt århundre med krig, hungersnød og revolusjon før Kina krevde sin plass tilbake."

**The Arc:**
Vi starter med keisere og den store muren — et land som bevisst stengte seg ute fra verden. Vi ser Silkeveien som det eneste åpne vinduet mot vest, og deretter ydmykelsen da europeerne tvang seg inn med opiumskrigene. Vi følger Kinas desperasjon gjennom fall av dynastiet, borgerkrig, japansk okkupasjon og til slutt Maos revolusjon. Deretter: det katastrofale "store spranget" og kulturrevolusjonen — millioner av liv for en ideologi. Vendepunktet: Deng Xiaoping åpner Kina for verdensøkonomien. Kulminasjonen: Xi Jinpings drøm om å bringe "Midtens rike" tilbake i sentrum av verden.

---

## 3. The Learning Path (The Spine)

1. **[Article]** Oversikt: Midtens rike gjennom 3000 år (ID: `oversikt`)
2. **[Article]** De store dynastiene: Keisere og sivilisasjon (ID: `dynastiene`)
3. **[Article]** Silkeveien: Da Kina handlet med verden (ID: `silkeveien`)
4. **[Article]** Ydmykelsen: Opiumskrigene og europeisk imperialisme (ID: `opiumskrigene`)
5. **[Article]** Republikkens fall: Borgerkrig og revolusjon (ID: `borgerkrigen`)
6. **[Article]** Mao Zedong: Revolusjonens far (ID: `mao-og-revolusjonen`)
7. **[Article]** Det store spranget og kulturrevolusjonen (ID: `store-spranget`)
8. **[Article]** Deng Xiaoping: Kina åpner for verden (ID: `deng-og-reformene`)
9. **[Article]** Tiananmen 1989: Da studentene krevde frihet (ID: `tiananmen-1989`)
10. **[Article]** Kina som supermakt (ID: `kina-supermakt`)
11. **[Quiz]** Kinas historie fra dynastier til supermakt
12. **[Interactive]** Tidslinje: Fra Qin-dynastiet til Xi Jinping

---

## 4. The Content Matrix (The Bricks)

### 1. Oversikt: Midtens rike gjennom 3000 år
- **File:** `public/content/historie/kinas-historie/oversikt.json`
- **Pedagogical Goal:** Gi eleven et kognitivt kart over Kinas historie — dynastisykluser, det konfutsianske verdenssynet og idéen om Kina som verdens naturlige sentrum.
- **Beats:** Hook: Keiseren er "Himmelens sønn" — verden dreier rundt ham. Conflict: Hvert dynasti fødes i styrke og dør i korrupsjon og kaos. Resolution: Dynastisyklusen er nøkkelen til å forstå hele kinesisk historie, inkludert kommunistpartiet i dag.
- **Interactive:** `MapCarousel` — Kinas territorielle utstrekning under de store dynastiene (Han, Tang, Song, Ming, Qing).
- **Connections:** `historie/jordbruk-og-sivilisasjoner/oversikt` (de eldste sivilisasjonene).

### 2. De store dynastiene: Keisere og sivilisasjon
- **File:** `.../dynastiene.json`
- **Pedagogical Goal:** Forstå hva kinesisk keisermakt faktisk var: mandariner, konfusianisme, eksamen som karrierevei, og de store teknologiske nyvinningene (papir, kruttet, kompasset, trykking).
- **Beats:** Hook: Fire oppfinnelser som endret verden — og ingen i Vesten visste det på 1000 år. Conflict: Et system som belønnet lærdom, men skapte et rigid byråkrati. Resolution: Kinas "head start" i sivilisasjon — og forklaringen på den kulturelle selvtilliten.
- **Interactive:** `FactBox` — De fire store oppfinnelsene med konkrete eksempler på global påvirkning.
- **Connections:** `historie/middelalderen/oversikt` (Europa i samme periode).

### 3. Silkeveien: Da Kina handlet med verden
- **File:** `.../silkeveien.json`
- **Pedagogical Goal:** Forstå Silkeveien som det eneste vinduet mellom Kina og resten av verden i over 1500 år — og hva som ble handlet (ikke bare silke, men idéer, sykdommer og religioner).
- **Beats:** Hook: En karavane setter ut fra Chang'an med silke til Roma. Conflict: Monopol på silke gir keiserne enorm makt — til noen lærer å lage silke selv. Resolution: Silkeveien bringer ikke bare varer, men buddhisme, pest og persisk kunst til Kina.
- **Interactive:** `HanseaticTradeMap`-variant eller `MapCarousel` — Silkeveiens ruter og handelsvarer.
- **Connections:** `historie/kolonialisering/verdenshandel-for-oppdagelsesreisene`, `historie/romerriket/handel`.

### 4. Ydmykelsen: Opiumskrigene og europeisk imperialisme
- **File:** `.../opiumskrigene.json`
- **Pedagogical Goal:** Forstå "det 100-årige århundret med ydmykelse" (1839-1949) — hvordan Europa brøt gjennom Kinas selvpålagte isolasjon med vold og narko.
- **Beats:** Hook: Britene selger opium til kinesere for å betale for te — og det fungerer. Conflict: Kina forbyr opium; Storbritannia sender krigsskip. Resolution: Nanking-traktaten 1842 — Kina tvinges til "ulike traktater" og mister Hong Kong. Såret er åpent i 180 år.
- **Interactive:** `BiasLens` — Britisk vs. kinesisk perspektiv på opiumskrigene.
- **Connections:** `historie/kolonialisering/oversikt`, `historie/industriell-revolusjon/storbritannia`.

### 5. Republikkens fall: Borgerkrig og revolusjon
- **File:** `.../borgerkrigen.json`
- **Pedagogical Goal:** Forstå fallet av Qing-dynastiet (1912), Kuomintang vs. kommunistene, og den japanske invasjonen som forseglet resultatet.
- **Beats:** Hook: Siste keiser: seks år gammel, alene på tronen i den forbudte by. Conflict: Sun Yat-sen mot krigsherre-kaos; Mao mot Chiang Kai-shek. Resolution: "Den lange marsjen" og den japanske invasjonen gjør Mao til folkehelt. Borgerkrigen ender 1949.
- **Interactive:** `DragDropTimeline` — Nøkkelhendelser 1912-1949 i rekkefølge.
- **Connections:** `historie/andre-verdenskrig/krigen-i-asia` (Japans rolle i Kina).

### 6. Mao Zedong: Revolusjonens far
- **File:** `.../mao-og-revolusjonen.json`
- **Pedagogical Goal:** Forstå hvem Mao var, hva kommunistrevolusjonen 1949 betydde for kineserne (frigjøring og undertrykkelse på én gang), og det nye Folkerepublikkens første år.
- **Beats:** Hook: 1. oktober 1949 — Mao på Tiananmen-plassen: "Det kinesiske folket har reist seg!" Conflict: Land til bøndene, men frihet tar de tilbake. Resolution: Et nytt Kina, men et Kina der partiet er alt.
- **Connections:** `historie/den-kalde-krigen/kommunismens-fremvekst`.

### 7. Det store spranget og kulturrevolusjonen
- **File:** `.../store-spranget.json`
- **Pedagogical Goal:** Forstå to av 1900-tallets største menneskeskapte katastrofer: Det store spranget fremover (1958-62, ~45 millioner døde av sult) og kulturrevolusjonen (1966-76, millioner forfulgt).
- **Beats:** Hook: Mao vil at Kina skal ta igjen Storbritannia i stålproduksjon — på 15 år. Conflict: Lærere er fiender; ungdommer ødelegger templer og biblioteker. Resolution: Kaos som tar et helt generasjonsskifte å leges — og temaet som er sensurert i Kina i dag.
- **Interactive:** `ScenarioRoleplay` — Eleven i rollen som ung kineser under kulturrevolusjonen.
- **Connections:** `historie/andre-verdenskrig/holocaust` (sammenligning av ideologisk massevold — pedagogisk forsiktig).

### 8. Deng Xiaoping: Kina åpner for verden
- **File:** `.../deng-og-reformene.json`
- **Pedagogical Goal:** Forstå "reform og åpning" etter 1978 — markedsøkonomi under kommunistisk styre, de spesielle økonomiske sonene og Kinas transformasjon til verdens fabrikk.
- **Beats:** Hook: "Det spiller ingen rolle om katten er svart eller hvit, så lenge den fanger mus." Conflict: Frihet til å tjene penger, men ikke politisk frihet. Resolution: Kinas BNP seksdobles på 20 år — og 800 millioner løftes ut av fattigdom.
- **Connections:** `historie/industriell-revolusjon/oversikt` (kontrast og parallell), `historie/den-kalde-krigen/avslutningen`.

### 9. Tiananmen 1989: Da studentene krevde frihet
- **File:** `.../tiananmen-1989.json`
- **Pedagogical Goal:** Forstå demonstrasjonene på Tiananmen-plassen, massakren 4. juni 1989 og hvorfor hendelsen er sensurert i Kina.
- **Beats:** Hook: Den ukjente mannen og tanken — et bilde sensurert for 1,4 milliarder. Conflict: Studenter krever demokrati; partiet ser en trussel mot sin eksistens. Resolution: Massakren begraver ikke demokratibevegelsen — men den forklarer Kinas politiske veivalg i de neste 35 årene.
- **Interactive:** `BiasLens` — Kinesisk statsmedia vs. øyenvitner.
- **Connections:** `historie/den-kalde-krigen/avslutningen` (Berlin-muren falt samme år).

### 10. Kina som supermakt
- **File:** `.../kina-supermakt.json`
- **Pedagogical Goal:** Forstå Kinas posisjon i dag: økonomi, teknologi, Xi Jinping, "den nye silkeveien" (Belte- og vei-initiativet), Taiwan-konflikten og forholdet til Vesten.
- **Beats:** Hook: Kina er verdens største økonomi (kjøpekraftsjustert) og produserer halvparten av verdens solpaneler. Conflict: Demokrati vs. autoritært styre — og hva betyr det at Kina lykkes? Resolution: "Midtens rike" er tilbake i sentrum — og det er årets viktigste geopolitiske spørsmål.
- **Interactive:** `DebateSimulator` — Er Kinas vekst en trussel eller en mulighet for verden?
- **Connections:** `historie/den-kalde-krigen/avslutningen`, `samfunnskunnskap/globalisering`.

---

## 5. The Asset Tracker

Alle prompts følger `docs/image-style-guide.md`: starter med "A highly realistic 4K cinematic photograph", spesifisert lyskilde, kameravinkel og historisk epoke, ender med "16:9 ratio". WebP, inline < 100KB, hero opp til 1600px.

| Status | Type | Prompt | Filename |
| :--- | :--- | :--- | :--- |
| `[ ]` | Hero | A highly realistic 4K cinematic photograph of the Great Wall of China winding over misty mountains at dawn, ancient stone and watchtowers, atmospheric golden hour light, high angle aerial perspective. 16:9 ratio. | `hero_oversikt.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a Tang dynasty Chinese emperor in elaborate silk robes on a red lacquered throne, golden lantern light, detailed throne room, eye level. 16:9 ratio. | `dynastiene.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a Silk Road camel caravan crossing a golden desert at sunset, silk bales loaded on camels, distant mountains, dramatic backlit silhouettes. 16:9 ratio. | `silkeveien.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a British warship firing cannon at a Chinese coastal fortress, 1840s, smoke and fire, dramatic overcast sky, wide angle showing both ship and fort. 16:9 ratio. | `opiumskrigene.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the Long March, exhausted Red Army soldiers crossing a rope bridge over a mountain river in 1935, misty dramatic mountain scenery, eye level. 16:9 ratio. | `borgerkrigen.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of Mao Zedong speaking to a crowd from Tiananmen Gate, 1949, red banners and crowds, overcast Beijing sky, mid-range shot showing both speaker and crowd. 16:9 ratio. | `mao-revolusjonen.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of an abandoned backyard steel furnace in rural China, 1958, rusting metal, overgrown weeds, diffuse overcast daylight, melancholy atmosphere. 16:9 ratio. | `store-spranget.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the Shenzhen skyline under construction in 1985, cranes and half-built skyscrapers beside rice fields, golden afternoon light, wide angle showing the contrast. 16:9 ratio. | `deng-reformene.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of a lone figure standing in front of a column of tanks on a Beijing street, 1989, tense atmosphere, diffuse morning light, wide shot showing scale. 16:9 ratio. | `tiananmen-1989.webp` |
| `[ ]` | Content | A highly realistic 4K cinematic photograph of the Shanghai skyline at night, Pudong's towers reflected in the Huangpu River, dramatic city lights and atmospheric haze, high angle. 16:9 ratio. | `kina-supermakt.webp` |

---

## 6. Neste steg

Dette blueprintet er klart for `/build_topic`. Bygget skal (ikke utført ennå):
1. Opprette 10 artikkel-JSON i `public/content/historie/kinas-historie/`, hver `"layout": "rich"`, 800-1200 ord, flat `content`-array (ingen bold/markdown-lister i tekst).
2. Registrere nytt topic under `historie` i `public/content/manifest.json` (sjekk at IDen `kinas-historie` ikke finnes fra før — unngå ghost data).
3. Sette `year` på toppnivå i hver artikkel for tidslinje-integrasjon. Konsistente tags på tvers av artikler.
4. Generere de 10 bildene via `/bilde`-flyten.
