---
description: Executes the next step of the implementation plan with rigorous verification and self-healing.
---

1.  **Alignment & Context**
    *   **Read State:**
        *   Read `task.md` to find the *First Unchecked Item*.
        *   Read `implementation_plan.md` to understand the technical details for that item.
        *   **CRITICAL:** If the task involves UI/CSS/Components, read `.agent/user_rules` to load "Avant-Garde" styling constraints.
    *   **Dependency Check:**
        *   Briefly check if the *previous* task in `task.md` is marked `[x]`. If not, warn the user or halt.

2.  **Execution Phase**
    *   **Monologue:** "Executing Task: [Task Name]..."
    *   **Action:** Perform the necessary tool calls (`write_to_file`, `replace_file_content`, `run_command`).
    *   **Design Enforcer:**
        *   If creating a component, ensure it is NOT a generic HTML/CSS dump.
        *   Use the project's design system (Tailwind/Shadcn) if present.
        *   *Refuse* to create "placeholder" code.

3.  **Verification & Self-Healing**
    *   **Select Verification Method:**
        *   *Scenario A (TS/Logic):* `npm run type-check` (Fast, Strict).
        *   *Scenario B (Build/Critical):* `npm run build` (Slow, Comprehensive).
        *   *Scenario C (Unit):* `npm test [filename]` (Targeted).
    *   **Execute Check:** Run the selected command.
    *   **Loop:**
        *   **Pass:** Proceed to Completion.
        *   **Fail:** Read the error log. Attempt 1 *logical* fix (not just suppressing the error). Re-run check.
        *   **Fail again:** Restore file to original state vs. Stop and Notify User. (Choose Stop to prevent destruction).

4.  **Completion & Reporting**
    *   **Update Artifacts:**
        *   Mark the task as `[x]` in `task.md`.
        *   Update `task_boundary` with the result.
    *   **Progress Check:**
        *   Count remaining tasks.
        *   Message User: "Task [X] Completed. [Y] tasks remaining. Continue?"
