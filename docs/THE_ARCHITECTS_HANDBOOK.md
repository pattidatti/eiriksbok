# The Architect's Handbook: A Manifesto of Creation
*The definitive guide to the Subject Lifecycle in Eiriksbok.*

---

## 1. The Philosophy
A Subject is not merely a folder of files. It is a living entity with a **Soul**, a **Body**, and a **Spirit**. To create is to guide the Subject through these three phases of existence.

## 2. The Three Phases

### Phase I: The Soul (Design)
**Goal:** Define the Vision, the Narrative Arc, and the Interdisciplinary Web.
*   **Input:** A concept (e.g., "The Cold War").
*   **Tool:** `/plan_subject`
*   **Outcome:** A `[subject]-design.md` file that acts as the blueprint.
*   **Key Question:** "What is the story we are telling, and how does it connect to the world?"

### Phase II: The Body (Construction)
**Goal:** Build the content, the flesh and bone of the subject.
*   **Input:** The "Skeleton" (Design Doc).
*   **Tool:** `/update_subject`
*   **Outcome:** Generated articles, people, and assets.
*   **Key Question:** "Does every piece of content serve the Narrative Arc?"
*   **Note:** For Legacy/Retroactive subjects, this phase begins by reverse-engineering the skeleton.

### Phase III: The Spirit (Refinement)
**Goal:** Elevate the subject from "Functional" to "Avant-Garde".
*   **Input:** A working subject.
*   **Tool:** `/refine_subject`
*   **Outcome:** A masterpiece. Precise academic language, gripping visual themes, and deep "Focus Points" for every article.
*   **Key Question:** "Is this premium?"

---

## 3. The Ritual of Handoff
We do not simply stop working. We hand off to the next phase.

*   **Soul -> Body:** "The Soul is defined. Now, let us forge the Body." (`/update_subject`)
*   **Body -> Spirit:** "Content built. Does it breathe? If not, polish the Spirit." (`/refine_subject`)
*   **Spirit -> Completion:** "The Cycle is complete."

---

## 4. The Protocols of Creation

### A. The Brick (Article Creation)
*   **Rule:** NEVER create an article file manually.
*   **Protocol:** You MUST use the `/plan_article` workflow.
*   **Why:** `/plan_article` ensures accessibility, layout, and "Avant-Garde" styling are baked in.

### B. The Path (Learning Sequence)
*   **Rule:** Content without a path is lost.
*   **Protocol:** Every subject MUST have a `[subject]-sti.json` (Learning Path).
*   **Trigger:**
    *   **New Subject:** Create the path during Phase II.
    *   **Update:** When adding an article, you MUST update the `[subject]-sti.json` to include it.
*   **Reference:** Consult `docs/LEARNING_PATH_GUIDE.md` for specific JSON structures.

### C. The Web (Cross-Pollination)
*   **The Rule:** You rarely create a subject in isolation. You create a node in the web.
*   **The Contract:** If you need a concept from another subject (e.g., *Economics* to explain *War*), you MUST:
    1.  Create the request in the external subject's Design Doc.
    2.  Add a "Learning Path Sync" task to that subject.
