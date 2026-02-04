---
description: 
---

# Håndbok: Lage nye læringsstier i Eiriksbok

Dette dokumentet beskriver den komplette prosessen for å opprette, strukturere og implementere nye læringsstier. En læringssti er en kuratert reise gjennom et emne, som binder sammen artikler, oppgaver og interaktive spill.

## 1. Konsept og Planlegging

Før du skriver kode, må du strukturere stien pedagogisk.

### Sjekkliste for innhold
*   **Tema**: Hva er den røde tråden? (F.eks "Vikingtiden" eller "Den industrielle revolusjon")
*   **Målgruppe**: Er det for introduksjon eller fordypning?
*   **Omfang**: En god sti bør ha 10-20 steg.
*   **Artikler**: Har vi de nødvendige underliggende artiklene? (Hvis ikke, må disse opprettes som "placeholders" først).
*   **Narrativ bue (3-Akters Modellen)**: Del stien inn i tre dramatiske akter for å håndtere kognitiv belastning:
    1.  **Akt 1: Opptakten** (Etablering, målet settes).
    2.  **Akt 2: Konfrontasjonen** (Kampen, utfordringene, vendepunktet).
    3.  **Akt 3: Resolusjonen** (Resultatet, konsekvensene, lærdommen).
*   **Perspektiv**: Bruk konsekvent "Du"-perspektiv som utvikler seg (f.eks. fra bonde til konge).

### Obligatorisk "Steg 0": Onboarding
Hver læringssti må starte med et **Steg 0 (Prolog)**. Dette steget skal:
1.  Anta **null forkunnskap** hos eleven.
2.  Sette den historiske scenen før dramatikken starter.
3.  Bruke en oversiktsartikkel som kilde for å gi et trygt "fakta-fundament".

## 2. Filstruktur

Læringsstier lagres som JSON-filer sammen med emnets artikler.

**Eksempel:**
```
public/content/historie/vikingtiden/vikingtiden-sti.json
```

Navngivingen bør følge mønsteret `[emne]-sti.json`.

## 3. JSON-Struktur

En læringssti består av metadata og en liste med steg.

### Baseskjema (`LearningPathData`)

```json
{
    "id": "mitt-emne-sti",
    "title": "Læringssti: Tittel",
    "description": "Vises på kortet i Biblioteket. Må være selgende og konsis.",
    "layout": "learning-path",
    "category": "Læringssti",
    "year": "1914-1918",
    "readTime": "3 timer",
    "heroImage": "/bilder/mitt-emne/hero.jpg", 
    "learningPathData": {
        "id": "mitt-emne-sti",
        "title": "Tittel inne i selve komponenten",
        "description": "Lengre beskrivelse...",
        "steps": [ ... ]
    }
}
```

### Steg-struktur (`LearningPathStep`)

Hvert steg i `steps`-arrayet kan være av typen:
*   `fakta`: Ren informasjon.
*   `refleksjon`: Spørsmål til ettertanke.
*   `utfordring`: Noe vanskeligere.
*   `oppgave`: Konkrete gjøremål.
*   `ressurs`: Lenker til fordypning.

Hvert steg skal ha **5-8 oppgaver** som følger **Blooms Taksonomi (Scaffolding-trappen)**:

> [!IMPORTANT]
> **Regel for artikler**: Hvis et steg krever at eleven leser en artikkel for å finne svarene, skal dette **ALLTID** være den første oppgaven i `tasks`-arrayet. Oppgaven skal være en klikkbar lenke.
> *   **Format**: `Les artikkelen [Artikkelnavn](/historie/emne/artikkel)`
> *   **Viktig**: Bruk alltid **absolutt sti** (starter med `/`) for å sikre at lenken fungerer uavhengig av hvor eleven befinner seg i appen.

1.  **Fakta**: (Gjenkalling) Svar som finnes direkte i teksten.
2.  **Forståelse**: (Forklaring) Eleven må forklare mekanismer eller årsaker.
3.  **Analyse/Etikk**: (Refleksjon) Eleven må vurdere dilemmaer eller se lange linjer.

```json
{
    "id": "unik-id-for-steget",
    "phase": "Akt 1: Navn på Akten",
    "title": "Stegets tittel",
    "type": "fakta", 
    "content": "Selve teksten skal være guiding og narrativ. Skriv 1-3 avsnitt (ca. 150-300 ord). Beskriv scenen, forklar hva som skjer i verden, og gi eleven et hint om hva de skal lete etter i artiklene. 'Du står i gjørma... Se etter hvordan soldatene holdt seg tørre.'",
    "tasks": [
        "Les artikkelen [Slaget ved Somme](/historie/forste-verdenskrig/somme)",
        "Hva skjedde med...? (Fakta)",
        "Hvorfor var det viktig at...? (Forståelse)",
        "Ville du valgt annerledes hvis...? (Etikk)"
    ],
    "links": [
        {
            "title": "Les mer om dette",
            "url": "/historie/emne/artikkel"
        }
    ]
}
```

### Interaktive Komponenter (Fase 2)

Du kan legge inn spill og verktøy direkte i et steg ved å bruke `component`-feltet.

> **Tips:** Hvis ingen av de eksisterende komponentene passer til ditt innhold, ikke nøl med å **foreslå nye!** Vi utvider stadig biblioteket med skreddersydde verktøy for spesifikke læringsmål.

#### Tilgjengelige komponenter:

**1. BiasLens (Perspektiv/Kildekritikk)**
Lar eleven se samme tekst gjennom ulike "linser" (f.eks. Fransk vs Tysk avis).
```json
"component": {
    "name": "BiasLens",
    "props": {
        "title": "Krigspropaganda",
        "baseContent": "Slaget var hardt...",
        "lenses": [
            {
                "id": "german",
                "label": "Tysk Avis",
                "description": "Fokus på heroisme.",
                "theme": { "color": "#ef4444", "bgColor": "bg-red-50", "borderColor": "border-red-200", "textColor": "text-slate-900" },
                "replacements": [
                    { "original": "Slaget", "replacement": "Den heroiske kampen", "explanation": "Propaganda..." }
                ]
            }
        ]
    }
}
```

**2. PackTheBag (Ressursstyring)**
Brukes for forberedelser, reiser eller økonomi.
```json
"component": {
    "name": "PackTheBag",
    "props": {
        "capacity": 500,
        "targetValue": 80,
        "items": [
           { "id": "item1", "name": "Navn", "weight": 50, "value": 30, "icon": "🐟" }
        ]
    }
}
```

**3. ScenarioRoleplay (Valg-basert historie)**
Brukes for dilemmaer og historisk empati.
```json
"component": {
    "name": "ScenarioRoleplay",
    "props": {
        "title": "Tittel",
        "intro": "Intro tekst...",
        "startId": "start",
        "scenarios": [
            {
                "id": "start",
                "text": "Hva gjør du?",
                "options": [
                    { "label": "Valg A", "nextId": "a" },
                    { "label": "Valg B", "nextId": "b" }
                ]
            }
        ]
    }
}
```

**4. DebateSimulator (Argumentasjon)**
Brukes for politikk, rettssaker eller konflikter.
```json
"component": {
    "name": "DebateSimulator",
    "props": {
        "topic": "Saken gjelder...",
        "opponentName": "Motstander",
        "context": "Bakgrunn...",
        "winningScore": 15,
        "arguments": [
             { "id": "a1", "text": "Ditt argument", "strength": 5, "type": "mercy", "response": "Motstanders svar" }
        ]
    }
}
```

**5. DragDropTimeline (Rekkefølge)**
Brukes for hendelsesforløp.
```json
"component": {
    "name": "DragDropTimeline",
    "props": {
        "title": "Sett i rekkefølge",
        "events": [
            { "id": "e1", "year": 1000, "label": "Hendelse A" },
            { "id": "e2", "year": 1066, "label": "Hendelse B" }
        ]
    }
}
```

## 4. Registrering og Synlighet

### A. Synlighet i "Biblioteket" (Hub)
Systemet scanner automatisk `public/content` etter filer som slutter på `-sti.json`.
*   **Sortering:** Stiene sorteres etter Tidsperiode (`year`) og Fag (`subject`).
*   **Fag:** Bestemmes av mappen filen ligger i (f.eks `/content/historie/...`).
*   **Kortet:** Bruker `title`, `description` og `readTime` fra JSON-filen.

### B. Synlighet på Emnesiden (Manifest)
For at stien skal vises i sidebaren inne på et emne (f.eks. "Mellomkrigstiden"), må den registreres i `public/content/manifest.json`.

```json
{
    "id": "mitt-emne",
    "tools": [
        {
            "id": "mitt-emne-sti",
            "title": "Læringssti: Tittel",
            "description": "Beskrivelse...",
            "link": "/historie/mitt-emne/mitt-emne-sti",
            "icon": "map"
        }
    ],
    "lessons": [ ... ]
}
```

> **VIKTIG:** Læringsstier skal registreres i `tools`-listen til et emne, **ikke** under `lessons`.

## 5. Feilsøking og Kvalitetssikring

### Kritiske Sjekkpunkter (Unngå disse feilene!)

#### 1. "Spøkelsesdata" (Duplikate oppføringer)
**Symptom:** Endringer i manifestet vises ikke, eller gamle data henger igjen.
**Årsak:** Det finnes flere oppføringer for samme `id` i manifestet (f.eks to blokker med `"id": "den-kalde-krigen"`). Systemet velger ofte den første den finner.
**Løsning:** Før du limer inn noe nytt, søk etter ID-en i filen for å se om den allerede eksisterer. Slett eller oppdater den eksisterende blokken.

#### 2. Koding og Norske Tegn
**Symptom:** Tekst vises som "Ã¦", "Ã¸", "Ã¥".
**Årsak:** Manuell redigering eller kopiering har ødelagt tegnsettet (UTF-8).
**Løsning:** Vær nøye med encoding når du redigerer `manifest.json`. Ser du rare tegn, fiks dem umiddelbart.

#### 3. Synlighet i Sidebar
**Symptom:** Læringsstien dukker ikke opp i menyen til høyre inne på artikler.
**Årsak:** Læringsstien er ikke registrert korrekt i `tools`-listen i manifestet, eller koden finner den ikke.
**Løsning:** Sjekk at `tools`-blokken ligger på samme nivå som `lessons` inne i emnet.

#### 4. Hub vs Manifest
**Symptom:** Stien synes i Biblioteket, men ikke på emnesiden.
**Årsak:** Filen er opprettet,4.  [ ] **Hub vs Manifest**: Er stien lagt inn i `manifest.json` under `tools`? Sjekk at `id` matcher.
5.  [ ] **Standardiserte Oppgaver**: Er "Les artikkelen" den aller første oppgaven hvis artikkelen kreves? Bruker den en absolutt sti?

> **TIPS:** Bruk `/historie/...` og ikke `historie/...` for lenker i `tasks`.

## 5. Sjekkliste for Kvalitetssikring

Før du sier deg ferdig:

1.  [ ] **Lenker**: Fungerer alle interne lenker til artikler? Har du laget placeholder-artikler for manglende innhold?
2.  [ ] **Bilder**: Har alle interaktive komponenter nødvendige ikoner/bilder?
3.  [ ] **Pedagogisk Trapp**: Følger oppgavene Blooms taksonomi (Fakta -> Forståelse -> Refleksjon)?
4.  [ ] **Narrativ Dybde**: Har hvert steg minst 150 ord med guiding tekst?
5.  [ ] **Ghost-Fact Audit (KRITISK)**: Har du manuelt verifisert at alle 'Fakta'-spørsmål faktisk kan besvares ved å lese den lenkede artikkelen? Det er forbudt å spørre om noe som ikke står i kildematerialet. Sjekk også at "Les artikkelen" er første steg.
6.  [ ] **Testing**: Åpne stien i nettleseren og klikk gjennom alle stegene. Spill gjennom scenariene for å sjekke at logikken holder.
7.  [ ] **Data Synchronization:** Run `node scripts/update-learning-paths.cjs` to update the library hub.

## 6. Tips & Triks

*   **Bruk "Faser"**: Gruppér stegene med `phase`-feltet for å gi eleven oversikt (f.eks "Fase 1: Oppstart", "Fase 2: Fordypning").
*   **Tooltips**: Bruk `<GlossaryTooltip term="ord" definition="forklaring" />` inne i React-komponenter der det er mulig (krever koding), eller skriv definisjoner i parantes i JSON-teksten.
*   **Ikke bruk fet tekst**: Vi bruker ikke **fet tekst** for utheving i brødtekst, la innholdet stå for seg selv.
*   **Integrert interaktivitet**: Introduser spill i teksten. F.eks: 'Offiseren beordrer deg til å pakke...' før en PackTheBag-komponent.
*   **Kronologisk nøyaktighet**: Vær streng på tidslinjen. Ikke snakk om keisere i republikkens tid.
*   **Tverrfaglighet**: Læringsstien bør lenke til artikler utenfor hovedemnet for å vise helhet (f.eks. lenke til Religion når man snakker om Lov og Rett).
*   **Flere lenker**: Et enkelt steg kan og bør ha flere lenker hvis det belyser temaet fra ulike sider.
