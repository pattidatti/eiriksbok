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
**Goal:** Create the Design Document (The Blueprint).

1.  **Create Design Doc**
    *   **Action:** Use `generate_subject_design_doc` from `subject-management` skill.
    *   **Path:** `docs/Design documents/[subject]-design.md`
    *   **Context:** Ask user for the "Vision" if not provided.

2.  **Scaffold Content**
    *   **Action:** `node scripts/content-manager.cjs --create "[Subject Name]"` (Implement this if needed, or manual mkdir).
    *   **Note:** For now, focus on the Design Doc.

## Phase 3: Handoff
1.  **Notify User:** "Design Doc created at `docs/Design documents/...`. Please review the Vision. Run `/update_subject` when ready to build."
