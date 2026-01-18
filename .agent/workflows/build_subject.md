---
description: The Builder. Reads a Blueprint and creates the physical files and assets.
---

1.  **Read Blueprint**:
    *   File: `docs/Design documents/[Subject ID]-blueprint.md`
    *   *Action:* Read the file content.

2.  **Verify Sync**:
    *   Run: `node scripts/blueprint-manager.cjs --sync [Subject ID]`
    *   *Goal:* Ensure we aren't overwriting manual changes.

3.  **Execute Content Matrix (The Build)**:
    *   **Loop through each Article** defined in the Blueprint:
        *   **Check Existence:** Does the file exist?
        *   **If Missing:**
            *   Create the file using `write_to_file`.
            *   *Content:* Stick to the defined "Beats" and "Pedagogical Goals".
            *   *Style:* Use the "Visual Theme" from metadata.
        *   **If Exists**: detailed log "Skipping [Article], already exists."

4.  **Execute Asset Tracker**:
    *   **Loop through Assets**: 
        *   Generate missing images using the defined prompts.

5.  **Compile Learning Path**:
    *   *Action:* Create/Update `public/content/[Subject ID]/[Subject ID]-sti.json`.
    *   *Logic:* Map the "Learning Path" list from the blueprint directly to the JSON structure defined in `docs/LEARNING_PATH_GUIDE.md`.

6.  **Final Polish**:
    *   Run: `node scripts/blueprint-manager.cjs --sync [Subject ID]` (To check all the new boxes).
    *   Notify User: "Build Complete. Access your subject at [URL]."
