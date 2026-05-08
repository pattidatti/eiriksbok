import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.join(__dirname, '../public/content/manifest.json');
const CONTENT_INDEX_PATH = path.join(__dirname, '../public/content/content-index.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

function getGitDates(filePath) {
    try {
        // Get all commit dates for this file in ISO format
        const dates = execSync(`git log --follow --format=%aI -- "${filePath}"`, { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(d => d);

        if (dates.length > 0) {
            return {
                created: dates[dates.length - 1],
                updated: dates[0]
            };
        }
    } catch (e) {
        // Not in git or git failed
    }
    return null;
}

function getFileSystemDates(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            created: stats.birthtime.toISOString(),
            updated: stats.mtime.toISOString()
        };
    } catch (e) {
        return null;
    }
}

async function syncDates() {
    if (!fs.existsSync(MANIFEST_PATH) || !fs.existsSync(CONTENT_INDEX_PATH)) {
        console.error('Missing manifest.json or content-index.json. Run generateContentIndex.js first.');
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const contentIndex = JSON.parse(fs.readFileSync(CONTENT_INDEX_PATH, 'utf8'));
    let changed = false;

    // Helper to find file path by ID
    function getFilePath(id) {
        // Try exact match in contentMap
        const paths = contentIndex.contentMap[id];
        if (paths && paths.length > 0) {
            // If multiple, we might have a collision, but let's take the first one for now
            // In a better system, we'd use hierarchical keys
            return path.join(PUBLIC_DIR, paths[0]);
        }
        return null;
    }

    function processLesson(lesson) {
        if (!lesson.id) return;

        const filePath = getFilePath(lesson.id);
        if (!filePath) return;

        const gitDates = getGitDates(filePath);
        const fsDates = getFileSystemDates(filePath);

        const dates = gitDates || fsDates;
        if (!dates) return;

        // Set createdDate if missing, or if it's still the bulk-migration placeholder from Dec 2025
        const MIGRATION_PLACEHOLDER = '2023-01-01T12:00:00Z';
        const isPlaceholder = lesson.createdDate === MIGRATION_PLACEHOLDER;
        if ((!lesson.createdDate || isPlaceholder) && dates.created) {
            lesson.createdDate = dates.created;
            changed = true;
        }

        if (!lesson.lastUpdated || (dates.updated && lesson.lastUpdated !== dates.updated)) {
            lesson.lastUpdated = dates.updated;
            changed = true;
        }
    }

    // Traverse manifest
    manifest.subjects?.forEach(subject => {
        subject.topics?.forEach(topic => {
            topic.lessons?.forEach(processLesson);
            topic.tools?.forEach(processLesson);
            topic.subTopics?.forEach(subTopic => {
                subTopic.lessons?.forEach(processLesson);
                subTopic.tools?.forEach(processLesson);
            });
        });
    });

    if (changed) {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        console.log('[SUCCESS] updated manifest.json with synchronized dates.');
    } else {
        console.log('[INFO] No date updates needed in manifest.json.');
    }
}

syncDates().catch(console.error);
