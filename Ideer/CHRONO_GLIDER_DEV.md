# 🚀 Chrono Glider - Development & Design Document

Dette dokumentet inneholder ideer og planer for videreutvikling av spillet **Chrono Glider**.

## 📝 TODO & Forslag (Fra TODO.md)

- [ ] **Skyting:** Legge til skyting med `Spacebar`.
- [ ] **Fiender:** Motstandere som kommer mot spilleren (asteroider, tids-paradokser, historiske motstandere?).
- [ ] **Powerups:** Objekter som kan plukkes opp for fordeler.
- [ ] **Visuell Endring:** Fjern grønn sirkel indikator. Alle porter/mål skal være røde.
- [ ] **Feil svar:** Spillet repeterer spørsmålet eller gir straff hvis man tar feil, i stedet for å bare fly videre.
- [ ] **Boost:** Fly fortere med `W`. Dette skal gi ekstra poeng (risk/reward).

## 💡 Nye Forslag til Forbedringer (Antigravity Ideer)

### 🎨 Visuelt & Atmosfære
- **Parallax Bakgrunn:** Legg til stjerner, galakser eller "tidstunneler" som beveger seg i ulik hastighet for å skape dybdefølelse.
- **Partikkeleffekter:**
  - Motor-spor etter glideren.
  - Eksplosjoner når man treffer riktig svar eller skyter fiender.
  - "Warp speed" effekt når man holder inne `W`.
- **Tidsalder-tema:** Bakgrunnen kan endre seg basert på hvilken tidsalder man flyr gjennom (f.eks. pyramider i bakgrunnen for gamle Egypt).

### 🎮 Gameplay Mekanikker
- **Kombo-system:** Hold "streaken" ved like ved å svare riktig raskt. Høyere kombo gir poeng-multiplikator.
- **Boss Battles:** På slutten av en tidsepoke (f.eks. etter 5 spørsmål om Romerriket), møt en "Boss" (f.eks. Julius Cæsar eller en mytologisk figur) som krever raske svar for å beseires.
- **Skjold/Liv:** Spilleren har 3 liv. Feil svar eller kollisjon med fiende mister et liv. Powerups kan gi liv tilbake sller midlertidig skjold.
- **Hindre:** Statiske objekter man må svinge unna (ikke bare velge riktig port, men unngå "rom-søppel" eller "historisk støy").

### 📚 Læring & Innhold
- **Tids-fragmenter:** Samle "Data Shards" underveis som ikke er spørsmål, men gir små fun-facts eller låser opp entries i en "Codex".
- **Wormholes (Bonusrunder):** En sjelden sjanse til å fly inn i et ormehull for en "Rapid Fire" runde med ja/nei spørsmål for massive poeng.
- **Dynamisk Vanskelighetsgrad:** Hvis spilleren svarer riktig ofte, øker hastigheten. Hvis de feiler, sakker det ned litt.

### 🔊 Lyd
- **SFX:** Lydeffekter for skyting, boost, "popp" når man treffer riktig svar.
- **Musikk:** En drivende synth-wave eller orkestral soundtrack som bygger seg opp. Kanskje endrer stil etter tidsalder?

## 🛠️ Teknisk Implementeringsplan

1.  **Input Kontroller:** Utvide `useGameStore` eller input-lyttere til å håndtere `Space` (skyting) og `W` (boost).
2.  **Spiller-logikk:** Legge til health, score-multiplier og hastighets-variabler i state.
3.  **Fiende-system:** Lage en `EnemySpawner` som kan spawning objekter i banen.
4.  **Kollisjonsdeteksjon:** Forbedre kollisjonssystemet til å håndtere prosjektiler (skudd) vs fiender, og spiller vs powerups.
