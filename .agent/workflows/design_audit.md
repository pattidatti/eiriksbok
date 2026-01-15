---
description: Audits a specific file or component against the project's premium design guidelines using the web-design-guidelines skill.
---

# Design Audit Workflow

1.  **Select Target**: Identify the file to audit (e.g., `src/components/MyNewComponent.tsx`).
2.  **View Guidelines**: Read `.github/skills/web-design-guidelines/SKILL.md` to understand the criteria.
3.  **Execute Audit**:
    -   Use `view_file` to read the target file.
    -   Analyze the file against the "Avant-Garde", "Minimalism", and "Premium" principles defined in the skill and project rules.
    -   Check for:
        -   **Typography**: Use of Inter/Display fonts, proper hierarchy.
        -   **Spacing**: Consistent padding/margin (Tailwind classes).
        -   **Micro-interactions**: Hover states, `framer-motion` usage.
        -   **Accessibility**: Color contrast, semantic HTML.
4.  **Report**: Generate a "Design Audit Report" listing violations and specific tailwind-class recommendations.

// turbo
5.  **Refine**: If approved, apply the changes to the file.
