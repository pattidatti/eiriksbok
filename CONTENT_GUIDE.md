# Innholdsguide ✍️

Denne guiden forklarer hvordan du legger til nytt innhold (fag, emner, leksjoner) i Gravity Lærebok.

## 📂 Struktur

Alt innhold ligger i `public/content`-mappen. Strukturen er hierarkisk:
1.  **Fag** (f.eks. `historie`, `norsk`)
2.  **Emner** (f.eks. `vikingtiden`, `romerriket`)
3.  **Leksjoner/Artikler** (selve innholdet)

## 🗺️ Manifestet (`manifest.json`)

Filen `public/content/manifest.json` er "hjernen" som styrer hva som vises på nettsiden.

### Eksempel på struktur:
```json
{
  "subjects": [
    {
      "id": "historie",
      "title": "Historie",
      "topics": [
        {
          "id": "vikingtiden",
          "title": "Vikingtiden",
          "lessons": [
            {
              "id": "rikssamlingen",
              "title": "Rikssamlingen",
              "contentPath": "/content/historie/vikingtiden/rikssamlingen.json"
            }
          ]
        }
      ]
    }
  ]
}
```

## ➕ Legge til nytt innhold

### 1. Opprett innholdsfilen
Lag en ny JSON-fil for artikkelen din, f.eks. `public/content/historie/mitt-emne/min-artikkel.json`.
Filen bør følge dette formatet:
```json
{
  "id": "min-artikkel",
  "title": "Min Artikkel",
  "content": [
    {
      "type": "text",
      "value": "Her er teksten i artikkelen..."
    },
    {
      "type": "image",
      "url": "/content/historie/mitt-emne/bilde.jpg",
      "caption": "Bildetekst"
    }
  ]
}
```

### 2. Legg til bilder
Bilder bør legges i samme mappe som innholdsfilen (eller en undermappe `assets`).
Bruk absolutte stier fra `public`-mappen når du refererer til dem (f.eks. `/content/...`).

### 3. Oppdater Manifestet
Legg til den nye artikkelen i `manifest.json` under riktig fag og emne.

## ✏️ Bruke TinaCMS (Anbefalt)

Du kan også bruke det grafiske grensesnittet for å redigere innhold:
1.  Kjør `npm run tina-dev`.
2.  Gå til `http://localhost:5173/admin`.
3.  Her kan du opprette og redigere sider uten å skrive JSON manuelt.
