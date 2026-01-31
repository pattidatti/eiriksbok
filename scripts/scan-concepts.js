
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
            if (!content.term && !content.name) return;
            const term = (content.term || content.name).toLowerCase();
            // Auto-link if a match is found in manifest
            const autoLink = articleMap[term];
            data.push({ ...content, term: content.term || content.name, type: 'concept', link: content.link || autoLink });
        });
    }

    // Load people
    if (fs.existsSync(PEOPLE_DIR)) {
        const peopleFiles = findJsonFiles(PEOPLE_DIR);
        peopleFiles.forEach(file => {
            const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
            if (!content.term && !content.name) return;
            const term = (content.term || content.name).toLowerCase();
            const autoLink = articleMap[term];
            data.push({ ...content, term: content.term || content.name, type: 'person', link: content.link || autoLink });
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

const targetArgs = process.argv.slice(2);
const searchDirs = targetArgs.length > 0
    ? targetArgs.map(arg => path.resolve(process.cwd(), arg))
    : [CONTENT_DIR];

const articleFiles = searchDirs.flatMap(dir => findJsonFiles(dir));
// Filter out the concepts and people directories from being scanned AS articles
const filteredArticleFiles = articleFiles.filter(f => !f.includes('concepts/') && !f.includes('people/'));

console.log(`Scanning ${filteredArticleFiles.length} articles for suggestions...`);

const candidates = {};
const mentions = {};
const frequentTerms = {};
const potentialPeople = {};

filteredArticleFiles.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (!content.content) return;

        // Extract all text recursively
        function extractText(obj) {
            let text = "";
            if (typeof obj === 'string') return obj + " ";
            if (Array.isArray(obj)) {
                obj.forEach(item => { text += extractText(item); });
            } else if (typeof obj === 'object' && obj !== null) {
                if (obj.text) text += extractText(obj.text);
                if (obj.content) text += extractText(obj.content);
                if (obj.items) text += extractText(obj.items);
                // Deep traversal for components
                if (obj.props) text += extractText(obj.props);
                if (obj.caption) text += extractText(obj.caption);
                if (obj.value) text += extractText(obj.value);
                if (obj.label) text += extractText(obj.label);
                if (obj.questions) text += extractText(obj.questions);
                if (obj.question) text += extractText(obj.question);
                if (obj.options) text += extractText(obj.options);
                if (obj.before) text += extractText(obj.before);
                if (obj.after) text += extractText(obj.after);
                if (obj.source) text += extractText(obj.source);
            }
            return text;
        }

        let fullText = extractText(content.content);

        // 4. Find Potential People (Title Case clusters)
        // This regex looks for Title Case words, allowing for some small connectors like 'den', 'von', 'de'
        // Updated to handle Roman numerals and optional multiple words (Lenin, Franz Ferdinand, etc.)
        const nameMatches = fullText.match(/\b[A-ZÆØÅ][a-zæøå']+\b(\s+(den|von|de|di|d'|af)\s+\b[A-ZÆØÅ][a-zæøå']+\b)?(\s+([A-ZÆØÅ][a-zæøå']+|I{1,3}|IV|VI{0,3}|IX|X))*/g);

        if (nameMatches) {
            nameMatches.forEach(name => {
                const lowerName = name.toLowerCase();
                if (name.length < 3) return;
                if (stopWords.has(lowerName)) return;
                if (knownTerms.has(lowerName)) return;

                const nameExcludes = [
                    'Norge', 'Sverige', 'Danmark', 'Tyskland', 'Europa', 'Vesten', 'Verden', 'Nord-Norge', 'Sør-Norge',
                    'Oslo', 'Bergen', 'Romerriket', 'Middelalderen', 'Historien', 'Kirken', 'Staten', 'Byen', 'Landet',
                    'Gud', 'Guds', 'Jesus', 'Allah', 'Brahman', 'Buddha', 'Kristus', 'Frankrike', 'Russland', 'Storbritannia',
                    'Østerrike', 'Ungarn', 'Italia', 'Belgia', 'Serbia', 'Balkan', 'USA', 'Amerika', 'Asia', 'Afrika',
                    'Stillehavet', 'Atlanterhavet', 'Norden', 'London', 'Paris', 'Berlin', 'Wien', 'Sarajevo', 'Moskva',
                    'Casus Belli', 'Pax Britannica', 'Ententen', 'Sentralmaktene', 'Triple Entente', 'Triple Alliance',
                    'Dette', 'Denne', 'Disse', 'Hvorfor', 'Hvordan', 'Samtidig', 'Under', 'Etter', 'Da', 'Men', 'Og'
                ];
                if (nameExcludes.includes(name)) return;

                if (!potentialPeople[name]) {
                    potentialPeople[name] = { count: 0, sources: [] };
                }
                potentialPeople[name].count++;
                if (!potentialPeople[name].sources.includes(content.title)) {
                    potentialPeople[name].sources.push(content.title);
                }
            });
        }

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

console.log("\n--- POTENTIAL PEOPLE (Title Case Clusters) ---");
const sortedPeople = Object.entries(potentialPeople)
    .sort(([, a], [, b]) => b.count - a.count)
    .filter(([name, data]) => {
        //Heuristic: names often consist of 1-3 words
        const wordCount = name.split(/\s+/).length;
        return wordCount >= 1 && wordCount <= 3 && data.count >= 1;
    })
    .slice(0, 100);

sortedPeople.slice(0, 20).forEach(([name, data]) => {
    console.log(`[👤] ${name} (Found ${data.count} times)`);
});

const SUGGESTIONS_FILE = path.join(__dirname, '../public/data/suggestions.json');
const suggestions = {
    boldCandidates: sortedCandidates,
    frequentTerms: sortedFrequent,
    potentialPeople: sortedPeople
};
fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
console.log(`Saved suggestions to ${SUGGESTIONS_FILE}`);

console.log("\nScan complete.");
