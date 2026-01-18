import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../public/content');
const outputFile = path.join(__dirname, '../public/content/content-index.json');
const outputDir = path.dirname(outputFile);

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const contentMap = {};
const hierarchicalMap = {}; // New: subject/topic/lessonId -> path
const collisionMap = {}; // New: id -> [paths]

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.json') && file !== 'manifest.json' && file !== 'content-index.json') {
            const relativePath = path.relative(path.join(__dirname, '../public'), fullPath)
                .replace(/\\/g, '/')
                .toLowerCase(); // Force lowercase for file path
            const parts = relativePath.split('/');

            // Determine ID
            let id = '';

            // Files that are too generic and MUST include parent context
            // e.g. "oversikt.json" inside "ww2" -> "ww2-oversikt"
            const genericBlocklist = [
                'oversikt', 'intro', 'bakgrunn', 'konsekvenser', 'teknologi',
                'kultur', 'opptakt', 'krigens-lop', 'frelse', 'bønn', 'bonn',
                'grunnleggere', 'gudsbilde', 'hellige-tekster', 'overgangsriter',
                'sentrale-trekk', 'artikkel', 'skapelse', 'berlinmuren', 'svartedauden',
                'arbeidsspesialisering', 'urbanisering'
            ];

            const filenameNoExt = path.basename(file, '.json').toLowerCase();
            const parentFolder = parts[parts.length - 2].toLowerCase();
            const grandparentFolder = parts.length > 3 ? parts[parts.length - 3].toLowerCase() : null;

            const isQuest = parts.includes('quests');
            const isDetective = parts.includes('detective');

            // Strategy 1: "Artikkel" Pattern (Religions)
            // content/religion/bahai/bonn/artikkel.json -> "bahai-bonn"
            if (file === 'artikkel.json') {
                id = parentFolder;
            }
            // Strategy 2: Quests & Detective Game Content
            else if (isQuest) {
                id = `quest-${filenameNoExt}`;
            }
            else if (isDetective) {
                id = `detective-${filenameNoExt}`;
            }
            // Strategy 3: Generic Filenames 
            // content/history/ww2/oversikt.json -> "ww2-oversikt"
            else if (genericBlocklist.includes(filenameNoExt)) {
                id = filenameNoExt;
            }
            // Strategy 4: Standard
            else {
                id = filenameNoExt;
            }

            // 1. Add to Collision-Aware Flat Map
            if (!collisionMap[id]) {
                collisionMap[id] = [];
            }
            collisionMap[id].push(relativePath);

            // 2. Build Hierarchical Key
            // We want to support: 
            // - subject/topic/lesson
            // - subject/topic/subtopic/lesson
            let subject = parts[1]; // content/[subject]/...
            let topic = parts[2];
            let subtopic = parts.length > 4 ? parts[3] : null;

            const hierarchyKey = subtopic
                ? `${subject}/${topic}/${subtopic}/${id}`.toLowerCase()
                : `${subject}/${topic}/${id}`.toLowerCase();

            hierarchicalMap[hierarchyKey] = relativePath;
        }
    }
}

console.log('Scanning content directory...');
scanDirectory(contentDir);

const outputData = {
    buildId: Date.now(),
    contentMap: collisionMap,
    hierarchicalMap: hierarchicalMap
};

const fileContent = JSON.stringify(outputData, null, 2);

fs.writeFileSync(outputFile, fileContent);
console.log(`Generated content map with ${Object.keys(collisionMap).length} IDs.`);
const collisionCount = Object.values(collisionMap).filter(v => v.length > 1).length;
if (collisionCount > 0) {
    console.log(`Detected ${collisionCount} ID collisions (stored as arrays).`);
}
