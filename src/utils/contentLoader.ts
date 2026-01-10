import type { Lesson, Manifest, Philosopher, ManifestLesson, ManifestTopic, ManifestSubTopic, ManifestSubject, TopicTool } from '../types';
// @ts-ignore
import { contentMap } from '../generated/contentMap';

// --- Global Cache for Manifest ---
let globalManifestPromise: Promise<Manifest | null> | null = null;
let cachedManifest: Manifest | null = null;

export function getCachedManifest(): Manifest | null {
    return cachedManifest;
}

export async function fetchManifest(): Promise<Manifest | null> {
    if (globalManifestPromise) return globalManifestPromise;

    const basePath = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;

    globalManifestPromise = fetch(`${basePath}content/manifest.json`, { cache: 'default' })
        .then(async (response) => {
            if (!response.ok) {
                console.error("Failed to fetch manifest:", response.statusText);
                return null;
            }
            const data = await response.json() as Manifest;
            cachedManifest = data;
            return data;
        })
        .catch((error) => {
            console.error("Error loading manifest:", error);
            return null;
        });

    return globalManifestPromise;
}


export async function fetchLesson(subject: string, topic: string, lessonId: string, subTopicId?: string): Promise<Lesson | null> {
    const basePath = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;

    console.log(`[OptimisticLoader] fetchLesson called for: ${lessonId}`);

    // --- 1. Deterministic Lookup (The "Content Index" Strategy) ---
    // If we KNOW where the file is from the build-time map, use it.
    // This solves "Kald Krig Sti" and other edge cases.
    if (contentMap && contentMap[lessonId]) {
        const indexedPath = contentMap[lessonId];
        console.log(`[OptimisticLoader] Deterministic match found: ${indexedPath}`);
        try {
            const r = await fetch(`${basePath}${indexedPath}`, { cache: 'no-cache' }); // Force freshness
            if (r.ok) {
                const data = await r.json();

                // Enrich with manifest if available (lazy)
                // We fire manifest fetch but don't block UNLESS we need it? 
                // Actually, let's keep the existing flow but use the data we just got.
                // We still want to enrich it.
                fetchManifest().then(() => {
                    // We can't really "return" validation data later easily without state.
                    // But strictly speaking, the lesson loads NOW.
                    // The existing logic below can handle enrichment if we structure this right.
                });

                // Standard processing
                if (data.learningPathData && data.learningPathData.learningPathData) {
                    data.learningPathData = data.learningPathData.learningPathData;
                }

                // We restart the manifest fetch to ensure it's cached for sidebar
                const manifest = await fetchManifest();
                if (manifest) {
                    // Quick finder logic duplicated for now or refactored? 
                    // Let's reuse the finder logic below if we want to be clean, 
                    // OR just return the data raw if speed is key. 
                    // Let's copy the enrichment logic here for robustness.
                    // Logic to find lesson node in manifest for metadata stuff
                    const findLesson = (nodes: any[]): any => {
                        for (const node of nodes) {
                            if (node.id === lessonId) return node;
                            if (node.lessons) { const f = findLesson(node.lessons); if (f) return f; }
                            if (node.topics) { const f = findLesson(node.topics); if (f) return f; }
                            if (node.subTopics) { const f = findLesson(node.subTopics); if (f) return f; }
                            if (node.tools) { const f = findLesson(node.tools); if (f) return f; }
                            if (node.subjects) { const f = findLesson(node.subjects); if (f) return f; }
                        }
                        return null;
                    };
                    const manifestLesson = findLesson(manifest.subjects);

                    if (manifestLesson) {
                        if (manifestLesson.definitions) {
                            const newConcepts = manifestLesson.definitions.map((def: any, index: number) => ({
                                id: `concept-${index}`, term: def.term, definition: def.definition
                            }));
                            data.concepts = [...(data.concepts || []), ...newConcepts];
                        }
                        if (manifestLesson.layout) data.layout = manifestLesson.layout;
                        if (manifestLesson.year) data.year = manifestLesson.year;
                        if (manifestLesson.tags) data.tags = [...new Set([...(data.tags || []), ...(manifestLesson.tags || [])])];
                        if (!data.title && manifestLesson.title) data.title = manifestLesson.title;
                        if (!data.description && manifestLesson.description) data.description = manifestLesson.description;
                    }
                }
                return data as Lesson;
            }
        } catch (e) {
            console.warn("[OptimisticLoader] Deterministic fetch failed, falling back to guessing.", e);
        }
    }


    // --- 2. Construct Optimistic Paths (Fallback/Original Logic) ---
    // We guess where the file is likely to be to start fetching IMMEDIATELY.
    const pathsToTry: string[] = [];

    // Prioritize standard paths
    if (subTopicId) {
        pathsToTry.push(`content/${subject}/${topic}/${subTopicId}/${lessonId}.json`);
        pathsToTry.push(`content/${subject}/${topic}/${subTopicId}/${lessonId}/artikkel.json`);
        // Special case: learning paths in subfolders
        if (lessonId.includes('-sti')) {
            pathsToTry.push(`content/${subject}/${topic}/${subTopicId}/${lessonId}.json`);
        }
    } else {
        pathsToTry.push(`content/${subject}/${topic}/${lessonId}.json`);
        pathsToTry.push(`content/${subject}/${topic}/${lessonId}/artikkel.json`);
        // Special case: learning paths in topic folders
        if (lessonId.includes('-sti')) {
            pathsToTry.push(`content/${subject}/${topic}/${lessonId}.json`);
        }
    }

    // --- 3. Parallel Execution ---
    // Start fetching the content from the guessed paths AND the manifest simultaneously.

    // Helper to try all paths in sequence (but started immediately in parallel with manifest)
    const contentFetchPromise = (async () => {
        for (const p of pathsToTry) {
            try {
                // Using 'no-cache' for development, but in prod this should be default or handled better
                const r = await fetch(`${basePath}${p}`);
                const isJson = r.headers.get("content-type")?.includes("application/json");
                if (r.ok && isJson) {
                    console.log(`[OptimisticLoader] Cache Hit/Success for path: ${p}`);
                    return { response: r, usedPath: p };
                }
            } catch (e) { /* ignore */ }
        }
        return null;
    })();

    // Ensure manifest is loading (idempotent due to singleton)
    const manifestFetchPromise = fetchManifest();

    // --- 4. Await Results & Fallback ---

    // We wait for the content. If we find it, GREAT! We render immediately.
    // If we don't find it, ONLY THEN do we wait for the manifest to look up the "official" path.
    let contentResult = await contentFetchPromise;

    let manifestLesson: ManifestLesson | ManifestTopic | ManifestSubTopic | ManifestSubject | TopicTool | null = null;
    const manifest = await manifestFetchPromise; // Blocking only if we need metadata merging or fallback

    // Logic to find lesson node in manifest for metadata stuff
    if (manifest) {
        const findLesson = (nodes: (ManifestSubject | ManifestTopic | ManifestSubTopic | ManifestLesson | TopicTool)[]): ManifestLesson | ManifestTopic | ManifestSubTopic | ManifestSubject | TopicTool | null => {
            for (const node of nodes) {
                if (node.id === lessonId) return node;
                if ('lessons' in node && node.lessons) {
                    const found = findLesson(node.lessons);
                    if (found) return found;
                }
                if ('topics' in node && node.topics) {
                    const found = findLesson(node.topics);
                    if (found) return found;
                }
                if ('subTopics' in node && node.subTopics) {
                    const found = findLesson(node.subTopics);
                    if (found) return found;
                }
                if ('tools' in node && node.tools) {
                    const found = findLesson(node.tools);
                    if (found) return found;
                }
                if ('subjects' in node && node.subjects) {
                    const found = findLesson(node.subjects as any);
                    if (found) return found;
                }
            }
            return null;
        };
        manifestLesson = findLesson(manifest.subjects);
    }


    // --- 5. Deep Fallback via Manifest (if optimistic paths failed) ---
    if (!contentResult && manifestLesson) {
        // If we found the node in the manifest, maybe it has a custom 'link' or special structure we missed?
        // This is the "Safety Net"
        console.warn(`[OptimisticLoader] Optimistic paths failed. Checking manifest for custom link/structure.`);

        // Assuming if it's a tool/link we might fetch that? Or if it's just a misnamed file?
        // For now, we return null if optimistic paths failed, as our file structure is standard.
        // BUT, we can try one last desperate thing: if the node has a 'link' property that ends in .json
        if ('link' in manifestLesson && (manifestLesson as any).link && (manifestLesson as any).link.endsWith('.json')) {
            const customLink = (manifestLesson as any).link;
            try {
                const r = await fetch(customLink.startsWith('http') ? customLink : `${basePath}${customLink}`);
                if (r.ok) {
                    contentResult = { response: r, usedPath: customLink };
                }
            } catch (e) { console.error("Fallback fetch failed", e) }
        }
    }


    if (!contentResult) {
        console.error(`[OptimisticLoader] Failed to load lesson ${lessonId} after trying paths:`, pathsToTry);
        return null;
    }

    // --- 6. Process Data ---
    const data = await contentResult.response.json();

    // Fix double-nesting if it exists (some older or generated content might have this)
    if (data.learningPathData &&
        typeof data.learningPathData === 'object' &&
        'learningPathData' in data.learningPathData &&
        data.learningPathData.learningPathData) {
        data.learningPathData = data.learningPathData.learningPathData;
    }

    // --- 7. Merge Metadata from Manifest (enrichment) ---
    // Even if content loaded fast, we want to stamp it with official tags/years if available.
    if (manifestLesson) {
        const typedLesson = manifestLesson as any;
        if (typedLesson.definitions) {
            const newConcepts = typedLesson.definitions.map((def: { term: string, definition: string }, index: number) => ({
                id: `concept-${index}`,
                term: def.term,
                definition: def.definition
            }));
            data.concepts = [...(data.concepts || []), ...newConcepts];
        }
        if (typedLesson.layout) data.layout = typedLesson.layout;
        if (typedLesson.year) data.year = typedLesson.year;
        if (typedLesson.tags) {
            data.tags = [...new Set([...(data.tags || []), ...(typedLesson.tags || [])])];
        }
        if (!data.title && typedLesson.title) data.title = typedLesson.title;
        if (!data.description && typedLesson.description) data.description = typedLesson.description;
    }

    return data as Lesson;
}

export async function fetchReligion(id: string): Promise<any | null> {
    try {
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        // Handle ID with or without .json extension, and strip path if present
        // This handles "kristendom", "kristendom.json", and "data/religion/kristendom.json"
        const cleanId = id.replace(/\.json$/, '').split('/').pop();
        const response = await fetch(`${basePath}data/religion/${cleanId}.json`, { cache: 'no-cache' });
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
        const response = await fetch(`${basePath}data/philosophy/${cleanId}.json`, { cache: 'no-cache' });
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
