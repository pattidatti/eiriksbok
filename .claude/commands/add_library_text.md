---
description: Workflow for adding literary texts to the library
---

# Add Library Text Workflow

Follow these steps to add a new literary text (short story, poem, excerpt) to the `Eiriksbok` library.

## 1. Gather Metadata
Collect the following information about the text:
- **ID**: `kebab-case` string (e.g., `faderen`)
- **Title**: Clear, Norwegian title
- **Author**: Full name of the author
- **Genre**: One of: `Novelle`, `Dikt`, `Romanutdrag`, `Sakprosa`, `Eventyr`
- **Year**: Published year (if known)
- **Theme**: Array of 2-4 themes (e.g., `['Makt', 'Status']`)
- **Language**: `bm.` (Bokmål) or `nn.` (Nynorsk)

## 2. Prepare Content
Format the text content as an array of strings (paragraphs/stanzas).
- Use `<b>text</b>` for bolding specific words or phrases.
- Use `### Header` for sub-sections.
- Use `## Header` for major sections.
- For poems, the system automatically adds line numbers.

## 3. Create Definitions
Identify difficult or archaic words and create a list of definitions for tooltips.
- Format: `{ term: "word", definition: "explanation" }`
- Terms are automatically matched in the text (case-insensitive).

## 4. Design Lesson Plan
Create a pedagogical framework for the text:
- **Learning Objectives**: 2-3 specific goals.
- **Pre-reading**: 1-2 preparation questions.
- **While-reading**: 1-2 focal points for students.
- **Post-reading**: 3-4 reflection/analysis questions.
- **Writing Task**: A creative or analytical prompt.

## 5. Implementation
1.  **Create File**: Create `src/data/texts/entries/[id].ts` using the following template:

```typescript
import type { TextEntry } from '../types';

export const [variableName]: TextEntry = {
    id: '[id]',
    title: '[Title]',
    author: '[Author]',
    genre: '[Genre]',
    language: '[bm./nn.]',
    theme: ['[Theme1]', '[Theme2]'],
    publishedYear: [Year],
    createdDate: new Date().toISOString(),
    definitions: [
        { term: "[term]", definition: "[definition]" }
    ],
    content: [
        "Paragraph 1",
        "Paragraph 2"
    ],
    lessonPlan: {
        learningObjectives: ["[Objective]"],
        preReading: ["[Question]"],
        whileReading: ["[Task]"],
        postReading: ["[Question]"],
        writingTask: "[Prompt]"
    }
};
```

2.  **Register Entry**: Add the new text to `src/data/texts/index.ts`.
    - Import the new constant.
    - Add it to the `textLibraryData` array.

## 6. Verification
- Navigate to `/norsk/bibliotek` in the browser.
- Search for the title and open the text.
- Verify headers, tooltips (definitions), and task sections.
- Test "Listen to text" (TTS) to ensure markdown is cleaned correctly.
