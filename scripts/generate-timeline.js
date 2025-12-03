
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const MANIFEST_PATH = path.join(CONTENT_DIR, 'manifest.json');
const TEXT_LIBRARY_PATH = path.join(__dirname, '../src/data/textLibraryData.ts');
const OUTPUT_PATH = path.join(CONTENT_DIR, 'global-timeline.json');

// Helper to parse year strings like "1918–1939", "1885", "550 fvt", "-500-476"
function parseYearString(yearStr) {
    if (!yearStr) return null;

    // Clean string (replace en-dash with hyphen, trim)
    let cleanStr = yearStr.toString().replace(/–/g, '-').trim();

    // Helper to parse single year part
    const parsePart = (str) => {
        const s = str.trim().toLowerCase();
        const isBC = s.includes('fvt') || s.includes('bc');
        // Extract first number found
        const match = s.match(/-?\d+/);
        if (!match) return NaN;
        let num = parseInt(match[0]);
        if (isBC) num = -Math.abs(num);
        return num;
    };

    // Check for range with specific separator (space-hyphen-space or just hyphen if clear)
    // We try to split by " - " first to avoid splitting negative numbers
    let parts = cleanStr.split(/\s+-\s+/);

    // If no space-hyphen-space, try just hyphen but be careful about negative start
    if (parts.length === 1 && cleanStr.includes('-')) {
        // If it starts with -, we need to be careful. 
        // e.g. "-500-476" -> split at index 4? 
        // Let's try a regex for range instead
        const rangeMatch = cleanStr.match(/^(-?\d+(?:\s*\D+)?)\s*-\s*(-?\d+(?:\s*\D+)?)$/);
        if (rangeMatch) {
            parts = [rangeMatch[1], rangeMatch[2]];
        }
    }

    if (parts.length === 2) {
        const start = parsePart(parts[0]);
        const end = parsePart(parts[1]);
        if (!isNaN(start)) {
            return {
                startDate: start,
                endDate: isNaN(end) ? null : end,
                displayDate: yearStr
            };
        }
    }

    // Check for single year
    const year = parsePart(cleanStr);
    if (!isNaN(year)) {
        return {
            startDate: year,
            endDate: null,
            displayDate: yearStr
        };
    }

    return null;
}

// Helper to extract text library data using regex
function extractTextLibraryData() {
    try {
        const content = fs.readFileSync(TEXT_LIBRARY_PATH, 'utf-8');
        const events = [];

        // Regex to find objects with publishedYear
        // This is a simplified parser and assumes a consistent format
        const entryRegex = /{\s*id:\s*'([^']+)',[\s\S]*?title:\s*'([^']+)',[\s\S]*?author:\s*'([^']+)',[\s\S]*?publishedYear:\s*(\d{4})/g;

        let match;
        while ((match = entryRegex.exec(content)) !== null) {
            events.push({
                id: match[1],
                title: match[2],
                description: `Utgitt av ${match[3]}`,
                startDate: parseInt(match[4]),
                endDate: null,
                displayDate: match[4],
                type: 'text',
                subjectId: 'norsk',
                link: `/norsk/bibliotek?text=${match[1]}`
            });
        }

        console.log(`Found ${events.length} text library entries.`);
        return events;
    } catch (error) {
        console.error('Error reading text library:', error);
        return [];
    }
}

// Recursive function to traverse manifest
function traverseManifest(node, subjectId = null, topicId = null, events = []) {
    // Set context
    if (node.id && ['norsk', 'samfunnskunnskap', 'historie', 'krle'].includes(node.id)) {
        subjectId = node.id;
    }

    // If it's a lesson (has id and isn't a container subject/topic)
    // We assume leaf nodes with 'tags' or 'year' are lessons, or if it's in a 'lessons' array
    if (node.id) {
        let timelineData = null;
        let subEvents = [];

        // Try to read content file for more metadata
        if (subjectId && topicId) {
            try {
                // Try subject/topic/id.json
                let filePath = path.join(CONTENT_DIR, subjectId, topicId, `${node.id}.json`);

                // If not found, try subject/topic/subtopic/id.json (if we had subtopic passed down, but we don't track it perfectly here yet)
                // For now, let's just try the direct path.

                if (fs.existsSync(filePath)) {
                    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                    // 1. Extract main timeline data
                    if (fileContent.year) {
                        timelineData = parseYearString(fileContent.year);
                    } else if (fileContent.date) {
                        const year = new Date(fileContent.date).getFullYear();
                        if (!isNaN(year)) {
                            timelineData = {
                                startDate: year,
                                endDate: null,
                                displayDate: year.toString()
                            };
                        }
                    }

                    // 2. Extract sub-events from 'timeline' array
                    if (fileContent.timeline && Array.isArray(fileContent.timeline)) {
                        fileContent.timeline.forEach((item, index) => {
                            if (item.year) {
                                const subTimelineData = parseYearString(item.year);
                                if (subTimelineData) {
                                    subEvents.push({
                                        id: `${node.id}-sub-${index}`,
                                        title: item.title || node.title,
                                        description: item.description,
                                        ...subTimelineData,
                                        type: 'sub-event',
                                        subjectId: subjectId || 'other',
                                        topicId: topicId,
                                        link: `/${subjectId}/${topicId}/${node.id}`, // Link to parent article
                                        tags: node.tags || []
                                    });
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                // Ignore missing files or parse errors
            }
        }

        // Fallback to manifest data if file didn't yield timeline data
        if (!timelineData) {
            // 1. Check explicit year field
            if (node.year) {
                timelineData = parseYearString(node.year);
            }
            // 2. Check date field (often used for historical events in this schema)
            else if (node.date) {
                const year = new Date(node.date).getFullYear();
                if (!isNaN(year)) {
                    timelineData = {
                        startDate: year,
                        endDate: null,
                        displayDate: year.toString()
                    };
                }
            }
        }

        if (timelineData) {
            // Determine link
            let link = '';
            if (subjectId && topicId) {
                link = `/${subjectId}/${topicId}/${node.id}`;
            }

            events.push({
                id: node.id,
                title: node.title,
                description: node.description,
                ...timelineData,
                type: 'lesson',
                subjectId: subjectId || 'other',
                topicId: topicId,
                link: link,
                tags: node.tags || []
            });
        }

        // Add sub-events
        if (subEvents.length > 0) {
            events.push(...subEvents);
        }
    }

    // Recurse
    if (node.subjects) node.subjects.forEach(child => traverseManifest(child, subjectId, topicId, events));
    if (node.topics) node.topics.forEach(child => traverseManifest(child, subjectId, child.id, events)); // Update topicId
    if (node.subTopics) node.subTopics.forEach(child => traverseManifest(child, subjectId, topicId, events));
    if (node.lessons) node.lessons.forEach(child => traverseManifest(child, subjectId, topicId, events));

    return events;
}

async function generate() {
    console.log('Starting timeline generation...');

    // Use a Map to deduplicate events by ID
    const eventMap = new Map();

    // Helper to add or merge event
    const addEvent = (event) => {
        if (eventMap.has(event.id)) {
            const existing = eventMap.get(event.id);
            // Merge tags if new event has them and existing doesn't (or merge arrays)
            if (event.tags && event.tags.length > 0) {
                const combinedTags = new Set([...(existing.tags || []), ...event.tags]);
                existing.tags = Array.from(combinedTags);
            }
            // Update other fields if they are missing in existing?
            // Usually the second occurrence (Lesson) has more specific data than the first (Topic)
            // So maybe we should overwrite some fields?
            if (!existing.description && event.description) existing.description = event.description;
        } else {
            eventMap.set(event.id, event);
        }
    };

    // 1. Process Manifest
    try {
        const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        const lessonEvents = traverseManifest(manifest);
        console.log(`Found ${lessonEvents.length} lesson events (before dedup).`);
        lessonEvents.forEach(addEvent);
    } catch (error) {
        console.error('Error processing manifest:', error);
    }

    // 2. Process Text Library
    const textEvents = extractTextLibraryData();
    textEvents.forEach(addEvent);

    // Convert Map to array
    const allEvents = Array.from(eventMap.values());

    // 3. Sort by start date
    allEvents.sort((a, b) => a.startDate - b.startDate);

    // 4. Write output
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allEvents, null, 2));
    console.log(`Successfully wrote ${allEvents.length} events to ${OUTPUT_PATH}`);
}

generate();
