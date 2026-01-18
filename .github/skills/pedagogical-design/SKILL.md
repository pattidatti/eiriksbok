---
name: pedagogical-design
description: Standards for deep educational content planning.
---

# Pedagogical Design Standard (The "Deep Spec")

When planning content (Subject or Article), you must move beyond "what covers the curriculum" to "how do we spark understanding?".

## The Core Philosophy
1.  **Narrative First:** Humans learn through stories, not bullet points. Every topic must have an emotional arc.
2.  **Mental Models:** Don't just list facts. Provide a framework (analogy, diagram, visual) that holds the facts together.
3.  **Active Weaving:** Concepts must be explicitly linked (hyperlinked) to show the interconnectedness of the world.

## The Blueprint Structure
Every `[subject]-design.md` must include a "Pedagogical Blueprint" section with the following fields for *each* planned article:

### 1. The "Why" (Goal)
*   **Question:** Why does this matter? What is the *one thing* the student should remember 10 years from now?
*   **Example:** "To understand that WWI wasn't an accident, but a system failure."

### 2. The Narrative Arc (Journey)
*   3-4 bullet points describing the *emotional* and *intellectual* progression.
*   **Start:** Hook/Mystery/Illusion.
*   **Middle:** Conflict/Complication/Trap.
*   **End:** Resolution/Insight/New Question.

### 3. The Mental Model (Visual)
*   Describe an interactive component or visual analogy.
*   **Examples:** "A pressure cooker for WWI causes", "A house of cards for banking crisis".

### 4. Required Components (Specs)
*   List specific interactive elements that *must* be built.
*   **Constraints:** Must use existing codebase components (`Timeline`, `Map`, `ConceptLink`).

## Workflow Integration
*   **plan_subject:** Must generate this blueprint for all core articles.
*   **plan_article:** Must read this blueprint and implement it.
