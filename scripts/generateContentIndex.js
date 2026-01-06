
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const OUTPUT_FILE = path.join(__dirname, '../src/generated/contentMap.ts');

const contentMap = {};
const duplicates = [];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const json = JSON.parse(content);

                // We map based on the 'id' field in the JSON 
                // OR the filename if no ID exists (fallback)
                const id = json.id || path.basename(file, '.json');

                if (id) {
                    if (contentMap[id]) {
                        duplicates.push({ id, path1: contentMap[id], path2: fullPath });
                    } else {
                        // Store relative path from public root
                        // e.g., content/norsk/litteraturhistorie/romantikken-sti.json
                        const relativePath = path.relative(path.join(__dirname, '../public'), fullPath).replace(/\\/g, '/');
                        contentMap[id] = relativePath;
                    }
                }
            } catch (e) {
                console.warn(`Warning: Failed to parse ${fullPath}: ${e.message}`);
            }
        }
    }
}

console.log('🔍 Scanning content directory...');
if (fs.existsSync(CONTENT_DIR)) {
    scanDirectory(CONTENT_DIR);
} else {
    console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
}

const fileContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Run 'node scripts/generateContentIndex.js' to update
 */
export const contentMap: Record<string, string> = ${JSON.stringify(contentMap, null, 4)};
`;

fs.writeFileSync(OUTPUT_FILE, fileContent);

console.log(`✅ Content map generated with ${Object.keys(contentMap).length} entries.`);
console.log(`ats wrote to: ${OUTPUT_FILE}`);

if (duplicates.length > 0) {
    console.warn('\n⚠️  Duplicate IDs found (First one wins):');
    duplicates.forEach(d => console.warn(`  ID: "${d.id}" \n    - ${d.path1} \n    - ${d.path2}`));
}
