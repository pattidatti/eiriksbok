# Learning Path Audit & Action Plan

## Status Overview
We investigated the reported issues with the "Den Kalde Krigen" learning path and performed a systemic check of all learning paths in the Codebase.

### 🔍 Key Findings

| Learning Path ID | In Registry (Tier 1) | In Manifest (Tier 2) | Status | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `nyromantikken-sti` | ✅ | ❌ | **Fragile** | Works (per user), but has NO fallback if Registry fails. |
| `romantikken-sti` | ✅ | ❌ | **Fragile** | Same as above. |
| `realismen-sti` | ✅ | ❌ | **Fragile** | Same as above. |
| `nyrealismen-sti` | ✅ | ❌ | **Fragile** | Same as above. |
| `kald-krig-sti` | ✅ | ✅ (in `tools`) | **Robust** | **Reported Broken**. Has full redundancy. |
| `romerriket-sti` | ✅ | ✅ (in `tools`) | **Robust** | |
| `vikingtiden-sti` | ✅ | ✅ (in `tools`) | **Robust** | |
| `svartedauden-sti` | ✅ | ✅ (in `tools`) | **Robust** | |

### 🧠 The Paradox
The user reported that `nyromantikken-sti` is fixed, while `kald-krig-sti` struggles.
*   **Technically:** `kald-krig-sti` is *better* configured than `nyromantikken-sti` because it exists in both the `content-index.json` AND `manifest.json`.
*   **Implication:** If `nyromantikken-sti` works, the **Registry Loader** is functioning correctly. Since `kald-krig-sti` is also in the Registry with the correct path, it *should* work identical to `nyromantikken-sti`.

### 🚨 Root Cause Analysis

1.  **Stale Registry Cache (Most Likely):**
    The `content-index.json` on the disk has a build timestamp from roughly **Jan 14th**. If the fix for `nyromantikken` involved manual registry generation on **Jan 15th**, but the file on disk is older (or the client is caching an even older version), this discrepancy could explain why some paths work (if they were unchanged) and others fail.

2.  **Missing Manifest Entries (Risk):**
    The Literature paths (Norsk) are completely missing from `manifest.json`. This means if the `content-index.json` fails to load (network error) or is stale, these paths will **404 immediately**.

3.  **Data Structure Consistency:**
    `kald-krig-sti.json` and `nyromantikken-sti.json` share the same internal structure. Dependencies on components (`ScenarioRoleplay`, `DragDropTimeline`) utilize the same keys in `ComponentRegistry`. There are no obvious code-level reasons for `kald-krig-sti` specifically to fail while others work.

## 🛡️ Action Plan

### Phase 1: Immediate Remediation (Developer)
1.  **Force Registry Update:** Run the content index generator to ensure the file on disk is perfectly reasonably up to date.
    ```bash
    node scripts/generateContentIndex.js
    ```
2.  **Verify `den-kalde-krigen` Integrity:** Ensure no invisible characters or JSON errors exist in the target file (though basic checks passed).

### Phase 2: Robustness Upgrade (Codebase)
1.  **Update Manifest:** Add `nyromantikken-sti`, `romantikken-sti`, etc., to `manifest.json`. This ensures that *all* learning paths have a Tier 2 fallback.
2.  **Cache Busting:** Ensure the application requests `content-index.json` with a cache-busting query param (e.g., `?v=${Date.now()}`) during development/staging to prevent browser caching of stale indices.

### Phase 3: Verification
1.  **Test `kald-krig-sti`:** Load the path. Check Console.
    *   If successful via Registry: No logs (or "Tier 1").
    *   If fallback used: Log "Tier 2 (Manifest) derived path...".
2.  **Test `nyromantikken-sti`:** Verify it still works.

## 📝 Recommendation for User
Since we cannot reproduce the "sporadic" failure statically (the code and data look correct), we strongly suspect a **browser cache** or **stale build** issue.

**Please run the following commands to ensure a clean state:**
1.  `node scripts/generateContentIndex.js`
2.  Restart the dev server.
3.  Hard-refresh the browser (Ctrl+F5) to clear the `content-index.json` cache.
