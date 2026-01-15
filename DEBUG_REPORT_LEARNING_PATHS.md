# Diagnose-rapport: Læringsstier (Loading Issues)
**Dato:** 15.01.2026
**Status:** LØST (Verifisert i register)

## Sammendrag
Bruker opplevde at læringsstier (f.eks. `nyromantikken-sti`) lastet sporadisk, og ofte krevde navigering frem og tilbake. Problemet gjaldt flere læringsstier.

## Diagnose (Root Cause Analysis)

Problemet var sammensatt av to feil som forsterket hverandre ("The Swiss Cheese Model"):

1.  **Foreldet Innholdsregister (Stale Registry - Tier 1 Failure)**
    *   Filen `content-index.json`, som fungerer som systemets "adresseliste", manglet oppføringer for flere læringsstier (inkludert `nyromantikken-sti`, `realismen-sti`, `romantikken-sti`).
    *   Dette skjer hvis `npm run dev` (som kjører skannescriptet) ikke startes på nytt etter at nye filer er lagt til.
    *   **Konsekvens:** Applikasjonen fant ikke filen i hovedregisteret og returnerte `null` umiddelbart, noe som tvang frem en "Fallback" til Tier 2 (Manifestet).

2.  **Kodefeil i Manifest-søket (Buggy Fallback - Tier 2 Failure)**
    *   Når systemet prøvde å finne filen via Manifestet (backup-løsningen), feilet det på grunn av en logisk feil i `contentLoader.ts`.
    *   Funksjonen `findNodeInManifest` sluttet å lete for tidlig. Hvis den fant en `lessons`-liste i et emne (f.eks. i "Litteraturhistorie"), ignorerte den helt `tools`-listen i samme emne.
    *   Siden læringsstiene ligger under `tools`, ble de aldri funnet av backup-systemet.

3.  **Hvorfor "Av og til"?**
    *   Sporadisk suksess skyldtes sannsynligvis caching-mekanismer eller at Tier 3 (ren gjettverk-basert URL) slo inn under spesifikke omstendigheter, men dette var ustabilt.

## Utførte Tiltak

1.  **Kodefiks (Permanent Bugfix):**
    *   Oppdaterte `src/utils/contentLoader.ts`.
    *   Endret søkelogikken til å sjekke *alle* undermapper (`lessons`, `tools`, `topics`) i stedet for å stoppe ved første treff. Dette sikrer at backup-systemet nå er robust.

2.  **Datafiks (Register-oppdatering):**
    *   Kjørte `node scripts/generateContentIndex.js` manuelt.
    *   **Resultat:** Registeret ble oppdatert med 447 IDs. Vi verifiserte at `nyromantikken-sti` (og de andre stiene) nå ligger inne i `content-index.json`.

## Konklusjon for videre arbeid
Siden registeret nå er oppdatert, skal **ALLE** læringsstier fungere umiddelbart via Tier 1. Du trenger ikke gjøre noe mer med dem.

**Anbefaling for fremtiden:**
Hvis du legger til nye filer (`.json`) i `public/content`:
*   Stopp serveren (`Ctrl + C`).
*   Kjør `npm run dev` på nytt.
*   Dette tvinger `scan:content`-scriptet til å kjøre og oppdatere registeret.
