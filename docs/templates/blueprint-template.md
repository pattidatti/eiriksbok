# Subject Blueprint: [Title]
> **Status:** `[Draft/In-Progress/Approved]`
> **Version:** 1.0

---

## 1. Metadata
*   **Type:** `Topic` (Emne)
*   **Parent (Fag):** `[e.g., historie, norsk]` <!-- Must be an existing ID in manifest.json -->
*   **Topic ID:** `[e.g., forste-verdenskrig]`
*   **Title:** `[The Human-Readable Title]`
*   **Visual Theme:** `[Adjective] [Adjective] [Noun]` (e.g., "Gritty Industrial Realism")

---

## 2. The Narrative Arc
> *What is the story we are telling?*

**The Hook:**
[Write a 1-sentence hook that grabs the student.]

**The Arc:**
[Briefly describe the journey. "We start with X, move through the chaos of Y, and end with the resolution of Z."]

---

## 3. The Learning Path (The Spine)
> *The sequence of the student's journey. This maps directly to the `learning-path.json`.*

1.  **[Type: Article]** `[Article Title]` (ID: `[article-id]`)
2.  **[Type: Quiz]** `[Quiz Title]`
3.  **[Type: Interactive]** `[Module Name]` (e.g., Map, Timeline)

---

## 4. The Content Matrix (The Bricks)
> *Detailed usage plan. The Builder uses this to generate files.*

### Article 1: [Title]
*   **File:** `public/content/[path]/[filename].json`
*   **Pedagogical Goal:** [What specific concept will the student master?]
*   **The Narrative Beats:**
    *   [ ] **The Hook:** [How do we grab them immediately?]
    *   [ ] **The Core Conflict/Misconception:** [What hard concept are we unpacking?]
    *   [ ] **The Resolution:** [How does it end?]
*   **Interactive Modules:**
    *   [ ] `[Type: e.g., Timeline]` - [Description]
*   **Global Connections:**
    *   [ ] Link to `[Subject ID]/[Article ID]` (Context: [Why?])

*(Repeat for all articles)*

---

## 5. The Asset Tracker
> *Visuals required to make this premium.*

| Status | Type | Description (Prompt Context) | Filename |
| :--- | :--- | :--- | :--- |
| `[ ]` | Hero | [Detailed description] | `hero.jpg` |
| `[ ]` | Content | [Scene description] | `[name].jpg` |
