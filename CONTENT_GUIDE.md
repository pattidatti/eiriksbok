      "topics": [
        {
          "id": "vikingtiden",
          "title": "Vikingtiden",
          "lessons": [
            {
              "id": "rikssamlingen",
              "title": "Rikssamlingen",
              "description": "Harald Hårfagre samler Norge.",
              "image": "/images/rikssamlingen.jpg",
              "tags": ["vikingtiden", "konger"]
            }
          ]
        }
      ]
    }
  ]
}
```

## 2. Styling & Theming (CRITICAL)
**DO NOT use hardcoded colors** (e.g., `bg-slate-900`, `text-white`).
ALWAYS use the defined CSS variables/Tailwind utilities to ensure support for Light/Dark mode and Dyslexia mode.

*   **Backgrounds**: `bg-bg-main`, `bg-bg-card`
*   **Text**: `text-text-main`, `text-text-muted`
*   **Borders**: `border-border-main`
*   **Primary Action**: `text-indigo-600`, `bg-indigo-600`

## 3. Legge til nytt innhold

### 1. Opprett innholdsfilen
Lag en ny JSON-fil for artikkelen din, f.eks. `public/content/historie/mitt-emne/min-artikkel.json`.
Filen bør følge dette formatet:
{
  "id": "min-artikkel",
  "title": "Min Artikkel",
  "content": [
    {
      "type": "header",
      "content": "Overskrift"
    },
    {
      "type": "text",
      "content": "Her er teksten. Du kan bruke **fet skrift** for utheving og *kursiv* for begreper eller titler."
    },
    {
      "type": "component",
      "name": "FactBox",
      "props": {
        "title": "Visste du at?",
        "content": "Her kan du skrive fakta.\n• Bruk kulepunkter (•) for lister.\n• Ny linje gir nytt avsnitt."
      }
    },
    {
      "type": "image",
      "src": "https://images.unsplash.com/...",
      "caption": "Bildetekst",
      "alt": "Beskrivelse av bildet"
    }
  ]
}
```

### 📝 Formatering
*   **Fet skrift:** Bruk `**tekst**` for å få **tekst**.
*   **Kursiv:** Bruk `*tekst*` for å få *tekst*.
*   **Lister:** Bruk unicode-tegnet `•` (Alt+7 på Mac, Alt+0149 på Windows) for kulepunkter. Unngå å bruke `*` som kulepunkt da det kan forveksles med kursiv.

### 🧱 Blokker og Komponenter
Du kan bruke følgende blokktyper i `content`-listen:

#### 1. Tekst (`text`)
Vanlige avsnitt.
```json
{ "type": "text", "content": "Ditt innhold her..." }
```

#### 2. Overskrift (`header`)
Lager en underoverskrift (H2) i artikkelen.
```json
{ "type": "header", "content": "Min Underoverskrift" }
```

#### 3. Faktaboks (`FactBox`)
En utvidbar boks for ekstra info eller eksempler.
*   `title`: Overskriften på boksen (valgfritt, default: "Visste du at?").
*   `content`: Innholdet. Støtter `\n` for ny linje.
```json
{
  "type": "component",
  "name": "FactBox",
  "props": {
    "title": "Eksempler",
    "content": "Første linje.\nAndre linje."
  }
}
```

#### 4. Bilde (`image`)
```json
{
  "type": "image",
  "src": "URL til bildet",
  "caption": "Bildetekst under bildet",
  "alt": "Alternativ tekst for skjermlesere"
}
```

#### 5. Liste (`list`)
```json
{
  "type": "list",
  "items": [
    "Første punkt",
    "Andre punkt",
    "Tredje punkt"
  ]
}
```

#### 6. Seksjon (`section`)
Brukes for å gruppere innhold, ofte med en egen tittel.
```json
{
  "type": "section",
  "title": "Seksjonstittel",
  "content": [
    { "type": "text", "content": "Innhold i seksjonen..." }
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
