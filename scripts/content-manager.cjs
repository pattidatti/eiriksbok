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

function findSubject(query) {
    const manifest = getManifest();
    const normalize = (str) => str.toLowerCase().trim();

    const found = manifest.subjects.find(s =>
        normalize(s.id) === normalize(query) ||
        normalize(s.title).includes(normalize(query))
    );

    if (found) {
        const dirPath = path.join(CONTENT_DIR, found.id);
        const existsInFs = fs.existsSync(dirPath);
        console.log(JSON.stringify({
            found: true,
            id: found.id,
            title: found.title,
            path: dirPath,
            inManifest: true,
            inFS: existsInFs
        }, null, 2));
    } else {
        // Check FS for "Zombie" (folder exists but no manifest entry)
        const fsSubjects = fs.readdirSync(CONTENT_DIR).filter(f => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory());
        const zombie = fsSubjects.find(s => normalize(s) === normalize(query));

        if (zombie) {
            console.log(JSON.stringify({
                found: true,
                id: zombie,
                path: path.join(CONTENT_DIR, zombie),
                inManifest: false,
                isZombie: true
            }, null, 2));
        } else {
            console.log(JSON.stringify({ found: false }, null, 2));
        }
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
    const dir = path.join(CONTENT_DIR, subjectId);
    if (!fs.existsSync(dir)) {
        console.error(`[ERROR] Subject directory not found: ${dir}`);
        process.exit(1);
    }

    // Scan for existing articles
    const articles = [];
    try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')); // Assuming content is JSON
        files.forEach(f => {
            articles.push(f.replace('.json', ''));
        });
    } catch (e) { }

    const template = `# Subject Design: ${subjectId} (Retroactive)
**Subject ID:** \`${subjectId}\`
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

    saveDesignDoc(subjectId, template);
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
