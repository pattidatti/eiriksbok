# Workflow: Refine Subject (The Polisher)
Trigger: User says "Make [Subject] premium" OR `/design_audit` fails.

---

## Phase 1: The ULTRATHINK Audit
**Goal:** Deep analysis of Quality, Pedagogy, and Aesthetics.

1.  **Read Context**
    *   Read `manifest.json` (metadata).
    *   Read `[subject]-design.md` (vision).
    *   Read 1-2 random articles (sample quality).
2.  **Critique Matrices**
    *   **Academic:** Is high-level vocabulary defined? Is the tone authoritative yet accessible?
    *   **Pedagogical:** Are we assuming knowledge? Are there "Orphan Articles" (no connections)?
    *   **Aesthetic:** Are the images generic? Is the design doc "Soul" empty?

## Phase 2: The Avant-Garde Injection
**Goal:** Elevate from "Functional" to "Masterpiece".

1.  **Rewrite Vision**
    *   Update `design.md` with explicit "Visual Directives" (e.g., "Bauhaus", "Noir").
    *   Reword the "Narrative Arc" to be more compelling.
    *   **Content Expansion:**
        -   For each `[ ] Article` item, add 2-3 specific "Focus Points" or "Beats" if missing.
        -   *Example:* `[ ] Trench Warfare` -> `[ ] Trench Warfare (Focus: Shell Shock, Rats, The Wait)`.
2.  **The Interdisciplinary Web**
    *   **Action:** Identify 3 missing links to other subjects.
    *   **Execute:** Update `design.md` with `[ ] Link [Article] to [External Concept]`.
3.  **Asset Regeneration**
    *   **Action:** Identify "Stock-photo" style images.
    *   **Execute:** Run `/generate_image` with the NEW Visual Directives.

## Phase 3: The Sync Contract (STRICT)
1.  **Update Manifest (SURGICAL ONLY)**
    *   **Action:** Read `public/content/manifest.json`.
    *   **CRITICAL RESTRICTION:**
        *   Find the object where `id` === `[Subject ID]`.
        *   Update ONLY `title` and `description`.
        *   **DO NOT** add new objects to the `subjects` array.
        *   **DO NOT** touch `lessons` or `tools`.
    *   **Verification:** If you see duplicate IDs, STOP.
2.  **Verify Paths**
    *   Check `learning-paths/*.json`. Ensure the narrative flow matches the new "Arc".

## Phase 4: Celebration
1.  **Handoff**
    *   **Notify User:**
        ```
        Subject Perfected. The Cycle is complete.
        > Consult the Handbook: `docs/THE_ARCHITECTS_HANDBOOK.md`
        ```