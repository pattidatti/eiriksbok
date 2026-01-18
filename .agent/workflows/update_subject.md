# Workflow: Update Subject (The Renovator)
Trigger: User wants to add content to an EXISTING subject.

---

## Phase 1: Logic Check (Legacy Support)
**Goal:** ensure we have a "Design Doc" to work from.

1.  **Check for Design Doc**
    *   **Action:** `node scripts/content-manager.cjs --find "[Subject Name]"`
    *   **Logic:**
        *   If `found: false` -> **ERROR**. Run `/plan_subject` instead.
        *   If `found: true` AND `DesignDocMissing`:
            *   **Activate Legacy Protocol.**
            *   **Action:** `node scripts/content-manager.cjs --reverse-engineer "[Subject.id]"`
            *   **Notify User:** "I found the subject but no design document. I have auto-generated one based on existing content."

## Phase 2: The Dashboard Scan
**Goal:** Determine what needs to be built based on the Design Doc.

1.  **Read Design Doc**
    *   **Action:** Read `docs/Design documents/[subject]-design.md`.
2.  **Parse Matrix**
    *   **Loop:** Look for lines starting with `- [ ]`.
    *   **Prioritize:**
        1. "Core Narrative" Articles.
        2. "Entities" (People/Concepts).
        3. "Assets" (Images).
3.  **Propose Action**
    *   **Monologue:** "I see the following pending items in the Design Doc: [List 3 items]. Shall we execute [Item 1]?"

## Phase 3: Execution
1.  **Execute Item**
    *   If Article -> Run `/plan_article`.
    *   If Person -> Create `public/content/people/[name].json`.
    *   If Asset -> Run `/generate_image`.
2.  **Update Dashboard**
    *   **CRITICAL:** Mark the item as `[x]` in `[subject]-design.md` immediately after completion.

## Phase 4: Re-Scan
1.  **Loop:** Return to Phase 2 until user says "STOP" or no items remain.
