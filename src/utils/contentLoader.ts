import type { Lesson, Manifest } from '../types';

export async function fetchLesson(subject: string, topic: string, lessonId: string, subTopicId?: string): Promise<Lesson | null> {
    try {
        console.log(`fetchLesson called with: subject=${subject}, topic=${topic}, lessonId=${lessonId}, subTopicId=${subTopicId}`);
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        // Try standard path: content/subject/topic/lessonId.json
        let lessonPath = subTopicId
            ? `content/${subject}/${topic}/${subTopicId}/${lessonId}.json`
            : `content/${subject}/${topic}/${lessonId}.json`;

        console.log(`Attempting to fetch: ${basePath}${lessonPath}`);
        let response = await fetch(`${basePath}${lessonPath}`, { cache: 'no-store' });

        // Check if response is valid JSON (not HTML fallback)
        const isJson = response.headers.get("content-type")?.includes("application/json");

        // If not found OR not JSON (likely HTML fallback), try nested article path
        if (!response.ok || !isJson) {
            console.log(`First attempt failed (Status: ${response.status}, IsJSON: ${isJson}). Trying nested article path.`);
            lessonPath = subTopicId
                ? `content/${subject}/${topic}/${subTopicId}/${lessonId}/artikkel.json`
                : `content/${subject}/${topic}/${lessonId}/artikkel.json`;
            console.log(`Attempting to fetch: ${basePath}${lessonPath}`);
            response = await fetch(`${basePath}${lessonPath}`, { cache: 'no-store' });
        }

        if (!response.ok) {
            console.error(`Failed to fetch lesson: ${response.status} ${response.statusText} for path ${lessonPath}`);
            return null;
        }

        // Final check for JSON on the fallback response
        const finalIsJson = response.headers.get("content-type")?.includes("application/json");
        if (!finalIsJson) {
            console.error(`Failed to fetch lesson: Response was not JSON (likely HTML fallback) for path ${lessonPath}`);
            return null;
        }

        const data = await response.json();
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
        const response = await fetch(`${basePath}content/manifest.json`);
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
