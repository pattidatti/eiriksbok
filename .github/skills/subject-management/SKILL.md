---
name: Subject Management
description: Core logic for managing the educational subject lifecycle (Plan, Update, Verify).
---

# Subject Management Skill

This skill provides the intelligence for managing the lifecycle of educational subjects. It relies on the `scripts/content-manager.cjs` executable for deterministic file system operations.

## 1. Check Content Existence
**Goal:** Determine if a subject or topic already exists to prevent duplication.
**Tool:** `run_command`
**Command:** `node scripts/content-manager.cjs --find "[Query]"`

**Output Interpretation:**
*   `{ "found": true, "path": "..." }`: Subject exists. **STOP CREATION.** Redirect to `/update_subject`.
*   `{ "found": false }`: Safe to create.

## 2. Generate Design Doc (The "Soul")
**Goal:** Create a standardized PEDAGOGICAL CONTRACT.
**Tool:** `write_to_file`
**Path:** `docs/Design documents/[subject]-design.md`
**Template:**

```markdown
# Subject Design: [Subject Name]
**Subject ID:** `[slug]`
**Global Status:** `[Planning]`

## 1. The Dashboard (Status)
- [ ] **Completion**: `0/X` items.
- [ ] **Manifest Registered**: `[ ]`

## 2. The Soul (Vision)
*   **Narrative Arc:** "..."
*   **Visual Theme (Prompts Only):** "..."
*   **Pedagogical Pillars:** ...

## 3. The Content Matrix (Working Checklist)
### Core Narrative
- [ ] **Article ID**: `oversikt`
    - *Status*: `[ ] Draft  [ ] Content  [ ] Links  [ ] Assets`

### Entities (People/Concepts)
- [ ] **Name** (Type)
    - *File Status*: `[ ] Created`
```

## 3. Reverse Engineer Design Doc (Legacy Support)
**Goal:** Create a design doc for a subject that exists but has no doc.
**Tool:** `run_command`
**Command:** `node scripts/content-manager.cjs --reverse-engineer "[SubjectSlug]"`

**Logic:**
1.  Script scans `src/content/[subject]`.
2.  Identifies all articles.
3.  Generates a `[subject]-design.md` where existing articles are marked `[x]`.
4.  Agent reads this new file to understand the state.

## 4. Validate Manifest (Zombie Check)
**Goal:** Ensure `manifest.json` matches the file system.
**Tool:** `run_command`
**Command:** `node scripts/content-manager.cjs --detect-zombies`

**Output:**
*   List of folders in `src/content` that are NOT in `public/content/manifest.json`.
*   **Action:** If zombies found, ask user to register them.
