import type { Lesson, Manifest, Philosopher } from '../types';
// @ts-ignore
// import { contentMap, hierarchicalContentMap } from '../generated/contentMap'; // REMOVED

// --- Registry Types ---
interface ContentIndex {
    buildId: number;
    contentMap: Record<string, string | string[]>;
    hierarchicalMap: Record<string, string>;
}

// --- Global Cache ---
let globalManifestPromise: Promise<Manifest | null> | null = null;
let cachedManifest: Manifest | null = null;
let globalRegistryPromise: Promise<ContentIndex | null> | null = null;
let cachedRegistry: ContentIndex | null = null;

export function getCachedManifest(): Manifest | null {
    return cachedManifest;
}

export function getCachedRegistry(): ContentIndex | null {
    return cachedRegistry;
}

const getBasePath = () => {
    return import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
};

/**
 * Loads the authoritative content index.
 */
export async function fetchRegistry(): Promise<ContentIndex | null> {
    if (globalRegistryPromise) return globalRegistryPromise;

    const basePath = getBasePath();
    console.log(`[ContentRegistry] Fetching registry from: ${basePath}content/content-index.json`);

    globalRegistryPromise = fetch(`${basePath}content/content-index.json`, { cache: 'no-cache' })
        .then(async (response) => {
            if (!response.ok) {
                console.error("[ContentRegistry] Failed to fetch registry:", response.statusText);
                return null;
            }
            const data = await response.json() as ContentIndex;
            cachedRegistry = data;
            console.log(`[ContentRegistry] Loaded index with ${Object.keys(data.contentMap).length} entries (Build: ${data.buildId})`);
            return data;
        })
        .catch((error) => {
            console.error("[ContentRegistry] Error loading registry:", error);
            return null;
        });

    return globalRegistryPromise;
}

export async function fetchManifest(): Promise<Manifest | null> {
    if (globalManifestPromise) return globalManifestPromise;

    const basePath = getBasePath();

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

/**
 * Authority-based content loader.
 * Eliminates "guessing" in favor of deterministic resolution.
 */
export async function fetchLesson(subject: string, topic: string, lessonId: string, subTopicId?: string): Promise<Lesson | null> {
    const basePath = getBasePath();
    const normalizedId = lessonId.toLowerCase();

    console.log(`[ContentLoader] Resolving: ${normalizedId} (Context: ${subject}/${topic})`);

    // 1. Ensure Registry is loaded
    const registry = await fetchRegistry();
    if (!registry) {
        console.error(`[ContentLoader] Registry unavailable. Cannot resolve ${lessonId}`);
        return null;
    }

    // 2. Deterministic Lookup
    let resolvedPath: string | null = null;

    // 2A. Hierarchical Match (Context-aware, case-insensitive via index normalization)
    const contextKey = subTopicId
        ? `${subject}/${topic}/${subTopicId}/${normalizedId}`.toLowerCase()
        : `${subject}/${topic}/${normalizedId}`.toLowerCase();

    if (registry.hierarchicalMap[contextKey]) {
        resolvedPath = registry.hierarchicalMap[contextKey];
        console.log(`[ContentLoader] Hierarchical hit: ${resolvedPath}`);
    }
    // 2B. Flat Lookup (Collision-aware)
    else if (registry.contentMap[normalizedId]) {
        const entry = registry.contentMap[normalizedId];
        if (Array.isArray(entry)) {
            // Find best fit based on subject/topic context
            resolvedPath = entry.find(p => p.includes(`/${subject.toLowerCase()}/`) && p.includes(`/${topic.toLowerCase()}/`)) || entry[0];
            console.log(`[ContentLoader] Flat hit (collision resolved): ${resolvedPath}`);
        } else {
            resolvedPath = entry;
            console.log(`[ContentLoader] Flat hit: ${resolvedPath}`);
        }
    }

    // 3. Execution
    if (resolvedPath) {
        try {
            const r = await fetch(`${basePath}${resolvedPath}`, { cache: 'no-cache' });
            if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);

            const data = await r.json();

            // Processing: Fix double-nesting if present
            if (data.learningPathData && data.learningPathData.learningPathData) {
                data.learningPathData = data.learningPathData.learningPathData;
            }

            // Enrich metadata from manifest
            const manifest = await fetchManifest();
            if (manifest) {
                const node = findNodeInManifest(manifest.subjects, lessonId);
                if (node) enrichLessonWithMetadata(data, node);
            }

            return data as Lesson;
        } catch (e) {
            console.error(`[ContentLoader] Failed to load resolved path: ${resolvedPath}`, e);
        }
    }

    // 4. Emergency Safety Net (Manifest-based link)
    console.warn(`[ContentLoader] Path resolution failed for ${lessonId}. Trying manifest fallback.`);
    const manifest = await fetchManifest();
    if (manifest) {
        const node = findNodeInManifest(manifest.subjects, lessonId);
        if (node && 'link' in node && typeof node.link === 'string' && node.link.endsWith('.json')) {
            try {
                const link = node.link.startsWith('http') ? node.link : `${basePath}${node.link.startsWith('/') ? node.link.slice(1) : node.link}`;
                const r = await fetch(link);
                if (r.ok) {
                    const data = await r.json();
                    enrichLessonWithMetadata(data, node);
                    return data as Lesson;
                }
            } catch (e) { /* ignore */ }
        }
    }

    console.error(`[ContentLoader] Critical Failure: Could not find content for ${lessonId}`);
    return null;
}

// --- Helpers ---

function findNodeInManifest(nodes: any[], id: string): any | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const children = node.lessons || node.topics || node.subTopics || node.tools || node.subjects;
        if (children) {
            const found = findNodeInManifest(children, id);
            if (found) return found;
        }
    }
    return null;
}

function enrichLessonWithMetadata(data: any, manifestNode: any) {
    if (manifestNode.definitions) {
        const newConcepts = manifestNode.definitions.map((def: any, index: number) => ({
            id: `concept-${index}`, term: def.term, definition: def.definition
        }));
        data.concepts = [...(data.concepts || []), ...newConcepts];
    }
    if (manifestNode.layout) data.layout = manifestNode.layout;
    if (manifestNode.year) data.year = manifestNode.year;
    if (manifestNode.tags) {
        data.tags = [...new Set([...(data.tags || []), ...(manifestNode.tags || [])])];
    }
    if (!data.title && manifestNode.title) data.title = manifestNode.title;
    if (!data.description && manifestNode.description) data.description = manifestNode.description;
}

// --- Specialized Loaders (Maintain compatibility but use registry eventually if needed) ---

export async function fetchReligion(id: string): Promise<any | null> {
    try {
        const basePath = getBasePath();
        const cleanId = id.replace(/\.json$/, '').split('/').pop();
        const response = await fetch(`${basePath}data/religion/${cleanId}.json`, { cache: 'no-cache' });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error loading religion:", error);
        return null;
    }
}

export async function fetchPhilosopher(id: string): Promise<Philosopher | null> {
    try {
        const basePath = getBasePath();
        const cleanId = id.replace(/\.json$/, '').split('/').pop();
        const response = await fetch(`${basePath}data/philosophy/${cleanId}.json`, { cache: 'no-cache' });
        if (!response.ok) return null;
        return await response.json() as Philosopher;
    } catch (error) {
        console.error("Error loading philosopher:", error);
        return null;
    }
}
