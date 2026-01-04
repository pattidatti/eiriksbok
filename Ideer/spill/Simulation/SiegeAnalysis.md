# Beleirings-analyse: Fra Bonde til Baron

## 1. Analyse-mål
Gjennomgang av beleirings-mekanismen fra en "fresh server" tilstand, evaluering av spill-loopen, balansehull og manglende funksjonalitet.

---

## 2. Den "Friske" Server-flyten (Bonde -> Baron)
*   **Mekanisme:** Alle starter som bønder. De må samarbeide om å bygge `manor_vest` eller `manor_ost` i `village`.
*   **Problem (Ninja-promotering):** Siden bygget er felles (`world.settlement`), kan en spiller som bare bidrar med det siste materialet teknisk sett fullføre bygget.
*   **Hullet:** Vi mangler en logikk som automatisk tildeler rollen til **Top Contributor**. Dette må vi ha. 
*   **Konsekvens:** Stor risiko for frustrasjon hvis en "igloo-bygger" stjeler tittelen fra de som faktisk har farmet materialene.

---

## 3. Forsvars-fasen (Baronens styre)
*   **Mekanisme:** Baronen bruker `handleReinforceGarrison` og `handleRepairWalls` via `ManagementHandlers.ts`.
*   **Hull:** Disse verdiene (`region.fortification.hp` og `region.garrison`) blir lagret i databasen, men **aldri lest** av `SiegeHandlers.ts`.
*   **Konsekvens:** Baronen kaster penger og ressurser ut av vinduet. Uansett hvor mye han oppgraderer murene, har porten fremdeles de samme 5000 HP.

---

## 4. Opprøret (Beleiringen)
*   **Trigger-hullet:** Per nå kan hvem som helst starte en beleiring gratis via `handleStartSiege`.
*   **Hullet:** Vi har planlagt et "War Horn"-item i design-dokumentet, men det finnes hverken som oppskrift eller som sjekk i koden.
*   **Konsekvens:** "Siege-spamming" hvor en enkelt spiller kan låse regionen i krig-modus konstant uten kostnad.
* **løsning**: En spiller må ha 500 beleiringssverd for i det helt tatt starte en beleiring, samsvarer dette med war horn? De 500  kan de bruke i angrepet, de blir ikke konsumert av å initiere et angrep, det er bare en sjekk. 

### Fase 1: Breach (Porten) [IMPLEMENTERT]
*   **Løsning:** Angriperne gjør nå 25 skade med sverd, og 2 med nevene. Hvert angrep med sverd konsumerer 1 `swords` resource. 
*   **Balanse:** Porten henter nå HP dynamisk fra `region.fortification.hp`, som Baronen kan oppgradere eller reparere.

### Fase 2: Courtyard (Lanes) [IMPLEMENTERT]
*   **Mekanisme:** Lagt til Archer Volley (piler fra murene). 
*   **Skade:** Sjanse for å bli truffet øker med Baronens `defenseLevel`. Piler gjør 15 skade.

### Fase 3: Throne Room (The Race) [IMPLEMENTERT]
*   **Balanse-hull:** Baronen har nå "Home ground advantage".
*   **Løsning:** `armor` drain på tronen reduseres med opptil 80% basert på mengden `armor` lagret i Baronens garnison (Garnison-skjold).

---

## 5. Konklusjon: Er vi klare?
**Nei.** Vi har utviklet en flott "teater-kulisse" for krig, men de økonomiske tannhjulene griper ikke i hverandre. 

### Kritiske hull:
1.  **Disconnect:** Krigsmekanikken leser ikke regionens forsvars-stats.
2.  **Gratis Krig:** Beleiring koster ingenting for angriperne.
3.  **Ubrukelige Items:** Beleirings-våpen og rustning har ingen funksjon i Fase 1.

---

## 6. Løsningsforslag
*   [ ] Implementer `war_horn` oppskrift.
*   [ ] Oppdater `handleStartSiege` til å kreve `war_horn`.
*   [ ] Oppdater `handleSiegeAction` til å kreve `swords` for å gjøre full skade i Fase 1.
*   [ ] Gjør `GATE_MAX_HP` dynamisk basert på `region.fortification.hp`.
*   [ ] Legg til "Soldat-assist" i Fase 3 for baroner som har `manpower`.
