---
description: The Unified Entry Point for Subject Planning. Triggers the Architect.
---

1.  **Analyze Request**: Check if the user wants to work on a specific subject.
    *   *Input:* Subject ID (e.g., "cold-war").

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

6.  **Loop**:
    *   User edits the plan (via agent instructions).
    *   Agent updates `.md`.
    *   *Exit Condition:* User says "Approve" or "Build it". -> Trigger `/build_subject`.
