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
            if (file === 'artikkel.json') {
                id = parts[parts.length - 2].toLowerCase();
            } else {
                id = path.basename(file, '.json').toLowerCase();
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
