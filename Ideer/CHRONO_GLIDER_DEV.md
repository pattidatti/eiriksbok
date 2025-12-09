# 🚀 Chrono Glider - Development & Design Document

Dette dokumentet inneholder ideer og planer for videreutvikling av spillet **Chrono Glider**.

## ✅ Nylig Implementert (Status: Ferdig)

### 🎨 Visuelt & Effekter
-   **Engine Particles:** `EngineExhaust` system som bruker InstancedMesh for ytelse. Partikler har korrekt fysikk (henger igjen i luften mens skipet flyr fra dem).
-   **Shooting:** `ProjectileManager` refaktorert for ytelse (ingen React state-updates i game loop). Skyting med `Space` eller `Mellomrom` scroller ikke lenger siden.
-   **Powerups:** Visuelt distinkte "Hearts" (Rosa/Røde) som spinner. Gir +1 Liv og 500 poeng.

### 🎮 Gameplay Mekanikker
-   **Lives:** Økt fra 3 til 5.
-   **Controls:**
    -   `W` for Speedboost.
    -   `SPACE` for Shooting.
-   **UI / HUD:**
    -   Integritets-bar viser nå 5 segmenter.
    -   Hint nede i venstre hjørne: "W - Speedboost" og "SPACE - Shoot".
    -   Feedback ("CORRECT/WRONG") flyttet til bunnen, mindre forstyrrende.

## 📝 TODO & Fremtidsplaner

### 🔄 Level System / Infinite Loop
-   [ ] **Nivå-progresjon:** Når man har klart alle hendelser i en tidsalder (nivå), start neste nivå i stedet for "Game Won".
-   [ ] **Visuell Progresjon:** Endre fargepalett (Bakgrunn, Tunnel, Tåke) for hvert nivå for å indikere fremgang.
-   [ ] **Vanskelighetsgrad:** Øke hastighet eller antall hindre per nivå.

### 🐛 Known Issues / Polish
-   [ ] Sikre at "Wrong Time" straff er rettferdig (kanskje bare miste poeng, ikke liv?).
-   [ ] Legge til flere typer powerups (Shield, Ammo?).

## 🛠️ Teknisk
-   **Store:** `gameStore` må utvides med `level`, `currentPalette`, etc.
-   **Content:** Trenger en måte å generere uendelig med hendelser på, eller loope timeline-data med økt vanskelighetsgrad.
