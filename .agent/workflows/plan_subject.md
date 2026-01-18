# Workflow: Plan Subject (v3.0)
Trigger: User wants to create or upgrade an entire subject/topic.

---

## Phase 1: The "Soul" Search (Design & Vision)
**Goal:** Define the aesthetic and pedagogical core before creating content.
**Constraint:** Visual Themes apply **ONLY** to image generation prompts. **DO NOT** propose CSS changes or Layout modifications.

1.  **Subject Design Document (The Working Dashboard)**
    *   **Action:** Create or read `docs/Design documents/[subject]-design.md`.
    *   **CRITICAL:** This file must be a LIVING DASHBOARD, not just a brief. Use the following structure:

    ```markdown
    # Subject Design: [Subject Name]
    **Subject ID:** `...`
    **Global Status:** `[Planning]`

    ## 1. The Dashboard (Status)
    - [ ] **Completion**: `0/X` items.
    - [ ] **Manifest Registered**: `[ ]`

    ## 2. The Soul (Vision)
    *   **Narrative Arc:** "..."
    *   **Visual Theme (Prompts Only):** "..."
    *   **Pedagogical Pillars:** ...

    ## 3. The Content Matrix (Working Checklist)
    ### Core Narrative
    - [ ] **Article ID**: `oversikt`
        - *Tone*: ...
        - *Key Concepts*: ...
        - *Status*: `[ ] Draft  [ ] Content  [ ] Links  [ ] Assets`

    ### Entities (People/Concepts)
    - [ ] **Name** (Type)
        - *Bio Highlights*: ...
        - *File Status*: `[ ] Created`

    ## 4. The Asset Tracker
    - [ ] **Hero Image**: Prompt... `[ ] Generated`
    ```

    *   **Prompt User:** "I have initialized the Working Dashboard. Please review the 'Soul' section."

## Phase 2: The Blueprint (Applies to "Content Matrix")
**Goal:** Fill out the "Content Matrix" in the Design Doc.

1.  **Brainstorming**
    *   **Action:** Populate "Core Narrative" in the Matrix.
2.  **Entity Separation (CRITICAL)**
    *   **Rule:** "Is this a Person?" -> Add to "Entities" section in Matrix (Target: `public/content/people/`).
    *   **Rule:** "Is this a Concept?" -> Add to "Entities" section (Target: `public/content/concepts/`).
    *   **Action:** check for existing entities to avoid duplicates.
3.  **Interdisciplinary Mapping**
    *   **Action:** Add specific "Inbound Links Needed" fields to the Matrix items.
4.  **Manifest Locking (BLOCKING)**
    *   **Action:** Verify the subject is correctly registered in `public/content/manifest.json`.
    *   **Validation:** Run `npm run scan-content`.
5.  **Timeline Injection**
    *   **Action:** Plan 3-5 key events for `public/content/global-timeline.json`.

## Phase 3: The Factory (Execution Loop)
**Goal:** Execute the items in the "Content Matrix".

*   **Loop:** For each item in the Matrix:
    1.  **Execute:** `/plan_article`.
    2.  **Inject Context:** Pass the "Visual Theme" and "Narrative Arc".
    3.  **Update Dashboard:** Mark items as `[x]` in `[subject]-design.md` as you go.

## Phase 4: The Journey (Learning Path)
**Goal:** Create the guided experience.

1.  **Guidance:** Read `@[/LEARNING_PATH_GUIDE]` (strictly).
2.  **Drafting:** Create `[subject]-sti.json`.
3.  **Components:** Must use at least 2 distinct interactive components.
4.  **Registration:** Register in `manifest.json`.

## Phase 5: The World Building (Final Polish)
**Goal:** Make the world feel alive and interconnected.

1.  **People & Concepts (Implementation):**
    *   **Action:** Create the JSON files planned in Phase 2.
    *   **Update Matrix:** Check off "File Status" in the Design Doc.
2.  **Glossary:**
    *   **Action:** Run simple grep or script to find capitalized concepts.

---

**Usage:**
"Run `/plan_subject` for [Topic Name]" -> I will start Phase 1.
