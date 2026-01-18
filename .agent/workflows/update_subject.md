# Workflow: Update Subject (The Renovator)
Trigger: User wants to add content to an EXISTING subject.

---

## Phase 1: Diagnosis (The Switch)
**Goal:** Determine state (Healthy, Zombie, or Uninitialized).

1.  **Status Check**
    *   **Action:** `node scripts/content-manager.cjs --find "[Subject Name]"`
    *   **Logic:**
        *   `found: false` -> **ERROR**. Run `/plan_subject`.
        *   `found: true` AND `DesignDocMissing` -> **Trigger Legacy Protocol**.
        *   `found: true` AND `DesignDocPresent` -> **Proceed to Phase 3**.
        *   `isZombie: true` -> **Trigger Legacy Protocol**.

## Phase 2: Legacy Protocol (The Resurrection)
1.  **Reverse Engineer**
    *   **Action:** `node scripts/content-manager.cjs --reverse-engineer "[Subject ID]"`
2.  **Manual Enhancement (CRITICAL)**
    *   **Agent Monologue:** "I have a skeleton. I need a body."
    *   **Action:** Edit the generated Design Doc.
    *   **Additions:**
        *   **The Soul:** Add "Narrative Arc" and "Visual Theme" (Ask user if unsure).
        *   **The Web:** Add "Interdisciplinary Connections".

## Phase 3: The Narrative & Web Check
**Goal:** Ensure the next action fits the story and the web.

1.  **Read Design Doc**
    *   **Action:** Read `docs/Design documents/[subject]-design.md`.
2.  **The Cross-Pollinator Protocol (CRITICAL)**
    *   **Agent Monologue:** "Before I write about X, does Y need to exist?"
    *   **Rule:** If suggesting a new article (e.g., "Trench Warfare"), check if its foundational concept (e.g., "Industrialized War") exists in *Technology* or *Society*.
    *   **Action (If Missing):**
        *   Create `[NEW] Article: Industrialized War` in `technology-design.md` (or created it if missing).
        *   **Add Sync Task:** Add `[ ] Update Learning Path to link to 'Industrialized War'` in BOTH subjects.

## Phase 4: Execution
1.  **Select & Execute**
    *   Pick the next logical item from the Design Doc.
    *   If Article -> Run `/plan_article`.
    *   If Person -> Create `public/content/people/[name].json`.
    *   If Asset -> Run `/generate_image`.
2.  **Update Dashboard**
    *   Mark `[x]` in the Design Doc.
    *   **Verify Learning Path:** Ensure the new item is added to the relevant Learning Path JSON.
