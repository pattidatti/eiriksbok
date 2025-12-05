# Eiriksbok Content System Documentation

This document outlines the architecture and workflows for managing content in Eiriksbok. It serves as the "single source of truth" for how different content systems (Timeline, Flashcards, Library, etc.) interact.

## 1. System Overview

Eiriksbok uses a hybrid content system:
*   **Manifest (`manifest.json`)**: Defines the hierarchy (Subjects -> Topics -> Lessons) and basic metadata.
*   **Content Files (`*.json`)**: Store the actual article content, rich text, and specific feature data (timeline events).
*   **Static Data (`src/data/*.ts`)**: Stores structured data for specific features like the Text Library and Glossary (Flashcards).
*   **Automation Scripts (`scripts/*.js`)**: Process raw content into derived datasets (e.g., `global-timeline.json`).

## 2. File Structure

```
/public
  /content
    manifest.json           # The "Skeleton" of the app
    /historie               # Subject folder
      /vikingtiden          # Topic folder
        artikkel.json       # Lesson content
        rikssamlingen.json  # Another lesson
    /global-timeline.json   # GENERATED file (do not edit manually)
/src
  /data
    glossary.ts             # Flashcards / Fagbegreper
    textLibraryData.ts      # Norsk Bibliotek metadata
/scripts
    generate-timeline.js    # Script to build the timeline
```

## 3. Core Workflow: Adding a New Lesson

To add a new lesson (article):

1.  **Update Manifest**: Add a new entry to `public/content/manifest.json` under the correct Topic.
    ```json
    {
      "id": "my-new-lesson",
      "title": "My Lesson",
      "description": "Short description.",
      "image": "url-to-image",
      "tags": ["tag1", "tag2"],
      "createdDate": "2023-10-27T12:00:00Z"
    }
    ```
2.  **Create Content File**: Create `public/content/[subject]/[topic]/my-new-lesson.json`.
    ```json
    {
      "id": "my-new-lesson",
      "title": "My Lesson",
      "content": [ 
        { "type": "text", "content": "Intro text..." },
        { "type": "header", "text": "Section Title" }, // Use header, NOT nested sections
        { "type": "text", "content": "More text..." }
      ] 
    }
    ```
    **Important:** The `content` array must be **flat**. Do not use nested `section` blocks. Use `header` blocks to separate sections.

## 4. Feature Systems

### 4.1. Global Timeline
The timeline aggregates events from all history articles AND manual entries.

*   **Dual Source Architecture**:
    1.  **CMS/Manifest**: Generated via `scripts/generate-timeline.js` into `global-timeline.json`.
    2.  **Manual Entries**: Hardcoded in `src/data/timelineData.tsx` (for events needing custom React icons).
*   **Unified Access**: The `useGlobalTimeline` hook merges these two sources on the client-side.
*   **How to Add**:
    *   **CMS**: Add a `timeline` array to your article JSON (as seen below).
    *   **Manual**: Add entry to `src/data/timelineData.tsx` if you need custom icons/hardcoded behavior.
    ```json
    // in vikingtiden.json
    {
      "year": "793-1066", // Main range for the article
      "timeline": [
        {
          "year": "793",
          "title": "Angrepet på Lindisfarne",
          "description": "Vikingtiden starter."
        }
      ]
    }
    ```
*   **Build**: Run `node scripts/generate-timeline.js` to update the CMS portion (`global-timeline.json`).
*   **Note**: Supports multiple date formats and automatically deduplicates events.

### 4.2. Flashcards (Fagbegreper)
Flashcards are global concepts used for practice.

*   **Source**: `src/data/glossary.ts`.
*   **How to Add**: Add a new object to the `glossaryTerms` array.
    ```typescript
    {
        term: "Monopol",
        definition: "Enerett til å drive handel...",
        subjectId: "historie",
        topicId: "kolonialisering"
    }
    ```
*   **Integration**: These terms automatically appear in the "Fagbegreper" page and can be filtered by subject/topic.

### 4.3. Text Library (Norsk)
The library contains short stories, poems, and excerpts.

*   **Source**: `src/data/textLibraryData.ts`.
*   **How to Add**: Add a new `TextEntry` object.
    ```typescript
    {
        id: "karens-jul",
        title: "Karens Jul",
        author: "Amalie Skram",
        content: "...", // Full text
        type: "novelle",
        year: 1885,
        tags: ["fattigdom", "realisme"]
    }
    ```

### 4.4. Religion Comparison (KRLE)
Allows side-by-side comparison of religions.

*   **Source**: `public/data/religion/[religion].json` (Dimensions) AND Article JSONs.
*   **How to Add a New Religion**:
    1.  Create `public/data/religion/[id].json` (e.g. `buddhisme.json`).
    2.  Structure:
        ```json
        {
          "name": "Buddhisme",
          "color": "#f59e0b",
          "dimensions": {
            "ritual": { "type": "root", "children": [...] },
            // ... all 7 dimensions
          }
        }
        ```
    3.  Add entry to `manifest.json`.

*   **How to Link an Article**:
    In your article JSON (usually `public/content/krle/religioner/[religion]/[topic]/artikkel.json`), add:
    ```json
    {
      "religion": "kristendom", // ID only (e.g "kristendom"), NOT "content/religion/..."
      "dimension": "ritual", // Which dimension this covers
      "comparison_tags": ["dåp", "bønn"] // Specific topics for detailed comparison
    }
    ```

## 4.5. Artikkel-Layouts

Alle artikkelsider deler samme grunnoppsett for innholdsvisning, men skilles hovedsakelig av **sidebaren** og dens funksjonalitet.

### 1. Standard Leksjon (Standard Sidebar)
*   **Trigger:** Ingen spesiell konfigurasjon (standard).
*   **Sidebar:** `LessonSidebar.tsx`.
*   **Innhold:** Viser begreper, sitater og relevante lenker.
    *   **KRLE-variant:** Hvis `comparison_tags` er definert (f.eks. "bønn"), viser sidebaren lenker til "Sammenlign Religioner"-verktøyet for disse temaene.

### 2. Rich Layout (Interactive Sidebar)
En mer avansert layout for dybdeartikler i historie og samfunnsfag.
*   **Trigger:** `"layout": "rich"` i leksjonens JSON-fil.
*   **Sidebar:** Integrert tidslinje, kart, og dynamisk innholdsfortegnelse (TOC).
*   **Funksjon:** Lar brukeren hoppe i tid og sted mens de leser.

### 3. Norsk Fagartikkel (Literature Sidebar)
Tilpasning av Rich Layout for norskfaget.
*   **Trigger:** `subject: "norsk"` OG `"layout": "rich"`.
*   **Sidebar:** Fokus på sjangerinformasjon ("Om sjangeren").
*   **Annet:** Har en fremhevet knapp for "Relaterte lenker" (f.eks. til biblioteksteksten) under hovedbildet.

### 4. Tekstbibliotek (Reader Sidebar)
Layout for primærkilder.
*   **Trigger:** Rute `/norsk/bibliotek/:textId`.
*   **Sidebar:** Ingen sidebar (fokusmodus), men verktøylinje for oversettelse og tekststørrelse.

### 5. Interaktive Modeller
Spesialsider med egne kontroller og paneler. (F.eks. `demografi-okonomi/intro`).

## 4.6. Troubleshooting / Feilsøking

*   **"Unable to find record"**: `religion`-feltet må være en ID (f.eks. `"kristendom"`), ikke filsti.
*   **"String cannot represent value"**: Sjekk for nestede `section`-blokker. Strukturen skal være flat.
*   **Ingen artikler i sammenligning**: Sjekk at `comparison_tags` er identiske (case-sensitive).

## 5. Automation & Maintenance

### Scripts
*   `node scripts/generate-timeline.js`: **CRITICAL**. Kjøres etter endringer i timeline-data.
*   **Best Practices**:
    1.  **Tags**: Bruk konsistente tags.
    2.  **Datoer**: Bruk ISO-format (`YYYY-MM-DD`).