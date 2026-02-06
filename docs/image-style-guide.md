# 🎨 Stilguide for Bildegenerering (Eiriksbok)

For å sikre at alle bilder i Eiriksbok holder en jevn, premium og historisk troverdig kvalitet, følger vi disse retningslinjene når vi skriver prompts.

## 1. De "Magiske" Nøkkelordene (Kvalitet)
Hver prompt starter med en teknisk spesifikasjon for å tvinge AI-modellen bort fra "tegneseriestil" og over til fotorealisme:
- **"A highly realistic 4K cinematic photograph"** (Dette er gullstandarden).
- **"Cinematic lighting"** / **"Atmospheric perspective"** (Gir dybde og realisme).
- **"Detailed textures"** (Fanger støv, treverk, metall og tekstiler).

## 2. Lys og Stemning
Lyssetting er det som skiller et flatt bilde fra et "wow"-bilde. Vi spesifiserer alltid lyskilden:
- **Utendørs:** "Morgenlyset som kaster lange skygger", "Gyllen time (golden hour)", "Overskyet, diffust dagslys" (for mer dystre scener).
- **Innendørs:** "Varmt lys fra stearinlys og oljelamper", "Lysstråler gjennom høye støvete vinduer (god rays)".
- **Fargepalett:** Spesifiser farger som "Turkist vann", "Mørke eikepaneler", "Sorte drakter med hvite krager".

## 3. Komposisjon (Kameravinkler)
Ikke la AI-en velge vinkel selv. Fortell den hvor kameraet står:
- **High angle (Fugleperspektiv):** Perfekt for oversiktsbilder av byer eller slagmarker.
- **Eye level:** Skaper nærhet til personer eller dramatiske scener.
- **Foreground/Background:** Beskriv hva som er helt nært (f.eks. tønner med krydder) og hva som er i det fjerne (f.eks. et skip på horisonten) for å skape dybdefølelse.

## 4. Historisk Korrekthet (Spesifisitet)
Unngå generiske ord som "gamle dager". Bruk spesifikke detaljer:
- **Tidsepoke:** "17th-century", "Late Middle Ages", "1945 Europe".
- **Arkitektur:** "Dutch Renaissance brick buildings", "Stone fortress with bastions".
- **Klær/Mennesker:** Beskriv materialer og stiler (f.eks. "Ruff collars", "Worn leather armor", "Woolen tunics").

## 5. Standard Format
Vi bruker konsekvent **16:9** (bredskjerm) for både hero-bilder og inline-bilder for å gi applikasjonen et moderne, filmatisk uttrykk.

## 6. Bildeoptimalisering & Ytelse

For å sikre at Eiriksbok forblir "snappy" selv med tunge historiske kart, følger vi disse tekniske kravene:

### ⚡ Tekniske Krav (WebP)
- **Oppløsning:** Maks bredde **2560px** (4K-nivå) for detaljerte kart. Mindre illustrasjoner bør være **1600px**.
- **Kvalitet:** Bruk **75-80% quality** i Sharp/WebP. Dette gir ofte 90-95% vektreduksjon uten synlig tap.
- **Filstørrelse:** 
    - Store kart: **< 500KB** (Vårt mål er ~300KB).
    - Vanlige bilder: **< 100KB**.

### 🚀 Image-komponenten
Bruk `Image`-komponenten i React for å håndtere loading intelligent:
- **`priority={true}`**: Bruk på "Above the fold" innhold (Hero-bilder eller det første kartet i en karusell). Dette setter `fetchpriority="high"` og `loading="eager"`.
- **Default**: Bilder er ellers `loading="lazy"` for å spare båndbredde.

---

### Eksempel på en komplett prompt:
> *"A highly realistic 4K cinematic photograph of a meeting in an opulent, oak-paneled boardroom in Amsterdam, 17th century. Seventeen serious men in dark, expensive Dutch clothing are gathered around a massive carved oak table. Dim, warm lighting from candles, atmosphere of corporate power. 16:9 ratio."*
