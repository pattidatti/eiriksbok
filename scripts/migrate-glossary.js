
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importing glossary terms - we need to read the file as text since it's TS
// and we are running a JS script. Or we can just read the content and regex it.
// Simpler approach: Read the file content and parse the array manually or use a temporary TS execution.
// Given constraints, reading as text and using regex/eval is risky but manageable if structure is simple.
// BETTER: Just copy paste the array here if it's small, or read the file.
// Let's read the file and extract the array object.

const GLOSSARY_PATH = path.join(__dirname, '../src/data/glossary.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/content/concepts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const content = fs.readFileSync(GLOSSARY_PATH, 'utf-8');

// Quick and dirty extraction of the array content
// Assuming format is `export const glossaryTerms: GlossaryItem[] = [ ... ];`
const match = content.match(/glossaryTerms.*=\s*(\[[\s\S]*?\]);/);

if (!match) {
    console.error("Could not find glossaryTerms array in file.");
    process.exit(1);
}

// Dangerously eval the array string (safe enough for this internal migration)
// We need to remove type assertions or comments if present.
// The file seems clean based on previous peeks, but let's be careful.
let jsonString = match[1];

// Evaluate the string to get the object
// We might need to handle property keys without quotes if they exist.
// Using Function constructor to eval
const terms = (new Function(`return ${jsonString}`))();

console.log(`Found ${terms.length} terms to migrate.`);

terms.forEach((term, index) => {
    // specific cleanup for TinaCMS compatibility
    const id = term.term.toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Check for duplicate IDs
    let finalId = id;
    let counter = 1;
    while (fs.existsSync(path.join(OUTPUT_DIR, `${finalId}.json`))) {
        finalId = `${id}-${counter}`;
        counter++;
    }

    const newData = {
        term: term.term,
        definition: term.definition,
        subject: term.subjectId,
        topic: term.topicId,
        tags: term.tags || []
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, `${finalId}.json`),
        JSON.stringify(newData, null, 4)
    );
    console.log(`Migrated: ${term.term} -> ${finalId}.json`);
});

console.log("Migration complete.");
