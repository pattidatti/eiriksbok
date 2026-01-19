const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../public/content');
const OUTPUT_FILE = path.join(__dirname, '../src/data/learningPaths.json');

// Map subject IDs to display names and colors for enrichment
const SUBJECTS = {
    'historie': { name: 'Historie', color: 'amber' },
    'norsk': { name: 'Norsk', color: 'red' },
    'krle': { name: 'KRLE', color: 'violet' },
    'samfunnskunnskap': { name: 'Samfunnskunnskap', color: 'blue' },
    'musikk': { name: 'Musikk', color: 'pink' },
    'naturfag': { name: 'Naturfag', color: 'green' },
    'annet': { name: 'Annet', color: 'gray' }
};

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

function scanLearningPaths() {
    console.log('🔍 Scanning for learning paths...');

    const allFiles = getAllFiles(CONTENT_DIR);
    const learningPaths = [];

    allFiles.forEach(file => {
        if (file.endsWith('-sti.json')) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const data = JSON.parse(content);

                // Validation logic
                if (!data.id || !data.title) {
                    console.warn(`⚠️ Skipping invalid file: ${file} (Missing id or title)`);
                    return;
                }

                // Determine Subject ID
                // Prefer explicit targetSubjectId, fallback to inferring from path, fallback to 'annet'
                let subjectId = data.targetSubjectId || data.learningPathData?.targetSubjectId;

                if (!subjectId) {
                    // Try to infer from path: .../content/historie/...
                    const parts = file.split(path.sep);
                    const contentIndex = parts.indexOf('content');
                    if (contentIndex !== -1 && parts[contentIndex + 1]) {
                        const potentialSubject = parts[contentIndex + 1].toLowerCase();
                        if (SUBJECTS[potentialSubject]) {
                            subjectId = potentialSubject;
                        }
                    }
                }

                subjectId = subjectId || 'annet';

                // Extract Metadata
                const metadata = {
                    id: data.id,
                    title: data.title,
                    description: data.description || data.learningPathData?.description || "",
                    subjectId: subjectId,
                    subjectName: SUBJECTS[subjectId]?.name || subjectId,
                    topicId: data.targetTopicId || data.learningPathData?.targetTopicId || "generelt",
                    year: data.year,
                    readTime: data.readTime,
                    path: `/sub/${subjectId}/topic/${data.targetTopicId}/sti/${data.id}`, // Constructing link path, might need adjustment based on routing
                    // Simplified: We usually link to topics, but for learning paths do we have a direct viewer?
                    // Assuming standard route: /fag/emne/sti/id or similiar.
                    // Actually, existing paths are accessed via their topic pages usually. 
                    // Let's store the raw IDs so the component can build the link.
                    fileRelativePath: path.relative(CONTENT_DIR, file)
                };

                learningPaths.push(metadata);
                console.log(`✅ Found: ${metadata.title} (${metadata.subjectName})`);

            } catch (err) {
                console.error(`❌ Error parsing ${file}:`, err.message);
            }
        }
    });

    // Sort by Subject then by Title
    learningPaths.sort((a, b) => {
        if (a.subjectId !== b.subjectId) return a.subjectId.localeCompare(b.subjectId);
        return a.title.localeCompare(b.title);
    });

    const outputData = {
        updatedAt: new Date().toISOString(),
        count: learningPaths.length,
        paths: learningPaths
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\n🎉 Successfully wrote ${learningPaths.length} learning paths to ${OUTPUT_FILE}`);
}

scanLearningPaths();
