---
description: Critiques the current plan or code with extreme depth (ULTRATHINK). Checks Code, Arch, Opt, Logic, & UI.
---

1.  **Context Loading**
    *   Identify the target for critique.
        *   If the user does not specify a target, check for `implementation_plan.md` in the artifacts directory.
        *   If no plan exists, target the currently open file.
    *   Read the target file using `view_file`.
    *   Read `task.md` (if it exists) to understand the broader context.
    *   Read `.agent/user_rules` (if available via `view_file` or known context) to reinforce "Avant-Garde" standards.

2.  **ULTRATHINK Analysis (Internal Monologue)**
    *   **Persona:** Adopt the persona defined in `user_rules` (Senior Frontend Architect), but apply an extremely critical, "Avant-Garde" lens.
    *   **Do not be nice. Be right.**
    *   **Rule of Preservation:** When critiquing a plan, **NEVER** suggest removing details unless they are factually incorrect or technically obsolete. **Goal:** Increase density. Turn "Implement function" into "Implement `calculateGrowth` with params x, y, z".
    *   Analyze the target across these 4 dimensions. **Scrutinize deeply. Defaults are not acceptable. Functionality is not enough.** Do not invent flaws, but do not settle for "good enough."

    *   **Dimension 1: Architecture & Scalability**
        *   Is this robust? Will it break if data grows by 100x?
        *   Are we introducing technical debt?
        *   Is state management too complex or too simple?

    *   **Dimension 2: Logic & Edge Cases**
        *   What happens if the API fails?
        *   What happens if the user clicks twice?
        *   Are there race conditions?
        *   Is the data flow unidirectional and predictable?

    *   **Dimension 3: Optimization & Performance**
        *   Are we causing unnecessary re-renders?
        *   Is the bundle size impacted?
        *   Can we use `useMemo` or `useCallback` effectively here?

    *   **Dimension 4: UI/UX & Aesthetics (The "Avant-Garde" Check)**
        *   **CRITICAL:** Does this look like a Bootstrap/MUI template? If yes, REJECT IT.
        *   Is the spacing intentional?
        *   Are the micro-interactions defined?
        *   Does it use the specified library (e.g., Shadcn) correctly but with a "bespoke" twist?

3.  **Generate Critique Report**
    *   Output a markdown response with the following structure:

    ```markdown
    # ULTRATHINK Critique: [Target Name]

    ## Executive Verdict
    [Go / No-Go / Conditional Pass] - One sentence summary.

    ## 1. Architecture & Logic
    > [!WARNING]
    > [Critical Logical Flaw or "None detected"]

    *   **Strength:** [What is good]
    *   **Weakness:** [What needs fixing]
    *   **Question:** [Clarification needed]

    ## 2. Code & Optimization
    *   [Specific code improvement 1]
    *   [Specific performance tip]

    ## 3. The "Avant-Garde" Check (UI/UX)
    > [!NOTE]
    > Aesthetic Score: [1-10] (1=Boilerplate, 5=Functional, 10=Avant-Garde Masterpiece).
    > If < 8, explain why.

    *   **Critique:** [Is it premium? Is it unique?]
    *   **Micro-interaction Idea:** [Propose one specific animation/interaction]

    ## Actionable Refinements
    > **Note:** Do not remove existing details from the plan unless outdated. Add concrete specifics (filenames, types, logic).

    1.  [Step 1]
    2.  [Step 2]
    3.  [Step 3]
    ```
