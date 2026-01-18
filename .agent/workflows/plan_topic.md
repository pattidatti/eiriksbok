---
description: The Unified Entry Point for Topic Planning. Triggers the Architect.
---

1.  **Analyze Request**: Check if the user wants to work on a specific Topic (Emne).
    *   *Input:* Topic ID (e.g., "cold-war").

2.  **Initialize Blueprint**:
    *   Run: `node scripts/blueprint-manager.cjs --init [Subject ID]`
    *   *Goal:* Ensure the `docs/Design documents/[id]-blueprint.md` exists.

3.  **Sync Reality**:
    *   Run: `node scripts/blueprint-manager.cjs --sync [Subject ID]`
    *   *Goal:* Detect any existing files that are missing from the plan.

4.  **Open Workbench**:
    *   Tool: `view_file docs/Design documents/[id]-blueprint.md`
    *   *Action:* Read the file to the user.

5.  **The Interview (Interactive)**:
    *   If the blueprint is new (generic placeholders found):
        *   Ask: "I've scaffolded the blueprint. What is the **Visual Theme** and **Core Narrative** for [Subject]?"
    *   If the blueprint exists:
        *   Ask: "I've synced the blueprint. Do you want to add new articles or refine the existing path?"

6.  **The High-Fidelity Draft (CRITICAL)**:
    *   **Do not create a generic scaffold.**
    *   Use **ULTRATHINK** to brainstorm:
        *   **Visual Prompts:** Specific, cinematic, and technically grounded for the Image Style Guide.
        *   **Narrative Beats:** Emotional hooks, core conflicts, and "Aha!" moments for every article.
        *   **Connections:** Links to existing content (e.g., "How WWI debt led to this depression").
    *   **Action:** Update `docs/Design documents/[id]-blueprint.md` with THIS specific content. The blueprint should look "ready for review" after one script run.

7.  **Loop**:
    *   User reviews the blueprint file directly.
    *   Exit Condition: User says "Approve" or "Build it". -> Trigger `/build_topic`.
