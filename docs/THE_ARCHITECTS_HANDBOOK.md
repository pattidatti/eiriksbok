# The Architect's Handbook: A Manifesto of Creation
*The definitive guide to the Subject Lifecycle in Eiriksbok.*

---

## 1. The Core Philosophy
**"The Blueprint is the Territory."**

We do not build blindly. We do not write articles in isolation. We do not "hope" connections emerge.
We **Architect** the subject first. The code, the files, and the assets are merely the physical projection of the **Subject Blueprint**.

### 1.1 The Hierarchy of Knowledge
We follow a strict hierarchy to map Norwegian pedagogy to our code:
1.  **Fag (Subject):** The Root (e.g., `Historie`, `Norsk`, `Naturfag`). *Managed continuously.*
2.  **Emne (Topic):** The Unit of Work (e.g., `The Cold War`, `Grammar`). *This is what you build.*
3.  **Artikkel (Article):** The Atomic Lesson.

### 1.2 The Two Roles
*   **The Architect (Planning):** You identify the need for a new **Topic**. You define its soul, its narrative arc, and its learning goals. You produce the **Subject Blueprint** (Topic Plan).
*   **The Builder (Execution):** You execute the plan. You write the code, generate the assets, and compile the **Learning Path**.

## 2. The Golden Protocol

### Phase 1: Planning (`/plan_topic`)
*   **Trigger:** You want to create a new Topic or refine an existing one.
*   **Action:**
    1.  Run `/plan_topic [topic-id]`.
    2.  The Agent interviews you or reviews the current state.
    3.  **The Fidelity Rule:** The Agent MUST use ULTRATHINK to pre-fill the **Narrative Arc**, **Detailed Beats**, and **Image Prompts** directly into the Blueprint.
    4.  Together, you refine the **Blueprint** (`docs/Design documents/[topic]-blueprint.md`).
    5.  **CRITICAL:** You must define the `Parent (Fag)` in the metadata.

### Phase 2: Execution (`/build_topic`)
*   **Trigger:** The Blueprint is approved.
*   **Action:**
    1.  Run `/build_topic [topic-id]`.

---

## 3. The Subject Blueprint Structure
This is the most important file in the project. It lives in `docs/Design documents/[subject]-blueprint.md`.

### A. Metadata
Defines the `id`, `title`, and the "Visual Prompt" that controls the aesthetic of every generated image.

### B. The Narrative Arc
A high-level story. "In this subject, the student journeys from X to Y, discovering Z."

### C. The Learning Path (The Spine)
This is not just a list. It is the **sequence of experience**.
*   *Format:* `1. Article: Introduction` -> `2. Quiz: Basic Concepts` -> `3. Article: Deep Dive`.
*   The Builder uses this to generate the `[subject]-sti.json`.

### D. The Content Matrix (The Bricks)
The atomic plan for every article.
*   **Title:** The display title.
*   **File:** `filename.json`
*   **Beats:** The specific key points the article must cover.
*   **Modules:** "Timeline", "Map", "Quote".
*   **Connections:** "Link to [Economics/Inflation]".

### E. The Asset Tracker
A list of every image and map required.
*   `[ ] Hero Image: A gritty trench...`
*   `[x] Map: Europe 1914`

---

## 4. The Golden Workflow
1.  **Trigger:** `Run /architect "The Cold War"`
2.  **Edit:** The Agent scaffolds the Blueprint. You open `docs/Design documents/cold-war-blueprint.md` and refine the beats, add a new article, or tweak the visual prompts.
3.  **Approve:** You save the file.
4.  **Build:** `Run /build_subject "The Cold War"` -> The Agent builds the physical files.
5.  **Polished.**
