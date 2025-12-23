
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stopWords } from './stopwords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const CONCEPTS_DIR = path.join(CONTENT_DIR, 'concepts');
const PEOPLE_DIR = path.join(CONTENT_DIR, 'people');
const GLOSSARY_FILE = path.join(__dirname, '../public/data/glossary.json');

// Helper to recursively find files
function findJsonFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
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
const MANIFEST_FILE = path.join(CONTENT_DIR, 'manifest.json');

// Build a map of article links from the manifest
function getArticleMap() {
    const articleMap = {};
    if (!fs.existsSync(MANIFEST_FILE)) return articleMap;

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    manifest.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
            if (topic.lessons) {
                topic.lessons.forEach(lesson => {
                    const link = `/${subject.id}/${topic.id}/${lesson.id}`;
                    const title = lesson.title.toLowerCase();
                    const id = lesson.id.toLowerCase();

                    // Priority 1: Exact matches
                    articleMap[title] = link;
                    articleMap[id] = link;

                    // Priority 2: Singular/Plural/Definite forms
                    if (title.endsWith('iet')) articleMap[title.slice(0, -3)] = link;
                    if (title.endsWith('et')) articleMap[title.slice(0, -2)] = link;
                    if (title.endsWith('en')) articleMap[title.slice(0, -2)] = link;

                    // Priority 3: Word in title
                    // Split title into words and map each word to the article if it's long enough
                    const wordsInTitle = title.split(/[\s-]+/);
                    wordsInTitle.forEach(w => {
                        const word = w.replace(/[(),]/g, '');
                        if (word.length > 4 && !articleMap[word]) {
                            articleMap[word] = link;
                        }
                    });
                });
            }
        });
    });
    return articleMap;
}

const articleMap = getArticleMap();

// Load all concepts and people
function loadGlossaryData() {
    const data = [];

    // Load concepts
    if (fs.existsSync(CONCEPTS_DIR)) {
        const conceptFiles = findJsonFiles(CONCEPTS_DIR);
        conceptFiles.forEach(file => {
            const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
            const term = content.term.toLowerCase();
            // Auto-link if a match is found in manifest
            const autoLink = articleMap[term];
            data.push({ ...content, type: 'concept', link: content.link || autoLink });
        });
    }

    // Load people
    if (fs.existsSync(PEOPLE_DIR)) {
        const peopleFiles = findJsonFiles(PEOPLE_DIR);
        peopleFiles.forEach(file => {
            const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
            const term = content.term.toLowerCase();
            const autoLink = articleMap[term];
            data.push({ ...content, type: 'person', link: content.link || autoLink });
        });
    }

    return data;
}

const glossaryData = loadGlossaryData();
const knownTerms = new Set(glossaryData.map(c => c.term.toLowerCase()));

console.log(`Loaded ${glossaryData.length} entries (${glossaryData.filter(d => d.type === 'concept').length} concepts, ${glossaryData.filter(d => d.type === 'person').length} people).`);

// Save to unified glossary.json
fs.writeFileSync(GLOSSARY_FILE, JSON.stringify(glossaryData, null, 2));
console.log(`Saved unified glossary to ${GLOSSARY_FILE}`);

const articleFiles = findJsonFiles(CONTENT_DIR);
// Filter out the concepts and people directories from being scanned AS articles
const filteredArticleFiles = articleFiles.filter(f => !f.includes('concepts/') && !f.includes('people/'));

console.log(`Scanning ${filteredArticleFiles.length} articles for suggestions...`);

const candidates = {};
const mentions = {};
const frequentTerms = {};

filteredArticleFiles.forEach(file => {
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
        const cleanText = fullText
            .replace(/[*_#\[\]()]/g, '') // Remove markdown
            .replace(/[.,:;?!"]/g, ' ')  // Remove punctuation
            .toLowerCase();

        const words = cleanText.split(/\s+/);

        words.forEach(word => {
            if (word.length < 5) return;
            if (stopWords.has(word)) return;
            if (knownTerms.has(word)) return;
            if (/^\d+$/.test(word)) return;

            if (!frequentTerms[word]) {
                frequentTerms[word] = { count: 0, sources: [] };
            }
            frequentTerms[word].count++;
            if (!frequentTerms[word].sources.includes(content.title)) {
                frequentTerms[word].sources.push(content.title);
            }
        });


        // 3. Find Mentions of Known Terms
        glossaryData.forEach(entry => {
            const regex = new RegExp(`\\b${entry.term}\\b`, 'gi');
            if (regex.test(fullText)) {
                if (!mentions[entry.term]) {
                    mentions[entry.term] = [];
                }
                if (!mentions[entry.term].includes(content.title)) {
                    mentions[entry.term].push(content.title);
                }
            }
        });

    } catch (e) {
        // Ignore errors
    }
});

console.log("\n--- POTENTIAL NEW TERMS (Bold terms) ---");
const sortedCandidates = Object.entries(candidates)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 100); // Increased limit

sortedCandidates.slice(0, 15).forEach(([term, data]) => {
    console.log(`[x] ${term} (Found ${data.count} times)`);
});

console.log("\n--- INTELLIGENT SUGGESTIONS (High Frequency Non-Bold) ---");
const sortedFrequent = Object.entries(frequentTerms)
    .sort(([, a], [, b]) => b.count - a.count)
    .filter(([term, data]) => {
        const lowerTerm = term.toLowerCase();
        // Skip common words and very short words
        if (lowerTerm.length < 3) return false;
        if (stopWords.has(lowerTerm)) return false;
        return data.count > 2;
    })
    .slice(0, 100); // Increased limit

sortedFrequent.slice(0, 20).forEach(([term, data]) => {
    console.log(`[?] ${term} (Found ${data.count} times in: ${data.sources.slice(0, 2).join(', ')}...)`);
});


console.log("\n--- MENTIONS OF EXISTING TERMS ---");
Object.entries(mentions).slice(0, 5).forEach(([term, sources]) => {
    console.log(`- ${term}: mentioned in ${sources.length} articles (${sources.slice(0, 3).join(', ')}...)`);
});

const SUGGESTIONS_FILE = path.join(__dirname, '../public/data/suggestions.json');
const suggestions = {
    boldCandidates: sortedCandidates,
    frequentTerms: sortedFrequent
};
fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
console.log(`Saved suggestions to ${SUGGESTIONS_FILE}`);

console.log("\nScan complete.");
