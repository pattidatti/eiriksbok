const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '../public/content');
const MANIFEST_PATH = path.resolve(__dirname, '../public/content/manifest.json');
const DESIGN_DOCS_DIR = path.resolve(__dirname, '../docs/Design documents');

// --- Helper Functions ---

function getManifest() {
    if (!fs.existsSync(MANIFEST_PATH)) return { subjects: [] };
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveDesignDoc(subjectSlug, content) {
    if (!fs.existsSync(DESIGN_DOCS_DIR)) {
        fs.mkdirSync(DESIGN_DOCS_DIR, { recursive: true });
    }
    const filePath = path.join(DESIGN_DOCS_DIR, `${subjectSlug}-design.md`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SUCCESS] Design doc created: ${filePath}`);
}

// --- Core Commands ---

function getSubjectPath(query) {
    const manifest = getManifest();
    const normalize = (str) => str ? str.toLowerCase().trim() : "";
    const queryNorm = normalize(query);

    // 1. Search Manifest
    for (const subject of manifest.subjects) {
        if (normalize(subject.id) === queryNorm || normalize(subject.title).includes(queryNorm)) {
            return path.join(CONTENT_DIR, subject.id);
        }
        if (subject.topics) {
            const topic = subject.topics.find(t => normalize(t.id) === queryNorm || normalize(t.title).includes(queryNorm));
            if (topic) {
                return path.join(CONTENT_DIR, subject.id, topic.id);
            }
        }
    }

    // 2. Search File System (Recursive - 2 levels)
    try {
        const rootDirs = fs.readdirSync(CONTENT_DIR).filter(f => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory());

        // Level 1
        const l1 = rootDirs.find(d => normalize(d) === queryNorm);
        if (l1) return path.join(CONTENT_DIR, l1);

        // Level 2
        for (const root of rootDirs) {
            const subDir = path.join(CONTENT_DIR, root);
            try {
                const subDirs = fs.readdirSync(subDir).filter(f => fs.statSync(path.join(subDir, f)).isDirectory());
                const l2 = subDirs.find(d => normalize(d) === queryNorm);
                if (l2) return path.join(subDir, l2);
            } catch (e) { continue; }
        }
    } catch (e) { return null; }

    return null;
}

function findSubject(query) {
    const dirPath = getSubjectPath(query);
    if (dirPath) {
        const id = path.basename(dirPath);
        const parentPath = path.dirname(dirPath);
        const parentId = path.basename(parentPath) === 'content' ? null : path.basename(parentPath);

        console.log(JSON.stringify({
            found: true,
            id: id,
            path: dirPath,
            parentId: parentId
        }, null, 2));
    } else {
        console.log(JSON.stringify({ found: false }, null, 2));
    }
}

function detectZombies() {
    const manifest = getManifest();
    const manifestIds = new Set(manifest.subjects.map(s => s.id));

    const fsSubjects = fs.readdirSync(CONTENT_DIR).filter(f => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory());

    const zombies = fsSubjects.filter(id => !manifestIds.has(id));

    if (zombies.length > 0) {
        console.log(JSON.stringify({ zombies: zombies, status: "ZOMBIES_DETECTED" }, null, 2));
    } else {
        console.log(JSON.stringify({ zombies: [], status: "CLEAN" }, null, 2));
    }
}

function reverseEngineer(subjectId) {
    // Attempt to resolve path intelligently first
    let dir = getSubjectPath(subjectId);

    // Fallback to direct path joining if not found (or if user passed a path)
    if (!dir) {
        dir = path.resolve(CONTENT_DIR, subjectId);
    }

    if (!fs.existsSync(dir)) {
        console.error(`[ERROR] Subject directory not found: ${dir}`);
        process.exit(1);
    }

    // Ensure we use the simple ID for the filename to avoid directory issues
    const simpleId = path.basename(dir);

    // Scan for existing articles
    const articles = [];
    try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        files.forEach(f => {
            articles.push(f.replace('.json', ''));
        });
    } catch (e) { }

    const template = `# Subject Design: ${simpleId} (Retroactive)
**Subject ID:** \`${simpleId}\`
**Global Status:** \`[Maintenance]\`

## 1. The Dashboard (Status)
- [x] **Retroactive Generation**: \`Completed\`
- [ ] **Manifest Registered**: \`[ ]\`

## 2. The Soul (Vision)
*   **Narrative Arc:** "Legacy subject detected. Please update with new vision."
*   **Visual Theme (Prompts Only):** "TBD"

## 3. The Content Matrix (Detected)
### Existing Content
${articles.map(a => `- [x] **Article ID**: \`${a}\``).join('\n')}

### New Plan
- [ ] **Article ID**: \`...\`
`;

    saveDesignDoc(simpleId, template);
}


// --- Main ---

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
    case '--find':
        findSubject(param);
        break;
    case '--detect-zombies':
        detectZombies();
        break;
    case '--reverse-engineer':
        reverseEngineer(param);
        break;
    default:
        console.log("Usage: node content-manager.cjs [--find <query> | --detect-zombies | --reverse-engineer <id>]");
}
