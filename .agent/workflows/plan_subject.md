# Workflow: Plan Subject (v4.0 - The Architect)
Trigger: User wants to create a **NEW** subject.

---

## Phase 1: The Idempotency Check (CRITICAL)
**Goal:** Ensure we don't duplicate existing subjects.

1.  **Check Existence**
    *   **Action:** `node scripts/content-manager.cjs --find "[Subject Name]"`
    *   **Logic:**
        *   If `found: true`:
            *   **STOP IMMEDIATELY.**
            *   **Notify User:** "Subject '[ID]' already exists. Please use `/update_subject` instead."
        *   If `found: false`:
            *   **Proceed** to Phase 2.

## Phase 2: The "Soul" Definition
**Goal:** Create the Design Document (The Blueprint) with Deep Roots.

1.  **Gather Context (The Interview)**
    *   **Agent Monologue:** "Before we build, I need to understand the soul of this subject."
    *   **Action:** Ask user for:
        *   **Visual Theme:** (e.g., "Cyberpunk", "Art Deco", "Gritty Realism").
        *   **Pedagogical Context:** Target audience (Age 10-13, 13-16, 16+)? Prerequisite knowledge?
        *   **Interdisciplinary Web:** Which OTHER subjects *must* this connect to? (e.g., "Economy", "Religion").

2.  **Create Design Doc**
    *   **Action:** Write to `docs/Design documents/[subject]-design.md`.
    *   **Content Requirement:**
        *   **Header:** Subject ID, Title, Status.
        *   **The Soul (Vision):**
            *   **Narrative Arc:** A story-driven overview (e.g., "The rise and fall of...").
            *   **Visual Theme:** The keywords provided.
        *   **The Web (Interdisciplinary):**
            *   List the connections identified in step 1.
            *   **Protocol:** "Every major concept here must also link to [Friend Subject]."
        *   **The Dashboard (Status):**
            *   `[ ] Core Narrative Articles`
            *   `[ ] Key Figures`
            *   `[ ] Essential Maps/Assets`

## Phase 3: The Scaffold
1.  **Create Directory**
    *   **Action:** `node scripts/content-manager.cjs --create "[Subject ID]"` (or manually `mkdir`).

2.  **Handoff**
    *   **Notify User:** "Subject '[ID]' scaffolded. Design Doc created. I am ready to `/update_subject` to populate the narrative."
