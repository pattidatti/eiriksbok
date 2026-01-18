const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '../public/content');
const DOCS_DIR = path.resolve(__dirname, '../docs/Design documents');
const TEMPLATE_PATH = path.resolve(__dirname, '../docs/templates/blueprint-template.md');

// --- Helpers ---

function getBlueprintPath(subjectId) {
    return path.join(DOCS_DIR, `${subjectId}-blueprint.md`);
}

function ensureDocsDir() {
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    }
}

// --- Commands ---

function initBlueprint(subjectId) {
    ensureDocsDir();
    const blueprintPath = getBlueprintPath(subjectId);

    if (fs.existsSync(blueprintPath)) {
        console.log(`[INFO] Blueprint already exists: ${blueprintPath}`);
        return;
    }

    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error(`[ERROR] Template not found at: ${TEMPLATE_PATH}`);
        process.exit(1);
    }

    let content = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    content = content.replace('[Title]', subjectId)
        .replace('[e.g., cold-war]', subjectId);

    fs.writeFileSync(blueprintPath, content, 'utf8');
    console.log(`[SUCCESS] Created Blueprint: ${blueprintPath}`);
}

function syncBlueprint(subjectId) {
    const blueprintPath = getBlueprintPath(subjectId);
    if (!fs.existsSync(blueprintPath)) {
        console.error(`[ERROR] Blueprint not found for ${subjectId}. Run --init first.`);
        process.exit(1);
    }

    let content = fs.readFileSync(blueprintPath, 'utf8');
    const subjectDir = path.join(CONTENT_DIR, subjectId);

    // 1. Scan Filesystem
    let existingFiles = [];
    if (fs.existsSync(subjectDir)) {
        // Recursive search for json files
        const scan = (dir) => {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.json') && item !== 'index.json') { // Exclude manifest-like files if any
                    existingFiles.push(item);
                }
            });
        };
        try {
            scan(subjectDir);
        } catch (e) {
            console.log(`[WARN] Could not scan directory: ${e.message}`);
        }
    }

    // 2. Parse Blueprint Content Matrix
    // We look for "### Article" blocks and the "File:" line
    // Simpler approach: Regex to find `File: .../[filename].json` and check existence.

    // Regex for: * **File:** `public/content/.../filename.json`
    // We want to update any checkboxes related to status if we had them, 
    // but the current template uses checkboxes for "Beats" and "Modules".
    // 
    // The "Watchman" feature logic provided in the prompt was: 
    // "Warning: Article 'Battle of Somme' exists in filesystem but is missing from Blueprint."
    // and "Status checkboxes".
    //
    // Since the template doesn't explicitly have a "Status: [ ] Created" line, we'll add a section for "Drift Report" or logs.

    // Better Logic: Detect files in FS that are NOT in the Blueprint.

    const mentionedFiles = new Set();
    const fileRegex = /\*\*File:\*\* `.*?\/([^\/]+\.json)`/g;
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
        mentionedFiles.add(match[1]);
    }

    const zombies = existingFiles.filter(f => !mentionedFiles.has(f));

    // 3. Update Blueprint (Append Zombies if found)
    if (zombies.length > 0) {
        console.log(`[WARN] Found ${zombies.length} files in filesystem but not in Blueprint (Zombies).`);

        let driftSection = "\n\n## 6. Drift Report (Auto-Detected)\n> *Files found in system but not in usage plan. Please integrate them.*\n";
        let addedCount = 0;

        if (!content.includes("## 6. Drift Report")) {
            content += driftSection;
        }

        zombies.forEach(zombie => {
            if (!content.includes(zombie)) {
                content += `\n*   [ ] **FOUND (Unplanned):** \`${zombie}\`\n`;
                addedCount++;
            }
        });

        if (addedCount > 0) {
            fs.writeFileSync(blueprintPath, content, 'utf8');
            console.log(`[SUCCESS] Added ${addedCount} zombies to Drift Report in Blueprint.`);
        }
    } else {
        console.log("[SUCCESS] Blueprint is in sync. No zombies found.");
    }
}

// --- Main ---

const args = process.argv.slice(2);
const command = args[0];
const p1 = args[1];

switch (command) {
    case '--init':
        initBlueprint(p1);
        break;
    case '--sync':
        syncBlueprint(p1);
        break;
    default:
        console.log("Usage: node blueprint-manager.cjs [--init <id> | --sync <id>]");
}
