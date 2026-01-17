# Workflow: Plan Subject
Trigger: User wants to create or upgrade an entire subject/topic.

---

## Phase 1: The "Soul" Search (Architecture & Vision)
**Goal:** Define the aesthetic and pedagogical core before creating content.

1.  **Subject Design Document**
    *   **Action:** Create or read `planning/[subject]-design.md`.
    *   **Prompt User:** "We need to define the Soul of this subject. Please approve/edit the following:"
    *   **Narrative Arc:** Define the overarching story (e.g., "From Chaos to Order", "The Age of Discovery").
    *   **Visual Theme:** Define specific visual guidelines.
        *   *Constraint:* Must interpret `docs/image-style-guide.md`.
        *   *Example:* "Deep shadows, warm candlelight, 17th-century Dutch golden age aesthetics."
    *   **Pedagogical Pillars:** 3 key learning outcomes for the entire subject.

## Phase 2: The Blueprint (Structural Scaffolding)
**Goal:** Map out the content topography.

1.  **Brainstorming**
    *   **Action:** Propose a list of 5-10 articles.
    *   **Types:**
        *   **Core:** The main narrative chapters.
        *   **Satellite:** Specific deep-dives (e.g., "The Steam Engine" for Ind. Rev.).
        *   **Biography:** Key figures.
2.  **Interdisciplinary Mapping**
    *   **Action:** Identify 5+ links to *other* subjects (e.g., History <-> Economics).
3.  **Manifest Registration**
    *   **Action:** Ensure the subject is correctly registered in `public/content/manifest.json`.
    *   **Check:** Verify `id` matches directory name.

## Phase 3: The Factory (Execution Loop)
**Goal:** Create the articles with high fidelity.

*   **Loop:** For each article in the Blueprint:
    1.  **Execute:** `/plan_article`.
    2.  **Inject Context:** Pass the "Visual Theme" and "Narrative Arc" from Phase 1 into the article plan.
    3.  **Constraint:** Ensure images generated adhere strictly to the "Visual Theme".
    4.  **Auto-Link:** Update *other* relevant articles to link to this new one.

## Phase 4: The Journey (Learning Path)
**Goal:** Create the guided experience.

1.  **Guidance:** Read `@[/LEARNING_PATH_GUIDE]` (strictly).
2.  **Drafting:** Create `[subject]-sti.json`.
    *   **Structure:** 10-20 steps.
    *   **Mix:** Alternating "Fakta", "Refleksjon", "Oppgave".
3.  **Components:**
    *   **Requirement:** Must use at least 2 distinct interactive components (PackTheBag, DebateSimulator, ScenarioRoleplay, DragDropTimeline).
    *   **Context:** Customize component props (items, scenarios) to fit the "Narrative Arc".
4.  **Registration:** Register in `manifest.json` under `tools`.

## Phase 5: The World Building (Global Metadata)
**Goal:** Make the world feel alive and interconnected.

1.  **Timeline:**
    *   **Action:** Add 5-10 key events to `public/content/global-timeline.json`.
2.  **People:**
    *   **Action:** Check if key figures exist in `public/content/people/`.
    *   **Create:** If missing, create `[person].json` with lifespan and bio.
3.  **Glossary:**
    *   **Action:** Run simple grep or script to find capitalized concepts.
    *   **Sync:** Ensure they exist in `public/content/concepts/`.

---

**Usage:**
"Run `/plan_subject` for [Topic Name]" -> I will start Phase 1.
