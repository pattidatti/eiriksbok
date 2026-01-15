---
description: Audits a specific file against Vercel's React Best Practices to identify performance bottlenecks.
---

# Performance Audit Workflow

1.  **Select Target**: Identify the file to audit (e.g., `src/components/HeavyComponent.tsx`).
2.  **View Guidelines**: Read `.github/skills/vercel-react-best-practices/SKILL.md` to understand key performance rules.
3.  **Execute Audit**:
    -   Use `view_file` to read the target file.
    -   Analyze the code specifically looking for violations of:
        -   **Re-renders**: `rerender-*` rules (useMemo, stable callbacks).
        -   **Waterfalls**: `async-*` rules (Promise.all).
        -   **JS Perf**: `js-*` rules (Map/Set vs Array).
        -   **Bundle**: `bundle-*` rules (lazy loading).
4.  **Report**: Generate a "Performance Audit Report" listing specific violations and remediation code.

// turbo
5.  **Refine**: If critical issues are found, propose a refactor plan.
