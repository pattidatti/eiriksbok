# The Architect's Handbook: A Manifesto of Creation
*The definitive guide to the Subject Lifecycle in Eiriksbok.*

---

## 1. The Core Philosophy
**"The Blueprint is the Territory."**

We do not build blindly. We do not write articles in isolation. We do not "hope" connections emerge.
We **Architect** the subject first. The code, the files, and the assets are merely the physical projection of the **Subject Blueprint**.

## 2. The Two Roles
This system divides creation into two distinct phases, handled by two specialized workflows:

### Role 1: The Architect (Planning & Design)
*   **Workflow:** `/architect [Subject Name]`
*   **Goal:** Create or Update the **subject-blueprint.md**.
*   **Behavior:**
    *   **New Subject:** It interviews you to understand the specific vision (Theme, Goals, Connections) and scaffolds a new Blueprint.
    *   **Existing Subject:** It performs a **Deep Audit**. It reads every existing file, checks the `manifest.json`, validates the `learning-path`, and then populates the Blueprint with the *current reality* + *Ulthathink improvements*.
*   **The Output:** A "Living Spec" file. You edit this file directly. This is your creative canvas.

### Role 2: The Builder (Execution)
*   **Workflow:** `/build_subject [Subject Name]`
*   **Goal:** Turn the Blueprint into Reality.
*   **Behavior:**
    *   It reads the `subject-blueprint.md`.
    *   It compares it to the file system (The Diff).
    *   **It Executes:**
        *   Creates missing directories.
        *   Generates missing articles (using the "Content Matrix" in the Blueprint).
        *   Generates missing images (using the "Asset Tracker").
        *   Compiles/Updates the `learning-path.json` to match the Blueprint's path.

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
