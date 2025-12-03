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
      "content": [ ... ] // Rich text blocks
    }
    ```

## 4. Feature Systems

### 4.1. Global Timeline
The timeline aggregates events from all history articles.

*   **Source**: Individual article JSON files.
*   **How to Add**: Add a `timeline` array to your article JSON.
    ```json
    // in vikingtiden.json
    {
      "year": "793-1066", // Main range for the article
      "timeline": [
        {
          "year": "793",
          "title": "Angrepet på Lindisfarne",
          "description": "Vikingtiden starter."
        },
        {
          "year": "1030",
          "title": "Slaget på Stiklestad",
          "description": "Olav den Hellige faller."
        }
      ]
    }
    ```
*   **Build**: Run `node scripts/generate-timeline.js` to update `global-timeline.json`.
*   **Note**: Supports "fvt" (BC) dates (e.g., "500 fvt").

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

*   **Source**: `public/content/religion/[religion].json` (Dimensions) AND Article JSONs.
*   **How to Link**: In your article JSON, add:
    ```json
    {
      "religion": "content/religion/kristendom",
      "dimension": "ritual", // Which dimension this covers
      "comparison_tags": ["dåp", "bønn"] // Specific topics
    }
    ```

## 5. Automation & Maintenance

### Scripts
*   `node scripts/generate-timeline.js`: **CRITICAL**. Must be run whenever you add `timeline` data to an article. It scans all content files and rebuilds the master timeline.

### Best Practices
1.  **Always Tag**: Use consistent tags in `manifest.json`. These drive "Related Content" and search.
2.  **Images**: Use Unsplash URLs or local images in `public/images`.
3.  **Dates**: Use ISO format (`YYYY-MM-DD`) for `createdDate` in manifest to ensure correct sorting in "New Content".
