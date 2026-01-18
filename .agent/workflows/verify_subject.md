# Workflow: Verify Subject (The Auditor)
Trigger: User wants to check quality/integrity.

---

## Phase 1: The Zombie Scan
**Goal:** Clean up the registry.

1.  **Detect Zombies**
    *   **Action:** `node scripts/content-manager.cjs --detect-zombies`
    *   **Logic:**
        *   If `zombies` found:
            *   **Report:** "Found unregistered folders in `public/content`: [List]. Should I register them?"

## Phase 2: The Orphan Scan (Assets)
**Goal:** Clean up storage.

1.  **Detect Orphans**
    *   **Action:** (Future feature - placeholder for now).
    *   **Command:** `node scripts/content-manager.cjs --scan-orphans [subject]` (If implemented).

## Phase 3: The Link Audit
**Goal:** Ensure no dead ends.

1.  **Check Internal Links**
    *   **Action:** Run `node scripts/check_quiz_links.cjs` (or similar existing script).

## Phase 4: Report
1.  **Output:**
    *   Table of Health:
        *   Manifest Sync: [OK/FAIL]
        *   Asset Health: [OK/FAIL]
        *   Link Health: [OK/FAIL]
