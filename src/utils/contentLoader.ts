import type { Lesson, Manifest } from '../types';

export async function fetchLesson(subject: string, topic: string, lessonId: string): Promise<Lesson | null> {
    try {
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;
        const response = await fetch(`${basePath}content/${subject}/${topic}/${lessonId}.json`);
        if (!response.ok) {
            console.error(`Failed to fetch lesson: ${response.status} ${response.statusText}`);
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
