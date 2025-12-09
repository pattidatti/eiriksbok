# Utviklingsplan for Historiefaget

Dette dokumentet beskriver planlagte utvidelser, forbedringer og ideer for historiefaget i Eiriksbok.

## 1. Innhold (Eksisterende og hull)
Vi har allerede dekket en del norgeshistorie (Vikingtid, Middelalder, 1814) og noe verdenshistorie (Verdenskrigene). Men det er store hull.

*   **Antikken**: Hellas (demokratiets vugge) og Romerriket (allerede påbegynt, men trenger mer dybde).
*   **Mellomkrigstiden**: De glade 20-årene, børskrakket, fremveksten av fascisme.
*   **Den kalde krigen**: Øst vs. Vest, romkappløpet, Berlinmuren.
*   **Moderne tid**: 11. september, digitaliseringens tidsalder, klimakrisens historie (kobling mot Naturfag).
*   **Kvinnehistorie**: Dedikerte leksjoner om stemmerett og kvinners rolle gjennom tidene (ofte utelatt i tradisjonell historieskriving).

## 2. Utvidet Innhold
Gå fra rent faktastoff til narrativ læring.

*   **Biografier**: "Møt personene". Korte profiler av sentrale skikkelser (Cæsar, Jeanne d'Arc, Martin Luther King Jr.) som "chatter" med eleven eller presenteres som "Instagram-profiler".
*   **Kildekritikk**: En egen modul hvor eleven får to motstridende kilder om en hendelse og må vurdere troverdigheten. Dette er kjernekompetanse i ny læreplan.
*   **"Hva om?"-scenarioer**: Kontrafaktisk historie. "Hva om tyskerne vant krigen?" (Man in the High Castle style, men pedagogisk) for å belyse hvorfor ting skjedde som de skjedde.

## 3. Polish
*   **Visuell tidslinje**: Tidslinjen er sentral. Den bør bli mer "levende". Parallax-scrolling bakgrunn som endrer seg fra hulemalerier til skyskrapere etter hvert som man scroller nedover.
*   **Kart**: Kartene bør være vektorbaserte og zoombare, med tydelige fargekoder for imperier og allianser.

## 4. Bedre Kode
*   **Abstraksjon av Tidslinje**: Lag en generisk `TimelineView`-komponent som kan ta inn *enhver* liste med hendelser (ikke hardkodet for en spesifikk periode).
*   **Datastruktur**: Standardiser `Event`-objektet i `timelineData.ts` til å inkludere `lat/long` for automatisk kartplassering.
*   **Markdown-støtte**: Sørg for at alle beskrivelser i `manifest.json` og artikkeltekster rendres med full Markdown-støtte for bedre formatering (fet skrift, lister).

## 5. Bedre Struktur
*   **Tematisk vs. Kronologisk**: Gi brukeren mulighet til å bytte visning. "Vis meg alt om *Krig*" (på tvers av tid) vs "Vis meg *1800-tallet*".
*   **Tag-system**: Utvid tag-systemet (krig, handel, norge, europa) for bedre filtrering.

## 6. Interaktive Modeller
*   **Historisk Kart**: (Allerede planlagt med Colonization map). Utvid dette til "Frontlinjer under 2. verdenskrig" som beveger seg med en slider.
*   **Arkeolog-spillet**: Et spill hvor man "graver ut" gjenstander og må gjette hvilken tidsperiode de tilhører.
*   **Tidsreise-simulator**: En "Choose Your Own Adventure"-tekst hvor du er en bonde under Svartedauden eller en soldat ved Stalingrad. Dine valg avgjør om du overlever.

## 7. Annet (Smart Ideas)
*   **Dagens Dato i Historien**: En liten "widget" på dashbordet som viser en historisk hendelse som skjedde på dagens dato.
*   **Sammenligningsverktøy**: La eleven dra to perioder (f.eks. Romertiden og Vikingtiden) inn i et sammenligningsvindu for å se likheter (slaveri, krigskultur) og forskjeller (teknologi, religion).
