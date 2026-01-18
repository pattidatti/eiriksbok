---
description: The Builder. Reads a Blueprint and creates the physical files and assets.
---

1.  **Read Context (The Foundation)**:
    *   File: `docs/Design documents/[Subject ID]-blueprint.md`
    *   File: `docs/image-style-guide.md` (CRITICAL: You MUST use this for all images).
    *   File: `.agent/workflows/plan_article.md` (CRITICAL: You MUST use the "Pedagogical Vision" and "Content Structure" rules from this file when writing JSON).

2.  **Verify Sync**:
    *   Run: `node scripts/blueprint-manager.cjs --sync [Subject ID]`

3.  **Execute Content Matrix (The Build)**:
    *   **Loop through each Article** defined in the Blueprint:
        *   **Check Existence:** Does the file exist?
        *   **If Missing -> CREATE (Deep Mode):**
            *   *Action:* Create `public/content/[path]/[filename].json`.
            *   *Content Rules (From plan_article):*
                *   **Length:** Target 1500+ words. Do NOT write short summaries.
                *   **Tone:** Narrative, wondering, pedagogical.
                *   **Components:** Use `TimelineComponent` (compact), `FactBox`, and `QuoteBlock` where appropriate.
                *   **Structure:** Introduction -> Core Sections -> Deep Dive/Conclusion.
            *   *Input:* Use the "Beats", "Hook", and "Misconception" from the Blueprint as the seed. EXPAND on them significantly.
        *   **If Exists**: Log "Skipping [Article], already exists."

4.  **Execute Asset Tracker (Premium Visuals)**:
    *   **Loop through Assets**: 
        *   **Check Existence:** Does the file exist?
        *   **If Missing -> GENERATE:**
            *   *Style:* You MUST prepend the "Magical Keywords" from `image-style-guide.md` (e.g., "A highly realistic 4K cinematic photograph...").
            *   *Prompt:* Combine the Style Guide header + The Blueprint Description.

5.  **Compile Learning Path**:
    *   *Action:* Create/Update `public/content/[Subject ID]/[Subject ID]-sti.json`.
    *   *Logic:* Map the "Learning Path" list from the blueprint directly to the JSON structure.

6.  **Register & Final Polish**:
    *   **Run:** `node scripts/content-manager.cjs --register [Subject ID]`
    *   *Goal:* Ensure all new articles are listed in `manifest.json`.
    *   **Run:** `node scripts/blueprint-manager.cjs --sync [Subject ID]`
    *   **Notify User:** "Build Complete. Manifest Updated. Access your subject at [URL]."
