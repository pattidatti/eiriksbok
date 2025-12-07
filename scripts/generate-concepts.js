
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONCEPTS_DIR = path.join(__dirname, '../public/content/concepts');
const OUTPUT_FILE = path.join(__dirname, '../public/data/concepts.json');
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Scanning for concepts in ${CONCEPTS_DIR}...`);

if (!fs.existsSync(CONCEPTS_DIR)) {
    console.log("No concepts directory found. Creating empty concepts file.");
    fs.writeFileSync(OUTPUT_FILE, "[]");
    process.exit(0);
}

const files = fs.readdirSync(CONCEPTS_DIR).filter(file => file.endsWith('.json'));
const concepts = [];

files.forEach(file => {
    try {
        const filePath = path.join(CONCEPTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Add ID based on filename
        const id = path.basename(file, '.json');

        concepts.push({
            id,
            ...data
        });
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});

console.log(`Found ${concepts.length} concepts.`);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(concepts, null, 2));
console.log(`Wrote aggregated concepts to ${OUTPUT_FILE}`);
