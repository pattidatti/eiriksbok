
const fs = require('fs');
const path = require('path');

const manifestPath = path.join('public', 'content', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const basePath = path.join('public', 'content');

async function checkLinks() {
    for (const subject of manifest.subjects) {
        for (const topic of subject.topics) {

            const checkLesson = (lessonId, subTopicId) => {
                let filePath;
                if (subTopicId) {
                    filePath = path.join(basePath, subject.id, topic.id, subTopicId, `${lessonId}.json`);
                } else {
                    filePath = path.join(basePath, subject.id, topic.id, `${lessonId}.json`);
                }

                // Fallback to artikel.json if mapped file doesn't exist
                if (!fs.existsSync(filePath)) {
                    if (subTopicId) {
                        filePath = path.join(basePath, subject.id, topic.id, subTopicId, lessonId, 'artikkel.json');
                    } else {
                        filePath = path.join(basePath, subject.id, topic.id, lessonId, 'artikkel.json');
                    }
                }

                if (!fs.existsSync(filePath)) {
                    console.log(`MISSING FILE: ${filePath}`);
                    return;
                }

                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (content.quiz && content.quiz.length > 0) {
                        const fileId = content.id;
                        const generatedUrl = `/${subject.id}/${topic.id}/${fileId}`;

                        // Check if fileId matches topic ID or is weird
                        if (fileId === topic.id) {
                            console.log(`[SUSPICIOUS] Link points to topic name? URL: ${generatedUrl} (Lesson ID in manifest: ${lessonId})`);
                        }

                        // Check if fileId is different from lessonId
                        if (fileId !== lessonId) {
                            console.log(`[MISMATCH] Manifest ID: ${lessonId} vs File ID: ${fileId}. URL: ${generatedUrl}`);
                        }

                        console.log(`OK: ${generatedUrl}`);
                    }
                } catch (e) {
                    console.error(`Error reading ${filePath}: ${e.message}`);
                }
            };

            if (topic.lessons) {
                topic.lessons.forEach(l => checkLesson(l.id));
            }
            if (topic.subTopics) {
                topic.subTopics.forEach(st => {
                    st.lessons.forEach(l => checkLesson(l.id, st.id));
                });
            }
        }
    }
}

checkLinks();
