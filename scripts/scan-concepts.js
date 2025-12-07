
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stopWords } from './stopwords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const CONCEPTS_FILE = path.join(__dirname, '../public/data/concepts.json');

// Helper to recursively find files
function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json') && file !== 'manifest.json' && file !== 'global-timeline.json') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Load concepts
let knownConcepts = [];
if (fs.existsSync(CONCEPTS_FILE)) {
    knownConcepts = JSON.parse(fs.readFileSync(CONCEPTS_FILE, 'utf-8'));
}
const knownTerms = new Set(knownConcepts.map(c => c.term.toLowerCase()));

console.log(`Loaded ${knownConcepts.length} known concepts.`);

const articleFiles = findJsonFiles(CONTENT_DIR);
console.log(`Scanning ${articleFiles.length} articles...`);

const candidates = {};
const mentions = {};
const frequentTerms = {};

articleFiles.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (!content.content) return;

        // Extract all text
        let fullText = "";
        content.content.forEach(block => {
            if (block.type === 'text' && block.text) {
                fullText += block.text + "\n";
            } else if (block.type === 'text' && block.content) {
                fullText += block.content + "\n";
            }
        });

        // 1. Find Bold Candidates
        const boldMatches = fullText.matchAll(/\*\*(.*?)\*\*/g);
        for (const match of boldMatches) {
            const term = match[1].trim();
            const lowerTerm = term.toLowerCase();

            if (knownTerms.has(lowerTerm)) continue;
            if (term.length < 4) continue;
            if (/^\d+$/.test(term)) continue;

            if (!candidates[term]) {
                candidates[term] = { count: 0, sources: [] };
            }
            candidates[term].count++;
            if (!candidates[term].sources.includes(content.title)) {
                candidates[term].sources.push(content.title);
            }
        }

        // 2. Intelligent Frequency Analysis (Universal System)
        // Clean text: remove markdown chars, punctuation, etc.
        const cleanText = fullText
            .replace(/[*_#\[\]()]/g, '') // Remove markdown
            .replace(/[.,:;?!"]/g, ' ')  // Remove punctuation
            .toLowerCase();

        const words = cleanText.split(/\s+/);

        words.forEach(word => {
            if (word.length < 5) return; // Skip short words
            if (stopWords.has(word)) return; // Skip common words
            if (knownTerms.has(word)) return; // Skip known concepts
            if (/^\d+$/.test(word)) return; // Skip numbers

            if (!frequentTerms[word]) {
                frequentTerms[word] = { count: 0, sources: [] };
            }
            frequentTerms[word].count++;
            if (!frequentTerms[word].sources.includes(content.title)) {
                frequentTerms[word].sources.push(content.title);
            }
        });


        // 3. Find Mentions of Known Concepts
        knownConcepts.forEach(concept => {
            const regex = new RegExp(`\\b${concept.term}\\b`, 'gi');
            if (regex.test(fullText)) {
                if (!mentions[concept.term]) {
                    mentions[concept.term] = [];
                }
                if (!mentions[concept.term].includes(content.title)) {
                    mentions[concept.term].push(content.title);
                }
            }
        });

    } catch (e) {
        // Ignore errors for now
    }
});

console.log("\n--- POTENTIAL NEW CONCEPTS (Bold terms) ---");
const sortedCandidates = Object.entries(candidates)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15);

sortedCandidates.forEach(([term, data]) => {
    console.log(`[x] ${term} (Found ${data.count} times)`);
});

console.log("\n--- INTELLIGENT SUGGESTIONS (High Frequency Non-Bold) ---");
console.log("(Based on frequency analysis minus stop words)");
const sortedFrequent = Object.entries(frequentTerms)
    .sort(([, a], [, b]) => b.count - a.count)
    .filter(([term, data]) => data.count > 2) // Minimum frequency threshold
    .slice(0, 20);

sortedFrequent.forEach(([term, data]) => {
    console.log(`[?] ${term} (Found ${data.count} times in: ${data.sources.slice(0, 2).join(', ')}...)`);
});


console.log("\n--- MENTIONS OF EXISTING CONCEPTS ---");
console.log("(These articles mention concepts but might not have them linked/tagged)");
Object.entries(mentions).slice(0, 5).forEach(([term, sources]) => {
    console.log(`- ${term}: mentioned in ${sources.length} articles (${sources.slice(0, 3).join(', ')}...)`);
});

console.log("\nScan complete.");
