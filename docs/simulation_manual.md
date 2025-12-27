# Eiriksbok: Simulation System Manual 📜

Denne dokumentasjonen dekker de sentrale mekanikkene, formlene og variablene som styrer spillets logikk.

## 1. Oversikt
Spillet er en sanntids flerspiller-simulering bygget på Firebase Realtime Database. Tilstanden er "delt", men logikken kjøres primært via atomiske transaksjoner (actions) som trigger når spillere trykker på knapper.

### Core Loop
1. **Spiller-handling**: En spiller trykker "Høste Korn".
2. **Kostnadssjekk**: Råvarer og Stamina sjekkes mot `ACTION_COSTS`.
3. **Modifikatorer**: Årstid, Vær, Lover, og Minigame-resultat kalkuleres.
4. **Resultat**: Spillerens inventory oppdateres, og en global melding sendes.

---

## 2. Roller & Hierarki
Definert i `constants.ts` -> `ROLE_DEFINITIONS`.

| Rolle | Primæroppgave | Økonomi |
|-------|---------------|---------|
| **KING** | Styre riket, vedta lover (`Tinget`), kreve Royal Tax. | Får % av Baroners inntekt. |
| **BARON** | Styre regioner, beskytte bønder (Raids), kreve skatt. | Får % av Bønders inntekt. |
| **PEASANT** | Produsere mat (Grain/Flour), bygge infrastruktur. | Betaler mye skatt, men er ryggraden. |
| **SOLDIER** | Delta i krig/raids, beskytte riket. | Lønn fra Kongen/Baron (ikke impl. enda). |
| **MERCHANT** | Kjøpe/Selge på markedet (Arbitrage). | Ingen produksjon, kun handel. |

---

## 3. Den Levende Verden

### Årstider (`SEASONS`)
| Årstid | Yield Mod | Stamina Mod | Effekt |
|--------|-----------|-------------|--------|
| **Vår** | 1.0x | 1.0x | Standard. |
| **Sommer**| 1.2x | 1.0x | Bonus på tømmerhogst (+2). |
| **Høst** | 1.5x | 1.0x | Stor innhøsting! |
| **Vinter**| 0.0x | 1.5x | Ingenting gror. Ting koster mer energi. |

### Vær (`WEATHER`)
Påvirker både yield og minigame-hastighet.
- **Storm**: Halverer utbytte (0.5x) og dobler energibruk (2.0x).
- **Tåke**: Gjør det vanskeligere å treffe i minigames.

---

## 4. Økonomi & Formler

### Produksjon (Yield)
Formelen for utbytte av arbeid er:
```ts
FinalYield = BaseYield * SeasonMod * WeatherMod * LawMod * MinigamePerformance
```
- **BaseYield**: 10 (Grain/Flour/Swords), 5 (Wood).
- **LawMod**: F.eks. *Conscription* gir 0.8x yield.
- **MinigamePerformance**: En score fra 0.0 til 1.0. Gir multiplier fra 0.5x til 1.5x (eller 2.0x for Crafting).

### Skatt
- **Peasant Tax**: Standard **15%**. (Kan senkes til **7%** med loven *Skattekutt*).
- **Royal Tax**: Standard **20%** av Baronenes beholdning.

### Marked
Priser justeres dynamisk basert på tilbud og etterspørsel (Slippage):
- **Impact Factor**: Hvert kjøp/salg påvirker prisen med **0.5%** per enhet.
- **Formel Kjøp**: `NyPris = GammelPris * (1 + (0.005 * Antall * Demand))`
- **Formel Salg**: `NyPris = GammelPris * (1 - (0.005 * Antall))`
- **Salgsverdi**: Du får **80%** av markedspris (kan økes med `Trade License`).
- **Safety**: Priser kan aldri gå under 0.2x eller over 5.0x av basepris (teoretisk).

> [!TIP]
> Små transaksjoner påvirker prisen lite. Store "dumping" salg vil krasje prisen raskt!

---

## 5. Lov & Rett (Tinget)
Løper i `SimulationHost.tsx` og `actions.ts`.
- **Peace Treaty**: Blokkerer `RAID` handlingen fysisk.
- **Tax Cut**: Endrer `taxRate` variabelen i skatte-kalkulasjonen.

---

## 6. Guide for Balansering ⚖️
All balansering gjøres nå i filen:
`src/features/simulation/constants.ts`

Se etter objektet `GAME_BALANCE`:
```ts
export const GAME_BALANCE = {
    TAX_RATES: { ... },
    YIELDS: { ... }
}
```
Endre verdiene her, og appen oppdateres automatisk (ingen omstart av database kreves, men klienter må refreshe).
