import type { Lesson, Manifest, Philosopher } from '../types';

export async function fetchLesson(subject: string, topic: string, lessonId: string, subTopicId?: string): Promise<Lesson | null> {
    try {
        console.log(`fetchLesson called with: subject=${subject}, topic=${topic}, lessonId=${lessonId}, subTopicId=${subTopicId}`);
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        // 1. First, fetch manifest to check if this lesson has a specific path override
        // or to resolve its location in the hierarchy
        let manifestLesson: any = null;
        try {
            const manifestResponse = await fetch(`${basePath}content/manifest.json`);
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json() as Manifest;
                const findLesson = (nodes: any[]): any => {
                    for (const node of nodes) {
                        if (node.id === lessonId) return node;
                        if (node.lessons) {
                            const found = findLesson(node.lessons);
                            if (found) return found;
                        }
                        if (node.topics) {
                            const found = findLesson(node.topics);
                            if (found) return found;
                        }
                        if (node.subTopics) {
                            const found = findLesson(node.subTopics);
                            if (found) return found;
                        }
                        if (node.tools) {
                            const found = findLesson(node.tools);
                            if (found) return found;
                        }
                        if (node.subjects) {
                            const found = findLesson(node.subjects);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                manifestLesson = findLesson(manifest.subjects);
            }
        } catch (e) {
            console.warn("Failed to fetch/parse manifest pre-lookup:", e);
        }

        // 2. Determine path(s) to try
        let pathsToTry: string[] = [];

        // If manifest says it links primarily to a JSON file (standard behavior for us)
        // we construct the standard path.
        const standardPath = subTopicId
            ? `content/${subject}/${topic}/${subTopicId}/${lessonId}.json`
            : `content/${subject}/${topic}/${lessonId}.json`;

        pathsToTry.push(standardPath);

        // Fallback: nested article structure
        const articlePath = subTopicId
            ? `content/${subject}/${topic}/${subTopicId}/${lessonId}/artikkel.json`
            : `content/${subject}/${topic}/${lessonId}/artikkel.json`;
        pathsToTry.push(articlePath);

        // Special case: "Tools" or learning paths might be at the topic level even called from deeper?
        // Or if the folder structure is simpler.
        // For learning paths, they are often directly in the topic folder.
        if (lessonId.includes('-sti')) {
            pathsToTry.push(`content/${subject}/${topic}/${lessonId}.json`);
        }

        console.log(`Attempting fetch paths in order:`, pathsToTry);

        let response: Response | null = null;
        let usedPath = "";

        for (const p of pathsToTry) {
            try {
                const r = await fetch(`${basePath}${p}`, { cache: 'no-store' });
                const isJson = r.headers.get("content-type")?.includes("application/json");
                if (r.ok && isJson) {
                    response = r;
                    usedPath = p;
                    break;
                }
            } catch (e) { /* ignore and try next */ }
        }

        if (!response) {
            console.error(`Failed to fetch lesson ${lessonId} after trying paths:`, pathsToTry);
            return null;
        }

        const data = await response.json();

        // 3. Robust Data Unwrapping
        // Fix for the double-nesting issue: if data.learningPathData has a nested .learningPathData, unwrap it.
        // Or if data itself is the wrapper but contains learningPathData.
        if (data.learningPathData && data.learningPathData.learningPathData) {
            console.log("Detected double-nested learningPathData, unwrapping...");
            data.learningPathData = data.learningPathData.learningPathData;
        }

        // 4. Merge Manifest Data (Definitions, Layout, Tags)
        if (manifestLesson) {
            if (manifestLesson.definitions) {
                const newConcepts = manifestLesson.definitions.map((def: any, index: number) => ({
                    id: `concept-${index}`,
                    term: def.term,
                    definition: def.definition
                }));
                data.concepts = [...(data.concepts || []), ...newConcepts];
            }
            if (manifestLesson.layout) data.layout = manifestLesson.layout;
            if (manifestLesson.year) data.year = manifestLesson.year;
            if (manifestLesson.tags) {
                data.tags = [...new Set([...(data.tags || []), ...(manifestLesson.tags || [])])];
            }
            // Ensure title/desc fallback from manifest if missing in file
            if (!data.title && manifestLesson.title) data.title = manifestLesson.title;
            if (!data.description && manifestLesson.description) data.description = manifestLesson.description;
        }

        console.log(`Successfully loaded lesson ${lessonId} from ${usedPath}`);
        return data as Lesson;
    } catch (error) {
        console.error("Error loading lesson:", error);
        return null;
    }
}

export async function fetchManifest(): Promise<Manifest | null> {
    try {
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;
        const response = await fetch(`${basePath}content/manifest.json`, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.json() as Manifest;
    } catch (error) {
        console.error("Error loading manifest:", error);
        return null;
    }
}

export async function fetchReligion(id: string): Promise<any | null> {
    try {
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        // Handle ID with or without .json extension, and strip path if present
        // This handles "kristendom", "kristendom.json", and "data/religion/kristendom.json"
        const cleanId = id.replace(/\.json$/, '').split('/').pop();
        const response = await fetch(`${basePath}data/religion/${cleanId}.json`);
        if (!response.ok) {
            console.error(`Failed to fetch religion: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading religion:", error);
        return null;
    }
}

export async function fetchPhilosopher(id: string): Promise<Philosopher | null> {
    try {
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        const cleanId = id.replace(/\.json$/, '').split('/').pop();
        const response = await fetch(`${basePath}data/philosophy/${cleanId}.json`);
        if (!response.ok) {
            console.error(`Failed to fetch philosopher: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data as Philosopher;
    } catch (error) {
        console.error("Error loading philosopher:", error);
        return null;
    }
}
