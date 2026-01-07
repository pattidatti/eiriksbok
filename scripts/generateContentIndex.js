import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../public/content');
const outputFile = path.join(__dirname, '../src/generated/contentMap.ts');
const outputDir = path.dirname(outputFile);

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const contentMap = {};
const collisionSet = new Set();

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.json') && file !== 'manifest.json') {
            const relativePath = path.relative(path.join(__dirname, '../public'), fullPath).replace(/\\/g, '/');

            // Determine ID
            let id = '';
            if (file === 'artikkel.json') {
                const parts = relativePath.split('/');
                id = parts[parts.length - 2];
            } else {
                id = path.basename(file, '.json');
            }

            if (contentMap[id] || collisionSet.has(id)) {
                // It's a collision
                collisionSet.add(id);
                if (contentMap[id]) {
                    delete contentMap[id]; // Remove it from usable map to avoid ambiguity
                }
            } else {
                contentMap[id] = relativePath;
            }
        }
    }
}

console.log('Scanning content directory...');
scanDirectory(contentDir);

const fileContent = `// Auto-generated content index. Do not edit manually.
export const contentMap: Record<string, string> = ${JSON.stringify(contentMap, null, 4)};
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Generated content map with ${Object.keys(contentMap).length} unique entries.`);
if (collisionSet.size > 0) {
    console.log(`Excluded ${collisionSet.size} ambiguous IDs (collisions).`);
}
