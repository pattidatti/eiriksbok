---
description: Audits and refines the current implementation plan with constructive criticism and detailed improvements.
---

# Refine Implementation Plan Workflow

This workflow is designed to critique and elevate the current `implementation_plan.md` using the "ULTRATHINK" protocol.

## Step 1: Context Gathering
1. Read `implementation_plan.md`.
2. Read `task.md`.
3. Read `package.json` to verify available libraries (Shadow Rule: Use existing libraries).
4. Read `src/components` (list only) to check for reusable components.

## Step 2: The "ULTRATHINK" Audit
Analyze the plan implementation details against the following vectors:

### 1. Architecture & Code Quality
- **Modularity**: Is the logic separated from the view?
- **Reusability**: Are we creating new components when we should use existing ones (e.g., from `src/components/ui`)?
- **State Management**: Is state local where it should be global, or vice versa?
- **Effect Efficiency**: Are there potential infinite loops or heavy re-renders?

### 2. User Experience (UX) & Aesthetics ("Avant-Garde")
- **Visuals**: Does the plan explicitly mention "Avant-Garde" styling (glassmorphism, micro-interactions, gradients)?
- **Feedback**: Do buttons have loading states? Do inputs have error states?
- **Animation**: Are transitions planned?
- **Mobile**: Is the layout responsive?

### 3. Completeness
- **Imports**: Are all external libraries standard or already installed?
- **Edge Cases**: Does the plan handle empty states (data missing)? Errors? Loading?

## Step 4: Generate Critique & Refine
1. **Critical Review**: Create a temporary "Critique" list in your memory.
2. **Refinement**: Update `implementation_plan.md` directly.
    -   **CRITICAL RULE**: **DO NOT REMOVE** existing details unless they are factually incorrect or outdated. Your goal is to *add* resolution, not subtract.
    -   **Add Missing Details**: If a step is vague ("Add styles"), rewrite it with specific CSS/Tailwind classes or design tokens.
    -   **Fix Architecture**: If a new component is proposed but duplicates an existing one, change the plan to reuse the existing one.
    -   **Enhance UI**: Add steps for "Polishing" (animations, hover states).
    -   **Risk Section**: Add a "Risks/Edge Cases" section to the plan if missing.
    -   **User Review**: Add a specific checklist for the user to double-check in the "User Review Required" section.

## Step 5: Final Check
- Verify that the updated plan is actionable and detailed enough that a junior dev could execute it without questions.
